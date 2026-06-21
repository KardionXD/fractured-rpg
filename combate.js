// ══════════════════════════════════════════════════
//  FRACTURED — combate.js v3
// ══════════════════════════════════════════════════

const BESTIARIO = {
  infectados: [
    { id:'corredor',     nome:'Corredor',          pv:10, com:1,  agi:2,  res:0,  emoji:'🧟', tipo:'infectado',
      habilidades:['Enxame: 3+ atacam o mesmo alvo','Hesitação: para 1 round ao ver rosto familiar','Grito de Atração'],
      fraqueza:'Qualquer dano direto. Separe e elimine.' },
    { id:'perseguidor',  nome:'Perseguidor',        pv:15, com:2,  agi:1,  res:1,  emoji:'🧟', tipo:'infectado',
      habilidades:['Emboscada automática','Gavinhas: +3 surpresa','Perseguição Tenaz'],
      fraqueza:'Fogo e impacto. Armadilhas de arame.' },
    { id:'estalador',    nome:'Estalador',          pv:20, com:3,  agi:1,  res:2,  emoji:'🕷️', tipo:'infectado',
      habilidades:['Sonar: detecta >30dB','Agarrão Fatal: mata em 1 round','Blindagem: −2 dano exceto fogo'],
      fraqueza:'Fogo. Morte silenciosa: AGI≥17 + faca.' },
    { id:'baiacu',       nome:'Baiacu',             pv:35, com:4,  agi:-1, res:4,  emoji:'💀', tipo:'infectado',
      habilidades:['Armadura: dano÷2','Nuvem de Esporos 5m ao morrer','Investida: +2d6'],
      fraqueza:'Explosivos e fogo prolongado APENAS.' },
    { id:'tropego',      nome:'Trôpego',            pv:30, com:3,  agi:-1, res:3,  emoji:'💣', tipo:'infectado',
      habilidades:['Não morde','Explosão: qualquer dano→esporos 3m','Resistência Ácida'],
      fraqueza:'Explosivos a distância APENAS.' },
    { id:'rei_ratos',    nome:'Rei dos Ratos',      pv:80, com:5,  agi:-2, res:6,  emoji:'👑', tipo:'infectado',
      habilidades:['Divisão: 50%PV→2d4 infectados','Rede 100m','Cascata de Morte','Regen +5PV/round'],
      fraqueza:'Destrua 5+ nós da rede primeiro.' },
  ],
  animais: [
    { id:'lobo',   nome:'Lobo / Cão Selvagem', pv:12, com:2, agi:3,  res:0,  emoji:'🐺', tipo:'animal',
      habilidades:['Flanqueio: +2 dano','Avaliação de Presa','Perseguição 500m'],
      fraqueza:'Mate o alfa→60% recua. Fogo afasta.' },
    { id:'urso',   nome:'Urso',                pv:45, com:4, agi:0,  res:5,  emoji:'🐻', tipo:'animal',
      habilidades:['Investida: +3, derruba','Resistência: −2 dano','Com filhotes: nunca recua'],
      fraqueza:'Rifle pesado ou explosivos.' },
    { id:'javali', nome:'Javali',              pv:20, com:3, agi:1,  res:2,  emoji:'🐗', tipo:'animal',
      habilidades:['Carga: AGI≥13 desviar','Presa: 2d6+3','Bando: +1 Tensão'],
      fraqueza:'Tiro na cabeça. Suba.' },
    { id:'corvo',  nome:'Corvo de Bando',      pv:3,  com:0, agi:4,  res:-2, emoji:'🐦', tipo:'animal',
      habilidades:['Delator: revela posição','Alarme: +1 Tensão'],
      fraqueza:'Ignore. Matar piora.' },
  ],
  humanos: [
    { id:'saqueador', nome:'Saqueador',          pv:14, com:1, agi:1,  res:-1, emoji:'🔪', tipo:'humano',
      habilidades:['Moral Frágil: SOCIAL≥11','Rendição possível','Armamento improvisado'],
      fraqueza:'Intimide antes de atacar.' },
    { id:'atirador',  nome:'Atirador de Facção', pv:18, com:3, agi:2,  res:0,  emoji:'🔫', tipo:'humano',
      habilidades:['Cobertura: +2 defesa','Relata à facção em 1d4 dias','Tiro coordenado'],
      fraqueza:'Flanqueie ou destrua cobertura.' },
    { id:'lider',     nome:'Líder de Bando',     pv:25, com:4, agi:2,  res:3,  emoji:'😈', tipo:'humano',
      habilidades:['Imune a intimidação simples','Eleva aliados','Negocia por interesse'],
      fraqueza:'Eliminar o líder quebra o grupo.' },
    { id:'cacador',   nome:'Caçador Profissional',pv:22, com:4, agi:3,  res:-2, emoji:'🏹', tipo:'humano',
      habilidades:['Emboscada: INSTINTO≥16','Rastreamento 24h','Tiro Silencioso'],
      fraqueza:'Mude de rota. Inverta a caça.' },
  ],
  animais_infectados: [
    { id:'cao_corredor',   nome:'Cão Corredor',   pv:16, com:3, agi:4,  res:1,  emoji:'🐕', tipo:'animal_infectado',
      habilidades:['Age 2x/round','Rastreamento fúngico','Mordida infectante RES≥13'],
      fraqueza:'Armadilhas de laço. Fogo desorienta.' },
    { id:'urso_estalador', nome:'Urso Estalador', pv:60, com:5, agi:0,  res:6,  emoji:'🐻', tipo:'animal_infectado',
      habilidades:['Sonar: >20dB','Armadura: −3 dano','Investida: +3d6','Agarrão: 2d8/round'],
      fraqueza:'Explosivos e fogo prolongado. Fuja em silêncio.' },
  ]
};
const TODOS_INIMIGOS = Object.values(BESTIARIO).flat();

// ── ESTADO ────────────────────────────────────────
let combatentes       = [];
let turnoAtual        = 0;
let rodadaAtual       = 1;
let combateAtivo      = false;
let mostrarPVInimigos = true;

// ── ESTADO MAPA ───────────────────────────────────
let tokens      = [];
let tokenSel    = null;
let dragTok     = null;
let dragOX = 0, dragOY = 0;
let gridSize    = 60;
let gridVisivel = true;
let mapaImg     = null;
let mapaUrl     = null;
let metrosPorCelula = 1.5;
let medindoDistancia = false;
let medirStart  = null;
let medirEnd    = null;
let mapaZoom    = 1;
let mapaOffX    = 0;
let mapaOffY    = 0;
let isPanning   = false;
let panStart    = null;
let tokenCustomImg = null;

let canvas, ctx;
const CW = 1600, CH = 900;

// ══════════════════════════════════════════════════
//  COMBAT TRACKER
// ══════════════════════════════════════════════════
function renderCT() {
  const lista = document.getElementById('ct-lista');
  if (!lista) return;

  if (!combatentes.length) {
    lista.innerHTML = '<div class="ct-empty">Sem combatentes.</div>';
    document.getElementById('ct-rodada').textContent    = 'Rodada 1';
    document.getElementById('ct-turno-info').textContent = 'Não iniciado';
    return;
  }

  const ord = [...combatentes].sort((a,b) => b.iniciativa - a.iniciativa);
  lista.innerHTML = '';

  ord.forEach((c, idx) => {
    const isAtual  = combateAtivo && ord[turnoAtual]?.id === c.id;
    const pct      = c.pvMax ? Math.max(0, Math.round(c.pvAtual/c.pvMax*100)) : 100;
    const barCol   = pct > 50 ? '#27ae60' : pct > 25 ? '#f39c12' : '#c0392b';
    const estado   = !c.pvMax ? '' : pct>75?'':pct>50?'🩹':pct>25?'⚠️':pct>0?'💀':'☠️';
    const ocultarPV= !c.isPC && !mostrarPVInimigos && !isMaster;
    const imgTag   = c.imgUrl
      ? `<img src="${c.imgUrl}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0">`
      : `<span style="font-size:22px;flex-shrink:0">${c.emoji||'❓'}</span>`;

    // Controlador
    const ctrlLabel = c.controlador
      ? `<span style="font-size:9px;color:var(--gold)">▶ ${c.controlador}</span>`
      : (isMaster && !c.isPC ? `<button class="ct-ctrl-btn" onclick="definirControlador('${c.id}')">👤 Atribuir</button>` : '');

    const div = document.createElement('div');
    div.className = 'ct-item'+(isAtual?' ct-ativo':'')+(c.pvAtual<=0&&c.pvMax?' ct-morto':'');
    div.innerHTML = `
      <div class="ct-ordem">${isAtual?'▶':idx+1}</div>
      ${imgTag}
      <div class="ct-info">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span class="ct-nome">${c.nome}${c.tag?`<span class="ct-tag">${c.tag}</span>`:''}</span>
          ${estado?`<span>${estado}</span>`:''}
          ${ctrlLabel}
        </div>
        <div class="ct-ini">INI: <strong>${c.iniciativa}</strong></div>
        ${c.pvMax && !ocultarPV ? `
        <div class="ct-bar-wrap"><div class="ct-bar" style="width:${pct}%;background:${barCol}"></div></div>
        <div class="ct-pv-row">
          <span class="ct-pv-label">PV</span>
          <button class="ct-pv-btn" onclick="alterarPV('${c.id}',-1)">−</button>
          <input type="number" class="ct-pv-input" value="${c.pvAtual}" min="0" max="${c.pvMax}" onchange="setPV('${c.id}',this.value)">
          <span class="ct-pv-sep">/${c.pvMax}</span>
          <button class="ct-pv-btn" onclick="alterarPV('${c.id}',1)">+</button>
          <button class="ct-pv-btn ct-pv-dmg" onclick="danoRapido('${c.id}')">⚔</button>
        </div>` : c.pvMax&&ocultarPV ? `<div style="font-size:9px;color:var(--muted)">PV oculto</div>` : ''}
        ${c.condicoes?.length ? `<div class="ct-condicoes">${c.condicoes.map(cn=>`<span class="ct-cond">${cn}</span>`).join('')}</div>` : ''}
        ${c.habilidades ? `<details class="ct-detalhes"><summary>Habilidades</summary><ul>${c.habilidades.map(h=>`<li>${h}</li>`).join('')}</ul>${c.fraqueza?`<div class="ct-fraqueza">⚡ ${c.fraqueza}</div>`:''}</details>` : ''}
      </div>
      <div class="ct-acoes">
        <button class="ct-btn" onclick="toggleCond('${c.id}','Atordoado')" title="Atordoado">😵</button>
        <button class="ct-btn" onclick="toggleCond('${c.id}','Envenenado')" title="Envenenado">☠</button>
        <button class="ct-btn" onclick="toggleCond('${c.id}','Imobilizado')" title="Imob.">🔒</button>
        <button class="ct-btn ct-btn-red" onclick="removerComb('${c.id}')" title="Remover">✕</button>
      </div>
    `;
    lista.appendChild(div);
  });

  document.getElementById('ct-rodada').textContent     = `Rodada ${rodadaAtual}`;
  document.getElementById('ct-turno-info').textContent = combateAtivo
    ? `▶ ${[...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa)[turnoAtual]?.nome||'—'}`
    : 'Não iniciado';
}

function adicionarInimigoCT(inimigo) {
  if (!isMaster) return;
  const existentes = combatentes.filter(c => c.id.startsWith(inimigo.id));
  combatentes.push({
    id: inimigo.id+'_'+Date.now(),
    nome: inimigo.nome, emoji: inimigo.emoji,
    tag: existentes.length ? ` #${existentes.length+1}` : '',
    pvMax: inimigo.pv, pvAtual: inimigo.pv,
    iniciativa: Math.floor(Math.random()*20)+1+(inimigo.agi||0),
    tipo: inimigo.tipo, habilidades: inimigo.habilidades,
    fraqueza: inimigo.fraqueza, condicoes: [], isPC: false,
    controlador: null,
  });
  renderCT();
}

// Adicionar ficha de player ao CT e mapa
async function adicionarPlayerCT(userId) {
  if (!isMaster) return;
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', userId).single();
  const { data: profile } = await db.from('profiles').select('username').eq('id', userId).single();
  if (!ficha) return toast('Esse player não tem ficha ainda.', 'err');

  const pvMax = Math.max((ficha.attr_res||0)*4, 4);
  const id = 'pc_'+userId;
  if (!combatentes.find(c => c.id === id)) {
    combatentes.push({
      id, nome: ficha.nome || profile.username,
      emoji: '🧑', imgUrl: ficha.foto_url || null,
      pvMax, pvAtual: ficha.pv_atual || pvMax,
      iniciativa: Math.floor(Math.random()*20)+1,
      tipo: 'pc', isPC: true, userId,
      condicoes: [], controlador: profile.username,
    });
  }
  if (!tokens.find(t => t.id === id)) {
    tokens.push({
      id, nome: ficha.nome || profile.username,
      emoji: '🧑', imgUrl: ficha.foto_url || null,
      tipo: 'pc', x: snap(gridSize), y: snap(gridSize),
      pvMax, pvAtual: ficha.pv_atual || pvMax,
      isPC: true, userId,
    });
    desenharMapa(); salvarMapaDB();
  }
  renderCT();
  toast(`${ficha.nome || profile.username} adicionado!`, 'ok');
}

// Player adiciona o próprio personagem
async function adicionarMeuPersonagem() {
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', currentUser.id).single();
  if (!ficha) return toast('Você ainda não criou sua ficha!', 'err');

  const pvMax = Math.max((ficha.attr_res||0)*4, 4);
  const id = 'pc_'+currentUser.id;

  if (tokens.find(t => t.id === id)) return toast('Você já está no mapa!', 'err');

  tokens.push({
    id, nome: ficha.nome || currentProfile.username,
    emoji: '🧑', imgUrl: ficha.foto_url || null,
    tipo: 'pc', x: snap(gridSize*2), y: snap(gridSize*2),
    pvMax, pvAtual: ficha.pv_atual || pvMax,
    isPC: true, userId: currentUser.id,
  });
  desenharMapa(); salvarMapaDB();
  toast('Você entrou no mapa!', 'ok');
}

function definirControlador(combId) {
  // Abre modal de atribuição
  const c = combatentes.find(x => x.id === combId);
  if (!c) return;

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;width:100%;max-width:320px">
      <div style="font-size:13px;font-weight:700;margin-bottom:12px">👤 Atribuir Controle — ${c.nome}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:10px">Quem vai controlar este token?</div>
      <div id="ctrl-players-list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        <div style="font-size:11px;color:var(--muted)">Carregando players...</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-ghost" style="flex:1" onclick="this.closest('[style*=fixed]').remove()">Cancelar</button>
        <button class="btn-ghost" style="color:var(--red);border-color:var(--red-dim)" onclick="removerControlador('${combId}');this.closest('[style*=fixed]').remove()">Remover controle</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });

  // Carrega lista de players
  db.from('profiles').select('id,username').eq('is_master',false).then(({data}) => {
    const lista = document.getElementById('ctrl-players-list');
    if (!lista || !data?.length) return;
    lista.innerHTML = '';
    data.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'ct-inimigo-item';
      btn.style.cssText = 'cursor:pointer;border:none;text-align:left;width:100%;background:var(--surface2)';
      btn.innerHTML = `<span style="font-size:18px">🧑</span><span style="font-size:12px;flex:1">${p.username}</span><span style="font-size:10px;color:var(--muted)">${c.controlador===p.username?'✓ Atual':''}</span>`;
      btn.onclick = () => {
        atribuirControlador(combId, p.username);
        modal.remove();
      };
      lista.appendChild(btn);
    });
  });
}

function atribuirControlador(combId, username) {
  const c = combatentes.find(x => x.id === combId);
  if (!c) return;
  c.controlador = username;
  const t = tokens.find(x => x.id === combId);
  if (t) { t.controladorNome = username; salvarMapaDB(); }
  renderCT();
  toast(`Controle de "${c.nome}" atribuído a ${username}!`, 'ok');
}

function removerControlador(combId) {
  const c = combatentes.find(x => x.id === combId);
  if (!c) return;
  c.controlador = null;
  const t = tokens.find(x => x.id === combId);
  if (t) { t.controladorNome = null; salvarMapaDB(); }
  renderCT();
  toast('Controle removido.', 'ok');
}

function adicionarPCCT() {
  const nome = document.getElementById('ct-pc-nome')?.value.trim();
  const ini  = parseInt(document.getElementById('ct-pc-ini')?.value)||10;
  const pv   = parseInt(document.getElementById('ct-pc-pv')?.value)||20;
  if (!nome) return;
  combatentes.push({
    id:'pc_'+Date.now(), nome, emoji:'🧑',
    pvMax:pv, pvAtual:pv, iniciativa:ini,
    tipo:'pc', isPC:true, condicoes:[], controlador: nome,
  });
  if (document.getElementById('ct-pc-nome')) document.getElementById('ct-pc-nome').value='';
  renderCT();
}

function iniciarCombate() {
  if (!combatentes.length) return;
  combateAtivo=true; turnoAtual=0; rodadaAtual=1; renderCT();
}

function proximoTurno() {
  if (!combateAtivo||!combatentes.length) return;
  const ord=[...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa);
  turnoAtual++;
  if (turnoAtual>=ord.length){turnoAtual=0;rodadaAtual++;}
  let t=0;
  while(ord[turnoAtual]?.pvAtual<=0&&ord[turnoAtual]?.pvMax&&t<ord.length){
    turnoAtual++; if(turnoAtual>=ord.length){turnoAtual=0;rodadaAtual++;} t++;
  }
  renderCT();
}

function encerrarCombate() {
  if (!confirm('Encerrar combate e limpar lista?')) return;
  combatentes=[]; turnoAtual=0; rodadaAtual=1; combateAtivo=false; renderCT();
}

function alterarPV(id,delta) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  c.pvAtual=Math.max(0,Math.min(c.pvMax,c.pvAtual+delta));
  const t=tokens.find(x=>x.id===id); if(t){t.pvAtual=c.pvAtual;desenharMapa();}
  renderCT();
}

function setPV(id,val) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  c.pvAtual=Math.max(0,Math.min(c.pvMax,parseInt(val)||0));
  const t=tokens.find(x=>x.id===id); if(t){t.pvAtual=c.pvAtual;desenharMapa();}
  renderCT();
}

function danoRapido(id) {
  const v=prompt('Quanto de dano?'); if(!v) return;
  const d=parseInt(v); if(isNaN(d)) return;
  alterarPV(id,-d);
}

function toggleCond(id,cond) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  if(!c.condicoes)c.condicoes=[];
  const i=c.condicoes.indexOf(cond);
  if(i>=0)c.condicoes.splice(i,1); else c.condicoes.push(cond);
  renderCT();
}

function removerComb(id) {
  combatentes=combatentes.filter(c=>c.id!==id);
  if(turnoAtual>=combatentes.length)turnoAtual=0;
  renderCT();
}

function togglePVInimigos() {
  mostrarPVInimigos=!mostrarPVInimigos;
  const btn=document.getElementById('btn-toggle-pv');
  if(btn)btn.textContent=mostrarPVInimigos?'👁 Ocultar PV':'👁 Mostrar PV';
  renderCT();
}

// Bestiário — só mestre vê
function renderBestiarioCT() {
  const lista=document.getElementById('ct-bestiario-lista'); if(!lista) return;
  if (!isMaster) { lista.innerHTML=''; return; }
  const filtro=(document.getElementById('ct-filtro')?.value||'').toLowerCase();
  lista.innerHTML='';
  const nomes={infectados:'Infectados',animais:'Animais',humanos:'Humanos',animais_infectados:'Animais Infectados'};
  Object.entries(BESTIARIO).forEach(([cat,inimigos])=>{
    const fil=inimigos.filter(i=>i.nome.toLowerCase().includes(filtro));
    if(!fil.length) return;
    const h=document.createElement('div'); h.className='ct-categoria'; h.textContent=nomes[cat]; lista.appendChild(h);
    fil.forEach(ini=>{
      const div=document.createElement('div'); div.className='ct-inimigo-item';
      div.innerHTML=`
        <span class="ct-inimigo-emoji">${ini.emoji}</span>
        <div class="ct-inimigo-info">
          <div class="ct-inimigo-nome">${ini.nome}</div>
          <div class="ct-inimigo-stats">PV ${ini.pv} · COM ${ini.com>=0?'+':''}${ini.com}</div>
        </div>
        <div style="display:flex;gap:3px;flex-shrink:0">
          <button class="ct-add-btn" onclick='adicionarInimigoCT(${JSON.stringify(ini).replace(/'/g,"&#39;")})'>+CT</button>
          <button class="ct-add-btn ct-add-mapa" onclick='adicionarTokenMapa(${JSON.stringify(ini).replace(/'/g,"&#39;")})'>+🗺</button>
        </div>`;
      lista.appendChild(div);
    });
  });
}

// Lista players com ficha para mestre adicionar
async function renderPlayersParaCT() {
  const lista = document.getElementById('ct-players-lista'); if(!lista||!isMaster) return;
  const { data: profiles } = await db.from('profiles').select('id,username').eq('is_master',false);
  if (!profiles?.length) { lista.innerHTML='<div style="font-size:10px;color:var(--muted);padding:4px">Sem players</div>'; return; }
  const ids = profiles.map(p=>p.id);
  const { data: fichas } = await db.from('fichas').select('user_id,nome,attr_res,pv_atual').in('user_id',ids);
  lista.innerHTML='';
  profiles.forEach(p => {
    const f = fichas?.find(x=>x.user_id===p.id);
    if (!f) return;
    const div=document.createElement('div'); div.className='ct-inimigo-item';
    div.innerHTML=`
      <span style="font-size:18px">🧑</span>
      <div class="ct-inimigo-info">
        <div class="ct-inimigo-nome">${f.nome||p.username}</div>
        <div class="ct-inimigo-stats">PV ${f.pv_atual||0}/${Math.max((f.attr_res||0)*4,4)}</div>
      </div>
      <div style="display:flex;gap:3px;flex-shrink:0">
        <button class="ct-add-btn" onclick="adicionarPlayerSomenteCT('${p.id}')" title="Só no Combat Tracker">+CT</button>
        <button class="ct-add-btn ct-add-mapa" onclick="adicionarPlayerSomenteMapa('${p.id}')" title="Só no Mapa">+🗺</button>
        <button class="ct-add-btn" onclick="adicionarPlayerCT('${p.id}')" title="CT e Mapa" style="font-size:9px">+Ambos</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

// ══════════════════════════════════════════════════
//  MAPA
// ══════════════════════════════════════════════════
function initMapa() {
  if (canvas) return; // já inicializado
  canvas=document.getElementById('mapa-canvas'); if(!canvas) return;
  ctx=canvas.getContext('2d');
  canvas.width=CW; canvas.height=CH;

  // Mouse
  canvas.addEventListener('mousedown', onMDown);
  canvas.addEventListener('mousemove', onMMove);
  canvas.addEventListener('mouseup',   onMUp);
  canvas.addEventListener('wheel',     onWheel, {passive:false});
  // Touch
  canvas.addEventListener('touchstart',onTStart,{passive:false});
  canvas.addEventListener('touchmove', onTMove, {passive:false});
  canvas.addEventListener('touchend',  onTEnd);

  carregarMapaDB();
}

function desenharMapa() {
  if(!ctx) return;
  ctx.save();
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#05050a'; ctx.fillRect(0,0,CW,CH);

  // Zoom e pan
  ctx.translate(mapaOffX, mapaOffY);
  ctx.scale(mapaZoom, mapaZoom);

  if(mapaImg) ctx.drawImage(mapaImg,0,0,CW,CH);

  // Grid
  if(gridVisivel) {
    ctx.strokeStyle='rgba(192,57,43,0.18)'; ctx.lineWidth=1/mapaZoom;
    for(let x=0;x<=CW;x+=gridSize){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
    for(let y=0;y<=CH;y+=gridSize){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
  }

  // Régua
  if(medindoDistancia&&medirStart&&medirEnd){
    const s=screenToWorld(medirStart), e=screenToWorld(medirEnd);
    ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(e.x,e.y);
    ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2/mapaZoom;
    ctx.setLineDash([6/mapaZoom,4/mapaZoom]); ctx.stroke(); ctx.setLineDash([]);
    const dx=e.x-s.x, dy=e.y-s.y;
    const metros=(Math.sqrt(dx*dx+dy*dy)/gridSize*metrosPorCelula).toFixed(1);
    ctx.font=`bold ${14/mapaZoom}px sans-serif`; ctx.fillStyle='#f1c40f';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(`${metros}m`, (s.x+e.x)/2, (s.y+e.y)/2-4/mapaZoom);
  }

  tokens.forEach(t=>desenharToken(t));
  ctx.restore();

  // HUD zoom
  ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.textAlign='right'; ctx.textBaseline='bottom';
  ctx.fillText(`Zoom: ${Math.round(mapaZoom*100)}%`, CW-8, CH-6);
}

function desenharToken(t) {
  const r=gridSize*0.42;
  const cx=t.x+gridSize/2, cy=t.y+gridSize/2;
  const cor=corTipo(t.tipo);

  if(tokenSel?.id===t.id){
    ctx.beginPath(); ctx.arc(cx,cy,r+5/mapaZoom,0,Math.PI*2);
    ctx.strokeStyle='#f1c40f'; ctx.lineWidth=3/mapaZoom; ctx.stroke();
  }

  if(t.imgUrl){
    const img=tokenImgCache[t.imgUrl]||(()=>{const i=new Image();i.onload=()=>{tokenImgCache[t.imgUrl]=i;desenharMapa();};i.src=t.imgUrl;return i;})();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip();
    try{ctx.drawImage(img,cx-r,cy-r,r*2,r*2);}catch(e){}
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle=cor; ctx.lineWidth=2.5/mapaZoom; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle=cor; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5/mapaZoom; ctx.stroke();
    ctx.font=`${gridSize*0.36}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(t.emoji||'?',cx,cy);
  }

  // Nome
  ctx.font=`bold ${Math.max(9,gridSize*0.13)}px sans-serif`;
  ctx.strokeStyle='rgba(0,0,0,0.9)'; ctx.lineWidth=3/mapaZoom;
  ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='top';
  const nome=t.nome.substring(0,10);
  ctx.strokeText(nome,cx,t.y+gridSize-14);
  ctx.fillText(nome,cx,t.y+gridSize-14);

  // PV bar — players veem a própria, mestre vê todas, outros ocultam inimigos
  const devePV=t.pvMax&&(t.isPC||(isMaster)||(mostrarPVInimigos));
  if(devePV){
    const bw=gridSize-8,bh=5,bx=t.x+4,by=t.y+3;
    const pct=Math.max(0,t.pvAtual/t.pvMax);
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle=pct>0.5?'#27ae60':pct>0.25?'#f39c12':'#c0392b';
    ctx.fillRect(bx,by,bw*pct,bh);
  }
}

const tokenImgCache = {};
function corTipo(tipo){
  return{pc:'#2980b9',infectado:'#c0392b',animal:'#27ae60',animal_infectado:'#8e44ad',humano:'#e67e22',custom:'#7f8c8d'}[tipo]||'#555';
}

// ── ZOOM + PAN ────────────────────────────────────
function onWheel(e){
  e.preventDefault();
  const delta=e.deltaY<0?1.1:0.9;
  const rect=canvas.getBoundingClientRect();
  const mx=(e.clientX-rect.left)*(CW/rect.width);
  const my=(e.clientY-rect.top)*(CH/rect.height);
  mapaZoom=Math.max(0.3,Math.min(4,mapaZoom*delta));
  mapaOffX=mx-(mx-mapaOffX)*delta;
  mapaOffY=my-(my-mapaOffY)*delta;
  desenharMapa();
}

function resetZoom(){mapaZoom=1;mapaOffX=0;mapaOffY=0;desenharMapa();}

// Converte coord de tela → mundo
function screenToWorld(p){
  return{x:(p.x-mapaOffX)/mapaZoom, y:(p.y-mapaOffY)/mapaZoom};
}
function getCanvasPos(e){
  const r=canvas.getBoundingClientRect();
  return{x:(e.clientX-r.left)*(CW/r.width),y:(e.clientY-r.top)*(CH/r.height)};
}

function snap(v){return Math.round(v/gridSize)*gridSize;}
function getTokenAt(wx,wy){
  return tokens.slice().reverse().find(t=>wx>=t.x&&wx<=t.x+gridSize&&wy>=t.y&&wy<=t.y+gridSize);
}
function podeMoverToken(t){
  if(isMaster) return true;
  if(t.isPC&&t.userId===currentUser?.id) return true;
  if(t.controladorNome===currentProfile?.username) return true;
  return false;
}

// ── MOUSE / TOUCH ─────────────────────────────────
let lastTouchDist=null;

function onMDown(e){
  const sp=getCanvasPos(e);
  if(medindoDistancia){medirStart=sp;medirEnd=sp;return;}

  const wp=screenToWorld(sp);
  const t=getTokenAt(wp.x,wp.y);

  if(e.button===1||e.altKey){isPanning=true;panStart=sp;canvas.style.cursor='grabbing';return;}

  if(t&&podeMoverToken(t)){
    dragTok=t; dragOX=wp.x-t.x; dragOY=wp.y-t.y;
    tokenSel=t; desenharMapa(); mostrarInfoToken(t);
  } else {
    tokenSel=null; desenharMapa(); esconderInfoToken();
  }
}

function onMMove(e){
  const sp=getCanvasPos(e);
  if(medindoDistancia&&medirStart){medirEnd=sp;desenharMapa();return;}
  if(isPanning&&panStart){
    mapaOffX+=(sp.x-panStart.x); mapaOffY+=(sp.y-panStart.y);
    panStart=sp; desenharMapa(); return;
  }
  if(!dragTok) return;
  const wp=screenToWorld(sp);
  dragTok.x=Math.max(0,Math.min(CW-gridSize,wp.x-dragOX));
  dragTok.y=Math.max(0,Math.min(CH-gridSize,wp.y-dragOY));
  desenharMapa();
}

function onMUp(){
  if(isPanning){isPanning=false;canvas.style.cursor='crosshair';panStart=null;return;}
  if(medindoDistancia) return;
  if(!dragTok) return;
  dragTok.x=snap(dragTok.x); dragTok.y=snap(dragTok.y);
  dragTok=null; desenharMapa(); salvarMapaDB();
}

// Touch: mover token OU pinch zoom
// ── TOUCH: 1 dedo = pan do mapa, 2 dedos = zoom ─
let touchStartPos = null;
let touchMoved = false;
let touchPanActive = false;

function onTStart(e){
  e.preventDefault();
  if(e.touches.length===2){
    // Pinch zoom
    dragTok = null; touchPanActive = false;
    lastTouchDist=Math.hypot(
      e.touches[0].clientX-e.touches[1].clientX,
      e.touches[0].clientY-e.touches[1].clientY
    );
    return;
  }
  const t = e.touches[0];
  const sp = getCanvasPos({clientX:t.clientX, clientY:t.clientY});
  const wp = screenToWorld(sp);
  touchStartPos = sp;
  touchMoved = false;

  // Verifica se tocou num token que pode mover
  const tok = getTokenAt(wp.x, wp.y);
  if(tok && podeMoverToken(tok)){
    // Inicia drag do token
    dragTok = tok;
    dragOX = wp.x - tok.x;
    dragOY = wp.y - tok.y;
    tokenSel = tok;
    touchPanActive = false;
    desenharMapa();
  } else {
    // Vai ser pan do mapa
    touchPanActive = true;
    isPanning = true;
    panStart = sp;
    tokenSel = null;
  }
}

function onTMove(e){
  e.preventDefault();
  if(e.touches.length===2){
    // Pinch zoom
    dragTok = null; touchPanActive = false; isPanning = false;
    const dist=Math.hypot(
      e.touches[0].clientX-e.touches[1].clientX,
      e.touches[0].clientY-e.touches[1].clientY
    );
    if(lastTouchDist){
      const cx = (e.touches[0].clientX + e.touches[1].clientX)/2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY)/2;
      const rect = canvas.getBoundingClientRect();
      const mx = (cx-rect.left)*(canvas.width/rect.width);
      const my = (cy-rect.top)*(canvas.height/rect.height);
      const factor = dist/lastTouchDist;
      mapaZoom = Math.max(0.3, Math.min(4, mapaZoom*factor));
      mapaOffX = mx - (mx-mapaOffX)*factor;
      mapaOffY = my - (my-mapaOffY)*factor;
      desenharMapa();
    }
    lastTouchDist=dist; return;
  }

  const t = e.touches[0];
  const sp = getCanvasPos({clientX:t.clientX, clientY:t.clientY});

  if(touchStartPos){
    const dx = Math.abs(sp.x - touchStartPos.x);
    const dy = Math.abs(sp.y - touchStartPos.y);
    if(dx > 5 || dy > 5) touchMoved = true;
  }

  if(dragTok){
    // Move token
    const wp = screenToWorld(sp);
    dragTok.x = Math.max(0, Math.min(CW-gridSize, wp.x-dragOX));
    dragTok.y = Math.max(0, Math.min(CH-gridSize, wp.y-dragOY));
    desenharMapa();
  } else if(isPanning && panStart){
    // Pan do mapa
    mapaOffX += (sp.x - panStart.x);
    mapaOffY += (sp.y - panStart.y);
    panStart = sp;
    desenharMapa();
  }
}

function onTEnd(e){
  lastTouchDist = null;

  if(dragTok){
    // Finaliza drag de token
    dragTok.x = snap(dragTok.x);
    dragTok.y = snap(dragTok.y);
    mostrarInfoToken(dragTok);
    dragTok = null;
    desenharMapa();
    salvarMapaDB();
  } else if(!touchMoved && touchStartPos){
    // Tap sem movimento — mostra info do token se tocou em um
    const wp = screenToWorld(touchStartPos);
    const tok = getTokenAt(wp.x, wp.y);
    if(tok){
      tokenSel = tok;
      mostrarInfoToken(tok);
      desenharMapa();
    } else {
      tokenSel = null;
      esconderInfoToken();
    }
  }

  isPanning = false; panStart = null;
  touchPanActive = false; touchStartPos = null;
}

// ── INFO TOKEN ────────────────────────────────────
function mostrarInfoToken(t){
  const el=document.getElementById('token-info'); if(!el) return;
  
  // Players: só mostram info do próprio token se for mestre ou controlador
  // Para o próprio PC do player, não mostra o painel (já tem a foto na ficha)
  // Só mostra se for mestre, ou se for token de NPC que o player controla
  const ehMeuPC = t.isPC && t.userId === currentUser?.id;
  if(ehMeuPC && !isMaster){
    // Player tocou no próprio token — só move, não abre painel
    el.style.display='none';
    return;
  }
  
  el.style.display='block';
  const podeEditar=isMaster||(t.controladorNome===currentProfile?.username);
  el.innerHTML=`
    <div class="token-info-header">
      ${t.imgUrl?`<img src="${t.imgUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`:`<span style="font-size:22px">${t.emoji||'?'}</span>`}
      <div style="flex:1"><div style="font-weight:700;font-size:12px">${t.nome}</div><div style="font-size:9px;color:var(--muted)">${t.tipo}</div></div>
      ${podeEditar?`<button class="btn-icon" onclick="removerToken('${t.id}')" title="Remover token">🗑</button>`:''}
    </div>
    ${t.pvMax?`<div class="token-pv-row">
      <span style="font-size:9px;color:var(--muted)">PV</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',-1)">−</button>
      <input type="number" value="${t.pvAtual}" min="0" max="${t.pvMax}" onchange="setPVToken('${t.id}',this.value)"
        style="width:40px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px;font-size:12px">
      <span style="color:var(--muted);font-size:11px">/${t.pvMax}</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',1)">+</button>
    </div>`:``}
    ${podeEditar?`<div style="margin-top:6px">
      <input type="file" accept="image/*" style="display:none" id="tok-img-${t.id}" onchange="uploadTokenImg('${t.id}',this)">
      <button class="btn-ghost" style="width:100%;font-size:9px;padding:4px" onclick="document.getElementById('tok-img-${t.id}').click()">📷 Trocar imagem</button>
    </div>`:''}
  `;
}

function esconderInfoToken(){const el=document.getElementById('token-info');if(el)el.style.display='none';}

function alterarPVToken(id,delta){
  const t=tokens.find(x=>x.id===id); if(!t) return;
  t.pvAtual=Math.max(0,Math.min(t.pvMax,t.pvAtual+delta));
  const c=combatentes.find(x=>x.id===id); if(c){c.pvAtual=t.pvAtual;renderCT();}
  mostrarInfoToken(t); desenharMapa(); salvarMapaDB();
}

function setPVToken(id,val){
  const t=tokens.find(x=>x.id===id); if(!t) return;
  t.pvAtual=Math.max(0,Math.min(t.pvMax,parseInt(val)||0));
  const c=combatentes.find(x=>x.id===id); if(c){c.pvAtual=t.pvAtual;renderCT();}
  desenharMapa(); salvarMapaDB();
}

function removerToken(id){
  tokens=tokens.filter(t=>t.id!==id); tokenSel=null;
  esconderInfoToken(); desenharMapa(); salvarMapaDB();
}

async function uploadTokenImg(tokenId,input){
  const file=input.files[0]; if(!file) return;
  const ext=file.name.split('.').pop();
  const path=`${currentUser.id}/${tokenId}.${ext}`;
  const{error}=await db.storage.from('tokens').upload(path,file,{upsert:true});
  if(error){toast('Erro: '+error.message,'err');return;}
  const{data}=db.storage.from('tokens').getPublicUrl(path);
  const t=tokens.find(x=>x.id===tokenId);
  if(t){t.imgUrl=data.publicUrl;delete tokenImgCache[data.publicUrl];mostrarInfoToken(t);desenharMapa();salvarMapaDB();}
  toast('Imagem atualizada!','ok');
}

// ── ADICIONAR TOKENS ──────────────────────────────
function adicionarTokenMapa(inimigo){
  if(!isMaster){toast('Só o mestre pode adicionar inimigos.','err');return;}
  const id=inimigo.id+'_'+Date.now();
  tokens.push({
    id,nome:inimigo.nome,emoji:inimigo.emoji,tipo:inimigo.tipo,
    x:snap(Math.random()*(CW/2)),y:snap(Math.random()*(CH/2)),
    pvMax:inimigo.pv,pvAtual:inimigo.pv,
    habilidades:inimigo.habilidades,isPC:false,
  });
  desenharMapa(); salvarMapaDB();
}

// Token custom pelo mestre
function abrirCriarTokenCustom(){
  if(!isMaster) return;
  const m=document.getElementById('modal-token-custom'); if(m)m.style.display='flex';
}
function fecharCriarTokenCustom(){const m=document.getElementById('modal-token-custom');if(m)m.style.display='none';}

function tokenCustomImgPreview(input){
  const file=input.files[0]; if(!file) return;
  tokenCustomImg=file;
  const r=new FileReader();
  r.onload=e=>{const p=document.getElementById('token-custom-preview');if(p){p.src=e.target.result;p.style.display='block';}};
  r.readAsDataURL(file);
}

async function criarTokenCustom(){
  const nome=document.getElementById('tc-nome')?.value.trim()||'Token';
  const pvMax=parseInt(document.getElementById('tc-pv')?.value)||0;
  const tipo=document.getElementById('tc-tipo')?.value||'custom';
  const emoji=document.getElementById('tc-emoji')?.value||'⭐';
  const id='custom_'+Date.now();
  let imgUrl=null;
  if(tokenCustomImg){
    const ext=tokenCustomImg.name.split('.').pop();
    const path=`${currentUser.id}/${id}.${ext}`;
    const{error}=await db.storage.from('tokens').upload(path,tokenCustomImg,{upsert:true});
    if(!error){const{data}=db.storage.from('tokens').getPublicUrl(path);imgUrl=data.publicUrl;}
  }
  tokens.push({id,nome,emoji,tipo,imgUrl,x:snap(CW/2),y:snap(CH/2),pvMax:pvMax||undefined,pvAtual:pvMax||undefined,isPC:false});
  tokenCustomImg=null;
  fecharCriarTokenCustom();
  desenharMapa(); salvarMapaDB(); toast('Token criado!','ok');
}

// ── CONTROLES MAPA ────────────────────────────────
function toggleGrid(){
  gridVisivel=!gridVisivel;
  const btn=document.getElementById('btn-grid');
  if(btn)btn.textContent=gridVisivel?'⬛ Ocultar Grid':'⬛ Mostrar Grid';
  desenharMapa();
}

function alterarGrid(delta){
  gridSize=Math.max(30,Math.min(120,gridSize+delta));
  const el=document.getElementById('grid-size-val'); if(el)el.textContent=gridSize+'px';
  desenharMapa();
}

function toggleRegua(){
  medindoDistancia=!medindoDistancia; medirStart=null; medirEnd=null;
  const btn=document.getElementById('btn-regua');
  if(btn){btn.textContent=medindoDistancia?'📏 Cancelar':'📏 Régua';btn.style.color=medindoDistancia?'var(--gold)':'';}
  if(!medindoDistancia)desenharMapa();
}

function importarMapaImg(){
  if(!isMaster) return;
  const input=document.createElement('input'); input.type='file'; input.accept='image/*';
  input.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=ev=>{const img=new Image();img.onload=()=>{mapaImg=img;desenharMapa();salvarMapaDB();};img.src=ev.target.result;mapaUrl=ev.target.result;};
    r.readAsDataURL(file);
  };
  input.click();
}

function limparTokens(){
  if(!isMaster){toast('Só o mestre pode limpar.','err');return;}
  if(!confirm('Limpar todos os tokens?')) return;
  tokens=[]; tokenSel=null; esconderInfoToken(); desenharMapa(); salvarMapaDB();
}

// ── PERSISTÊNCIA ──────────────────────────────────
async function salvarMapaDB(){
  // Players podem salvar seus próprios tokens (posição + PV)
  // Mestre salva tudo (grid, mapa, todos os tokens)
  try{
    if(isMaster){
      await db.from('mapa_estado').upsert({
        id:'sessao_atual',
        tokens:tokens.map(t=>({...t})),
        grid_size:gridSize, grid_visivel:gridVisivel,
        mapa_url:mapaUrl||null,
        updated_at:new Date().toISOString()
      });
    } else {
      // Player: carrega estado atual e atualiza apenas seus tokens
      const { data } = await db.from('mapa_estado').select('tokens').eq('id','sessao_atual').single();
      let tokensAtuais = data?.tokens || [];
      // Remove tokens desse player e adiciona os novos
      tokensAtuais = tokensAtuais.filter(t => t.userId !== currentUser.id);
      const meusTokens = tokens.filter(t => t.userId === currentUser.id);
      tokensAtuais = [...tokensAtuais, ...meusTokens];
      await db.from('mapa_estado').upsert({
        id:'sessao_atual',
        tokens:tokensAtuais,
        updated_at:new Date().toISOString()
      });
    }
  }catch(e){console.error('salvarMapaDB:',e);}
}

async function carregarMapaDB(){
  try{
    const{data}=await db.from('mapa_estado').select('*').eq('id','sessao_atual').single();
    if(data){
      tokens=data.tokens||[]; gridSize=data.grid_size||60; gridVisivel=data.grid_visivel!==false;
      if(data.mapa_url){mapaUrl=data.mapa_url;const img=new Image();img.onload=()=>{mapaImg=img;desenharMapa();};img.src=data.mapa_url;}
      const el=document.getElementById('grid-size-val'); if(el)el.textContent=gridSize+'px';
      const btn=document.getElementById('btn-grid'); if(btn)btn.textContent=gridVisivel?'⬛ Ocultar Grid':'⬛ Mostrar Grid';
    }
  }catch(e){}
  desenharMapa();
  subscribeMapaRealtime();
}

let mapaRealtimeSub=null;
function subscribeMapaRealtime(){
  if(mapaRealtimeSub) return;
  mapaRealtimeSub=db.channel('mapa-realtime')
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'mapa_estado'},payload=>{
      const d=payload.new; if(!d) return;
      tokens=d.tokens||[]; gridSize=d.grid_size||60; gridVisivel=d.grid_visivel!==false;
      if(d.mapa_url&&d.mapa_url!==mapaUrl){
        mapaUrl=d.mapa_url;
        const img=new Image(); img.onload=()=>{mapaImg=img;desenharMapa();}; img.src=d.mapa_url;
      }
      desenharMapa();
    }).subscribe();
}

async function adicionarPlayerSomenteCT(userId) {
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', userId).single();
  const { data: profile } = await db.from('profiles').select('username').eq('id', userId).single();
  if (!ficha) return toast('Esse player não tem ficha ainda.', 'err');
  const pvMax = Math.max((ficha.attr_res||0)*4, 4);
  const id = 'pc_'+userId;
  if (!combatentes.find(c => c.id === id)) {
    combatentes.push({
      id, nome: ficha.nome || profile.username,
      emoji: '🧑', imgUrl: ficha.foto_url || null,
      pvMax, pvAtual: ficha.pv_atual || pvMax,
      iniciativa: Math.floor(Math.random()*20)+1,
      tipo: 'pc', isPC: true, userId,
      condicoes: [], controlador: profile.username,
    });
    renderCT();
    toast((ficha.nome||profile.username)+' adicionado ao CT!', 'ok');
  } else {
    toast('Player já está no CT.', 'err');
  }
}

async function adicionarPlayerSomenteMapa(userId) {
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', userId).single();
  const { data: profile } = await db.from('profiles').select('username').eq('id', userId).single();
  if (!ficha) return toast('Esse player não tem ficha ainda.', 'err');
  const pvMax = Math.max((ficha.attr_res||0)*4, 4);
  const id = 'pc_'+userId;
  if (!tokens.find(t => t.id === id)) {
    tokens.push({
      id, nome: ficha.nome || profile.username,
      emoji: '🧑', imgUrl: ficha.foto_url || null,
      tipo: 'pc', x: snap(gridSize*2), y: snap(gridSize*2),
      pvMax, pvAtual: ficha.pv_atual || pvMax,
      isPC: true, userId,
    });
    desenharMapa(); salvarMapaDB();
    toast((ficha.nome||profile.username)+' adicionado ao mapa!', 'ok');
  } else {
    toast('Player já está no mapa.', 'err');
  }
}
