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

// ---------- Try it: tabs ----------
(function labTabs() {
  const tabs = [...document.querySelectorAll('.lab-tabs [role="tab"]')];
  if (!tabs.length) return;
  function select(tab) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      select(next); next.focus(); e.preventDefault();
    });
  });
})();

const escapeHtml = s => s.replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
const pretty = obj => escapeHtml(JSON.stringify(obj, null, 2));

// ---------- Try it: MCP tool call with role-based access ----------
// Every call is checked on two axes: the user's role and the clients the user
// can see. A tool with no role mapping is open to admins only (fail closed).
(function mcpDemo() {
  const form = document.getElementById('mcpForm');
  if (!form) return;
  const $ = id => document.getElementById(id);

  const TOOL_ROLES = {
    list_open_tickets: ['viewer', 'technician', 'admin'],
    get_device_health: ['technician', 'admin'],
    create_ticket: ['technician', 'admin']
    // export_all_clients is new and has no mapping yet.
  };
  const DATA = {
    tickets: {
      contoso: [{ id: 'T-1042', summary: 'VPN drops for remote staff', priority: 'High' }, { id: 'T-1047', summary: 'Printer queue stuck', priority: 'Low' }],
      fabrikam: [{ id: 'T-2210', summary: 'Mailbox over quota', priority: 'Medium' }]
    },
    health: {
      contoso: { devices: 48, offline: 2, diskWarnings: 3 },
      fabrikam: { devices: 31, offline: 0, diskWarnings: 1 }
    }
  };
  const NAMES = { contoso: 'Contoso', fabrikam: 'Fabrikam' };
  let callId = 0;

  function render() {
    const role = $('mcpRole').value, scope = $('mcpScope').value, tool = $('mcpTool').value, client = $('mcpClient').value;
    const seen = scope === 'both' ? ['contoso', 'fabrikam'] : [scope];
    const args = tool === 'export_all_clients' ? {} : tool === 'create_ticket' ? { client, summary: 'User cannot sign in to Teams' } : { client };
    const req = { jsonrpc: '2.0', id: ++callId, method: 'tools/call', params: { name: tool, arguments: args } };
    $('mcpReq').innerHTML = `<span class="c">POST /mcp   Authorization: Bearer eyJ…   (role=${role}, clients=${seen.join(',')})</span>\n` + pretty(req);

    const checks = [];
    let ok = true, why = '';
    const add = (pass, text) => {
      if (!ok) { checks.push(['skip', text + ' (not checked)']); return; }
      checks.push([pass ? 'pass' : 'fail', text]);
      if (!pass) { ok = false; why = text; }
    };

    add(true, 'Token is valid. The user signed in with Microsoft Entra ID.');
    const allowed = TOOL_ROLES[tool];
    if (allowed) add(allowed.includes(role), allowed.includes(role) ? `Role "${role}" can call ${tool}.` : `Role "${role}" cannot call ${tool}. Allowed: ${allowed.join(', ')}.`);
    else add(role === 'admin', role === 'admin' ? `${tool} is new and has no role mapping. Only admin can call it.` : `${tool} is new and has no role mapping, so it is locked to admin.`);
    if (tool === 'export_all_clients') add(scope === 'both', scope === 'both' ? 'The user can see every client.' : 'This tool reads every client. The user cannot see every client.');
    else add(seen.includes(client), seen.includes(client) ? `The user can see ${NAMES[client]}.` : `The user cannot see ${NAMES[client]}.`);
    if (tool === 'create_ticket') add(true, 'The write goes through the ingestion service, the only writer. The query service stays read-only.');

    $('mcpChecks').innerHTML = checks.map(([k, t]) => `<li class="${k === 'pass' ? '' : k}">${escapeHtml(t)}</li>`).join('');

    let res;
    if (!ok) {
      res = { jsonrpc: '2.0', id: req.id, result: { isError: true, content: [{ type: 'text', text: 'Forbidden. ' + why }] } };
    } else {
      let data;
      if (tool === 'list_open_tickets') data = { client: NAMES[client], open: DATA.tickets[client] };
      if (tool === 'get_device_health') data = { client: NAMES[client], ...DATA.health[client] };
      if (tool === 'create_ticket') data = { id: client === 'contoso' ? 'T-1050' : 'T-2214', client: NAMES[client], status: 'New', writtenBy: 'ingestion-service' };
      if (tool === 'export_all_clients') data = { clients: 2, openTickets: 3, devices: 79 };
      const summary = {
        list_open_tickets: () => `${data.open.length} open ticket(s) for ${data.client}.`,
        get_device_health: () => `${data.client}: ${data.devices} devices, ${data.offline} offline.`,
        create_ticket: () => `Created ${data.id} for ${data.client}.`,
        export_all_clients: () => `Exported ${data.clients} clients.`
      }[tool]();
      res = { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: summary }], structuredContent: data } };
    }
    $('mcpRes').innerHTML = `<span class="${ok ? 'ok' : 'err'}">${ok ? '// 200 OK. Tool ran.' : '// Denied. The tool did not run.'}</span>\n` + pretty(res);
  }

  form.addEventListener('submit', e => { e.preventDefault(); render(); });
  render();
})();

// ---------- Try it: Cosmos DB ingestion from many sources ----------
// Each source keeps a watermark. Each run reads from (watermark - overlap), so a
// record that changed during the last run is not lost. Upserts use a stable id
// (source:recordId), so the overlap never makes duplicates.
(function cosmosDemo() {
  const runBtn = document.getElementById('cosRun');
  if (!runBtn) return;
  const $ = id => document.getElementById(id);
  const OVERLAP = 5; // minutes

  const seed = () => ({
    psa: { label: 'PSA (tickets)', type: 'ticket', wm: null, records: [
      { id: 'T-1042', clientId: 'contoso', t: 21, v: 1, f: { summary: 'VPN drops for remote staff', priority: 'High' } },
      { id: 'T-1047', clientId: 'contoso', t: 34, v: 1, f: { summary: 'Printer queue stuck', priority: 'Low' } },
      { id: 'T-2210', clientId: 'fabrikam', t: 52, v: 1, f: { summary: 'Mailbox over quota', priority: 'Medium' } }] },
    rmm: { label: 'RMM (devices)', type: 'device', wm: null, records: [
      { id: 'D-77', clientId: 'contoso', t: 40, v: 1, f: { name: 'CON-FW01', status: 'online' } },
      { id: 'D-91', clientId: 'fabrikam', t: 55, v: 1, f: { name: 'FAB-SRV02', status: 'disk warning' } }] },
    docs: { label: 'Documentation', type: 'document', wm: null, records: [
      { id: 'K-12', clientId: 'contoso', t: 18, v: 1, f: { title: 'VPN setup runbook' } },
      { id: 'K-30', clientId: 'fabrikam', t: 47, v: 1, f: { title: 'Mail flow rules' } }] },
    csat: { label: 'Surveys (CSAT)', type: 'survey', wm: null, records: [
      { id: 'S-5', clientId: 'contoso', t: 29, v: 1, f: { score: 4 } },
      { id: 'S-8', clientId: 'fabrikam', t: 58, v: 1, f: { score: 5 } }] }
  });
  let src, store, last, runs;
  const clock = m => (m == null ? '—' : `10:${String(m).padStart(2, '0')}`);

  function reset() {
    src = seed(); store = new Map(); last = null; runs = 0;
    draw(null, 'Press "Run sync" to copy all four sources into the container.');
  }

  function draw(stats, msg) {
    $('cosRows').innerHTML = Object.entries(src).map(([k, s]) => {
      const st = stats ? stats[k] : { read: '—', created: '—', updated: '—' };
      const cls = n => (typeof n === 'number' && n > 0 ? ' class="hit"' : '');
      return `<tr><td>${s.label}</td><td>${clock(s.wm)}</td><td>${st.read}</td><td${cls(st.created)}>${st.created}</td><td${cls(st.updated)}>${st.updated}</td></tr>`;
    }).join('');
    $('cosStatus').innerHTML = `Container <code>clients</code>, partition key <code>/clientId</code>. Documents: <b id="cosCount">${store.size}</b>. ${escapeHtml(msg)}`;
    $('cosDoc').innerHTML = last ? pretty(last) : '{}';
  }

  function run() {
    runs++;
    const stats = {};
    let changed = 0;
    for (const [k, s] of Object.entries(src)) {
      const since = s.wm == null ? -1 : s.wm - OVERLAP;
      const batch = s.records.filter(r => r.t > since);
      let created = 0, updated = 0;
      for (const r of batch) {
        const id = `${k}:${r.id}`;
        const prev = store.get(id);
        const doc = { id, clientId: r.clientId, source: k, type: s.type, ...r.f, updatedAt: `2026-11-01T${clock(r.t)}:00Z`, version: r.v };
        if (!prev) created++; else if (prev.version !== r.v) updated++;
        if (!prev || prev.version !== r.v) last = doc;
        store.set(id, doc);
      }
      if (batch.length) s.wm = Math.max(s.wm ?? 0, ...batch.map(r => r.t));
      stats[k] = { read: batch.length, created, updated };
      changed += created + updated;
    }
    const total = Object.values(stats).reduce((a, s) => a + s.read, 0);
    const msg = runs === 1
      ? 'First run: every record is new.'
      : changed === 0
        ? `The overlap read ${total} records again. Upserts by id made no duplicates.`
        : `The overlap found ${changed} changed record${changed > 1 ? 's' : ''} and updated ${changed > 1 ? 'them' : 'it'} in place.`;
    draw(stats, msg);
  }

  $('cosEdit').addEventListener('click', () => {
    const s = src.psa;
    if (s.wm == null) { draw(null, 'Run a sync first.'); return; }
    const r = s.records.find(x => x.id === 'T-2210');
    r.v++; r.f = { ...r.f, priority: 'High', summary: 'Mailbox over quota, CEO affected' };
    r.t = s.wm - 2; // changed during the last run: its time is before the watermark
    draw(null, `T-2210 changed at ${clock(r.t)}, 2 minutes before the PSA watermark. An exact watermark would miss it. Run a sync.`);
  });
  runBtn.addEventListener('click', run);
  $('cosReset').addEventListener('click', reset);
  reset();
})();
