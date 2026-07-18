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
      /* ── Documento estilo "papel" (leitura e edição) ── */
      .arq-rich{font-family:Georgia,'Times New Roman',serif;font-size:14.5px;line-height:1.7;color:#e8e2d5}
      .arq-rich h1{font-size:21px;color:var(--gold);border-bottom:1px solid rgba(201,168,76,0.35);padding-bottom:6px;margin:14px 0 10px;font-weight:700;letter-spacing:0.5px}
      .arq-rich h2{font-size:17px;color:var(--gold);margin:12px 0 8px;font-weight:700}
      .arq-rich p{margin:0 0 10px}
      .arq-rich ul,.arq-rich ol{margin:0 0 10px;padding-left:24px}
      .arq-rich li{margin-bottom:4px}
      .arq-rich blockquote{border-left:3px solid var(--gold);margin:10px 0;padding:6px 14px;color:#cfc8b8;font-style:italic;background:rgba(201,168,76,0.05);border-radius:0 6px 6px 0}
      .arq-rich hr{border:none;border-top:1px dashed rgba(201,168,76,0.4);margin:14px 0}
      .arq-rich a{color:var(--gold)}
      .arq-rich img{max-width:100%;border-radius:6px;height:auto}
      .arq-paper{overflow:auto}
      .arq-editor{overflow:auto}
      .arq-editor img{cursor:pointer}
      .arq-paper{background:linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012));border:1px solid var(--border);border-radius:10px;padding:22px 24px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04)}
      /* ── Barra de ferramentas ── */
      .arq-tb{display:flex;flex-wrap:wrap;gap:3px;padding:6px;border:1px solid var(--border);border-radius:8px 8px 0 0;background:rgba(0,0,0,0.35);position:sticky;top:0;z-index:3}
      .arq-tb button{background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:12px;min-width:30px;height:30px;cursor:pointer;padding:0 7px}
      .arq-tb button:hover{border-color:var(--gold);color:var(--gold)}
      .arq-tb .sep{width:1px;background:var(--border);margin:3px 3px}
      .arq-dd{position:relative}
      .arq-dd-menu{display:none;position:absolute;top:33px;left:0;min-width:180px;background:#161209;border:1px solid var(--gold);border-radius:8px;z-index:9;box-shadow:0 6px 20px rgba(0,0,0,0.7);overflow:hidden}
      .arq-dd-menu div{padding:9px 13px;font-size:12px;color:var(--text);cursor:pointer;white-space:nowrap}
      .arq-dd-menu div:hover{background:rgba(201,168,76,0.14);color:var(--gold)}
      .arq-cor{width:30px;height:30px;padding:2px;border:1px solid var(--border);border-radius:5px;background:rgba(255,255,255,0.05);cursor:pointer}
      .arq-cor::-webkit-color-swatch-wrapper{padding:2px}
      .arq-cor::-webkit-color-swatch{border:none;border-radius:3px}
      .arq-corbox{display:flex;flex-direction:column;align-items:center;gap:0}
      .arq-corbox label{font-size:8px;color:var(--muted);line-height:1;margin-top:1px}
      .arq-editor{min-height:300px;max-height:52vh;overflow-y:auto;outline:none;border:1px solid var(--border);border-top:none;border-radius:0 0 8px 8px;padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))}
      .arq-editor:focus{border-color:rgba(201,168,76,0.5)}
      @media (max-width:768px){ .arq-tb button,.arq-tb select{min-width:34px;height:34px} .arq-editor{max-height:46vh;padding:14px} }
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
    const preview = _arqPreview(d.conteudo).slice(0, 90);
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:14px">📄</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--gold)">${esc(d.titulo)}</div>
          <div style="font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(preview)}${_arqPreview(d.conteudo).length > 90 ? '…' : ''}</div>
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

// ── SANITIZAÇÃO (permite formatação, bloqueia scripts) ──
const _ARQ_TAGS_OK = new Set(['P','BR','B','STRONG','I','EM','U','S','STRIKE','H1','H2','H3','UL','OL','LI','BLOCKQUOTE','HR','A','SPAN','DIV','FONT','IMG']);
function _arqSanitizar(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html || '';
  (function limpar(node) {
    [...node.children].forEach(el => {
      if (!_ARQ_TAGS_OK.has(el.tagName)) { el.replaceWith(...el.childNodes); limpar(node); return; }
      [...el.attributes].forEach(a => {
        const n = a.name.toLowerCase();
        const ok = (n === 'style' && !/url\s*\(|expression/i.test(a.value))
                || (n === 'href' && /^(https?:|mailto:)/i.test(a.value))
                || n === 'color' || n === 'face';
        if (!ok) el.removeAttribute(a.name);
      });
      if (el.tagName === 'A') { el.setAttribute('target','_blank'); el.setAttribute('rel','noopener'); }
      limpar(el);
    });
  })(tpl.content);
  return tpl.innerHTML;
}

// Conteúdo antigo era texto puro; converte para exibição
function _arqParaHtml(conteudo) {
  if (!conteudo) return '';
  if (/<[a-z][^>]*>/i.test(conteudo)) return _arqSanitizar(conteudo);
  return '<p>' + esc(conteudo).replace(/\n/g, '<br>') + '</p>';
}

function _arqPreview(conteudo) {
  const tpl = document.createElement('template');
  tpl.innerHTML = _arqParaHtml(conteudo);
  return (tpl.content.textContent || '').replace(/\s+/g, ' ').trim();
}

// ── AÇÕES: DOCUMENTOS ──────────────────────────────
function arqVerDoc(id) {
  const d = ARQ.docs.find(x => x.id === id);
  if (!d) return;
  if (isMaster) { arqEditarDoc(id); return; }
  _arqModal(`
    <div style="font-size:16px;font-weight:700;color:var(--gold);margin-bottom:12px;letter-spacing:0.5px">📄 ${esc(d.titulo)}</div>
    <div class="arq-paper arq-rich" style="max-height:64vh;overflow-y:auto">${_arqParaHtml(d.conteudo)}</div>`);
}

// A seleção do texto se desfazia quando o clique na barra tirava o foco
// do editor — por isso trocar fonte/estilo "não funcionava". Agora a
// seleção é salva no mousedown da barra e restaurada antes do comando.
let _arqRange = null;

function _arqSalvarSel() {
  const ed = document.getElementById('arqdoc-editor');
  const sel = window.getSelection();
  if (ed && sel.rangeCount && ed.contains(sel.anchorNode)) {
    _arqRange = sel.getRangeAt(0).cloneRange();
  }
}

function _arqRestaurarSel() {
  const ed = document.getElementById('arqdoc-editor');
  if (!ed || !_arqRange) return;
  ed.focus();
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(_arqRange);
}

function _arqTbDown(e) {
  _arqSalvarSel();
  // preventDefault mantém o foco (e a seleção) no editor;
  // inputs de cor precisam do clique real pra abrir a paleta
  if (e.target.tagName !== 'INPUT') e.preventDefault();
}

function _arqCmd(cmd, val = null) {
  _arqRestaurarSel();
  document.execCommand(cmd, false, val);
  _arqSalvarSel();
}

// Dropdown customizado (o select nativo fica ilegível no tema escuro)
function _arqDD(btn) {
  const menu = btn.nextElementSibling;
  const aberto = menu.style.display === 'block';
  document.querySelectorAll('.arq-dd-menu').forEach(m => m.style.display = 'none');
  menu.style.display = aberto ? 'none' : 'block';
}
document.addEventListener('click', e => {
  if (!e.target.closest('.arq-dd')) document.querySelectorAll('.arq-dd-menu').forEach(m => m.style.display = 'none');
});

// Tamanho de fonte em px LIVRE (execCommand nativo só vai de 1 a 7;
// truque: aplica o 7 e converte no tamanho exato escolhido)
function _arqTamanho(px) {
  const ed = document.getElementById('arqdoc-editor');
  if (!ed) return;
  _arqRestaurarSel();
  document.execCommand('fontSize', false, '7');
  ed.querySelectorAll('font[size="7"]').forEach(f => {
    const span = document.createElement('span');
    span.style.fontSize = px + 'px';
    span.innerHTML = f.innerHTML;
    f.replaceWith(span);
  });
}

function _arqTamanhoCustom() {
  const v = parseInt(prompt('Tamanho da letra (px):', '16'));
  if (v >= 8 && v <= 96) _arqTamanho(v);
}

// ── IMAGENS NO DOCUMENTO ───────────────────────────
async function _arqImgUpload(input) {
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) { toast('Imagem muito grande (máx 4MB).', 'err'); return; }
  toast('Enviando imagem...', 'ok');
  const path = `docs/${mesaId()}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
  const { error } = await db.storage.from('tokens').upload(path, file, { upsert: true });
  if (error) { toast('Erro no upload: ' + error.message, 'err'); return; }
  const { data } = db.storage.from('tokens').getPublicUrl(path);
  _arqInserirImg(data.publicUrl);
}

function _arqImgUrl() {
  const url = prompt('Cole o link da imagem (https://...):');
  if (!url?.trim()) return;
  if (!/^https:\/\//i.test(url.trim())) { toast('Use um link https válido.', 'err'); return; }
  _arqInserirImg(url.trim());
}

function _arqInserirImg(src) {
  _arqRestaurarSel();
  document.execCommand('insertHTML', false,
    `<img src="${src}" style="max-width:100%;width:60%;display:block;margin:10px auto;border-radius:6px">`);
  toast('Imagem inserida! Clique nela para posicionar.', 'ok');
}

// Clique numa imagem do editor abre a barra de posicionamento
function _arqImgClique(e) {
  const antiga = document.getElementById('arq-img-bar');
  if (antiga) antiga.remove();
  document.querySelectorAll('#arqdoc-editor img').forEach(i => i.style.outline = '');
  if (e.target.tagName !== 'IMG') return;

  const img = e.target;
  img.style.outline = '2px solid var(--gold)';
  const bar = document.createElement('div');
  bar.id = 'arq-img-bar';
  bar.style.cssText = 'position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:3px;padding:6px;background:#161209;border:1px solid var(--gold);border-radius:8px;margin-top:6px;z-index:4';
  const b = (rotulo, titulo, fn) => {
    const btn = document.createElement('button');
    btn.textContent = rotulo; btn.title = titulo;
    btn.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:11px;height:28px;padding:0 8px;cursor:pointer';
    btn.onmousedown = ev => ev.preventDefault();
    btn.onclick = () => { fn(img); };
    return btn;
  };
  bar.append(
    b('⯇ texto', 'Imagem à esquerda, texto contorna', i => { i.style.cssText = 'float:left;width:' + (i.style.width || '40%') + ';max-width:60%;margin:4px 14px 8px 0;border-radius:6px;display:inline' }),
    b('▣ centro', 'Centralizada', i => { i.style.cssText = 'display:block;margin:10px auto;width:' + (i.style.width || '60%') + ';max-width:100%;border-radius:6px;float:none' }),
    b('texto ⯈', 'Imagem à direita, texto contorna', i => { i.style.cssText = 'float:right;width:' + (i.style.width || '40%') + ';max-width:60%;margin:4px 0 8px 14px;border-radius:6px;display:inline' }),
    b('25%', 'Tamanho pequeno', i => i.style.width = '25%'),
    b('40%', 'Tamanho médio',   i => i.style.width = '40%'),
    b('60%', 'Tamanho grande',  i => i.style.width = '60%'),
    b('100%', 'Largura total',  i => { i.style.width = '100%'; i.style.float = 'none'; i.style.display = 'block'; }),
    b('🗑', 'Remover imagem', i => { i.remove(); bar.remove(); }),
  );
  document.getElementById('arqdoc-editor').after(bar);
}

function arqEditarDoc(id) {
  const d = id ? ARQ.docs.find(x => x.id === id) : null;
  const inp = 'width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px 10px;font-size:14px;font-weight:600';
  _arqModal(`
    <div style="font-size:12px;font-weight:700;color:var(--gold);letter-spacing:1px;margin-bottom:10px">${d ? '✏️ EDITAR' : '📄 NOVO'} DOCUMENTO</div>
    <input id="arqdoc-titulo" placeholder="Título do documento" value="${d ? esc(d.titulo).replace(/"/g,'&quot;') : ''}" style="${inp};margin-bottom:8px">

    <div class="arq-tb" onmousedown="_arqTbDown(event)">
      <div class="arq-dd">
        <button onclick="_arqDD(this)">Estilo ▾</button>
        <div class="arq-dd-menu">
          <div onclick="_arqCmd('formatBlock','H1')" style="font-size:16px;color:var(--gold);font-weight:700">Título grande</div>
          <div onclick="_arqCmd('formatBlock','H2')" style="font-size:14px;color:var(--gold);font-weight:700">Subtítulo</div>
          <div onclick="_arqCmd('formatBlock','P')">Texto normal</div>
          <div onclick="_arqCmd('formatBlock','BLOCKQUOTE')" style="font-style:italic;border-left:3px solid var(--gold);padding-left:10px">Citação</div>
        </div>
      </div>
      <div class="arq-dd">
        <button onclick="_arqDD(this)" title="Tipo de letra">Fonte ▾</button>
        <div class="arq-dd-menu">
          <div onclick="_arqCmd('fontName','Georgia')" style="font-family:Georgia,serif">Documento (serifada)</div>
          <div onclick="_arqCmd('fontName','Arial')" style="font-family:Arial,sans-serif">Moderna</div>
          <div onclick="_arqCmd('fontName','Courier New')" style="font-family:'Courier New',monospace">Máquina de escrever</div>
          <div onclick="_arqCmd('fontName','cursive')" style="font-family:cursive">Manuscrita</div>
        </div>
      </div>
      <div class="arq-dd">
        <button onclick="_arqDD(this)" title="Tamanho da letra">Aa ▾</button>
        <div class="arq-dd-menu" style="min-width:130px">
          <div onclick="_arqTamanho(12)" style="font-size:12px">Pequena (12)</div>
          <div onclick="_arqTamanho(15)" style="font-size:15px">Normal (15)</div>
          <div onclick="_arqTamanho(18)" style="font-size:18px">Média (18)</div>
          <div onclick="_arqTamanho(24)" style="font-size:22px">Grande (24)</div>
          <div onclick="_arqTamanho(32)" style="font-size:26px">Enorme (32)</div>
          <div onclick="_arqTamanhoCustom()" style="color:var(--gold)">✏️ Outro tamanho…</div>
        </div>
      </div>
      <div class="sep"></div>
      <button title="Negrito (Ctrl+B)" onclick="_arqCmd('bold')"><b>B</b></button>
      <button title="Itálico (Ctrl+I)" onclick="_arqCmd('italic')"><i>I</i></button>
      <button title="Sublinhado (Ctrl+U)" onclick="_arqCmd('underline')"><u>U</u></button>
      <button title="Riscado" onclick="_arqCmd('strikeThrough')"><s>S</s></button>
      <div class="sep"></div>
      <div class="arq-corbox" title="Cor do texto — clique e escolha QUALQUER cor">
        <input type="color" class="arq-cor" value="#c9a84c" oninput="_arqCmd('foreColor', this.value)">
        <label>texto</label>
      </div>
      <div class="arq-corbox" title="Marca-texto — escolha a cor do fundo">
        <input type="color" class="arq-cor" value="#5a4a1e" oninput="_arqCmd('hiliteColor', this.value)">
        <label>marca</label>
      </div>
      <button title="Remover marca-texto" onclick="_arqCmd('hiliteColor','transparent')" style="font-size:10px">✕🖍</button>
      <div class="sep"></div>
      <button title="Alinhar à esquerda" onclick="_arqCmd('justifyLeft')">⯇☰</button>
      <button title="Centralizar" onclick="_arqCmd('justifyCenter')">☰</button>
      <button title="Alinhar à direita" onclick="_arqCmd('justifyRight')">☰⯈</button>
      <button title="Justificar" onclick="_arqCmd('justifyFull')">▤</button>
      <div class="sep"></div>
      <button title="Lista com marcadores" onclick="_arqCmd('insertUnorderedList')">•≡</button>
      <button title="Lista numerada" onclick="_arqCmd('insertOrderedList')">1≡</button>
      <button title="Aumentar recuo" onclick="_arqCmd('indent')">⇥</button>
      <button title="Diminuir recuo" onclick="_arqCmd('outdent')">⇤</button>
      <button title="Linha divisória" onclick="_arqCmd('insertHorizontalRule')">—</button>
      <div class="sep"></div>
      <div class="arq-dd">
        <button onclick="_arqDD(this)" title="Inserir imagem">🖼 ▾</button>
        <div class="arq-dd-menu" style="min-width:190px">
          <div onclick="document.getElementById('arqdoc-img-file').click()">📤 Enviar do dispositivo</div>
          <div onclick="_arqImgUrl()">🔗 Da internet (URL)</div>
        </div>
      </div>
      <input type="file" id="arqdoc-img-file" accept="image/*" style="display:none" onchange="_arqImgUpload(this)">
      <div class="sep"></div>
      <button title="Desfazer" onclick="_arqCmd('undo')">↶</button>
      <button title="Refazer" onclick="_arqCmd('redo')">↷</button>
      <button title="Limpar formatação" onclick="_arqCmd('removeFormat')">✕fmt</button>
    </div>
    <div id="arqdoc-editor" class="arq-editor arq-rich" contenteditable="true">${d ? _arqParaHtml(d.conteudo) : '<p></p>'}</div>

    <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);margin:10px 0;cursor:pointer">
      <input type="checkbox" id="arqdoc-visivel" ${d?.visivel ? 'checked' : ''} style="accent-color:var(--gold)">
      👁 Visível para os players
    </label>
    <div style="display:flex;gap:6px">
      <button class="btn-ghost" style="flex:1;font-size:11px;padding:8px" onclick="document.getElementById('arq-modal').remove()">Cancelar</button>
      <button class="btn-ghost" style="flex:1;font-size:11px;padding:8px;color:var(--gold);border-color:var(--gold)" onclick="arqSalvarDoc(${d ? `'${d.id}'` : 'null'})">💾 Salvar</button>
    </div>`, 760);
  setTimeout(() => {
    try { document.execCommand('styleWithCSS', false, true); } catch(e) {}
    document.getElementById('arqdoc-editor')?.addEventListener('click', _arqImgClique);
  }, 60);
}

async function arqSalvarDoc(id) {
  const titulo = document.getElementById('arqdoc-titulo')?.value.trim();
  if (!titulo) { toast('Dá um título pro documento!', 'err'); return; }
  const payload = {
    titulo,
    conteudo: _arqSanitizar(document.getElementById('arqdoc-editor')?.innerHTML || ''),
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
function _arqModal(html, largura = 560) {
  document.getElementById('arq-modal')?.remove();
  const m = document.createElement('div');
  m.id = 'arq-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:8600;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="width:100%;max-width:${largura}px;max-height:92vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--border);border-radius:10px;padding:16px">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.body.appendChild(m);
}
