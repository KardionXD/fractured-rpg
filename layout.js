// ══════════════════════════════════════════════════
//  FRACTURED — layout.js
//  Sistema de painéis redimensionáveis
// ══════════════════════════════════════════════════

let layoutMode = false;
let resizing = null;
let resizeStart = null;

// Widths em pixels das colunas (feed, dados, combate, mapa=restante)
const DEFAULT_COLS = { feed: 260, dados: 240, combate: 270 };
let colWidths = { ...DEFAULT_COLS };

function initLayout() {
  loadLayoutPrefs();
  applyColWidths();
  criarResizeHandles();
}

function toggleLayoutMode() {
  layoutMode = !layoutMode;
  const btn = document.getElementById('btn-layout');
  if (btn) {
    btn.textContent = layoutMode ? '🔒 Travar Layout' : '✏️ Ajustar Layout';
    btn.style.color = layoutMode ? 'var(--gold)' : '';
    btn.style.borderColor = layoutMode ? 'var(--gold)' : '';
  }
  document.querySelectorAll('.resize-handle').forEach(h => {
    h.style.display = layoutMode ? 'flex' : 'none';
  });
  if (!layoutMode) saveLayoutPrefs();
}

function criarResizeHandles() {
  const colunas = [
    { after: 'sala-col-feed',    id: 'rh-feed' },
    { after: 'sala-col-dados',   id: 'rh-dados' },
    { after: 'sala-col-combate', id: 'rh-combate' },
  ];

  colunas.forEach(({ after, id }) => {
    const col = document.getElementById(after);
    if (!col) return;
    if (document.getElementById(id)) return;

    const handle = document.createElement('div');
    handle.id = id;
    handle.className = 'resize-handle';
    handle.style.display = 'none';
    handle.innerHTML = '⠿';
    handle.dataset.col = after;

    handle.addEventListener('mousedown', e => {
      if (!layoutMode) return;
      e.preventDefault();
      resizing = after;
      resizeStart = { x: e.clientX, width: colWidths[colKey(after)] };
      document.addEventListener('mousemove', onResizeMove);
      document.addEventListener('mouseup', onResizeUp);
    });

    col.parentNode.insertBefore(handle, col.nextSibling);
  });
}

function colKey(colId) {
  return { 'sala-col-feed': 'feed', 'sala-col-dados': 'dados', 'sala-col-combate': 'combate' }[colId];
}

function onResizeMove(e) {
  if (!resizing) return;
  const delta = e.clientX - resizeStart.x;
  const key = colKey(resizing);
  colWidths[key] = Math.max(160, Math.min(500, resizeStart.width + delta));
  applyColWidths();
}

function onResizeUp() {
  resizing = null; resizeStart = null;
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeUp);
  saveLayoutPrefs();
}

function applyColWidths() {
  const unified = document.querySelector('.sala-unified');
  if (!unified) return;

  if (window.innerWidth <= 900) return; // mobile usa abas

  const f = colWidths.feed, d = colWidths.dados, c = colWidths.combate;
  unified.style.gridTemplateColumns = `${f}px ${d}px ${c}px 1fr`;

  // Reposiciona handles
  document.querySelectorAll('.resize-handle').forEach(h => {
    const col = document.getElementById(h.dataset.col);
    if (col) {
      const rect = col.getBoundingClientRect();
      h.style.left = (rect.right - 6) + 'px';
    }
  });
}

function saveLayoutPrefs() {
  try { localStorage.setItem('fractured_layout', JSON.stringify(colWidths)); } catch(e) {}
}

function loadLayoutPrefs() {
  try {
    const saved = localStorage.getItem('fractured_layout');
    if (saved) colWidths = { ...DEFAULT_COLS, ...JSON.parse(saved) };
  } catch(e) {}
}

function resetLayout() {
  colWidths = { ...DEFAULT_COLS };
  applyColWidths();
  saveLayoutPrefs();
  toast('Layout resetado!', 'ok');
}

// Adiciona CSS dos handles
const handleStyle = document.createElement('style');
handleStyle.textContent = `
.resize-handle {
  position: fixed;
  top: 56px;
  bottom: 0;
  width: 12px;
  background: rgba(201,168,76,.15);
  border: 1px solid rgba(201,168,76,.4);
  border-radius: 4px;
  cursor: col-resize;
  z-index: 100;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--gold);
  user-select: none;
  writing-mode: vertical-rl;
}
.resize-handle:hover {
  background: rgba(201,168,76,.3);
}
`;
document.head.appendChild(handleStyle);

// Inicializa quando a sala abrir
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initLayout, 200);
});
