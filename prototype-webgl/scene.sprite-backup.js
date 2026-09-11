import {
  LinearMipmapLinearFilter,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
} from 'three';
import { createCamera, createRenderer, createScene, createSkyMesh } from './sky.js';

const ASSETS = {
  clouds: [
    '/assets/cloud-01.png',
    '/assets/cloud-03.png',
    '/assets/cloud-04.png',
  ],
  moon: '/assets/moon.png',
  branch: '/assets/branch.png',
  perch: '/assets/bird-perch.png',
  fly: ['/assets/bird-fly-a.png', '/assets/bird-fly-b.png'],
};

function spriteMat(map, opacity = 1) {
  map.colorSpace = SRGBColorSpace;
  map.minFilter = LinearMipmapLinearFilter;
  map.magFilter = LinearFilter;
  map.premultiplyAlpha = true;
  map.needsUpdate = true;
  return new SpriteMaterial({
    map,
    transparent: true,
    depthWrite: false,
    opacity,
    premultipliedAlpha: true,
  });
}

function sizedSprite(map, height) {
  const sprite = new Sprite(spriteMat(map));
  const aspect = map.image.width / map.image.height;
  sprite.scale.set(height * aspect, height, 1);
  return sprite;
}

export async function startScene(canvas) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = createRenderer(canvas);
  const scene = createScene();
  const sky = createSkyMesh();
  scene.add(sky);

  let aspect = window.innerWidth / window.innerHeight;
  const camera = createCamera(aspect);
  camera.position.z = 12;

  const loader = new TextureLoader();
  const load = (url) => loader.loadAsync(url);

  const [cloudMaps, moonMap, branchMap, perchMap, flyA, flyB] = await Promise.all([
    Promise.all(ASSETS.clouds.map(load)),
    load(ASSETS.moon),
    load(ASSETS.branch),
    load(ASSETS.perch),
    load(ASSETS.fly[0]),
    load(ASSETS.fly[1]),
  ]);

  const moon = sizedSprite(moonMap, 2.35);
  moon.position.set(3.6, 2.55, -8);
  moon.material.opacity = 0.94;
  moon.material.color.set('#f3eadc');
  scene.add(moon);

  const clouds = [
    { map: cloudMaps[0], x: -4.4, y: 1.7, z: -7, h: 3.2, speed: 0.016, opacity: 0.92 },
    { map: cloudMaps[1], x: -1.8, y: -1.85, z: -4.6, h: 2.0, speed: 0.04, opacity: 0.94 },
    { map: cloudMaps[2], x: 4.4, y: 1.2, z: -5.6, h: 2.4, speed: 0.028, opacity: 0.86 },
    { map: cloudMaps[0], x: 7.2, y: -2.15, z: -5.8, h: 2.2, speed: 0.02, opacity: 0.7 },
    { map: cloudMaps[1], x: -7.0, y: 0.15, z: -6.6, h: 1.9, speed: 0.024, opacity: 0.76 },
  ].map((spec) => {
    const sprite = sizedSprite(spec.map, spec.h);
    sprite.position.set(spec.x, spec.y, spec.z);
    sprite.material.opacity = spec.opacity;
    sprite.userData = { speed: spec.speed, wrap: 11 };
    scene.add(sprite);
    return sprite;
  });

  const branch = sizedSprite(branchMap, 5.4);
  branch.position.set(5.05, -1.55, -1.2);
  branch.material.opacity = 0.98;
  scene.add(branch);

  const perch = sizedSprite(perchMap, 0.52);
  perch.position.set(3.15, -0.72, -1.05);
  scene.add(perch);

  const flyMats = [spriteMat(flyA), spriteMat(flyB)];
  const birds = [
    { x: 7.5, y: 1.35, z: -3.2, h: 0.62, speed: 0.62, amp: 0.16, phase: 0 },
    { x: 1.2, y: 2.15, z: -4.6, h: 0.42, speed: 0.38, amp: 0.11, phase: 2.1 },
  ].map((spec) => {
    const sprite = new Sprite(flyMats[0]);
    const aspectFly = flyA.image.width / flyA.image.height;
    sprite.scale.set(spec.h * aspectFly, spec.h, 1);
    sprite.position.set(spec.x, spec.y, spec.z);
    sprite.userData = { ...spec, baseY: spec.y };
    scene.add(sprite);
    return sprite;
  });

  const mouse = { x: 0, y: 0 };
  const parallax = { x: 0, y: 0 };

  function onMove(event) {
    const point = event.touches?.[0] ?? event;
    mouse.x = (point.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (point.clientY / window.innerHeight) * 2 - 1;
  }

  window.addEventListener('pointermove', onMove, { passive: true });

  function resize() {
    aspect = window.innerWidth / Math.max(1, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    const halfH = 5;
    const halfW = halfH * aspect;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.updateProjectionMatrix();
    branch.position.x = halfW - 1.35;
    perch.position.x = branch.position.x - 1.85;
    perch.position.y = branch.position.y + 0.82;
  }

  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  let frameAcc = 0;
  let running = true;

  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    last = performance.now();
  });

  function tick(now) {
    requestAnimationFrame(tick);
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    parallax.x += (mouse.x * 0.55 - parallax.x) * 0.035;
    parallax.y += (-mouse.y * 0.32 - parallax.y) * 0.035;
    camera.position.x = parallax.x;
    camera.position.y = parallax.y;
    moon.position.x = 3.6 + parallax.x * -0.35;
    moon.position.y = 2.55 + parallax.y * -0.2;
    branch.position.y = -1.55 + parallax.y * 0.22;
    perch.position.x = branch.position.x - 1.85;
    perch.position.y = branch.position.y + 0.82;

    if (!reduceMotion) {
      for (const cloud of clouds) {
        cloud.position.x += cloud.userData.speed * dt * 2.2;
        if (cloud.position.x > cloud.userData.wrap) {
          cloud.position.x = -cloud.userData.wrap;
        }
      }

      frameAcc += dt;
      const frame = Math.floor(frameAcc * 6) % 2;
      for (const bird of birds) {
        bird.material = flyMats[frame];
        bird.position.x -= bird.userData.speed * dt;
        bird.position.y =
          bird.userData.baseY + Math.sin(now * 0.0012 + bird.userData.phase) * bird.userData.amp;
        if (bird.position.x < -11) bird.position.x = 11;
      }
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(tick);
}
