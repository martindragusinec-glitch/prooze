/* Sestava FVE: výpočty, položky rozpočtu a kontroly.
   Pravidla a zdroje: research/pravidla-sestavy.md (kap. 11), data komponent: katalog.js.
   Ceny se tu neřeší – jsou na míru a píšou se do nabídky ručně. */
(() => {
  'use strict';
  const K = (window.PROOZE_KATALOG && window.PROOZE_KATALOG.polozky) || [];
  const byId = Object.fromEntries(K.map((i) => [i.id, i]));
  const ofKat = (k) => K.filter((i) => i.kat === k);

  const STRECHY = {
    'sedlova-taska': 'Konstrukce na sedlovou střechu – taška',
    'sedlova-plech': 'Konstrukce na sedlovou střechu – plech (trapéz, tašková tabule)',
    falc: 'Konstrukce na falcovaný plech, bez provrtání krytiny',
    sindel: 'Konstrukce na šindel',
    'rovna-jih': 'Konstrukce na rovnou střechu – orientace jih',
    'rovna-vz': 'Konstrukce na rovnou střechu – východ/západ',
  };
  const TIGO = { none: 'Bez Tiga', F: 'Odpojovač na každý panel (TS4-A-F)', '2F': 'Odpojovač na dva panely (TS4-A-2F)', O: 'Optimizér na každý panel (TS4-A-O)' };
  const PROGRAM = { bez: 'Bez dotace', nzu: 'NZÚ bezúročný úvěr', light: 'NZÚ Light' };
  const T_MIN = -20; // °C, návrhová teplota pro napětí v mrazu (doporučení z rešerše, trh běžně −10 °C)

  const def = () => ({
    on: false, panel: 'panel-aiko-a450-neostar-2s', pocet: 16, stridac: 'stridac-goodwe-gw10k-et-20',
    baterie: 'baterie-pylontech-force-h3', moduly: 3, tigo: 'F', strecha: 'sedlova-taska', wallbox: '', infigy: false,
    hromosvod: false, program: 'nzu', faze3: true, rd: true, cache: {},
  });

  const r2 = (n) => Math.round(n * 100) / 100;
  const cz = (n, d = 2) => n.toLocaleString('cs-CZ', { maximumFractionDigits: d });
  const pl = (n, a, b, c) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);

  function calc(f) {
    const P = byId[f.panel], I = byId[f.stridac], B = f.baterie ? byId[f.baterie] : null;
    const n = Math.max(0, Math.round(Number(f.pocet) || 0));
    const kwp = P ? r2((n * P.p.vykon_wp) / 1000) : 0;
    const invKs = I && I.p.ks_3f && f.faze3 ? I.p.ks_3f : 1;
    const pac = I ? ((I.p.ac_vykon_w || 0) * invKs) / 1000 : 0;
    const sac = I ? ((I.p.max_ac_zdanlivy_va || I.p.ac_vykon_w || 0) * invKs) / 1000 : 0;
    const moduly = B ? Math.max(0, Math.round(Number(f.moduly) || 0)) : 0;
    const kwh = B ? r2(moduly * B.p.kwh_modul) : 0;
    const pi = Math.max(kwp, pac);
    const uver = f.program === 'nzu' ? Math.min(25000 * kwp + 15000 * kwh, 400000) : 0;
    const dcac = pac ? kwp / pac : 0;
    // stringy (orientačně): napětí v mrazu T_MIN a v horku 70 °C
    let str = null;
    if (P && I && I.p.udc_max && P.p.voc_v && n) {
      const vocCold = P.p.beta_voc != null ? P.p.voc_v * (1 + (P.p.beta_voc / 100) * (T_MIN - 25)) : P.p.voc_v * 1.18;
      const gamma = P.p.teplotni_koef_pmax_pct_c != null ? P.p.teplotni_koef_pmax_pct_c : -0.3;
      const vmpHot = P.p.vmp_v * (1 + (gamma / 100) * 45);
      const nmax = Math.floor(I.p.udc_max / vocCold);
      const nmin = I.p.mppt_min ? Math.ceil(I.p.mppt_min / vmpHot) : 1;
      const s = Math.max(1, Math.ceil(n / nmax));
      const base = Math.floor(n / s), extra = n % s;
      const delky = Array.from({ length: s }, (_, i) => base + (i < extra ? 1 : 0));
      str = { vocCold, vmpHot, nmax, nmin, pocet: s, delky, vstupy: I.p.stringy || null, odhadBeta: P.p.beta_voc == null };
    }
    return { P, I, B, n, kwp, invKs, pac, sac, moduly, kwh, pi, uver, dcac, str };
  }

  // položky rozpočtu: { key, kat, popis, jed, mn, zaruka }
  function lines(f) {
    const c = calc(f), out = [];
    const add = (key, kat, popis, jed, mn, zaruka = '') => out.push({ key, kat, popis, jed, mn: String(mn), zaruka });
    const { P, I, B, n } = c;
    if (P && n) add('panely', 'Panely', `Fotovoltaický panel ${P.kratce}`, 'ks', n, P.zaruka || '');
    const tg = (id) => byId[id];
    if (f.tigo === 'F' && n) { add('tigo', 'Optimizéry Tigo', `Požární odpojovač ${tg('tigo-ts4-a-f').kratce} na každý panel`, 'ks', n, tg('tigo-ts4-a-f').zaruka); add('tigo-rss', 'Optimizéry Tigo', `Řízení odpojovačů ${tg('tigo-rss-transmitter').kratce}`, 'ks', 1, tg('tigo-rss-transmitter').zaruka); }
    if (f.tigo === '2F' && n) { add('tigo', 'Optimizéry Tigo', `Požární odpojovač ${tg('tigo-ts4-a-2f').kratce} pro dva panely`, 'ks', Math.ceil(n / 2), tg('tigo-ts4-a-2f').zaruka); add('tigo-rss', 'Optimizéry Tigo', `Řízení odpojovačů ${tg('tigo-rss-transmitter').kratce}`, 'ks', 1, tg('tigo-rss-transmitter').zaruka); }
    if (f.tigo === 'O' && n) { add('tigo', 'Optimizéry Tigo', `Optimizér ${tg('tigo-ts4-a-o').kratce} na každý panel`, 'ks', n, tg('tigo-ts4-a-o').zaruka); add('tigo-cca', 'Optimizéry Tigo', `Řízení optimizérů ${tg('tigo-cca').kratce}`, 'ks', 1, tg('tigo-cca').zaruka); add('tigo-tap', 'Optimizéry Tigo', `Přístupový bod ${tg('tigo-tap').kratce}`, 'ks', Math.ceil(n / 300), tg('tigo-tap').zaruka); }
    if (I) {
      add('stridac', 'Střídač a baterie', `${I.p.bez_fv_vstupu ? 'Měnič/nabíječ' : 'Hybridní střídač'} ${I.kratce}${c.invKs > 1 ? ' (sestava pro 3 fáze)' : ''}`, 'ks', c.invKs, I.zaruka || '');
      if (I.id === 'stridac-victron-multiplus-ii-48-8000') {
        add('cerbo', 'Střídač a baterie', `Řídicí jednotka ${byId['prislusenstvi-victron-cerbo-gx'].kratce}`, 'ks', 1, byId['prislusenstvi-victron-cerbo-gx'].zaruka);
        add('meter', 'Střídač a baterie', `Elektroměr ${byId['prislusenstvi-victron-energy-meter'].kratce}`, 'ks', 1, byId['prislusenstvi-victron-energy-meter'].zaruka);
      }
    }
    if (B && c.moduly) add('baterie', 'Střídač a baterie', `Baterie ${B.kratce} ${cz(c.kwh)} kWh (${c.moduly} ${pl(c.moduly, 'modul', 'moduly', 'modulů')})`, 'kpl', 1, B.zaruka || '');
    if (n) add('konstrukce', 'Konstrukce', STRECHY[f.strecha] || 'Konstrukce', 'ks', n, '2 roky');
    add('stop', 'Elektroinstalace', 'Bezpečnostní tlačítko pro rychlé vypnutí celé FVE (TOTAL STOP)', 'ks', 1, '2 roky');
    add('rozvadece', 'Elektroinstalace', 'Rozvaděče AC/DC s jištěním a přepěťovými ochranami', 'kpl', 1, '2 roky');
    if (f.hromosvod) add('hromosvod', 'Elektroinstalace', 'Hromosvod: úprava / doplnění zemnicí soustavy', 'kpl', 1, '2 roky');
    add('elektro', 'Elektroinstalace', 'Elektromateriál AC/DC: kabeláž, lišty a montážní materiál', 'kpl', 1, '2 roky');
    if (f.wallbox && byId[f.wallbox]) add('wallbox', 'Doplňky', `Wallbox ${byId[f.wallbox].kratce}`, 'ks', 1, byId[f.wallbox].zaruka || '');
    if (f.infigy) add('infigy', 'Doplňky', 'Chytré řízení energie Infigy', 'ks', 1, '');
    add('montaz', 'Práce', 'Montáž FVE, zapojení a uvedení do provozu', 'kpl', 1, '2 roky');
    if (n) add('montaz-panely', 'Práce', 'Montáž panelů', 'ks', n, '2 roky');
    add('doprava', 'Služby', 'Doprava', 'kpl', 1);
    add('revize', 'Služby', 'Výchozí revize FVE', 'ks', 1);
    if (f.hromosvod) add('revize-hromosvod', 'Služby', 'Revize hromosvodu po úpravě', 'ks', 1);
    add('admin', 'Služby', `Administrativa: připojení k distribuční soustavě${f.program !== 'bez' ? ', žádost ' + PROGRAM[f.program] : ''}`, 'kpl', 1);
    return out;
  }

  // kontroly: { lvl: 'err' | 'warn' | 'info' | 'ok', msg, f (pole v editoru) }
  function checks(f) {
    const c = calc(f), out = [];
    const ch = (lvl, msg, field) => out.push({ lvl, msg, f: field });
    const { P, I, B, n, kwp, kwh } = c;
    if (!P || !n) { ch('err', 'Vyberte panel a počet panelů.', 'pocet'); return out; }
    if (!I) { ch('err', 'Vyberte střídač.', 'stridac'); return out; }
    // výkon a střídač
    if (I.p.max_dc_vstup_wp && kwp * 1000 > I.p.max_dc_vstup_wp) ch('err', `Panely ${cz(kwp)} kWp přesahují max. DC výkon střídače ${cz(I.p.max_dc_vstup_wp / 1000)} kW.`, 'pocet');
    else if (c.dcac > 1.3) ch('info', `Poměr DC/AC ${cz(c.dcac)} je nad běžnou praxí 1,13–1,30, počítejte s ořezem výkonu ve špičce.`, 'pocet');
    else ch('ok', `DC/AC ${cz(c.dcac)}, výkon panelů sedí ke střídači.`, 'pocet');
    if (I.p.bez_fv_vstupu) ch('warn', `${I.kratce} nemá vstup pro panely: doplňte MPPT regulátory nebo síťový střídač.`, 'stridac');
    // stringy
    const s = c.str;
    if (s) {
      const txt = `${s.pocet} ${pl(s.pocet, 'string', 'stringy', 'stringů')}: ${s.delky.join(' + ')} panelů (max. ${s.nmax} v řetězci${s.odhadBeta ? ', orientačně' : ''})`;
      if (s.vstupy && s.pocet > s.vstupy) ch('err', `Potřeba ${s.pocet} stringů, střídač má ${s.vstupy} vstupy. Napětí v mrazu by překročilo ${I.p.udc_max} V.`, 'pocet');
      else if (Math.min(...s.delky) < s.nmin) ch('err', `${txt}. Krátký string bude v horku pod pracovním napětím střídače (min. ${s.nmin} panelů).`, 'pocet');
      else ch('ok', txt + '.', 'pocet');
      if (I.p.iscmax && P.p.isc_a > I.p.iscmax) ch('err', `Zkratový proud panelu ${cz(P.p.isc_a)} A je nad limitem vstupu ${I.p.iscmax} A.`, 'panel');
      else if (I.p.imax && P.p.imp_a > I.p.imax) ch('warn', `Proud panelu ${cz(P.p.imp_a)} A je nad ${I.p.imax} A na vstup, výkon se ořízne.`, 'panel');
    }
    // baterie
    if (B) {
      if (!I.kompat.includes(B.id)) ch('err', `Baterii ${B.kratce} výrobce střídače ${I.kratce} neuvádí jako kompatibilní.`, 'baterie');
      else ch('ok', `${B.kratce} je kompatibilní se střídačem.`, 'baterie');
      const mn = B.p.moduly_min, mx = B.p.moduly_max;
      if (B.id === 'baterie-solax-t-bat-t58' && I.id === 'stridac-solax-x3-hybrid-10-0-d' && (c.moduly < 2 || c.moduly > 4)) ch('err', 'SolaX X3-Hybrid podporuje 2–4 moduly T58.', 'moduly');
      else if ((mn && c.moduly < mn) || (mx && c.moduly > mx)) ch('err', `${B.kratce}: povoleno ${mn}–${mx} modulů.`, 'moduly');
      if (kwh > 20) ch('warn', 'Baterie nad 20 kWh: umístit mimo únikovou cestu, ideálně mimo obytný prostor.', 'moduly');
    }
    // NZÚ
    if (f.program === 'nzu' || f.program === 'light') {
      if (kwp < 3 || !f.faze3) ch('err', 'NZÚ vyžaduje min. 3 kWp a třífázové připojení.', 'program');
      if (P.p.ucinnost_pct && P.p.ucinnost_pct < 18) ch('err', 'Panel nesplní účinnost 18 % pro NZÚ.', 'panel');
    }
    if (f.program === 'nzu') {
      if (!B || kwh < kwp) ch('err', `NZÚ úvěr: baterie ${cz(kwh)} kWh musí mít aspoň tolik kWh jako FVE kWp (${cz(kwp)}).`, 'moduly');
      else ch('ok', `NZÚ úvěr: baterie ${cz(kwh)} kWh ≥ ${cz(kwp)} kWp, max. úvěr ${c.uver.toLocaleString('cs-CZ')} Kč.`, 'program');
    }
    if (f.program === 'light') ch('info', 'NZÚ Light: doplňte ohřívač vody ≥ 190 l s ochranou proti opaření a bivalentním zdrojem.', 'program');
    // připojení
    if (c.pi > 10.8) ch('info', `Instalovaný výkon ${cz(c.pi)} kW je nad 10,8 kW: standardní žádost o připojení, ne mikrozdroj.`, 'pocet');
    else ch('ok', `Mikrozdroj (${cz(c.pi)} kW ≤ 10,8 kW), zjednodušené připojení.`, 'pocet');
    if (c.pi > 100) ch('err', 'Nad 100 kW je potřeba licence ERÚ.', 'pocet');
    // požární bezpečnost
    const rs = ['F', '2F', 'O'].includes(f.tigo);
    if (f.rd && kwp > 10 && !rs) ch('err', 'Nad 10 kWp na rodinném domě je povinné bezpečné DC napětí: zvolte Tigo nebo jiný rapid shutdown.', 'tigo');
    else if (!rs) ch('info', 'Do 10 kWp je rapid shutdown doporučený, ne povinný.', 'tigo');
    ch('ok', 'TOTAL STOP tlačítko je v rozpočtu (povinné u každé FVE na budově).', 'tigo');
    if ((f.tigo === 'F' || f.tigo === '2F') && /goodwe-gw10k-et-20|solax-x3-hybrid/.test(I.id)) ch('warn', `Tigo ${f.tigo === 'F' ? 'TS4-A-F' : 'TS4-A-2F'} s ${I.kratce}: výrobci kombinaci výslovně nepotvrzují, ověřte.`, 'tigo');
    if (f.tigo === '2F' && P.p.imp_a > 15) ch('warn', 'Proud panelu je nad 15 A: TS4-A-2F 20A nestačí, použijte verzi 25 A.', 'tigo');
    if (f.infigy && f.tigo === 'O') ch('warn', 'Infigy nepodporuje Tigo CCA (monitoring optimizérů zůstane v aplikaci Tigo).', 'infigy');
    if (f.infigy && !(byId['rizeni-infigy'].kompat || []).includes(I.id)) ch('warn', `Infigy u střídače ${I.kratce} nemá doloženou podporu.`, 'infigy');
    if (f.wallbox && byId[f.wallbox] && !I.kompat.includes(f.wallbox)) ch('warn', `Wallbox ${byId[f.wallbox].kratce} výrobce střídače neuvádí jako kompatibilní pro řízení z FVE.`, 'wallbox');
    if (f.hromosvod) ch('warn', 'Dům má hromosvod: posoudit dostatečnou vzdálenost, podle ní přepěťová ochrana T2 nebo T1+2, revize hromosvodu.', 'hromosvod');
    if (f.strecha === 'sedlova-taska') ch('info', 'U tašek se u háků upravuje taška, může to ovlivnit záruku krytiny.', 'strecha');
    ch('info', 'Počet úchytů je orientační, konečný určí statický výpočet výrobce konstrukce.', 'strecha');
    return out;
  }

  window.PROOZE_FVE = { K, byId, ofKat, STRECHY, TIGO, PROGRAM, def, calc, lines, checks, cz };
})();
