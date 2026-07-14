// ══════════════════════════════════════════════════
//  ARQUIVOS — pastas e documentos da mesa (handouts)
//  O mestre organiza lore/segredos em pastas e revela
//  para os players quando quiser (👁 por pasta e por doc).
//  A ocultação é garantida no SERVIDOR (RLS): documento
//  invisível nem chega no navegador do player.
// ══════════════════════════════════════════════════

const ARQ = { pastas: [], docs: [], pastaAtiva: null, sub: null, carregado: false };

async function arquivosInit() {
  _arqMontarPagina();
  await _arqCarregar();
  _arqSubscribe();
}

// ── DADOS ──────────────────────────────────────────
async function _arqCarregar() {
  const [{ data: pastas, error: e1 }, { data: docs }] = await Promise.all([
    db.from('pastas').select('*').eq('mesa_id', mesaId()).order('ordem').order('created_at'),
    db.from('documentos').select('*').eq('mesa_id', mesaId()).order('created_at'),
  ]);
  if (e1 && /pastas/i.test(e1.message || '')) {
    document.getElementById('arq-pastas').innerHTML =
      '<div style="font-size:11px;color:var(--red);padding:8px">⚠ Rode MIGRACAO_ARQUIVOS.sql no Supabase.</div>';
    return;
  }
  ARQ.pastas = pastas || [];
  ARQ.docs = docs || [];
  if (ARQ.pastaAtiva && !ARQ.pastas.find(p => p.id === ARQ.pastaAtiva)) ARQ.pastaAtiva = null;
  if (!ARQ.pastaAtiva && ARQ.pastas.length) ARQ.pastaAtiva = ARQ.pastas[0].id;
  ARQ.carregado = true;
  _arqRender();
}

function _arqSubscribe() {
  if (ARQ.sub) return;
  ARQ.sub = db.channel('arquivos-' + mesaId())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pastas',     filter: 'mesa_id=eq.' + mesaId() }, _arqOnChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'documentos', filter: 'mesa_id=eq.' + mesaId() }, _arqOnChange)
    .subscribe();
}

function _arqOnChange(payload) {
  // Aviso discreto quando o mestre revela algo novo pros players
  if (!isMaster && payload.eventType === 'UPDATE' && payload.new?.visivel && payload.old && payload.old.visivel === false) {
    toast('📂 O mestre revelou algo nos Arquivos!', 'ok');
  }
  if (!isMaster && payload.eventType === 'INSERT' && payload.new?.visivel) {
    toast('📂 Novo conteúdo nos Arquivos!', 'ok');
  }
  clearTimeout(window._arqReloadTimer);
  window._arqReloadTimer = setTimeout(() => { if (ARQ.carregado) _arqCarregar(); }, 350);
}

// ── PÁGINA ─────────────────────────────────────────
function _arqMontarPagina() {
  const page = document.getElementById('page-arquivos');
  if (!page || page.dataset.montada) { _arqRender(); return; }
  page.dataset.montada = '1';
  page.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Arquivos da Mesa</div><div class="page-sub">${isMaster ? 'Pastas e documentos — 👁 controla o que os players veem' : 'Documentos revelados pelo mestre'}</div></div>
      ${isMaster ? '<button class="btn-ghost" onclick="arqNovaPasta()" style="font-size:11px;padding:6px 12px">📁 Nova Pasta</button>' : ''}
    </div>
    <div id="arq-corpo" style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
      <div id="arq-pastas" style="flex:0 0 230px;min-width:200px;max-width:100%"></div>
      <div id="arq-docs" style="flex:1;min-width:260px"></div>
    </div>
    <style>
      @media (max-width:768px){ #arq-corpo{flex-direction:column} #arq-pastas{flex:1 1 auto;width:100%} }
      .arq-pasta{display:flex;align-items:center;gap:7px;padding:9px 10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;cursor:pointer;background:rgba(0,0,0,0.25);transition:border-color .15s}
      .arq-pasta:hover{border-color:var(--gold)}
      .arq-pasta.ativa{border-color:var(--gold);background:rgba(201,168,76,0.07)}
      .arq-doc{border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:rgba(0,0,0,0.25);cursor:pointer;transition:border-color .15s}
      .arq-doc:hover{border-color:var(--gold)}
      .arq-eye{background:none;border:1px solid var(--border);border-radius:5px;cursor:pointer;font-size:11px;padding:2px 6px;flex-shrink:0}
      .arq-eye.on{border-color:var(--green);color:var(--green)}
      .arq-eye.off{border-color:var(--muted);color:var(--muted);opacity:0.7}
    </style>`;
  _arqRender();
}

function _arqRender() {
  const elP = document.getElementById('arq-pastas');
  const elD = document.getElementById('arq-docs');
  if (!elP || !elD) return;

  // ── Pastas ──
  elP.innerHTML = '';
  if (!ARQ.pastas.length) {
    elP.innerHTML = `<div class="empty-state" style="padding:20px"><div class="empty-icon">📁</div><p>${isMaster ? 'Nenhuma pasta ainda.<br>Crie a primeira!' : 'O mestre ainda não revelou nenhum arquivo.'}</p></div>`;
  }
  ARQ.pastas.forEach(p => {
    const div = document.createElement('div');
    div.className = 'arq-pasta' + (p.id === ARQ.pastaAtiva ? ' ativa' : '');
    const nDocs = ARQ.docs.filter(d => d.pasta_id === p.id).length;
    div.innerHTML = `
      <span style="font-size:15px">${p.id === ARQ.pastaAtiva ? '📂' : '📁'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.nome)}</div>
        <div style="font-size:9px;color:var(--muted)">${nDocs} doc${nDocs === 1 ? '' : 's'}</div>
      </div>
      ${isMaster ? `
        <button class="arq-eye ${p.visivel ? 'on' : 'off'}" title="${p.visivel ? 'Visível pros players — clique pra esconder' : 'Oculta — clique pra revelar'}"
          onclick="event.stopPropagation();arqTogglePasta('${p.id}', ${!p.visivel})">${p.visivel ? '👁' : '🚫'}</button>
        <button class="arq-eye off" title="Renomear" onclick="event.stopPropagation();arqRenomearPasta('${p.id}')">✏️</button>
        <button class="arq-eye off" style="color:var(--red)" title="Deletar pasta" onclick="event.stopPropagation();arqDeletarPasta('${p.id}','${esc(p.nome).replace(/'/g,'&#39;')}')">✕</button>` : ''}`;
    div.onclick = () => { ARQ.pastaAtiva = p.id; _arqRender(); };
    elP.appendChild(div);
  });

  // ── Documentos da pasta ativa ──
  elD.innerHTML = '';
  const pasta = ARQ.pastas.find(p => p.id === ARQ.pastaAtiva);
  if (!pasta) { if (ARQ.pastas.length) elD.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:10px">Selecione uma pasta.</div>'; return; }

  if (isMaster) {
    const add = document.createElement('button');
    add.className = 'btn-ghost';
    add.style.cssText = 'width:100%;font-size:11px;padding:8px;margin-bottom:10px';
    add.textContent = '＋ Novo documento em "' + pasta.nome + '"';
    add.onclick = () => arqEditarDoc(null);
    elD.appendChild(add);
    if (!pasta.visivel) {
      const aviso = document.createElement('div');
      aviso.style.cssText = 'font-size:10px;color:var(--muted);margin-bottom:8px;padding:6px 8px;border:1px dashed var(--border);border-radius:6px';
      aviso.textContent = '🚫 Esta pasta está oculta — os players não veem nada dela, nem os documentos marcados como visíveis.';
      elD.appendChild(aviso);
    }
  }

  const docs = ARQ.docs.filter(d => d.pasta_id === pasta.id);
  if (!docs.length) {
    const v = document.createElement('div');
    v.style.cssText = 'font-size:11px;color:var(--muted);padding:10px';
    v.textContent = 'Pasta vazia.';
    elD.appendChild(v);
  }
  docs.forEach(d => {
    const card = document.createElement('div');
    card.className = 'arq-doc';
    const preview = (d.conteudo || '').replace(/\s+/g, ' ').slice(0, 90);
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:14px">📄</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--gold)">${esc(d.titulo)}</div>
          <div style="font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(preview)}${(d.conteudo||'').length > 90 ? '…' : ''}</div>
        </div>
        ${isMaster ? `
          <button class="arq-eye ${d.visivel ? 'on' : 'off'}" title="${d.visivel ? 'Visível — clique pra esconder' : 'Oculto — clique pra revelar'}"
            onclick="event.stopPropagation();arqToggleDoc('${d.id}', ${!d.visivel})">${d.visivel ? '👁' : '🚫'}</button>
          <button class="arq-eye off" title="Editar" onclick="event.stopPropagation();arqEditarDoc('${d.id}')">✏️</button>
          <button class="arq-eye off" style="color:var(--red)" title="Deletar" onclick="event.stopPropagation();arqDeletarDoc('${d.id}','${esc(d.titulo).replace(/'/g,'&#39;')}')">✕</button>` : ''}
      </div>`;
    card.onclick = () => arqVerDoc(d.id);
    elD.appendChild(card);
  });
}

// ── AÇÕES: PASTAS ──────────────────────────────────
async function arqNovaPasta() {
  const nome = prompt('Nome da pasta:');
  if (!nome?.trim()) return;
  const { error } = await db.from('pastas').insert({ mesa_id: mesaId(), nome: nome.trim(), visivel: false });
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  toast('Pasta criada (oculta por padrão).', 'ok');
  _arqCarregar();
}

async function arqRenomearPasta(id) {
  const p = ARQ.pastas.find(x => x.id === id);
  const nome = prompt('Novo nome:', p?.nome || '');
  if (!nome?.trim()) return;
  await db.from('pastas').update({ nome: nome.trim() }).eq('id', id);
  _arqCarregar();
}

async function arqTogglePasta(id, visivel) {
  const { error } = await db.from('pastas').update({ visivel }).eq('id', id);
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  toast(visivel ? '📂 Pasta revelada pros players!' : '🚫 Pasta oculta.', 'ok');
  _arqCarregar();
}

async function arqDeletarPasta(id, nome) {
  if (!confirm(`Deletar a pasta "${nome}" e TODOS os documentos dentro dela?`)) return;
  const { error } = await db.from('pastas').delete().eq('id', id);
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  if (ARQ.pastaAtiva === id) ARQ.pastaAtiva = null;
  toast('Pasta deletada.', 'ok');
  _arqCarregar();
}

// ── AÇÕES: DOCUMENTOS ──────────────────────────────
function arqVerDoc(id) {
  const d = ARQ.docs.find(x => x.id === id);
  if (!d) return;
  if (isMaster) { arqEditarDoc(id); return; }
  _arqModal(`
    <div style="font-size:15px;font-weight:700;color:var(--gold);margin-bottom:10px">📄 ${esc(d.titulo)}</div>
    <div style="font-size:13px;color:var(--text);line-height:1.55;white-space:pre-wrap;max-height:60vh;overflow-y:auto">${esc(d.conteudo || '')}</div>`);
}

function arqEditarDoc(id) {
  const d = id ? ARQ.docs.find(x => x.id === id) : null;
  const inp = 'width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px 10px;font-size:13px';
  _arqModal(`
    <div style="font-size:12px;font-weight:700;color:var(--gold);letter-spacing:1px;margin-bottom:10px">${d ? '✏️ EDITAR' : '📄 NOVO'} DOCUMENTO</div>
    <input id="arqdoc-titulo" placeholder="Título" value="${d ? esc(d.titulo).replace(/"/g,'&quot;') : ''}" style="${inp};margin-bottom:8px">
    <textarea id="arqdoc-conteudo" rows="12" placeholder="Conteúdo do documento... (lore, cartas, relatórios, segredos)" style="${inp};resize:vertical">${d ? esc(d.conteudo || '') : ''}</textarea>
    <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);margin:10px 0;cursor:pointer">
      <input type="checkbox" id="arqdoc-visivel" ${d?.visivel ? 'checked' : ''} style="accent-color:var(--gold)">
      👁 Visível para os players
    </label>
    <div style="display:flex;gap:6px">
      <button class="btn-ghost" style="flex:1;font-size:11px;padding:8px" onclick="document.getElementById('arq-modal').remove()">Cancelar</button>
      <button class="btn-ghost" style="flex:1;font-size:11px;padding:8px;color:var(--gold);border-color:var(--gold)" onclick="arqSalvarDoc(${d ? `'${d.id}'` : 'null'})">💾 Salvar</button>
    </div>`);
}

async function arqSalvarDoc(id) {
  const titulo = document.getElementById('arqdoc-titulo')?.value.trim();
  if (!titulo) { toast('Dá um título pro documento!', 'err'); return; }
  const payload = {
    titulo,
    conteudo: document.getElementById('arqdoc-conteudo')?.value || '',
    visivel: document.getElementById('arqdoc-visivel')?.checked || false,
  };
  let error;
  if (id) {
    ({ error } = await db.from('documentos').update(payload).eq('id', id));
  } else {
    ({ error } = await db.from('documentos').insert({ ...payload, mesa_id: mesaId(), pasta_id: ARQ.pastaAtiva }));
  }
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  document.getElementById('arq-modal')?.remove();
  toast('Documento salvo!', 'ok');
  _arqCarregar();
}

async function arqToggleDoc(id, visivel) {
  const { error } = await db.from('documentos').update({ visivel }).eq('id', id);
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  toast(visivel ? '👁 Documento revelado!' : '🚫 Documento oculto.', 'ok');
  _arqCarregar();
}

async function arqDeletarDoc(id, titulo) {
  if (!confirm(`Deletar o documento "${titulo}"?`)) return;
  await db.from('documentos').delete().eq('id', id);
  toast('Documento deletado.', 'ok');
  _arqCarregar();
}

// ── MODAL GENÉRICO ─────────────────────────────────
function _arqModal(html) {
  document.getElementById('arq-modal')?.remove();
  const m = document.createElement('div');
  m.id = 'arq-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:8600;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="width:100%;max-width:560px;max-height:92vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--border);border-radius:10px;padding:16px">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.body.appendChild(m);
}
