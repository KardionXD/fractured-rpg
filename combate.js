// ══════════════════════════════════════════════════
//  FRACTURED — combate.js
//  Combat Tracker + Mapa com Tokens
// ══════════════════════════════════════════════════

// ── BESTIÁRIO EMBUTIDO ────────────────────────────
const BESTIARIO = {
  infectados: [
    { id:'corredor',    nome:'Corredor',         pv:10, com:1, agi:2, res:0, percepcao:'Visão',        emoji:'🧟', tipo:'infectado',
      habilidades:['Enxame: 3+ atacam o mesmo alvo','Hesitação: para 1 round ao ver rosto familiar','Grito de Atração: chama outros corredores'],
      fraqueza:'Qualquer dano direto. Separe e elimine individualmente.' },
    { id:'perseguidor', nome:'Perseguidor',       pv:15, com:2, agi:1, res:1, percepcao:'Visão+Som',   emoji:'🧟', tipo:'infectado',
      habilidades:['Emboscada: ataca de surpresa','Gavinhas de Parede: +3 ataque surpresa','Perseguição Tenaz: não para com dano leve'],
      fraqueza:'Fogo e impacto contundente. Armadilhas de arame.' },
    { id:'estalador',   nome:'Estalador',         pv:20, com:3, agi:1, res:2, percepcao:'Som puro +5', emoji:'🕷️', tipo:'infectado',
      habilidades:['Sonar Perfeito: detecta >30dB automaticamente','Agarrão Fatal: mata em 1 round se imobilizar','Blindagem Fúngica: −2 dano exceto fogo/explosivo'],
      fraqueza:'Fogo prioritário. Morte silenciosa requer AGI≥17 + faca.' },
    { id:'baiacu',      nome:'Baiacu',            pv:35, com:4, agi:-1, res:4, percepcao:'Som+Vibração',emoji:'💀', tipo:'infectado',
      habilidades:['Armadura Biológica: dano reduzido à metade','Nuvem de Esporos: área 5m ao morrer (RES≥14)','Investida Destrutiva: +2d6 dano estrutural'],
      fraqueza:'Explosivos e fogo prolongado apenas. NUNCA facas ou balas.' },
    { id:'tropego',     nome:'Trôpego',           pv:30, com:3, agi:-1, res:3, percepcao:'Som+Vibração',emoji:'💣', tipo:'infectado',
      habilidades:['Boca Congelada: não morde','Explosão de Esporos: qualquer dano físico libera esporos 3m','Resistência Ácida: fogo moderado ineficaz'],
      fraqueza:'Explosivos a distância apenas. NUNCA armas brancas.' },
    { id:'rei_ratos',   nome:'Rei dos Ratos',     pv:80, com:5, agi:-2, res:6, percepcao:'Rede total',  emoji:'👑', tipo:'infectado',
      habilidades:['Divisão em Fases: 50% PV → 2d4 infectados','Rede de Micélio: controla 100m raio','Cascata de Morte: ao morrer, todos atacam','Regeneração: +5PV/round com rede ativa'],
      fraqueza:'Destrua 5+ nós da rede primeiro. Depois explosivos+fogo.' },
  ],
  animais: [
    { id:'lobo',  nome:'Lobo / Cão Selvagem', pv:12, com:2, agi:3, res:0, percepcao:'Olfato+Som', emoji:'🐺', tipo:'animal',
      habilidades:['Flanqueio Coordenado: +2 dano','Avaliação de Presa: observa 1 round','Perseguição: até 500m'],
      fraqueza:'Matar o alfa causa recuo de 60% da matilha. Fogo os afasta.' },
    { id:'urso',  nome:'Urso',                pv:45, com:4, agi:0, res:5, percepcao:'Olfato',     emoji:'🐻', tipo:'animal',
      habilidades:['Investida Inicial: +3 dano, derruba','Resistência a Dano: −2 dano exceto fogo','Proteção de Filhotes: nunca recua'],
      fraqueza:'Rifle pesado ou explosivos. Suba em estruturas.' },
    { id:'javali',nome:'Javali',              pv:20, com:3, agi:1, res:2, percepcao:'Olfato+Barulho',emoji:'🐗', tipo:'animal',
      habilidades:['Carga Imprevisível: AGI≥13 para desviar','Presa Afiada: 2d6+3 dano','Em Bando: +1 Tensão automático'],
      fraqueza:'Tiro na cabeça. Suba em estruturas.' },
    { id:'corvo', nome:'Corvo de Bando',      pv:3,  com:0, agi:4, res:-2,percepcao:'Visão 360°', emoji:'🐦', tipo:'animal',
      habilidades:['Delator Natural: revela posição do grupo','Alarme Sonoro: +1 Tensão se assustados'],
      fraqueza:'Ignore. Matar piora a situação.' },
  ],
  humanos: [
    { id:'saqueador',  nome:'Saqueador',           pv:14, com:1, agi:1, res:-1, percepcao:'Normal', emoji:'🔪', tipo:'humano',
      habilidades:['Moral Frágil: SOCIAL≥11 ou recuam','Rendição: SOCIAL≥14 + vantagem','Armamento Improvisado'],
      fraqueza:'Intimidação funciona. Considere negociar.' },
    { id:'atirador',   nome:'Atirador de Facção',  pv:18, com:3, agi:2, res:0, percepcao:'+2',     emoji:'🔫', tipo:'humano',
      habilidades:['Cobertura Automática: +2 defesa','Comunicação: relata à facção em 1d4 dias','Tiro Coordenado: dois atacam simultaneamente'],
      fraqueza:'Flanqueie ou destrua a cobertura.' },
    { id:'lider',      nome:'Líder de Bando',       pv:25, com:4, agi:2, res:3, percepcao:'+3',     emoji:'😈', tipo:'humano',
      habilidades:['Imune a Intimidação: SOCIAL≥17','Eleva os Aliados: ignora moral enquanto de pé','Negociação Possível por interesse'],
      fraqueza:'Eliminar o líder quebra o grupo. Ou convença.' },
    { id:'cacador',    nome:'Caçador Profissional', pv:22, com:4, agi:3, res:-2,percepcao:'+4',     emoji:'🏹', tipo:'humano',
      habilidades:['Emboscada Especializada: INSTINTO≥16','Rastreamento: segue por 24h','Tiro Silencioso: sem aumento de Tensão'],
      fraqueza:'Mude de rota. Inverta a caça.' },
  ],
  animais_infectados: [
    { id:'cao_corredor',  nome:'Cão Corredor',   pv:16, com:3, agi:4, res:1, percepcao:'Olfato Cordyceps',emoji:'🐕', tipo:'animal_infectado',
      habilidades:['Velocidade Extrema: age 2x/round','Rastreamento Fúngico: detecta por cheiro','Mordida Infectante: RES≥13 ou infecção'],
      fraqueza:'Armadilhas de laço. Fogo o desorienta.' },
    { id:'urso_estalador',nome:'Urso Estalador', pv:60, com:5, agi:0, res:6, percepcao:'Som absoluto',   emoji:'🐻', tipo:'animal_infectado',
      habilidades:['Sonar de Urso: detecta >20dB','Armadura Dupla: −3 dano','Investida Devastadora: +3d6 dano','Agarrão Final: 2d8/round'],
      fraqueza:'Explosivos pesados e fogo prolongado apenas. Fuja em silêncio.' },
  ]
};

// Todos os inimigos em lista plana
const TODOS_INIMIGOS = Object.values(BESTIARIO).flat();

// ── STATE COMBATE ─────────────────────────────────
let combatentes = [];
let turnoAtual = 0;
let rodadaAtual = 1;
let combateAtivo = false;

// ── STATE MAPA ────────────────────────────────────
let tokens = [];
let tokenSelecionado = null;
let dragToken = null;
let dragOffsetX = 0, dragOffsetY = 0;
let gridSize = 60;
let mapaImagem = null;
let canvasW = 900, canvasH = 600;

let canvas, ctx;

// ══════════════════════════════════════════════════
//  COMBAT TRACKER
// ══════════════════════════════════════════════════

function abrirCombate() {
  document.getElementById('modal-combate').style.display = 'flex';
  renderCombatTracker();
}

function fecharCombate() {
  document.getElementById('modal-combate').style.display = 'none';
}

function renderCombatTracker() {
  const lista = document.getElementById('ct-lista');
  if (!lista) return;

  if (combatentes.length === 0) {
    lista.innerHTML = '<div class="ct-empty">Adicione combatentes para começar.</div>';
    return;
  }

  const ordenados = [...combatentes].sort((a,b) => b.iniciativa - a.iniciativa);
  lista.innerHTML = '';

  ordenados.forEach((c, idx) => {
    const isAtual = combateAtivo && ordenados[turnoAtual]?.id === c.id;
    const pct = Math.max(0, Math.round((c.pvAtual / c.pvMax) * 100));
    const barColor = pct > 50 ? '#27ae60' : pct > 25 ? '#f39c12' : '#c0392b';
    const estado = pct > 75 ? '' : pct > 50 ? '🩹 Ferido' : pct > 25 ? '⚠️ Grave' : pct > 0 ? '💀 Crítico' : '☠️ Incapacitado';

    const div = document.createElement('div');
    div.className = 'ct-item' + (isAtual ? ' ct-ativo' : '') + (c.pvAtual <= 0 ? ' ct-morto' : '');
    div.innerHTML = `
      <div class="ct-ordem">${isAtual ? '▶' : idx+1}</div>
      <div class="ct-emoji">${c.emoji}</div>
      <div class="ct-info">
        <div class="ct-nome">${c.nome} ${c.tag ? `<span class="ct-tag">${c.tag}</span>` : ''}</div>
        <div class="ct-ini">Iniciativa: <strong>${c.iniciativa}</strong> ${estado ? `· ${estado}` : ''}</div>
        <div class="ct-bar-wrap">
          <div class="ct-bar" style="width:${pct}%;background:${barColor}"></div>
        </div>
        <div class="ct-pv-row">
          <span class="ct-pv-label">PV</span>
          <button class="ct-pv-btn" onclick="alterarPV('${c.id}', -1)">−</button>
          <input type="number" class="ct-pv-input" value="${c.pvAtual}" min="0" max="${c.pvMax}"
            onchange="setPV('${c.id}', this.value)">
          <span class="ct-pv-sep">/</span>
          <span class="ct-pv-max">${c.pvMax}</span>
          <button class="ct-pv-btn" onclick="alterarPV('${c.id}', 1)">+</button>
          <button class="ct-pv-btn ct-pv-dmg" onclick="danoRapido('${c.id}')">⚔</button>
        </div>
        ${c.condicoes?.length ? `<div class="ct-condicoes">${c.condicoes.map(cn => `<span class="ct-cond">${cn}</span>`).join('')}</div>` : ''}
        ${c.habilidades ? `<details class="ct-detalhes"><summary>Ver habilidades</summary><ul>${c.habilidades.map(h=>`<li>${h}</li>`).join('')}</ul>${c.fraqueza ? `<div class="ct-fraqueza">⚡ ${c.fraqueza}</div>` : ''}</details>` : ''}
      </div>
      <div class="ct-acoes">
        <button class="ct-btn" onclick="toggleCondicao('${c.id}', 'Atordoado')" title="Atordoado">😵</button>
        <button class="ct-btn" onclick="toggleCondicao('${c.id}', 'Envenenado')" title="Envenenado">☠</button>
        <button class="ct-btn" onclick="toggleCondicao('${c.id}', 'Imobilizado')" title="Imobilizado">🔒</button>
        <button class="ct-btn ct-btn-red" onclick="removerCombatente('${c.id}')" title="Remover">✕</button>
      </div>
    `;
    lista.appendChild(div);
  });

  document.getElementById('ct-rodada').textContent = `Rodada ${rodadaAtual}`;
  document.getElementById('ct-turno-info').textContent = combateAtivo
    ? `Turno de: ${[...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa)[turnoAtual]?.nome || '—'}`
    : 'Combate não iniciado';
}

function adicionarInimigoCT(inimigo) {
  const existentes = combatentes.filter(c => c.id.startsWith(inimigo.id));
  const tag = existentes.length > 0 ? ` #${existentes.length + 1}` : '';
  const novo = {
    id: inimigo.id + '_' + Date.now(),
    nome: inimigo.nome,
    emoji: inimigo.emoji,
    tag,
    pvMax: inimigo.pv,
    pvAtual: inimigo.pv,
    iniciativa: Math.floor(Math.random() * 20) + 1 + (inimigo.agi || 0),
    tipo: inimigo.tipo,
    habilidades: inimigo.habilidades,
    fraqueza: inimigo.fraqueza,
    condicoes: [],
    isPC: false,
  };
  combatentes.push(novo);
  renderCombatTracker();
  renderListaInimigos();
}

function adicionarPCCombate() {
  const nome = document.getElementById('ct-pc-nome').value.trim();
  const ini  = parseInt(document.getElementById('ct-pc-ini').value) || 10;
  const pv   = parseInt(document.getElementById('ct-pc-pv').value) || 20;
  if (!nome) return;

  combatentes.push({
    id: 'pc_' + Date.now(),
    nome, emoji: '🧑',
    pvMax: pv, pvAtual: pv,
    iniciativa: ini,
    tipo: 'pc', isPC: true,
    condicoes: [],
  });
  document.getElementById('ct-pc-nome').value = '';
  renderCombatTracker();
}

function iniciarCombate() {
  if (combatentes.length === 0) return;
  combateAtivo = true;
  turnoAtual = 0;
  rodadaAtual = 1;
  combatentes.sort((a,b) => b.iniciativa - a.iniciativa);
  renderCombatTracker();
}

function proximoTurno() {
  if (!combateAtivo || combatentes.length === 0) return;
  const ordenados = [...combatentes].sort((a,b) => b.iniciativa - a.iniciativa);
  turnoAtual++;
  if (turnoAtual >= ordenados.length) {
    turnoAtual = 0;
    rodadaAtual++;
  }
  // Pula mortos
  let tentativas = 0;
  while (ordenados[turnoAtual]?.pvAtual <= 0 && tentativas < ordenados.length) {
    turnoAtual++;
    if (turnoAtual >= ordenados.length) { turnoAtual = 0; rodadaAtual++; }
    tentativas++;
  }
  renderCombatTracker();
}

function encerrarCombate() {
  if (!confirm('Encerrar o combate e limpar a lista?')) return;
  combatentes = [];
  turnoAtual = 0;
  rodadaAtual = 1;
  combateAtivo = false;
  renderCombatTracker();
}

function alterarPV(id, delta) {
  const c = combatentes.find(x => x.id === id);
  if (!c) return;
  c.pvAtual = Math.max(0, Math.min(c.pvMax, c.pvAtual + delta));
  renderCombatTracker();
}

function setPV(id, val) {
  const c = combatentes.find(x => x.id === id);
  if (!c) return;
  c.pvAtual = Math.max(0, Math.min(c.pvMax, parseInt(val) || 0));
  renderCombatTracker();
}

function danoRapido(id) {
  const val = prompt('Quanto de dano?');
  if (!val) return;
  const dano = parseInt(val);
  if (isNaN(dano)) return;
  alterarPV(id, -dano);
}

function toggleCondicao(id, cond) {
  const c = combatentes.find(x => x.id === id);
  if (!c) return;
  if (!c.condicoes) c.condicoes = [];
  const idx = c.condicoes.indexOf(cond);
  if (idx >= 0) c.condicoes.splice(idx, 1);
  else c.condicoes.push(cond);
  renderCombatTracker();
}

function removerCombatente(id) {
  combatentes = combatentes.filter(c => c.id !== id);
  if (turnoAtual >= combatentes.length) turnoAtual = 0;
  renderCombatTracker();
}

function renderListaInimigos() {
  const lista = document.getElementById('ct-bestiario-lista');
  if (!lista) return;
  const filtro = document.getElementById('ct-filtro')?.value || '';
  lista.innerHTML = '';

  Object.entries(BESTIARIO).forEach(([categoria, inimigos]) => {
    const nomes = { infectados:'Infectados', animais:'Animais', humanos:'Humanos', animais_infectados:'Animais Infectados' };
    const filtrados = inimigos.filter(i => i.nome.toLowerCase().includes(filtro.toLowerCase()));
    if (filtrados.length === 0) return;

    const header = document.createElement('div');
    header.className = 'ct-categoria';
    header.textContent = nomes[categoria];
    lista.appendChild(header);

    filtrados.forEach(inimigo => {
      const div = document.createElement('div');
      div.className = 'ct-inimigo-item';
      div.innerHTML = `
        <span class="ct-inimigo-emoji">${inimigo.emoji}</span>
        <div class="ct-inimigo-info">
          <div class="ct-inimigo-nome">${inimigo.nome}</div>
          <div class="ct-inimigo-stats">PV ${inimigo.pv} · COM ${inimigo.com>=0?'+':''}${inimigo.com}</div>
        </div>
        <div style="display:flex;gap:4px">
          <button class="ct-add-btn" onclick='adicionarInimigoCT(${JSON.stringify(inimigo)})' title="Adicionar ao combate">+CT</button>
          <button class="ct-add-btn ct-add-mapa" onclick='adicionarTokenMapa(${JSON.stringify(inimigo)})' title="Adicionar ao mapa">+🗺</button>
        </div>
      `;
      lista.appendChild(div);
    });
  });
}

// ══════════════════════════════════════════════════
//  MAPA COM TOKENS
// ══════════════════════════════════════════════════

function initMapa() {
  canvas = document.getElementById('mapa-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  canvas.width = canvasW;
  canvas.height = canvasH;

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, {passive:false});
  canvas.addEventListener('touchmove', onTouchMove, {passive:false});
  canvas.addEventListener('touchend', onTouchEnd);

  desenharMapa();
}

function desenharMapa() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Fundo
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Imagem de fundo
  if (mapaImagem) {
    ctx.drawImage(mapaImagem, 0, 0, canvasW, canvasH);
  }

  // Grid
  ctx.strokeStyle = 'rgba(192,57,43,0.2)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvasW; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke();
  }
  for (let y = 0; y <= canvasH; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke();
  }

  // Tokens
  tokens.forEach(t => desenharToken(t));
}

function desenharToken(t) {
  const r = gridSize * 0.42;
  const cx = t.x + gridSize / 2;
  const cy = t.y + gridSize / 2;

  // Sombra/seleção
  if (tokenSelecionado?.id === t.id) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Círculo base
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const cor = t.tipo === 'pc' ? '#2980b9' : t.tipo === 'infectado' ? '#c0392b' : t.tipo === 'animal' ? '#27ae60' : t.tipo === 'animal_infectado' ? '#8e44ad' : '#e67e22';
  ctx.fillStyle = cor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Emoji/ícone
  ctx.font = `${gridSize * 0.38}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t.emoji, cx, cy);

  // Nome
  ctx.font = `bold ${Math.max(9, gridSize * 0.14)}px sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(t.nome.substring(0, 8), cx, t.y + gridSize - 14);

  // Barra de PV
  if (t.pvMax && t.pvAtual !== undefined) {
    const barW = gridSize - 8;
    const barH = 4;
    const barX = t.x + 4;
    const barY = t.y + 4;
    const pct = Math.max(0, t.pvAtual / t.pvMax);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX, barY, barW, barH);
    const pvColor = pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f39c12' : '#c0392b';
    ctx.fillStyle = pvColor;
    ctx.fillRect(barX, barY, barW * pct, barH);
  }
}

function snapToGrid(val) {
  return Math.round(val / gridSize) * gridSize;
}

function getTokenAt(x, y) {
  return tokens.slice().reverse().find(t =>
    x >= t.x && x <= t.x + gridSize &&
    y >= t.y && y <= t.y + gridSize
  );
}

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function onMouseDown(e) {
  const {x, y} = getCanvasPos(e);
  const t = getTokenAt(x, y);
  if (t) {
    // Verifica permissão: PC só move o próprio token
    if (t.isPC && t.userId && currentUser?.id !== t.userId && !isMaster) return;
    dragToken = t;
    dragOffsetX = x - t.x;
    dragOffsetY = y - t.y;
    tokenSelecionado = t;
    desenharMapa();
    atualizarInfoToken(t);
  } else {
    tokenSelecionado = null;
    desenharMapa();
    document.getElementById('token-info').style.display = 'none';
  }
}

function onMouseMove(e) {
  if (!dragToken) return;
  const {x, y} = getCanvasPos(e);
  dragToken.x = Math.max(0, Math.min(canvasW - gridSize, x - dragOffsetX));
  dragToken.y = Math.max(0, Math.min(canvasH - gridSize, y - dragOffsetY));
  desenharMapa();
}

function onMouseUp(e) {
  if (!dragToken) return;
  dragToken.x = snapToGrid(dragToken.x);
  dragToken.y = snapToGrid(dragToken.y);
  sincronizarTokens();
  dragToken = null;
  desenharMapa();
}

// Touch
function onTouchStart(e) {
  e.preventDefault();
  const t = e.touches[0];
  onMouseDown({ clientX: t.clientX, clientY: t.clientY });
}
function onTouchMove(e) {
  e.preventDefault();
  const t = e.touches[0];
  onMouseMove({ clientX: t.clientX, clientY: t.clientY });
}
function onTouchEnd(e) { onMouseUp({}); }

function atualizarInfoToken(t) {
  const info = document.getElementById('token-info');
  if (!info) return;
  info.style.display = 'block';
  info.innerHTML = `
    <div class="token-info-header">
      <span style="font-size:20px">${t.emoji}</span>
      <div>
        <div style="font-weight:700;font-size:13px">${t.nome}</div>
        <div style="font-size:10px;color:var(--muted)">${t.tipo || ''}</div>
      </div>
      <button class="btn-icon" onclick="removerToken('${t.id}')">🗑</button>
    </div>
    ${t.pvMax ? `
    <div class="token-pv-row">
      <span style="font-size:10px;color:var(--muted)">PV</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',-1)">−</button>
      <input type="number" value="${t.pvAtual}" min="0" max="${t.pvMax}"
        style="width:44px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px"
        onchange="setPVToken('${t.id}',this.value)">
      <span style="color:var(--muted)">/ ${t.pvMax}</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',1)">+</button>
    </div>` : ''}
    ${t.habilidades ? `<div style="font-size:10px;color:var(--muted);margin-top:6px">${t.habilidades[0]}</div>` : ''}
  `;
}

function alterarPVToken(id, delta) {
  const t = tokens.find(x => x.id === id);
  if (!t) return;
  t.pvAtual = Math.max(0, Math.min(t.pvMax, t.pvAtual + delta));
  // Sincroniza com combate tracker
  const c = combatentes.find(x => x.tokenId === id);
  if (c) { c.pvAtual = t.pvAtual; renderCombatTracker(); }
  atualizarInfoToken(t);
  desenharMapa();
  sincronizarTokens();
}

function setPVToken(id, val) {
  const t = tokens.find(x => x.id === id);
  if (!t) return;
  t.pvAtual = Math.max(0, Math.min(t.pvMax, parseInt(val) || 0));
  const c = combatentes.find(x => x.tokenId === id);
  if (c) { c.pvAtual = t.pvAtual; renderCombatTracker(); }
  desenharMapa();
  sincronizarTokens();
}

function removerToken(id) {
  tokens = tokens.filter(t => t.id !== id);
  tokenSelecionado = null;
  document.getElementById('token-info').style.display = 'none';
  desenharMapa();
  sincronizarTokens();
}

function adicionarTokenMapa(inimigo) {
  const id = inimigo.id + '_' + Date.now();
  tokens.push({
    id,
    nome: inimigo.nome,
    emoji: inimigo.emoji,
    tipo: inimigo.tipo,
    x: snapToGrid(Math.random() * (canvasW - gridSize * 2) + gridSize),
    y: snapToGrid(Math.random() * (canvasH - gridSize * 2) + gridSize),
    pvMax: inimigo.pv,
    pvAtual: inimigo.pv,
    habilidades: inimigo.habilidades,
    isPC: false,
  });
  desenharMapa();
  sincronizarTokens();
}

function adicionarTokenPC() {
  const nome = document.getElementById('mapa-pc-nome').value.trim();
  if (!nome) return;
  tokens.push({
    id: 'pc_' + Date.now(),
    nome,
    emoji: '🧑',
    tipo: 'pc',
    x: snapToGrid(gridSize),
    y: snapToGrid(gridSize),
    isPC: true,
    userId: currentUser?.id,
  });
  document.getElementById('mapa-pc-nome').value = '';
  desenharMapa();
  sincronizarTokens();
}

function importarMapa() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => { mapaImagem = img; desenharMapa(); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function limparMapa() {
  if (!confirm('Limpar todos os tokens do mapa?')) return;
  tokens = [];
  tokenSelecionado = null;
  document.getElementById('token-info').style.display = 'none';
  desenharMapa();
  sincronizarTokens();
}

function alterarGrid(delta) {
  gridSize = Math.max(30, Math.min(120, gridSize + delta));
  document.getElementById('grid-size-val').textContent = gridSize + 'px';
  desenharMapa();
}

// ── SINCRONIZAÇÃO REALTIME ────────────────────────
async function sincronizarTokens() {
  if (!currentUser) return;
  try {
    await db.from('sala').insert({
      user_id: currentUser.id,
      username: currentProfile?.username || 'mestre',
      tipo: 'tokens',
      conteudo: { tokens, gridSize }
    });
  } catch(e) {}
}

function processarMsgTokens(msg) {
  if (msg.tipo !== 'tokens') return;
  // Só atualiza tokens se não for o próprio usuário
  if (msg.user_id !== currentUser?.id) {
    tokens = msg.conteudo.tokens || [];
    gridSize = msg.conteudo.gridSize || 60;
    document.getElementById('grid-size-val').textContent = gridSize + 'px';
    desenharMapa();
  }
}

