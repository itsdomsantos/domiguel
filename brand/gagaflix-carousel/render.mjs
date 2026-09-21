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
      <span class="kicker"><span class="pip"></span> Streaming · Lady Gaga Universe</span>
      <div class="wordmark">GAGAFLIX</div>
      <div class="rule"></div>
      <p class="lead">The <strong>ultimate Lady Gaga experience</strong> — live performances, music videos, interviews and more, all in one place.</p>
      <p class="tag">By Little Monsters, to Little Monsters.</p>
    `,
    footright: `<div class="swipe">Swipe <span class="ar">→</span></div>`,
    dot: 0,
  },
  {
    // WHAT IS IT — organized by Eras
    index: '02 / 03',
    body: `
      <span class="kicker"><span class="pip"></span> The whole universe, by Era</span>
      <h2>Every era.<br /><span class="chrome">One</span> <span class="flame">place.</span></h2>
      <p class="lead">Her entire career — <strong>2008 to today</strong> — organized by Eras, each with its own colour and mood. Dive into any moment in seconds.</p>
      <div class="eras">
        <span class="era">The Fame</span>
        <span class="era">Born This Way</span>
        <span class="era">ARTPOP</span>
        <span class="era">Chromatica</span>
        <span class="era">MAYHEM</span>
      </div>
    `,
    footright: `<div class="swipe">Keep going <span class="ar">→</span></div>`,
    dot: 1,
  },
  {
    // FEATURES + CTA
    index: '03 / 03',
    body: `
      <span class="kicker"><span class="pip"></span> Built for Monsters</span>
      <div class="list">
        <div class="item"><span class="bar"></span><div>Chameleon Player<span class="sm">Plays from YouTube, Vimeo, direct video &amp; more — automatically.</span></div></div>
        <div class="item"><span class="bar"></span><div>Career Timeline<span class="sm">The full journey, from 2008 to today.</span></div></div>
        <div class="item"><span class="bar"></span><div>Instant Search · Install as an App<span class="sm">Find anything fast. Add it to your home screen.</span></div></div>
      </div>
    `,
    footright: `<div class="cta"><div class="go">Watch now <span class="flame">→</span></div><div class="url">gagaflix.com</div></div>`,
    dot: 2,
    credit: true,
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
    if (s.credit) {
      const c = document.createElement('div');
      c.className = 'credit';
      c.innerHTML = 'Developed by <b>Dom<span class="dot">.</span> Developments</b>';
      c.style.marginLeft = '18px';
      dots.appendChild(c);
    }
  }, s);
  // auto-fit the big wordmark to the available width
  await page.evaluate(() => {
    const el = document.querySelector('.wordmark');
    if (!el) return;
    const maxW = 1080 - 88 * 2;
    let size = parseFloat(getComputedStyle(el).fontSize);
    let guard = 0;
    while (el.scrollWidth > maxW && guard < 60) {
      size -= 4;
      el.style.fontSize = size + 'px';
      guard++;
    }
  });
  await page.waitForTimeout(300);
  const out = join(__dirname, `gagaflix-${i + 1}.png`);
  await page.screenshot({ path: out, type: 'png' });
  console.log('wrote', out);
  await page.close();
}

await browser.close();
console.log('done');
