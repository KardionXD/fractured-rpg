// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — REGRAS E CÁLCULOS
//
//  Todas as fórmulas do sistema, cada uma num lugar só. Os quatro
//  valores derivados foram conferidos contra as cinco fichas prontas
//  do Fast Play — se alguém mexer numa fórmula e errar, o teste que
//  compara com aquelas cinco fichas acusa.
//
//    Katsurō  COR+3 ESP+1 → Vida 34, Chakra 15, Defesa 13, Resil. 11
//    Hinaru   COR+1 ESP+3 → Vida 28, Chakra 21, Defesa 11, Resil. 13
//    Miyu     COR+2 ESP+3 → Vida 31, Chakra 21, Defesa 12, Resil. 13
//    Ren      COR+1 ESP+3 → Vida 28, Chakra 21, Defesa 11, Resil. 13
//    Tarou    COR+4 ESP+1 → Vida 37, Chakra 15, Defesa 14, Resil. 11
// ══════════════════════════════════════════════════════════════════

// ── MODIFICADOR ───────────────────────────────────────────────────
//  Aqui não há conta: o atributo JÁ é o bônus. Vai de −1 a +8, e um
//  Genin recém-formado distribui +4, +3, +2, +1, +1, 0.
//  (No Fractured o atributo vai de 1 a 5 e o bônus é valor − 3. São
//  duas escalas diferentes; misturar as duas é o erro clássico.)
function avdfModificador(valor) {
  return parseInt(valor, 10) || 0;
}

//  O rank do personagem. Enquanto a ficha não guardar o rank escolhido,
//  assume Genin — que é onde uma campanha padrão começa.
function avdfRank(attrOuFicha) {
  const id = attrOuFicha?.rank || attrOuFicha?.progressao || 'genin';
  return rankAvdf(id);
}

// ── VIDA ──────────────────────────────────────────────────────────
//  25 + (CORPO × 3) + bônus de rank.
function avdfVida(attr) {
  return 25 + (avdfModificador(attr?.cor) * 3) + avdfRank(attr).pv;
}
function avdfVidaTexto(attr) {
  const r = avdfRank(attr);
  return `25 + COR (${avdfModificador(attr?.cor)}) × 3 + ${r.nome} (${r.pv >= 0 ? '+' : ''}${r.pv}) = máx ${avdfVida(attr)}`;
}

// ── CHAKRA ────────────────────────────────────────────────────────
//  12 + (ESPÍRITO × 3) + bônus de rank. Cada técnica tem custo fixo;
//  sem PC, ela não pode nem ser tentada.
function avdfChakra(attr) {
  return 12 + (avdfModificador(attr?.esp) * 3) + avdfRank(attr).pc;
}
function avdfChakraTexto(attr) {
  const r = avdfRank(attr);
  return `12 + ESP (${avdfModificador(attr?.esp)}) × 3 + ${r.nome} (${r.pc >= 0 ? '+' : ''}${r.pc}) = máx ${avdfChakra(attr)}`;
}

// ── DEFESA E RESILIÊNCIA ──────────────────────────────────────────
//  Defesa é o alvo passivo de um ataque; Resiliência é o alvo de
//  genjutsu. Igualar já é acertar.
function avdfDefesa(attr)      { return 10 + avdfModificador(attr?.cor); }
function avdfResiliencia(attr) { return 10 + avdfModificador(attr?.esp); }

// ── INICIATIVA ────────────────────────────────────────────────────
//  d20 + CORPO, rolado UMA vez no começo do combate. A ordem vale até
//  o fim da luta — não se rola de novo a cada rodada.
function avdfIniciativa(attr) {
  return Math.floor(Math.random() * 20) + 1 + avdfModificador(attr?.cor);
}

// ── PERÍCIAS ──────────────────────────────────────────────────────
//  Três treinadas na criação, +2 cada. (O Fractured dá +3 e o número
//  depende do Mod de CONHECIMENTO — outra regra, outro sistema.)
function avdfPericiasPermitidas() { return 3; }

// ── LEITURA DO RESULTADO ──────────────────────────────────────────
//  Quatro faixas, e quase nenhuma rolagem termina em "nada acontece".
//  É a diferença mais visível para quem joga: no Fractured deu ou não
//  deu; aqui, errar por 2 e errar por 9 são coisas diferentes.
function avdfInterpretar(total, cd, dado) {
  if (dado === 20) return { chave: 'critico',  texto: '⭐ CRÍTICO — dobra os dados de dano', cor: 'var(--gold)' };
  if (dado === 1)  return { chave: 'desastre', texto: '💀 DESASTRE — falha com reviravolta', cor: 'var(--red)' };
  if (cd == null)  return null;                       // rolagem livre
  if (total >= cd + 5) return { chave: 'decisivo',      texto: '✦ SUCESSO DECISIVO',  cor: 'var(--gold)'  };
  if (total >= cd)     return { chave: 'sucesso',       texto: '✓ SUCESSO',           cor: 'var(--green)' };
  if (total >= cd - 4) return { chave: 'falha_proxima', texto: '≈ FALHA PRÓXIMA',     cor: '#e0a33c'      };
  return                      { chave: 'falha_grave',   texto: '✗ FALHA GRAVE',       cor: 'var(--red)'   };
}

// ── A ROLAGEM ─────────────────────────────────────────────────────
//  d20 + atributo + treino. Com Vantagem, rola DOIS d20 e fica com o
//  maior; com Desvantagem, com o menor. Não é um bônus — é uma mudança
//  no dado, e as duas se cancelam.
function avdfMontarRolagem(ctx) {
  const doisDados = !!(ctx.vantagem ^ ctx.desvantagem);   // uma cancela a outra
  return {
    dados: [{
      faces: ctx.faces ?? 20,
      qtd:   doisDados ? 2 : 1,
      manter: !doisDados ? 'todos' : (ctx.vantagem ? 'maior' : 'menor'),
    }],
    bonus: (ctx.modAtrib || 0) + (ctx.modPericia || 0) + (ctx.modCustom || 0),
  };
}
