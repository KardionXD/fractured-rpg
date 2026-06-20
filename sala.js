// ══════════════════════════════════════════════════
//  FRACTURED — sala.js
//  Sala Unificada: Feed + Dados + Combate + Mapa
// ══════════════════════════════════════════════════

// ── BESTIÁRIO ─────────────────────────────────────
const BESTIARIO = {
  infectados: [
    { id:'corredor',     nome:'Corredor',         pv:10, com:1,  agi:2,  res:0,  tipo:'infectado',        emoji:'🧟',
      habilidades:['Enxame: 3+ atacam o mesmo alvo','Hesitação: para 1 round ao ver rosto familiar','Grito de Atração: chama outros corredores'],
      fraqueza:'Qualquer dano direto. Separe e elimine individualmente.' },
    { id:'perseguidor',  nome:'Perseguidor',       pv:15, com:2,  agi:1,  res:1,  tipo:'infectado',        emoji:'🧟',
      habilidades:['Emboscada: ataca de surpresa','Gavinhas de Parede: +3 ataque surpresa','Perseguição Tenaz'],
      fraqueza:'Fogo e impacto contundente. Armadilhas de arame.' },
    { id:'estalador',    nome:'Estalador',         pv:20, com:3,  agi:1,  res:2,  tipo:'infectado',        emoji:'🕷️',
      habilidades:['Sonar Perfeito: detecta >30dB','Agarrão Fatal: mata em 1 round','Blindagem Fúngica: −2 dano'],
      fraqueza:'Fogo prioritário. AGI≥17 + faca para morte silenciosa.' },
    { id:'baiacu',       nome:'Baiacu',            pv:35, com:4,  agi:-1, res:4,  tipo:'infectado',        emoji:'💀',
      habilidades:['Armadura: dano reduzido à metade','Nuvem de Esporos ao morrer (RES≥14)','Investida: +2d6 dano'],
      fraqueza:'Explosivos e fogo apenas. NUNCA facas ou balas.' },
    { id:'tropego',      nome:'Trôpego',           pv:30, com:3,  agi:-1, res:3,  tipo:'infectado',        emoji:'💣',
      habilidades:['Não morde','Qualquer dano físico libera esporos 3m','Fogo moderado ineficaz'],
      fraqueza:'Explosivos a distância apenas.' },
    { id:'rei_ratos',    nome:'Rei dos Ratos',     pv:80, com:5,  agi:-2, res:6,  tipo:'infectado',        emoji:'👑',
      habilidades:['50% PV → 2d4 infectados','Controla 100m raio','Cascata ao morrer','Regenera +5PV/round'],
      fraqueza:'Destrua 5+ nós da rede. Depois explosivos+fogo.' },
  ],
  animais: [
    { id:'lobo',         nome:'Lobo',              pv:12, com:2,  agi:3,  res:0,  tipo:'animal',           emoji:'🐺',
      habilidades:['Flanqueio: +2 dano','Avaliação de Presa','Perseguição até 500m'],
      fraqueza:'Matar o alfa causa recuo de 60%. Fogo afasta.' },
    { id:'urso',         nome:'Urso',              pv:45, com:4,  agi:0,  res:5,  tipo:'animal',           emoji:'🐻',
      habilidades:['Investida: +3 dano, derruba','−2 dano exceto fogo','Com filhotes: nunca recua'],
      fraqueza:'Rifle pesado ou explosivos. Suba em estruturas.' },
    { id:'javali',       nome:'Javali',            pv:20, com:3,  agi:1,  res:2,  tipo:'animal',           emoji:'🐗',
      habilidades:['Carga: AGI≥13 para desviar','2d6+3 dano','Bando: +1 Tensão'],
      fraqueza:'Tiro na cabeça. Suba em estruturas.' },
    { id:'corvo',        nome:'Corvo de Bando',    pv:3,  com:0,  agi:4,  res:-2, tipo:'animal',           emoji:'🐦',
      habilidades:['Delata posição do grupo','+1 Tensão se assustados'],
      fraqueza:'Ignore. Matar piora a situação.' },
  ],
  humanos: [
    { id:'saqueador',    nome:'Saqueador',         pv:14, com:1,  agi:1,  res:-1, tipo:'humano',           emoji:'🔪',
      habilidades:['Moral Frágil: SOCIAL≥11','Pode se render','Armamento improvisado'],
      fraqueza:'Intimidação funciona. Considere negociar.' },
    { id:'atirador',     nome:'Atirador Facção',   pv:18, com:3,  agi:2,  res:0,  tipo:'humano',           emoji:'🔫',
      habilidades:['Cobertura: +2 defesa','Relata à facção','Tiro coordenado'],
      fraqueza:'Flanqueie ou destrua a cobertura.' },
    { id:'lider',        nome:'Líder de Bando',    pv:25, com:4,  agi:2,  res:3,  tipo:'humano',           emoji:'😈',
      habilidades:['Imune a intimidação simples','Eleva aliados','Pode negociar'],
      fraqueza:'Eliminar o líder quebra o grupo.' },
    { id:'cacador',      nome:'Caçador Profissional',pv:22,com:4, agi:3,  res:-2, tipo:'humano',           emoji:'🏹',
      habilidades:['Emboscada: INSTINTO≥16','Rastreamento 24h','Tiro silencioso'],
      fraqueza:'Mude de rota. Inverta a caça.' },
  ],
  animais_infectados: [
    { id:'cao_corredor', nome:'Cão Corredor',      pv:16, com:3,  agi:4,  res:1,  tipo:'animal_infectado', emoji:'🐕',
      habilidades:['Age 2x/round','Rastreamento fúngico','Mordida: RES≥13 ou infecção'],
      fraqueza:'Armadilhas. Fogo desorienta.' },
    { id:'urso_estalador',nome:'Urso Estalador',  pv:60, com:5,  agi:0,  res:6,  tipo:'animal_infectado', emoji:'🐻',
      habilidades:['Detecta >20dB','−3 dano (armadura dupla)','Investida: +3d6','Agarrão: 2d8/round'],
      fraqueza:'Explosivos pesados e fogo prolongado apenas.' },
  ]
};
const TODOS_INIMIGOS = Object.values(BESTIARIO).flat();

// ── STATE GLOBAL ──────────────────────────────────
let salaRealtimeSub = null;

// ── STATE COMBATE ─────────────────────────────────
let combatentes   = [];
let turnoAtual    = 0;
let rodadaAtual   = 1;
let combateAtivo  = false;
let mostrarPVInimigos = true;

// ── STATE MAPA ────────────────────────────────────
let tokens          = [];
let tokenSelecionado = null;
let dragToken       = null;
let dragOffX = 0, dragOffY = 0;
let gridSize        = 60;
let gridVisivel     = true;
let metrosPorCelula = 1.5;
let mapaImg         = null;
let mapaCanvas, mapaCtx;
let CMAP_W = 1200, CMAP_H = 800;

// Régua
let regraAtiva = false;
let regraP1 = null, regraP2 = null;

// ══════════════════════════════════════════════════
//  TABS DA SALA
// ══════════════════════════════════════════════════
let salaTab = 'feed';

function setSalaTab(tab) {
  salaTab = tab;
  ['feed','combate','mapa'].forEach(t => {
    const btn = document.getElementById(`stab-${t}`);
    const pnl = document.getElementById(`spanel-${t}`);
    if (btn) btn.classList.toggle('stab-active', t === tab);
    if (pnl) pnl.style.display = t === tab ? 'flex' : 'none';
  });
  if (tab === 'mapa') {
    setTimeout(() => { initMapa(); carregarMapaEstado(); }, 60);
  }
  if (tab === 'combate') renderCombatTracker();
}

// ══════════════════════════════════════════════════
//  FEED / SALA DE DADOS
// ══════════════════════════════════════════════════
function initSala() {
  carregarFeedInicial();
  carregarTensaoSala();
  subscribeRealtime();
}

async function carregarFeedInicial() {
  const { data } = await db.from('sala')
    .select('*').order('created_at', { ascending: true }).limit(80);
  const feed = document.getElementById('sala-feed');
  if (!feed) return;
  feed.innerHTML = '';
  if (!data || data.length === 0) {
    feed.innerHTML = '<div class="empty-state"><div class="empty-icon">🎲</div><p>Role um dado para começar.</p></div>';
    return;
  }
  data.filter(m => m.tipo !== 'tokens' && m.tipo !== 'mapa_estado').forEach(m => appendMsg(m));
  feed.scrollTop = feed.scrollHeight;
}

async function carregarTensaoSala() {
  const { data } = await db.from('sala').select('conteudo')
    .eq('tipo','tensao').order('created_at',{ascending:false}).limit(1).single();
  if (data) { tensaoSala = data.conteudo.valor || 0; buildTensaoPips('tensao-pips-sala', tensaoSala, false); }
}

function subscribeRealtime() {
  if (salaRealtimeSub) return;
  salaRealtimeSub = db.channel('sala-rt')
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'sala' }, payload => {
      const msg = payload.new;
      if (msg.tipo === 'tensao') {
        tensaoSala = msg.conteudo.valor;
        buildTensaoPips('tensao-pips-sala', tensaoSala, false);
      }
      if (msg.tipo === 'tokens_update') {
        if (msg.user_id !== currentUser?.id) aplicarTokensRemoto(msg.conteudo);
        return;
      }
      if (msg.tipo !== 'tokens' && msg.tipo !== 'mapa_estado') appendMsg(msg);
    })
    .subscribe();
}

function appendMsg(msg) {
  const feed = document.getElementById('sala-feed');
  if (!feed) return;
  const empty = feed.querySelector('.empty-state');
  if (empty) empty.remove();

  const hora = new Date(msg.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const div = document.createElement('div');

  if (msg.tipo === 'roll') {
    const c = msg.conteudo;
    const isCrit  = c.dado===20 && c.resultado_dado===20;
    const isFalha = c.dado===20 && c.resultado_dado===1;
    div.className = 'feed-msg roll' + (isCrit?' critico':'') + (isFalha?' falha-critica':'');
    div.innerHTML = `
      <div class="feed-msg-header"><span class="feed-msg-user">${msg.username}</span><span class="feed-msg-time">${hora}</span></div>
      <div class="feed-msg-content">
        <span class="roll-total">${c.total}</span>
        ${c.dif?`<span style="font-size:12px;color:${c.total>=c.dif?'var(--green)':'var(--red)'}"> — ${c.total>=c.dif?'✓ SUCESSO':'✗ FALHA'} (dif.${c.dif})</span>`:''}
        ${isCrit?' <span style="color:var(--gold)">⭐ CRÍTICO!</span>':''}
        ${isFalha?' <span style="color:var(--red)">💀 FALHA CRÍTICA!</span>':''}
      </div>
      <div class="roll-detail">1d${c.dado}→${c.resultado_dado}${c.bonus?` + bônus ${c.bonus>0?'+':''}${c.bonus}`:''}${c.label?` — ${c.label}`:''}</div>`;
  } else if (msg.tipo === 'tensao') {
    div.className = 'feed-msg tensao-msg';
    div.innerHTML = `<div class="feed-msg-header"><span class="feed-msg-user">⚠ MESTRE</span><span class="feed-msg-time">${hora}</span></div>
      <div class="feed-msg-content">Tensão: ${msg.conteudo.valor}/10 — ${msg.conteudo.status}</div>`;
  } else if (msg.tipo === 'mensagem') {
    div.className = 'feed-msg';
    div.innerHTML = `<div class="feed-msg-header"><span class="feed-msg-user">${msg.username}</span><span class="feed-msg-time">${hora}</span></div>
      <div class="feed-msg-content">${(msg.conteudo.texto||'').replace(/</g,'&lt;')}</div>`;
  } else return;

  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

async function publicar(tipo, conteudo) {
  await db.from('sala').insert({ user_id: currentUser.id, username: currentProfile?.username||'?', tipo, conteudo });
}

function rolarDado(faces, qtd=1) {
  let total=0; const rs=[];
  for(let i=0;i<qtd;i++){const r=Math.floor(Math.random()*faces)+1;rs.push(r);total+=r;}
  publicar('roll',{dado:faces,qtd,resultado_dado:rs[0],total,label:qtd>1?`${qtd}d${faces}:[${rs.join(',')}]`:`1d${faces}`});
}

function rolarFormula() {
  const mod   = parseInt(document.getElementById('roll-atrib')?.value)||0;
  const per   = parseInt(document.getElementById('roll-pericia')?.value)||0;
  const sit   = parseInt(document.getElementById('roll-situacao')?.value)||0;
  const dif   = parseInt(document.getElementById('roll-dif')?.value)||11;
  const dado  = Math.floor(Math.random()*20)+1;
  const bonus = mod+per+sit;
  const total = dado+bonus;
  const atxt  = document.getElementById('roll-atrib')?.selectedOptions[0]?.text||'';
  const ptxt  = document.getElementById('roll-pericia')?.selectedOptions[0]?.text||'';
  const stxt  = document.getElementById('roll-situacao')?.selectedOptions[0]?.text||'';
  publicar('roll',{dado:20,resultado_dado:dado,bonus,total,dif,label:[atxt,ptxt!=='Sem perícia (+0)'?ptxt:'',stxt!=='Normal'?stxt:''].filter(Boolean).join(' | ')});
}

async function enviarMsgSala() {
  const inp = document.getElementById('sala-msg-input');
  const txt = inp?.value.trim();
  if (!txt) return;
  inp.value='';
  await publicar('mensagem',{texto:txt});
}

async function limparHistorico() {
  if (!isMaster) return toast('Só o mestre pode limpar.','err');
  if (!confirm('Limpar todo o histórico?')) return;
  await db.from('sala').delete().neq('id','00000000-0000-0000-0000-000000000000');
  tensaoSala=0;
  buildTensaoPips('tensao-pips-sala',0,false);
  const feed = document.getElementById('sala-feed');
  if (feed) feed.innerHTML='<div class="empty-state"><div class="empty-icon">🎲</div><p>Histórico limpo.</p></div>';
  toast('Histórico limpo!','ok');
}

// ══════════════════════════════════════════════════
//  COMBAT TRACKER
// ══════════════════════════════════════════════════
function renderCombatTracker() {
  const lista = document.getElementById('ct-lista');
  if (!lista) return;

  if (combatentes.length === 0) {
    lista.innerHTML = '<div style="text-align:center;color:var(--muted);padding:24px;font-size:13px">Adicione combatentes para começar.</div>';
  } else {
    const ord = [...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa);
    lista.innerHTML = '';
    ord.forEach((c,idx) => {
      const isAtual = combateAtivo && ord[turnoAtual]?.id === c.id;
      const pct     = Math.max(0, Math.round((c.pvAtual/c.pvMax)*100));
      const barClr  = pct>50?'#27ae60':pct>25?'#f39c12':'#c0392b';
      const estado  = pct>75?'':pct>50?'🩹 Ferido':pct>25?'⚠️ Grave':pct>0?'💀 Crítico':'☠️ Incapacitado';
      const showPV  = c.isPC || mostrarPVInimigos;

      const div = document.createElement('div');
      div.className='ct-item'+(isAtual?' ct-ativo':'')+(c.pvAtual<=0?' ct-morto':'');
      div.innerHTML=`
        <div class="ct-ordem">${isAtual?'▶':idx+1}</div>
        <div class="ct-emoji-wrap">
          ${c.imgUrl?`<img src="${c.imgUrl}" class="ct-token-img">`:`<span style="font-size:22px">${c.emoji}</span>`}
        </div>
        <div class="ct-info">
          <div class="ct-nome">${c.nome}${c.tag?`<span class="ct-tag"> ${c.tag}</span>`:''}</div>
          <div class="ct-ini">Init: <strong>${c.iniciativa}</strong>${estado?' · '+estado:''}</div>
          ${showPV?`
          <div class="ct-bar-wrap"><div class="ct-bar" style="width:${pct}%;background:${barClr}"></div></div>
          <div class="ct-pv-row">
            <span class="ct-pv-label">PV</span>
            <button class="ct-pv-btn" onclick="ctAlterarPV('${c.id}',-1)">−</button>
            <input type="number" class="ct-pv-input" value="${c.pvAtual}" min="0" max="${c.pvMax}" onchange="ctSetPV('${c.id}',this.value)">
            <span class="ct-pv-sep">/ ${c.pvMax}</span>
            <button class="ct-pv-btn" onclick="ctAlterarPV('${c.id}',1)">+</button>
            <button class="ct-pv-btn ct-pv-dmg" onclick="ctDanoRapido('${c.id}')">⚔</button>
          </div>`:
          `<div style="font-size:10px;color:var(--muted);margin-top:4px">PV oculto</div>`}
          ${c.condicoes?.length?`<div class="ct-condicoes">${c.condicoes.map(cn=>`<span class="ct-cond">${cn}</span>`).join('')}</div>`:''}
          ${c.habilidades&&isMaster?`<details class="ct-detalhes"><summary>Habilidades</summary><ul>${c.habilidades.map(h=>`<li>${h}</li>`).join('')}</ul>${c.fraqueza?`<div class="ct-fraqueza">⚡ ${c.fraqueza}</div>`:''}</details>`:''}
        </div>
        <div class="ct-acoes">
          <button class="ct-btn" onclick="ctToggleCond('${c.id}','😵 Atordoado')" title="Atordoado">😵</button>
          <button class="ct-btn" onclick="ctToggleCond('${c.id}','☠ Envenenado')" title="Envenenado">☠</button>
          <button class="ct-btn" onclick="ctToggleCond('${c.id}','🔒 Imobilizado')" title="Imobilizado">🔒</button>
          <button class="ct-btn ct-btn-red" onclick="ctRemover('${c.id}')" title="Remover">✕</button>
        </div>`;
      lista.appendChild(div);
    });
  }

  if(document.getElementById('ct-rodada')) document.getElementById('ct-rodada').textContent=`Rodada ${rodadaAtual}`;
  if(document.getElementById('ct-turno-info')) {
    const ord=[...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa);
    document.getElementById('ct-turno-info').textContent = combateAtivo
      ? `Turno: ${ord[turnoAtual]?.nome||'—'}` : 'Aguardando início';
  }
  renderBestiarioLista();
}

function renderBestiarioLista() {
  const lista = document.getElementById('ct-bestiario-lista');
  if (!lista || !isMaster) return;
  const filtro = (document.getElementById('ct-filtro')?.value||'').toLowerCase();
  lista.innerHTML = '';
  const labels = {infectados:'Infectados',animais:'Animais',humanos:'Humanos',animais_infectados:'Animais Infectados'};
  Object.entries(BESTIARIO).forEach(([cat,inimigos]) => {
    const fil = inimigos.filter(i=>i.nome.toLowerCase().includes(filtro));
    if (!fil.length) return;
    const h = document.createElement('div'); h.className='ct-categoria'; h.textContent=labels[cat];
    lista.appendChild(h);
    fil.forEach(inimigo => {
      const d = document.createElement('div'); d.className='ct-inimigo-item';
      d.innerHTML=`
        <span style="font-size:18px;flex-shrink:0">${inimigo.emoji}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600">${inimigo.nome}</div>
          <div style="font-size:10px;color:var(--muted)">PV ${inimigo.pv} · COM ${inimigo.com>=0?'+':''}${inimigo.com}</div>
        </div>
        <button class="ct-add-btn" onclick='ctAdicionarInimigo(${JSON.stringify(inimigo).replace(/'/g,"&#39;")})'>+CT</button>
        <button class="ct-add-btn ct-add-mapa" onclick='mapaAdicionarToken(${JSON.stringify(inimigo).replace(/'/g,"&#39;")})'>+🗺</button>`;
      lista.appendChild(d);
    });
  });
}

function ctAdicionarInimigo(inimigo) {
  const ex = combatentes.filter(c=>c.id.startsWith(inimigo.id));
  const tag = ex.length?` #${ex.length+1}`:'';
  combatentes.push({ id:inimigo.id+'_'+Date.now(), nome:inimigo.nome, emoji:inimigo.emoji, tag,
    pvMax:inimigo.pv, pvAtual:inimigo.pv, iniciativa:Math.floor(Math.random()*20)+1+(inimigo.agi||0),
    tipo:inimigo.tipo, habilidades:inimigo.habilidades, fraqueza:inimigo.fraqueza,
    condicoes:[], isPC:false });
  renderCombatTracker();
}

function ctAdicionarPC() {
  const nome = document.getElementById('ct-pc-nome')?.value.trim();
  const ini  = parseInt(document.getElementById('ct-pc-ini')?.value)||10;
  const pv   = parseInt(document.getElementById('ct-pc-pv')?.value)||20;
  if (!nome) return toast('Digite o nome!','err');
  combatentes.push({ id:'pc_'+Date.now(), nome, emoji:'🧑', pvMax:pv, pvAtual:pv,
    iniciativa:ini, tipo:'pc', isPC:true, condicoes:[] });
  if(document.getElementById('ct-pc-nome')) document.getElementById('ct-pc-nome').value='';
  renderCombatTracker();
}

function ctIniciar() {
  if (!combatentes.length) return;
  combateAtivo=true; turnoAtual=0; rodadaAtual=1;
  combatentes.sort((a,b)=>b.iniciativa-a.iniciativa);
  renderCombatTracker();
}

function ctProximo() {
  if (!combateAtivo||!combatentes.length) return;
  const ord=[...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa);
  let tentativas=0;
  do { turnoAtual++; if(turnoAtual>=ord.length){turnoAtual=0;rodadaAtual++;} tentativas++; }
  while(ord[turnoAtual]?.pvAtual<=0 && tentativas<ord.length);
  renderCombatTracker();
}

function ctEncerrar() {
  if (!confirm('Encerrar combate e limpar lista?')) return;
  combatentes=[]; turnoAtual=0; rodadaAtual=1; combateAtivo=false;
  renderCombatTracker();
}

function ctAlterarPV(id,delta) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  c.pvAtual=Math.max(0,Math.min(c.pvMax,c.pvAtual+delta)); renderCombatTracker();
}
function ctSetPV(id,val) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  c.pvAtual=Math.max(0,Math.min(c.pvMax,parseInt(val)||0)); renderCombatTracker();
}
function ctDanoRapido(id) {
  const v=prompt('Dano recebido:'); if(!v) return;
  ctAlterarPV(id,-(parseInt(v)||0));
}
function ctToggleCond(id,cond) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  if(!c.condicoes) c.condicoes=[];
  const i=c.condicoes.indexOf(cond);
  if(i>=0) c.condicoes.splice(i,1); else c.condicoes.push(cond);
  renderCombatTracker();
}
function ctRemover(id) {
  combatentes=combatentes.filter(c=>c.id!==id);
  if(turnoAtual>=combatentes.length) turnoAtual=0;
  renderCombatTracker();
}
function ctTogglePV() {
  mostrarPVInimigos=!mostrarPVInimigos;
  const btn=document.getElementById('btn-toggle-pv');
  if(btn) btn.textContent=mostrarPVInimigos?'👁 Ocultar PV inimigos':'👁 Mostrar PV inimigos';
  renderCombatTracker();
}

// ══════════════════════════════════════════════════
//  MAPA COM TOKENS
// ══════════════════════════════════════════════════
function initMapa() {
  mapaCanvas = document.getElementById('mapa-canvas');
  if (!mapaCanvas || mapaCanvas._init) return;
  mapaCanvas._init = true;
  mapaCtx = mapaCanvas.getContext('2d');
  mapaCanvas.width  = CMAP_W;
  mapaCanvas.height = CMAP_H;

  mapaCanvas.addEventListener('mousedown',  mapaMouseDown);
  mapaCanvas.addEventListener('mousemove',  mapaMouseMove);
  mapaCanvas.addEventListener('mouseup',    mapaMouseUp);
  mapaCanvas.addEventListener('touchstart', mapaTouchStart, {passive:false});
  mapaCanvas.addEventListener('touchmove',  mapaTouchMove,  {passive:false});
  mapaCanvas.addEventListener('touchend',   mapaMouseUp);
  mapaCanvas.addEventListener('click',      mapaClick);

  desenharMapa();
}

function desenharMapa() {
  if (!mapaCtx) return;
  mapaCtx.clearRect(0,0,CMAP_W,CMAP_H);
  mapaCtx.fillStyle='#080810';
  mapaCtx.fillRect(0,0,CMAP_W,CMAP_H);

  if (mapaImg) mapaCtx.drawImage(mapaImg,0,0,CMAP_W,CMAP_H);

  // Grid
  if (gridVisivel) {
    mapaCtx.strokeStyle='rgba(192,57,43,0.18)';
    mapaCtx.lineWidth=1;
    for(let x=0;x<=CMAP_W;x+=gridSize){mapaCtx.beginPath();mapaCtx.moveTo(x,0);mapaCtx.lineTo(x,CMAP_H);mapaCtx.stroke();}
    for(let y=0;y<=CMAP_H;y+=gridSize){mapaCtx.beginPath();mapaCtx.moveTo(0,y);mapaCtx.lineTo(CMAP_W,y);mapaCtx.stroke();}
  }

  // Régua
  if (regraAtiva && regraP1 && regraP2) desenharRegua();

  // Tokens
  tokens.forEach(t => desenharToken(t));
}

function desenharRegua() {
  const p1=regraP1, p2=regraP2;
  const dx=p2.x-p1.x, dy=p2.y-p1.y;
  const pixeis=Math.sqrt(dx*dx+dy*dy);
  const celulas=pixeis/gridSize;
  const metros=(celulas*metrosPorCelula).toFixed(1);

  mapaCtx.save();
  mapaCtx.strokeStyle='#f1c40f';
  mapaCtx.lineWidth=2;
  mapaCtx.setLineDash([6,4]);
  mapaCtx.beginPath(); mapaCtx.moveTo(p1.x,p1.y); mapaCtx.lineTo(p2.x,p2.y); mapaCtx.stroke();
  mapaCtx.setLineDash([]);

  const mx=(p1.x+p2.x)/2, my=(p1.y+p2.y)/2;
  mapaCtx.fillStyle='rgba(0,0,0,0.7)';
  mapaCtx.fillRect(mx-32,my-14,64,22);
  mapaCtx.fillStyle='#f1c40f';
  mapaCtx.font='bold 12px sans-serif';
  mapaCtx.textAlign='center';
  mapaCtx.textBaseline='middle';
  mapaCtx.fillText(`${metros}m`,mx,my);
  mapaCtx.restore();
}

function getImg(token) {
  if (!token.imgUrl) return null;
  if (token._imgEl && token._imgEl.src === token.imgUrl) return token._imgEl;
  const img = new Image();
  img.src = token.imgUrl;
  img.onload = () => desenharMapa();
  token._imgEl = img;
  return img;
}

function desenharToken(t) {
  const r  = gridSize*0.42;
  const cx = t.x + gridSize/2;
  const cy = t.y + gridSize/2;

  // Selecionado
  if (tokenSelecionado?.id === t.id) {
    mapaCtx.beginPath(); mapaCtx.arc(cx,cy,r+5,0,Math.PI*2);
    mapaCtx.strokeStyle='#f1c40f'; mapaCtx.lineWidth=3; mapaCtx.stroke();
  }

  const imgEl = getImg(t);
  if (imgEl && imgEl.complete && imgEl.naturalWidth) {
    // Imagem circular
    mapaCtx.save();
    mapaCtx.beginPath(); mapaCtx.arc(cx,cy,r,0,Math.PI*2); mapaCtx.clip();
    mapaCtx.drawImage(imgEl, cx-r, cy-r, r*2, r*2);
    mapaCtx.restore();
    mapaCtx.beginPath(); mapaCtx.arc(cx,cy,r,0,Math.PI*2);
    const cor = corTipo(t.tipo);
    mapaCtx.strokeStyle=cor; mapaCtx.lineWidth=2.5; mapaCtx.stroke();
  } else {
    mapaCtx.beginPath(); mapaCtx.arc(cx,cy,r,0,Math.PI*2);
    mapaCtx.fillStyle=corTipo(t.tipo); mapaCtx.fill();
    mapaCtx.strokeStyle='rgba(255,255,255,0.2)'; mapaCtx.lineWidth=1.5; mapaCtx.stroke();
    mapaCtx.font=`${gridSize*0.38}px serif`;
    mapaCtx.textAlign='center'; mapaCtx.textBaseline='middle';
    mapaCtx.fillStyle='#fff';
    mapaCtx.fillText(t.emoji||'?', cx, cy);
  }

  // Nome
  mapaCtx.font=`bold ${Math.max(9,gridSize*0.13)}px sans-serif`;
  mapaCtx.fillStyle='#fff'; mapaCtx.textAlign='center'; mapaCtx.textBaseline='top';
  mapaCtx.shadowColor='rgba(0,0,0,0.9)'; mapaCtx.shadowBlur=3;
  mapaCtx.fillText(t.nome.substring(0,10), cx, t.y+gridSize-13);
  mapaCtx.shadowBlur=0;

  // Barra PV (só se tiver PV e não for inimigo oculto)
  const mostrar = t.isPC || mostrarPVInimigos || isMaster;
  if (t.pvMax && t.pvAtual!==undefined && mostrar) {
    const bw=gridSize-8, bh=4, bx=t.x+4, by=t.y+3;
    const pct=Math.max(0,t.pvAtual/t.pvMax);
    mapaCtx.fillStyle='rgba(0,0,0,0.5)'; mapaCtx.fillRect(bx,by,bw,bh);
    mapaCtx.fillStyle=pct>0.5?'#27ae60':pct>0.25?'#f39c12':'#c0392b';
    mapaCtx.fillRect(bx,by,bw*pct,bh);
  }
}

function corTipo(tipo) {
  return tipo==='pc'?'#2980b9':tipo==='infectado'?'#c0392b':tipo==='animal'?'#27ae60':tipo==='animal_infectado'?'#8e44ad':'#e67e22';
}

function snap(v) { return Math.round(v/gridSize)*gridSize; }

function getCanvasXY(e) {
  const r=mapaCanvas.getBoundingClientRect();
  return { x:(e.clientX-r.left)*(mapaCanvas.width/r.width), y:(e.clientY-r.top)*(mapaCanvas.height/r.height) };
}

function getTokenAt(x,y) {
  return tokens.slice().reverse().find(t=>x>=t.x&&x<=t.x+gridSize&&y>=t.y&&y<=t.y+gridSize);
}

function mapaMouseDown(e) {
  const {x,y}=getCanvasXY(e);

  // Régua
  if (regraAtiva) { regraP1={x,y}; regraP2={x,y}; return; }

  const t=getTokenAt(x,y);
  if (t) {
    const podeMover = isMaster || (t.isPC && t.userId===currentUser?.id);
    if (!podeMover) return;
    dragToken=t; dragOffX=x-t.x; dragOffY=y-t.y;
    tokenSelecionado=t; desenharMapa(); mostrarInfoToken(t);
  } else {
    tokenSelecionado=null; desenharMapa();
    const info=document.getElementById('token-info');
    if(info) info.style.display='none';
  }
}

function mapaMouseMove(e) {
  const {x,y}=getCanvasXY(e);
  if (regraAtiva && regraP1) { regraP2={x,y}; desenharMapa(); return; }
  if (!dragToken) return;
  dragToken.x=Math.max(0,Math.min(CMAP_W-gridSize,x-dragOffX));
  dragToken.y=Math.max(0,Math.min(CMAP_H-gridSize,y-dragOffY));
  desenharMapa();
}

function mapaMouseUp() {
  if (regraAtiva && regraP1) return;
  if (!dragToken) return;
  dragToken.x=snap(dragToken.x); dragToken.y=snap(dragToken.y);
  dragToken=null; desenharMapa(); salvarMapaEstado();
}

function mapaClick(e) {
  if (regraAtiva && regraP1) { regraP2=getCanvasXY(e); desenharMapa(); }
}

function mapaTouchStart(e) { e.preventDefault(); mapaMouseDown(e.touches[0]); }
function mapaTouchMove(e)  { e.preventDefault(); mapaMouseMove(e.touches[0]); }

function mapaAdicionarToken(inimigo) {
  if (!isMaster) return toast('Só o mestre pode adicionar inimigos.','err');
  tokens.push({
    id: inimigo.id+'_'+Date.now(), nome:inimigo.nome, emoji:inimigo.emoji,
    tipo:inimigo.tipo, isPC:false,
    x:snap(Math.random()*(CMAP_W-gridSize*3)+gridSize),
    y:snap(Math.random()*(CMAP_H-gridSize*3)+gridSize),
    pvMax:inimigo.pv, pvAtual:inimigo.pv,
    habilidades:inimigo.habilidades,
  });
  setSalaTab('mapa');
  desenharMapa(); salvarMapaEstado();
}

function mapaAdicionarPC() {
  const nome=document.getElementById('mapa-pc-nome')?.value.trim();
  if (!nome) return toast('Digite o nome!','err');
  tokens.push({
    id:'pc_'+Date.now(), nome, emoji:'🧑', tipo:'pc',
    isPC:true, userId:currentUser?.id,
    x:snap(gridSize), y:snap(gridSize),
  });
  if(document.getElementById('mapa-pc-nome')) document.getElementById('mapa-pc-nome').value='';
  desenharMapa(); salvarMapaEstado();
}

// Token personalizado (mestre cria com nome + imagem)
function mapaAdicionarCustom() {
  const nome=document.getElementById('mapa-custom-nome')?.value.trim();
  if (!nome) return toast('Digite o nome!','err');
  tokens.push({
    id:'custom_'+Date.now(), nome, emoji:'❓', tipo:'humano',
    isPC:false, userId:currentUser?.id,
    x:snap(CMAP_W/2), y:snap(CMAP_H/2),
  });
  if(document.getElementById('mapa-custom-nome')) document.getElementById('mapa-custom-nome').value='';
  desenharMapa(); salvarMapaEstado();
  toast('Token criado! Clique nele para adicionar imagem.','ok');
}

function mapaRemoverToken(id) {
  tokens=tokens.filter(t=>t.id!==id);
  tokenSelecionado=null;
  const info=document.getElementById('token-info'); if(info) info.style.display='none';
  desenharMapa(); salvarMapaEstado();
}

function mostrarInfoToken(t) {
  const info=document.getElementById('token-info'); if(!info) return;
  const podeEditar=isMaster||(t.isPC&&t.userId===currentUser?.id);
  const showPV=t.pvMax&&(t.isPC||mostrarPVInimigos||isMaster);

  info.style.display='block';
  info.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <div style="position:relative;cursor:pointer" onclick="${podeEditar?`trocarImagemToken('${t.id}')`:''}" title="${podeEditar?'Clique para mudar imagem':''}">
        ${t.imgUrl?`<img src="${t.imgUrl}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid ${corTipo(t.tipo)}">`
          :`<div style="width:40px;height:40px;border-radius:50%;background:${corTipo(t.tipo)};display:flex;align-items:center;justify-content:center;font-size:20px">${t.emoji||'?'}</div>`}
        ${podeEditar?`<div style="position:absolute;bottom:-2px;right:-2px;background:var(--surface);border:1px solid var(--border);border-radius:50%;width:16px;height:16px;font-size:9px;display:flex;align-items:center;justify-content:center">✏️</div>`:''}
      </div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${t.nome}</div>
        <div style="font-size:10px;color:var(--muted)">${t.tipo||''}</div>
      </div>
      ${isMaster?`<button class="btn-icon" onclick="mapaRemoverToken('${t.id}')" style="color:var(--red)">🗑</button>`:''}
    </div>
    ${showPV?`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">
      <span style="font-size:9px;color:var(--muted)">PV</span>
      <button class="ct-pv-btn" onclick="tkAlterarPV('${t.id}',-1)">−</button>
      <input type="number" value="${t.pvAtual}" min="0" max="${t.pvMax}"
        style="width:44px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:13px;font-weight:700;padding:2px"
        onchange="tkSetPV('${t.id}',this.value)">
      <span style="color:var(--muted);font-size:11px">/ ${t.pvMax}</span>
      <button class="ct-pv-btn" onclick="tkAlterarPV('${t.id}',1)">+</button>
    </div>`:''}
    ${podeEditar&&!t.imgUrl?`<button class="btn-ghost" style="width:100%;font-size:10px" onclick="trocarImagemToken('${t.id}')">📷 Adicionar imagem</button>`:''}
    ${podeEditar&&t.imgUrl?`<button class="btn-ghost" style="width:100%;font-size:10px" onclick="trocarImagemToken('${t.id}')">📷 Trocar imagem</button>`:''}
  `;
}

async function trocarImagemToken(tokenId) {
  const t=tokens.find(x=>x.id===tokenId); if(!t) return;
  const input=document.createElement('input'); input.type='file'; input.accept='image/*';
  input.onchange=async e => {
    const file=e.target.files[0]; if(!file) return;
    if(file.size>2*1024*1024) return toast('Imagem muito grande! Máx 2MB.','err');
    toast('Enviando imagem...','ok');
    const ext=file.name.split('.').pop();
    const path=`${currentUser.id}/${tokenId}.${ext}`;
    const { error } = await db.storage.from('tokens').upload(path, file, {upsert:true});
    if (error) return toast('Erro ao enviar imagem!','err');
    const { data } = db.storage.from('tokens').getPublicUrl(path);
    t.imgUrl=data.publicUrl;
    t._imgEl=null;
    mostrarInfoToken(t);
    desenharMapa();
    salvarMapaEstado();
    toast('Imagem atualizada!','ok');
  };
  input.click();
}

function tkAlterarPV(id,delta) {
  const t=tokens.find(x=>x.id===id); if(!t) return;
  t.pvAtual=Math.max(0,Math.min(t.pvMax,t.pvAtual+delta));
  const c=combatentes.find(x=>x.tokenId===id); if(c){c.pvAtual=t.pvAtual;renderCombatTracker();}
  mostrarInfoToken(t); desenharMapa(); salvarMapaEstado();
}
function tkSetPV(id,val) {
  const t=tokens.find(x=>x.id===id); if(!t) return;
  t.pvAtual=Math.max(0,Math.min(t.pvMax,parseInt(val)||0));
  const c=combatentes.find(x=>x.tokenId===id); if(c){c.pvAtual=t.pvAtual;renderCombatTracker();}
  desenharMapa(); salvarMapaEstado();
}

// Grid e régua
function toggleGrid() {
  gridVisivel=!gridVisivel;
  const btn=document.getElementById('btn-toggle-grid');
  if(btn) btn.textContent=gridVisivel?'⊞ Ocultar grid':'⊞ Mostrar grid';
  desenharMapa();
}

function toggleRegua() {
  regraAtiva=!regraAtiva; regraP1=null; regraP2=null;
  const btn=document.getElementById('btn-regua');
  if(btn) btn.classList.toggle('btn-regua-ativa', regraAtiva);
  mapaCanvas.style.cursor=regraAtiva?'crosshair':'default';
  if(!regraAtiva) desenharMapa();
}

function alterarGrid(delta) {
  gridSize=Math.max(30,Math.min(120,gridSize+delta));
  const el=document.getElementById('grid-size-val'); if(el) el.textContent=gridSize+'px';
  desenharMapa();
}

async function importarImagemMapa() {
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
  inp.onchange=async e => {
    const file=e.target.files[0]; if(!file) return;
    toast('Carregando mapa...','ok');
    const reader=new FileReader();
    reader.onload=ev => {
      const img=new Image();
      img.onload=()=>{ mapaImg=img; desenharMapa(); salvarMapaEstado(); };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function limparTokensMapa() {
  if(!confirm('Limpar todos os tokens do mapa?')) return;
  tokens=[]; tokenSelecionado=null;
  const info=document.getElementById('token-info'); if(info) info.style.display='none';
  desenharMapa(); salvarMapaEstado();
}

// ── PERSISTÊNCIA DO MAPA ──────────────────────────
let salvarMapaTimer=null;
function salvarMapaEstado() {
  clearTimeout(salvarMapaTimer);
  salvarMapaTimer=setTimeout(async()=>{
    const payload={ tokens: tokens.map(t=>({...t,_imgEl:undefined})), gridSize, gridVisivel };
    await db.from('mapa_estado').upsert({ id:'sessao_atual', tokens:payload.tokens, grid_size:gridSize, grid_visivel:gridVisivel, updated_at:new Date().toISOString() });
    // Notifica outros via realtime
    await db.from('sala').insert({ user_id:currentUser.id, username:'mapa', tipo:'tokens_update', conteudo:payload });
  }, 500);
}

async function carregarMapaEstado() {
  const { data } = await db.from('mapa_estado').select('*').eq('id','sessao_atual').single();
  if (!data) return;
  tokens = data.tokens || [];
  gridSize = data.grid_size || 60;
  gridVisivel = data.grid_visivel !== false;
  const el=document.getElementById('grid-size-val'); if(el) el.textContent=gridSize+'px';
  const btn=document.getElementById('btn-toggle-grid');
  if(btn) btn.textContent=gridVisivel?'⊞ Ocultar grid':'⊞ Mostrar grid';
  desenharMapa();
}

function aplicarTokensRemoto(conteudo) {
  if (!conteudo?.tokens) return;
  // Preserva _imgEl local
  const imgCache={};
  tokens.forEach(t=>{ if(t._imgEl) imgCache[t.id]=t._imgEl; });
  tokens=conteudo.tokens;
  tokens.forEach(t=>{ if(imgCache[t.id]) t._imgEl=imgCache[t.id]; });
  gridSize=conteudo.gridSize||gridSize;
  if(salaTab==='mapa') desenharMapa();
}
