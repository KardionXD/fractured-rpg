// ══════════════════════════════════════════════════════════════════
//  FRACTURED — REGRAS E CÁLCULOS
//
//  Antes deste arquivo, `PV = RES × 4` estava copiado em 11 lugares
//  (app.js ×4, combate.js ×5, npcs.js ×2) e `mod = valor − 3` em 10.
//  Uma correção de regra exigia caçar todas as cópias, e a chance de
//  esquecer uma era alta — foi assim que a dificuldade da rolagem
//  passou a ler um campo que não existia.
//
//  Daqui para frente cada fórmula do Fractured existe UMA vez, aqui.
//  O resto do projeto não conhece nenhuma delas: ele pergunta ao
//  sistema da mesa (ver nucleo/registro.js).
//
//  Referências: Livro Base v4 — Cap. 02 (atributos), Cap. 05 (PV,
//  iniciativa), Cap. 04 (perícias).
// ══════════════════════════════════════════════════════════════════

// ── MODIFICADOR DE ATRIBUTO ───────────────────────────────────────
//  Atributo vai de 1 a 5; o bônus é o valor menos 3.
//  1 → −2 · 2 → −1 · 3 → ±0 · 4 → +1 · 5 → +2
function fracModificador(valor) {
  return (parseInt(valor, 10) || 0) - 3;
}

// ── PONTOS DE VIDA ────────────────────────────────────────────────
//  PV máximo = RESISTÊNCIA × 4, com piso 4 (ficha nova, sem atributos
//  distribuídos, não pode nascer com 0 PV e morrer ao abrir).
function fracPvMaximo(attr) {
  return Math.max((parseInt(attr?.res, 10) || 0) * 4, 4);
}

function fracPvTexto(attr) {
  const res = parseInt(attr?.res, 10) || 0;
  return `RES (${res}) × 4 = máx ${fracPvMaximo(attr)}`;
}

// ── PERÍCIAS ──────────────────────────────────────────────────────
//  1 da profissão + 1 por ponto positivo do modificador de
//  CONHECIMENTO. Um personagem com CON 3 (mod ±0) tem 2 perícias;
//  o mínimo é 2 para que ninguém fique com uma só.
function fracPericiasPermitidas(attr) {
  return 1 + Math.max(1, fracModificador(attr?.con));
}

// ── INICIATIVA ────────────────────────────────────────────────────
//  d20 + modificador de AGILIDADE (Cap. 05).
function fracIniciativa(attr) {
  return Math.floor(Math.random() * 20) + 1 + fracModificador(attr?.agi);
}

// ── SINAL ─────────────────────────────────────────────────────────
//  "+1", "−2", "±0" — o jeito como o livro escreve modificadores.
function fracSinal(n) {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0';
}
