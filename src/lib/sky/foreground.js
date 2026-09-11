import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const vertexShader=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const gaussian=`
  vec4 softLayer(sampler2D map, vec2 uv, vec2 stepSize) {
    vec4 color=vec4(0.); float total=0.;
    for(int i=-10;i<=10;i++) {
      float x=float(i), weight=exp(-x*x/32.);
      color+=texture2D(map,uv+stepSize*x)*weight; total+=weight;
    }
    return color/total;
  }`;

// Render the closest branches separately so their blur spreads beyond their
// silhouettes. A depth-only gather cannot spread a narrow twig into empty sky.
export function createForeground(renderer, camera, object, lights) {
  const scene=new THREE.Scene();scene.add(object);
  const copies=lights.map(light=>light.clone());copies.forEach(light=>scene.add(light));
  const target=new THREE.WebGLRenderTarget(1,1);
  const blurred=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false});
  const horizontal=new THREE.ShaderMaterial({
    uniforms:{map:{value:target.texture},stepSize:{value:new THREE.Vector2()}},vertexShader,
    fragmentShader:`uniform sampler2D map; uniform vec2 stepSize; varying vec2 vUv; ${gaussian}
      void main(){gl_FragColor=softLayer(map,vUv,stepSize);}`,
  });
  const quad=new FullScreenQuad(horizontal);
  const pass=new ShaderPass({
    uniforms:{tDiffuse:{value:null},layer:{value:null},stepSize:{value:new THREE.Vector2()}},vertexShader,
    fragmentShader:`uniform sampler2D tDiffuse,layer; uniform vec2 stepSize; varying vec2 vUv; ${gaussian}
      void main(){vec4 near=softLayer(layer,vUv,stepSize);vec3 base=texture2D(tDiffuse,vUv).rgb;
      gl_FragColor=vec4(near.rgb+base*(1.-near.a),1.);}`,
  });
  pass.uniforms.layer.value=blurred.texture;
  const clear=new THREE.Color();
  return {pass,scene,
    resize(width,height) {
      target.setSize(Math.round(width*.65),Math.round(height*.65));blurred.setSize(target.width,target.height);
      const radius=width<700?1.2:2.2;
      horizontal.uniforms.stepSize.value.set(radius/width,0);
      pass.uniforms.stepSize.value.set(0,radius/height);
    },
    render() {
      copies.forEach((copy,i)=>{copy.intensity=lights[i].intensity;copy.color.copy(lights[i].color);});
      renderer.getClearColor(clear);const alpha=renderer.getClearAlpha();
      renderer.setClearColor(0,0);renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera);
      renderer.setRenderTarget(blurred);renderer.clear();quad.render(renderer);
      renderer.setRenderTarget(null);renderer.setClearColor(clear,alpha);
    },
    dispose(){target.dispose();blurred.dispose();horizontal.dispose();quad.dispose();pass.dispose();},
  };
}
