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
  canvas = null;
  window.isMaster = isMaster;

  buildSalaDOM();

  // Feed
  await subscribeToSala();

  // Tensão
  await carregarTensaoSala();
  buildTensaoPips('tensao-pips-sala', tensaoSala, false);

  // CT + Bestiário
  subscribeCT();
  if (isMaster) {
    carregarBestiario();   // busca o bestiário DESTA mesa no banco
    renderPlayersParaCT();
  }

  // Subscreve realtime do mapa ANTES de inicializar (garante que players recebam cenas)
  if (typeof subscribeMapaRealtime === 'function') subscribeMapaRealtime();

  // Mapa
  canvas = null;
  initMapa();
}

function refreshSalaContent() {
  // Reconstrói apenas o conteúdo dinâmico sem recriar o DOM todo
  renderCT();
  if (isMaster) { carregarBestiario(); renderPlayersParaCT(); }
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

  const extraBtns = document.getElementById('sala-topbar-extra-btns');
  if (extraBtns && isMaster && !document.getElementById('btn-abrir-bestiario')) {
    const btn = document.createElement('button');
    btn.id = 'btn-abrir-bestiario';
    btn.className = 'btn-ghost';
    btn.style.cssText = 'font-size:10px;padding:5px 10px';
    btn.textContent = '📖 Bestiário';
    btn.onclick = abrirBestiarioModal;
    extraBtns.insertBefore(btn, extraBtns.firstChild);
  }

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
  { id:'feed',      icon:'chat',     label:'Chat',    visible: () => true },
  { id:'dados',     icon:'d20',      label:'Dados',   visible: () => true },
  { id:'tracker',   icon:'combate',  label:'Combate', visible: () => true },
  { id:'mapa',      icon:'mapa',     label:'Mapa',    visible: () => true },
  { id:'players',   icon:'players',  label:'Players', visible: () => isMaster },
  { id:'bestiario', icon:'📖',       label:'Bestia',  visible: () => isMaster },
  { id:'galeria',   icon:'🖼️',       label:'Fotos',   visible: () => true },
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
    btn.innerHTML = `<span style="font-size:18px">${fracIconOr(t.icon, t.icon, { size: 18 })}</span>${t.label}`;
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
//  DESKTOP DOM — grid fixo de 3 colunas (mockup 2a)
//  col1 (chat+players) · col2 (tensão+dados+combate) · col3 (mapa, largo)
//  Sem arrastar/redimensionar/minimizar — layout fixo, igual ao design.
//  Bestiário/Imagens são recursos extras (não existem no design) — viram
//  modais abertos pelos botões da topbar, em vez de ocupar uma 4ª coluna.
// ══════════════════════════════════════════════════
const DESKTOP_CARDS = {
  col1: [
    { id: 'feed',    icon: 'chat',    label: 'Chat / Sala', fill: true },
    { id: 'players', icon: 'players', label: 'Players', masterOnly: true },
  ],
  col2: [
    { id: 'tensao',  icon: 'tensao',  label: 'Tensão' },
    { id: 'dados',   icon: 'd20',     label: 'Dados' },
    { id: 'tracker', icon: 'combate', label: 'Combat Tracker', fill: true },
  ],
  col3: [
    { id: 'mapa',    icon: 'mapa',    label: 'Mapa', fill: true },
  ],
};

function buildDesktopDOM(root) {
  root.className = 'sala-grid';
  root.style.cssText = '';
  root.innerHTML = '';

  Object.values(DESKTOP_CARDS).forEach((cards, i) => {
    const col = document.createElement('div');
    col.className = 'sala-col sala-col-' + (i + 1);
    cards.forEach(cfg => {
      if (cfg.masterOnly && !isMaster) return;
      col.appendChild(createSalaCard(cfg));
    });
    root.appendChild(col);
  });

  _rmcListener ??= (window.addEventListener('resize', () => { if (typeof resizeMapCanvas === 'function') resizeMapCanvas(); }), true);
}

function createSalaCard(cfg) {
  const el = document.createElement('div');
  el.id = 'dpanel-' + cfg.id;
  el.className = 'sala-card' + (cfg.fill ? ' sala-card-fill' : '');

  const hdr = document.createElement('div');
  hdr.className = 'sala-card-header';
  hdr.innerHTML = `<span class="sala-card-title">${fracIconOr(cfg.icon, cfg.icon, { size: 13 })}${cfg.label}</span>`;

  const body = document.createElement('div');
  body.id = 'fp-body-' + cfg.id;
  body.className = 'sala-card-body';

  el.appendChild(hdr);
  el.appendChild(body);
  buildPanelContent(cfg.id, body);
  return el;
}
let _rmcListener;

// ── Bestiário / Imagens — modais (recursos extras, fora do grid fixo) ──
function abrirModalExtra(id, label, buildFn) {
  document.getElementById('modal-extra-' + id)?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'modal-extra-' + id;
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:640px;height:min(640px,80vh);margin:16px;display:flex;flex-direction:column;overflow:hidden">
      <div class="sala-card-header">
        <span class="sala-card-title">${label}</span>
        <button class="fp-btn fp-close" onclick="this.closest('.modal-overlay').remove()" title="Fechar">✕</button>
      </div>
      <div class="sala-card-body" style="flex:1"></div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  buildFn(overlay.querySelector('.sala-card-body'));
}
function abrirBestiarioModal() { if (isMaster) abrirModalExtra('bestiario', 'Bestiário', buildBestiarioPanel); }
function abrirGaleriaModal() { abrirModalExtra('galeria', 'Imagens da Sessão', buildGaleriaPanel); }

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
    case 'galeria':   buildGaleriaPanel(container);   break;
  }
}

function buildFeed(c) {
  const limparBtn = isMaster
    ? '<div style="padding:4px 8px;border-top:1px solid var(--border);flex-shrink:0"><button class="btn-ghost" onclick="limparHistorico()" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:var(--red-dim);width:100%">🗑 Limpar histórico</button></div>'
    : '';
  c.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div id="feed-messages" style="flex:1;overflow-y:auto;padding:10px;min-height:0">
        <div class="empty-state"><div class="empty-icon">${fracIcon('d20', { size: 36 })}</div><p>Role um dado para começar.</p></div>
      </div>
      <div style="padding:8px;border-top:1px solid var(--border);display:flex;gap:6px;flex-shrink:0">
        <input type="text" class="feed-input" id="msg-input" placeholder="Mensagem..." onkeydown="if(event.key==='Enter')enviarMsg()" style="flex:1">
        <button class="btn-gold" onclick="enviarMsg()" style="font-size:11px;padding:5px 10px">Enviar</button>
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
      ${isMaster ? `
      <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--gold);cursor:pointer;border:1px solid var(--border);border-radius:6px;padding:6px 8px">
        <input type="checkbox" id="roll-oculto" style="accent-color:var(--gold)">
        🕶 Rolagem oculta <span style="color:var(--muted);font-size:9px">(players só veem "o mestre rolou dados...")</span>
      </label>` : ''}
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
          <div style="display:flex;gap:5px;align-items:center">
            <select id="roll-dif" class="formula-select" style="flex:1" onchange="document.getElementById('roll-dif-val').style.display=(this.value==='custom')?'block':'none'">
              <option value="" selected>— livre (sem dificuldade) —</option>
              <option value="8">8 — Fácil</option>
              <option value="11">11 — Moderado</option>
              <option value="14">14 — Difícil</option>
              <option value="17">17 — Severo</option>
              <option value="20">20 — Extremo</option>
              <option value="custom">✏️ Personalizado</option>
            </select>
            <input type="number" id="roll-dif-val" value="11" min="1" max="30" style="display:none;width:54px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:4px;font-size:13px;font-weight:700">
          </div>
          <div id="roll-dif-custom" style="display:none;margin-top:4px">
            <input type="number" id="roll-dif-custom-val" placeholder="Ex: 13" min="1" max="30"
              style="width:100%;background:var(--bg);border:1px solid var(--gold);border-radius:4px;color:var(--text);padding:5px 8px;font-size:13px;font-weight:700;text-align:center;outline:none"
              oninput="document.getElementById('roll-dif-val').value=this.value||11">
          </div>

          <label class="formula-label">Ajudantes <span style="color:var(--muted);font-size:9px">(+2 cada, máx 3)</span></label>
          <div style="display:flex;align-items:center;gap:6px">
            <button class="ct-pv-btn" onclick="let e=document.getElementById('roll-ajudas');e.value=Math.max(0,parseInt(e.value||0)-1)">−</button>
            <input type="number" id="roll-ajudas" value="0" min="0" max="3"
              style="width:44px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:4px;font-size:13px;font-weight:700">
            <button class="ct-pv-btn" onclick="let e=document.getElementById('roll-ajudas');e.value=Math.min(3,parseInt(e.value||0)+1)">+</button>
            <span style="font-size:10px;color:var(--muted)" id="ajuda-label">0 ajudante(s)</span>
          </div>

          <label class="formula-label">Bônus / Penalidade custom</label>
          <div style="display:flex;align-items:center;gap:6px">
            <button class="ct-pv-btn" onclick="let e=document.getElementById('roll-bonus-custom');e.value=parseInt(e.value||0)-1">−</button>
            <input type="number" id="roll-bonus-custom" value="0"
              style="width:54px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:4px;font-size:13px;font-weight:700">
            <button class="ct-pv-btn" onclick="let e=document.getElementById('roll-bonus-custom');e.value=parseInt(e.value||0)+1">+</button>
            <span style="font-size:10px;color:var(--muted)">livre</span>
          </div>
        </div>
        <button class="btn-primary" onclick="rolarFormula()" style="margin-top:8px;display:flex;align-items:center;justify-content:center;gap:7px">${fracIcon('d20', { size: 15 })}Rolar Teste</button>
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
        <button class="btn-gold" onclick="iniciarCombate()" style="font-size:10px;padding:4px 8px;font-weight:700">▶ Iniciar</button>
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
    ? `<button class="btn-ghost" onclick="mapaImportarImagem()" style="font-size:10px;padding:3px 7px">📁 Mapa</button>
       <button class="btn-ghost" onclick="mapaImportarVideo()" style="font-size:10px;padding:3px 7px" title="Vídeo/GIF sobre o mapa">🎬 Vídeo</button>
       <button class="btn-ghost" onclick="mapaStopVideo()" style="font-size:10px;padding:3px 7px;color:var(--red)" title="Remover vídeo">✕Vídeo</button>
       <button class="btn-ghost" onclick="abrirModalCenas()" style="font-size:10px;padding:3px 7px">🎬 Cenas</button>
       <button class="btn-ghost" onclick="abrirCriarTokenCustom()" style="font-size:10px;padding:3px 7px">⭐ Token</button>
       <button class="btn-ghost" onclick="mapaLimpar()" style="font-size:10px;padding:3px 7px;color:var(--red);border-color:var(--red-dim)">🗑</button>`
    : '';

  c.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;min-height:0">
      <div class="mapa-toolbar" style="flex-shrink:0;padding:5px 8px;gap:5px;flex-wrap:wrap">
        <button class="btn-ghost" id="btn-grid" onclick="mapaToggleGrid()" style="font-size:10px;padding:3px 7px">⬛ Grid</button>
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
      ${isMaster ? `
      <div class="mapa-toolbar" style="flex-shrink:0;padding:3px 8px;border-top:none;gap:5px;flex-wrap:wrap">
        <button class="btn-ghost" id="btn-fog-toggle" onclick="fogToggle()" style="font-size:10px;padding:3px 7px;display:inline-flex;align-items:center;gap:5px" title="Ativar/desativar Fog of War">${fracIcon('nevoa', { size: 13 })}Fog</button>
        <div id="fog-tools" style="display:none;gap:4px;align-items:center;flex-wrap:wrap">
          <select id="fog-modo-sel" onchange="fogSetModo(this.value)" style="background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:2px 4px;font-size:10px">
            <option value="visao">👁 Visão automática</option>
            <option value="manual">🖌 Manual</option>
          </select>
          <span style="font-size:9px;color:var(--muted)">Raio</span>
          <input type="number" id="fog-raio-val" value="8" min="2" max="30" onchange="fogSetRaio(this.value)"
            style="width:38px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:2px;font-size:10px;text-align:center" title="Raio de visão em células">
          <button class="btn-ghost" id="btn-fog-revelar" onclick="fogSetTool('revelar')" style="font-size:10px;padding:3px 6px" title="Pincel: revelar área (Shift+arrasto = retângulo)">🔦</button>
          <button class="btn-ghost" id="btn-fog-ocultar" onclick="fogSetTool('ocultar')" style="font-size:10px;padding:3px 6px" title="Pincel: ocultar área (Shift+arrasto = retângulo)">🌑</button>
          <select id="fog-brush-sel" onchange="fogSetBrush(this.value)" title="Tamanho do pincel" style="background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:2px 3px;font-size:10px">
            <option value="0">P·1</option>
            <option value="1">M·3</option>
            <option value="2" selected>G·5</option>
            <option value="4">GG·9</option>
          </select>
          <button class="btn-ghost" id="btn-fog-forma" onclick="fogToggleForma()" style="font-size:10px;padding:3px 6px" title="Forma do pincel: circular ⚪ / quadrado ⬛">⚪</button>
          <button class="btn-ghost" id="btn-fog-parede" onclick="fogSetTool('parede')" style="font-size:10px;padding:3px 6px" title="Desenhar paredes (bloqueiam visão)">🧱</button>
          <button class="btn-ghost" id="btn-fog-apagar-parede" onclick="fogSetTool('apagar-parede')" style="font-size:10px;padding:3px 6px" title="Apagar parede (clique nela)">🚫</button>
          <button class="btn-ghost" onclick="fogRevelarTudo()" style="font-size:9px;padding:3px 6px" title="Revelar mapa inteiro">☀</button>
          <button class="btn-ghost" onclick="fogCobrirTudo()" style="font-size:9px;padding:3px 6px" title="Cobrir tudo de novo">🌑↺</button>
          <button class="btn-ghost" onclick="fogApagarParedes()" style="font-size:9px;padding:3px 6px;color:var(--red)" title="Apagar todas as paredes">🧱✕</button>
        </div>
      </div>` : ''}
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
        <!-- token-info como overlay - NÃO afeta o tamanho do canvas -->
        <div id="token-info" style="display:none;position:absolute;bottom:0;left:0;right:0;padding:8px;background:rgba(13,13,20,0.96);border-top:1px solid var(--border);max-height:120px;overflow-y:auto;z-index:20;backdrop-filter:blur(6px)"
             onmousedown="event.stopPropagation()" onmouseup="event.stopPropagation()"
             ontouchstart="event.stopPropagation()" ontouchend="event.stopPropagation()"
             onclick="event.stopPropagation()"></div>
      </div>
    </div>`;
  setTimeout(() => {
    MAP.canvas = null; mapaInit();
    if (typeof fogSyncUI === 'function') fogSyncUI();
    else if (isMaster) {
      console.error('fog.js NÃO FOI CARREGADO — o arquivo foi enviado para o servidor?');
      toast('⚠ fog.js não carregou! Confira se o arquivo fog.js foi enviado no deploy.', 'err');
    }
  }, 80);
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

// ══════════════════════════════════════════════════
//  GALERIA DE IMAGENS
// ══════════════════════════════════════════════════
async function carregarGaleria() {
  const { data } = await db.from('sala')
    .select('*')
    .eq('mesa_id', mesaId())
    .eq('tipo', 'imagem')
    .order('created_at', { ascending: false })
    .limit(50);

  const grid = document.getElementById('galeria-grid');
  if (!grid) return;

  if (!data || !data.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🖼️</div><p>Nenhuma imagem enviada ainda.</p></div>';
    return;
  }

  grid.innerHTML = '';
  data.forEach(msg => {
    const url = msg.conteudo?.url;
    const legenda = msg.conteudo?.legenda || '';
    if (!url) return;
    const div = document.createElement('div');
    div.className = 'galeria-item';
    div.innerHTML = `
      <img src="${url}" onclick="abrirImagemFullscreen('${url}')" title="${legenda}">
      ${legenda ? `<div class="galeria-legenda">${legenda}</div>` : ''}
      ${isMaster ? `<button class="galeria-del" onclick="deletarImagemGaleria('${msg.id}')" title="Remover">✕</button>` : ''}
    `;
    grid.appendChild(div);
  });
}

async function enviarImagemGaleria(input) {
  const file = input.files[0]; if (!file) return;
  if (!isMaster) { toast('Só o mestre pode enviar imagens.', 'err'); return; }

  // Upload para storage
  const ext  = file.name.split('.').pop();
  const path = `galeria/${currentUser.id}/${Date.now()}.${ext}`;
  const { error } = await db.storage.from('tokens').upload(path, file, { upsert: true });
  if (error) { toast('Erro no upload: ' + error.message, 'err'); return; }
  const { data } = db.storage.from('tokens').getPublicUrl(path);

  const legenda = document.getElementById('galeria-legenda-input')?.value.trim() || '';

  // Salva no feed como mensagem de imagem
  await db.from('sala').insert({
    mesa_id:  mesaId(),
    user_id:  currentUser.id,
    username: currentProfile?.username || 'Mestre',
    tipo:     'imagem',
    conteudo: { url: data.publicUrl, legenda, path }
  });

  // Limpa input
  input.value = '';
  if (document.getElementById('galeria-legenda-input'))
    document.getElementById('galeria-legenda-input').value = '';

  toast('Imagem enviada!', 'ok');
  carregarGaleria();
}

async function deletarImagemGaleria(msgId) {
  if (!confirm('Remover esta imagem?')) return;
  await db.from('sala').delete().eq('id', msgId);
  toast('Imagem removida.', 'ok');
  carregarGaleria();
}

function abrirImagemFullscreen(url) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  overlay.innerHTML = `<img src="${url}" style="max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px">`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

function buildGaleriaPanel(c) {
  const uploadSection = isMaster ? `
    <div style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;align-items:center;flex-shrink:0">
      <input type="text" id="galeria-legenda-input" placeholder="Legenda (opcional)..."
        style="flex:1;min-width:100px;background:var(--bg);border:1px solid var(--border);border-radius:5px;color:var(--text);padding:5px 8px;font-size:11px;outline:none">
      <label style="cursor:pointer">
        <input type="file" accept="image/*" style="display:none" onchange="enviarImagemGaleria(this)">
        <span class="btn-ghost" style="font-size:10px;padding:5px 10px;display:inline-block">📤 Enviar Imagem</span>
      </label>
    </div>` : '';

  c.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      ${uploadSection}
      <div style="padding:6px 8px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <span style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Imagens da Sessão</span>
        <button class="btn-ghost" onclick="carregarGaleria()" style="font-size:9px;padding:3px 8px">↻</button>
      </div>
      <div id="galeria-grid" style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;align-content:start">
        <div class="empty-state"><div class="empty-icon">🖼️</div><p>Carregando...</p></div>
      </div>
    </div>`;
  setTimeout(() => carregarGaleria(), 100);
}
