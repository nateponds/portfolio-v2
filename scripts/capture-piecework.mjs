import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showcaseDir = path.join(repoRoot, 'public', 'assets', 'portfolio', 'showcases');
const url = 'https://piecework.nateponds.com/';

const viewports = [
  { key: 'desktop', width: 1440, height: 900 },
  { key: 'tablet', width: 820, height: 1180 },
  { key: 'mobile', width: 390, height: 844 },
];

fs.mkdirSync(showcaseDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForSelector('button', { timeout: 20_000 });
    if (viewport.key === 'tablet') {
      const closeSidebar = page.getByRole('button', { name: /close sidebar/i });
      if (await closeSidebar.count()) await closeSidebar.first().click();
    }
    await page.evaluate(async () => {
      document.querySelectorAll('*').forEach((el) => {
        el.style.setProperty('animation', 'none', 'important');
        el.style.setProperty('transition', 'none', 'important');
      });
      await document.fonts?.ready;
      await Promise.all(
        [...document.images].map((img) =>
          img.complete
            ? null
            : new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              }),
        ),
      );
    });
    await page.waitForTimeout(800);
    const output = path.join(showcaseDir, `piecework-${viewport.key}.png`);
    await page.screenshot({ path: output, animations: 'disabled' });
    console.log(`captured ${viewport.key}: ${path.relative(repoRoot, output)}`);
    await page.close();
  }
} finally {
  await browser.close();
}
