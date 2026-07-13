// ══════════════════════════════════════════════════
//  FRACTURED — mapa.js  (engine v5, reescrito)
// ══════════════════════════════════════════════════

// ── ESTADO ───────────────────────────────────────
let MAP = {
  // Canvas
  canvas: null,
  ctx:    null,

  // Viewport
  zoom:   1,
  offX:   0,
  offY:   0,

  // Imagem/vídeo de fundo
  img:    null,
  imgUrl: null,

  // Grid
  gridSize:    60,
  gridVisible: true,
  gridColor:  '#c0392b',
  gridOpacity: 0.22,

  // Tokens
  tokens: [],

  // Interação
  drag:    null,   // { tok, ox, oy }
  dragMulti: [],   // [{ tok, ox, oy }] para multi-select
  pan:     null,   // { lx, ly }
  pinch:   null,   // distância anterior

  // Seleção
  sel:     null,   // token único selecionado
  selMulti: [],    // tokens multi-selecionados
  selRect: null,   // { sx, sy, ex, ey } retângulo de seleção

  // Régua
  rulerType:   null,  // null | 'linha' | 'circulo' | 'cone' | 'quadrado'
  rulerStart:  null,
  rulerEnd:    null,
  metrosCell:  1.5,

  // Rastro
  trailTok:    null,
  trailOrigin: null,

  // Realtime
  realtimeSub: null,
  lastSaveTs:  null,
  saveTimer:   null,

  // Imagens em cache
  imgCache: {},
};

// ── INIT ─────────────────────────────────────────
function mapaInit() {
  const cvs = document.getElementById('mapa-canvas');
  if (!cvs) return;
  if (MAP.canvas === cvs) { mapaResize(); return; } // já init
  MAP.canvas = cvs;
  MAP.ctx    = cvs.getContext('2d');

  mapaResize();

  // Mouse
  cvs.addEventListener('mousedown',  mapaMouseDown);
  cvs.addEventListener('wheel',      mapaWheel, { passive: false });
  cvs.addEventListener('contextmenu', e => e.preventDefault());

  // Mouse global (drag fora do canvas)
  if (!MAP._docBound) {
    document.addEventListener('mousemove', mapaMouseMove);
    document.addEventListener('mouseup',   mapaMouseUp);
    // Se o mouse sair da janela, cancela drag sem salvar posição errada
    // pan/drag reset only on tab switch and touchcancel
    MAP._docBound = true;
  }

  // Touch
  cvs.addEventListener('touchstart',  mapaTouchStart,  { passive: false });
  cvs.addEventListener('touchmove',   mapaTouchMove,   { passive: false });
  cvs.addEventListener('touchend',    mapaTouchEnd,    { passive: false });
  cvs.addEventListener('touchcancel', e => { e.preventDefault(); mapaResetDrag(); }, { passive: false });

  // Carrega estado do banco
  mapaCarregarDB();
}

// ── RESIZE ───────────────────────────────────────
window.resizeMapCanvas = function() {
  if (!MAP.canvas) return;
  const container = MAP.canvas.parentElement;
  if (!container) return;
  const r = container.getBoundingClientRect();
  const w = Math.floor(r.width);
  const h = Math.floor(r.height);
  if (w > 10 && h > 10) {
    MAP.canvas.width  = w;
    MAP.canvas.height = h;
    mapaDraw();
  }
};

function mapaResize() { resizeMapCanvas(); }

// ── COORDENADAS ──────────────────────────────────
function tela2canvas(cx, cy) {
  const r = MAP.canvas.getBoundingClientRect();
  return {
    x: (cx - r.left) * (MAP.canvas.width  / r.width),
    y: (cy - r.top)  * (MAP.canvas.height / r.height),
  };
}
function canvas2world(cx, cy) {
  return { x: (cx - MAP.offX) / MAP.zoom, y: (cy - MAP.offY) / MAP.zoom };
}
function world2canvas(wx, wy) {
  return { x: wx * MAP.zoom + MAP.offX, y: wy * MAP.zoom + MAP.offY };
}
function event2world(e) {
  const c = tela2canvas(e.clientX, e.clientY);
  return canvas2world(c.x, c.y);
}

// ── DESENHO ──────────────────────────────────────
function mapaDraw() {
  const { canvas: cvs, ctx, zoom, offX, offY,
          img, gridSize, gridVisible, gridColor, gridOpacity,
          tokens, sel, selMulti, selRect,
          rulerType, rulerStart, rulerEnd, metrosCell,
          trailTok, trailOrigin } = MAP;
  if (!ctx || !cvs) return;

  const W = cvs.width, H = cvs.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#05050a';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(offX, offY);
  ctx.scale(zoom, zoom);

  // Fundo: vídeo/GIF ou imagem estática
  if (_vid) {
    ctx.drawImage(_vid, 0, 0);
  } else if (img) {
    ctx.drawImage(img, 0, 0);
  }

  // Grid (otimizado: 1 path/stroke para todas as linhas; pula grid ilegível no zoom-out)
  if (gridVisible && gridSize * zoom >= 4) {
    const hex = gridColor.replace('#', '');
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    ctx.strokeStyle = `rgba(${r},${g},${b},${gridOpacity})`;
    ctx.lineWidth = 1 / zoom;
    const wx0 = -offX/zoom, wy0 = -offY/zoom;
    const wx1 = (W-offX)/zoom, wy1 = (H-offY)/zoom;
    const sx = Math.floor(wx0/gridSize)*gridSize;
    const sy = Math.floor(wy0/gridSize)*gridSize;
    ctx.beginPath();
    for (let x = sx; x <= wx1+gridSize; x += gridSize) {
      ctx.moveTo(x, wy0); ctx.lineTo(x, wy1);
    }
    for (let y = sy; y <= wy1+gridSize; y += gridSize) {
      ctx.moveTo(wx0, y); ctx.lineTo(wx1, y);
    }
    ctx.stroke();
  }

  // Régua
  if (rulerType && rulerStart && rulerEnd) {
    mapaDrawRuler(ctx, zoom, gridSize, metrosCell);
  }

  // Rastro
  if (trailTok && trailOrigin) {
    const ox = trailOrigin.x + gridSize/2, oy = trailOrigin.y + gridSize/2;
    const cx2 = trailTok.x + gridSize/2,   cy2 = trailTok.y + gridSize/2;
    const dx = cx2-ox, dy = cy2-oy;
    const dist = Math.sqrt(dx*dx+dy*dy);
    const metros = (dist/gridSize*metrosCell).toFixed(1);
    ctx.strokeStyle = 'rgba(52,152,219,0.85)';
    ctx.lineWidth = 2/zoom;
    ctx.setLineDash([5/zoom, 5/zoom]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(cx2, cy2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(ox, oy, 5/zoom, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(52,152,219,0.6)'; ctx.fill();
    if (dist > 5) {
      ctx.font = `bold ${13/zoom}px sans-serif`;
      ctx.fillStyle = '#3498db'; ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 3/zoom; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.strokeText(`${metros}m`, (ox+cx2)/2, (oy+cy2)/2 - 5/zoom);
      ctx.fillText(`${metros}m`, (ox+cx2)/2, (oy+cy2)/2 - 5/zoom);
    }
  }

  // Retângulo de seleção
  if (selRect) {
    const { sx, sy, ex, ey } = selRect;
    const rx = Math.min(sx,ex), ry = Math.min(sy,ey);
    const rw = Math.abs(ex-sx), rh = Math.abs(ey-sy);
    ctx.strokeStyle = 'rgba(52,152,219,0.9)';
    ctx.fillStyle   = 'rgba(52,152,219,0.08)';
    ctx.lineWidth   = 1.5/zoom;
    ctx.setLineDash([4/zoom, 3/zoom]);
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillRect(rx, ry, rw, rh);
    ctx.setLineDash([]);
  }

  // Tokens
  tokens.forEach(t => mapaDrawToken(ctx, t, zoom, gridSize, sel, selMulti));

  // Fog of War: paredes (mundo)
  if (typeof fogRenderWorld === 'function') fogRenderWorld(ctx, zoom);

  ctx.restore();

  // Fog of War: escuridão (tela) — cobre tokens/mapa para os players
  if (typeof fogRenderScreen === 'function') fogRenderScreen(ctx);

  // HUD zoom
  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText(`${Math.round(zoom*100)}%`, W-6, H-4);
  const zl = document.getElementById('zoom-label');
  if (zl) zl.textContent = Math.round(zoom*100)+'%';
}

function mapaDrawRuler(ctx, zoom, gridSize, metrosCell) {
  const { rulerType: tipo, rulerStart: A, rulerEnd: B } = MAP;
  const dx = B.x-A.x, dy = B.y-A.y;
  const dist = Math.sqrt(dx*dx+dy*dy);
  const angulo = Math.atan2(dy, dx);
  const metros = (dist/gridSize*metrosCell).toFixed(1);

  ctx.strokeStyle = 'rgba(241,196,15,0.9)';
  ctx.fillStyle   = 'rgba(241,196,15,0.12)';
  ctx.lineWidth   = 2/zoom;
  ctx.setLineDash([6/zoom, 4/zoom]);

  if (tipo === 'linha') {
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
  } else if (tipo === 'circulo') {
    ctx.beginPath(); ctx.arc(A.x, A.y, dist, 0, Math.PI*2);
    ctx.stroke(); ctx.fill();
  } else if (tipo === 'cone') {
    const half = (60/2)*Math.PI/180;
    ctx.beginPath(); ctx.moveTo(A.x, A.y);
    ctx.arc(A.x, A.y, dist, angulo-half, angulo+half);
    ctx.closePath(); ctx.stroke(); ctx.fill();
  } else if (tipo === 'quadrado') {
    ctx.save(); ctx.translate(A.x, A.y); ctx.rotate(angulo);
    ctx.beginPath(); ctx.rect(0, -dist/2, dist, dist);
    ctx.stroke(); ctx.fill(); ctx.restore();
  } else if (tipo === 'retangulo') {
    ctx.save(); ctx.translate(A.x, A.y); ctx.rotate(angulo);
    ctx.beginPath(); ctx.rect(0, -gridSize/2, dist, gridSize);
    ctx.stroke(); ctx.fill(); ctx.restore();
  }
  ctx.setLineDash([]);

  // Label
  if (dist > 5) {
    const mx = (A.x+B.x)/2, my = (A.y+B.y)/2 - 8/zoom;
    ctx.font = `bold ${14/zoom}px sans-serif`;
    ctx.fillStyle = '#f1c40f'; ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3/zoom; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.strokeText(`${metros}m`, mx, my); ctx.fillText(`${metros}m`, mx, my);
  }
}

function mapaDrawToken(ctx, t, zoom, gridSize, sel, selMulti) {
  const r  = gridSize * 0.42;
  const cx = t.x + gridSize/2;
  const cy = t.y + gridSize/2;
  const cor = { pc:'#2980b9', infectado:'#c0392b', animal:'#27ae60',
                animal_infectado:'#8e44ad', humano:'#e67e22', custom:'#7f8c8d' }[t.tipo] || '#555';

  const isSelSingle = sel?.id === t.id;
  const isSelMulti  = selMulti.some(s => s.id === t.id);

  if (isSelSingle || isSelMulti) {
    ctx.beginPath(); ctx.arc(cx, cy, r + 5/zoom, 0, Math.PI*2);
    ctx.strokeStyle = isSelMulti ? '#3498db' : '#f1c40f';
    ctx.lineWidth = 2.5/zoom; ctx.stroke();
  }

  if (t.imgUrl) {
    const cached = MAP.imgCache[t.imgUrl];
    if (!cached) {
      MAP.imgCache[t.imgUrl] = 'loading';
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload  = () => { MAP.imgCache[t.imgUrl] = img; mapaDraw(); };
      img.onerror = () => { MAP.imgCache[t.imgUrl] = 'err';  mapaDraw(); };
      img.src = t.imgUrl;
    } else if (cached !== 'loading' && cached !== 'err') {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.clip();
      ctx.drawImage(cached, cx-r, cy-r, r*2, r*2);
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fillStyle = cor; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = cor; ctx.lineWidth = 2.5/zoom; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = cor; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5/zoom; ctx.stroke();
    ctx.font = `${r*0.9}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff'; ctx.fillText(t.emoji || '?', cx, cy);
  }

  // Nome
  const nome = (t.nome || '').substring(0, 10);
  ctx.font = `bold ${Math.max(8, gridSize*0.13)}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = 3/zoom;
  ctx.fillStyle   = '#fff';
  ctx.strokeText(nome, cx, t.y + gridSize - 14);
  ctx.fillText(nome, cx, t.y + gridSize - 14);

  // Barra PV
  const mostrarPV = t.pvMax && (t.isPC || isMaster || mostrarPVInimigos);
  if (mostrarPV) {
    const bw = gridSize-8, bh = 4, bx = t.x+4, by = t.y+3;
    const pct = Math.max(0, t.pvAtual/t.pvMax);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = pct>0.5?'#27ae60':pct>0.25?'#f39c12':'#c0392b';
    ctx.fillRect(bx, by, bw*pct, bh);
  }
}

// ── HIT TEST ─────────────────────────────────────
function mapaTokenAt(wx, wy) {
  return MAP.tokens.slice().reverse().find(t =>
    wx >= t.x && wx <= t.x + MAP.gridSize &&
    wy >= t.y && wy <= t.y + MAP.gridSize
  );
}

function podeMoverToken(t) {
  if (isMaster) return true;
  if (t.isPC && t.userId === currentUser?.id) return true;
  if (t.controladorNome === currentProfile?.username) return true;
  return false;
}

// Reset drag state sem salvar (cancela drag se mouse sair da janela)
function mapaResetDrag() {
  // Só cancela drag se trocar de aba (visibilitychange)
  // Não faz rollback para evitar o token voltar sozinho
  if (MAP.drag) {
    MAP.drag = null; MAP.dragMulti = [];
    MAP.trailTok = null; MAP.trailOrigin = null;
    MAP.pan = null; MAP.selRect = null;
    mapaDraw();
    mapaSalvarDB(); // salva posição atual
  }
}

// ── MOUSE ────────────────────────────────────────
function mapaMouseDown(e) {
  e.preventDefault();
  const c = tela2canvas(e.clientX, e.clientY);
  const w = canvas2world(c.x, c.y);

  // Ferramentas de Fog of War / Paredes (só mestre)
  if (typeof fogToolMouseDown === 'function' && fogToolMouseDown(e, w)) return;

  // Régua
  if (MAP.rulerType) {
    MAP.rulerStart = w; MAP.rulerEnd = { ...w }; return;
  }

  const tok = mapaTokenAt(w.x, w.y);

  if (e.button === 1 || e.altKey) {
    // Pan forçado
    MAP.pan = { lx: c.x, ly: c.y }; return;
  }

  if (tok && podeMoverToken(tok)) {
    if (e.shiftKey) {
      // Shift+click = toggle seleção múltipla
      const idx = MAP.selMulti.findIndex(s => s.id === tok.id);
      if (idx >= 0) MAP.selMulti.splice(idx,1); else MAP.selMulti.push(tok);
      MAP.sel = tok; mapaDraw(); return;
    }

    if (MAP.selMulti.length > 1 && MAP.selMulti.some(s => s.id === tok.id)) {
      // Drag de múltiplos
      MAP.drag = { tok, ox: w.x-tok.x, oy: w.y-tok.y };
      MAP.dragMulti = MAP.selMulti.map(s => ({ tok: s, ox: w.x-s.x, oy: w.y-s.y }));
    } else {
      // Drag de um único
      MAP.selMulti = [];
      MAP.drag = { tok, ox: w.x-tok.x, oy: w.y-tok.y };
      MAP.dragMulti = [];
    }
    MAP.sel = tok;
    MAP.trailTok    = tok;
    MAP.trailOrigin = { x: tok.x, y: tok.y };
    mapaDraw();
  } else {
    // Clique em área vazia
    MAP.selMulti = []; MAP.sel = null;
    mapaEsconderInfo();

    if (isMaster && !e.altKey) {
      // Inicia retângulo de seleção (sempre, para qualquer arrasto em área vazia)
      MAP.selRect = { sx: w.x, sy: w.y, ex: w.x, ey: w.y };
    } else {
      // Alt+drag ou não mestre = pan
      MAP.pan = { lx: c.x, ly: c.y };
    }
    mapaDraw();
  }
  MAP._moved = false;
}

function mapaMouseMove(e) {
  if (!MAP.canvas) return;

  const c0 = tela2canvas(e.clientX, e.clientY);
  const w0 = canvas2world(c0.x, c0.y);
  if (typeof fogToolMouseMove === 'function' && fogToolMouseMove(e, w0)) return;

  if (!MAP.drag && !MAP.pan && !MAP.rulerType && !MAP.selRect && !MAP.sel) return;

  const c = c0, w = w0;
  MAP._moved = true;

  if (MAP.rulerType && MAP.rulerStart) {
    MAP.rulerEnd = w; mapaDraw(); return;
  }

  if (MAP.drag) {
    if (MAP.dragMulti.length > 1) {
      MAP.dragMulti.forEach(d => {
        const nx = Math.max(0, w.x - d.ox), ny = Math.max(0, w.y - d.oy);
        const pos = (typeof fogPosPermitida === 'function') ? fogPosPermitida(d.tok, nx, ny) : { x: nx, y: ny };
        d.tok.x = pos.x; d.tok.y = pos.y;
      });
    } else {
      const nx = Math.max(0, w.x - MAP.drag.ox), ny = Math.max(0, w.y - MAP.drag.oy);
      const pos = (typeof fogPosPermitida === 'function') ? fogPosPermitida(MAP.drag.tok, nx, ny) : { x: nx, y: ny };
      MAP.drag.tok.x = pos.x; MAP.drag.tok.y = pos.y;
    }
    mapaDraw(); return;
  }

  if (MAP.selRect) {
    MAP.selRect.ex = w.x; MAP.selRect.ey = w.y;
    mapaDraw(); return;
  }

  if (MAP.pan) {
    MAP.offX += c.x - MAP.pan.lx;
    MAP.offY += c.y - MAP.pan.ly;
    MAP.pan.lx = c.x; MAP.pan.ly = c.y;
    mapaDraw();
  }
}

function mapaMouseUp(e) {
  if (!MAP.canvas) return;
  if (typeof fogToolMouseUp === 'function' && fogToolMouseUp()) return;

  if (MAP.drag) {
    if (!MAP._moved) {
      const tok = MAP.drag.tok;
      // Verifica se é PC do player
      if (!(tok.isPC && tok.userId === currentUser?.id && !isMaster)) {
        mapaMostrarInfo(tok);
      }
    }
    MAP.drag = null; MAP.dragMulti = [];
    MAP.trailTok = null; MAP.trailOrigin = null;
    mapaDraw(); mapaSalvarDB(); return;
  }

  if (MAP.selRect) {
    const { sx, sy, ex, ey } = MAP.selRect;
    const rx = Math.min(sx,ex), ry = Math.min(sy,ey);
    const rw = Math.abs(ex-sx), rh = Math.abs(ey-sy);
    if (rw > 5 && rh > 5) {
      MAP.selMulti = MAP.tokens.filter(t =>
        podeMoverToken(t) &&
        t.x+MAP.gridSize/2 >= rx && t.x+MAP.gridSize/2 <= rx+rw &&
        t.y+MAP.gridSize/2 >= ry && t.y+MAP.gridSize/2 <= ry+rh
      );
      if (MAP.selMulti.length > 0)
        toast(`${MAP.selMulti.length} tokens selecionados — arraste qualquer um para mover juntos`, 'ok');
    }
    MAP.selRect = null; mapaDraw(); return;
  }

  MAP.pan = null;
}

// ── ZOOM ─────────────────────────────────────────
function mapaWheel(e) {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 0.88;
  const c = tela2canvas(e.clientX, e.clientY);
  const novoZoom = Math.max(0.15, Math.min(6, MAP.zoom * factor));
  MAP.offX = c.x - (c.x - MAP.offX) * (novoZoom / MAP.zoom);
  MAP.offY = c.y - (c.y - MAP.offY) * (novoZoom / MAP.zoom);
  MAP.zoom = novoZoom;
  mapaDraw();
}

function mapaAlterarZoom(delta) {
  const novo = Math.max(0.15, Math.min(6, MAP.zoom + delta));
  const cx = MAP.canvas.width/2, cy = MAP.canvas.height/2;
  MAP.offX = cx - (cx - MAP.offX) * (novo / MAP.zoom);
  MAP.offY = cy - (cy - MAP.offY) * (novo / MAP.zoom);
  MAP.zoom = novo;
  mapaDraw();
}

function mapaResetZoom() { MAP.zoom = 1; MAP.offX = 0; MAP.offY = 0; mapaDraw(); }

// Compatibilidade com código antigo
function resetZoom() { mapaResetZoom(); }
function alterarZoomBtn(d) { mapaAlterarZoom(d); }

// ── TOUCH ────────────────────────────────────────
let _lastTap = 0;

function mapaTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 2) {
    MAP.drag = null; MAP.pan = null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    MAP.pinch = Math.hypot(dx, dy);
    return;
  }
  const t0 = e.touches[0];
  const c  = tela2canvas(t0.clientX, t0.clientY);
  const w  = canvas2world(c.x, c.y);
  MAP._moved = false;

  if (MAP.rulerType) { MAP.rulerStart = w; MAP.rulerEnd = { ...w }; return; }

  const tok = mapaTokenAt(w.x, w.y);
  if (tok && podeMoverToken(tok)) {
    if (MAP.selMulti.length > 1 && MAP.selMulti.some(s => s.id === tok.id)) {
      MAP.drag = { tok, ox: w.x-tok.x, oy: w.y-tok.y, origX: tok.x, origY: tok.y };
      MAP.dragMulti = MAP.selMulti.map(s => ({ tok: s, ox: w.x-s.x, oy: w.y-s.y, origX: s.x, origY: s.y }));
    } else {
      MAP.selMulti = [];
      MAP.drag = { tok, ox: w.x-tok.x, oy: w.y-tok.y, origX: tok.x, origY: tok.y };
      MAP.dragMulti = [];
    }
    MAP.sel = tok;
    MAP.trailTok    = tok;
    MAP.trailOrigin = { x: tok.x, y: tok.y };
    mapaDraw();
  } else {
    MAP.sel = null; MAP.selMulti = [];
    MAP.pan = { lx: c.x, ly: c.y };
    mapaEsconderInfo(); mapaDraw();
  }
}

function mapaTouchMove(e) {
  e.preventDefault();
  MAP._moved = true;

  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    if (MAP.pinch && dist > 0) {
      const mx = (e.touches[0].clientX + e.touches[1].clientX)/2;
      const my = (e.touches[0].clientY + e.touches[1].clientY)/2;
      const c  = tela2canvas(mx, my);
      const f  = dist / MAP.pinch;
      const novo = Math.max(0.15, Math.min(6, MAP.zoom * f));
      MAP.offX = c.x - (c.x - MAP.offX) * (novo / MAP.zoom);
      MAP.offY = c.y - (c.y - MAP.offY) * (novo / MAP.zoom);
      MAP.zoom = novo;
      mapaDraw();
    }
    MAP.pinch = dist; return;
  }

  const t0 = e.touches[0];
  const c  = tela2canvas(t0.clientX, t0.clientY);
  const w  = canvas2world(c.x, c.y);

  if (MAP.rulerType && MAP.rulerStart) { MAP.rulerEnd = w; mapaDraw(); return; }

  if (MAP.drag) {
    if (MAP.dragMulti.length > 1) {
      MAP.dragMulti.forEach(d => {
        const nx = Math.max(0, w.x - d.ox), ny = Math.max(0, w.y - d.oy);
        const pos = (typeof fogPosPermitida === 'function') ? fogPosPermitida(d.tok, nx, ny) : { x: nx, y: ny };
        d.tok.x = pos.x; d.tok.y = pos.y;
      });
    } else {
      const nx = Math.max(0, w.x - MAP.drag.ox), ny = Math.max(0, w.y - MAP.drag.oy);
      const pos = (typeof fogPosPermitida === 'function') ? fogPosPermitida(MAP.drag.tok, nx, ny) : { x: nx, y: ny };
      MAP.drag.tok.x = pos.x; MAP.drag.tok.y = pos.y;
    }
    mapaDraw(); return;
  }

  if (MAP.pan) {
    MAP.offX += c.x - MAP.pan.lx;
    MAP.offY += c.y - MAP.pan.ly;
    MAP.pan.lx = c.x; MAP.pan.ly = c.y;
    mapaDraw();
  }
}

function mapaTouchEnd(e) {
  MAP.pinch = null;

  if (MAP.drag) {
    if (!MAP._moved) {
      const tok = MAP.drag.tok;
      if (!(tok.isPC && tok.userId === currentUser?.id && !isMaster))
        mapaMostrarInfo(tok);
    }
    MAP.drag = null; MAP.dragMulti = [];
    MAP.trailTok = null; MAP.trailOrigin = null;
    mapaDraw(); mapaSalvarDB(); return;
  }

  // Double-tap para cancelar régua
  if (!MAP._moved && MAP.rulerType) {
    const now = Date.now();
    if (now - _lastTap < 300) mapaToggleRuler(null);
    _lastTap = now; return;
  }

  // Single tap em área vazia = pan end
  MAP.pan = null;
}

// ── TOKEN INFO ───────────────────────────────────
function mapaMostrarInfo(t) {
  const el = document.getElementById('token-info');
  if (!el) return;
  const podeEditar = isMaster || t.controladorNome === currentProfile?.username;
  el.style.display = 'block';
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      ${t.imgUrl && MAP.imgCache[t.imgUrl] && MAP.imgCache[t.imgUrl] !== 'err' && MAP.imgCache[t.imgUrl] !== 'loading'
        ? `<img src="${t.imgUrl}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0">`
        : `<span style="font-size:22px;flex-shrink:0">${t.emoji||'?'}</span>`}
      <div style="flex:1">
        <div style="font-weight:700;font-size:12px">${t.nome}</div>
        <div style="font-size:9px;color:var(--muted)">${t.tipo}</div>
      </div>
      ${podeEditar ? `<button class="btn-icon" onclick="mapaRemoverToken('${t.id}')" title="Remover">🗑</button>` : ''}
    </div>
    ${t.pvMax ? `<div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">
      <span style="font-size:9px;color:var(--muted)">PV</span>
      <button class="ct-pv-btn" onclick="mapaAlterarPV('${t.id}',-1)">−</button>
      <input type="number" value="${t.pvAtual}" min="0" max="${t.pvMax}" onchange="mapaSetPV('${t.id}',this.value)"
        style="width:40px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px;font-size:12px">
      <span style="color:var(--muted);font-size:11px">/${t.pvMax}</span>
      <button class="ct-pv-btn" onclick="mapaAlterarPV('${t.id}',1)">+</button>
    </div>` : ''}
    ${podeEditar ? `
      <input type="file" accept="image/*" style="display:none" id="tok-img-${t.id}" onchange="mapaUploadImg('${t.id}',this)">
      <button class="btn-ghost" style="width:100%;font-size:9px;padding:4px" onclick="document.getElementById('tok-img-${t.id}').click()">📷 Trocar imagem</button>
    ` : ''}
  `;
}

function mapaEsconderInfo() {
  const el = document.getElementById('token-info');
  if (el) el.style.display = 'none';
}

// ── OPERAÇÕES TOKENS ─────────────────────────────
function mapaRemoverToken(id) {
  // Remove imediatamente sem confirmação de delay
  const before = MAP.tokens.length;
  MAP.tokens = MAP.tokens.filter(t => t.id !== id);
  if (MAP.tokens.length === before) return; // não encontrou
  if (MAP.sel?.id === id) MAP.sel = null;
  MAP.selMulti = MAP.selMulti.filter(t => t.id !== id);
  mapaEsconderInfo();
  mapaDraw();
  // Salva imediatamente (sem debounce)
  clearTimeout(MAP.saveTimer);
  _mapaSalvarNow();
}

function mapaAlterarPV(id, delta) {
  const t = MAP.tokens.find(x => x.id === id); if (!t) return;
  t.pvAtual = Math.max(0, Math.min(t.pvMax, t.pvAtual + delta));
  const cb = combatentes?.find(x => x.id === id);
  if (cb) { cb.pvAtual = t.pvAtual; renderCT(); }
  mapaMostrarInfo(t); mapaDraw(); mapaSalvarDB();
}

function mapaSetPV(id, val) {
  const t = MAP.tokens.find(x => x.id === id); if (!t) return;
  t.pvAtual = Math.max(0, Math.min(t.pvMax, parseInt(val)||0));
  const cb = combatentes?.find(x => x.id === id);
  if (cb) { cb.pvAtual = t.pvAtual; renderCT(); }
  mapaDraw(); mapaSalvarDB();
}

async function mapaUploadImg(tokenId, input) {
  const file = input.files[0]; if (!file) return;
  const ext  = file.name.split('.').pop();
  const path = `${currentUser.id}/${tokenId}.${ext}`;
  const { error } = await db.storage.from('tokens').upload(path, file, { upsert: true });
  if (error) { toast('Erro: '+error.message, 'err'); return; }
  const { data } = db.storage.from('tokens').getPublicUrl(path);
  const t = MAP.tokens.find(x => x.id === tokenId);
  if (t) {
    delete MAP.imgCache[t.imgUrl];
    t.imgUrl = data.publicUrl;
    mapaMostrarInfo(t); mapaDraw(); mapaSalvarDB();
  }
  toast('Imagem atualizada!', 'ok');
}

function mapaAdicionarToken(cfg) {
  // Posiciona no centro visível
  const cx = (MAP.canvas.width  / 2 - MAP.offX) / MAP.zoom;
  const cy = (MAP.canvas.height / 2 - MAP.offY) / MAP.zoom;
  const tok = {
    id:      cfg.id || 'tok_'+Date.now(),
    nome:    cfg.nome || 'Token',
    emoji:   cfg.emoji || '?',
    tipo:    cfg.tipo || 'custom',
    imgUrl:  cfg.imgUrl || null,
    x:       Math.max(0, cx - MAP.gridSize/2),
    y:       Math.max(0, cy - MAP.gridSize/2),
    pvMax:   cfg.pvMax,
    pvAtual: cfg.pvAtual ?? cfg.pvMax,
    isPC:    cfg.isPC || false,
    userId:  cfg.userId || null,
    controladorNome: cfg.controladorNome || null,
  };
  MAP.tokens.push(tok);
  mapaDraw(); mapaSalvarDB();
  return tok;
}

function mapaLimpar() {
  if (!isMaster) { toast('Só o mestre pode limpar.','err'); return; }
  if (!confirm('Limpar todos os tokens?')) return;
  MAP.tokens = []; MAP.sel = null; MAP.selMulti = [];
  mapaEsconderInfo(); mapaDraw(); mapaSalvarDB();
}

// ── IMAGEM DE FUNDO ──────────────────────────────

async function mapaImportarImagem() {
  if (!isMaster) return;
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    toast('Enviando imagem...', 'ok');

    // Preview local imediato
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => { MAP.img = img; mapaResetZoom(); mapaDraw(); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);

    // Upload para Supabase Storage
    const ext  = file.name.split('.').pop();
    const path = `mapas/${currentUser.id}/mapa_${Date.now()}.${ext}`;
    const { error } = await db.storage.from('tokens').upload(path, file, { upsert: true });
    if (error) { toast('Erro no upload: ' + error.message, 'err'); return; }

    const { data } = db.storage.from('tokens').getPublicUrl(path);
    MAP.imgUrl = data.publicUrl;
    toast('Mapa carregado!', 'ok');
    mapaSalvarDB();
  };
  input.click();
}

// ── GRID ─────────────────────────────────────────
function mapaToggleGrid() {
  MAP.gridVisible = !MAP.gridVisible;
  const btn = document.getElementById('btn-grid');
  if (btn) btn.textContent = MAP.gridVisible ? '⬛ Ocultar Grid' : '⬛ Mostrar Grid';
  mapaDraw();
}

function mapaAlterarGrid(delta) {
  MAP.gridSize = Math.max(20, Math.min(200, MAP.gridSize + delta));
  const el = document.getElementById('grid-size-val');
  if (el) el.textContent = MAP.gridSize + 'px';
  mapaDraw();
}

// Compatibilidade
function toggleGrid()        { mapaToggleGrid(); }
function alterarGrid(delta)  { mapaAlterarGrid(delta); }

// ── RÉGUA ────────────────────────────────────────
function mapaToggleRuler(tipo) {
  if (MAP.rulerType === tipo || tipo === null) {
    MAP.rulerType  = null;
    MAP.rulerStart = null;
    MAP.rulerEnd   = null;
    if (MAP.canvas) MAP.canvas.style.cursor = 'default';
  } else {
    MAP.rulerType = tipo;
    if (MAP.canvas) MAP.canvas.style.cursor = 'crosshair';
  }
  // Atualiza botões
  ['linha','circulo','cone','quadrado','retangulo'].forEach(t => {
    const btn = document.getElementById('btn-regua-'+t);
    if (!btn) return;
    const ativo = MAP.rulerType === t;
    btn.style.color       = ativo ? 'var(--gold)' : '';
    btn.style.borderColor = ativo ? 'var(--gold)' : '';
  });
  mapaDraw();
}

// Compatibilidade
function toggleRegua(tipo) { mapaToggleRuler(tipo || 'linha'); }

// ── PERSISTÊNCIA ─────────────────────────────────
function mapaSalvarDB() {
  clearTimeout(MAP.saveTimer);
  MAP.saveTimer = setTimeout(_mapaSalvarNow, 1200);
}

async function _mapaSalvarNow() {
  if (MAP.drag) { mapaSalvarDB(); return; } // retry after drag ends
  if (!isMaster) {
    // Player: salva apenas seus próprios tokens
    try {
      const { data } = await db.from('mapa_estado').select('tokens').eq('id', mesaId()).single();
      let toks = (data?.tokens || []).filter(t => t.userId !== currentUser.id);
      toks = [...toks, ...MAP.tokens.filter(t => t.userId === currentUser.id)];
      await db.from('mapa_estado').upsert({ id: mesaId(), tokens:toks, updated_at:new Date().toISOString() });
    } catch(e) {}
    return;
  }

  // Mestre: salva tudo (mas não salva base64 no DB)
  const urlParaSalvar = (MAP.imgUrl && MAP.imgUrl.startsWith('https://')) ? MAP.imgUrl : null;
  try {
    MAP.lastSaveTs = new Date().toISOString();
    const { error: saveErr } = await db.from('mapa_estado').upsert({
      id:           mesaId(),
      tokens:       MAP.tokens.map(t => ({ ...t })),
      grid_size:    MAP.gridSize,
      grid_visivel: MAP.gridVisible,
      mapa_url:     urlParaSalvar,
      updated_at:   MAP.lastSaveTs,
    });
    // Fog e paredes agora vivem em fog_estado (tabela própria):
    // isso evita reenviar o fog inteiro pela rede a cada token movido.
    if (saveErr) {
      console.error('mapaSalvarDB (supabase):', saveErr);
      if (/fog|paredes/i.test(saveErr.message || '')) {
        toast('⚠ Rode MIGRACAO_FOG.sql no Supabase — colunas fog/paredes não existem!', 'err');
      }
    }
  } catch(e) {
    console.error('mapaSalvarDB:', e);
    const emsg = (e?.message || '') + ' ' + (e?.details || '');
    if (/fog|paredes/i.test(emsg)) {
      toast('⚠ Banco sem as colunas de fog! Rode MIGRACAO_FOG.sql no Supabase.', 'err');
    }
  }

  // Cenas são salvas apenas manualmente pelo botão 💾
}

let _fogSaveTimer = null;
function mapaSalvarFogDB() {
  if (!isMaster) return;
  clearTimeout(_fogSaveTimer);
  _fogSaveTimer = setTimeout(async () => {
    try {
      const { error } = await db.from('fog_estado').upsert({
        id:         mesaId(),
        fog:        typeof fogExport === 'function' ? fogExport() : null,
        paredes:    (typeof FOG !== 'undefined') ? FOG.paredes : [],
        updated_at: new Date().toISOString(),
      });
      if (error && /fog_estado/i.test(error.message || '')) {
        toast('⚠ Rode OTIMIZACAO_GERAL.sql no Supabase!', 'err');
      }
    } catch(e) { console.error('mapaSalvarFogDB:', e); }
  }, 2000);
}

async function mapaCarregarDB() {
  try {
    const { data } = await db.from('mapa_estado').select('*').eq('id', mesaId()).single();
    if (data) {
      if (!MAP.drag) MAP.tokens = data.tokens || [];
      MAP.gridSize    = data.grid_size || 60;
      MAP.gridVisible = data.grid_visivel !== false;
      if (typeof fogImport === 'function') {
        // Tenta a tabela nova primeiro (formato otimizado)
        try {
          const { data: fogRow } = await db.from('fog_estado').select('*').eq('id', mesaId()).maybeSingle();
          if (fogRow) {
            fogImport(fogRow.fog, fogRow.paredes);
            data.fog = undefined; data.paredes = undefined; // não reimporta o legado abaixo
          }
        } catch(e) {}
        if (!('fog' in data)) {
          console.warn('mapa_estado sem coluna fog — rode MIGRACAO_FOG.sql (o sync ao vivo funciona mesmo assim, mas o fog não persiste entre sessões).');
        }
        fogImport(data.fog, data.paredes);
      }
      if (data.video_url && data.video_url.startsWith('https://')) {
        mapaCarregarVideo(data.video_url, false);
      } else if (data.mapa_url && data.mapa_url.startsWith('https://')) {
        MAP.imgUrl = data.mapa_url;
        const img = new Image();
        img.onload  = () => { MAP.img = img; mapaDraw(); };
        img.onerror = () => mapaDraw();
        img.src     = data.mapa_url;
      }
      const el = document.getElementById('grid-size-val');
      if (el) el.textContent = MAP.gridSize + 'px';
    }
  } catch(e) {}
  mapaDraw();
  mapaSubscribeRealtime();
}

let _mapaSubAtiva = false;
function mapaSubscribeRealtime() {
  if (_mapaSubAtiva) return;
  _mapaSubAtiva = true;
  console.log('mapaSubscribeRealtime: conectando...');

  // Canal de sync ao vivo do Fog of War (broadcast, independente do banco)
  if (typeof fogInitSync === 'function') fogInitSync();

  db.channel('mapa-v5-'+mesaId())
    .on('postgres_changes', { event:'*', schema:'public', table:'fog_estado', filter: 'id=eq.' + mesaId() }, payload => {
      const f = payload.new; if (!f) return;
      if (typeof fogImport === 'function' && !(isMaster && FOG.tool)) {
        fogImport(f.fog, f.paredes);
        mapaDraw();
      }
    })
    .on('postgres_changes', { event:'UPDATE', schema:'public', table:'mapa_estado', filter: 'id=eq.' + mesaId() }, payload => {
      const d = payload.new; if (!d) return;
      console.log('mapa realtime: UPDATE recebido, tokens:', d.tokens?.length);

      // Ignora realtime enquanto estiver arrastando um token
      if (MAP.drag) return;

      MAP.tokens      = d.tokens || [];
      MAP.gridSize    = d.grid_size || 60;
      MAP.gridVisible = d.grid_visivel !== false;
      // Fog não viaja mais neste payload (vive em fog_estado + canal fog-live)

      // Atualiza imagem só se URL mudou e é válida
      const novaVideoUrl = d.video_url;
      const novaImgUrl   = d.mapa_url;
      if (novaVideoUrl && novaVideoUrl.startsWith('https://') && novaVideoUrl !== _vidUrl) {
        MAP.img = null; MAP.imgUrl = null;
        mapaCarregarVideo(novaVideoUrl, false);
      } else if (!novaVideoUrl && _vid) {
        mapaStopVideo();
      } else if (novaImgUrl && novaImgUrl.startsWith('https://') && novaImgUrl !== MAP.imgUrl) {
        if (_vid) mapaStopVideo();
        MAP.img = null;           // limpa a imagem anterior (evita flash da cena velha)
        MAP.imgUrl = novaImgUrl;
        mapaDraw();
        const img = new Image();
        img.onload  = () => { if (MAP.imgUrl === novaImgUrl) { MAP.img = img; mapaDraw(); } };
        img.onerror = () => mapaDraw();
        img.src     = novaImgUrl;
      } else {
        mapaDraw();
      }
    })
    .subscribe(status => console.log('mapa-v5 status:', status));
}

// Expõe para uso externo (ativarCena, etc.)
function mapaAplicarCena(cena) {
  if (!MAP.drag) MAP.tokens = cena.tokens || [];
  MAP.gridSize = cena.grid_size || 60;
  if (typeof fogImport === 'function') fogImport(cena.fog, cena.paredes);

  if (cena.video_url && cena.video_url.startsWith('https://')) {
    MAP.img = null; MAP.imgUrl = null;
    mapaCarregarVideo(cena.video_url, false); // já ignora se for a mesma URL
  } else if (cena.mapa_url && cena.mapa_url.startsWith('https://')) {
    if (_vid) mapaStopVideo();
    if (MAP.imgUrl === cena.mapa_url && MAP.img) { mapaDraw(); return; } // mesma imagem, não recarrega
    MAP.img = null;               // limpa a imagem da cena ANTERIOR (evita flash)
    MAP.imgUrl = cena.mapa_url;
    mapaDraw();                   // frame limpo enquanto a nova carrega
    const img = new Image();
    img.onload  = () => { if (MAP.imgUrl === cena.mapa_url) { MAP.img = img; mapaDraw(); } };
    img.onerror = () => mapaDraw();
    img.src     = cena.mapa_url;
  } else {
    if (_vid) mapaStopVideo();
    MAP.img = null; MAP.imgUrl = null; mapaDraw();
  }
}



// ══════════════════════════════════════════════════
//  VÍDEO/GIF — Renderizado no canvas (com zoom/pan)
// ══════════════════════════════════════════════════
let _vid       = null;   // elemento <video> ou <img> GIF
let _vidUrl    = null;   // URL salva no banco
let _vidRAF    = null;   // requestAnimationFrame ID
let _vidLoadToken = 0;   // invalida loads antigos em andamento (evita vídeo duplicado)

// Loop de animação dedicado ao vídeo
function _vidLoop() {
  if (!_vid || !MAP.canvas) { _vidRAF = null; return; }
  mapaDraw();
  _vidRAF = requestAnimationFrame(_vidLoop);
}

// Para o vídeo e cancela o loop
function mapaStopVideo() {
  _vidLoadToken++; // invalida qualquer load pendente
  if (_vidRAF) { cancelAnimationFrame(_vidRAF); _vidRAF = null; }
  if (_vid && _vid.tagName === 'VIDEO') { _vid.pause(); _vid.src = ''; }
  _vid = null; _vidUrl = null;
  mapaDraw();
}

// Carrega vídeo/GIF e inicia loop
function mapaCarregarVideo(url, resetView = true) {
  // Já está tocando essa URL? Não recarrega (mata o ping-pong do eco realtime)
  if (_vid && _vidUrl === url) return;

  _vidUrl = url;                    // seta ANTES do load (o eco realtime compara com isso)
  const meuToken = ++_vidLoadToken; // invalida loads anteriores em andamento

  // Para qualquer vídeo anterior
  if (_vidRAF) { cancelAnimationFrame(_vidRAF); _vidRAF = null; }
  if (_vid && _vid.tagName === 'VIDEO') { _vid.pause(); _vid.src = ''; }
  _vid = null;

  const ext = url.split('?')[0].split('.').pop().toLowerCase();

  if (ext === 'gif') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (meuToken !== _vidLoadToken) return; // load antigo, descarta
      _vid = img;
      if (resetView) mapaResetZoom();
      _vidStartLoop();
    };
    img.onerror = () => { if (meuToken === _vidLoadToken) toast('Erro ao carregar GIF.', 'err'); };
    img.src = url;
  } else {
    const v = document.createElement('video');
    v.src = url; v.loop = true; v.muted = true;
    v.playsInline = true; v.crossOrigin = 'anonymous';
    v.oncanplay = () => {
      if (meuToken !== _vidLoadToken) { v.pause(); v.src = ''; return; } // load antigo
      if (_vid === v) return; // oncanplay pode disparar mais de uma vez
      _vid = v;
      v.play().then(() => {
        if (resetView) mapaResetZoom();
        _vidStartLoop();
      }).catch(() => {});
    };
    v.onerror = () => { if (meuToken === _vidLoadToken) toast('Erro ao carregar vídeo.', 'err'); };
    v.load();
  }
}

// Loop otimizado: usa requestVideoFrameCallback quando disponível
// (redesenha só quando há frame NOVO do vídeo — ~24/30fps em vez de 60)
function _vidStartLoop() {
  if (_vidRAF) { cancelAnimationFrame(_vidRAF); _vidRAF = null; }

  if (_vid && _vid.tagName === 'VIDEO' && 'requestVideoFrameCallback' in _vid) {
    const vRef = _vid;
    const step = () => {
      if (_vid !== vRef || !MAP.canvas) return; // vídeo trocou, encerra o loop
      mapaDraw();
      vRef.requestVideoFrameCallback(step);
    };
    vRef.requestVideoFrameCallback(step);
  } else {
    _vidRAF = requestAnimationFrame(_vidLoop); // fallback (GIF / navegadores antigos)
  }
}

// Importa e faz upload do vídeo/GIF
async function mapaImportarVideo() {
  if (!isMaster) return;
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'video/*,.gif';
  input.onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    toast('Carregando vídeo...', 'ok');

    // Preview local imediato (objectURL)
    const localUrl = URL.createObjectURL(file);
    mapaCarregarVideo(localUrl);

    // Upload para Storage
    const ext  = file.name.split('.').pop();
    const path = `mapas/${currentUser.id}/vid_${Date.now()}.${ext}`;
    const { error } = await db.storage.from('tokens').upload(path, file, { upsert: true });
    if (error) { toast('Erro upload: ' + error.message, 'err'); return; }
    const { data } = db.storage.from('tokens').getPublicUrl(path);
    _vidUrl = data.publicUrl;

    // Salva na cena ativa (limpa mapa_url para a cena não ficar com imagem E vídeo)
    if (typeof cenaAtiva !== 'undefined' && cenaAtiva) {
      await db.from('cenas_mapa').update({ video_url: _vidUrl, mapa_url: null }).eq('id', cenaAtiva);
    }
    // Propaga para players via mapa_estado (campo extra)
    await db.from('mapa_estado').update({
      video_url: _vidUrl,
      mapa_url:  null,       // limpa imagem se tinha
    }).eq('id', mesaId());

    toast('Vídeo/GIF ativado!', 'ok');
  };
  input.click();
}

// Compatibilidade com combate.js/npcs.js que usam variáveis globais
Object.defineProperty(window, 'tokens',   { get:()=>MAP.tokens,   set:v=>{ MAP.tokens=v; } });
Object.defineProperty(window, 'gridSize', { get:()=>MAP.gridSize, set:v=>{ MAP.gridSize=v; } });
Object.defineProperty(window, 'mapaImg',  { get:()=>MAP.img,      set:v=>{ MAP.img=v; } });
Object.defineProperty(window, 'mapaUrl',  { get:()=>MAP.imgUrl,   set:v=>{ MAP.imgUrl=v; } });
Object.defineProperty(window, 'canvas',   { get:()=>MAP.canvas,   set:v=>{ MAP.canvas=v; } });
function desenharMapa() { mapaDraw(); }
function salvarMapaDB() { mapaSalvarDB(); }
function initMapa()     { mapaInit(); }
function subscribeMapaRealtime() { mapaSubscribeRealtime(); }

// ── TOKEN CUSTOMIZADO ─────────────────────────────
let _tokenCustomFile = null;

function abrirCriarTokenCustom() {
  if (!isMaster) return;
  const m = document.getElementById('modal-token-custom');
  if (m) m.style.display = 'flex';
}
function fecharCriarTokenCustom() {
  const m = document.getElementById('modal-token-custom');
  if (m) m.style.display = 'none';
  _tokenCustomFile = null;
}
function tokenCustomImgPreview(input) {
  const file = input.files[0]; if (!file) return;
  _tokenCustomFile = file;
  const r = new FileReader();
  r.onload = ev => {
    const p = document.getElementById('token-custom-preview');
    if (p) { p.src = ev.target.result; p.style.display = 'block'; }
  };
  r.readAsDataURL(file);
}
async function criarTokenCustom() {
  const nome  = document.getElementById('tc-nome')?.value.trim() || 'Token';
  const pvMax = parseInt(document.getElementById('tc-pv')?.value) || 0;
  const tipo  = document.getElementById('tc-tipo')?.value || 'custom';
  const emoji = document.getElementById('tc-emoji')?.value || '⭐';
  let imgUrl  = null;

  if (_tokenCustomFile) {
    const ext  = _tokenCustomFile.name.split('.').pop();
    const path = `${currentUser.id}/custom_${Date.now()}.${ext}`;
    const { error } = await db.storage.from('tokens').upload(path, _tokenCustomFile, { upsert: true });
    if (!error) {
      const { data } = db.storage.from('tokens').getPublicUrl(path);
      imgUrl = data.publicUrl;
    }
  }

  mapaAdicionarToken({ nome, emoji, tipo, imgUrl, pvMax: pvMax||undefined, pvAtual: pvMax||undefined, isPC: false });
  fecharCriarTokenCustom();
  toast('Token criado!', 'ok');
}

// Cancela drag se trocar de aba
document.addEventListener('visibilitychange', () => {
  if (document.hidden) mapaResetDrag();
});
