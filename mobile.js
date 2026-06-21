// ══════════════════════════════════════════════════
//  FRACTURED — mobile.js
//  Interface dedicada para mobile (≤768px)
// ══════════════════════════════════════════════════

let mobileMapaCanvas, mobileCtx;
let mobileZoom = 1, mobileOffX = 0, mobileOffY = 0;
let mobilePinchDist = null;
let mobileDragTok = null, mobileDragOX = 0, mobileDragOY = 0;
let mobilePanStart = null;
let mobileAbaAtiva = 'chat';

function isMobile() { return window.innerWidth <= 768; }

// ── INIT MOBILE ───────────────────────────────────
function initMobile() {
  if (!isMobile()) return;

  buildMobileUI();
  switchMobileAba('chat');

  // Carrega feed e tensão
  carregarFeed();
  carregarTensaoSala();
  subscribeToSala();
}

function buildMobileUI() {
  const sala = document.getElementById('page-sala');
  if (!sala || document.getElementById('mobile-sala-view')) return;

  // View mobile
  const view = document.createElement('div');
  view.className = 'mobile-sala-view';
  view.id = 'mobile-sala-view';

  view.innerHTML = `
    <!-- PAINEL CHAT -->
    <div class="mobile-sala-panel active" id="mp-chat">
      <div class="feed" style="height:100%">
        <div class="feed-header"><div class="feed-dot"></div>AO VIVO</div>
        <div class="feed-messages" id="feed-messages" style="flex:1;overflow-y:auto;padding:10px">
          <div class="empty-state"><div class="empty-icon">🎲</div><p>Role um dado para começar.</p></div>
        </div>
        <div class="feed-input-row" style="padding:8px;border-top:1px solid var(--border);display:flex;gap:6px">
          <input type="text" class="feed-input" id="msg-input" placeholder="Mensagem..." onkeydown="if(event.key==='Enter')enviarMsg()" style="flex:1">
          <button class="btn-ghost" onclick="enviarMsg()" style="font-size:11px;padding:6px 12px">↑</button>
        </div>
      </div>
    </div>

    <!-- PAINEL DADOS -->
    <div class="mobile-sala-panel" id="mp-dados" style="overflow-y:auto;padding:12px;gap:10px">
      <!-- Tensão -->
      <div class="section-card" style="margin:0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase">⚠ Tensão</span>
          <div class="tensao-btns" id="tensao-master-btns" style="display:none;gap:6px">
            <button onclick="alterarTensao(-1)">−</button>
            <button onclick="alterarTensao(1)">+</button>
          </div>
        </div>
        <div class="tensao-pips" id="tensao-pips-sala"></div>
        <div class="tensao-status" id="tensao-status-text" style="margin-top:6px">CALMA (0/10)</div>
        <div style="font-size:9px;color:var(--muted);margin-top:2px" id="tensao-tip"></div>
      </div>
      <!-- Dados rápidos -->
      <div class="section-card" style="margin:0">
        <div class="section-card-title">Dados Rápidos</div>
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
      <!-- Teste -->
      <div class="roll-formula" style="margin:0">
        <div class="roll-formula-title">Teste d20</div>
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
            <option value="3">+3 Vínculo</option><option value="2">+2 Ferramenta</option>
            <option value="2">+2 Aliado</option><option value="-2">−2 Ferido</option>
            <option value="-2">−2 Tensão</option><option value="-3">−3 Sem Equip.</option>
          </select>
          <label class="formula-label">Dificuldade</label>
          <select id="roll-dif" class="formula-select">
            <option value="8">8 — Fácil</option><option value="11" selected>11 — Moderado</option>
            <option value="14">14 — Difícil</option><option value="17">17 — Severo</option><option value="20">20 — Extremo</option>
          </select>
        </div>
        <button class="btn-primary" onclick="rolarFormula()" style="margin-top:10px">🎲 Rolar Teste</button>
      </div>
    </div>

    <!-- PAINEL COMBATE -->
    <div class="mobile-sala-panel" id="mp-combate" style="overflow-y:auto">
      <div class="ct-panel" style="height:auto;min-height:100%">
        <div class="ct-panel-header">
          <span class="ct-rodada-badge" id="ct-rodada">Rodada 1</span>
          <span class="ct-turno-info" id="ct-turno-info">Não iniciado</span>
        </div>
        <div class="ct-panel-btns">
          <button class="btn-ghost" onclick="iniciarCombate()" style="font-size:11px;padding:6px 12px">▶ Iniciar</button>
          <button class="btn-ghost" onclick="proximoTurno()" style="font-size:11px;padding:6px 12px">⏭ Próximo</button>
          <button class="btn-ghost" id="btn-toggle-pv" onclick="togglePVInimigos()" style="font-size:11px;padding:6px 12px">👁 PV</button>
          <button class="btn-ghost" onclick="encerrarCombate()" style="font-size:11px;padding:6px 12px;color:var(--red);border-color:var(--red-dim)">✕</button>
        </div>
        <!-- Só mestre: busca + players -->
        <div id="mobile-master-ct" style="display:none">
          <div style="padding:6px 8px;border-bottom:1px solid var(--border)">
            <input type="text" class="ct-filtro" id="ct-filtro" placeholder="🔍 Buscar inimigo..." oninput="renderBestiarioCT()" style="width:100%">
          </div>
          <div class="ct-bestiario-mini" id="ct-bestiario-lista" style="max-height:200px"></div>
          <div style="padding:4px 8px;border-bottom:1px solid var(--border)">
            <div class="ct-categoria">Players</div>
            <div id="ct-players-lista"></div>
          </div>
          <div class="ct-add-pc">
            <div class="field" style="flex:2"><label>Nome</label><input type="text" id="ct-pc-nome" placeholder="PC..."></div>
            <div class="field" style="flex:1"><label>Ini</label><input type="number" id="ct-pc-ini" placeholder="10" min="1"></div>
            <div class="field" style="flex:1"><label>PV</label><input type="number" id="ct-pc-pv" placeholder="20" min="1"></div>
            <button class="btn-ghost" onclick="adicionarPCCT()" style="align-self:flex-end;font-size:11px;padding:6px">+</button>
          </div>
        </div>
        <!-- Player: botão entrar -->
        <div id="mobile-player-ct" style="display:none;padding:10px">
          <button class="btn-primary" onclick="adicionarMeuPersonagem()" style="margin:0">🧑 Entrar no Mapa</button>
        </div>
        <div class="ct-scroll" id="ct-lista" style="min-height:200px;padding:8px"></div>
      </div>
    </div>

    <!-- PAINEL MAPA — ocupa tela toda -->
    <div class="mobile-sala-panel" id="mp-mapa">
      <div class="mobile-mapa-container">
        <canvas id="mobile-mapa-canvas"></canvas>
        <!-- HUD sobreposto -->
        <div class="mobile-mapa-hud">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="mobile-mapa-btn" onclick="adicionarMeuPersonagem()">🧑 Entrar</button>
            <button class="mobile-mapa-btn" id="mb-grid" onclick="toggleGrid()">⬛ Grid</button>
            <button class="mobile-mapa-btn" id="mb-regua" onclick="toggleRegua()">📏</button>
          </div>
          <div id="mb-master-btns" style="display:none;display:flex;gap:6px">
            <button class="mobile-mapa-btn" onclick="importarMapaImg()">📁</button>
            <button class="mobile-mapa-btn" onclick="abrirCriarTokenCustom()">⭐</button>
          </div>
        </div>
        <!-- Tensão badge -->
        <div class="mobile-tensao-badge" id="mobile-tensao-badge">CALMA 0/10</div>
        <!-- Info token selecionado -->
        <div id="token-info" style="display:none;position:absolute;bottom:0;left:0;right:0;background:rgba(16,16,26,.95);border-top:1px solid var(--border);padding:10px;backdrop-filter:blur(8px)"></div>
        <!-- Zoom buttons -->
        <div class="mobile-mapa-zoom">
          <button onclick="mobileZoom=Math.min(4,mobileZoom+0.25);mobileDesenhar()" style="font-size:22px">+</button>
          <button onclick="mobileZoom=Math.max(0.3,mobileZoom-0.25);mobileDesenhar()" style="font-size:22px">−</button>
          <button onclick="mobileZoom=1;mobileOffX=0;mobileOffY=0;mobileDesenhar()" style="font-size:14px">↺</button>
        </div>
      </div>
    </div>
  `;

  sala.appendChild(view);

  // Tab bar
  const tabBar = document.createElement('div');
  tabBar.className = 'mobile-tab-bar';
  tabBar.id = 'mobile-tab-bar';
  tabBar.innerHTML = `
    <button class="mtab active" id="mtab-chat" onclick="switchMobileAba('chat')">
      <span class="mtab-icon">💬</span>Chat
    </button>
    <button class="mtab" id="mtab-dados" onclick="switchMobileAba('dados')">
      <span class="mtab-icon">🎲</span>Dados
    </button>
    <button class="mtab" id="mtab-combate" onclick="switchMobileAba('combate')">
      <span class="mtab-icon">⚔️</span>Combate
    </button>
    <button class="mtab" id="mtab-mapa" onclick="switchMobileAba('mapa')">
      <span class="mtab-icon">🗺️</span>Mapa
    </button>
  `;
  document.body.appendChild(tabBar);

  // Ajusta visibilidade mestre/player no mobile
  if (window.isMaster) {
    const mct = document.getElementById('mobile-master-ct');
    if (mct) mct.style.display = '';
    const mb = document.getElementById('mb-master-btns');
    if (mb) mb.style.display = 'flex';
    const tmb = document.getElementById('tensao-master-btns');
    if (tmb) tmb.style.display = 'flex';
  } else {
    const pct = document.getElementById('mobile-player-ct');
    if (pct) pct.style.display = '';
  }

  // Init mapa mobile
  initMobileMap();
}

function switchMobileAba(aba) {
  mobileAbaAtiva = aba;
  ['chat','dados','combate','mapa'].forEach(id => {
    const panel = document.getElementById('mp-'+id);
    const tab   = document.getElementById('mtab-'+id);
    if (panel) panel.classList.toggle('active', id === aba);
    if (tab)   tab.classList.toggle('active', id === aba);
  });
  if (aba === 'mapa') { setTimeout(()=>{ initMobileMap(); mobileDesenhar(); }, 50); }
  if (aba === 'combate') { renderCT(); renderBestiarioCT(); renderPlayersParaCT(); }
}

// ── MAPA MOBILE ───────────────────────────────────
function initMobileMap() {
  if (mobileMapaCanvas) return;
  mobileMapaCanvas = document.getElementById('mobile-mapa-canvas');
  if (!mobileMapaCanvas) return;
  mobileCtx = mobileMapaCanvas.getContext('2d');
  resizeMobileCanvas();

  mobileMapaCanvas.addEventListener('touchstart',  onMobileTouch, { passive: false });
  mobileMapaCanvas.addEventListener('touchmove',   onMobileTouchMove, { passive: false });
  mobileMapaCanvas.addEventListener('touchend',    onMobileTouchEnd);

  window.addEventListener('resize', resizeMobileCanvas);
  mobileDesenhar();

  // Subscribe mapa realtime se ainda não feito
  subscribeMapaRealtime();
}

function resizeMobileCanvas() {
  if (!mobileMapaCanvas) return;
  const container = mobileMapaCanvas.parentElement;
  if (!container) return;
  const r = container.getBoundingClientRect();
  mobileMapaCanvas.width  = r.width  || window.innerWidth;
  mobileMapaCanvas.height = r.height || (window.innerHeight - 56 - 58);
  mobileDesenhar();
}

function mobileDesenhar() {
  if (!mobileCtx || !mobileMapaCanvas) return;
  const W = mobileMapaCanvas.width, H = mobileMapaCanvas.height;
  mobileCtx.clearRect(0,0,W,H);
  mobileCtx.fillStyle = '#05050a';
  mobileCtx.fillRect(0,0,W,H);

  mobileCtx.save();
  mobileCtx.translate(mobileOffX, mobileOffY);
  mobileCtx.scale(mobileZoom, mobileZoom);

  // Mapa imagem de fundo
  if (mapaImg) mobileCtx.drawImage(mapaImg, 0, 0, CW, CH);

  // Grid
  if (gridVisivel) {
    mobileCtx.strokeStyle = 'rgba(192,57,43,0.18)';
    mobileCtx.lineWidth = 1/mobileZoom;
    for (let x=0; x<=CW; x+=gridSize) { mobileCtx.beginPath(); mobileCtx.moveTo(x,0); mobileCtx.lineTo(x,CH); mobileCtx.stroke(); }
    for (let y=0; y<=CH; y+=gridSize) { mobileCtx.beginPath(); mobileCtx.moveTo(0,y); mobileCtx.lineTo(CW,y); mobileCtx.stroke(); }
  }

  // Régua
  if (medindoDistancia && medirStart && medirEnd) {
    const s = mobileScreenToWorld(medirStart), e = mobileScreenToWorld(medirEnd);
    mobileCtx.beginPath(); mobileCtx.moveTo(s.x,s.y); mobileCtx.lineTo(e.x,e.y);
    mobileCtx.strokeStyle = '#f1c40f'; mobileCtx.lineWidth = 2/mobileZoom;
    mobileCtx.setLineDash([6/mobileZoom,4/mobileZoom]); mobileCtx.stroke(); mobileCtx.setLineDash([]);
    const dx=e.x-s.x, dy=e.y-s.y;
    const metros = (Math.sqrt(dx*dx+dy*dy)/gridSize*metrosPorCelula).toFixed(1);
    mobileCtx.font = `bold ${16/mobileZoom}px sans-serif`;
    mobileCtx.fillStyle = '#f1c40f'; mobileCtx.textAlign = 'center';
    mobileCtx.fillText(`${metros}m`, (s.x+e.x)/2, (s.y+e.y)/2-5/mobileZoom);
  }

  tokens.forEach(t => mobileDesenharToken(t));
  mobileCtx.restore();

  // Atualiza badge tensão
  const badge = document.getElementById('mobile-tensao-badge');
  if (badge) {
    const t = tensaoSala;
    const label = t<=3?'CALMA':t<=6?'ALERTA':t<=8?'PERIGO':'TERROR';
    badge.textContent = `${label} ${t}/10`;
    badge.style.color = t<=3?'#e67e22':t<=6?'#c0392b':t<=8?'#c0392b':'#8e44ad';
  }
}

function mobileDesenharToken(t) {
  const r  = gridSize * 0.42;
  const cx = t.x + gridSize/2, cy = t.y + gridSize/2;
  const cor = corTipo(t.tipo);

  if (tokenSel?.id === t.id) {
    mobileCtx.beginPath(); mobileCtx.arc(cx,cy,r+5/mobileZoom,0,Math.PI*2);
    mobileCtx.strokeStyle='#f1c40f'; mobileCtx.lineWidth=3/mobileZoom; mobileCtx.stroke();
  }

  if (t.imgUrl) {
    const img = tokenImgCache[t.imgUrl] || (()=>{
      const i=new Image(); i.onload=()=>{tokenImgCache[t.imgUrl]=i;mobileDesenhar();};
      i.src=t.imgUrl; return i;
    })();
    mobileCtx.save();
    mobileCtx.beginPath(); mobileCtx.arc(cx,cy,r,0,Math.PI*2); mobileCtx.clip();
    try{mobileCtx.drawImage(img,cx-r,cy-r,r*2,r*2);}catch(e){}
    mobileCtx.restore();
    mobileCtx.beginPath(); mobileCtx.arc(cx,cy,r,0,Math.PI*2);
    mobileCtx.strokeStyle=cor; mobileCtx.lineWidth=2.5/mobileZoom; mobileCtx.stroke();
  } else {
    mobileCtx.beginPath(); mobileCtx.arc(cx,cy,r,0,Math.PI*2);
    mobileCtx.fillStyle=cor; mobileCtx.fill();
    mobileCtx.strokeStyle='rgba(255,255,255,0.2)'; mobileCtx.lineWidth=1.5/mobileZoom; mobileCtx.stroke();
    mobileCtx.font=`${gridSize*0.36}px serif`;
    mobileCtx.textAlign='center'; mobileCtx.textBaseline='middle';
    mobileCtx.fillText(t.emoji||'?',cx,cy);
  }

  // Nome
  mobileCtx.font=`bold ${Math.max(10,gridSize*0.13)}px sans-serif`;
  mobileCtx.strokeStyle='rgba(0,0,0,0.9)'; mobileCtx.lineWidth=3/mobileZoom;
  mobileCtx.fillStyle='#fff'; mobileCtx.textAlign='center'; mobileCtx.textBaseline='top';
  mobileCtx.strokeText(t.nome.substring(0,10),cx,t.y+gridSize-15);
  mobileCtx.fillText(t.nome.substring(0,10),cx,t.y+gridSize-15);

  // PV bar
  if (t.pvMax&&(t.isPC||isMaster||mostrarPVInimigos)) {
    const bw=gridSize-8,bh=6,bx=t.x+4,by=t.y+3;
    const pct=Math.max(0,t.pvAtual/t.pvMax);
    mobileCtx.fillStyle='rgba(0,0,0,0.6)'; mobileCtx.fillRect(bx,by,bw,bh);
    mobileCtx.fillStyle=pct>0.5?'#27ae60':pct>0.25?'#f39c12':'#c0392b';
    mobileCtx.fillRect(bx,by,bw*pct,bh);
  }
}

function mobileScreenToWorld(p) {
  return { x:(p.x-mobileOffX)/mobileZoom, y:(p.y-mobileOffY)/mobileZoom };
}

function getMobileCanvasPos(touch) {
  const r = mobileMapaCanvas.getBoundingClientRect();
  return { x: touch.clientX - r.left, y: touch.clientY - r.top };
}

function getMobileTokenAt(wx, wy) {
  return tokens.slice().reverse().find(t=>wx>=t.x&&wx<=t.x+gridSize&&wy>=t.y&&wy<=t.y+gridSize);
}

// ── TOUCH EVENTS ──────────────────────────────────
let touchStartTime = 0;

function onMobileTouch(e) {
  e.preventDefault();

  if (e.touches.length === 2) {
    mobilePinchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    mobileDragTok = null;
    return;
  }

  const t = e.touches[0];
  const sp = getMobileCanvasPos(t);
  touchStartTime = Date.now();

  if (medindoDistancia) { medirStart = sp; medirEnd = sp; return; }

  const wp = mobileScreenToWorld(sp);
  const tok = getMobileTokenAt(wp.x, wp.y);

  if (tok && podeMoverToken(tok)) {
    mobileDragTok = tok;
    mobileDragOX  = wp.x - tok.x;
    mobileDragOY  = wp.y - tok.y;
    tokenSel = tok;
    mostrarInfoToken(tok);
    mobileDesenhar();
  } else {
    mobilePanStart = sp;
    tokenSel = null;
    esconderInfoToken();
    mobileDesenhar();
  }
}

function onMobileTouchMove(e) {
  e.preventDefault();

  // Pinch zoom
  if (e.touches.length === 2 && mobilePinchDist) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const midX = (e.touches[0].clientX + e.touches[1].clientX)/2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY)/2;
    const r    = mobileMapaCanvas.getBoundingClientRect();
    const mx   = midX - r.left, my = midY - r.top;
    const delta = dist / mobilePinchDist;
    mobileZoom  = Math.max(0.3, Math.min(4, mobileZoom * delta));
    mobileOffX  = mx - (mx - mobileOffX) * delta;
    mobileOffY  = my - (my - mobileOffY) * delta;
    mobilePinchDist = dist;
    mobileDesenhar();
    return;
  }

  const t  = e.touches[0];
  const sp = getMobileCanvasPos(t);

  if (medindoDistancia && medirStart) { medirEnd = sp; mobileDesenhar(); return; }

  if (mobileDragTok) {
    const wp = mobileScreenToWorld(sp);
    mobileDragTok.x = Math.max(0, Math.min(CW-gridSize, wp.x - mobileDragOX));
    mobileDragTok.y = Math.max(0, Math.min(CH-gridSize, wp.y - mobileDragOY));
    mobileDesenhar();
    return;
  }

  if (mobilePanStart) {
    mobileOffX += sp.x - mobilePanStart.x;
    mobileOffY += sp.y - mobilePanStart.y;
    mobilePanStart = sp;
    mobileDesenhar();
  }
}

function onMobileTouchEnd(e) {
  mobilePinchDist = null;

  if (mobileDragTok) {
    mobileDragTok.x = Math.round(mobileDragTok.x / gridSize) * gridSize;
    mobileDragTok.y = Math.round(mobileDragTok.y / gridSize) * gridSize;
    salvarMapaDB();
    mobileDragTok = null;
    mobileDesenhar();
    return;
  }

  if (medindoDistancia) return;
  mobilePanStart = null;
}

// Escuta updates do mapa realtime e redesenha no mobile também
const _origCarregar = carregarMapaDB;
window.carregarMapaDB = async function() {
  await _origCarregar();
  if (isMobile()) mobileDesenhar();
};

// Redesenha mobile quando tokens mudam
const _origDesenhar = desenharMapa;
window.desenharMapa = function() {
  if (canvas) _origDesenhar();
  if (isMobile()) mobileDesenhar();
};

