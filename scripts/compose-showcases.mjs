import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showcaseDir = path.join(repoRoot, 'public', 'assets', 'portfolio', 'showcases');
const scratchDir = path.join(repoRoot, 'artifacts', 'showcase');

const devices = [
  { key: 'desktop', className: 'device--macbook' },
  { key: 'tablet', className: 'device--ipad' },
  { key: 'mobile', className: 'device--phone' },
];

const projectSlugs = ['darius', 'swappr', 'aqualine', 'linko'];
const requestedSlugs = process.argv.slice(2).filter(Boolean);
const slugs = requestedSlugs.length > 0 ? requestedSlugs : projectSlugs;

const css = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { width: 1600px; height: 960px; margin: 0; overflow: hidden; }
  body {
    display: grid;
    place-items: center;
    background: #101114;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .scene {
    position: relative;
    width: 1600px;
    height: 960px;
    overflow: hidden;
    background:
      radial-gradient(ellipse 78% 80% at 51% 54%, rgba(61, 70, 84, 0.28), transparent 61%),
      radial-gradient(ellipse 30% 38% at 84% 45%, rgba(35, 40, 52, 0.16), transparent 75%),
      #101114;
  }
  .scene::after {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.025);
    content: '';
    pointer-events: none;
  }
  .device {
    position: absolute;
    padding: 10px;
    background: linear-gradient(145deg, #3a3f46 0%, #111418 24%, #07090b 72%, #272c32 100%);
    border: 1px solid rgba(225, 232, 237, 0.55);
    box-shadow:
      0 38px 54px rgba(0, 0, 0, 0.5),
      0 12px 18px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      inset 0 -1px 0 rgba(0, 0, 0, 0.7);
    isolation: isolate;
  }
  .device::before {
    position: absolute;
    inset: 3px;
    border: 1px solid rgba(0, 0, 0, 0.82);
    border-radius: inherit;
    content: '';
    pointer-events: none;
  }
  .screen-shell {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #050607;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 22px rgba(0, 0, 0, 0.46);
  }
  .screen-shell img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
  .device--macbook {
    z-index: 2;
    top: 105px;
    left: 305px;
    width: 990px;
    height: 626px;
    padding: 12px;
    border-radius: 28px 28px 15px 15px;
  }
  .device--macbook .screen-shell { border-radius: 17px 17px 9px 9px; }
  .device--macbook::after {
    position: absolute;
    top: 5px;
    left: 50%;
    width: 58px;
    height: 10px;
    border-radius: 0 0 8px 8px;
    background: #050607;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.05);
    content: '';
    transform: translateX(-50%);
  }
  .macbook-base {
    position: absolute;
    z-index: 1;
    top: 716px;
    left: 274px;
    width: 1052px;
    height: 46px;
    border: 1px solid rgba(211, 219, 225, 0.58);
    border-radius: 0 0 24px 24px;
    background: linear-gradient(180deg, #a8afb5 0%, #5b6269 19%, #252a30 58%, #111419 100%);
    box-shadow:
      0 30px 34px rgba(0, 0, 0, 0.42),
      inset 0 1px 0 rgba(255, 255, 255, 0.38),
      inset 0 -5px 8px rgba(0, 0, 0, 0.42);
    clip-path: polygon(3.5% 0, 96.5% 0, 100% 30%, 97% 78%, 91% 100%, 9% 100%, 3% 78%, 0 30%);
  }
  .device--ipad {
    z-index: 4;
    top: 220px;
    right: 70px;
    width: 380px;
    height: 538px;
    padding: 10px;
    border-radius: 27px;
  }
  .device--ipad .screen-shell { border-radius: 18px; }
  .device--ipad::after {
    position: absolute;
    top: 9px;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #050607;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    content: '';
    transform: translateX(-50%);
  }
  .device--phone {
    z-index: 5;
    top: 430px;
    left: 115px;
    width: 216px;
    height: 450px;
    padding: 9px;
    border-radius: 33px;
  }
  .device--phone .screen-shell { border-radius: 25px; }
  .device--phone::after {
    position: absolute;
    top: 13px;
    left: 50%;
    width: 68px;
    height: 18px;
    border-radius: 12px;
    background: #050607;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.05);
    content: '';
    transform: translateX(-50%);
  }
`;

function imageDataUri(filePath) {
  return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
}

function renderScene(images) {
  const imageMarkup = devices
    .map(
      ({ key, className }) => `
        <div class="device ${className}">
          <div class="screen-shell">
            <img src="${images[key]}" alt="" />
          </div>
        </div>`,
    )
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><main class="scene"><div class="macbook-base" aria-hidden="true"></div>${imageMarkup}</main></body></html>`;
}

async function composeProject(browser, slug) {
  const inputs = Object.fromEntries(
    devices.map(({ key }) => [key, path.join(showcaseDir, `${slug}-${key}.png`)]),
  );
  const missing = Object.values(inputs).filter((filePath) => !fs.existsSync(filePath));
  if (missing.length > 0) {
    console.log(`Skipping ${slug}: missing ${missing.map((filePath) => path.basename(filePath)).join(', ')}`);
    return false;
  }

  const images = Object.fromEntries(
    Object.entries(inputs).map(([key, filePath]) => [key, imageDataUri(filePath)]),
  );
  const page = await browser.newPage({ viewport: { width: 1600, height: 960 }, deviceScaleFactor: 1 });
  await page.setContent(renderScene(images), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts?.ready);

  fs.mkdirSync(scratchDir, { recursive: true });
  const scratchPng = path.join(scratchDir, `${slug}-showcase.png`);
  const outputWebp = path.join(showcaseDir, `${slug}-showcase.webp`);
  await page.screenshot({ path: scratchPng, animations: 'disabled' });
  await sharp(scratchPng).webp({ quality: 90, effort: 6 }).toFile(outputWebp);
  const metadata = await sharp(outputWebp).metadata();
  console.log(`Composed ${slug}: ${metadata.width}x${metadata.height} -> ${path.relative(repoRoot, outputWebp)}`);
  await page.close();
  return true;
}

const browser = await chromium.launch({ headless: true });
try {
  for (const slug of slugs) await composeProject(browser, slug);
} finally {
  await browser.close();
}
