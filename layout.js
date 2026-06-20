// ══════════════════════════════════════════════════
//  FRACTURED — layout.js v2
//  Sistema de painéis flutuantes (drag + resize)
// ══════════════════════════════════════════════════

const PANEL_DEFAULTS = {
  feed:      { title:'💬 Chat / Sala',            x:10,   y:10,  w:300, h:500, minW:200, minH:200 },
  tensao:    { title:'⚠️ Tensão',                 x:320,  y:10,  w:280, h:200, minW:200, minH:160 },
  dados:     { title:'🎲 Dados',                  x:320,  y:220, w:280, h:300, minW:220, minH:220 },
  players:   { title:'👥 Personagens dos Players', x:10,   y:520, w:300, h:280, minW:220, minH:180 },
  tracker:   { title:'⚔️ Combat Tracker',          x:610,  y:10,  w:320, h:600, minW:260, minH:300 },
  mapa:      { title:'🗺️ Mapa',                   x:940,  y:10,  w:700, h:700, minW:300, minH:300 },
  bestiario: { title:'📖 Bestiário',              x:610,  y:620, w:320, h:200, minW:220, minH:150 },
};

let panels = {};
let zTop = 10;

function initLayout() {
  loadPanelState();
  Object.keys(PANEL_DEFAULTS).forEach(id => createPanel(id));
  applyMasterPlayerVisibility();
}

function createPanel(id) {
  const def  = PANEL_DEFAULTS[id];
  const state = panels[id] || { ...def };

  // Cria elemento
  const el = document.createElement('div');
  el.id      = 'panel-' + id;
  el.className = 'floating-panel';
  el.style.cssText = `
    left:${state.x}px; top:${state.y}px;
    width:${state.w}px; height:${state.h}px;
    z-index:${zTop++};
  `;
  el.innerHTML = `
    <div class="fp-header" data-panel="${id}">
      <span class="fp-title">${def.title}</span>
      <div class="fp-header-btns">
        <button class="fp-btn fp-min" onclick="toggleMinimize('${id}')" title="Minimizar">─</button>
        <button class="fp-btn fp-close" onclick="hidePanel('${id}')" title="Fechar">✕</button>
      </div>
    </div>
    <div class="fp-body" id="fp-body-${id}"></div>
    <div class="fp-resize-br" data-panel="${id}" title="Redimensionar"></div>
    <div class="fp-resize-r"  data-panel="${id}-r"></div>
    <div class="fp-resize-b"  data-panel="${id}-b"></div>
  `;

  // Drag pelo header
  el.querySelector('.fp-header').addEventListener('mousedown', e => {
    if (e.target.closest('.fp-header-btns')) return;
    startDrag(e, id);
  });

  // Resize cantos e bordas
  el.querySelector('.fp-resize-br').addEventListener('mousedown', e => startResize(e, id, 'br'));
  el.querySelector('.fp-resize-r').addEventListener('mousedown',  e => startResize(e, id, 'r'));
  el.querySelector('.fp-resize-b').addEventListener('mousedown',  e => startResize(e, id, 'b'));

  // Foca ao clicar
  el.addEventListener('mousedown', () => bringToFront(id));

  // Touch drag
  el.querySelector('.fp-header').addEventListener('touchstart', e => {
    if (e.target.closest('.fp-header-btns')) return;
    const t = e.touches[0];
    startDrag({ clientX: t.clientX, clientY: t.clientY, preventDefault: ()=>{} }, id);
  }, { passive: false });

  document.getElementById('sala-canvas').appendChild(el);
  panels[id] = state;

  // Monta conteúdo
  mountPanelContent(id);
}

// ── DRAG ──────────────────────────────────────────
let dragState = null;

function startDrag(e, id) {
  e.preventDefault();
  const el = document.getElementById('panel-'+id);
  const rect = el.getBoundingClientRect();
  const canvas = document.getElementById('sala-canvas').getBoundingClientRect();

  dragState = {
    id,
    offX: e.clientX - rect.left,
    offY: e.clientY - rect.top,
    canvasLeft: canvas.left,
    canvasTop:  canvas.top,
  };
  bringToFront(id);

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup',   onDragUp);
  document.addEventListener('touchmove', onDragTouchMove, { passive: false });
  document.addEventListener('touchend',  onDragUp);
}

function onDragMove(e) {
  if (!dragState) return;
  const canvas = document.getElementById('sala-canvas').getBoundingClientRect();
  const el = document.getElementById('panel-'+dragState.id);
  const st = panels[dragState.id];
  let x = e.clientX - canvas.left - dragState.offX;
  let y = e.clientY - canvas.top  - dragState.offY;
  x = Math.max(0, x); y = Math.max(0, y);
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  st.x = x; st.y = y;
}

function onDragTouchMove(e) {
  e.preventDefault();
  const t = e.touches[0];
  onDragMove({ clientX: t.clientX, clientY: t.clientY });
}

function onDragUp() {
  dragState = null;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup',   onDragUp);
  document.removeEventListener('touchmove', onDragTouchMove);
  document.removeEventListener('touchend',  onDragUp);
  savePanelState();
}

// ── RESIZE ────────────────────────────────────────
let resizeState = null;

function startResize(e, id, dir) {
  e.preventDefault(); e.stopPropagation();
  const el = document.getElementById('panel-'+id.replace('-r','').replace('-b',''));
  const realId = id.replace('-r','').replace('-b','');
  const rect = el.getBoundingClientRect();
  resizeState = { id: realId, dir, startX: e.clientX, startY: e.clientY, startW: rect.width, startH: rect.height };
  bringToFront(realId);
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup',   onResizeUp);
}

function onResizeMove(e) {
  if (!resizeState) return;
  const { id, dir, startX, startY, startW, startH } = resizeState;
  const def = PANEL_DEFAULTS[id];
  const el  = document.getElementById('panel-'+id);
  const st  = panels[id];

  if (dir === 'br' || dir === 'r') {
    const w = Math.max(def.minW, startW + (e.clientX - startX));
    el.style.width = w + 'px'; st.w = w;
  }
  if (dir === 'br' || dir === 'b') {
    const h = Math.max(def.minH, startH + (e.clientY - startY));
    el.style.height = h + 'px'; st.h = h;
  }
  // Redimensiona canvas do mapa se necessário
  if (id === 'mapa') resizeMapCanvas();
}

function onResizeUp() {
  resizeState = null;
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup',   onResizeUp);
  savePanelState();
  resizeMapCanvas();
}

// ── UTILS ─────────────────────────────────────────
function bringToFront(id) {
  zTop++;
  const el = document.getElementById('panel-'+id);
  if (el) el.style.zIndex = zTop;
}

function toggleMinimize(id) {
  const body = document.getElementById('fp-body-'+id);
  const btn  = document.querySelector(`#panel-${id} .fp-min`);
  const el   = document.getElementById('panel-'+id);
  const st   = panels[id];
  if (!body) return;
  const minimized = body.style.display === 'none';
  body.style.display = minimized ? '' : 'none';
  el.querySelector('.fp-resize-br').style.display = minimized ? '' : 'none';
  el.querySelector('.fp-resize-r').style.display  = minimized ? '' : 'none';
  el.querySelector('.fp-resize-b').style.display  = minimized ? '' : 'none';
  if (btn) btn.textContent = minimized ? '─' : '□';
  st.minimized = !minimized;
  if (!minimized) { el.style.height = '36px'; } else { el.style.height = st.h + 'px'; }
}

function hidePanel(id) {
  const el = document.getElementById('panel-'+id);
  if (el) el.style.display = 'none';
  panels[id].hidden = true;
  savePanelState();
  updatePanelMenu();
}

function showPanel(id) {
  const el = document.getElementById('panel-'+id);
  if (el) el.style.display = '';
  if (panels[id]) panels[id].hidden = false;
  savePanelState();
  updatePanelMenu();
  bringToFront(id);
  if (id === 'mapa') setTimeout(() => { resizeMapCanvas(); desenharMapa(); }, 50);
}

function updatePanelMenu() {
  const menu = document.getElementById('panel-menu-list');
  if (!menu) return;
  menu.innerHTML = '';
  Object.entries(PANEL_DEFAULTS).forEach(([id, def]) => {
    const hidden = panels[id]?.hidden;
    const btn = document.createElement('button');
    btn.className = 'btn-ghost';
    btn.style.cssText = 'font-size:10px;padding:5px 10px;opacity:' + (hidden ? '0.5' : '1');
    btn.textContent = (hidden ? '+ ' : '✓ ') + def.title;
    btn.onclick = () => hidden ? showPanel(id) : hidePanel(id);
    menu.appendChild(btn);
  });
}

function resetAllPanels() {
  if (!confirm('Resetar posição de todos os painéis?')) return;
  localStorage.removeItem('fractured_panels');
  panels = {};
  document.querySelectorAll('.floating-panel').forEach(el => el.remove());
  Object.keys(PANEL_DEFAULTS).forEach(id => createPanel(id));
  applyMasterPlayerVisibility();
  toast('Layout resetado!', 'ok');
}

// ── PERSISTÊNCIA ──────────────────────────────────
function savePanelState() {
  try { localStorage.setItem('fractured_panels', JSON.stringify(panels)); } catch(e) {}
}

function loadPanelState() {
  try {
    const saved = localStorage.getItem('fractured_panels');
    if (saved) panels = JSON.parse(saved);
  } catch(e) {}
}

// ── VISIBILIDADE ──────────────────────────────────
function applyMasterPlayerVisibility() {
  // Bestiário e Players só para mestre
  if (!window.isMaster) {
    hidePanel('bestiario');
    hidePanel('players');
  }
  updatePanelMenu();
}

// ── MAPA RESIZE ───────────────────────────────────
function resizeMapCanvas() {
  const body = document.getElementById('fp-body-mapa');
  if (!body || !canvas) return;
  const rect = body.getBoundingClientRect();
  if (rect.width > 10 && rect.height > 10) {
    canvas.width  = rect.width;
    canvas.height = rect.height;
    desenharMapa();
  }
}

// ══════════════════════════════════════════════════
//  CONTEÚDO DOS PAINÉIS
// ══════════════════════════════════════════════════
function mountPanelContent(id) {
  const body = document.getElementById('fp-body-' + id);
  if (!body) return;

  switch(id) {
    case 'feed':      mountFeed(body);      break;
    case 'tensao':    mountTensao(body);    break;
    case 'dados':     mountDados(body);     break;
    case 'players':   mountPlayers(body);   break;
    case 'tracker':   mountTracker(body);   break;
    case 'mapa':      mountMapa(body);      break;
    case 'bestiario': mountBestiario(body); break;
  }
}

function mountFeed(body) {
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="feed-messages" id="feed-messages" style="flex:1;overflow-y:auto;padding:10px">
        <div class="empty-state"><div class="empty-icon">🎲</div><p>Role um dado para começar.</p></div>
      </div>
      <div class="feed-input-row" style="padding:8px;border-top:1px solid var(--border);display:flex;gap:6px">
        <input type="text" class="feed-input" id="msg-input" placeholder="Mensagem..." onkeydown="if(event.key==='Enter')enviarMsg()" style="flex:1">
        <button class="btn-ghost" onclick="enviarMsg()" style="font-size:11px;padding:5px 10px">Enviar</button>
      </div>
    </div>
  `;
}

function mountTensao(body) {
  body.innerHTML = `
    <div style="padding:10px;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Nível de Tensão</span>
        <div class="tensao-btns" id="tensao-master-btns" style="display:none;gap:6px">
          <button onclick="alterarTensao(-1)">− Baixar</button>
          <button onclick="alterarTensao(1)">+ Subir</button>
        </div>
      </div>
      <div class="tensao-pips" id="tensao-pips-sala"></div>
      <div class="tensao-status" id="tensao-status-text">CALMA (0/10)</div>
      <div style="font-size:9px;color:var(--muted)" id="tensao-tip"></div>
      <div style="font-size:9px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap;margin-top:4px">
        <span><span style="color:#e67e22">■</span> C=Calma</span>
        <span><span style="color:#c0392b">■</span> A=Alerta</span>
        <span><span style="color:#8e44ad">■</span> P=Perigo</span>
        <span><span style="color:#7f8c8d">■</span> T=Terror</span>
      </div>
    </div>
  `;
  if (window.isMaster) {
    const btns = body.querySelector('#tensao-master-btns');
    if (btns) btns.style.display = 'flex';
  }
}

function mountDados(body) {
  body.innerHTML = `
    <div style="padding:10px;display:flex;flex-direction:column;gap:10px;height:100%;overflow-y:auto">
      <div>
        <div class="section-card-title" style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--red);text-transform:uppercase;margin-bottom:8px">Dados Rápidos</div>
        <div class="dado-grid">
          <button class="dado-btn" onclick="rolarDado(4)">d4</button>
          <button class="dado-btn" onclick="rolarDado(6)">d6</button>
          <button class="dado-btn" onclick="rolarDado(8)">d8</button>
          <button class="dado-btn" onclick="rolarDado(10)">d10</button>
          <button class="dado-btn" onclick="rolarDado(12)">d12</button>
          <button class="dado-btn" onclick="rolarDado(20)">d20</button>
          <button class="dado-btn" onclick="rolarDado(100)">d%</button>
          <button class="dado-btn" onclick="rolarDado(6,2)">2d6</button>
        </div>
      </div>
      <div class="roll-formula" style="margin:0">
        <div class="roll-formula-title">Teste — 1d20 + Mod + Perícia</div>
        <div class="formula-grid">
          <label class="formula-label">Atributo</label>
          <select id="roll-atrib" class="formula-select">
            <option value="0">— nenhum —</option>
            <option value="-2">FOR −2</option><option value="-1">FOR −1</option><option value="0">FOR +0</option><option value="1">FOR +1</option><option value="2">FOR +2</option>
            <option value="-2">RES −2</option><option value="-1">RES −1</option><option value="0">RES +0</option><option value="1">RES +1</option><option value="2">RES +2</option>
            <option value="-2">COM −2</option><option value="-1">COM −1</option><option value="0">COM +0</option><option value="1">COM +1</option><option value="2">COM +2</option>
            <option value="-2">SOC −2</option><option value="-1">SOC −1</option><option value="0">SOC +0</option><option value="1">SOC +1</option><option value="2">SOC +2</option>
            <option value="-2">CON −2</option><option value="-1">CON −1</option><option value="0">CON +0</option><option value="1">CON +1</option><option value="2">CON +2</option>
            <option value="-2">AGI −2</option><option value="-1">AGI −1</option><option value="0">AGI +0</option><option value="1">AGI +1</option><option value="2">AGI +2</option>
          </select>
          <label class="formula-label">Perícia</label>
          <select id="roll-pericia" class="formula-select">
            <option value="0">Sem perícia (+0)</option><option value="3">Com perícia (+3)</option>
          </select>
          <label class="formula-label">Situação</label>
          <select id="roll-situacao" class="formula-select">
            <option value="0">Normal</option>
            <option value="3">+3 Vínculo Ativo</option><option value="2">+2 Ferramenta</option>
            <option value="2">+2 Aliado</option><option value="2">+2 Vantagem</option>
            <option value="-2">−2 Ferido &lt;50%</option><option value="-2">−2 Tensão Alta</option>
            <option value="-3">−3 Sem Equipamento</option><option value="-2">−2 Escuridão</option>
          </select>
          <label class="formula-label">Dificuldade</label>
          <select id="roll-dif" class="formula-select">
            <option value="8">8 — Fácil</option><option value="11" selected>11 — Moderado</option>
            <option value="14">14 — Difícil</option><option value="17">17 — Severo</option><option value="20">20 — Extremo</option>
          </select>
        </div>
        <button class="btn-primary" onclick="rolarFormula()" style="margin-top:8px">🎲 Rolar Teste</button>
      </div>
    </div>
  `;
}

function mountPlayers(body) {
  body.innerHTML = `
    <div style="padding:8px;height:100%;overflow-y:auto">
      <div id="ct-players-lista" style="display:flex;flex-direction:column;gap:5px">
        <div style="font-size:11px;color:var(--muted);text-align:center;padding:10px">Carregando players...</div>
      </div>
    </div>
  `;
  if (window.isMaster) renderPlayersParaCT();
}

function mountTracker(body) {
  body.innerHTML = `
    <div class="ct-panel" style="height:100%">
      <div class="ct-panel-header">
        <span class="ct-rodada-badge" id="ct-rodada">Rodada 1</span>
        <span class="ct-turno-info" id="ct-turno-info">Não iniciado</span>
      </div>
      <div class="ct-panel-btns">
        <button class="btn-ghost" onclick="iniciarCombate()" style="font-size:10px;padding:4px 8px" title="Iniciar">▶</button>
        <button class="btn-ghost" onclick="proximoTurno()" style="font-size:10px;padding:4px 8px" title="Próximo turno">⏭</button>
        <button class="btn-ghost" id="btn-toggle-pv" onclick="togglePVInimigos()" style="font-size:10px;padding:4px 8px">👁 PV</button>
        <button class="btn-ghost" onclick="encerrarCombate()" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:var(--red-dim)" title="Encerrar">✕</button>
      </div>
      ${window.isMaster ? `
      <div class="ct-add-pc" style="flex-wrap:wrap">
        <div class="field" style="flex:2;min-width:80px"><label>Nome</label><input type="text" id="ct-pc-nome" placeholder="PC..."></div>
        <div class="field" style="flex:1;min-width:44px"><label>Ini</label><input type="number" id="ct-pc-ini" placeholder="10" min="1" max="30"></div>
        <div class="field" style="flex:1;min-width:44px"><label>PV</label><input type="number" id="ct-pc-pv" placeholder="20" min="1"></div>
        <button class="btn-ghost" onclick="adicionarPCCT()" style="align-self:flex-end;font-size:10px;padding:4px 6px">+PC</button>
      </div>` : `
      <div style="padding:8px">
        <button class="btn-primary" onclick="adicionarMeuPersonagem()" style="margin:0;font-size:11px">🧑 Entrar no Mapa</button>
      </div>`}
      <div class="ct-scroll" id="ct-lista"></div>
    </div>
  `;
}

function mountMapa(body) {
  body.style.padding = '0';
  body.style.overflow = 'hidden';
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="mapa-toolbar" style="flex-shrink:0;padding:5px 8px;gap:5px;flex-wrap:wrap">
        <button class="btn-ghost" onclick="importarMapaImg()" style="font-size:10px;padding:3px 7px" id="btn-importar-mapa">📁</button>
        <button class="btn-ghost" id="btn-grid" onclick="toggleGrid()" style="font-size:10px;padding:3px 7px">⬛</button>
        <button class="btn-ghost" id="btn-regua" onclick="toggleRegua()" style="font-size:10px;padding:3px 7px">📏</button>
        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted)">
          <button class="ct-pv-btn" onclick="alterarGrid(-5)">−</button>
          <span id="grid-size-val" style="min-width:28px;text-align:center">60px</span>
          <button class="ct-pv-btn" onclick="alterarGrid(5)">+</button>
        </div>
        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted)">
          <span>1cel=</span>
          <input type="number" value="1.5" min="0.5" max="10" step="0.5" onchange="metrosPorCelula=parseFloat(this.value)||1.5"
            style="width:36px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:2px;font-size:10px;text-align:center">
          <span>m</span>
        </div>
        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted);margin-left:auto">
          <button class="ct-pv-btn" onclick="mapaZoom=Math.max(0.3,mapaZoom-0.2);desenharMapa()">−</button>
          <span id="zoom-label" style="min-width:34px;text-align:center">100%</span>
          <button class="ct-pv-btn" onclick="mapaZoom=Math.min(4,mapaZoom+0.2);desenharMapa()">+</button>
          <button class="ct-pv-btn" onclick="resetZoom()" style="font-size:9px;width:auto;padding:0 4px">↺</button>
        </div>
      </div>
      <div class="mapa-toolbar" style="flex-shrink:0;padding:3px 8px;border-top:none;gap:5px">
        <button class="btn-ghost" onclick="adicionarMeuPersonagem()" style="font-size:10px;padding:3px 7px">🧑 Entrar</button>
        <button class="btn-ghost" id="btn-token-custom" onclick="abrirCriarTokenCustom()" style="font-size:10px;padding:3px 7px;display:none">⭐ Token</button>
        <button class="btn-ghost" id="btn-limpar-tokens" onclick="limparTokens()" style="font-size:10px;padding:3px 7px;display:none;color:var(--red);border-color:var(--red-dim)">🗑</button>
        <span style="font-size:9px;color:var(--muted);margin-left:auto">Alt+drag=mover · scroll=zoom</span>
      </div>
      <div style="flex:1;overflow:hidden;position:relative">
        <canvas id="mapa-canvas" style="display:block;touch-action:none;width:100%;height:100%"></canvas>
      </div>
      <div id="token-info" style="display:none;padding:8px;background:var(--surface2);border-top:1px solid var(--border);flex-shrink:0"></div>
    </div>
  `;

  if (window.isMaster) {
    const btc = body.querySelector('#btn-token-custom');
    const blt = body.querySelector('#btn-limpar-tokens');
    const bim = body.querySelector('#btn-importar-mapa');
    if (btc) btc.style.display = '';
    if (blt) blt.style.display = '';
  }

  // Re-init mapa neste novo canvas
  setTimeout(() => {
    canvas = null; // força reinit
    initMapa();
  }, 60);
}

function mountBestiario(body) {
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:6px 8px;border-bottom:1px solid var(--border);flex-shrink:0">
        <input type="text" class="ct-filtro" id="ct-filtro" placeholder="🔍 Buscar inimigo..." oninput="renderBestiarioCT()" style="width:100%">
      </div>
      <div class="ct-bestiario-mini" id="ct-bestiario-lista" style="flex:1;max-height:none;overflow-y:auto"></div>
    </div>
  `;
  renderBestiarioCT();
}
