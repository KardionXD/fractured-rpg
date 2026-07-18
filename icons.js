// ══════════════════════════════════════════════════
//  ÍCONES FRACTURED — biblioteca SVG própria da marca
//  Fonte: design "Fractured RPG.dc.html" seção 8a.
//  Traço 2px, grid 24×24 (caveira 48×48), currentColor
//  por padrão para herdar a cor do elemento pai —
//  passe `color` só quando o ícone precisa ficar fixo
//  (ex.: logo, coroa do mestre).
// ══════════════════════════════════════════════════

const FRACTURED_ICON_PATHS = {
  logo: '<path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z"></path><path d="M12 2.5 L12 8.2 M12 21.5 L12 15.8 M2.5 12 L8.2 12 M21.5 12 L15.8 12" stroke-width="1.5" opacity="0.85"></path><path d="M12 8.2 L15.8 12 L12 15.8 L8.2 12 Z" stroke-width="1.8" fill="rgba(217,180,91,.12)"></path>',
  d20: '<path d="M12 2 L20.7 7 L20.7 17 L12 22 L3.3 17 L3.3 7 Z"></path><path d="M12 6.8 L16.5 14.6 L7.5 14.6 Z" stroke-width="1.6"></path><path d="M12 2 L12 6.8 M20.7 7 L16.5 14.6 M3.3 7 L7.5 14.6 M12 22 L16.5 14.6 M12 22 L7.5 14.6" stroke-width="1.3" opacity="0.75"></path><text x="12" y="12.9" text-anchor="middle" font-size="4.6" font-family="Inter,sans-serif" font-weight="700" fill="#d9b45b" stroke="none">20</text>',
  mapa: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"></rect><path d="M9.2 3.5 L9.2 20.5 M14.8 3.5 L14.8 20.5 M3.5 9.2 L20.5 9.2 M3.5 14.8 L20.5 14.8" stroke-width="1.1" opacity="0.55"></path><path d="M12 7.5 C10.2 7.5 8.9 8.8 8.9 10.5 C8.9 12.7 12 15.8 12 15.8 C12 15.8 15.1 12.7 15.1 10.5 C15.1 8.8 13.8 7.5 12 7.5 Z" stroke="#d9b45b" stroke-width="1.8"></path>',
  ficha: '<path d="M6 2.5 L15 2.5 L19 6.5 L19 21.5 L6 21.5 Z"></path><path d="M15 2.5 L15 6.5 L19 6.5" stroke-width="1.6"></path><path d="M9 11 L16 11 M9 14.5 L16 14.5 M9 18 L13 18" stroke-width="1.4"></path>',
  chat: '<path d="M3.5 5 L20.5 5 L20.5 16.5 L10 16.5 L5.5 20.5 L5.5 16.5 L3.5 16.5 Z"></path><path d="M8 9.5 L16 9.5 M8 12.5 L13 12.5" stroke-width="1.4"></path>',
  notas: '<path d="M4.5 5.5 L12.5 5.5 M4.5 9.5 L10.5 9.5 M4.5 13.5 L8.5 13.5 M4.5 19.5 L19.5 19.5" stroke-width="1.6"></path><path d="M17.3 3.5 L20.5 6.7 L12.8 14.4 L9.2 15.2 L10 11.6 Z" stroke="#d9b45b" stroke-width="1.8"></path>',
  arquivos: '<path d="M3 6.5 L3 19.5 L21 19.5 L21 8.5 L11.5 8.5 L9.5 5.5 L4 5.5 C3.4 5.5 3 6 3 6.5 Z"></path>',
  item: '<path d="M5 8.5 L19 8.5 L19 20.5 L5 20.5 Z"></path><path d="M5 8.5 L7 3.5 L17 3.5 L19 8.5"></path><path d="M12 3.5 L12 8.5 M9.5 13 L14.5 13" stroke-width="1.6"></path>',
  musica: '<path d="M9 18.5 L9 5.5 L19 3.5 L19 16.5"></path><circle cx="6.5" cy="18.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle>',
  iniciativa: '<path d="M13 2 L5 13.5 L11 13.5 L9.5 22 L19 9.5 L12.5 9.5 Z"></path>',
  tensao: '<path d="M12 3 L22 20 L2 20 Z"></path><path d="M12 9 L12 14.5" stroke-width="2.2"></path><circle cx="12" cy="17.3" r="1.2" fill="#d9b45b" stroke="none"></circle>',
  suprimentos: '<path d="M5 8.5 L19 8.5 L19 20.5 L5 20.5 Z"></path><path d="M5 8.5 L7 3.5 L17 3.5 L19 8.5"></path><path d="M12 3.5 L12 8.5 M9.5 13 L14.5 13" stroke-width="1.6"></path>',
  humanidade: '<circle cx="12" cy="7" r="3.4"></circle><path d="M5 21 C5 17 8 14.6 12 14.6 C16 14.6 19 17 19 21"></path><path d="M12 21.2 C10.6 20.2 9.8 19.3 9.8 18.3 C9.8 17.4 10.5 16.8 11.2 16.8 C11.5 16.8 11.8 16.9 12 17.2 C12.2 16.9 12.5 16.8 12.8 16.8 C13.5 16.8 14.2 17.4 14.2 18.3 C14.2 19.3 13.4 20.2 12 21.2 Z" fill="#d9b45b" stroke="#d9b45b" stroke-width="1.2"></path>',
  combate: '<path d="M3 3 L5.8 3 L20 17.2 L20 20 L17.2 20 L3 5.8 Z" stroke-width="1.7"></path><path d="M21 3 L18.2 3 L4 17.2 L4 20 L6.8 20 L21 5.8 Z" stroke-width="1.7"></path><path d="M12 6.5 L17 8.3 L17 12 C17 15.2 15 17.4 12 18.8 C9 17.4 7 15.2 7 12 L7 8.3 Z" fill="#101016" stroke="#a78bfa" stroke-width="2"></path><path d="M12 6.5 L12 18.8 M7.4 12.4 L16.6 12.4" stroke="#a78bfa" stroke-width="1.4" opacity="0.8"></path>',
  nevoa: '<path d="M4 9 C4 6 6.5 4 9.5 4 C12 4 14 5.5 14.7 7.5 C15.2 7.2 15.8 7 16.5 7 C18.7 7 20.5 8.8 20.5 11 C20.5 13.2 18.7 15 16.5 15 L6 15"></path><path d="M4 18.5 L14 18.5 M9 21.5 L19 21.5" stroke-width="1.5" stroke-dasharray="3 2.5"></path>',
  mestre: '<path d="M4 17 L4 7 L8.5 11 L12 5.5 L15.5 11 L20 7 L20 17 Z"></path><path d="M4 20 L20 20" stroke-width="2.2"></path>',
  players: '<circle cx="9" cy="9" r="3.5"></circle><path d="M3 20 C3 16.5 5.6 14.5 9 14.5 C12.4 14.5 15 16.5 15 20"></path><circle cx="16.5" cy="10" r="2.6" stroke-width="1.6"></circle><path d="M15.5 14.8 C18.6 14.8 21 16.6 21 19.5" stroke-width="1.6"></path>',
  vida: '<path d="M12 20.5 C7 16.5 3.5 13 3.5 9 C3.5 6 5.8 4 8.2 4 C9.8 4 11.2 4.8 12 6 C12.8 4.8 14.2 4 15.8 4 C18.2 4 20.5 6 20.5 9 C20.5 13 17 16.5 12 20.5 Z"></path><path d="M7 11 L10 11 L11.2 8.5 L13 13.5 L14.2 11 L17 11" stroke-width="1.5"></path>',

  npcAliado: '<path d="M12 2.5 L19.5 5 L19.5 11 C19.5 16 16.4 19.4 12 21.5 C7.6 19.4 4.5 16 4.5 11 L4.5 5 Z"></path><path d="M8.7 11.6 L11 14 L15.3 9.4" stroke="#d9b45b" stroke-width="2"></path>',
  npcNeutro: '<circle cx="12" cy="8" r="4.2"></circle><path d="M4.5 20.5 C4.5 16.7 7.7 14.4 12 14.4 C16.3 14.4 19.5 16.7 19.5 20.5"></path><path d="M9.5 18 L14.5 18" stroke-width="1.7"></path>',
  npcAnimal: '<path d="M12 11.5 C9.2 11.5 7 13.7 7 16.2 C7 18.4 8.6 20 10.4 20 C11 20 11.5 19.8 12 19.6 C12.5 19.8 13 20 13.6 20 C15.4 20 17 18.4 17 16.2 C17 13.7 14.8 11.5 12 11.5 Z"></path><circle cx="6" cy="9.5" r="1.9" stroke-width="1.7"></circle><circle cx="10" cy="6.5" r="1.9" stroke-width="1.7"></circle><circle cx="14" cy="6.5" r="1.9" stroke-width="1.7"></circle><circle cx="18" cy="9.5" r="1.9" stroke-width="1.7"></circle>',

  temaPapiro: '<path d="M6.5 6 C6.5 4.6 5.4 3.5 4 3.5 L17.5 3.5 C18.9 3.5 20 4.6 20 6 L20 6.5 L16.5 6.5"></path><path d="M6.5 6 L6.5 18 C6.5 19.4 5.4 20.5 4 20.5 L17.5 20.5 C18.9 20.5 20 19.4 20 18 L20 17.5 L16.5 17.5"></path><path d="M10 10 L16 10 M10 13.5 L14.5 13.5" stroke-width="1.4"></path>',
  temaCyberpunk: '<rect x="7" y="7" width="10" height="10" rx="1.5"></rect><rect x="10.4" y="10.4" width="3.2" height="3.2" stroke="#d9b45b" stroke-width="1.6"></rect><path d="M9.5 7 L9.5 3.5 M14.5 7 L14.5 3.5 M9.5 20.5 L9.5 17 M14.5 20.5 L14.5 17 M7 9.5 L3.5 9.5 M7 14.5 L3.5 14.5 M20.5 9.5 L17 9.5 M20.5 14.5 L17 14.5" stroke-width="1.5"></path>',
  temaMedieval: '<path d="M5 21 L5 5 L8 5 L8 7.5 L10.5 7.5 L10.5 5 L13.5 5 L13.5 7.5 L16 7.5 L16 5 L19 5 L19 21"></path><path d="M3.5 21 L20.5 21" stroke-width="2.2"></path><path d="M10.2 21 L10.2 16 C10.2 14.9 11 14 12 14 C13 14 13.8 14.9 13.8 16 L13.8 21" stroke-width="1.7"></path>',
  temaTerror: '<path d="M8.5 11 L15.5 11 L15.5 20.5 L8.5 20.5 Z"></path><path d="M12 3 C13.3 4.9 14.1 6.1 14.1 7.4 C14.1 8.8 13.2 9.8 12 9.8 C10.8 9.8 9.9 8.8 9.9 7.4 C9.9 6.1 10.7 4.9 12 3 Z" stroke="#d9b45b" stroke-width="1.8"></path><path d="M12 9.8 L12 11" stroke-width="1.5"></path>',
};

// Cor padrão de cada ícone quando usado isolado (fora de nav/botão que já define `color`)
const FRACTURED_ICON_DEFAULT_COLOR = {
  logo: '#d9b45b', arquivos: '#d9b45b', musica: '#d9b45b', tensao: '#d9b45b',
  suprimentos: '#d9b45b', combate: '#d9b45b', mestre: '#d9b45b',
  temaPapiro: '#d9b45b', temaMedieval: '#d9b45b',
  neutro: '#8b8a99', npcNeutro: '#8b8a99',
};

// Caveira "NPC · inimigo" — viewBox 48×48, gradientes próprios
const FRACTURED_ICON_SKULL = `<defs>
  <radialGradient id="fracSkullBone" cx="50%" cy="32%" r="75%"><stop offset="0%" stop-color="#e84850"></stop><stop offset="45%" stop-color="#b8232e"></stop><stop offset="100%" stop-color="#5a0a10"></stop></radialGradient>
  <radialGradient id="fracSkullEye" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="#ff6a3d"></stop><stop offset="35%" stop-color="#c41a1a"></stop><stop offset="100%" stop-color="#12040a"></stop></radialGradient>
</defs>
<path d="M24 3.5 C14 3.5 7.5 10.5 7.5 19.5 C7.5 24.5 9.6 28.4 12.8 30.9 L13.2 35.5 C13.3 36.8 14.3 37.8 15.6 37.8 L17 37.8 L17 41.5 C17 42.6 17.9 43.5 19 43.5 L29 43.5 C30.1 43.5 31 42.6 31 41.5 L31 37.8 L32.4 37.8 C33.7 37.8 34.7 36.8 34.8 35.5 L35.2 30.9 C38.4 28.4 40.5 24.5 40.5 19.5 C40.5 10.5 34 3.5 24 3.5 Z" fill="url(#fracSkullBone)" stroke="#3a060c" stroke-width="1.6"></path>
<path d="M10 17 C10.5 11 14.5 6.5 20 5.4 C13.5 8.5 11.5 13.5 11.8 19.8 C11.9 22.6 12.8 25 14.3 27 C11.6 24.8 10 21.4 10 17 Z" fill="#5a0a10" opacity="0.55"></path>
<path d="M24 3.8 L22.6 8 L25 11.4 L23 15" stroke="#3a060c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
<path d="M34 8.5 L31.5 11 L33 13.8" stroke="#3a060c" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8"></path>
<path d="M11.5 19.5 C11.5 16.6 13.6 15 16.2 15 C18.9 15 20.8 17 20.6 19.8 C20.4 22.4 18.6 24.2 16 24.2 C13.4 24.2 11.5 22.3 11.5 19.5 Z" fill="url(#fracSkullEye)" stroke="#2a040a" stroke-width="1.3"></path>
<path d="M36.5 19.5 C36.5 16.6 34.4 15 31.8 15 C29.1 15 27.2 17 27.4 19.8 C27.6 22.4 29.4 24.2 32 24.2 C34.6 24.2 36.5 22.3 36.5 19.5 Z" fill="url(#fracSkullEye)" stroke="#2a040a" stroke-width="1.3"></path>
<circle cx="16.6" cy="19.9" r="1.3" fill="#ffb03d"></circle>
<circle cx="31.4" cy="19.9" r="1.3" fill="#ffb03d"></circle>
<path d="M24 22.5 L21.4 28.6 C21.2 29.2 21.6 29.8 22.2 29.8 L25.8 29.8 C26.4 29.8 26.8 29.2 26.6 28.6 Z" fill="#1c0308" stroke="#2a040a" stroke-width="1"></path>
<path d="M15.5 33.2 L32.5 33.2" stroke="#3a060c" stroke-width="1.4" stroke-linecap="round"></path>
<path d="M18.2 33.2 L18.6 37.4 M21.4 33.2 L21.2 38.6 M24.4 33.2 L24.6 38 M27.6 33.2 L27.2 38.6 M30.2 33.2 L30.6 37" stroke="#f2d8c8" stroke-width="2.1" stroke-linecap="round"></path>
<path d="M19.8 43.5 L19.8 40.8 M23 43.5 L23 40.2 M26.2 43.5 L26.2 40.8 M29 43.5 L29 41" stroke="#e8c4b0" stroke-width="1.9" stroke-linecap="round"></path>
<path d="M31 36 L34.5 39.5 M32.8 35.8 L34.2 34.2" stroke="#3a060c" stroke-width="1.1" stroke-linecap="round"></path>`;

/**
 * Retorna o markup <svg> de um ícone da marca Fractured.
 * @param {string} name  chave em FRACTURED_ICON_PATHS (ou 'npcInimigo' p/ caveira)
 * @param {object} opts  { size, color, style }
 */
function fracIcon(name, opts) {
  opts = opts || {};
  const size = opts.size || 18;
  const color = opts.color || FRACTURED_ICON_DEFAULT_COLOR[name] || 'currentColor';
  const style = opts.style || '';
  if (name === 'npcInimigo') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" style="flex-shrink:0;vertical-align:middle;${style}">${FRACTURED_ICON_SKULL}</svg>`;
  }
  const inner = FRACTURED_ICON_PATHS[name];
  if (!inner) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;${style}">${inner}</svg>`;
}

// Usa o ícone da marca se existir; senão cai de volta pro emoji (ex.: Bestiário, Fotos —
// ainda não têm ícone próprio no design). Facilita listas mistas sem `if` repetido.
function fracIconOr(name, emojiFallback, opts) {
  if (name === 'npcInimigo' || FRACTURED_ICON_PATHS[name]) return fracIcon(name, opts);
  return emojiFallback;
}
