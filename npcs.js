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
function npcCalcAttr() {
  const attrs = ['for','res','com','soc','con','agi'];
  attrs.forEach(a => {
    const val = parseInt(document.getElementById('npc-a-'+a)?.value) || 0;
    const mod = val - 3;
    const el  = document.getElementById('npc-m-'+a);
    if (el) el.value = (mod >= 0 ? '+' : '') + mod;
  });

  // PV = RES × 4, ou personalizado
  const res    = parseInt(document.getElementById('npc-a-res')?.value) || 1;
  const pvCustom = parseInt(document.getElementById('npc-f-pv')?.value) || 0;
  const pvMax  = pvCustom > 0 ? pvCustom : Math.max(res * 4, 4);
  const pvCalc = document.getElementById('npc-pv-calc');
  const pvForm = document.getElementById('npc-pv-formula');
  if (pvCalc) pvCalc.textContent = pvMax;
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
    .eq('master_id', currentUser.id)
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
              ? `<img src="${npc.img_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
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
            <button class="npc-btn" onclick="editarNPC('${npc.id}')" title="Editar">✏️</button>
            <button class="npc-btn" onclick="deletarNPC('${npc.id}')" title="Deletar" style="color:var(--red)">🗑</button>
          </div>
        </div>
        ${npc.habilidades ? `<div class="npc-hab">${npc.habilidades.substring(0,80)}${npc.habilidades.length>80?'…':''}</div>` : ''}
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

  // Populate pasta datalist with existing folders
  const dl = document.getElementById('npc-pastas-list');
  if (dl) {
    const pastas = [...new Set(npcList.map(n => n.pasta || 'Geral'))];
    dl.innerHTML = pastas.map(p => `<option value="${p}">`).join('');
  }

  document.getElementById('npc-form-titulo').textContent = npc ? 'Editar NPC' : 'Criar NPC';

  // Reset all attr fields first
  ['for','res','com','soc','con','agi'].forEach(a => {
    const el = document.getElementById('npc-a-'+a);
    if (el) el.value = '';
    const mel = document.getElementById('npc-m-'+a);
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

  // Atributos
  const attrMap = { for:'for_', res:'res', com:'com', soc:'soc', con:'con', agi:'agi' };
  Object.entries(attrMap).forEach(([k, dbKey]) => {
    const el = document.getElementById('npc-a-'+k);
    if (el) el.value = npc?.[dbKey] ?? 1;
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
  if (npc) {
    const attrMap = { for: npc.for_, res: npc.res, com: npc.com, soc: npc.soc, con: npc.con, agi: npc.agi };
    Object.entries(attrMap).forEach(([a, v]) => {
      const el = document.getElementById('npc-a-'+a);
      if (el && v !== undefined && v !== null) el.value = v;
    });
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
  const res  = getN('npc-a-res');
  const pvCustom = getN('npc-f-pv');
  const pvMax    = pvCustom > 0 ? pvCustom : Math.max(res * 4, 4);

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
    habilidades: document.getElementById('npc-f-hab')?.value.trim() || null,
    fraqueza:    document.getElementById('npc-f-fraqueza')?.value.trim() || null,
    notas:       document.getElementById('npc-f-notas')?.value.trim() || null,
  };

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

  let error;
  if (npcEditando) {
    ({ error } = await db.from('npcs_mestre').update(payload).eq('id', npcEditando.id));
  } else {
    ({ error } = await db.from('npcs_mestre').insert(payload));
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
    tag:         '',
    pvMax:       npc.pv_max,
    pvAtual:     npc.pv_max,
    iniciativa:  Math.floor(Math.random() * 20) + 1 + (npc.agi || 0),
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
  if (typeof tokens === 'undefined') return toast('Abra o Mapa primeiro!', 'err');
  tokens.push(npcParaToken(npc));
  if (typeof desenharMapa === 'function') desenharMapa();
  if (typeof salvarMapaDB === 'function') salvarMapaDB();
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

async function carregarCenas() {
  const { data } = await db.from('cenas_mapa')
    .select('*')
    .eq('master_id', currentUser.id)
    .order('ordem');
  cenas = data || [];
  renderCenas();
  subscribeCenas();
}

async function carregarCenaAtiva() {
  // Players carregam a cena ativa
  const { data } = await db.from('cenas_mapa')
    .select('*')
    .eq('ativa', true)
    .single();
  if (data) aplicarCena(data);
}

function renderCenas() {
  const lista = document.getElementById('cenas-lista');
  if (!lista) return;

  lista.innerHTML = '';
  if (!cenas.length) {
    lista.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:8px;text-align:center">Nenhuma cena criada.</div>';
    return;
  }

  cenas.forEach(cena => {
    const div = document.createElement('div');
    div.className = 'cena-item' + (cena.ativa ? ' cena-ativa' : '');
    div.innerHTML = `
      <div class="cena-thumb">
        ${cena.mapa_url
          ? `<img src="${cena.mapa_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`
          : `<span style="font-size:20px">🗺️</span>`}
      </div>
      <div class="cena-info">
        <div class="cena-nome">${cena.nome}</div>
        ${cena.ativa ? '<span class="cena-badge-ativa">● AO VIVO</span>' : ''}
      </div>
      <div class="cena-btns">
        ${isMaster ? `<button class="ct-pv-btn" onclick="ativarCena('${cena.id}')" title="Ativar para todos">▶</button>` : ''}
        ${isMaster ? `<button class="ct-pv-btn" onclick="deletarCena('${cena.id}')" style="color:var(--red)" title="Deletar">✕</button>` : ''}
      </div>
    `;
    div.addEventListener('click', e => {
      if (e.target.closest('.cena-btns')) return;
      if (isMaster) previewCena(cena);
    });
    lista.appendChild(div);
  });
}

async function criarCena() {
  const nome = prompt('Nome da cena (ex: "Interior do Bunker"):');
  if (!nome?.trim()) return;

  // Salva tokens e mapa atual como nova cena
  const { error } = await db.from('cenas_mapa').insert({
    master_id: currentUser.id,
    nome:      nome.trim(),
    mapa_url:  typeof mapaUrl !== 'undefined' ? mapaUrl : null,
    tokens:    typeof tokens !== 'undefined' ? tokens : [],
    grid_size: typeof gridSize !== 'undefined' ? gridSize : 60,
    ordem:     cenas.length,
    ativa:     false,
  });

  if (error) { toast('Erro ao criar cena: ' + error.message, 'err'); return; }
  toast(`Cena "${nome}" criada!`, 'ok');
  await carregarCenas();
}

async function salvarCenaAtual() {
  if (!cenaAtiva) { toast('Nenhuma cena ativa.', 'err'); return; }
  const { error } = await db.from('cenas_mapa').update({
    mapa_url:  typeof mapaUrl !== 'undefined' ? mapaUrl : null,
    tokens:    typeof tokens !== 'undefined' ? tokens : [],
    grid_size: typeof gridSize !== 'undefined' ? gridSize : 60,
  }).eq('id', cenaAtiva);
  if (error) { toast('Erro ao salvar!', 'err'); return; }
  toast('Cena salva!', 'ok');
}

async function ativarCena(id) {
  const cena = cenas.find(c => c.id === id);
  if (!cena) return;

  cenaAtiva = id;

  // 1. Aplica localmente imediato (sem esperar banco)
  aplicarCena(cena);
  toast(`Cena "${cena.nome}" ativada!`, 'ok');

  // 2. Propaga via mapa_estado (canal realtime ativo para todos)
  const urlCena = (cena.mapa_url && !cena.mapa_url.startsWith('data:')) ? cena.mapa_url : null;
  console.log('ativarCena: salvando mapa_estado, url=', urlCena ? urlCena.substring(0,50) : 'null');
  try {
    const { error } = await db.from('mapa_estado').upsert({
      id: 'sessao_atual',
      tokens: cena.tokens || [],
      grid_size: cena.grid_size || 60,
      grid_visivel: true,
      mapa_url: urlCena,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('ativarCena mapa_estado error:', error);
    else console.log('ativarCena: mapa_estado atualizado com sucesso');
  } catch(e) { console.error('ativarCena exception:', e); }

  // 3. Atualiza flag visual da cena (não crítico, ignora erro)
  try {
    await db.from('cenas_mapa')
      .update({ ativa: false })
      .eq('master_id', currentUser.id);
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
  cenaRealtimeSub = db.channel('cenas-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cenas_mapa' }, async payload => {
      await carregarCenas();
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

function renderCenasInline() {
  const lista = document.getElementById('cenas-lista-inline');
  if (!lista) return;
  lista.innerHTML = '';
  if (!cenas.length) {
    lista.innerHTML = '<div style="font-size:11px;color:var(--muted);text-align:center;padding:8px">Nenhuma cena ainda.</div>';
    return;
  }
  cenas.forEach(cena => {
    const div = document.createElement('div');
    div.className = 'cena-item' + (cena.ativa ? ' cena-ativa' : '');
    div.innerHTML = `
      <div class="cena-thumb">
        ${cena.mapa_url ? `<img src="${cena.mapa_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '<span style="font-size:16px">🗺️</span>'}
      </div>
      <div class="cena-info">
        <div class="cena-nome">${cena.nome}</div>
        ${cena.ativa ? '<span class="cena-badge-ativa">● AO VIVO</span>' : ''}
      </div>
      <div class="cena-btns">
        <button class="ct-pv-btn" onclick="ativarCena('${cena.id}');renderCenasInline()" title="Ativar para todos">▶</button>
        <button class="ct-pv-btn" onclick="deletarCena('${cena.id}')" style="color:var(--red)" title="Deletar">✕</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

// Inicializa NPC page quando abre
function initNPCs() {
  carregarNPCs();
  carregarCenas();
}
