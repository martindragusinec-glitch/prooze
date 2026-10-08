// Náhledové obrázky článků pro sdílení (1200×630): fotka článku + nadpis + štítek + logo. Bez AI, jen skládání.
//   node tools/og_blog.mjs   → assets/img/og/blog-<slug>.jpg
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');
const { chromium } = require(path.resolve(root, '../bannerovna/node_modules/playwright-core'));
const out = path.join(root, 'assets/img/og');
fs.mkdirSync(out, { recursive: true });
const KAT = { strechy: 'Střechy', fotovoltaika: 'Fotovoltaika', dotace: 'Dotace a úvěry', 'strecha-fve': 'Střecha + FVE' };
const logo = fs.readFileSync(path.join(root, 'assets/brand/logo-bila.svg'), 'utf8');
// písmo vložené jako data URI (stránka se skládá přes setContent)
const fontsCss = fs.readFileSync(path.join(root, 'assets/fonts/fonts.css'), 'utf8').replace(/url\('\.\.\/fonts\/([^']+)'\)/g, (_, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'assets/fonts', f)).toString('base64')})`);
const posts = fs.readdirSync(path.join(root, 'src/blog')).filter((f) => f.endsWith('.html') && !f.startsWith('_') && (process.env.OG_TEST || !f.startsWith('zz-')));
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const f of posts) {
  const src = fs.readFileSync(path.join(root, 'src/blog', f), 'utf8');
  const meta = Object.fromEntries([...src.match(/<!--([\s\S]*?)-->/)[1].matchAll(/^\s*([\w-]+):\s*(.+?)\s*$/gm)].map((m) => [m[1], m[2]]));
  const img = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(root, `assets/img/web/${meta.obrazek}-1600.jpg`)).toString('base64');
  const h1 = meta.h1.replace(/&nbsp;/g, ' ');
  const size = h1.length > 60 ? 58 : h1.length > 42 ? 66 : 76;
  await p.setContent(`<style>
    ${fontsCss}
    body{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;font-family:'Funnel Display',system-ui,sans-serif;color:#fff;background:#0F3A2E}
    .bg{position:absolute;inset:0;background:url(${img}) center/cover}
    .sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,30,23,.55) 0%,rgba(6,30,23,.1) 30%,rgba(6,30,23,.6) 58%,rgba(6,30,23,.95) 100%)}
    .logo{position:absolute;left:60px;top:48px;height:46px}.logo svg{height:46px;width:auto}
    .in{position:absolute;left:60px;right:60px;bottom:56px;display:grid;gap:18px;justify-items:start}
    .tags{display:flex;gap:10px}.k{background:#fff;color:#0F3A2E;border-radius:999px;padding:9px 16px;font-weight:800;font-size:20px}
    .s{background:#FFC83A;color:#0F3A2E;border-radius:12px;padding:9px 16px;font-weight:800;font-size:22px}
    h1{margin:0;font-weight:800;font-size:${size}px;line-height:1.02;letter-spacing:-.03em;text-wrap:balance;max-width:1000px}
    .u{position:absolute;right:60px;top:56px;font-weight:700;font-size:20px;opacity:.9}
  </style><div class="bg"></div><div class="sh"></div><div class="logo">${logo}</div><div class="u">prooze.cz/poradna</div>
  <div class="in"><div class="tags"><span class="k">${KAT[meta.kategorie]}</span>${meta.stitek ? `<span class="s">${meta.stitek}</span>` : ''}</div><h1>${h1}</h1></div>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(out, `blog-${f.replace('.html', '')}.jpg`), type: 'jpeg', quality: 84 });
}
await b.close();
console.log(posts.length, 'OG obrázků');
