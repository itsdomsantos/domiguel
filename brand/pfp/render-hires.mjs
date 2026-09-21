import pkg from '/tmp/claude-0/-home-user-domiguel/5a429613-80b9-5d4d-b140-6d1c165d929e/scratchpad/node_modules/playwright-core/index.js';
const { chromium } = pkg;
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('./template.html', import.meta.url), 'utf8');
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => {
  const el = document.getElementById('mark');
  el.innerHTML = '<span class="word">Dom</span><span class="dot">.</span>';
  el.style.fontSize = '300px';
});
await page.waitForTimeout(300);
await page.screenshot({ path: new URL('./domdot-pfp-dom-dot@2160.png', import.meta.url).pathname, type: 'png' });
await browser.close();
console.log('done');
