import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float y = uv.y;
    vec3 zenith = vec3(0.40, 0.60, 0.80);
    vec3 mid = vec3(0.57, 0.72, 0.86);
    vec3 horizon = vec3(0.80, 0.84, 0.90);
    vec3 peach = vec3(0.94, 0.76, 0.62);

    vec3 col = mix(horizon, mid, smoothstep(0.0, 0.48, y));
    col = mix(col, zenith, smoothstep(0.42, 1.0, y));

    float warmBand = smoothstep(0.58, 0.04, y) * (0.62 - uv.x * 0.18);
    col = mix(col, peach, clamp(warmBand, 0.0, 0.48));

    float grain = fract(sin(dot(uv * 420.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.012;

    float vig = smoothstep(1.15, 0.22, length(uv - vec2(0.5, 0.46)));
    col *= 0.90 + 0.10 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createSkyMesh() {
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthWrite: false,
    depthTest: false,
  });
  const mesh = new Mesh(new PlaneGeometry(40, 20), material);
  mesh.position.z = -18;
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return mesh;
}

export function createRenderer(canvas) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(new Color('#7ea8cc'), 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.autoClear = true;
  return renderer;
}

export function createCamera(aspect) {
  const halfH = 5;
  const halfW = halfH * aspect;
  return new OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 40);
}

export function createScene() {
  return new Scene();
}
