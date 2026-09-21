import pkg from '/tmp/claude-0/-home-user-domiguel/5a429613-80b9-5d4d-b140-6d1c165d929e/scratchpad/node_modules/playwright-core/index.js';
const { chromium } = pkg;
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'template.html'), 'utf8');
const logoDataUri =
  'data:image/png;base64,' + readFileSync(join(__dirname, 'logo.png')).toString('base64');

const UNDER = `<svg viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true"><path d="M8 27 C 120 11, 250 34, 380 18 S 560 9, 592 22" /></svg>`;

const slides = [
  {
    // COVER — mission hook
    index: '01 / 03',
    body: `
      <span class="eyebrow"><span class="pip"></span> Associação de Voluntariado · Grande Porto</span>
      <h1>Uma explicação não devia depender do <span class="mark mark--red">código postal${UNDER}</span>.</h1>
    `,
    footright: `<div class="swipe">Arrasta <span class="ar">→</span></div>`,
    dot: 0,
  },
  {
    // WHO WE ARE
    index: '02 / 03',
    body: `
      <span class="eyebrow"><span class="pip"></span> Quem somos</span>
      <h2>Juntos, pomos os mais pequenos a <span class="mark">pensar em grande${UNDER}</span>.</h2>
      <p class="lead">Somos <strong>estudantes universitários voluntários</strong> que dão apoio educativo, social e cultural a crianças e jovens do <strong>5.º ao 9.º ano</strong> do Grande Porto — para combater o insucesso escolar e promover a igualdade de oportunidades.</p>
      <span class="chip"><span class="dot"></span> Explicações semanais · 7 polos do Grande Porto</span>
    `,
    footright: `<div class="swipe">Continua <span class="ar">→</span></div>`,
    dot: 1,
  },
  {
    // HOW TO HELP + CTA
    index: '03 / 03',
    body: `
      <span class="eyebrow"><span class="pip"></span> Como podes ajudar</span>
      <div class="list">
        <div class="item"><span class="num" style="background:var(--marcador)">1</span><div><span class="t">Junta-te à equipa</span><span class="s">Dá explicações e faz parte do projeto.</span></div></div>
        <div class="item"><span class="num" style="background:var(--lapis)">2</span><div><span class="t">Torna-te parceiro</span><span class="s">Empresas e instituições que apoiam a causa.</span></div></div>
        <div class="item"><span class="num" style="background:var(--giz)">3</span><div><span class="t">Faz uma doação</span><span class="s">Cada contributo chega a mais um aluno.</span></div></div>
      </div>
    `,
    footright: `<div class="cta"><div class="site">jatexplico.pt</div><div class="handle">@jatexplico.pt</div></div>`,
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
  await page.evaluate((logo) => {
    document.getElementById('logo').src = logo;
  }, logoDataUri);
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
      c.innerHTML = 'Site por <b>Dom<span class="dot">.</span> Developments</b>';
      c.style.marginLeft = '18px';
      dots.appendChild(c);
    }
  }, s);
  await page.waitForTimeout(300);
  const out = join(__dirname, `jatexplico-${i + 1}.png`);
  await page.screenshot({ path: out, type: 'png' });
  console.log('wrote', out);
  await page.close();
}

await browser.close();
console.log('done');
