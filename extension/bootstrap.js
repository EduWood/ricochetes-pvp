// JavaScript | bootstrap.js | Chrome/Edge 111+ MV3 MAIN world | Farm Ricochet
(() => {
  'use strict';
  if (location.origin !== 'https://farmricochet.com' || location.pathname.replace(/\/$/, '') !== '/play') return;
  if (window.FarmRicochetesExtension) return;
  const install = () => {
    return (// JavaScript | farm-pvp-ricochetes.js | Chrome | https://farmricochet.com/play
(function (factory) {
  'use strict';
  const math = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = math;
    return;
  }
  return (async function install() {
    if (location.origin !== 'https://farmricochet.com') throw new Error('Abra o Farm Ricochet.');
    window.FarmPvpTrajetoria?.destroy?.();
    const source = performance.getEntriesByType('resource').map(x => x.name)
      .find(x => /\/assets\/PvpUi-[^/]+\.js(?:\?|$)/.test(x));
    if (!source) throw new Error('Abra a Arena PvP uma vez e execute novamente.');
    const { PvpUi } = await import(source);
    let ui;
    const snapshot = PvpUi.prototype.snapshot;
    try {
      PvpUi.prototype.snapshot = function () { ui = this; return snapshot.call(this); };
      window.render_pvp_to_text?.();
    } finally {
      PvpUi.prototype.snapshot = snapshot;
    }
    if (!ui?.renderer?.canvas) throw new Error('Abra a Arena PvP antes de instalar.');
    const original = ui.renderer.canvas;
    const host = original.parentElement;
    const originalPosition = host.style.position;
    const changedPosition = getComputedStyle(host).position === 'static';
    if (changedPosition) host.style.position = 'relative';
    const root = document.createElement('div');
    root.id = 'farm-pvp-trajetoria';
    root.innerHTML = `
      <style>
      #farm-pvp-trajetoria{position:absolute;inset:0;pointer-events:none;z-index:15;font:12px/1.35 system-ui,sans-serif;color:#edf7ff}
      #farm-pvp-trajetoria>canvas{position:absolute;pointer-events:none}
      #farm-pvp-trajetoria-controls{position:relative;margin:0 0 12px;pointer-events:auto;background:#142a26f2;border:1px solid #699984;border-radius:9px;padding:9px;color:#edf7ff;font:12px/1.35 system-ui,sans-serif}
      #farm-pvp-trajetoria-controls .fpt-row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
      #farm-pvp-trajetoria-controls button,#farm-pvp-trajetoria-controls input{font:inherit;accent-color:#82f7c0}
      #farm-pvp-trajetoria-controls button{background:#244538;border:1px solid #779c89;border-radius:5px;color:inherit;padding:3px 8px;cursor:pointer}
      #farm-pvp-trajetoria-controls label{display:flex;align-items:center;gap:5px}
      #farm-pvp-trajetoria-controls input[type=range]{width:120px}
      #farm-pvp-trajetoria-controls p{margin:5px 0 0}
      #farm-pvp-trajetoria-controls .fpt-small{color:#c5ddd2;font-size:11px}
      #farm-pvp-trajetoria-controls .fpt-status{min-height:17px}
      #farm-pvp-trajetoria-controls .fpt-more{margin-top:7px}
      #farm-pvp-trajetoria-controls [hidden],#farm-pvp-trajetoria-controls[hidden]{display:none!important}
      </style>
      <canvas aria-label="Previsão de ricochetes e colisões" role="img"></canvas>
      <section id="farm-pvp-trajetoria-controls" class="fpt-panel" aria-label="Calculadora de ricochetes">
        <div class="fpt-row"><label><input type="checkbox" data-enabled checked> <strong>Ricochetes PvP</strong></label><span><button type="button" data-fold aria-label="Expandir controles">Ajustar</button> <button type="button" data-close aria-label="Remover previsão">×</button></span></div>
        <p class="fpt-status" role="status" aria-live="polite"></p>
        <div class="fpt-more" hidden>
          <div class="fpt-row"><label>Impactos <input type="range" data-count min="1" max="24" value="12"><output data-count-out>12</output></label></div>
          <label><input type="checkbox" data-chain checked> Estimar colisões entre heróis</label>
          <label><input type="checkbox" data-free> Explorar direção sem alterar a mira</label>
          <label data-angle-row hidden>Ângulo <input type="range" data-angle min="-180" max="180" step="1" value="-90"><output data-angle-out>−90°</output></label>
        </div>
        <p class="fpt-small">Física estimada com peso, força e desaceleração. Verde: até o primeiro herói. Tracejados: sequência estimada; habilidades e mortes futuras não previstas.</p>
      </section>`;
    host.append(root);
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const panel = root.querySelector('.fpt-panel');
    const sidebar = ui.overlay.querySelector('.pvp-details');
    if (sidebar) sidebar.prepend(panel); else host.insertAdjacentElement('afterend', panel);
    const status = panel.querySelector('.fpt-status');
    const settings = { enabled: true, count: 12, chain: true, free: false, angle: -Math.PI / 2 };
    let destroyed = false, timer, key = '', result = null, lastInfo = {}, lastPaint = 0;
    const aborter = new AbortController();
    const listen = (node, type, callback) => node.addEventListener(type, callback, { signal: aborter.signal });
    listen(panel.querySelector('[data-close]'), 'click', () => api.destroy());
    listen(panel.querySelector('[data-fold]'), 'click', () => {
      const box = panel.querySelector('.fpt-more'); box.hidden = !box.hidden;
      panel.querySelector('[data-fold]').setAttribute('aria-expanded', String(!box.hidden));
    });
    for (const [attr, field] of [['enabled', 'enabled'], ['chain', 'chain'], ['free', 'free']]) {
      listen(panel.querySelector(`[data-${attr}]`), 'change', e => {
        settings[field] = e.target.checked; key = '';
        panel.querySelector('[data-angle-row]').hidden = !settings.free;
      });
    }
    listen(panel.querySelector('[data-count]'), 'input', e => {
      settings.count = Number(e.target.value); panel.querySelector('[data-count-out]').value = settings.count; key = '';
    });
    listen(panel.querySelector('[data-angle]'), 'input', e => {
      settings.angle = Number(e.target.value) * Math.PI / 180;
      panel.querySelector('[data-angle-out]').value = `${e.target.value}°`; key = '';
    });
    const say = text => { if (status.textContent !== text) status.textContent = text; };
    function drawLine(points, color, dashed, width) {
      if (points.length < 2) return;
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dashed ? [7, 6] : []);
      ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
      for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke(); ctx.setLineDash([]);
    }
    function paint() {
      if (destroyed) return;
      timer = requestAnimationFrame(paint);
      if (performance.now() - lastPaint < 45) return;
      lastPaint = performance.now();
      const rect = original.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      const visible = ui.visible && rect.width > 0 && rect.height > 0;
      root.hidden = !visible;
      panel.hidden = !visible;
      if (!visible) return;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
      canvas.style.left = `${rect.left - hostRect.left - host.clientLeft}px`;
      canvas.style.top = `${rect.top - hostRect.top - host.clientTop}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
      if (!settings.enabled) { say('Previsão desativada.'); return; }
      const view = ui.view;
      if (!view?.battle?.heroes?.length) { say('Aguardando uma sala com heróis na arena.'); return; }
      if (ui.playingReplay()) { say('Aguardando o fim da animação do servidor.'); return; }
      const activeIndex = view.battle.active ?? 0;
      const hero = view.battle.heroes[activeIndex];
      if (!hero || hero.hp <= 0) { say('Sem herói ativo para prever.'); return; }
      if (!settings.free && view.status !== 'waiting' && !ui.canAim()) {
        say(view.status === 'finished' ? 'Partida encerrada.' : 'Aguardando sua vez.'); return;
      }
      const angle = settings.free ? settings.angle : ui.aim.angle;
      const aim = { angle, power: settings.free ? 1 : ui.aim.power };
      const nextKey = JSON.stringify([view.code, view.battle.turn, activeIndex, view.seat,
        view.boundary, view.battle.heroes.map(x => [x.x, x.y, x.hp, x.radius, x.weight ?? x.mass]), aim, settings.count, settings.chain]);
      if (nextKey !== key) {
        key = nextKey;
        try {
          const boundary = math.boundary(view.boundary);
          const simulation = math.simulateTimed({ heroes: view.battle.heroes, activeIndex,
            angle, power: aim.power, boundary, maxEvents: settings.count });
          const trace = simulation.prefix;
          result = { trace, simulation };
          lastInfo = { room: view.code, status: view.status, turn: view.battle.turn,
            boundaryVertices: boundary.length, angleDegrees: angle * 180 / Math.PI,
            wallBounces: trace.events.filter(x => x.kind === 'wall').length,
            firstHero: trace.events.find(x => x.kind === 'hero')?.heroIndex ?? null,
            estimatedEvents: simulation.events.length, model: 'replay-fit-pvp-v13',
            power: aim.power, predictedDurationMs: simulation.durationMs,
            calibration: 'partial-replay-fit', exactServerPhysics: false };
        } catch (e) { result = null; say(`Prévia indisponível: ${e.message}`); return; }
      }
      if (!result) return;
      ctx.setTransform(w / 480, 0, 0, h / 600, 0, 0);
      ctx.translate(90.6, view.seat === 1 ? 53 : 49); ctx.scale(0.83, 0.83);
      if (view.seat === 1) { ctx.translate(360, 600); ctx.scale(-1, -1); }
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (result.simulation && settings.chain) {
        for (const [i, path] of result.simulation.paths.entries()) {
          if (path.length < 2) continue;
          const own = view.battle.heroes[i].team === view.seat;
          drawLine(path, own ? '#85d6ffb8' : '#ffab86b8', true, i === activeIndex ? 2.3 : 1.6);
        }
      }
      drawLine(result.trace.points, '#001d12c9', false, 6);
      drawLine(result.trace.points, '#8bffbd', false, 2.7);
      for (let i = 0; i < result.trace.events.length; i++) {
        const hit = result.trace.events[i];
        ctx.beginPath(); ctx.arc(hit.x, hit.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = hit.kind === 'hero' ? '#ffd16b' : '#8bffbd'; ctx.fill();
        ctx.save(); ctx.translate(hit.x + 7, hit.y - 7);
        if (view.seat === 1) ctx.rotate(Math.PI);
        ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#10271f'; ctx.lineWidth = 3;
        ctx.strokeText(String(i + 1), 0, 0); ctx.fillText(String(i + 1), 0, 0); ctx.restore();
      }
      const first = result.trace.events.find(e => e.kind === 'hero');
      const bounces = result.trace.events.filter(e => e.kind === 'wall').length;
      const mode = view.status === 'waiting' ? 'Sala aguardando adversário' : settings.free ? 'Direção livre' : 'Mira atual';
      say(`${mode} · ${bounces} parede(s)${first ? ` · primeiro herói: ${view.battle.heroes[first.heroIndex].code}` : ''}`);
    }
    const api = {
      version: '1.2.0', math,
      info: () => ({ ...lastInfo, installed: !destroyed }),
      destroy() {
        if (destroyed) return;
        destroyed = true; cancelAnimationFrame(timer); aborter.abort(); root.remove(); panel.remove();
        if (changedPosition && host.style.position === 'relative') host.style.position = originalPosition;
        if (window.FarmPvpTrajetoria === api) delete window.FarmPvpTrajetoria;
      }
    };
    window.FarmPvpTrajetoria = api;
    paint();
    return { installed: true, version: api.version, networkRequestsAdded: false,
      model: 'Física estimada com peso, força e desaceleração ajustada a replays; habilidades e mortes futuras não previstas.' };
  })();
})(function () {
  'use strict';
  const EPS = 1e-7;
  const dot = (a, b) => a.x * b.x + a.y * b.y;
  function boundary(points) {
    let p = (points || [[0, 0], [360, 0], [360, 600], [0, 600]])
      .map(v => Array.isArray(v) ? { x: Number(v[0]), y: Number(v[1]) } : { x: Number(v.x), y: Number(v.y) });
    if (p.length > 3 && Math.hypot(p[0].x - p.at(-1).x, p[0].y - p.at(-1).y) < EPS) p.pop();
    if (p.length < 3 || p.some(v => !Number.isFinite(v.x + v.y))) throw new Error('Contorno inválido.');
    const area = p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a.x * b.y - b.x * a.y; }, 0);
    if (Math.abs(area) < EPS) throw new Error('Contorno sem área.');
    if (area < 0) p = p.reverse();
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length], c = p[(i + 2) % p.length];
      if (Math.hypot(b.x - a.x, b.y - a.y) < EPS) throw new Error('Aresta vazia.');
      if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) < -EPS)
        throw new Error('O modelo requer um contorno convexo.');
    }
    return p;
  }
  function edges(points) {
    return points.map((a, i) => {
      const b = points[(i + 1) % points.length], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      return { a, n: { x: -dy / len, y: dx / len }, index: i };
    });
  }
  function walls(body, velocity, lines) {
    let time = Infinity, normals = [], ids = [];
    for (const edge of lines) {
      const vn = dot(velocity, edge.n);
      if (vn >= -EPS) continue;
      const distance = (body.x - edge.a.x) * edge.n.x + (body.y - edge.a.y) * edge.n.y - body.radius;
      const t = Math.max(0, distance / -vn);
      if (t < time - 1e-6) { time = t; normals = [edge.n]; ids = [edge.index]; }
      else if (Math.abs(t - time) <= 1e-6) { normals.push(edge.n); ids.push(edge.index); }
    }
    return { time, normals, ids };
  }
  function reflect(v, normals) {
    // Simultaneous corners reflect against the combined contact normal.
    const n = normals.reduce((s, a) => ({ x: s.x + a.x, y: s.y + a.y }), { x: 0, y: 0 });
    const len = Math.hypot(n.x, n.y);
    if (len < EPS) return { x: -v.x, y: -v.y };
    n.x /= len; n.y /= len;
    const vn = dot(v, n);
    return { x: v.x - 2 * vn * n.x, y: v.y - 2 * vn * n.y };
  }
  function collisionTime(a, va, b, vb) {
    const p = { x: a.x - b.x, y: a.y - b.y }, v = { x: va.x - vb.x, y: va.y - vb.y };
    const aa = dot(v, v), pv = dot(p, v), c = dot(p, p) - (a.radius + b.radius) ** 2;
    if (aa < EPS || pv >= -EPS) return Infinity;
    const disc = pv * pv - aa * c;
    if (disc < -EPS) return Infinity;
    const t = (-pv - Math.sqrt(Math.max(0, disc))) / aa;
    return t >= -1e-6 ? Math.max(0, t) : c < 0 ? 0 : Infinity;
  }
  function inside(body, lines) {
    return lines.every(e => (body.x - e.a.x) * e.n.x + (body.y - e.a.y) * e.n.y >= body.radius - 0.1);
  }
  function trace({ start, angle, boundary: polygon, heroes = [], activeIndex = -1, maxBounces = 12, maxDistance = 12000 }) {
    const p = { x: Number(start.x), y: Number(start.y), radius: Number(start.radius) };
    if (!Number.isFinite(p.x + p.y + p.radius + angle) || p.radius <= 0) throw new Error('Herói ou direção inválidos.');
    const lines = edges(boundary(polygon));
    if (!inside(p, lines)) throw new Error('Herói fora do contorno útil.');
    let velocity = { x: Math.cos(angle), y: Math.sin(angle) }, remaining = Math.max(0, maxDistance);
    const points = [{ x: p.x, y: p.y }], events = [];
    for (let k = 0; k < Math.min(100, Math.max(0, maxBounces)) && remaining > EPS; k++) {
      const wall = walls(p, velocity, lines);
      let distance = wall.time, heroIndex = -1;
      heroes.forEach((h, i) => {
        if (i === activeIndex || h === start || h.hp <= 0) return;
        const t = collisionTime(p, velocity, h, { x: 0, y: 0 });
        if (t < distance - EPS) { distance = t; heroIndex = i; }
      });
      const travelled = Math.min(distance, remaining);
      p.x += velocity.x * travelled; p.y += velocity.y * travelled; remaining -= travelled;
      points.push({ x: p.x, y: p.y });
      if (distance > travelled + EPS || !Number.isFinite(distance)) break;
      events.push({ kind: heroIndex >= 0 ? 'hero' : 'wall', x: p.x, y: p.y,
        heroIndex: heroIndex >= 0 ? heroIndex : undefined, walls: wall.ids });
      if (heroIndex >= 0) break;
      velocity = reflect(velocity, wall.normals);
      p.x += velocity.x * 1e-5; p.y += velocity.y * 1e-5;
    }
    return { points, events };
  }
  function simulate({ heroes, activeIndex, angle, boundary: polygon, maxEvents = 12, distanceBudget = 12000 }) {
    const lines = edges(boundary(polygon));
    const bodies = heroes.map(h => ({ x: +h.x, y: +h.y, radius: +h.radius,
      mass: Math.max(0.01, Number(h.weight ?? h.mass) || 1), alive: h.hp > 0, vx: 0, vy: 0 }));
    const selected = bodies[activeIndex];
    if (!selected?.alive || !Number.isFinite(angle)) throw new Error('Herói ativo inválido.');
    if (bodies.some(b => b.alive && (!Number.isFinite(b.x + b.y + b.radius) || b.radius <= 0 || !inside(b, lines))))
      throw new Error('Posição ou raio fora do contorno útil.');
    // Unit launch speed: geometric extrapolation, independent of unverified server timing/friction.
    selected.vx = Math.cos(angle); selected.vy = Math.sin(angle);
    const paths = bodies.map(b => [{ x: b.x, y: b.y }]), events = [];
    let elapsed = 0, distance = 0;
    function append(i) {
      const b = bodies[i], last = paths[i].at(-1);
      if (Math.hypot(last.x - b.x, last.y - b.y) > 1e-6) paths[i].push({ x: b.x, y: b.y });
    }
    for (let iteration = 0; iteration < Math.min(120, Math.max(1, maxEvents)); iteration++) {
      let next = { time: Infinity };
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i]; if (!b.alive) continue;
        const v = { x: b.vx, y: b.vy }, wall = walls(b, v, lines);
        if (wall.time < next.time) next = { ...wall, kind: 'wall', i };
        for (let j = i + 1; j < bodies.length; j++) {
          if (!bodies[j].alive) continue;
          const c = bodies[j], t = collisionTime(b, v, c, { x: c.vx, y: c.vy });
          if (t < next.time) next = { time: t, kind: 'hero', i, j };
        }
      }
      const speedSum = bodies.reduce((s, b) => s + (b.alive ? Math.hypot(b.vx, b.vy) : 0), 0);
      if (speedSum < EPS || !Number.isFinite(next.time)) break;
      const step = Math.min(next.time, (distanceBudget - distance) / speedSum);
      if (step < 0) break;
      for (const b of bodies) if (b.alive) { b.x += b.vx * step; b.y += b.vy * step; }
      elapsed += step; distance += step * speedSum;
      if (step < next.time - EPS) { bodies.forEach((_, i) => append(i)); break; }
      const a = bodies[next.i]; append(next.i);
      if (next.kind === 'wall') {
        const v = reflect({ x: a.vx, y: a.vy }, next.normals); a.vx = v.x; a.vy = v.y;
      } else {
        const b = bodies[next.j]; append(next.j);
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len < EPS) break;
        const nx = dx / len, ny = dy / len, relative = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        const impulse = 2 * Math.max(0, relative) / (1 / a.mass + 1 / b.mass);
        a.vx -= impulse / a.mass * nx; a.vy -= impulse / a.mass * ny;
        b.vx += impulse / b.mass * nx; b.vy += impulse / b.mass * ny;
        const overlap = a.radius + b.radius - len;
        if (overlap >= -EPS) {
          const shift = Math.max(0, overlap) / 2 + 1e-5;
          a.x -= nx * shift; a.y -= ny * shift; b.x += nx * shift; b.y += ny * shift;
        }
      }
      events.push({ kind: next.kind, i: next.i, j: next.j, x: a.x, y: a.y, elapsed });
      if (distance >= distanceBudget - EPS) break;
    }
    bodies.forEach((_, i) => append(i));
    return { paths, events, bodies, elapsed, geometricDistance: distance };
  }
  const REPLAY_FIT = Object.freeze({ launchScale: 1.954, highSpeedDrag: 0.55,
    lowSpeedDrag: 0.9, dragSlope: 0.002, wallRestitution: 0.94,
    heroRestitution: 0.96, stopSpeed: 7, stepSeconds: 1 / 240, maxSeconds: 8 });
  function simulateTimed({ heroes, activeIndex, angle, power = 0.8, boundary: polygon,
    maxEvents = 24, parameters = {}, recordFrames = false }) {
    const cfg = { ...REPLAY_FIT, ...parameters };
    const lines = edges(boundary(polygon));
    const bodies = heroes.map(h => ({ x: +h.x, y: +h.y, radius: +h.radius,
      mass: Math.max(0.01, Number(h.weight ?? h.mass) || 1), alive: h.hp > 0, vx: 0, vy: 0 }));
    const selected = bodies[activeIndex];
    if (!selected?.alive || !Number.isFinite(angle)) throw new Error('Herói ativo inválido.');
    if (bodies.some(b => b.alive && (!Number.isFinite(b.x + b.y + b.radius) || b.radius <= 0 || !inside(b, lines))))
      throw new Error('Posição ou raio fora do contorno útil.');
    const speed = Math.max(0, Number(heroes[activeIndex].speed) || 460) * Math.max(0.1, Math.min(1, power)) * cfg.launchScale;
    selected.vx = Math.cos(angle) * speed; selected.vy = Math.sin(angle) * speed;
    const paths = bodies.map(b => [{ x: b.x, y: b.y }]), events = [], frames = [];
    const prefix = { points: [{ x: selected.x, y: selected.y }], events: [] };
    let elapsed = 0, primaryOpen = true, ended = false;
    const append = i => {
      const b = bodies[i], last = paths[i].at(-1);
      if (Math.hypot(last.x - b.x, last.y - b.y) > 1e-5) paths[i].push({ x: b.x, y: b.y });
    };
    const frame = () => { if (recordFrames) frames.push({ at: elapsed * 1000, bodies: bodies.map(b => [b.x, b.y]) }); };
    function hit(kind, i, j) {
      const a = bodies[i]; append(i); if (j !== undefined) append(j);
      events.push({ kind, i, j, x: a.x, y: a.y, at: elapsed * 1000 });
      if (primaryOpen && (i === activeIndex || j === activeIndex)) {
        prefix.points.push({ x: selected.x, y: selected.y });
        prefix.events.push({ kind, x: selected.x, y: selected.y,
          heroIndex: kind === 'hero' ? (i === activeIndex ? j : i) : undefined });
        if (kind === 'hero') primaryOpen = false;
      }
      if (events.length >= Math.max(1, maxEvents)) ended = true;
      frame();
    }
    frame();
    for (let tick = 0; elapsed < cfg.maxSeconds - EPS && !ended; tick++) {
      if (!bodies.some(b => b.alive && Math.hypot(b.vx, b.vy) >= cfg.stopSpeed)) break;
      const dt = Math.min(cfg.stepSeconds, cfg.maxSeconds - elapsed);
      // The observed v13 replays slow low-speed bodies more strongly than fast ones.
      for (const b of bodies) {
        const v = Math.hypot(b.vx, b.vy);
        if (!b.alive || v < cfg.stopSpeed) { b.vx = b.vy = 0; continue; }
        const drag = Math.max(cfg.highSpeedDrag, cfg.lowSpeedDrag - cfg.dragSlope * v);
        const decay = Math.exp(-drag * dt);
        b.vx *= decay; b.vy *= decay;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
      elapsed += dt;
      // Replays report contact on a simulation substep, after overlap. Resolve that
      // overlap using inverse weights rather than assuming continuous perfect contact.
      for (let i = 0; i < bodies.length && !ended; i++) {
        const a = bodies[i]; if (!a.alive) continue;
        for (const edge of lines) {
          const distance = (a.x - edge.a.x) * edge.n.x + (a.y - edge.a.y) * edge.n.y;
          if (distance >= a.radius) continue;
          a.x += edge.n.x * (a.radius - distance + 1e-6);
          a.y += edge.n.y * (a.radius - distance + 1e-6);
          const vn = a.vx * edge.n.x + a.vy * edge.n.y;
          if (vn < 0) {
            a.vx -= (1 + cfg.wallRestitution) * vn * edge.n.x;
            a.vy -= (1 + cfg.wallRestitution) * vn * edge.n.y;
            hit('wall', i);
          }
        }
        for (let j = i + 1; j < bodies.length && !ended; j++) {
          const b = bodies[j]; if (!b.alive) continue;
          const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
          const overlap = a.radius + b.radius - length;
          if (overlap <= 0 || length < EPS) continue;
          const nx = dx / length, ny = dy / length, inverse = 1 / a.mass + 1 / b.mass;
          const correction = (overlap + 1e-6) / inverse;
          a.x -= correction / a.mass * nx; a.y -= correction / a.mass * ny;
          b.x += correction / b.mass * nx; b.y += correction / b.mass * ny;
          const relative = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (relative > 0) {
            const impulse = (1 + cfg.heroRestitution) * relative / inverse;
            a.vx -= impulse / a.mass * nx; a.vy -= impulse / a.mass * ny;
            b.vx += impulse / b.mass * nx; b.vy += impulse / b.mass * ny;
            hit('hero', i, j);
          }
        }
      }
      if (tick % 8 === 7 || ended) frame();
    }
    bodies.forEach((_, i) => append(i));
    if (primaryOpen) prefix.points.push({ x: selected.x, y: selected.y });
    frame();
    return { paths, prefix, events, bodies, durationMs: elapsed * 1000, frames, parameters: cfg };
  }
  return { boundary, trace, simulate, simulateTimed, collisionTime, reflect, REPLAY_FIT };
})
);
  };
  let enabled = true, busy = false, lastCanvas = null, error = '';
  async function tick() {
    if (!enabled || busy) return;
    const canvas = document.querySelector('#pvp-canvas');
    if (!canvas || canvas === lastCanvas || typeof window.render_pvp_to_text !== 'function') return;
    if (window.FarmPvpTrajetoria?.info?.().installed) {
      if (!lastCanvas) { lastCanvas = canvas; return; }
      window.FarmPvpTrajetoria.destroy();
    }
    busy = true;
    try {
      await install();
      lastCanvas = canvas;
      error = '';
    } catch (failure) { error = failure.message || String(failure); }
    finally { busy = false; }
    // A removal while the async import was pending must also remove its result.
    if (!enabled) { window.FarmPvpTrajetoria?.destroy?.(); lastCanvas = null; }
  }
  window.FarmRicochetesExtension = {
    version: '1.3.0',
    async enable() {
      enabled = true; lastCanvas = null; error = '';
      await tick();
      if (error) return 'Aguardando a Arena PvP. Detalhe: ' + error;
      return window.FarmPvpTrajetoria?.info?.().installed
        ? 'Previsão ativada. Os controles ficam ao lado da arena.'
        : 'Ativação preparada. Abra a Arena PvP nesta aba.';
    },
    disable() {
      enabled = false; lastCanvas = null; error = '';
      window.FarmPvpTrajetoria?.destroy?.();
      return 'Previsão removida desta aba. Após recarregar, a extensão volta a ativar automaticamente.';
    },
    info: () => ({ enabled, busy, error, installed: !!window.FarmPvpTrajetoria?.info?.().installed })
  };
  setInterval(tick, 1000);
  void tick();
})();
