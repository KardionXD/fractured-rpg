// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — A DECLARAÇÃO DO SISTEMA
//
//  Este arquivo é a resposta à pergunta que a arquitetura fazia: um
//  sistema completamente diferente cabe no mesmo contrato?
//
//  Cabe. Rank, Chakra, Vantagem, quatro graus de sucesso, zonas em vez
//  de metros, um medidor coletivo com outra regra — tudo isso está
//  aqui dentro, e NENHUM arquivo do núcleo precisou mudar por causa
//  deste sistema.
// ══════════════════════════════════════════════════════════════════

registrarSistema({
  id: 'vontade-do-fogo',
  nome: 'A VONTADE DO FOGO',
  resumo: 'Ninjas, chakra e vínculos. Você não vence sozinho — você se levanta por alguém.',
  cor: '#c0392b',
  dadoPadrao: 20,

  // ── ATRIBUTOS (Cap. 03) ─────────────────────────────────────────
  //  Seis, e nenhum é "o melhor": os três de ataque (TAI, NIN, GEN)
  //  são mutuamente exclusivos na prática — ninguém tem pontos para
  //  os três. Um personagem forte escolhe uma arma e duas fundações.
  atributos: [
    { id: 'tai', sigla: 'TAI', nome: 'Taijutsu',  min: -1, max: 8 },
    { id: 'nin', sigla: 'NIN', nome: 'Ninjutsu',  min: -1, max: 8 },
    { id: 'gen', sigla: 'GEN', nome: 'Genjutsu',  min: -1, max: 8 },
    { id: 'ctr', sigla: 'CTR', nome: 'Controle',  min: -1, max: 8 },
    { id: 'cor', sigla: 'COR', nome: 'Corpo',     min: -1, max: 8 },
    { id: 'esp', sigla: 'ESP', nome: 'Espírito',  min: -1, max: 8 },
  ],

  modificador: avdfModificador,     // o valor JÁ é o bônus
  sinal: n => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0'),

  criacao: {
    conjunto: [4, 3, 2, 1, 1, 0], maxInicial: 4, pontos: 12,
    //  Os passos do livro, na ordem do livro. É esta lista que o modo
    //  CRIAÇÃO da ficha percorre — mudar a criação é mudar aqui, não
    //  mexer em tela nenhuma.
    passos: [
      { id: 'conceito',    nome: 'Conceito' },
      { id: 'vila',        nome: 'Vila e Origem' },
      { id: 'atributos',   nome: 'Atributos' },
      { id: 'cla',         nome: 'Clã ou Ninja Comum' },
      { id: 'natureza',    nome: 'Natureza' },
      { id: 'pericias',    nome: 'Perícias' },
      { id: 'tecnicas',    nome: 'Técnicas iniciais' },
      { id: 'derivados',   nome: 'Valores derivados' },
      { id: 'equipamento', nome: 'Equipamento' },
      { id: 'alma',        nome: 'Ninja Way e Fardo' },
    ],
    origens: ORIGENS_AVDF,
    kit: KIT_SHINOBI_AVDF,
    dinheiroInicial: { nome: 'Ryō', valor: RYO_INICIAL },
  },

  // ── PROGRESSÃO — O RANK ─────────────────────────────────────────
  //  O conceito que o Fractured não tem. O rank limita o atributo
  //  máximo, dá bônus de Vida e Chakra e define até que rank de jutsu
  //  o personagem alcança.
  progressao: { id: 'rank', nome: 'Rank', niveis: RANKS_AVDF, padrao: 'genin' },

  // ── VALORES DERIVADOS ───────────────────────────────────────────
  derivados: [
    { id: 'pv_max',      nome: 'Vida',        calc: avdfVida,   formula: avdfVidaTexto   },
    { id: 'pc_max',      nome: 'Chakra',      calc: avdfChakra, formula: avdfChakraTexto },
    { id: 'defesa',      nome: 'Defesa',      calc: avdfDefesa      },
    { id: 'resiliencia', nome: 'Resiliência', calc: avdfResiliencia },
  ],

  // ── RECURSOS DO PERSONAGEM ──────────────────────────────────────
  recursos: [
    { id: 'pv',  nome: 'Vida', rotuloCurto: 'PV', max: 28, estilo: 'pips', cor: 'roxo',
      maxDerivado: 'pv_max',   // 25 + COR × 3 + rank
      icone: 'vida', nomeMedidor: 'Vida', legenda: '25 + COR × 3 + rank',
      legendaId: 'gauge-pv-caption',
      formulaId: 'pv-formula', formulaTexto: '25 + COR × 3 + rank', comecaCheio: true },

    { id: 'pc',  nome: 'Chakra', max: 21, estilo: 'pips', cor: 'dourado',
      maxDerivado: 'pc_max',   // 12 + ESP × 3 + rank
      icone: 'tensao', nomeMedidor: 'Chakra', legenda: '12 + ESP × 3 + rank',
      legendaId: 'gauge-pc-caption',
      formulaId: 'pc-formula', formulaTexto: '12 + ESP × 3 + rank', comecaCheio: true },

    { id: 'pvf', nome: 'Vontade do Fogo', max: 3, estilo: 'pips', cor: 'roxo2',
      icone: 'humanidade', legenda: '3 por sessão — não sobra para a próxima',
      comecaCheio: true },
  ],

  // ── RECURSO DA MESA ─────────────────────────────────────────────
  //  Vínculo de Equipe. Mesma FORMA da Tensão do Fractured (0 a 10,
  //  compartilhado, visível para todos) e regra oposta: a Tensão sobe
  //  contra o grupo; o Vínculo sobe a favor e é gasto de propósito.
  recursosMesa: [
    { id: 'vinculo', nome: 'Vínculo de Equipe', min: 0, max: 10, inicial: 2,
      ganhos: VINCULO_GANHOS, gastos: VINCULO_GASTOS,
      afetaTeste: () => 0 },     // o Vínculo não penaliza testes; é gasto
  ],

  // ── PERÍCIAS ────────────────────────────────────────────────────
  //  Perícia aqui não é caixa marcada: é graduação. Quatro graus, bônus
  //  crescente, e os dois últimos só a partir de um rank.
  pericias: {
    catalogo: PERICIAS_AVDF,
    graduada: true,
    graus: GRAUS_PERICIA_AVDF,
    bonusDe: avdfBonusPericia,
    proximoGrau: avdfProximoGrauPericia,
    bonusTreino: 2,
    quantas: avdfPericiasPermitidas,
    explicacao: 'Três perícias treinadas na criação — cada uma vale +2 no teste',
    porCategoria: periciasAvdfPorCategoria,
    atributoDe: atributoDaPericiaAvdf,
  },

  // ── PROGRESSÃO POR PT ───────────────────────────────────────────
  //  PT é moeda: entra, sai, e a ficha tem que saber dizer de onde veio
  //  cada ponto. PC (custo de uso) e PT (custo de aprender) são coisas
  //  diferentes e não se misturam em lugar nenhum.
  pt: {
    nome: 'Pontos de Treino', sigla: 'PT',
    custos: PT_CUSTOS_AVDF,
    fontes: PT_FONTES_AVDF,           // de onde o PT entra, para o histórico
    descontos: descontosDeAprendizado,
    pode: podeAprenderAvdf,           // as travas que preço nenhum resolve
    selos: SELOS_AVDF,                // rank S e Ōgi exigem os três
    custoAtributo: avdfCustoAtributo,
    custoJutsu: avdfCustoJutsu,
    promocao: PROMOCAO_RANK_AVDF,
  },

  //  Os limites que o rank impõe, com a frase já pronta — nenhuma tela
  //  escreve "máximo +5" por conta própria.
  limites: {
    atributo: avdfLimiteAtributo,
    jutsu:    avdfLimiteJutsu,
    permiteJutsu: avdfJutsuPermitido,
    alcanca:  avdfRankAlcanca,
  },

  //  O estado do personagem — exaustão e condições — e o que ele faz
  //  com os números. Uma função só, consultada por todo mundo.
  estado: {
    exaustao: { tabela: EXAUSTAO_AVDF, max: EXAUSTAO_MAX, de: exaustaoAvdf },
    condicoes: CONDICOES_AVDF,
    automaticas: condicoesAutomaticasAvdf,
    ferimentos: FERIMENTOS_AVDF,
    efeitos: avdfEfeitosAtivos,
  },

  talentos: { catalogo: TALENTOS_AVDF, custo: PT_CUSTOS_AVDF.talento },

  arquetipos: { nome: 'Clã', catalogo: [], buscar: () => null },   // fase 9

  // ── ROLAGEM ─────────────────────────────────────────────────────
  rolagem: {
    titulo: 'Rolagem — d20 + atributo + treino',
    pericia: { rotulo: 'Treino', opcoes: [
      { v: 0, t: 'Sem treino (+0)' },
      { v: 2, t: 'Treinado (+2)'   },
    ] },
    situacoes: false,      // aqui a circunstância vira Vantagem, não bônus
    vantagem: true,
    circunstancias: { vantagem: VANTAGEM_AVDF, desvantagem: DESVANTAGEM_AVDF },
    dificuldades: [
      { v:  8, n: 'Fácil'         }, { v: 12, n: 'Média'  },
      { v: 16, n: 'Difícil'       }, { v: 20, n: 'Muito difícil' },
      { v: 25, n: 'Heroico'       },
    ],
    ajudantes: null,       // Ajudar dá Vantagem, e só um ajudante por teste
    modManual: { rotulo: 'Modificador manual', dica: '(situação, item, o que a mesa combinar)' },

    montar: avdfMontarRolagem,
    interpretar: avdfInterpretar,
    modificadores: [],
  },

  // ── COMBATE ─────────────────────────────────────────────────────
  combate: {
    iniciativa: avdfIniciativa,      // d20 + COR, uma vez, vale a luta toda
    recursoVida: 'pv',
    condicoes: CONDICOES_AVDF,
    morte: { teste: 'd20 + COR', cd: 10, sucessos: 3, falhas: 3 },
    acoes: ['Ação Principal', 'Ação Menor', 'Movimento', 'Reação'],
  },

  // ── MAPA ────────────────────────────────────────────────────────
  //  "Não existe grade nem fita métrica." O campo é dividido em zonas
  //  e o mestre diz em qual cada um está. Declarar `zonas` faz o campo
  //  de escala em metros sumir da barra do mapa — ele não faz sentido
  //  aqui, e deixá-lo seria convidar a mesa a medir errado.
  mapa: { medida: 'zonas', zonas: ZONAS_AVDF },

  // ── FICHA ───────────────────────────────────────────────────────
  ficha: {
    titulo: 'Ficha Shinobi',
    subtitulo: 'A VONTADE DO FOGO · d20',
    temas: [{ id: 'padrao', nome: 'Padrão' }],

    secoes: [
      { tipo: 'identidade', titulo: 'Identidade', campos: [
        { id: 'f-nome',     rotulo: 'Nome',    classe: 'ficha-nome-field' },
        { id: 'f-jogador',  rotulo: 'Jogador', classe: 'ficha-jogador-field' },
        { id: 'f-ninjaway', rotulo: 'Ninja Way', classe: 'ficha-trauma-field',
          dica: 'A frase que seu personagem não trai...', linha: 'baixo' },
      ] },

      { tipo: 'bloco', id: 'section-rank', titulo: 'Rank, Vila e Naturezas',
        html: avdfHtmlRank },

      { tipo: 'atributos', titulo: 'Atributos — conjunto +4 +3 +2 +1 +1 0 (máx +4 na criação)' },

      { tipo: 'recursos', titulo: 'Status',
        medidorDaMesa: { id: 'vinculo', pipsId: 'tensao-pips-ficha',
                         inicio: 'Sozinho', fim: 'Time',
                         legenda: 'Começa em 2 numa campanha nova · gasto em Ataque Combinado, Cobertura, Formação…' } },

      { tipo: 'bloco', id: 'section-alvos', titulo: 'Defesa e Resiliência',
        html: avdfHtmlAlvos },

      { tipo: 'pericias', titulo: 'Perícias',
        aoLado: { id: 'vinculos-list', titulo: 'Vínculos' } },

      { tipo: 'bloco', id: 'section-linhagem', titulo: 'Linhagem — Kekkei Genkai',
        html: avdfHtmlLinhagem },

      { tipo: 'bloco', id: 'section-cla', titulo: 'Clã, Passiva e Progressão',
        html: avdfHtmlCla },

      { tipo: 'bloco', id: 'section-tecnicas', titulo: 'Técnicas Conhecidas',
        html: avdfHtmlTecnicas },

      { tipo: 'notas', titulo: 'História & Vínculos', dica: 'De onde veio, por quem luta...' },
    ],

    //  Quando um atributo muda, Defesa e Resiliência mudam junto — os
    //  dois números que a mesa mais consulta em combate. O núcleo chama
    //  este gancho depois de refazer os recursos derivados.
    aoMudarAtributo: avdfAtualizarDerivados,

    //  Chamado depois que a ficha é desenhada e depois que os dados são
    //  aplicados: é aqui que a trilha do clã, a linhagem e a lista de
    //  técnicas disponíveis se ajustam ao que a pessoa escolheu.
    aoMontar: () => {
      if (typeof avdfAoTrocarRank === 'function') avdfAoTrocarRank();
      if (typeof avdfAoTrocarCla  === 'function') avdfAoTrocarCla();
      if (typeof avdfAoTrocarKG   === 'function') avdfAoTrocarKG();
      if (typeof avdfAtualizarTecnicasDisponiveis === 'function') avdfAtualizarTecnicasDisponiveis();
    },

    //  Sem `colunasLegado`: este sistema nunca teve colunas próprias na
    //  tabela. Nasce lendo e gravando só na coluna `dados`.
    paraDados: avdfParaDados,
    deDados:   avdfDeDados,
  },

  // ── NPCs ────────────────────────────────────────────────────────
  npc: { paraDados: avdfParaDados, deDados: avdfDeDados },
});
