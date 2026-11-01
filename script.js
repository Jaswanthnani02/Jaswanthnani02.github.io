// Jaswanth Gaddam — portfolio
// A small model of the ticket dispatcher.
// Six technicians close tickets at different speeds. Round-robin gives tickets
// in turn. Weighted load gives each ticket to the technician with the fewest
// open tickets. The load gap is the busiest technician's open tickets minus
// the least busy technician's open tickets.
(function dispatcher() {
  const root = document.getElementById('sim');
  if (!root) return;

  const rowsEl = document.getElementById('simRows');
  const countEl = document.getElementById('simCount');
  const gapEl = document.getElementById('simFair');
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
  const SCALE = 40;   // open tickets that fill a bar
  const LIMIT = 300;  // tickets per run
  let mode = 'wl';
  let next = 0;
  let assigned = 0;
  let timer = null;
  let done = false;
  let userPaused = false;

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
    next = 0;
    assigned = 0;
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

  function draw() {
    const loads = techs.map(t => t.open);
    const max = Math.max(...loads);
    techs.forEach(t => {
      t.fill.style.width = Math.min(100, (t.open / SCALE) * 100) + '%';
      t.n.textContent = t.open;
      t.row.classList.toggle('top', max > 0 && t.open === max);
    });
    countEl.textContent = assigned;
    gapEl.textContent = assigned ? max - Math.min(...loads) : '—';
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

  runBtn.addEventListener('click', () => {
    if (timer) { stop(); userPaused = true; } else { start(); userPaused = false; }
  });

  modeBtns.forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    modeBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    reset();
    if (!timer && !userPaused) start();
  }));

  draw();

  // Start when the model comes into view. Stop when it leaves.
  // Do not start without a click if the reader asked for reduced motion.
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !userPaused) start();
        else if (!e.isIntersecting) stop();
      });
    }, { threshold: 0.4 }).observe(root);
  }
})();

// ---------- Thank-you card ----------
// Shows a small card after 15 seconds of attention: the tab is visible and the
// visitor has scrolled, clicked, or pressed a key. It shows once per visitor
// per 30 days, and never after the visitor opens LinkedIn or email from it.
(function thankYouCard() {
  const card = document.getElementById('hello');
  if (!card) return;

  const KEY = 'jg-hello-seen';
  const WAIT_MS = 15000;
  const QUIET_DAYS = 30;

  const read = () => { try { return Number(localStorage.getItem(KEY)) || 0; } catch (e) { return 0; } };
  const write = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* storage blocked */ } };

  const params = new URLSearchParams(location.search);
  const force = params.has('hello');
  if (!force && Date.now() - read() < QUIET_DAYS * 864e5) return;

  // A visitor who already went to LinkedIn does not need the card.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="linkedin.com"]');
    if (a && !card.contains(a)) { write(); cancel(); }
  });

  let engaged = force;
  let visibleMs = 0;
  let last = performance.now();
  let timer = null;
  const markEngaged = () => { engaged = true; };
  ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(t => window.addEventListener(t, markEngaged, { passive: true, once: true }));

  function tick() {
    const now = performance.now();
    if (!document.hidden) visibleMs += now - last;
    last = now;
    if (engaged && visibleMs >= (force ? 0 : WAIT_MS)) { cancel(); show(); }
  }
  function cancel() { clearInterval(timer); timer = null; }

  function show() {
    write();
    card.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('is-in')));
  }
  function hide() {
    card.classList.remove('is-in');
    setTimeout(() => { card.hidden = true; }, 350);
  }

  card.querySelectorAll('[data-hello-close]').forEach(b => b.addEventListener('click', hide));
  card.querySelectorAll('[data-hello-done]').forEach(a => a.addEventListener('click', () => setTimeout(hide, 300)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !card.hidden) hide(); });

  timer = setInterval(tick, 500);
})();
