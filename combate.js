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
        id: mesaId(),
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
    const { data } = await db.from('combat_state').select('*').eq('id', mesaId()).single();
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
  ctRealtimeSub = db.channel('ct-live-'+mesaId())
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'combat_state',
      filter: 'id=eq.' + mesaId()
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
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', userId).eq('mesa_id', mesaId()).maybeSingle();
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
  if (!MAP.tokens.find(t => t.id === id)) {
    mapaAdicionarToken({
      id, nome: ficha.nome || profile.username,
      emoji: '🧑', imgUrl: ficha.foto_url || null,
      tipo: 'pc', pvMax, pvAtual: ficha.pv_atual || pvMax,
      isPC: true, userId,
    });
  }
  renderCT();
  toast(`${ficha.nome || profile.username} adicionado!`, 'ok');
}

// Player adiciona o próprio personagem
async function adicionarMeuPersonagem() {
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', currentUser.id).eq('mesa_id', mesaId()).maybeSingle();
  if (!ficha) return toast('Você ainda não criou sua ficha!', 'err');

  const pvMax = Math.max((ficha.attr_res||0)*4, 4);
  const id = 'pc_'+currentUser.id;

  if (MAP.tokens.find(t => t.id === id)) return toast('Você já está no mapa!', 'err');
  mapaAdicionarToken({ id, nome: ficha.nome || currentProfile.username, emoji: '🧑', imgUrl: ficha.foto_url || null, tipo: 'pc', pvMax, pvAtual: ficha.pv_atual || pvMax, isPC: true, userId: currentUser.id });
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
      btn.innerHTML = `<span style="font-size:18px">🧑</span><span style="font-size:12px;flex:1">${esc(p.username)}</span><span style="font-size:10px;color:var(--muted)">${c.controlador===p.username?'✓ Atual':''}</span>`;
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
  const { data: _membros, error: pe } = await db.from('mesa_membros')
    .select('user_id, profiles(username)').eq('mesa_id', mesaId());
  const profiles = (_membros || [])
    .filter(m => m.user_id !== MESA?.master_id)
    .map(m => ({ id: m.user_id, username: m.profiles?.username || 'Player' }));
  console.log('profiles:', profiles, 'error:', pe);
  if (!profiles?.length) { lista.innerHTML='<div style="font-size:10px;color:var(--muted);padding:4px">Sem players</div>'; return; }
  // Busca todas as fichas e filtra localmente (evita erro 400 com muitos IDs no .in())
  const { data: fichas, error: fe } = await db.from('fichas').select('*').eq('mesa_id', mesaId());
  console.log('fichas:', fichas?.length, 'error:', fe);
  lista.innerHTML='';
  let count = 0;
  profiles.forEach(p => {
    const f = fichas?.find(x=>x.user_id===p.id);
    if (!f) return; // só mostra players com ficha
    const pvMax = Math.max((f.attr_res||0)*4,4);
    const avatar = f.foto_url
      ? `<img src="${f.foto_url}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--border)">`
      : `<div style="width:34px;height:34px;border-radius:50%;background:var(--surface2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">🧑</div>`;
    const div=document.createElement('div'); div.className='ct-inimigo-item';
    div.innerHTML=`
      ${avatar}
      <div class="ct-inimigo-info">
        <div class="ct-inimigo-nome">${esc(f.nome||p.username)}</div>
        <div class="ct-inimigo-stats">PV ${f.pv_atual||0}/${pvMax}</div>
      </div>
      <div style="display:flex;gap:3px;flex-shrink:0">
        <button class="ct-add-btn" onclick="adicionarPlayerSomenteCT('${p.id}')" title="Só no CT">+CT</button>
        <button class="ct-add-btn ct-add-mapa" onclick="adicionarPlayerSomenteMapa('${p.id}')" title="Só no Mapa">+🗺</button>
        <button class="ct-add-btn" onclick="adicionarPlayerCT('${p.id}')" title="CT e Mapa" style="font-size:9px">+Ambos</button>
      </div>
    `;
    lista.appendChild(div);
    count++;
  });
  if (count === 0) lista.innerHTML='<div style="font-size:10px;color:var(--muted);padding:8px">Nenhum player com ficha criada</div>';
}

// ══════════════════════════════════════════════════
//  MAPA
// ══════════════════════════════════════════════════

// Mapa movido para mapa.js

async function adicionarPlayerSomenteCT(userId) {
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', userId).eq('mesa_id', mesaId()).maybeSingle();
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
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', userId).eq('mesa_id', mesaId()).maybeSingle();
  const { data: profile } = await db.from('profiles').select('username').eq('id', userId).single();
  if (!ficha) return toast('Esse player não tem ficha ainda.', 'err');
  const pvMax = Math.max((ficha.attr_res||0)*4, 4);
  const id = 'pc_'+userId;
  if (MAP.tokens.find(t => t.id === id)) return toast('Player já está no mapa.', 'err');
  mapaAdicionarToken({ id, nome: ficha.nome || profile.username, emoji: '🧑', imgUrl: ficha.foto_url || null, tipo: 'pc', pvMax, pvAtual: ficha.pv_atual || pvMax, isPC: true, userId });
  toast((ficha.nome||profile.username)+' adicionado ao mapa!', 'ok');
}

// Realinha todos os tokens ao grid atual (útil ao mudar tamanho do grid)
function realinharTokensAoGrid() {
  if (!snapToGrid) return;
  tokens.forEach(t => snapTokenToGrid(t));
  desenharMapa();
  salvarMapaDB();
  toast('Tokens alinhados ao grid!', 'ok');
}

function adicionarTokenMapa(inimigo) {
  if (!isMaster) { toast('Só o mestre pode adicionar inimigos.', 'err'); return; }
  mapaAdicionarToken({
    id:          inimigo.id + '_' + Date.now(),
    nome:        inimigo.nome,
    emoji:       inimigo.emoji,
    tipo:        inimigo.tipo,
    pvMax:       inimigo.pv,
    pvAtual:     inimigo.pv,
    habilidades: inimigo.habilidades,
    isPC:        false,
  });
}
