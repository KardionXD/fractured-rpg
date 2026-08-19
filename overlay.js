// ══════════════════════════════════════════════════
//  FRACTURED — overlay.js
//  Overlay somente-leitura para OBS Browser Source.
//  Uso: /overlay.html?mesa=<uuid-da-mesa>
// ══════════════════════════════════════════════════

const params  = new URLSearchParams(location.search);
const MESA_ID = params.get('mesa');

if (!MESA_ID) {
  document.body.innerHTML = '<div style="color:#fff;font-family:sans-serif;padding:20px">' +
    'Falta o parâmetro <code>?mesa=ID_DA_MESA</code> na URL do Browser Source.</div>';
  throw new Error('overlay: mesa não informada na URL');
}

// ── CANVAS DO MAPA (somente tokens + fundo) ──────────
const canvas = document.getElementById('mapa-canvas');
const ctx = canvas.getContext('2d');

let MAPA = {
  tokens: [],
  gridSize: 60,
  imgUrl: null,
  img: null,
  videoUrl: null,
  video: null,
  naturalW: 1280,
  naturalH: 720,
};

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  desenhar();
}
window.addEventListener('resize', resizeCanvas);

function desenhar() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const src = MAPA.video || MAPA.img;
  const natW = MAPA.naturalW, natH = MAPA.naturalH;

  // Fit "contain": mapa inteiro visível, sem cortar, centralizado
  const escala = Math.min(W / natW, H / natH);
  const dw = natW * escala, dh = natH * escala;
  const offX = (W - dw) / 2, offY = (H - dh) / 2;

  if (src) {
    try { ctx.drawImage(src, offX, offY, dw, dh); } catch (e) {}
  }

  ctx.save();
  ctx.translate(offX, offY);
  ctx.scale(escala, escala);

  MAPA.tokens.forEach(t => desenharToken(t));

  ctx.restore();
}

function desenharToken(t) {
  const gridSize = MAPA.gridSize;
  const r  = gridSize * 0.42;
  const cx = (t.x || 0) + gridSize / 2;
  const cy = (t.y || 0) + gridSize / 2;
  const cor = { pc:'#2980b9', infectado:'#c0392b', animal:'#27ae60',
                animal_infectado:'#8e44ad', humano:'#e67e22', custom:'#7f8c8d' }[t.tipo] || '#555';

  const cached = t.imgUrl ? _imgCache(t.imgUrl) : null;

  if (cached && cached !== 'loading' && cached !== 'err') {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(cached, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = cor; ctx.lineWidth = 2.5; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = cor; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `${r * 0.9}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff'; ctx.fillText(t.emoji || '?', cx, cy);
  }

  const nome = (t.nome || '').substring(0, 10);
  ctx.font = `bold ${Math.max(8, gridSize * 0.13)}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = 3;
  ctx.fillStyle = '#fff';
  ctx.strokeText(nome, cx, t.y + gridSize - 14);
  ctx.fillText(nome, cx, t.y + gridSize - 14);

  if (t.pvMax) {
    const bw = gridSize - 8, bh = 4, bx = t.x + 4, by = t.y + 3;
    const pct = Math.max(0, (t.pvAtual || 0) / t.pvMax);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f39c12' : '#c0392b';
    ctx.fillRect(bx, by, bw * pct, bh);
  }
}

const _cache = {};
function _imgCache(url) {
  if (_cache[url]) return _cache[url] === 'loading' || _cache[url] === 'err' ? _cache[url] : _cache[url];
  _cache[url] = 'loading';
  const img = new Image(); img.crossOrigin = 'anonymous';
  img.onload  = () => { _cache[url] = img; desenhar(); };
  img.onerror = () => { _cache[url] = 'err'; };
  img.src = url;
  return null;
}

function carregarFundo(dados) {
  if (dados.video_url && dados.video_url.startsWith('https://')) {
    if (MAPA.videoUrl !== dados.video_url) {
      MAPA.videoUrl = dados.video_url;
      MAPA.img = null; MAPA.imgUrl = null;
      const v = document.createElement('video');
      v.src = dados.video_url; v.muted = true; v.loop = true; v.playsInline = true;
      v.crossOrigin = 'anonymous';
      v.addEventListener('loadedmetadata', () => {
        MAPA.naturalW = v.videoWidth || 1280; MAPA.naturalH = v.videoHeight || 720;
      });
      v.play().catch(() => {});
      MAPA.video = v;
      const raf = () => { desenhar(); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else if (dados.mapa_url && dados.mapa_url.startsWith('https://')) {
    if (MAPA.imgUrl !== dados.mapa_url) {
      MAPA.video = null; MAPA.videoUrl = null;
      MAPA.imgUrl = dados.mapa_url;
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        MAPA.naturalW = img.naturalWidth || 1280; MAPA.naturalH = img.naturalHeight || 720;
        MAPA.img = img; desenhar();
      };
      img.src = dados.mapa_url;
    }
  }
}

async function carregarMapaInicial() {
  const { data, error } = await db.from('mapa_estado').select('*').eq('id', MESA_ID).single();
  if (error) { possivelErroDeAuth(error); return; }
  if (data) {
    MAPA.tokens   = data.tokens || [];
    MAPA.gridSize = data.grid_size || 60;
    carregarFundo(data);
    desenhar();
  }
}

function assinarMapa() {
  db.channel('overlay-mapa-' + MESA_ID)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mapa_estado', filter: 'id=eq.' + MESA_ID }, payload => {
      const d = payload.new; if (!d) return;
      MAPA.tokens   = d.tokens || [];
      MAPA.gridSize = d.grid_size || 60;
      carregarFundo(d);
      desenhar();
    })
    .subscribe();
}

// ── DADOS: escuta as rolagens feitas no site ──────────
function assinarRolagens() {
  db.channel('overlay-sala-' + MESA_ID)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sala', filter: 'mesa_id=eq.' + MESA_ID }, payload => {
      const msg = payload.new; if (!msg || msg.tipo !== 'roll') return;
      exibirRolagem(msg.conteudo || {});
    })
    .subscribe(status => { if (status === 'CHANNEL_ERROR') setTimeout(assinarRolagens, 1500); });
}

function exibirRolagem(c) {
  if (c.oculto) { exibirRolagemMisteriosa(); return; }

  const isCrit  = c.dado === 20 && c.resultado_dado === 20;
  const isFalha = c.dado === 20 && c.resultado_dado === 1;

  const ov = document.getElementById('dado-overlay');
  const numEl = document.getElementById('dado-resultado-num');
  const labelEl = document.getElementById('dado-resultado-label');

  ov.className = '';
  if (isCrit) ov.classList.add('critico');
  if (isFalha) ov.classList.add('falha');
  ov.classList.add('show');

  numEl.textContent = c.total ?? c.resultado_dado ?? '';
  labelEl.textContent = c.label || `1d${c.dado || 20}`;

  if (isCrit) { flashTela('critico'); confete(); }
  if (isFalha) { flashTela('falha'); document.body.classList.add('screen-shake'); }

  setTimeout(() => {
    ov.classList.remove('show');
    document.body.classList.remove('screen-shake');
  }, 2600);
}

function exibirRolagemMisteriosa() {
  const wrap = document.createElement('div');
  wrap.className = 'mystery-pulse';
  wrap.innerHTML = '<div class="ring"></div>';
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 1500);
}

function flashTela(tipo) {
  const el = document.createElement('div');
  el.className = tipo === 'critico' ? 'flash-critico' : 'flash-falha';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 650);
}

function confete() {
  const cores = ['#f1c40f', '#e8c979', '#fff2c2', '#d9b45b'];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.background = cores[Math.floor(Math.random() * cores.length)];
    const startX = window.innerWidth / 2, startY = window.innerHeight / 2;
    p.style.left = startX + 'px'; p.style.top = startY + 'px';
    const ang = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 180;
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 40;
    document.body.appendChild(p);
    p.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(0.3)`, opacity: 0 }
    ], { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.3,1)' });
    setTimeout(() => p.remove(), 1400);
  }
}

// ── FALLBACK DE LOGIN (só se a leitura anônima falhar por RLS) ──
function possivelErroDeAuth(error) {
  console.warn('overlay: possível bloqueio de RLS ao ler a mesa:', error?.message);
  document.getElementById('login-box').classList.add('show');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;
  const msg = document.getElementById('login-msg');
  msg.textContent = 'Entrando...';
  const { error } = await db.auth.signInWithPassword({ email, password: senha });
  if (error) { msg.textContent = 'Erro: ' + error.message; return; }
  document.getElementById('login-box').classList.remove('show');
  iniciar();
});

// ── INIT ──────────────────────────────────────────────
let _iniciado = false;
async function iniciar() {
  if (_iniciado) return;
  _iniciado = true;
  resizeCanvas();
  await carregarMapaInicial();
  assinarMapa();
  assinarRolagens();
}

iniciar();
