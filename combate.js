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

// ── SYNC COMBAT TRACKER ───────────────────────────
let ctRealtimeSub = null;
let ctSaving = false;
let ctSaveTimer = null;

async function salvarCT() {
  if (!isMaster) return;
  // Debounce — não salva mais que 1x por segundo
  clearTimeout(ctSaveTimer);
  ctSaveTimer = setTimeout(async () => {
    try {
      await db.from('combat_state').upsert({
        id: 'sessao',
        combatentes,
        rodada: rodadaAtual,
        turno: turnoAtual,
        ativo: combateAtivo,
        mostrar_pv: mostrarPVInimigos,
        updated_at: new Date().toISOString()
      });
    } catch(e) { console.error('salvarCT:', e); }
  }, 300);
}

async function carregarCT() {
  try {
    const { data } = await db.from('combat_state').select('*').eq('id','sessao').single();
    if (!data) return;
    combatentes      = data.combatentes || [];
    rodadaAtual      = data.rodada || 1;
    turnoAtual       = data.turno  || 0;
    combateAtivo     = data.ativo  || false;
    mostrarPVInimigos = data.mostrar_pv !== false;
    renderCT();
  } catch(e) { console.error('carregarCT:', e); }
}

function aplicarEstadoCT(d) {
  if (!d) return;
  combatentes       = d.combatentes || [];
  rodadaAtual       = d.rodada || 1;
  turnoAtual        = d.turno  || 0;
  combateAtivo      = d.ativo  || false;
  mostrarPVInimigos = d.mostrar_pv !== false;
  renderCT();
}

function subscribeCT() {
  // Carrega estado atual
  carregarCT();

  if (ctRealtimeSub) return;
  ctRealtimeSub = db.channel('ct-live-'+Date.now())
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'combat_state'
    }, payload => {
      // Só aplica se não for o próprio mestre enviando
      if (isMaster) return;
      aplicarEstadoCT(payload.new);
    })
    .subscribe(status => {
      console.log('CT realtime:', status);
    });
}


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
    div.draggable = isMaster;
    div.dataset.id = c.id;
    if (isMaster) {
      div.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c.id); div.style.opacity='0.4'; });
      div.addEventListener('dragend',   () => { div.style.opacity='1'; });
      div.addEventListener('dragover',  e => { e.preventDefault(); div.style.borderColor='var(--gold)'; });
      div.addEventListener('dragleave', () => { div.style.borderColor=''; });
      div.addEventListener('drop', e => {
        e.preventDefault(); div.style.borderColor='';
        const fromId = e.dataTransfer.getData('text/plain');
        reordenarCT(fromId, c.id);
      });
    }
    div.innerHTML = `
      <div class="ct-ordem" style="cursor:${isMaster?'grab':'default'}" title="${isMaster?'Arraste para reordenar':''}">${isAtual?'▶':idx+1}</div>
      ${imgTag}
      <div class="ct-info">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span class="ct-nome">${c.nome}${c.tag?`<span class="ct-tag">${c.tag}</span>`:''}</span>
          ${estado?`<span>${estado}</span>`:''}
          ${ctrlLabel}
        </div>
        <div class="ct-ini" style="display:flex;align-items:center;gap:4px">
          INI:
          ${isMaster
            ? `<input type="number" value="${c.iniciativa}" min="1" max="30" style="width:44px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;font-weight:700;padding:2px 4px;text-align:center" onchange="editarIniciativa('${c.id}',this.value)">`
            : `<strong>${c.iniciativa}</strong>`
          }
        </div>
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
        ${c.habilidades && isMaster ? `<details class="ct-detalhes"><summary>Habilidades</summary><ul>${c.habilidades.map(h=>`<li>${h}</li>`).join('')}</ul>${c.fraqueza?`<div class="ct-fraqueza">⚡ ${c.fraqueza}</div>`:''}</details>` : ''}
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

function reordenarCT(fromId, toId) {
  if (fromId === toId) return;
  const fromIdx = combatentes.findIndex(x => x.id === fromId);
  const toIdx   = combatentes.findIndex(x => x.id === toId);
  if (fromIdx < 0 || toIdx < 0) return;
  const [item] = combatentes.splice(fromIdx, 1);
  combatentes.splice(toIdx, 0, item);
  // Reajusta iniciativas para preservar a ordem visual
  const total = combatentes.length;
  combatentes.forEach((c, i) => { c.iniciativa = total - i; });
  turnoAtual = 0;
  renderCT();
  salvarCT();
}

function editarIniciativa(id, val) {
  const c = combatentes.find(x => x.id === id);
  if (!c) return;
  c.iniciativa = parseInt(val) || 1;
  renderCT();
  salvarCT();
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
      tipo: 'pc', x: snapGrid(gridSize), y: snapGrid(gridSize),
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
    tipo: 'pc', x: snapGrid(gridSize*2), y: snapGrid(gridSize*2),
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
  renderCT(); salvarCT();
}

function iniciarCombate() {
  if (!combatentes.length) return;
  combateAtivo=true; turnoAtual=0; rodadaAtual=1; renderCT(); salvarCT();
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
  combatentes=[]; turnoAtual=0; rodadaAtual=1; combateAtivo=false; renderCT(); salvarCT();
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
  renderCT(); salvarCT();
}

function removerComb(id) {
  combatentes=combatentes.filter(c=>c.id!==id);
  if(turnoAtual>=combatentes.length)turnoAtual=0;
  renderCT(); salvarCT();
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
// ══════════════════════════════════════════════════
//  MAPA — Engine v4 (coordenadas limpas)
// ══════════════════════════════════════════════════

// Estado do mapa
let mapaImg     = null;
let mapaUrl     = null;
let mapaZoom    = 1;
let mapaOffX    = 0;
let mapaOffY    = 0;
let gridSize    = 60;
let gridVisivel = false;
let gridOpacity = 0.25;
let gridColor   = '#c0392b';
let snapToGrid  = true;
let metrosPorCelula = 1.5;
let tokens      = [];
let tokenSel    = null;
let tokensSel   = [];   // seleção múltipla
let dragTok     = null;
let dragToks    = [];   // todos os tokens sendo arrastados
let dragOX = 0, dragOY = 0;
let dragMoved   = false;

// Retângulo de seleção
let selRect     = null;  // {x,y,w,h} em coords mundo
let selRectStart= null;
let isPanning   = false;
let panLast     = null;
let medindoDistancia = false;
let tipoRegua = 'linha';  // 'linha' | 'circulo' | 'cone' | 'quadrado'
let medirA = null, medirB = null;
let anguloConeFix = 60; // graus do cone

// Rastro de movimento
let rastroAtivo = false;
let rastroToken = null;
let rastroPos = null;   // posição prévia do token
let rastroDist = 0;
let lastTouchDist = null;
let touchPanStart = null;
let tokenCustomImg = null;
let mouseDownCanvasPos = null;
const tokenImgCache = {};
let canvas, ctx;

// ── INIT ─────────────────────────────────────────
let _docListenersAdded = false;

function initMapa() {
  canvas = document.getElementById('mapa-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resizeMapCanvas();

  // Canvas-specific listeners (safe to add each time - canvas is new each time)
  canvas.addEventListener('mousedown', onMDown);
  canvas.addEventListener('wheel',     onWheel, { passive: false });
  canvas.addEventListener('touchstart',  onTStart, { passive: false });
  canvas.addEventListener('touchmove',   onTMove,  { passive: false });
  canvas.addEventListener('touchend',    onTEnd,   { passive: false });
  canvas.addEventListener('touchcancel', onTEnd,   { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.style.webkitUserSelect   = 'none';
  canvas.style.userSelect         = 'none';
  canvas.style.webkitTouchCallout = 'none';

  // Document listeners only added ONCE - they persist across canvas resets
  if (!_docListenersAdded) {
    document.addEventListener('mousemove', onMMove);
    document.addEventListener('mouseup',   onMUp);
    _docListenersAdded = true;
  }

  carregarMapaDB();
}

// ── RESIZE ───────────────────────────────────────
// Chamado quando o painel é redimensionado
window.resizeMapCanvas = function() {
  if (!canvas) return;
  const container = canvas.parentElement;
  if (!container) return;
  const r = container.getBoundingClientRect();
  const w = Math.floor(r.width);
  const h = Math.floor(r.height);
  if (w > 10 && h > 10 && (canvas.width !== w || canvas.height !== h)) {
    canvas.width  = w;
    canvas.height = h;
    desenharMapa();
  }
};

// ── COORDENADAS ───────────────────────────────────
// Tela (px CSS) → canvas (px físicos)
function telaParaCanvas(cx, cy) {
  if (!canvas) return { x: 0, y: 0 };
  const r    = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / r.width;
  const scaleY = canvas.height / r.height;
  // Clamp to canvas boundaries when dragging outside
  const x = Math.max(0, Math.min(canvas.width,  (cx - r.left) * scaleX));
  const y = Math.max(0, Math.min(canvas.height, (cy - r.top)  * scaleY));
  return { x, y };
}

// Canvas (px físicos) → mundo (coordenadas dos tokens/grid)
function canvasParaMundo(cx, cy) {
  return { x: (cx - mapaOffX) / mapaZoom, y: (cy - mapaOffY) / mapaZoom };
}

// Mundo → canvas
function mundoParaCanvas(wx, wy) {
  return { x: wx * mapaZoom + mapaOffX, y: wy * mapaZoom + mapaOffY };
}

// Evento de mouse/touch → mundo
function eventoParaMundo(e) {
  const c = telaParaCanvas(e.clientX, e.clientY);
  return canvasParaMundo(c.x, c.y);
}

// Snap ao grid (se ativo) — snappa a borda da célula
function snapGrid(v) {
  if (!snapToGrid) return v;
  return Math.round(v / gridSize) * gridSize;
}

// Snappa o token ao grid - usa floor para alinhar ao canto superior esquerdo da célula
function snapTokenToGrid(tok) {
  if (!snapToGrid) return;
  tok.x = Math.floor(Math.round(tok.x) / gridSize) * gridSize;
  tok.y = Math.floor(Math.round(tok.y) / gridSize) * gridSize;
}

// Token em posição mundo?
function getTokenAt(wx, wy) {
  return tokens.slice().reverse().find(t => {
    // Check using token's actual size based on current gridSize
    const margin = gridSize * 0.1; // small margin for easier clicking
    return wx >= t.x - margin && wx <= t.x + gridSize + margin &&
           wy >= t.y - margin && wy <= t.y + gridSize + margin;
  });
}

function podeMoverToken(t) {
  if (isMaster) return true;
  if (t.isPC && t.userId === currentUser?.id) return true;
  if (t.controladorNome === currentProfile?.username) return true;
  return false;
}

// ── DESENHO ───────────────────────────────────────
function desenharMapa() {
  if (!ctx || !canvas) return;
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#05050a';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(mapaOffX, mapaOffY);
  ctx.scale(mapaZoom, mapaZoom);

  // Imagem de fundo
  if (mapaImg) {
    ctx.drawImage(mapaImg, 0, 0);
  }

  // Grid
  if (gridVisivel) {
    // Área visível em coordenadas mundo
    const wx0 = -mapaOffX / mapaZoom;
    const wy0 = -mapaOffY / mapaZoom;
    const wx1 = (W - mapaOffX) / mapaZoom;
    const wy1 = (H - mapaOffY) / mapaZoom;

    // Cor com opacidade
    const hex = gridColor.replace('#','');
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    ctx.strokeStyle = `rgba(${r},${g},${b},${gridOpacity})`;
    ctx.lineWidth = 1 / mapaZoom;

    const startX = Math.floor(wx0 / gridSize) * gridSize;
    const startY = Math.floor(wy0 / gridSize) * gridSize;

    for (let x = startX; x <= wx1 + gridSize; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, wy0); ctx.lineTo(x, wy1); ctx.stroke();
    }
    for (let y = startY; y <= wy1 + gridSize; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(wx0, y); ctx.lineTo(wx1, y); ctx.stroke();
    }
  }

  // Régua multi-forma
  if (medindoDistancia && medirA && medirB) {
    const dx = medirB.x - medirA.x, dy = medirB.y - medirA.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const metros = (dist / gridSize * metrosPorCelula).toFixed(1);
    const angulo = Math.atan2(dy, dx);

    ctx.strokeStyle = 'rgba(241,196,15,0.9)';
    ctx.fillStyle   = 'rgba(241,196,15,0.15)';
    ctx.lineWidth   = 2 / mapaZoom;
    ctx.setLineDash([6/mapaZoom, 4/mapaZoom]);

    if (tipoRegua === 'linha') {
      ctx.beginPath(); ctx.moveTo(medirA.x, medirA.y); ctx.lineTo(medirB.x, medirB.y);
      ctx.stroke();
    } else if (tipoRegua === 'circulo') {
      ctx.beginPath(); ctx.arc(medirA.x, medirA.y, dist, 0, Math.PI*2);
      ctx.stroke(); ctx.fill();
    } else if (tipoRegua === 'cone') {
      const halfAngle = (anguloConeFix / 2) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(medirA.x, medirA.y);
      ctx.arc(medirA.x, medirA.y, dist, angulo - halfAngle, angulo + halfAngle);
      ctx.closePath(); ctx.stroke(); ctx.fill();
    } else if (tipoRegua === 'quadrado') {
      // Quadrado orientado na direção do arrasto
      const hw = dist * 0.5;
      ctx.save();
      ctx.translate(medirA.x, medirA.y); ctx.rotate(angulo);
      ctx.beginPath(); ctx.rect(0, -hw, dist, dist);
      ctx.stroke(); ctx.fill(); ctx.restore();
    } else if (tipoRegua === 'retangulo') {
      ctx.save();
      ctx.translate(medirA.x, medirA.y); ctx.rotate(angulo);
      ctx.beginPath(); ctx.rect(0, -gridSize/2, dist, gridSize);
      ctx.stroke(); ctx.fill(); ctx.restore();
    }

    ctx.setLineDash([]);

    // Label de distância
    ctx.font = `bold ${14/mapaZoom}px sans-serif`;
    ctx.fillStyle = '#f1c40f'; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 3/mapaZoom;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const lx = (medirA.x+medirB.x)/2, ly = (medirA.y+medirB.y)/2 - 6/mapaZoom;
    ctx.strokeText(`${metros}m`, lx, ly); ctx.fillText(`${metros}m`, lx, ly);
  }

  // Rastro de movimento
  if (rastroAtivo && rastroToken && rastroPos) {
    const t = rastroToken;
    const cx = t.x + gridSize/2, cy = t.y + gridSize/2;
    const ox = rastroPos.x + gridSize/2, oy = rastroPos.y + gridSize/2;
    const dx = cx - ox, dy = cy - oy;
    const dist = Math.sqrt(dx*dx+dy*dy);
    const metros = (dist/gridSize*metrosPorCelula).toFixed(1);

    // Linha pontilhada da origem até posição atual
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(cx, cy);
    ctx.strokeStyle = 'rgba(52,152,219,0.8)'; ctx.lineWidth = 2/mapaZoom;
    ctx.setLineDash([5/mapaZoom, 5/mapaZoom]); ctx.stroke(); ctx.setLineDash([]);

    // Círculo na origem
    ctx.beginPath(); ctx.arc(ox, oy, 5/mapaZoom, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(52,152,219,0.6)'; ctx.fill();

    // Label
    ctx.font = `bold ${13/mapaZoom}px sans-serif`;
    ctx.fillStyle = '#3498db'; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 3/mapaZoom;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.strokeText(`${metros}m`, (ox+cx)/2, (oy+cy)/2 - 6/mapaZoom);
    ctx.fillText(`${metros}m`, (ox+cx)/2, (oy+cy)/2 - 6/mapaZoom);
  }

  // Tokens
  tokens.forEach(t => desenharToken(t));

  ctx.restore();

  // HUD
  const zl = document.getElementById('zoom-label');
  if (zl) zl.textContent = Math.round(mapaZoom * 100) + '%';
}

function desenharToken(t) {
  const r  = gridSize * 0.42;
  const cx = t.x + gridSize / 2;
  const cy = t.y + gridSize / 2;
  const cor = { pc:'#2980b9', infectado:'#c0392b', animal:'#27ae60',
                animal_infectado:'#8e44ad', humano:'#e67e22', custom:'#7f8c8d' }[t.tipo] || '#555';

  // Seleção
  if (tokenSel?.id === t.id) {
    ctx.beginPath(); ctx.arc(cx, cy, r + 4 / mapaZoom, 0, Math.PI * 2);
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2 / mapaZoom; ctx.stroke();
  }

  // Corpo
  if (t.imgUrl) {
    const cached = tokenImgCache[t.imgUrl];
    if (cached === undefined) {
      // Ainda carregando — placeholder
      tokenImgCache[t.imgUrl] = null;
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { tokenImgCache[t.imgUrl] = img; desenharMapa(); };
      img.onerror = () => { tokenImgCache[t.imgUrl] = 'err'; desenharMapa(); };
      img.src = t.imgUrl;
    } else if (cached && cached !== 'err') {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(cached, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    } else {
      // Erro ou carregando
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = cor; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = cor; ctx.lineWidth = 2 / mapaZoom; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = cor; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5 / mapaZoom; ctx.stroke();
    ctx.font = `${r * 0.9}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t.emoji || '?', cx, cy);
  }

  // Nome
  ctx.font = `bold ${Math.max(8, gridSize * 0.13)}px sans-serif`;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = 3 / mapaZoom;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.strokeText(t.nome.substring(0, 10), cx, t.y + gridSize - 14);
  ctx.fillText(t.nome.substring(0, 10), cx, t.y + gridSize - 14);

  // Barra PV
  const devePV = t.pvMax && (t.isPC || isMaster || mostrarPVInimigos);
  if (devePV) {
    const bw = gridSize - 8, bh = 4, bx = t.x + 4, by = t.y + 3;
    const pct = Math.max(0, t.pvAtual / t.pvMax);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f39c12' : '#c0392b';
    ctx.fillRect(bx, by, bw * pct, bh);
  }
}

// ── ZOOM ─────────────────────────────────────────
function onWheel(e) {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 0.88;
  const c = telaParaCanvas(e.clientX, e.clientY);
  const novoZoom = Math.max(0.2, Math.min(5, mapaZoom * factor));
  // Zoom centrado no cursor
  mapaOffX = c.x - (c.x - mapaOffX) * (novoZoom / mapaZoom);
  mapaOffY = c.y - (c.y - mapaOffY) * (novoZoom / mapaZoom);
  mapaZoom = novoZoom;
  desenharMapa();
}

function resetZoom() { mapaZoom = 1; mapaOffX = 0; mapaOffY = 0; desenharMapa(); }

function alterarZoomBtn(delta) {
  const novoZoom = Math.max(0.2, Math.min(5, mapaZoom + delta));
  const cx = canvas.width / 2, cy = canvas.height / 2;
  mapaOffX = cx - (cx - mapaOffX) * (novoZoom / mapaZoom);
  mapaOffY = cy - (cy - mapaOffY) * (novoZoom / mapaZoom);
  mapaZoom = novoZoom;
  desenharMapa();
}

// ── MOUSE ────────────────────────────────────────
function onMDown(e) {
  const c = telaParaCanvas(e.clientX, e.clientY);
  mouseDownCanvasPos = c;
  dragMoved = false;

  if (medindoDistancia) {
    medirA = canvasParaMundo(c.x, c.y);
    medirB = { ...medirA };
    return;
  }

  // Alt+drag ou botão do meio = pan
  if (e.button === 1 || e.altKey || e.button === 2) {
    isPanning = true; panLast = c;
    canvas.style.cursor = 'grabbing'; return;
  }

  const w = canvasParaMundo(c.x, c.y);
  const t = getTokenAt(w.x, w.y);

  if (t && podeMoverToken(t)) {
    // Shift+click = adiciona/remove da seleção múltipla
    if (e.shiftKey) {
      const idx = tokensSel.findIndex(s=>s.id===t.id);
      if (idx>=0) tokensSel.splice(idx,1); else tokensSel.push(t);
      tokenSel = t;
      desenharMapa(); return;
    }
    // Se token já está na seleção múltipla, move todos
    if (tokensSel.length > 1 && tokensSel.some(s=>s.id===t.id)) {
      dragTok = t; dragOX = w.x - t.x; dragOY = w.y - t.y;
      // Guarda offsets de todos os tokens selecionados
      dragToks = tokensSel.map(s=>({ tok:s, ox:w.x-s.x, oy:w.y-s.y }));
    } else {
      tokensSel = [];
      dragTok = t; dragOX = w.x - t.x; dragOY = w.y - t.y;
      dragToks = [];
    }
    tokenSel = t;
    rastroToken = t; rastroPos = { x: t.x, y: t.y }; rastroAtivo = true;
    desenharMapa();
  } else {
    // Clique em área vazia
    if (tokensSel.length > 0) {
      // Começa retângulo de seleção
      selRectStart = w; selRect = null;
      tokensSel = []; tokenSel = null; esconderInfoToken(); desenharMapa();
    } else {
      isPanning = true; panLast = c;
      canvas.style.cursor = 'grab';
      tokenSel = null; esconderInfoToken(); desenharMapa();
    }
  }
}

function onMMove(e) {
  if (!dragTok && !isPanning && !medindoDistancia) return; // early exit
  const c = telaParaCanvas(e.clientX, e.clientY);

  if (mouseDownCanvasPos) {
    const dx = c.x - mouseDownCanvasPos.x;
    const dy = c.y - mouseDownCanvasPos.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
  }

  if (medindoDistancia && medirA) {
    medirB = canvasParaMundo(c.x, c.y); desenharMapa(); return;
  }

  if (isPanning && panLast) {
    mapaOffX += c.x - panLast.x;
    mapaOffY += c.y - panLast.y;
    panLast = c; desenharMapa(); return;
  }

  if (dragTok) {
    const w = canvasParaMundo(c.x, c.y);
    if (dragToks.length > 1) {
      // Move todos os tokens selecionados
      dragToks.forEach(({tok,ox,oy}) => {
        tok.x = Math.max(0, w.x - ox);
        tok.y = Math.max(0, w.y - oy);
      });
    } else {
      dragTok.x = Math.max(0, w.x - dragOX);
      dragTok.y = Math.max(0, w.y - dragOY);
    }
    desenharMapa();
    return;
  }
  // Retângulo de seleção
  if (selRectStart && !isPanning) {
    const w = canvasParaMundo(c.x, c.y);
    selRect = {
      x: Math.min(selRectStart.x, w.x), y: Math.min(selRectStart.y, w.y),
      w: Math.abs(w.x-selRectStart.x),  h: Math.abs(w.y-selRectStart.y)
    };
    desenharMapa();
    return;
  }
}

function onMUp(e) {
  canvas.style.cursor = 'default';

  if (isPanning) { isPanning = false; panLast = null; return; }
  if (medindoDistancia) return;

  if (dragTok) {
    if (dragToks.length > 1) dragToks = [];
    if (!dragMoved) mostrarInfoToken(dragTok);
    dragTok = null;
    rastroAtivo = false; rastroToken = null; rastroPos = null;
    desenharMapa(); salvarMapaDB();
  } else if (selRectStart && selRect) {
    // Finaliza retângulo — seleciona tokens dentro
    tokensSel = tokens.filter(t => podeMoverToken(t) &&
      t.x + gridSize/2 >= selRect.x && t.x + gridSize/2 <= selRect.x + selRect.w &&
      t.y + gridSize/2 >= selRect.y && t.y + gridSize/2 <= selRect.y + selRect.h
    );
    if (tokensSel.length > 0) toast(`${tokensSel.length} token(s) selecionados`, 'ok');
    selRect = null; selRectStart = null;
    desenharMapa();
  } else if (!dragMoved && tokenSel) {
    mostrarInfoToken(tokenSel);
  }

  mouseDownCanvasPos = null; dragMoved = false;
}

// ── TOUCH ────────────────────────────────────────
function onTStart(e) {
  e.preventDefault();

  if (e.touches.length === 2) {
    // Pinch zoom
    dragTok = null; isPanning = false;
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    touchPanStart = telaParaCanvas(mx, my);
    return;
  }

  const t0 = e.touches[0];
  const c   = telaParaCanvas(t0.clientX, t0.clientY);
  const w   = canvasParaMundo(c.x, c.y);
  mouseDownCanvasPos = c; dragMoved = false;

  if (medindoDistancia) {
    medirA = w; medirB = { ...w }; return;
  }

  const tok = getTokenAt(w.x, w.y);
  if (tok && podeMoverToken(tok)) {
    dragTok = tok; dragOX = w.x - tok.x; dragOY = w.y - tok.y;
    tokenSel = tok;
    rastroToken = tok; rastroPos = { x: tok.x, y: tok.y }; rastroAtivo = true;
    desenharMapa();
  } else {
    isPanning = true; panLast = c;
    if (tokenSel) { tokenSel = null; esconderInfoToken(); desenharMapa(); }
  }
}

function onTMove(e) {
  e.preventDefault();

  if (e.touches.length === 2) {
    // Pinch zoom centrado entre os dois dedos
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    if (lastTouchDist && dist > 0) {
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const c  = telaParaCanvas(mx, my);
      const factor = dist / lastTouchDist;
      const novoZoom = Math.max(0.2, Math.min(5, mapaZoom * factor));
      mapaOffX = c.x - (c.x - mapaOffX) * (novoZoom / mapaZoom);
      mapaOffY = c.y - (c.y - mapaOffY) * (novoZoom / mapaZoom);
      mapaZoom = novoZoom;
      desenharMapa();
    }
    lastTouchDist = dist; return;
  }

  const t0 = e.touches[0];
  const c  = telaParaCanvas(t0.clientX, t0.clientY);

  if (mouseDownCanvasPos) {
    const dx = c.x - mouseDownCanvasPos.x;
    const dy = c.y - mouseDownCanvasPos.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
  }

  if (medindoDistancia && medirA) {
    medirB = canvasParaMundo(c.x, c.y); desenharMapa(); return;
  }

  if (dragTok) {
    const w = canvasParaMundo(c.x, c.y);
    dragTok.x = Math.max(0, w.x - dragOX);
    dragTok.y = Math.max(0, w.y - dragOY);
    desenharMapa(); return;
  }

  if (isPanning && panLast) {
    mapaOffX += c.x - panLast.x;
    mapaOffY += c.y - panLast.y;
    panLast = c; desenharMapa();
  }
}

function onTEnd(e) {
  lastTouchDist = null;

  if (dragTok) {
    if (!dragMoved) mostrarInfoToken(dragTok);
    dragTok = null;
    rastroAtivo = false; rastroToken = null; rastroPos = null;
    desenharMapa(); salvarMapaDB();
  } else if (isPanning) {
    isPanning = false; panLast = null;
  } else if (!dragMoved) {
    // Tap sem drag = mostra info se tocou token
    const t0 = e.changedTouches[0];
    if (t0) {
      const c = telaParaCanvas(t0.clientX, t0.clientY);
      const w = canvasParaMundo(c.x, c.y);
      const tok = getTokenAt(w.x, w.y);
      if (tok) { tokenSel = tok; mostrarInfoToken(tok); desenharMapa(); }
    }
  }

  // Double-tap detection for cancelling ruler on mobile
  if (!dragMoved) {
    const now = Date.now();
    if (now - lastTapTime < 300 && medindoDistancia) {
      toggleRegua('linha'); // cancela régua
    }
    lastTapTime = now;
  }

  mouseDownCanvasPos = null; dragMoved = false;
}

// ── REGUA MOBILE ─────────────────────────────────
// Double-tap é tratado dentro do onTEnd principal
let lastTapTime = 0;

// ── CONTROLES GRID ───────────────────────────────
function toggleGrid() {
  gridVisivel = !gridVisivel;
  const btn = document.getElementById('btn-grid');
  if (btn) btn.textContent = gridVisivel ? '⬛ Ocultar Grid' : '⬛ Mostrar Grid';
  desenharMapa();
}

function alterarGrid(delta) {
  gridSize = Math.max(20, Math.min(200, gridSize + delta));
  const el = document.getElementById('grid-size-val');
  if (el) el.textContent = gridSize + 'px';
  desenharMapa();
}

function toggleRegua(tipo) {
  if (tipo) {
    // Seleciona tipo específico
    if (medindoDistancia && tipoRegua === tipo) {
      // Clicar no mesmo tipo = desativa
      medindoDistancia = false; medirA = null; medirB = null;
    } else {
      medindoDistancia = true; tipoRegua = tipo; medirA = null; medirB = null;
    }
  } else {
    medindoDistancia = !medindoDistancia; medirA = null; medirB = null;
    if (medindoDistancia) tipoRegua = 'linha';
  }
  atualizarBotoesRegua();
  if (canvas) canvas.style.cursor = medindoDistancia ? 'crosshair' : 'default';
  if (!medindoDistancia) desenharMapa();
}

function atualizarBotoesRegua() {
  const tipos = ['linha','circulo','cone','quadrado','retangulo'];
  tipos.forEach(t => {
    const btn = document.getElementById('btn-regua-'+t);
    if (!btn) return;
    const ativo = medindoDistancia && tipoRegua === t;
    btn.style.color = ativo ? 'var(--gold)' : '';
    btn.style.borderColor = ativo ? 'var(--gold)' : '';
  });
}

// ── TOKENS ────────────────────────────────────────
function adicionarTokenMapa(inimigo) {
  if (!isMaster) { toast('Só o mestre pode adicionar inimigos.', 'err'); return; }
  const id = inimigo.id + '_' + Date.now();
  // Posiciona no centro visível do mapa
  const cx = (canvas.width  / 2 - mapaOffX) / mapaZoom;
  const cy = (canvas.height / 2 - mapaOffY) / mapaZoom;
  tokens.push({
    id, nome: inimigo.nome, emoji: inimigo.emoji, tipo: inimigo.tipo,
    x: cx - gridSize/2, y: cy - gridSize/2,
    pvMax: inimigo.pv, pvAtual: inimigo.pv,
    habilidades: inimigo.habilidades, isPC: false,
  });
  desenharMapa(); salvarMapaDB();
}

function removerToken(id) {
  tokens = tokens.filter(t => t.id !== id);
  tokenSel = null; esconderInfoToken(); desenharMapa(); salvarMapaDB();
}

function alterarPVToken(id, delta) {
  const t = tokens.find(x => x.id === id); if (!t) return;
  t.pvAtual = Math.max(0, Math.min(t.pvMax, t.pvAtual + delta));
  const c = combatentes.find(x => x.id === id);
  if (c) { c.pvAtual = t.pvAtual; renderCT(); }
  mostrarInfoToken(t); desenharMapa(); salvarMapaDB();
}

function setPVToken(id, val) {
  const t = tokens.find(x => x.id === id); if (!t) return;
  t.pvAtual = Math.max(0, Math.min(t.pvMax, parseInt(val) || 0));
  const c = combatentes.find(x => x.id === id);
  if (c) { c.pvAtual = t.pvAtual; renderCT(); }
  desenharMapa(); salvarMapaDB();
}

async function uploadTokenImg(tokenId, input) {
  const file = input.files[0]; if (!file) return;
  const ext  = file.name.split('.').pop();
  const path = `${currentUser.id}/${tokenId}.${ext}`;
  const { error } = await db.storage.from('tokens').upload(path, file, { upsert: true });
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  const { data } = db.storage.from('tokens').getPublicUrl(path);
  const t = tokens.find(x => x.id === tokenId);
  if (t) {
    delete tokenImgCache[t.imgUrl];
    t.imgUrl = data.publicUrl;
    mostrarInfoToken(t); desenharMapa(); salvarMapaDB();
  }
  toast('Imagem atualizada!', 'ok');
}

function limparTokens() {
  if (!isMaster) { toast('Só o mestre pode limpar.', 'err'); return; }
  if (!confirm('Limpar todos os tokens?')) return;
  tokens = []; tokenSel = null; esconderInfoToken(); desenharMapa(); salvarMapaDB();
}

function importarMapaImg() {
  if (!isMaster) return;
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        mapaImg = img;
        mapaUrl = ev.target.result;
        // Reset view para mostrar o mapa inteiro
        resetZoom();
        desenharMapa();
        salvarMapaDB();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// Token custom

function abrirCriarTokenCustom() {
  if (!isMaster) return;
  const m = document.getElementById('modal-token-custom');
  if (m) m.style.display = 'flex';
}
function fecharCriarTokenCustom() {
  const m = document.getElementById('modal-token-custom');
  if (m) m.style.display = 'none';
}
function tokenCustomImgPreview(input) {
  const file = input.files[0]; if (!file) return;
  tokenCustomImg = file;
  const r = new FileReader();
  r.onload = e => {
    const p = document.getElementById('token-custom-preview');
    if (p) { p.src = e.target.result; p.style.display = 'block'; }
  };
  r.readAsDataURL(file);
}
async function criarTokenCustom() {
  const nome  = document.getElementById('tc-nome')?.value.trim() || 'Token';
  const pvMax = parseInt(document.getElementById('tc-pv')?.value) || 0;
  const tipo  = document.getElementById('tc-tipo')?.value || 'custom';
  const emoji = document.getElementById('tc-emoji')?.value || '⭐';
  const id    = 'custom_' + Date.now();
  let imgUrl  = null;
  if (tokenCustomImg) {
    const ext  = tokenCustomImg.name.split('.').pop();
    const path = `${currentUser.id}/${id}.${ext}`;
    const { error } = await db.storage.from('tokens').upload(path, tokenCustomImg, { upsert: true });
    if (!error) {
      const { data } = db.storage.from('tokens').getPublicUrl(path);
      imgUrl = data.publicUrl;
    }
  }
  const cx = (canvas.width  / 2 - mapaOffX) / mapaZoom;
  const cy = (canvas.height / 2 - mapaOffY) / mapaZoom;
  tokens.push({
    id, nome, emoji, tipo, imgUrl,
    x: cx - gridSize/2, y: cy - gridSize/2,
    pvMax: pvMax || undefined, pvAtual: pvMax || undefined, isPC: false,
  });
  tokenCustomImg = null;
  fecharCriarTokenCustom();
  desenharMapa(); salvarMapaDB();
  toast('Token criado!', 'ok');
}

// ── TOKEN INFO ────────────────────────────────────
function mostrarInfoToken(t) {
  const el = document.getElementById('token-info'); if (!el) return;

  // Players não veem info do próprio token PC
  const ehMeuPC = t.isPC && t.userId === currentUser?.id;
  if (ehMeuPC && !isMaster) { el.style.display = 'none'; return; }

  el.style.display = 'block';
  const podeEditar = isMaster || t.controladorNome === currentProfile?.username;

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      ${t.imgUrl && tokenImgCache[t.imgUrl] && tokenImgCache[t.imgUrl] !== 'err'
        ? `<img src="${t.imgUrl}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0">`
        : `<span style="font-size:22px;flex-shrink:0">${t.emoji || '?'}</span>`}
      <div style="flex:1">
        <div style="font-weight:700;font-size:12px">${t.nome}</div>
        <div style="font-size:9px;color:var(--muted)">${t.tipo}</div>
      </div>
      ${podeEditar ? `<button class="btn-icon" onclick="removerToken('${t.id}')" title="Remover">🗑</button>` : ''}
    </div>
    ${t.pvMax ? `<div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">
      <span style="font-size:9px;color:var(--muted)">PV</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',-1)">−</button>
      <input type="number" value="${t.pvAtual}" min="0" max="${t.pvMax}" onchange="setPVToken('${t.id}',this.value)"
        style="width:40px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px;font-size:12px">
      <span style="color:var(--muted);font-size:11px">/${t.pvMax}</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',1)">+</button>
    </div>` : ''}
    ${podeEditar ? `
    <input type="file" accept="image/*" style="display:none" id="tok-img-${t.id}" onchange="uploadTokenImg('${t.id}',this)">
    <button class="btn-ghost" style="width:100%;font-size:9px;padding:4px" onclick="document.getElementById('tok-img-${t.id}').click()">📷 Trocar imagem</button>
    ` : ''}
  `;
}

function esconderInfoToken() {
  const el = document.getElementById('token-info');
  if (el) el.style.display = 'none';
}


// ── PERSISTÊNCIA ──────────────────────────────────
// Debounced autosave
let _mapaAutoSaveTimer = null;
function salvarMapaDB() {
  clearTimeout(_mapaAutoSaveTimer);
  _mapaAutoSaveTimer = setTimeout(_salvarMapaDBNow, 500);
}

async function _salvarMapaDBNow(){
  try{
    if(isMaster){
      const ts = new Date().toISOString();
      window._lastMapaSave = ts;
      // Só salva mapa_url se for URL real (não base64 local)
      const urlParaSalvar = (mapaUrl && mapaUrl.startsWith('https://')) ? mapaUrl : null;
      await db.from('mapa_estado').upsert({
        id:'sessao_atual',
        tokens:tokens.map(t=>({...t})),
        grid_size:gridSize, grid_visivel:gridVisivel,
        mapa_url:urlParaSalvar,
        updated_at:ts
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

  // Auto-save cena ativa também
  if(isMaster && typeof cenaAtiva !== 'undefined' && cenaAtiva){
    try{
      await db.from('cenas_mapa').update({
        tokens: tokens.map(t=>({...t})),
        grid_size: gridSize,
        mapa_url: mapaUrl||null,
      }).eq('id', cenaAtiva);
    }catch(e){}
  }
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
  console.log('subscribing to mapa-realtime...');
  mapaRealtimeSub=db.channel('mapa-realtime-'+Date.now())
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'mapa_estado'},payload=>{
      console.log('mapa-realtime: recebido UPDATE', payload.new?.id, 'mapa_url:', payload.new?.mapa_url?.substring(0,40));
      const d=payload.new; if(!d) return;

      // Atualiza tokens e grid (para todos)
      tokens=d.tokens||[];
      gridSize=d.grid_size||60;
      gridVisivel=d.grid_visivel!==false;

      // Atualiza tokens e redesenha
      // mapa_url pode ser undefined se não estiver no replica identity - ignora
      desenharMapa();
    }).subscribe(status => { console.log('mapa-realtime status:', status); });
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
      tipo: 'pc', x: snapGrid(gridSize*2), y: snapGrid(gridSize*2),
      pvMax, pvAtual: ficha.pv_atual || pvMax,
      isPC: true, userId,
    });
    desenharMapa(); salvarMapaDB();
    toast((ficha.nome||profile.username)+' adicionado ao mapa!', 'ok');
  } else {
    toast('Player já está no mapa.', 'err');
  }
}

// Realinha todos os tokens ao grid atual (útil ao mudar tamanho do grid)
function realinharTokensAoGrid() {
  if (!snapToGrid) return;
  tokens.forEach(t => snapTokenToGrid(t));
  desenharMapa();
  salvarMapaDB();
  toast('Tokens alinhados ao grid!', 'ok');
}
