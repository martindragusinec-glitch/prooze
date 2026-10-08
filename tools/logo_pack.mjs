// Z SVG v brand/logo-balicek/SVG vyrobí průhledné PNG (2 velikosti), PDF (vektor) a náhledový arch.
//   python3 tools/logo_pack.py && node tools/logo_pack.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname);
const { chromium } = require(path.resolve(here, '../../bannerovna/node_modules/playwright-core'));
const base = path.resolve(here, '../brand/logo-balicek');
const svgDir = path.join(base, 'SVG');
const SIZES = { vodorovne: [1000, 4000], svisle: [800, 3000], symbol: [512, 2048], napis: [1000, 4000] };

for (const d of ['PNG', 'PDF']) fs.mkdirSync(path.join(base, d), { recursive: true });
const files = fs.readdirSync(svgDir).filter((f) => f.endsWith('.svg')).sort();
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
for (const f of files) {
  const svg = fs.readFileSync(path.join(svgDir, f), 'utf8');
  const [, , , vw, vh] = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/).map(Number);
  const lay = f.split('-')[2];
  for (const W of SIZES[lay]) {
    const H = Math.round((W * vh) / vw);
    await p.setViewportSize({ width: W, height: H });
    await p.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${W}px;height:${H}px}</style>${svg}`);
    await p.screenshot({ path: path.join(base, 'PNG', f.replace('.svg', `-${W}px.png`)), omitBackground: true });
  }
  // PDF ve skutečném poměru (šířka 100 mm), vektor, bez pozadí
  const mmW = 100, mmH = (100 * vh) / vw;
  await p.setContent(`<style>@page{size:${mmW}mm ${mmH.toFixed(2)}mm;margin:0}html,body{margin:0;background:transparent}svg{display:block;width:${mmW}mm;height:${mmH.toFixed(2)}mm}</style>${svg}`);
  await p.pdf({ path: path.join(base, 'PDF', f.replace('.svg', '.pdf')), width: `${mmW}mm`, height: `${mmH.toFixed(2)}mm`, printBackground: false, pageRanges: '1' });
}

// Náhledový arch: každá varianta na pozadí, pro které je určená
const bg = { barevne: '#FFFFFF', inverzni: '#0F3A2E', 'na-zlute': '#FFC83A', cerne: '#F1F4EE', bile: '#2A5E4E' };
const label = { barevne: 'Barevné – na světlé', inverzni: 'Inverzní – na tmavé a fotky', 'na-zlute': 'Na žluté', cerne: 'Černé jednobarevné', bile: 'Bílé jednobarevné' };
const layName = { vodorovne: 'Vedle sebe', svisle: 'Nad sebou', symbol: 'Symbol', napis: 'Nápis' };
let rows = '';
for (const v of Object.keys(bg)) {
  rows += `<div class="row"><div class="lab">${label[v]}</div>` + Object.keys(layName).map((l) =>
    `<div class="cell" style="background:${bg[v]}">${fs.readFileSync(path.join(svgDir, `prooze-logo-${l}-${v}.svg`), 'utf8')}</div>`).join('') + '</div>';
}
const head = Object.values(layName).map((n) => `<div class="h">${n}</div>`).join('');
await p.setViewportSize({ width: 1800, height: 1000 });
await p.setContent(`<style>body{margin:0;padding:40px;font:600 15px system-ui;color:#0F3A2E;background:#fff}
.grid{display:grid;grid-template-columns:200px repeat(4,1fr);gap:10px}.row{display:contents}.lab{align-self:center}
.h{font-weight:800;padding-bottom:4px}.cell{height:180px;border-radius:14px;display:grid;place-items:center;padding:26px;border:1px solid #e3e8e1}
.cell svg{max-width:100%;max-height:100%;width:auto;height:auto}h1{font:800 28px system-ui;margin:0 0 20px}</style>
<h1>PROOZE – logo, varianty</h1><div class="grid"><div></div>${head}${rows}</div>`);
await p.screenshot({ path: path.join(base, 'prooze-logo-nahled.png'), fullPage: true });
await b.close();
console.log(files.length, 'variant → PNG, PDF, náhled');
