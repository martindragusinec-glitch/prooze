// Screenshot: node prooze-web/tools/shot.mjs <url|soubor> <výstup.png> [šířka] [výška] [full=1]
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname);
const { chromium } = require(path.resolve(here, '../../bannerovna/node_modules/playwright-core'));
const [src, out, w = 1440, h = 900, full = '1'] = process.argv.slice(2);
const url = /^https?:/.test(src) ? src : 'file://' + path.resolve(src);
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, reducedMotion: 'reduce' })).newPage();
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); await document.fonts.ready; });
await p.waitForTimeout(400);
await p.screenshot({ path: out, fullPage: full === '1' });
await b.close();
console.log('ok', out);
