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

function _mesaAtivar(mesa) {
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
      <span style="font-size:16px">${sou ? '👑' : '🎲'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text,#eee);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.nome)}</div>
        <div style="font-size:10px;color:var(--muted,#888)">${sou ? 'Mestre · código ' + m.codigo : 'Player'}</div>
      </div>
      ${sou ? `<button class="ct-pv-btn" style="color:var(--red,#c0392b)" title="Deletar mesa" onclick="event.stopPropagation();mesaDeletar('${m.id}','${esc(m.nome)}')">✕</button>` : ''}`;
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
  btn.innerHTML = `🎲 <span id="mesa-topbar-nome">${esc(MESA.nome)}</span>`;
  btn.onclick = () => {
    if (isMaster) mesaCopiarCodigo();
    else if (confirm(`Sair da mesa "${MESA.nome}" e escolher outra?`)) trocarMesa();
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
