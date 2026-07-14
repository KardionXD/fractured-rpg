// ══════════════════════════════════════════════════
//  FICHA CUSTOMIZÁVEL v2 — estilo "Ficha Universal"
//  A ficha nasce NEUTRA com seções de exemplo e o
//  mestre alterna o MODO DE EDIÇÃO para modificá-la
//  em cima dela mesma: renomear, apagar, adicionar
//  seções e campos vendo o resultado ao vivo.
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

// Ficha neutra inicial — o mestre edita em cima dela
function _fcbTemplateNeutro() {
  return {
    nome_sistema: 'Minha Ficha',
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
    st.style.color = error ? 'var(--red)' : 'var(--green)';
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
  return (label || 'campo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || ('campo_' + Date.now());
}

// ── RENDER PRINCIPAL ───────────────────────────────
function _fcbRender() {
  const cont = document.getElementById('fcb-container');
  if (!cont || !FCB.template) return;
  const t = FCB.template;
  const ed = FCB.editMode && isMaster;
  const inp = 'box-sizing:border-box;background:rgba(0,0,0,0.35);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px 10px;font-size:13px;width:100%';
  const inpEd = 'box-sizing:border-box;background:transparent;border:none;border-bottom:1px dashed var(--gold);color:var(--gold);font-size:inherit;font-weight:inherit;padding:2px 4px;outline:none';
  const btnMini = 'background:var(--red);border:none;border-radius:5px;color:#fff;font-size:10px;width:20px;height:20px;cursor:pointer;flex-shrink:0';
  const btnMove = 'background:rgba(255,255,255,0.07);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:10px;width:20px;height:20px;cursor:pointer;flex-shrink:0';

  let html = `
    <div class="page-header">
      <div>
        ${ed
          ? `<input style="${inpEd};font-size:19px;font-weight:800" value="${esc(t.nome_sistema || '')}" placeholder="Nome do sistema" oninput="FCB.template.nome_sistema=this.value;_fcbAgendarSaveTpl()">`
          : `<div class="page-title">${esc(t.nome_sistema || 'Ficha da Mesa')}</div>`}
        <div class="page-sub">${ed ? '🛠 Modo de Edição — clique nos textos pra renomear' : `Ficha da mesa · <span id="fcb-status" style="color:var(--green)">✔ salvo</span>`}</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${isMaster ? `<button class="btn-ghost" style="font-size:11px;padding:6px 12px;${ed ? 'color:var(--gold);border-color:var(--gold)' : ''}" onclick="fcbToggleEdit()">${ed ? '⇆ Modo de Jogo' : '⇆ Modo de Edição'}</button>` : ''}
        ${ed ? `<button class="btn-ghost" style="font-size:11px;padding:6px 12px;color:var(--red);border-color:var(--red)" onclick="fcbVoltarPadrao()">↩ Ficha FRACTURED</button>` : ''}
      </div>
    </div>`;

  (t.secoes || []).forEach((sec, si) => {
    if (ed) html += _fcbSepNovaSecao(si);
    html += `<div style="border:1px solid ${ed ? 'var(--gold)' : 'var(--border)'};border-radius:10px;padding:14px;margin-bottom:14px;background:rgba(0,0,0,0.2)">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
        ${ed
          ? `<input style="${inpEd};flex:1;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase" value="${esc(sec.titulo)}" placeholder="Título da seção" oninput="FCB.template.secoes[${si}].titulo=this.value;_fcbAgendarSaveTpl()">
             <button style="${btnMove}" title="Subir seção" onclick="fcbMoverSecao(${si},-1)">↑</button>
             <button style="${btnMove}" title="Descer seção" onclick="fcbMoverSecao(${si},1)">↓</button>
             <button style="${btnMini}" title="Deletar toda a seção" onclick="fcbRemoverSecao(${si})">🗑</button>`
          : `<div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase">${esc(sec.titulo)}</div>`}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px">`;

    (sec.campos || []).forEach((c, ci) => {
      html += _fcbRenderCampo(c, si, ci, ed, { inp, inpEd, btnMini, btnMove });
    });

    html += `</div>
      ${ed ? `<button class="btn-ghost" style="width:100%;font-size:10px;padding:6px;margin-top:10px" onclick="fcbMenuAddCampo(${si}, this)">＋ Adicionar campo</button>` : ''}
    </div>`;
  });
  if (ed) html += _fcbSepNovaSecao((t.secoes || []).length);

  cont.innerHTML = html;
  if (!ed) _fcbBindInputs(cont);
}

function _fcbSepNovaSecao(pos) {
  return `<div style="display:flex;align-items:center;gap:10px;margin:10px 0">
    <div style="flex:1;border-top:1px dashed var(--border)"></div>
    <button class="btn-ghost" style="font-size:10px;padding:4px 12px" onclick="fcbAddSecao(${pos})">＋ NOVA SEÇÃO</button>
    <div style="flex:1;border-top:1px dashed var(--border)"></div>
  </div>`;
}

// ── RENDER DE CADA TIPO DE CAMPO ───────────────────
function _fcbRenderCampo(c, si, ci, ed, s) {
  const v = _fcbVal(c);
  const label = ed
    ? `<input style="${s.inpEd};width:100%;font-size:10px;letter-spacing:1px" value="${esc(c.label)}" placeholder="Nome do campo" oninput="fcbRenomearCampo(${si},${ci},this.value)">`
    : `<label style="display:block;font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:3px">${esc(c.label).toUpperCase()}</label>`;
  const ferramentas = ed
    ? `<div style="display:flex;gap:3px;justify-content:flex-end;margin-top:5px">
        <button style="${s.btnMove}" onclick="fcbMoverCampo(${si},${ci},-1)">←</button>
        <button style="${s.btnMove}" onclick="fcbMoverCampo(${si},${ci},1)">→</button>
        <button style="${s.btnMini}" onclick="fcbRemoverCampo(${si},${ci})">🗑</button>
      </div>` : '';

  // Card de atributo: valor grande + nome (aceita "d4", "10"...)
  if (c.tipo === 'atributo') {
    return `<div style="width:106px;border:1px solid var(--border);border-radius:9px;padding:10px 6px;text-align:center;background:rgba(0,0,0,0.28)">
      <input data-fcb="${c.id}" ${ed ? 'disabled' : ''} value="${esc(String(v ?? ''))}" placeholder="—"
        style="width:100%;background:transparent;border:none;outline:none;text-align:center;font-size:26px;font-weight:800;color:var(--text)">
      <div style="font-size:10px;color:var(--muted);letter-spacing:1px;margin-top:2px">${ed ? `<input style="${s.inpEd};width:100%;text-align:center;font-size:10px" value="${esc(c.label)}" oninput="fcbRenomearCampo(${si},${ci},this.value)">` : esc(c.label)}</div>
      ${ferramentas}
    </div>`;
  }

  // Atributo com modificador automático (estilo D&D: mod = (valor−10)÷2)
  if (c.tipo === 'atributo_mod') {
    const num = parseInt(v) || 0;
    const mod = Math.floor((num - 10) / 2);
    return `<div style="width:106px;border:1px solid var(--border);border-radius:9px;padding:8px 6px;text-align:center;background:rgba(0,0,0,0.28)">
      <input data-fcb="${c.id}" type="number" ${ed ? 'disabled' : ''} value="${esc(String(v ?? 10))}"
        style="width:60px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:5px;outline:none;text-align:center;font-size:12px;color:var(--muted);padding:2px">
      <div data-fcb-mod="${c.id}" style="font-size:24px;font-weight:800;color:var(--gold);margin:2px 0">${mod >= 0 ? '+' : ''}${mod}</div>
      <div style="font-size:10px;color:var(--muted);letter-spacing:1px">${ed ? `<input style="${s.inpEd};width:100%;text-align:center;font-size:10px" value="${esc(c.label)}" oninput="fcbRenomearCampo(${si},${ci},this.value)">` : esc(c.label)}</div>
      ${ferramentas}
    </div>`;
  }

  // Barra colorida com −/+ (vida, mana, sanidade...)
  if (c.tipo === 'barra') {
    const max = c.max ?? 10, atual = Math.min(parseInt(v) ?? max, max);
    const val = isNaN(atual) ? max : atual;
    const cor = c.cor || '#8b5cf6';
    const pct = max > 0 ? Math.max(0, Math.min(100, (val / max) * 100)) : 0;
    return `<div style="flex:1 1 100%;min-width:220px">
      ${label}
      <div style="display:flex;align-items:center;gap:6px">
        ${!ed ? `<button style="${s.btnMove};font-size:14px" onclick="fcbBarra('${c.id}',-1,${max})">−</button>` : ''}
        <div style="flex:1;height:26px;border-radius:13px;background:rgba(255,255,255,0.07);overflow:hidden;position:relative">
          <div style="height:100%;width:${pct}%;background:${cor};transition:width .25s"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.8)">${val}/${max}</div>
        </div>
        ${!ed ? `<button style="${s.btnMove};font-size:14px" onclick="fcbBarra('${c.id}',1,${max})">+</button>` : ''}
      </div>
      ${ed ? `<div style="display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap">
        <span style="font-size:9px;color:var(--muted)">COR:</span>
        ${FCB_CORES.map(cr => `<span onclick="fcbCorCampo(${si},${ci},'${cr}')" style="width:16px;height:16px;border-radius:50%;background:${cr};cursor:pointer;display:inline-block;border:2px solid ${cr === cor ? '#fff' : 'transparent'}"></span>`).join('')}
        <span style="font-size:9px;color:var(--muted);margin-left:6px">MÁX:</span>
        <input type="number" value="${max}" style="width:56px;${s.inp.replace('width:100%','')};padding:3px 6px;font-size:11px" oninput="fcbMaxCampo(${si},${ci},this.value)">
      </div>` : ''}
      ${ferramentas}
    </div>`;
  }

  // Marcadores (bolinhas clicáveis)
  if (c.tipo === 'marcador') {
    const max = c.max ?? 5, atual = Math.max(0, Math.min(parseInt(v) || 0, max));
    const cor = c.cor || '#8b5cf6';
    let pips = '';
    for (let i = 0; i < max; i++) {
      pips += `<span ${!ed ? `onclick="fcbPip('${c.id}',${i},${max})"` : ''}
        style="width:17px;height:17px;border-radius:50%;display:inline-block;cursor:${ed ? 'default' : 'pointer'};margin-right:4px;
        background:${i < atual ? cor : 'transparent'};border:2px solid ${cor};transition:background .15s"></span>`;
    }
    return `<div style="flex:1 1 100%;min-width:200px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div style="min-width:110px">${label}</div>
        <div>${pips}</div>
      </div>
      ${ed ? `<div style="display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap">
        <span style="font-size:9px;color:var(--muted)">COR:</span>
        ${FCB_CORES.map(cr => `<span onclick="fcbCorCampo(${si},${ci},'${cr}')" style="width:16px;height:16px;border-radius:50%;background:${cr};cursor:pointer;display:inline-block;border:2px solid ${cr === cor ? '#fff' : 'transparent'}"></span>`).join('')}
        <span style="font-size:9px;color:var(--muted);margin-left:6px">MÁX:</span>
        <input type="number" min="1" max="20" value="${max}" style="width:56px;${s.inp.replace('width:100%','')};padding:3px 6px;font-size:11px" oninput="fcbMaxCampo(${si},${ci},this.value)">
      </div>` : ''}
      ${ferramentas}
    </div>`;
  }

  // Checkbox
  if (c.tipo === 'check') {
    return `<div style="flex:1 1 45%;min-width:190px;border:1px solid var(--border);border-radius:8px;padding:9px 11px;background:rgba(0,0,0,0.22)">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text);cursor:${ed ? 'default' : 'pointer'}">
        <input type="checkbox" data-fcb="${c.id}" ${v ? 'checked' : ''} ${ed ? 'disabled' : ''} style="accent-color:var(--gold);width:16px;height:16px">
        ${ed ? `<input style="${s.inpEd};flex:1;font-size:12px" value="${esc(c.label)}" oninput="fcbRenomearCampo(${si},${ci},this.value)">` : esc(c.label)}
      </label>
      ${ferramentas}
    </div>`;
  }

  // Texto longo
  if (c.tipo === 'area') {
    return `<div style="flex:1 1 100%">
      ${label}
      <textarea data-fcb="${c.id}" rows="4" ${ed ? 'disabled' : ''} style="${s.inp};resize:vertical">${esc(String(v ?? ''))}</textarea>
      ${ferramentas}
    </div>`;
  }

  // Texto curto / número (padrão)
  return `<div style="flex:1 1 30%;min-width:190px">
    ${label}
    <input type="${c.tipo === 'numero' ? 'number' : 'text'}" data-fcb="${c.id}" ${ed ? 'disabled' : ''} value="${esc(String(v ?? ''))}" style="${s.inp}">
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
