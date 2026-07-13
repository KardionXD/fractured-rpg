// ── SEGURANÇA: escapa HTML de dados vindos de usuários ──
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

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

  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (!profile) {
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
  } else {
    currentProfile = profile;
  }

  document.getElementById('topbar-username').textContent = currentProfile.username;

  // ── MESAS: escolhe/cria a mesa ANTES de carregar o resto ──
  // isMaster agora é por mesa (definido em _mesaAtivar via mesas.js)
  await mesaEscolher();

  buildAttrGrid();
  buildPips('pip-pv', pvMax, pvAtual, 'red', onPVClick, 'pip-pv-val');
  buildPips('pip-sup', 10, supAtual, 'blue', onSupClick, 'pip-sup-val');
  buildPips('pip-hum', 10, humAtual, 'green', onHumClick, 'pip-hum-val');
  buildTensaoPips('tensao-pips-ficha', tensaoFicha, true);
  buildPericias();
  buildVinculos();

  await carregarFicha();
  await carregarNotas();
  // subscribeToSala called after layout mounts panels
}

// ── NAVIGATION ────────────────────────────────────
function navigate(page) {
  ['ficha','sala','notas','master','npcs'].forEach(p => {
    const el = document.getElementById('page-' + p);
    if (!el) return;
    el.style.display = p === page ? (p==='sala'?'flex':'block') : 'none';
    const nav = document.getElementById('nav-' + p);
    if (nav) nav.classList.toggle('active', p === page);
  });
  if (page === 'master') carregarPlayers();
  if (page === 'sala') setTimeout(() => scrollFeedToBottom(), 100);
  if (page === 'notas') renderListaNotas();
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
      <button class="attr-roll-btn" onclick="rolarAtributoFicha('${a.id}')" title="Rolar 1d20 + ${a.abbr}">🎲</button>
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

  // Contador de pontos gastos
  let cont = document.getElementById('attr-pontos');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'attr-pontos';
    cont.style.cssText = 'grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:7px 12px;border:1px solid var(--border);border-radius:8px;background:rgba(0,0,0,0.25);font-size:11px';
    grid.parentNode.insertBefore(cont, grid.nextSibling);
  }
  atualizarContadorPontos();
}

function atualizarContadorPontos() {
  const cont = document.getElementById('attr-pontos');
  if (!cont) return;
  let gasto = 0;
  ATTRS.forEach(a => { gasto += parseInt(document.getElementById('a-' + a.id)?.value) || 0; });
  cont.innerHTML = `
    <span style="color:var(--muted);letter-spacing:1px">PONTOS DE ATRIBUTO</span>
    <span style="font-weight:700;color:var(--gold)">${gasto} ${gasto === 1 ? 'ponto gasto' : 'pontos gastos'}</span>`;
}

function calcMod(v) {
  const m = (parseInt(v) || 0) - 3;
  return (m >= 0 ? '+' : '') + m;
}

function onAttrInput(id) {
  const val = document.getElementById('a-' + id).value;
  document.getElementById('m-' + id).value = calcMod(val);
  atualizarContadorPontos();
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
  if (!c) return;
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
  const targets = containerId === 'tensao-pips-sala'
    ? ['tensao-pips-sala', 'tensao-pips-sala-mobile']
    : [containerId];

  targets.forEach(cid => {
    const c = document.getElementById(cid);
    if (!c) return;
    c.innerHTML = '';
    TENSAO_TYPES.forEach((t, i) => {
      const pip = document.createElement('div');
      pip.className = `tpip ${t.toLowerCase()}` + (i < active ? ' on' : '');
      pip.textContent = t;
      pip.addEventListener('click', () => {
        if (forFicha) {
          tensaoFicha = (i < tensaoFicha) ? i : i + 1;
          buildTensaoPips('tensao-pips-ficha', tensaoFicha, true);
          autoSave();
        } else if (isMaster) {
          alterarTensao(i + 1 > tensaoSala ? 1 : -1);
        }
      });
      c.appendChild(pip);
    });
  });
  if (!forFicha) updateTensaoStatus();
}

function updateTensaoStatus() {
  const t = tensaoSala;
  let label, cls, tipText;
  if (t <= 3)      { label='CALMA';  cls='calma';  tipText='Testes normais. Descanso permitido.'; }
  else if (t <= 6) { label='ALERTA'; cls='alerta'; tipText='−1 Agilidade. NPCs na defensiva.'; }
  else if (t <= 8) { label='PERIGO'; cls='perigo'; tipText='Cada teste custa +1 Suprimento.'; }
  else             { label='TERROR'; cls='terror'; tipText='Falhas causam Trauma permanente!'; }

  const text = `${label} (${t}/10)`;
  ['tensao-status-text','tensao-status-mobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = text; el.className = `tensao-status ${cls}`; }
  });
  const tip = document.getElementById('tensao-tip');
  if (tip) tip.textContent = tipText;
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
      <button class="pericia-roll-btn" onclick="rolarPericiaFicha(${i})" title="Rolar 1d20 + atributo + 3 (perícia)">🎲</button>
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
    veiculo_tipo:       document.getElementById('f-veiculo-tipo')?.value || '',
    veiculo_ti_atual:   parseInt(document.getElementById('f-vti-a')?.value) || 0,
    veiculo_ti_max:     parseInt(document.getElementById('f-vti-m')?.value) || 0,
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
  document.getElementById('f-nome').value       = d.nome || '';
  document.getElementById('f-jogador').value    = d.jogador || '';
  document.getElementById('f-profissao').value  = d.profissao || '';
  document.getElementById('f-trauma').value     = d.trauma || '';
  document.getElementById('f-inventario').value = d.inventario || '';
  document.getElementById('f-notas').value      = d.notas || '';
  if (d.foto_url) aplicarFotoPersonagem(d.foto_url);
  document.getElementById('f-veiculo-tipo').value = d.veiculo_tipo || '';
  document.getElementById('f-vti-a').value    = d.veiculo_ti_atual || 0;
  document.getElementById('f-vti-m').value    = d.veiculo_ti_max || 0;
  document.getElementById('f-vcomb-a').value  = d.veiculo_comb_atual || 0;
  document.getElementById('f-vcomb-m').value  = d.veiculo_comb_max || 0;

  ATTRS.forEach(a => {
    const val = d[`attr_${a.id}`] || 0;
    document.getElementById(`a-${a.id}`).value = val;
    document.getElementById(`m-${a.id}`).value = calcMod(val);
  });
  atualizarContadorPontos();

  pvAtual  = d.pv_atual || 0;
  pvMax    = Math.max((d.attr_res || 0) * 4, 4);
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
    .eq('mesa_id', mesaId())
    .maybeSingle();

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
  dados.mesa_id = mesaId();
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

async function apagarFicha() {
  if (!fichaId) return toast('Nenhuma ficha para apagar.', 'err');
  if (!confirm('Apagar a ficha inteira? Isso não pode ser desfeito.')) return;

  const { error } = await db.from('fichas').delete().eq('id', fichaId);
  if (error) return toast('Erro ao apagar ficha!', 'err');

  fichaId = null;
  pvAtual = 0; supAtual = 0; humAtual = 10; tensaoFicha = 0; pvMax = 20;

  document.querySelectorAll('#page-ficha input, #page-ficha textarea').forEach(el => el.value = '');
  document.getElementById('f-profissao').value = '';
  document.getElementById('f-veiculo-tipo').value = '';

  buildPips('pip-pv', 20, 0, 'red', onPVClick, 'pip-pv-val');
  buildPips('pip-sup', 10, 0, 'blue', onSupClick, 'pip-sup-val');
  buildPips('pip-hum', 10, 10, 'green', onHumClick, 'pip-hum-val');
  buildTensaoPips('tensao-pips-ficha', 0, true);
  document.getElementById('pv-formula').textContent = 'RES × 4 = máx 20';

  toast('Ficha apagada.', 'ok');
}

// ══════════════════════════════════════════════════
//  SALA DE JOGO
// ══════════════════════════════════════════════════

let _salaSubAtiva = false;

async function subscribeToSala() {
  carregarFeed();
  carregarTensaoSala();

  if (_salaSubAtiva) return;
  _salaSubAtiva = true;

  realtimeSub = db
    .channel('sala-publica-' + mesaId())
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sala', filter: 'mesa_id=eq.' + mesaId() }, payload => {
      const msg = payload.new;
      if (msg.tipo === 'tensao') {
        tensaoSala = msg.conteudo.valor;
        buildTensaoPips('tensao-pips-sala', tensaoSala, false);
      }
      // Vídeo/GIF no mapa - carrega para players
      if (msg.tipo === 'video_mapa' && !isMaster) {
        if (typeof mapaCarregarVideo === 'function') {
          mapaCarregarVideo(msg.conteudo.url);
        }
      }
      // Para o vídeo se mensagem de limpar
      if (msg.tipo === 'video_mapa_stop' && !isMaster) {
        if (typeof mapaStopVideo === 'function') mapaStopVideo();
      }
      if (_ehEcoLocal(msg)) return; // já renderizada na hora do envio
      appendFeedMsg(msg);
    })
    .subscribe(status => {
      // ═══ FIX 2: reconexão automática ═══
      // No celular, bloquear a tela ou trocar de app derruba o canal;
      // sem isso o feed congelava até dar F5.
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        _salaSubAtiva = false;
        try { db.removeChannel(realtimeSub); } catch(e) {}
        setTimeout(() => { if (!_salaSubAtiva) subscribeToSala(); }, 1500);
      }
    });
}

// Ao voltar pro app (celular destravado / aba reaberta): ressincroniza
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && typeof mesaId === 'function' && mesaId()) {
    carregarFeed();
    carregarTensaoSala();
    if (!_salaSubAtiva) subscribeToSala();
  }
});

async function carregarFeed() {
  // Busca as 80 mensagens MAIS RECENTES e inverte para exibir em ordem cronológica.
  // (Antes buscava ascending+limit, que retornava as 80 mais ANTIGAS — após 80
  //  mensagens na tabela, o feed nunca mostrava as novas ao recarregar a página.)
  const { data: raw } = await db
    .from('sala')
    .select('*')
    .eq('mesa_id', mesaId())
    .order('created_at', { ascending: false })
    .limit(80);
  const data = raw ? raw.reverse() : raw;

  const feed = document.getElementById('feed-messages');
  if (!feed) return;
  feed.innerHTML = '';
  if (!data || data.length === 0) {
    feed.innerHTML = '<div class="empty-state"><div class="empty-icon">🎲</div><p>Role um dado para começar.</p></div>';
    return;
  }
  data.forEach(msg => appendFeedMsg(msg));
  scrollFeedToBottom();
}

async function carregarTensaoSala() {
  try {
    const { data } = await db
      .from('sala')
      .select('conteudo')
      .eq('mesa_id', mesaId())
      .eq('tipo', 'tensao')
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      tensaoSala = data[0].conteudo?.valor || 0;
      buildTensaoPips('tensao-pips-sala', tensaoSala, false);
    }
  } catch(e) {}
}

function scrollFeedToBottom() {
  const feed = document.getElementById('feed-messages');
  if (feed) feed.scrollTop = feed.scrollHeight;
}

// Fila de mensagens locais aguardando o eco do realtime (dedupe)
const _ecoPendente = [];

async function publicarSala(tipo, conteudo) {
  // Append otimista: rolagem/mensagem aparece NA HORA pra quem enviou,
  // sem esperar a viagem servidor→realtime→volta (lenta no 4G).
  if (tipo === 'roll' || tipo === 'mensagem') {
    const msgLocal = {
      user_id: currentUser.id,
      username: currentProfile.username,
      tipo, conteudo,
      created_at: new Date().toISOString(),
    };
    _ecoPendente.push({ tipo, json: JSON.stringify(conteudo), ts: Date.now() });
    if (_ecoPendente.length > 20) _ecoPendente.shift();
    try { appendFeedMsg(msgLocal); } catch(e) {}
  }

  const { error } = await db.from('sala').insert({
    mesa_id: mesaId(),
    user_id: currentUser.id,
    username: currentProfile.username,
    tipo,
    conteudo
  });
  if (error) toast('⚠ Mensagem não enviada (conexão). Tente de novo.', 'err');
}

// O eco desta mensagem já foi renderizado localmente?
function _ehEcoLocal(msg) {
  if (msg.user_id !== currentUser.id) return false;
  if (msg.tipo !== 'roll' && msg.tipo !== 'mensagem') return false;
  const json = JSON.stringify(msg.conteudo);
  const i = _ecoPendente.findIndex(p => p.tipo === msg.tipo && p.json === json && Date.now() - p.ts < 10000);
  if (i === -1) return false;
  _ecoPendente.splice(i, 1);
  return true;
}

async function limparHistorico() {
  if (!isMaster) return toast('Só o mestre pode limpar o histórico.', 'err');
  if (!confirm('Limpar todo o histórico de rolls da sala? Não pode ser desfeito.')) return;
  const { error } = await db.from('sala').delete().eq('mesa_id', mesaId());
  if (error) return toast('Erro ao limpar histórico!', 'err');
  tensaoSala = 0;
  buildTensaoPips('tensao-pips-sala', 0, false);
  const fmsg = document.getElementById('feed-messages');
  if (fmsg) fmsg.innerHTML = '<div class="empty-state"><div class="empty-icon">🎲</div><p>Histórico limpo.</p></div>';
  toast('Histórico limpo!', 'ok');
}

// ── DADOS ─────────────────────────────────────────

// ══════════════════════════════════════════════════
//  ANIMAÇÃO DE DADO 3D
// ══════════════════════════════════════════════════
function rolagemOculta() {
  return isMaster && document.getElementById('roll-oculto')?.checked === true;
}

function mostrarAnimacaoDado(faces, resultado, isCrit, isFalha) {
  // Remove overlay anterior se existir
  document.getElementById('dado-overlay')?.remove();

  const ov = document.createElement('div');
  ov.id = 'dado-overlay';
  ov.innerHTML = `
    <div class="dado3d-wrap">
      <div class="dado3d ${faces === 20 ? 'dado3d-d20' : 'dado3d-cubo'}" id="dado3d-el">
        <span class="dado3d-num" id="dado3d-num">?</span>
      </div>
      <div class="dado3d-label">1d${faces}</div>
    </div>`;
  document.body.appendChild(ov);

  const numEl = document.getElementById('dado3d-num');
  const dadoEl = document.getElementById('dado3d-el');

  // Números girando enquanto o dado "rola"
  const ciclo = setInterval(() => {
    numEl.textContent = Math.floor(Math.random() * faces) + 1;
  }, 70);

  // Após ~1s, assenta no resultado
  setTimeout(() => {
    clearInterval(ciclo);
    numEl.textContent = resultado;
    dadoEl.classList.add('dado3d-parado');
    if (isCrit)  dadoEl.classList.add('dado3d-crit');
    if (isFalha) dadoEl.classList.add('dado3d-falha');
    // Some depois de mostrar o resultado
    setTimeout(() => { ov.classList.add('dado3d-sair'); setTimeout(() => ov.remove(), 380); }, 1100);
  }, 1000);

  // Clique fecha na hora
  ov.addEventListener('click', () => ov.remove());
}

function rolarDado(faces, qtd = 1) {
  let total = 0;
  const resultados = [];
  for (let i = 0; i < qtd; i++) {
    const r = Math.floor(Math.random() * faces) + 1;
    resultados.push(r);
    total += r;
  }
  const isCrit  = faces === 20 && qtd === 1 && resultados[0] === 20;
  const isFalha = faces === 20 && qtd === 1 && resultados[0] === 1;
  mostrarAnimacaoDado(faces, qtd > 1 ? total : resultados[0], isCrit, isFalha);
  publicarSala('roll', {
    dado: faces,
    qtd,
    resultado_dado: resultados[0],
    total,
    oculto: rolagemOculta(),
    label: qtd > 1 ? `${qtd}d${faces}: [${resultados.join(', ')}]` : `1d${faces}`
  });
}


// ══════════════════════════════════════════════════
//  ROLAGEM DIRETO DA FICHA
// ══════════════════════════════════════════════════
function rolarAtributoFicha(id) {
  const attr = ATTRS.find(x => x.id === id);
  const mod  = parseInt(document.getElementById('m-' + id)?.value) || 0;
  const dado = Math.floor(Math.random() * 20) + 1;
  const total = dado + mod;
  mostrarAnimacaoDado(20, dado, dado === 20, dado === 1);
  publicarSala('roll', {
    dado: 20, resultado_dado: dado, bonus: mod, total,
    oculto: rolagemOculta(),
    label: `${attr.abbr} — ${attr.name} (${mod >= 0 ? '+' : ''}${mod})`
  });
}

function rolarPericiaFicha(i) {
  const nome  = document.getElementById('p-nome-' + i)?.value.trim();
  const atrib = (document.getElementById('p-atrib-' + i)?.value || '').trim().toUpperCase();
  if (!nome) { toast('Preencha o nome da perícia primeiro.', 'err'); return; }

  const attr = ATTRS.find(x => x.abbr === atrib);
  const mod  = attr ? (parseInt(document.getElementById('m-' + attr.id)?.value) || 0) : 0;
  const PERICIA_BONUS = 3;

  const dado  = Math.floor(Math.random() * 20) + 1;
  const bonus = mod + PERICIA_BONUS;
  const total = dado + bonus;
  mostrarAnimacaoDado(20, dado, dado === 20, dado === 1);
  publicarSala('roll', {
    dado: 20, resultado_dado: dado, bonus, total,
    oculto: rolagemOculta(),
    label: `${nome}${attr ? ` · ${attr.abbr} ${mod >= 0 ? '+' : ''}${mod}` : ''} · perícia +${PERICIA_BONUS}`
  });
}

function rolarFormula() {
  const modAtrib  = parseInt(document.getElementById('roll-atrib')?.value)   || 0;
  const modPer    = parseInt(document.getElementById('roll-pericia')?.value)  || 0;
  const modSit    = parseInt(document.getElementById('roll-situacao')?.value) || 0;
  // Lê dificuldade — se for 'custom', usa o campo de texto
  const difSel = document.getElementById('roll-dif')?.value;
  const dif = difSel === 'custom'
    ? parseInt(document.getElementById('roll-dif-custom-val')?.value) || 11
    : parseInt(difSel) || 11;
  const modCustom = parseInt(document.getElementById('roll-bonus-custom')?.value) || 0;

  // Ajudas: cada ajudante dá +2 (máx 3 ajudantes = +6)
  const ajudas   = parseInt(document.getElementById('roll-ajudas')?.value) || 0;
  const modAjuda = Math.min(3, ajudas) * 2;

  const dado  = Math.floor(Math.random() * 20) + 1;
  const bonus = modAtrib + modPer + modSit + modAjuda + modCustom;
  const total = dado + bonus;

  const atribText  = document.getElementById('roll-atrib')?.selectedOptions[0]?.text || '';
  const perText    = document.getElementById('roll-pericia')?.selectedOptions[0]?.text || '';
  const sitText    = document.getElementById('roll-situacao')?.selectedOptions[0]?.text || '';
  const ajudaText  = ajudas > 0 ? `${ajudas} ajudante(s) (+${modAjuda})` : '';
  const customText = modCustom !== 0 ? `Bônus custom (${modCustom>0?'+':''}${modCustom})` : '';

  mostrarAnimacaoDado(20, dado, dado === 20, dado === 1);
  publicarSala('roll', {
    dado: 20,
    resultado_dado: dado,
    bonus,
    total,
    dif,
    oculto: rolagemOculta(),
    label: [atribText,
      perText !== 'Sem perícia (+0)' ? perText : '',
      sitText !== 'Normal' ? sitText : '',
      ajudaText, customText
    ].filter(Boolean).join(' · ')
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
  const statuses = ['CALMA','CALMA','CALMA','CALMA','ALERTA','ALERTA','ALERTA','PERIGO','PERIGO','TERROR','TERROR'];
  const status = statuses[tensaoSala];
  buildTensaoPips('tensao-pips-sala', tensaoSala, false);
  await publicarSala('tensao', { valor: tensaoSala, status });
}

// ══════════════════════════════════════════════════
//  NOTAS DE SESSÃO
// ══════════════════════════════════════════════════

let notas = [];

async function carregarNotas() {
  const { data, error } = await db
    .from('notas_sessao')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('mesa_id', mesaId())
    .order('sessao', { ascending: false });

  notas = data || [];
  renderListaNotas();
}

function renderListaNotas() {
  const lista = document.getElementById('notas-lista');
  if (!lista) return;
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
  const proximaSessao = notas.length > 0 ? (notas[0].sessao || 1) + 1 : 1;
  notaAtual = { id: null };
  notaEditada = false;
  document.getElementById('nota-titulo').value = '';
  document.getElementById('nota-sessao').value = proximaSessao;
  document.getElementById('nota-corpo').value  = '';
  document.getElementById('nota-titulo').focus();
}

async function salvarNota() {
  const titulo   = document.getElementById('nota-titulo').value.trim();
  const sessao   = parseInt(document.getElementById('nota-sessao').value) || 1;
  const conteudo = document.getElementById('nota-corpo').value;

  if (!titulo) return toast('Coloca um título na nota!', 'err');

  const payload = {
    mesa_id: mesaId(),
    user_id: currentUser.id,
    titulo,
    sessao,
    conteudo,
    visivel_master: true
  };

  if (notaAtual?.id) {
    const { error } = await db.from('notas_sessao').update(payload).eq('id', notaAtual.id);
    if (error) { console.error(error); return toast('Erro ao salvar: ' + error.message, 'err'); }
  } else {
    const { data, error } = await db.from('notas_sessao').insert(payload).select().single();
    if (error) { console.error(error); return toast('Erro ao criar: ' + error.message, 'err'); }
    if (data) notaAtual = data;
  }

  toast('Nota salva!', 'ok');
  notaEditada = false;
  await carregarNotas();
  if (notaAtual?.id) {
    const atualizada = notas.find(n => n.id === notaAtual.id);
    if (atualizada) abrirNota(atualizada);
  }
}

async function deletarNota() {
  if (!notaAtual?.id) return toast('Seleciona uma nota primeiro.', 'err');
  if (!confirm('Excluir esta nota?')) return;

  const { error } = await db.from('notas_sessao').delete().eq('id', notaAtual.id);
  if (error) return toast('Erro ao excluir nota!', 'err');

  notaAtual = null;
  document.getElementById('nota-titulo').value = '';
  document.getElementById('nota-sessao').value = '';
  document.getElementById('nota-corpo').value  = '';
  await carregarNotas();
  toast('Nota excluída.', 'ok');
}

// ══════════════════════════════════════════════════
//  PAINEL DO MESTRE
// ══════════════════════════════════════════════════

async function carregarPlayers(mostrarTodos = false) {
  const grid = document.getElementById('players-grid');
  grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Carregando...</p></div>';

  const { data: _membros } = await db
    .from('mesa_membros')
    .select('user_id, profiles(username)')
    .eq('mesa_id', mesaId());

  // Membros da mesa, exceto o mestre dela
  const profiles = (_membros || [])
    .filter(m => m.user_id !== MESA?.master_id)
    .map(m => ({ id: m.user_id, username: m.profiles?.username || 'Player' }));

  if (!profiles || profiles.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>Nenhum player entrou na mesa ainda.<br><span style="font-size:11px;color:var(--muted)">Mande o código de convite pra eles!</span></p></div>';
    return;
  }

  const ids = profiles.map(p => p.id);
  const { data: fichas } = await db
    .from('fichas')
    .select('*')
    .eq('mesa_id', mesaId())
    .in('user_id', ids);

  // Separa quem tem e quem não tem ficha
  const comFicha    = profiles.filter(p => fichas?.find(f => f.user_id === p.id));
  const semFicha    = profiles.filter(p => !fichas?.find(f => f.user_id === p.id));
  const visiveis    = mostrarTodos ? profiles : comFicha;

  grid.innerHTML = '';

  // Botão de toggle no topo
  const toggleRow = document.createElement('div');
  toggleRow.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px';
  toggleRow.innerHTML = `
    <span style="font-size:11px;color:var(--muted)">
      ${comFicha.length} com ficha · ${semFicha.length} sem ficha
    </span>
    <button class="btn-ghost" style="font-size:10px;padding:5px 12px" onclick="carregarPlayers(${!mostrarTodos})">
      ${mostrarTodos ? '👁 Ocultar sem ficha' : '👁 Ver todos os players'}
    </button>
  `;
  grid.appendChild(toggleRow);

  if (visiveis.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'grid-column:1/-1';
    empty.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>Nenhum player criou ficha ainda.</p></div>';
    grid.appendChild(empty);
    return;
  }

  visiveis.forEach(player => {
    const ficha = fichas?.find(f => f.user_id === player.id);
    const card = document.createElement('div');
    card.className = 'player-card';

    if (!ficha) {
      card.style.opacity = '0.5';
      card.innerHTML = `
        <div class="player-card-header">
          <div>
            <div class="player-card-name">${player.username}</div>
            <div class="player-card-prof" style="color:var(--muted)">Sem ficha criada</div>
          </div>
        </div>
      `;
    } else {
      const pvMax = Math.max((ficha.attr_res || 0) * 4, 4);
      const pct = Math.round((ficha.pv_atual / pvMax) * 100);
      const pvColor = pct > 50 ? 'var(--green)' : pct > 25 ? 'var(--gold)' : 'var(--red)';

      card.innerHTML = `
        <div class="player-card-header" style="display:flex;align-items:center;gap:10px">
          ${ficha.foto_url
            ? `<img src="${ficha.foto_url}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);flex-shrink:0">`
            : `<div style="width:44px;height:44px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🧑</div>`}
          <div style="min-width:0">
            <div class="player-card-name">${ficha.nome || player.username}</div>
            <div class="player-card-prof">${ficha.profissao || 'Profissão não definida'} · ${player.username}</div>
          </div>
        </div>
        <div style="height:6px;border-radius:3px;background:rgba(255,255,255,0.08);margin:8px 0 4px;overflow:hidden">
          <div style="height:100%;width:${Math.max(0,Math.min(100,pct))}%;background:${pvColor};border-radius:3px;transition:width .3s"></div>
        </div>
        <div class="player-stat-row">
          <div class="player-stat">
            <div class="player-stat-label">PV</div>
            <div class="player-stat-val" style="color:${pvColor}">${ficha.pv_atual}/${pvMax}</div>
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
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-ghost" style="font-size:10px;padding:5px 10px" onclick="verFichaCompleta('${player.id}')">📋 Ver ficha completa</button>
          <button class="btn-ghost" style="font-size:10px;padding:5px 10px;color:var(--red);border-color:var(--red-dim)" onclick="apagarFichaPlayer('${player.id}', '${(ficha.nome || player.username).replace(/'/g,"\\'")}')">🗑 Apagar ficha</button>
        </div>
      `;
    }
    grid.appendChild(card);
  });
}

async function apagarFichaPlayer(userId, nome) {
  if (!confirm(`Apagar a ficha de "${nome}" desta mesa? Isso não pode ser desfeito.`)) return;
  // Escopado à mesa atual — a ficha do player em OUTRAS mesas não é tocada
  const { error } = await db.from('fichas').delete().eq('user_id', userId).eq('mesa_id', mesaId());
  if (error) return toast('Erro ao apagar ficha!', 'err');
  toast(`Ficha de ${nome} apagada.`, 'ok');
  carregarPlayers();
}

async function verFichaCompleta(userId) {
  const { data: ficha } = await db.from('fichas').select('*').eq('user_id', userId).eq('mesa_id', mesaId()).maybeSingle();
  const { data: profile } = await db.from('profiles').select('username').eq('id', userId).single();
  if (!ficha) return toast('Ficha não encontrada.', 'err');

  const pvMax = Math.max((ficha.attr_res || 0) * 4, 4);
  const pericias = (ficha.pericias || []).filter(p => p.nome).map(p => `<li>${p.nome} <span style="color:var(--purple)">(${p.atrib})</span></li>`).join('');
  const vinculos = (ficha.vinculos || []).filter(v => v.personagem).map(v =>
    `<li><strong>${v.personagem}</strong> — ${v.tipo || '?'}<br>
     <span style="color:var(--muted);font-size:11px">Promessa: ${v.promessa || '—'} · Dívida: ${v.divida || '—'}</span></li>`
  ).join('');

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <div style="font-size:18px;font-weight:800">${ficha.nome || profile?.username}</div>
          <div style="font-size:11px;color:var(--muted)">${ficha.profissao || '—'} · Player: ${profile?.username}</div>
        </div>
        <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer">✕</button>
      </div>

      <div style="font-size:11px;color:var(--red);font-weight:700;letter-spacing:2px;margin-bottom:8px">TRAUMA</div>
      <div style="margin-bottom:14px;font-style:italic;color:var(--muted)">${ficha.trauma || '—'}</div>

      <div style="font-size:11px;color:var(--red);font-weight:700;letter-spacing:2px;margin-bottom:8px">ATRIBUTOS</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">
        ${['FOR','RES','COM','SOC','CON','AGI'].map((a,i) => {
          const keys = ['attr_for','attr_res','attr_com','attr_soc','attr_con','attr_agi'];
          const val = ficha[keys[i]] || 0;
          const mod = val - 3;
          return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:9px;color:var(--red);font-weight:700">${a}</div>
            <div style="font-size:20px;font-weight:700">${val}</div>
            <div style="font-size:11px;color:var(--purple)">${mod >= 0 ? '+' : ''}${mod}</div>
          </div>`;
        }).join('')}
      </div>

      <div style="font-size:11px;color:var(--red);font-weight:700;letter-spacing:2px;margin-bottom:8px">RECURSOS</div>
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <div style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center">
          <div style="font-size:9px;color:var(--muted)">PV</div>
          <div style="font-size:18px;font-weight:700;color:var(--red)">${ficha.pv_atual}/${pvMax}</div>
        </div>
        <div style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center">
          <div style="font-size:9px;color:var(--muted)">HUMANIDADE</div>
          <div style="font-size:18px;font-weight:700;color:var(--green)">${ficha.humanidade}/10</div>
        </div>
        <div style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center">
          <div style="font-size:9px;color:var(--muted)">SUPRIMENTOS</div>
          <div style="font-size:18px;font-weight:700;color:var(--blue)">${ficha.suprimentos}/10</div>
        </div>
      </div>

      ${pericias ? `<div style="font-size:11px;color:var(--red);font-weight:700;letter-spacing:2px;margin-bottom:8px">PERÍCIAS</div>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:4px;margin-bottom:14px;font-size:13px">${pericias}</ul>` : ''}

      ${vinculos ? `<div style="font-size:11px;color:var(--red);font-weight:700;letter-spacing:2px;margin-bottom:8px">VÍNCULOS</div>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:14px;font-size:13px">${vinculos}</ul>` : ''}

      ${ficha.inventario ? `<div style="font-size:11px;color:var(--red);font-weight:700;letter-spacing:2px;margin-bottom:8px">INVENTÁRIO</div>
      <div style="font-size:12px;color:var(--muted);white-space:pre-wrap;margin-bottom:14px">${ficha.inventario}</div>` : ''}
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

// ── START ─────────────────────────────────────────

// ══════════════════════════════════════════════════
//  INTEGRAÇÃO MAPA + COMBATE
// ══════════════════════════════════════════════════

function abrirMapa() {
  document.getElementById('modal-mapa').style.display = 'flex';
  setTimeout(() => {
    initMapa();
    renderMapaBestiarioQuick();
  }, 50);
}

function fecharMapa() {
  document.getElementById('modal-mapa').style.display = 'none';
}

function renderMapaBestiarioQuick() {
  const lista = document.getElementById('mapa-bestiario-quick');
  if (!lista) return;
  lista.innerHTML = '';
  TODOS_INIMIGOS.slice(0, 12).forEach(inimigo => {
    const btn = document.createElement('button');
    btn.className = 'ct-inimigo-item';
    btn.style.cssText = 'cursor:pointer;border:none;text-align:left;width:100%';
    btn.innerHTML = `<span style="font-size:16px">${inimigo.emoji}</span><span style="font-size:11px;flex:1">${inimigo.nome}</span><span style="font-size:9px;color:var(--muted)">PV${inimigo.pv}</span>`;
    btn.onclick = () => adicionarTokenMapa(inimigo);
    lista.appendChild(btn);
  });
}

// Hook no realtime para processar tokens
const _origAppend = typeof appendFeedMsg !== 'undefined' ? appendFeedMsg : null;
function appendFeedMsg(msg) {
  if (msg.tipo === 'tokens') {
    processarMsgTokens(msg);
    return;
  }
  const feed = document.getElementById('feed-messages');
  if (!feed) return;
  const emptyState = feed.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const div = document.createElement('div');
  const hora = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (msg.tipo === 'roll') {
    const c = msg.conteudo;

    // Rolagem oculta: players veem apenas o aviso misterioso
    if (c.oculto && !isMaster) {
      div.className = 'feed-msg roll roll-oculta';
      div.innerHTML = `
        <div class="feed-msg-header">
          <span class="feed-msg-user">🕶 MESTRE</span>
          <span class="feed-msg-time">${hora}</span>
        </div>
        <div class="feed-msg-content" style="color:var(--muted);font-style:italic">O mestre rolou dados ocultos...</div>`;
      feed.appendChild(div);
      scrollFeedToBottom();
      return;
    }

    const isCrit  = c.dado === 20 && c.resultado_dado === 20;
    const isFalha = c.dado === 20 && c.resultado_dado === 1;
    div.className = 'feed-msg roll' + (isCrit ? ' critico' : '') + (isFalha ? ' falha-critica' : '');
    div.innerHTML = `
      <div class="feed-msg-header">
        <span class="feed-msg-user">${esc(msg.username)}${c.oculto ? ' <span style="font-size:9px;color:var(--gold)">🕶 OCULTA</span>' : ''}</span>
        <span class="feed-msg-time">${hora}</span>
      </div>
      <div class="feed-msg-content">
        <span class="roll-total">${c.total}</span>
        ${c.dif ? `<span style="font-size:12px;color:${c.total >= c.dif ? 'var(--green)' : 'var(--red)'}"> — ${c.total >= c.dif ? '✓ SUCESSO' : '✗ FALHA'} (dif. ${c.dif})</span>` : ''}
        ${isCrit  ? ' <span style="color:var(--gold)">⭐ CRÍTICO!</span>'       : ''}
        ${isFalha ? ' <span style="color:var(--red)">💀 FALHA CRÍTICA!</span>' : ''}
      </div>
      <div class="roll-detail">
        rolou 1d${c.dado} → ${c.resultado_dado}
        ${c.bonus ? ` + bônus ${c.bonus > 0 ? '+' : ''}${c.bonus}` : ''}
        ${c.label ? ` — ${esc(c.label)}` : ''}
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
  } else if (msg.tipo === 'mensagem') {
    div.className = 'feed-msg';
    div.innerHTML = `
      <div class="feed-msg-header">
        <span class="feed-msg-user">${esc(msg.username)}</span>
        <span class="feed-msg-time">${hora}</span>
      </div>
      <div class="feed-msg-content">${esc(msg.conteudo.texto)}</div>
    `;
  } else { return; }

  feed.appendChild(div);
  scrollFeedToBottom();
}



// ══════════════════════════════════════════════════
//  INTEGRAÇÃO SALA + FOTO + NAVEGAÇÃO
// ══════════════════════════════════════════════════

// ── NAVEGAÇÃO ─────────────────────────────────────
const _navBase = navigate;
window.navigate = function(page) {
  _navBase(page);
  // Atualiza nav mobile
  document.querySelectorAll('.mobile-nav-btn, .nav-item').forEach(b => b.classList.remove('active'));
  const active = document.getElementById('mnav-'+page) || document.getElementById('nav-'+page);
  if (active) active.classList.add('active');
  if (page === 'npcs' && isMaster) { initNPCs(); }
  // Inicia sala quando necessário
  if (page === 'sala') {
    window.isMaster = isMaster;
    initSala();
  }
};

// ── FOTO DO PERSONAGEM ────────────────────────────
async function uploadFotoPersonagem(input) {
  const file = input.files[0]; if (!file) return;
  const ext  = file.name.split('.').pop();
  const path = `${currentUser.id}/personagem.${ext}`;
  const { error } = await db.storage.from('tokens').upload(path, file, { upsert: true });
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  const { data } = db.storage.from('tokens').getPublicUrl(path);
  const url = data.publicUrl;
  aplicarFotoPersonagem(url);
  if (fichaId) await db.from('fichas').update({ foto_url: url }).eq('id', fichaId);
  // Atualiza token no mapa se existir
  const t = MAP?.tokens?.find(x => x.isPC && x.userId === currentUser.id);
  if (t) {
    delete MAP.imgCache?.[t.imgUrl]; // limpa cache da imagem antiga
    t.imgUrl = url;
    if (typeof mapaDraw === 'function') mapaDraw();
    if (typeof mapaSalvarDB === 'function') mapaSalvarDB();
  }
  // Atualiza também no CT
  const ctok = combatentes?.find(x => x.isPC && x.userId === currentUser.id);
  if (ctok) { ctok.imgUrl = url; if (typeof renderCT === 'function') renderCT(); }
  toast('Foto atualizada!', 'ok');
}

function aplicarFotoPersonagem(url) {
  if (!url) return;
  const img = document.getElementById('char-foto-img');
  const ph  = document.getElementById('char-foto-placeholder');
  if (img) { img.src = url; img.style.display = 'block'; }
  if (ph)  ph.style.display = 'none';
}

// ── INIT MASTER/PLAYER UI ─────────────────────────
function initMasterUI() {
  // Show master buttons in mobile nav
  ['mnav-master', 'mnav-npcs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  // Show master nav items in sidebar
  const section = document.getElementById('nav-master-section');
  if (section) section.style.display = '';
  // Subscreve todos os canais realtime
  if (typeof subscribeCenas === 'function') subscribeCenas();
  if (typeof subscribeMapaRealtime === 'function') subscribeMapaRealtime();
  if (typeof subscribeCT === 'function') subscribeCT();
}
function initPlayerUI() {
  // Subscreve realtime imediatamente ao fazer login
  if (typeof subscribeCenas === 'function') subscribeCenas();
  if (typeof subscribeMapaRealtime === 'function') subscribeMapaRealtime();
  if (typeof subscribeCT === 'function') subscribeCT();
}

// Chama init (definido no app_core)
// O window.init é redefinido abaixo para garantir ordem
const _initCore = init;
window.init = async function() {
  await _initCore();
};
init();
