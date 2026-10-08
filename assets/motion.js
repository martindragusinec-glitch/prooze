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

  /* ---------- Vrstvu po vrstvě: video stavby řízené scrollem ----------
     p 0–1 přes výšku sekce → čas videa (15 s = 3 přechody po 5 s), kroky textu podle p. */
  const KEYS = [[0, 0], [0.1, 0], [0.4, 5], [0.7, 10], [0.95, 15], [1, 15]];
  const STEP_AT = [0, 0.12, 0.4, 0.7, 0.93];
  const timeAt = (p) => {
    for (let i = 1; i < KEYS.length; i++) {
      const [p0, t0] = KEYS[i - 1], [p1, t1] = KEYS[i];
      if (p <= p1) return t0 + (t1 - t0) * (p1 > p0 ? (p - p0) / (p1 - p0) : 0);
    }
    return KEYS[KEYS.length - 1][1];
  };

  function initStory(story) {
    const video = story.querySelector('[data-story-video]');
    const steps = [...story.querySelectorAll('.story__steps li')];
    const bars = [...story.querySelectorAll('.story__bar i')];
    const kwh = story.querySelector('[data-story-kwh]');
    let loaded = false, target = 0, shown = -1, raf = 0, lastStep = -1;
    const load = () => {
      if (loaded) return;
      loaded = true;
      video.src = video.dataset.src;
      video.load();
      // Safari povolí přesné převíjení až po prvním přehrání
      video.play().then(() => video.pause()).catch(() => {});
    };
    const seek = () => {
      raf = 0;
      if (!video.duration) return;
      const d = target - shown;
      if (Math.abs(d) < 0.012) return;
      shown = Math.abs(d) < 0.05 ? target : shown + d * 0.35;
      if (!video.seeking) video.currentTime = Math.min(video.duration - 0.04, Math.max(0, shown));
      raf = requestAnimationFrame(seek);
    };
    video.addEventListener('loadedmetadata', () => { story.classList.add('is-ready'); shown = -1; if (!raf) raf = requestAnimationFrame(seek); });
    const render = (p) => {
      target = timeAt(p);
      if (!raf) raf = requestAnimationFrame(seek);
      let step = 0;
      STEP_AT.forEach((v, i) => { if (p >= v) step = i; });
      bars.forEach((b, i) => {
        const a = STEP_AT[i], z = STEP_AT[i + 1] ?? 1.0001;
        b.style.transform = `scaleX(${clamp((p - a) / (z - a)).toFixed(3)})`;
      });
      if (step !== lastStep) {
        lastStep = step;
        story.dataset.step = step;
        steps.forEach((li, i) => li.classList.toggle('is-on', i === step));
      }
      const e = seg(p, 0.93, 0.05);
      kwh.style.opacity = e.toFixed(3);
      kwh.style.transform = `translateY(${((1 - e) * 16).toFixed(1)}px)`;
    };
    return {
      el: story,
      near: load,
      update() {
        const r = story.getBoundingClientRect();
        const span = r.height - innerHeight;
        render(clamp(span > 0 ? -r.top / span : 1));
      },
      done() { story.classList.add('story--static'); steps.forEach((li) => li.classList.add('is-on')); },
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
    if (reduce) sc.done();
    else {
      scenes.push(sc);
      // video začne stahovat, až se k sekci blíží
      const pre = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { sc.near(); pre.disconnect(); } }, { rootMargin: '1200px 0px' });
      pre.observe(story);
    }
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
