// ══════════════════════════════════════════════════
//  FRACTURED — fog.js
//  Fog of War + Paredes + Linha de Visão (LOS)
//  Carregado DEPOIS de mapa.js e ANTES de app.js
// ══════════════════════════════════════════════════

const FOG = {
  enabled: false,
  modo:    'visao',        // 'visao' (automático por LOS) | 'manual' (pincel)
  raio:    8,              // raio de visão em células
  cells:   new Set(),      // células reveladas/exploradas — chave "gx,gy"
  paredes: [],             // [{x1,y1,x2,y2}] em coordenadas de mundo
  tool:    null,           // null | 'revelar' | 'ocultar' | 'parede' | 'apagar-parede'
  brush:   2,              // raio do pincel em células (0 = 1 célula)
  brushShape: 'circulo',   // 'circulo' | 'quadrado'
  rectPaint: null,         // { sx, sy, ex, ey } — área retangular (Shift+arrasto)
  wallStart: null,         // ponto inicial da parede sendo desenhada
  wallPreview: null,       // ponto atual do mouse durante desenho
  _fogCvs: null,           // canvas offscreen
  _lastExplore: 0,
  _painting: false,
};

// ── SERIALIZAÇÃO ─────────────────────────────────
function fogExport() {
  return {
    enabled: FOG.enabled,
    modo:    FOG.modo,
    raio:    FOG.raio,
    cells:   [...FOG.cells],
  };
}

function fogImport(f, paredes) {
  if (f && typeof f === 'object') {
    FOG.enabled = !!f.enabled;
    FOG.modo    = f.modo === 'manual' ? 'manual' : 'visao';
    FOG.raio    = Math.max(2, Math.min(30, parseInt(f.raio) || 8));
    FOG.cells   = new Set(Array.isArray(f.cells) ? f.cells : []);
  }
  if (Array.isArray(paredes)) FOG.paredes = paredes;
  fogSyncUI();
}

// ── GEOMETRIA ────────────────────────────────────
function _segIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  // Interseção raio AB com segmento CD. Retorna t ao longo de AB ou null.
  const r_dx = bx - ax, r_dy = by - ay;
  const s_dx = dx - cx, s_dy = dy - cy;
  const denom = r_dx * s_dy - r_dy * s_dx;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((cx - ax) * s_dy - (cy - ay) * s_dx) / denom;
  const u = ((cx - ax) * r_dy - (cy - ay) * r_dx) / denom;
  if (t >= 0 && u >= 0 && u <= 1) return t;
  return null;
}

function _distPontoSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Polígono de visibilidade: raycast do ponto (cx,cy) contra paredes,
// limitado por um círculo de raio R (aproximado por polígono).
function fogVisPoly(cx, cy, R) {
  const segs = [];
  // Paredes
  FOG.paredes.forEach(p => segs.push([p.x1, p.y1, p.x2, p.y2]));
  // Círculo-limite (24 lados)
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a1 = (i / N) * Math.PI * 2, a2 = ((i + 1) / N) * Math.PI * 2;
    segs.push([cx + Math.cos(a1) * R, cy + Math.sin(a1) * R,
               cx + Math.cos(a2) * R, cy + Math.sin(a2) * R]);
  }
  // Ângulos-alvo: extremos de cada segmento ± epsilon
  const angs = [];
  segs.forEach(s => {
    [[s[0], s[1]], [s[2], s[3]]].forEach(([px, py]) => {
      const a = Math.atan2(py - cy, px - cx);
      angs.push(a - 0.0004, a, a + 0.0004);
    });
  });
  angs.sort((a, b) => a - b);

  const pts = [];
  const FAR = R * 2;
  for (const a of angs) {
    const bx = cx + Math.cos(a) * FAR, by = cy + Math.sin(a) * FAR;
    let tMin = Infinity;
    for (const s of segs) {
      const t = _segIntersect(cx, cy, bx, by, s[0], s[1], s[2], s[3]);
      if (t !== null && t < tMin) tMin = t;
    }
    if (tMin === Infinity) tMin = R / FAR;
    pts.push([cx + Math.cos(a) * FAR * tMin, cy + Math.sin(a) * FAR * tMin]);
  }
  return pts;
}

function _pontoNoPoly(px, py, poly) {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) dentro = !dentro;
  }
  return dentro;
}

// Tokens que enxergam: todos os PCs (visão compartilhada do grupo)
function _tokensComVisao() {
  return (MAP.tokens || []).filter(t => t.isPC);
}


// ── COLISÃO: paredes bloqueiam movimento de tokens ────────────
// (o mestre atravessa; players batem na parede e podem deslizar nela)
function fogSegCruza(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function fogCaminhoBloqueado(cx1, cy1, cx2, cy2) {
  return FOG.paredes.some(p => fogSegCruza(cx1, cy1, cx2, cy2, p.x1, p.y1, p.x2, p.y2));
}

// Retorna a posição final permitida para o token (com deslize na parede)
function fogPosPermitida(tok, nx, ny) {
  if (isMaster || FOG.paredes.length === 0) return { x: nx, y: ny };
  const h  = MAP.gridSize / 2;
  const cx = tok.x + h, cy = tok.y + h;   // centro atual
  const tx = nx + h,    ty = ny + h;      // centro alvo
  if (!fogCaminhoBloqueado(cx, cy, tx, ty)) return { x: nx, y: ny };
  // Bateu: tenta deslizar só no eixo X, depois só no Y
  if (!fogCaminhoBloqueado(cx, cy, tx, cy)) return { x: nx, y: tok.y };
  if (!fogCaminhoBloqueado(cx, cy, cx, ty)) return { x: tok.x, y: ny };
  return { x: tok.x, y: tok.y };
}

// ── RENDER ───────────────────────────────────────
// Chamado DENTRO do transform de mundo (paredes visíveis só ao mestre)
function fogRenderWorld(ctx, zoom) {
  if (!isMaster) {
    // Preview da parede em desenho nunca acontece para player
  } else {
    // Paredes (laranja)
    ctx.strokeStyle = 'rgba(230,126,34,0.9)';
    ctx.lineWidth = 3 / zoom;
    ctx.lineCap = 'round';
    FOG.paredes.forEach(p => {
      ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke();
      // Pontas
      ctx.fillStyle = 'rgba(230,126,34,0.9)';
      [[p.x1, p.y1], [p.x2, p.y2]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 4 / zoom, 0, Math.PI * 2); ctx.fill();
      });
    });
    // Preview do retângulo de pintura (Shift+arrasto)
    if (FOG.rectPaint) {
      const r = FOG.rectPaint;
      const cor = FOG.tool === 'revelar' ? 'rgba(201,168,76,' : 'rgba(80,80,120,';
      ctx.strokeStyle = cor + '0.9)';
      ctx.fillStyle   = cor + '0.12)';
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([5 / zoom, 4 / zoom]);
      const rx = Math.min(r.sx, r.ex), ry = Math.min(r.sy, r.ey);
      ctx.strokeRect(rx, ry, Math.abs(r.ex - r.sx), Math.abs(r.ey - r.sy));
      ctx.fillRect(rx, ry, Math.abs(r.ex - r.sx), Math.abs(r.ey - r.sy));
      ctx.setLineDash([]);
    }
    // Preview
    if (FOG.tool === 'parede' && FOG.wallStart && FOG.wallPreview) {
      ctx.strokeStyle = 'rgba(230,126,34,0.5)';
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(FOG.wallStart.x, FOG.wallStart.y);
      ctx.lineTo(FOG.wallPreview.x, FOG.wallPreview.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

// Chamado FORA do transform (espaço de tela) — desenha a escuridão
function fogRenderScreen(ctx) {
  if (!FOG.enabled) return;
  const cvs = MAP.canvas;
  const W = cvs.width, H = cvs.height;
  const { zoom, offX, offY, gridSize } = MAP;

  if (!FOG._fogCvs) FOG._fogCvs = document.createElement('canvas');
  const fc = FOG._fogCvs;
  if (fc.width !== W || fc.height !== H) { fc.width = W; fc.height = H; }
  const fctx = fc.getContext('2d');

  fctx.globalCompositeOperation = 'source-over';
  fctx.clearRect(0, 0, W, H);
  fctx.fillStyle = '#000';
  fctx.fillRect(0, 0, W, H);

  // Apaga áreas visíveis (composição destination-out)
  fctx.globalCompositeOperation = 'destination-out';
  const w2s = (wx, wy) => [wx * zoom + offX, wy * zoom + offY];

  if (FOG.modo === 'manual') {
    // Células reveladas manualmente — apagadas por completo
    fctx.globalAlpha = 1;
    FOG.cells.forEach(key => {
      const [gx, gy] = key.split(',').map(Number);
      const [sx, sy] = w2s(gx * gridSize, gy * gridSize);
      fctx.fillRect(sx - 0.5, sy - 0.5, gridSize * zoom + 1, gridSize * zoom + 1);
    });
  } else {
    // Modo visão: memória de exploração (penumbra) + LOS atual (claro)
    fctx.globalAlpha = 0.55;
    FOG.cells.forEach(key => {
      const [gx, gy] = key.split(',').map(Number);
      const [sx, sy] = w2s(gx * gridSize, gy * gridSize);
      fctx.fillRect(sx - 0.5, sy - 0.5, gridSize * zoom + 1, gridSize * zoom + 1);
    });
    fctx.globalAlpha = 1;
    const R = FOG.raio * gridSize;
    _tokensComVisao().forEach(t => {
      const cx = t.x + gridSize / 2, cy = t.y + gridSize / 2;
      const poly = fogVisPoly(cx, cy, R);
      if (poly.length < 3) return;
      fctx.beginPath();
      const [p0x, p0y] = w2s(poly[0][0], poly[0][1]);
      fctx.moveTo(p0x, p0y);
      for (let i = 1; i < poly.length; i++) {
        const [px, py] = w2s(poly[i][0], poly[i][1]);
        fctx.lineTo(px, py);
      }
      fctx.closePath();
      fctx.fill();
    });
    // Atualiza memória de exploração (no máx. 1x/segundo)
    const agora = Date.now();
    if (agora - FOG._lastExplore > 1000) {
      FOG._lastExplore = agora;
      fogAtualizarExploracao();
    }
  }
  fctx.globalAlpha = 1;
  fctx.globalCompositeOperation = 'source-over';

  // Aplica no canvas principal: mestre enxerga através (translúcido)
  ctx.save();
  if (isMaster) {
    // Tom azulado para o mestre — visível mesmo sobre mapas escuros
    ctx.globalAlpha = 0.55;
    ctx.drawImage(fc, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = 1;
    // Tinge a névoa (usa o próprio fog canvas como máscara)
    const tc = FOG._tintCvs || (FOG._tintCvs = document.createElement('canvas'));
    if (tc.width !== W || tc.height !== H) { tc.width = W; tc.height = H; }
    const tctx = tc.getContext('2d');
    tctx.clearRect(0, 0, W, H);
    tctx.drawImage(fc, 0, 0);
    tctx.globalCompositeOperation = 'source-in';
    tctx.fillStyle = 'rgba(60, 90, 160, 0.35)';
    tctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.9;
    ctx.drawImage(tc, 0, 0);
  } else {
    ctx.globalAlpha = 1;
    ctx.drawImage(fc, 0, 0);
  }
  ctx.restore();

  // Badge no canto: confirma que o fog está ativo
  ctx.save();
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  const txt = isMaster ? '🌫 FOG ATIVO (visão do mestre)' : '🌫 FOG';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(4, 4, (ctx.measureText(txt)?.width || 150) + 12, 18);
  ctx.fillStyle = 'rgba(201,168,76,0.95)';
  ctx.fillText(txt, 10, 8);
  ctx.restore();
}

// Marca como exploradas as células dentro da visão atual dos PCs
function fogAtualizarExploracao() {
  if (FOG.modo !== 'visao') return;
  const gs = MAP.gridSize;
  const R = FOG.raio * gs;
  let mudou = false;
  _tokensComVisao().forEach(t => {
    const cx = t.x + gs / 2, cy = t.y + gs / 2;
    const poly = fogVisPoly(cx, cy, R);
    if (poly.length < 3) return;
    const g0x = Math.floor((cx - R) / gs), g1x = Math.ceil((cx + R) / gs);
    const g0y = Math.floor((cy - R) / gs), g1y = Math.ceil((cy + R) / gs);
    for (let gx = g0x; gx <= g1x; gx++) {
      for (let gy = g0y; gy <= g1y; gy++) {
        const key = gx + ',' + gy;
        if (FOG.cells.has(key)) continue;
        if (_pontoNoPoly(gx * gs + gs / 2, gy * gs + gs / 2, poly)) {
          FOG.cells.add(key); mudou = true;
        }
      }
    }
  });
  // Só o mestre persiste a exploração (evita corrida de escrita)
  if (mudou && isMaster) { mapaSalvarDB(); fogBroadcast(800); }
}

// ── FERRAMENTAS DO MESTRE (mouse) ────────────────
// Retornam true se consumiram o evento
function _snap(w) {
  const g = MAP.gridSize / 2;
  return { x: Math.round(w.x / g) * g, y: Math.round(w.y / g) * g };
}

function fogToolMouseDown(e, w) {
  if (!isMaster || !FOG.tool) return false;

  if (FOG.tool === 'revelar' || FOG.tool === 'ocultar') {
    if (e.shiftKey) {
      // Shift+arrasto = seleção retangular
      FOG.rectPaint = { sx: w.x, sy: w.y, ex: w.x, ey: w.y };
      return true;
    }
    FOG._painting = true;
    fogPintar(w);
    return true;
  }
  if (FOG.tool === 'parede') {
    const p = _snap(w);
    if (!FOG.wallStart) {
      FOG.wallStart = p;
    } else {
      if (Math.hypot(p.x - FOG.wallStart.x, p.y - FOG.wallStart.y) > 4) {
        FOG.paredes.push({ x1: FOG.wallStart.x, y1: FOG.wallStart.y, x2: p.x, y2: p.y });
        mapaSalvarDB(); fogBroadcast();
      }
      // Encadeia: próxima parede começa onde esta terminou
      FOG.wallStart = p;
    }
    mapaDraw();
    return true;
  }
  if (FOG.tool === 'apagar-parede') {
    const limiar = 10 / MAP.zoom;
    const idx = FOG.paredes.findIndex(p => _distPontoSeg(w.x, w.y, p.x1, p.y1, p.x2, p.y2) < limiar);
    if (idx >= 0) {
      FOG.paredes.splice(idx, 1);
      mapaSalvarDB(); fogBroadcast();
      mapaDraw();
      toast('Parede removida.', 'ok');
    }
    return true;
  }
  return false;
}

function fogToolMouseMove(e, w) {
  if (!isMaster || !FOG.tool) return false;
  if (FOG.rectPaint) { FOG.rectPaint.ex = w.x; FOG.rectPaint.ey = w.y; mapaDraw(); return true; }
  if (FOG._painting) { fogPintar(w); return true; }
  if (FOG.tool === 'parede' && FOG.wallStart) {
    FOG.wallPreview = _snap(w);
    mapaDraw();
    return true;
  }
  return FOG.tool !== null; // consome movimento para não iniciar pan/seleção
}

function fogToolMouseUp() {
  if (!isMaster || !FOG.tool) return false;
  if (FOG.rectPaint) { fogAplicarRetangulo(); return true; }
  if (FOG._painting) {
    FOG._painting = false;
    mapaSalvarDB(); fogBroadcast();
    return true;
  }
  return FOG.tool !== null;
}

function fogPintar(w) {
  const gs = MAP.gridSize;
  const gcx = Math.floor(w.x / gs), gcy = Math.floor(w.y / gs);
  const r = FOG.brush;
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      if (FOG.brushShape === 'circulo' && dx * dx + dy * dy > r * r + 0.5) continue;
      const key = (gcx + dx) + ',' + (gcy + dy);
      if (FOG.tool === 'revelar') FOG.cells.add(key);
      else FOG.cells.delete(key);
    }
  }
  mapaDraw();
}

// Aplica revelar/ocultar em todas as células dentro do retângulo
function fogAplicarRetangulo() {
  const r = FOG.rectPaint;
  if (!r) return;
  const gs = MAP.gridSize;
  const gx0 = Math.floor(Math.min(r.sx, r.ex) / gs), gx1 = Math.floor(Math.max(r.sx, r.ex) / gs);
  const gy0 = Math.floor(Math.min(r.sy, r.ey) / gs), gy1 = Math.floor(Math.max(r.sy, r.ey) / gs);
  for (let gx = gx0; gx <= gx1; gx++) {
    for (let gy = gy0; gy <= gy1; gy++) {
      const key = gx + ',' + gy;
      if (FOG.tool === 'revelar') FOG.cells.add(key);
      else FOG.cells.delete(key);
    }
  }
  FOG.rectPaint = null;
  mapaDraw(); mapaSalvarDB(); fogBroadcast();
}

// ── AÇÕES DA TOOLBAR ─────────────────────────────
function fogToggle() {
  FOG.enabled = !FOG.enabled;
  if (!FOG.enabled) fogSetTool(null);
  fogSyncUI(); mapaDraw(); mapaSalvarDB(); fogBroadcast();
  toast(FOG.enabled ? 'Fog of War ATIVADO' : 'Fog of War desativado', 'ok');
}

function fogSetModo(m) {
  FOG.modo = m;
  fogSyncUI(); mapaDraw(); mapaSalvarDB(); fogBroadcast();
}

function fogSetTool(t) {
  FOG.tool = FOG.tool === t ? null : t;
  FOG.wallStart = null; FOG.wallPreview = null; FOG._painting = false;
  // Desativa régua se estiver ligada (conflito de clique)
  if (FOG.tool && MAP.rulerType) { MAP.rulerType = null; MAP.rulerStart = null; MAP.rulerEnd = null; }
  fogSyncUI(); mapaDraw();
  const nomes = { revelar: '🔦 Pincel Revelar', ocultar: '🌑 Pincel Ocultar', parede: '🧱 Desenhar Paredes (clique para encadear, ESC para soltar)', 'apagar-parede': '🚫 Apagar Paredes' };
  if (FOG.tool) toast(nomes[FOG.tool], 'ok');
}

function fogSetRaio(v) {
  FOG.raio = Math.max(2, Math.min(30, parseInt(v) || 8));
  mapaDraw(); mapaSalvarDB(); fogBroadcast();
}

function fogRevelarTudo() {
  if (!confirm('Revelar o mapa inteiro?')) return;
  // Revela uma área generosa em volta do conteúdo atual
  const gs = MAP.gridSize;
  const w = MAP.img ? MAP.img.width : 3000, h = MAP.img ? MAP.img.height : 3000;
  for (let gx = -2; gx <= Math.ceil(w / gs) + 2; gx++)
    for (let gy = -2; gy <= Math.ceil(h / gs) + 2; gy++)
      FOG.cells.add(gx + ',' + gy);
  mapaDraw(); mapaSalvarDB(); fogBroadcast();
}

function fogCobrirTudo() {
  if (!confirm('Cobrir tudo com névoa novamente? (apaga a exploração)')) return;
  FOG.cells = new Set();
  mapaDraw(); mapaSalvarDB(); fogBroadcast();
}

function fogApagarParedes() {
  if (!confirm('Apagar TODAS as paredes?')) return;
  FOG.paredes = [];
  mapaDraw(); mapaSalvarDB(); fogBroadcast();
}


function fogSetBrush(v) { FOG.brush = Math.max(0, Math.min(6, parseInt(v))); }
function fogToggleForma() {
  FOG.brushShape = FOG.brushShape === 'circulo' ? 'quadrado' : 'circulo';
  fogSyncUI();
  toast(FOG.brushShape === 'circulo' ? 'Pincel: ⚪ circular' : 'Pincel: ⬛ quadrado', 'ok');
}

function fogSyncUI() {
  const on = document.getElementById('btn-fog-toggle');
  if (on) {
    on.style.color = FOG.enabled ? 'var(--gold)' : '';
    on.style.borderColor = FOG.enabled ? 'var(--gold)' : '';
  }
  const modo = document.getElementById('fog-modo-sel');
  if (modo) modo.value = FOG.modo;
  const raio = document.getElementById('fog-raio-val');
  if (raio) raio.value = FOG.raio;
  const grupo = document.getElementById('fog-tools');
  if (grupo) grupo.style.display = FOG.enabled ? 'flex' : 'none';
  const forma = document.getElementById('btn-fog-forma');
  if (forma) forma.textContent = FOG.brushShape === 'circulo' ? '⚪' : '⬛';
  const tam = document.getElementById('fog-brush-sel');
  if (tam) tam.value = String(FOG.brush);
  ['revelar', 'ocultar', 'parede', 'apagar-parede'].forEach(t => {
    const b = document.getElementById('btn-fog-' + t);
    if (b) {
      b.style.color = FOG.tool === t ? 'var(--gold)' : '';
      b.style.borderColor = FOG.tool === t ? 'var(--gold)' : '';
    }
  });
}

// ESC solta a corrente de paredes / desativa ferramenta
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && FOG.tool) {
    if (FOG.rectPaint) { FOG.rectPaint = null; mapaDraw(); return; }
    if (FOG.wallStart) { FOG.wallStart = null; FOG.wallPreview = null; mapaDraw(); }
    else fogSetTool(FOG.tool); // toggle off
  }
});

console.log('%cfog.js carregado \u2713', 'color:#c9a84c;font-weight:bold');

// ── SYNC AO VIVO (Broadcast — independente do banco) ─────────
// O estado do fog viaja por um canal realtime direto. Assim os players
// recebem a névoa/paredes na hora, mesmo se a persistência falhar.
FOG._chan = null;
FOG._bcTimer = null;

function fogInitSync() {
  if (FOG._chan || typeof db === 'undefined') return;
  FOG._chan = db.channel('fog-live', { config: { broadcast: { self: false } } });
  FOG._chan
    .on('broadcast', { event: 'fog' }, ({ payload }) => {
      if (!payload) return;
      console.log('fog-live: estado recebido', payload.fog?.enabled ? '(ATIVO)' : '(inativo)');
      fogImport(payload.fog, payload.paredes);
      mapaDraw();
    })
    .on('broadcast', { event: 'fog_request' }, () => {
      // Um player entrou e pediu o estado atual — só o mestre responde
      if (isMaster) fogBroadcast(0);
    })
    .subscribe(status => {
      console.log('fog-live status:', status);
      if (status === 'SUBSCRIBED' && !isMaster) {
        // Player conectou: pede o estado atual ao mestre
        FOG._chan.send({ type: 'broadcast', event: 'fog_request', payload: {} });
      }
    });
}

function fogBroadcast(delay = 300) {
  if (!isMaster || !FOG._chan) return;
  clearTimeout(FOG._bcTimer);
  FOG._bcTimer = setTimeout(() => {
    FOG._chan.send({
      type: 'broadcast',
      event: 'fog',
      payload: { fog: fogExport(), paredes: FOG.paredes }
    });
  }, delay);
}
