/* PROOZE – pohyb: hero „západ slunce“, skládání střechy scrollem, odkrývání, čísla, logo.
   Jedna smyčka requestAnimationFrame, počítá se jen to, co je vidět. Bez WebGL.
   Při prefers-reduced-motion se vše ukáže hotové a nic se nehýbe. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__motionOK = true;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const seg = (p, start, dur) => ease(clamp((p - start) / dur));

  /* ---------- Střecha vrstvu po vrstvě: geometrie (metry → obrazovka) ---------- */
  const X = 10, Z = 8, H = 3, TAN = Math.tan((38 * Math.PI) / 180);
  const YR = H + (Z / 2) * TAN; // výška hřebene
  const U = 50, OX = 46, OY = 452;
  const pr = (x, y, z) => [OX + U * (x * 0.95 + z * 0.62), OY - U * y + U * (x * 0.2 - z * 0.42)];
  const N = [0, Math.cos(0.663), -Math.sin(0.663)]; // normála přední plochy střechy (38°)
  const OV = 0.45; // přesah u okapu i na štítu
  const SL = (Z / 2 + OV) / Math.cos(0.663); // délka krokve po spádu
  // bod na střešní rovině: x podél okapu, d po spádu od okapu, l nadzvednutí nad krokve
  const R = (x, d, l = 0) => {
    const z = -OV + d * Math.cos(0.663);
    const y = H - OV * TAN + d * Math.sin(0.663);
    return pr(x + N[0] * l, y + N[1] * l, z + N[2] * l);
  };
  const pts = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
  const poly = (arr, cls, extra = '') => `<polygon class="${cls}" points="${pts(arr)}"${extra}/>`;
  const xL = -OV, xR = X + OV;

  function buildRoof(svg) {
    let s = `<defs>
      <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCE8F2"/><stop offset="1" stop-color="#FBF3E4"/></linearGradient>
      <linearGradient id="st-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A3B4D"/><stop offset=".55" stop-color="#121B25"/><stop offset="1" stop-color="#0B1118"/></linearGradient>
      <linearGradient id="st-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="st-sun"><stop offset="0" stop-color="#FFE08A"/><stop offset=".45" stop-color="#FFC83A" stop-opacity=".9"/><stop offset="1" stop-color="#FFC83A" stop-opacity="0"/></radialGradient>
      <clipPath id="st-pv-clip"></clipPath>
    </defs>`;
    s += `<g class="st-sun" data-l="sun"><circle cx="96" cy="70" r="110" fill="url(#st-sun)"/><circle cx="96" cy="70" r="30" fill="#FFC83A"/></g>`;
    // stín na zemi a zdi (vždy vidět)
    s += `<ellipse cx="${pr(X / 2 + 3, 0, Z / 2)[0]}" cy="${pr(X / 2, 0, Z / 2)[1] + 8}" rx="360" ry="46" fill="#0F3A2E" opacity=".08"/>`;
    s += poly([pr(X, 0, 0), pr(X, 0, Z), pr(X, H, Z), pr(X, YR, Z / 2), pr(X, H, 0)], 'st-gable');
    s += poly([pr(0, 0, 0), pr(X, 0, 0), pr(X, H, 0), pr(0, H, 0)], 'st-wall');
    [[1.2, 1.1], [3.4, 1.1], [7.6, 1.1]].forEach(([x, y]) => { s += poly([pr(x, y, 0), pr(x + 1.3, y, 0), pr(x + 1.3, y + 1.3, 0), pr(x, y + 1.3, 0)], 'st-win'); });
    s += poly([pr(5.4, 0, 0), pr(6.5, 0, 0), pr(6.5, 2.2, 0), pr(5.4, 2.2, 0)], 'st-door');
    s += poly([pr(X + 0.01, 1.2, 2.6), pr(X + 0.01, 1.2, 3.9), pr(X + 0.01, 2.4, 3.9), pr(X + 0.01, 2.4, 2.6)], 'st-win');
    // pozednice a hřebenová vaznice
    s += poly([pr(-0.1, H, -0.1), pr(X + 0.1, H, -0.1), pr(X + 0.1, H + 0.15, -0.1), pr(-0.1, H + 0.15, -0.1)], 'st-wood2');

    // 1) krov
    s += `<g data-l="krov">`;
    const raf = [0, 1.25, 2.5, 3.75, 5, 6.25, 7.5, 8.75, 10];
    raf.forEach((x, i) => {
      const w = 0.08;
      s += `<g class="st-u" data-k="krov" data-i="${i}">` +
        poly([R(x - w, 0, -0.18), R(x + w, 0, -0.18), R(x + w, SL, -0.18), R(x - w, SL, -0.18)], 'st-wood2') +
        poly([R(x + w, 0, 0), R(x + w, 0, -0.18), R(x + w, SL, -0.18), R(x + w, SL, 0)], 'st-wood2') +
        poly([R(x - w, 0, 0), R(x + w, 0, 0), R(x + w, SL, 0), R(x - w, SL, 0)], 'st-wood') + '</g>';
    });
    s += `<g class="st-u" data-k="krov" data-i="9">` + poly([R(xL, SL - 0.1, 0.02), R(xR, SL - 0.1, 0.02), R(xR, SL + 0.05, 0.02), R(xL, SL + 0.05, 0.02)], 'st-wood') + '</g>';
    s += `</g>`;

    // zadní svah: jeho hrana nad štítem
    const back = (l1, l2) => [pr(X + OV, YR + l2, Z / 2), pr(X + OV, H - OV * TAN + l2, Z + OV), pr(X + OV, H - OV * TAN + l1, Z + OV), pr(X + OV, YR + l1, Z / 2)];
    s += `<g class="st-u" data-k="krov" data-i="10">` + poly(back(-0.18, 0), 'st-wood2') + '</g>';
    s += `<g class="st-u" data-k="zadni">` + poly(back(0, 0.3), 'st-rake') + poly(back(0.22, 0.32), 'st-ridge') + '</g>';

    // 2) fólie
    s += `<g data-l="folie"><g class="st-u" data-k="folie">` + poly([R(xL, 0, 0.02), R(xR, 0, 0.02), R(xR, SL, 0.02), R(xL, SL, 0.02)], 'st-foil');
    for (let d = 1.4; d < SL; d += 1.4) s += `<polyline class="st-foil-line" points="${pts([R(xL, d, 0.025), R(xR, d, 0.025)])}"/>`;
    s += `</g></g>`;

    // 3) kontralatě + latě
    s += `<g data-l="late"><g class="st-u" data-k="kontra">`;
    raf.forEach((x) => { s += poly([R(x - 0.03, 0, 0.04), R(x + 0.03, 0, 0.04), R(x + 0.03, SL, 0.04), R(x - 0.03, SL, 0.04)], 'st-batten'); });
    s += `</g><g class="st-u" data-k="late">`;
    for (let d = 0.18; d < SL; d += 0.36) s += poly([R(xL, d, 0.08), R(xR, d, 0.08), R(xR, d + 0.06, 0.08), R(xL, d + 0.06, 0.08)], 'st-batten');
    s += `</g></g>`;

    // 4) krytina: řady pálených tašek od okapu k hřebeni
    s += `<g data-l="krytina">`;
    const rowH = 0.36, tw = 0.3;
    const rows = Math.ceil(SL / rowH);
    for (let r = 0; r < rows; r++) {
      const d0 = r * rowH, d1 = Math.min(SL, d0 + rowH + 0.08);
      let path = '';
      for (let x = xL; x < xR - 0.01; x += tw) {
        const x2 = Math.min(xR, x + tw);
        const a = R(x, d0 + 0.05, 0.14), b = R(x2, d0 + 0.05, 0.14), c = R(x2, d1, 0.14), e = R(x, d1, 0.14), m = R((x + x2) / 2, d0 - 0.06, 0.16);
        path += `M${e[0].toFixed(1)},${e[1].toFixed(1)}L${a[0].toFixed(1)},${a[1].toFixed(1)}Q${m[0].toFixed(1)},${m[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}L${c[0].toFixed(1)},${c[1].toFixed(1)}Z`;
      }
      const hl = [R(xL, d0 + 0.02, 0.15), R(xR, d0 + 0.02, 0.15)];
      s += `<g class="st-u" data-k="krytina" data-i="${r}"><path class="st-tile" d="${path}"/><polyline class="st-tile-hl" points="${pts(hl)}"/></g>`;
    }
    // hřebenáče
    s += `<g class="st-u" data-k="krytina" data-i="${rows}">` + poly([R(xL, SL - 0.12, 0.2), R(xR, SL - 0.12, 0.2), R(xR, SL + 0.12, 0.3), R(xL, SL + 0.12, 0.3)], 'st-ridge') + '</g>';
    // štítová hrana: řez vrstvami
    s += `<g class="st-u" data-k="krytina" data-i="${rows}">` + poly([R(xR, 0, -0.18), R(xR, SL, -0.18), R(xR, SL, 0.18), R(xR, 0, 0.18)], 'st-rake') + '</g>';
    s += `</g>`;

    // 5) háky, lišty, panely (3 řady × 5 panelů na šířku 1,76 × 1,13 m)
    s += `<g data-l="pv">`;
    const pw = 1.76, ph = 1.13, gap = 0.04, cols = 5, prow = 3;
    const x0 = (X - (cols * pw + (cols - 1) * gap)) / 2, dStart = 0.9;
    const rails = [];
    for (let r = 0; r < prow; r++) { const d = dStart + r * (ph + gap); rails.push(d + 0.25, d + ph - 0.25); }
    s += `<g class="st-u" data-k="haky">`;
    rails.forEach((d) => {
      for (let i = 0; i <= cols * 2; i++) {
        const x = x0 + 0.3 + i * ((cols * pw - 0.6) / (cols * 2));
        s += poly([R(x - 0.05, d - 0.06, 0.16), R(x + 0.05, d - 0.06, 0.16), R(x + 0.05, d + 0.06, 0.26), R(x - 0.05, d + 0.06, 0.26)], 'st-hook');
      }
    });
    rails.forEach((d) => { s += poly([R(x0 - 0.1, d - 0.03, 0.27), R(x0 + cols * pw + 0.3, d - 0.03, 0.27), R(x0 + cols * pw + 0.3, d + 0.04, 0.27), R(x0 - 0.1, d + 0.04, 0.27)], 'st-rail'); });
    s += `</g>`;
    let clip = '', k = 0;
    for (let r = 0; r < prow; r++) {
      for (let c = 0; c < cols; c++) {
        const xa = x0 + c * (pw + gap), da = dStart + r * (ph + gap), L = 0.32;
        const q = [R(xa, da, L), R(xa + pw, da, L), R(xa + pw, da + ph, L), R(xa, da + ph, L)];
        let cells = '';
        for (let i = 1; i < 6; i++) cells += `<polyline class="st-cell" points="${pts([R(xa + (pw * i) / 6, da, L + 0.005), R(xa + (pw * i) / 6, da + ph, L + 0.005)])}"/>`;
        for (let i = 1; i < 3; i++) cells += `<polyline class="st-cell" points="${pts([R(xa, da + (ph * i) / 3, L + 0.005), R(xa + pw, da + (ph * i) / 3, L + 0.005)])}"/>`;
        s += `<g class="st-u" data-k="panel" data-i="${k++}">` + poly(q, 'st-panel') + cells + '</g>';
        clip += `<polygon points="${pts(q)}"/>`;
      }
    }
    s += `<g clip-path="url(#st-pv-clip)"><rect class="st-shine" data-k="shine" x="-260" y="0" width="200" height="600" fill="url(#st-shine)" transform="skewX(-24)"/></g>`;
    s += `</g>`;
    svg.insertAdjacentHTML('beforeend', s);
    svg.querySelector('#st-pv-clip').innerHTML = clip;
  }

  // časování vrstev v průběhu příběhu (p 0–1, 6 kroků po 1/6)
  const S6 = 1 / 6;
  const PLAN = {
    krov: (i) => [0.005 + i * 0.011, 0.07],
    folie: () => [S6 + 0.01, 0.1],
    kontra: () => [2 * S6 + 0.005, 0.07],
    late: () => [2 * S6 + 0.06, 0.08],
    krytina: (i) => [3 * S6 + i * 0.0085, 0.05],
    zadni: () => [3 * S6 + 0.11, 0.05],
    haky: () => [4 * S6 + 0.005, 0.06],
    panel: (i) => [4 * S6 + 0.05 + i * 0.0065, 0.05],
  };
  const LIFT = { krov: [0, -70], folie: [-18, -40], kontra: [0, -40], late: [0, -40], krytina: [-6, -34], zadni: [0, -30], haky: [0, -20], panel: [60, -90] };

  function initStory(story) {
    const svg = story.querySelector('[data-story-svg]');
    buildRoof(svg);
    const units = [...svg.querySelectorAll('.st-u')].map((el) => ({ el, k: el.dataset.k, i: +(el.dataset.i || 0) }));
    const shine = svg.querySelector('[data-k="shine"]');
    const sun = svg.querySelector('[data-l="sun"]');
    const steps = [...story.querySelectorAll('.story__steps li')];
    const dots = [...story.querySelectorAll('.story__dots li')];
    const kwh = story.querySelector('[data-story-kwh]');
    let last = -1, lastStep = -1;
    const render = (p) => {
      if (Math.abs(p - last) < 0.0008) return;
      last = p;
      units.forEach(({ el, k, i }) => {
        const [st, du] = PLAN[k](i);
        const e = seg(p, st, du);
        const [lx, ly] = LIFT[k];
        el.setAttribute('transform', e >= 1 ? '' : `translate(${(lx * (1 - e)).toFixed(1)} ${(ly * (1 - e)).toFixed(1)})`);
        el.style.opacity = e.toFixed(3);
      });
      const e5 = seg(p, 5 * S6, 0.12);
      shine.setAttribute('x', (-300 + e5 * 1100).toFixed(0));
      sun.style.opacity = (0.35 + 0.65 * seg(p, 4.6 * S6, 0.12)).toFixed(3);
      kwh.style.opacity = e5.toFixed(3);
      kwh.style.transform = `translateY(${((1 - e5) * 16).toFixed(1)}px)`;
      const step = Math.min(5, Math.floor(p / S6 + 0.0001));
      if (step !== lastStep) {
        lastStep = step;
        story.dataset.step = step;
        steps.forEach((li, i) => { li.classList.toggle('is-on', i === step); li.classList.toggle('is-done', i < step); });
        dots.forEach((li, i) => li.classList.toggle('is-on', i <= step));
      }
    };
    return {
      el: story,
      update() {
        const r = story.getBoundingClientRect();
        const span = r.height - innerHeight;
        render(clamp(span > 0 ? -r.top / span : 1));
      },
      done() { render(1); },
    };
  }

  /* ---------- Hero: nápis zapadá za střechu ---------- */
  function initHero(hero) {
    let last = -1;
    return {
      el: hero,
      update() {
        const r = hero.getBoundingClientRect();
        const p = clamp(-r.top / (r.height * 0.85));
        if (Math.abs(p - last) < 0.002) return;
        last = p;
        hero.style.setProperty('--hp', p.toFixed(3));
      },
    };
  }

  /* ---------- spuštění ---------- */
  const scenes = [];
  const story = document.querySelector('[data-story]');
  const hero = document.querySelector('.hero');
  if (story) {
    const sc = initStory(story);
    if (reduce) { story.classList.add('story--static'); sc.done(); } else scenes.push(sc);
  }
  if (hero && !reduce) scenes.push(initHero(hero));

  if (scenes.length) {
    const active = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const sc = scenes.find((s) => s.el === e.target);
      if (e.isIntersecting) active.add(sc); else active.delete(sc);
    }), { rootMargin: '100px 0px' });
    scenes.forEach((s) => io.observe(s.el));
    let ticking = false;
    const tick = () => { ticking = false; active.forEach((s) => s.update()); };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    scenes.forEach((s) => s.update());
  }

  if (reduce) return;

  /* ---------- Odkrývání fotek, nadpisů a čísel při příchodu do výřezu ---------- */
  const reveal = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    reveal.unobserve(e.target);
    if (e.target.dataset.countTo) countUp(e.target);
  }), { rootMargin: '0px 0px -12% 0px' });

  document.querySelectorAll('.svc__ph, .seg, .bento__t, .splitc, .kit__media, .combo__media, .signs__media, .svj__media, .mats__stage, .offer, .pillars li, .flow__i')
    .forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--rv-d', `${(i % 3) * 70}ms`); reveal.observe(el); });

  // nadpisy H2: slova vyjíždějí zespodu
  document.querySelectorAll('.h2, .final__h, .story__h').forEach((h) => {
    if (h.closest('[data-quiz]')) return;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/( )/);
          const frag = document.createDocumentFragment();
          parts.forEach((w) => {
            if (w === ' ') { frag.append(' '); return; }
            if (!w) return;
            const o = document.createElement('span'); o.className = 'wd';
            const i = document.createElement('span'); i.className = 'wd__i'; i.textContent = w;
            o.append(i); frag.append(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('sr')) walk(n);
      });
    };
    walk(h);
    h.querySelectorAll('.wd__i').forEach((w, i) => w.style.setProperty('--wd', `${i * 45}ms`));
    h.classList.add('rv-h');
    reveal.observe(h);
  });

  // čísla
  function countUp(el) {
    const to = parseFloat(el.dataset.countTo);
    const suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1100;
    const step = (t) => {
      const e = ease(clamp((t - t0) / dur));
      el.textContent = Math.round(to * e).toLocaleString('cs-CZ') + suf;
      if (e < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  document.querySelectorAll('.guar dt, .facts__n, .warranty dt, .bento__big').forEach((el) => {
    const m = el.textContent.replace(/ /g, ' ').match(/^(\D*)(\d+)(.*)$/);
    if (!m || m[1] || +m[2] > 1900) return;
    el.dataset.countTo = m[2];
    el.dataset.suffix = m[3];
    el.textContent = '0' + m[3];
    reveal.observe(el);
  });

  // logo v patičce: moduly se rozsvítí
  document.querySelectorAll('[data-reveal-logo]').forEach((el) => reveal.observe(el));
})();
