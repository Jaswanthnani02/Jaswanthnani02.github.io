// Jaswanth Gaddam — portfolio
// Small parts: a Chicago clock, image zoom, keyboard shortcuts, the active
// section in the rail, and a model of the ticket dispatcher.

// ---------- Chicago clock ----------
(function clock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short'
  });
  const tick = () => { el.textContent = fmt.format(new Date()).toLowerCase(); };
  tick();
  setInterval(tick, 30000);
})();

// ---------- Image zoom ----------
(function zoom() {
  const dlg = document.getElementById('zoom');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const img = document.getElementById('zoomImg');
  const cap = document.getElementById('zoomCap');
  document.querySelectorAll('[data-zoom]').forEach(btn => {
    btn.addEventListener('click', () => {
      img.src = btn.dataset.zoom;
      img.alt = btn.dataset.caption || '';
      cap.textContent = btn.dataset.caption || '';
      dlg.showModal();
    });
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
})();

// ---------- Dispatcher model ----------
// Six technicians close tickets at different speeds.
// Round-robin gives tickets in turn. Weighted load gives each ticket to the
// technician with the fewest open tickets. The load gap is the busiest
// technician's open tickets minus the least busy technician's open tickets.
(function dispatcher() {
  const root = document.getElementById('sim');
  if (!root) return;

  const rowsEl = document.getElementById('simRows');
  const countEl = document.getElementById('simCount');
  const fairEl = document.getElementById('simFair');
  const runBtn = document.getElementById('simRun');
  const modeBtns = root.querySelectorAll('[data-mode]');

  const techs = [
    { name: 'alex', speed: 0.32 },
    { name: 'jordan', speed: 0.24 },
    { name: 'sam', speed: 0.18 },
    { name: 'riya', speed: 0.12 },
    { name: 'chen', speed: 0.08 },
    { name: 'noor', speed: 0.06 }
  ];
  const SCALE = 40;
  const LIMIT = 300;
  let mode = 'wl';
  let next = 0;
  let assigned = 0;
  let timer = null;
  let done = false;

  techs.forEach(t => {
    t.open = 0;
    const row = document.createElement('div');
    row.className = 'sim-row';
    row.innerHTML = `<span class="name">${t.name}</span><span class="bar"><span class="fill"></span></span><span class="n">0</span>`;
    rowsEl.appendChild(row);
    t.row = row;
    t.fill = row.querySelector('.fill');
    t.n = row.querySelector('.n');
  });

  function reset() {
    techs.forEach(t => { t.open = 0; });
    next = 0; assigned = 0;
    draw();
  }

  function pick() {
    if (mode === 'rr') {
      const t = techs[next];
      next = (next + 1) % techs.length;
      return t;
    }
    let best = techs[0];
    techs.forEach(t => { if (t.open < best.open) best = t; });
    return best;
  }

  function gap() {
    const loads = techs.map(t => t.open);
    return Math.max(...loads) - Math.min(...loads);
  }

  function draw() {
    const max = Math.max(...techs.map(t => t.open));
    techs.forEach(t => {
      t.fill.style.width = Math.min(100, (t.open / SCALE) * 100) + '%';
      t.n.textContent = t.open;
      t.row.classList.toggle('top', max > 0 && t.open === max);
    });
    countEl.textContent = assigned;
    fairEl.textContent = assigned ? gap() : '—';
  }

  function step() {
    techs.forEach(t => { if (t.open > 0 && Math.random() < t.speed) t.open--; });
    // About 1.3 new tickets each step. The team closes about 1.0, so queues grow.
    const arrivals = 1 + (Math.random() < 0.3 ? 1 : 0);
    for (let i = 0; i < arrivals; i++) { pick().open++; assigned++; }
    draw();
    if (assigned >= LIMIT) { stop(); runBtn.textContent = 'Restart'; done = true; }
  }

  function start() {
    if (timer) return;
    if (done) { done = false; reset(); }
    timer = setInterval(step, 380);
    runBtn.textContent = 'Pause';
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    runBtn.textContent = 'Start';
  }

  runBtn.addEventListener('click', () => (timer ? stop() : start()));
  modeBtns.forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    modeBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const sb = document.getElementById('sbMode');
    if (sb) sb.textContent = b.textContent;
    reset();
  }));

  draw();

  // Start when the model comes into view. Stop when it leaves.
  // Do not start without a click if the reader asked for reduced motion.
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && 'IntersectionObserver' in window) {
    let userPaused = false;
    runBtn.addEventListener('click', () => { userPaused = !timer; });
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !userPaused) start();
        else if (!e.isIntersecting) stop();
      });
    }, { threshold: 0.4 }).observe(root);
  }
})();

// ---------- Keyboard shortcuts ----------
// E: email. R: resume. G then W/S/D/I/H: go to a section. ?: show the list.
(function keys() {
  const dlg = document.getElementById('keys');
  const btn = document.getElementById('keysBtn');
  const open = () => { if (dlg && !dlg.open && dlg.showModal) dlg.showModal(); };
  if (btn) btn.addEventListener('click', open);

  const go = { w: 'work', s: 'stack', d: 'decisions', i: 'incidents', h: 'history' };
  let gAt = 0;
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (document.querySelector('dialog[open]') && e.key !== '?') return;
    const k = e.key.toLowerCase();
    if (k === '?') { e.preventDefault(); open(); return; }
    if (k === 'g') { gAt = Date.now(); return; }
    if (Date.now() - gAt < 1000 && go[k]) {
      gAt = 0;
      const el = document.getElementById(go[k]);
      if (el) { el.scrollIntoView(); history.replaceState(null, '', '#' + go[k]); }
      return;
    }
    if (k === 'e') window.location.href = 'mailto:jaswanthnani02@gmail.com';
    if (k === 'r') window.location.href = 'Jaswanth-Gaddam-Resume.pdf';
  });
})();

// ---------- Active section in the rail ----------
(function activeNav() {
  const links = document.querySelectorAll('[data-nav]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const set = id => links.forEach(a => a.classList.toggle('active', a.dataset.nav === id));
  const seen = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => seen.set(e.target.id, e.isIntersecting));
    const first = [...links].map(a => a.dataset.nav).find(id => seen.get(id));
    if (first) set(first);
  }, { rootMargin: '-10% 0px -60% 0px' });
  links.forEach(a => { const s = document.getElementById(a.dataset.nav); if (s) io.observe(s); });
})();

// ---------- Conference slideshow ----------
// Shows the three photos in a loop. Pauses on hover, on focus, and when the
// tab is hidden. Does not play by itself if the reader asked for reduced motion.
(function slideshow() {
  const root = document.getElementById('show');
  if (!root) return;
  const slides = [...root.querySelectorAll('.slide')];
  const cap = document.getElementById('showCap');
  const idx = document.getElementById('showIdx');
  const bar = document.getElementById('showBar');
  const playBtn = document.getElementById('showPlay');
  const DURATION = 5000;
  let i = 0, timer = null, started = 0, held = false;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(n) {
    slides[i].classList.remove('is-on');
    slides[i].setAttribute('aria-hidden', 'true');
    slides[i].querySelector('button').tabIndex = -1;
    i = (n + slides.length) % slides.length;
    const s = slides[i];
    s.classList.add('is-on');
    s.removeAttribute('aria-hidden');
    s.querySelector('button').tabIndex = 0;
    const img = s.querySelector('img');
    if (img.loading === 'lazy') img.loading = 'eager';
    cap.textContent = s.querySelector('button').dataset.caption;
    idx.textContent = i + 1;
    restart();
  }

  function frame() {
    if (!timer) return;
    const p = Math.min(1, (performance.now() - started) / DURATION);
    bar.style.width = (p * 100) + '%';
    if (p >= 1) { show(i + 1); return; }
    timer = requestAnimationFrame(frame);
  }
  function restart() {
    cancelAnimationFrame(timer); timer = null;
    bar.style.width = '0';
    if (playing && !held && !document.hidden) { started = performance.now(); timer = requestAnimationFrame(frame); }
  }
  function setPlaying(v) {
    playing = v;
    playBtn.textContent = v ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', v ? 'Pause slideshow' : 'Play slideshow');
    restart();
  }

  document.getElementById('showPrev').addEventListener('click', () => show(i - 1));
  document.getElementById('showNext').addEventListener('click', () => show(i + 1));
  playBtn.addEventListener('click', () => setPlaying(!playing));
  root.addEventListener('mouseenter', () => { held = true; restart(); });
  root.addEventListener('mouseleave', () => { held = false; restart(); });
  root.addEventListener('focusin', () => { held = true; restart(); });
  root.addEventListener('focusout', () => { held = false; restart(); });
  document.addEventListener('visibilitychange', restart);
  setPlaying(playing);
})();
