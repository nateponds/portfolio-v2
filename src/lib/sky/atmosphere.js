import * as THREE from 'three';

// Repeatable 3D density, integrated along a viewing ray instead of sprite cards.
function noiseVolume() {
  const size = 48;
  const data = new Uint8Array(size ** 3);
  let seed = 73821;
  for (let i = 0; i < data.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    data[i] = seed >>> 24;
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RedFormat;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

export function createAtmosphere(renderer, mobile) {
  const noise = noiseVolume();
  const uniforms = {
    noiseMap: { value: noise }, time: { value: 0 }, aspect: { value: 1 },
    daylight: { value: 1 }, golden: { value: 0 },
    cameraOffset: { value: new THREE.Vector2() },
    resolution: { value: new THREE.Vector2(1, 1) },
  };
  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms, depthTest: false, depthWrite: false,
    vertexShader: `out vec2 uvScreen;
      void main() { uvScreen = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `
      precision highp sampler3D;
      uniform sampler3D noiseMap;
      uniform float time, aspect, daylight, golden;
      uniform vec2 cameraOffset, resolution;
      in vec2 uvScreen;
      out vec4 fragColor;
      float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise3(vec3 p) { return texture(noiseMap,p / 48.).r; }
      float fbm(vec3 p) { return noise3(p)*.57+noise3(p*2.03)*.28+noise3(p*4.07)*.15; }
      float density(vec3 p) {
        float halfW = 14.6 * aspect;
        float shape = -10.;
        shape = max(shape, 1.-length((p-vec3(-halfW*.98,12.7,-38.))/vec3(halfW*.49,7.0,7.8)));
        shape = max(shape, 1.-length((p-vec3(halfW*1.08,13.8,-41.))/vec3(halfW*.48,7.8,8.5)));
        shape = max(shape, 1.-length((p-vec3(-halfW*.89,-13.3,-35.))/vec3(halfW*.64,6.2,8.)));
        shape = max(shape, 1.-length((p-vec3(halfW*.96,-12.8,-34.))/vec3(halfW*.55,7.,7.)));
        // Smaller, shallower side banks preserve the open title area.
        shape = max(shape, .80-length((p-vec3(-halfW*1.03,1.9,-37.))/vec3(halfW*.31,5.4,4.6)));
        shape = max(shape, .76-length((p-vec3(halfW*1.04,-.5,-38.))/vec3(halfW*.30,5.9,4.8)));
        if(shape < -.45) return 0.;
        vec3 wind = vec3(time*.055,0.,time*.018);
        float billow = fbm(p*.48+wind);
        float detail = noise3(p*2.4+wind);
        return smoothstep(.03,.44,shape + (billow-.51)*1.13 - detail*.12) * .72;
      }
      void main() {
        vec2 uv = uvScreen;
        vec3 sky = mix(mix(vec3(.024,.037,.082),vec3(.004,.008,.023),uv.y),mix(vec3(.29,.38,.57),vec3(.14,.22,.43),uv.y),daylight);
        vec3 sunset = mix(vec3(.49,.20,.14),vec3(.15,.23,.32),smoothstep(0.,.9,uv.y));
        sky = mix(sky,sunset,golden*.76);
        vec2 starGrid = floor(uv*vec2(aspect,1.)*470.);
        vec2 starUV = fract(uv*vec2(aspect,1.)*470.)-.5;
        float stars = step(.9975,hash(starGrid))*exp(-dot(starUV,starUV)*85.);
        sky += stars*pow(1.-daylight,4.)*.55*(.85+.15*sin(time*.3+hash(starGrid)*50.));
        vec3 ray = normalize(vec3((uv-.5)*vec2(aspect,1.)*.7673,-1.));
        vec3 origin = vec3(cameraOffset,0.);
        vec3 color = vec3(0.);
        float transmittance = 1.;
        float jitter = hash(floor(uv*resolution));
        const int STEPS = ${mobile ? 36 : 52};
        float stride = 35./float(STEPS);
        vec3 lightDir = normalize(vec3(-.7,1.,.3));
        for(int i=0;i<STEPS;i++) {
          vec3 p = origin + ray*(22.+(float(i)+jitter)*stride);
          float d = density(p);
          if(d>.005) {
            float shade = density(p+lightDir*1.3)*.85+density(p+lightDir*3.)*.5;
            float lighting = exp(-shade*2.5);
            vec3 shadowColor = mix(vec3(.045,.066,.12),vec3(.38,.46,.61),daylight);
            vec3 litColor = mix(vec3(.17,.22,.34),vec3(.96,.90,.77),daylight);
            litColor = mix(litColor,vec3(1.,.47,.20),golden*.95);
            shadowColor = mix(shadowColor,vec3(.46,.32,.35),golden*.65);
            vec3 cloud = mix(shadowColor,litColor,lighting);
            float alpha = 1.-exp(-d*stride*1.9);
            color += transmittance*alpha*cloud;
            transmittance *= 1.-alpha;
            if(transmittance<.015) break;
          }
        }
        sky = sky*transmittance+color;
        sky += (hash(uv*resolution)-.5)*.0025;
        fragColor = vec4(sky,1.);
      }`,
  });
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);
  const camera = new THREE.Camera();
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  return {
    texture: target.texture, uniforms,
    resize(width, height, quality = 1) {
      const scale = (mobile ? .48 : .65) * quality;
      target.setSize(Math.round(width*scale), Math.round(height*scale));
      uniforms.aspect.value = width/height;
      uniforms.resolution.value.set(target.width,target.height);
    },
    render() { renderer.setRenderTarget(target); renderer.render(scene,camera); renderer.setRenderTarget(null); },
    dispose() { noise.dispose(); material.dispose(); quad.geometry.dispose(); target.dispose(); },
  };
}
