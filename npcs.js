// ══════════════════════════════════════════════════
//  FRACTURED — npcs.js
//  Fichas de NPCs do Mestre + Cenas de Mapa
// ══════════════════════════════════════════════════

// ── ESTADO ────────────────────────────────────────
let npcList      = [];
let npcPastaAtual = 'Todas';
let npcEditando  = null;
let cenas        = [];
let cenaAtiva    = null;
let cenaRealtimeSub = null;

// ── CÁLCULO AUTOMÁTICO NPC ────────────────────────
// ══════════════════════════════════════════════════
//  A GRADE DE ATRIBUTOS DO NPC
//
//  Eram os seis do Fractured escritos à mão no app.html. Agora saem do
//  sistema da mesa — mesmos ids (`npc-a-<id>`, `npc-m-<id>`), então o
//  resto do arquivo não mudou.
// ══════════════════════════════════════════════════
function npcBuildAttrGrid() {
  const grid = document.getElementById('npc-attr-grid');
  const tit  = document.getElementById('npc-attr-titulo');
  if (!grid) return;
  const s = S();
  if (tit) tit.textContent = (s.ficha?.secoes || [])
    .find(x => x.tipo === 'atributos')?.titulo?.replace(/^Atributos\s*—\s*/, 'Atributos — distribua ')
    || 'Atributos';
  grid.innerHTML = s.atributos.map(a => `
      <div class="attr-card">
        <div class="attr-abbr">${a.sigla}</div><div class="attr-name">${a.nome}</div>
        <div class="attr-inputs">
          <input type="number" class="attr-val" id="npc-a-${a.id}" min="${a.min}" max="${a.max}" placeholder="0" oninput="npcCalcAttr()">
          <input type="text" class="attr-mod" id="npc-m-${a.id}" readonly placeholder="±0">
        </div>
        <div class="attr-sub"><span>VALOR</span><span>MOD</span></div>
      </div>`).join('');
}

function npcCalcAttr() {
  S().atributos.forEach(a => {
    const val = parseInt(document.getElementById('npc-a-' + a.id)?.value) || 0;
    const mod = modAtrib(val);
    const el  = document.getElementById('npc-m-' + a.id);
    if (el) el.value = (mod >= 0 ? '+' : '') + mod;
  });

  // O PV vem do sistema da mesa, a menos que o mestre digite um valor.
  const res      = parseInt(document.getElementById('npc-a-res')?.value) || 1;
  const pvCustom = parseInt(document.getElementById('npc-f-pv')?.value) || 0;
  const pvMax    = pvCustom > 0 ? pvCustom : derivado('pv_max', { res });
  const pvCalc = document.getElementById('npc-pv-calc');
  const pvForm = document.getElementById('npc-pv-formula');
  if (pvCalc) pvCalc.textContent = pvMax;
  // A frase do painel de NPC é mais curta que a da ficha ("= 8", não
  // "= máx 8"); o texto continua daqui, só a CONTA saiu para o sistema.
  if (pvForm) pvForm.textContent = pvCustom > 0
    ? `Personalizado: ${pvMax}`
    : `RES (${res}) × 4 = ${pvMax}`;
}

function npcAtualizarEmoji() {
  const tipo    = document.getElementById('npc-f-tipo')?.value || 'inimigo';
  const custom  = document.getElementById('npc-f-emoji')?.value.trim();
  const preview = document.getElementById('npc-avatar-emoji');
  const mapa    = { inimigo:'😈', aliado:'😇', neutro:'😐', infectado:'🧟', animal:'🐺' };
  if (preview) preview.textContent = custom || mapa[tipo] || '👤';
}


// ══════════════════════════════════════════════════
//  FICHAS DE NPCs
// ══════════════════════════════════════════════════

async function carregarNPCs() {
  const { data, error } = await db.from('npcs_mestre')
    .select('*')
    .eq('mesa_id', mesaId())
    .order('pasta').order('nome');
  if (error) { console.error(error); return; }
  npcList = data || [];
  renderNPCs();
}

function renderNPCs() {
  const container = document.getElementById('npc-lista');
  const pastaNav  = document.getElementById('npc-pastas');
  if (!container) return;

  // Pastas únicas
  const pastas = ['Todas', ...new Set(npcList.map(n => n.pasta || 'Geral'))];

  if (pastaNav) {
    pastaNav.innerHTML = '';
    pastas.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'npc-pasta-btn' + (p === npcPastaAtual ? ' ativa' : '');
      btn.textContent = p === 'Todas' ? `📁 Todas (${npcList.length})` : `📂 ${p}`;
      btn.onclick = () => { npcPastaAtual = p; renderNPCs(); };
      pastaNav.appendChild(btn);
    });
  }

  // Filtra por pasta
  const filtered = npcPastaAtual === 'Todas'
    ? npcList
    : npcList.filter(n => (n.pasta || 'Geral') === npcPastaAtual);

  // Agrupa por pasta
  const grupos = {};
  filtered.forEach(n => {
    const p = n.pasta || 'Geral';
    if (!grupos[p]) grupos[p] = [];
    grupos[p].push(n);
  });

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = '<div class="npc-empty">Nenhum NPC encontrado.<br>Crie o primeiro com o botão + NPC.</div>';
    return;
  }

  Object.entries(grupos).forEach(([pasta, npcs]) => {
    if (npcPastaAtual !== 'Todas') {
      // Sem header de grupo quando filtrado
    } else {
      const header = document.createElement('div');
      header.className = 'npc-grupo-header';
      header.innerHTML = `📂 ${pasta} <span class="npc-count">${npcs.length}</span>`;
      container.appendChild(header);
    }

    npcs.forEach(npc => {
      const card = document.createElement('div');
      card.className = `npc-card npc-tipo-${npc.tipo}`;
      const pvPct = npc.pv_max ? 100 : 0;
      card.innerHTML = `
        <div class="npc-card-header">
          <div class="npc-avatar">
            ${npc.img_url
              ? `<img src="${npc.img_url}" alt="" loading="lazy" decoding="async" width="44" height="44" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
              : `<span style="font-size:22px">${npc.emoji || tipoEmoji(npc.tipo)}</span>`}
          </div>
          <div class="npc-info">
            <div class="npc-nome">${npc.nome}</div>
            <div class="npc-meta">
              <span class="npc-tipo-badge npc-tipo-${npc.tipo}">${tipoLabel(npc.tipo)}</span>
              <span style="color:var(--muted);font-size:10px">PV ${npc.pv_max} · COM ${npc.com >= 0 ? '+':''  }${npc.com}</span>
            </div>
          </div>
          <div class="npc-acoes">
            <button class="npc-btn" onclick="verNPCCompleto('${npc.id}')" title="Ver ficha completa">👁</button>
            <button class="npc-btn" onclick="editarNPC('${npc.id}')" title="Editar">✏️</button>
            <button class="npc-btn" onclick="deletarNPC('${npc.id}')" title="Deletar" style="color:var(--red)">🗑</button>
          </div>
        </div>
        ${npc.habilidades ? `<details class="mob-mais npc-hab-wrap" ${window.innerWidth > 768 ? 'open' : ''}><summary>Habilidades</summary><div class="npc-hab">${npc.habilidades}</div></details>` : ''}
        <div class="npc-footer">
          <button class="npc-add-btn" onclick="adicionarNPCaoMapa('${npc.id}')">+🗺 Mapa</button>
          <button class="npc-add-btn" onclick="adicionarNPCaoCT('${npc.id}')">+⚔ CT</button>
          <button class="npc-add-btn npc-add-both" onclick="adicionarNPCAmbos('${npc.id}')">+Ambos</button>
        </div>
      `;
      container.appendChild(card);
    });
  });
}

function tipoEmoji(tipo) {
  return { inimigo:'😈', aliado:'😇', neutro:'😐', infectado:'🧟', animal:'🐺' }[tipo] || '👤';
}
function tipoLabel(tipo) {
  return { inimigo:'Inimigo', aliado:'Aliado', neutro:'Neutro', infectado:'Infectado', animal:'Animal' }[tipo] || tipo;
}

// ── FORMULÁRIO NPC ────────────────────────────────
function abrirFormNPC(npc = null) {
  npcEditando = npc;
  const modal = document.getElementById('modal-npc');
  if (!modal) return;

  // Os campos de atributo nascem aqui, do sistema da mesa.
  npcBuildAttrGrid();

  // Populate pasta datalist with existing folders
  const dl = document.getElementById('npc-pastas-list');
  if (dl) {
    const pastas = [...new Set(npcList.map(n => n.pasta || 'Geral'))];
    dl.innerHTML = pastas.map(p => `<option value="${p}">`).join('');
  }

  document.getElementById('npc-form-titulo').textContent = npc ? 'Editar NPC' : 'Criar NPC';

  // Limpa os campos de atributo (quais são, quem diz é o sistema)
  S().atributos.forEach(a => {
    const el = document.getElementById('npc-a-' + a.id);
    if (el) el.value = '';
    const mel = document.getElementById('npc-m-' + a.id);
    if (mel) mel.value = '±0';
  });
  document.getElementById('npc-f-nome').value      = npc?.nome || '';
  document.getElementById('npc-f-pasta').value     = npc?.pasta || 'Geral';
  document.getElementById('npc-f-tipo').value      = npc?.tipo || 'inimigo';
  document.getElementById('npc-f-emoji').value     = npc?.emoji || '';
  document.getElementById('npc-f-pv').value        = npc?.pv_max || '';
  document.getElementById('npc-f-hab').value       = npc?.habilidades || '';
  document.getElementById('npc-f-fraqueza').value  = npc?.fraqueza || '';
  document.getElementById('npc-f-notas').value     = npc?.notas || '';

  // Atributos gravados. No banco, "for" virou `for_` (palavra reservada
  // em SQL); os demais têm o mesmo nome do id — mas isso só vale para o
  // Fractured. Um NPC de outro sistema tem os atributos dentro de
  // `dados`, porque a tabela não tem coluna para eles.
  const doSistema = (npc && typeof S().npc?.deDados === 'function' && npc.dados?.v)
    ? (() => { try { return S().npc.deDados(npc.dados); } catch (e) { return null; } })()
    : null;
  S().atributos.forEach(a => {
    const el = document.getElementById('npc-a-' + a.id);
    if (!el) return;
    const doBanco = doSistema?.[`attr_${a.id}`] ?? npc?.[a.id === 'for' ? 'for_' : a.id];
    el.value = doBanco ?? 1;
  });

  // Imagem
  const prev = document.getElementById('npc-img-preview');
  const ph   = document.getElementById('npc-avatar-emoji');
  if (prev) { prev.src = npc?.img_url || ''; prev.style.display = npc?.img_url ? 'block' : 'none'; }
  if (ph)   { ph.style.display = npc?.img_url ? 'none' : ''; }

  // Recalcula
  npcCalcAttr();
  npcAtualizarEmoji();

  // Set attribute values from npc data
  //  Este bloco repetia o de cima com os nomes do Fractured cravados, e
  //  sobrescrevia os valores já corretos quando a mesa é de outro
  //  sistema. Sobrou só o PV, que é coluna de verdade.
  if (npc) {
    document.getElementById('npc-f-pv').value = npc.pv_max || '';
  }
  // Trigger automatic calculation
  setTimeout(npcCalcAttr, 30);
  modal.style.display = 'flex';
}

function fecharFormNPC() {
  const modal = document.getElementById('modal-npc');
  if (modal) modal.style.display = 'none';
  npcEditando = null;
}

async function salvarNPC() {
  const nome = document.getElementById('npc-f-nome')?.value.trim();
  if (!nome) return toast('Nome é obrigatório!', 'err');

  // Coleta atributos
  const getN = id => parseInt(document.getElementById(id)?.value) || 0;

  //  Os atributos do sistema da mesa, seja ele qual for. As colunas
  //  `for_`, `res`, `com`… são do Fractured; um NPC de A Vontade do
  //  Fogo tem TAI, NIN, GEN, CTR, COR, ESP e não cabia em nenhuma
  //  delas — os seis números eram lidos da tela e jogados fora.
  const attrDoSistema = {};
  (S().atributos || []).forEach(a => { attrDoSistema['attr_' + a.id] = getN('npc-a-' + a.id); });

  const res  = getN('npc-a-res');
  const pvCustom = getN('npc-f-pv');
  const pvMax    = pvCustom > 0 ? pvCustom : derivado('pv_max', attributosDoNpc(attrDoSistema));

  const payload = {
    master_id:   currentUser.id,
    nome,
    pasta:       document.getElementById('npc-f-pasta')?.value.trim() || 'Geral',
    tipo:        document.getElementById('npc-f-tipo')?.value || 'inimigo',
    emoji:       document.getElementById('npc-f-emoji')?.value.trim() || '',
    pv_max:      pvMax,
    for_:        getN('npc-a-for'),
    res:         res,
    com:         getN('npc-a-com'),
    soc:         getN('npc-a-soc'),
    con:         getN('npc-a-con'),
    agi:         getN('npc-a-agi'),
    // (as colunas acima são do Fractured e continuam sendo gravadas;
    //  o formato livre com os atributos do sistema vai em `dados`)
    habilidades: document.getElementById('npc-f-hab')?.value.trim() || null,
    fraqueza:    document.getElementById('npc-f-fraqueza')?.value.trim() || null,
    notas:       document.getElementById('npc-f-notas')?.value.trim() || null,
  };

  // Escrita dupla, igual à da ficha: as colunas continuam mandando e o
  // formato livre vai junto, pronto para quando outro sistema entrar.
  if (typeof S().npc?.paraDados === 'function') {
    //  `paraDados` recebe a ficha inteira — colunas MAIS os atributos do
    //  sistema. `attrDoSistema` não entra no payload: são campos que a
    //  tabela `npcs_mestre` não tem, e mandá-los como coluna derrubaria
    //  a gravação igual ao que acontecia com `cla` na ficha.
    try { payload.dados = S().npc.paraDados({ ...payload, ...attrDoSistema }); }
    catch (e) { console.error('[npc] não consegui montar o formato novo:', e); }
  }

  // Upload imagem se houver
  const imgInput = document.getElementById('npc-img-input');
  if (imgInput?.files[0]) {
    const file = imgInput.files[0];
    const ext  = file.name.split('.').pop();
    const path = `${currentUser.id}/npc_${Date.now()}.${ext}`;
    const { error: uploadErr } = await db.storage.from('tokens').upload(path, file, { upsert: true });
    if (!uploadErr) {
      const { data } = db.storage.from('tokens').getPublicUrl(path);
      payload.img_url = data.publicUrl;
    }
  } else if (npcEditando?.img_url) {
    payload.img_url = npcEditando.img_url;
  }

  const gravar = async () => {
    if (npcEditando) return db.from('npcs_mestre').update(payload).eq('id', npcEditando.id);
    return db.from('npcs_mestre').insert({ ...payload, mesa_id: mesaId() });
  };

  let { error } = await gravar();

  // Mesma rede de segurança da ficha: se a coluna `dados` ainda não
  // existe (migração 002 não rodada), grava sem ela em vez de falhar.
  if (error && erroDeColunaAusente(error, 'dados')) {
    console.warn('[npc] a coluna `dados` ainda não existe — gravando só no formato antigo.');
    delete payload.dados;
    ({ error } = await gravar());
  }

  if (error) { toast('Erro ao salvar NPC: ' + error.message, 'err'); return; }
  toast(npcEditando ? 'NPC atualizado!' : 'NPC criado!', 'ok');
  fecharFormNPC();
  await carregarNPCs();
}

function editarNPC(id) {
  const npc = npcList.find(n => n.id === id);
  if (npc) abrirFormNPC(npc);
}

// Ficha de leitura rápida (stat block) — sem entrar no modo de edição
function verNPCCompleto(id) {
  const npc = npcList.find(n => n.id === id);
  if (!npc) return;

  const attrs = S().atributos.map(a => [a.sigla, npc[a.id === 'for' ? 'for_' : a.id]]);
  const attrsHtml = attrs.map(([label, v]) => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 4px;text-align:center">
      <div style="font-size:9px;color:var(--muted);letter-spacing:1px">${label}</div>
      <div style="font-size:18px;font-weight:700;color:var(--text)">${v ?? 0}</div>
      <div style="font-size:10px;color:var(--muted)">${modAtrib(v ?? 0) >= 0 ? '+' : ''}${modAtrib(v ?? 0)}</div>
    </div>`).join('');

  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;z-index:8600;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="width:100%;max-width:440px;max-height:90vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--border);border-radius:10px;padding:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div class="npc-avatar" style="width:48px;height:48px;flex-shrink:0">
          ${npc.img_url
            ? `<img src="${esc(npc.img_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
            : `<span style="font-size:26px">${npc.emoji || tipoEmoji(npc.tipo)}</span>`}
        </div>
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--gold)">${esc(npc.nome)}</div>
          <span class="npc-tipo-badge npc-tipo-${npc.tipo}">${tipoLabel(npc.tipo)}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:12px">${attrsHtml}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:14px">Vida (PV): <strong style="color:var(--text)">${npc.pv_max ?? 0}</strong></div>
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase;margin-bottom:5px">Habilidades</div>
      <div style="font-size:12px;color:var(--text);white-space:pre-wrap;margin-bottom:12px">${npc.habilidades ? esc(npc.habilidades) : '—'}</div>
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase;margin-bottom:5px">Fraqueza</div>
      <div style="font-size:12px;color:var(--text);white-space:pre-wrap;margin-bottom:12px">${npc.fraqueza ? esc(npc.fraqueza) : '—'}</div>
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase;margin-bottom:5px">Notas</div>
      <div style="font-size:12px;color:var(--text);white-space:pre-wrap;margin-bottom:14px">${npc.notas ? esc(npc.notas) : '—'}</div>
      <button class="btn-ghost" style="width:100%;font-size:11px;padding:8px" onclick="this.closest('div').parentElement.remove()">Fechar</button>
    </div>`;
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.body.appendChild(m);
}

async function deletarNPC(id) {
  const npc = npcList.find(n => n.id === id);
  if (!confirm(`Deletar "${npc?.nome}"?`)) return;
  const { error } = await db.from('npcs_mestre').delete().eq('id', id);
  if (error) { toast('Erro ao deletar!', 'err'); return; }
  toast('NPC deletado.', 'ok');
  await carregarNPCs();
}

function npcParaToken(npc) {
  return {
    id:          'npc_' + npc.id + '_' + Date.now(),
    nome:        npc.nome,
    emoji:       npc.emoji || tipoEmoji(npc.tipo),
    tipo:        npc.tipo === 'aliado' ? 'pc' : npc.tipo === 'infectado' ? 'infectado' : npc.tipo === 'animal' ? 'animal' : 'humano',
    imgUrl:      npc.img_url || null,
    pvMax:       npc.pv_max,
    pvAtual:     npc.pv_max,
    isPC:        false,
    x:           snapGrid ? snapGrid(gridSize * 2) : gridSize * 2,
    y:           snapGrid ? snapGrid(gridSize * 2) : gridSize * 2,
  };
}

function npcParaCombatente(npc) {
  return {
    id:          'npc_' + npc.id + '_' + Date.now(),
    nome:        npc.nome,
    emoji:       npc.emoji || tipoEmoji(npc.tipo),
    imgUrl:      npc.img_url || null,
    tag:         '',
    pvMax:       npc.pv_max,
    pvAtual:     npc.pv_max,
    iniciativa:  rolarIniciativa(atributosDe(npc)),   // o sistema da mesa decide a conta
    tipo:        npc.tipo,
    habilidades: npc.habilidades ? npc.habilidades.split('\n').filter(Boolean) : [],
    fraqueza:    npc.fraqueza || '',
    condicoes:   [],
    isPC:        false,
    controlador: null,
  };
}

function adicionarNPCaoMapa(id) {
  const npc = npcList.find(n => n.id === id); if (!npc) return;
  if (typeof mapaAdicionarToken !== 'function') return toast('Abra o Mapa primeiro!', 'err');
  mapaAdicionarToken({
    id:     'npc_' + npc.id + '_' + Date.now(),
    nome:   npc.nome,
    emoji:  npc.emoji || tipoEmoji(npc.tipo),
    tipo:   npc.tipo === 'aliado' ? 'pc' : npc.tipo === 'infectado' ? 'infectado' : npc.tipo === 'animal' ? 'animal' : 'humano',
    imgUrl: npc.img_url || null,
    pvMax:  npc.pv_max,
    pvAtual: npc.pv_max,
    isPC:   false,
  });
  toast(`${npc.nome} adicionado ao mapa!`, 'ok');
}

function adicionarNPCaoCT(id) {
  const npc = npcList.find(n => n.id === id); if (!npc) return;
  combatentes.push(npcParaCombatente(npc));
  renderCT(); salvarCT();
  toast(`${npc.nome} adicionado ao CT!`, 'ok');
}

function adicionarNPCAmbos(id) {
  adicionarNPCaoMapa(id);
  adicionarNPCaoCT(id);
}

function npcImgPreview(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    const prev = document.getElementById('npc-img-preview');
    if (prev) { prev.src = e.target.result; prev.style.display = 'block'; }
  };
  r.readAsDataURL(file);
}

// ══════════════════════════════════════════════════
//  CENAS DE MAPA
// ══════════════════════════════════════════════════

// ── PASTAS DE CENA ────────────────────────────────
//  As cenas cresceram demais para uma lista só. Pasta é a arrumação:
//  mora no banco (tabela `cena_pastas` + coluna `cenas_mapa.pasta_id`),
//  porque é da mesa e tem de continuar igual depois de um F5 e para
//  todo mundo.
//
//  Cena sem pasta_id fica na raiz — e é aí que estão TODAS as cenas que
//  já existiam antes desta mudança. Nada precisa ser reenviado.
let cenaPastas      = [];
let _cenasBusca     = '';
let _cenasSemPastas = false;   // true = o banco ainda não tem a migração 003

//  Aberta ou recolhida é preferência de quem olha, não da mesa: fica no
//  navegador de cada um.
function _cenaPastasFechadas() {
  try { return JSON.parse(localStorage.getItem('cenas_fechadas_' + mesaId()) || '[]') || []; }
  catch (e) { return []; }
}
function _cenaPastaAberta(id) { return !_cenaPastasFechadas().includes(id); }
function cenaPastaAlternar(id) {
  const fechadas = _cenaPastasFechadas();
  const i = fechadas.indexOf(id);
  if (i === -1) fechadas.push(id); else fechadas.splice(i, 1);
  try { localStorage.setItem('cenas_fechadas_' + mesaId(), JSON.stringify(fechadas)); } catch (e) {}
  renderCenas(); renderCenasInline();
}

async function carregarCenas() {
  //  As duas leituras em paralelo. `select('*')` traz `pasta_id`
  //  sozinho depois da migração; antes dela vem undefined, e tudo cai
  //  na raiz — que é exatamente o comportamento de antes.
  const [cenasRes, pastasRes] = await Promise.all([
    db.from('cenas_mapa').select('*').eq('mesa_id', mesaId()).order('ordem'),
    db.from('cena_pastas').select('*').eq('mesa_id', mesaId()).order('ordem').order('created_at'),
  ]);

  cenas = cenasRes.data || [];

  //  Banco sem a migração: a tabela não existe. Guardamos o fato para
  //  avisar o mestre no lugar certo, em vez de encher o console.
  if (pastasRes.error) { cenaPastas = []; _cenasSemPastas = true; }
  else { cenaPastas = pastasRes.data || []; _cenasSemPastas = false; }

  // Restaura a cena ativa após F5 (antes disso, salvar após reload falhava)
  if (!cenaAtiva) {
    const ativa = cenas.find(c => c.ativa);
    if (ativa) cenaAtiva = ativa.id;
  }

  renderCenas();
  renderCenasInline();
  subscribeCenas();
}

async function criarPastaCena() {
  if (!isMaster) return;
  if (_cenasSemPastas) { toast('Rode a migração 003 no Supabase para usar pastas de mapa.', 'err'); return; }
  const nome = prompt('Nome da pasta (ex: "Vila da Folha", "Masmorra"):');
  if (!nome?.trim()) return;
  const { error } = await db.from('cena_pastas').insert({
    mesa_id: mesaId(), nome: nome.trim(), ordem: cenaPastas.length,
  });
  if (error) { toast('Erro ao criar pasta: ' + error.message, 'err'); return; }
  toast(`Pasta "${nome.trim()}" criada.`, 'ok');
  await carregarCenas();
}

async function renomearPastaCena(id) {
  if (!isMaster) return;
  const p = cenaPastas.find(x => x.id === id);
  if (!p) return;
  const nome = prompt('Novo nome da pasta:', p.nome);
  if (!nome?.trim() || nome.trim() === p.nome) return;
  const { error } = await db.from('cena_pastas').update({ nome: nome.trim() }).eq('id', id);
  if (error) { toast('Erro ao renomear: ' + error.message, 'err'); return; }
  await carregarCenas();
}

//  Apagar pasta é onde dá medo de perder mapa. Então aqui não existe
//  `confirm()` seco: a pergunta diz quantos mapas estão dentro e dá as
//  duas saídas em botões separados, com a segura em primeiro lugar.
function deletarPastaCena(id) {
  if (!isMaster) return;
  const p = cenaPastas.find(x => x.id === id);
  if (!p) return;
  const dentro = cenas.filter(c => c.pasta_id === id);

  const corpo = dentro.length
    ? `<p class="cena-dlg-p">A pasta <strong>${_cenaEsc(p.nome)}</strong> tem
         <strong>${dentro.length} ${dentro.length === 1 ? 'mapa' : 'mapas'}</strong> dentro.
         O que fazer com ${dentro.length === 1 ? 'ele' : 'eles'}?</p>
       <ul class="cena-dlg-lista">${dentro.slice(0, 6).map(c => `<li>${_cenaEsc(c.nome)}</li>`).join('')}
         ${dentro.length > 6 ? `<li class="cena-dlg-mais">e mais ${dentro.length - 6}…</li>` : ''}</ul>`
    : `<p class="cena-dlg-p">A pasta <strong>${_cenaEsc(p.nome)}</strong> está vazia.</p>`;

  const botoes = dentro.length
    ? `<button class="btn-ghost cena-dlg-ok" onclick="_cenaPastaApagar('${id}', false)">
         Apagar a pasta e <strong>manter os mapas</strong>
         <span class="cena-dlg-nota">eles voltam para “Fora de pasta”</span>
       </button>
       <button class="btn-ghost cena-dlg-perigo" onclick="_cenaPastaApagar('${id}', true)">
         Apagar a pasta <strong>e os ${dentro.length} mapas</strong>
         <span class="cena-dlg-nota">não tem como desfazer</span>
       </button>`
    : `<button class="btn-ghost cena-dlg-ok" onclick="_cenaPastaApagar('${id}', false)">Apagar a pasta</button>`;

  const dlg = document.createElement('div');
  dlg.className = 'cena-dlg-fundo';
  dlg.id = 'cena-dlg';
  dlg.innerHTML = `<div class="cena-dlg">
      <div class="cena-dlg-topo">Apagar pasta</div>
      ${corpo}
      <div class="cena-dlg-btns">${botoes}
        <button class="btn-ghost cena-dlg-cancelar" onclick="_cenaDlgFechar()">Cancelar</button>
      </div>
    </div>`;
  dlg.addEventListener('click', e => { if (e.target === dlg) _cenaDlgFechar(); });
  document.body.appendChild(dlg);
}

function _cenaDlgFechar() { document.getElementById('cena-dlg')?.remove(); }

async function _cenaPastaApagar(id, apagarMapas) {
  _cenaDlgFechar();
  if (!isMaster) return;

  if (apagarMapas) {
    const ids = cenas.filter(c => c.pasta_id === id).map(c => c.id);
    if (ids.length) {
      const { error } = await db.from('cenas_mapa').delete().in('id', ids);
      if (error) { toast('Erro ao apagar os mapas: ' + error.message, 'err'); return; }
      if (ids.includes(cenaAtiva)) cenaAtiva = null;
    }
  }
  //  Sem apagar os mapas, o próprio banco os solta para a raiz:
  //  `pasta_id` foi criada com ON DELETE SET NULL. Mapa nunca é
  //  apagado por tabela, só por escolha explícita aqui em cima.
  const { error } = await db.from('cena_pastas').delete().eq('id', id);
  if (error) { toast('Erro ao apagar a pasta: ' + error.message, 'err'); return; }
  toast(apagarMapas ? 'Pasta e mapas apagados.' : 'Pasta apagada. Os mapas estão fora de pasta.', 'ok');
  await carregarCenas();
}

async function moverCenaParaPasta(cenaId, pastaId) {
  if (!isMaster) return;
  const cena = cenas.find(c => c.id === cenaId);
  if (!cena) return;
  const destino = pastaId || null;
  if ((cena.pasta_id || null) === destino) return;

  //  Move na tela primeiro: arrastar tem de responder na hora.
  cena.pasta_id = destino;
  renderCenas(); renderCenasInline();

  const { error } = await db.from('cenas_mapa').update({ pasta_id: destino }).eq('id', cenaId);
  if (error) {
    toast('Não deu para mover: ' + error.message, 'err');
    await carregarCenas();   // desfaz, o banco é quem manda
    return;
  }
  const p = cenaPastas.find(x => x.id === destino);
  toast(p ? `"${cena.nome}" → ${p.nome}` : `"${cena.nome}" saiu da pasta.`, 'ok');
}

//  Alternativa ao arrastar, que é ruim no telefone e impossível no
//  teclado: um menu com os destinos.
function cenaMenuMover(cenaId, ev) {
  ev?.stopPropagation();
  document.getElementById('cena-menu')?.remove();
  const cena = cenas.find(c => c.id === cenaId);
  if (!cena) return;

  const itens = [{ id: '', nome: 'Fora de pasta' }].concat(cenaPastas.map(p => ({ id: p.id, nome: p.nome })));
  const menu = document.createElement('div');
  menu.id = 'cena-menu';
  menu.className = 'cena-menu';
  menu.innerHTML = `<div class="cena-menu-topo">Mover para…</div>` + itens.map(i => {
    const aqui = (cena.pasta_id || '') === i.id;
    return `<button class="cena-menu-item${aqui ? ' aqui' : ''}"
       onclick="document.getElementById('cena-menu')?.remove();moverCenaParaPasta('${cenaId}','${i.id}')"
       ${aqui ? 'disabled' : ''}>${i.id ? '📁' : '🗺'} ${_cenaEsc(i.nome)}${aqui ? ' ✓' : ''}</button>`;
  }).join('') + (isMaster ? `<button class="cena-menu-item cena-menu-nova" onclick="document.getElementById('cena-menu')?.remove();criarPastaCena()">＋ Nova pasta…</button>` : '');

  document.body.appendChild(menu);
  const r = ev?.currentTarget?.getBoundingClientRect?.();
  const topo = r ? Math.min(r.bottom + 4, window.innerHeight - menu.offsetHeight - 8) : 80;
  const esq  = r ? Math.min(r.left, window.innerWidth - menu.offsetWidth - 8) : 80;
  menu.style.top  = Math.max(8, topo) + 'px';
  menu.style.left = Math.max(8, esq) + 'px';
  setTimeout(() => document.addEventListener('click', _cenaMenuFora), 0);
}
function _cenaMenuFora(e) {
  const m = document.getElementById('cena-menu');
  if (m && !m.contains(e.target)) { m.remove(); document.removeEventListener('click', _cenaMenuFora); }
}

function _cenaEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function cenasBuscar(t) {
  _cenasBusca = String(t || '').trim().toLowerCase();
  renderCenas(); renderCenasInline();
}

async function carregarCenaAtiva() {
  // Players carregam a cena ativa
  const { data } = await db.from('cenas_mapa')
    .select('*')
    .eq('mesa_id', mesaId())
    .eq('ativa', true)
    .maybeSingle();
  if (data) aplicarCena(data);
}

// ── DESENHO DA LISTA ──────────────────────────────
//  Um só desenhista para os dois lugares onde as cenas aparecem (a
//  página de NPCs e o modal dentro da sala). Antes eram duas funções
//  parecidas, e toda mudança tinha de ser feita duas vezes.

function _cenaItemEl(cena, pastaNome) {
  const div = document.createElement('div');
  div.className = 'cena-item' + (cena.ativa ? ' cena-ativa' : '');
  div.dataset.cena = cena.id;
  div.innerHTML = `
    <div class="cena-thumb">
      ${cena.mapa_url
        ? `<img src="${cena.mapa_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px" alt="">`
        : `<span style="font-size:20px">🗺️</span>`}
    </div>
    <div class="cena-info">
      <div class="cena-nome">${_cenaEsc(cena.nome)}</div>
      ${cena.ativa ? '<span class="cena-badge-ativa">● AO VIVO</span>' : ''}
      ${pastaNome ? `<span class="cena-de-pasta">📁 ${_cenaEsc(pastaNome)}</span>` : ''}
    </div>
    <div class="cena-btns">
      ${isMaster ? `<button class="ct-pv-btn" onclick="ativarCena('${cena.id}')" title="Ativar para todos">▶</button>` : ''}
      ${isMaster ? `<button class="ct-pv-btn" onclick="cenaMenuMover('${cena.id}', event)" title="Mover para pasta">📁</button>` : ''}
      ${isMaster ? `<button class="ct-pv-btn" onclick="deletarCena('${cena.id}')" style="color:var(--red)" title="Deletar">✕</button>` : ''}
    </div>`;

  div.addEventListener('click', e => {
    if (e.target.closest('.cena-btns')) return;
    if (isMaster) previewCena(cena);
  });

  //  Arrastar para dentro da pasta (mestre). É o caminho rápido; o
  //  botão 📁 faz o mesmo para quem está no telefone.
  if (isMaster) {
    div.draggable = true;
    div.addEventListener('dragstart', e => {
      div.classList.add('cena-arrastando');
      try { e.dataTransfer.setData('text/cena', cena.id); } catch (err) {}
      e.dataTransfer.effectAllowed = 'move';
    });
    div.addEventListener('dragend', () => div.classList.remove('cena-arrastando'));
  }
  return div;
}

//  Liga uma área como destino de soltar. `pastaId` null = raiz.
function _cenaZonaSolta(el, pastaId) {
  if (!isMaster) return;
  el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('cena-solta'); });
  el.addEventListener('dragleave', () => el.classList.remove('cena-solta'));
  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('cena-solta');
    let id = '';
    try { id = e.dataTransfer.getData('text/cena'); } catch (err) {}
    if (id) moverCenaParaPasta(id, pastaId);
  });
}

function _cenasPintar(elId) {
  const lista = document.getElementById(elId);
  if (!lista) return;
  lista.innerHTML = '';

  //  No telefone, esta lista virou uma tira que rola de lado, com os
  //  mapas em forma de pílula (ver style.css, bloco de mobile). Isso
  //  funciona para uma lista plana e não funciona para pastas: cabeçalho
  //  e conteúdo viram pílulas soltas na mesma fileira. Então avisamos o
  //  CSS: com pastas, a lista volta a ser vertical; sem pastas, nada
  //  muda para quem já estava usando assim.
  lista.classList.toggle('cenas-com-pastas', cenaPastas.length > 0);

  const busca    = _cenasBusca;
  const casa     = c => !busca || String(c.nome || '').toLowerCase().includes(busca);
  const naPasta  = id => cenas.filter(c => (c.pasta_id || null) === id);

  // A busca procura também pelo nome da pasta, para "masmorra" achar
  // a pasta inteira.
  const pastaCasa = p => busca && String(p.nome || '').toLowerCase().includes(busca);

  // ── Campo de busca ──
  if (cenas.length > 3 || cenaPastas.length) {
    const b = document.createElement('div');
    b.className = 'cena-busca-caixa';
    b.innerHTML = `<input class="cena-busca" type="search" placeholder="Buscar mapa…"
      value="${_cenaEsc(busca)}" aria-label="Buscar mapa por nome"
      oninput="cenasBuscar(this.value)">`;
    lista.appendChild(b);
  }

  if (!cenas.length && !cenaPastas.length) {
    const vazio = document.createElement('div');
    vazio.className = 'cena-vazio';
    vazio.textContent = 'Nenhuma cena criada.';
    lista.appendChild(vazio);
    return;
  }

  let mostrados = 0;

  // ── Pastas ──
  cenaPastas.forEach(pasta => {
    const dentro  = naPasta(pasta.id);
    const filtrados = pastaCasa(pasta) ? dentro : dentro.filter(casa);
    //  Buscando: pasta sem resultado sai da frente.
    if (busca && !filtrados.length) return;

    //  Buscando, a pasta abre sozinha — senão o resultado estaria
    //  escondido justamente onde a pessoa procurou.
    const aberta = busca ? true : _cenaPastaAberta(pasta.id);

    const cab = document.createElement('div');
    cab.className = 'cena-pasta-cab' + (aberta ? ' aberta' : '');
    cab.innerHTML = `
      <button class="cena-pasta-nome" onclick="cenaPastaAlternar('${pasta.id}')"
        aria-expanded="${aberta}" title="${aberta ? 'Recolher' : 'Expandir'}">
        <span class="cena-pasta-seta">${aberta ? '▾' : '▸'}</span>
        <span class="cena-pasta-ico">📁</span>
        <span class="cena-pasta-txt">${_cenaEsc(pasta.nome)}</span>
        <span class="cena-pasta-n">${dentro.length}</span>
      </button>
      ${isMaster ? `<span class="cena-pasta-btns">
        <button class="ct-pv-btn" onclick="renomearPastaCena('${pasta.id}')" title="Renomear">✎</button>
        <button class="ct-pv-btn" onclick="deletarPastaCena('${pasta.id}')" style="color:var(--red)" title="Apagar pasta">✕</button>
      </span>` : ''}`;
    _cenaZonaSolta(cab, pasta.id);
    lista.appendChild(cab);

    if (!aberta) return;
    const corpo = document.createElement('div');
    corpo.className = 'cena-pasta-corpo';
    _cenaZonaSolta(corpo, pasta.id);
    if (!filtrados.length) {
      const v = document.createElement('div');
      v.className = 'cena-vazio cena-vazio-pasta';
      v.textContent = isMaster ? 'Vazia — arraste um mapa para cá.' : 'Vazia.';
      corpo.appendChild(v);
    } else {
      filtrados.forEach(c => { corpo.appendChild(_cenaItemEl(c)); mostrados++; });
    }
    lista.appendChild(corpo);
  });

  // ── Fora de pasta ──
  const raiz = naPasta(null).filter(casa);
  if (cenaPastas.length) {
    //  Com pastas na tela, a raiz ganha um cabeçalho para ser um
    //  destino visível de arrastar ("tirar da pasta").
    if (raiz.length || isMaster) {
      const cab = document.createElement('div');
      cab.className = 'cena-pasta-cab cena-raiz-cab aberta';
      cab.innerHTML = `<span class="cena-pasta-nome cena-raiz-nome">
          <span class="cena-pasta-ico">🗺</span>
          <span class="cena-pasta-txt">Fora de pasta</span>
          <span class="cena-pasta-n">${naPasta(null).length}</span>
        </span>`;
      _cenaZonaSolta(cab, null);
      lista.appendChild(cab);
    }
    const corpo = document.createElement('div');
    corpo.className = 'cena-pasta-corpo';
    _cenaZonaSolta(corpo, null);
    raiz.forEach(c => { corpo.appendChild(_cenaItemEl(c)); mostrados++; });
    if (!raiz.length && isMaster && !busca) {
      const v = document.createElement('div');
      v.className = 'cena-vazio cena-vazio-pasta';
      v.textContent = 'Nada fora de pasta.';
      corpo.appendChild(v);
    }
    lista.appendChild(corpo);
  } else {
    //  Sem pastas, a lista é a de sempre — nada mudou para quem não
    //  quer organizar nada.
    raiz.forEach(c => { lista.appendChild(_cenaItemEl(c)); mostrados++; });
  }

  if (busca && !mostrados) {
    const v = document.createElement('div');
    v.className = 'cena-vazio';
    v.textContent = `Nenhum mapa com "${busca}".`;
    lista.appendChild(v);
  }

  //  Aviso só para o mestre, e só se a migração não foi rodada.
  if (isMaster && _cenasSemPastas) {
    const a = document.createElement('div');
    a.className = 'cena-aviso';
    a.textContent = 'Pastas de mapa: rode a migração 003 no Supabase para ativar.';
    lista.appendChild(a);
  }
}

function renderCenas()       { _cenasPintar('cenas-lista'); }
function renderCenasInline() { _cenasPintar('cenas-lista-inline'); }

async function criarCena() {
  const nome = prompt('Nome da cena (ex: "Interior do Bunker"):');
  if (!nome?.trim()) return;

  // Salva tokens e mapa atual como nova cena
  const { error } = await db.from('cenas_mapa').insert({
    mesa_id:   mesaId(),
    master_id: currentUser.id,
    nome:      nome.trim(),
    mapa_url:  (MAP?.imgUrl && MAP.imgUrl.startsWith('https://')) ? MAP.imgUrl : null,
    video_url: (typeof _vidUrl !== 'undefined' && _vidUrl && _vidUrl.startsWith('https://')) ? _vidUrl : null,
    tokens:    MAP?.tokens || [],
    grid_size: MAP?.gridSize || 60,
    fog:       typeof fogExport === 'function' ? fogExport() : null,
    paredes:   (typeof FOG !== 'undefined') ? FOG.paredes : [],
    ordem:     cenas.length,
    ativa:     false,
  });

  if (error) { toast('Erro ao criar cena: ' + error.message, 'err'); return; }
  toast(`Cena "${nome}" criada!`, 'ok');
  await carregarCenas();
}

async function salvarCenaAtual() {
  if (!isMaster) return;
  if (!cenaAtiva) { toast('Nenhuma cena ativa.', 'err'); return; }

  const payload = {
    mapa_url:  (MAP?.imgUrl && MAP.imgUrl.startsWith('https://')) ? MAP.imgUrl : null,
    video_url: (typeof _vidUrl !== 'undefined' && _vidUrl && _vidUrl.startsWith('https://')) ? _vidUrl : null,
    tokens:    MAP?.tokens || [],
    grid_size: MAP?.gridSize || 60,
    fog:       typeof fogExport === 'function' ? fogExport() : null,
    paredes:   (typeof FOG !== 'undefined') ? FOG.paredes : [],
  };

  const { data, error } = await db.from('cenas_mapa')
    .update(payload)
    .eq('id', cenaAtiva)
    .select(); // detecta update bloqueado por RLS (sem erro, 0 linhas)

  if (error) { toast('Erro ao salvar: ' + error.message, 'err'); return; }
  if (!data || !data.length) {
    toast('⚠ Nada foi salvo — verifique a policy de UPDATE (RLS) em cenas_mapa.', 'err');
    return;
  }

  // Atualiza o array local IMEDIATAMENTE (não depende do realtime)
  const idx = cenas.findIndex(c => c.id === cenaAtiva);
  if (idx !== -1) cenas[idx] = { ...cenas[idx], ...payload };

  toast('Cena salva!', 'ok');
  renderCenas();
  if (typeof renderCenasInline === 'function') renderCenasInline();
}

let _ativarCenaTimer = null;
async function ativarCena(id) {
  // Debounce - ignora chamadas duplicadas em menos de 1 segundo
  if (_ativarCenaTimer) return;
  _ativarCenaTimer = setTimeout(() => { _ativarCenaTimer = null; }, 1000);

  const cena = cenas.find(c => c.id === id);
  if (!cena) return;

  cenaAtiva = id;

  // 1. Aplica localmente imediato (sem esperar banco)
  aplicarCena(cena);
  toast(`Cena "${cena.nome}" ativada!`, 'ok');

  // 2. Propaga via mapa_estado (canal realtime ativo para todos)
  const urlCena = (cena.mapa_url && !cena.mapa_url.startsWith('data:')) ? cena.mapa_url : null;
  console.log('ativarCena: salvando mapa_estado, url=', urlCena||'null');
  try {
    const { error } = await db.from('mapa_estado').upsert({
      id:           mesaId(),
      tokens:       cena.tokens || [],
      grid_size:    cena.grid_size || 60,
      grid_visivel: true,
      mapa_url:     urlCena,
      video_url:    cena.video_url || null,
      updated_at:   new Date().toISOString()
    });
    if (error) console.error('ativarCena mapa_estado error:', error);
    else console.log('ativarCena: mapa_estado atualizado com sucesso');
  } catch(e) { console.error('ativarCena exception:', e); }

  // 3. Atualiza flag visual da cena (não crítico, ignora erro)
  try {
    await db.from('cenas_mapa')
      .update({ ativa: false })
      .eq('mesa_id', mesaId());
    await db.from('cenas_mapa')
      .update({ ativa: true })
      .eq('id', id);
  } catch(e) {}
  carregarCenas();
}

function previewCena(cena) {
  // Mestre vê preview sem ativar para todos
  aplicarCena(cena);
}

function aplicarCena(cena) {
  cenaAtiva = cena.id;
  if (typeof mapaAplicarCena === 'function') mapaAplicarCena(cena);
  // mapaAplicarCena já lida com video_url internamente
}

async function deletarCena(id) {
  const cena = cenas.find(c => c.id === id);
  if (!confirm(`Deletar cena "${cena?.nome}"?`)) return;
  await db.from('cenas_mapa').delete().eq('id', id);
  if (cenaAtiva === id) cenaAtiva = null;
  toast('Cena deletada.', 'ok');
  await carregarCenas();
}

function subscribeCenas() {
  if (cenaRealtimeSub) return;
  cenaRealtimeSub = db.channel('cenas-live-'+mesaId())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cenas_mapa', filter: 'mesa_id=eq.' + mesaId() }, async payload => {
      // Debounce: a troca de cena dispara vários eventos seguidos
      clearTimeout(window._cenasReloadTimer);
      window._cenasReloadTimer = setTimeout(() => carregarCenas(), 400);
      // Aplica cena ativa para todos (mestre já aplicou localmente)
      if (payload.new?.ativa) {
        if (!isMaster) {
          aplicarCena(payload.new);
          toast('🗺️ O mestre mudou o mapa!', 'ok');
        }
      }
      // Mestre também atualiza a lista de cenas
      if (isMaster) { renderCenas(); renderCenasInline(); }
    })
    //  A arrumação também é ao vivo: pasta criada, renomeada ou apagada
    //  aparece em todas as telas abertas sem F5.
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cena_pastas', filter: 'mesa_id=eq.' + mesaId() }, () => {
      clearTimeout(window._cenasReloadTimer);
      window._cenasReloadTimer = setTimeout(() => carregarCenas(), 400);
    })
    .subscribe();
}

// ══════════════════════════════════════════════════
//  MODAL CENAS (dentro da sala, sem sair do mapa)
// ══════════════════════════════════════════════════
function abrirModalCenas() {
  let modal = document.getElementById('modal-cenas-inline');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-cenas-inline';
    modal.style.cssText = 'position:fixed;top:60px;right:16px;width:280px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.6);z-index:9999;overflow:hidden';
    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--surface2);border-bottom:1px solid var(--border)">
        <span style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--text);text-transform:uppercase">🎬 Cenas de Mapa</span>
        <button onclick="fecharModalCenas()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="padding:10px;max-height:400px;overflow-y:auto">
        <div id="cenas-lista-inline" style="display:flex;flex-direction:column;gap:5px;margin-bottom:8px"></div>
        <button class="btn-ghost" onclick="criarCena()" style="width:100%;font-size:10px;padding:5px;margin-bottom:4px">＋ Nova Cena com mapa atual</button>
        <button class="btn-ghost" onclick="criarPastaCena()" style="width:100%;font-size:10px;padding:5px;margin-bottom:4px">📁 Nova pasta</button>
        <button class="btn-ghost" onclick="salvarCenaAtual()" style="width:100%;font-size:10px;padding:5px">💾 Salvar cena atual</button>
      </div>
    `;
    document.body.appendChild(modal);
    // Fecha ao clicar fora
    setTimeout(() => {
      document.addEventListener('click', fecharModalCenasFora);
    }, 100);
  }
  modal.style.display = 'block';
  renderCenasInline();
  if (typeof carregarCenas === 'function') carregarCenas().then(renderCenasInline);
}

function fecharModalCenas() {
  const m = document.getElementById('modal-cenas-inline');
  if (m) m.style.display = 'none';
  document.removeEventListener('click', fecharModalCenasFora);
}

function fecharModalCenasFora(e) {
  const m = document.getElementById('modal-cenas-inline');
  if (m && !m.contains(e.target) && !e.target.closest('[onclick*="abrirModalCenas"]')) {
    fecharModalCenas();
  }
}

// Inicializa NPC page quando abre
function initNPCs() {
  carregarNPCs();
  carregarCenas();
}
