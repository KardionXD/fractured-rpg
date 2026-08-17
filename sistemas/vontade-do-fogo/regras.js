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
  const base = 25 + (avdfModificador(attr?.cor) * 3) + avdfRank(attr).pv;
  //  Exaustão 4 corta o PV máximo pela metade. É a única coisa no
  //  sistema que mexe no teto de vida, e quem sabe disso é a tabela.
  return avdfEfeitosAtivos(attr?.estado).pvMaxMetade ? Math.floor(base / 2) : base;
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
function avdfDefesa(attr)      { return 10 + avdfModificador(attr?.cor) + avdfEfeitosAtivos(attr?.estado).defesa; }
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
function avdfPericiasPermitidas() { return PERICIAS_TREINADAS_NA_CRIACAO; }

//  Perícia não é caixinha marcada: é graduação. O bônus sai da tabela,
//  nunca de um número escrito na tela.
function avdfBonusPericia(grau) {
  return grauPericiaAvdf(grau).bonus;
}

//  Quanto custa subir uma perícia de onde ela está para o próximo grau,
//  e se o rank já permite. Devolve null quando não há próximo grau.
//  O custo é o do degrau, direto da tabela — nada de subtrair um total
//  do outro, porque "3 / +6 / +12" já são valores por degrau.
function avdfProximoGrauPericia(grauAtual, rankId) {
  const g = grauPericiaAvdf(grauAtual);
  const prox = GRAUS_PERICIA_AVDF.find(x => x.id === g.id + 1);
  if (!prox) return null;
  return {
    grau: prox,
    pt: prox.pt,
    permitido: avdfRankAlcanca(rankId, prox.rankMin),
    exige: prox.rankMin ? rankAvdf(prox.rankMin).nome : null,
  };
}

// ── COMPRAR COM PT ────────────────────────────────────────────────
//  Uma função só responde "quanto custa e posso?", para nenhuma tela
//  precisar saber a resposta. Devolve sempre a conta aberta: base,
//  modificadores e total.
function avdfCustoAtributo(deValor, rankId) {
  const alvo = (parseInt(deValor, 10) || 0) + 1;
  const teto = rankAvdf(rankId).attrMax;
  const pt = PT_CUSTOS_AVDF.atributo[alvo];
  if (pt == null) return { pode: false, porque: `Atributo +${alvo} não é comprável com PT.` };
  if (alvo > teto) return { pode: false, pt, porque: avdfLimiteAtributo(rankId).aviso };
  return { pode: true, pt, alvo };
}

//  Genjutsu de rank B ou superior exige Inton dominado — decisão do
//  autor a partir de "Inton é base de todo genjutsu". Os básicos (E, D,
//  C) continuam livres para qualquer um.
function avdfGenjutsuExigeInton(rankJutsu) {
  const ordem = JUTSU_RANKS_AVDF.map(j => j.id);
  const corte = ordem.indexOf(INTON_EXIGIDO_A_PARTIR_DE);
  const alvo  = ordem.indexOf(rankJutsu);
  return corte !== -1 && alvo !== -1 && alvo >= corte;
}

function avdfCustoJutsu(rankJutsu, ctx) {
  const trava = podeAprenderAvdf({ ...ctx, rankJutsu });
  const base = PT_CUSTOS_AVDF.jutsu[rankJutsu] ?? null;
  if (base == null) return { pode: false, porque: `Rank de jutsu desconhecido: ${rankJutsu}.` };
  const mods = descontosDeAprendizado(ctx);
  //  PISO DE 1 PT — SUPOSIÇÃO, NÃO REGRA DO LIVRO.
  //  Um jutsu rank E custa 1 PT e a natureza afim tira 1. O livro não
  //  diz se isso dá 0 (aprende de graça) ou continua em 1. Adotei 1
  //  porque "de graça" faria todo jutsu E da sua afinidade entrar sem
  //  custo nenhum — mas isto está anotado para o autor decidir, e o
  //  único lugar a mudar é esta linha.
  const total = Math.max(1, base + mods.reduce((a, m) => a + m.pt, 0));
  if (!trava.pode) return { pode: false, base, mods, total, porque: trava.porque };
  if (ctx?.rankPersonagem && !avdfJutsuPermitido(ctx.rankPersonagem, rankJutsu)) {
    return { pode: false, base, mods, total, porque: avdfLimiteJutsu(ctx.rankPersonagem).aviso };
  }
  return { pode: true, base, mods, total };
}

// ── O QUE O RANK PERMITE ──────────────────────────────────────────
//  "O sistema usa ranks como espinha dorsal: eles limitam atributos,
//  definem quanto chakra você tem e controlam quais técnicas estão ao
//  seu alcance." O rank não é uma etiqueta — é um teto, e a ficha
//  precisa dizer o teto em voz alta antes de o jogador bater nele.

const _ORDEM_RANK_AVDF = RANKS_AVDF.map(r => r.id);

function avdfRankAlcanca(rankId, rankMinimo) {
  if (!rankMinimo) return true;
  return _ORDEM_RANK_AVDF.indexOf(rankId || 'genin') >= _ORDEM_RANK_AVDF.indexOf(rankMinimo);
}

//  Teto de atributo. A mensagem sai pronta daqui para a ficha só
//  mostrar — sem frase montada dentro de nenhuma tela.
function avdfLimiteAtributo(rankId) {
  const r = rankAvdf(rankId);
  return {
    max: r.attrMax,
    aviso: `Seu Rank atual (${r.nome}) permite no máximo +${r.attrMax} neste atributo.`,
  };
}

//  Teto de rank de jutsu.
function avdfLimiteJutsu(rankId) {
  const r = rankAvdf(rankId);
  return {
    max: r.jutsuMax,
    aviso: `Seu Rank atual (${r.nome}) permite aprender técnicas até o rank ${r.jutsuMax}.`,
  };
}

function avdfJutsuPermitido(rankId, rankJutsu) {
  const ordem = JUTSU_RANKS_AVDF.map(j => j.id);
  const teto = ordem.indexOf(rankAvdf(rankId).jutsuMax);
  const alvo = ordem.indexOf(rankJutsu);
  return alvo === -1 || alvo <= teto;
}

// ── O QUE O ESTADO DO PERSONAGEM FAZ COM AS ROLAGENS ───────────────
//  Exaustão e condições não são anotação: elas mudam número. Esta é a
//  única função que sabe fazer essa conta, e é dela que a rolagem, a
//  Defesa e o PV máximo tiram o que aplicar.
//
//  `estado` é opcional em tudo. Sem ele, tudo devolve zero e o
//  comportamento é exatamente o de antes.
function avdfEfeitosAtivos(estado) {
  const fora = {
    testes: 0, defesa: 0,
    desvantagemAtaque: false, desvantagemVisao: false, desvantagemCOR: false,
    semChakra: false, semMovimentoLivre: false, pvMaxMetade: false,
    inconsciente: false, morte: false,
    porque: [],
  };
  if (!estado) return fora;

  const ex = exaustaoAvdf(estado.exaustao);
  if (ex && ex.n > 0) {
    fora.testes += ex.testes || 0;
    ['semMovimentoLivre', 'desvantagemAtaque', 'pvMaxMetade', 'inconsciente', 'morte']
      .forEach(k => { if (ex[k]) fora[k] = true; });
    fora.porque.push({ de: `Exaustão ${ex.n}`, testes: ex.testes || 0 });
  }

  const marcadas = new Set([
    ...(estado.condicoes || []),
    ...condicoesAutomaticasAvdf(estado),
  ]);
  marcadas.forEach(id => {
    const c = CONDICOES_AVDF.find(x => x.id === id);
    if (!c) return;
    if (c.defesa) fora.defesa += c.defesa;
    ['desvantagemAtaque', 'desvantagemVisao', 'desvantagemCOR', 'semChakra',
     'semMovimentoLivre', 'inconsciente'].forEach(k => { if (c[k]) fora[k] = true; });
    fora.porque.push({ de: c.nome, testes: 0, defesa: c.defesa || 0 });
  });

  return fora;
}

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
  //  Exaustão e condições entram aqui — não como lembrete na tela para
  //  o jogador baixar o número na mão. Sem `ctx.estado`, `efeitos` é
  //  tudo zero e a conta é a mesma de sempre.
  const efeitos = avdfEfeitosAtivos(ctx.estado);
  const desvantagem = !!ctx.desvantagem
    || (ctx.tipo === 'ataque' && efeitos.desvantagemAtaque)
    || (ctx.atributo === 'cor' && efeitos.desvantagemCOR)
    || (ctx.dependeDeVisao && efeitos.desvantagemVisao);

  const doisDados = !!(ctx.vantagem ^ desvantagem);       // uma cancela a outra
  return {
    dados: [{
      faces: ctx.faces ?? 20,
      qtd:   doisDados ? 2 : 1,
      manter: !doisDados ? 'todos' : (ctx.vantagem ? 'maior' : 'menor'),
    }],
    bonus: (ctx.modAtrib || 0) + (ctx.modPericia || 0) + (ctx.modCustom || 0)
         + efeitos.testes,
    //  Para a ficha poder mostrar \"−2 por Exaustão 2\" em vez de um
    //  número que apareceu do nada.
    origens: efeitos.porque,
  };
}
