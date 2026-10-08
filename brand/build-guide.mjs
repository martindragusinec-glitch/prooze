// PROOZE – brand manuál. Spuštění: node prooze-web/brand/build-guide.mjs
// Výstup: brand/brand-guide.html (samostatný, assety přes ../assets), brand-guide.pdf (1920×1080 stránky), guide-01…10.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname);
const { chromium } = require(path.resolve(here, '../../bannerovna/node_modules/playwright-core'));
const A = '../assets';
const svg = (f) => fs.readFileSync(path.join(here, '../assets/brand', f), 'utf8').replace(/ role="img" aria-label="PROOZE"/, ' aria-hidden="true"');
const LOGO = svg('logo.svg'), LOGO_W = svg('logo-bila.svg'), LOGO_Y = svg('logo-na-zlute.svg');
const LOGO_INL = svg('logo-inline.svg');
const SYMBOL = svg('symbol.svg');
// jen symbol s přebarvenými moduly (zakázaná úprava)
const recolor = LOGO.replace(/<g fill="#FFC83A">/, '<g fill="#3B82F6">');
// jen symbol + písmo jiným fontem (zakázaná úprava)
const symbolOnly = SYMBOL;

const ICONS = {
  roof: '<path d="M2.5 12.5 12 4l9.5 8.5M5.5 10v9.5h13V10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 19.5v-5h5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  pv: '<path d="M4 9.5h16l-2 9H2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.7 9.5 7.3 18.5M13.3 9.5l-1.4 9M3 14h16" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.5" cy="4.5" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  both: '<path d="M2.5 13 12 4.5l9.5 8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="m13.6 6 2.4 2.1M17.3 9.3l2.4 2.1" stroke="currentColor" stroke-width="3.2"/><path d="M5.5 11v8.5h13V11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  phone: '<path d="M6.6 3.5h3l1.5 4.2-2 1.4a11 11 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3c0 1.1-.9 2-2 2A16.5 16.5 0 0 1 4.6 5.5c0-1.1.9-2 2-2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
const I = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
const X = '<svg class="no" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

// ---------- barvy ----------
const hex2rgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const cmyk = (h) => { const [r, g, b] = hex2rgb(h).map(v => v / 255); const k = 1 - Math.max(r, g, b); if (k >= 1) return [0, 0, 0, 100]; return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map(v => Math.round(v * 100)); };
const lum = (h) => { const c = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return ((x + .05) / (y + .05)).toFixed(1).replace('.', ','); };
const MAIN = [
  { n: 'Slunce', h: '#FFC83A', t: '#0F3A2E', u: 'Žlutá plocha, CTA na tmavé, sliby, čísla. Energie a teplo – nikdy jako text na bílé.' },
  { n: 'Jedle', h: '#0F3A2E', t: '#FFFFFF', u: 'Inkoust značky: nadpisy, text, tmavé sekce, tlačítko na světlé. Nahrazuje černou.' },
  { n: 'Mlha', h: '#F1F4EE', t: '#0F3A2E', u: 'Klidné pozadí sekcí a karet. Odděluje bloky bez čar.' },
  { n: 'Bílá', h: '#FFFFFF', t: '#0F3A2E', u: 'Hlavní plocha webu a tiskovin. Nápis za střechou v teplé bílé #FFFDF7.' },
];
const SHADES = [
  { n: 'Slunce sytá', h: '#F5B514', t: '#0F3A2E', u: 'hover CTA, podtržení' },
  { n: 'Slunce jemná', h: '#FFF3CC', t: '#0F3A2E', u: 'zvýraznění, aktivní volba' },
  { n: 'Jedle 2', h: '#174C3D', t: '#FFFFFF', u: 'karty na jedli' },
  { n: 'Jedle 3', h: '#2A5E4E', t: '#FFFFFF', u: 'hover tmavého tlačítka' },
  { n: 'Šedozelená', h: '#4F6A61', t: '#FFFFFF', u: 'doprovodný text' },
  { n: 'List', h: '#1FA463', t: '#FFFFFF', u: 'jen ikony a stav „hotovo“' },
];
const sw = (c, big) => { const [r, g, b] = hex2rgb(c.h); const k = cmyk(c.h); return `<div class="sw ${big ? 'sw--big' : ''}" style="background:${c.h};color:${c.t}">
  <p class="sw__n">${c.n}</p>
  <dl class="sw__v"><div><dt>HEX</dt><dd>${c.h}</dd></div><div><dt>RGB</dt><dd>${r} ${g} ${b}</dd></div><div><dt>CMYK*</dt><dd>${k.join(' ')}</dd></div></dl>
  ${big ? `<p class="sw__u">${c.u}</p>` : `<p class="sw__u">${c.u}</p>`}</div>`; };
const PAIRS = [['#0F3A2E', '#FFFFFF', 'Jedle na bílé'], ['#0F3A2E', '#FFC83A', 'Jedle na slunci'], ['#FFFFFF', '#0F3A2E', 'Bílá na jedli'], ['#FFC83A', '#0F3A2E', 'Slunce na jedli'], ['#4F6A61', '#F1F4EE', 'Šedozelená na mlze'], ['#FFFFFF', '#FFC83A', 'Bílá na slunci']];

// ---------- obsah stránek ----------
const rail = (n, t, dark) => `<header class="rail ${dark ? 'rail--d' : ''}"><span class="rail__l">${LOGO_INL}<b>Brand manuál</b></span><span>${String(n).padStart(2, '0')} / ${t}</span></header>`;

const pages = [];
// 01 Titul
pages.push(`<section class="pg pg--title">
  <div class="tf"><div class="tf__sc"><img class="tf__back" src="${A}/img/web/hero-back-2880.webp" alt=""></div>
  <svg class="tf__giant" width="1872" height="1032" viewBox="0 0 1872 1032"><text id="tg" x="936" text-anchor="middle">STŘECHY A FVE</text></svg>
  <div class="tf__sc" style="z-index:3"><img src="${A}/img/web/hero-front-2880.webp" alt=""></div>
  <div class="tf__shade"></div>
  <div class="tf__logo">${LOGO}</div>
  <div class="tf__copy"><p class="tf__k">Brand manuál · verze 1.0 · říjen 2026</p><h1 class="tf__h">Pokrývači, kteří<br>umí i fotovoltaiku.</h1></div>
  <p class="tf__meta">PROOZE · Slaný<br>prooze.cz · 773 898 698</p></div>
</section>`);

// 02 Značka v kostce
pages.push(`<section class="pg">${rail(2, 'Značka v kostce')}
  <div class="g2">
    <div class="col">
      <p class="kick">Kdo jsme</p>
      <h2 class="d1">Pokrývači, kteří umí i&nbsp;fotovoltaiku.</h2>
      <p class="lead">PROOZE je parta pokrývačů ze Slaného. Opravíme, předěláme nebo postavíme šikmou střechu a&nbsp;rovnou na ni dáme panely. Jedno lešení, jedna smlouva, jedna záruka. Název čteme <b>PRO&nbsp;OZE</b> – pro obnovitelné zdroje energie.</p>
      <ol class="promises">
        <li><span class="pn">01</span><div><h3>Pod panely nezateče</h3><p>Kotvíme podle pokynů výrobce krytiny. Střecha zůstane těsná a&nbsp;její záruka platná.</p></div></li>
        <li><span class="pn">02</span><div><h3>Pevná cena před podpisem</h3><p>Rozpočet položku po položce. Co podepíšete, to zaplatíte, vícepráce jen s&nbsp;vaším souhlasem.</p></div></li>
        <li><span class="pn">03</span><div><h3>Termíny, které platí</h3><p>Ozveme se do 24 hodin. Termín realizace dostanete písemně, elektrárnu zvládneme do 2–3 měsíců.</p></div></li>
      </ol>
    </div>
    <figure class="ph ph--tall"><img src="${A}/img/web/pokryvaci-palena-1600.webp" alt=""><figcaption>Panely vám montují pokrývači – lidi, kteří vědí, co je pod nimi.</figcaption></figure>
  </div>
  <div class="pos"><span>Pozicování</span><p>Nejsme elektrikáři, kteří vrtají do cizí střechy. Jsme řemeslníci, kteří střechu postaví a&nbsp;ručí za ni i&nbsp;s&nbsp;panely.</p></div>
</section>`);

// 03 Logo
const DONTS = [
  ['Neotáčet', `<div class="dl" style="transform:rotate(-14deg)">${LOGO}</div>`],
  ['Nepřebarvovat moduly', `<div class="dl">${recolor}</div>`],
  ['Nedeformovat', `<div class="dl" style="transform:scaleX(1.45) scaleY(.8)">${LOGO}</div>`],
  ['Ne na rušnou fotku bez podkladu', `<div class="dl dl--photo">${LOGO}</div>`],
  ['Nestínovat', `<div class="dl" style="filter:drop-shadow(6px 8px 4px rgba(0,0,0,.45))">${LOGO}</div>`],
  ['Neměnit písmo', `<div class="dl dl--font"><span class="dl__sym">${symbolOnly}</span><span>Prooze</span></div>`],
];
pages.push(`<section class="pg">${rail(3, 'Logo')}
  <div class="logo-top">
    <div class="cons">
      <p class="kick">Konstrukce „Hřeben“</p>
      <div class="cons__art">
        <div class="cons__sym">${SYMBOL}</div>
        <div class="cons__a cons__a--l"><b>Levý svah</b>plná krytina<br>= střechy</div>
        <div class="cons__a cons__a--r"><b>Pravý svah</b>tři solární moduly<br>= fotovoltaika</div>
      </div>
      <p class="body">Symbol je hřeben šikmé střechy. Jeden svah je celistvá krytina, druhý tvoří tři moduly v barvě slunce. Střecha i&nbsp;panely od jedné party – celé pozicování v&nbsp;jedné značce. Wordmark „prooze“ je převedený do křivek, nikdy ho nesázíme písmem.</p>
    </div>
    <div class="vars">
      <figure class="var" style="background:#fff;box-shadow:inset 0 0 0 1px rgba(15,58,46,.14)">${LOGO}<figcaption>Základní · na světlé</figcaption></figure>
      <figure class="var" style="background:#0F3A2E;color:#fff">${LOGO_W}<figcaption>Inverzní · na jedli a fotce se ztmavením</figcaption></figure>
      <figure class="var" style="background:#FFC83A">${LOGO_Y}<figcaption>Na žluté · moduly bílé</figcaption></figure>
    </div>
  </div>
  <div class="logo-bot">
    <div class="cz"><p class="kick">Ochranná zóna</p>
      <div class="cz__box"><span class="cz__m cz__m--t">x</span><span class="cz__m cz__m--l">x</span><div class="cz__logo">${LOGO}</div></div>
      <p class="small">x = výška symbolu. Do zóny nevstupuje text, okraj ani jiný prvek.</p></div>
    <div class="ms"><p class="kick">Minimální velikost</p>
      <div class="ms__row"><div class="ms__i"><div style="width:96px">${LOGO}</div><span>logo 96 px</span></div><div class="ms__i"><div style="width:24px">${SYMBOL}</div><span>symbol 24 px</span></div></div>
      <p class="small">V tisku logo min. 25 mm, symbol 6 mm. Menší jen favicon.</p></div>
    <div class="dn"><p class="kick">Co s logem nedělat</p>
      <div class="dn__g">${DONTS.map(([t, h]) => `<figure class="dn__i"><div class="dn__c">${h}</div><figcaption>${X}${t}</figcaption></figure>`).join('')}</div></div>
  </div>
</section>`);

// 04 Barvy
pages.push(`<section class="pg">${rail(4, 'Barvy')}
  <div class="col-head"><h2 class="d2">Slunce na střeše, jedle kolem domu.</h2><p class="body">Dvě barvy nesou celou značku: teplá žlutá slunce a hluboká zelená jedle místo černé. Mlha a bílá dávají vzduch.</p></div>
  <div class="sws">${MAIN.map(c => sw(c, true)).join('')}</div>
  <div class="cl-bot">
    <div class="shades">${SHADES.map(c => sw(c)).join('')}</div>
    <div class="ratio"><p class="kick">Poměr použití</p>
      <div class="ratio__bar"><span style="flex:60;background:#fff;box-shadow:inset 0 0 0 1px rgba(15,58,46,.14)">60 %<small>bílá + mlha</small></span><span style="flex:25;background:#0F3A2E;color:#fff">25 %<small>jedle</small></span><span style="flex:10;background:#FFC83A">10 %<small>slunce</small></span><span style="flex:5;background:#1FA463;color:#fff">5</span></div>
      <p class="small">5 % = akcenty: list (ikony), slunce sytá, foto. Žlutá je vzácná, proto svítí.</p>
      <p class="kick" style="margin-top:28px">Kontrast (WCAG)</p>
      <ul class="pairs">${PAIRS.map(([f, b, n]) => { const r = parseFloat(ratio(f, b).replace(',', '.')); return `<li><span class="pairs__s" style="background:${b};color:${f}">Aa</span><span>${n}</span><b class="${r < 3 ? 'bad' : ''}">${ratio(f, b)} : 1 ${r >= 4.5 ? 'AA' : r >= 3 ? 'velký text' : 'nepoužívat'}</b></li>`; }).join('')}</ul>
    </div>
  </div>
  <p class="foot">* CMYK je orientační převod z RGB. Pro tisk vždy nátisk, slunce ladit k Pantone 123 C, jedli k Pantone 3435 C (ověřit vzorníkem).</p>
</section>`);

// 05 Typografie
pages.push(`<section class="pg">${rail(5, 'Typografie')}
  <div class="ty">
    <div class="ty__fonts">
      <div class="ty__f"><p class="ty__aa" style="font-family:'Funnel Display';font-weight:800">Aa</p><div><h3>Funnel Display</h3><p class="small">Nadpisy, čísla, obří nápis. Řez 800 (700 pro H3). Prokládání −0,02 až −0,04 em, řádkování 0,94–1,02.</p></div></div>
      <div class="ty__f"><p class="ty__aa" style="font-family:'Funnel Sans';font-weight:500">Aa</p><div><h3>Funnel Sans</h3><p class="small">Text, tlačítka, popisky. 400 / 500 / 600 / 700. Řádkování 1,5–1,55. Obě písma zdarma z Google Fonts.</p></div></div>
      <p class="ty__dia">ěščřžýáíéůú ďťň<br>ĚŠČŘŽÝÁÍÉŮÚ ĎŤŇ<br>0123456789 Kč % „“</p>
    </div>
    <div class="ty__scale">
      <div class="ts"><span class="ts__l">Display<small>120 / 0,94 · −0,035 em</small></span><p style="font:800 120px/.94 'Funnel Display';letter-spacing:-.035em">Střechy a FVE</p></div>
      <div class="ts"><span class="ts__l">H1<small>70 / 0,98 · −0,028 em</small></span><p style="font:800 70px/.98 'Funnel Display';letter-spacing:-.028em">Pokrývači, kteří umí i fotovoltaiku.</p></div>
      <div class="ts"><span class="ts__l">H2<small>56 / 1,02 · −0,022 em</small></span><p style="font:800 56px/1.02 'Funnel Display';letter-spacing:-.022em">Stát přidá. Papíry vyřídíme my.</p></div>
      <div class="ts"><span class="ts__l">H3<small>32 / 1,12 · 700</small></span><p style="font:700 32px/1.12 'Funnel Display';letter-spacing:-.012em">Pod panely nezateče</p></div>
      <div class="ts"><span class="ts__l">Text<small>18 / 1,55 · 400</small></span><p style="font:400 18px/1.55 'Funnel Sans';max-width:62ch">Opravíme, předěláme nebo postavíme šikmou střechu a rovnou na ni dáme panely. Kotvíme podle pokynů výrobce krytiny, takže střecha zůstane těsná a její záruka platná.</p></div>
      <div class="ts"><span class="ts__l">Popisek<small>14 / 1,4 · 600</small></span><p style="font:600 14px/1.4 'Funnel Sans';color:#4F6A61">Orientační přehled programu Nová zelená úsporám k říjnu 2026.</p></div>
    </div>
  </div>
</section>`);

// 06 Grafické prvky
pages.push(`<section class="pg pg--mist">${rail(6, 'Grafické prvky')}
  <div class="gp">
    <figure class="gp__c gp__depth"><img src="bannery/og-1200x630.png" alt=""><figcaption><b>Nápis za střechou</b>Fotka → obří nápis → popředí (dům, komín, strom). Střecha kryje spodních 20–25&nbsp;% písmen, háček Ř nikdy neořezat. Verzálky, Funnel Display 800, teplá bílá. Jen v hero a bannerech, jednou na plochu.</figcaption></figure>
    <figure class="gp__c gp__frame"><div class="fr"><div class="fr__in"><img src="${A}/img/web/hero-b-1920.webp" alt=""></div><span class="fr__t">12 px</span></div><figcaption><b>Zaoblený rám</b>Hero a velké fotky sedí v rámu s odsazením 8–12 px od okraje. Rádius: rám 28, fotka 24, karta 20, tlačítko 12 px.</figcaption></figure>
    <figure class="gp__c gp__bento"><div class="bt">
      <div class="bt__t bt__t--sun">${I('roof')}<b>Pod panely nezateče</b></div>
      <div class="bt__t bt__t--pine">${I('check')}<b>Pevná cena před podpisem</b></div>
      <div class="bt__t bt__t--ph"><img src="${A}/img/web/montaz-fve-800.webp" alt=""><b>Panely vám montují pokrývači</b></div>
      <div class="bt__t bt__t--mist"><span class="bt__n">24 h</span><b>Termíny, které platí</b></div></div>
      <figcaption><b>Bento dlaždice</b>Sliby ve skládačce: žlutá, jedle, fotka, mlha. V jedné mřížce max. jedna žlutá.</figcaption></figure>
    <figure class="gp__c"><div class="sw-c">${['palena', 'betonova', 'plech', 'hlinik', 'sindel'].map(n => `<img src="${A}/img/swatch/${n}.webp" alt="">`).join('')}</div>
      <figcaption><b>Vzorky krytin v kruzích</b>Skutečné výřezy krytin, kruh s bílým lemem 3 px, překryv −10 px. Nekreslíme, fotíme.</figcaption></figure>
    <figure class="gp__c"><div class="ics">${Object.keys(ICONS).map(k => `<span>${I(k)}</span>`).join('')}</div>
      <figcaption><b>Ikony</b>Lineární, tah 1,8 px na mřížce 24 px, zaoblené konce. Barva jedle, na tmavé slunce. Žádné ikony ve čtverečcích.</figcaption></figure>
  </div>
</section>`);

// 07 Fotografie
pages.push(`<section class="pg">${rail(7, 'Fotografie')}
  <div class="ft">
    <div class="ft__txt">
      <h2 class="d2">Skutečné střechy, skutečné ruce.</h2>
      <ul class="yes"><li>${I('check')}Zlatá hodina, teplé boční světlo, dlouhé stíny</li><li>${I('check')}České domy: sedlové střechy, pálená taška, plot, zahrada</li><li>${I('check')}Řemeslo v detailu: ruce, taška, kotva, kabeláž</li><li>${I('check')}Lidé v práci, ne v póze; pohled mimo objektiv</li><li>${I('check')}Černé celoplošné panely, čistě položené řady</li></ul>
      <p class="kick" style="margin-top:36px">Nepoužíváme</p>
      <ul class="nope"><li>${X}Americké vily, bazény a palmy</li><li>${X}Stockové úsměvy a palce nahoru do kamery</li><li>${X}Modré panely s rámy na červené střeše jako z katalogu</li><li>${X}Helmy bez jištění, nebezpečné postupy</li><li>${X}Přesycené HDR a tyrkysové nebe</li></ul>
    </div>
    <div class="ft__g">
      <figure class="f1"><img src="${A}/img/web/hero-b-1920.webp" alt=""></figure>
      <figure class="f2"><img src="${A}/img/web/montaz-fve-1600.webp" alt=""></figure>
      <figure class="f3"><img src="${A}/img/web/taska-palena-detail-1600.webp" alt=""></figure>
      <figure class="f4"><img src="${A}/img/web/rekonstrukce-leseni-1600.webp" alt=""></figure>
      <figure class="f5"><img src="${A}/img/web/konzultace-1600.webp" alt=""></figure>
      <figure class="f6"><img src="${A}/img/web/stridac-baterie-1600.webp" alt=""></figure>
    </div>
  </div>
</section>`);

// 08 Tón a copy
const TONE = [
  ['Pod panely nezateče', 'Kvalitní služby'],
  ['Pevná cena před podpisem', 'Nejlepší ceny na trhu'],
  ['Ozveme se do 24 hodin', 'Rychlá a profesionální komunikace'],
  ['Měníte střechu? Dejte na ni rovnou panely.', 'Komplexní řešení pro vaši střechu'],
  ['Stát přidá. Papíry vyřídíme my.', 'Využijte jedinečnou příležitost!'],
  ['Jedno lešení, jedna smlouva, jedna záruka.', 'Pořádně, rychle, levně.'],
];
pages.push(`<section class="pg">${rail(8, 'Tón a copy')}
  <div class="tn">
    <div class="tn__p">
      <h2 class="d2">Mluvíme jako mistr na lešení. Klidně, konkrétně, na rovinu.</h2>
      <ol class="prin">
        <li><span><b>Slib místo přídavného jména.</b> Co přesně zákazník dostane, ne jací jsme.</span></li>
        <li><span><b>Z pohledu jeho starosti.</b> Zatéká, bojí se vrtání, neví, kolik to bude stát.</span></li>
        <li><span><b>Vykáme.</b> Vždy a všude, i v reklamě a na sociálních sítích.</span></li>
        <li><span><b>Krátké věty.</b> Jedna myšlenka na větu. Čísla s podmínkou.</span></li>
        <li><span><b>Česky a s diakritikou.</b> Bez anglicismů a bez vykřičníků.</span></li>
      </ol>
    </div>
    <div class="tn__t">
      <div class="tbl__h"><span>${I('check')}Píšeme</span><span>${X}Nepíšeme</span></div>
      ${TONE.map(([y, n]) => `<div class="tbl__r"><b>${y}</b><s>${n}</s></div>`).join('')}
      <p class="small" style="margin-top:22px">„Pořádně, rychle, levně“ je klišé, které může napsat kdokoli. Klient ho výslovně odmítl.</p>
    </div>
  </div>
</section>`);

// 09 UI prvky
pages.push(`<section class="pg">${rail(9, 'UI prvky')}
  <div class="ui">
    <div class="ui__c"><p class="kick">Tlačítka</p>
      <div class="ui__row"><span class="b b--ink">Chci nabídku</span><span class="b b--out">Všechno o střechách</span></div>
      <div class="ui__dark"><span class="b b--sun">Chci nabídku ${I('arrow')}</span><span class="b b--ghost">Všechno o fotovoltaice</span></div>
      <p class="small">Výška 56 px, rádius 12 px, Funnel Sans 700. Na světlé jedle, na tmavé slunce. Jedno hlavní tlačítko na plochu, text vždy „Chci nabídku“ nebo konkrétní sloveso.</p></div>
    <div class="ui__c ui__c--pick"><p class="kick" style="color:#fff">Výběrové dlaždice</p>
      <p class="pick__q">Co řešíte?</p>
      <div class="pk"><span class="pk__b">${I('roof')}<span>Střechu<small>oprava, výměna, nová</small></span></span><span class="pk__b">${I('pv')}<span>Fotovoltaiku<small>panely, baterie, dotace</small></span></span><span class="pk__b">${I('both')}<span>Obojí najednou<small>ušetříte za lešení</small></span></span></div>
      <p class="small" style="color:rgba(255,255,255,.8)">Bílá dlaždice 64 px, rádius 14 px, ikona 28 px. Hover = slunce.</p></div>
    <div class="ui__c"><p class="kick">Karty a štítky</p>
      <div class="cards">
        <div class="cd cd--sun">${I('roof')}<h4>Pod panely nezateče</h4><p>Kotvíme podle pokynů výrobce krytiny.</p></div>
        <div class="cd cd--pine">${I('check')}<h4>Pevná cena před podpisem</h4><p>Rozpočet položku po položce.</p></div>
        <div class="cd cd--num"><span>až 400 000 Kč</span><p>na fotovoltaiku s baterií bez úroků</p></div>
      </div>
      <div class="chips"><span>rodinných domech</span><span>bytových domech a SVJ</span><span>firemních objektech</span></div>
      <div class="swc"><b>Krytiny, které pokládáme</b><div class="sw-c sw-c--s">${['palena', 'betonova', 'plech', 'hlinik', 'sindel'].map(n => `<img src="${A}/img/swatch/${n}.webp" alt="">`).join('')}</div><span class="lnk">Prohlédnout krytiny</span></div>
    </div>
  </div>
</section>`);

// 10 Ukázky
pages.push(`<section class="pg pg--pine">${rail(10, 'Ukázky aplikace', true)}
  <div class="ap">
    <div class="ap__h"><h2 class="d2">Hero web → bannery.</h2><p class="body">Všechny formáty stojí na stejné scéně: nápis za střechou, logo vlevo nahoře, sdělení dole na jedli. Tři sdělení: A pozicování, B výměna střechy, C bezúročný úvěr NZÚ.</p></div>
    <div class="ap__g">
      <div class="ap__r"><figure><img src="bannery/og-1200x630.png" style="height:320px" alt=""><figcaption>OG obrázek 1200 × 630 · A</figcaption></figure><figure><img src="bannery/web-leaderboard-1200x400.png" style="height:206px" alt=""><figcaption>Web / e-mail 1200 × 400 · A</figcaption></figure></div>
      <div class="ap__r">${[['meta-1080x1080-A','1:1 · A'],['meta-1080x1350-B','4:5 · B'],['meta-1080x1350-C','4:5 · C'],['meta-1080x1920-A','9:16 · A'],['meta-1080x1920-C','9:16 · C']].map(([f,t]) => `<figure><img src="bannery/${f}.png" style="height:336px" alt=""><figcaption>Meta ${t}</figcaption></figure>`).join('')}</div>
    </div>
  </div>
</section>`);

const CSS = fs.readFileSync(path.join(here, 'guide.css'), 'utf8');
const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=1920">
<title>PROOZE – brand manuál</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@500;700;800&family=Funnel+Sans:wght@400;500;600;700&display=block" rel="stylesheet">
<style>${CSS}</style></head><body>
${pages.join('\n')}
<script>
window.__fit = async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  // titul: obří nápis za střechou (scéna 1872 px, hřeben 0,323 výšky)
  const t = document.getElementById('tg'); let fs = 200; t.setAttribute('font-size', fs);
  fs = fs * 1640 / t.getComputedTextLength(); t.setAttribute('font-size', fs.toFixed(1));
  const ctx = document.createElement('canvas').getContext('2d'); ctx.font = '800 ' + fs + 'px "Funnel Display"';
  const cap = ctx.measureText('H').actualBoundingBoxAscent;
  const SW = 1872, SH = SW * 9 / 16, SY = 40;
  t.setAttribute('y', (SY + .323 * SH + .04 * cap).toFixed(1));
  return fs;
};
</script></body></html>`;
fs.writeFileSync(path.join(here, 'brand-guide.html'), html);

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('file://' + path.join(here, 'brand-guide.html'), { waitUntil: 'networkidle' });
await p.evaluate(() => window.__fit());
await p.waitForTimeout(200);
const secs = await p.$$('section.pg');
for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: path.join(here, `guide-${String(i + 1).padStart(2, '0')}.png`) });
await p.emulateMedia({ media: 'print' });
await p.pdf({ path: path.join(here, 'brand-guide.pdf'), width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log('ok', secs.length, 'stran');
