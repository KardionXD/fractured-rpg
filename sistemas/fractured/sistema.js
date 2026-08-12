// ══════════════════════════════════════════════════════════════════
//  FRACTURED — A DECLARAÇÃO DO SISTEMA
//
//  Este é o "contrato": tudo o que o núcleo precisa saber sobre o
//  Fractured, num objeto só. O núcleo nunca importa nada daqui
//  diretamente — ele lê pelo registro (nucleo/registro.js).
//
//  Para adicionar um sistema novo, copie a FORMA deste arquivo (não
//  o conteúdo) e preencha com as regras do outro sistema.
// ══════════════════════════════════════════════════════════════════

registrarSistema({
  id: 'fractured',
  nome: 'FRACTURED',
  resumo: 'Sobrevivência e horror. Você não fica mais forte — você resiste mais um dia.',
  cor: '#d9b45b',
  dadoPadrao: 20,

  // ── ATRIBUTOS ───────────────────────────────────────────────────
  //  A ordem aqui é a ordem em que aparecem na ficha.
  atributos: [
    { id: 'for', sigla: 'FOR', nome: 'Força',        min: 1, max: 5 },
    { id: 'res', sigla: 'RES', nome: 'Resistência',  min: 1, max: 5 },
    { id: 'com', sigla: 'COM', nome: 'Combate',      min: 1, max: 5 },
    { id: 'soc', sigla: 'SOC', nome: 'Social',       min: 1, max: 5 },
    { id: 'con', sigla: 'CON', nome: 'Conhecimento', min: 1, max: 5 },
    { id: 'agi', sigla: 'AGI', nome: 'Agilidade',    min: 1, max: 5 },
  ],

  // Como o valor bruto vira bônus.
  modificador: fracModificador,
  sinal: fracSinal,

  criacao: { pontos: 15, maxInicial: 4 },

  // ── VALORES DERIVADOS ───────────────────────────────────────────
  derivados: [
    { id: 'pv_max', nome: 'PV Máximo', calc: fracPvMaximo, formula: fracPvTexto },
  ],

  // ── RECURSOS DO PERSONAGEM ──────────────────────────────────────
  //  A ordem aqui é a ordem em que aparecem na ficha.
  //  `formulaId`/`legendaId` existem porque outras partes do código
  //  atualizam esses textos ao vivo (o PV muda quando RES muda; a
  //  legenda de Suprimentos muda com o valor).
  recursos: [
    { id: 'pv',  nome: 'Pontos de Vida', max: 20, estilo: 'pips', cor: 'roxo',
      icone: 'vida', nomeMedidor: 'Vida', legenda: 'RES × 4',
      legendaId: 'gauge-pv-caption',
      formulaId: 'pv-formula', formulaTexto: 'RES × 4 = máx 20' },

    { id: 'sup', nome: 'Suprimentos · grupo', max: 10, estilo: 'pips', cor: 'dourado',
      icone: 'suprimentos', dica: 'Recurso do grupo — Cap. 10',
      legenda: 'Escasso', legendaId: 'gauge-sup-caption',
      daMesa: true },   // no Fractured suprimento é do grupo, não da pessoa

    { id: 'hum', nome: 'Humanidade', max: 10, estilo: 'pips', cor: 'roxo2',
      icone: 'humanidade', legenda: 'O que resta de você', comecaCheio: true },
  ],

  // ── RECURSOS DA MESA (compartilhados) ───────────────────────────
  recursosMesa: [
    { id: 'tensao', nome: 'Tensão', min: 0, max: 10,
      faixas: TENSAO_FAIXAS,
      afetaTeste: v => tensaoFaixa(v).pen },      // −1, −2, −3 em todo teste
    { id: 'suprimentos', nome: 'Suprimentos', min: 0, max: 10 },
  ],

  // ── PERÍCIAS ────────────────────────────────────────────────────
  pericias: {
    catalogo: PERICIAS,
    bonusTreino: 3,
    quantas: fracPericiasPermitidas,
    explicacao: '1 da profissão + 1 por ponto positivo do Mod de CONHECIMENTO',
    porCategoria: periciasPorCategoria,
    atributoDe: atributoDaPericia,
  },

  // ── PROFISSÕES ──────────────────────────────────────────────────
  progressao: null,                 // o Fractured não tem níveis
  arquetipos: { nome: 'Profissão', catalogo: PROFISSOES, buscar: profissao },

  // ── ROLAGEM ─────────────────────────────────────────────────────
  rolagem: {
    montar: ctx => ({
      dados: [{ faces: ctx.faces ?? 20, qtd: 1 }],
      bonus: (ctx.modAtrib || 0) + (ctx.modPericia || 0) + (ctx.modSituacao || 0)
           + (ctx.modAjuda || 0) + (ctx.modCustom || 0),
    }),
    interpretar: (total, dif) =>
      (dif == null) ? { grau: 'livre' }
                    : { grau: total >= dif ? 'sucesso' : 'falha' },
    modificadores: SITUACOES,
  },

  // ── COMBATE ─────────────────────────────────────────────────────
  combate: {
    iniciativa: fracIniciativa,
    recursoVida: 'pv',
    // as condições continuam em combate.js por enquanto; entram aqui na fase 6
  },

  // ── MAPA ────────────────────────────────────────────────────────
  mapa: { medida: 'metros', porCelula: 1.5 },

  // ── FICHA ───────────────────────────────────────────────────────
  //  Na fase 5 esta lista passa a gerar a ficha. Hoje ela só descreve
  //  o que já existe em HTML, para que a descrição e a tela não saiam
  //  de sincronia enquanto a migração não acontece.
  ficha: {
    titulo: 'Ficha do Personagem',
    subtitulo: 'FRACTURED · d20',

    // ── AS SEÇÕES, NA ORDEM EM QUE APARECEM ───────────────────────
    //  Os tipos `identidade`, `atributos`, `recursos`, `pericias` e
    //  `notas` o motor conhece e serve a qualquer sistema. O tipo
    //  `bloco` é o escape: o próprio módulo devolve o HTML, e o motor
    //  só abre espaço. Veículo e Inventário são disso.
    secoes: [
      { tipo: 'identidade', titulo: 'Identidade', campos: [
        { id: 'f-nome',      rotulo: 'Nome',    classe: 'ficha-nome-field' },
        { id: 'f-profissao', rotulo: 'Profissão', tipo: 'select',
          classe: 'ficha-prof-field',
          extra: '\n                <div id="profissao-info" class="profissao-info" style="display:none"></div>' },
        { id: 'f-jogador',   rotulo: 'Jogador', classe: 'ficha-jogador-field' },
        { id: 'f-trauma',    rotulo: 'Trauma Central', classe: 'ficha-trauma-field',
          dica: 'O evento que te assombra...', linha: 'baixo' },
      ] },

      { tipo: 'atributos', titulo: 'Atributos — 15 pontos (máx 4)' },

      { tipo: 'recursos', titulo: 'Recursos',
        medidorDaMesa: { id: 'tensao', pipsId: 'tensao-pips-ficha',
                         inicio: 'Calma', fim: 'Tensão',
                         legenda: 'C=Calma · A=Alerta · P=Perigo · T=Terror' } },

      { tipo: 'pericias', titulo: 'Perícias',
        aoLado: { id: 'vinculos-list', tituloHtml: 'Vínculos — Promessa &amp; Dívida' } },

      { tipo: 'bloco', id: 'section-veiculo', titulo: 'Veículo', html: fracHtmlVeiculo },
      { tipo: 'bloco', id: 'section-inventario', titulo: 'Inventário',
        html: '<div id="inventario-list"></div>' },

      { tipo: 'notas', titulo: 'Notas / Memórias', dica: 'Memórias, traumas...' },
    ],

    temas: [
      { id: 'padrao', nome: 'Padrão'  },
      { id: 'ouro',   nome: 'Dourada' },
      { id: 'verde',  nome: 'Verde'   },
    ],

    // ── COMO ESTA FICHA VAI PARA O BANCO ──────────────────────────
    //  O Fractured é o único sistema com colunas próprias na tabela
    //  (attr_for, pv_atual, veiculo_comb_max…). `colunasLegado: true`
    //  avisa o núcleo disto: enquanto for verdade, as COLUNAS mandam
    //  na leitura e a coluna `dados` é escrita em paralelo.
    //
    //  Um sistema novo não declara `colunasLegado` — ele nasce lendo
    //  e gravando só em `dados`, sem herdar dívida nenhuma.
    colunasLegado: true,
    paraDados: fracParaDados,
    deDados:   fracDeDados,
  },

  // ── NPCs DO MESTRE ────────────────────────────────────────────────
  //  Mesma história da ficha: a tabela `npcs_mestre` tem colunas de
  //  atributo do Fractured e ganhou uma coluna `dados` livre.
  npc: {
    colunasLegado: true,
    paraDados: fracNpcParaDados,
    deDados:   fracNpcDeDados,
  },
});
