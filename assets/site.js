/* PROOZE – hlavička, mobilní lišta, poptávkový formulář */
(() => {
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '');
  const dl = (event, data = {}) => { (window.dataLayer = window.dataLayer || []).push({ event, ...data }); };

  /* Odkud návštěvník přišel (první stránka relace) – přikládá se k poptávce */
  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  const attribution = () => { try { return JSON.parse(sessionStorage.getItem('prooze_attr') || '{}'); } catch (e) { return {}; } };
  try {
    const q = new URLSearchParams(location.search);
    const a = attribution();
    const fresh = Object.fromEntries(ATTR_KEYS.map((k) => [k, q.get(k)]).filter(([, v]) => v));
    if (!a.landing || Object.keys(fresh).length) {
      sessionStorage.setItem('prooze_attr', JSON.stringify({ ...(a.landing ? a : { landing: location.pathname, referrer: document.referrer || '' }), ...fresh }));
    }
  } catch (e) { /* bez úložiště jen bez atribuce */ }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (a) dl('contact_click', { type: a.href.startsWith('tel:') ? 'telefon' : 'email', misto: a.closest('[class]') ? a.closest('[class]').className.split(' ')[0] : '' });
  });

  /* Hlavička + mobilní lišta podle scrollu */
  const top = document.querySelector('[data-top]');
  const dock = document.querySelector('[data-dock]');
  const hero = document.querySelector('.hero');
  const form = document.querySelector('#poptavka');
  let formVisible = false;
  // Je pod hlavičkou tmavé pozadí? (sekce v jedli, fotky, formulář, patička) → tmavá varianta karty
  const DARK_PHOTO = '.final, .phero, .seg, .splitc, .bento__t--photo, .svc__ph, .kit__media, .combo__media, .signs__media, .svj__media, .mats__stage, .story__stage';
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b, a = 1] = m.map(Number); return a < 0.5 ? null : (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  let probing = 0, pending = null;
  const probe = () => {
    probing = 0;
    if (!top.classList.contains('is-scrolled')) { top.classList.remove('is-dark'); pending = null; return; }
    const r = top.getBoundingClientRect();
    const xs = [r.left + 30, r.left + r.width / 2, r.right - 30];
    let dark = 0, n = 0;
    xs.forEach((x) => {
      for (const el of document.elementsFromPoint(x, r.top + r.height / 2)) {
        if (top.contains(el)) continue;
        if (/^(IMG|CANVAS|VIDEO|PICTURE)$/.test(el.tagName)) { n++; if (!el.closest('.hero') && el.closest(DARK_PHOTO)) dark++; break; }
        const L = lum(getComputedStyle(el).backgroundColor);
        if (L !== null) { n++; if (L < 0.45) dark++; break; }
      }
    });
    const want = n > 0 && dark / n >= 0.5;
    if (want === top.classList.contains('is-dark')) { pending = null; return; }
    if (pending === want) { top.classList.toggle('is-dark', want); pending = null; } else { pending = want; probing = requestAnimationFrame(probe); }
  };
  // šířka plné hlavičky v px, aby se přechod do karty animoval plynule od skutečné šířky
  const setFull = () => document.documentElement.style.setProperty('--top-full', `${document.documentElement.clientWidth - (innerWidth <= 860 ? 16 : 24)}px`);
  setFull();
  addEventListener('resize', setFull);
  let scrolled = false;
  const onScroll = () => {
    const y = window.scrollY;
    // hystereze: karta od 48 px, zpět až pod 12 px – žádné cukání kolem hranice
    if (!scrolled && y > 48) scrolled = true; else if (scrolled && y < 12) scrolled = false;
    top.classList.toggle('is-scrolled', scrolled);
    if (!probing) probing = requestAnimationFrame(probe);
    if (dock) dock.classList.toggle('is-on', y > (hero ? hero.offsetHeight * .7 : 400) && !formVisible);
  };
  // mobilní lišta se schová nad formulářem a během videa „Vrstvu po vrstvě“
  const hideDockOver = new Set();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) hideDockOver.add(e.target); else hideDockOver.delete(e.target); });
      formVisible = hideDockOver.size > 0;
      onScroll();
    }, { threshold: .15 });
    [form, document.querySelector('[data-story]')].filter(Boolean).forEach((el) => io.observe(el));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* Mobilní menu */
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  if (burger && menu) {
    const setMenu = (open) => {
      burger.setAttribute('aria-expanded', open);
      menu.hidden = !open;
      top.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      burger.querySelector('.sr').textContent = open ? 'Zavřít menu' : 'Menu';
    };
    burger.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  }


  /* Poradna: filtr témat, ukazatel čtení, aktivní položka v obsahu */
  const chipsBox = document.querySelector('[data-bchips]');
  if (chipsBox) {
    const cards = [...document.querySelectorAll('.blog .bcard')];
    const pickKat = (kat) => {
      chipsBox.querySelectorAll('.bchip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.kat === kat)));
      cards.forEach((c) => { c.hidden = !!kat && c.dataset.kat !== kat; });
    };
    chipsBox.addEventListener('click', (e) => { const c = e.target.closest('.bchip'); if (c) pickKat(c.dataset.kat); });
    const h = location.hash.replace('#kat-', '');
    if (h && chipsBox.querySelector(`[data-kat="${h}"]`)) pickKat(h);
  }
  const post = document.querySelector('[data-post]');
  if (post) {
    const bar = post.querySelector('[data-progress]');
    const prose = post.querySelector('.prose');
    let ticking = false;
    const read = () => {
      ticking = false;
      const r = prose.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.35 - r.top) / r.height));
      bar.style.setProperty('--read', p.toFixed(3));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(read); } }, { passive: true });
    read();
    const links = [...post.querySelectorAll('[data-toc] a')];
    if (links.length && 'IntersectionObserver' in window) {
      const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { links.forEach((a) => a.classList.remove('is-on')); const a = byId.get(e.target.id); if (a) a.classList.add('is-on'); }
      }), { rootMargin: '-20% 0px -70% 0px' });
      prose.querySelectorAll('h2[id]').forEach((h2) => io.observe(h2));
    }
    // poměrová měřící událost: dočtení článku
    let sent = false;
    addEventListener('scroll', () => { if (!sent && bar.style.getPropertyValue('--read') >= 0.9) { sent = true; dl('blog_read', { clanek: location.pathname }); } }, { passive: true });
  }

  /* CTA měření */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-cta], [data-pick]');
    if (a) dl('cta_click', { cta: a.dataset.cta || 'pick-' + a.dataset.pick });
  });


  /* Záložky (krytiny, dotace): role=tablist, šipky ← → */
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key] || 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); select(tabs[e.key === 'Home' ? 0 : tabs.length - 1], true); }
      });
    });
  });

  /* Kvíz */
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;
  const steps = [...quiz.querySelectorAll('[data-step]')];
  const byName = Object.fromEntries(steps.map((s) => [s.dataset.step, s]));
  const count = quiz.querySelector('[data-count]');
  const segs = quiz.querySelector('[data-segs]');
  const hint = quiz.querySelector('[data-hint]');
  const timeEl = quiz.querySelector('[data-time]');
  const summary = quiz.querySelector('[data-summary]');
  const back = quiz.querySelector('[data-back]');
  const choice = quiz.querySelector('[data-choice]');
  const err = quiz.querySelector('[data-err]');
  const labels = {
    sluzba: { strecha: 'Střecha', fve: 'Fotovoltaika', oboji: 'Střecha + FVE' },
    objekt: { 'rodinny-dum': 'Rodinný dům', 'bytovy-dum': 'Bytový dům', firma: 'Firma nebo hala', obec: 'Obec, jiné' },
    strecha: { oprava: 'Zatéká', uprava: 'Výměna krytiny', rekonstrukce: 'Celá rekonstrukce', nova: 'Nová střecha' },
    spotreba: { 'do-2000': 'Do 2 000 Kč', '2000-4000': '2 000–4 000 Kč', '4000-7000': '4 000–7 000 Kč', 'nad-7000': 'Víc nebo nevím' },
  };
  const stepName = { sluzba: 'Služba', objekt: 'Stavba', strecha: 'Střecha', spotreba: 'Elektřina' };
  const label = (n) => (labels[n] && labels[n][quiz.elements[n] && quiz.elements[n].value]) || '';
  const flow = () => {
    const s = quiz.elements.sluzba.value;
    if (s === 'fve') return ['sluzba', 'objekt', 'spotreba', 'kontakt'];
    if (s === 'oboji') return ['sluzba', 'objekt', 'strecha', 'spotreba', 'kontakt'];
    return ['sluzba', 'objekt', 'strecha', 'kontakt'];
  };
  let current = 'sluzba';
  let started = false;
  let timer = 0;
  const prefilled = new Set();
  const nextBtn = quiz.querySelector('[data-next]');
  const isChoice = (name) => !['kontakt', 'hotovo'].includes(name);
  const answered = (name) => !!(quiz.elements[name] && quiz.elements[name].value);
  const syncNext = () => { if (nextBtn) nextBtn.hidden = !(isChoice(current) && answered(current)); };

  const show = (name, focus = true) => {
    current = name;
    steps.forEach((s) => { s.hidden = s.dataset.step !== name; });
    const f = flow();
    const i = f.indexOf(name);
    const done = name === 'hotovo';
    count.textContent = done ? 'Hotovo' : `Krok ${i + 1} ${[2, 3, 4].includes(f.length) ? 'ze' : 'z'} ${f.length}`;
    quiz.classList.toggle('is-done', done);
    // segmenty průběhu
    segs.innerHTML = f.map((n, k) => `<li class="${done || k < i ? 'is-done' : k === i ? 'is-on' : ''}"></li>`).join('');
    const left = done ? 0 : f.length - i - 1;
    timeEl.textContent = done ? 'hotovo' : left === 0 ? 'poslední krok' : `zbývá asi ${Math.max(10, left * 8)} s`;
    back.hidden = i <= 0 || done;
    hint.hidden = i > 0 || done;
    // štítky s odpověďmi z předchozích kroků, kliknutím se k nim vrátíte
    const prev = done ? [] : f.slice(0, Math.max(0, i)).filter((n) => isChoice(n) && answered(n));
    choice.innerHTML = prev.map((n) => `<button type="button" class="quiz__ans" data-goto="${n}"><span>${stepName[n]}</span>${label(n)}<svg aria-hidden="true"><use href="#i-edit"/></svg></button>`).join('');
    if (done && summary) {
      summary.innerHTML = f.filter((n) => isChoice(n) && answered(n)).map((n) => `<li><span>${stepName[n]}</span><b>${label(n)}</b></li>`).join('');
    }
    syncNext();
    if (focus) {
      // když začátek formuláře zajel pod hlavičku (hlavně mobil), srovnat ho do výřezu
      const r = quiz.getBoundingClientRect();
      if (r.top < 60 || r.top > innerHeight * 0.55) quiz.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      const el = byName[name];
      const target = done ? el : el.querySelector('input:checked, input');
      if (target) target.focus({ preventScroll: true });
    }
    if (!done && started) dl('form_step', { step: i + 1, step_name: name });
  };
  // další krok; předvyplněné odpovědi (z kalkulačky, sestavy) se přeskakují
  const next = () => {
    clearTimeout(timer);
    const f = flow();
    let i = f.indexOf(current) + 1;
    while (i < f.length - 1 && prefilled.has(f[i]) && answered(f[i])) i++;
    if (i < f.length) show(f[i]);
  };
  // Volba myší nebo prstem posune dál sama (i když už byla zaškrtnutá). Klávesnice jen vybírá,
  // dál se jde Enterem nebo tlačítkem Pokračovat (WCAG 3.2.2).
  quiz.addEventListener('change', (e) => {
    if (e.target.type !== 'radio') return;
    if (!started) { started = true; dl('begin_form'); }
    prefilled.delete(e.target.name);
    syncNext();
  });
  quiz.addEventListener('click', (e) => {
    const opt = e.target.closest('.opt');
    if (!opt || e.detail === 0 || opt.closest('[data-step]').dataset.step !== current) return;
    clearTimeout(timer);
    timer = setTimeout(next, 240);
  });
  quiz.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.type === 'radio') { e.preventDefault(); if (answered(current)) next(); }
  });
  if (nextBtn) nextBtn.addEventListener('click', () => { if (answered(current)) next(); });
  choice.addEventListener('click', (e) => {
    const b = e.target.closest('[data-goto]');
    if (b) show(b.dataset.goto);
  });
  back.addEventListener('click', () => {
    const f = flow();
    const i = f.indexOf(current);
    if (i > 0) show(f[i - 1]);
  });

  /* Místní stránky: obec stavby předvyplněná podle města */
  const obec = document.querySelector('[data-obec]');
  if (obec && obec.dataset.obec && quiz.elements.psc && !quiz.elements.psc.value) quiz.elements.psc.value = obec.dataset.obec;

  /* Předvyplnění poptávky (hero, CTA, kalkulačka, konfigurátor) a skok na 2. krok */
  const prefill = (sluzba, extra = {}) => {
    const setRadio = (name, value) => { if (!value) return; const r = quiz.querySelector(`input[name="${name}"][value="${value}"]`); if (r) r.checked = true; };
    setRadio('sluzba', sluzba);
    ['objekt', 'strecha', 'spotreba'].forEach((n) => { setRadio(n, extra[n]); if (extra[n]) prefilled.add(n); });
    if (extra.poznamka) quiz.elements.poznamka.value = extra.poznamka;
    if (!started) { started = true; dl('begin_form'); }
    // skočit na první krok, který ještě nemá odpověď (u hotové sestavy rovnou na kontakt)
    const target = flow().slice(1).find((n) => n === 'kontakt' || !(quiz.elements[n] && quiz.elements[n].value)) || 'kontakt';
    show(target, false);
    setTimeout(() => { const el = byName[target].querySelector('input:not([name="web"])'); if (el) el.focus({ preventScroll: true }); }, 700);
  };
  document.querySelectorAll('[data-offer]').forEach((a) => a.addEventListener('click', () => {
    const d = a.dataset;
    prefill(d.sluzba || 'fve', { objekt: d.objekt, spotreba: d.spotreba, strecha: d.strecha, poznamka: d.note });
  }));
  document.querySelectorAll('[data-pick]').forEach((a) => a.addEventListener('click', () => prefill(a.dataset.pick)));

  const kc = (n) => `${Math.round(n).toLocaleString('cs-CZ')}\u00a0Kč`;
  const num = (n) => n.toLocaleString('cs-CZ', { maximumFractionDigits: 1 });

  /* Kalkulačka úspory: měsíční platba → velikost FVE, úspora, bezúročný úvěr NZÚ
     předpoklady: 6 Kč/kWh, 1 kWp ≈ 1 000 kWh/rok, úspora až 70 %, panel 450 Wp,
     úvěr 25 000 Kč/kWp + 15 000 Kč/kWh baterie (baterie ≥ výkon), strop 400 000 Kč */
  document.querySelectorAll('[data-sav]').forEach((box) => {
    const range = box.querySelector('[data-bill-range]');
    const chips = [...box.querySelectorAll('[data-bill]')];
    const o = (k) => box.querySelector(`[data-o="${k}"]`);
    let st = {};
    const run = () => {
      const bill = +range.value;
      const year = bill * 12;
      const kwp = Math.min(10, Math.max(3, Math.round((year / 6 / 1000) * 2) / 2));
      const hint = o('hint');
      if (hint) {
        hint.hidden = !(bill < 1500 || bill > 7500);
        hint.textContent = bill < 1500
          ? 'Při nízké spotřebě se často víc vyplatí fotovoltaika jen na ohřev vody. Rádi spočítáme obojí.'
          : 'Při takové spotřebě (tepelné čerpadlo, elektrokotel, elektromobil) navrhneme elektrárnu individuálně, často i větší než 10 kWp.';
      }
      const kwh = kwp;
      const save = Math.min(year * 0.7, kwp * 1000 * 0.75 * 6);
      const loan = Math.min(25000 * kwp + 15000 * kwh, 400000);
      const panels = Math.ceil((kwp * 1000) / 450);
      o('bill').textContent = kc(bill);
      o('now').textContent = `${kc(year)} za rok`;
      o('after').textContent = `${kc(year - save)} za rok`;
      box.querySelector('[data-bar="after"]').style.width = `${Math.max(6, ((year - save) / year) * 100)}%`;
      o('sys').textContent = `${num(kwp)}\u00a0kWp + baterie ${num(kwh)}\u00a0kWh`;
      o('panels').textContent = `přibližně ${panels} panelů, ${Math.round(panels * 2.2)}\u00a0m² střechy`;
      o('save').textContent = `${kc(save)} ročně`;
      o('loan').textContent = kc(loan);
      chips.forEach((c) => c.setAttribute('aria-pressed', String(+c.dataset.bill === bill)));
      range.style.setProperty('--p', `${((bill - range.min) / (range.max - range.min)) * 100}%`);
      st = { bill, kwp, kwh };
    };
    chips.forEach((c) => c.addEventListener('click', () => { range.value = c.dataset.bill; run(); }));
    range.addEventListener('input', run);
    box.querySelector('[data-sav-cta]').addEventListener('click', () => {
      const b = st.bill;
      const spotreba = b < 2000 ? 'do-2000' : b < 4000 ? '2000-4000' : b < 7000 ? '4000-7000' : 'nad-7000';
      prefill('fve', { spotreba, poznamka: `Kalkulačka: platím ${b} Kč měsíčně, doporučeno ${num(st.kwp)} kWp + ${num(st.kwh)} kWh baterie` });
    });
    run();
  });

  /* Konfigurátor střechy a FVE */
  const KR = {
    palena: { name: 'pálená taška', brand: 'Tondach', def: 'antracit', colors: { cervena: ['červená', '#B4502F'], antracit: ['antracit', '#3B3D40'], hneda: ['hnědá', '#6B4433'] } },
    betonova: { name: 'betonová taška', brand: 'Bramac nebo KM Beta', def: 'antracit', colors: { cervena: ['červená', '#A4472E'], antracit: ['antracit', '#46494D'], cerna: ['černá', '#27292C'] } },
    plech: { name: 'plechová krytina', brand: 'Satjam nebo Comax', def: 'hneda', colors: { antracit: ['antracit', '#3A3E42'], hneda: ['hnědá', '#5A3E33'], cervena: ['červená', '#8E3A2C'], cerna: ['černá', '#232528'] } },
    hlinik: { name: 'hliníková krytina', brand: 'Prefa', def: 'antracit', colors: { antracit: ['antracit', '#3C4045'], hneda: ['hnědá', '#5B4436'], stribrna: ['stříbrná', '#9AA1A7'] } },
    sindel: { name: 'kanadský šindel', brand: '', def: 'hneda', colors: { hneda: ['hnědá', '#5B4334'], cerna: ['černá', '#2B2C2E'], cervena: ['červená', '#8A3B2E'] } },
  };
  const SHAPES = { sedlova: [160, 640], valbova: [300, 500] }; // x hřebene vlevo/vpravo; okap 128–672, výška 140–302
  document.querySelectorAll('[data-konf]').forEach((k) => {
    const form = k.querySelector('[data-k-form]');
    const svg = k.querySelector('svg');
    const colorsBox = k.querySelector('[data-k-colors]');
    const panelsG = k.querySelector('[data-k-panels]');
    const val = (n) => (form.elements[n] ? form.elements[n].value : '');
    const on = (n) => form.elements[n] && form.elements[n].checked;
    const renderColors = (mat, keep) => {
      const m = KR[mat];
      const pick = keep && m.colors[keep] ? keep : m.def;
      colorsBox.innerHTML = Object.entries(m.colors).map(([key, [label, hex]]) =>
        `<label class="kcol"><input type="radio" name="k-barva" value="${key}"${key === pick ? ' checked' : ''}><span><i style="background:${hex}"></i>${label}</span></label>`).join('');
    };
    const drawPanels = (n, shape) => {
      const [lt, rt] = SHAPES[shape];
      const edge = (y) => [lt + ((128 - lt) * (y - 140)) / 162, rt + ((672 - rt) * (y - 140)) / 162];
      const rows = [228, 194, 262, 160];
      const W = 44, H = 30, G = 4;
      let left = n, html = '', i = 0;
      const placed = [];
      for (const y of rows) {
        if (left <= 0) break;
        const [l, r] = edge(y);
        const cap = Math.max(0, Math.floor((r - l - 28 + G) / (W + G)));
        const c = Math.min(cap, left);
        if (!c) continue;
        placed.push([y, c]);
        left -= c;
      }
      placed.sort((a, b) => a[0] - b[0]).forEach(([y, c]) => {
        const x0 = 400 - (c * (W + G) - G) / 2;
        for (let j = 0; j < c; j++) {
          html += `<g class="k-panel" style="animation-delay:${(i++) * 30}ms"><rect x="${x0 + j * (W + G)}" y="${y}" width="${W}" height="${H}" rx="2"/><path d="M${x0 + j * (W + G) + W / 2} ${y}V${y + H}M${x0 + j * (W + G)} ${y + H / 2}H${x0 + j * (W + G) + W}"/></g>`;
        }
      });
      panelsG.innerHTML = html;
      return n - left;
    };
    const update = () => {
      const shape = val('k-tvar');
      const mat = val('k-krytina');
      const m = KR[mat];
      const col = val('k-barva') || m.def;
      const [cname, hex] = m.colors[col] || m.colors[m.def];
      const [lt, rt] = SHAPES[shape];
      const pts = `${lt},140 ${rt},140 672,302 128,302`;
      svg.querySelectorAll('[data-k-shape]').forEach((p) => p.setAttribute('points', pts));
      svg.querySelector('[data-k-pattern]').setAttribute('fill', `url(#k-p-${mat})`);
      svg.style.setProperty('--roof', hex);
      const n = +val('k-fve');
      const drawn = drawPanels(n, shape);
      const real = k.placed3d !== undefined ? Math.min(k.placed3d, n) : drawn;
      const kwp = Math.round(real * 0.45 * 10) / 10;
      const bat = on('k-baterie') && real > 0;
      svg.querySelector('[data-k-battery]').classList.toggle('is-off', !bat);
      svg.querySelector('[data-k-wallbox]').classList.toggle('is-off', !on('k-wallbox'));
      svg.querySelector('[data-k-insul]').classList.toggle('is-off', !on('k-zatepleni'));
      const roofTxt = `${shape === 'sedlova' ? 'Sedlová' : 'Valbová'} střecha, ${m.name}${m.brand ? ' ' + m.brand : ''} (${cname})`;
      const extras = [];
      if (real) extras.push(`fotovoltaika ${num(kwp)}\u00a0kWp (${real} panelů)${bat ? ' s baterií' : ''}`);
      if (on('k-wallbox')) extras.push('wallbox');
      if (on('k-zatepleni')) extras.push('zateplení střechy');
      const sum = `${roofTxt}${extras.length ? ', ' + extras.join(', ') : ''}.`;
      k.querySelector('[data-k-sum]').textContent = sum;
      k.querySelector('[data-k-badge]').textContent = `${m.name.charAt(0).toUpperCase() + m.name.slice(1)}, ${cname}${real ? `, ${num(kwp)} kWp` : ''}`;
      k.querySelector('[data-k-alt]').textContent = `Ilustrace domu: ${sum}`;
      const loanEl = k.querySelector('[data-k-loan]');
      if (real && bat) loanEl.innerHTML = `Na fotovoltaiku s&nbsp;baterií můžete dostat bezúročný úvěr až <b>${kc(Math.min(25000 * kwp + 15000 * kwp, 400000))}</b>.`;
      else if (real) loanEl.innerHTML = 'Bez baterie na bezúročný úvěr NZÚ nedosáhnete. Přímá dotace NZÚ Light baterii nevyžaduje.';
      else if (on('k-zatepleni')) loanEl.innerHTML = 'Na zateplení střechy můžete čerpat podporu z&nbsp;Nové zelené úsporám. Vyřídíme ji za vás.';
      else loanEl.innerHTML = 'Přidejte panely a&nbsp;uvidíte, kolik můžete dostat bezúročně od státu.';
      k.dataset.sum = sum;
      k.dataset.sluzba = real ? 'oboji' : 'strecha';
      k.konfState = { shape, mat, hex, panels: n, bat: on('k-baterie'), wallbox: on('k-wallbox'), insul: on('k-zatepleni') };
      k.dispatchEvent(new CustomEvent('konf:update', { detail: k.konfState }));
    };
    form.addEventListener('change', (e) => {
      if (e.target.name === 'k-krytina') renderColors(e.target.value, val('k-barva'));
      update();
    });
    form.addEventListener('submit', (e) => e.preventDefault());
    k.querySelector('[data-k-cta]').addEventListener('click', () => prefill(k.dataset.sluzba, { poznamka: `Konfigurátor: ${k.dataset.sum}` }));
    renderColors(val('k-krytina'));
    update();
    // 3D náhled (Three.js) se načte, až je konfigurátor blízko; počet panelů pak určuje 3D střecha
    k.addEventListener('konf:placed', (e) => { if (k.placed3d !== e.detail) { k.placed3d = e.detail; update(); } });
    if ('IntersectionObserver' in window && BASE) {
      const io3d = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io3d.disconnect();
        import(BASE + 'konfig3d.js').then((m) => m.mount(k)).catch((err) => console.warn('3D konfigurátor se nenačetl:', err));
      }, { rootMargin: '600px' });
      io3d.observe(k);
    }
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { dl('view_form'); io.disconnect(); } }, { threshold: .4 });
    io.observe(quiz);
  }

  /* Odeslání: JSON na endpoint z buildu (data-endpoint), bez něj ukázkový režim */
  const T0 = Date.now();
  const send = async (form, payload) => {
    const endpoint = form.dataset.endpoint || window.PROOZE_FORM_ENDPOINT || '';
    const data = { ...payload, ...attribution(), stranka: location.href, cas_s: Math.round((Date.now() - T0) / 1000) };
    if (!endpoint) { console.info('PROOZE (ukázkový režim, nic se neodeslalo):', data); return; }
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error(String(res.status));
  };
  const FAIL = 'Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám zavolejte na 773 898 698.';

  /* Validace a odeslání poptávky */
  const invalid = (input, bad) => { input.setAttribute('aria-invalid', bad ? 'true' : 'false'); return bad; };
  const phoneOk = (v) => /^(\+|00)?(420)?\d{9}$/.test(v.replace(/[\s()./-]/g, ''));
  const fieldErr = (input, bad) => {
    invalid(input, bad);
    const msg = input.getAttribute('aria-describedby') && document.getElementById(input.getAttribute('aria-describedby'));
    if (msg) msg.hidden = !bad;
    return bad;
  };
  quiz.addEventListener('submit', async (e) => {
    e.preventDefault();
    const el = quiz.elements;
    const problems = [
      fieldErr(el.jmeno, el.jmeno.value.trim().length < 2),
      fieldErr(el.telefon, !phoneOk(el.telefon.value)),
      fieldErr(el.email, el.email.value.trim() !== '' && !/^\S+@\S+\.\S+$/.test(el.email.value.trim())),
      fieldErr(el.psc, el.psc.value.trim().length < 2),
    ].filter(Boolean);
    if (problems.length) {
      err.hidden = false;
      err.textContent = 'Opravte prosím zvýrazněná pole.';
      quiz.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    err.hidden = true;
    const data = { typ: 'poptavka', ...Object.fromEntries(new FormData(quiz)) };
    const btn = quiz.querySelector('[type="submit"]');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Odesílám…';
    try {
      await send(quiz, data);
      dl('form_sent', { form: 'poptavka', sluzba: data.sluzba, objekt: data.objekt });
      show('hotovo');
    } catch (x) {
      err.hidden = false;
      err.textContent = FAIL;
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  /* Zavolejte mi: dialog s jménem a telefonem */
  const cb = document.querySelector('[data-callback]');
  if (cb && typeof cb.showModal === 'function') {
    const cbForm = cb.querySelector('form');
    const cbErr = cb.querySelector('[data-err]');
    const open = () => { cb.showModal(); dl('cta_click', { cta: 'callback' }); setTimeout(() => cbForm.elements.jmeno.focus(), 50); };
    const close = () => cb.close();
    document.querySelectorAll('[data-callback-open]').forEach((b) => b.addEventListener('click', open));
    cb.querySelectorAll('[data-callback-close]').forEach((b) => b.addEventListener('click', close));
    cb.addEventListener('click', (e) => { if (e.target === cb) close(); });
    cbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const el = cbForm.elements;
      const bad = [invalid(el.jmeno, el.jmeno.value.trim().length < 2) && 'jméno', invalid(el.telefon, !phoneOk(el.telefon.value)) && 'telefon (9 číslic)'].filter(Boolean);
      if (bad.length) { cbErr.hidden = false; cbErr.textContent = `Zkontrolujte prosím: ${bad.join(', ')}.`; cbForm.querySelector('[aria-invalid="true"]').focus(); return; }
      cbErr.hidden = true;
      const btn = cbForm.querySelector('[type="submit"]');
      btn.disabled = true;
      try {
        await send(cbForm, { typ: 'zavolat', ...Object.fromEntries(new FormData(cbForm)) });
        dl('form_sent', { form: 'zavolat' });
        cbForm.hidden = true;
        cb.querySelector('[data-cb-done]').hidden = false;
      } catch (x) {
        cbErr.hidden = false;
        cbErr.textContent = FAIL;
      }
      btn.disabled = false;
    });
  } else if (cb) {
    document.querySelectorAll('[data-callback-open]').forEach((b) => { b.hidden = true; });
  }

  show('sluzba', false);
})();
