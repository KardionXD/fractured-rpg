// ══════════════════════════════════════════════════
//  MESAS — campanhas separadas (multi-mestre)
//  Cada mesa tem: mestre próprio, players, mapa,
//  chat, fichas, cenas, combate e fog isolados.
// ══════════════════════════════════════════════════

let MESA = null;          // mesa ativa: { id, nome, codigo, master_id, musica }
let _mesaResolve = null;  // resolve da promise de seleção

// Helper usado por todos os arquivos no lugar de 'sessao_atual'
function mesaId() { return MESA?.id || null; }

// ── FLUXO PRINCIPAL (chamado pelo init do app.js) ──
async function mesaEscolher() {
  // Tenta restaurar a última mesa usada
  const salva = localStorage.getItem('fractured_mesa');
  if (salva) {
    const { data } = await db.from('mesas').select('*').eq('id', salva).maybeSingle();
    if (data && await _souMembro(data.id)) {
      _mesaAtivar(data);
      return;
    }
    localStorage.removeItem('fractured_mesa');
  }
  // Mostra a tela de seleção e espera o usuário escolher
  await new Promise(res => { _mesaResolve = res; _mesaMostrarTela(); });
}

async function _souMembro(mesaIdCheck) {
  const { data } = await db.from('mesa_membros')
    .select('mesa_id').eq('mesa_id', mesaIdCheck).eq('user_id', currentUser.id).maybeSingle();
  return !!data;
}

let SOU_ADMIN = false;

function _mesaAtivar(mesa) {
  if (mesa.bloqueada && !SOU_ADMIN) {
    toast('🚫 Esta mesa foi bloqueada pelo administrador.', 'err');
    localStorage.removeItem('fractured_mesa');
    _mesaMostrarTela();
    return;
  }
  MESA = mesa;
  isMaster = (mesa.master_id === currentUser.id);
  localStorage.setItem('fractured_mesa', mesa.id);

  // Badge de mestre e seções da UI
  const b1 = document.getElementById('master-badge');
  if (b1) b1.style.display = isMaster ? '' : 'none';
  const b2 = document.getElementById('nav-master-section');
  if (b2) b2.style.display = isMaster ? '' : 'none';

  _mesaEsconderTela();
  _mesaBotaoTopbar();
  if (typeof musicaInit === 'function') musicaInit();
  if (_mesaResolve) { _mesaResolve(); _mesaResolve = null; }
}

function trocarMesa() {
  localStorage.removeItem('fractured_mesa');
  window.location.reload();
}

// ── AÇÕES ──────────────────────────────────────────
function _gerarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

async function mesaCriar() {
  const nome = document.getElementById('mesa-nova-nome')?.value.trim();
  if (!nome) { toast('Dá um nome pra mesa!', 'err'); return; }

  const { data: mesa, error } = await db.from('mesas').insert({
    nome, codigo: _gerarCodigo(), master_id: currentUser.id,
  }).select().single();
  if (error) { toast('Erro ao criar mesa: ' + error.message, 'err'); return; }

  await db.from('mesa_membros').insert({ mesa_id: mesa.id, user_id: currentUser.id });

  toast(`Mesa "${nome}" criada! Código: ${mesa.codigo}`, 'ok');
  _mesaAtivar(mesa);
}

async function mesaEntrar() {
  const cod = document.getElementById('mesa-codigo-input')?.value.trim().toUpperCase();
  if (!cod) { toast('Digite o código da mesa.', 'err'); return; }

  const { data: mesa, error } = await db.from('mesas').select('*').eq('codigo', cod).maybeSingle();
  if (error || !mesa) { toast('Mesa não encontrada. Confere o código!', 'err'); return; }

  const { error: e2 } = await db.from('mesa_membros')
    .upsert({ mesa_id: mesa.id, user_id: currentUser.id }, { onConflict: 'mesa_id,user_id' });
  if (e2) { toast('Erro ao entrar: ' + e2.message, 'err'); return; }

  toast(`Você entrou em "${mesa.nome}"!`, 'ok');
  _mesaAtivar(mesa);
}

async function mesaSelecionarExistente(id) {
  const { data } = await db.from('mesas').select('*').eq('id', id).single();
  if (data) _mesaAtivar(data);
}

async function mesaDeletar(id, nome) {
  if (!confirm(`Deletar a mesa "${nome}"? TODO o conteúdo dela (mapa, cenas, fichas, chat) será perdido.`)) return;
  const { error } = await db.from('mesas').delete().eq('id', id).eq('master_id', currentUser.id);
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  toast('Mesa deletada.', 'ok');
  _mesaCarregarLista();
}

async function mesaSair(id, nome) {
  if (!confirm(`Sair da mesa "${nome}"?\nVocê deixa de ser membro dela. Sua ficha fica guardada — se entrar de novo com o código, ela volta.`)) return;
  const { error } = await db.from('mesa_membros')
    .delete().eq('mesa_id', id).eq('user_id', currentUser.id);
  if (error) { toast('Erro ao sair: ' + error.message, 'err'); return; }
  if (MESA?.id === id) { MESA = null; localStorage.removeItem('fractured_mesa'); }
  if (localStorage.getItem('fractured_mesa') === id) localStorage.removeItem('fractured_mesa');
  toast(`Você saiu de "${nome}".`, 'ok');
  _mesaCarregarLista();
}

function mesaCopiarCodigo() {
  if (!MESA) return;
  navigator.clipboard?.writeText(MESA.codigo)
    .then(() => toast(`Código ${MESA.codigo} copiado! Manda pros players.`, 'ok'))
    .catch(() => toast(`Código da mesa: ${MESA.codigo}`, 'ok'));
}

// ── TELA DE SELEÇÃO ────────────────────────────────
function _mesaMostrarTela() {
  let ov = document.getElementById('mesa-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'mesa-overlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9000;background:var(--bg,#0d0b08);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    ov.innerHTML = `
      <div style="width:100%;max-width:440px">
        <div style="text-align:center;margin-bottom:22px">
          <div style="font-size:28px">⬡</div>
          <div style="font-size:18px;font-weight:800;letter-spacing:3px;color:var(--gold,#c9a84c)">FRACTURED</div>
          <div style="font-size:11px;color:var(--muted,#888);margin-top:4px">Escolha sua mesa de RPG</div>
        </div>

        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border,#333);border-radius:10px;padding:14px;margin-bottom:12px">
          <div style="font-size:11px;font-weight:700;color:var(--gold,#c9a84c);letter-spacing:1px;margin-bottom:8px">SUAS MESAS</div>
          <div id="mesa-lista"><div style="font-size:11px;color:var(--muted,#888)">Carregando...</div></div>
        </div>

        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border,#333);border-radius:10px;padding:14px;margin-bottom:12px">
          <div style="font-size:11px;font-weight:700;color:var(--gold,#c9a84c);letter-spacing:1px;margin-bottom:8px">ENTRAR COM CÓDIGO</div>
          <div style="display:flex;gap:6px">
            <input id="mesa-codigo-input" maxlength="6" placeholder="Ex: X7K2PA"
              style="flex:1;background:rgba(0,0,0,0.4);border:1px solid var(--border,#333);border-radius:6px;color:var(--text,#eee);padding:8px 10px;font-size:13px;text-transform:uppercase;letter-spacing:2px">
            <button class="btn-ghost" onclick="mesaEntrar()" style="padding:8px 14px">Entrar</button>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border,#333);border-radius:10px;padding:14px">
          <div style="font-size:11px;font-weight:700;color:var(--gold,#c9a84c);letter-spacing:1px;margin-bottom:8px">CRIAR NOVA MESA <span style="color:var(--muted,#888);font-weight:400">(você será o mestre)</span></div>
          <div style="display:flex;gap:6px">
            <input id="mesa-nova-nome" maxlength="40" placeholder="Nome da campanha"
              style="flex:1;background:rgba(0,0,0,0.4);border:1px solid var(--border,#333);border-radius:6px;color:var(--text,#eee);padding:8px 10px;font-size:13px">
            <button class="btn-ghost" onclick="mesaCriar()" style="padding:8px 14px">Criar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    document.getElementById('mesa-codigo-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') mesaEntrar(); });
    document.getElementById('mesa-nova-nome')?.addEventListener('keydown', e => { if (e.key === 'Enter') mesaCriar(); });
  }
  ov.style.display = 'flex';
  _mesaCarregarLista();
  _adminDetectar();
}

// ── ADMIN DO SITE ──────────────────────────────────
async function _adminDetectar() {
  const { data } = await db.from('admins').select('user_id').eq('user_id', currentUser.id).maybeSingle();
  SOU_ADMIN = !!data;
  if (SOU_ADMIN && !document.getElementById('mesa-admin-btn')) {
    const box = document.querySelector('#mesa-overlay > div');
    if (!box) return;
    const b = document.createElement('button');
    b.id = 'mesa-admin-btn';
    b.className = 'btn-ghost';
    b.style.cssText = 'width:100%;margin-top:12px;font-size:11px;padding:8px;color:var(--red,#c0392b);border-color:var(--red,#c0392b)';
    b.textContent = '⚙ Administração do site';
    b.onclick = abrirPainelAdmin;
    box.appendChild(b);
  }
}

async function abrirPainelAdmin() {
  document.getElementById('painel-admin')?.remove();
  const modal = document.createElement('div');
  modal.id = 'painel-admin';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `
    <div style="width:100%;max-width:520px;max-height:90vh;overflow-y:auto;background:var(--bg,#0d0b08);border:1px solid var(--red,#c0392b);border-radius:10px;padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--red,#c0392b);letter-spacing:2px">⚙ ADMINISTRAÇÃO</div>
        <button class="btn-ghost" style="font-size:11px;padding:4px 10px" onclick="document.getElementById('painel-admin').remove()">Fechar</button>
      </div>

      <div style="font-size:11px;font-weight:700;color:var(--gold,#c9a84c);letter-spacing:1px;margin-bottom:6px">MESAS DO SITE</div>
      <div id="adm-mesas" style="margin-bottom:16px"><span style="font-size:11px;color:var(--muted)">Carregando...</span></div>

      <div style="font-size:11px;font-weight:700;color:var(--gold,#c9a84c);letter-spacing:1px;margin-bottom:6px">CONVITES DE CADASTRO</div>
      <div style="font-size:10px;color:var(--muted,#888);margin-bottom:8px">Só quem tiver um destes códigos consegue criar conta no site. Cada código vale 1 conta.</div>
      <button class="btn-ghost" style="width:100%;font-size:11px;padding:7px;margin-bottom:8px" onclick="adminGerarConvite()">＋ Gerar convite de cadastro</button>
      <div id="adm-convites"><span style="font-size:11px;color:var(--muted)">Carregando...</span></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  adminCarregarMesas();
  adminCarregarConvites();
}

async function adminCarregarMesas() {
  const el = document.getElementById('adm-mesas'); if (!el) return;
  const { data: mesas } = await db.from('mesas').select('*').order('created_at');
  if (!mesas?.length) { el.innerHTML = '<span style="font-size:11px;color:var(--muted)">Nenhuma mesa.</span>'; return; }

  const ids = [...new Set(mesas.map(m => m.master_id))];
  const { data: profs } = await db.from('profiles').select('id,username').in('id', ids);
  const nomeDe = id => profs?.find(p => p.id === id)?.username || '?';

  el.innerHTML = '';
  mesas.forEach(m => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--border,#333);border-radius:7px;margin-bottom:5px;background:rgba(0,0,0,0.25)' + (m.bloqueada ? ';opacity:0.55' : '');
    div.innerHTML = `
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;color:var(--text,#eee)">${esc(m.nome)} ${m.bloqueada ? '<span style="color:var(--red);font-size:10px">· BLOQUEADA</span>' : ''}</div>
        <div style="font-size:10px;color:var(--muted,#888)">mestre: ${esc(nomeDe(m.master_id))} · código ${m.codigo}</div>
      </div>
      <button class="btn-ghost" style="font-size:10px;padding:4px 8px" onclick="adminBloquearMesa('${m.id}', ${!m.bloqueada})">${m.bloqueada ? '🔓 Liberar' : '🚫 Bloquear'}</button>
      <button class="btn-ghost" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:var(--red)" onclick="adminDeletarMesa('${m.id}','${esc(m.nome).replace(/'/g,'&#39;')}')">🗑</button>`;
    el.appendChild(div);
  });
}

async function adminBloquearMesa(id, bloquear) {
  const { error } = await db.from('mesas').update({ bloqueada: bloquear }).eq('id', id);
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  toast(bloquear ? 'Mesa bloqueada.' : 'Mesa liberada.', 'ok');
  adminCarregarMesas();
}

async function adminDeletarMesa(id, nome) {
  if (!confirm(`APAGAR a mesa "${nome}"?\nTodo o conteúdo dela (mapa, fichas, chat, cenas) será perdido para sempre.`)) return;
  const { error } = await db.from('mesas').delete().eq('id', id);
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  toast('Mesa apagada.', 'ok');
  adminCarregarMesas();
}

async function adminGerarConvite() {
  const cod = _gerarCodigo() + _gerarCodigo().slice(0, 2); // 8 chars
  const { error } = await db.from('convites_registro').insert({ codigo: cod });
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  navigator.clipboard?.writeText(cod).catch(() => {});
  toast(`Convite ${cod} gerado e copiado!`, 'ok');
  adminCarregarConvites();
}

async function adminCarregarConvites() {
  const el = document.getElementById('adm-convites'); if (!el) return;
  const { data } = await db.from('convites_registro').select('*').order('criado_em', { ascending: false });
  if (!data?.length) { el.innerHTML = '<span style="font-size:11px;color:var(--muted)">Nenhum convite gerado.</span>'; return; }
  el.innerHTML = '';
  data.forEach(c => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 9px;border:1px solid var(--border,#333);border-radius:7px;margin-bottom:4px;font-size:11px' + (c.usado_por ? ';opacity:0.5' : '');
    div.innerHTML = `
      <code style="letter-spacing:2px;color:var(--gold,#c9a84c);flex:1">${c.codigo}</code>
      <span style="font-size:10px;color:var(--muted)">${c.usado_por ? '✔ usado' : 'disponível'}</span>
      ${c.usado_por ? '' : `<button class="btn-ghost" style="font-size:10px;padding:3px 7px" onclick="navigator.clipboard.writeText('${c.codigo}');toast('Copiado!','ok')">📋</button>
      <button class="btn-ghost" style="font-size:10px;padding:3px 7px;color:var(--red)" onclick="adminApagarConvite('${c.codigo}')">✕</button>`}`;
    el.appendChild(div);
  });
}

async function adminApagarConvite(cod) {
  await db.from('convites_registro').delete().eq('codigo', cod);
  adminCarregarConvites();
}

function _mesaEsconderTela() {
  const ov = document.getElementById('mesa-overlay');
  if (ov) ov.style.display = 'none';
}

async function _mesaCarregarLista() {
  const el = document.getElementById('mesa-lista');
  if (!el) return;

  // Mesas em que sou membro (inclui as que criei)
  const { data: membros } = await db.from('mesa_membros')
    .select('mesa_id, mesas(id, nome, codigo, master_id)')
    .eq('user_id', currentUser.id);

  const mesas = (membros || []).map(m => m.mesas).filter(Boolean);

  if (!mesas.length) {
    el.innerHTML = '<div style="font-size:11px;color:var(--muted,#888)">Você ainda não está em nenhuma mesa. Crie uma ou entre com um código.</div>';
    return;
  }

  el.innerHTML = '';
  mesas.forEach(m => {
    const sou = m.master_id === currentUser.id;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--border,#333);border-radius:7px;margin-bottom:6px;cursor:pointer;background:rgba(0,0,0,0.25)';
    div.innerHTML = `
      <span>${sou ? fracIcon('mestre', { size: 16 }) : fracIcon('d20', { size: 16 })}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text,#eee);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.nome)}</div>
        <div style="font-size:10px;color:var(--muted,#888)">${sou ? 'Mestre · código ' + m.codigo : 'Player'}</div>
      </div>
      ${sou
        ? `<button class="ct-pv-btn" style="color:var(--red,#c0392b)" title="Deletar mesa" onclick="event.stopPropagation();mesaDeletar('${m.id}','${esc(m.nome)}')">✕</button>`
        : `<button class="ct-pv-btn" style="color:var(--red,#c0392b)" title="Sair desta mesa" onclick="event.stopPropagation();mesaSair('${m.id}','${esc(m.nome)}')">🚪</button>`}`;
    div.onclick = () => mesaSelecionarExistente(m.id);
    el.appendChild(div);
  });
}

// ── BOTÃO NA TOPBAR ────────────────────────────────
function _mesaBotaoTopbar() {
  if (document.getElementById('mesa-topbar-btn')) {
    document.getElementById('mesa-topbar-nome').textContent = MESA.nome;
    return;
  }
  const right = document.querySelector('.topbar-right');
  if (!right) return;
  const btn = document.createElement('button');
  btn.id = 'mesa-topbar-btn';
  btn.className = 'btn-ghost';
  btn.style.cssText = 'font-size:10px;padding:3px 8px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
  btn.title = 'Clique para copiar o código de convite · segure para trocar de mesa';
  btn.innerHTML = `${fracIcon('d20', { size: 12 })} <span id="mesa-topbar-nome">${esc(MESA.nome)}</span>`;
  btn.onclick = () => {
    if (isMaster) { mesaCopiarCodigo(); return; }
    if (confirm(`Trocar de mesa?\n(OK = só trocar · para SAIR de vez da mesa, use o botão 🚪 na tela de mesas)`)) trocarMesa();
  };
  btn.oncontextmenu = e => { e.preventDefault(); if (confirm('Trocar de mesa?')) trocarMesa(); };
  right.insertBefore(btn, right.firstChild);

  // Botão extra explícito de trocar mesa (mestre)
  if (isMaster) {
    const sw = document.createElement('button');
    sw.className = 'btn-ghost';
    sw.style.cssText = 'font-size:10px;padding:3px 8px';
    sw.title = 'Trocar de mesa';
    sw.textContent = '⇄';
    sw.onclick = () => { if (confirm('Trocar de mesa?')) trocarMesa(); };
    right.insertBefore(sw, btn.nextSibling);
  }
}
