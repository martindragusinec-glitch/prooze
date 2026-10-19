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
  const defaultProofs = () => [
    { t: 'Střecha i FVE', s: 'Jedno lešení, jedna smlouva, jedna záruka' },
    { t: 'Pevná cena', s: 'Známe ji před podpisem, vícepráce jen s vaším souhlasem' },
    { t: 'Záruka písemně', s: 'Na práci ve smlouvě, na krytinu od výrobce' },
    { t: 'Od roku 2011', s: 'Střechy ve Slaném a okolí' }];
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
  const FV = window.PROOZE_FVE || null;
  const KIMG = (it) => (it && it.img ? `${A}${it.img}` : '');
  // fotovoltaika: položky rozpočtu z konfigurátoru (link 'fve:<klíč>'); ruční ceny se zachovají i po vypnutí a zapnutí položky
  function syncFve(s) {
    if (!FV || !s.fve) return;
    const f = s.fve; f.cache = f.cache || {};
    const isF = (x) => x.link && x.link.startsWith('fve:');
    const want = f.on ? FV.lines(f) : [];
    const keys = new Set(want.map((l) => 'fve:' + l.key));
    const firstIdx = s.items.findIndex(isF);
    s.items.filter((x) => isF(x)).forEach((x) => { if (x.cena) f.cache[x.link] = x.cena; });
    const have = Object.fromEntries(s.items.filter(isF).map((x) => [x.link, x]));
    // ve společné nabídce se střechou dostanou skupiny FVE vlastní název (Práce → Práce FVE)
    const otherKats = new Set(s.items.filter((x) => !isF(x) && (x.popis || x.cena)).map((x) => x.kat));
    const block = want.map((l) => {
      if (otherKats.has(l.kat)) l.kat = `${l.kat} FVE`;
      const link = 'fve:' + l.key, x = have[link];
      if (x) { if (!x.manual) { x.popis = l.popis; x.mn = l.mn; x.jed = l.jed; } if (!x.zarukaManual) x.zaruka = l.zaruka; return x; }
      return { kat: l.kat, popis: l.popis, jed: l.jed, mn: l.mn, cena: f.cache[link] || '', link, zaruka: l.zaruka };
    });
    let rest = s.items.filter((x) => !isF(x));
    if (f.on) rest = rest.filter((x) => x.popis || x.cena || x.mn !== '');
    const before = firstIdx >= 0 ? s.items.slice(0, firstIdx).filter((x) => rest.includes(x)).length : rest.length;
    s.items = [...rest.slice(0, before), ...block, ...rest.slice(before)];
    if (!s.items.length) s.items.push(I('', '', 'kpl'));
  }
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
    const parts = [], k = s.kryt;
    if (k && k.nazev && k.ano !== false) {
      const n = num(s.okna?.pocet) || 0;
      const okna = s.okna?.ano ? (n === 1 ? ', včetně střešního okna' : `, včetně ${n ? n + ' ' : ''}střešních oken`) : '';
      parts.push(`${k.nazev}${k.barvaTxt ? ', ' + k.barvaTxt : ''}${okna}`);
    }
    if (FV && s.fve?.on) {
      const c = FV.calc(s.fve);
      if (c.kwp) parts.push(`${parts.length ? 'fotovoltaika' : 'Fotovoltaická elektrárna'} ${FV.cz(c.kwp)} kWp${c.kwh ? ` s baterií ${FV.cz(c.kwh)} kWh` : ''}`);
    }
    return parts.join(' a ');
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
      uvod: '', kryt: defaultKryt(), okna: defaultOkna(), fve: FV ? FV.def() : null, prods: [],
      items: [I('', '', 'kpl')], dph: '12', sleva: '', mezisoucty: false, zaokr: true, proofsOn: true, proofs: defaultProofs(), osloveni: 'Dobrý den,', podpisFoto: true,
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
    if (s && !s.stav) s.stav = 'rozpracovana';
    if (s && s.zaokr === undefined) s.zaokr = true;
    if (s && (!s.proofs || s.proofs[0]?.t === 'Střecha i fotovoltaika')) { s.proofs = defaultProofs(); s.proofsOn = s.proofsOn !== false; }
    if (s && s.osloveni === undefined) s.osloveni = 'Dobrý den,';
    if (s && s.podpisFoto === undefined) s.podpisFoto = true;
    if (s && !s.fve && FV) s.fve = FV.def();
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
    const raw = zaklad + dphKc, celkem = s.zaokr === false ? raw : Math.round(raw);
    return { rows, sum, sleva, slevaKc, zaklad, rate, dphKc, celkem, zaokrKc: celkem - raw };
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
    bolt: '<path d="M13 3.5 5.5 13.5h5.5l-1 7 7.5-10H12z"/>',
    battery: '<rect x="3.5" y="7.5" width="15" height="9" rx="2"/><path d="M20.5 10.5v3M7 10.5v3M10 10.5v3"/>',
    sun: '<circle cx="12" cy="12" r="3.6"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"/>',
  };
  const iconFor = (label) => {
    const l = label.toLowerCase();
    if (/výkon|kwp/.test(l)) return 'bolt';
    if (/bateri|úložiš/.test(l)) return 'battery';
    if (/zah[aá]j|term[ií]n|datum|nástup/.test(l)) return 'cal';
    if (/doba|trv|dn[ií]|délka/.test(l)) return 'clock';
    if (/plocha|rozm|výměr|m²/.test(l)) return 'area';
    if (/z[aá]ruk/.test(l)) return 'shield';
    if (/cena|k[čc]|úvěr|dotac/.test(l)) return 'price';
    if (/dům|objekt|stavb|střech|fve/.test(l)) return 'house';
    if (/rok|let |tradic|zkušen/.test(l)) return 'cal';
    return 'check';
  };
  const badge = (label, value, sun) => `<div class="d-badge${sun ? ' d-badge--sun' : ''}"><span class="d-badge__ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[sun ? 'price' : iconFor(label)]}</svg></span><span class="d-badge__t"><small>${t(label)}</small><b>${sun ? value : t(value)}</b></span></div>`;
  const ph = (v, text) => (v ? t(v) : `<span class="ph">${text}</span>`);


  function renderDoc(s) {
    const tt = totals(s);
    const L = s.layout;
    const meta = `<p class="d-meta"><b>Cenová nabídka č.&nbsp;${esc(s.cislo)}</b><br>${czDate(s.datum)}</p>`;
    const fvc = FV && s.fve?.on ? FV.calc(s.fve) : null;
    const autoFact = (k) => (!fvc ? '' : /výkon/i.test(k) && fvc.kwp ? `${FV.cz(fvc.kwp)} kWp` : /bateri|úložiš/i.test(k) && fvc.kwh ? `${FV.cz(fvc.kwh)} kWh` : '');
    const badges = s.fakta.map((f) => ({ k: f.k, v: f.v || autoFact(f.k || '') })).filter((f) => f.k && f.v).map((f) => badge(f.k, f.v));
    if (s.cenaNahore && tt.sum > 0) badges.push(badge(`Cena díla${priceLabel(s, tt) ? ' ' + priceLabel(s, tt) : ''}`, kc(tt.celkem), true));
    const badgeRow = badges.length ? `<div class="d-badges" data-goto="#s-texty">${badges.join('')}</div>` : '';
    const sub = s.podtitul || autoSub(s);
    const title = `<h1>${ph(s.nazev, 'Název nabídky')}</h1>${sub ? `<p class="d-sub">${t(sub)}</p>` : ''}`;
    const head = L === 'foto'
      ? `<header class="d-cover" data-goto='[data-k="nazev"]'><img class="d-cover__img" src="${coverSrc(s)}" alt=""><div class="d-cover__bar"><img class="d-logo" src="${A}brand/logo-bila.svg" alt="PROOZE">${meta}</div><div class="d-cover__txt">${title}${badgeRow}</div></header>`
      : `<header class="d-head" data-goto='[data-k="cislo"]'><div class="d-head__brand"><img class="d-logo" src="${A}brand/logo.svg" alt="PROOZE"><span>Pokrývači, kteří umí i&nbsp;fotovoltaiku</span></div>${meta}</header>`;

    const kde = s.stavba || s.zak.adresa;
    const parties = `<section class="d-parties" data-goto='[data-k="zak.jmeno"]'>
      <div${s.zak.jmeno ? '' : ' class="is-empty"'}><h3>Pro</h3><p>${s.zak.jmeno ? `<b>${t(s.zak.jmeno)}</b>` : '<span class="ph">Jméno zákazníka</span>'}${s.zak.adresa ? '<br>' + t(s.zak.adresa) : ''}${s.zak.telefon || s.zak.email ? '<br>' + [s.zak.telefon, s.zak.email].filter(Boolean).map(t).join(' · ') : ''}</p></div>
      <div${kde ? '' : ' class="is-empty"'}><h3>Místo stavby</h3><p>${ph(kde, 'Adresa stavby')}</p></div>
      <div><h3>Připravil</h3><p><b>${t(s.podpis.jmeno)}</b>${s.podpis.role ? ', ' + t(s.podpis.role) : ''}<br>${t(s.podpis.telefon)} · ${t(s.podpis.email)}</p></div></section>`;

    const k = s.kryt, o = s.okna;
    const prods = [
      k && k.ano !== false && k.nazev ? { nadpis: 'Střešní krytina', nazev: k.nazev, vyrobce: k.vyrobce, barva: k.barvaTxt, hex: k.hex, body: k.body } : null,
      o && o.ano && o.model ? { nadpis: 'Střešní okna', nazev: `${num(o.pocet) ? fmt(num(o.pocet)) + '× ' : ''}${o.model}`, vyrobce: '', barva: '', hex: '', body: [o.lemovani ? `Lemování ${o.lemovani}` : '', o.body].filter(Boolean).join('\n') } : null,
      fvc && fvc.kwp ? { nadpis: 'Fotovoltaika', nazev: `${FV.cz(fvc.kwp)} kWp${fvc.kwh ? ` + baterie ${FV.cz(fvc.kwh)} kWh` : ''}`, vyrobce: '', barva: '', hex: '', img: KIMG(fvc.P),
        body: [`${fvc.n}× ${fvc.P.kratce}`, fvc.I ? `${fvc.invKs > 1 ? fvc.invKs + '× ' : ''}${fvc.I.p.bez_fv_vstupu ? 'Měnič' : 'Střídač'} ${fvc.I.kratce}` : '', fvc.B ? `Baterie ${fvc.B.kratce}` : '',
          s.fve.program === 'nzu' && fvc.uver ? `Bezúročný úvěr NZÚ až ${kc(fvc.uver)}` : ''].filter(Boolean).join('\n') } : null,
      ...s.prods.filter((p) => p.nazev || p.img),
    ].filter(Boolean);
    const prodHtml = prods.length ? `<section class="d-sec d-prods d-prods--${Math.min(prods.length, 3)}" data-goto="${k && k.ano !== false ? '#s-kryt' : '#s-fve'}">${prods.map((p) => {
      const m = MAKERS[p.vyrobce];
      const logo = p.img ? `<img class="d-prod__img" src="${p.img}" alt="">` : m && m[1] ? `<img class="d-prod__logo" src="${A}brands/${m[1]}" alt="${m[0]}">` : '';
      const color = p.barva || p.hex ? `<p class="d-prod__color">${p.hex ? `<i class="sw" style="background:${esc(p.hex)}"></i>` : ''}${t(p.barva)}</p>` : '';
      const body = lines(p.body);
      const inner = `<div class="d-prod__top"><div><p class="d-prod__k">${t(p.nadpis)}</p><h3 class="d-prod__n">${t(p.nazev)}</h3></div>${logo}</div>${color}${body.length ? `<ul>${body.map((b) => `<li>${t(b)}</li>`).join('')}</ul>` : ''}`;
      return `<article class="d-prod">${inner}</article>`;
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
    const hasZ = groups.some((g) => g.rows.some(([x]) => x.zaruka));
    const tbody = groups.map((g) => `<tbody><tr class="d-cat"><th colspan="${hasZ ? 5 : 4}" scope="colgroup">${t(g.k)}</th><td class="r">${s.mezisoucty ? kc(g.sum) : ''}</td></tr>${g.rows.map(([x, total]) => `<tr data-goto='[data-item="${S.items.indexOf(x)}"] [data-if="popis"]'><td>${t(x.popis).replace(/\n/g, '<br>')}</td>${hasZ ? `<td class="z">${t(x.zaruka || '')}</td>` : ''}<td class="r">${x.mn !== '' ? fmt(num(x.mn)) : ''}</td><td>${esc(x.jed)}</td><td class="r">${num(x.cena) ? kc(num(x.cena)) : '—'}</td><td class="r"><b>${total ? kc(total) : '—'}</b></td></tr>`).join('')}</tbody>`).join('');
    const totRows = [];
    if (tt.sleva) totRows.push(['Součet položek', kc(tt.sum)], [`Sleva ${fmt(tt.sleva)} %`, '− ' + kc(tt.slevaKc)]);
    if (tt.rate) totRows.push(['Základ DPH', kc(tt.zaklad)], [`DPH ${tt.rate} %`, kc(tt.dphKc)]);
    if (Math.abs(tt.zaokrKc) >= 0.005) totRows.push(['Zaokrouhlení', (tt.zaokrKc > 0 ? '+ ' : '− ') + kc(Math.abs(tt.zaokrKc))]);
    // rekapitulace po skupinách vlevo vedle součtů (od 3 skupin)
    const recap = groups.length >= 3 && s.layout !== 'kompakt' ? `<div class="d-recap"><p class="d-recap__h">Rekapitulace</p>${groups.map((g) => `<p><span>${t(g.k)}</span><b>${kc(g.sum)}</b></p>`).join('')}</div>` : '';
    const finalLabel = tt.rate ? 'Cena díla celkem s DPH' : s.dph === '0' ? 'Cena díla celkem bez DPH' : 'Cena díla celkem';
    const budget = groups.length ? `<section class="d-sec d-budget"><h2 class="d-h">Položkový rozpočet</h2>
      <table class="d-tbl"><colgroup><col>${hasZ ? '<col style="width:27mm">' : ''}<col style="width:15mm"><col style="width:11mm"><col style="width:25mm"><col style="width:28mm"></colgroup>
      <thead><tr><th scope="col">Položka</th>${hasZ ? '<th scope="col">Záruka</th>' : ''}<th class="r" scope="col">Množství</th><th scope="col">Jedn.</th><th class="r" scope="col">Cena za jedn.</th><th class="r" scope="col">Celkem</th></tr></thead>${tbody}</table>
      <div class="d-tot" data-goto='[data-k="dph"]'><div class="d-tot__grid${recap ? '' : ' d-tot__grid--solo'}">${recap}${totRows.length ? `<div class="d-tot__rows">${totRows.map(([a, b]) => `<p><span>${a}</span><b>${b}</b></p>`).join('')}</div>` : ''}</div>
      <div class="d-tot__final"><span>${finalLabel}</span><b>${kc(tt.celkem)}</b></div>
      ${s.dph === 'neplatce' ? '<p class="d-tot__note">Nejsme plátci DPH.</p>' : ''}</div></section>` : '';

    const sh = lines(s.shrnuti);
    const end = sh.length || s.podminky ? `<section class="d-sec d-end" data-goto='[data-k="shrnuti"]'>${sh.length ? `<div><h2 class="d-h">Co je v&nbsp;ceně</h2><ul class="d-check">${sh.map((b) => `<li>${t(b)}</li>`).join('')}</ul></div>` : '<div></div>'}
      ${s.podminky ? `<div><h2 class="d-h">Podmínky</h2>${lines(s.podminky).map((p) => `<p>${t(p)}</p>`).join('')}</div>` : ''}</section>` : '';

    const platnost = s.datum && num(s.platnost) ? `Nabídka platí do ${czDate(addDays(s.datum, num(s.platnost)))}.` : '';
    const sign = `<section class="d-sign" data-goto="#s-podpis"><div><p class="d-sign__lead">Těšíme se na spolupráci.</p><p>${platnost} Rádi ji s&nbsp;vámi projdeme položku po položce.</p></div>
      <div class="d-sign__who"><img src="${A}brand/symbol.svg" alt=""><p><b>${t(s.podpis.jmeno)}</b>${s.podpis.role ? '<br>' + t(s.podpis.role) + ', PROOZE' : '<br>PROOZE'}<br>${t(s.podpis.telefon)} · ${t(s.podpis.email)}</p></div></section>`;

    const intro = s.uvod.trim() ? `<div class="d-intro" data-goto='[data-k="uvod"]'>${s.uvod.split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean).map((x) => `<p>${t(x)}</p>`).join('')}</div>` : '';
    const paras = s.uvod.split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean);
    const sig = `<div class="d-letter__sig">${s.podpisFoto !== false ? `<img src="${A}old/pavel-koci-ceo.jpg" alt="">` : ''}<p><b>${t(s.podpis.jmeno)}</b>${s.podpis.role ? ', ' + t(s.podpis.role) : ''}<br>${t(s.podpis.telefon)} · ${t(s.podpis.email)}</p></div>`;
    const platDo = s.datum && num(s.platnost) ? czDate(addDays(s.datum, num(s.platnost))) : '';
    const side = `<aside class="d-letter__side" data-goto='[data-k="zak.jmeno"]'>
      <div${s.zak.jmeno ? '' : ' class="is-empty"'}><h3>Pro</h3><p>${s.zak.jmeno ? `<b>${t(s.zak.jmeno)}</b>` : '<span class="ph">Jméno zákazníka</span>'}${s.zak.adresa ? '<br>' + t(s.zak.adresa) : ''}${s.zak.telefon || s.zak.email ? '<br>' + [s.zak.telefon, s.zak.email].filter(Boolean).map(t).join(' · ') : ''}</p></div>
      <div${kde ? '' : ' class="is-empty"'}><h3>Místo stavby</h3><p>${ph(kde, 'Adresa stavby')}</p></div>
      ${platDo ? `<div><h3>Platnost nabídky</h3><p>do ${platDo}</p></div>` : ''}</aside>`;
    const letter = `<section class="d-letter"><div class="d-letter__txt" data-goto='[data-k="uvod"]'>${s.osloveni ? `<p class="d-letter__hi">${t(s.osloveni)}</p>` : ''}${paras.map((x) => `<p>${t(x)}</p>`).join('') || '<p class="ph">Úvodní text nabídky</p>'}${sig}</div>${side}</section>`;
    const p1 = `${head}${L !== 'foto' ? `<section class="d-title">${title}</section>${badgeRow}` : ''}${letter}${prodHtml}`;
    const foot = `<footer class="d-foot"><div class="d-foot__brand"><img src="${A}brand/logo-bila.svg" alt="PROOZE"><p>Pokrývači, kteří umí i&nbsp;fotovoltaiku.</p></div>
      <div class="d-foot__c"><p><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h3l1.5 4.2-2 1.4a11 11 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3c0 1.1-.9 2-2 2A16.5 16.5 0 0 1 4.6 5.5c0-1.1.9-2 2-2Z"/></svg>773&nbsp;898&nbsp;698</p>
      <p><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17v11h-17z"/><path d="m4 7 8 6.5L20 7"/></svg>info@prooze.cz</p>
      <p><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5S9.7 5.9 12 3.5Z"/></svg>prooze.cz</p></div></footer>`;
    const close = `<div class="d-close">${end}${sign}${foot}</div>`; // závěr, podpis a patička se nerozdělí
    let sys = '';
    if (fvc && fvc.kwp) {
      const f = s.fve, tech = [];
      const card = (k, it, extra) => it && tech.push(`<article class="d-tech__c">${it.img ? `<div class="d-tech__img"><img src="${KIMG(it)}" alt=""></div>` : '<div class="d-tech__img d-tech__img--none"></div>'}<div class="d-tech__t"><p class="d-tech__k">${k}${extra ? ` · ${extra}` : ''}</p><h3>${t(it.kratce)}</h3>${(it.radky || []).length ? `<p>${it.radky.map(t).join('<br>')}</p>` : ''}${it.zaruka ? `<span class="d-tech__z">Záruka ${t(it.zaruka)}</span>` : ''}</div></article>`);
      card('Panely', fvc.P, `${fvc.n} ks`);
      card(fvc.I && fvc.I.p.bez_fv_vstupu ? 'Měnič' : 'Střídač', fvc.I, fvc.invKs > 1 ? `${fvc.invKs} ks` : '');
      card('Baterie', fvc.B, fvc.B ? `${FV.cz(fvc.kwh)} kWh` : '');
      if (f.wallbox) card('Wallbox', FV.byId[f.wallbox]);
      if (f.tigo !== 'none') card(f.tigo === 'O' ? 'Optimizéry' : 'Požární odpojovače', FV.byId[{ F: 'tigo-ts4-a-f', '2F': 'tigo-ts4-a-2f', O: 'tigo-ts4-a-o' }[f.tigo]]);
      const nums = [['Výkon FVE', `${FV.cz(fvc.kwp)} kWp`], fvc.kwh ? ['Bateriové úložiště', `${FV.cz(fvc.kwh)} kWh`] : null, ['Panely', `${fvc.n} × ${fvc.P.p.vykon_wp} Wp`],
        f.program === 'nzu' && fvc.uver ? ['Bezúročný úvěr NZÚ až', kc(fvc.uver)] : f.program === 'light' ? ['Dotace', 'NZÚ Light'] : null].filter(Boolean);
      const infigy = f.infigy ? `<div class="d-infigy"><h3>Inteligentní řízení Infigy</h3><div><p><b>Propojení energií</b>Spojuje různé druhy energií do jednoho celku a&nbsp;nakládá s&nbsp;nimi nejefektivnějším způsobem.</p>
        <p><b>Šetření nákladů</b>Automatické řízení spravuje energii tak, abyste co nejvíce ušetřili. Vše můžete sledovat online v&nbsp;aplikaci.</p>
        <p><b>Regulace spotřeby</b>Energie se využije v&nbsp;největších domácích spotřebičích, tepelném čerpadle nebo bojleru, případně se uloží do baterie.</p></div></div>` : '';
      sys = `<section class="d-sec d-sys" data-goto="#s-fve"><h2 class="d-h">Navržený systém</h2><div class="d-sys__nums">${nums.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
        ${Array.from({ length: Math.ceil(tech.length / 3) }, (_, r) => `<div class="d-tech d-tech--${Math.min(tech.length, 3)}">${tech.slice(r * 3, r * 3 + 3).join('')}</div>`).join('')}${infigy}</section>`;
    }
    if (L === 'kompakt') return `${head}<section class="d-title">${title}</section>${badgeRow}${parties}${intro}${prodHtml}${sys}${budget}${close}`;
    // úvodní strana: obsah nahoře, souhrn cena + platnost dole; rozpočet vždy od nové strany
    const plat = s.datum && num(s.platnost) ? czDate(addDays(s.datum, num(s.platnost))) : '';
    const onlyFve = s.kryt?.ano === false && s.fve?.on;
    const proofs = s.proofsOn !== false ? (s.proofs || []).filter((x) => x.t).map((x) => (onlyFve && x.s === 'Na práci ve smlouvě, na krytinu od výrobce' ? { ...x, s: 'Na práci ve smlouvě, na komponenty od výrobce' } : x)) : [];
    const proofRow = proofs.length ? `<div class="d-proofs d-proofs--${proofs.length}" data-goto="#s-proofs">${proofs.map((x) => `<div class="d-proof"><span class="d-proof__ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[iconFor(x.t)]}</svg></span><b>${t(x.t)}</b>${x.s ? `<small>${t(x.s)}</small>` : ''}</div>`).join('')}</div>` : '';
    const strip = tt.sum > 0 ? `<div class="d-strip" data-goto='[data-k="dph"]'><div class="d-strip__price"><span>${finalLabel}</span><b>${kc(tt.celkem)}</b></div>
      ${plat ? `<div><span>Nabídka platí do</span><b>${plat}</b></div>` : ''}<div><span>Dotazy: ${t(s.podpis.jmeno)}</span><b>${t(s.podpis.telefon)}</b></div></div>` : '';
    return `<div class="d-p1">${p1}<div class="d-p1__end">${proofRow}${strip}</div></div>${sys}${budget}${close}`;
  }

  /* ---------- editor ---------- */
  const docEl = $('[data-doc]'), fit = $('[data-fit]'), scroller = $('.pv__scroll');
  let raf = 0;
  function refresh() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      syncLinked(S);
      layoutDoc(renderDoc(S));
      const tt = totals(S);
      $('[data-sum]').textContent = tt.sum ? `${kc(tt.celkem)}${priceLabel(S, tt) ? ' ' + priceLabel(S, tt) : ''}` : '';
      updateTotalsInEditor(tt);
      fitDoc();
      store(KEY, S);
      $('[data-ed-no]').textContent = S.cislo;
      $('[data-ed-name]').textContent = S.zak.jmeno || S.nazev || 'Nová nabídka';
      renderChecks();
      renderAccs();
      autosave();
    });
  }
  // ukládá se samo (s malým zpožděním), stav ukazuje lišta pod hlavičkou
  let saveT = 0;
  function autosave() {
    const el = $('[data-saved-at]'); el.textContent = 'Ukládám…';
    clearTimeout(saveT);
    saveT = setTimeout(() => { saveCurrent(true); el.textContent = `Uloženo ${new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`; }, 700);
  }
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && document.body.dataset.view === 'edit') { e.preventDefault(); clearTimeout(saveT); saveCurrent(); $('[data-saved-at]').textContent = 'Uloženo'; }
  });

  // kontrola před odesláním
  const plural = (n, a, b, c) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);
  function checks(s) {
    const c = [];
    if (!s.zak.jmeno) c.push(['Jméno zákazníka', '[data-k="zak.jmeno"]']);
    if (!s.stavba && !s.zak.adresa) c.push(['Adresa stavby', '[data-k="zak.adresa"]']);
    if (!s.nazev) c.push(['Název nabídky', '[data-k="nazev"]']);
    const live = s.items.map((x, i) => [x, i]).filter(([x]) => x.popis && !offItem(s, x));
    const noPrice = live.filter(([x]) => !num(x.cena)), noQty = live.filter(([x]) => !num(x.mn));
    if (noPrice.length) c.push([`${noPrice.length} ${plural(noPrice.length, 'položka', 'položky', 'položek')} bez ceny`, `[data-item="${noPrice[0][1]}"] [data-if="cena"]`]);
    if (noQty.length) c.push([`${noQty.length} ${plural(noQty.length, 'položka', 'položky', 'položek')} bez množství`, `[data-item="${noQty[0][1]}"] [data-if="mn"]`]);
    if (s.okna?.ano && !s.okna.model) c.push(['Typ střešních oken', '[data-k="okna.model"]']);
    if (FV && s.fve?.on) FV.checks(s.fve).filter((x) => x.lvl === 'err').forEach((x) => c.push([`FVE: ${x.msg}`, `[data-fv="${x.f}"]`]));
    return c;
  }
  function renderChecks() {
    const c = checks(S), btn = $('[data-checks]'), list = $('[data-checks-list]');
    btn.className = `ckb${c.length ? '' : ' ckb--ok'}`;
    btn.textContent = c.length ? `${c.length} ${plural(c.length, 'věc', 'věci', 'věcí')} k doplnění` : 'Připraveno k odeslání';
    list.innerHTML = c.map(([m, sel]) => `<button type="button" data-goto="${esc(sel)}">${m}</button>`).join('');
    if (!c.length) { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  }
  $('[data-checks]').addEventListener('click', () => { const l = $('[data-checks-list]'); if (!l.innerHTML) return; l.hidden = !l.hidden; $('[data-checks]').setAttribute('aria-expanded', String(!l.hidden)); });

  // skok na pole v editoru (z náhledu, z kontroly)
  // posouvá jen sloupec editoru (scrollIntoView by posunul i celou stránku)
  function scrollEd(el, where = 'center') {
    const body = $('.ed__body'), r = el.getBoundingClientRect(), b = body.getBoundingClientRect();
    const top = body.scrollTop + r.top - b.top - (where === 'start' ? 8 : (b.height - r.height) / 2);
    body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
  function goto(sel) {
    const el = $(sel); if (!el) return;
    for (let d = el.closest('details'); d; d = d.parentElement.closest('details')) d.open = true;
    setTimeout(() => scrollEd(el), 40);
    const box = el.closest('.it, .grp') || el;
    box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash');
    if (el.matches('input, textarea, select')) setTimeout(() => el.focus({ preventScroll: true }), 350);
  }
  document.addEventListener('click', (e) => { const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); $('[data-checks-list]').hidden = true; goto(g.dataset.goto); } });

  // roletky: otevřená je jedna, sbalené ukazují shrnutí a tečku, když v nich něco chybí
  const accs = [...document.querySelectorAll('.acc')];
  accs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) accs.forEach((o) => { if (o !== d) o.open = false; });
    if (d.open) setTimeout(() => scrollEd(d, 'start'), 30);
    if (d.id === 's-rozp' && d.open) autosize();
  }));
  function renderAccs() {
    const k = S.kryt, o = S.okna, tt = totals(S), live = S.items.filter((x) => x.popis && !offItem(S, x));
    const obec = (S.stavba || S.zak.adresa || '').split(',').pop().replace(/\d{3}\s?\d{2}/, '').trim();
    const sum = {
      zak: [S.zak.jmeno || 'Doplňte zákazníka', obec].filter(Boolean).join(' · '),
      kryt: [k.ano === false ? 'Bez krytiny' : `${KRYTINY[k.typ].n}${k.barvaTxt ? ', ' + k.barvaTxt : ''}`, o.ano ? `${o.pocet || ''}× okno`.trim() : 'bez oken'].join(' · '),
      rozp: `${live.length} ${plural(live.length, 'položka', 'položky', 'položek')}${tt.sum ? ' · ' + kc(tt.celkem) + (priceLabel(S, tt) ? ' ' + priceLabel(S, tt) : '') : ''}`,
      texty: [((n) => (n ? `${n} ${plural(n, 'štítek', 'štítky', 'štítků')}` : 'bez štítků'))(S.fakta.filter((f) => f.k && f.v).length), S.uvod ? 'úvod' : '',
        ((n) => (n ? `${n} ${plural(n, 'bod', 'body', 'bodů')} v ceně` : ''))(lines(S.shrnuti).length)].filter(Boolean).join(' · '),
      fve: !S.fve?.on ? 'Bez fotovoltaiky' : ((c) => [`${FV.cz(c.kwp)} kWp`, c.kwh ? `${FV.cz(c.kwh)} kWh` : 'bez baterie', c.I ? c.I.kratce : ''].filter(Boolean).join(' · '))(FV.calc(S.fve)),
      vzhled: `${{ foto: 'S fotkou', cista: 'Čistá', kompakt: 'Kompaktní' }[S.layout]}${S.layout === 'foto' ? (S.fotoData || (S.foto && S.foto !== 'auto') ? ' · vlastní fotka' : ' · fotka podle krytiny') : ''}`,
      podpis: [S.podpis.jmeno, S.podpis.role].filter(Boolean).join(', '),
    };
    const c = checks(S).map((x) => x[1]);
    const miss = { zak: c.some((x) => /zak\.|nazev/.test(x)), kryt: c.some((x) => /okna\./.test(x)), rozp: c.some((x) => /data-item/.test(x)), fve: c.some((x) => /data-fv/.test(x)) };
    Object.entries(sum).forEach(([key, v]) => { const el = document.querySelector(`[data-acc="${key}"]`); if (el) el.textContent = v; });
    document.querySelectorAll('[data-accdot]').forEach((el) => { el.hidden = !miss[el.dataset.accdot]; });
  }

  // náhled jde schovat, editor se pak roztáhne (volba se pamatuje)
  function setPreview(on) {
    document.body.classList.toggle('no-pv', !on);
    const b = $('[data-act="preview"]'); b.setAttribute('aria-pressed', String(on)); b.textContent = 'Náhled'; b.title = on ? 'Schovat náhled a roztáhnout formulář' : 'Zobrazit náhled PDF';
    try { localStorage.setItem('prooze-nabidka-nahled', on ? '1' : '0'); } catch {}
    if (on) { fitDoc(); setTimeout(fitDoc, 50); }
    autosize();
  }
  setPreview(load('prooze-nabidka-nahled', 1) !== 0);
  function fitDoc() {
    if (document.body.dataset.view !== 'edit') return;
    const w = scroller.clientWidth - 48;
    fit.style.zoom = Math.min(1, w / 793.7); // A4 = 210 mm
  }

  /* ---------- stránkování ----------
     Dokument se skládá do skutečných listů A4 (210 × 297 mm) s vlastními okraji a patičkou, @page má okraje 0.
     Náhled je tak 1:1 s PDF a výsledek nezávisí na okrajích zvolených v dialogu tisku (Výchozí i Žádné dají totéž).
     Obsah se vykreslí v neviditelném sloupci 210 mm, změří se bloky („atomy“: sekce, karty, řádky tabulky)
     a rozdělí se na listy. Tabulka na dalším listu dostane znovu hlavičku a název rozdělené skupiny,
     nadpis nezůstane sám na konci strany, podpis drží s patičkou, poslední řádek rozpočtu se součtem. */
  const MMPX = 96 / 25.4, PG_H = 297, PG_TOP = 14, PG_BOT = 16; // mm, 1. strana bez horního okraje
  const FOOT_L = 'PROOZE · Pavel Kočí · Tomanova 1630, 274 01 Slaný · IČO 88327078';
  const FOOT_R = '773 898 698 · info@prooze.cz · prooze.cz';
  const SPLIT = '.d-p1.is-long, .d-sys, .d-budget, .d-close, .d-intro, table.d-tbl, tbody';
  const KEEP = '.d-sec > .d-h, .d-sys__nums, .d-cat, .d-sign';
  const stage = document.createElement('div');
  stage.className = 'stage'; stage.setAttribute('aria-hidden', 'true');
  document.body.append(stage);

  function atomsOf(root) {
    const out = [];
    const walk = (el) => { for (const ch of el.children) {
      if (ch.matches('thead, colgroup') || !ch.getClientRects().length) continue;
      if (ch.matches(SPLIT)) walk(ch); else out.push(ch);
    } };
    walk(root);
    const y0 = root.getBoundingClientRect().top, hOf = (el) => (el ? el.getBoundingClientRect().height : 0);
    const A = out.map((el) => {
      const r = el.getBoundingClientRect(), table = el.closest('table'), tb = el.closest('tbody');
      const cat = tb && !el.matches('.d-cat') ? tb.querySelector('.d-cat') : null;
      return { el, table, top: r.top - y0, bottom: r.bottom - y0, keep: el.matches(KEEP), brk: el.matches('.d-p1'),
        extra: table ? hOf(table.tHead) + hOf(cat) : 0, cat };
    });
    A.forEach((a, i) => {
      const prev = A[i - 1], next = A[i + 1];
      // první řádek skupiny drží s druhým (žádná skupina s jedním řádkem na konci strany)
      if (a.table && prev && prev.el.matches('.d-cat') && a.el.parentElement.rows.length > 2) a.keep = true;
      // poslední řádek tabulky drží se součtem
      if (a.table && (!next || next.table !== a.table)) a.keep = true;
    });
    // rozpočet nezačne na konci strany nadpisem a jedním řádkem: nadpis drží aspoň se 3 položkami
    A.forEach((a, i) => {
      if (!a.el.matches('.d-budget > .d-h')) return;
      for (let k = i, rows = 0; k < A.length - 1 && A[k + 1].table; k++) { A[k].keep = true; if (!A[k + 1].el.matches('.d-cat') && ++rows >= 3) break; }
    });
    return A;
  }
  function paginate(A, adj) {
    const pages = []; let cur = null, i = 0;
    const cap = (k) => ((k === 0 ? PG_H - PG_BOT : PG_H - PG_TOP - PG_BOT) * MMPX) - (adj[k] || 0);
    while (i < A.length) {
      let j = i; while (j < A.length - 1 && A[j].keep) j++;
      if (!cur) pages.push(cur = { items: [] });
      const s = cur.items.length ? A[cur.items[0]] : A[i];
      const used = A[j].bottom - s.top + (s.table ? s.extra : 0); // strana uprostřed tabulky: + hlavička (a název skupiny)
      if (used <= cap(pages.length - 1) + 0.5) {
        for (let k = i; k <= j; k++) cur.items.push(k);
        const hasBrk = A.slice(i, j + 1).some((a) => a.brk);
        i = j + 1; if (hasBrk) cur = null;
      } else if (cur.items.length) cur = null; // na novou stranu
      else { cur.items.push(i); if (A[i].brk) cur = null; i++; } // nevejde se ani na prázdnou stranu
    }
    return pages;
  }
  function buildSheets(A, pages, root, host) {
    host.textContent = '';
    pages.forEach((pg, k) => {
      const sheet = document.createElement('div'); sheet.className = `sheet${k === 0 ? ' sheet--1' : ''}`;
      const body = document.createElement('div'); body.className = 'sheet__body'; sheet.append(body);
      let open = [];
      pg.items.forEach((idx, n) => {
        const a = A[idx], chain = [];
        for (let el = a.el.parentElement; el && el !== root; el = el.parentElement) chain.unshift(el);
        let d = 0; while (d < chain.length && open[d] && open[d][0] === chain[d]) d++;
        open = open.slice(0, d);
        let parent = d ? open[d - 1][1] : body;
        for (; d < chain.length; d++) {
          const c = chain[d].cloneNode(false);
          if (c.tagName === 'TABLE') ['colgroup', 'thead'].forEach((t) => { const x = chain[d].querySelector(`:scope > ${t}`); if (x) c.append(x.cloneNode(true)); });
          if (c.tagName === 'TBODY' && a.cat) { // skupina pokračuje z minulé strany
            const ct = a.cat.cloneNode(true); ct.removeAttribute('data-goto');
            ct.querySelector('th').insertAdjacentHTML('beforeend', ' <span class="d-cat__cont">pokračování</span>');
            const td = ct.querySelector('td'); if (td) td.textContent = '';
            c.append(ct);
          }
          if (n === 0) c.classList.add('pg-first');
          parent.append(c); open.push([chain[d], c]); parent = c;
        }
        const el = a.el.cloneNode(true); if (n === 0) el.classList.add('pg-first');
        parent.append(el);
      });
      const f = document.createElement('footer'); f.className = 'sheet__foot';
      f.innerHTML = `<span>${FOOT_L}</span><span>${FOOT_R}<b>strana ${k + 1} z ${pages.length}</b></span>`;
      sheet.append(f);
      host.append(sheet);
    });
  }
  // přetečení listu (px) a zaplnění (0–1)
  function sheetFill(sheet) {
    const body = sheet.firstChild, bt = body.getBoundingClientRect().top;
    const top = sheet.classList.contains('sheet--1') ? 0 : PG_TOP * MMPX, lim = body.clientHeight - PG_BOT * MMPX;
    const y = Math.max(top, ...[...body.children].map((c) => c.getBoundingClientRect().bottom - bt));
    return { over: y - lim, fill: (y - top) / (lim - top), free: lim - y };
  }
  let imgWait = false;
  function layoutDoc(html, withFoot = false) {
    const cls = `doc doc--${S.layout}${withFoot ? ' doc--foot' : ''}`;
    let best = null;
    for (const tight of ['', ' doc--tight', ' doc--tight doc--tight2']) {
      stage.innerHTML = `<article class="${cls} doc--flow${tight}">${html}</article><article class="${cls}${tight}"></article>`;
      const [root, host] = stage.children;
      // úvodní strana se nevejde → nejdřív bez pásu argumentů, pak se rozdělí do toku
      const p1 = root.querySelector('.d-p1'), cap1 = (PG_H - PG_BOT) * MMPX + 2;
      if (p1 && p1.offsetHeight > cap1) p1.classList.add('no-proofs');
      if (p1 && p1.offsetHeight > cap1) p1.classList.add('is-long');
      const A = atomsOf(root), adj = {};
      let pages;
      for (let round = 0; round < 6; round++) { // změřené výšky se můžou o kousek lišit → doladit podle skutečných listů
        pages = paginate(A, adj); buildSheets(A, pages, root, host);
        let ok = true;
        [...host.children].forEach((sh, k) => { const o = sheetFill(sh).over; if (o > 0.5) { adj[k] = (adj[k] || 0) + o + 1; ok = false; } });
        if (ok) break;
      }
      // stažené mezery (2 stupně) jen když ušetří stranu – jinak by poslední strana zůstala skoro prázdná
      const res = { pages: pages.length, tight, nodes: [...host.children] };
      if (!best) { best = res; if (pages.length < 2 || sheetFill(host.lastElementChild).fill > 0.4) break; continue; }
      if (res.pages < best.pages) { best = res; break; }
    }
    // tmavá patička s kontakty na spodek poslední strany
    const lastSheet = best.nodes.at(-1), cls2 = `${cls}${best.tight}`;
    const host = stage.lastElementChild; host.className = cls2; host.replaceChildren(...best.nodes); // měří se v neviditelném sloupci (náhled může být schovaný)
    // Kompaktní na víc stran: na konec i tmavá patička, ať poslední strana nepůsobí nedodělaně
    if (!withFoot && S.layout === 'kompakt' && best.pages > 1 && sheetFill(lastSheet).free > 48 * MMPX) return layoutDoc(html, true);
    const foot = lastSheet.querySelector('.d-foot');
    if (foot && foot.getClientRects().length) {
      const free = sheetFill(lastSheet).free;
      if (free > 2) foot.style.marginTop = `${parseFloat(getComputedStyle(foot).marginTop) + free - 1}px`;
    }
    docEl.className = cls2;
    docEl.replaceChildren(...best.nodes);
    stage.innerHTML = '';
    const n = best.pages;
    $('[data-pages]').textContent = `Náhled A4 · ${n} ${n === 1 ? 'strana' : n < 5 ? 'strany' : 'stran'}`;
    // obrázky bez rozměrů by mohly posunout obsah → po načtení přepočítat (jen jednou)
    if (!imgWait) {
      const pending = [...docEl.querySelectorAll('img')].filter((im) => !im.complete);
      if (pending.length) { imgWait = true; Promise.all(pending.map((im) => new Promise((r) => { im.onload = im.onerror = r; }))).then(() => { imgWait = false; refresh(); }); }
    }
  }
  addEventListener('resize', fitDoc);

  function bindFields() {
    document.querySelectorAll('[data-k]').forEach((el) => {
      const k = el.dataset.k, v = get(S, k);
      if (el.type === 'checkbox') el.checked = !!v; else el.value = v ?? '';
    });
    document.querySelectorAll('input[name="layout"]').forEach((r) => { r.checked = r.value === S.layout; });
    syncFve(S); renderKryt(); renderFve(); renderPhotos(); renderFacts(); renderProofs(); renderProds(); renderItems();
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
  let photosOpen = false;
  function renderPhotos() {
    const box = $('[data-photos]');
    box.hidden = S.layout !== 'foto';
    const own = !!S.fotoData || (S.foto && S.foto !== 'auto');
    const auto = { ...S, foto: 'auto', fotoData: '' };
    const head = `<div class="cov"><img src="${coverSrc(S)}" alt=""><div class="cov__t"><b>${own ? 'Vlastní výběr fotky' : 'Fotka podle krytiny'}</b><small>${own ? 'Fotka se nemění s krytinou.' : 'Mění se sama podle typu, barvy a oken.'}</small>
      <span class="cov__b"><button type="button" class="b b--line b--s" data-photo-toggle>${photosOpen ? 'Skrýt fotky' : 'Vybrat jinou'}</button>${own ? '<button type="button" class="b b--ghost b--s" data-photo="auto">Zpět podle krytiny</button>' : ''}</span></div></div>`;
    if (!photosOpen) { box.innerHTML = head; return; }
    box.innerHTML = head + '<div class="photos">' + `<button type="button" class="ph-btn ph-btn--auto${!own ? ' is-on' : ''}" data-photo="auto" title="Podle zvolené krytiny a oken"><img src="${coverSrc(auto)}" alt=""><span>Podle krytiny</span></button>`
      + PHOTOS.map(([k, n]) => `<button type="button" class="ph-btn${!S.fotoData && S.foto === k ? ' is-on' : ''}" data-photo="${k}" title="${n}"><img src="${A}img/web/${k}-800.webp" alt="${n}" loading="lazy"></button>`).join('')
      + `<label class="ph-btn ph-btn--up${S.fotoData ? ' is-on' : ''}" title="Vlastní fotka">${S.fotoData ? `<img src="${S.fotoData}" alt="">` : '<span>Nahrát<br>vlastní</span>'}<input type="file" accept="image/*" data-upload="foto" hidden></label></div>`;
  }
  $('[data-photos]').addEventListener('click', (e) => {
    if (e.target.closest('[data-photo-toggle]')) { photosOpen = !photosOpen; renderPhotos(); return; }
    const b = e.target.closest('[data-photo]');
    if (!b) return;
    S.foto = b.dataset.photo; S.fotoData = ''; renderPhotos(); refresh();
  });

  // fotovoltaika: výběr z katalogu, souhrn a kontroly
  const optList = (kat, sel, empty) => {
    const it = FV.ofKat(kat), own = it.filter((x) => !x.alt), alt = it.filter((x) => x.alt);
    const o = (x) => `<option value="${x.id}"${x.id === sel ? ' selected' : ''}>${esc(x.kratce)}</option>`;
    return (empty ? `<option value=""${!sel ? ' selected' : ''}>${empty}</option>` : '') + (alt.length ? `<optgroup label="Z našich nabídek">${own.map(o).join('')}</optgroup><optgroup label="Další v katalogu">${alt.map(o).join('')}</optgroup>` : own.map(o).join(''));
  };
  function renderFve() {
    if (!FV) { $('#s-fve').hidden = true; return; }
    const f = S.fve, box = $('[data-fve-fields]');
    $('[data-fv="on"]').checked = !!f.on; box.hidden = !f.on;
    $('[data-fv="panel"]').innerHTML = optList('panel', f.panel);
    $('[data-fv="stridac"]').innerHTML = optList('stridac', f.stridac);
    const I = FV.byId[f.stridac];
    $('[data-fv="baterie"]').innerHTML = `<option value=""${!f.baterie ? ' selected' : ''}>Bez baterie</option>` + FV.ofKat('baterie').map((x) => `<option value="${x.id}"${x.id === f.baterie ? ' selected' : ''}>${esc(x.kratce)}${I && !I.kompat.includes(x.id) ? ' (nepasuje ke střídači)' : ''}</option>`).join('');
    $('[data-fv="wallbox"]').innerHTML = optList('wallbox', f.wallbox, 'Bez wallboxu');
    $('[data-fv="tigo"]').innerHTML = Object.entries(FV.TIGO).map(([k, n]) => `<option value="${k}"${k === f.tigo ? ' selected' : ''}>${n}</option>`).join('');
    $('[data-fv="strecha"]').innerHTML = Object.entries(FV.STRECHY).map(([k, n]) => `<option value="${k}"${k === f.strecha ? ' selected' : ''}>${n.replace(/^Konstrukce na /, '')}</option>`).join('');
    $('[data-fv="program"]').innerHTML = Object.entries(FV.PROGRAM).map(([k, n]) => `<option value="${k}"${k === f.program ? ' selected' : ''}>${n}</option>`).join('');
    ['pocet', 'moduly'].forEach((k) => { const el = $(`[data-fv="${k}"]`); if (document.activeElement !== el) el.value = f[k] ?? ''; });
    $('[data-fv="moduly"]').disabled = !f.baterie;
    ['infigy', 'hromosvod', 'faze3', 'rd'].forEach((k) => { $(`[data-fv="${k}"]`).checked = !!f[k]; });
    renderFveInfo();
  }
  function renderFveInfo() {
    if (!FV || !S.fve.on) return;
    const c = FV.calc(S.fve), list = FV.checks(S.fve);
    const B = c.B;
    $('[data-fve-sum]').innerHTML = [['Výkon', `${FV.cz(c.kwp)} kWp`], ['Baterie', c.kwh ? `${FV.cz(c.kwh)} kWh` : '–'], ['DC/AC', c.dcac ? FV.cz(c.dcac) : '–'],
      [S.fve.program === 'nzu' ? 'Max. úvěr NZÚ' : 'Instalovaný výkon', S.fve.program === 'nzu' ? kc(c.uver) : `${FV.cz(c.pi)} kW`]].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
    const hint = $('[data-fv-moduly-hint]');
    hint.textContent = B ? `${B.p.moduly_min}–${B.p.moduly_max} modulů po ${FV.cz(B.p.kwh_modul)} kWh` : '';
    const rank = { err: 0, warn: 1, info: 2, ok: 3 };
    $('[data-fve-checks]').innerHTML = list.sort((a, b) => rank[a.lvl] - rank[b.lvl]).map((x) => `<button type="button" class="fvc fvc--${x.lvl}" data-goto='[data-fv="${x.f}"]'><i></i><span>${esc(x.msg)}</span></button>`).join('');
  }
  document.addEventListener('input', (e) => {
    const el = e.target, k = el.dataset.fv; if (!k || !S) return;
    const f = S.fve;
    if (el.type === 'checkbox') f[k] = el.checked;
    else if (k === 'pocet' || k === 'moduly') f[k] = el.value === '' ? '' : Math.max(0, parseInt(el.value, 10) || 0);
    else f[k] = el.value;
    if (k === 'baterie' && f.baterie) { const B = FV.byId[f.baterie]; const I = FV.byId[f.stridac]; f.moduly = B.id === 'baterie-solax-t-bat-t58' && I && /solax/.test(I.id) ? Math.max(2, B.p.moduly_min) : Math.max(B.p.moduly_min || 1, Math.min(B.p.moduly_max || 99, Number(f.moduly) || B.p.moduly_min || 1)); }
    if (k === 'on' && f.on) $('[data-k="podtitul"]').placeholder = autoSub(S) || '';
    syncFve(S);
    if (k === 'on' || el.tagName === 'SELECT' || el.type === 'checkbox') renderFve(); else renderFveInfo();
    if (k === 'baterie') $('[data-fv="moduly"]').value = f.moduly;
    $('[data-k="podtitul"]').placeholder = autoSub(S) || 'Krátce, co nabízíte';
    renderItems(); renderPhotos(); refresh();
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fv-step]'); if (!b) return;
    const k = b.dataset.fvStep.split(':'), f = S.fve;
    f[k[0]] = Math.max(0, (Number(f[k[0]]) || 0) + Number(k[1]));
    $(`[data-fv="${k[0]}"]`).value = f[k[0]];
    syncFve(S); renderFveInfo(); renderItems(); refresh();
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

  function renderProofs() {
    $('[data-proofs]').innerHTML = S.proofs.map((x, i) => `<div class="fact"><input data-proof="${i}" data-pf2="t" value="${esc(x.t)}" placeholder="Nadpis"><input data-proof="${i}" data-pf2="s" value="${esc(x.s)}" placeholder="Krátké vysvětlení"></div>`).join('');
  }
  $('[data-proofs]').addEventListener('input', (e) => { const el = e.target; if (el.dataset.proof === undefined) return; S.proofs[el.dataset.proof][el.dataset.pf2] = el.value; refresh(); });

  // přehled nahoře
  function renderFacts() {
    while (S.fakta.length < 4) S.fakta.push({ k: '', v: '' });
    $('[data-facts]').innerHTML = S.fakta.slice(0, 4).map((f, i) => `<div class="fact"><input data-fact="${i}" data-f="k" value="${esc(f.k)}" placeholder="Popisek, např. Zahájení"><input data-fact="${i}" data-f="v" value="${esc(f.v)}" placeholder="Hodnota, např. do 3 týdnů"></div>`).join('');
  }
  $('[data-facts]').addEventListener('input', (e) => { const el = e.target; S.fakta[el.dataset.fact][el.dataset.f] = el.value; refresh(); });

  // materiály
  function renderProds() {
    $('[data-prods-count]').textContent = S.prods.length ? `(${S.prods.length})` : '';
    if (S.prods.length) $('[data-prods-wrap]').open = true;
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

  // položky rozpočtu: ve skupinách jako v PDF (pořadí skupin = první výskyt)
  let groups = [];
  function groupsOf(items) {
    const g = [];
    items.forEach((x, i) => { const k = x.kat || ''; let G = g.find((y) => y.k === k); if (!G) g.push(G = { k, idx: [] }); G.idx.push(i); });
    return g;
  }
  const rowTitle = (x) => (offItem(S, x) ? `Není v součtu: ${x.link === 'kryt' ? 'krytina' : 'okna'} nejsou součástí zakázky` : x.link && !x.manual ? `Propojeno s volbou ${x.link === 'kryt' ? 'krytiny' : x.link.startsWith('fve:') ? 'fotovoltaiky' : 'oken'} nahoře` : '');
  const IACT = [['up', 'Posunout nahoru', '<path d="M12 18V6M6.5 11.5 12 6l5.5 5.5"/>'], ['down', 'Posunout dolů', '<path d="M12 6v12M6.5 12.5 12 18l5.5-5.5"/>'],
    ['dup', 'Duplikovat', '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'],
    ['del', 'Smazat', '<path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7"/>']];
  function itemRow(x, i) {
    const v = num(x.mn) * num(x.cena);
    return `<div class="it${offItem(S, x) ? ' it--off' : ''}${x.link && !x.manual ? ' it--link' : ''}" data-item="${i}" title="${rowTitle(x)}">
      <textarea class="it__popis" rows="1" data-if="popis" placeholder="Popis položky" aria-label="Popis">${esc(x.popis)}</textarea>
      <input class="it__mn" inputmode="decimal" data-if="mn" value="${esc(x.mn)}" placeholder="Množ." aria-label="Množství">
      <select class="it__jed" data-if="jed" aria-label="Jednotka">${UNITS.map((u) => `<option${u === x.jed ? ' selected' : ''}>${u}</option>`).join('')}</select>
      <input class="it__cena${x.popis && !num(x.cena) && !offItem(S, x) ? ' is-empty' : ''}" inputmode="decimal" data-if="cena" value="${esc(x.cena)}" placeholder="Kč za jedn." aria-label="Cena za jednotku">
      <input class="it__zar" data-if="zaruka" value="${esc(x.zaruka || '')}" placeholder="Záruka" aria-label="Záruka" title="Záruka (zobrazí se v PDF jako sloupec)">
      <output class="it__sum${v ? '' : ' is-zero'}" data-isum>${v ? kc(v) : '–'}</output>
      <span class="it__act">${IACT.map(([a, label, path]) => `<button type="button" data-iact="${a}" title="${label}" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg></button>`).join('')}</span></div>`;
  }
  function renderItems() {
    syncLinked(S);
    groups = groupsOf(S.items);
    $('[data-items]').innerHTML = groups.map((g, gi) => `<div class="ig" data-g="${gi}">
      <div class="ig__head"><input class="ig__name" data-gname="${gi}" value="${esc(g.k)}" placeholder="Název skupiny, např. Práce" aria-label="Název skupiny"><output class="ig__sum" data-gsum="${gi}"></output><span class="ig__pad"></span></div>
      ${g.idx.map((i) => itemRow(S.items[i], i)).join('')}
      <button type="button" class="ig__add" data-gadd="${gi}">+ Položka do skupiny</button></div>`).join('');
    autosize(); updateTotalsInEditor();
  }
  function autosize() { document.querySelectorAll('.it__popis').forEach((ta) => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }); }
  function updateTotalsInEditor() {
    document.querySelectorAll('[data-item]').forEach((row) => {
      const x = S.items[row.dataset.item]; if (!x) return;
      const v = num(x.mn) * num(x.cena);
      const sumEl = row.querySelector('[data-isum]'); sumEl.textContent = v ? kc(v) : '–'; sumEl.classList.toggle('is-zero', !v);
      row.querySelector('[data-if="cena"]').classList.toggle('is-empty', !!x.popis && !num(x.cena) && !offItem(S, x));
    });
    groups.forEach((g, gi) => { const el = document.querySelector(`[data-gsum="${gi}"]`); if (!el) return; const v = g.idx.reduce((a, i) => a + (offItem(S, S.items[i]) ? 0 : num(S.items[i].mn) * num(S.items[i].cena)), 0); el.textContent = v ? kc(v) : ''; });
    const tt = totals(S), lab = priceLabel(S, tt);
    $('[data-itotal]').innerHTML = tt.sum ? `<span>Součet položek ${kc(tt.sum)}${tt.sleva ? ` · po slevě ${kc(tt.zaklad)}` : ''}</span><b>${kc(tt.celkem)}${lab ? ' ' + lab : ''}</b>` : '<span>Zatím bez cen</span>';
  }
  const itemsBox = $('[data-items]');
  itemsBox.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.gname !== undefined) { // přejmenování skupiny = všechny její položky
      const g = groups[el.dataset.gname]; g.idx.forEach((i) => { S.items[i].kat = el.value; }); g.k = el.value; refresh(); return;
    }
    const row = el.closest('[data-item]');
    if (!row || !el.dataset.if) return;
    const it = S.items[row.dataset.item];
    it[el.dataset.if] = el.value;
    if (it.link && (el.dataset.if === 'popis' || el.dataset.if === 'mn')) { it.manual = true; row.classList.remove('it--link'); row.title = ''; }
    if (el.dataset.if === 'zaruka') it.zarukaManual = true;
    if (el.tagName === 'TEXTAREA') { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
    refresh();
  });
  // stejně pojmenované skupiny se sloučí; až po dokončení kliknutí, které změnu vyvolalo
  itemsBox.addEventListener('change', (e) => {
    if (e.target.dataset.gname === undefined) return;
    const names = groups.map((g) => g.k);
    if (new Set(names).size !== names.length) setTimeout(renderItems, 250);
  });
  itemsBox.addEventListener('focusout', (e) => {
    const el = e.target, f = el.dataset.if;
    if (f !== 'mn' && f !== 'cena') return;
    const v = el.value.trim(); if (!v || !/^[\d\s\u00a0.,]+$/.test(v)) return;
    const pretty = num(v).toLocaleString('cs-CZ', { maximumFractionDigits: 2 }).replace(/\s/g, ' ');
    if (pretty === v) return;
    el.value = pretty; S.items[el.closest('[data-item]').dataset.item][f] = pretty; refresh();
  });
  itemsBox.addEventListener('keydown', (e) => {
    // Enter v ceně = nová položka pod
    if (e.key === 'Enter' && e.target.dataset.if === 'cena') { e.preventDefault(); const i = +e.target.closest('[data-item]').dataset.item; addItem(i + 1, S.items[i].kat); }
  });
  itemsBox.addEventListener('click', (e) => {
    const add = e.target.closest('[data-gadd]');
    if (add) { const g = groups[add.dataset.gadd]; addItem(g.idx.at(-1) + 1, g.k); return; }
    const b = e.target.closest('[data-iact]'); if (!b) return;
    const i = +b.closest('[data-item]').dataset.item, it = S.items;
    const g = groups.find((y) => y.idx.includes(i)), pos = g.idx.indexOf(i);
    const swap = (j) => { [it[i], it[j]] = [it[j], it[i]]; };
    if (b.dataset.iact === 'del') {
      const removed = it.splice(i, 1)[0];
      if (!it.length) it.push(I('', '', 'kpl'));
      toast(`Položka „${(removed.popis || 'bez popisu').slice(0, 40)}“ smazána.`, ['Vrátit', () => { S.items.splice(i, 0, removed); renderItems(); refresh(); }]);
    }
    if (b.dataset.iact === 'dup') it.splice(i + 1, 0, { ...it[i], link: undefined, manual: undefined });
    if (b.dataset.iact === 'up' && pos > 0) swap(g.idx[pos - 1]);
    if (b.dataset.iact === 'down' && pos < g.idx.length - 1) swap(g.idx[pos + 1]);
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
    fve: { n: 'Fotovoltaika', d: 'Sestava z katalogu, úvěr NZÚ', make: () => ({ nazev: 'Fotovoltaická elektrárna pro váš dům', foto: 'rd-fve-hero', kryt: { ...defaultKryt(), ano: false }, okna: { ...defaultOkna(), ano: false }, fve: { ...FV.def(), on: true },
      items: [], shrnuti: SHR.fve, fakta: [{ k: 'Výkon', v: '' }, { k: 'Baterie', v: '' }, { k: 'Doba realizace', v: '' }] }) },
    'strecha-fve': { n: 'Střecha + fotovoltaika', d: 'Nová střecha a rovnou panely, jedno lešení', make: () => ({ nazev: 'Nová střecha a fotovoltaika', kryt: defaultKryt('falc', 'comax'), okna: { ...defaultOkna(), ano: false },
      fve: { ...FV.def(), on: true, strecha: 'falc' }, items: copyItems('plech').filter((x) => !['okno', 'lem', 'okna'].includes(x.link)),
      shrnuti: `${SHR.plech.split('\n').filter((x) => !/oken/.test(x)).join('\n')}\n${SHR.fve.split('\n').slice(1, 3).join('\n')}`,
      fakta: [{ k: 'Výkon', v: '' }, { k: 'Baterie', v: '' }, { k: 'Doba realizace', v: '' }] }) },
  };

  function newOffer(partial = {}) {
    const s = migrate(Object.assign(blank(), JSON.parse(JSON.stringify(partial))));
    syncFve(s);
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
    if (act === 'preview') setPreview(document.body.classList.contains('no-pv'));
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
    if (act === 'add-group') { addItem(S.items.length, ''); const n = itemsBox.querySelectorAll('.ig__name'); const last = n[n.length - 1]; if (last) last.focus(); }
    if (act === 'add-prod') { S.prods.push({ nadpis: '', nazev: '', vyrobce: '', barva: '', hex: '', body: '', img: '' }); renderProds(); refresh(); }
    if (act === 'pdf') {
      const c = checks(S);
      if (c.length && !confirm(`Ještě chybí:\n• ${c.map((x) => x[0]).join('\n• ')}\n\nStáhnout PDF i tak?`)) { goto(c[0][1]); return; }
      saveCurrent(true);
      const old = document.title;
      document.title = `Nabídka ${S.cislo}${S.zak.jmeno ? ' ' + S.zak.jmeno : ''}`.replace(/[\\/:*?"<>|]/g, '');
      toast('V okně tisku zvolte „Uložit jako PDF“ a měřítko 100 %. Okraje Výchozí i Žádné vyjdou stejně.');
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
  function toast(msg, action) {
    let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${action[0]}</button>` : ''}`;
    if (action) el.querySelector('button').onclick = () => { action[1](); el.classList.remove('is-on'); };
    el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on'), action ? 7000 : 4200);
  }


  // první spuštění: vzorová nabídka v přehledu, rozpracovaná nabídka se uloží do seznamu
  if (!listAll().length && !S) { S = demo(); S.cislo = 'VZOR'; }
  if (S) saveCurrent(true);
  go(location.hash === '#nabidka' && S ? 'edit' : 'board');
  document.fonts && document.fonts.ready.then(() => S && refresh());
})();
