import pkg from '/tmp/claude-0/-home-user-domiguel/5a429613-80b9-5d4d-b140-6d1c165d929e/scratchpad/node_modules/playwright-core/index.js';
const { chromium } = pkg;
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'template.html'), 'utf8');

const slides = [
  {
    // COVER
    index: '01 / 03',
    body: `
      <span class="eyebrow">● Development studio</span>
      <h1><span>Dom</span><span class="grad">.</span></h1>
      <p class="lead">We build <strong>digital products</strong> that make a difference — websites, apps and experiences, from concept to launch.</p>
    `,
    footright: `<div class="swipe">Swipe <span class="grad">→</span></div>`,
    dot: 0,
  },
  {
    // MISSION
    index: '02 / 03',
    body: `
      <span class="eyebrow">Our mission</span>
      <h2>Turn ideas into products <span class="grad">people love.</span></h2>
      <p class="lead">From the first sketch to launch, we design and develop with rigor and creativity — modern, fast and built to grow with you.</p>
    `,
    footright: `<div class="swipe">Keep swiping <span class="grad">→</span></div>`,
    dot: 1,
  },
  {
    // WHAT WE DO + CTA
    index: '03 / 03',
    body: `
      <span class="eyebrow">What we do</span>
      <div class="list">
        <div class="item"><span class="bar"></span><span class="ic">🌐</span> Websites &amp; Web Apps</div>
        <div class="item"><span class="bar"></span><span class="ic">📱</span> Mobile Apps</div>
        <div class="item"><span class="bar"></span><span class="ic">🎨</span> UI / UX Design</div>
        <div class="item"><span class="bar"></span><span class="ic">⚙️</span> APIs &amp; Backend</div>
      </div>
      <p class="lead" style="margin-top:52px">Got an idea? <span class="grad" style="font-weight:600">Let's build it.</span> Proposal within 48h.</p>
    `,
    footright: `<div style="text-align:right"><div class="cta">Let's talk →</div><div class="contact">link in bio</div></div>`,
    dot: 2,
  },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

for (let i = 0; i < slides.length; i++) {
  const s = slides[i];
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((s) => {
    document.getElementById('index').textContent = s.index;
    document.getElementById('body').innerHTML = s.body;
    document.getElementById('footright').innerHTML = s.footright;
    const dots = document.getElementById('dots');
    dots.innerHTML = '';
    for (let k = 0; k < 3; k++) {
      const d = document.createElement('div');
      d.className = 'd' + (k === s.dot ? ' on' : '');
      dots.appendChild(d);
    }
  }, s);
  await page.waitForTimeout(300);
  const out = join(__dirname, `carousel-${i + 1}.png`);
  await page.screenshot({ path: out, type: 'png' });
  console.log('wrote', out);
  await page.close();
}

await browser.close();
console.log('done');
