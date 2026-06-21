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

  document.getElementById('npc-form-titulo').textContent = npc ? 'Editar NPC' : 'Criar NPC';
  document.getElementById('npc-f-nome').value      = npc?.nome || '';
  document.getElementById('npc-f-pasta').value     = npc?.pasta || 'Geral';
  document.getElementById('npc-f-tipo').value      = npc?.tipo || 'inimigo';
  document.getElementById('npc-f-emoji').value     = npc?.emoji || '';
  document.getElementById('npc-f-pv').value        = npc?.pv_max || 10;
  document.getElementById('npc-f-com').value       = npc?.com ?? 0;
  document.getElementById('npc-f-agi').value       = npc?.agi ?? 0;
  document.getElementById('npc-f-res').value       = npc?.res ?? 0;
  document.getElementById('npc-f-for').value       = npc?.for_ ?? 0;
  document.getElementById('npc-f-soc').value       = npc?.soc ?? 0;
  document.getElementById('npc-f-con').value       = npc?.con ?? 0;
  document.getElementById('npc-f-hab').value       = npc?.habilidades || '';
  document.getElementById('npc-f-fraqueza').value  = npc?.fraqueza || '';
  document.getElementById('npc-f-notas').value     = npc?.notas || '';

  // Preview imagem
  const prev = document.getElementById('npc-img-preview');
  if (prev) { prev.src = npc?.img_url || ''; prev.style.display = npc?.img_url ? 'block' : 'none'; }

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

  const payload = {
    master_id:   currentUser.id,
    nome,
    pasta:       document.getElementById('npc-f-pasta')?.value.trim() || 'Geral',
    tipo:        document.getElementById('npc-f-tipo')?.value || 'inimigo',
    emoji:       document.getElementById('npc-f-emoji')?.value.trim() || '',
    pv_max:      parseInt(document.getElementById('npc-f-pv')?.value) || 10,
    com:         parseInt(document.getElementById('npc-f-com')?.value) || 0,
    agi:         parseInt(document.getElementById('npc-f-agi')?.value) || 0,
    res:         parseInt(document.getElementById('npc-f-res')?.value) || 0,
    for_:        parseInt(document.getElementById('npc-f-for')?.value) || 0,
    soc:         parseInt(document.getElementById('npc-f-soc')?.value) || 0,
    con:         parseInt(document.getElementById('npc-f-con')?.value) || 0,
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
  // Desativa todas primeiro
  await db.from('cenas_mapa').update({ ativa: false }).eq('master_id', currentUser.id);
  // Ativa a selecionada
  const { error } = await db.from('cenas_mapa').update({ ativa: true }).eq('id', id);
  if (error) { toast('Erro!', 'err'); return; }
  cenaAtiva = id;
  const cena = cenas.find(c => c.id === id);
  if (cena) aplicarCena(cena);
  await carregarCenas();
  toast(`Cena "${cena?.nome}" ativada para todos!`, 'ok');
}

function previewCena(cena) {
  // Mestre vê preview sem ativar para todos
  aplicarCena(cena);
}

function aplicarCena(cena) {
  cenaAtiva = cena.id;
  if (typeof tokens !== 'undefined')    tokens = cena.tokens || [];
  if (typeof gridSize !== 'undefined')  gridSize = cena.grid_size || 60;

  const el = document.getElementById('grid-size-val');
  if (el) el.textContent = gridSize + 'px';

  if (cena.mapa_url) {
    if (typeof mapaUrl !== 'undefined') {
      const w = typeof mapaUrl !== 'undefined';
      mapaUrl = cena.mapa_url;
      const img = new Image();
      img.onload = () => {
        if (typeof mapaImg !== 'undefined') mapaImg = img;
        if (typeof desenharMapa === 'function') desenharMapa();
      };
      img.src = cena.mapa_url;
    }
  } else {
    if (typeof mapaImg !== 'undefined') mapaImg = null;
    if (typeof mapaUrl !== 'undefined') mapaUrl = null;
    if (typeof desenharMapa === 'function') desenharMapa();
  }
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
      // Players: quando uma cena é ativada, aplica automaticamente
      if (!isMaster && payload.new?.ativa) {
        aplicarCena(payload.new);
        toast('🗺️ Nova cena ativada pelo mestre!', 'ok');
      }
    })
    .subscribe();
}
