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

  /* ---------- Vrstvu po vrstvě: sekvence snímků stavby, převíjí se scrollem ----------
     Snímky assets/video/frames/000–079.webp se kreslí do canvasu; načítají se postupně
     (nejdřív každý 8., pak 4., 2. a zbytek), kreslí se vždy nejbližší načtený. */
  const frameAt = (p, n) => clamp((p - 0.08) / 0.84) * (n - 1);
  const stepAt = (p, f) => (p < 0.1 ? 0 : f <= 26 ? 1 : f <= 53 ? 2 : p < 0.94 ? 3 : 4);

  function initStory(story) {
    const N = +story.dataset.frames || 80;
    const canvas = story.querySelector('[data-story-canvas]');
    const poster = story.querySelector('[data-story-poster]');
    const ctx = canvas.getContext('2d');
    const base = poster.getAttribute('src').replace(/000\.webp$/, '');
    const imgs = new Array(N);
    const steps = [...story.querySelectorAll('.story__steps li')];
    const dots = [...story.querySelectorAll('.story__dots li')];
    const kwh = story.querySelector('[data-story-kwh]');
    let target = 0, shown = 0, drawn = -1, raf = 0, lastStep = -1, started = false;

    const nearest = (i) => {
      for (let d = 0; d < N; d++) {
        const a = imgs[i - d], b = imgs[i + d];
        if (a && a.complete && a.naturalWidth) return a;
        if (b && b.complete && b.naturalWidth) return b;
      }
      return null;
    };
    const draw = () => {
      raf = 0;
      shown += (target - shown) * 0.28;
      if (Math.abs(target - shown) < 0.05) shown = target;
      const i = Math.round(shown);
      const img = nearest(i);
      if (img && +img.dataset.i !== drawn) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawn = +img.dataset.i;
        story.classList.add('is-ready');
      }
      if (shown !== target) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const load = () => {
      if (started) return;
      started = true;
      const order = [];
      [8, 4, 2, 1].forEach((st) => { for (let i = 0; i < N; i += st) if (!order.includes(i)) order.push(i); });
      if (!order.includes(N - 1)) order.splice(1, 0, N - 1);
      let k = 0;
      const next = () => {
        if (k >= order.length) return;
        const i = order[k++];
        const img = new Image();
        img.decoding = 'async';
        img.dataset.i = i;
        img.onload = img.onerror = () => { kick(); next(); };
        img.src = `${base}${String(i).padStart(3, '0')}.webp`;
        imgs[i] = img;
      };
      for (let c = 0; c < 4; c++) next(); // 4 souběžná stahování
    };
    const render = (p) => {
      target = frameAt(p, N);
      kick();
      const step = stepAt(p, target);
      if (step !== lastStep) {
        lastStep = step;
        steps.forEach((li, i) => { li.classList.toggle('is-on', i === step); li.classList.toggle('is-done', i < step); });
        dots.forEach((li, i) => li.classList.toggle('is-on', i <= step));
      }
      const e = seg(p, 0.92, 0.05);
      kwh.style.opacity = e.toFixed(3);
      kwh.style.transform = `translateY(${((1 - e) * 12).toFixed(1)}px)`;
    };
    return {
      el: story,
      near: load,
      update() {
        const r = story.getBoundingClientRect();
        const span = r.height - innerHeight;
        render(clamp(span > 0 ? -r.top / span : 1));
      },
      done() {
        story.classList.add('story--static');
        poster.src = `${base}${String(N - 1).padStart(3, '0')}.webp`;
        steps.forEach((li) => li.classList.add('is-on'));
        kwh.style.opacity = 1;
      },
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
    // na mobilu bez převíjení scrollem: hotová střecha a všechny kroky pod sebou
    if (reduce || matchMedia('(max-width: 960px)').matches) sc.done();
    else {
      scenes.push(sc);
      // video začne stahovat, až se k sekci blíží
      const pre = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { sc.near(); pre.disconnect(); } }, { rootMargin: '1200px 0px' });
      pre.observe(story);
    }
  }
  if (hero && !reduce) scenes.push(initHero(hero));


  /* ---------- Ukázka aplikace: čísla naběhnou, sloupce vyrostou, pak „živá“ data ---------- */
  const app = document.querySelector('[data-app]');
  if (app && !reduce) {
    const fmt = (n, dec) => n.toLocaleString('cs-CZ', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const nums = [...app.querySelectorAll('[data-to]')];
    nums.forEach((el) => { el.textContent = fmt(0, +el.dataset.dec); });
    const main = app.querySelector('[data-app-main]');
    const sold = app.querySelector('[data-app-sold]');
    const bat = app.querySelector('[data-app-bat]');
    const ring = app.querySelector('[data-app-ring]');
    const nowBar = app.querySelectorAll('.app__bars rect.m')[8];
    let timer = 0, live = false, prod = 32.4, sell = 8.1, b = 86;
    const tick = (el, v, dec) => { el.textContent = fmt(v, dec); el.classList.remove('app__tick'); void el.offsetWidth; el.classList.add('app__tick'); };
    const step = () => {
      prod += 0.1; tick(main, prod, 1);
      if (Math.random() < 0.5) { sell += 0.1; tick(sold, sell, 1); }
      if (b < 95 && Math.random() < 0.4) { b += 1; tick(bat, b, 0); ring.setAttribute('stroke-dashoffset', 100 - b); }
      if (nowBar) { const h = Math.min(78, +nowBar.getAttribute('height') + 0.6); nowBar.setAttribute('height', h.toFixed(1)); nowBar.setAttribute('y', (96 - h).toFixed(1)); }
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!live) {
          live = true;
          app.classList.add('is-live');
          nums.forEach((el) => {
            const to = +el.dataset.to, dec = +el.dataset.dec, t0 = performance.now(), dur = 1400;
            const run = (t) => { const k = ease(clamp((t - t0) / dur)); el.textContent = fmt(to * k, dec); if (k < 1) requestAnimationFrame(run); };
            requestAnimationFrame(run);
          });
        }
        if (!timer) timer = setInterval(step, 3200);
      } else if (timer) { clearInterval(timer); timer = 0; }
    }, { threshold: 0.35 }).observe(app);
    // natočení podle scrollu
    const fig = app.closest('.app');
    let lastAp = -1;
    scenes.push({
      el: fig,
      update() {
        const r = fig.getBoundingClientRect();
        const q = clamp((innerHeight - r.top) / (innerHeight + r.height));
        if (Math.abs(q - lastAp) < 0.003) return;
        lastAp = q;
        fig.style.setProperty('--ap', q.toFixed(3));
      },
    });
  }

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
