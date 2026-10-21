// JavaScript | farm-pvp-ricochetes.js | Chrome | https://farmricochet.com/play
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
      #farm-pvp-trajetoria-controls .fpt-tactics{border-top:1px solid #527463;margin-top:8px;padding-top:8px}
      #farm-pvp-trajetoria-controls .fpt-tactics button{padding:6px 8px}
      #farm-pvp-trajetoria-controls select{max-width:100%;background:#203d31;color:inherit;border:1px solid #779c89;border-radius:5px;padding:5px;font:inherit}
      #farm-pvp-trajetoria-controls ul{padding-left:17px;margin:6px 0}
      #farm-pvp-trajetoria-controls li{margin:4px 0;overflow-wrap:anywhere}
      #farm-pvp-trajetoria-controls summary{cursor:pointer;margin:6px 0}
      #farm-pvp-trajetoria-controls [data-wizard-radius]{width:58px;background:#203d31;color:inherit;border:1px solid #779c89}
      #farm-pvp-trajetoria-controls [data-damage]{color:#a7ffcd}
      #farm-pvp-trajetoria-controls [data-search-status]{color:#ffe0a1}
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
        <p data-damage role="status"></p>
        <div class="fpt-tactics">
          <div class="fpt-row"><button type="button" data-search>Buscar maior dano</button><button type="button" data-cancel hidden>Cancelar</button></div>
          <p data-search-status role="status" aria-live="polite">A busca compara ângulos e forças do herói ativo.</p>
          <div data-best hidden><p><select data-proposals aria-label="Sugestões de jogada"></select></p><p data-best-summary></p>
            <button type="button" data-apply>Ajustar mira do jogo</button>
            <details><summary>Sequência de dano e avisos</summary><ul data-events></ul><p class="fpt-small" data-warnings></p></details>
          </div>
          <details><summary>Skills identificadas e opções</summary><ul data-skills></ul>
            <label>Raio experimental da Explosão <input data-wizard-radius aria-label="Raio experimental da Explosão" type="number" min="0" max="400" step="5" value="0"></label>
            <p class="fpt-small">0: área do Mago fora do dano. Um raio informado é hipótese; não foi confirmado no servidor.</p>
          </details>
        </div>
        <p class="fpt-small">Verde: mira atual. Dourado: sugestão. Roxo: trajeto do Ladino na Emboscada prevista. Física, sequência e dano estimados; maior dano real não garantido. Ajustar mira não lança.</p>
      </section>`;
    host.append(root);
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const panel = root.querySelector('.fpt-panel');
    const sidebar = ui.overlay.querySelector('.pvp-details');
    if (sidebar) sidebar.prepend(panel); else host.insertAdjacentElement('afterend', panel);
    const status = panel.querySelector('.fpt-status');
    const settings = { enabled: true, count: 12, chain: true, free: false, angle: -Math.PI / 2, wizardRadius:0 };
    let destroyed = false, timer, key = '', result = null, lastInfo = {}, lastPaint = 0;
    let searchJob=0, searching=false, proposals=null, proposalIndex=0, proposalKey='', skillsKey='';
    const aborter = new AbortController();
    const listen = (node, type, callback) => node.addEventListener(type, callback, { signal: aborter.signal });
    const searchButton=panel.querySelector('[data-search]'), cancelButton=panel.querySelector('[data-cancel]');
    const searchStatus=panel.querySelector('[data-search-status]'), bestPanel=panel.querySelector('[data-best]');
    const proposalSelect=panel.querySelector('[data-proposals]'), damageStatus=panel.querySelector('[data-damage]');
    const fmt = value => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(value);
    const name = (heroes,index) => `${math.HERO_NAMES[heroes[index]?.code] || heroes[index]?.code || '?'} (${heroes[index]?.team===ui.view?.seat?'aliado':'inimigo'})`;
    function stopSearch(message='Busca cancelada.') {
      searchJob++; searching=false; cancelButton.hidden=true;
      searchStatus.textContent=message;
    }
    function clearProposals(message) {
      stopSearch(message); proposals=null; bestPanel.hidden=true; proposalKey='';
    }
    function renderSkills(heroes, activeIndex=-1) {
      const next=JSON.stringify([activeIndex,heroes.map(h=>[h.code,h.team,h.skill,h.rulesVersion,h.hp,h.health])]);
      if (next===skillsKey) return; skillsKey=next;
      const list=panel.querySelector('[data-skills]'); list.replaceChildren();
      heroes.forEach((hero,i)=>{
        if (hero.hp !== undefined && hero.hp<=0) return;
        const skill=math.skillInfo(hero,i,activeIndex,heroes), item=document.createElement('li');
        const side=hero.team===undefined?'':hero.team===ui.view?.seat?'Aliado · ':'Inimigo · ';
        item.textContent=`${side}${skill.hero} — ${skill.name}: ${skill.description}${skill.supported?'':' [regra não confirmada nesta versão]'}`;
        list.append(item);
      });
    }
    function renderProposal() {
      const proposal=proposals?.results[proposalIndex], heroes=ui.view?.battle?.heroes;
      if (!proposal || !heroes) return;
      bestPanel.hidden=false;
      const score=proposal.combat;
      panel.querySelector('[data-best-summary]').textContent=`≈ ${fmt(score.damage)} HP de dano · ${score.kills} abate(s) · ${fmt(score.healing)} de cura · ${score.ambushes} Emboscada(s) · ${(proposal.angle*180/Math.PI).toFixed(1)}° · força ${Math.round(proposal.power*100)}%`;
      const list=panel.querySelector('[data-events]'); list.replaceChildren();
      for (const event of score.events.slice(0,24)) {
        const item=document.createElement('li');
        const labels=(event.tags||[]).map(tag=>tag==='ally-enemy-rogue'?'aliado → inimigo → Ladino':math.SKILL_NAMES[tag]||tag);
        item.textContent=`${(event.at/1000).toFixed(2)}s · ${name(heroes,event.source)} → ${name(heroes,event.target)}: ${event.kind==='heal'?'+':'−'}${fmt(event.value)} HP${labels.length?' · '+labels.join(', '):''}`;
        list.append(item);
      }
      const warnings=['Geometria e janela de contato estimadas (150 ms).',...score.warnings];
      panel.querySelector('[data-warnings]').textContent=warnings.join(' ');
      searchStatus.textContent=`Melhor estimativa entre ${proposals.tested} simulações${proposals.timedOut?' · limite de tempo atingido':''}.`;
    }
    async function findBest() {
      if (searching) return;
      const view=ui.view, heroes=view?.battle?.heroes;
      if (!heroes?.length || !ui.canAim()) { searchStatus.textContent='A busca fica disponível durante a sua vez.'; return; }
      const activeIndex=view.battle.active, stateKey=math.battleKey(view), token=++searchJob;
      const input={heroes:heroes.map(h=>({...h})),activeIndex,boundary:view.boundary,
        angle:ui.aim.angle,power:ui.aim.power,combat:{wizardRadius:settings.wizardRadius}};
      searching=true; searchButton.disabled=true; cancelButton.hidden=false;
      bestPanel.hidden=true; proposals=null; searchStatus.textContent='Comparando direções e forças…';
      try {
        const answer=await math.searchShots(input,{
          budgetMs:3000,yieldFn:()=>new Promise(resolve=>setTimeout(resolve,0)),
          shouldCancel:()=>destroyed || token!==searchJob || math.battleKey(ui.view)!==stateKey || !ui.canAim(),
          onProgress:({tested,best})=>{ if (token===searchJob && !destroyed) searchStatus.textContent=`${tested} simulações · melhor dano calculado ≈ ${fmt(best.combat.damage)} HP`; }
        });
        if (destroyed || token!==searchJob) return;
        if (answer.cancelled) { clearProposals('Estado da partida mudou. Faça a busca na sua próxima vez.'); return; }
        proposals=answer; proposalKey=stateKey; proposalIndex=0;
        proposalSelect.replaceChildren();
        answer.results.forEach((p,i)=>{
          const option=document.createElement('option'); option.value=String(i);
          option.textContent=`#${i+1} · ≈ ${fmt(p.combat.damage)} HP · força ${Math.round(p.power*100)}%`;
          proposalSelect.append(option);
        });
        renderProposal();
      } catch(error) { searchStatus.textContent=`Busca indisponível: ${error.message}`; }
      finally { if (token===searchJob) { searching=false; cancelButton.hidden=true; } }
    }
    listen(searchButton,'click',findBest);
    listen(cancelButton,'click',()=>stopSearch());
    listen(proposalSelect,'change',()=>{proposalIndex=Number(proposalSelect.value);renderProposal();});
    listen(panel.querySelector('[data-wizard-radius]'),'change',event=>{
      settings.wizardRadius=Math.min(400,Math.max(0,Number(event.target.value)||0)); event.target.value=settings.wizardRadius;
      key=''; clearProposals('Opção da Explosão alterada. Faça uma nova busca.');
    });
    listen(panel.querySelector('[data-apply]'),'click',()=>{
      const proposal=proposals?.results[proposalIndex];
      if (!proposal || proposalKey!==math.battleKey(ui.view) || !ui.canAim()) { clearProposals('Sugestão expirou. Faça uma nova busca.'); return; }
      ui.aim={...ui.aim,angle:proposal.angle,power:proposal.power}; ui.keyboardAim=true;
      settings.free=false; panel.querySelector('[data-free]').checked=false; panel.querySelector('[data-angle-row]').hidden=true; key='';
      searchStatus.textContent='Mira ajustada. O lançamento continua manual, pelo jogo.';
    });
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
      const currentKey=math.battleKey(view);
      searchButton.disabled=searching || !ui.canAim();
      if (proposalKey && proposalKey!==currentKey) clearProposals('Estado da partida mudou. Faça uma nova busca.');
      const skillHeroes=view?.battle?.heroes || ui.roster?.filter(h=>ui.selected?.has(h.id)) || [];
      renderSkills(skillHeroes,view?.battle?.active ?? -1);
      if (!view?.battle?.heroes?.length) { damageStatus.textContent=''; say('Aguardando uma sala com heróis na arena.'); return; }
      if (ui.playingReplay()) { damageStatus.textContent=''; say('Aguardando o fim da animação do servidor.'); return; }
      const activeIndex = view.battle.active ?? 0;
      const hero = view.battle.heroes[activeIndex];
      if (!hero || hero.hp <= 0) { say('Sem herói ativo para prever.'); return; }
      if (!settings.free && view.status !== 'waiting' && !ui.canAim()) {
        damageStatus.textContent=''; say(view.status === 'finished' ? 'Partida encerrada.' : 'Aguardando sua vez.'); return;
      }
      const angle = settings.free ? settings.angle : ui.aim.angle;
      const aim = { angle, power: settings.free ? 1 : ui.aim.power };
      const nextKey = JSON.stringify([currentKey,aim,settings.count,settings.chain,settings.wizardRadius]);
      if (nextKey !== key) {
        key = nextKey;
        try {
          const boundary = math.boundary(view.boundary);
          const simulation = math.simulateTimed({ heroes: view.battle.heroes, activeIndex,
            angle, power: aim.power, boundary, maxEvents:160,combat:{wizardRadius:settings.wizardRadius} });
          const trace = simulation.prefix;
          result = { trace, simulation };
          lastInfo = { room: view.code, status: view.status, turn: view.battle.turn,
            boundaryVertices: boundary.length, angleDegrees: angle * 180 / Math.PI,
            wallBounces: trace.events.filter(x => x.kind === 'wall').length,
            firstHero: trace.events.find(x => x.kind === 'hero')?.heroIndex ?? null,
            estimatedEvents: simulation.events.length, model: 'replay-fit-pvp-v13',
            power: aim.power, predictedDurationMs: simulation.durationMs,
            calibration: 'partial-replay-fit', exactServerPhysics: false,
            estimatedDamage:simulation.combat.damage, estimatedKills:simulation.combat.kills,
            estimatedHealing:simulation.combat.healing, ambushes:simulation.combat.ambushes,
            warnings:simulation.combat.warnings };
        } catch (e) { result = null; say(`Prévia indisponível: ${e.message}`); return; }
      }
      if (!result) return;
      const score=result.simulation.combat;
      damageStatus.textContent=`${settings.free?'Prévia livre':'Mira atual'}: ≈ ${fmt(score.damage)} HP · ${score.kills} abate(s) · ${score.ambushes} Emboscada(s)${score.warnings.some(w=>w.includes('Explosão'))?' · área do Mago omitida ou estimada':''}`;
      ctx.setTransform(w / 480, 0, 0, h / 600, 0, 0);
      ctx.translate(90.6, view.seat === 1 ? 53 : 49); ctx.scale(0.83, 0.83);
      if (view.seat === 1) { ctx.translate(360, 600); ctx.scale(-1, -1); }
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (result.simulation && settings.chain) {
        for (const [i, path] of result.simulation.paths.entries()) {
          if (path.length < 2) continue;
          const own = view.battle.heroes[i].team === view.seat;
          drawLine(path.slice(0,settings.count+1), own ? '#85d6ffb8' : '#ffab86b8', true, i === activeIndex ? 2.3 : 1.6);
        }
      }
      drawLine(result.trace.points.slice(0,settings.count+1), '#001d12c9', false, 6);
      drawLine(result.trace.points.slice(0,settings.count+1), '#8bffbd', false, 2.7);
      for (let i = 0; i < Math.min(settings.count,result.trace.events.length); i++) {
        const hit = result.trace.events[i];
        ctx.beginPath(); ctx.arc(hit.x, hit.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = hit.kind === 'hero' ? '#ffd16b' : '#8bffbd'; ctx.fill();
        ctx.save(); ctx.translate(hit.x + 7, hit.y - 7);
        if (view.seat === 1) ctx.rotate(Math.PI);
        ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#10271f'; ctx.lineWidth = 3;
        ctx.strokeText(String(i + 1), 0, 0); ctx.fillText(String(i + 1), 0, 0); ctx.restore();
      }
      const best=proposals?.results[proposalIndex];
      if (best && proposalKey===currentKey) {
        drawLine(best.simulation.paths[activeIndex].slice(0,settings.count+1),'#ffcf60',true,3.5);
        const ambushSources=new Set(best.combat.effects.filter(e=>e.kind==='farmer').map(e=>e.source));
        for (const index of ambushSources) drawLine(best.simulation.paths[index].slice(0,settings.count+1),'#dc9bff',true,3);
        const tip={x:hero.x+Math.cos(best.angle)*75,y:hero.y+Math.sin(best.angle)*75};
        drawLine([{x:hero.x,y:hero.y},tip],'#ffcf60',false,3);
        ctx.beginPath();ctx.arc(tip.x,tip.y,4,0,Math.PI*2);ctx.fillStyle='#ffcf60';ctx.fill();
      }
      const first = result.trace.events.find(e => e.kind === 'hero');
      const bounces = result.trace.events.filter(e => e.kind === 'wall').length;
      const mode = view.status === 'waiting' ? 'Sala aguardando adversário' : settings.free ? 'Direção livre' : 'Mira atual';
      say(`${mode} · ${bounces} parede(s)${first ? ` · primeiro herói: ${view.battle.heroes[first.heroIndex].code}` : ''}`);
    }
    const api = {
      version: '1.4.0', math,
      info: () => ({ ...lastInfo, installed: !destroyed, searching,
        recommendation:proposals?{tested:proposals.tested,maximumGuaranteed:false,results:proposals.results.map(p=>({angle:p.angle,power:p.power,damage:p.combat.damage,kills:p.combat.kills,ambushes:p.combat.ambushes,warnings:p.combat.warnings}))}:null }),
      destroy() {
        if (destroyed) return;
        destroyed = true; searchJob++; cancelAnimationFrame(timer); aborter.abort(); root.remove(); panel.remove();
        if (changedPosition && host.style.position === 'relative') host.style.position = originalPosition;
        if (window.FarmPvpTrajetoria === api) delete window.FarmPvpTrajetoria;
      }
    };
    window.FarmPvpTrajetoria = api;
    paint();
    return { installed: true, version: api.version, networkRequestsAdded: false,
      model: 'Busca de maior dano estimado, skills PvP v13 e mortes previstas; física e regras parcialmente confirmadas.' };
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
    maxEvents = 24, parameters = {}, recordFrames = false, combat = false, summaryOnly = false }) {
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
    const damage = combat ? combatModel(heroes, activeIndex, bodies, typeof combat === 'object' ? combat : {}) : null;
    const paths = bodies.map(b => [{ x: b.x, y: b.y }]), events = [], frames = [];
    const prefix = { points: [{ x: selected.x, y: selected.y }], events: [] };
    let elapsed = 0, primaryOpen = true, ended = false;
    const append = i => {
      if (summaryOnly) return;
      const b = bodies[i], last = paths[i].at(-1);
      if (Math.hypot(last.x - b.x, last.y - b.y) > 1e-5) paths[i].push({ x: b.x, y: b.y });
    };
    const frame = () => { if (recordFrames) frames.push({ at: elapsed * 1000, bodies: bodies.map(b => [b.x, b.y]) }); };
    function hit(kind, i, j) {
      const a = bodies[i]; append(i); if (j !== undefined) append(j);
      events.push({ kind, i, j, x: a.x, y: a.y, at: elapsed * 1000 });
      if (!summaryOnly && primaryOpen && (i === activeIndex || j === activeIndex)) {
        prefix.points.push({ x: selected.x, y: selected.y });
        prefix.events.push({ kind, x: selected.x, y: selected.y,
          heroIndex: kind === 'hero' ? (i === activeIndex ? j : i) : undefined });
        if (kind === 'hero') primaryOpen = false;
      }
      if (kind === 'hero') damage?.contact(i, j, elapsed * 1000);
      if (events.length >= Math.max(1, maxEvents)) ended = true;
      frame();
    }
    frame();
    for (let tick = 0; elapsed < cfg.maxSeconds - EPS && !ended; tick++) {
      if (!bodies.some(b => b.alive && Math.hypot(b.vx, b.vy) >= cfg.stopSpeed)) break;
      const dt = Math.min(cfg.stepSeconds, cfg.maxSeconds - elapsed);
      // The observed v13 replays slow low-speed bodies more strongly than fast ones.
      for (const [index, b] of bodies.entries()) {
        const v = Math.hypot(b.vx, b.vy);
        if (!b.alive || v < cfg.stopSpeed) { b.vx = b.vy = 0; continue; }
        const drag = Math.max(cfg.highSpeedDrag, cfg.lowSpeedDrag - cfg.dragSlope * v);
        const decay = Math.exp(-drag * dt);
        b.vx *= decay; b.vy *= decay;
        b.x += b.vx * dt; b.y += b.vy * dt;
        damage?.travel(index, Math.hypot(b.vx, b.vy) * dt);
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
          if (!a.alive) break;
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
    if (!summaryOnly && primaryOpen) prefix.points.push({ x: selected.x, y: selected.y });
    const truncated = ended || (elapsed >= cfg.maxSeconds - EPS && bodies.some(b => b.alive && Math.hypot(b.vx, b.vy) >= cfg.stopSpeed));
    damage?.finish(elapsed * 1000, !truncated);
    frame();
    return { paths, prefix, events, bodies, durationMs: elapsed * 1000, frames, parameters: cfg,
      truncated, combat: damage?.summary() ?? null };
  }

  const HERO_NAMES = Object.freeze({farmer:'Ladino', knight:'Cavaleiro', swordsman:'Espadachim',
    runner:'Arqueira', wizard:'Mago', priest:'Sacerdote', templar:'Templário', woodcutter:'Machadeiro', lancer:'Lanceiro'});
  const SKILL_NAMES = Object.freeze({farmer:'Emboscada', knight:'Escudo', swordsman:'Combo', runner:'Flecha Final',
    wizard:'Explosão', priest:'Toque Curativo', templar:'Impacto Sagrado', woodcutter:'Sede de Sangue', lancer:'Investida'});
  const number = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  function skillInfo(hero, index, activeIndex, heroes) {
    const value = number(hero.skill), active = heroes?.[activeIndex];
    const fmt = x => new Intl.NumberFormat('pt-BR', {maximumFractionDigits:1}).format(x);
    const descriptions = {
      farmer:`+${fmt(value)} de dano na jogada de outro aliado; conta mesmo quando o inimigo vem até o Ladino.`,
      knight:`Bloqueia até ${fmt(value)} do primeiro ataque recebido no turno.`,
      swordsman:`Combo de ${fmt(value)} por acerto na própria jogada. Ordem do primeiro bônus estimada.`,
      runner:`Flecha de ${fmt(value)} no inimigo com menos HP absoluto, ao fim da jogada aliada.`,
      wizard:`Explosão: ${fmt(value*100)}% do HP restante do alvo após o impacto. Área depende de alcance configurado.`,
      priest:`Cura até ${fmt(value)} ao tocar outro aliado durante a jogada da equipe.`,
      templar:`Na própria jogada, marca o inimigo; o próximo outro aliado causa +${fmt(value*100)}% nessa colisão.`,
      woodcutter:`+${fmt(value)} de dano abaixo de 50% do HP máximo.`,
      lancer:`+${fmt(value)} por 360 unidades percorridas; limite de +${fmt(value*2)}.`
    };
    return {code:hero.code, hero:HERO_NAMES[hero.code] || String(hero.code), name:SKILL_NAMES[hero.code] || 'Skill desconhecida',
      value, description:descriptions[hero.code] || 'Habilidade fora do modelo.',
      supported:hero.rulesVersion === 'pvp-v13' && !!SKILL_NAMES[hero.code],
      eligible:hero.code === 'farmer' ? !!active && index !== activeIndex && hero.team === active.team
        : hero.code === 'woodcutter' ? hero.hp < hero.health/2 : true};
  }

  // These rules use the values and descriptions exposed by PvP v13. The contact
  // geometry, combo order and optional blast radius remain estimates, not server code.
  function combatModel(heroes, activeIndex, bodies, options = {}) {
    const side = heroes[activeIndex]?.team;
    if (side === undefined || heroes.some(h => h.hp > 0 && (!Number.isFinite(+h.damage) || !Number.isFinite(+h.health) || h.team === undefined)))
      throw new Error('Atributos de dano, vida ou equipe não disponíveis.');
    const hp = heroes.map(h => number(h.hp)), initial = hp.slice();
    const combo = heroes.map(() => 0), travelled = heroes.map(() => 0), shield = new Set(), marks = new Map();
    const lastHitBy = new Map(), contactAt = new Map(), warnings = new Set();
    const log = [], effects = [], totals = heroes.map(() => 0);
    let healing = 0, ambushes = 0, complete = false, finalized = false;
    const supported = h => h.rulesVersion === 'pvp-v13';
    heroes.forEach(h => { if (h.hp > 0 && (!supported(h) || !SKILL_NAMES[h.code])) warnings.add('Classe ou versão de regras fora do modelo; skill omitida.'); });
    const radius = Math.min(400, number(options.wizardRadius));
    const cooldown = options.contactCooldownMs === undefined ? 150 : number(options.contactCooldownMs);
    function effect(kind, source, target, value, at) { effects.push({kind, source, target, value, at}); }
    function hurt(source, target, amount, at, tags = [], bonus = 0) {
      if (hp[source] <= 0 || hp[target] <= 0 || heroes[source].team === heroes[target].team || !Number.isFinite(amount)) return 0;
      let blocked = 0;
      if (supported(heroes[target]) && heroes[target].code === 'knight' && !shield.has(target)) {
        shield.add(target); blocked = Math.min(amount, number(heroes[target].skill));
        effect('knight', target, target, blocked, at);
      }
      const value = Math.min(hp[target], Math.max(0, Math.round(amount - blocked)));
      hp[target] -= value; totals[target] += value;
      if (hp[target] <= 0) { bodies[target].alive = false; bodies[target].vx = bodies[target].vy = 0; }
      log.push({kind:'hit', source, target, value, at, bonus, blocked, tags});
      return value;
    }
    function contact(i, j, at) {
      if (hp[i] <= 0 || hp[j] <= 0) return;
      const key = `${Math.min(i,j)}:${Math.max(i,j)}`;
      if (at - (contactAt.get(key) ?? -Infinity) < cooldown) return;
      contactAt.set(key, at);
      const a = heroes[i], b = heroes[j];
      if (a.team === b.team) {
        if (a.team !== side) return;
        for (const [source,target] of [[i,j],[j,i]]) {
          if (!supported(heroes[source]) || heroes[source].code !== 'priest') continue;
          const value = Math.min(number(heroes[source].skill), Math.max(0, number(heroes[target].health)-hp[target]));
          if (value > 0) {
            hp[target] += value; healing += value;
            log.push({kind:'heal',source,target,value,at,tags:['priest']}); effect('priest',source,target,value,at);
          }
        }
        return;
      }
      const source = a.team === side ? i : b.team === side ? j : -1;
      if (source < 0) return;
      const target = source === i ? j : i, hero = heroes[source];
      let amount = number(hero.damage), bonus = 0;
      const tags = [];
      if (supported(hero)) {
        if (hero.code === 'farmer' && source !== activeIndex) {
          bonus += number(hero.skill); ambushes++; tags.push('farmer');
          effect('farmer',source,target,number(hero.skill),at);
          if (lastHitBy.has(target) && lastHitBy.get(target) !== source) tags.push('ally-enemy-rogue');
        }
        if (hero.code === 'woodcutter' && hp[source] < number(hero.health)/2) {
          bonus += number(hero.skill); tags.push('woodcutter'); effect('woodcutter',source,target,number(hero.skill),at);
        }
        if (hero.code === 'lancer') {
          const extra = number(hero.skill)*Math.min(2, travelled[source]/360);
          bonus += extra; if (extra > 0) { tags.push('lancer'); effect('lancer',source,target,extra,at); }
        }
        if (hero.code === 'swordsman' && source === activeIndex) {
          // Conservative order: the first hit builds the bonus for the next hit.
          bonus += combo[source]*number(hero.skill); combo[source]++;
          tags.push('swordsman'); warnings.add('Ordem do primeiro bônus de Combo não confirmada.');
          effect('swordsman',source,target,combo[source]*number(hero.skill),at);
        }
      }
      amount += bonus;
      const mark = marks.get(target);
      if (mark && mark.source !== source) {
        const extra = amount*mark.bonus; amount += extra; bonus += extra;
        marks.delete(target); tags.push('templar'); effect('templar',source,target,extra,at);
      }
      hurt(source,target,amount,at,tags,bonus);
      lastHitBy.set(target,source);
      if (supported(hero) && hero.code === 'templar' && source === activeIndex && hp[target] > 0) {
        marks.set(target,{source,bonus:number(hero.skill)}); effect('templar_mark',source,target,number(hero.skill),at);
        warnings.add('Trajetória do empurrão do Templário estimada.');
      }
      if (supported(hero) && hero.code === 'wizard') {
        if (!radius) { warnings.add('Explosão do Mago fora do dano: alcance da área não confirmado.'); return; }
        warnings.add(`Raio de Explosão estimado manualmente em ${radius} unidades.`);
        const areaDamage = hp[target]*number(hero.skill);
        for (let k=0;k<heroes.length;k++) {
          if (hp[k] <= 0 || heroes[k].team === side) continue;
          if (Math.hypot(bodies[k].x-bodies[source].x,bodies[k].y-bodies[source].y) <= radius)
            hurt(source,k,areaDamage,at,['wizard'],areaDamage);
        }
        effect('wizard',source,target,areaDamage,at);
      }
    }
    function finish(at, isComplete = true) {
      if (finalized) return;
      finalized = true; complete = isComplete;
      if (!isComplete) { warnings.add('Simulação atingiu limite: dano parcial e flechas finais omitidas.'); return; }
      for (let source=0;source<heroes.length;source++) {
        const hero = heroes[source];
        if (hp[source] <= 0 || hero.team !== side || hero.code !== 'runner' || !supported(hero)) continue;
        let target = -1;
        for (let k=0;k<heroes.length;k++) if (hp[k] > 0 && heroes[k].team !== side && (target < 0 || hp[k] < hp[target])) target = k;
        if (target >= 0) { hurt(source,target,number(hero.skill),at,['runner'],number(hero.skill)); effect('runner',source,target,number(hero.skill),at); }
      }
    }
    return {contact, travel:(i,distance)=>{ travelled[i] += distance; }, finish,
      summary:()=>({damage:totals.reduce((sum,value,i)=>sum+(heroes[i].team !== side?value:0),0), healing,
        kills:hp.filter((value,i)=>initial[i]>0 && value<=0 && heroes[i].team!==side).length,
        ambushes, hp:hp.slice(), byTarget:totals.slice(), events:log.slice(), effects:effects.slice(),
        warnings:[...warnings], complete, exactServerRules:false})};
  }

  function battleKey(view) {
    return JSON.stringify([view?.code,view?.status,view?.seat,view?.battle?.turn,view?.battle?.active,view?.battle?.side,view?.boundary,
      view?.battle?.heroes?.map(h=>[h.code,h.team,h.x,h.y,h.hp,h.health,h.radius,h.weight??h.mass,h.speed,h.damage,h.skill,h.rulesVersion])]);
  }
  function compareShots(a,b) {
    return b.combat.damage-a.combat.damage || b.combat.kills-a.combat.kills || b.combat.healing-a.combat.healing || a.power-b.power;
  }
  function candidateShots({heroes,activeIndex,angle=0,power=0.8}) {
    const candidates = [{angle,power}], source = heroes[activeIndex];
    for (let i=0;i<heroes.length;i++) {
      const target = heroes[i]; if (i===activeIndex || target.hp<=0) continue;
      const dx=target.x-source.x,dy=target.y-source.y,dist=Math.hypot(dx,dy);
      const center=Math.atan2(dy,dx), spread=Math.asin(Math.min(1,(source.radius+target.radius)/Math.max(1,dist)));
      for (const offset of [0,-0.8,-0.4,0.4,0.8]) for (const p of [1,0.75,0.5,0.3]) candidates.push({angle:center+spread*offset,power:p});
    }
    for (let step=0;step<120;step++) for (const p of [1,0.75,0.5,0.3]) candidates.push({angle:step*Math.PI/60-Math.PI,power:p});
    return candidates;
  }
  async function searchShots(input, {budgetMs=3000, yieldEvery=8, yieldFn=()=>new Promise(r=>setTimeout(r,0)),
    now=()=>performance.now(), shouldCancel=()=>false, onProgress=()=>{}, candidates=null} = {}) {
    const started=now(), limit=Math.min(15000,Math.max(50,budgetMs)), seen=new Set(), ranked=[];
    let tested=0, timedOut=false;
    const evaluate = async choices => {
      for (const candidate of choices) {
        if (shouldCancel()) return false;
        if (tested>0 && now()-started>=limit) { timedOut=true; return false; }
        const angle=Math.atan2(Math.sin(candidate.angle),Math.cos(candidate.angle)), power=Math.min(1,Math.max(.1,candidate.power));
        const key=`${angle.toFixed(7)}:${power.toFixed(4)}`; if (seen.has(key)) continue; seen.add(key);
        const simulation=simulateTimed({...input,angle,power,combat:input.combat||true,summaryOnly:true,maxEvents:160});
        const proposal={angle,power,combat:simulation.combat};
        ranked.push(proposal); ranked.sort(compareShots); if (ranked.length>32) ranked.length=32;
        tested++;
        if (tested%yieldEvery===0) { onProgress({tested,best:ranked[0],elapsedMs:now()-started}); await yieldFn(); }
      }
      return true;
    };
    const coarseComplete=await evaluate(candidates || candidateShots(input));
    if (coarseComplete && !candidates) {
      const refined=[];
      for (const best of ranked.slice(0,6)) for (const degrees of [-2,-1,-.5,0,.5,1,2]) for (const dp of [-.1,-.05,0,.05,.1])
        refined.push({angle:best.angle+degrees*Math.PI/180,power:best.power+dp});
      await evaluate(refined);
    }
    if (shouldCancel()) return {cancelled:true,tested,results:[],elapsedMs:now()-started};
    const distinct=[];
    for (const proposal of ranked) {
      if (distinct.some(x=>Math.abs(Math.atan2(Math.sin(x.angle-proposal.angle),Math.cos(x.angle-proposal.angle)))<Math.PI/60 && Math.abs(x.power-proposal.power)<.1)) continue;
      const simulation=simulateTimed({...input,...proposal,combat:input.combat||true,maxEvents:160});
      distinct.push({...proposal,combat:simulation.combat,simulation}); if (distinct.length===3) break;
    }
    distinct.sort(compareShots);
    return {cancelled:false,tested,results:distinct,elapsedMs:now()-started,timedOut,
      maximumGuaranteed:false,model:'estimated-pvp-v13'};
  }
  return { boundary, trace, simulate, simulateTimed, collisionTime, reflect, REPLAY_FIT,
    combatModel, skillInfo, battleKey, searchShots, candidateShots, compareShots, HERO_NAMES, SKILL_NAMES };
});
