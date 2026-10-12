/* Generátor nabídek PROOZE – vše běží v prohlížeči, data jen v localStorage (nic se neodesílá). */
(() => {
  'use strict';
  const A = '../../assets/';
  const KEY = 'prooze-nabidka', LIST = 'prooze-nabidky', SEQ = 'prooze-nabidka-seq';
  const $ = (s, r = document) => r.querySelector(s);

  const PHOTOS = [['plech-falc', 'Falcovaný plech'], ['plech-taskova-tabule', 'Plechová tabule'], ['taska-palena-detail', 'Pálená taška'], ['beton-rd', 'Betonová taška'],
    ['pokryvaci-palena', 'Pokládka'], ['rekonstrukce-leseni', 'Rekonstrukce'], ['prefa-sablony', 'Prefa'], ['sindel-chata', 'Šindel'], ['strecha-kontrola', 'Kontrola'],
    ['rd-fve-hero', 'FVE na domě'], ['montaz-fve', 'Montáž FVE'], ['hala-fve', 'FVE na hale'], ['bytovy-dum', 'Bytový dům'], ['stridac-baterie', 'Střídač']];
  const MAKERS = { '': ['Bez loga'], tondach: ['Tondach', 'tondach.svg'], bramac: ['Bramac', 'bramac.svg'], kmbeta: ['KM Beta', 'kmbeta-bez-claimu.svg'],
    comax: ['COMAX', 'comax.svg'], prefa: ['PREFA', 'prefa.svg'], satjam: ['SATJAM', 'satjam.png'] };
  // krytiny: typ → výrobci, barvy (klíč, popis, vzorek) a výchozí body; fotky v assets/img/krytiny/<typ>-<barva>-<okna|bez>.jpg
  const KRYTINY = {
    palena: { n: 'Pálená taška', vyrobci: ['tondach', 'bramac', 'kmbeta'], barvy: [['cervena', 'přírodní červená', '#A34A2E'], ['cerna', 'černá engoba', '#1E1E20']],
      body: 'Keramika s dlouhou životností\nBarva se časem nemění, jen zušlechťuje\nKompletní systém včetně hřebenáčů a větracích tašek' },
    betonova: { n: 'Betonová taška', vyrobci: ['bramac', 'kmbeta'], barvy: [['antracit', 'antracitová', '#383E42'], ['hneda', 'tmavě hnědá', '#3A3330']],
      body: 'Pevná a odolná krytina za rozumnou cenu\nTvarová přesnost, rychlá pokládka\nKompletní systém včetně příslušenství' },
    'plech-taskova': { n: 'Plechová tašková tabule', vyrobci: ['satjam', 'comax'], barvy: [['cerna', 'černá', '#141517']],
      body: 'Vzhled tašek s nízkou hmotností plechu\nŠetrná ke krovu, vhodná i na rekonstrukce\nKompletní systém včetně klempířských prvků' },
    falc: { n: 'Falcovaný plech', vyrobci: ['comax', 'satjam', 'prefa'], barvy: [['cerna', 'černá RAL 9005', '#141517'], ['antracit', 'antracit RAL 7016', '#383E42']],
      body: 'Nízká hmotnost, šetrná ke krovu\nHladký moderní vzhled bez viditelných šroubů\nKompletní systém včetně klempířských prvků' },
    sindel: { n: 'Kanadský šindel', vyrobci: [''], barvy: [['hneda', 'tmavě hnědá', '#4A3B33']],
      body: 'Lehká krytina vhodná i pro členité střechy\nPokládka na celoplošné bednění\nKompletní systém včetně hřebenových pásů' },
    prefa: { n: 'Hliníkové šablony PREFA', vyrobci: ['prefa'], barvy: [['antracit', 'antracit', '#383E42']],
      body: 'Hliník, který nekoroduje a nerezaví\nNízká hmotnost, vhodný i na starší krovy\nKompletní systém včetně odvodnění' },
  };
  const hexDist = (a, b) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const [x, y] = [p(a), p(b)]; return x.reduce((s, v, i) => s + (v - y[i]) ** 2, 0); };
  function defaultKryt(typ = 'falc', vyrobce) {
    const k = KRYTINY[typ], v = vyrobce && k.vyrobci.includes(vyrobce) ? vyrobce : k.vyrobci[0], [b, bt, hex] = k.barvy[0];
    return { ano: true, typ, barva: b, barvaTxt: bt, hex, vyrobce: v, nazev: `${k.n}${v && typ !== 'prefa' ? ' ' + MAKERS[v][0] : ''}`, body: k.body };
  }
  const defaultOkna = () => ({ ano: true, pocet: '2', model: 'VELUX GLU 0061Z MK06', lemovani: 'EDW 2000 MK06', body: 'Montáž včetně napojení na fólii a krytinu' });
  function coverSrc(s) {
    if (s.fotoData) return s.fotoData;
    if (s.foto && s.foto !== 'auto') return `${A}img/web/${s.foto}-1600.jpg`;
    if (s.kryt && s.kryt.ano === false) return `${A}img/web/${s.okna?.ano ? 'rekonstrukce-leseni' : 'rd-fve-hero'}-1600.jpg`;
    const typ = KRYTINY[s.kryt?.typ] ? s.kryt.typ : 'falc', barvy = KRYTINY[typ].barvy;
    const b = barvy.find((x) => x[0] === s.kryt.barva) || (s.kryt.hex ? [...barvy].sort((x, y) => hexDist(x[2], s.kryt.hex) - hexDist(y[2], s.kryt.hex))[0] : barvy[0]);
    return `${A}img/krytiny/${typ}-${b[0]}-${s.okna?.ano ? 'okna' : 'bez'}.jpg`;
  }
  const KRYT_POPIS = { palena: ' (tašky, hřebenáče, koncové a větrací tašky)', betonova: ' (tašky, hřebenáče, koncové a větrací tašky)', 'plech-taskova': ', včetně příslušenství, lišt a zakončení',
    falc: ', včetně příslušenství, lišt a zakončení', prefa: ', včetně příslušenství a lišt', sindel: ' (šindele, hřebenové pásy, podkladní pás)' };
  // je položka vyřazená, protože krytina/okna nejsou součástí zakázky?
  const offItem = (s, x) => (x.link === 'kryt' && s.kryt?.ano === false) || (['okno', 'lem', 'okna'].includes(x.link) && !s.okna?.ano);
  function syncLinked(s) {
    s.items.forEach((x) => {
      if (!x.link || x.manual) return;
      if (x.link === 'kryt' && s.kryt) x.popis = `${s.kryt.nazev}${s.kryt.barvaTxt ? ', ' + s.kryt.barvaTxt : ''}${KRYT_POPIS[s.kryt.typ] || ''}`;
      if (x.link === 'okno' && s.okna) { x.popis = s.okna.model; x.mn = s.okna.pocet; }
      if (x.link === 'lem' && s.okna) { x.popis = `Lemování ${s.okna.lemovani}`; x.mn = s.okna.pocet; }
    });
  }
  function autoSub(s) {
    const k = s.kryt; if (!k || !k.nazev || k.ano === false) return '';
    const n = num(s.okna?.pocet) || 0;
    const okna = s.okna?.ano ? (n === 1 ? ', včetně střešního okna' : `, včetně ${n ? n + ' ' : ''}střešních oken`) : '';
    return `${k.nazev}${k.barvaTxt ? ', ' + k.barvaTxt : ''}${okna}`;
  }
  const SWATCH = [['', 'Bez vzorku barvy'], ['#141517', 'Černá (RAL 9005)'], ['#383E42', 'Antracit (RAL 7016)'], ['#3A3330', 'Tmavě hnědá (RAL 8019)'],
    ['#5E2028', 'Vínová (RAL 3005)'], ['#A34A2E', 'Cihlová'], ['#6F7377', 'Grafit'], ['custom', 'Vlastní barva…']];
  const UNITS = ['m²', 'bm', 'ks', 'kpl', 'm³', 'hod', 'den', 'kWp', 'kWh', 'km'];
  const MESICE = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

  const I = (kat, popis, jed, mn = '', cena = '', link) => (link ? { kat, popis, jed, mn, cena, link } : { kat, popis, jed, mn, cena });
  const TPL = {
    plech: [
      I('Krytina', 'Falcovaný plech COMAX, černá RAL 9005, tl. 0,6 mm, včetně příslušenství, lišt a zakončení', 'm²', '', '', 'kryt'),
      I('Ostatní materiál', 'Střešní latě / rošt (dle systému)', 'm²'), I('Ostatní materiál', 'Difuzní fólie (pojistná hydroizolace)', 'm²'),
      I('Ostatní materiál', 'Kontralatě a upevňovací materiál', 'm²'), I('Ostatní materiál', 'Okapový systém (žlaby, svody, kotlíky, kolena, objímky, háky)', 'bm'),
      I('Ostatní materiál', 'Sněhové zábrany (trubkové)', 'bm'), I('Ostatní materiál', 'Klempířské prvky (lemování komínu, úžlabí, nároží, štítové lišty)', 'kpl'),
      I('Střešní okna', 'VELUX GLU 0061Z MK06 (New Look)', 'ks', '', '', 'okno'), I('Střešní okna', 'VELUX lemování EDW 2000 MK06', 'ks', '', '', 'lem'),
      I('Fólie', 'Tegola Difbar 150S (dle potřeby, u detailů)', 'm²'), I('Stavební materiál', 'Zdivo, malta, těsnicí pásy, penetrace (komín, detaily)', 'kpl'),
      I('Doprava a zařízení stavby', 'Doprava materiálu', 'kpl'), I('Doprava a zařízení stavby', 'Stavební výtah', 'kpl'),
      I('Odpady', 'Kontejner 10 m³, odvoz a likvidace odpadu', 'ks'),
      I('Práce', 'Demontáž stávající krytiny (tašky, latě, fólie, okapový systém)', 'kpl'), I('Práce', 'Montáž nového střešního systému (rošt, fólie, krytina, detaily)', 'kpl'),
      I('Práce', 'Montáž střešních oken včetně lemování', 'kpl', '', '', 'okna'), I('Práce', 'Oplechování komínu a detailů', 'kpl'),
      I('Práce', 'Dořez (úžlabí, nároží, detaily)', 'kpl'), I('Práce', 'Dokončovací práce, těsnění, kontrola, úklid', 'kpl')],
    taska: [
      I('Krytina', 'Pálená taška Tondach, přírodní červená (tašky, hřebenáče, koncové a větrací tašky)', 'm²', '', '', 'kryt'),
      I('Ostatní materiál', 'Příchytky hřebenáčů', 'ks'), I('Ostatní materiál', 'Hřebenový a nárožní pás (role 5 m)', 'ks'), I('Ostatní materiál', 'Ochranný pás proti ptákům (5 m)', 'ks'),
      I('Ostatní materiál', 'Větrací mřížka', 'bm'), I('Ostatní materiál', 'Spojovací materiál (šrouby, vruty, hřebíky)', 'kpl'),
      I('Dřevo', 'Latě 40 × 60 mm, sušené', 'bm'), I('Fólie', 'Tegola Difbar 150S', 'm²'), I('Střešní okna', 'VELUX GLU 0061Z MK06 (New Look)', 'ks', '', '', 'okno'),
      I('Střešní okna', 'VELUX lemování EDW 2000 MK06', 'ks', '', '', 'lem'), I('Střešní okna', 'Střešní výlez', 'ks'),
      I('Klempířský materiál', 'Tabule plech (lemy, štítovky, okapnice)', 'ks'), I('Okapový systém', 'Žlaby, svody, rohy, kotlíky, kolena, objímky, háky', 'bm'),
      I('Stavební materiál', 'Komín: cihly, zdicí malta, lepidlo, perlinka', 'kpl'), I('Doprava a zařízení stavby', 'Doprava materiálu', 'kpl'),
      I('Doprava a zařízení stavby', 'Stavební výtah', 'kpl'), I('Odpady', 'Kontejner 10 m³, odvoz a likvidace odpadu', 'ks'),
      I('Práce', 'Demontáž stávající krytiny', 'kpl'), I('Práce', 'Montáž krytiny', 'kpl'), I('Práce', 'Výroba lemů, štítovek a okapnic', 'kpl'),
      I('Práce', 'Oplechování a oprava komínu', 'kpl'), I('Práce', 'Dořez (úžlabí, nároží)', 'kpl')],
    oprava: [
      I('Práce', 'Prohlídka střechy a nalezení místa zatékání', 'kpl'), I('Práce', 'Výměna poškozených tašek', 'ks'), I('Práce', 'Oprava hřebene a nároží', 'bm'),
      I('Práce', 'Oprava oplechování komínu', 'kpl'), I('Práce', 'Vyčištění žlabů a svodů', 'bm'), I('Materiál', 'Tašky a hřebenáče (dle krytiny)', 'ks'),
      I('Materiál', 'Spojovací a těsnicí materiál', 'kpl'), I('Doprava a zařízení stavby', 'Lešení nebo plošina', 'den'), I('Doprava a zařízení stavby', 'Doprava', 'kpl')],
    fve: [
      I('Fotovoltaika', 'Fotovoltaické panely (výrobce, výkon Wp)', 'ks'), I('Fotovoltaika', 'Hybridní střídač, třífázový', 'ks'), I('Fotovoltaika', 'Bateriové úložiště', 'kWh'),
      I('Fotovoltaika', 'Montážní konstrukce na střechu', 'kpl'), I('Elektro', 'Kabeláž, rozvaděč, jištění, přepěťové ochrany', 'kpl'),
      I('Práce', 'Montáž panelů a konstrukce', 'kpl'), I('Práce', 'Elektroinstalace a zapojení', 'kpl'),
      I('Administrativa', 'Projekt, žádost o připojení k síti, revize', 'kpl'), I('Administrativa', 'Vyřízení úvěru nebo dotace z Nové zelené úsporám', 'kpl'),
      I('Doprava a zařízení stavby', 'Doprava', 'kpl')],
  };
  // Vzorová nabídka (rozpočet podle podkladů PROOZE), aby byl náhled vidět hned
  const DEMO_ITEMS = [
    ['Krytina', 'Falcovaný plech COMAX, černá RAL 9005, tl. 0,6 mm, včetně příslušenství, lišt a zakončení', 'm²', 1802, 285],
    ['Ostatní materiál', 'Střešní latě / rošt (dle systému)', 'm²', 115, 16], ['Ostatní materiál', 'Difuzní fólie (pojistná hydroizolace)', 'm²', 1802, 36],
    ['Ostatní materiál', 'Kontralatě a upevňovací materiál', 'm²', 1802, 28], ['Ostatní materiál', 'Okapový systém COMAX (žlaby, svody, kotlíky, kolena, objímky, háky)', 'bm', 174, 210],
    ['Ostatní materiál', 'Sněhové zábrany (trubkové)', 'bm', 55, 320], ['Ostatní materiál', 'Klempířské prvky (lemování komínu, úžlabí, nároží, štítové lišty)', 'kpl', 1, 24850],
    ['Střešní okna', 'VELUX GLU 0061Z MK06 (New Look)', 'ks', 2, 15666], ['Střešní okna', 'VELUX lemování EDW 2000 MK06', 'ks', 2, 5231],
    ['Fólie', 'Tegola Difbar 150S (dle potřeby, u detailů)', 'm²', 225, 55], ['Stavební materiál', 'Zdivo, malta, těsnicí pásy, penetrace (komín, detaily)', 'kpl', 1, 8646],
    ['Doprava a zařízení stavby', 'Doprava materiálu', 'kpl', 1, 72861], ['Doprava a zařízení stavby', 'Stavební výtah', 'kpl', 1, 11215],
    ['Odpady', 'Kontejner 10 m³, odvoz a likvidace odpadu', 'ks', 2, 55418],
    ['Práce', 'Demontáž stávající krytiny (tašky, latě, fólie, okapový systém)', 'kpl', 1, 79488], ['Práce', 'Montáž nového střešního systému (rošt, fólie, plech COMAX, detaily)', 'kpl', 1, 335635],
    ['Práce', 'Montáž střešních oken včetně lemování', 'kpl', 1, 37250], ['Práce', 'Oplechování komínu a detailů', 'kpl', 1, 18988],
    ['Práce', 'Dořez (úžlabí, nároží, detaily)', 'kpl', 1, 33508], ['Práce', 'Dokončovací práce, těsnění, kontrola, úklid', 'kpl', 1, 23269],
  ].map(([kat, popis, jed, mn, cena]) => ({ kat, popis, jed, mn: String(mn), cena: String(cena) }));

  /* ---------- pomocné ---------- */
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { toast('Místo v prohlížeči je plné. Smažte staré nabídky nebo vlastní fotky.'); return false; } };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // česká typografie: nezlomitelná mezera po jednopísmenných předložkách/spojkách a mezi číslem a jednotkou
  const nb = (s) => s.replace(/(^|[\s(„–])([vkszouaiVKSZOUAI]) /g, '$1$2 ').replace(/(^|[\s(„–])([vkszouaiVKSZOUAI]) /g, '$1$2 ')
    .replace(/(\d) (?=(?:m²|m³|mm|cm|m|bm|ks|kpl|Kč|kWp|kWh|kW|Wp|dní|dnů|dny|týdnů|týdny|let|roky|%|l)(?![\p{L}\d]))/gu, '$1 ')
    .replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ');
  const t = (s) => nb(esc(s));
  const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const num = (v) => { const n = parseFloat(String(v ?? '').replace(/\s| /g, '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const fmt = (n, dec = 2) => n.toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: dec }).replace(/\s/g, ' ');
  const kc = (n) => `${fmt(n)} Kč`;
  const czDate = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return `${d}. ${MESICE[m - 1]} ${y}`; };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const get = (o, path) => path.split('.').reduce((a, k) => (a ? a[k] : undefined), o);
  const set = (o, path, v) => { const ks = path.split('.'); const last = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[last] = v; };

  function nextNo(commit) {
    const y = new Date().getFullYear();
    const s = load(SEQ, { y, n: 0 });
    const n = s.y === y ? s.n + 1 : 1;
    if (commit) store(SEQ, { y, n });
    return `${y}-${String(n).padStart(3, '0')}`;
  }

  function blank() {
    return {
      v: 2, id: uid(), stav: 'rozpracovana', layout: 'foto', foto: 'auto', fotoData: '', cislo: '', datum: today(), platnost: 30,
      nazev: '', podtitul: '', zak: { jmeno: '', telefon: '', email: '', adresa: '' }, stavba: '',
      fakta: [{ k: 'Zahájení', v: '' }, { k: 'Doba realizace', v: '' }, { k: 'Plocha střechy', v: '' }], cenaNahore: true,
      uvod: '', kryt: defaultKryt(), okna: defaultOkna(), prods: [],
      items: [I('', '', 'kpl')], dph: '12', sleva: '', mezisoucty: false,
      shrnuti: '', podminky: 'Záloha 30 % při podpisu smlouvy, doplatek po předání díla. Termín zahájení potvrdíme ve smlouvě.',
      podpis: { jmeno: 'Pavel Kočí', role: 'majitel', telefon: '773 898 698', email: 'info@prooze.cz' },
    };
  }
  function demo() {
    return Object.assign(blank(), {
      nazev: 'Kompletní rekonstrukce střechy', podtitul: '',
      fakta: [{ k: 'Zahájení', v: 'do 3 týdnů od podpisu' }, { k: 'Doba realizace', v: 'cca 14 dní' }, { k: 'Plocha střechy', v: '' }],
      uvod: 'Děkujeme za zájem a za čas na prohlídce. Podle zaměření posíláme nabídku na kompletní rekonstrukci střechy: demontáž staré krytiny, novou skladbu s plechem COMAX, dvě střešní okna a odvoz odpadu.',
      items: DEMO_ITEMS.map((x) => ({ ...x })),
      shrnuti: 'Demontáž stávající krytiny, odvoz a likvidace odpadu\nNová skladba střechy: latě, kontralatě, difuzní fólie\nDodávka a montáž plechu COMAX včetně klempířských prvků\nDodávka a montáž 2 střešních oken VELUX s lemováním\nDoprava materiálu a stavební výtah',
    });
  }

  // starší uložené nabídky (v1) → krytina a okna jako samostatné volby
  function migrate(s) {
    if (s && s.v === 1) {
      s.kryt = defaultKryt(); s.okna = defaultOkna(); s.foto = 'auto'; s.podtitul = s.podtitul || '';
      s.prods = (s.prods || []).filter((p) => !/krytina|okna/i.test(p.nadpis || ''));
      s.v = 2;
    }
    return s;
  }
  let S = migrate(load(KEY, null));
  if (S && S.v !== 2) S = null;

  /* ---------- výpočty ---------- */
  function totals(s) {
    const rows = s.items.map((x) => (offItem(s, x) ? 0 : num(x.mn) * num(x.cena)));
    const sum = rows.reduce((a, b) => a + b, 0);
    const sleva = Math.min(100, Math.max(0, num(s.sleva)));
    const slevaKc = sum * sleva / 100;
    const zaklad = sum - slevaKc;
    const rate = s.dph === '12' || s.dph === '21' ? Number(s.dph) : 0;
    const dphKc = zaklad * rate / 100;
    return { rows, sum, sleva, slevaKc, zaklad, rate, dphKc, celkem: zaklad + dphKc };
  }
  const priceLabel = (s, tt) => (tt.rate ? 's DPH' : s.dph === '0' ? 'bez DPH' : '');

  /* ---------- dokument ---------- */
  const ICONS = {
    cal: '<path d="M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.8v4.6l3 2"/>',
    area: '<path d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15"/>',
    shield: '<path d="M12 3.5 19 6v5.5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z"/><path d="m9 12 2.2 2.2L15.3 10"/>',
    price: '<path d="M3.8 12.6 12.2 4.2h7.6v7.6l-8.4 8.4z"/><circle cx="15.6" cy="8.4" r="1.3"/>',
    house: '<path d="M3.5 11.5 12 4l8.5 7.5M6 10v9.5h12V10"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  };
  const iconFor = (label) => {
    const l = label.toLowerCase();
    if (/zah[aá]j|term[ií]n|datum|nástup/.test(l)) return 'cal';
    if (/doba|trv|dn[ií]|délka/.test(l)) return 'clock';
    if (/plocha|rozm|výměr|m²/.test(l)) return 'area';
    if (/z[aá]ruk/.test(l)) return 'shield';
    if (/cena|k[čc]|úvěr|dotac/.test(l)) return 'price';
    if (/dům|objekt|stavb|střech/.test(l)) return 'house';
    return 'check';
  };
  const badge = (label, value, sun) => `<div class="d-badge${sun ? ' d-badge--sun' : ''}"><span class="d-badge__ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[sun ? 'price' : iconFor(label)]}</svg></span><span class="d-badge__t"><small>${t(label)}</small><b>${sun ? value : t(value)}</b></span></div>`;
  const ph = (v, text) => (v ? t(v) : `<span class="ph">${text}</span>`);


  function renderDoc(s) {
    const tt = totals(s);
    const L = s.layout;
    const meta = `<p class="d-meta"><b>Cenová nabídka č.&nbsp;${esc(s.cislo)}</b><br>${czDate(s.datum)}</p>`;
    const badges = s.fakta.filter((f) => f.k && f.v).map((f) => badge(f.k, f.v));
    if (s.cenaNahore && tt.sum > 0) badges.push(badge(`Cena díla${priceLabel(s, tt) ? ' ' + priceLabel(s, tt) : ''}`, kc(tt.celkem), true));
    const badgeRow = badges.length ? `<div class="d-badges">${badges.join('')}</div>` : '';
    const sub = s.podtitul || autoSub(s);
    const title = `<h1>${ph(s.nazev, 'Název nabídky')}</h1>${sub ? `<p class="d-sub">${t(sub)}</p>` : ''}`;
    const head = L === 'foto'
      ? `<header class="d-cover"><img class="d-cover__img" src="${coverSrc(s)}" alt=""><div class="d-cover__bar"><img class="d-logo" src="${A}brand/logo-bila.svg" alt="PROOZE">${meta}</div><div class="d-cover__txt">${title}${badgeRow}</div></header>`
      : `<header class="d-head"><div class="d-head__brand"><img class="d-logo" src="${A}brand/logo.svg" alt="PROOZE"><span>Pokrývači, kteří umí i&nbsp;fotovoltaiku</span></div>${meta}</header>`;

    const kde = s.stavba || s.zak.adresa;
    const parties = `<section class="d-parties">
      <div><h3>Pro</h3><p>${s.zak.jmeno ? `<b>${t(s.zak.jmeno)}</b>` : '<span class="ph">Jméno zákazníka</span>'}${s.zak.adresa ? '<br>' + t(s.zak.adresa) : ''}${s.zak.telefon ? '<br>' + t(s.zak.telefon) : ''}${s.zak.email ? '<br>' + t(s.zak.email) : ''}</p></div>
      <div><h3>Místo stavby</h3><p>${ph(kde, 'Adresa stavby')}</p></div>
      <div><h3>Připravil</h3><p><b>${t(s.podpis.jmeno)}</b>${s.podpis.role ? ', ' + t(s.podpis.role) : ''}<br>${t(s.podpis.telefon)}<br>${t(s.podpis.email)}</p></div></section>`;

    const k = s.kryt, o = s.okna;
    const prods = [
      k && k.ano !== false && k.nazev ? { nadpis: 'Střešní krytina', nazev: k.nazev, vyrobce: k.vyrobce, barva: k.barvaTxt, hex: k.hex, body: k.body } : null,
      o && o.ano && o.model ? { nadpis: 'Střešní okna', nazev: `${num(o.pocet) ? fmt(num(o.pocet)) + '× ' : ''}${o.model}`, vyrobce: '', barva: '', hex: '', body: [o.lemovani ? `Lemování ${o.lemovani}` : '', o.body].filter(Boolean).join('\n') } : null,
      ...s.prods.filter((p) => p.nazev || p.img),
    ].filter(Boolean);
    const prodHtml = prods.length ? `<section class="d-sec d-prods d-prods--${Math.min(prods.length, 3)}">${prods.map((p) => {
      const m = MAKERS[p.vyrobce];
      const logo = p.img ? `<img class="d-prod__img" src="${p.img}" alt="">` : m && m[1] ? `<img class="d-prod__logo" src="${A}brands/${m[1]}" alt="${m[0]}">` : '';
      const color = p.barva || p.hex ? `<p class="d-prod__color">${p.hex ? `<i class="sw" style="background:${esc(p.hex)}"></i>` : ''}${t(p.barva)}</p>` : '';
      const body = lines(p.body);
      return `<article class="d-prod"><div class="d-prod__top"><div><p class="d-prod__k">${t(p.nadpis)}</p><h3 class="d-prod__n">${t(p.nazev)}</h3></div>${logo}</div>${color}${body.length ? `<ul>${body.map((b) => `<li>${t(b)}</li>`).join('')}</ul>` : ''}</article>`;
    }).join('')}</section>` : '';

    // rozpočet seskupený podle kategorií (v pořadí prvního výskytu)
    const groups = [];
    s.items.forEach((x, i) => {
      if ((!x.popis && !num(x.cena)) || offItem(s, x)) return;
      const k = x.kat || 'Ostatní';
      let g = groups.find((y) => y.k === k);
      if (!g) groups.push(g = { k, rows: [], sum: 0 });
      g.rows.push([x, tt.rows[i]]); g.sum += tt.rows[i];
    });
    const tbody = groups.map((g) => `<tbody><tr class="d-cat"><th colspan="4" scope="colgroup">${t(g.k)}</th><td class="r">${s.mezisoucty ? kc(g.sum) : ''}</td></tr>${g.rows.map(([x, total]) => `<tr><td>${t(x.popis)}</td><td class="r">${x.mn !== '' ? fmt(num(x.mn)) : ''}</td><td>${esc(x.jed)}</td><td class="r">${x.cena !== '' ? kc(num(x.cena)) : ''}</td><td class="r"><b>${kc(total)}</b></td></tr>`).join('')}</tbody>`).join('');
    const totRows = [];
    if (tt.sleva) totRows.push(['Součet položek', kc(tt.sum)], [`Sleva ${fmt(tt.sleva)} %`, '− ' + kc(tt.slevaKc)]);
    if (tt.rate) totRows.push(['Základ DPH', kc(tt.zaklad)], [`DPH ${tt.rate} %`, kc(tt.dphKc)]);
    const finalLabel = tt.rate ? 'Cena díla celkem s DPH' : s.dph === '0' ? 'Cena díla celkem bez DPH' : 'Cena díla celkem';
    const budget = groups.length ? `<section class="d-sec d-budget"><h2 class="d-h">Položkový rozpočet</h2>
      <table class="d-tbl"><colgroup><col><col style="width:15mm"><col style="width:11mm"><col style="width:25mm"><col style="width:28mm"></colgroup>
      <thead><tr><th scope="col">Položka</th><th class="r" scope="col">Množství</th><th scope="col">Jedn.</th><th class="r" scope="col">Cena za jedn.</th><th class="r" scope="col">Celkem</th></tr></thead>${tbody}</table>
      <div class="d-tot">${totRows.length ? `<div class="d-tot__rows">${totRows.map(([a, b]) => `<p><span>${a}</span><b>${b}</b></p>`).join('')}</div>` : ''}
      <div class="d-tot__final"><span>${finalLabel}</span><b>${kc(tt.celkem)}</b></div>
      ${s.dph === 'neplatce' ? '<p class="d-tot__note">Nejsme plátci DPH.</p>' : ''}</div></section>` : '';

    const sh = lines(s.shrnuti);
    const end = sh.length || s.podminky ? `<section class="d-sec d-end">${sh.length ? `<div><h2 class="d-h">Co je v&nbsp;ceně</h2><ul class="d-check">${sh.map((b) => `<li>${t(b)}</li>`).join('')}</ul></div>` : '<div></div>'}
      ${s.podminky ? `<div><h2 class="d-h">Podmínky</h2>${lines(s.podminky).map((p) => `<p>${t(p)}</p>`).join('')}</div>` : ''}</section>` : '';

    const platnost = s.datum && num(s.platnost) ? `Nabídka platí do ${czDate(addDays(s.datum, num(s.platnost)))}.` : '';
    const sign = `<section class="d-sign"><div><p class="d-sign__lead">Těšíme se na spolupráci.</p><p>${platnost} Rádi ji s&nbsp;vámi projdeme položku po položce.</p></div>
      <div class="d-sign__who"><img src="${A}brand/symbol.svg" alt=""><p><b>${t(s.podpis.jmeno)}</b>${s.podpis.role ? '<br>' + t(s.podpis.role) + ', PROOZE' : '<br>PROOZE'}<br>${t(s.podpis.telefon)} · ${t(s.podpis.email)}</p></div></section>`;

    return `${head}${L !== 'foto' ? `<section class="d-title">${title}</section>${badgeRow}` : ''}${parties}
      ${s.uvod ? `<p class="d-intro">${t(s.uvod)}</p>` : ''}${prodHtml}${budget}${end}${sign}`;
  }

  /* ---------- editor ---------- */
  const docEl = $('[data-doc]'), fit = $('[data-fit]'), scroller = $('.pv__scroll');
  let raf = 0;
  function refresh() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      syncLinked(S);
      docEl.className = `doc doc--${S.layout}`;
      docEl.innerHTML = renderDoc(S);
      const tt = totals(S);
      $('[data-sum]').textContent = tt.sum ? `${kc(tt.celkem)}${priceLabel(S, tt) ? ' ' + priceLabel(S, tt) : ''}` : '';
      updateTotalsInEditor(tt);
      fitDoc();
      store(KEY, S);
    });
  }
  function fitDoc() {
    if (document.body.dataset.view !== 'edit') return;
    const w = scroller.clientWidth - 48;
    const z = Math.min(1, w / 793.7); // A4 = 210 mm
    fit.style.zoom = z;
    // přibližný počet stran (první strana bez horního okraje: 281 mm obsahu, další 267 mm)
    const mm = docEl.getBoundingClientRect().height / z / 3.7795;
    const pages = mm <= 281 ? 1 : 1 + Math.ceil((mm - 281) / 267);
    docEl.querySelectorAll('.pg').forEach((x) => x.remove());
    for (let p = 1, y = 281; p < pages; p++, y += 267) docEl.insertAdjacentHTML('beforeend', `<i class="pg" style="top:${y}mm"><span>strana ${p + 1}</span></i>`);
    $('[data-pages]').textContent = `Náhled A4 · cca ${pages} ${pages === 1 ? 'strana' : pages < 5 ? 'strany' : 'stran'}`;
  }
  addEventListener('resize', fitDoc);

  function bindFields() {
    document.querySelectorAll('[data-k]').forEach((el) => {
      const k = el.dataset.k, v = get(S, k);
      if (el.type === 'checkbox') el.checked = !!v; else el.value = v ?? '';
    });
    document.querySelectorAll('input[name="layout"]').forEach((r) => { r.checked = r.value === S.layout; });
    renderKryt(); renderPhotos(); renderFacts(); renderProds(); renderItems();
    $('[data-k="podtitul"]').placeholder = autoSub(S) || 'Krátce, co nabízíte';
  }
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.k) {
      set(S, el.dataset.k, el.type === 'checkbox' ? el.checked : el.value);
      if (el.dataset.k === 'kryt.vyrobce') { S.kryt.nazev = `${KRYTINY[S.kryt.typ].n}${S.kryt.vyrobce && S.kryt.typ !== 'prefa' ? ' ' + MAKERS[S.kryt.vyrobce][0] : ''}`; $('[data-k="kryt.nazev"]').value = S.kryt.nazev; }
      if (el.dataset.k.startsWith('kryt.') || el.dataset.k.startsWith('okna.')) { $('[data-okna-fields]').hidden = !S.okna.ano; $('[data-k="podtitul"]').placeholder = autoSub(S) || ''; renderPhotos(); syncLinked(S); updateLinkedRows(); }
      refresh(); return;
    }
    if (el.name === 'layout') { S.layout = el.value; renderPhotos(); refresh(); }
  });
  document.addEventListener('change', (e) => { if (e.target.dataset.k && e.target.type === 'checkbox') { set(S, e.target.dataset.k, e.target.checked); $('[data-okna-fields]').hidden = !S.okna.ano; $('[data-kryt-fields]').hidden = S.kryt.ano === false; renderPhotos(); renderItems(); refresh(); } });
  // přepsat jen propojené řádky v editoru (bez ztráty fokusu v ostatních polích)
  function updateLinkedRows() {
    document.querySelectorAll('[data-item]').forEach((row) => {
      const x = S.items[row.dataset.item]; if (!x || !x.link || x.manual) return;
      row.querySelector('[data-if="popis"]').value = x.popis; row.querySelector('[data-if="mn"]').value = x.mn;
    });
  }

  // fotky (jen layout s fotkou)
  function renderPhotos() {
    const box = $('[data-photos]');
    box.hidden = S.layout !== 'foto';
    const auto = { ...S, foto: 'auto', fotoData: '' };
    box.innerHTML = `<button type="button" class="ph-btn ph-btn--auto${!S.fotoData && S.foto === 'auto' ? ' is-on' : ''}" data-photo="auto" title="Podle zvolené krytiny a oken"><img src="${coverSrc(auto)}" alt=""><span>Podle krytiny</span></button>`
      + PHOTOS.map(([k, n]) => `<button type="button" class="ph-btn${!S.fotoData && S.foto === k ? ' is-on' : ''}" data-photo="${k}" title="${n}"><img src="${A}img/web/${k}-800.webp" alt="${n}" loading="lazy"></button>`).join('')
      + `<label class="ph-btn ph-btn--up${S.fotoData ? ' is-on' : ''}" title="Vlastní fotka">${S.fotoData ? `<img src="${S.fotoData}" alt="">` : '<span>Vlastní<br>fotka</span>'}<input type="file" accept="image/*" data-upload="foto" hidden></label>`;
  }
  $('[data-photos]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-photo]');
    if (!b) return;
    S.foto = b.dataset.photo; S.fotoData = ''; renderPhotos(); refresh();
  });

  // krytina: typ, barva, výrobce
  function renderKryt() {
    const k = S.kryt, def = KRYTINY[k.typ];
    $('[data-kryt-typ]').innerHTML = Object.entries(KRYTINY).map(([key, x]) => `<button type="button" class="chip${key === k.typ ? ' is-on' : ''}" data-typ="${key}">${x.n}</button>`).join('');
    $('[data-kryt-barvy]').innerHTML = def.barvy.map(([b, bt, hex]) => `<button type="button" class="swb${b === k.barva ? ' is-on' : ''}" data-barva="${b}" title="${bt}"><i style="background:${hex}"></i>${bt}</button>`).join('')
      + `<label class="swb${!k.barva ? ' is-on' : ''}" title="Jiná barva (fotka se vybere podle nejbližší)"><input type="color" data-kryt-hex value="${esc(k.hex || '#141517')}">Jiná barva</label>`;
    const sel = $('[data-k="kryt.vyrobce"]');
    sel.innerHTML = Object.entries(MAKERS).map(([key, [n]]) => `<option value="${key}"${key === k.vyrobce ? ' selected' : ''}>${n}${def.vyrobci.includes(key) && key ? ' ✓' : ''}</option>`).join('');
    $('[data-okna-fields]').hidden = !S.okna.ano;
    $('[data-kryt-fields]').hidden = S.kryt.ano === false;
  }
  $('[data-kryt-typ]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-typ]'); if (!b) return;
    S.kryt = defaultKryt(b.dataset.typ, S.kryt.vyrobce);
    bindFields(); refresh();
  });
  $('[data-kryt-barvy]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-barva]'); if (!b) return;
    const [key, bt, hex] = KRYTINY[S.kryt.typ].barvy.find((x) => x[0] === b.dataset.barva);
    Object.assign(S.kryt, { barva: key, barvaTxt: bt, hex });
    bindFields(); refresh();
  });
  $('[data-kryt-barvy]').addEventListener('input', (e) => {
    if (!e.target.matches('[data-kryt-hex]')) return;
    S.kryt.hex = e.target.value; S.kryt.barva = '';
    $('[data-kryt-barvy]').querySelectorAll('.swb').forEach((x) => x.classList.toggle('is-on', x.contains(e.target)));
    renderPhotos(); refresh();
  });

  // přehled nahoře
  function renderFacts() {
    while (S.fakta.length < 4) S.fakta.push({ k: '', v: '' });
    $('[data-facts]').innerHTML = S.fakta.slice(0, 4).map((f, i) => `<div class="fact"><input data-fact="${i}" data-f="k" value="${esc(f.k)}" placeholder="Popisek, např. Zahájení"><input data-fact="${i}" data-f="v" value="${esc(f.v)}" placeholder="Hodnota, např. do 3 týdnů"></div>`).join('');
  }
  $('[data-facts]').addEventListener('input', (e) => { const el = e.target; S.fakta[el.dataset.fact][el.dataset.f] = el.value; refresh(); });

  // materiály
  function renderProds() {
    $('[data-prods]').innerHTML = S.prods.map((p, i) => {
      const custom = p.hex && !SWATCH.some(([h]) => h === p.hex);
      return `<div class="prod" data-prod="${i}">
        <div class="row2"><label class="f"><span>Nadpis</span><input data-pf="nadpis" value="${esc(p.nadpis)}" placeholder="Střešní krytina"></label>
        <label class="f"><span>Výrobce (logo)</span><select data-pf="vyrobce">${Object.entries(MAKERS).map(([k, [n]]) => `<option value="${k}"${p.vyrobce === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div>
        <label class="f"><span>Název</span><input data-pf="nazev" value="${esc(p.nazev)}" placeholder="Falcovaný plech COMAX"></label>
        <div class="row2"><label class="f"><span>Barva</span><input data-pf="barva" value="${esc(p.barva)}" placeholder="černá RAL 9005"></label>
        <label class="f"><span>Vzorek barvy</span><span class="swrow"><select data-pf="hexsel">${SWATCH.map(([h, n]) => `<option value="${h}"${(custom ? 'custom' : p.hex) === h ? ' selected' : ''}>${n}</option>`).join('')}</select>${custom || p.hexCustom ? `<input type="color" data-pf="hex" value="${esc(p.hex || '#141517')}">` : ''}</span></label></div>
        <label class="f"><span>Body <em>každý řádek = jeden bod</em></span><textarea rows="3" data-pf="body">${esc(p.body)}</textarea></label>
        <div class="prod__foot"><label class="b b--line b--s">${p.img ? 'Změnit obrázek' : 'Vlastní logo / foto'}<input type="file" accept="image/*" data-upload="prod" hidden></label>${p.img ? '<button type="button" class="b b--ghost b--s" data-pact="noimg">Odebrat obrázek</button>' : ''}<button type="button" class="b b--ghost b--s b--danger" data-pact="del">Smazat</button></div></div>`;
    }).join('');
  }
  $('[data-prods]').addEventListener('input', (e) => {
    const el = e.target, box = el.closest('[data-prod]');
    if (!box || !el.dataset.pf) return;
    const p = S.prods[box.dataset.prod];
    if (el.dataset.pf === 'hexsel') { if (el.value === 'custom') { p.hexCustom = true; p.hex = p.hex || '#141517'; } else { p.hexCustom = false; p.hex = el.value; } renderProds(); }
    else p[el.dataset.pf] = el.value;
    refresh();
  });
  $('[data-prods]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pact]'); if (!b) return;
    const i = +b.closest('[data-prod]').dataset.prod;
    if (b.dataset.pact === 'del') S.prods.splice(i, 1); else S.prods[i].img = '';
    renderProds(); refresh();
  });

  // položky rozpočtu
  function renderItems() {
    const kats = [...new Set(S.items.map((x) => x.kat).filter(Boolean).concat(['Krytina', 'Ostatní materiál', 'Klempířské prvky', 'Střešní okna', 'Doprava a zařízení stavby', 'Odpady', 'Práce']))];
    syncLinked(S);
    $('[data-items]').innerHTML = `<datalist id="kats">${kats.map((k) => `<option value="${esc(k)}">`).join('')}</datalist>` + S.items.map((x, i) => `<div class="it${offItem(S, x) ? ' it--off' : ''}${x.link && !x.manual ? ' it--link' : ''}" data-item="${i}" title="${offItem(S, x) ? 'Není v součtu: ' + (x.link === 'kryt' ? 'krytina' : 'okna') + ' nejsou součástí zakázky' : x.link && !x.manual ? 'Propojeno s volbou ' + (x.link === 'kryt' ? 'krytiny' : 'oken') + ' nahoře' : ''}">
      <input class="it__kat" list="kats" data-if="kat" value="${esc(x.kat)}" placeholder="Skupina" aria-label="Skupina">
      <textarea class="it__popis" rows="1" data-if="popis" placeholder="Popis položky" aria-label="Popis">${esc(x.popis)}</textarea>
      <input class="it__mn" inputmode="decimal" data-if="mn" value="${esc(x.mn)}" placeholder="Množ." aria-label="Množství">
      <select class="it__jed" data-if="jed" aria-label="Jednotka">${UNITS.map((u) => `<option${u === x.jed ? ' selected' : ''}>${u}</option>`).join('')}</select>
      <input class="it__cena" inputmode="decimal" data-if="cena" value="${esc(x.cena)}" placeholder="Kč / jedn." aria-label="Cena za jednotku">
      <output class="it__sum" data-isum>${num(x.mn) * num(x.cena) ? kc(num(x.mn) * num(x.cena)) : '–'}</output>
      <span class="it__act"><button type="button" data-iact="up" title="Nahoru" aria-label="Posunout nahoru">↑</button><button type="button" data-iact="down" title="Dolů" aria-label="Posunout dolů">↓</button><button type="button" data-iact="dup" title="Duplikovat" aria-label="Duplikovat">⧉</button><button type="button" data-iact="del" title="Smazat" aria-label="Smazat">×</button></span></div>`).join('');
    autosize();
  }
  function autosize() { document.querySelectorAll('.it__popis').forEach((ta) => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }); }
  function updateTotalsInEditor() {
    document.querySelectorAll('[data-item]').forEach((row) => {
      const x = S.items[row.dataset.item]; if (!x) return;
      const v = num(x.mn) * num(x.cena);
      row.querySelector('[data-isum]').textContent = v ? kc(v) : '–';
    });
  }
  const itemsBox = $('[data-items]');
  itemsBox.addEventListener('input', (e) => {
    const el = e.target, row = el.closest('[data-item]');
    if (!row || !el.dataset.if) return;
    const it = S.items[row.dataset.item];
    it[el.dataset.if] = el.value;
    if (it.link && (el.dataset.if === 'popis' || el.dataset.if === 'mn')) { it.manual = true; row.classList.remove('it--link'); }
    if (el.tagName === 'TEXTAREA') { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
    refresh();
  });
  itemsBox.addEventListener('keydown', (e) => {
    // Enter v ceně = nová položka pod
    if (e.key === 'Enter' && e.target.dataset.if === 'cena') { e.preventDefault(); const i = +e.target.closest('[data-item]').dataset.item; addItem(i + 1, S.items[i].kat); }
  });
  itemsBox.addEventListener('click', (e) => {
    const b = e.target.closest('[data-iact]'); if (!b) return;
    const i = +b.closest('[data-item]').dataset.item, it = S.items;
    if (b.dataset.iact === 'del') it.splice(i, 1);
    if (b.dataset.iact === 'dup') it.splice(i + 1, 0, { ...it[i] });
    if (b.dataset.iact === 'up' && i > 0) [it[i - 1], it[i]] = [it[i], it[i - 1]];
    if (b.dataset.iact === 'down' && i < it.length - 1) [it[i + 1], it[i]] = [it[i], it[i + 1]];
    if (!it.length) it.push(I('', '', 'kpl'));
    renderItems(); refresh();
  });
  function addItem(at = S.items.length, kat = S.items.at(-1)?.kat || '') {
    S.items.splice(at, 0, I(kat, '', 'kpl'));
    renderItems(); refresh();
    const row = itemsBox.querySelector(`[data-item="${at}"] .it__popis`); if (row) row.focus();
  }

  /* ---------- obrázky (zmenšené, ať se vejdou do prohlížeče) ---------- */
  function readImage(file, max, cb) {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const png = /png|svg/.test(file.type);
        cb(c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.85));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (!el.dataset.upload || !el.files[0]) return;
    if (el.dataset.upload === 'foto') readImage(el.files[0], 2000, (d) => { S.fotoData = d; renderPhotos(); refresh(); });
    if (el.dataset.upload === 'prod') { const i = +el.closest('[data-prod]').dataset.prod; readImage(el.files[0], 700, (d) => { S.prods[i].img = d; renderProds(); refresh(); }); }
  });

  /* ---------- ukládání, přehled nabídek a šablony ---------- */
  const TPLKEY = 'prooze-sablony';
  const STAVY = { rozpracovana: 'Rozpracovaná', odeslana: 'Odeslaná', prijata: 'Přijatá', odmitnuta: 'Odmítnutá' };
  const listAll = () => load(LIST, []);
  const tplAll = () => load(TPLKEY, []);
  const copyItems = (k) => TPL[k].map((x) => ({ ...x }));
  const SHR = {
    plech: 'Demontáž stávající krytiny, odvoz a likvidace odpadu\nNová skladba střechy: latě, kontralatě, difuzní fólie\nDodávka a montáž plechové krytiny včetně klempířských prvků\nDodávka a montáž střešních oken s lemováním\nDoprava materiálu a stavební výtah',
    taska: 'Demontáž stávající krytiny, odvoz a likvidace odpadu\nNové latě a pojistná difuzní fólie\nDodávka a montáž tašek včetně hřebenáčů a větracích prvků\nKlempířské prvky a oplechování komínu\nDoprava materiálu a stavební výtah',
    oprava: 'Nalezení příčiny zatékání\nOprava poškozených míst a výměna tašek\nKontrola oplechování a žlabů',
    fve: 'Návrh výkonu a baterie podle vaší spotřeby\nDodávka a montáž panelů, střídače a baterie\nElektroinstalace, revize a žádost o připojení k síti\nVyřízení úvěru nebo dotace z Nové zelené úsporám',
  };
  const BUILTIN = {
    plech: { n: 'Rekonstrukce – plech', d: 'Falcovaný plech, střešní okna, celý rozpočet', make: () => ({ nazev: 'Kompletní rekonstrukce střechy', kryt: defaultKryt('falc', 'comax'), okna: defaultOkna(), items: copyItems('plech'), shrnuti: SHR.plech }) },
    taska: { n: 'Rekonstrukce – taška', d: 'Pálená taška, střešní okna, celý rozpočet', make: () => ({ nazev: 'Kompletní rekonstrukce střechy', kryt: defaultKryt('palena', 'tondach'), okna: defaultOkna(), items: copyItems('taska'), shrnuti: SHR.taska }) },
    oprava: { n: 'Oprava střechy', d: 'Menší zakázka, kompaktně na 1 stranu', make: () => ({ layout: 'kompakt', nazev: 'Oprava střechy', kryt: defaultKryt('palena', 'tondach'), okna: { ...defaultOkna(), ano: false }, items: copyItems('oprava'), shrnuti: SHR.oprava, fakta: [{ k: 'Termín', v: '' }, { k: 'Doba opravy', v: '' }, { k: '', v: '' }] }) },
    fve: { n: 'Fotovoltaika', d: 'Elektrárna s baterií, úvěr NZÚ', make: () => ({ nazev: 'Fotovoltaická elektrárna pro váš dům', foto: 'rd-fve-hero', kryt: { ...defaultKryt(), ano: false }, okna: { ...defaultOkna(), ano: false },
      prods: [{ nadpis: 'Fotovoltaika', nazev: 'Elektrárna s bateriovým úložištěm', vyrobce: '', barva: '', hex: '', body: 'Panely, hybridní střídač a baterie\nMonitoring výroby v mobilu\nŽádost o připojení a revize v ceně', img: '' }],
      items: copyItems('fve'), shrnuti: SHR.fve, fakta: [{ k: 'Výkon', v: '' }, { k: 'Baterie', v: '' }, { k: 'Doba realizace', v: '' }] }) },
  };

  function newOffer(partial = {}) {
    const s = migrate(Object.assign(blank(), JSON.parse(JSON.stringify(partial))));
    Object.assign(s, { id: uid(), cislo: nextNo(true), datum: today(), stav: 'rozpracovana', zak: { jmeno: '', telefon: '', email: '', adresa: '' }, stavba: '' });
    return s;
  }
  const entry = (s) => ({ id: s.id, cislo: s.cislo, nazev: s.nazev, zak: s.zak.jmeno, celkem: totals(s).celkem, dph: s.dph, stav: s.stav || 'rozpracovana', datum: s.datum, platnost: s.platnost, upraveno: new Date().toISOString(), data: s });
  function saveCurrent(quiet) {
    if (!S) return;
    const all = listAll().filter((x) => x.id !== S.id);
    all.unshift(entry(S));
    if (store(LIST, all) && !quiet) toast(`Nabídka ${S.cislo} je uložená.`);
  }
  const expired = (x) => x.datum && num(x.platnost) && addDays(x.datum, num(x.platnost)) < today();

  // přehled
  let filtr = '', hledat = '';
  const tplCard = (id, name, desc, img, own) => `<article class="tpl"><button type="button" class="tpl__main" data-new="${id}"><span class="tpl__img"><img src="${img}" alt="" loading="lazy"></span><b>${esc(name)}</b><small>${esc(desc)}</small></button>${own ? `<button type="button" class="tpl__del" data-deltpl="${id.slice(2)}" aria-label="Smazat šablonu ${esc(name)}">×</button>` : ''}</article>`;
  function renderBoard() {
    const all = listAll();
    const st = (x) => x.stav || 'rozpracovana';
    const cnt = (k) => all.filter((x) => st(x) === k).length;
    const sum = (k) => all.filter((x) => st(x) === k).reduce((a, x) => a + (x.celkem || 0), 0);
    $('[data-stats]').innerHTML = [['Rozpracované', cnt('rozpracovana'), ''], ['Odeslané, čekají na odpověď', cnt('odeslana'), sum('odeslana') ? kc(sum('odeslana')) + ' ve hře' : ''],
      ['Přijaté', cnt('prijata'), sum('prijata') ? kc(sum('prijata')) + ' získáno' : ''], ['Odmítnuté', cnt('odmitnuta'), '']]
      .map(([k, n, v]) => `<div class="st"><span>${k}</span><b>${n}</b><small>${v || '&nbsp;'}</small></div>`).join('');
    $('[data-tpls]').innerHTML = Object.entries(BUILTIN).map(([k, x]) => tplCard('b:' + k, x.n, x.d, coverSrc({ foto: 'auto', ...x.make() }))).join('')
      + tplAll().map((x) => tplCard('o:' + x.id, x.nazev, 'Vlastní šablona', coverSrc(x.data), true)).join('');
    $('[data-filtr]').innerHTML = [['', 'Vše', all.length], ...Object.entries(STAVY).map(([k, n]) => [k, n, cnt(k)])]
      .map(([k, n, c]) => `<button type="button" class="chip${filtr === k ? ' is-on' : ''}" data-f="${k}">${n} <span>${c}</span></button>`).join('');
    const q = hledat.trim().toLowerCase();
    const rows = all.filter((x) => (!filtr || st(x) === filtr) && (!q || [x.cislo, x.nazev, x.zak].join(' ').toLowerCase().includes(q)));
    $('[data-offers]').innerHTML = rows.length ? rows.map((x) => {
      const prop = st(x) === 'odeslana' && expired(x);
      return `<li class="of">
        <button type="button" class="of__main" data-open="${x.id}"><b class="of__no">${esc(x.cislo)}</b><span class="of__n">${esc(x.nazev || 'Bez názvu')}</span><span class="of__z">${esc(x.zak || 'bez zákazníka')}</span></button>
        <span class="of__sum">${kc(x.celkem || 0)}</span>
        <span class="of__d">${czDate(x.datum)}${prop ? '<em>platnost vypršela</em>' : ''}</span>
        <select class="of__st of__st--${st(x)}" data-stav="${x.id}" aria-label="Stav nabídky ${esc(x.cislo)}">${Object.entries(STAVY).map(([k, n]) => `<option value="${k}"${k === st(x) ? ' selected' : ''}>${n}</option>`).join('')}</select>
        <span class="of__act"><button type="button" class="b b--ghost b--s" data-copy="${x.id}">Kopie</button><button type="button" class="b b--ghost b--s b--danger" data-del="${x.id}">Smazat</button></span></li>`;
    }).join('') : `<li class="of of--empty">${all.length ? 'Nic neodpovídá hledání.' : 'Zatím žádné nabídky. Začněte šablonou nahoře.'}</li>`;
  }
  const boardEl = $('[data-board]');
  boardEl.addEventListener('click', (e) => {
    const t = e.target.closest('[data-new], [data-open], [data-copy], [data-del], [data-deltpl], [data-f]');
    if (!t) return;
    const d = t.dataset;
    if (d.f !== undefined) { filtr = d.f; renderBoard(); return; }
    if (d.new) {
      const [kind, key] = d.new.split(':');
      S = newOffer(kind === 'b' ? BUILTIN[key].make() : kind === 'o' ? (tplAll().find((x) => x.id === key) || {}).data : {});
      saveCurrent(true); go('edit'); toast(`Nová nabídka ${S.cislo}.`); return;
    }
    const all = listAll();
    if (d.open) { S = migrate(JSON.parse(JSON.stringify(all.find((x) => x.id === d.open).data))); go('edit'); return; }
    if (d.copy) { S = newOffer(all.find((x) => x.id === d.copy).data); saveCurrent(true); go('edit'); toast(`Kopie jako nabídka ${S.cislo}. Doplňte zákazníka.`); return; }
    if (d.del) { const x = all.find((y) => y.id === d.del); if (confirm(`Smazat nabídku ${x.cislo}${x.zak ? ' (' + x.zak + ')' : ''}?`)) { store(LIST, all.filter((y) => y.id !== d.del)); if (S && S.id === d.del) S = null; renderBoard(); } return; }
    if (d.deltpl) { const ts = tplAll(); const x = ts.find((y) => y.id === d.deltpl); if (confirm(`Smazat šablonu „${x.nazev}“?`)) { store(TPLKEY, ts.filter((y) => y.id !== d.deltpl)); renderBoard(); } }
  });
  boardEl.addEventListener('change', (e) => {
    const id = e.target.dataset.stav; if (!id) return;
    const all = listAll(), x = all.find((y) => y.id === id);
    x.stav = x.data.stav = e.target.value; store(LIST, all);
    if (S && S.id === id) S.stav = e.target.value;
    renderBoard();
  });
  $('[data-hledat]').addEventListener('input', (e) => { hledat = e.target.value; renderBoard(); });

  // přepínání přehled ↔ editor (i tlačítkem Zpět v prohlížeči)
  function go(view) {
    if (view === 'edit' && !S) view = 'board';
    if (view === 'board') saveCurrent(true);
    document.body.dataset.view = view;
    const hash = view === 'edit' ? '#nabidka' : '#prehled';
    if (location.hash !== hash) history.pushState(null, '', hash);
    if (view === 'edit') { bindFields(); refresh(); document.title = `${S.cislo} | Nabídky PROOZE`; }
    else { renderBoard(); document.title = 'Nabídky | PROOZE'; }
    scrollTo(0, 0);
  }
  addEventListener('popstate', () => go(location.hash === '#nabidka' ? 'edit' : 'board'));

  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT' || b.tagName === 'INPUT') return;
    const act = b.dataset.act;
    if (act === 'board') go('board');
    if (act === 'save') saveCurrent();
    if (act === 'save-tpl') {
      const name = prompt('Název šablony (uloží se bez zákazníka, s položkami a texty):', S.nazev || 'Moje šablona');
      if (!name) return;
      const data = JSON.parse(JSON.stringify(S));
      Object.assign(data, { zak: { jmeno: '', telefon: '', email: '', adresa: '' }, stavba: '', cislo: '', stav: 'rozpracovana' });
      store(TPLKEY, [...tplAll(), { id: uid(), nazev: name, data }]);
      toast(`Šablona „${name}“ je uložená v přehledu.`);
    }
    if (act === 'export') download(`prooze-nabidky-${today()}.json`, JSON.stringify({ nabidky: listAll(), sablony: tplAll() }, null, 1));
    if (act === 'add-item') addItem();
    if (act === 'add-prod') { S.prods.push({ nadpis: '', nazev: '', vyrobce: '', barva: '', hex: '', body: '', img: '' }); renderProds(); refresh(); }
    if (act === 'pdf') {
      saveCurrent(true);
      const old = document.title;
      document.title = `Nabídka ${S.cislo}${S.zak.jmeno ? ' ' + S.zak.jmeno : ''}`.replace(/[\\/:*?"<>|]/g, '');
      toast('V okně tisku zvolte „Uložit jako PDF“ a nechte okraje výchozí.');
      setTimeout(() => { window.print(); document.title = old; }, 60);
    }
  });
  $('[data-act="tpl"]').addEventListener('change', (e) => {
    const k = e.target.value; e.target.value = '';
    if (!k) return;
    const filled = S.items.some((x) => x.popis || x.cena);
    if (filled && !confirm('Nahradit současné položky rozpočtu šablonou?')) return;
    S.items = copyItems(k);
    renderItems(); refresh();
  });
  $('[data-act="import"]').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((txt) => {
      const inc = JSON.parse(txt);
      const offers = Array.isArray(inc) ? inc : inc.nabidky || [], tpls = Array.isArray(inc) ? [] : inc.sablony || [];
      const all = listAll(); let n = 0;
      offers.forEach((x) => { if (x && x.id && x.data) { const i = all.findIndex((y) => y.id === x.id); if (i >= 0) all[i] = x; else all.push(x); n++; } });
      const ts = tplAll(); tpls.forEach((x) => { if (x && x.id && !ts.some((y) => y.id === x.id)) ts.push(x); });
      store(LIST, all); store(TPLKEY, ts); renderBoard(); toast(`Načteno ${n} nabídek a ${tpls.length} šablon.`);
    }).catch(() => toast('Soubor se nepodařilo načíst. Je to export z tohoto nástroje?'));
    e.target.value = '';
  });

  let toastT;
  function toast(msg) {
    let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = msg; el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on'), 4200);
  }

  // první spuštění: vzorová nabídka v přehledu, rozpracovaná nabídka se uloží do seznamu
  if (!listAll().length && !S) { S = demo(); S.cislo = 'VZOR'; }
  if (S) saveCurrent(true);
  go(location.hash === '#nabidka' && S ? 'edit' : 'board');
  document.fonts && document.fonts.ready.then(fitDoc);
})();
