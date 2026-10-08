// PROOZE – bannery z hero (back → obří nápis → front). Spuštění: node prooze-web/brand/build-bannery.mjs [filtr]
// Každý banner = bannery/<název>.html + .png (DSF 1). QA: bannery/_qa.json, kontaktní arch bannery/_prehled.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname);
const { chromium } = require(path.resolve(here, '../../bannerovna/node_modules/playwright-core'));
const OUT = path.join(here, 'bannery');
fs.mkdirSync(OUT, { recursive: true });

// Hřeben střechy ve scéně (zlomky šířky/výšky fotky 16:9), referenční bod u pravé půlky hřebene
const HOUSE_CX = 0.5225, RIDGE_Y = 0.323;
const A = '../../assets';
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const cta = (t = 'Chci nabídku', cls = '') => `<span class="cta ${cls}" data-qa="cta">${t}${ARROW}</span>`;

// ---------- Sdělení (bloky textu) ----------
const COPY = {
  // spodní blok na jedli (feed)
  A: (s) => `<div class="blk" data-qa="copy">
      <h1 class="h" style="font-size:${s.h}px">Pokrývači, kteří<br>umí i fotovoltaiku.</h1>
      <p class="sub" style="font-size:${s.sub}px">Jedno lešení, jedna smlouva, jedna záruka.</p>
    </div>${cta()}`,
  B: (s) => `<div class="blk" data-qa="copy">
      <p class="eyebrow" style="font-size:${s.eb}px">Měníte střechu?</p>
      <h1 class="h" style="font-size:${s.h}px">Dejte na ni rovnou panely.</h1>
      <ul class="proof" style="font-size:${s.sub}px"><li>${CHECK}Jedno lešení</li><li>${CHECK}Jedna smlouva</li><li>${CHECK}Jedna záruka</li></ul>
    </div>${cta()}`,
  C: (s) => `<div class="card" data-qa="copy" style="--n:${s.num}px;--l:${s.sub}px">
      <p class="card__l">Bezúročný úvěr až</p>
      <p class="card__n">400&nbsp;000&nbsp;Kč</p>
      <p class="card__l">na FVE s&nbsp;baterií. <b>Papíry vyřídíme my.</b></p>
      <div class="card__cta">${cta('Chci nabídku', 'cta--ink')}</div>
    </div>
    <p class="micro" data-qa="micro" style="font-size:${s.micro}px">Program NZÚ 2026, podmínky ověříme při prohlídce</p>`,
};
// horní blok na obloze (9:16) – jedlový text
const SKY = {
  A: () => `<div class="blk" data-qa="copy">
      <h1 class="h" style="font-size:92px">Pokrývači, kteří<br>umí i fotovoltaiku.</h1>
      <p class="sub" style="font-size:40px">Jedno lešení, jedna smlouva,<br>jedna záruka.</p>
    </div>${cta()}`,
  B: () => `<div class="blk" data-qa="copy">
      <p class="tag" style="font-size:40px">Měníte střechu?</p>
      <h1 class="h" style="font-size:104px">Dejte na ni<br>rovnou panely.</h1>
    </div>${cta()}`,
  C: () => `<div class="card" data-qa="copy" style="--n:120px;--l:38px">
      <p class="card__l">Bezúročný úvěr až</p>
      <p class="card__n">400&nbsp;000&nbsp;Kč</p>
      <p class="card__l">na FVE s&nbsp;baterií. <b>Papíry vyřídíme my.</b></p>
      <div class="card__cta">${cta('Chci nabídku', 'cta--ink')}</div>
    </div>
    <p class="micro" data-qa="micro" style="font-size:30px">Program NZÚ 2026, podmínky ověříme při prohlídce</p>`,
};

// ---------- Formáty ----------
// scene: SW (šířka fotky v px), SY (horní hrana), SX dopočten tak, aby dům byl v cx
// giant: lines, width (cílová šířka nejdelšího řádku), cx, cover (část výšky verzálky pod hřebenem), lh
// safe: [x0,y0,x1,y1]
const F = {
  og: { w: 1200, h: 630, SW: 1400, SY: -22, cx: 600, safe: [40, 32, 1160, 598],
    giant: { lines: ['STŘECHY A FVE'], width: 1090, cover: .04, lh: .84 },
    logo: { x: 48, y: 40, w: 196, v: 'logo' }, shade: 'og' },
  sq: { w: 1080, h: 1080, SW: 2000, SY: 116, cx: 540, safe: [64, 64, 1016, 1016],
    giant: { lines: ['STŘECHY', 'A FVE'], width: 880, cover: .05, lh: .84 },
    logo: { x: 64, y: 64, w: 230, v: 'logo' }, shade: 'feed' },
  pt: { w: 1080, h: 1350, SW: 2300, SY: 176, cx: 540, safe: [64, 159, 1016, 1191],
    giant: { lines: ['STŘECHY', 'A FVE'], width: 900, cover: .05, lh: .84 },
    logo: { x: 64, y: 159, w: 230, v: 'logo' }, shade: 'feed' },
  st: { w: 1080, h: 1920, SW: 2100, SY: 806, cx: 540, safe: [65, 270, 1015, 1248],
    giant: { lines: ['STŘECHY', 'A FVE'], width: 860, cover: .05, lh: .84 },
    logo: { x: 65, y: 290, w: 230, v: 'logo' }, shade: 'story' },
  lb: { w: 1200, h: 400, SW: 1480, SY: -24, cx: 359, safe: [24, 24, 1176, 376], frame: [472, 12, 716, 376, 22],
    giant: { lines: ['STŘECHY A FVE'], width: 650, cover: .04, lh: .84 },
    logo: { x: 48, y: 44, w: 176, v: 'logo-bila' }, shade: 'lb' },
};

const BANNERS = [
  { name: 'og-1200x630', f: 'og', v: 'A' },
  { name: 'meta-1080x1080-A', f: 'sq', v: 'A' },
  { name: 'meta-1080x1080-B', f: 'sq', v: 'B' },
  { name: 'meta-1080x1080-C', f: 'sq', v: 'C' },
  { name: 'meta-1080x1350-A', f: 'pt', v: 'A' },
  { name: 'meta-1080x1350-B', f: 'pt', v: 'B' },
  { name: 'meta-1080x1350-C', f: 'pt', v: 'C' },
  { name: 'meta-1080x1920-A', f: 'st', v: 'A' },
  { name: 'meta-1080x1920-B', f: 'st', v: 'B' },
  { name: 'meta-1080x1920-C', f: 'st', v: 'C' },
  { name: 'web-leaderboard-1200x400', f: 'lb', v: 'A' },
];

const SIZES = { // velikosti textu ve spodním bloku
  sq: { h: 76, sub: 34, eb: 46, num: 116, micro: 30 },
  pt: { h: 84, sub: 36, eb: 50, num: 136, micro: 30 },
};

function copyFor(b, f) {
  const c = F[f];
  if (f === 'st') return `<div class="top" style="left:${c.safe[0]}px;right:${c.w - c.safe[2]}px;top:${b.v === 'C' ? 378 : 390}px">${SKY[b.v]()}</div>`;
  if (f === 'og') return `<div class="bot og" style="left:48px;right:48px;bottom:44px">
      <h1 class="h" data-qa="copy" style="font-size:54px">Pokrývači, kteří<br>umí i fotovoltaiku.</h1>
      <div class="og__r">${cta()}<p class="tel" data-qa="tel">773 898 698 · prooze.cz</p></div></div>`;
  if (f === 'lb') return `<div class="lb" style="left:48px;top:128px;width:400px">
      <h1 class="h" data-qa="copy" style="font-size:44px">Pokrývači, kteří<br>umí i fotovoltaiku.</h1>
      <div class="lb__r">${cta('Chci nabídku', 'cta--s')}<p class="tel" data-qa="tel">773 898 698</p></div></div>`;
  return `<div class="bot" style="left:${c.safe[0]}px;right:${c.w - c.safe[2]}px;bottom:${c.h - c.safe[3]}px">${COPY[b.v](SIZES[f])}</div>`;
}

const SHADES = {
  og: 'radial-gradient(ellipse 70% 70% at 0% 100%, rgba(6,30,23,.7), rgba(6,30,23,0) 70%), linear-gradient(to top, rgba(6,30,23,.9) 0%, rgba(6,30,23,.62) 30%, rgba(6,30,23,0) 58%)',
  feed: 'radial-gradient(ellipse 80% 55% at 0% 100%, rgba(6,30,23,.6), rgba(6,30,23,0) 70%), linear-gradient(to top, rgba(6,30,23,.95) 0%, rgba(6,30,23,.86) 22%, rgba(6,30,23,.5) 36%, rgba(6,30,23,0) 50%)',
  story: 'linear-gradient(to top, rgba(6,30,23,.85) 0%, rgba(6,30,23,.35) 20%, rgba(6,30,23,0) 34%)',
  lb: 'linear-gradient(to top, rgba(6,30,23,.35), rgba(6,30,23,0) 40%)',
};

function html(b) {
  const c = F[b.f];
  const SH = c.SW * 9 / 16, SX = Math.round(c.cx - HOUSE_CX * c.SW);
  const ridge = c.SY + RIDGE_Y * SH;
  const [fx, fy, fw, fh, fr] = c.frame || [0, 0, c.w, c.h, 0];
  const img = c.SW > 1920 ? 2880 : 1920;
  const g = c.giant;
  return `<!doctype html><html lang="cs"><head><meta charset="utf-8">
<title>PROOZE – ${b.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@700;800&family=Funnel+Sans:wght@400;500;600;700&display=block" rel="stylesheet">
<style>
:root{--sun:#FFC83A;--pine:#0F3A2E;--pine-2:#174C3D;--muted:#4F6A61;--paper:#FFFDF7}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${c.w}px;height:${c.h}px;overflow:hidden}${c.frame ? 'body{background:#0F3A2E!important}' : ''}
body{font-family:'Funnel Sans',sans-serif;color:#fff;-webkit-font-smoothing:antialiased;
  background:linear-gradient(to right,#85A7D0,#90ACD1 45%,#A9BCD7);}
.cv{position:relative;width:${c.w}px;height:${c.h}px;overflow:hidden;isolation:isolate}
.sky{position:absolute;inset:0 0 auto 0;height:${Math.max(0, c.SY + 120)}px;z-index:0;
  background:linear-gradient(#7F9FCB,rgba(127,159,203,0) 100%)}
.scene{position:absolute;left:${SX}px;top:${c.SY}px;width:${c.SW}px;height:${SH}px}
.scene img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.back{z-index:0;${c.SY > 0 ? '-webkit-mask-image:linear-gradient(transparent,#000 90px);mask-image:linear-gradient(transparent,#000 90px);' : ''}}
.giant{position:absolute;left:0;top:0;z-index:2;overflow:visible}
.giant text{font-family:'Funnel Display';font-weight:800;fill:#FFFDF7;letter-spacing:-.03em}
.front{z-index:3}
.shade{position:absolute;inset:0;z-index:4;background:${SHADES[c.shade]}}
.logo{position:absolute;z-index:6;left:${c.logo.x}px;top:${c.logo.y}px;width:${c.logo.w}px;height:auto}
.bot,.top,.lb{position:absolute;z-index:6;display:flex;flex-direction:column;align-items:flex-start;gap:30px}
.top{gap:40px;color:var(--pine)}
.h{font-family:'Funnel Display';font-weight:800;line-height:.98;letter-spacing:-.028em;text-wrap:balance}
.blk{display:grid;gap:18px}
.sub{color:rgba(255,255,255,.88);font-weight:500;line-height:1.25}
.top .sub{color:var(--pine);opacity:.82}
.eyebrow{font-family:'Funnel Display';font-weight:800;color:var(--sun);letter-spacing:-.02em;line-height:1}
.tag{justify-self:start;font-weight:700;background:var(--pine);color:#fff;padding:12px 22px;border-radius:12px;line-height:1.1}
.proof{list-style:none;display:flex;flex-wrap:wrap;gap:10px 28px;font-weight:600;color:rgba(255,255,255,.92)}
.proof li{display:flex;align-items:center;gap:10px}
.proof svg{width:1.05em;height:1.05em;color:var(--sun)}
.cta{display:inline-flex;align-items:center;gap:14px;height:84px;padding:0 34px;border-radius:16px;background:var(--sun);color:var(--pine);
  font:700 38px/1 'Funnel Sans';white-space:nowrap}
.cta svg{width:36px;height:36px}
.top .cta,.cta--ink{background:var(--pine);color:#fff}.cta--ink svg{color:var(--sun)}
.card__cta{margin-top:18px}.card .cta{height:76px;font-size:34px;padding:0 30px}
.top .cta svg{color:var(--sun)}
.cta--s{height:58px;padding:0 24px;border-radius:12px;font-size:24px;gap:10px}.cta--s svg{width:24px;height:24px}
.card{background:var(--sun);color:var(--pine);border-radius:24px;padding:30px 38px 34px;display:grid;gap:6px}
.card__l{font-size:var(--l);font-weight:600;line-height:1.2}
.card__l b{font-weight:800}
.card__n{font-family:'Funnel Display';font-weight:800;font-size:var(--n);line-height:.92;letter-spacing:-.035em;white-space:nowrap;margin:2px 0 8px}
.row{display:flex;align-items:center;gap:28px}
.micro{color:rgba(255,255,255,.82);line-height:1.2;font-weight:500}
.top .micro{color:var(--pine);opacity:.8}
.og{flex-direction:row;justify-content:space-between;align-items:flex-end}
.og__r,.lb__r{display:flex;flex-direction:column;align-items:flex-end;gap:22px}
.og .cta{height:70px;font-size:30px;padding:0 28px;border-radius:14px}.og .cta svg{width:28px;height:28px}
.tel{font-weight:600;font-size:22px;color:rgba(255,255,255,.88);letter-spacing:.01em}
.lb{gap:26px}.lb__r{flex-direction:row;align-items:center;gap:22px}.lb .tel{font-size:24px}
</style></head><body>
<div class="cv">${c.frame ? `<div class="fr" style="position:absolute;left:${fx}px;top:${fy}px;width:${fw}px;height:${fh}px;border-radius:${fr}px;overflow:hidden;isolation:isolate;background:linear-gradient(to right,#85A7D0,#A9BCD7)">` : ''}
  <div class="sky"></div>
  <div class="scene"><img class="back" src="${A}/img/web/hero-back-${img}.webp" alt=""></div>
  <svg class="giant" width="${fw}" height="${fh}" viewBox="0 0 ${fw} ${fh}"><text id="g" text-anchor="middle">${g.lines.map(l => `<tspan x="${c.cx}">${l}</tspan>`).join('')}</text></svg>
  <div class="scene" style="z-index:3"><img class="front" src="${A}/img/web/hero-front-${img}.webp" alt=""></div>
  <div class="shade"></div>${c.frame ? '</div>' : ''}
  <img class="logo" data-qa="logo" src="${A}/brand/${c.logo.v}.svg" alt="PROOZE">
  ${copyFor(b, b.f)}
</div>
<script>
// Obří nápis: šířka podle formátu, účaří posledního řádku = hřeben + cover × výška verzálky
window.__fit = async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  const t = document.getElementById('g'), sp = [...t.querySelectorAll('tspan')];
  let fs = 200; t.setAttribute('font-size', fs);
  const maxW = Math.max(...sp.map(s => s.getComputedTextLength()));
  fs = fs * ${g.width} / maxW; t.setAttribute('font-size', fs.toFixed(1));
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = '800 ' + fs + 'px "Funnel Display"';
  const capH = ctx.measureText('H').actualBoundingBoxAscent, accH = ctx.measureText('Ř').actualBoundingBoxAscent;
  const last = ${ridge.toFixed(1)} + ${g.cover} * capH, step = ${g.lh} * fs;
  sp.forEach((s, i) => s.setAttribute('y', (last - (sp.length - 1 - i) * step).toFixed(1)));
  const top = last - (sp.length - 1) * step - accH;
  return { fs: +fs.toFixed(1), capH: +capH.toFixed(1), ridge: ${ridge.toFixed(1)}, baseline: +last.toFixed(1), giantTop: +top.toFixed(1),
    giantBox: (() => { const r = t.getBBox(); return [r.x + ${fx}, top + ${fy}, r.x + r.width + ${fx}, last + ${fy}]; })() };
};
</script>
</body></html>`;
}

function qa(c, info, boxes) {
  const issues = [];
  const [x0, y0, x1, y1] = c.safe;
  for (const b of boxes) {
    if (b.x < x0 - .5 || b.y < y0 - .5 || b.x + b.w > x1 + .5 || b.y + b.h > y1 + .5) issues.push(`${b.k} mimo safe zónu [${b.x|0},${b.y|0},${(b.x+b.w)|0},${(b.y+b.h)|0}]`);
  }
  const all = [...boxes, { k: 'giant', x: info.giantBox[0], y: info.giantBox[1], w: info.giantBox[2] - info.giantBox[0], h: info.giantBox[3] - info.giantBox[1] }];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i], b = all[j];
    const gx = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w), gy = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h);
    const gap = Math.max(gx, gy);
    const inside = (p, q) => p.x >= q.x && p.y >= q.y && p.x + p.w <= q.x + q.w && p.y + p.h <= q.y + q.h;
    if (inside(a, b) || inside(b, a)) continue; // CTA vnořené v kartě
    if (gap < 20) issues.push(`${a.k} × ${b.k}: mezera ${gap.toFixed(0)} px`);
  }
  if (info.giantTop < 8) issues.push(`háček Ř oříznutý (top ${info.giantTop})`);
  return issues;
}

const filter = process.argv[2];
const list = BANNERS.filter(b => !filter || b.name.includes(filter));
const browser = await chromium.launch({ channel: 'chrome' });
const report = fs.existsSync(path.join(OUT, '_qa.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, '_qa.json'), 'utf8')) : {};
for (const b of list) {
  const c = F[b.f];
  const file = path.join(OUT, b.name + '.html');
  fs.writeFileSync(file, html(b));
  const ctx = await browser.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('file://' + file, { waitUntil: 'networkidle' });
  const info = await p.evaluate(() => window.__fit());
  const boxes = await p.evaluate(() => [...document.querySelectorAll('[data-qa]')].map(e => { const r = e.getBoundingClientRect(); return { k: e.dataset.qa, x: r.x, y: r.y, w: r.width, h: r.height }; }));
  await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(OUT, b.name + '.png') });
  report[b.name] = { ...info, issues: qa(c, info, boxes) };
  console.log(b.name, JSON.stringify(report[b.name]));
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, '_qa.json'), JSON.stringify(report, null, 1));

// Kontaktní arch
const items = BANNERS.map(b => ({ n: b.name, ...F[b.f] }));
const sheet = `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@800&family=Funnel+Sans:wght@500;700&display=block" rel="stylesheet">
<style>body{margin:0;background:#F1F4EE;font-family:'Funnel Sans';color:#0F3A2E;padding:64px;width:2400px;box-sizing:border-box}
h1{font:800 64px/1 'Funnel Display';letter-spacing:-.03em;margin:0 0 8px}p.s{margin:0 0 48px;color:#4F6A61;font-size:22px}
.g{display:flex;flex-wrap:wrap;gap:40px 32px;align-items:flex-end}figure{margin:0}figure img{display:block;border-radius:14px;box-shadow:0 1px 0 rgba(15,58,46,.1)}
figcaption{margin-top:12px;font-weight:700;font-size:20px}figcaption span{font-weight:500;color:#4F6A61;margin-left:8px}</style></head><body>
<h1>PROOZE – bannery z hero</h1><p class="s">Sdělení A „Pokrývači, kteří umí i fotovoltaiku.“ · B „Měníte střechu? Dejte na ni rovnou panely.“ · C „Bezúročný úvěr až 400 000 Kč“</p>
<div class="g">${items.map(i => { const s = i.w > 1100 ? .5 : (i.h > 1500 ? .36 : .42); return `<figure><img src="${i.n}.png" width="${Math.round(i.w * s)}" height="${Math.round(i.h * s)}"><figcaption>${i.n}<span>${i.w} × ${i.h}</span></figcaption></figure>`; }).join('')}</div></body></html>`;
fs.writeFileSync(path.join(OUT, '_prehled.html'), sheet);
{
  const ctx = await browser.newContext({ viewport: { width: 2400, height: 1000 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('file://' + path.join(OUT, '_prehled.html'), { waitUntil: 'networkidle' });
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  await p.screenshot({ path: path.join(OUT, '_prehled.png'), fullPage: true });
  await ctx.close();
}
await browser.close();
