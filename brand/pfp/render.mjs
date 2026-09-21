import pkg from '/tmp/claude-0/-home-user-domiguel/5a429613-80b9-5d4d-b140-6d1c165d929e/scratchpad/node_modules/playwright-core/index.js';
const { chromium } = pkg;
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'template.html'), 'utf8');

// variant name -> { markHTML, fontSize (px) }
const variants = {
  'dom-dot': {
    mark: '<span class="word">Dom</span><span class="dot">.</span>',
    size: 300,
  },
  'dom-dot-d': {
    mark: '<span class="word">Dom</span><span class="dot">.</span><span class="suffix">D</span>',
    size: 250,
  },
};

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

for (const [name, cfg] of Object.entries(variants)) {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1080 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    ({ mark, size }) => {
      const el = document.getElementById('mark');
      el.innerHTML = mark;
      el.style.fontSize = size + 'px';
    },
    cfg
  );
  await page.waitForTimeout(250);
  const out = join(__dirname, `domdot-pfp-${name}.png`);
  await page.screenshot({ path: out, type: 'png' });
  console.log('wrote', out);
  await page.close();
}

await browser.close();
console.log('done');
