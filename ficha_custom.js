// ══════════════════════════════════════════════════
//  FICHA CUSTOMIZÁVEL — o mestre monta o modelo de
//  ficha do sistema DELE (seções + campos) e define
//  como padrão da mesa. Os players preenchem esse
//  modelo no lugar da ficha FRACTURED.
//  Template salvo em mesas.ficha_template (jsonb);
//  respostas dos players em fichas.dados_custom.
// ══════════════════════════════════════════════════

const FCB = { template: null, dados: {}, fichaRowId: null, saveTimer: null, montada: false };

// Tipos de campo disponíveis no construtor
const FCB_TIPOS = [
  { id: 'texto',  nome: 'Texto curto'        },
  { id: 'numero', nome: 'Número'             },
  { id: 'area',   nome: 'Texto longo'        },
  { id: 'barra',  nome: 'Barra (atual/máx)'  },
];

function fichaCustomAtiva() { return !!(MESA?.ficha_template?.secoes?.length); }

// ── ENTRADA: chamado ao abrir a página Ficha ──────
async function fichaCustomInit() {
  const page = document.getElementById('page-ficha');
  if (!page) return;

  // Recarrega o template da mesa (o mestre pode ter mudado)
  const { data } = await db.from('mesas').select('ficha_template').eq('id', mesaId()).maybeSingle();
  if (data) MESA.ficha_template = data.ficha_template;

  const custom = fichaCustomAtiva();
  // Alterna entre a ficha FRACTURED original e a customizada
  [...page.children].forEach(el => { if (el.id !== 'fcb-container') el.style.display = custom ? 'none' : ''; });
  let cont = document.getElementById('fcb-container');
  if (custom) {
    if (!cont) { cont = document.createElement('div'); cont.id = 'fcb-container'; page.appendChild(cont); }
    cont.style.display = '';
    await _fcbCarregarDados();
    _fcbRenderFicha(cont);
  } else if (cont) {
    cont.style.display = 'none';
  }
}

// ── DADOS DO PLAYER ────────────────────────────────
async function _fcbCarregarDados() {
  const { data } = await db.from('fichas').select('id, dados_custom')
    .eq('user_id', currentUser.id).eq('mesa_id', mesaId()).maybeSingle();
  FCB.fichaRowId = data?.id || null;
  FCB.dados = data?.dados_custom || {};
}

function _fcbAgendarSave() {
  clearTimeout(FCB.saveTimer);
  const st = document.getElementById('fcb-status');
  if (st) { st.textContent = '● alterações não salvas'; st.style.color = 'var(--gold)'; }
  FCB.saveTimer = setTimeout(_fcbSalvar, 1500);
}

async function _fcbSalvar() {
  // Nome do personagem para o card do Painel do Mestre
  const campoNome = (MESA.ficha_template.secoes || []).flatMap(s => s.campos)
    .find(c => /nome/i.test(c.label));
  const nome = campoNome ? (FCB.dados[campoNome.id] || '') : '';

  const payload = { user_id: currentUser.id, mesa_id: mesaId(), dados_custom: FCB.dados };
  if (nome) payload.nome = nome;

  let error;
  if (FCB.fichaRowId) {
    ({ error } = await db.from('fichas').update(payload).eq('id', FCB.fichaRowId));
  } else {
    const { data, error: e } = await db.from('fichas').insert(payload).select('id').single();
    error = e; if (data) FCB.fichaRowId = data.id;
  }
  const st = document.getElementById('fcb-status');
  if (error) { if (st) { st.textContent = '⚠ erro ao salvar'; st.style.color = 'var(--red)'; } return; }
  if (st) { st.textContent = '✔ salvo'; st.style.color = 'var(--green)'; }
}

// ── FICHA (renderização para preencher) ───────────
function _fcbRenderFicha(cont) {
  const t = MESA.ficha_template;
  const inp = 'width:100%;box-sizing:border-box;background:rgba(0,0,0,0.35);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px 10px;font-size:13px';
  let html = `
    <div class="page-header">
      <div>
        <div class="page-title">${esc(t.nome_sistema || 'Ficha da Mesa')}</div>
        <div class="page-sub">Modelo criado pelo mestre · <span id="fcb-status" style="color:var(--green)">✔ salvo</span></div>
      </div>
      ${isMaster ? '<button class="btn-ghost" style="font-size:11px;padding:6px 12px" onclick="fcbAbrirEditor()">🛠 Editar Modelo</button>' : ''}
    </div>`;

  (t.secoes || []).forEach(sec => {
    html += `<div style="border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px;background:rgba(0,0,0,0.2)">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:10px">${esc(sec.titulo)}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px">`;
    (sec.campos || []).forEach(c => {
      const v = FCB.dados[c.id];
      const label = `<label style="display:block;font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:3px">${esc(c.label).toUpperCase()}</label>`;
      if (c.tipo === 'area') {
        html += `<div style="grid-column:1/-1">${label}<textarea data-fcb="${c.id}" rows="4" style="${inp};resize:vertical">${esc(v || '')}</textarea></div>`;
      } else if (c.tipo === 'barra') {
        const b = v || { atual: 0, max: 0 };
        html += `<div>${label}
          <div style="display:flex;gap:5px;align-items:center">
            <input type="number" data-fcb="${c.id}" data-fcb-sub="atual" value="${b.atual ?? 0}" style="${inp};text-align:center">
            <span style="color:var(--muted)">/</span>
            <input type="number" data-fcb="${c.id}" data-fcb-sub="max" value="${b.max ?? 0}" style="${inp};text-align:center">
          </div></div>`;
      } else {
        html += `<div>${label}<input type="${c.tipo === 'numero' ? 'number' : 'text'}" data-fcb="${c.id}" value="${esc(String(v ?? ''))}" style="${inp}"></div>`;
      }
    });
    html += `</div></div>`;
  });

  cont.innerHTML = html;
  cont.querySelectorAll('[data-fcb]').forEach(el => {
    el.addEventListener('input', () => {
      const id = el.dataset.fcb, sub = el.dataset.fcbSub;
      if (sub) {
        FCB.dados[id] = FCB.dados[id] && typeof FCB.dados[id] === 'object' ? FCB.dados[id] : { atual: 0, max: 0 };
        FCB.dados[id][sub] = parseFloat(el.value) || 0;
      } else {
        FCB.dados[id] = el.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
      }
      _fcbAgendarSave();
    });
  });
}

// ── CONSTRUTOR (mestre) ────────────────────────────
function fcbAbrirEditor() {
  if (!isMaster) return;
  FCB.edit = MESA.ficha_template
    ? JSON.parse(JSON.stringify(MESA.ficha_template))
    : { nome_sistema: '', secoes: [] };
  _fcbRenderEditor();
}

function _fcbRenderEditor() {
  document.getElementById('fcb-modal')?.remove();
  const t = FCB.edit;
  const inp = 'box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:7px 9px;font-size:12px';
  const btn = 'background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:11px;height:26px;padding:0 7px;cursor:pointer';

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:13px;font-weight:800;color:var(--gold);letter-spacing:2px">🛠 MODELO DE FICHA DA MESA</div>
      <button class="btn-ghost" style="font-size:11px;padding:4px 10px" onclick="document.getElementById('fcb-modal').remove()">Fechar</button>
    </div>
    <div style="font-size:10px;color:var(--muted);margin-bottom:10px">Monte a ficha do SEU sistema: crie seções (ex: Identidade, Atributos, Inventário) e os campos de cada uma. Ao salvar, ela vira a ficha padrão de todos os players desta mesa.</div>
    <input style="${inp};width:100%;margin-bottom:12px;font-weight:700" placeholder="Nome do sistema (ex: S73-RPG)" value="${esc(t.nome_sistema || '')}"
      oninput="FCB.edit.nome_sistema = this.value">`;

  (t.secoes || []).forEach((sec, si) => {
    html += `<div style="border:1px solid var(--gold);border-radius:9px;padding:10px;margin-bottom:10px;background:rgba(201,168,76,0.04)">
      <div style="display:flex;gap:5px;align-items:center;margin-bottom:8px">
        <input style="${inp};flex:1;font-weight:700" placeholder="Título da seção" value="${esc(sec.titulo || '')}"
          oninput="FCB.edit.secoes[${si}].titulo = this.value">
        <button style="${btn}" title="Subir" onclick="fcbMoverSecao(${si},-1)">↑</button>
        <button style="${btn}" title="Descer" onclick="fcbMoverSecao(${si},1)">↓</button>
        <button style="${btn};color:var(--red)" title="Remover seção" onclick="fcbRemoverSecao(${si})">✕</button>
      </div>`;
    (sec.campos || []).forEach((c, ci) => {
      html += `<div style="display:flex;gap:5px;align-items:center;margin-bottom:5px">
        <input style="${inp};flex:1" placeholder="Nome do campo" value="${esc(c.label || '')}"
          oninput="FCB.edit.secoes[${si}].campos[${ci}].label = this.value">
        <select style="${inp};width:150px" onchange="FCB.edit.secoes[${si}].campos[${ci}].tipo = this.value">
          ${FCB_TIPOS.map(tp => `<option value="${tp.id}" ${c.tipo === tp.id ? 'selected' : ''}>${tp.nome}</option>`).join('')}
        </select>
        <button style="${btn}" onclick="fcbMoverCampo(${si},${ci},-1)">↑</button>
        <button style="${btn}" onclick="fcbMoverCampo(${si},${ci},1)">↓</button>
        <button style="${btn};color:var(--red)" onclick="fcbRemoverCampo(${si},${ci})">✕</button>
      </div>`;
    });
    html += `<button style="${btn};width:100%;margin-top:4px" onclick="fcbAddCampo(${si})">＋ campo</button>
    </div>`;
  });

  html += `
    <button class="btn-ghost" style="width:100%;font-size:11px;padding:8px;margin-bottom:12px" onclick="fcbAddSecao()">📑 Nova seção</button>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn-ghost" style="flex:1;min-width:150px;font-size:11px;padding:9px;color:var(--gold);border-color:var(--gold)" onclick="fcbSalvarTemplate()">💾 Salvar e aplicar na mesa</button>
      <button class="btn-ghost" style="flex:1;min-width:150px;font-size:11px;padding:9px;color:var(--red);border-color:var(--red)" onclick="fcbVoltarPadrao()">↩ Voltar pra ficha FRACTURED</button>
    </div>
    <div style="font-size:9px;color:var(--muted);margin-top:8px">⚠ Os players precisam recarregar a página (F5) para ver o modelo novo. Trocar o modelo NÃO apaga o que já foi preenchido — campos com o mesmo nome de campo continuam preenchidos.</div>`;

  const m = document.createElement('div');
  m.id = 'fcb-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:8700;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;padding:14px';
  m.innerHTML = `<div style="width:100%;max-width:640px;max-height:92vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--gold);border-radius:10px;padding:16px">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.body.appendChild(m);
}

// id estável derivado do nome do campo (preserva dados ao editar o modelo)
function _fcbIdDoLabel(label) {
  return (label || 'campo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'campo';
}

function fcbAddSecao() { FCB.edit.secoes.push({ titulo: '', campos: [] }); _fcbRenderEditor(); }
function fcbRemoverSecao(si) { if (confirm('Remover esta seção e seus campos?')) { FCB.edit.secoes.splice(si, 1); _fcbRenderEditor(); } }
function fcbMoverSecao(si, dir) {
  const a = FCB.edit.secoes, j = si + dir;
  if (j < 0 || j >= a.length) return;
  [a[si], a[j]] = [a[j], a[si]]; _fcbRenderEditor();
}
function fcbAddCampo(si) { FCB.edit.secoes[si].campos.push({ id: '', label: '', tipo: 'texto' }); _fcbRenderEditor(); }
function fcbRemoverCampo(si, ci) { FCB.edit.secoes[si].campos.splice(ci, 1); _fcbRenderEditor(); }
function fcbMoverCampo(si, ci, dir) {
  const a = FCB.edit.secoes[si].campos, j = ci + dir;
  if (j < 0 || j >= a.length) return;
  [a[ci], a[j]] = [a[j], a[ci]]; _fcbRenderEditor();
}

async function fcbSalvarTemplate() {
  const t = FCB.edit;
  t.secoes = (t.secoes || []).filter(s => s.titulo?.trim());
  t.secoes.forEach(s => {
    s.campos = (s.campos || []).filter(c => c.label?.trim());
    s.campos.forEach(c => { c.id = _fcbIdDoLabel(c.label); });
  });
  if (!t.secoes.length) { toast('Crie ao menos uma seção com um campo.', 'err'); return; }

  const { error } = await db.from('mesas').update({ ficha_template: t }).eq('id', mesaId());
  if (error) { toast('Erro: ' + error.message + (/ficha_template/.test(error.message) ? ' — rode MIGRACAO_FICHA_CUSTOM.sql!' : ''), 'err'); return; }
  MESA.ficha_template = t;
  document.getElementById('fcb-modal')?.remove();
  toast('📋 Modelo aplicado! Avise os players para darem F5.', 'ok');
  fichaCustomInit();
}

async function fcbVoltarPadrao() {
  if (!confirm('Voltar para a ficha FRACTURED padrão? (o que os players preencheram no modelo custom fica guardado)')) return;
  const { error } = await db.from('mesas').update({ ficha_template: null }).eq('id', mesaId());
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  MESA.ficha_template = null;
  document.getElementById('fcb-modal')?.remove();
  toast('Ficha FRACTURED restaurada.', 'ok');
  fichaCustomInit();
}
