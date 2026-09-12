import * as THREE from 'three';

let seed = 49013;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }

function surface(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = kind === 'bark' ? '#776957' : '#d6c7af';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const x = random() * 256, y = random() * 256;
    ctx.strokeStyle = `rgba(${random() > .5 ? '255,239,207' : '42,30,24'},${random() * .25})`;
    ctx.lineWidth = random() * (kind === 'bark' ? 2 : .7) + .2;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + (kind === 'bark' ? random() * 5 : random() * 14 - 7), y + random() * (kind === 'bark' ? 90 : 16)); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function leafSurface() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#589429');
  grad.addColorStop(0.35, '#427b1e');
  grad.addColorStop(0.75, '#316415');
  grad.addColorStop(1, '#255010');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 256);

  const edgeGrad = ctx.createLinearGradient(0, 0, 128, 0);
  edgeGrad.addColorStop(0, 'rgba(12,35,8,0.35)');
  edgeGrad.addColorStop(0.25, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(0.75, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(1, 'rgba(12,35,8,0.35)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, 128, 256);

  ctx.strokeStyle = 'rgba(150,210,70,0.3)';
  ctx.lineWidth = 1;
  for (let y = 30; y < 240; y += 14) {
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.quadraticCurveTo(40, y + 10, 8, y + 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.quadraticCurveTo(88, y + 10, 120, y + 20);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(175,230,85,0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 4);
  ctx.lineTo(64, 252);
  ctx.stroke();

  for (let i = 0; i < 600; i++) {
    const x = random() * 128, y = random() * 256;
    ctx.fillStyle = random() > 0.5 ? 'rgba(200,240,100,0.06)' : 'rgba(10,35,8,0.07)';
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLeafGeometry() {
  const lengthSegs = 7;
  const widthSegs = 6;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= lengthSegs; i++) {
    const v = i / lengthSegs;
    let w = 0;
    if (v < 0.1) {
      w = (v / 0.1) * 0.04;
    } else {
      const t = (v - 0.1) / 0.9;
      w = Math.sin(Math.pow(t, 0.65) * Math.PI) * (1.0 - 0.22 * t) * 0.30;
    }
    const zArch = -0.14 * Math.pow(v, 1.8) + 0.03 * Math.sin(v * Math.PI);

    for (let j = 0; j <= widthSegs; j++) {
      const u = (j / widthSegs) * 2 - 1;
      const x = u * w;
      const y = v;
      const fold = 0.08 * (1 - Math.cos(u * Math.PI * 0.5));
      const z = zArch + fold;
      positions.push(x, y, z);
      uvs.push((u + 1) * 0.5, v);
    }
  }

  const rowSize = widthSegs + 1;
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < widthSegs; j++) {
      const a = i * rowSize + j;
      const b = (i + 1) * rowSize + j;
      const c = (i + 1) * rowSize + (j + 1);
      const d = i * rowSize + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

const leafPalette = [
  new THREE.Color('#8cb83a'), // warm highlight
  new THREE.Color('#68a834'), // sunlit green
  new THREE.Color('#468724'), // vibrant green
  new THREE.Color('#2d6318'), // forest green
  new THREE.Color('#1c420e'), // deep shadow
  new THREE.Color('#7a912c'), // amber undertone
];

function addLeafCluster(transforms, origin, growthDir, count, scaleBase, isHero, pivotOrigin) {
  const swayPos = new THREE.Vector3(origin.x + pivotOrigin[0], origin.y + pivotOrigin[1], origin.z + pivotOrigin[2]);
  const distToPerch = Math.hypot(swayPos.x - (-0.93), swayPos.y - 0.69, swayPos.z - 0);
  if (isHero && distToPerch < 0.65) return;

  let dir = growthDir.clone().normalize();
  if (isHero && distToPerch < 0.95) {
    const away = new THREE.Vector3(swayPos.x - (-0.93), swayPos.y - 0.69, swayPos.z - 0).normalize();
    dir.add(away.multiplyScalar(0.7)).normalize();
  }

  const sideAxis = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  if (sideAxis.lengthSq() < 0.01) sideAxis.set(1, 0, 0);
  const upAxis = new THREE.Vector3().crossVectors(sideAxis, dir).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  for (let k = 0; k < count; k++) {
    let leafDir = dir.clone();
    let scale = scaleBase;
    let colorIdx = 2;
    let rollAngle = (random() - 0.5) * 0.45;

    if (k === 0) {
      leafDir.add(upAxis.clone().multiplyScalar(0.12)).normalize();
      scale *= 1.05 + random() * 0.1;
      colorIdx = random() > 0.4 ? 0 : 1;
    } else if (k === 1) {
      leafDir.add(sideAxis.clone().multiplyScalar(0.65)).add(upAxis.clone().multiplyScalar(0.1)).normalize();
      scale *= 0.88 + random() * 0.12;
      rollAngle += 0.35;
      colorIdx = random() > 0.5 ? 1 : 2;
    } else if (k === 2) {
      leafDir.add(sideAxis.clone().multiplyScalar(-0.65)).add(upAxis.clone().multiplyScalar(0.1)).normalize();
      scale *= 0.88 + random() * 0.12;
      rollAngle -= 0.35;
      colorIdx = random() > 0.5 ? 2 : 3;
    } else if (k === 3) {
      leafDir.add(upAxis.clone().multiplyScalar(0.55)).normalize();
      scale *= 0.75 + random() * 0.15;
      colorIdx = random() > 0.5 ? 0 : 5;
    } else if (k === 4) {
      leafDir.add(upAxis.clone().multiplyScalar(-0.45)).normalize();
      scale *= 0.72 + random() * 0.12;
      colorIdx = 4;
    } else {
      const angle = (k / count) * Math.PI * 2 + random() * 0.5;
      leafDir.add(sideAxis.clone().multiplyScalar(Math.cos(angle) * 0.55)).add(upAxis.clone().multiplyScalar(Math.sin(angle) * 0.55)).normalize();
      scale *= 0.65 + random() * 0.18;
      colorIdx = Math.floor(random() * leafPalette.length);
    }

    const pos = origin.clone().add(leafDir.clone().multiplyScalar(0.010 * k));
    const quat = new THREE.Quaternion().setFromUnitVectors(up, leafDir);
    const rollQuat = new THREE.Quaternion().setFromAxisAngle(leafDir, rollAngle);
    quat.premultiply(rollQuat);

    const scaleVec = new THREE.Vector3(scale * (0.88 + random() * 0.24), scale, scale * (0.88 + random() * 0.24));
    const matrix = new THREE.Matrix4().compose(pos, quat, scaleVec);
    const color = leafPalette[colorIdx].clone();
    if (!isHero) color.lerp(new THREE.Color('#274b24'), 0.22);
    color.r += (random() - 0.5) * 0.03;
    color.g += (random() - 0.5) * 0.03;
    color.b += (random() - 0.5) * 0.02;

    transforms.push({ matrix, color });
  }
}

function curveFrom(points) {
  return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
}

function nearestOnCurve(curve, point, samples = 96) {
  let bestT = 0, bestD = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const d = curve.getPointAt(t).distanceToSquared(point);
    if (d < bestD) { bestD = d; bestT = t; }
  }
  return { t: bestT, point: curve.getPointAt(bestT) };
}

function attachSpec(parentCurve, spec) {
  const start = new THREE.Vector3(...spec[0]);
  const hit = nearestOnCurve(parentCurve, start);
  const dx = hit.point.x - start.x, dy = hit.point.y - start.y, dz = hit.point.z - start.z;
  const attached = spec.map(p => [p[0] + dx, p[1] + dy, p[2] + dz]);
  const intoT = Math.max(0, hit.t - 0.035);
  const into = parentCurve.getPointAt(intoT);
  const mesh = into.distanceToSquared(hit.point) > 1e-6 ? [into.toArray(), ...attached] : attached;
  return { spec: attached, mesh };
}

function mixPoint(from, toward, amount) {
  return [
    from[0] + (toward[0] - from[0]) * amount,
    from[1] + (toward[1] - from[1]) * amount,
    from[2] + (toward[2] - from[2]) * amount,
  ];
}

function taperedBranch(points, radius, material) {
  const curve = curveFrom(points);
  const geometry = new THREE.TubeGeometry(curve, 32, radius, 9, false);
  const positions = geometry.attributes.position;
  for (let i = 0; i <= 32; i++) {
    const center = curve.getPointAt(i / 32), taper = 1 - .87 * (i / 32);
    for (let j = 0; j <= 9; j++) {
      const k = i * 10 + j;
      positions.setXYZ(k, center.x + (positions.getX(k) - center.x) * taper, center.y + (positions.getY(k) - center.y) * taper, center.z + (positions.getZ(k) - center.z) * taper);
    }
  }
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function addTwigs(parent, parentPoints, specs, bark, leafMaterial, leafGeometry, twigs, isHero) {
  const parentCurve = curveFrom(parentPoints);
  for (const raw of specs) {
    const { spec, mesh } = attachSpec(parentCurve, raw);
    const pivot = new THREE.Group();
    pivot.position.set(...spec[0]);
    parent.add(pivot);
    const local = spec.map(p => p.map((v, i) => v - spec[0][i]));
    const localMesh = mesh.map(p => p.map((v, i) => v - spec[0][i]));
    pivot.add(taperedBranch(localMesh, .042, bark));
    twigs.push(pivot);

    const leafTransforms = [];

    // Main twig tip cluster
    const lastP = new THREE.Vector3(...local[local.length - 1]);
    const prevP = new THREE.Vector3(...local[local.length - 2]);
    const mainDir = lastP.clone().sub(prevP).normalize();
    addLeafCluster(leafTransforms, lastP, mainDir, 8, isHero ? 0.18 : 0.13, isHero, spec[0]);

    for (let i = 1; i < local.length; i++) {
      const p = local[i];
      const pPrev = local[i - 1];

      // Leaves along the main stem between nodes
      const midStem = new THREE.Vector3((p[0] + pPrev[0]) * 0.5, (p[1] + pPrev[1]) * 0.5, (p[2] + pPrev[2]) * 0.5);
      const stemDir = new THREE.Vector3(...p).sub(new THREE.Vector3(...pPrev)).normalize();
      const lateralDir = new THREE.Vector3(stemDir.y * 0.6, -stemDir.x * 0.6, stemDir.z + 0.4).normalize();
      addLeafCluster(leafTransforms, midStem, lateralDir, 5, isHero ? 0.14 : 0.10, isHero, spec[0]);

      // Sub-twig 1 — start inside the parent stem so the join cannot float.
      const p1 = [p[0] - .22, p[1] + .18, p[2]];
      const p2 = [p[0] - .39, p[1] + .42, p[2] + .05];
      pivot.add(taperedBranch([mixPoint(p, pPrev, 0.28), p, p1, p2], .012, bark));

      const tip = new THREE.Vector3(...p2);
      const mid = new THREE.Vector3(...p1);
      const subDir = tip.clone().sub(mid).normalize();

      // Sub-twig tip cluster
      addLeafCluster(leafTransforms, tip, subDir, 8, isHero ? 0.17 : 0.12, isHero, spec[0]);
      // Sub-twig mid cluster (alternating side leaves)
      const midDir = new THREE.Vector3(subDir.y * 0.7, -subDir.x * 0.7, subDir.z + 0.3).normalize();
      addLeafCluster(leafTransforms, mid, midDir, 5, isHero ? 0.14 : 0.10, isHero, spec[0]);

      // Secondary twiglet off tip
      const p3 = [p2[0] - .14, p2[1] + .16, p2[2] + .03];
      pivot.add(taperedBranch([mixPoint(p2, p1, 0.28), p2, p3], .008, bark));
      const tip3 = new THREE.Vector3(...p3);
      const subDir3 = tip3.clone().sub(tip).normalize();
      addLeafCluster(leafTransforms, tip3, subDir3, 6, isHero ? 0.15 : 0.11, isHero, spec[0]);

      // Complementary sub-twig on opposite side (for every node)
      // Complementary sub-twig on the opposite fork, still along the tree's leftward reach.
      const altTip = i % 2 === 1 ? [p[0] - .12, p[1] + .24, p[2] - .16] : [p[0] - .08, p[1] + .24, p[2] + .16];
      const altMid = [p[0] + (altTip[0] - p[0]) * 0.5, p[1] + (altTip[1] - p[1]) * 0.5, p[2] + (altTip[2] - p[2]) * 0.5];
      pivot.add(taperedBranch([mixPoint(p, pPrev, 0.28), p, altMid, altTip], .010, bark));
      const altTipV = new THREE.Vector3(...altTip);
      const altMidV = new THREE.Vector3(...altMid);
      const altDir = altTipV.clone().sub(new THREE.Vector3(...p)).normalize();

      addLeafCluster(leafTransforms, altTipV, altDir, 7, isHero ? 0.16 : 0.11, isHero, spec[0]);
      addLeafCluster(leafTransforms, altMidV, altDir.clone().reflect(new THREE.Vector3(0, 1, 0)).normalize(), 4, isHero ? 0.13 : 0.09, isHero, spec[0]);
    }

    if (leafTransforms.length > 0) {
      const instancedLeaves = new THREE.InstancedMesh(leafGeometry, leafMaterial, leafTransforms.length);
      for (let j = 0; j < leafTransforms.length; j++) {
        instancedLeaves.setMatrixAt(j, leafTransforms[j].matrix);
        instancedLeaves.setColorAt(j, leafTransforms[j].color);
      }
      instancedLeaves.instanceMatrix.needsUpdate = true;
      if (instancedLeaves.instanceColor) instancedLeaves.instanceColor.needsUpdate = true;
      pivot.add(instancedLeaves);
    }
  }
}

export function createBranch() {
  const root = new THREE.Group(), sway = new THREE.Group(); root.add(sway);
  const grove = new THREE.Group(), groveSway = new THREE.Group(); grove.add(groveSway);
  const barkTexture = surface('bark');
  barkTexture.repeat.set(2, 5);
  const bark = new THREE.MeshStandardMaterial({ color: '#746957', map: barkTexture, bumpMap: barkTexture, bumpScale: .035, roughness: 1 });

  const leafTexture = leafSurface();
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: leafTexture,
    bumpMap: leafTexture,
    bumpScale: 0.018,
    roughness: 0.52,
    metalness: 0.02,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide,
  });
  const leafGeometry = createLeafGeometry();

  const trunk = [[3, -2.6, 1.6], [1.6, -.9, .6], [.5, .23, .1], [-.8, .62, 0], [-2.6, .97, -.3]];
  sway.add(taperedBranch(trunk, .135, bark));
  const twigs = [];
  addTwigs(sway, trunk, [
    [[1.3, -.6, .5], [1.55, .5, .7], [1.28, 1.7, .85], [1.55, 2.1, .8]],
    [[.3, .3, .1], [-.05, 1.13, .05], [-.48, 1.83, -.2], [-.25, 2.18, -.2]],
    [[-.85, .65, 0], [-1.7, .1, .3], [-2.55, .22, .3]],
    [[2, -1.4, 1.], [.3, -1.1, 2.2], [-1.2, -.42, 3.3], [-2.1, .2, 3.8]],
    [[1.1, -1.1, .8], [-.4, -.55, 1.4], [-1.8, .05, 1.9], [-3.1, .35, 2.1]],
    [[.6, -.2, .2], [-.9, .15, .55], [-2.2, .55, .7], [-3.4, .85, .5]],
    [[1.8, -1.8, 1.2], [.2, -1.55, 2.4], [-1.6, -.9, 3.1], [-2.8, -.2, 3.4]],
    [[1.6, -1.2, .6], [.2, -.4, 1.1], [-1.5, .2, 1.5], [-2.8, .65, 1.6]],
    [[.4, -.2, .2], [-.8, .45, .4], [-2.1, .9, .35], [-3.3, 1.25, .2]],
    [[-.6, .35, .1], [-1.8, .15, .55], [-3.1, .45, .7]],
    [[1.2, -1.7, .9], [-.3, -1.2, 2.], [-1.9, -.5, 2.7], [-3., .15, 2.9]],
    [[.1, .2, .05], [-1.1, .7, .15], [-2.4, 1.15, 0], [-3.5, 1.5, -.15]],
  ], bark, leafMaterial, leafGeometry, twigs, true);

  const perch = new THREE.Object3D(); perch.position.set(-.93, .69, 0); sway.add(perch);

  return {
    root, sway, grove, perch,
    update(time, impact = 0) {
      sway.rotation.z = Math.sin(time * .67) * .012 + Math.sin(time * 1.13 + .7) * .006 + impact;
      sway.rotation.y = Math.sin(time * .41) * .013;
      groveSway.rotation.z = Math.sin(time * .61 + .4) * .014 + Math.sin(time * 1.05) * .006;
      groveSway.rotation.y = Math.sin(time * .37 + .9) * .012;
      twigs.forEach((twig, i) => { twig.rotation.z = Math.sin(time * (.85 + i * .12) + i) * .018; });
    },
    dispose() {
      barkTexture.dispose();
      bark.dispose();
      leafTexture.dispose();
      leafMaterial.dispose();
      leafGeometry.dispose();
    },
  };
}

export function createMoon(map) {
  const material = new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, daylight: { value: 1 } }, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vN;
      void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D map; uniform float daylight; varying vec3 vN;
      void main(){
        vec3 n=normalize(vN);
        float phase=smoothstep(-.24,.5,dot(n,normalize(vec3(-.75,.55,.3))));
        float limb=smoothstep(0.,.50,n.z);
        // Project the existing lunar photograph onto the visible hemisphere.
        vec3 surface=texture2D(map,n.xy*.485+.5).rgb;
        vec3 color=mix(vec3(.84,.9,1.),vec3(.86,.89,.94),daylight)*surface*(.65+phase*.65);
        float alpha=limb*phase*mix(.85,.38,daylight);
        gl_FragColor=vec4(color,alpha);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), material);
  mesh.visible = !!map;
  return mesh;
}
