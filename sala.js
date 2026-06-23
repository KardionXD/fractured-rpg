// ══════════════════════════════════════════════════
//  FRACTURED — sala.js
//  Sala de Jogo: Feed, Dados, Tensão, CT, Mapa
//  Mobile: abas bottom nav
//  Desktop: painéis flutuantes
// ══════════════════════════════════════════════════

let salaIniciada = false;

// ── INIT ──────────────────────────────────────────
async function initSala() {
  if (salaIniciada) { refreshSalaContent(); return; }
  salaIniciada = true;
  window.isMaster = isMaster;

  buildSalaDOM();
  await new Promise(r => setTimeout(r, 150));

  // Feed
  await subscribeToSala();

  // Tensão
  await carregarTensaoSala();
  buildTensaoPips('tensao-pips-sala', tensaoSala, false);

  // CT + Bestiário
  subscribeCT();
  if (isMaster) {
    renderBestiarioCT();
    renderPlayersParaCT();
  }

  // Mapa
  canvas = null;
  initMapa();
}

function refreshSalaContent() {
  // Reconstrói apenas o conteúdo dinâmico sem recriar o DOM todo
  renderCT();
  if (isMaster) { renderBestiarioCT(); renderPlayersParaCT(); }
  buildTensaoPips('tensao-pips-sala', tensaoSala, false);
  setTimeout(() => { if (canvas) desenharMapa(); }, 100);
}

// ══════════════════════════════════════════════════
//  DOM BUILDER — Mobile e Desktop compartilham
//  os mesmos IDs mas layout diferente
// ══════════════════════════════════════════════════
function buildSalaDOM() {
  const root = document.getElementById('sala-root');
  if (!root) return;
  root.innerHTML = '';

  if (window.innerWidth <= 768) {
    buildMobileDOM(root);
  } else {
    buildDesktopDOM(root);
  }
}

// ══════════════════════════════════════════════════
//  MOBILE DOM
// ══════════════════════════════════════════════════
const MOBILE_TABS = [
  { id:'feed',      icon:'💬', label:'Chat',    visible: () => true },
  { id:'dados',     icon:'🎲', label:'Dados',   visible: () => true },
  { id:'tracker',   icon:'⚔️', label:'Combate', visible: () => true },
  { id:'mapa',      icon:'🗺️', label:'Mapa',    visible: () => true },
  { id:'players',   icon:'👥', label:'Players', visible: () => isMaster },
  { id:'bestiario', icon:'📖', label:'Bestia',  visible: () => isMaster },
];

function buildMobileDOM(root) {
  root.style.cssText = 'display:flex;flex-direction:column;height:100%;';

  // Tab bar no topo
  const tabBar = document.createElement('div');
  tabBar.id = 'sala-tabbar';
  tabBar.style.cssText = `
    display:flex;background:var(--surface);border-bottom:1px solid var(--border);
    overflow-x:auto;flex-shrink:0;scrollbar-width:none;
  `;

  const tabs = MOBILE_TABS.filter(t => t.visible());
  tabs.forEach(t => {
    const btn = document.createElement('button');
    btn.id = 'tab-'+t.id;
    btn.style.cssText = `
      flex:1;min-width:50px;background:transparent;border:none;border-bottom:2px solid transparent;
      color:var(--muted);cursor:pointer;font-size:11px;font-weight:600;padding:10px 6px 8px;
      display:flex;flex-direction:column;align-items:center;gap:2px;transition:all .15s;
      -webkit-tap-highlight-color:transparent;
    `;
    btn.innerHTML = `<span style="font-size:18px">${t.icon}</span>${t.label}`;
    btn.onclick = () => switchMobileTab(t.id);
    tabBar.appendChild(btn);
  });

  // Content area
  const content = document.createElement('div');
  content.id = 'sala-tab-content';
  content.style.cssText = 'flex:1;overflow:hidden;position:relative;min-height:0;';

  tabs.forEach(t => {
    const panel = document.createElement('div');
    panel.id = 'mpanel-'+t.id;
    panel.style.cssText = 'display:none;flex-direction:column;overflow:hidden;width:100%;height:100%;position:absolute;top:0;left:0;right:0;bottom:0;background:var(--bg);';
    buildPanelContent(t.id, panel);
    content.appendChild(panel);
  });

  root.appendChild(tabBar);
  root.appendChild(content);

  // Force content area height after mount (fix for mobile browsers that give 0 height)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const rootRect = root.getBoundingClientRect();
      const tabRect  = tabBar.getBoundingClientRect();
      const h = Math.max(300, rootRect.height - tabRect.height);
      content.style.height = h + 'px';
      switchMobileTab('feed');
    });
  });
}

function switchMobileTab(id) {
  document.querySelectorAll('[id^="mpanel-"]').forEach(p => { p.style.display='none'; });
  document.querySelectorAll('[id^="tab-"]').forEach(b => {
    b.style.color='var(--muted)';
    b.style.borderBottomColor='transparent';
  });
  const panel = document.getElementById('mpanel-'+id);
  const btn   = document.getElementById('tab-'+id);
  if (panel) {
    panel.style.display='flex';
    // Ensure content fills parent on mobile
    const content = document.getElementById('sala-tab-content');
    if (content) {
      const h = content.getBoundingClientRect().height || content.offsetHeight;
      if (h > 0) { panel.style.height = h+'px'; }
    }
  }
  if (btn) { btn.style.color='var(--red)'; btn.style.borderBottomColor='var(--red)'; }
  if (id==='mapa') {
    setTimeout(()=>{ 
      canvas=null; initMapa();
      setTimeout(()=>{ resizeMapCanvas(); if(typeof desenharMapa==='function')desenharMapa(); },100);
    }, 60);
  }
  if (id==='tracker') setTimeout(()=>renderCT(),50);
  if (id==='bestiario') setTimeout(()=>renderBestiarioCT(),50);
  if (id==='players') setTimeout(()=>renderPlayersParaCT(),50);
  if (id==='feed') setTimeout(()=>scrollFeedToBottom(),100);
}

// ══════════════════════════════════════════════════
//  DESKTOP DOM — painéis flutuantes
// ══════════════════════════════════════════════════
const DESKTOP_PANELS = [
  { id:'feed',      title:'💬 Chat / Sala',           def:{ x:10,  y:10,  w:300, h:480 }, minW:200, minH:200 },
  { id:'tensao',    title:'⚠️ Tensão',                def:{ x:320, y:10,  w:260, h:200 }, minW:200, minH:150 },
  { id:'dados',     title:'🎲 Dados',                 def:{ x:320, y:220, w:260, h:310 }, minW:220, minH:220 },
  { id:'tracker',   title:'⚔️ Combat Tracker',        def:{ x:590, y:10,  w:300, h:560 }, minW:240, minH:280 },
  { id:'mapa',      title:'🗺️ Mapa',                  def:{ x:900, y:10,  w:680, h:680 }, minW:280, minH:280 },
  { id:'players',   title:'👥 Players',  masterOnly:true, def:{ x:10,  y:500, w:300, h:250 }, minW:200, minH:160 },
  { id:'bestiario', title:'📖 Bestiário',masterOnly:true, def:{ x:590, y:580, w:300, h:210 }, minW:200, minH:140 },
];

let pStates = {};
let zIdx = 30;
let dragging = null, resizing = null;

function buildDesktopDOM(root) {
  root.style.cssText = 'position:relative;width:100%;height:calc(100vh - 56px - 52px);overflow:hidden;background:#03030a;';

  loadPStates();

  DESKTOP_PANELS.forEach(p => {
    if (p.masterOnly && !isMaster) return;
    createFPanel(p, root);
  });

  updateDesktopPanelMenu();
}

function createFPanel(cfg, root) {
  const saved = pStates[cfg.id] || {};
  const d = cfg.def;
  const x = saved.x ?? d.x, y = saved.y ?? d.y;
  const w = saved.w ?? d.w, h = saved.h ?? d.h;
  const hidden = saved.hidden || false;

  const el = document.createElement('div');
  el.id = 'dpanel-'+cfg.id;
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;
    z-index:${zIdx++};display:${hidden?'none':'flex'};flex-direction:column;
    background:var(--surface);border:1px solid var(--border);border-radius:10px;
    overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.6);min-width:${cfg.minW}px;min-height:${cfg.minH}px;
  `;

  const hdr = document.createElement('div');
  hdr.style.cssText = `
    display:flex;align-items:center;justify-content:space-between;
    padding:7px 10px;background:var(--surface2);border-bottom:1px solid var(--border);
    cursor:grab;user-select:none;flex-shrink:0;
  `;
  hdr.innerHTML = `
    <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--text);text-transform:uppercase;pointer-events:none">${cfg.title}</span>
    <div style="display:flex;gap:4px">
      <button onclick="minPanel('${cfg.id}')" style="background:transparent;border:1px solid var(--border);border-radius:4px;color:var(--muted);cursor:pointer;font-size:11px;width:22px;height:22px;display:flex;align-items:center;justify-content:center" title="Minimizar">─</button>
      <button onclick="hidePanel('${cfg.id}')" style="background:transparent;border:1px solid var(--border);border-radius:4px;color:var(--muted);cursor:pointer;font-size:11px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;transition:all .12s" title="Fechar" onmouseover="this.style.background='var(--red)';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='var(--muted)'">✕</button>
    </div>
  `;
  hdr.addEventListener('mousedown', e => { if(!e.target.closest('button')) startDrag(e, cfg.id, el); });

  const body = document.createElement('div');
  body.id = 'fp-body-'+cfg.id;
  body.style.cssText = 'flex:1;overflow:hidden;min-height:0;position:relative;';

  // Resize handles
  const rbr = document.createElement('div');
  rbr.style.cssText = 'position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:se-resize;background:linear-gradient(135deg,transparent 50%,var(--border2) 50%);border-radius:0 0 9px 0;z-index:1;';
  rbr.addEventListener('mousedown', e => startResize(e, cfg.id, el, 'br'));

  const rr = document.createElement('div');
  rr.style.cssText = 'position:absolute;top:36px;right:0;bottom:14px;width:5px;cursor:e-resize;z-index:1;';
  rr.addEventListener('mousedown', e => startResize(e, cfg.id, el, 'r'));
  rr.addEventListener('mouseenter', () => rr.style.background='rgba(192,57,43,.3)');
  rr.addEventListener('mouseleave', () => rr.style.background='transparent');

  const rb = document.createElement('div');
  rb.style.cssText = 'position:absolute;bottom:0;left:14px;right:14px;height:5px;cursor:s-resize;z-index:1;';
  rb.addEventListener('mousedown', e => startResize(e, cfg.id, el, 'b'));
  rb.addEventListener('mouseenter', () => rb.style.background='rgba(192,57,43,.3)');
  rb.addEventListener('mouseleave', () => rb.style.background='transparent');

  el.appendChild(hdr);
  el.appendChild(body);
  el.appendChild(rbr); el.appendChild(rr); el.appendChild(rb);
  el.addEventListener('mousedown', () => { zIdx++; el.style.zIndex=zIdx; });

  root.appendChild(el);
  if (!pStates[cfg.id]) pStates[cfg.id] = {x,y,w,h};
  buildPanelContent(cfg.id, body);
}

function minPanel(id) {
  const el=document.getElementById('dpanel-'+id);
  const body=document.getElementById('fp-body-'+id);
  if(!el||!body) return;
  const min=body.style.display==='none';
  body.style.display=min?'':'none';
  if(!min){pStates[id]=pStates[id]||{};pStates[id].savedH=el.offsetHeight;el.style.height='36px';}
  else{el.style.height=(pStates[id]?.savedH||300)+'px';}
  if(id==='mapa'&&min) setTimeout(()=>{resizeMapCanvas();desenharMapa();},50);
}

function hidePanel(id) {
  const el=document.getElementById('dpanel-'+id); if(!el) return;
  el.style.display='none';
  if(!pStates[id]) pStates[id]={};
  pStates[id].hidden=true;
  savePStates(); updateDesktopPanelMenu();
}

function showPanel(id) {
  const el=document.getElementById('dpanel-'+id); if(!el) return;
  el.style.display='flex';
  if(!pStates[id]) pStates[id]={};
  pStates[id].hidden=false;
  savePStates(); updateDesktopPanelMenu();
  zIdx++; el.style.zIndex=zIdx;
  if(id==='mapa') setTimeout(()=>{resizeMapCanvas();desenharMapa();},60);
  if(id==='tracker') renderCT();
  if(id==='bestiario') renderBestiarioCT();
  if(id==='players') renderPlayersParaCT();
}

function updateDesktopPanelMenu() {
  const menu=document.getElementById('panel-menu-list'); if(!menu) return;
  menu.innerHTML='';
  DESKTOP_PANELS.forEach(p => {
    if(p.masterOnly&&!isMaster) return;
    const hidden=pStates[p.id]?.hidden||false;
    const btn=document.createElement('button');
    btn.className='btn-ghost';
    btn.style.cssText=`font-size:11px;padding:6px 12px;text-align:left;width:100%;opacity:${hidden?.6:1};`;
    btn.textContent=(hidden?'+ ':'✓ ')+p.title;
    btn.onclick=()=>{ hidden?showPanel(p.id):hidePanel(p.id); updateDesktopPanelMenu(); };
    menu.appendChild(btn);
  });
}

// Drag
function startDrag(e,id,el){
  e.preventDefault();
  const rect=el.getBoundingClientRect();
  const cr=el.parentElement.getBoundingClientRect();
  dragging={id,el,ox:e.clientX-rect.left,oy:e.clientY-rect.top,cr};
  document.addEventListener('mousemove',onDrag);
  document.addEventListener('mouseup',stopDrag);
}
function onDrag(e){
  if(!dragging) return;
  const {el,ox,oy,cr,id}=dragging;
  const x=Math.max(0,e.clientX-cr.left-ox);
  const y=Math.max(0,e.clientY-cr.top-oy);
  el.style.left=x+'px';el.style.top=y+'px';
  if(!pStates[id])pStates[id]={};
  pStates[id].x=x;pStates[id].y=y;
}
function stopDrag(){dragging=null;document.removeEventListener('mousemove',onDrag);document.removeEventListener('mouseup',stopDrag);savePStates();}

// Resize
function startResize(e,id,el,dir){
  e.preventDefault();e.stopPropagation();
  const rect=el.getBoundingClientRect();
  resizing={id,el,dir,sx:e.clientX,sy:e.clientY,sw:rect.width,sh:rect.height};
  document.addEventListener('mousemove',onResize);document.addEventListener('mouseup',stopResize);
}
function onResize(e){
  if(!resizing) return;
  const{id,el,dir,sx,sy,sw,sh}=resizing;
  const cfg=DESKTOP_PANELS.find(p=>p.id===id);
  if(dir==='br'||dir==='r'){const w=Math.max(cfg?.minW||200,sw+(e.clientX-sx));el.style.width=w+'px';if(!pStates[id])pStates[id]={};pStates[id].w=w;}
  if(dir==='br'||dir==='b'){const h=Math.max(cfg?.minH||150,sh+(e.clientY-sy));el.style.height=h+'px';if(!pStates[id])pStates[id]={};pStates[id].h=h;}
  if(id==='mapa')resizeMapCanvas();
}
function stopResize(){resizing=null;document.removeEventListener('mousemove',onResize);document.removeEventListener('mouseup',stopResize);savePStates();resizeMapCanvas();}

function resetPanels(){
  if(!confirm('Resetar posições?')) return;
  localStorage.removeItem('fractured_panels');
  pStates={};
  salaIniciada=false;
  _salaSubAtiva=false;  // allow re-subscribe
  document.querySelectorAll('.floating-panel').forEach(el=>el.remove());
  buildDesktopDOM(document.getElementById('sala-root'));
  toast('Layout resetado!','ok');
}

function savePStates(){try{localStorage.setItem('fractured_panels',JSON.stringify(pStates));}catch(e){}}
function loadPStates(){try{const s=localStorage.getItem('fractured_panels');if(s)pStates=JSON.parse(s);}catch(e){}}

// resizeMapCanvas is defined in combate.js

// ══════════════════════════════════════════════════
//  PANEL CONTENT — compartilhado mobile/desktop
// ══════════════════════════════════════════════════
function buildPanelContent(id, container) {
  switch(id) {
    case 'feed':      buildFeed(container);      break;
    case 'tensao':    buildTensaoPanel(container); break;
    case 'dados':     buildDadosPanel(container); break;
    case 'tracker':   buildTrackerPanel(container); break;
    case 'mapa':      buildMapaPanel(container);  break;
    case 'players':   buildPlayersPanel(container); break;
    case 'bestiario': buildBestiarioPanel(container); break;
  }
}

function buildFeed(c) {
  const limparBtn = isMaster
    ? '<div style="padding:4px 8px;border-top:1px solid var(--border);flex-shrink:0"><button class="btn-ghost" onclick="limparHistorico()" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:var(--red-dim);width:100%">🗑 Limpar histórico</button></div>'
    : '';
  c.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div id="feed-messages" style="flex:1;overflow-y:auto;padding:10px;min-height:0">
        <div class="empty-state"><div class="empty-icon">🎲</div><p>Role um dado para começar.</p></div>
      </div>
      <div style="padding:8px;border-top:1px solid var(--border);display:flex;gap:6px;flex-shrink:0">
        <input type="text" class="feed-input" id="msg-input" placeholder="Mensagem..." onkeydown="if(event.key==='Enter')enviarMsg()" style="flex:1">
        <button class="btn-ghost" onclick="enviarMsg()" style="font-size:11px;padding:5px 10px">Enviar</button>
      </div>
      ${limparBtn}
    </div>`;
}

function buildTensaoPanel(c) {
  c.innerHTML = `
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px;height:100%;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <span style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Tensão da Sessão</span>
        <div class="tensao-btns" id="tensao-master-btns" style="display:${isMaster?'flex':'none'}">
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
    </div>`;
  setTimeout(()=>buildTensaoPips('tensao-pips-sala',tensaoSala,false),50);
}

function buildDadosPanel(c) {
  c.innerHTML = `
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
          <select id="roll-pericia" class="formula-select"><option value="0">Sem perícia (+0)</option><option value="3">Com perícia (+3)</option></select>
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

function buildTrackerPanel(c) {
  const masterForm = isMaster
    ? '<div class="ct-add-pc">' +
      '<div class="field" style="flex:2"><label>Nome</label><input type="text" id="ct-pc-nome" placeholder="PC..."></div>' +
      '<div class="field" style="flex:1"><label>Ini</label><input type="number" id="ct-pc-ini" placeholder="10" min="1" max="30"></div>' +
      '<div class="field" style="flex:1"><label>PV</label><input type="number" id="ct-pc-pv" placeholder="20" min="1"></div>' +
      '<button class="btn-ghost" onclick="adicionarPCCT()" style="align-self:flex-end;font-size:10px;padding:4px 6px">+PC</button>' +
      '</div>'
    : '<div style="padding:8px;flex-shrink:0"><button class="btn-primary" onclick="adicionarMeuPersonagem()" style="margin:0">🧑 Entrar no Mapa</button></div>';

  c.innerHTML = `
    <div class="ct-panel" style="height:100%">
      <div class="ct-panel-header">
        <span class="ct-rodada-badge" id="ct-rodada">Rodada 1</span>
        <span class="ct-turno-info" id="ct-turno-info">Não iniciado</span>
      </div>
      <div class="ct-panel-btns">
        <button class="btn-ghost" onclick="iniciarCombate()" style="font-size:10px;padding:4px 8px">▶ Iniciar</button>
        <button class="btn-ghost" onclick="proximoTurno()" style="font-size:10px;padding:4px 8px">⏭ Próximo</button>
        <button class="btn-ghost" id="btn-toggle-pv" onclick="togglePVInimigos()" style="font-size:10px;padding:4px 8px">👁 PV</button>
        <button class="btn-ghost" onclick="encerrarCombate()" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:var(--red-dim)">✕ Fim</button>
      </div>
      ${masterForm}
      <div class="ct-scroll" id="ct-lista"></div>
    </div>`;
  setTimeout(()=>renderCT(),50);
}
function buildMapaPanel(c) {
  c.style.padding = '0';
  // Build toolbar HTML - avoid isMaster inside template literals
  const masterBtns = isMaster
    ? `<button class="btn-ghost" onclick="importarMapaImg()" style="font-size:10px;padding:3px 7px">📁 Mapa</button>
       <button class="btn-ghost" onclick="abrirModalCenas()" style="font-size:10px;padding:3px 7px">🎬 Cenas</button>
       <button class="btn-ghost" onclick="abrirCriarTokenCustom()" style="font-size:10px;padding:3px 7px">⭐ Token</button>
       <button class="btn-ghost" onclick="limparTokens()" style="font-size:10px;padding:3px 7px;color:var(--red);border-color:var(--red-dim)">🗑</button>`
    : '';

  c.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;min-height:0">
      <div class="mapa-toolbar" style="flex-shrink:0;padding:5px 8px;gap:5px;flex-wrap:wrap">
        <button class="btn-ghost" id="btn-grid" onclick="toggleGrid()" style="font-size:10px;padding:3px 7px">⬛ Grid</button>
        <div style="display:flex;gap:2px;align-items:center">
          <button id="btn-regua-linha"     class="btn-ghost" onclick="toggleRegua('linha')"     style="font-size:10px;padding:3px 6px" title="Régua Linha">📏</button>
          <button id="btn-regua-circulo"   class="btn-ghost" onclick="toggleRegua('circulo')"   style="font-size:10px;padding:3px 6px" title="Régua Círculo">⭕</button>
          <button id="btn-regua-cone"      class="btn-ghost" onclick="toggleRegua('cone')"      style="font-size:10px;padding:3px 6px" title="Régua Cone">🔺</button>
          <button id="btn-regua-quadrado"  class="btn-ghost" onclick="toggleRegua('quadrado')"  style="font-size:10px;padding:3px 6px" title="Régua Quadrado">⬛</button>
          <button id="btn-regua-retangulo" class="btn-ghost" onclick="toggleRegua('retangulo')" style="font-size:10px;padding:3px 6px" title="Régua Retângulo">▬</button>
        </div>

        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted);margin-left:auto">
          <button class="ct-pv-btn" onclick="alterarZoomBtn(-0.2)">−</button>
          <span id="zoom-label" style="min-width:34px;text-align:center">100%</span>
          <button class="ct-pv-btn" onclick="alterarZoomBtn(0.2)">+</button>
          <button class="ct-pv-btn" onclick="resetZoom()" style="font-size:9px;width:auto;padding:0 4px">↺</button>
        </div>
      </div>
      <div class="mapa-toolbar" style="flex-shrink:0;padding:3px 8px;border-top:none;gap:5px">
        <button class="btn-ghost" onclick="adicionarMeuPersonagem()" style="font-size:10px;padding:3px 7px">🧑 Entrar</button>
        ${masterBtns}
        <div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--muted);margin-left:auto">
          <span>1cel=</span>
          <input type="number" value="1.5" min="0.5" max="10" step="0.5" onchange="metrosPorCelula=parseFloat(this.value)||1.5"
            style="width:36px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:2px;font-size:10px;text-align:center">
          <span>m</span>
        </div>
      </div>
      <div style="flex:1;overflow:hidden;position:relative;min-height:0">
        <canvas id="mapa-canvas" style="display:block;touch-action:none;width:100%;height:100%"></canvas>
        <div id="token-info" style="display:none;position:absolute;bottom:0;left:0;right:0;padding:8px;background:rgba(16,16,26,0.95);border-top:1px solid var(--border);max-height:130px;overflow-y:auto;z-index:10"></div>
      </div>
    </div>`;
  setTimeout(() => { canvas = null; initMapa(); }, 80);
}

function buildPlayersPanel(c) {
  c.innerHTML = `
    <div style="padding:8px;height:100%;overflow-y:auto">
      <div id="ct-players-lista" style="display:flex;flex-direction:column;gap:6px">
        <div style="font-size:11px;color:var(--muted);text-align:center;padding:12px">Carregando...</div>
      </div>
    </div>`;
  setTimeout(()=>renderPlayersParaCT(),100);
}

function buildBestiarioPanel(c) {
  c.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:6px 8px;border-bottom:1px solid var(--border);flex-shrink:0">
        <input type="text" class="ct-filtro" id="ct-filtro" placeholder="🔍 Buscar inimigo..." oninput="renderBestiarioCT()" style="width:100%">
      </div>
      <div id="ct-bestiario-lista" style="flex:1;overflow-y:auto;padding:4px 6px"></div>
    </div>`;
  setTimeout(()=>renderBestiarioCT(),50);
}

// ── PANEL MENU (desktop) ──────────────────────────
let panelMenuOpen = false;
function togglePanelMenu() {
  panelMenuOpen = !panelMenuOpen;
  const m = document.getElementById('panel-menu');
  if (m) { m.style.display = panelMenuOpen ? 'flex' : 'none'; updateDesktopPanelMenu(); }
}
document.addEventListener('click', e => {
  if (panelMenuOpen && !e.target.closest('#panel-menu') && !e.target.closest('[onclick*="togglePanelMenu"]')) {
    panelMenuOpen = false;
    const m = document.getElementById('panel-menu');
    if (m) m.style.display = 'none';
  }
});
