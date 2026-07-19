// ══════════════════════════════════════════════════
//  FRACTURED — combate.js v3
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════════════
//  BESTIÁRIO — agora vive no banco, POR MESA.
//  Cada mestre só vê e edita os monstros da sua mesa
//  (bloqueado por RLS no servidor, não só no cliente).
// ══════════════════════════════════════════════════
let BESTIARIO = {};        // { categoria: [monstros] }
let TODOS_INIMIGOS = [];   // lista achatada p/ quick-add do mapa
let _bestiarioCarregado = false;

async function carregarBestiario(force = false) {
  if (!isMaster || !mesaId()) return;
  if (_bestiarioCarregado && !force) { renderBestiarioCT(); return; }
  const { data, error } = await db.from('bestiario')
    .select('*')
    .eq('mesa_id', mesaId())
    .order('categoria').order('created_at');
  if (error) {
    console.error('carregarBestiario:', error);
    if (/bestiario/i.test(error.message || '')) {
      toast('⚠ Rode MIGRACAO_BESTIARIO.sql no Supabase!', 'err');
    }
    return;
  }
  BESTIARIO = {};
  (data || []).forEach(row => {
    const m = { ...(row.dados || {}), _dbId: row.id };
    (BESTIARIO[row.categoria] = BESTIARIO[row.categoria] || []).push(m);
  });
  TODOS_INIMIGOS = Object.values(BESTIARIO).flat();
  _bestiarioCarregado = true;
  renderBestiarioCT();
  if (typeof renderMapaBestiarioQuick === 'function') renderMapaBestiarioQuick();
}

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
      iniciativa: Math.floor(Math.random()*20)+1 + ((ficha.attr_agi || 0) - 3), // d20 + mod AGI
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

  // Carrega lista de players (membros da mesa atual, exceto o mestre)
  db.from('mesa_membros').select('user_id, profiles(username)').eq('mesa_id', mesaId()).then(({data: _mm}) => {
    const data = (_mm || [])
      .filter(m => m.user_id !== MESA?.master_id)
      .map(m => ({ id: m.user_id, username: m.profiles?.username || 'Player' }));
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

  // Botão de criar monstro (bestiário é por mesa, cada mestre monta o seu)
  const addBtn=document.createElement('button');
  addBtn.className='btn-ghost';
  addBtn.style.cssText='width:100%;font-size:10px;padding:5px;margin-bottom:6px';
  addBtn.textContent='＋ Novo monstro';
  addBtn.onclick=()=>abrirFormMonstro();
  lista.appendChild(addBtn);

  const nomes={infectados:'Infectados',animais:'Animais',humanos:'Humanos',animais_infectados:'Animais Infectados'};
  const cats=Object.entries(BESTIARIO);
  if(!cats.length){
    const vazio=document.createElement('div');
    vazio.style.cssText='font-size:11px;color:var(--muted);padding:8px;text-align:center';
    vazio.textContent='Bestiário vazio. Crie seus monstros!';
    lista.appendChild(vazio);
    return;
  }
  cats.forEach(([cat,inimigos])=>{
    const fil=inimigos.filter(i=>i.nome.toLowerCase().includes(filtro));
    if(!fil.length) return;
    const h=document.createElement('div'); h.className='ct-categoria'; h.textContent=nomes[cat]||cat; lista.appendChild(h);
    fil.forEach(ini=>{
      const div=document.createElement('div'); div.className='ct-inimigo-item';
      const iniLimpo={...ini}; delete iniLimpo._dbId;
      div.innerHTML=`
        <span class="ct-inimigo-emoji">${ini.emoji}</span>
        <div class="ct-inimigo-info" style="cursor:pointer" title="Ver ficha completa">
          <div class="ct-inimigo-nome">${esc(ini.nome)}</div>
          <div class="ct-inimigo-stats">PV ${ini.pv} · COM ${ini.com>=0?'+':''}${ini.com}</div>
        </div>
        <div style="display:flex;gap:3px;flex-shrink:0">
          <button class="ct-add-btn ct-ver-btn" title="Ver ficha completa">👁</button>
          <button class="ct-add-btn" onclick='adicionarInimigoCT(${JSON.stringify(iniLimpo).replace(/'/g,"&#39;")})'>+CT</button>
          <button class="ct-add-btn ct-add-mapa" onclick='adicionarTokenMapa(${JSON.stringify(iniLimpo).replace(/'/g,"&#39;")})'>+🗺</button>
          <button class="ct-add-btn" style="color:var(--red)" title="Deletar monstro" onclick="deletarMonstro('${ini._dbId}','${esc(ini.nome).replace(/'/g,"&#39;")}')">✕</button>
        </div>`;
      div.querySelector('.ct-ver-btn').onclick = () => verMonstro(ini, nomes[cat]||cat);
      div.querySelector('.ct-inimigo-info').onclick = () => verMonstro(ini, nomes[cat]||cat);
      lista.appendChild(div);
    });
  });
}

// Ficha completa do monstro (leitura) — clicar no nome ou no 👁 abre
function verMonstro(m, categoria) {
  const stats = [
    ['PV', m.pv ?? 0],
    ['COM', (m.com >= 0 ? '+' : '') + (m.com ?? 0)],
    ['AGI', (m.agi >= 0 ? '+' : '') + (m.agi ?? 0)],
    ['RES', (m.res >= 0 ? '+' : '') + (m.res ?? 0)],
  ];
  const statsHtml = stats.map(([label, v]) => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 4px;text-align:center">
      <div style="font-size:9px;color:var(--muted);letter-spacing:1px">${label}</div>
      <div style="font-size:18px;font-weight:700;color:var(--text)">${v}</div>
    </div>`).join('');
  const habs = Array.isArray(m.habilidades) ? m.habilidades : String(m.habilidades || '').split('\n').filter(Boolean);
  const habsHtml = habs.length
    ? '<ul style="margin:0;padding-left:16px">' + habs.map(h => `<li style="margin-bottom:3px">${esc(h)}</li>`).join('') + '</ul>'
    : '—';

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:8600;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `
    <div style="width:100%;max-width:380px;max-height:90vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--border);border-radius:10px;padding:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-size:32px">${m.emoji || '👾'}</span>
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--gold)">${esc(m.nome)}</div>
          <div style="font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase">${esc(categoria || m.tipo || '')}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px">${statsHtml}</div>
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase;margin-bottom:5px">Habilidades</div>
      <div style="font-size:12px;color:var(--text);margin-bottom:12px">${habsHtml}</div>
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase;margin-bottom:5px">Fraqueza</div>
      <div style="font-size:12px;color:var(--text);white-space:pre-wrap;margin-bottom:14px">${m.fraqueza ? esc(m.fraqueza) : '—'}</div>
      <button class="btn-ghost" style="width:100%;font-size:11px;padding:8px" onclick="this.closest('div').parentElement.remove()">Fechar</button>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

// ── CRIAR / DELETAR MONSTROS ──────────────────────
function abrirFormMonstro() {
  if (document.getElementById('modal-monstro')) return;
  const modal=document.createElement('div');
  modal.id='modal-monstro';
  modal.style.cssText='position:fixed;inset:0;z-index:8500;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:16px';
  const inp='width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:6px 8px;font-size:12px';
  modal.innerHTML=`
    <div style="width:100%;max-width:380px;max-height:90vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:12px;font-weight:700;color:var(--gold);letter-spacing:1px;margin-bottom:10px">📖 NOVO MONSTRO</div>
      <div style="display:grid;grid-template-columns:1fr 70px;gap:6px;margin-bottom:6px">
        <input id="mon-nome" placeholder="Nome" style="${inp}">
        <input id="mon-emoji" placeholder="🧟" maxlength="4" style="${inp};text-align:center">
      </div>
      <input id="mon-categoria" placeholder="Categoria (ex: infectados, humanos...)" list="mon-cats" style="${inp};margin-bottom:6px">
      <datalist id="mon-cats">${Object.keys(BESTIARIO).map(c=>`<option value="${c}">`).join('')}</datalist>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
        <input id="mon-pv"  type="number" placeholder="PV"  style="${inp}">
        <input id="mon-com" type="number" placeholder="COM" style="${inp}">
        <input id="mon-agi" type="number" placeholder="AGI" style="${inp}">
        <input id="mon-res" type="number" placeholder="RES" style="${inp}">
      </div>
      <textarea id="mon-hab" placeholder="Habilidades (uma por linha)" rows="4" style="${inp};resize:vertical;margin-bottom:6px"></textarea>
      <input id="mon-fraq" placeholder="Fraqueza" style="${inp};margin-bottom:10px">
      <div style="display:flex;gap:6px">
        <button class="btn-ghost" style="flex:1;font-size:11px;padding:7px" onclick="document.getElementById('modal-monstro').remove()">Cancelar</button>
        <button class="btn-ghost" style="flex:1;font-size:11px;padding:7px;color:var(--gold);border-color:var(--gold)" onclick="salvarMonstro()">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.remove(); });
}

async function salvarMonstro() {
  const nome=document.getElementById('mon-nome')?.value.trim();
  if(!nome){ toast('Dá um nome pro monstro!','err'); return; }
  const categoria=(document.getElementById('mon-categoria')?.value.trim().toLowerCase().replace(/\s+/g,'_'))||'outros';
  const dados={
    id: nome.toLowerCase().replace(/\s+/g,'_'),
    nome,
    emoji: document.getElementById('mon-emoji')?.value.trim()||'👾',
    pv:  parseInt(document.getElementById('mon-pv')?.value)||10,
    com: parseInt(document.getElementById('mon-com')?.value)||0,
    agi: parseInt(document.getElementById('mon-agi')?.value)||0,
    res: parseInt(document.getElementById('mon-res')?.value)||0,
    tipo: categoria,
    habilidades: (document.getElementById('mon-hab')?.value||'').split('\n').map(s=>s.trim()).filter(Boolean),
    fraqueza: document.getElementById('mon-fraq')?.value.trim()||'',
  };
  const { error }=await db.from('bestiario').insert({ mesa_id: mesaId(), categoria, dados });
  if(error){ toast('Erro ao salvar: '+error.message,'err'); return; }
  document.getElementById('modal-monstro')?.remove();
  toast(`"${nome}" adicionado ao bestiário!`,'ok');
  carregarBestiario(true);
}

async function deletarMonstro(dbId,nome) {
  if(!confirm(`Deletar "${nome}" do bestiário?`)) return;
  const { error }=await db.from('bestiario').delete().eq('id',dbId).eq('mesa_id',mesaId());
  if(error){ toast('Erro: '+error.message,'err'); return; }
  toast('Monstro removido.','ok');
  carregarBestiario(true);
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
      iniciativa: Math.floor(Math.random()*20)+1 + ((ficha.attr_agi || 0) - 3), // d20 + mod AGI
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
