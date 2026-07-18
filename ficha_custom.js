// ══════════════════════════════════════════════════
//  FICHA CUSTOMIZÁVEL v3 — estilo "Ficha Universal"
//  A ficha nasce NEUTRA com seções de exemplo e o
//  mestre alterna o MODO DE EDIÇÃO para modificá-la
//  em cima dela mesma: renomear, apagar, adicionar
//  seções e campos vendo o resultado ao vivo.
//  Também escolhe um TEMA (skin visual) para a mesa:
//  Escuro, Papiro, Cyberpunk, Medieval, Terror.
//  O tema só muda CSS/tipografia — nunca os dados.
//  Modelo: mesas.ficha_template · Valores: fichas.dados_custom
// ══════════════════════════════════════════════════

const FCB = { template: null, dados: {}, fichaRowId: null, saveTimer: null, tplTimer: null, editMode: false };

const FCB_CORES = ['#8b5cf6','#c0392b','#d63384','#2980d9','#16a085','#27ae60','#d4a017','#d35400','#7f8c8d','#556270'];

const FCB_TIPOS = [
  { id: 'texto',        nome: '📝 Texto curto' },
  { id: 'numero',       nome: '🔢 Número' },
  { id: 'area',         nome: '📄 Texto longo' },
  { id: 'atributo',     nome: '🎯 Card de atributo (valor grande)' },
  { id: 'atributo_mod', nome: '🎲 Atributo com modificador (D&D)' },
  { id: 'barra',        nome: '📊 Barra colorida (vida, mana...)' },
  { id: 'marcador',     nome: '⚫ Marcadores (bolinhas clicáveis)' },
  { id: 'check',        nome: '☑ Caixa de marcar' },
];

const FCB_TEMAS = [
  { id: 'escuro',     nome: 'Escuro'     },
  { id: 'papiro',     nome: 'Papiro',    icon: 'temaPapiro'    },
  { id: 'cyberpunk',  nome: 'Cyberpunk', icon: 'temaCyberpunk' },
  { id: 'medieval',   nome: 'Medieval',  icon: 'temaMedieval'  },
  { id: 'terror',     nome: 'Terror',    icon: 'temaTerror'    },
];

// Ficha neutra inicial — o mestre edita em cima dela
function _fcbTemplateNeutro() {
  return {
    nome_sistema: 'Minha Ficha',
    tema: 'escuro',
    secoes: [
      { titulo: 'Informações', campos: [
        { id: 'nome',      label: 'Nome',      tipo: 'texto' },
        { id: 'conceito',  label: 'Conceito',  tipo: 'texto' },
        { id: 'historia',  label: 'História',  tipo: 'area'  },
      ]},
      { titulo: 'Atributos', campos: [
        { id: 'forca',     label: 'Força',     tipo: 'atributo' },
        { id: 'agilidade', label: 'Agilidade', tipo: 'atributo' },
        { id: 'mente',     label: 'Mente',     tipo: 'atributo' },
      ]},
      { titulo: 'Recursos', campos: [
        { id: 'vida',    label: 'Vida',    tipo: 'barra',    cor: '#c0392b', max: 10 },
        { id: 'energia', label: 'Energia', tipo: 'barra',    cor: '#2980d9', max: 10 },
        { id: 'sorte',   label: 'Sorte',   tipo: 'marcador', cor: '#d4a017', max: 5  },
      ]},
    ],
  };
}

function fichaCustomAtiva() { return !!(MESA?.ficha_template?.secoes?.length); }

// ── ENTRADA ────────────────────────────────────────
async function fichaCustomInit() {
  const page = document.getElementById('page-ficha');
  if (!page) return;
  const { data } = await db.from('mesas').select('ficha_template').eq('id', mesaId()).maybeSingle();
  if (data) MESA.ficha_template = data.ficha_template;

  const custom = fichaCustomAtiva();
  [...page.children].forEach(el => { if (el.id !== 'fcb-container') el.style.display = custom ? 'none' : ''; });
  let cont = document.getElementById('fcb-container');
  if (custom) {
    if (!cont) { cont = document.createElement('div'); cont.id = 'fcb-container'; page.appendChild(cont); }
    cont.style.display = '';
    FCB.template = MESA.ficha_template;
    await _fcbCarregarDados();
    _fcbRender();
  } else if (cont) cont.style.display = 'none';
}

// Botão do Painel do Mestre: ativa a ficha custom (com o modelo neutro) e entra em edição
async function fcbAbrirEditor() {
  if (!isMaster) return;
  if (!fichaCustomAtiva()) {
    MESA.ficha_template = _fcbTemplateNeutro();
    await db.from('mesas').update({ ficha_template: MESA.ficha_template }).eq('id', mesaId());
    toast('Ficha neutra criada! Edite ela do seu jeito.', 'ok');
  }
  FCB.editMode = true;
  navigate('ficha');
}

// ── DADOS DO PLAYER ────────────────────────────────
async function _fcbCarregarDados() {
  const { data } = await db.from('fichas').select('id, dados_custom')
    .eq('user_id', currentUser.id).eq('mesa_id', mesaId()).maybeSingle();
  FCB.fichaRowId = data?.id || null;
  FCB.dados = data?.dados_custom || {};
}

function _fcbVal(c) {
  let v = FCB.dados[c.id];
  if (v && typeof v === 'object') v = v.atual; // formato antigo {atual,max}
  return v;
}

function _fcbSet(c, v) { FCB.dados[c.id] = v; _fcbAgendarSave(); }

function _fcbAgendarSave() {
  clearTimeout(FCB.saveTimer);
  const st = document.getElementById('fcb-status');
  if (st) { st.textContent = '● salvando...'; st.style.color = 'var(--gold)'; }
  FCB.saveTimer = setTimeout(_fcbSalvarDados, 1200);
}

async function _fcbSalvarDados() {
  const campoNome = (FCB.template.secoes || []).flatMap(s => s.campos).find(c => /nome/i.test(c.label));
  const nome = campoNome ? (FCB.dados[campoNome.id] || '') : '';
  const payload = { user_id: currentUser.id, mesa_id: mesaId(), dados_custom: FCB.dados };
  if (nome) payload.nome = String(nome);
  let error;
  if (FCB.fichaRowId) ({ error } = await db.from('fichas').update(payload).eq('id', FCB.fichaRowId));
  else {
    const { data, error: e } = await db.from('fichas').insert(payload).select('id').single();
    error = e; if (data) FCB.fichaRowId = data.id;
  }
  const st = document.getElementById('fcb-status');
  if (st) {
    st.textContent = error ? '⚠ erro ao salvar' : '✔ salvo';
    st.style.color = error ? 'var(--red)' : '';
    st.className = error ? '' : 'fcb-status-ok';
  }
}

// Salvamento do MODELO (estrutura) — mestre, com debounce
function _fcbAgendarSaveTpl() {
  if (!isMaster) return;
  clearTimeout(FCB.tplTimer);
  FCB.tplTimer = setTimeout(async () => {
    const { error } = await db.from('mesas').update({ ficha_template: FCB.template }).eq('id', mesaId());
    if (error) toast('Erro ao salvar o modelo: ' + error.message, 'err');
    else MESA.ficha_template = FCB.template;
  }, 1000);
}

function _fcbIdDoLabel(label) {
  return (label || 'campo').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || ('campo_' + Date.now());
}

// ── TEMA (skin visual da mesa) ──────────────────────
function fcbSetTema(tema) {
  if (!isMaster) return;
  FCB.template.tema = tema;
  _fcbAgendarSaveTpl();
  _fcbRender();
}

// ── RENDER PRINCIPAL ───────────────────────────────
function _fcbRender() {
  const cont = document.getElementById('fcb-container');
  if (!cont || !FCB.template) return;
  const t = FCB.template;
  const ed = FCB.editMode && isMaster;
  const tema = t.tema || 'escuro';
  cont.className = 'fcb-tema-' + tema + (ed ? ' fcb-edit' : '');

  let html = `
    <div class="fcb-header">
      <div class="fcb-header-left">
        ${ed
          ? `<input class="fcb-title-input" value="${esc(t.nome_sistema || '')}" placeholder="Nome do sistema" oninput="FCB.template.nome_sistema=this.value;_fcbAgendarSaveTpl()">`
          : `<div class="fcb-title">${esc(t.nome_sistema || 'Ficha da Mesa')}</div>`}
        <div class="fcb-sub">${ed ? '🛠 Modo de Edição — clique nos textos pra renomear' : `Ficha da mesa · <span id="fcb-status" class="fcb-status-ok">✔ salvo</span>`}</div>
      </div>
      <div class="fcb-header-right">
        ${isMaster ? `<div class="fcb-tema-switch">${FCB_TEMAS.map(tp => `<button class="fcb-tema-btn${tema === tp.id ? ' active' : ''}" onclick="fcbSetTema('${tp.id}')">${tp.icon ? fracIcon(tp.icon, { size: 12, color: 'currentColor' }) : ''}${tp.nome}</button>`).join('')}</div>` : ''}
        ${isMaster ? `<button class="fcb-btn" onclick="fcbToggleEdit()">${ed ? '⇆ Modo de Jogo' : '⇆ Modo de Edição'}</button>` : ''}
        ${ed ? `<button class="fcb-btn fcb-btn-danger" onclick="fcbVoltarPadrao()">↩ Ficha FRACTURED</button>` : ''}
      </div>
    </div>`;

  (t.secoes || []).forEach((sec, si) => {
    if (ed) html += _fcbSepNovaSecao(si);
    html += `<div class="fcb-section">
      <div class="fcb-section-head">
        ${ed
          ? `<input class="fcb-section-title-input" value="${esc(sec.titulo)}" placeholder="Título da seção" oninput="FCB.template.secoes[${si}].titulo=this.value;_fcbAgendarSaveTpl()">
             <span class="fcb-tool-row">
               <button class="fcb-tool-btn" title="Subir seção" onclick="fcbMoverSecao(${si},-1)">↑</button>
               <button class="fcb-tool-btn" title="Descer seção" onclick="fcbMoverSecao(${si},1)">↓</button>
               <button class="fcb-tool-btn fcb-tool-danger" title="Deletar toda a seção" onclick="fcbRemoverSecao(${si})">🗑</button>
             </span>`
          : `<div class="fcb-section-title">${esc(sec.titulo)}</div>`}
      </div>
      <div class="fcb-fields">`;

    (sec.campos || []).forEach((c, ci) => {
      html += _fcbRenderCampo(c, si, ci, ed, tema);
    });

    html += `</div>
      ${ed ? `<button class="fcb-add-field-btn" onclick="fcbMenuAddCampo(${si}, this)">＋ Adicionar campo</button>` : ''}
    </div>`;
  });
  if (ed) html += _fcbSepNovaSecao((t.secoes || []).length);

  cont.innerHTML = html;
  if (!ed) _fcbBindInputs(cont);
}

function _fcbSepNovaSecao(pos) {
  return `<div class="fcb-sep">
    <span class="fcb-sep-line"></span>
    <button class="fcb-sep-btn" onclick="fcbAddSecao(${pos})">＋ NOVA SEÇÃO</button>
    <span class="fcb-sep-line"></span>
  </div>`;
}

// ── RENDER DE CADA TIPO DE CAMPO ───────────────────
function _fcbRenderCampo(c, si, ci, ed, tema) {
  const v = _fcbVal(c);
  const label = ed
    ? `<input class="fcb-label-input" value="${esc(c.label)}" placeholder="Nome do campo" oninput="fcbRenomearCampo(${si},${ci},this.value)">`
    : `<label class="fcb-label">${esc(c.label).toUpperCase()}</label>`;
  const ferramentas = ed
    ? `<div class="fcb-field-tools">
        <button class="fcb-tool-btn" onclick="fcbMoverCampo(${si},${ci},-1)">←</button>
        <button class="fcb-tool-btn" onclick="fcbMoverCampo(${si},${ci},1)">→</button>
        <button class="fcb-tool-btn fcb-tool-danger" onclick="fcbRemoverCampo(${si},${ci})">🗑</button>
      </div>` : '';

  // Card de atributo: valor grande + nome (aceita "d4", "10"...)
  if (c.tipo === 'atributo') {
    return `<div class="fcb-field fcb-field-attr">
      <input class="fcb-attr-val" data-fcb="${c.id}" ${ed ? 'disabled' : ''} value="${esc(String(v ?? ''))}" placeholder="—">
      <div class="fcb-attr-label">${ed ? `<input class="fcb-label-input fcb-label-input-center" value="${esc(c.label)}" oninput="fcbRenomearCampo(${si},${ci},this.value)">` : esc(c.label)}</div>
      ${ferramentas}
    </div>`;
  }

  // Atributo com modificador automático (estilo D&D: mod = (valor−10)÷2)
  if (c.tipo === 'atributo_mod') {
    const num = parseInt(v) || 0;
    const mod = Math.floor((num - 10) / 2);
    return `<div class="fcb-field fcb-field-attrmod">
      <input class="fcb-attrmod-val" data-fcb="${c.id}" type="number" ${ed ? 'disabled' : ''} value="${esc(String(v ?? 10))}">
      <div class="fcb-attrmod-mod" data-fcb-mod="${c.id}">${mod >= 0 ? '+' : ''}${mod}</div>
      <div class="fcb-attr-label">${ed ? `<input class="fcb-label-input fcb-label-input-center" value="${esc(c.label)}" oninput="fcbRenomearCampo(${si},${ci},this.value)">` : esc(c.label)}</div>
      ${ferramentas}
    </div>`;
  }

  // Barra colorida com −/+ (vida, mana, sanidade...)
  if (c.tipo === 'barra') {
    const max = c.max ?? 10, atual = Math.min(parseInt(v) ?? max, max);
    const val = isNaN(atual) ? max : atual;
    const cor = c.cor || '#8b5cf6';
    const pct = max > 0 ? Math.max(0, Math.min(100, (val / max) * 100)) : 0;
    return `<div class="fcb-field fcb-field-bar">
      ${label}
      <div class="fcb-bar-row">
        ${!ed ? `<button class="fcb-bar-btn" onclick="fcbBarra('${c.id}',-1,${max})">−</button>` : ''}
        <div class="fcb-bar-track">
          <div class="fcb-bar-fill" style="width:${pct}%;background:${cor}"></div>
          <div class="fcb-bar-value">${val}/${max}</div>
        </div>
        ${!ed ? `<button class="fcb-bar-btn" onclick="fcbBarra('${c.id}',1,${max})">+</button>` : ''}
      </div>
      ${ed ? `<div class="fcb-field-config">
        <span class="fcb-config-label">COR:</span>
        ${FCB_CORES.map(cr => `<span class="fcb-swatch${cr === cor ? ' active' : ''}" style="background:${cr}" onclick="fcbCorCampo(${si},${ci},'${cr}')"></span>`).join('')}
        <span class="fcb-config-label fcb-config-label-gap">MÁX:</span>
        <input type="number" class="fcb-input-mini" value="${max}" oninput="fcbMaxCampo(${si},${ci},this.value)">
      </div>` : ''}
      ${ferramentas}
    </div>`;
  }

  // Marcadores (bolinhas clicáveis — viram estrela/escudo/caveira conforme o tema)
  if (c.tipo === 'marcador') {
    const max = c.max ?? 5, atual = Math.max(0, Math.min(parseInt(v) || 0, max));
    const cor = c.cor || '#8b5cf6';
    let pips = '';
    for (let i = 0; i < max; i++) {
      const on = i < atual;
      pips += `<span class="fcb-pip${on ? ' on' : ''}" ${!ed ? `onclick="fcbPip('${c.id}',${i},${max})"` : ''} style="--pip-cor:${cor}"></span>`;
    }
    return `<div class="fcb-field fcb-field-marker">
      <div class="fcb-marker-row">
        <div class="fcb-marker-label">${label}</div>
        <div class="fcb-pip-row">${pips}</div>
      </div>
      ${ed ? `<div class="fcb-field-config">
        <span class="fcb-config-label">COR:</span>
        ${FCB_CORES.map(cr => `<span class="fcb-swatch${cr === cor ? ' active' : ''}" style="background:${cr}" onclick="fcbCorCampo(${si},${ci},'${cr}')"></span>`).join('')}
        <span class="fcb-config-label fcb-config-label-gap">MÁX:</span>
        <input type="number" min="1" max="20" class="fcb-input-mini" value="${max}" oninput="fcbMaxCampo(${si},${ci},this.value)">
      </div>` : ''}
      ${ferramentas}
    </div>`;
  }

  // Checkbox
  if (c.tipo === 'check') {
    return `<div class="fcb-field fcb-field-check">
      <label class="fcb-check-label">
        <input type="checkbox" data-fcb="${c.id}" ${v ? 'checked' : ''} ${ed ? 'disabled' : ''} class="fcb-checkbox">
        ${ed ? `<input class="fcb-label-input" value="${esc(c.label)}" oninput="fcbRenomearCampo(${si},${ci},this.value)">` : esc(c.label)}
      </label>
      ${ferramentas}
    </div>`;
  }

  // Texto longo
  if (c.tipo === 'area') {
    return `<div class="fcb-field fcb-field-area">
      ${label}
      <textarea class="fcb-input fcb-textarea" data-fcb="${c.id}" rows="4" ${ed ? 'disabled' : ''}>${esc(String(v ?? ''))}</textarea>
      ${ferramentas}
    </div>`;
  }

  // Texto curto / número (padrão)
  return `<div class="fcb-field fcb-field-text">
    ${label}
    <input type="${c.tipo === 'numero' ? 'number' : 'text'}" class="fcb-input" data-fcb="${c.id}" ${ed ? 'disabled' : ''} value="${esc(String(v ?? ''))}">
    ${ferramentas}
  </div>`;
}

// ── INTERAÇÕES (modo de jogo) ──────────────────────
function _fcbBindInputs(cont) {
  cont.querySelectorAll('[data-fcb]').forEach(el => {
    el.addEventListener('input', () => {
      const id = el.dataset.fcb;
      const c = _fcbCampoPorId(id);
      let val;
      if (el.type === 'checkbox') val = el.checked;
      else if (el.type === 'number') val = parseFloat(el.value) || 0;
      else val = el.value;
      _fcbSet(c || { id }, val);
      // Atualiza o modificador D&D ao vivo
      const modEl = cont.querySelector(`[data-fcb-mod="${id}"]`);
      if (modEl) {
        const mod = Math.floor(((parseInt(val) || 0) - 10) / 2);
        modEl.textContent = (mod >= 0 ? '+' : '') + mod;
      }
    });
  });
}

function _fcbCampoPorId(id) {
  return (FCB.template.secoes || []).flatMap(s => s.campos).find(c => c.id === id);
}

function fcbBarra(id, delta, max) {
  const c = _fcbCampoPorId(id);
  let v = _fcbVal(c); v = (v == null || isNaN(parseInt(v))) ? max : parseInt(v);
  v = Math.max(0, Math.min(max, v + delta));
  _fcbSet(c, v); _fcbRender();
}

function fcbPip(id, i, max) {
  const c = _fcbCampoPorId(id);
  const atual = parseInt(_fcbVal(c)) || 0;
  const novo = (i + 1 === atual) ? i : i + 1; // clicar na última acesa apaga ela
  _fcbSet(c, Math.max(0, Math.min(max, novo))); _fcbRender();
}

// ── EDIÇÃO DE ESTRUTURA (mestre) ───────────────────
function fcbToggleEdit() {
  if (!isMaster) return;
  FCB.editMode = !FCB.editMode;
  if (!FCB.editMode) toast('Modelo salvo! Avise os players para darem F5.', 'ok');
  _fcbRender();
}

function fcbRenomearCampo(si, ci, label) {
  const c = FCB.template.secoes[si].campos[ci];
  const idNovo = _fcbIdDoLabel(label);
  // migra o valor preenchido junto com o rename
  if (idNovo !== c.id && FCB.dados[c.id] !== undefined) {
    FCB.dados[idNovo] = FCB.dados[c.id];
  }
  c.label = label; c.id = idNovo;
  _fcbAgendarSaveTpl();
}

function fcbCorCampo(si, ci, cor) { FCB.template.secoes[si].campos[ci].cor = cor; _fcbAgendarSaveTpl(); _fcbRender(); }
function fcbMaxCampo(si, ci, v)  { FCB.template.secoes[si].campos[ci].max = Math.max(1, parseInt(v) || 1); _fcbAgendarSaveTpl(); }

function fcbAddSecao(pos) {
  FCB.template.secoes.splice(pos, 0, { titulo: 'Nova seção', campos: [] });
  _fcbAgendarSaveTpl(); _fcbRender();
}
function fcbRemoverSecao(si) {
  if (!confirm(`Deletar a seção "${FCB.template.secoes[si].titulo}" e todos os campos dela?`)) return;
  FCB.template.secoes.splice(si, 1); _fcbAgendarSaveTpl(); _fcbRender();
}
function fcbMoverSecao(si, dir) {
  const a = FCB.template.secoes, j = si + dir;
  if (j < 0 || j >= a.length) return;
  [a[si], a[j]] = [a[j], a[si]]; _fcbAgendarSaveTpl(); _fcbRender();
}
function fcbRemoverCampo(si, ci) { FCB.template.secoes[si].campos.splice(ci, 1); _fcbAgendarSaveTpl(); _fcbRender(); }
function fcbMoverCampo(si, ci, dir) {
  const a = FCB.template.secoes[si].campos, j = ci + dir;
  if (j < 0 || j >= a.length) return;
  [a[ci], a[j]] = [a[j], a[ci]]; _fcbAgendarSaveTpl(); _fcbRender();
}

// Menu de tipos ao adicionar campo
function fcbMenuAddCampo(si, btn) {
  document.getElementById('fcb-tipo-menu')?.remove();
  const menu = document.createElement('div');
  menu.id = 'fcb-tipo-menu';
  menu.style.cssText = 'position:absolute;background:#161209;border:1px solid var(--gold);border-radius:8px;z-index:50;box-shadow:0 6px 20px rgba(0,0,0,0.7);overflow:hidden;min-width:250px';
  FCB_TIPOS.forEach(tp => {
    const item = document.createElement('div');
    item.textContent = tp.nome;
    item.style.cssText = 'padding:9px 13px;font-size:12px;color:var(--text);cursor:pointer';
    item.onmouseenter = () => { item.style.background = 'rgba(201,168,76,0.14)'; item.style.color = 'var(--gold)'; };
    item.onmouseleave = () => { item.style.background = ''; item.style.color = 'var(--text)'; };
    item.onclick = () => {
      const campo = { id: 'campo_' + Date.now(), label: 'Novo campo', tipo: tp.id };
      if (tp.id === 'barra') { campo.max = 10; campo.cor = '#c0392b'; }
      if (tp.id === 'marcador') { campo.max = 5; campo.cor = '#8b5cf6'; }
      FCB.template.secoes[si].campos.push(campo);
      menu.remove(); _fcbAgendarSaveTpl(); _fcbRender();
    };
    menu.appendChild(item);
  });
  const r = btn.getBoundingClientRect();
  menu.style.left = r.left + 'px';
  menu.style.top = (r.top + window.scrollY - FCB_TIPOS.length * 37 - 8) + 'px';
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', function fechar(e) {
    if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', fechar); }
  }), 50);
}

async function fcbVoltarPadrao() {
  if (!confirm('Voltar para a ficha FRACTURED padrão? (o que os players preencheram fica guardado)')) return;
  const { error } = await db.from('mesas').update({ ficha_template: null }).eq('id', mesaId());
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  MESA.ficha_template = null;
  FCB.editMode = false;
  toast('Ficha FRACTURED restaurada.', 'ok');
  fichaCustomInit();
}
