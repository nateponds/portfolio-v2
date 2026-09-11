import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const srcDir = path.join(root, 'raw');
const outDir = path.join(root, 'public', 'assets');

fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  { file: 'cloud-01.png', mode: 'sky', threshold: 42, erode: 7 },
  { file: 'cloud-02.png', mode: 'sky', threshold: 42, erode: 7 },
  { file: 'cloud-03.png', mode: 'sky', threshold: 40, erode: 7 },
  { file: 'cloud-04.png', mode: 'sky', threshold: 42, erode: 6 },
  { file: 'cloud-05.png', mode: 'sky', threshold: 32, erode: 5 },
  { file: 'moon.png', mode: 'black', threshold: 32, erode: 3 },
  { file: 'branch.png', mode: 'green' },
  { file: 'bird-perch.png', mode: 'green' },
  { file: 'bird-fly-a.png', mode: 'green' },
  { file: 'bird-fly-b.png', mode: 'green' },
];

function dist(r1, g1, b1, r2, g2, b2) {
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

function greenAlpha(r, g, b) {
  const spill = g - Math.max(r, b);
  if (g > 80 && spill > 38) return 0;
  if (g > 70 && spill > 14) return Math.max(0, 255 - spill * 6);
  return 255;
}

function floodMask(data, w, h, threshold, sample) {
  const bg = new Uint8Array(w * h);
  const seen = new Uint8Array(w * h);
  const q = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (seen[i]) return;
    seen[i] = 1;
    q.push(i);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  let qi = 0;
  while (qi < q.length) {
    const i = q[qi++];
    const o = i * 4;
    const d = dist(data[o], data[o + 1], data[o + 2], sample.r, sample.g, sample.b);
    if (d > threshold) continue;
    bg[i] = 1;
    const x = i % w;
    const y = (i / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return bg;
}

function cornerSample(data, w, h) {
  const pts = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + (w - 1)) * 4];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const o of pts) {
    r += data[o];
    g += data[o + 1];
    b += data[o + 2];
  }
  return { r: r / 4, g: g / 4, b: b / 4 };
}

function feather(bg, w, h, radius = 3) {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!bg[i]) {
        out[i] = 1;
        continue;
      }
      let min = radius + 1;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (!bg[ny * w + nx]) {
            const d = Math.hypot(dx, dy);
            if (d < min) min = d;
          }
        }
      }
      out[i] = min > radius ? 0 : min / (radius + 0.01);
    }
  }
  return out;
}

function dilate(bg, w, h, radius) {
  const out = new Uint8Array(bg);
  const r2 = radius * radius;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (bg[y * w + x]) continue;
      let hit = false;
      for (let dy = -radius; dy <= radius && !hit; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (bg[ny * w + nx]) {
            hit = true;
            break;
          }
        }
      }
      if (hit) out[y * w + x] = 1;
    }
  }
  return out;
}

function applySkyOrBlack(data, w, h, threshold, erode = 4) {
  const sample = cornerSample(data, w, h);
  let bg = floodMask(data, w, h, threshold, sample);
  bg = dilate(bg, w, h, erode);
  const alpha = feather(bg, w, h, 2);
  for (let i = 0; i < alpha.length; i++) {
    const o = i * 4;
    let a = Math.round(Math.min(1, Math.max(0, alpha[i])) * 255);
    if (a > 0 && a < 255) {
      const luma = (data[o] + data[o + 1] + data[o + 2]) / 3;
      if (luma < 70) a = 0;
    }
    data[o + 3] = a;
    if (a < 18) {
      data[o] = 0;
      data[o + 1] = 0;
      data[o + 2] = 0;
      data[o + 3] = 0;
    }
  }
}

function applyGreen(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = greenAlpha(r, g, b);
    data[i + 3] = a;
    if (a > 0 && g > r && g > b) {
      data[i + 1] = Math.min(g, Math.round((r + b) * 0.5 + 8));
    }
    if (a < 12) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }
}

async function run() {
  for (const job of jobs) {
    const input = path.join(srcDir, job.file);
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixels = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    if (job.mode === 'green') applyGreen(pixels);
    else applySkyOrBlack(pixels, info.width, info.height, job.threshold, job.erode ?? 4);
    await sharp(pixels, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
      .png()
      .toFile(path.join(outDir, job.file));
    console.log('cutout', job.file, info.width, info.height);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
