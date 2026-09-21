import pkg from '/tmp/claude-0/-home-user-domiguel/5a429613-80b9-5d4d-b140-6d1c165d929e/scratchpad/node_modules/playwright-core/index.js';
const { chromium } = pkg;
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--force-color-profile=srgb', '--ignore-certificate-errors'],
  proxy: proxy ? { server: proxy } : undefined,
});

const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
});

try {
  await page.goto('https://www.gagaflix.com/', { waitUntil: 'networkidle', timeout: 90000 });
} catch (e) {
  console.log('networkidle timeout, continuing:', e.message);
}
await page.waitForTimeout(3500);
// dismiss any install/cookie dock if present, then settle
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

const full = join(__dirname, 'homepage-full.png');
await page.screenshot({ path: full, fullPage: true });
console.log('wrote', full);

const viewport = join(__dirname, 'homepage-viewport.png');
await page.screenshot({ path: viewport });
console.log('wrote', viewport);

console.log('title:', await page.title());
await browser.close();
console.log('done');
