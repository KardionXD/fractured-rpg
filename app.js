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

// ── OS RECURSOS DO PERSONAGEM ─────────────────────
//  Eram três variáveis com nome fixo: pvAtual, supAtual, humAtual.
//  Servia enquanto só existisse o Fractured. A Vontade do Fogo tem
//  Vida, Chakra e Vontade do Fogo — mesma quantidade, outros nomes,
//  outras regras. Agora o estado é um mapa por id, e quais ids existem
//  quem diz é o sistema da mesa.
const REC = {};        // { pv: 12, sup: 4, hum: 8 } — valores ATUAIS
const RECMAX = {};     // { pv: 20, sup: 10, hum: 10 } — máximos calculados

//  O máximo de um recurso: fixo, ou recalculado a partir dos atributos.
//
//  Com a ficha EM BRANCO (nenhum atributo preenchido) a fórmula não diz
//  nada de útil — no Fractured, RES vazia daria 4 PV, e a pessoa abriria
//  a ficha nova com quatro bolinhas sem entender por quê. Nesse caso
//  vale o máximo declarado pelo sistema, que é o número de referência.
//  Assim que o primeiro atributo é digitado, a fórmula assume.
// ══════════════════════════════════════════════════════════════════
//  O TETO DE UM RECURSO — AUTOMÁTICO, MAS NUNCA TRANCADO
//
//  A regra que vale para a ficha inteira daqui em diante:
//
//      escolha  →  aplica o valor padrão sozinha  →  continua editável
//
//  A ficha calcula o teto pela fórmula do sistema e soma o que o clã
//  (ou a raça, ou a característica) mandar somar. Mas se o Mestre
//  escrever um número na mão, o número dele MANDA — porque nenhuma
//  tabela previu a habilidade que a campanha dele inventou ontem.
//
//  `RECMAXMANUAL` guarda essas exceções, e elas são gravadas junto com
//  a ficha. Apagar o campo devolve o automático.
// ══════════════════════════════════════════════════════════════════
const RECMAXMANUAL = {};

//  O teto automático: fórmula do sistema + ajustes de clã/origem.
function recMaxAutomatico(id, attr) {
  const r = (S().recursos || []).find(x => x.id === id);
  if (!r) return 0;
  const a = attr || _attrDaTela();
  let base;
  if (!r.maxDerivado) {
    base = r.max || 0;
  } else {
    const temAlgo = (S().atributos || []).some(x => (parseInt(a[x.id], 10) || 0) !== 0);
    base = temAlgo ? derivado(r.maxDerivado, a) : (r.max || derivado(r.maxDerivado, a));
  }
  //  O sistema pode ter algo que muda esse teto — no Shinobi é o clã.
  if (typeof S().ficha?.ajusteDeRecurso === 'function') {
    try { base = S().ficha.ajusteDeRecurso(id, base, a); } catch (e) { console.error('[recurso]', e); }
  }
  return Math.max(0, Math.round(base));
}

function recMax(id, attr) {
  const manual = RECMAXMANUAL[id];
  if (manual != null && manual !== '') return Math.max(0, parseInt(manual, 10) || 0);
  return recMaxAutomatico(id, attr);
}

//  O Mestre escreveu um teto na mão. Campo vazio devolve o automático.
function recMaxDefinirManual(id, valor) {
  const v = String(valor ?? '').trim();
  if (v === '') delete RECMAXMANUAL[id];
  else RECMAXMANUAL[id] = parseInt(v, 10) || 0;
  pintarRecurso(id);
  if (typeof S().ficha.aoMudarRecurso === 'function') S().ficha.aoMudarRecurso(id);
  autoSave();
}

//  Este teto está sendo forçado à mão? A tela usa isto para marcar a
//  exceção — uma exceção que não se anuncia vira bug silencioso.
function recMaxEhManual(id) {
  return RECMAXMANUAL[id] != null && RECMAXMANUAL[id] !== '';
}

//  Lê os atributos direto da tela. Usado quando um recurso depende
//  deles (a Vida sai do Corpo, o Chakra sai do Espírito).
function _attrDaTela() {
  const a = {};
  (S().atributos || []).forEach(x => {
    a[x.id] = parseInt(document.getElementById('a-' + x.id)?.value, 10) || 0;
  });
  const rank = document.getElementById('f-rank');
  if (rank) a.rank = rank.value;
  //  Alguns sistemas têm ESTADO que muda valor derivado: em A Vontade
  //  do Fogo, Exaustão 4 corta o PV máximo pela metade e ficar sem
  //  chakra tira 2 de Defesa. Quem sabe ler esse estado é o sistema.
  if (typeof S().ficha?.estado === 'function') {
    try { a.estado = S().ficha.estado(); } catch (e) {}
  }
  return a;
}

//  Redesenha as bolinhas de um recurso.
function pintarRecurso(id) {
  const r = (S().recursos || []).find(x => x.id === id);
  if (!r) return;
  RECMAX[id] = recMax(id);
  // Se o máximo encolheu (baixou RESISTÊNCIA, trocou de rank), o valor
  // atual não pode continuar acima dele — a ficha mostraria 21/15.
  if ((REC[id] ?? 0) > RECMAX[id]) REC[id] = RECMAX[id];
  buildPips('pip-' + id, RECMAX[id], REC[id] ?? 0, r.cor || 'roxo',
            (i, cid, total, valId) => onRecursoClick(id, i, cid, total, valId),
            'pip-' + id + '-val');
}

function pintarTodosOsRecursos() {
  (S().recursos || []).forEach(r => pintarRecurso(r.id));
}

//  Zera/reinicia os recursos conforme o sistema (uns começam cheios).
function zerarRecursos() {
  (S().recursos || []).forEach(r => {
    RECMAX[r.id] = recMax(r.id);
    REC[r.id] = r.comecaCheio ? RECMAX[r.id] : 0;
  });
}
let tensaoFicha = 0;
let tensaoSala = 0;

let notaAtual = null;
let notaEditada = false;
let realtimeSub = null;
let vinculosCount = 1;

// TENSAO_TYPES e as faixas vivem em conteudo.js — fonte única, tirada do Cap. 06.

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

  // A ficha é montada AGORA, e não no HTML: só aqui a mesa já é
  // conhecida, e é ela que diz qual sistema desenhar. Tem que vir antes
  // de tudo que preenche a ficha — buildAttrGrid, buildPips e o resto
  // procuram por elementos que ainda não existiriam.
  fichaMotorMontar();
  // O mapa também tem escolhas que dependem do sistema (a medida).
  if (typeof mapaAplicarSistema === 'function') mapaAplicarSistema();
  // A grade de atributos do formulário de NPC nasce aqui também, e não
  // só quando o formulário abre: assim o modal nunca aparece vazio, por
  // qualquer caminho que alguém venha a usar para mostrá-lo.
  if (typeof npcBuildAttrGrid === 'function') npcBuildAttrGrid();
  // Os botões de tema nascem junto com a ficha; o tema salvo foi
  // aplicado antes deles existirem, então marcamos de novo.
  if (typeof setTemaFicha === 'function') {
    let t = 'padrao';
    try { t = localStorage.getItem('fractured_tema_ficha') || 'padrao'; } catch (e) {}
    setTemaFicha(t);
  }

  buildAttrGrid();
  buildProfissoes();
  zerarRecursos();
  pintarTodosOsRecursos();
  medidorDaMesaPintar(tensaoFicha, true);
  buildPericias();
  //  Vínculos e Inventário são caixas do Fractured. Numa ficha que não
  //  as tem, `buildVinculos()` estourava em `list.innerHTML` e derrubava
  //  o resto do init — inclusive o `carregarFicha()` logo abaixo.
  if (document.getElementById('vinculos-list'))   buildVinculos();
  if (document.getElementById('inventario-list')) buildInventario();

  await carregarFicha();
  await carregarNotas();
  // subscribeToSala called after layout mounts panels
}

// ── NAVIGATION ────────────────────────────────────
function navigate(page) {
  ['ficha','sala','notas','master','npcs','arquivos'].forEach(p => {
    const el = document.getElementById('page-' + p);
    if (!el) return;
    el.style.display = p === page ? (p==='sala'?'flex':'block') : 'none';
    const nav = document.getElementById('nav-' + p);
    if (nav) nav.classList.toggle('active', p === page);
  });
  if (page === 'master') { carregarPlayers(_playersMostrarTodos); subscribePlayers(); }
  if (page === 'sala') setTimeout(() => scrollFeedToBottom(), 100);
  if (page === 'notas') renderListaNotas();
  if (page === 'arquivos') arquivosInit();
  if (page === 'ficha') {
    // Rede de segurança: a ficha é montada no init(). Se aquele caminho
    // tiver falhado (mesa não carregou, rede caiu), a tela ficaria em
    // branco para sempre. Aqui ela é montada na hora de aparecer.
    const alvo = document.getElementById('page-ficha');
    if (alvo && !alvo.children.length && typeof fichaMotorMontar === 'function') {
      fichaMotorMontar();
      if (typeof buildAttrGrid === 'function') buildAttrGrid();
    }
    if (typeof fichaCustomInit === 'function') fichaCustomInit();
  }
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

// Os atributos vêm do sistema da mesa, não de uma lista aqui.
// Continua sendo uma função com o mesmo formato de antes ({abbr,name,id})
// para não mexer nos seis lugares que já usavam ATTRS.
function ATTRS_() {
  return S().atributos.map(a => ({ abbr: a.sigla, name: a.nome, id: a.id,
                                   min: a.min, max: a.max }));
}

//  O cartão padrão: VALOR e MOD lado a lado. Faz sentido no Fractured,
//  onde o atributo vai de 1 a 5 e o bônus é `valor − 3` — dois números
//  diferentes. Não faz sentido num sistema onde o valor JÁ é o bônus:
//  ali as duas caixas mostram o mesmo número, e é ruído. Por isso o
//  sistema pode declarar `ficha.cartaoAtributo` e desenhar o seu.
function _cartaoAtributoPadrao(a) {
  return `
      <button class="attr-roll-btn" onclick="rolarAtributoFicha('${a.id}')" title="Rolar 1d20 + ${a.abbr}">${fracIcon('d20', { size: 14 })}</button>
      <div class="attr-abbr">${a.abbr}</div>
      <div class="attr-name">${a.name}</div>
      <div class="attr-inputs">
        <input type="number" min="${a.min}" max="${a.max}" placeholder="0" class="attr-val"
          id="a-${a.id}" oninput="onAttrInput('${a.id}')">
        <input type="text" class="attr-mod" id="m-${a.id}" readonly placeholder="±0">
      </div>
      <div class="attr-sub"><span>VALOR</span><span>MOD</span></div>
    `;
}

function buildAttrGrid() {
  const grid = document.getElementById('attr-grid');
  if (!grid) return;
  const feito = S().ficha?.cartaoAtributo;
  grid.innerHTML = '';
  grid.classList.toggle('attr-grid-proprio', typeof feito === 'function');
  ATTRS_().forEach(a => {
    const card = document.createElement('div');
    card.className = 'attr-card';
    card.innerHTML = typeof feito === 'function' ? feito(a) : _cartaoAtributoPadrao(a);
    grid.appendChild(card);
  });
  //  Os ícones da marca nascem como `data-fic` e são trocados pelo SVG
  //  depois. O motor faz isso com o que já está na tela quando a ficha
  //  é montada; estes cartões nascem depois dele, e ficavam sem ícone —
  //  o botão de rolar aparecia como um retângulo vazio.
  grid.querySelectorAll('[data-fic]').forEach(el => {
    el.innerHTML = fracIcon(el.dataset.fic, { size: parseInt(el.dataset.ficSize) || 14 });
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
  ATTRS_().forEach(a => { gasto += parseInt(document.getElementById('a-' + a.id)?.value) || 0; });
  //  O sistema pode ter mais a dizer do que "N pontos gastos" — o
  //  Shinobi mostra o conjunto da criação e o teto do rank.
  const proprio = S().ficha?.contadorAtributos;
  if (typeof proprio === 'function') { cont.innerHTML = proprio(gasto, _attrDaTela()); return; }
  cont.innerHTML = `
    <span style="color:var(--muted);letter-spacing:1px">PONTOS DE ATRIBUTO</span>
    <span style="font-weight:700;color:var(--gold)">${gasto} ${gasto === 1 ? 'ponto gasto' : 'pontos gastos'}</span>`;
}

// O texto do modificador ao lado do atributo. A CONTA sai do sistema da
// mesa (nucleo/registro.js → sistemas/<id>/regras.js); aqui só formatamos.
function calcMod(v) {
  const m = modAtrib(v);
  return (m >= 0 ? '+' : '') + m;
}

function onAttrInput(id) {
  const val = document.getElementById('a-' + id).value;
  _porCampo('m-' + id, calcMod(val));   // a ficha Shinobi não tem campo MOD
  atualizarContadorPontos();
  // Qualquer recurso cujo máximo saia de um atributo se refaz aqui.
  // Antes isto era `if (id === 'res')` — a regra do Fractured cravada
  // no núcleo. Agora vale para a Vida do Corpo, o Chakra do Espírito,
  // e para o que o próximo sistema inventar.
  const attr = _attrDaTela();
  (S().recursos || []).forEach(r => {
    if (!r.maxDerivado) return;
    RECMAX[r.id] = derivado(r.maxDerivado, attr);
    if (r.formulaId) {
      const el = document.getElementById(r.formulaId);
      if (el) el.textContent = derivadoTexto(r.maxDerivado, attr);
    }
    pintarRecurso(r.id);
  });
  if (typeof S().ficha.aoMudarAtributo === 'function') S().ficha.aoMudarAtributo(attr);
  atualizarDicaPericias();  // nº de perícias sai do Mod de CON
  atualizarRotulosAtributo();                // o rolador mostra o mod novo
  autoSave();
}

// ── PIPS ─────────────────────────────────────────
// Cada recurso tem 2 representações no DOM (pips e gauge-barra) — os temas
// dourada/verde mostram a barra (mockup 9a/10a), o padrão mostra os pips.
// As duas ficam sempre sincronizadas aqui, então não importa qual tema
// está ativo no momento em que o valor muda.
function _syncGauge(tipo, atual, total) {
  const valEl = document.getElementById(`gauge-${tipo}-val`);
  const fillEl = document.getElementById(`gauge-${tipo}-fill`);
  //  Um sistema pode escrever esse par do seu jeito. A ficha Shinobi
  //  mostra `23 / 28` com o máximo menor — o número que importa em
  //  combate é o atual, e ele tem que ser o que a vista pega primeiro.
  const fmt = S().ficha?.formatoRecurso;
  if (valEl) {
    if (typeof fmt === 'function') valEl.innerHTML = fmt(tipo, atual, total);
    else valEl.textContent = `${atual}/${total}`;
  }
  if (fillEl) fillEl.style.width = total > 0 ? `${Math.max(0, Math.min(100, (atual / total) * 100))}%` : '0%';
  if (tipo === 'sup') {
    const capEl = document.getElementById('gauge-sup-caption');
    if (capEl) capEl.textContent = total > 0 && atual <= total * 0.3 ? '⚠ Escasso' : 'Suprimentos';
  }
}

//  Desenha as bolinhas de um recurso. A fileira de bolinhas pode NÃO
//  existir — a ficha Shinobi mostra Vida como número, porque 45 pontos
//  de vida são 45 bolinhas e ninguém lê isso. Sem a fileira, o resto
//  (o valor e a barra) continua sendo atualizado; antes a função saía
//  na primeira linha e o número na tela congelava.
function buildPips(containerId, total, active, color, onClick, valId) {
  const c = document.getElementById(containerId);
  if (c) {
    c.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const pip = document.createElement('div');
      pip.className = `pip ${color}` + (i < active ? ' on' : '');
      pip.addEventListener('click', () => onClick(i, containerId, total, valId));
      c.appendChild(pip);
    }
  }
  if (valId) {
    const el = document.getElementById(valId);
    if (el) el.textContent = `${active}/${total}`;
  }
  _syncGauge(containerId.replace('pip-', ''), active, total);
}

//  Um clique só, para qualquer recurso. Antes eram três funções
//  praticamente iguais — onPVClick, onSupClick, onHumClick.
function onRecursoClick(id, i, cid, total, valId) {
  const pips = document.querySelectorAll(`#${cid} .pip`);
  const cur = [...pips].filter(p => p.classList.contains('on')).length;
  REC[id] = (i + 1 === cur) ? i : i + 1;
  pips.forEach((p, j) => p.classList.toggle('on', j < REC[id]));
  const el = document.getElementById(valId);
  if (el) el.textContent = `${REC[id]}/${total}`;
  _syncGauge(id, REC[id], total);
  const r = (S().recursos || []).find(x => x.id === id);
  if (r?.daMesa) publicarSuprimentos();   // recurso do grupo: a mesa inteira vê
  //  Perder Vida ou zerar o Chakra pode ligar uma condição sozinha —
  //  em A Vontade do Fogo, Ferido e Exausto de Chakra. Quem sabe disso
  //  é o sistema.
  if (typeof S().ficha.aoMudarRecurso === 'function') S().ficha.aoMudarRecurso(id);
  autoSave();
}

// Qual recurso é do grupo? Quem diz é o sistema (`daMesa: true`).
// No Fractured são os Suprimentos, Cap. 10: "NÃO são individuais — são do
// grupo inteiro, e cada gasto é uma decisão coletiva."
function _recursoDaMesa() {
  return (S().recursos || []).find(r => r.daMesa);
}

// Empurra o valor do grupo para a mesa inteira.
async function publicarSuprimentos() {
  const r = _recursoDaMesa();
  if (!r) return;
  try {
    if (typeof mesaId === 'function' && mesaId()) {
      await publicarSala('suprimentos', { valor: REC[r.id] });
    }
  } catch (e) {}
}

// Redesenha a trilha com um valor que veio de outro jogador.
function aplicarSuprimentosSala(valor) {
  const r = _recursoDaMesa();
  if (!r) return;
  REC[r.id] = Math.max(0, Math.min(recMax(r.id), parseInt(valor) || 0));
  pintarRecurso(r.id);
}

async function carregarSuprimentosSala() {
  try {
    const { data } = await db
      .from('sala')
      .select('conteudo')
      .eq('mesa_id', mesaId())
      .eq('tipo', 'suprimentos')
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) aplicarSuprimentosSala(data[0].conteudo?.valor || 0);
  } catch (e) {}
}

// Botões +/− da barra de recursos (temas dourada/verde) — os pips continuam
// sendo a fonte de verdade, isso só empurra o valor e redesenha os dois.
function ajustarRecurso(tipo, delta) {
  const r = (S().recursos || []).find(x => x.id === tipo);
  if (!r) return;
  const max = recMax(tipo);
  REC[tipo] = Math.max(0, Math.min(max, (REC[tipo] ?? 0) + delta));
  pintarRecurso(tipo);
  if (r.daMesa) publicarSuprimentos();
  if (typeof S().ficha.aoMudarRecurso === 'function') S().ficha.aoMudarRecurso(tipo);
  autoSave();
}

// ── O MEDIDOR COMPARTILHADO DA MESA ──────────────
//  Tensão no Fractured, Vínculo de Equipe em A Vontade do Fogo. Mesma
//  régua de 0 a 10, mesma caixa na tela, regra oposta.
//
//  ISTO JÁ ESTEVE ERRADO, E ERA VISÍVEL: as bolinhas eram desenhadas a
//  partir de TENSAO_TYPES — as iniciais de Calma, Alerta, Perigo e
//  Terror. A ficha Shinobi mostrava o Vínculo de Equipe como
//  `C C A A A P P P T T`. Estava desenhando a Tensão do Fractured com
//  outro nome em cima.
//
//  Agora as bolinhas vêm do medidor declarado pelo sistema: com faixas,
//  usa a inicial e a cor da faixa; sem faixas, é uma régua numerada.

//  Qual recurso da mesa a ficha mostra, e em que elemento.
function medidorDaMesaDaFicha() {
  const s = S();
  const sec = (s.ficha?.secoes || []).find(x => x.medidorDaMesa);
  const cfg = sec?.medidorDaMesa;
  if (!cfg) return null;
  const rec = (s.recursosMesa || []).find(r => r.id === cfg.id);
  return rec ? { rec, pipsId: cfg.pipsId } : null;
}

//  As bolinhas de um medidor: rótulo e classe de cor de cada uma.
function _pipsDoMedidor(rec) {
  const max = rec?.max ?? 10;
  if (Array.isArray(rec?.faixas) && rec.faixas.length) {
    //  As faixas do Fractured são cumulativas (`max` é o teto da faixa).
    //  A classe de cor é a inicial em minúscula — `.tpip.c`, `.tpip.a`,
    //  `.tpip.p`, `.tpip.t` no CSS —, exatamente como era antes.
    return Array.from({ length: max }, (_, i) => {
      const v = i + 1;
      const f = rec.faixas.find(x => v <= x.max) || rec.faixas[rec.faixas.length - 1] || {};
      const letra = (f.label || f.nome || String(v))[0];
      return { texto: letra, classe: letra.toLowerCase() };
    });
  }
  //  Sem faixas: régua numerada e uma cor só.
  return Array.from({ length: max }, (_, i) => ({ texto: String(i + 1), classe: 'liso' }));
}

function buildTensaoPips(containerId, active, forFicha) {
  const targets = containerId === 'tensao-pips-sala'
    ? ['tensao-pips-sala', 'tensao-pips-sala-mobile']
    : [containerId];

  //  Na ficha, o medidor é o que o sistema declarou; na sala, o mesmo
  //  recurso, porque é ele que a mesa inteira compartilha.
  const daFicha = medidorDaMesaDaFicha();
  const rec = daFicha?.rec || (S().recursosMesa || [])[0];
  const pips = _pipsDoMedidor(rec);

  targets.forEach(cid => {
    const c = document.getElementById(cid);
    if (!c) return;
    c.innerHTML = '';
    pips.forEach((p, i) => {
      const pip = document.createElement('div');
      pip.className = `tpip ${p.classe}` + (i < active ? ' on' : '');
      pip.textContent = p.texto;
      pip.addEventListener('click', () => {
        if (forFicha) {
          tensaoFicha = (i < tensaoFicha) ? i : i + 1;
          medidorDaMesaPintar(tensaoFicha, true);
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

//  Pinta o medidor da ficha, seja qual for o id que o sistema deu ao
//  elemento. Sem o elemento (uma ficha que não mostra o medidor), não
//  faz nada em vez de estourar.
function medidorDaMesaPintar(active, forFicha) {
  const m = medidorDaMesaDaFicha();
  if (!m || !m.pipsId) return;
  buildTensaoPips(m.pipsId, active, forFicha !== false);
}

function updateTensaoStatus() {
  const t = tensaoSala;
  // Cap. 06 — A REGRA ÚNICA DA TENSÃO: a penalidade da faixa entra em TODO teste.
  const faixa = tensaoFaixa(t);
  const label = faixa.label, cls = faixa.cls, tipText = faixa.dica;

  const text = `${label} (${t}/10)`;
  ['tensao-status-text','tensao-status-mobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = text; el.className = `tensao-status ${cls}`; }
  });
  const tip = document.getElementById('tensao-tip');
  if (tip) tip.textContent = tipText;
}

// ── PERÍCIAS ─────────────────────────────────────
// Cap. 04 / ficha oficial: "PERÍCIAS ATIVAS — 1 da profissão + 1 por ponto
// positivo do Mod de CONHECIMENTO (mínimo 1)". A ficha impressa tem 5 linhas
// e não rotula nenhuma como "de profissão" — os rótulos aqui são neutros.
const PERICIAS_SLOTS = 5;

//  <datalist> com as perícias oficiais DO SISTEMA DA MESA, agrupadas
//  como no livro dele.
//
//  Isto já esteve errado: a lista era montada a partir de
//  `periciasPorCategoria()` e `PERICIAS_ORDEM`, que são as 67 perícias
//  do Fractured. A ficha Shinobi sugeria "Força Bruta / FORÇA" —
//  perícia de outro sistema, num campo que nem existe lá.
//
//  Agora quem responde é o sistema, e o datalist é REFEITO quando a
//  mesa muda de sistema (por isso o `data-sistema`: sem ele, o primeiro
//  sistema carregado ficaria valendo para sempre).
function _periciasDatalist() {
  const id = 'pericias-oficiais';
  const antigo = document.getElementById(id);
  if (antigo && antigo.dataset.sistema === sistemaId()) return;
  if (antigo) antigo.remove();

  const cfg = S().pericias || {};
  const dl = document.createElement('datalist');
  dl.id = id;
  dl.dataset.sistema = sistemaId();

  const grupos = typeof cfg.porCategoria === 'function' ? cfg.porCategoria() : null;
  if (grupos) {
    Object.keys(grupos).forEach(cat => {
      (grupos[cat] || []).forEach(p => {
        const o = document.createElement('option');
        o.value = p.nome;
        //  O rótulo mostra o atributo quando a perícia aceita mais de um
        //  ("ESP ou COR"), porque aí a categoria sozinha não informa nada.
        o.label = String(p.attr || '').includes(' ') ? `${cat} · ${p.attr}` : cat;
        dl.appendChild(o);
      });
    });
  } else {
    (cfg.catalogo || []).forEach(p => {
      const o = document.createElement('option');
      o.value = p.nome; o.label = p.cat || '';
      dl.appendChild(o);
    });
  }
  document.body.appendChild(dl);
}

// Ao escolher uma perícia do catálogo, preenche o atributo sozinho —
// com o atributo do sistema da mesa, não com o do Fractured.
function onPericiaNome(i) {
  const nomeEl = document.getElementById(`p-nome-${i}`);
  const atrEl  = document.getElementById(`p-atrib-${i}`);
  const de = S().pericias?.atributoDe;
  const attr = typeof de === 'function' ? de(nomeEl?.value) : '';
  if (attr && atrEl) atrEl.value = attr;
  autoSave();
}

function buildPericias() {
  const list = document.getElementById('pericias-list');
  if (!list) return;

  //  Um sistema pode ter forma própria de perícia. No Fractured são
  //  cinco linhas em branco, porque são 67 perícias e o personagem usa
  //  cinco. Em A Vontade do Fogo são dezoito, TODAS na ficha, cada uma
  //  com um grau — não existe "escolher qual aparece".
  if (typeof S().pericias?.montar === 'function') {
    list.innerHTML = S().pericias.montar();
    list.querySelectorAll('[data-fic]').forEach(el => {
      el.innerHTML = fracIcon(el.dataset.fic, { size: parseInt(el.dataset.ficSize) || 14 });
    });
    atualizarDicaPericias();
    return;
  }

  list.innerHTML = '';
  _periciasDatalist();
  for (let i = 0; i < PERICIAS_SLOTS; i++) {
    const div = document.createElement('div');
    div.className = 'pericia-card';
    div.innerHTML = `
      <div class="pericia-main">
        <div class="pericia-tag">Perícia ${i + 1}</div>
        <input type="text" class="pericia-nome-input" id="p-nome-${i}" list="pericias-oficiais"
          placeholder="Nome da perícia..." oninput="onPericiaNome(${i})">
      </div>
      <div class="pericia-atrib-wrap">
        <span class="pericia-atrib-label">ATRIB</span>
        <input type="text" class="pericia-atrib-input" id="p-atrib-${i}" placeholder="${S().atributos[0].sigla}" maxlength="3"
          oninput="this.value=this.value.toUpperCase();autoSave()">
      </div>
      <button class="pericia-roll-btn" onclick="rolarPericiaFicha(${i})" title="Rolar 1d20 + atributo + ${S().pericias.bonusTreino} (perícia)">${fracIcon('d20', { size: 14 })}</button>
    `;
    list.appendChild(div);
  }
  atualizarDicaPericias();
}

// Quantas perícias o personagem tem direito: 1 da profissão + 1 por ponto
// positivo do Mod de CONHECIMENTO, mínimo 1 extra (Cap. 03).
function periciasPermitidas() {
  const con = parseInt(document.getElementById('a-con')?.value) || 0;
  return S().pericias.quantas({ con });
}

//  A frase que explica quantas perícias a pessoa tem direito.
//  No Fractured o número depende do Mod de CONHECIMENTO e a frase muda
//  conforme o valor. Em A Vontade do Fogo são três, fixas — e a frase é
//  sempre a mesma. Quem sabe disso é o sistema; o núcleo só pergunta se
//  ele quer explicar de um jeito próprio (`dicaViva`) ou se basta a
//  explicação declarada.
function atualizarDicaPericias() {
  const el = document.getElementById('pericias-dica');
  if (!el) return;
  const cfg = S().pericias;
  if (typeof cfg.dicaViva === 'function') {
    const attr = _attrDaTela();
    el.textContent = cfg.dicaViva(attr, cfg.quantas(attr));
    return;
  }
  el.textContent = cfg.explicacao || '';
}

// ── PROFISSÕES ───────────────────────────────────
function buildProfissoes() {
  const sel = document.getElementById('f-profissao');
  if (!sel || sel.dataset.pronto) return;
  const atual = sel.value;
  sel.innerHTML = '<option value="">Selecionar...</option>';
  [['Livro Base', 'base'], ['Expansão', 'expansao']].forEach(([rotulo, livro]) => {
    const g = document.createElement('optgroup');
    g.label = rotulo;
    PROFISSOES.filter(p => p.livro === livro).forEach(p => {
      const o = document.createElement('option');
      o.value = p.nome;
      o.textContent = `${p.nome} — ${p.attrs}`;
      g.appendChild(o);
    });
    sel.appendChild(g);
  });
  sel.dataset.pronto = '1';
  if (atual) sel.value = atual;
  sel.addEventListener('change', mostrarProfissao);
  mostrarProfissao();
}

// Mostra perícia Base/Extra e o Traço da profissão escolhida.
function mostrarProfissao() {
  const box = document.getElementById('profissao-info');
  if (!box) return;
  const p = profissao(document.getElementById('f-profissao')?.value);
  if (!p) { box.innerHTML = ''; box.style.display = 'none'; return; }
  box.style.display = '';
  box.innerHTML = `
    <div class="prof-info-linha"><b>Escolha uma perícia:</b>
      <span class="prof-pericia">${p.base}</span> <i>ou</i>
      <span class="prof-pericia">${p.extra}</span></div>
    <div class="prof-info-linha"><b>Traço — ${p.traco}:</b> ${p.tracoDesc}</div>
  `;
}

// ── VÍNCULOS (lista dinâmica — clique pra adicionar/remover) ──
const VINCULO_TIPOS = ['Proteção','Culpa','Amor','Respeito','Desconfiança','Gratidão'];

function _coletarVinculosDoDOM() {
  const arr = [];
  for (let i = 0; i < vinculosCount; i++) {
    arr.push({
      personagem: document.getElementById(`v-per-${i}`)?.value || '',
      promessa:   document.getElementById(`v-pro-${i}`)?.value || '',
      divida:     document.getElementById(`v-div-${i}`)?.value || '',
      tipo:       document.getElementById(`v-tip-${i}`)?.value || ''
    });
  }
  return arr;
}

function buildVinculos(dados) {
  const existentes = dados && dados.length ? dados : _coletarVinculosDoDOM();
  vinculosCount = Math.max(1, existentes.length);

  const list = document.getElementById('vinculos-list');
  if (!list) return;      // ficha de outro sistema: não existe esta caixa
  list.innerHTML = '';
  for (let i = 0; i < vinculosCount; i++) {
    const v = existentes[i] || {};
    const card = document.createElement('div');
    card.className = 'vinculo-card';
    card.innerHTML = `
      <div class="vinculo-header">
        <div class="vinculo-num">${i+1}</div>
        <div class="field" style="flex:1">
          <label>Personagem</label>
          <input type="text" id="v-per-${i}" placeholder="Nome do aliado..." value="${esc(v.personagem || '')}" oninput="autoSave()">
        </div>
        ${vinculosCount > 1 ? `<button type="button" class="vinculo-remove-btn" onclick="removerVinculo(${i})" title="Remover vínculo">🗑</button>` : ''}
      </div>
      <div class="vinculo-grid">
        <div class="field">
          <label>Promessa</label>
          <input type="text" id="v-pro-${i}" placeholder="O que você prometeu..." value="${esc(v.promessa || '')}" oninput="autoSave()">
        </div>
        <div class="field">
          <label>Dívida</label>
          <input type="text" id="v-div-${i}" placeholder="O que você deve..." value="${esc(v.divida || '')}" oninput="autoSave()">
        </div>
        <div class="field">
          <label>Tipo</label>
          <select id="v-tip-${i}" onchange="autoSave()">
            <option value="">Selecionar...</option>
            ${VINCULO_TIPOS.map(t => `<option${t === v.tipo ? ' selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
    list.appendChild(card);
  }

  const addBtn = document.createElement('div');
  addBtn.className = 'vinculo-add-btn';
  addBtn.textContent = '+ Adicionar Vínculo';
  addBtn.onclick = adicionarVinculo;
  list.appendChild(addBtn);
}

function adicionarVinculo() {
  const arr = _coletarVinculosDoDOM();
  arr.push({});
  buildVinculos(arr);
  autoSave();
}

function removerVinculo(i) {
  const arr = _coletarVinculosDoDOM();
  arr.splice(i, 1);
  buildVinculos(arr.length ? arr : [{}]);
  autoSave();
}

// ── INVENTÁRIO (lista dinâmica — clique pra adicionar/remover) ──
let itensCount = 1;

function _coletarItensDoDOM() {
  const arr = [];
  for (let i = 0; i < itensCount; i++) {
    arr.push({
      nome:    document.getElementById(`inv-nome-${i}`)?.value || '',
      detalhe: document.getElementById(`inv-detalhe-${i}`)?.value || ''
    });
  }
  return arr;
}

function buildInventario(dados) {
  const existentes = dados && dados.length ? dados : _coletarItensDoDOM();
  itensCount = Math.max(1, existentes.length);

  const list = document.getElementById('inventario-list');
  if (!list) return;
  list.innerHTML = '<div class="inv-items-grid" id="inv-items-grid"></div>';
  const grid = document.getElementById('inv-items-grid');
  for (let i = 0; i < itensCount; i++) {
    const it = existentes[i] || {};
    const card = document.createElement('div');
    card.className = 'inv-item-card';
    card.innerHTML = `
      <span class="inv-item-icon">${fracIcon('item', { size: 16 })}</span>
      <div class="inv-item-fields">
        <input type="text" class="inv-item-name" id="inv-nome-${i}" placeholder="Nome do item..." value="${esc(it.nome || '')}" oninput="autoSave()">
        <input type="text" class="inv-item-sub" id="inv-detalhe-${i}" placeholder="detalhe (opcional)" value="${esc(it.detalhe || '')}" oninput="autoSave()">
      </div>
      ${itensCount > 1 ? `<button type="button" class="inv-remove-btn" onclick="removerItem(${i})" title="Remover item">🗑</button>` : ''}
    `;
    grid.appendChild(card);
  }
  const addBtn = document.createElement('div');
  addBtn.className = 'inv-add-btn';
  addBtn.textContent = '+ Adicionar Item';
  addBtn.onclick = adicionarItem;
  list.appendChild(addBtn);
}

function adicionarItem() {
  const arr = _coletarItensDoDOM();
  arr.push({});
  buildInventario(arr);
  autoSave();
}

function removerItem(i) {
  const arr = _coletarItensDoDOM();
  arr.splice(i, 1);
  buildInventario(arr.length ? arr : [{}]);
  autoSave();
}

// ── SAVE / LOAD FICHA ─────────────────────────────
function coletarFicha() {
  //  Quem sabe ler as perícias da tela é o sistema, quando ele tem
  //  forma própria — um grau por perícia não cabe em {nome, atrib}.
  const pericias = typeof S().pericias?.coletar === 'function'
    ? S().pericias.coletar()
    : Array.from({ length: PERICIAS_SLOTS }, (_, i) => ({
        nome: document.getElementById(`p-nome-${i}`)?.value || '',
        atrib: document.getElementById(`p-atrib-${i}`)?.value || ''
      }));
  const vinculos = _coletarVinculosDoDOM();
  const itens = _coletarItensDoDOM();

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
    pv_atual:   REC.pv ?? 0,
    suprimentos: REC.sup ?? 0,
    humanidade: REC.hum ?? 10,
    tensao:     tensaoFicha,
    veiculo_tipo:       document.getElementById('f-veiculo-tipo')?.value || '',
    veiculo_ti_atual:   parseInt(document.getElementById('f-vti-a')?.value) || 0,
    veiculo_ti_max:     parseInt(document.getElementById('f-vti-m')?.value) || 0,
    veiculo_comb_atual: parseInt(document.getElementById('f-vcomb-a')?.value) || 0,
    veiculo_comb_max:   parseInt(document.getElementById('f-vcomb-m')?.value) || 0,
    pericias,
    vinculos,
    itens,
    notas:      document.getElementById('f-notas')?.value || '',
    updated_at: new Date().toISOString(),

    //  Os campos que só existem num sistema vão numa BANDEJA À PARTE,
    //  nunca soltos na linha. Espalhá-los aqui fazia o Supabase tentar
    //  gravar `cla`, `rank`, `vila`… como coluna, e a tabela `fichas`
    //  não tem essas colunas:
    //
    //      Could not find the 'cla' column of 'fichas' in the schema cache
    //
    //  Dentro de `_sistema` eles chegam inteiros ao `paraDados`, que os
    //  guarda em `dados` (jsonb), e o núcleo tira a bandeja antes de a
    //  linha ir para o banco.
    _sistema: (typeof S().ficha.aoColetar === 'function' ? S().ficha.aoColetar() : {}),
  };
}

//  Escreve num campo da ficha SE ele existir nesta ficha.
//  Isto não é preciosismo: `f-profissao`, `f-trauma` e os quatro campos
//  de Veículo só existem na ficha do Fractured. Na ficha Shinobi,
//  `getElementById('f-profissao')` devolve null e a linha seguinte
//  estourava — a ficha do jogador simplesmente não carregava, sem
//  nenhuma mensagem. Era o mesmo tipo de erro que já tinha derrubado o
//  salvamento antes: núcleo mexendo em campo que é de um sistema só.
function _porCampo(id, valor) {
  const el = document.getElementById(id);
  if (el) el.value = valor;
}

function aplicarFicha(d) {
  if (!d) return;
  _porCampo('f-nome',    d.nome || '');
  _porCampo('f-jogador', d.jogador || '');
  _porCampo('f-notas',   d.notas || '');
  if (d.foto_url) aplicarFotoPersonagem(d.foto_url);

  //  Os campos que só um sistema tem ficam com o sistema.
  if (typeof S().ficha.aoAplicar === 'function') {
    try { S().ficha.aoAplicar(d, _porCampo); }
    catch (e) { console.error('[ficha] o sistema falhou ao aplicar os campos próprios:', e); }
  }

  ATTRS_().forEach(a => {
    const val = d[`attr_${a.id}`] || 0;
    _porCampo(`a-${a.id}`, val);
    _porCampo(`m-${a.id}`, calcMod(val));
  });
  atualizarContadorPontos();
  atualizarDicaPericias();
  atualizarRotulosAtributo();

  // Os recursos vêm do sistema. No Fractured são PV, Suprimentos e
  // Humanidade; em A Vontade do Fogo, Vida, Chakra e Vontade do Fogo.
  // Suprimentos são do grupo: o valor da mesa manda depois; o da ficha é
  // só o ponto de partida enquanto a mesa não publicou nenhum.
  const _campoDoRecurso = { pv: 'pv_atual', sup: 'suprimentos', hum: 'humanidade',
                            pc: 'pc_atual', pvf: 'pvf_atual', exa: 'exa_atual' };
  (S().recursos || []).forEach(r => {
    RECMAX[r.id] = recMax(r.id, atributosDe(d));
    const bruto = d[_campoDoRecurso[r.id] || (r.id + '_atual')];
    REC[r.id] = bruto ?? (r.comecaCheio ? RECMAX[r.id] : 0);
  });
  tensaoFicha = d.tensao || 0;

  (S().recursos || []).forEach(r => {
    if (!r.formulaId || !r.maxDerivado) return;
    const el = document.getElementById(r.formulaId);
    if (el) el.textContent = derivadoTexto(r.maxDerivado, atributosDe(d));
  });
  pintarTodosOsRecursos();
  medidorDaMesaPintar(tensaoFicha, true);

  //  Perícias: quem sabe aplicá-las é o sistema, quando ele tem forma
  //  própria (o Shinobi tem grau, o Fractured tem cinco linhas livres).
  if (typeof S().pericias?.aplicar === 'function') {
    S().pericias.aplicar(d.pericias || []);
  } else if (Array.isArray(d.pericias)) {
    d.pericias.forEach((p, i) => {
      _porCampo(`p-nome-${i}`,  p.nome || '');
      _porCampo(`p-atrib-${i}`, p.atrib || '');
    });
  }

  //  Vínculos e inventário do Fractured só existem na ficha do
  //  Fractured. Sem os elementos, não há o que preencher.
  if (document.getElementById('vinculos-list')) {
    buildVinculos(Array.isArray(d.vinculos) && d.vinculos.length ? d.vinculos : [{}]);
  }
  if (document.getElementById('inventario-list')) {
    // migra fichas antigas que só tinham "inventario" (texto livre)
    if (Array.isArray(d.itens) && d.itens.length) {
      buildInventario(d.itens);
    } else if (d.inventario && String(d.inventario).trim()) {
      buildInventario(String(d.inventario).split(' · ').map(nome => ({ nome: nome.trim() })));
    } else {
      buildInventario([{}]);
    }
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
    aplicarFicha(fichaLida(data));
    // Ficha gravada antes desta versão não tem o formato novo. Preenche
    // sozinha, em segundo plano, sem travar a tela nem avisar ninguém.
    fichaMigrarEmSilencio(data);
  }
}

let saveTimer = null;
function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => salvarFicha(true), 1500);
}

async function salvarFicha(silencioso = false) {
  // Se montar os dados falhar, o salvamento morria aqui sem nenhum aviso na
  // tela — o jogador só via o botão não fazer nada. Agora o erro aparece.
  let dados, bruto;
  try {
    bruto = coletarFicha();
    dados = bruto;
  } catch (e) {
    console.error('[salvarFicha] falha ao montar os dados da ficha:', e);
    toast('Erro ao ler a ficha: ' + (e.message || 'ver console (F12)'), 'err');
    return;
  }
  dados.mesa_id = mesaId();

  // Escrita dupla: além das colunas de sempre, a ficha vai também no
  // formato livre da coluna `dados`. As colunas continuam sendo a
  // verdade — é isso que permite voltar atrás sem perder nada.
  //
  // `fichaComDados` também é quem TIRA da linha tudo que não é coluna
  // desta tabela (os campos do sistema, que vão dentro de `dados`).
  fichaConferirIdaEVolta(dados);
  dados = fichaComDados(dados);

  // upsert (em vez de decidir insert/update pelo fichaId em memória) evita criar
  // fichas duplicadas quando a mesma ficha é editada em duas abas/dispositivos
  // ao mesmo tempo. Exige um UNIQUE(user_id, mesa_id) no banco — ver aviso no chat.
  let { data, error } = await db.from('fichas')
    .upsert(dados, { onConflict: 'user_id,mesa_id' })
    .select()
    .single();

  // Se o banco recusou porque a coluna `dados` ainda não existe (a
  // migração 002 não foi rodada), tenta de novo sem ela. Assim a ordem
  // entre subir o site e rodar o SQL deixa de importar.
  //  Se o banco recusou por causa de uma coluna, `fichaTratarErro`
  //  anota qual e devolve `true`. Refazemos a linha — já sem ela — e
  //  tentamos de novo, até três vezes. Assim uma coluna faltando não
  //  trava a ficha de ninguém.
  for (let tentativa = 0; tentativa < 3 && error && fichaTratarErro(error); tentativa++) {
    dados = fichaComDados({ ...bruto, mesa_id: mesaId() });
    ({ data, error } = await db.from('fichas')
      .upsert(dados, { onConflict: 'user_id,mesa_id' })
      .select().single());
  }

  if (data) fichaId = data.id;

  if (error) {
    console.error('[salvarFicha] falha ao salvar a ficha:', error);
    toast('Erro ao salvar: ' + (error.message || 'ver console (F12)'), 'err');
  } else if (!silencioso) {
    toast('Ficha salva!', 'ok');
  }
}

async function apagarFicha() {
  if (!fichaId) return toast('Nenhuma ficha para apagar.', 'err');
  if (!confirm('Apagar a ficha inteira? Isso não pode ser desfeito.')) return;

  const { error } = await db.from('fichas').delete().eq('id', fichaId);
  if (error) return toast('Erro ao apagar ficha!', 'err');

  fichaId = null;
  zerarRecursos(); tensaoFicha = 0;

  document.querySelectorAll('#page-ficha input, #page-ficha textarea').forEach(el => el.value = '');
  document.querySelectorAll('#page-ficha select').forEach(el => el.selectedIndex = 0);

  pintarTodosOsRecursos();
  medidorDaMesaPintar(0, true);
  (S().recursos || []).forEach(r => {
    if (!r.formulaId) return;
    const el = document.getElementById(r.formulaId);
    if (el) el.textContent = r.formulaTexto || '';
  });
  buildInventario([{}]);
  buildVinculos([{}]);

  toast('Ficha apagada.', 'ok');
}

// ══════════════════════════════════════════════════
//  SALA DE JOGO
// ══════════════════════════════════════════════════

let _salaSubAtiva = false;

async function subscribeToSala() {
  carregarFeed();
  carregarTensaoSala();
  carregarSuprimentosSala();

  if (_salaSubAtiva) return;
  _salaSubAtiva = true;

  realtimeSub = db
    .channel('sala-publica-' + mesaId())
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sala', filter: 'mesa_id=eq.' + mesaId() }, payload => {
      const msg = payload.new;
      if (msg.tipo === 'tensao') {
        tensaoSala = msg.conteudo.valor;
        buildTensaoPips('tensao-pips-sala', tensaoSala, false);
        updateTensaoStatus();
        if (typeof atualizarSituacaoTensao === 'function') atualizarSituacaoTensao();
      }
      // Suprimentos são do grupo (Cap. 10): o valor de qualquer um vale para todos.
      if (msg.tipo === 'suprimentos') aplicarSuprimentosSala(msg.conteudo?.valor);
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
    carregarSuprimentosSala();
    if (!_salaSubAtiva) subscribeToSala();
    if (_masterVisivel()) { carregarPlayers(_playersMostrarTodos, true); subscribePlayers(); }
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
    feed.innerHTML = `<div class="empty-state"><div class="empty-icon">${fracIcon('d20', { size: 36 })}</div><p>Role um dado para começar.</p></div>`;
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
      updateTensaoStatus();
      if (typeof atualizarSituacaoTensao === 'function') atualizarSituacaoTensao();
    }
  } catch(e) {}
}

function scrollFeedToBottom() {
  const feed = document.getElementById('feed-messages');
  if (feed) feed.scrollTop = feed.scrollHeight;
}

// Fila de mensagens locais aguardando o eco do realtime (dedupe)
const _ecoPendente = [];

// Stringify com chaves ordenadas — o jsonb do Postgres reordena as chaves,
// então JSON.stringify simples nunca batia entre o local e o eco.
function _jsonEstavel(v) {
  if (Array.isArray(v)) return '[' + v.map(_jsonEstavel).join(',') + ']';
  if (v && typeof v === 'object')
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + _jsonEstavel(v[k])).join(',') + '}';
  return JSON.stringify(v);
}

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
    _ecoPendente.push({ tipo, json: _jsonEstavel(conteudo), ts: Date.now() });
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
  const json = _jsonEstavel(msg.conteudo);
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
  if (fmsg) fmsg.innerHTML = `<div class="empty-state"><div class="empty-icon">${fracIcon('d20', { size: 36 })}</div><p>Histórico limpo.</p></div>`;
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
  const attr = ATTRS_().find(x => x.id === id);
  const mod  = modDoAtributo(id);
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

  const attr = ATTRS_().find(x => x.abbr === atrib);
  const mod  = attr ? modDoAtributo(attr.id) : 0;
  //  Era 3 cravado aqui — o bônus de treino do Fractured. Na ficha
  //  Shinobi, ser treinado vale +2, e o rolador estava somando +3.
  const PERICIA_BONUS = S().pericias?.bonusTreino ?? 3;

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

// ── SITUAÇÃO (múltipla escolha) ──────────────────
// Cap. 02: os modificadores de situação se somam. Antes era um <select>
// simples, então só dava para aplicar um por vez.

// Valor de uma situação. A da Tensão acompanha a faixa atual da mesa (Cap. 06).
function situacaoValor(s) {
  if (s.dyn === 'tensao') return tensaoFaixa(typeof tensaoSala === 'number' ? tensaoSala : 0).pen;
  return s.val;
}

function situacaoRotulo(s) {
  const v = situacaoValor(s);
  if (s.dyn === 'tensao') {
    const f = tensaoFaixa(typeof tensaoSala === 'number' ? tensaoSala : 0);
    return `${s.nome} — ${f.label} (${v === 0 ? 'sem penalidade' : v})`;
  }
  return `${v > 0 ? '+' : ''}${v} ${s.nome}`;
}

function situacaoHTML() {
  const itens = SITUACOES.map(s => `
    <label class="sit-item" title="${s.desc}">
      <input type="checkbox" class="sit-check" value="${s.id}" onchange="onSituacaoChange()">
      <span class="sit-val ${situacaoValor(s) >= 0 ? 'pos' : 'neg'}" data-sit-val="${s.id}">${_sitSinal(situacaoValor(s))}</span>
      <span class="sit-nome" data-sit-nome="${s.id}">${s.nome}</span>
    </label>`).join('');
  return `
    <div class="sit-wrap" id="roll-situacao">
      <button type="button" class="formula-select sit-toggle" id="sit-toggle" onclick="toggleSituacoes(event)">
        <span id="sit-resumo">Normal</span><span class="sit-seta">▾</span>
      </button>
      <div class="sit-menu" id="sit-menu">
        <div class="sit-menu-head">Marque tudo que se aplica — os valores se somam
          <button type="button" class="sit-limpar" onclick="limparSituacoes()">limpar</button>
        </div>
        ${itens}
      </div>
    </div>`;
}

function toggleSituacoes(ev) {
  if (ev) ev.stopPropagation();
  const m = document.getElementById('sit-menu');
  if (!m) return;
  const abrir = !m.classList.contains('aberto');
  m.classList.toggle('aberto', abrir);
  if (abrir) {
    atualizarSituacaoTensao();
    setTimeout(() => document.addEventListener('click', _fecharSituacoes, { once: true }), 0);
  }
}
function _fecharSituacoes(e) {
  const w = document.getElementById('roll-situacao');
  if (w && w.contains(e.target)) {
    document.addEventListener('click', _fecharSituacoes, { once: true });
    return;
  }
  document.getElementById('sit-menu')?.classList.remove('aberto');
}

function situacoesMarcadas() {
  const ids = [...document.querySelectorAll('#sit-menu .sit-check:checked')].map(c => c.value);
  return SITUACOES.filter(s => ids.includes(s.id));
}

function situacaoTotal() {
  return situacoesMarcadas().reduce((t, s) => t + situacaoValor(s), 0);
}

// Formata o valor com o sinal de menos tipográfico usado no resto da interface.
function _sitSinal(v) {
  if (v > 0) return `+${v}`;
  if (v < 0) return `\u2212${Math.abs(v)}`;
  return '\u00b10';
}

function situacaoTexto() {
  const m = situacoesMarcadas();
  if (!m.length) return '';
  return m.map(s => `${_sitSinal(situacaoValor(s))} ${s.nome}`).join(' \u00b7 ');
}

// Mantém a linha da Tensão em dia quando a mesa muda a trilha.
function atualizarSituacaoTensao() {
  const s = SITUACOES.find(x => x.dyn === 'tensao');
  if (!s) return;
  const v = situacaoValor(s);
  const elV = document.querySelector(`[data-sit-val="${s.id}"]`);
  const elN = document.querySelector(`[data-sit-nome="${s.id}"]`);
  if (elV) {
    elV.textContent = _sitSinal(v);
    elV.className = `sit-val ${v >= 0 ? 'pos' : 'neg'}`;
  }
  if (elN) elN.textContent = `${s.nome} (${tensaoFaixa(typeof tensaoSala === 'number' ? tensaoSala : 0).label})`;
  onSituacaoChange();
}

function onSituacaoChange() {
  const el = document.getElementById('sit-resumo');
  if (!el) return;
  const m = situacoesMarcadas();
  if (!m.length) { el.textContent = 'Normal'; el.classList.remove('sit-ativo'); return; }
  const t = situacaoTotal();
  el.textContent = `${m.length} selecionada${m.length > 1 ? 's' : ''} \u2014 total ${_sitSinal(t)}`;
  el.classList.add('sit-ativo');
}

function limparSituacoes() {
  document.querySelectorAll('#sit-menu .sit-check').forEach(c => { c.checked = false; });
  onSituacaoChange();
}

// ══════════════════════════════════════════════════
//  EXPRESSÕES DE DADO  —  "1d8+2", "2d6+1d4-1", "d20+3"
//  Usado pela rolagem livre do chat (/r) e pelo rolador.
// ══════════════════════════════════════════════════
const DADO_MAX_QTD = 50, DADO_MAX_FACES = 1000;

// Devolve null se não for uma expressão de dado válida — assim uma mensagem
// comum de chat nunca é confundida com rolagem.
function parseExpressaoDado(txt) {
  if (!txt) return null;
  const limpo = String(txt).trim().replace(/\s+/g, '').replace(/[\u2212\u2013\u2014]/g, '-');
  if (!/^[+-]?(\d*[dD]\d+|\d+)([+-](\d*[dD]\d+|\d+))*$/.test(limpo)) return null;
  if (!/[dD]/.test(limpo)) return null;            // "2+2" não é rolagem

  const termos = limpo.match(/[+-]?(?:\d*[dD]\d+|\d+)/g) || [];
  const partes = [];
  let total = 0, temDado = false;

  for (const t of termos) {
    const sinal = t.startsWith('-') ? -1 : 1;
    const corpo = t.replace(/^[+-]/, '');
    if (/[dD]/.test(corpo)) {
      const [q, f] = corpo.split(/[dD]/);
      const qtd = q === '' ? 1 : parseInt(q, 10);
      const faces = parseInt(f, 10);
      if (!(qtd >= 1 && qtd <= DADO_MAX_QTD)) return null;
      if (!(faces >= 2 && faces <= DADO_MAX_FACES)) return null;
      const valores = [];
      for (let i = 0; i < qtd; i++) valores.push(Math.floor(Math.random() * faces) + 1);
      const soma = valores.reduce((a, b) => a + b, 0);
      total += sinal * soma;
      temDado = true;
      partes.push({ tipo: 'dado', sinal, qtd, faces, valores, soma });
    } else {
      const n = parseInt(corpo, 10);
      if (!Number.isFinite(n) || n > 9999) return null;
      total += sinal * n;
      partes.push({ tipo: 'fixo', sinal, valor: n });
    }
  }
  if (!temDado) return null;

  const texto = partes.map((p, i) => {
    const op = p.sinal < 0 ? '\u2212' : (i === 0 ? '' : '+');
    const corpo = p.tipo === 'dado'
      ? `${p.qtd}d${p.faces} [${p.valores.join(', ')}]`
      : String(p.valor);
    return (i === 0 ? op : ' ' + op + ' ') + corpo;
  }).join('');

  const dados = partes.filter(p => p.tipo === 'dado');
  const umDadoSo = dados.length === 1 && dados[0].qtd === 1;
  return {
    partes, total, texto,
    faces: umDadoSo ? dados[0].faces : null,          // para marcar crítico/falha
    resultado: umDadoSo ? dados[0].valores[0] : null,
    formula: limpo.toLowerCase(),
  };
}

// Rola uma expressão e publica no feed. Devolve false se não for expressão.
function rolarExpressao(txt) {
  const r = parseExpressaoDado(txt);
  if (!r) return false;
  const crit  = r.faces === 20 && r.resultado === 20;
  const falha = r.faces === 20 && r.resultado === 1;
  mostrarAnimacaoDado(r.faces || 20, r.total, crit, falha);
  publicarSala('roll', {
    dado: r.faces || 0,
    resultado_dado: r.resultado ?? r.total,
    total: r.total,
    oculto: rolagemOculta(),
    formula: r.formula,
    label: `${r.formula} \u2192 ${r.texto}`,
  });
  // Guarda para o botão de repetir da folha no celular.
  if (typeof mobLembrarRolagem === 'function') mobLembrarRolagem('expr', txt.trim());
  return true;
}

// ══════════════════════════════════════════════════
//  MODIFICADOR DE ATRIBUTO VINDO DA FICHA
//  Antes era preciso caçar "COM +1" entre 31 opções do seletor. Agora
//  escolhe-se só o atributo e o valor vem da ficha aberta.
// ══════════════════════════════════════════════════
//  O modificador de um atributo, lido da ficha aberta.
//
//  No Fractured existe um campo MOD ao lado do valor, e ele é a fonte.
//  Na ficha Shinobi esse campo não existe — lá o valor JÁ é o bônus, e
//  repetir o mesmo número em duas caixas era exatamente o que você
//  pediu para tirar. Sem o campo MOD, a conta sai do valor.
//
//  O `v > 0` de antes escondia um erro: um atributo −1 (que existe em
//  A Vontade do Fogo) devolvia 0. Agora vale qualquer número.
function modDoAtributo(id) {
  if (!id) return 0;
  const n = parseInt(document.getElementById('m-' + id)?.value, 10);
  if (Number.isFinite(n)) return n;
  const v = parseInt(document.getElementById('a-' + id)?.value, 10);
  return Number.isFinite(v) ? modAtrib(v) : 0;
}

// Mostra o modificador atual dentro de cada opção do seletor.
function atualizarRotulosAtributo() {
  const sel = document.getElementById('roll-atrib');
  if (!sel) return;
  [...sel.options].forEach(o => {
    if (!o.value) return;
    const m = modDoAtributo(o.value);
    o.textContent = `${o.value.toUpperCase()} (${m > 0 ? '+' : m < 0 ? '\u2212' : '\u00b1'}${Math.abs(m)})`;
  });
}

function rolarFormula() {
  const atribId   = document.getElementById('roll-atrib')?.value || '';
  const modAtrib  = modDoAtributo(atribId);
  const faces     = parseInt(document.getElementById('roll-dado')?.value) || 20;
  const modPer    = parseInt(document.getElementById('roll-pericia')?.value)  || 0;
  const modSit    = situacaoTotal();   // soma de todas as situações marcadas
  // Dificuldade é OPCIONAL: vazio = rolagem livre (só mostra o total com bônus)
  const difSel = document.getElementById('roll-dif')?.value;
  let dif = null;
  if (difSel === 'custom') {
    dif = parseInt(document.getElementById('roll-dif-val')?.value) || null; // (id corrigido: antes lia um campo inexistente e caía sempre em 11)
  } else if (difSel !== '' && difSel != null) {
    dif = parseInt(difSel) || null;
  }
  const modCustom = parseInt(document.getElementById('roll-bonus-custom')?.value) || 0;

  // Ajudas: quanto cada ajudante vale e quantos cabem sai do sistema.
  const cfgAj    = S().rolagem.ajudantes;
  const ajudas   = parseInt(document.getElementById('roll-ajudas')?.value) || 0;
  const modAjuda = cfgAj ? Math.min(cfgAj.max, ajudas) * cfgAj.por : 0;

  // Vantagem/Desvantagem: só existe em sistemas que declaram. −1, 0 ou +1.
  const vantagem = parseInt(document.getElementById('roll-vantagem')?.value) || 0;

  // O sistema monta a rolagem; o núcleo só executa.
  const plano = S().rolagem.montar({
    faces, modAtrib, modPericia: modPer, modSituacao: modSit,
    modAjuda, modCustom,
    vantagem: vantagem > 0, desvantagem: vantagem < 0,
  });
  const r     = rolarPlano(plano);
  const dado  = r.principal;
  const bonus = r.bonus;
  const total = r.total;
  const grau  = interpretarRolagem(total, dif, dado);

  const atribText  = atribId
    ? `${atribId.toUpperCase()} ${modAtrib >= 0 ? '+' : '\u2212'}${Math.abs(modAtrib)}`
    : '';
  const perText    = document.getElementById('roll-pericia')?.selectedOptions[0]?.text || '';
  const sitText    = situacaoTexto();
  const ajudaText  = ajudas > 0 ? `${ajudas} ajudante(s) (+${modAjuda})` : '';
  const vantText   = vantagem > 0 ? `▲ Vantagem (${r.valores.join(', ')})`
                   : vantagem < 0 ? `▼ Desvantagem (${r.valores.join(', ')})` : '';
  const customText = modCustom !== 0 ? `manual (${modCustom>0?'+':''}${modCustom})` : '';

  mostrarAnimacaoDado(faces, dado, faces === 20 && dado === 20, faces === 20 && dado === 1);
  publicarSala('roll', {
    dado: faces,
    resultado_dado: dado,
    bonus,
    total,
    dif,
    oculto: rolagemOculta(),
    sistema: sistemaId(),
    grau,                                  // como o SISTEMA leu o resultado
    dados: r.valores.length > 1 ? r.valores : undefined,   // Vantagem mostra os dois
    label: [atribText,
      perText !== 'Sem perícia (+0)' ? perText : '',
      sitText, vantText,
      ajudaText, customText
    ].filter(Boolean).join(' · ')
  });
  if (typeof mobLembrarRolagem === 'function') mobLembrarRolagem('formula', true);
}

async function enviarMsg() {
  const input = document.getElementById('msg-input');
  const texto = input.value.trim();
  if (!texto) return;

  // "/r 1d8+2", "/rolar 2d6", ou a expressão direta "1d8+2".
  // Sem a barra só vale se a mensagem INTEIRA for uma expressão válida —
  // uma frase normal nunca é confundida com rolagem.
  const semBarra = texto.replace(/^\/(rolar|roll|r)\s*/i, '');
  const pediuRolagem = /^\/(rolar|roll|r)\b/i.test(texto);
  if (pediuRolagem || parseExpressaoDado(texto)) {
    if (rolarExpressao(semBarra)) { input.value = ''; return; }
    if (pediuRolagem) { toast('Não entendi. Exemplos: /r 1d8+2 · /r 2d6 · /r 1d20+3', 'err'); return; }
  }

  input.value = '';
  await publicarSala('mensagem', { texto });
}

// ── TENSÃO ────────────────────────────────────────
async function alterarTensao(delta) {
  if (!isMaster) return;
  tensaoSala = Math.max(0, Math.min(10, tensaoSala + delta));
  const status = tensaoFaixa(tensaoSala).label;
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

// O painel só recarregava ao entrar na aba: se o player salvasse (ou refizesse)
// a ficha, o mestre continuava vendo o estado antigo até trocar de aba.
// Agora escuta a tabela `fichas` em tempo real, com uma sondagem de reserva
// caso o realtime não esteja ligado para essa tabela no Supabase.
let _playersSub = null;
let _playersSubMesa = null;
let _playersPoll = null;
let _playersTimer = null;
let _playersMostrarTodos = false;

function _masterVisivel() {
  const el = document.getElementById('page-master');
  return !!el && el.style.display !== 'none';
}

// Um player salvando dispara vários eventos seguidos (autoSave) — junta tudo.
function _agendarRecarregarPlayers() {
  clearTimeout(_playersTimer);
  _playersTimer = setTimeout(() => {
    if (_masterVisivel()) carregarPlayers(_playersMostrarTodos, true);
  }, 500);
}

function subscribePlayers() {
  if (!isMaster || !mesaId()) return;

  // Sondagem de reserva: garante a atualização mesmo se a tabela `fichas` não
  // estiver publicada no realtime do Supabase.
  clearInterval(_playersPoll);
  _playersPoll = setInterval(() => {
    if (_masterVisivel()) carregarPlayers(_playersMostrarTodos, true);
  }, 15000);

  if (_playersSub && _playersSubMesa === mesaId()) return;
  if (_playersSub) { try { db.removeChannel(_playersSub); } catch (e) {} _playersSub = null; }

  _playersSubMesa = mesaId();
  _playersSub = db
    .channel('fichas-live-' + mesaId())
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'fichas', filter: 'mesa_id=eq.' + mesaId() },
        () => _agendarRecarregarPlayers())
    .subscribe(status => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        try { db.removeChannel(_playersSub); } catch (e) {}
        _playersSub = null; _playersSubMesa = null;
        setTimeout(() => { if (_masterVisivel()) subscribePlayers(); }, 2000);
      }
    });
}

// silencioso = recarrega sem piscar o "Carregando..." (usado pelo tempo real)
async function carregarPlayers(mostrarTodos = false, silencioso = false) {
  _playersMostrarTodos = mostrarTodos;
  const grid = document.getElementById('players-grid');
  if (!grid) return;
  if (!silencioso) grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Carregando...</p></div>';

  const { data: _membros } = await db
    .from('mesa_membros')
    .select('user_id, profiles(username)')
    .eq('mesa_id', mesaId());

  // Membros da mesa, exceto o mestre dela
  const profiles = (_membros || [])
    .filter(m => m.user_id !== MESA?.master_id)
    .map(m => ({ id: m.user_id, username: m.profiles?.username || 'Player' }));

  if (!profiles || profiles.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">${fracIcon('players', { size: 36 })}</div><p>Nenhum player entrou na mesa ainda.<br><span style="font-size:11px;color:var(--muted)">Mande o código de convite pra eles!</span></p></div>`;
    return;
  }

  const ids = profiles.map(p => p.id);
  const { data: _fichasLinhas } = await db
    .from('fichas')
    .select('*')
    .eq('mesa_id', mesaId())
    .in('user_id', ids);
  const fichas = (_fichasLinhas || []).map(fichaLida);

  // Separa quem tem e quem não tem ficha
  const comFicha    = profiles.filter(p => fichas?.find(f => f.user_id === p.id));
  const semFicha    = profiles.filter(p => !fichas?.find(f => f.user_id === p.id));
  const visiveis    = mostrarTodos ? profiles : comFicha;

  const _scroll = grid.scrollTop;
  grid.innerHTML = '';

  // Botão de toggle no topo
  const toggleRow = document.createElement('div');
  toggleRow.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px';
  toggleRow.innerHTML = `
    <span style="font-size:11px;color:var(--muted)">
      ${comFicha.length} com ficha · ${semFicha.length} sem ficha
      <span style="opacity:.6">· atualizado ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
    </span>
    <button class="btn-ghost" style="font-size:10px;padding:5px 12px" onclick="carregarPlayers(${!mostrarTodos})">
      ${mostrarTodos ? '👁 Ocultar sem ficha' : '👁 Ver todos os players'}
    </button>
  `;
  grid.appendChild(toggleRow);

  if (visiveis.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'grid-column:1/-1';
    empty.innerHTML = `<div class="empty-state"><div class="empty-icon">${fracIcon('ficha', { size: 36 })}</div><p>Nenhum player criou ficha ainda.</p></div>`;
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
      const pvMax = derivado('pv_max', atributosDe(ficha));
      let pct = Math.round((ficha.pv_atual / pvMax) * 100);
      if (!isFinite(pct)) pct = 0; // ficha custom (sem PV do FRACTURED)
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
          ${S().atributos.map(a => `${a.sigla}:${ficha['attr_' + a.id] || 0}`).join(' · ')}
        </div>
        <div style="margin-top:8px;font-size:10px;color:var(--muted)">
          <strong style="color:var(--text)">Trauma:</strong> ${ficha.trauma || '—'}
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-ghost" style="font-size:10px;padding:5px 10px;display:inline-flex;align-items:center;gap:5px" onclick="verFichaCompleta('${player.id}')">${fracIcon('ficha', { size: 13 })}Ver ficha completa</button>
          <button class="btn-ghost" style="font-size:10px;padding:5px 10px;color:var(--red);border-color:var(--red-dim)" onclick="apagarFichaPlayer('${player.id}', '${(ficha.nome || player.username).replace(/'/g,"\\'")}')">🗑 Apagar ficha</button>
        </div>
      `;
    }
    grid.appendChild(card);
  });

  grid.scrollTop = _scroll;
}

async function apagarFichaPlayer(userId, nome) {
  if (!confirm(`Apagar a ficha de "${nome}" desta mesa? Isso não pode ser desfeito.`)) return;
  // Escopado à mesa atual — a ficha do player em OUTRAS mesas não é tocada
  const { error } = await db.from('fichas').delete().eq('user_id', userId).eq('mesa_id', mesaId());
  if (error) return toast('Erro ao apagar ficha!', 'err');
  toast(`Ficha de ${nome} apagada.`, 'ok');
  carregarPlayers(_playersMostrarTodos);
}

async function verFichaCompleta(userId) {
  const { data: _fLinha } = await db.from('fichas').select('*').eq('user_id', userId).eq('mesa_id', mesaId()).maybeSingle();
  const ficha = fichaLida(_fLinha);   // Fractured: nada muda. Sistema novo: vem de `dados`.
  if (ficha?.dados_custom && MESA?.ficha_template?.secoes?.length) {
    // Ficha do modelo customizado da mesa
    let html = '';
    MESA.ficha_template.secoes.forEach(sec => {
      html += `<div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin:12px 0 6px">${esc(sec.titulo)}</div>`;
      (sec.campos || []).forEach(c => {
        let v = ficha.dados_custom[c.id];
        if (v && typeof v === 'object') v = v.atual; // formato antigo
        let txt;
        if (c.tipo === 'barra' || c.tipo === 'marcador') txt = `${v ?? c.max ?? 0} / ${c.max ?? 0}`;
        else if (c.tipo === 'check') txt = v ? '✔ Sim' : '✖ Não';
        else if (c.tipo === 'atributo_mod') { const m = Math.floor(((parseInt(v)||0)-10)/2); txt = `${v ?? 10} (${m>=0?'+':''}${m})`; }
        else txt = v ?? '—';
        html += `<div style="display:flex;gap:8px;font-size:12px;margin-bottom:4px">
          <span style="color:var(--muted);min-width:130px">${esc(c.label)}:</span>
          <span style="color:var(--text);white-space:pre-wrap">${esc(String(txt))}</span></div>`;
      });
    });
    const m = document.createElement('div');
    m.style.cssText = 'position:fixed;inset:0;z-index:8600;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:16px';
    m.innerHTML = `<div style="width:100%;max-width:520px;max-height:90vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--border);border-radius:10px;padding:16px">
      <div style="font-size:15px;font-weight:700;color:var(--gold);margin-bottom:6px;display:flex;align-items:center;gap:7px">${fracIcon('ficha', { size: 15 })}${esc(ficha.nome || 'Ficha')}</div>${html}
      <button class="btn-ghost" style="width:100%;margin-top:12px;font-size:11px;padding:8px" onclick="this.closest('div').parentElement.remove()">Fechar</button></div>`;
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    document.body.appendChild(m);
    return;
  }
  const { data: profile } = await db.from('profiles').select('username').eq('id', userId).single();
  if (!ficha) return toast('Ficha não encontrada.', 'err');

  const pvMax = derivado('pv_max', atributosDe(ficha));
  const pericias = (ficha.pericias || []).filter(p => p.nome).map(p => `<li>${p.nome} <span style="color:var(--purple)">(${p.atrib})</span></li>`).join('');
  const vinculos = (ficha.vinculos || []).filter(v => v.personagem).map(v =>
    `<li><strong>${v.personagem}</strong> — ${v.tipo || '?'}<br>
     <span style="color:var(--muted);font-size:11px">Promessa: ${v.promessa || '—'} · Dívida: ${v.divida || '—'}</span></li>`
  ).join('');
  const itens = Array.isArray(ficha.itens) && ficha.itens.length
    ? ficha.itens.filter(it => it.nome).map(it => esc(it.nome) + (it.detalhe ? ` <span style="color:var(--muted)">(${esc(it.detalhe)})</span>` : '')).join(' · ')
    : esc(ficha.inventario || '');

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

      <div style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:2px;margin-bottom:8px">TRAUMA</div>
      <div style="margin-bottom:14px;font-style:italic;color:var(--muted)">${ficha.trauma || '—'}</div>

      <div style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:2px;margin-bottom:8px">ATRIBUTOS</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">
        ${S().atributos.map(at => {
          const val = ficha['attr_' + at.id] || 0;
          const mod = modAtrib(val);
          return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:9px;color:var(--gold);font-weight:700">${at.sigla}</div>
            <div style="font-size:20px;font-weight:700">${val}</div>
            <div style="font-size:11px;color:var(--purple)">${mod >= 0 ? '+' : ''}${mod}</div>
          </div>`;
        }).join('')}
      </div>

      <div style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:2px;margin-bottom:8px">RECURSOS</div>
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <div style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center">
          <div style="font-size:9px;color:var(--muted)">PV</div>
          <div style="font-size:18px;font-weight:700;color:var(--accent-text)">${ficha.pv_atual}/${pvMax}</div>
        </div>
        <div style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center">
          <div style="font-size:9px;color:var(--muted)">HUMANIDADE</div>
          <div style="font-size:18px;font-weight:700;color:var(--accent-text)">${ficha.humanidade}/10</div>
        </div>
        <div style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center">
          <div style="font-size:9px;color:var(--muted)">SUPRIMENTOS</div>
          <div style="font-size:18px;font-weight:700;color:var(--gold-text)">${ficha.suprimentos}/10</div>
        </div>
      </div>

      ${pericias ? `<div style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:2px;margin-bottom:8px">PERÍCIAS</div>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:4px;margin-bottom:14px;font-size:13px">${pericias}</ul>` : ''}

      ${vinculos ? `<div style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:2px;margin-bottom:8px">VÍNCULOS</div>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:14px;font-size:13px">${vinculos}</ul>` : ''}

      ${itens ? `<div style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:2px;margin-bottom:8px">INVENTÁRIO</div>
      <div style="font-size:12px;color:var(--muted);white-space:pre-wrap;margin-bottom:14px">${itens}</div>` : ''}
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
// Como o resultado da rolagem aparece no feed.
//
// A partir da fase 8 a própria rolagem carrega o `grau` — quem leu o
// número foi o sistema que a produziu. Mensagens antigas (e as de
// sistemas que não declaram leitura) caem na regra de sempre: total
// maior ou igual à dificuldade é sucesso. É isso que faz o histórico
// continuar legível depois da mudança.
function _grauDaRolagem(c) {
  if (!c.dif && !c.grau) return '';
  const g = c.grau || (c.dif == null ? null : (c.total >= c.dif
    ? { texto: '✓ SUCESSO', cor: 'var(--green)' }
    : { texto: '✗ FALHA',   cor: 'var(--red)'   }));
  if (!g) return '';
  const dif = c.dif ? ` (dif. ${c.dif})` : '';
  return `<span style="font-size:12px;color:${g.cor}"> — ${esc(g.texto)}${dif}</span>`;
}

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
  let _ts = msg.created_at || new Date().toISOString();
  if (typeof _ts === 'string' && !/Z|[+-]\d{2}:?\d{2}$/.test(_ts)) _ts += 'Z'; // sem fuso = UTC
  const hora = new Date(_ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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
      if (typeof updateMobileRollCard === 'function') updateMobileRollCard(msg);
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
        ${_grauDaRolagem(c)}
        ${isCrit  ? ' <span style="color:var(--gold)">⭐ CRÍTICO!</span>'       : ''}
        ${isFalha ? ' <span style="color:var(--red)">💀 FALHA CRÍTICA!</span>' : ''}
      </div>
      <div class="roll-detail">
        ${c.formula
          ? `rolou ${esc(c.label || c.formula)}`
          : `rolou 1d${c.dado} → ${c.resultado_dado}` +
            (c.bonus ? ` + bônus ${c.bonus > 0 ? '+' : ''}${c.bonus}` : '') +
            (c.label ? ` — ${esc(c.label)}` : '')}
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
  if (msg.tipo === 'roll' && typeof updateMobileRollCard === 'function') updateMobileRollCard(msg);
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
