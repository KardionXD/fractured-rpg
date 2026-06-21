// ══════════════════════════════════════════════════
//  FRACTURED — layout.js v3
//  Desktop: painéis flutuantes
//  Mobile: abas simples
// ══════════════════════════════════════════════════

const IS_MOBILE = () => window.innerWidth <= 768;

const PANEL_DEFAULTS = {
  feed:      { title:'💬 Chat',        x:10,  y:10,  w:310, h:480, minW:200, minH:200, mobileOrder:0 },
  tensao:    { title:'⚠️ Tensão',      x:330, y:10,  w:270, h:190, minW:200, minH:150, mobileOrder:1 },
  dados:     { title:'🎲 Dados',       x:330, y:210, w:270, h:310, minW:220, minH:220, mobileOrder:2 },
  tracker:   { title:'⚔️ Tracker',     x:610, y:10,  w:310, h:560, minW:240, minH:280, mobileOrder:3 },
  mapa:      { title:'🗺️ Mapa',        x:930, y:10,  w:680, h:680, minW:280, minH:280, mobileOrder:4 },
  players:   { title:'👥 Players',     x:10,  y:500, w:310, h:260, minW:200, minH:160, mobileOrder:5, masterOnly:true },
  bestiario: { title:'📖 Bestiário',   x:610, y:580, w:310, h:220, minW:200, minH:140, mobileOrder:6, masterOnly:true },
};

let panelStates = {};
let zTop = 20;
let dragState = null;
let resizeState = null;

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
function initLayout() {
  loadStates();

  if (IS_MOBILE()) {
    initMobileLayout();
  } else {
    initDesktopLayout();
  }
}

// ── MOBILE ────────────────────────────────────────
function initMobileLayout() {
  const canvas = document.getElementById('sala-canvas');
  canvas.innerHTML = '';
  canvas.style.cssText = 'overflow-y:auto;height:auto;padding:8px;display:flex;flex-direction:column;gap:8px;background:var(--bg)';

  // Abas no topo
  const tabBar = document.createElement('div');
  tabBar.id = 'mobile-tabbar';
  tabBar.style.cssText = 'display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:4px;position:sticky;top:0;z-index:50;flex-shrink:0';

  const tabContent = document.createElement('div');
  tabContent.id = 'mobile-content';
  tabContent.style.cssText = 'flex:1';

  canvas.appendChild(tabBar);
  canvas.appendChild(tabContent);

  // Ordem para mobile
  const ordered = Object.entries(PANEL_DEFAULTS)
    .filter(([id, def]) => !def.masterOnly || window.isMaster)
    .sort((a,b) => a[1].mobileOrder - b[1].mobileOrder);

  const firstId = ordered[0]?.[0];

  ordered.forEach(([id, def]) => {
    // Tab button
    const btn = document.createElement('button');
    btn.id = 'tab-btn-'+id;
    btn.style.cssText = `flex:1;background:transparent;border:none;border-radius:7px;color:var(--muted);cursor:pointer;font-size:13px;padding:8px 4px;transition:all .15s;`;
    btn.textContent = def.title.split(' ')[0]; // só emoji
    btn.title = def.title;
    btn.onclick = () => switchMobileTab(id);
    tabBar.appendChild(btn);

    // Conteúdo
    const panel = document.createElement('div');
    panel.id = 'mobile-panel-'+id;
    panel.style.cssText = `display:${id===firstId?'flex':'none'};flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;min-height:300px;`;
    const body = document.createElement('div');
    body.id = 'fp-body-'+id;
    body.style.cssText = 'flex:1;overflow:hidden;';
    panel.appendChild(body);
    tabContent.appendChild(panel);
    mountPanelContent(id);
  });

  // Ativa primeira aba
  if (firstId) switchMobileTab(firstId);
}

function switchMobileTab(id) {
  document.querySelectorAll('[id^="mobile-panel-"]').forEach(el => el.style.display='none');
  document.querySelectorAll('[id^="tab-btn-"]').forEach(btn => {
    btn.style.background='transparent'; btn.style.color='var(--muted)';
  });
  const panel = document.getElementById('mobile-panel-'+id);
  const btn   = document.getElementById('tab-btn-'+id);
  if (panel) panel.style.display='flex';
  if (btn)   { btn.style.background='var(--surface2)'; btn.style.color='var(--text)'; }
  if (id==='mapa') setTimeout(()=>{ resizeMapCanvas(); desenharMapa(); }, 60);
}

// ── DESKTOP ───────────────────────────────────────
function initDesktopLayout() {
  const canvas = document.getElementById('sala-canvas');
  canvas.innerHTML = '';
  canvas.style.cssText = 'position:relative;width:100%;height:calc(100vh - 56px - 52px);overflow:hidden;background:#03030a;';

  Object.entries(PANEL_DEFAULTS).forEach(([id, def]) => {
    if (def.masterOnly && !window.isMaster) return;
    createFloatingPanel(id);
  });

  updatePanelMenu();
}

function createFloatingPanel(id) {
  const def   = PANEL_DEFAULTS[id];
  const state = panelStates[id] || {};
  const x = state.x ?? def.x;
  const y = state.y ?? def.y;
  const w = state.w ?? def.w;
  const h = state.h ?? def.h;
  const hidden = state.hidden || false;

  const el = document.createElement('div');
  el.id = 'panel-'+id;
  el.className = 'floating-panel';
  el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${zTop++};display:${hidden?'none':'flex'};`;

  el.innerHTML = `
    <div class="fp-header" id="fp-hdr-${id}">
      <span class="fp-title">${def.title}</span>
      <div class="fp-header-btns">
        <button class="fp-btn" onclick="toggleMinPanel('${id}')" title="Minimizar">─</button>
        <button class="fp-btn fp-close" onclick="toggleHidePanel('${id}')" title="Fechar">✕</button>
      </div>
    </div>
    <div class="fp-body" id="fp-body-${id}"></div>
    <div class="fp-resize-br" title="Arrastar para redimensionar"></div>
    <div class="fp-resize-r"></div>
    <div class="fp-resize-b"></div>
  `;

  // Drag header
  const hdr = el.querySelector('.fp-header');
  hdr.addEventListener('mousedown', e => { if(!e.target.closest('.fp-header-btns')) startDrag(e,id,el); });

  // Resize
  el.querySelector('.fp-resize-br').addEventListener('mousedown', e => startResize(e,id,el,'br'));
  el.querySelector('.fp-resize-r').addEventListener('mousedown',  e => startResize(e,id,el,'r'));
  el.querySelector('.fp-resize-b').addEventListener('mousedown',  e => startResize(e,id,el,'b'));

  // Focus
  el.addEventListener('mousedown', () => { zTop++; el.style.zIndex=zTop; });

  document.getElementById('sala-canvas').appendChild(el);
  if (!panelStates[id]) panelStates[id] = {x,y,w,h};
  mountPanelContent(id);
}

// ── DRAG ──────────────────────────────────────────
function startDrag(e, id, el) {
  e.preventDefault();
  const rect   = el.getBoundingClientRect();
  const canvas = document.getElementById('sala-canvas').getBoundingClientRect();
  dragState = { id, el, offX: e.clientX-rect.left, offY: e.clientY-rect.top, cLeft: canvas.left, cTop: canvas.top };
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragUp);
}
function onDragMove(e) {
  if (!dragState) return;
  const {el, offX, offY, cLeft, cTop, id} = dragState;
  const canvas = document.getElementById('sala-canvas').getBoundingClientRect();
  const x = Math.max(0, e.clientX - canvas.left - offX);
  const y = Math.max(0, e.clientY - canvas.top  - offY);
  el.style.left = x+'px'; el.style.top = y+'px';
  if (!panelStates[id]) panelStates[id] = {};
  panelStates[id].x = x; panelStates[id].y = y;
}
function onDragUp() {
  dragState = null;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragUp);
  saveStates();
}

// ── RESIZE ────────────────────────────────────────
function startResize(e, id, el, dir) {
  e.preventDefault(); e.stopPropagation();
  const rect = el.getBoundingClientRect();
  resizeState = { id, el, dir, sx: e.clientX, sy: e.clientY, sw: rect.width, sh: rect.height };
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onResizeUp);
}
function onResizeMove(e) {
  if (!resizeState) return;
  const {id, el, dir, sx, sy, sw, sh} = resizeState;
  const def = PANEL_DEFAULTS[id];
  if (dir==='br'||dir==='r') { const w=Math.max(def.minW,sw+(e.clientX-sx)); el.style.width=w+'px'; if(!panelStates[id])panelStates[id]={};panelStates[id].w=w; }
  if (dir==='br'||dir==='b') { const h=Math.max(def.minH,sh+(e.clientY-sy)); el.style.height=h+'px'; if(!panelStates[id])panelStates[id]={};panelStates[id].h=h; }
  if (id==='mapa') resizeMapCanvas();
}
function onResizeUp() {
  resizeState = null;
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeUp);
  saveStates();
  resizeMapCanvas();
}

// ── PANEL OPS ─────────────────────────────────────
function toggleMinPanel(id) {
  const body = document.getElementById('fp-body-'+id);
  const el   = document.getElementById('panel-'+id);
  const btn  = el?.querySelector('.fp-btn:first-of-type');
  if (!body||!el) return;
  const min = body.style.display==='none';
  body.style.display = min ? '' : 'none';
  ['fp-resize-br','fp-resize-r','fp-resize-b'].forEach(cls => {
    const r = el.querySelector('.'+cls); if(r) r.style.display = min?'':'none';
  });
  if (btn) btn.textContent = min ? '─' : '□';
  const st = panelStates[id]||{};
  if (!min) { st.savedH = el.offsetHeight; el.style.height='36px'; }
  else { el.style.height = (st.savedH||PANEL_DEFAULTS[id].h)+'px'; }
  if (id==='mapa' && min) setTimeout(()=>{ resizeMapCanvas(); desenharMapa(); }, 50);
}

function toggleHidePanel(id) {
  const el = document.getElementById('panel-'+id);
  if (!el) return;
  const hidden = el.style.display==='none';
  el.style.display = hidden ? 'flex' : 'none';
  if (!panelStates[id]) panelStates[id] = {};
  panelStates[id].hidden = !hidden;
  saveStates();
  updatePanelMenu();
  if (id==='mapa' && hidden) setTimeout(()=>{ resizeMapCanvas(); desenharMapa(); }, 50);
}

function updatePanelMenu() {
  const menu = document.getElementById('panel-menu-list'); if (!menu) return;
  menu.innerHTML = '';
  Object.entries(PANEL_DEFAULTS).forEach(([id, def]) => {
    if (def.masterOnly && !window.isMaster) return;
    const hidden = panelStates[id]?.hidden || false;
    const btn = document.createElement('button');
    btn.className = 'btn-ghost';
    btn.style.cssText = `font-size:11px;padding:6px 10px;opacity:${hidden?0.5:1};text-align:left;width:100%;`;
    btn.textContent = (hidden ? '+ ' : '✓ ') + def.title;
    btn.onclick = () => { toggleHidePanel(id); updatePanelMenu(); };
    menu.appendChild(btn);
  });
}

function resetAllPanels() {
  if (!confirm('Resetar posição de todos os painéis?')) return;
  localStorage.removeItem('fractured_panels');
  panelStates = {};
  document.querySelectorAll('.floating-panel').forEach(el=>el.remove());
  Object.entries(PANEL_DEFAULTS).forEach(([id,def]) => {
    if (def.masterOnly && !window.isMaster) return;
    createFloatingPanel(id);
  });
  updatePanelMenu();
  toast('Layout resetado!','ok');
}

// ── PERSIST ───────────────────────────────────────
function saveStates() { try { localStorage.setItem('fractured_panels', JSON.stringify(panelStates)); } catch(e){} }
function loadStates()  { try { const s=localStorage.getItem('fractured_panels'); if(s) panelStates=JSON.parse(s); } catch(e){} }

// ── MAP RESIZE ────────────────────────────────────
function resizeMapCanvas() {
  const body = document.getElementById('fp-body-mapa'); if(!body||!canvas) return;
  // canvas é o elemento, não o contexto
  const cvs = document.getElementById('mapa-canvas'); if(!cvs) return;
  const rect = body.getBoundingClientRect();
  if (rect.width>10 && rect.height>10) {
    cvs.style.width  = rect.width+'px';
    cvs.style.height = rect.height+'px';
    cvs.width  = rect.width;
    cvs.height = rect.height;
    if (typeof desenharMapa === 'function') desenharMapa();
  }
}

// ══════════════════════════════════════════════════
//  CONTEÚDO DOS PAINÉIS
// ══════════════════════════════════════════════════
function mountPanelContent(id) {
  const body = document.getElementById('fp-body-'+id); if (!body) return;
  body.style.overflow = 'hidden';
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
      <div class="feed-messages" id="feed-messages" style="flex:1;overflow-y:auto;padding:10px;min-height:0">
        <div class="empty-state"><div class="empty-icon">🎲</div><p>Role um dado para começar.</p></div>
      </div>
      <div style="padding:8px;border-top:1px solid var(--border);display:flex;gap:6px;flex-shrink:0">
        <input type="text" class="feed-input" id="msg-input" placeholder="Mensagem..." onkeydown="if(event.key==='Enter')enviarMsg()" style="flex:1">
        <button class="btn-ghost" onclick="enviarMsg()" style="font-size:11px;padding:5px 10px">Enviar</button>
      </div>
    </div>`;
}

function mountTensao(body) {
  body.innerHTML = `
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px;height:100%;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <span style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Nível de Tensão</span>
        <div id="tensao-master-btns" class="tensao-btns" style="display:${window.isMaster?'flex':'none'}">
          <button onclick="alterarTensao(-1)">− Baixar</button>
          <button onclick="alterarTensao(1)">+ Subir</button>
        </div>
      </div>
      <div class="tensao-pips" id="tensao-pips-sala"></div>
      <div class="tensao-status" id="tensao-status-text">CALMA (0/10)</div>
      <div style="font-size:9px;color:var(--muted)" id="tensao-tip"></div>
      <div style="font-size:9px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap">
        <span><span style="color:#e67e22">■</span> C=Calma</span>
        <span><span style="color:#c0392b">■</span> A=Alerta</span>
        <span><span style="color:#8e44ad">■</span> P=Perigo</span>
        <span><span style="color:#7f8c8d">■</span> T=Terror</span>
      </div>
    </div>`;
  // Re-builda pips depois de montar
  if (typeof buildTensaoPips==='function') setTimeout(()=>buildTensaoPips('tensao-pips-sala', tensaoSala, false),50);
}

function mountDados(body) {
  body.innerHTML = `
    <div style="padding:10px;display:flex;flex-direction:column;gap:10px;height:100%;overflow-y:auto">
      <div>
        <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--red);text-transform:uppercase;margin-bottom:8px">Dados Rápidos</div>
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
    </div>`;
}

function mountPlayers(body) {
  body.innerHTML = `
    <div style="padding:8px;height:100%;overflow-y:auto">
      <div id="ct-players-lista" style="display:flex;flex-direction:column;gap:5px">
        <div style="font-size:11px;color:var(--muted);text-align:center;padding:10px">Carregando...</div>
      </div>
    </div>`;
  setTimeout(()=>{ if(typeof renderPlayersParaCT==='function') renderPlayersParaCT(); },100);
}

function mountTracker(body) {
  body.innerHTML = `
    <div class="ct-panel" style="height:100%">
      <div class="ct-panel-header">
        <span class="ct-rodada-badge" id="ct-rodada">Rodada 1</span>
        <span class="ct-turno-info" id="ct-turno-info">Não iniciado</span>
      </div>
      <div class="ct-panel-btns">
        <button class="btn-ghost" onclick="iniciarCombate()" style="font-size:10px;padding:4px 8px" title="Iniciar">▶ Iniciar</button>
        <button class="btn-ghost" onclick="proximoTurno()" style="font-size:10px;padding:4px 8px" title="Próximo">⏭ Próximo</button>
        <button class="btn-ghost" id="btn-toggle-pv" onclick="togglePVInimigos()" style="font-size:10px;padding:4px 8px">👁 PV</button>
        <button class="btn-ghost" onclick="encerrarCombate()" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:var(--red-dim)">✕ Fim</button>
      </div>
      ${window.isMaster ? `
      <div class="ct-add-pc">
        <div class="field" style="flex:2"><label>Nome</label><input type="text" id="ct-pc-nome" placeholder="PC..."></div>
        <div class="field" style="flex:1"><label>Ini</label><input type="number" id="ct-pc-ini" placeholder="10" min="1" max="30"></div>
        <div class="field" style="flex:1"><label>PV</label><input type="number" id="ct-pc-pv" placeholder="20" min="1"></div>
        <button class="btn-ghost" onclick="adicionarPCCT()" style="align-self:flex-end;font-size:10px;padding:4px 6px">+PC</button>
      </div>` : `
      <div style="padding:8px;flex-shrink:0">
        <button class="btn-primary" onclick="adicionarMeuPersonagem()" style="margin:0">🧑 Entrar no Mapa</button>
      </div>`}
      <div class="ct-scroll" id="ct-lista"></div>
    </div>`;
  setTimeout(()=>renderCT(), 50);
}

function mountMapa(body) {
  body.style.padding = '0';
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;min-height:0">
      <div class="mapa-toolbar" style="flex-shrink:0;padding:5px 8px;gap:5px;flex-wrap:wrap">
        <button class="btn-ghost" onclick="importarMapaImg()" style="font-size:10px;padding:3px 7px" id="btn-importar-mapa" ${!window.isMaster?'style="display:none"':''}>📁 Mapa</button>
        <button class="btn-ghost" id="btn-grid" onclick="toggleGrid()" style="font-size:10px;padding:3px 7px">⬛ Grid</button>
        <button class="btn-ghost" id="btn-regua" onclick="toggleRegua()" style="font-size:10px;padding:3px 7px">📏</button>
        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted)">
          <button class="ct-pv-btn" onclick="alterarGrid(-5)">−</button>
          <span id="grid-size-val" style="min-width:28px;text-align:center">60px</span>
          <button class="ct-pv-btn" onclick="alterarGrid(5)">+</button>
        </div>
        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted)">
          <button class="ct-pv-btn" onclick="mapaZoom=Math.max(0.3,mapaZoom-0.2);desenharMapa()">−</button>
          <span id="zoom-label" style="min-width:34px;text-align:center">100%</span>
          <button class="ct-pv-btn" onclick="mapaZoom=Math.min(4,mapaZoom+0.2);desenharMapa()">+</button>
          <button class="ct-pv-btn" onclick="resetZoom()" style="font-size:9px;width:auto;padding:0 4px">↺</button>
        </div>
      </div>
      <div class="mapa-toolbar" style="flex-shrink:0;padding:3px 8px;border-top:none;gap:5px">
        <button class="btn-ghost" onclick="adicionarMeuPersonagem()" style="font-size:10px;padding:3px 7px">🧑 Entrar</button>
        ${window.isMaster?`<button class="btn-ghost" id="btn-token-custom" onclick="abrirCriarTokenCustom()" style="font-size:10px;padding:3px 7px">⭐ Token</button>`:''}
        ${window.isMaster?`<button class="btn-ghost" onclick="limparTokens()" style="font-size:10px;padding:3px 7px;color:var(--red);border-color:var(--red-dim)">🗑</button>`:''}
        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted);margin-left:auto">
          <span>1cel=</span>
          <input type="number" value="1.5" min="0.5" max="10" step="0.5" onchange="metrosPorCelula=parseFloat(this.value)||1.5"
            style="width:36px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:2px;font-size:10px;text-align:center">
          <span>m</span>
        </div>
      </div>
      <div style="flex:1;overflow:hidden;position:relative;min-height:0">
        <canvas id="mapa-canvas" style="display:block;touch-action:none;width:100%;height:100%"></canvas>
      </div>
      <div id="token-info" style="display:none;padding:8px;background:var(--surface2);border-top:1px solid var(--border);flex-shrink:0;max-height:150px;overflow-y:auto"></div>
    </div>`;
  // Reinit mapa no novo canvas
  setTimeout(()=>{ canvas=null; initMapa(); },80);
}

function mountBestiario(body) {
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:6px 8px;border-bottom:1px solid var(--border);flex-shrink:0">
        <input type="text" class="ct-filtro" id="ct-filtro" placeholder="🔍 Buscar inimigo..." oninput="renderBestiarioCT()" style="width:100%">
      </div>
      <div id="ct-bestiario-lista" style="flex:1;overflow-y:auto;padding:4px"></div>
    </div>`;
  setTimeout(()=>renderBestiarioCT(),50);
}
