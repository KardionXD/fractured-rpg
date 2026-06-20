// ══════════════════════════════════════════════════
//  FRACTURED — app.js
// ══════════════════════════════════════════════════

let currentUser = null;
let currentProfile = null;
let fichaId = null;
let isMaster = false;

let pvAtual = 0, pvMax = 20;
let supAtual = 0;
let humAtual = 10;
let tensaoFicha = 0;
let tensaoSala = 0;

let notaAtual = null;
let notaEditada = false;
let realtimeSub = null;

const TENSAO_TYPES = ['C','C','C','A','A','A','P','P','T','T'];

// ── INIT ──────────────────────────────────────────
async function init() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return; }

  currentUser = session.user;

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (!profile) {
    // Perfil ainda não existe — cria um básico automaticamente
    const username = currentUser.email.split('@')[0];
    const { data: newProfile, error: createError } = await db
      .from('profiles')
      .insert({ id: currentUser.id, username, is_master: false })
      .select()
      .single();

    if (createError || !newProfile) {
      await db.auth.signOut();
      window.location.href = 'index.html';
      return;
    }
    currentProfile = newProfile;
    isMaster = false;
  } else {
    currentProfile = profile;
    isMaster = profile.is_master;
  }

  document.getElementById('topbar-username').textContent = currentProfile.username;
  if (isMaster) {
    document.getElementById('master-badge').style.display = '';
    document.getElementById('nav-master-section').style.display = '';
  }

  buildAttrGrid();
  buildPips('pip-pv', pvMax, pvAtual, 'red', onPVClick, 'pip-pv-val');
  buildPips('pip-sup', 10, supAtual, 'blue', onSupClick, 'pip-sup-val');
  buildPips('pip-hum', 10, humAtual, 'green', onHumClick, 'pip-hum-val');
  buildTensaoPips('tensao-pips-ficha', tensaoFicha, true);
  buildPericias();
  buildVinculos();

  await carregarFicha();
  await carregarNotas();
  subscribeToSala();
  buildTensaoPips('tensao-pips-sala', tensaoSala, false);
  if (isMaster) document.getElementById('tensao-master-btns').style.display = '';
}

// ── NAVIGATION ────────────────────────────────────
function navigate(page) {
  ['ficha','sala','notas','master'].forEach(p => {
    document.getElementById('page-' + p).style.display = p === page ? 'block' : 'none';
    const nav = document.getElementById('nav-' + p);
    if (nav) nav.classList.toggle('active', p === page);
  });
  if (page === 'master') carregarPlayers();
  if (page === 'sala') { setTimeout(() => scrollFeedToBottom(), 100); }
}

// ── TOAST ─────────────────────────────────────────
function toast(msg, tipo = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// ── LOGOUT ────────────────────────────────────────
async function logout() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

// ══════════════════════════════════════════════════
//  FICHA
// ══════════════════════════════════════════════════

const ATTRS = [
  { abbr: 'FOR', name: 'Força',        id: 'for' },
  { abbr: 'RES', name: 'Resistência',  id: 'res' },
  { abbr: 'COM', name: 'Combate',      id: 'com' },
  { abbr: 'SOC', name: 'Social',       id: 'soc' },
  { abbr: 'CON', name: 'Conhecimento', id: 'con' },
  { abbr: 'AGI', name: 'Agilidade',    id: 'agi' },
];

function buildAttrGrid() {
  const grid = document.getElementById('attr-grid');
  grid.innerHTML = '';
  ATTRS.forEach(a => {
    const card = document.createElement('div');
    card.className = 'attr-card';
    card.innerHTML = `
      <div class="attr-abbr">${a.abbr}</div>
      <div class="attr-name">${a.name}</div>
      <div class="attr-inputs">
        <input type="number" min="1" max="5" placeholder="0" class="attr-val"
          id="a-${a.id}" oninput="onAttrInput('${a.id}')">
        <input type="text" class="attr-mod" id="m-${a.id}" readonly placeholder="±0">
      </div>
      <div class="attr-sub"><span>VALOR</span><span>MOD</span></div>
    `;
    grid.appendChild(card);
  });
}

function calcMod(v) {
  const m = (parseInt(v) || 0) - 3;
  return (m >= 0 ? '+' : '') + m;
}

function onAttrInput(id) {
  const val = document.getElementById('a-' + id).value;
  document.getElementById('m-' + id).value = calcMod(val);
  if (id === 'res') {
    pvMax = Math.max((parseInt(val) || 0) * 4, 4);
    document.getElementById('pv-formula').textContent = `RES (${val || 0}) × 4 = máx ${pvMax}`;
    buildPips('pip-pv', pvMax, pvAtual, 'red', onPVClick, 'pip-pv-val');
  }
  autoSave();
}

// ── PIPS ─────────────────────────────────────────
function buildPips(containerId, total, active, color, onClick, valId) {
  const c = document.getElementById(containerId);
  c.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const pip = document.createElement('div');
    pip.className = `pip ${color}` + (i < active ? ' on' : '');
    pip.addEventListener('click', () => onClick(i, containerId, total, valId));
    c.appendChild(pip);
  }
  if (valId) document.getElementById(valId).textContent = `${active}/${total}`;
}

function onPVClick(i, cid, total, valId) {
  const pips = document.querySelectorAll(`#${cid} .pip`);
  const cur = [...pips].filter(p => p.classList.contains('on')).length;
  pvAtual = (i + 1 === cur) ? i : i + 1;
  pips.forEach((p, j) => p.classList.toggle('on', j < pvAtual));
  document.getElementById(valId).textContent = `${pvAtual}/${total}`;
  autoSave();
}

function onSupClick(i, cid, total, valId) {
  const pips = document.querySelectorAll(`#${cid} .pip`);
  const cur = [...pips].filter(p => p.classList.contains('on')).length;
  supAtual = (i + 1 === cur) ? i : i + 1;
  pips.forEach((p, j) => p.classList.toggle('on', j < supAtual));
  document.getElementById(valId).textContent = `${supAtual}/${total}`;
  autoSave();
}

function onHumClick(i, cid, total, valId) {
  const pips = document.querySelectorAll(`#${cid} .pip`);
  const cur = [...pips].filter(p => p.classList.contains('on')).length;
  humAtual = (i + 1 === cur) ? i : i + 1;
  pips.forEach((p, j) => p.classList.toggle('on', j < humAtual));
  document.getElementById(valId).textContent = `${humAtual}/${total}`;
  autoSave();
}

// ── TENSÃO PIPS ──────────────────────────────────
function buildTensaoPips(containerId, active, forFicha) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  TENSAO_TYPES.forEach((t, i) => {
    const pip = document.createElement('div');
    pip.className = `tpip ${t.toLowerCase()}` + (i < active ? ' on' : '');
    pip.textContent = t;
    pip.addEventListener('click', () => {
      if (containerId === 'tensao-pips-ficha') {
        tensaoFicha = (i < tensaoFicha) ? i : i + 1;
        buildTensaoPips('tensao-pips-ficha', tensaoFicha, true);
        autoSave();
      } else if (isMaster) {
        alterarTensao(i + 1 > tensaoSala ? 1 : -1);
      }
    });
    c.appendChild(pip);
  });
  if (containerId === 'tensao-pips-sala') updateTensaoStatus();
}

function updateTensaoStatus() {
  const el = document.getElementById('tensao-status-text');
  const tip = document.getElementById('tensao-tip');
  if (!el) return;
  const t = tensaoSala;
  if (t <= 3) {
    el.textContent = `CALMA (${t}/10)`; el.className = 'tensao-status calma';
    if (tip) tip.textContent = 'Testes normais. Descanso permitido.';
  } else if (t <= 6) {
    el.textContent = `ALERTA (${t}/10)`; el.className = 'tensao-status alerta';
    if (tip) tip.textContent = '−1 Agilidade. NPCs na defensiva.';
  } else if (t <= 8) {
    el.textContent = `PERIGO (${t}/10)`; el.className = 'tensao-status perigo';
    if (tip) tip.textContent = 'Cada teste custa +1 Suprimento.';
  } else {
    el.textContent = `TERROR (${t}/10)`; el.className = 'tensao-status terror';
    if (tip) tip.textContent = 'Falhas causam Trauma permanente!';
  }
}

// ── PERÍCIAS ─────────────────────────────────────
const PERICIAS_DEFAULT = [
  'Perícia 1 (Profissão)', 'Perícia 2 (Profissão)', 'Perícia 3 (Profissão)',
  'Perícia 4 (Extra)', 'Perícia 5 (Extra)'
];

function buildPericias() {
  const list = document.getElementById('pericias-list');
  list.innerHTML = '';
  PERICIAS_DEFAULT.forEach((tag, i) => {
    const div = document.createElement('div');
    div.className = 'pericia-card';
    div.innerHTML = `
      <div style="flex:1">
        <div class="pericia-tag">${tag}</div>
        <input type="text" class="pericia-nome-input" id="p-nome-${i}" placeholder="Nome da perícia..." oninput="autoSave()">
      </div>
      <div style="display:flex;flex-direction:column;gap:3px;align-items:center">
        <span style="font-size:7px;color:var(--muted);letter-spacing:1px">ATRIB</span>
        <input type="text" class="pericia-atrib-input" id="p-atrib-${i}" placeholder="FOR" maxlength="3"
          oninput="this.value=this.value.toUpperCase();autoSave()">
      </div>
    `;
    list.appendChild(div);
  });
}

// ── VÍNCULOS ─────────────────────────────────────
function buildVinculos() {
  const list = document.getElementById('vinculos-list');
  list.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const card = document.createElement('div');
    card.className = 'vinculo-card';
    card.innerHTML = `
      <div class="vinculo-header">
        <div class="vinculo-num">${i+1}</div>
        <div class="field" style="flex:1">
          <label>Personagem</label>
          <input type="text" id="v-per-${i}" placeholder="Nome do aliado..." oninput="autoSave()">
        </div>
      </div>
      <div class="vinculo-grid">
        <div class="field">
          <label>Promessa</label>
          <input type="text" id="v-pro-${i}" placeholder="O que você prometeu..." oninput="autoSave()">
        </div>
        <div class="field">
          <label>Dívida</label>
          <input type="text" id="v-div-${i}" placeholder="O que você deve..." oninput="autoSave()">
        </div>
        <div class="field">
          <label>Tipo</label>
          <select id="v-tip-${i}" onchange="autoSave()">
            <option value="">Selecionar...</option>
            <option>Proteção</option>
            <option>Culpa</option>
            <option>Amor</option>
            <option>Respeito</option>
            <option>Desconfiança</option>
            <option>Gratidão</option>
          </select>
        </div>
      </div>
    `;
    list.appendChild(card);
  }
}

// ── SAVE / LOAD FICHA ─────────────────────────────
function coletarFicha() {
  const pericias = PERICIAS_DEFAULT.map((_, i) => ({
    nome: document.getElementById(`p-nome-${i}`)?.value || '',
    atrib: document.getElementById(`p-atrib-${i}`)?.value || ''
  }));
  const vinculos = Array.from({length:4}, (_,i) => ({
    personagem: document.getElementById(`v-per-${i}`)?.value || '',
    promessa:   document.getElementById(`v-pro-${i}`)?.value || '',
    divida:     document.getElementById(`v-div-${i}`)?.value || '',
    tipo:       document.getElementById(`v-tip-${i}`)?.value || ''
  }));

  return {
    user_id: currentUser.id,
    nome:       document.getElementById('f-nome')?.value || '',
    jogador:    document.getElementById('f-jogador')?.value || '',
    profissao:  document.getElementById('f-profissao')?.value || '',
    trauma:     document.getElementById('f-trauma')?.value || '',
    attr_for:   parseInt(document.getElementById('a-for')?.value) || 0,
    attr_res:   parseInt(document.getElementById('a-res')?.value) || 0,
    attr_com:   parseInt(document.getElementById('a-com')?.value) || 0,
    attr_soc:   parseInt(document.getElementById('a-soc')?.value) || 0,
    attr_con:   parseInt(document.getElementById('a-con')?.value) || 0,
    attr_agi:   parseInt(document.getElementById('a-agi')?.value) || 0,
    pv_atual:   pvAtual,
    suprimentos: supAtual,
    humanidade: humAtual,
    tensao:     tensaoFicha,
    veiculo_tipo:     document.getElementById('f-veiculo-tipo')?.value || '',
    veiculo_ti_atual: parseInt(document.getElementById('f-vti-a')?.value) || 0,
    veiculo_ti_max:   parseInt(document.getElementById('f-vti-m')?.value) || 0,
    veiculo_comb_atual: parseInt(document.getElementById('f-vcomb-a')?.value) || 0,
    veiculo_comb_max:   parseInt(document.getElementById('f-vcomb-m')?.value) || 0,
    pericias,
    vinculos,
    inventario: document.getElementById('f-inventario')?.value || '',
    notas:      document.getElementById('f-notas')?.value || '',
    updated_at: new Date().toISOString()
  };
}

function aplicarFicha(d) {
  if (!d) return;
  document.getElementById('f-nome').value      = d.nome || '';
  document.getElementById('f-jogador').value   = d.jogador || '';
  document.getElementById('f-profissao').value = d.profissao || '';
  document.getElementById('f-trauma').value    = d.trauma || '';
  document.getElementById('f-inventario').value = d.inventario || '';
  document.getElementById('f-notas').value     = d.notas || '';
  document.getElementById('f-veiculo-tipo').value = d.veiculo_tipo || '';
  document.getElementById('f-vti-a').value  = d.veiculo_ti_atual || 0;
  document.getElementById('f-vti-m').value  = d.veiculo_ti_max || 0;
  document.getElementById('f-vcomb-a').value = d.veiculo_comb_atual || 0;
  document.getElementById('f-vcomb-m').value = d.veiculo_comb_max || 0;

  ATTRS.forEach(a => {
    const val = d[`attr_${a.id}`] || 0;
    document.getElementById(`a-${a.id}`).value = val;
    document.getElementById(`m-${a.id}`).value = calcMod(val);
  });

  pvAtual = d.pv_atual || 0;
  pvMax   = Math.max((d.attr_res || 0) * 4, 4);
  supAtual = d.suprimentos || 0;
  humAtual = d.humanidade ?? 10;
  tensaoFicha = d.tensao || 0;

  document.getElementById('pv-formula').textContent = `RES (${d.attr_res || 0}) × 4 = máx ${pvMax}`;
  buildPips('pip-pv',  pvMax, pvAtual,  'red',   onPVClick,  'pip-pv-val');
  buildPips('pip-sup', 10,    supAtual, 'blue',  onSupClick, 'pip-sup-val');
  buildPips('pip-hum', 10,    humAtual, 'green', onHumClick, 'pip-hum-val');
  buildTensaoPips('tensao-pips-ficha', tensaoFicha, true);

  if (Array.isArray(d.pericias)) {
    d.pericias.forEach((p, i) => {
      const n = document.getElementById(`p-nome-${i}`);
      const a = document.getElementById(`p-atrib-${i}`);
      if (n) n.value = p.nome || '';
      if (a) a.value = p.atrib || '';
    });
  }
  if (Array.isArray(d.vinculos)) {
    d.vinculos.forEach((v, i) => {
      const per = document.getElementById(`v-per-${i}`);
      const pro = document.getElementById(`v-pro-${i}`);
      const div = document.getElementById(`v-div-${i}`);
      const tip = document.getElementById(`v-tip-${i}`);
      if (per) per.value = v.personagem || '';
      if (pro) pro.value = v.promessa || '';
      if (div) div.value = v.divida || '';
      if (tip) tip.value = v.tipo || '';
    });
  }
}

async function carregarFicha() {
  const { data } = await db
    .from('fichas')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  if (data) {
    fichaId = data.id;
    aplicarFicha(data);
  }
}

let saveTimer = null;
function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => salvarFicha(true), 1500);
}

async function salvarFicha(silencioso = false) {
  const dados = coletarFicha();
  let error;

  if (fichaId) {
    ({ error } = await db.from('fichas').update(dados).eq('id', fichaId));
  } else {
    const { data, error: e } = await db.from('fichas').insert(dados).select().single();
    error = e;
    if (data) fichaId = data.id;
  }

  if (!silencioso) {
    if (error) toast('Erro ao salvar!', 'err');
    else toast('Ficha salva!', 'ok');
  }
}

// ══════════════════════════════════════════════════
//  SALA DE JOGO
// ══════════════════════════════════════════════════

function subscribeToSala() {
  // Carrega histórico
  carregarFeed();

  // Carrega tensão atual
  carregarTensaoSala();

  // Subscribe realtime
  realtimeSub = db
    .channel('sala-publica')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sala' }, payload => {
      const msg = payload.new;
      if (msg.tipo === 'tensao') {
        tensaoSala = msg.conteudo.valor;
        buildTensaoPips('tensao-pips-sala', tensaoSala, false);
      }
      appendFeedMsg(msg);
    })
    .subscribe();
}

async function carregarFeed() {
  const { data } = await db
    .from('sala')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50);

  const feed = document.getElementById('feed-messages');
  feed.innerHTML = '';
  if (!data || data.length === 0) {
    feed.innerHTML = '<div class="empty-state"><div class="empty-icon">🎲</div><p>Role um dado para começar.</p></div>';
    return;
  }
  data.forEach(msg => appendFeedMsg(msg));
  scrollFeedToBottom();
}

async function carregarTensaoSala() {
  const { data } = await db
    .from('sala')
    .select('conteudo')
    .eq('tipo', 'tensao')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (data) {
    tensaoSala = data.conteudo.valor || 0;
    buildTensaoPips('tensao-pips-sala', tensaoSala, false);
  }
}

function appendFeedMsg(msg) {
  const feed = document.getElementById('feed-messages');
  const emptyState = feed.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const div = document.createElement('div');
  const hora = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (msg.tipo === 'roll') {
    const c = msg.conteudo;
    const isCrit = c.dado === 20 && c.resultado_dado === 20;
    const isFalha = c.dado === 20 && c.resultado_dado === 1;
    div.className = 'feed-msg roll' + (isCrit ? ' critico' : '') + (isFalha ? ' falha-critica' : '');
    div.innerHTML = `
      <div class="feed-msg-header">
        <span class="feed-msg-user">${msg.username}</span>
        <span class="feed-msg-time">${hora}</span>
      </div>
      <div class="feed-msg-content">
        <span class="roll-total">${c.total}</span>
        ${c.dif ? `<span style="font-size:12px;color:${c.total >= c.dif ? 'var(--green)' : 'var(--red)'}"> — ${c.total >= c.dif ? '✓ SUCESSO' : '✗ FALHA'} (dif. ${c.dif})</span>` : ''}
        ${isCrit ? ' <span style="color:var(--gold)">⭐ CRÍTICO!</span>' : ''}
        ${isFalha ? ' <span style="color:var(--red)">💀 FALHA CRÍTICA!</span>' : ''}
      </div>
      <div class="roll-detail">
        rolou 1d${c.dado} → ${c.resultado_dado}
        ${c.bonus ? ` + bônus ${c.bonus}` : ''}
        ${c.label ? ` — ${c.label}` : ''}
      </div>
    `;
  } else if (msg.tipo === 'tensao') {
    div.className = 'feed-msg tensao-msg';
    div.innerHTML = `
      <div class="feed-msg-header">
        <span class="feed-msg-user">⚠ MESTRE</span>
        <span class="feed-msg-time">${hora}</span>
      </div>
      <div class="feed-msg-content">Tensão: ${msg.conteudo.valor}/10 — ${msg.conteudo.status}</div>
    `;
  } else {
    div.className = 'feed-msg';
    div.innerHTML = `
      <div class="feed-msg-header">
        <span class="feed-msg-user">${msg.username}</span>
        <span class="feed-msg-time">${hora}</span>
      </div>
      <div class="feed-msg-content">${msg.conteudo.texto || ''}</div>
    `;
  }

  feed.appendChild(div);
  scrollFeedToBottom();
}

function scrollFeedToBottom() {
  const feed = document.getElementById('feed-messages');
  if (feed) feed.scrollTop = feed.scrollHeight;
}

async function publicarSala(tipo, conteudo) {
  await db.from('sala').insert({
    user_id: currentUser.id,
    username: currentProfile.username,
    tipo,
    conteudo
  });
}

// ── DADOS ─────────────────────────────────────────
function rolarDado(faces, qtd = 1) {
  let total = 0;
  const resultados = [];
  for (let i = 0; i < qtd; i++) {
    const r = Math.floor(Math.random() * faces) + 1;
    resultados.push(r);
    total += r;
  }
  publicarSala('roll', {
    dado: faces,
    qtd,
    resultado_dado: resultados[0],
    total,
    label: qtd > 1 ? `${qtd}d${faces}: [${resultados.join(', ')}]` : `1d${faces}`
  });
}

function rolarFormula() {
  const modAtrib  = parseInt(document.getElementById('roll-atrib').value) || 0;
  const modPer    = parseInt(document.getElementById('roll-pericia').value) || 0;
  const modSit    = parseInt(document.getElementById('roll-situacao').value) || 0;
  const dif       = parseInt(document.getElementById('roll-dif').value) || 11;

  const dado = Math.floor(Math.random() * 20) + 1;
  const bonus = modAtrib + modPer + modSit;
  const total = dado + bonus;

  const atribText = document.getElementById('roll-atrib').selectedOptions[0]?.text || '';
  const perText   = document.getElementById('roll-pericia').selectedOptions[0]?.text || '';
  const sitText   = document.getElementById('roll-situacao').selectedOptions[0]?.text || '';

  publicarSala('roll', {
    dado: 20,
    resultado_dado: dado,
    bonus,
    total,
    dif,
    label: [atribText, perText !== 'Sem perícia (+0)' ? perText : '', sitText !== 'Normal' ? sitText : ''].filter(Boolean).join(' | ')
  });
}

async function enviarMsg() {
  const input = document.getElementById('msg-input');
  const texto = input.value.trim();
  if (!texto) return;
  input.value = '';
  await publicarSala('mensagem', { texto });
}

// ── TENSÃO ────────────────────────────────────────
async function alterarTensao(delta) {
  if (!isMaster) return;
  tensaoSala = Math.max(0, Math.min(10, tensaoSala + delta));

  const statuses = ['','CALMA','CALMA','CALMA','ALERTA','ALERTA','ALERTA','PERIGO','PERIGO','TERROR','TERROR'];
  const status = statuses[tensaoSala] || 'CALMA';

  buildTensaoPips('tensao-pips-sala', tensaoSala, false);
  await publicarSala('tensao', { valor: tensaoSala, status });
}

// ══════════════════════════════════════════════════
//  NOTAS DE SESSÃO
// ══════════════════════════════════════════════════

let notas = [];

async function carregarNotas() {
  const { data } = await db
    .from('notas_sessao')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('sessao', { ascending: false });

  notas = data || [];
  renderListaNotas();
}

function renderListaNotas() {
  const lista = document.getElementById('notas-lista');
  lista.innerHTML = '';
  if (notas.length === 0) {
    lista.innerHTML = '<div style="padding:16px;font-size:12px;color:var(--muted);text-align:center">Nenhuma nota ainda.<br>Clique em + para criar.</div>';
    return;
  }
  notas.forEach(n => {
    const div = document.createElement('div');
    div.className = 'nota-item' + (notaAtual?.id === n.id ? ' active' : '');
    div.innerHTML = `
      <div class="nota-item-title">${n.titulo || 'Sem título'}</div>
      <div class="nota-item-sessao">Sessão #${n.sessao || 1}</div>
    `;
    div.onclick = () => abrirNota(n);
    lista.appendChild(div);
  });
}

function abrirNota(n) {
  notaAtual = n;
  notaEditada = false;
  document.getElementById('nota-titulo').value = n.titulo || '';
  document.getElementById('nota-sessao').value = n.sessao || 1;
  document.getElementById('nota-corpo').value  = n.conteudo || '';
  renderListaNotas();
}

function novaNota() {
  notaAtual = { id: null, sessao: (notas[0]?.sessao || 0) + 1, titulo: '', conteudo: '' };
  document.getElementById('nota-titulo').value = '';
  document.getElementById('nota-sessao').value = notaAtual.sessao;
  document.getElementById('nota-corpo').value  = '';
  notaEditada = false;
}

async function salvarNota() {
  const titulo   = document.getElementById('nota-titulo').value.trim();
  const sessao   = parseInt(document.getElementById('nota-sessao').value) || 1;
  const conteudo = document.getElementById('nota-corpo').value;

  const payload = { user_id: currentUser.id, titulo, sessao, conteudo };
  let error;

  if (notaAtual?.id) {
    ({ error } = await db.from('notas_sessao').update(payload).eq('id', notaAtual.id));
  } else {
    const { data, error: e } = await db.from('notas_sessao').insert(payload).select().single();
    error = e;
    if (data) notaAtual = data;
  }

  if (error) { toast('Erro ao salvar nota!', 'err'); return; }
  toast('Nota salva!', 'ok');
  notaEditada = false;
  await carregarNotas();
}

async function deletarNota() {
  if (!notaAtual?.id) return;
  if (!confirm('Excluir esta nota?')) return;
  await db.from('notas_sessao').delete().eq('id', notaAtual.id);
  notaAtual = null;
  document.getElementById('nota-titulo').value = '';
  document.getElementById('nota-corpo').value = '';
  await carregarNotas();
  toast('Nota excluída.', 'ok');
}

// ══════════════════════════════════════════════════
//  PAINEL DO MESTRE
// ══════════════════════════════════════════════════

async function carregarPlayers() {
  const grid = document.getElementById('players-grid');
  grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Carregando...</p></div>';

  const { data: profiles } = await db
    .from('profiles')
    .select('id, username, is_master')
    .eq('is_master', false);

  if (!profiles || profiles.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>Nenhum player cadastrado ainda.</p></div>';
    return;
  }

  const ids = profiles.map(p => p.id);
  const { data: fichas } = await db
    .from('fichas')
    .select('*')
    .in('user_id', ids);

  grid.innerHTML = '';
  profiles.forEach(player => {
    const ficha = fichas?.find(f => f.user_id === player.id);
    const card = document.createElement('div');
    card.className = 'player-card';

    const pvMax = Math.max((ficha?.attr_res || 0) * 4, 4);
    const pct = ficha ? Math.round((ficha.pv_atual / pvMax) * 100) : 0;
    const pvColor = pct > 50 ? 'var(--green)' : pct > 25 ? 'var(--gold)' : 'var(--red)';

    card.innerHTML = `
      <div class="player-card-header">
        <div>
          <div class="player-card-name">${ficha?.nome || player.username}</div>
          <div class="player-card-prof">${ficha?.profissao || 'Profissão não definida'} · ${player.username}</div>
        </div>
      </div>
      ${ficha ? `
      <div class="player-stat-row">
        <div class="player-stat">
          <div class="player-stat-label">PV</div>
          <div class="player-stat-val pv" style="color:${pvColor}">${ficha.pv_atual}/${pvMax}</div>
        </div>
        <div class="player-stat">
          <div class="player-stat-label">Humanidade</div>
          <div class="player-stat-val hum">${ficha.humanidade}/10</div>
        </div>
        <div class="player-stat">
          <div class="player-stat-label">Suprimentos</div>
          <div class="player-stat-val sup">${ficha.suprimentos}/10</div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px">
        ${['FOR','RES','COM','SOC','CON','AGI'].map((a,i) => {
          const keys = ['attr_for','attr_res','attr_com','attr_soc','attr_con','attr_agi'];
          return `${a}:${ficha[keys[i]]||0}`;
        }).join(' · ')}
      </div>
      <div style="margin-top:8px;font-size:10px;color:var(--muted)">
        <strong style="color:var(--text)">Trauma:</strong> ${ficha.trauma || '—'}
      </div>
      ` : `<div style="font-size:12px;color:var(--muted);padding:8px 0">Ficha não criada ainda.</div>`}
    `;
    grid.appendChild(card);
  });
}

// ── START ─────────────────────────────────────────
init();
