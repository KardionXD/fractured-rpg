// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — DECISÕES DE ARBITRAGEM (LIVRO DO JOGADOR)
//
//  Setenta e cinco buracos que a auditoria encontrou nas seções 2
//  (CONFLITOS, D01–D34) e 4 (LIVRO DO JOGADOR, por capítulo), cada um
//  com a citação original, a regra que passa a valer e o precedente do
//  próprio livro que a sustenta. Os buracos por clã (seção 3) vivem em
//  outro arquivo.
//
//  Nenhuma decisão aqui contraria um número impresso. Onde o livro
//  disse um número, ele vale — mesmo estranho (P1). Onde não disse
//  nada, a regra sai de um precedente citado, e onde nem isso existe a
//  entrada está marcada com confianca: 'baixa'.
//
//  Fontes conferidas linha a linha:
//    LJ = avdf/2b6136b4-jogador_livro.txt  (2783 linhas)
//    CC = avdf/ae88363c-clans_texto.txt    (2127 linhas)
//
// ──────────────────────────────────────────────────────────────────
//  OS SEIS PRINCÍPIOS (ver PRINCIPIOS-DE-ARBITRAGEM.md)
//
//    P1  O livro tem preferência sobre mim, sempre.
//    P2  Compêndio vence o Livro do Jogador — exceto quando quebra a
//        tabela de rank do Cap. 16; aí vale rank e custo da tabela e o
//        efeito do Compêndio.
//    P3  CD que falta = 10 + o atributo de quem aplicou.
//    P4  "Dobrado", "metade" e "+1" recebem a base na unidade que a
//        regra já usa, tirada do texto vizinho.
//    P5  Arredondamento para baixo, mínimo 1.
//    P6  Efeito nomeado e nunca descrito vira a menor coisa que
//        justifique o Estágio.
//
// ──────────────────────────────────────────────────────────────────
//  O CAMPO `aplica` — o que a ficha consome
//
//  Só existe quando a decisão vira número. Cada chave usada neste
//  arquivo, e o que a ficha faz com ela:
//
//   tecnica / rank / pc / pcRodada / selos / dano / danoRodada / pt /
//   execucao / acesso / efeito / duracaoRodadas
//        Correção de uma linha do catálogo de técnicas. `pcRodada`
//        pode ser array quando o custo escala por estágio.
//   tecnicas[]
//        Lista de correções do formato acima, aplicadas em lote.
//   cdPadrao: 'formula'
//        Liga o cálculo automático de CD de efeito (P3).
//   condicaoCd: [{ tecnica, atributo }]
//        Fixa qual atributo entra na fórmula CD = 10 + atributo.
//   ptAtributo: { valor: custo }
//        Tabela de compra de atributo, degrau a degrau.
//   rankNumerico: { rank: n }
//        Converte rank em número onde a fórmula pede "rank".
//   camadasPorRank / camadas
//        Profundidade de genjutsu onde a coluna falta.
//   duracaoPadrao: { condicao: rodadas }
//        Preenche "Conforme a fonte" quando a fonte cala.
//   desambiguaNatureza / desambiguaTecnicas
//        Separa dois conceitos que dividem o mesmo nome.
//   revogaEfeito / substituiEfeito
//        Desliga ou troca um efeito impresso que outra regra revoga.
//   ninjaComum / pvf / joninEspecial / naturezaPt / ptModificadores /
//   ptEstagioCla / validacaoEstagio / invocacaoManutencao /
//   marionete / seteEspadas / oitoPortoes / surpresa / adjacente /
//   condicao / correnteElementos / decisivoEfeitoDobro /
//   vantagemElementalEsmagadora / armaGrande / duelo / copiaSharingan /
//   corrosaoTerumi / hatake / inuzuka / dojutsu / talento / laco /
//   modoSabio / pnj / blocosPnj / custoDaLinhaPrevalece /
//   ataquesMultiplos / vilaMenor / estilo
//        Blocos de regra fora do catálogo de técnicas; o formato de
//        cada um está no `aplica` da decisão correspondente.
// ══════════════════════════════════════════════════════════════════

const DECISOES_LIVRO_AVDF = [

  // ────────────────────────────────────────────────────────────────
  //  SEÇÃO 2 — CONFLITOS (D01 a D34)
  // ────────────────────────────────────────────────────────────────

  {
    id: 'D01',
    titulo: 'Yōton significa duas coisas incompatíveis',
    onde: 'LJ:436-439 · LJ:449 · CC:1305 · CC:2008',
    tipo: 'nome',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:436-439 — "Yōton — Yang (Vitalidade). Dá vida e volume ao que já existe. '
      + 'Base da cura, da regeneração e das expansões dos Akimichi. Requisito: CTR +4, '
      + 'ou clã que a use por Hiden." · LJ:449 — "Yōton (Lava) · Fogo+Terra · Mei Terumī, '
      + 'Rōshi, Han", repetido em CC:2008 e usado em CC:1305 ("Escolha Yōton (🔥+🪨) ou '
      + 'Futton (🔥+💧) na criação").',
    decisao:
      'São dois conceitos com o mesmo nome, e o desempate é o acesso. YŌTON (LAVA) é '
      + 'Kekkei Genkai de Fogo+Terra: vem da linhagem, não tem requisito de atributo, não '
      + 'se compra com PT e concede as duas naturezas componentes de graça. YANG (a '
      + 'transformação de LJ:436) não é elemento: é a transformação Yin-Yang, exige CTR +4 '
      + 'ou clã que a use por Hiden, e nunca produz lava. A ficha guarda dois campos '
      + 'distintos — "yoton_lava" (natureza de KG) e "yang" (transformação) — e nenhum '
      + 'personagem ganha um por ter o outro. Um Terumī não recebe cura nem expansão; um '
      + 'Akimichi não recebe lava. Onde o texto disser só "Yōton", lê-se Lava se o '
      + 'portador for de linhagem e Yang se o requisito citado for CTR +4.',
    porque:
      'P1: os dois números existem e não se contradizem — o que falta é um nome, e o '
      + 'livro já separa os dois na própria página: LJ:445 diz que Kekkei Genkai "não pode '
      + 'ser treinada — ou você nasce com ela, ou recebe um transplante", enquanto a linha '
      + 'de Yang traz "Requisito: CTR +4", que é linguagem de coisa treinável. LJ:440-441 '
      + 'faz exatamente esta separação para o Onmyōton, retirando-o da tabela de PT.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      desambiguaNatureza: {
        yoton_lava: { tipo: 'kekkei_genkai', composicao: ['katon', 'doton'], requisito: null, comprável: false },
        yang: { tipo: 'transformacao', composicao: null, requisito: 'CTR+4 ou Hiden de clã', comprável: true },
      },
    },
  },

  {
    id: 'D02',
    titulo: 'Gōkakyū no Jutsu tem três estatísticas diferentes',
    onde: 'LJ:782-787 · LJ:2378 · CC:151',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:782-787 — "Gōkakyū no Jutsu — Grande Bola de Fogo · C · 4 PC · 4 selos · '
      + 'atinge uma zona a Curta/Média: 2d6+NIN, e COR CD 13 ou Queimando" · '
      + 'CC:151 — "Gōkakyū no Jutsu · D · 2 · O rito do clã. Esfera flamejante numa zona a '
      + 'Curta/Média: 1d6+NIN a todos, atingidos ficam Queimando" (sem teste) · '
      + 'LJ:2378 lista o Gōkakyū no índice sob "D — FERRAMENTAS DE GENIN".',
    decisao:
      'Gōkakyū no Jutsu · rank D · 2 PC · 2 selos · 2 PT · Ação Menor. Esfera flamejante '
      + 'numa zona a Curta/Média: 1d6+NIN a todos na zona, e os atingidos ficam Queimando '
      + 'sem teste de resistência. Entra na lista de técnicas iniciais como jutsu de rank D.',
    porque:
      'P2: vale o Compêndio, e aqui ele não está sozinho — o índice do próprio Livro do '
      + 'Jogador (LJ:2378) já classifica o Gōkakyū como rank D, contra o Cap. 16. São dois '
      + 'textos contra um. O custo de 2 PC não fura a tabela de LJ:769 (D=2), então a '
      + 'exceção do P2 não dispara. Como consequência do rank, os selos caem para 2 e a '
      + 'execução vira Ação Menor: LJ:656-657 fixa "E/D · 0–2 selos · Ação Menor".',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      tecnica: 'gokakyu',
      rank: 'D',
      pc: 2,
      selos: 2,
      pt: 2,
      dano: '1d6+NIN',
      execucao: 'acao_menor',
      efeito: 'Queimando automático, sem teste',
    },
  },

  {
    id: 'D03',
    titulo: 'Ninja Comum: +3 ou +2 pontos de atributo',
    onde: 'LJ:272-273 · LJ:2019 · CC:1076',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:272-273 (Passo 3) — "+3 pontos de atributo na criação (limite +4)", confirmado '
      + 'em LJ:2019 · CC:1076 (Passiva Sem Amarras) — "+2 pontos de atributo na criação '
      + '(respeitando o teto de rank)".',
    decisao:
      'O Ninja Comum recebe +2 pontos de atributo na criação, respeitando o teto de rank '
      + '(+4 no Genin). Os pontos são distribuídos depois do conjunto padrão do Passo 2.',
    porque:
      'P2, sem exceção aplicável: nenhuma tabela de rank é ferida. LJ:2019 não é uma '
      + 'segunda fonte independente — é o resumo que o Livro do Jogador faz do Cap. 26, '
      + 'que vive no Compêndio (LJ:1999-2000 diz isso com todas as letras). Quando o resumo '
      + 'e o capítulo resumido discordam, vale o capítulo.',
    principio: 'P2',
    confianca: 'alta',
    aplica: { ninjaComum: { pontosAtributo: 2, respeitaTetoDeRank: true } },
  },

  {
    id: 'D04',
    titulo: 'Ninja Comum: qual desconto de PT',
    onde: 'LJ:274-275 · LJ:2019-2020 · CC:1076-1077',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:274-275 — "Aprende jutsus fora da natureza afim por 1 PT a menos" · '
      + 'LJ:2019-2020 e CC:1076-1077 — "todo jutsu de acesso Livre custa 1 PT a menos, '
      + 'independentemente da sua natureza afim".',
    decisao:
      'O Ninja Comum paga 1 PT a menos por qualquer jutsu de acesso Livre, seja qual for '
      + 'a natureza. O critério é o campo Acesso (LJ:467), não a natureza. O desconto '
      + 'acumula com os modificadores do Cap. 9 (LJ:515) e respeita o piso de 1 PT fixado '
      + 'na decisão C-c9. Kinjutsu não recebe desconto nenhum (LJ:1790).',
    porque:
      'P2, com dois textos contra um: o Compêndio e o resumo do Cap. 26 no próprio Livro '
      + 'do Jogador dizem a mesma coisa, e só o Passo 3 diz o contrário. O critério "acesso" '
      + 'também é o único que o livro usa para precificar aprendizado em LJ:493-502.',
    principio: 'P2',
    confianca: 'alta',
    aplica: { ninjaComum: { descontoPt: { criterio: 'acesso_livre', valor: 1, acumula: true } } },
  },

  {
    id: 'D05',
    titulo: 'Ninja Comum: talento grátis e perícia Especialista existem ou não',
    onde: 'LJ:273-277 · LJ:2019 · CC:1076-1077',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:273-277 — "...um jutsu comum extra e um talento à escolha (valor 6 PT). (...) No '
      + 'rank Chūnin, ganha uma segunda perícia Especialista de graça." · LJ:2019 repete '
      + '"um talento grátis" · CC:1076-1077 lista apenas "+2 pontos de atributo, uma '
      + 'perícia treinada extra e um jutsu comum extra de rank D ou inferior".',
    decisao:
      'O Ninja Comum recebe na criação: +2 pontos de atributo (D03), uma perícia treinada '
      + 'extra, um jutsu comum extra de rank D ou inferior, e um talento à escolha (valor '
      + '6 PT). A segunda perícia Especialista de graça no rank Chūnin NÃO existe.',
    porque:
      'P2 aplicado item a item, e não em bloco — o Compêndio corrige o que reescreve, e '
      + 'silencia sobre o resto. O talento sobrevive porque tem duas fontes (LJ:273 e '
      + 'LJ:2019, sendo a segunda o resumo do próprio Cap. 26) e o Compêndio não o nega; a '
      + 'perícia Especialista cai porque tem uma fonte só, e nem o resumo do Cap. 26 nem o '
      + 'Compêndio a repetem. Precedente de leitura item a item: o Compêndio também não '
      + 'menciona o Estágio I gratuito no bloco do Ninja Comum e ainda assim o concede em '
      + 'CC:1080.',
    principio: 'P2',
    confianca: 'media',
    aplica: {
      ninjaComum: {
        periciaTreinadaExtra: 1,
        jutsuComumExtra: { quantidade: 1, rankMaximo: 'D' },
        talentoGratis: 1,
        periciaEspecialistaChunin: false,
      },
    },
  },

  {
    id: 'D06',
    titulo: 'Estágio de clã custa 8 PT fixo ou 6/8/12/18',
    onde: 'LJ:2163 · LJ:2015-2016 · CC:53-69',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:2163 (Cap. 34, tabela de compras) — "Estágio de progressão de clã · 8 PT · Exige '
      + 'o rank e o marco do clã." · LJ:2015-2016 e CC:53-69 — "II Genin/6 PT · III '
      + 'Chūnin/8 PT · IV Jōnin/12 PT · V Elite/18 PT".',
    decisao:
      'Estágio II custa 6 PT (rank Genin) · III custa 8 PT (Chūnin) · IV custa 12 PT '
      + '(Jōnin) · V custa 18 PT (Elite). O Estágio I é gratuito na criação. Cada compra '
      + 'exige o rank mínimo e o marco narrativo jogado em cena. A linha de LJ:2163 é a '
      + 'linha do Estágio III lida como se valesse para todos.',
    porque:
      'P2 e P1 apontando para o mesmo lado: o Compêndio traz a tabela completa (CC:53-69) '
      + 'e o próprio Livro do Jogador a reproduz em LJ:2015-2016. São dois textos contra a '
      + 'linha única da tabela de compras, e nenhum número é contrariado — o 8 PT continua '
      + 'existindo, no Estágio III.',
    principio: 'P2',
    confianca: 'alta',
    aplica: { ptEstagioCla: { 1: 0, 2: 6, 3: 8, 4: 12, 5: 18 } },
  },

  {
    id: 'D07',
    titulo: 'Sharingan Dois Tomoe: todos os ataques ou só o primeiro',
    onde: 'CC:129-131 · CC:2040',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:129-131 (progressão Uchiha) — "Previsão: o primeiro ataque de cada inimigo em '
      + 'cada rodada tem Desvantagem, e você ganha +3 em Esquiva." · CC:2040 (Cap. 29, '
      + 'tabela do Sharingan) — "Previsão de movimento: ataques contra você têm '
      + 'Desvantagem, e +3 em testes de Esquiva."',
    decisao:
      'Sharingan de Dois Tomoe: o primeiro ataque de cada inimigo em cada rodada sofre '
      + 'Desvantagem, e o portador ganha +3 em testes de Esquiva. Ataques seguintes do '
      + 'mesmo inimigo na mesma rodada rolam normalmente.',
    porque:
      'P2 não desempata (as duas passagens são do Compêndio), então vale a mais específica: '
      + 'CC:129 está na progressão do clã, com a restrição; CC:2040 é a linha de resumo da '
      + 'tabela do Cap. 29. O desenho também é o que o sistema já usa: LJ:604-605 explica '
      + 'que a Reação única "torna o segundo ataque de uma rodada muito mais perigoso que o '
      + 'primeiro" — o Dois Tomoe protege exatamente o ataque que o sistema já considerava '
      + 'o mais fácil de ler.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      dojutsu: 'sharingan',
      estagio: 'dois_tomoe',
      desvantagemAtaque: 'primeiro_de_cada_inimigo_por_rodada',
      bonusEsquiva: 3,
    },
  },

  {
    id: 'D08',
    titulo: 'Susanoo: duas mecânicas incompatíveis, e nenhuma diz como se avança de estágio',
    onde: 'LJ:1963-1964 · CC:178-181',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1963-1964 (Cap. 25) — "PV extra igual ao dobro do máximo, redução 10, arma de '
      + '8d6. Sustentado, corrói a vida do usuário (2d6/rodada)." · CC:178-181 — "S · 16 '
      + '+6/rd · Estágios: costelas (red. 10) → torso (red. 20, 6d6) → armadura (red. 30, '
      + '8d6) → Completo (invocação Colossal)."',
    decisao:
      'Susanoo · S · 16 PC para invocar, mais manutenção por rodada que sobe com o estágio: '
      + '6 / 8 / 10 / 12 PC por rodada nas costelas, torso, armadura e Completo. Subir um '
      + 'estágio é Ação Menor, um estágio por rodada, e os valores da tabela são totais, '
      + 'não somas — cada estágio substitui o anterior. Redução 10 / 20 / 30, arma de 6d6 '
      + 'a partir do torso e 8d6 a partir da armadura, e o Completo é uma invocação '
      + 'Colossal. O avatar NÃO concede PV extra: a durabilidade dele é a redução. O dreno '
      + 'de 2d6 PV por rodada de LJ:1964 não se aplica — o custo por rodada é em PC.',
    porque:
      'P2 para a estrutura (vale o Compêndio, e ele é quem estatiza os quatro estágios) e '
      + 'P4 para o que falta: a base sai do texto vizinho na mesma unidade. O único '
      + 'mecanismo de estágios cumulativos que o livro tem é o dos Oito Portões, e LJ:1583 '
      + 'responde exatamente as três perguntas em aberto — "Abrir um portão é Ação Menor. '
      + 'Os valores da tabela são totais, não somas: um portão substitui o anterior." '
      + 'Cobrar 2d6 de PV por rodada além de 6 PC por rodada seria somar duas edições da '
      + 'mesma técnica. INVENÇÃO MINHA: o escalonamento +2 PC/rd por estágio; ele copia o '
      + 'passo que o Compêndio usa entre Sustentadas do mesmo clã (Kagemane 4+2/rd em '
      + 'CC:464 e Kagekubi Shibari 7+3/rd em CC:476), mas o número não está escrito em '
      + 'lugar nenhum.',
    principio: 'P2',
    confianca: 'baixa',
    aplica: {
      tecnica: 'susanoo',
      rank: 'S',
      pc: 16,
      pcRodada: [6, 8, 10, 12],
      reducaoPorEstagio: [10, 20, 30, 30],
      armaPorEstagio: [null, '6d6', '8d6', 'colossal'],
      pvExtra: 0,
      avancarEstagio: { acao: 'acao_menor', porRodada: 1, valoresSaoTotais: true },
      revogaEfeito: 'dreno de 2d6 PV/rodada (LJ:1964)',
    },
  },

  {
    id: 'D09',
    titulo: 'Tsukuyomi: efeito no alvo',
    onde: 'LJ:1960-1962 · CC:175-176 · LJ:726',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1960-1962 — "Segundos reais, dias subjetivos de tortura — Atordoado e um nível de '
      + 'Exaustão mental. Custo: cegueira progressiva." · CC:175-176 — "GEN +5. 72h '
      + 'subjetivas num segundo real; o alvo fica inconsciente e sofre Trauma Craniano."',
    decisao:
      'Tsukuyomi · S · 16 PC · 24 PT · requisito GEN +5 · contato visual. O alvo fica '
      + 'inconsciente e sofre o Ferimento Grave nº 5, Trauma Craniano (LJ:726: −1 em ESP e '
      + 'Desvantagem contra genjutsu, até duas semanas de tratamento com Medicina CD 16). '
      + 'Cada uso acumula 1 ponto de Cegueira (CC:195). Não há nível de Exaustão: o trilho '
      + 'de Exaustão do livro é único (LJ:709-716) e não tem variante mental.',
    porque:
      'P2: vale o Compêndio, inclusive o requisito GEN +5, que o Livro do Jogador não '
      + 'traz. A "Exaustão mental" de LJ:1962 cai por P1 invertido — não é um número que '
      + 'existe, é um termo que não existe em tabela nenhuma; a única Exaustão do livro é a '
      + 'de LJ:709-716. A "cegueira progressiva" de LJ:1962 é a mesma coisa que o contador '
      + 'de Cegueira de CC:195-197, só que sem número: vale o do Compêndio.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      tecnica: 'tsukuyomi',
      rank: 'S',
      pc: 16,
      pt: 24,
      requisito: 'GEN+5',
      efeito: 'Inconsciente + Ferimento Grave 5 (Trauma Craniano)',
      cegueira: 1,
      camadas: 'esp',
    },
  },

  {
    id: 'D10',
    titulo: 'Izanagi: duração',
    onde: 'LJ:1966-1968 · CC:186-187',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1966-1968 — "Por poucos turnos, transforma ferimentos — inclusive a morte — em '
      + 'ilusão. Ao terminar, o olho usado se fecha para sempre." · CC:186-187 — "Por 3 '
      + 'rodadas tudo o que acontece com você vira ilusão (...) Uso único por olho."',
    decisao:
      'Izanagi · S · 16 PC · Kinjutsu. Por 3 rodadas, tudo o que acontece com o usuário '
      + 'vira ilusão: anule dano ou morte retroativamente dentro dessa janela. Uso único '
      + 'por olho, e o olho usado fica cego em definitivo.',
    porque:
      'P2 e P1: "poucos turnos" não é número, "3 rodadas" é. O Compêndio dá o número e o '
      + 'Livro do Jogador não dá nenhum, então não há conflito a resolver — há uma lacuna '
      + 'preenchida pelo texto mais específico.',
    principio: 'P2',
    confianca: 'alta',
    aplica: { tecnica: 'izanagi', rank: 'S', pc: 16, duracaoRodadas: 3, usoUnicoPorOlho: true },
  },

  {
    id: 'D11',
    titulo: 'Amaterasu: duração e extinção',
    onde: 'LJ:846-849 · CC:172-173 · LJ:695',
    tipo: 'conflito',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:846-849 — "Chamas negras onde o olho mira. Acerta automaticamente. 8d6 no '
      + 'impacto e 3d6/rodada por até 5 rodadas; no fim de cada turno o alvo faz COR CD 18 '
      + 'para extinguir. O usuário sofre 1d6 e sangra pelo olho." · CC:172-173 — "8d6 no '
      + 'impacto e 3d6/rd até consumir. Cada uso: 1d6 e sangramento ocular."',
    decisao:
      'Amaterasu · S · 16 PC · acerto automático. 8d6 no impacto e 3d6 no fim de cada '
      + 'turno, sem limite de rodadas. No fim de cada turno o alvo faz COR CD 18: no '
      + 'sucesso, as chamas se extinguem. O usuário sofre 1d6 e acumula 1 ponto de '
      + 'Cegueira por uso.',
    porque:
      'P2 para o efeito (o Compêndio tira o teto de 5 rodadas, e "até consumir" é o que a '
      + 'técnica é) e P1 para o número: o CD 18 existe em LJ:848 e o Compêndio não o '
      + 'contradiz — apenas não o repete. Sem ele, o Amaterasu vira uma condição sem '
      + 'saída, e o Cap. 14 (LJ:695) exige que Queimando tenha uma. Precedente de leitura: '
      + 'o Compêndio também omite o custo em PC de várias técnicas que reescreve, e '
      + 'ninguém conclui que elas ficaram grátis.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      tecnica: 'amaterasu',
      rank: 'S',
      pc: 16,
      dano: '8d6',
      danoRodada: '3d6',
      duracaoRodadas: null,
      cdExtincao: { atributo: 'COR', cd: 18, quando: 'fim de cada turno do alvo' },
      cegueira: 1,
    },
  },

  {
    id: 'D12',
    titulo: 'Jūken: quando a canalização é cancelada',
    onde: 'LJ:1482-1483 · CC:228-233',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1482-1483 (Postura do estilo Jūken) — "dano pela metade, mas drena 1d6 PC e '
      + 'ignora Defesa por armadura; contra quem Canaliza, cancela o jutsu." · CC:228-233 — '
      + 'o Estágio I dá a Postura ("golpes causam metade do dano, drenam 1d6 PC e ignoram '
      + 'redução por armadura") e o Estágio II dá "Leitura de Tenketsu. Um golpe que acerte '
      + 'alguém Canalizando cancela o jutsu sem teste."',
    decisao:
      'A Postura do estilo Jūken (Estágio I) NÃO cancela canalização. O cancelamento é o '
      + 'desbloqueio do Estágio II do Hyūga (Leitura de Tenketsu): a partir dele, um golpe '
      + 'que acerte alguém Canalizando cancela o jutsu sem teste. Um Hyūga de Estágio I '
      + 'que acerte um canalizador aplica só a interrupção normal do Cap. 13 (LJ:668: teste '
      + 'de Controle CD 10 + dano sofrido).',
    porque:
      'P2: o Compêndio separa os dois efeitos em Estágios diferentes e é o texto que '
      + 'descreve o clã. O desenho também é o que faz o Estágio II valer os 6 PT que custa '
      + '(CC:57-59) — juntar tudo no Estágio I esvaziaria uma compra inteira. E o próprio '
      + 'Livro do Jogador já conhece a versão sem cancelamento: LJ:670-671 diz que "efeitos '
      + 'que impõem Atordoado, Selado ou Preso durante a canalização a cancelam sem teste", '
      + 'e a Postura base não impõe nenhum dos três.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      estilo: 'juken',
      posturaCancelaCanalizacao: false,
      cancelamento: { cla: 'hyuga', estagio: 2, semTeste: true },
    },
  },

  {
    id: 'D13',
    titulo: 'Jūken ignora "Defesa por armadura" ou "redução por armadura"',
    onde: 'LJ:1482 · CC:228-229 · LJ:2108-2109 · LJ:202',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1482 — "ignora Defesa por armadura" · CC:228-229 — "ignoram redução por '
      + 'armadura" · LJ:202 — "Defesa = 10 + COR" · LJ:2108-2109 — "Colete Chūnin/Jōnin: '
      + 'reduz dano físico em 2 · Armadura ANBU: reduz dano físico em 4".',
    decisao:
      'Os golpes de Jūken ignoram a redução de dano por armadura — os 2 do colete e os 4 '
      + 'da armadura ANBU. Não afetam a Defesa do alvo, que continua sendo 10 + COR.',
    porque:
      'P2 e P1 apontando junto: o Compêndio está mecanicamente correto e o Livro do '
      + 'Jogador referencia uma mecânica que o sistema não tem. Defesa é 10 + COR (LJ:202, '
      + 'repetido em LJ:2334) e não recebe contribuição de equipamento em ponto nenhum dos '
      + 'dois volumes; armadura só aparece como redução (LJ:2108-2109). "Ignorar Defesa por '
      + 'armadura" ignora um número que vale zero.',
    principio: 'P2',
    confianca: 'alta',
    aplica: { estilo: 'juken', ignora: 'reducao_armadura', afetaDefesa: false },
  },

  {
    id: 'D14',
    titulo: 'Raiton no Yoroi concede Reação extra ou não',
    onde: 'LJ:1044-1047 · CC:1436-1439 · CC:1422 · LJ:2413-2415 · CC:2104',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1044-1047 — "Sustentada. +2 TAI e COR (nunca acima do teto do rank) e movimento '
      + 'de duas zonas. Não concede Reação extra. Duração máxima COR rodadas; 1 nível de '
      + 'Exaustão ao encerrar." · CC:1436-1439 (Yotsuki) — "A 8+3/rd · Sustentada. +2 TAI e '
      + 'COR, movimento de duas zonas, Esquiva duas vezes por rodada." · LJ:2413-2415 e '
      + 'CC:2104 (Apêndice, regra 2) — "Nenhum efeito concede Reações adicionais por '
      + 'rodada."',
    decisao:
      'Raiton no Yoroi · A · 11 PC + 3/rodada (8 PC + 3/rodada para o Yotsuki de Estágio '
      + 'II) · Sustentada. Concede +2 TAI e +2 COR, respeitando o teto de atributo do rank, '
      + 'e movimento de duas zonas. NÃO concede Reação, Esquiva ou defesa reativa '
      + 'adicional. Duração máxima igual ao valor de COR em rodadas; 1 nível de Exaustão ao '
      + 'encerrar.',
    porque:
      'P1 e a hierarquia que o próprio livro declara: LJ:2404 diz que o Apêndice de '
      + 'Equilíbrio traz "cinco regras curtas que valem acima de qualquer tabela deste '
      + 'livro", e a regra 2 está reproduzida palavra por palavra dentro do próprio '
      + 'Compêndio (CC:2104) — logo o Compêndio se contradiz e a sua própria regra geral '
      + 'vence a sua tabela. O desconto de 8 PC do Yotsuki fica porque CC:1422 o explica '
      + 'nominalmente ("Raiton no Yoroi (11 PC na tabela) a custo reduzido: 8 PC"), o que o '
      + 'torna uma exceção declarada e não um furo.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      tecnica: 'raiton_no_yoroi',
      rank: 'A',
      pc: 11,
      pcYotsuki: 8,
      pcRodada: 3,
      reacaoExtra: false,
      duracaoRodadas: 'COR',
      exaustaoAoEncerrar: 1,
      revogaEfeito: 'Esquiva duas vezes por rodada (CC:1438)',
    },
  },

  {
    id: 'D15',
    titulo: 'Talento Reflexo Shinobi contradiz o Apêndice de Equilíbrio',
    onde: 'LJ:2172 · LJ:2413-2415 · CC:1426',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:2172 (Cap. 34, Talentos) — "Reflexo Shinobi · Uma Reação adicional por rodada. · '
      + '6 PT" · LJ:2413-2415 (Apêndice, regra 2) — "Nenhum efeito concede Reações '
      + 'adicionais por rodada (...) As duas exceções nomeadas são os chefes solo e as '
      + 'passivas que digam explicitamente \'uma vez por combate\'."',
    decisao:
      'Reflexo Shinobi · 6 PT · concede uma Reação adicional, uma vez por combate. Não '
      + 'concede Reação adicional em toda rodada.',
    porque:
      'P1: o talento existe e custa 6 PT, e a regra 2 do Apêndice não o apaga — ela nomeia '
      + 'a forma pela qual um efeito desses é permitido. O precedente é literal e está no '
      + 'outro volume: o Reflexo Relâmpago dos Yotsuki (CC:1426) é o mesmo efeito escrito '
      + 'do jeito que a regra 2 aceita — "uma Reação adicional, uma vez por combate". '
      + 'Reescrever o talento nesses termos é copiar o vizinho, não inventar.',
    principio: 'P1',
    confianca: 'alta',
    aplica: { talento: 'reflexo_shinobi', pt: 6, reacaoAdicional: { quantidade: 1, por: 'combate' } },
  },

  {
    id: 'D16',
    titulo: 'Talento Substituição Aprimorada contradiz o Apêndice de Equilíbrio',
    onde: 'LJ:2175 · LJ:2419-2421 · LJ:609',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:2175 — "Substituição Aprimorada · Kawarimi três vezes por combate, sem '
      + 'escalonamento de custo. · 6 PT" · LJ:2419-2421 (Apêndice, regra 3) — "Toda defesa '
      + 'reativa que anula o dano por completo (...) obedece ao mesmo teto: no máximo duas '
      + 'vezes por combate, com o segundo uso custando o dobro, e nunca mais de uma vez na '
      + 'mesma rodada." · LJ:609 — "Substituição · 2 PC · Máx. 2×/combate; cada uso após o '
      + 'primeiro custa o dobro."',
    decisao:
      'Substituição Aprimorada · 6 PT · o teto de usos de Kawarimi por combate sobe de '
      + 'duas para três. O escalonamento de custo CONTINUA: 2, 4 e 8 PC. Continua valendo '
      + 'o limite de um uso por rodada.',
    porque:
      'P1: "três vezes por combate" é um número impresso e fica; "sem escalonamento de '
      + 'custo" é exatamente a cláusula que a regra 3 do Apêndice revoga, e o Apêndice se '
      + 'declara acima de qualquer tabela (LJ:2404). O talento continua valendo os 6 PT '
      + 'porque comprar teto com PT é o que a tabela de LJ:2156-2164 faz o tempo todo.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      talento: 'substituicao_aprimorada',
      pt: 6,
      usosKawarimiPorCombate: 3,
      escalonamento: true,
      custos: [2, 4, 8],
      maxPorRodada: 1,
    },
  },

  {
    id: 'D17',
    titulo: 'Tsūga e Gatsūga: custo em PC',
    onde: 'LJ:1537-1543 · CC:671 · CC:677 · LJ:769',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1537-1543 — "Tsūga · C · 3 PC · 2d6+TAI" e "Gatsūga · B · 5 PC · 4d6+TAI" · '
      + 'CC:671 e CC:677 — "Tsūga · C · 4" e "Gatsūga · B · 7".',
    decisao:
      'Tsūga · C · 4 PC · 2d6+TAI, atravessa uma zona e ignora cobertura leve. Gatsūga · '
      + 'B · 7 PC · Vantagem, 4d6+TAI, atravessa a zona atingindo todos.',
    porque:
      'P2, com reforço duplo: o Compêndio prevalece e os valores dele são justamente os da '
      + 'tabela de custo por rank de LJ:769-770 (C=4, B=7), que o Livro do Jogador furava. '
      + 'Aqui o Compêndio não quebra a tabela — ele a restaura, então a exceção do P2 não '
      + 'só não dispara como aponta na mesma direção.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      tecnicas: [
        { tecnica: 'tsuga', rank: 'C', pc: 4, dano: '2d6+TAI' },
        { tecnica: 'gatsuga', rank: 'B', pc: 7, dano: '4d6+TAI' },
      ],
    },
  },

  {
    id: 'D18',
    titulo: 'Kuroari Higi: custo e dano',
    onde: 'LJ:1652-1656 · CC:1702-1703',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1652-1656 — "B · 6 PC · marionete oca engole o alvo (teste resistido de CTR '
      + 'contra COR; Preso, CD 16); outra crava lâminas: 3d6, e COR CD 15 ou Envenenado." · '
      + 'CC:1702-1703 — "B · 7 · uma marionete oca engole o alvo (Preso, CD 16); uma '
      + 'segunda crava lâminas envenenadas: 5d6 + Envenenado automático."',
    decisao:
      'Kugutsu: Kuroari Higi · B · 7 PC · Acerto CTR · Hiden Suna. Uma marionete oca '
      + 'engole o alvo: teste resistido de CTR contra COR; no sucesso o alvo fica Preso, '
      + 'CD 16. Uma segunda marionete crava lâminas envenenadas: 5d6 e Envenenado '
      + 'automático, sem teste. O Envenenado dura 3 rodadas (ver C13).',
    porque:
      'P2 para custo e efeito — o 7 PC recoloca a técnica na tabela de LJ:769 (B=7), e o '
      + '5d6 + Envenenado automático é a versão do Compêndio, que a exceção do P2 preserva '
      + '("vale o rank e o custo da tabela e o efeito do Compêndio"). P1 para o teste '
      + 'resistido de entrada: ele existe em LJ:1654 e o Compêndio não o revoga — só o '
      + 'resume entre parênteses, mantendo inclusive o CD 16, que é a assinatura de um '
      + 'resumo e não de uma reescrita.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      tecnica: 'kuroari_higi',
      rank: 'B',
      pc: 7,
      acerto: 'CTR',
      efeito: 'resistido CTR vs COR → Preso CD 16; segunda marionete: 5d6 e Envenenado automático',
    },
  },

  {
    id: 'D19',
    titulo: 'Kugutsu no Jutsu: custo da marionete adicional e teto de marionetes',
    onde: 'LJ:1646-1650 · CC:1696-1697',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1646-1650 — "Kugutsu no Jutsu · C · 4+1/rd · CTR · Cada adicional dobra o custo '
      + 'por rodada e exige CTR CD 12+2 por marionete. Máximo de marionetes ativas: '
      + 'CTR ÷ 2." · CC:1696-1697 — "Cada adicional: +1 PC/rd e CTR CD 12 +2 por marionete." '
      + '(sem teto)',
    decisao:
      'Kugutsu no Jutsu · C · 4 PC + 1/rodada pela primeira marionete. Cada marionete '
      + 'adicional soma +1 PC por rodada e exige um teste de CTR contra CD 12 + 2 por '
      + 'marionete já ativa. O número máximo de marionetes ativas é CTR ÷ 2, arredondado '
      + 'para baixo, mínimo 1.',
    porque:
      'P2 para o custo: a progressão aritmética do Compêndio é a que mantém a técnica '
      + 'dentro da escala do rank C (a geométrica levaria quatro marionetes a 8 PC/rodada, '
      + 'mais caro que uma Sustentada rank A). P1 para o teto: CTR ÷ 2 é um número '
      + 'impresso que o Compêndio não contradiz — apenas não repete —, e sem ele a técnica '
      + 'não tem limite superior nenhum. P5 para o arredondamento e o mínimo 1.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      tecnica: 'kugutsu_no_jutsu',
      rank: 'C',
      pc: 4,
      pcRodada: 1,
      pcPorAdicional: 1,
      cdAdicional: '12 + 2 por marionete ativa',
      maxMarionetes: 'floor(CTR / 2), mínimo 1',
    },
  },

  {
    id: 'D20',
    titulo: 'Katon: Endan tem duas fichas',
    onde: 'LJ:2496-2499 · CC:799',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:2496-2499 (Adendo) — "Katon: Endan — Bala de Chamas · D · 2 PC · Jato curto e '
      + 'imediato: 1d6+NIN até a zona Curta. Ação Menor — você ainda tem a Principal. · '
      + 'Livre" · CC:799 (Sarutobi, Estágio I) — "Katon: Endan · C · 4 · Jato compacto de '
      + 'fogo: 2d6+NIN e o alvo fica Queimando."',
    decisao:
      'Duas entradas distintas no catálogo, e nenhuma substitui a outra. (1) "Katon: '
      + 'Endan — Bala de Chamas" · Livre · D · 2 PC · 2 PT · Ação Menor · 1d6+NIN até a '
      + 'zona Curta. (2) "Katon: Endan (Sarutobi)" · Hiden — Sarutobi · C · 4 PC · 4 PT '
      + '(2 com o desconto de Hiden do próprio clã) · Ação Principal · 2d6+NIN e o alvo '
      + 'fica Queimando. Um Sarutobi que compre a versão do clã passa a usá-la no lugar da '
      + 'comum; qualquer outro personagem só tem acesso à primeira.',
    porque:
      'P1: nenhum dos dois conjuntos de números fura a tabela de LJ:769 (D=2, C=4), logo '
      + 'nenhum dos dois é erro de edição — são duas técnicas coerentes em ranks '
      + 'diferentes. O precedente do próprio Compêndio é o de republicar técnicas comuns '
      + 'como técnicas de clã sem alterá-las: Suikōdan aparece igual em LJ:908-910 e '
      + 'CC:1376, e Goshokuzame em LJ:917-920 e CC:1383. Quando os números batem, é '
      + 'republicação; quando sobem junto com o rank, é uma versão de clã.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      desambiguaTecnicas: [
        { chave: 'katon_endan', rank: 'D', pc: 2, pt: 2, dano: '1d6+NIN', execucao: 'acao_menor', acesso: 'livre' },
        { chave: 'katon_endan_sarutobi', rank: 'C', pc: 4, pt: 4, dano: '2d6+NIN', efeito: 'Queimando', acesso: 'hiden_sarutobi' },
      ],
    },
  },

  {
    id: 'D21',
    titulo: 'Katon: Karyūdan tem duas fichas',
    onde: 'LJ:2475-2479 · CC:334-335 · CC:59',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:2475-2479 (Adendo) — "Katon: Karyūdan · B · 7 · 3d6+NIN numa zona a Média. Se '
      + 'houver lama, óleo ou um Doryū Taiga no campo, ela se alimenta do terreno: +2d6 e o '
      + 'terreno queima pelo resto da cena." · CC:334-335 (Senju, Estágio II) — "Katon: '
      + 'Karyūdan · C · 4 · Jato de fogo compacto, 2d6+NIN. O clã ensina uma técnica de '
      + 'cada natureza — troque por Suiton, Fūton, Raiton ou Doton equivalente."',
    decisao:
      'Duas entradas distintas. (1) "Katon: Karyūdan" · Livre · B · 7 PC · 3d6+NIN numa '
      + 'zona a Média; com lama, óleo ou Doryū Taiga no campo, +2d6 e o terreno queima pela '
      + 'cena. (2) "Katon: Karyūdan (Senju)" · Hiden — Senju · C · 4 PC · 2d6+NIN, jato '
      + 'compacto, sem interação com terreno — é a técnica Katon do Estágio II do Senju e '
      + 'pode ser trocada por equivalente de Suiton, Fūton, Raiton ou Doton.',
    porque:
      'P1, pela mesma leitura de D20: os dois conjuntos obedecem à tabela de LJ:769 e '
      + 'nenhum é erro. Aqui há confirmação estrutural: o framework de Estágios (CC:59) diz '
      + 'que o Estágio II destrava "técnicas de Estágio II (rank C)", e o C/4 do Senju está '
      + 'exatamente no lugar previsto — não é uma versão rebaixada do B/7, é a técnica que '
      + 'aquele Estágio ensina.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      desambiguaTecnicas: [
        { chave: 'katon_karyudan', rank: 'B', pc: 7, pt: 8, dano: '3d6+NIN', acesso: 'livre' },
        { chave: 'katon_karyudan_senju', rank: 'C', pc: 4, pt: 4, dano: '2d6+NIN', acesso: 'hiden_senju', substituivelPorNatureza: true },
      ],
    },
  },

  {
    id: 'D22',
    titulo: 'Hōsenka Tsumabeni tem três versões',
    onde: 'LJ:793-797 · LJ:2491-2494 · CC:154-155',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:793-797 — "Hōsenka no Jutsu — Flores de Fênix · C · 4 · 5 selos · divida 2d6+NIN '
      + 'entre até três alvos. Variante Tsumabeni esconde shurikens no fogo." (sem efeito '
      + 'mecânico para a variante) · LJ:2491-2494 (Adendo) — "Katon: Hōsenka Tsumabeni · '
      + 'C · 4 · 2d6+NIN, e Vantagem no acerto contra quem já gastou a Reação nesta '
      + 'rodada." · CC:154-155 (Uchiha) — "2d6+NIN entre três alvos; quem esquiva do fogo '
      + 'enfrenta um projétil (1d6+TAI) inesquivável."',
    decisao:
      'Duas técnicas, não três. (1) "Hōsenka no Jutsu — Flores de Fênix" · Livre · C · '
      + '4 PC · 5 selos · divida 2d6+NIN entre até três alvos; a menção à variante em '
      + 'LJ:796 é remissão, não regra. (2) "Hōsenka: Tsumabeni — Flores Carmesim" · C · '
      + '4 PC · divida 2d6+NIN entre até três alvos, e todo alvo que Esquivar do fogo '
      + 'enfrenta um projétil de 1d6+TAI que não pode ser esquivado. A cláusula de '
      + 'Vantagem do Adendo não se soma.',
    porque:
      'P2: a versão do Compêndio prevalece sobre a do Adendo. As duas escrevem a mesma '
      + 'intenção de design — punir quem gastou a Reação para escapar do fogo — e o '
      + 'Compêndio a implementa por dentro, resolvendo o caso; empilhar a Vantagem do '
      + 'Adendo por cima cobraria o mesmo ganho duas vezes. A separação entre Hōsenka e '
      + 'Tsumabeni segue D20/D21: o Adendo e o Compêndio dão à variante uma linha própria '
      + 'com rank e custo próprios, o que é a definição de técnica separada.',
    principio: 'P2',
    confianca: 'media',
    aplica: {
      desambiguaTecnicas: [
        { chave: 'hosenka', rank: 'C', pc: 4, selos: 5, dano: '2d6+NIN dividido entre até 3 alvos', acesso: 'livre' },
        { chave: 'hosenka_tsumabeni', rank: 'C', pc: 4, dano: '2d6+NIN dividido entre até 3 alvos', efeito: 'quem Esquivar sofre 1d6+TAI inesquivável', acesso: 'livre' },
      ],
    },
  },

  {
    id: 'D23',
    titulo: 'Sōshuriken vs. Sōshūriken — dois jutsus, nomes quase idênticos',
    onde: 'LJ:1619-1622 · LJ:2591-2594 · CC:1043',
    tipo: 'nome',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:1619-1622 — "Sōshuriken no Jutsu — Shuriken Gêmeo · C · 4 · TAI · Dois fūma '
      + 'shuriken em sombra: quem Esquivar do primeiro é atingido pelo segundo." (idêntico '
      + 'a CC:1043, Fūma) · LJ:2591-2594 (Adendo) — "Sōshūriken no Jutsu — Manipulação de '
      + 'Shuriken · C · 4 · Fio ninja amarrado a shuriken já lançados: repita uma rolagem '
      + 'de ataque à distância que tenha falhado nesta rodada, e o alvo não pode Esquivar '
      + 'da segunda tentativa."',
    decisao:
      'As duas técnicas ficam como estão: são jutsus diferentes, de mesmo rank e mesmo '
      + 'custo. Na ficha, o subtítulo passa a fazer parte do nome, e nenhuma lista, busca '
      + 'ou seleção exibe o nome japonês sozinho: "Sōshuriken no Jutsu — Shuriken Gêmeo" e '
      + '"Sōshūriken no Jutsu — Manipulação de Shuriken". Buscar por qualquer grafia sem '
      + 'mácron retorna as duas.',
    porque:
      'P1: não há número a corrigir e nenhum dos dois textos contradiz o outro — o '
      + 'problema é de exibição. O livro já resolve a ambiguidade do jeito certo em todas '
      + 'as três ocorrências (LJ:1619-1620, LJ:2591 e CC:1043), sempre trazendo o subtítulo '
      + 'junto; a ficha só precisa não jogar o subtítulo fora.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      desambiguaTecnicas: [
        { chave: 'soshuriken_gemeo', nomeCompleto: 'Sōshuriken no Jutsu — Shuriken Gêmeo', rank: 'C', pc: 4, acerto: 'TAI' },
        { chave: 'soshuriken_manipulacao', nomeCompleto: 'Sōshūriken no Jutsu — Manipulação de Shuriken', rank: 'C', pc: 4, acerto: 'TAI' },
      ],
      exigirSubtitulo: true,
    },
  },

  {
    id: 'D24',
    titulo: 'Kaiten Shuriken vs. Fūton: Kaiten Shuriken',
    onde: 'CC:1040-1041 · LJ:2528-2531 · LJ:431',
    tipo: 'nome',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:1040-1041 (Fūma, Estágio I) — "Kaiten Shuriken · C · 4 · A shuriken orbita você '
      + 'por 3 rodadas: todo inimigo em Contato sofre 2d6, e você a redireciona como Ação '
      + 'Menor." · LJ:2528-2531 (Adendo) — "Fūton: Kaiten Shuriken — Shuriken Giratório · '
      + 'C · 4 · Vento moldado em disco: 2d6+NIN a Média, e o disco continua até o fim da '
      + 'zona — segundo alvo na linha sofre metade."',
    decisao:
      'Duas técnicas distintas, separadas pelo prefixo de natureza. (1) "Kaiten Shuriken" · '
      + 'Hiden — Fūma · C · 4 PC · sem natureza exigida · a shuriken orbita o usuário por 3 '
      + 'rodadas, 2d6 em todo inimigo em Contato, redirecionável como Ação Menor. '
      + '(2) "Fūton: Kaiten Shuriken — Shuriken Giratório" · Livre · C · 4 PC · exige Fūton '
      + 'dominado · 2d6+NIN a Média e o segundo alvo na linha sofre metade. A ficha nunca '
      + 'exibe uma sem o prefixo.',
    porque:
      'P1 e o Cap. 7: LJ:431 é explícito — "Jutsus de uma natureza que você não domina não '
      + 'podem ser aprendidos". A versão do Fūma é destravada no Estágio I de um clã que '
      + 'não concede Fūton em lugar nenhum, logo ela não pode ser a mesma técnica que a '
      + 'versão com prefixo Fūton. O prefixo de natureza é o marcador que o catálogo já usa '
      + 'para essa distinção em todo o Adendo (LJ:2474-2568).',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      desambiguaTecnicas: [
        { chave: 'kaiten_shuriken_fuma', rank: 'C', pc: 4, natureza: null, acesso: 'hiden_fuma', duracaoRodadas: 3 },
        { chave: 'futon_kaiten_shuriken', rank: 'C', pc: 4, natureza: 'futon', acesso: 'livre', dano: '2d6+NIN' },
      ],
    },
  },

  {
    id: 'D25',
    titulo: 'Chakra Nagashi custa 3 PC num rank em que tudo custa 4',
    onde: 'LJ:769-770 · LJ:1167 · LJ:1632 · LJ:1527-1540 · LJ:1624-1630',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:769-770 — "Custo em PC: E=1 · D=2 · C=4 · B=7 · A=11 · S=16", reafirmado em '
      + 'LJ:376 e LJ:2346-2352 · LJ:1167 — "Fluxo de Chakra Elemental · Rank C · 3 PC · '
      + 'Ação Menor" · LJ:1632 — "Chakra Nagashi (arma) · C · 3" · e o bloco de taijutsu e '
      + 'bukijutsu: Kage Buyō C/2 (LJ:1527-1529), Gatsūga B/5 (LJ:1540), Iaijutsu C/3 '
      + '(LJ:1624), Mikazuki no Mai B/6 (LJ:1627-1630).',
    decisao:
      'Fica como está. A tabela de LJ:769-770 é o custo padrão de ninjutsu elemental e o '
      + 'valor de referência para preencher lacunas; toda técnica que traga um custo '
      + 'próprio na sua linha usa o custo próprio. A ficha lê sempre o custo da linha da '
      + 'técnica, e só cai na tabela do rank quando a linha não traz nenhum (ver C03, C04, '
      + 'C05, C18). Chakra Nagashi custa 3 PC nas duas ocorrências; Kage Buyō custa 2, '
      + 'Iaijutsu 3, Mikazuki no Mai 6. Gatsūga é o único do bloco que muda, e não por '
      + 'esta decisão: por D17, o Compêndio o corrige para 7.',
    porque:
      'P1, no seu caso mais literal — o princípio cita justamente este padrão: "Kawarimi é '
      + 'rank E e custa 2 PC, quando todo rank E custa 1. Fica como está. Não é buraco, é '
      + 'escolha do autor." O bloco inteiro de taijutsu e bukijutsu é mais barato que a '
      + 'tabela pelo motivo que o Cap. 20 declara em LJ:1474-1475: "Taijutsu quase não '
      + 'consome chakra (...) é a única disciplina que continua inteira quando tudo o mais '
      + 'acabou." O desconto é o design. CORREÇÃO DA AUDITORIA: Iaijutsu e Mikazuki no Mai '
      + 'não estão em LJ:1517-1580 (Cap. 20, taijutsu) como a auditoria indica — estão no '
      + 'Cap. 21, Bukijutsu, em LJ:1624 e LJ:1627.',
    principio: 'P1',
    confianca: 'alta',
    aplica: { custoDaLinhaPrevalece: true, tabelaDeRankEhFallback: true },
  },

  {
    id: 'D26',
    titulo: 'Blocos de PNJ não obedecem às fórmulas de PV e PC',
    onde: 'LJ:200-201 · LJ:2334 · LJ:367-374 · LJ:2256 · LJ:2260 · LJ:2265 · LJ:2270 · LJ:2307 · LJ:2444-2449',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:200-201 e LJ:2334 — "PV = 25 + (COR × 3) + bônus de rank · PC = 12 + (ESP × 3) + '
      + 'bônus de rank"; bônus em LJ:367-374 · LJ:2265 — "JŌNIN DE ELITE · PV 68 · PC 46 · '
      + 'COR +6 / ESP +6" (a fórmula dá PV 63) · LJ:2270 — "AKATSUKI · PV 95 · PC 70 · '
      + 'COR +6 / ESP +7" (a fórmula dá PV 71 e PC 57) · LJ:2307 — "KAGERŌ · PV 44 · PC 30 '
      + '· COR +4 / ESP +3" (a fórmula dá PV 45 e PC 27).',
    decisao:
      'Os blocos impressos valem exatamente como estão: são o valor final do PNJ, e a '
      + 'ficha nunca os recalcula nem os "corrige". As fórmulas de LJ:200-201 são '
      + 'geradoras: servem para montar um PNJ novo, e só. Ao gerar, a ficha usa a fórmula '
      + 'com o bônus de rank de LJ:367-374, convertendo o rank em letras pela escala de '
      + 'LJ:2458-2464 (E/D Estudante-Genin · C Chūnin · B Jōnin Especial · A Jōnin · S '
      + 'Elite/Kage). Chefe solo dobra os PV do bloco só junto com as outras três regras de '
      + 'LJ:2444-2449, nunca isoladamente.',
    porque:
      'P1: os números impressos existem e valem, por mais que não fechem. E o Apêndice já '
      + 'diz por que dobrar PV isolado é errado (LJ:2441-2443). CORREÇÃO DA AUDITORIA: o '
      + 'furo é quase todo de PV, não das duas fórmulas. O PC do Jōnin de Elite fecha '
      + 'exatamente (12 + 18 + 16 = 46), o PC do Ninja Renegado de LJ:2260 também '
      + '(12 + 12 + 10 = 34, com o bônus de Jōnin Especial que a escala de LJ:2462 atribui '
      + 'ao rank B) e o Genin Rival fecha nos dois. A fórmula de PC bate em três dos cinco '
      + 'blocos citados.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      blocosPnj: {
        impressoPrevalece: true,
        formulaSoParaGerar: true,
        rankEmLetras: { E: 'estudante', D: 'genin', C: 'chunin', B: 'jonin_especial', A: 'jonin', S: 'elite' },
        chefeSolo: { pvDobrados: true, exigePacoteCompleto: true },
      },
    },
  },

  {
    id: 'D27',
    titulo: 'Terumī: corrosão máxima −3 vs. Kaiyō Metsu −5',
    onde: 'CC:1305-1307 · CC:1339-1340 · LJ:488',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:1305-1307 (passiva Sangue Corrosivo) — "Todos os seus jutsus daquela natureza '
      + 'reduzem a Defesa do alvo em 3 pelo resto da cena (...) A corrosão não acumula: o '
      + 'máximo é −3 por alvo, e uma Ação Principal do alvo remove a camada superficial." · '
      + 'CC:1339-1340 — "Kaiyō Metsu · S · 16 · (...) sobreviventes ficam Queimando com '
      + 'Defesa −5 pela cena."',
    decisao:
      'A corrosão da passiva impõe Defesa −3 e não acumula entre usos: o teto por alvo é '
      + '−3, e uma Ação Principal do alvo remove a camada. O Kaiyō Metsu impõe Defesa −5 '
      + 'pela cena como efeito próprio da técnica, e também não acumula com a passiva: um '
      + 'alvo atingido pelos dois fica com a pior das duas penalidades, −5. A Ação '
      + 'Principal do alvo remove a camada da passiva, nunca a do Kaiyō Metsu.',
    porque:
      'P1: os dois números existem e nenhum pode ser apagado. O teto de −3 é declarado '
      + 'sobre acúmulo ("a corrosão não acumula"), não sobre um valor maior vindo de fonte '
      + 'única — ler "não acumula" como "nenhuma técnica minha passa de 3" transformaria a '
      + 'única técnica rank S do clã em uma técnica pior que a passiva. E LJ:488 define '
      + 'rank S como o rank que "reescreve o campo, o terreno ou as regras", que é '
      + 'exatamente o que um −5 sobre um teto de −3 faz.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      corrosaoTerumi: { tetoPassiva: 3, kaiyoMetsu: 5, acumula: false, regra: 'pior_das_duas', removivelPorAcao: ['passiva'] },
    },
  },

  {
    id: 'D28',
    titulo: 'Sōzō Saisei: custa PC ou não',
    onde: 'LJ:1826-1832 · CC:346-347 · CC:349-350',
    tipo: 'conflito',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1826-1832 (Cap. 24) — "Sōzō Saisei · S · — (sem custo em PC) · Regenera todos os '
      + 'PV e 3d6/rodada por toda a cena. Cura Ferimentos Graves. Consome anos de vida do '
      + 'Byakugō. Sem ele, 1d10 anos por uso." · CC:346-347 (Senju) — "Consome toda a sua '
      + 'reserva de PC. Recupere todos os PV e regenere 3d6/rd pela cena; cura Ferimentos '
      + 'Graves. Sem o Byakugō, envelhece 1d10 anos por uso."',
    decisao:
      'Sōzō Saisei · S · Kinjutsu · consome toda a reserva de PC do usuário, levando-a a '
      + 'zero (e portanto aplicando Exausto de Chakra, LJ:707, até que ele recupere algum '
      + 'PC). Recupera todos os PV, regenera 3d6 por rodada pela cena e cura Ferimentos '
      + 'Graves. Sem o Byakugō no In, o usuário envelhece 1d10 anos por uso; com o Byakugō, '
      + 'o custo de vida desaparece mas o custo em PC continua — e é a segunda reserva do '
      + 'selo (CC:349-350) que o paga.',
    porque:
      'P2: vale o Compêndio, e aqui ele preenche uma coluna que o Livro do Jogador deixou '
      + 'em branco ("S · —"). O travessão do LJ é ausência de número, não um zero '
      + 'declarado — a mesma coluna traz "toda a reserva" para o Shiki Fūjin em LJ:1841, o '
      + 'que mostra que o autor sabia escrever esse custo quando queria.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      tecnica: 'sozo_saisei',
      rank: 'S',
      pc: 'toda_a_reserva',
      efeito: 'PV cheios, 3d6/rd pela cena, cura Ferimentos Graves',
      custoVida: '1d10 anos por uso sem o Byakugō no In',
    },
  },

  {
    id: 'D29',
    titulo: 'Framework de Estágios contradiz as tabelas de técnicas de metade dos clãs',
    onde: 'CC:60-71 · CC:264-267 · CC:1146 · CC:1380 · CC:1389 · CC:172-181 · CC:1598 · LJ:367-374 · LJ:393-396',
    tipo: 'conflito',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:60-71 — "III — Maestria: (...) + Estágio III (rank B). IV — Segredo: (...) + '
      + 'Estágio IV (rank A). V — Legado: (...) + a técnica rank S do clã." · Violações '
      + 'confirmadas: Hakkeshō Kaiten (A) e Hakke Rokujūyon Shō (A) no Estágio III '
      + '(CC:264-267); Sawarabi no Mai (A) no III (CC:1146-1148); Bakusui Shōha (A) no III '
      + '(CC:1380) e Daikōdan (S) no IV (CC:1389); Amaterasu, Tsukuyomi e Susanoo (S) no IV '
      + '(CC:172-181); Jinton: Genkai Hakuri (S) no IV (CC:1598).',
    decisao:
      'O rank impresso na linha da técnica prevalece sempre; a coluna de rank do framework '
      + '(CC:60-71) é descritiva — diz o rank típico de cada Estágio, não um requisito. A '
      + 'validação da ficha ("esta técnica está disponível para mim?") passa a usar duas '
      + 'condições, e só elas: (a) o Estágio marcado na coluna EST. da tabela do clã está '
      + 'destravado; (b) o personagem tem o rank de ninja mínimo para o rank da técnica '
      + '(LJ:367-374: Genin até C, Chūnin até B, Jōnin até A, Elite/Kage até S). Um Hyūga '
      + 'que destrave o Estágio III como Chūnin pode comprar o Hakkeshō Kaiten, mas só '
      + 'poderá usá-lo sem Sobrecarga quando for Jōnin.',
    porque:
      'P1: os ranks impressos nas tabelas dos clãs são números que existem, e são seis '
      + 'clãs contra uma linha de resumo. A segunda condição não é invenção: LJ:768 já '
      + 'exige "ter o rank mínimo — ou aceitar a Sobrecarga" para qualquer técnica, e a '
      + 'Sobrecarga (LJ:393-396) é a válvula que o sistema já tem para usar técnica acima '
      + 'do próprio teto. Ou seja, o livro já tinha a regra que resolve o conflito; ela só '
      + 'não estava sendo aplicada à coluna EST.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      validacaoEstagio: {
        usarRankDaLinha: true,
        exigirEstagioDestravado: true,
        exigirRankMinimoDeNinja: true,
        frameworkEhDescritivo: true,
        rankMaxPorRankDeNinja: { estudante: 'D', genin: 'C', chunin: 'B', jonin_especial: 'B', jonin: 'A', anbu: 'A', kage: 'S' },
      },
    },
  },

  {
    id: 'D30',
    titulo: 'Técnicas rank A custando 8 PC',
    onde: 'LJ:2351 · LJ:1558-1568 · CC:264-267 · CC:1422 · CC:1436',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:2351 (referência rápida) — "A · 11 PC · 5d6 · 14 PT · Carga 1" · LJ:1558-1568 e '
      + 'CC:264-267 — "Hakke Rokujūyon Shō · A · 8" e "Hakkeshō Kaiten · A · 8", nos dois '
      + 'volumes, com o mesmo valor · CC:1422 e CC:1436 — Raiton no Yoroi "A 8+3/rd", com '
      + 'nota explicando o desconto.',
    decisao:
      'Fica como está: 8 PC. Hakke Rokujūyon Shō e Hakkeshō Kaiten são rank A e custam '
      + '8 PC, nos dois livros. O Raiton no Yoroi do Yotsuki também custa 8 PC, e apenas '
      + 'para o Yotsuki (ver D14). O custo de 11 PC da tabela continua valendo para toda '
      + 'técnica rank A que não declare o seu.',
    porque:
      'P1 tem precedência sobre a exceção do P2, e é este o caso que a separa: a exceção '
      + 'do P2 existe para quando SÓ o Compêndio fura a tabela de ranks. Aqui os dois '
      + 'volumes trazem o mesmo 8 — LJ:1560 e LJ:1565 no Livro do Jogador, CC:264 e CC:267 '
      + 'no Compêndio —, e um valor que as duas edições repetem não é erro de digitação, é '
      + 'a escolha do autor. É o mesmo caso do Kawarimi (E, 2 PC) citado no próprio P1.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      tecnicas: [
        { tecnica: 'hakke_rokujuyon_sho', rank: 'A', pc: 8 },
        { tecnica: 'hakkesho_kaiten', rank: 'A', pc: 8 },
      ],
    },
  },

  {
    id: 'D31',
    titulo: 'Hatake tem três nomes para "duas Ações Principais"',
    onde: 'CC:846-852 · CC:871-872 · CC:1422 · CC:1426',
    tipo: 'conflito',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:846-848 — o Estágio IV destrava "Estilo ANBU-ryū sem custo, e Duplo Tempo" · '
      + 'CC:849-852 — o Estágio V destrava "Herdeiro da Presa Branca — 1×/combate, duas '
      + 'Ações Principais no mesmo turno" · CC:871-872 — "Nikai Jikan · A · 11 · Uma vez '
      + 'por combate, execute duas Ações Principais no mesmo turno." (listada no Estágio IV)',
    decisao:
      '"Duplo Tempo" e "Nikai Jikan" são a mesma coisa: o Estágio IV destrava o estilo '
      + 'ANBU-ryū sem custo de PT e torna o Nikai Jikan comprável (A · 11 PC · 14 PT, '
      + '12 PT com o desconto de Hiden do próprio clã). "Herdeiro da Presa Branca" '
      + '(Estágio V) é outra coisa: concede o mesmo efeito — 1×/combate, duas Ações '
      + 'Principais no mesmo turno — de graça, sem gastar PC e sem exigir a técnica. Quem '
      + 'tem os dois pode usar duas vezes por combate: uma pelo Estágio V, sem custo, e uma '
      + 'pelo Nikai Jikan, pagando 11 PC.',
    porque:
      'P6: "Duplo Tempo" é nome sem regra própria, e a menor coisa que faz o Estágio IV '
      + 'valer é ele ser o nome da técnica que aquele mesmo Estágio lista. E o Estágio V, '
      + 'que custa 18 PT (D06), não pode ser uma repetição do IV — o desenho de "a mesma '
      + 'coisa, agora de graça" é literal no Compêndio, no clã vizinho: CC:1422 destrava '
      + 'uma técnica da tabela "a custo reduzido" e CC:1426 destrava um efeito passivo '
      + '"uma vez por combate" sem técnica nenhuma. É o mesmo par.',
    principio: 'P6',
    confianca: 'media',
    aplica: {
      hatake: {
        estagio4: { destrava: ['anbu_ryu_sem_pt', 'nikai_jikan'], apelido: 'Duplo Tempo' },
        estagio5: { efeito: 'duas Ações Principais no mesmo turno, 1×/combate, sem custo em PC' },
      },
      tecnica: 'nikai_jikan',
      rank: 'A',
      pc: 11,
      pt: 12,
    },
  },

  {
    id: 'D32',
    titulo: 'Rajada de shurikens contradiz a regra 4 do Apêndice',
    onde: 'LJ:600 · LJ:2086 · LJ:2424-2428 · LJ:979-982 · LJ:2632-2634',
    tipo: 'conflito',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:600 — "Rajada de shurikens · TAI · 1d4 +TAI contra até 3 alvos na mesma zona" '
      + '(o mesmo em LJ:2086) · LJ:2424-2426 (Apêndice, regra 4) — "Em qualquer técnica '
      + 'que produza vários ataques no mesmo turno, role os dados de cada ataque '
      + 'normalmente, mas some o atributo apenas uma vez, no primeiro que acertar."',
    decisao:
      'Rajada de shurikens: role um ataque de 1d4 contra cada alvo (até três na mesma '
      + 'zona) e some o TAI uma única vez, no primeiro que acertar. Vale igualmente para o '
      + 'Shuriken (×10) de LJ:2086 e para toda técnica de ataques múltiplos que não diga o '
      + 'contrário.',
    porque:
      'P1 não desempata (os dois são números do livro), mas o Apêndice se declara '
      + 'superior: LJ:2404 diz que são "cinco regras curtas que valem acima de qualquer '
      + 'tabela deste livro". E a regra 4 não inventa nada — ela uniformiza uma redação '
      + 'que o catálogo já usa: Shinkūgyoku (LJ:979-982) diz "Três ataques de 1d6, '
      + 'resolvidos separadamente; NIN entra apenas no primeiro que acertar", e Konoha '
      + 'Daisenpū (LJ:2632-2634) e Fūton: Reppūshō Renbu (LJ:2535-2536) trazem a mesma '
      + 'frase. A linha de LJ:600 é a que ficou para trás.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      ataquesMultiplos: { somaAtributoUmaVez: true, quando: 'primeiro ataque que acertar' },
      tecnicas: [
        { tecnica: 'rajada_shurikens', dano: '1d4 por alvo, +TAI uma vez', alvos: 3 },
        { tecnica: 'shuriken_x10', dano: '1d4 por alvo, +TAI uma vez', alvos: 3 },
      ],
    },
  },

  {
    id: 'D33',
    titulo: 'Sharingan Cópia ganha uma restrição nova no Cap. 29',
    onde: 'LJ:548-549 · CC:163-164 · CC:2041-2042 · LJ:493-502 · LJ:507-508',
    tipo: 'termo',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:548-549 — "Copiar com Sharingan: (...) Não ignora o Selo de Sangue — nenhum '
      + 'Sharingan copia um Kekkei Genkai." (CC:163-164 idem) · CC:2041-2042 — "Cópia '
      + '(aprende técnicas vistas, ignorando o Selo do Mestre; não KG nem Hiden corporal)".',
    decisao:
      '"Hiden corporal" não é uma categoria de acesso nova: é o Selo de Sangue aplicado a '
      + 'um Hiden. Lê-se "técnica Hiden cujo Selo de Sangue seja uma característica física '
      + 'herdada". A Cópia do Sharingan, portanto, não pega: Kekkei Genkai, dōjutsu, e '
      + 'qualquer Hiden que exija um traço corporal do clã (Jūken e as Hakke, que exigem '
      + 'Byakugan; Shikotsumyaku; as técnicas Hōzuki de corpo líquido; as expansões '
      + 'Akimichi; as colônias Aburame; o Jūjin e o ninken; a fisiologia Hoshigaki). Pega '
      + 'normalmente Hiden que sejam só técnica e treino — Kagemane, Shintenshin, o Katon '
      + 'Hiden dos Sarutobi, taijutsu de clã sem requisito corporal — e tudo que seja '
      + 'Livre ou Restrito. Kinjutsu e Ōgi seguem as próprias regras (LJ:505, LJ:1790).',
    porque:
      'P4: o termo novo recebe a base na unidade que a regra já usa. O Cap. 9 (LJ:507-508) '
      + 'define o Selo de Sangue como "uma condição física, genética ou de recurso: um '
      + 'dōjutsu, uma reserva colossal, um Kekkei Genkai, um contrato" — que é exatamente o '
      + 'que "Hiden corporal" descreve com outro nome. O Cap. de Acesso (LJ:493-502) só '
      + 'conhece Livre, Restrito, Hiden, Kekkei Genkai, Kinjutsu e Ōgi, então a alternativa '
      + 'seria criar uma sétima categoria — o que P6 desaconselha e P4 torna desnecessário.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      copiaSharingan: {
        bloqueia: ['kekkei_genkai', 'dojutsu', 'hiden_com_requisito_corporal'],
        permite: ['livre', 'restrito', 'hiden_sem_requisito_corporal'],
        ignoraSeloDoMestre: true,
        ignoraSeloDeSangue: false,
      },
    },
  },

  {
    id: 'D34',
    titulo: 'Ninken com Reação própria contradiz a regra 2 do Apêndice',
    onde: 'CC:655-656 · CC:690-691 · CC:2104 · LJ:2413-2415 · CC:1426',
    tipo: 'conflito',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:655-656 (Inuzuka, Estágio IV) — "Uma segunda matilha invocável, e o ninken passa '
      + 'a ter a própria Reação por rodada." · CC:690-691 — "Age no seu turno usando a sua '
      + 'Ação Menor" · CC:2104 e LJ:2413-2415 (regra 2) — "Nenhum efeito concede Reações '
      + 'adicionais por rodada."',
    decisao:
      'O Estágio IV do Inuzuka concede ao ninken uma Reação por combate, não por rodada. '
      + 'Fora dela, o ninken continua agindo no turno do ninja com a Ação Menor dele '
      + '(CC:690) e não tem economia de ações própria.',
    porque:
      'P2 não desempata — as duas passagens são do Compêndio —, e a regra 2 do Apêndice '
      + 'vale acima de qualquer tabela (LJ:2404), estando reproduzida dentro do próprio '
      + 'Compêndio em CC:2104. A regra 2 também nomeia a saída: "as passivas que digam '
      + 'explicitamente \'uma vez por combate\'". É a mesma reescrita aplicada em D15, e o '
      + 'modelo é o Reflexo Relâmpago Yotsuki (CC:1426).',
    principio: 'P1',
    confianca: 'alta',
    aplica: { inuzuka: { estagio4: { ninkenReacao: { quantidade: 1, por: 'combate' }, segundaMatilha: true } } },
  },

  // ────────────────────────────────────────────────────────────────
  //  SEÇÃO 4 — LIVRO DO JOGADOR, POR CAPÍTULO
  // ────────────────────────────────────────────────────────────────

  {
    id: 'A10',
    titulo: 'Decisivo: o que é "efeito em dobro"',
    onde: 'LJ:140 · LJ:145',
    tipo: 'grandeza',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:140 — "Total ≥ CD + 5 · Decisivo: Você consegue o que queria e mais: +1d6 de '
      + 'dano, uma informação extra, uma posição melhor, ou efeito em dobro." · LJ:145 — '
      + '"d20 = 20 · Crítico: (...) Em ataques, dobre os dados de dano (não o modificador)."',
    decisao:
      'Num Decisivo, "efeito em dobro" dobra o primeiro valor numérico que a técnica '
      + 'declarar, nesta ordem: duração em rodadas → número de alvos → número de zonas. Se '
      + 'a técnica não declarar nenhum dos três, o Decisivo entrega o +1d6 de dano da mesma '
      + 'linha. Nunca dobra dados de dano (isso é o Crítico), nunca dobra CD, e nunca dobra '
      + 'valores que já são "toda a cena" ou "permanente" — nesses casos, cai para o item '
      + 'seguinte da ordem.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. A própria linha de LJ:140 lista '
      + 'quatro ganhos alternativos, um deles já numérico, o que fixa a escala do que um '
      + 'Decisivo vale; e LJ:145 mostra que o livro sabe delimitar o que dobra quando '
      + 'quer ("dobre os dados de dano, não o modificador"), o que é razão para não deixar '
      + 'o Decisivo dobrar dados também. INVENÇÃO MINHA: a ordem de precedência entre '
      + 'duração, alvos e zonas. Ela não está em lugar nenhum; escolhi duração primeiro '
      + 'porque é a grandeza que o catálogo mais declara.',
    principio: 'P4',
    confianca: 'baixa',
    aplica: {
      decisivoEfeitoDobro: {
        ordem: ['duracaoRodadas', 'alvos', 'zonas'],
        fallback: '+1d6 de dano',
        nuncaDobra: ['dadosDeDano', 'cd', 'duracaoPermanente'],
      },
    },
  },

  {
    id: 'A16',
    titulo: 'O que é "vantagem elemental esmagadora"',
    onde: 'LJ:155-156 · LJ:418-423',
    tipo: 'grandeza',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:155-156 — "Concede Vantagem: (...) vantagem elemental esmagadora." · LJ:418 — '
      + '"A roda: Fogo → Vento → Raio → Terra → Água → Fogo. Cada elemento vence o '
      + 'seguinte." · LJ:423 — "Uma técnica 2+ ranks superior ignora a desvantagem '
      + 'elemental por completo. Domínio supera afinidade."',
    decisao:
      'Vantagem elemental esmagadora = vencer o alvo na roda elemental E usar uma técnica '
      + 'de rank 2 ou mais acima da técnica ou defesa oposta. Só nesse caso a circunstância '
      + 'concede Vantagem no d20. A vantagem elemental simples continua entregando '
      + 'exatamente o que o Cap. 7 já dá — +3 no embate direto, e defesa elemental inferior '
      + 'valendo metade (LJ:420-422) — e não vira Vantagem.',
    porque:
      'P4: a única gradação elemental que o livro mede está em LJ:423, e ela mede em '
      + 'ranks — "2+ ranks superior". "Esmagadora" recebe a base na mesma unidade. A '
      + 'leitura também evita o efeito perverso de deixar toda troca elemental favorável '
      + 'virar Vantagem, o que tornaria a roda o modificador dominante do sistema e '
      + 'colidiria com LJ:152 ("Elas se cancelam e nunca se acumulam").',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      vantagemElementalEsmagadora: { exige: ['vence_na_roda', 'diferencaDeRank>=2'], concede: 'Vantagem' },
    },
  },

  {
    id: 'C-c4',
    titulo: 'O Laço das Origens não tem efeito mecânico',
    onde: 'LJ:236-259 · LJ:332',
    tipo: 'gatilho',
    impacto: 'cosmético',
    oQueOLivroDiz:
      'LJ:236-238 — "Toda origem dá exatamente a mesma coisa: uma perícia treinada, um '
      + 'Traço estreito que só funciona numa situação específica, e um Laço, que é a alça '
      + 'pela qual o Mestre puxa a sua história. Origens não dão poder de combate." · Cada '
      + 'uma das oito origens (LJ:240-259) traz um Laço sem número.',
    decisao:
      'O Laço fica sem mecânica própria: nenhum bônus, nenhum teste, nenhum recurso. A '
      + 'ficha o registra como texto livre, ao lado do Fardo. O que ele faz em regra é '
      + 'servir de gatilho para a recuperação de Vontade do Fogo: quando o jogador aceita '
      + 'uma complicação séria vinda do seu Laço, o Mestre concede 1 PVF pela via já '
      + 'escrita em LJ:332.',
    porque:
      'P1: o livro nunca lhe atribuiu número e diz explicitamente que "Origens não dão '
      + 'poder de combate" (LJ:238). Inventar um efeito seria escrever o livro do autor. A '
      + 'ligação com o PVF não é invenção: LJ:332 já lista "aceita uma complicação séria do '
      + 'seu Fardo" como gatilho de recuperação, e o Laço é descrito com a mesma função '
      + 'narrativa ("a alça pela qual o Mestre puxa a sua história").',
    principio: 'P1',
    confianca: 'alta',
    aplica: { laco: { mecanica: null, campoLivre: true, gatilhoDePvf: true } },
  },

  {
    id: 'C08',
    titulo: 'O teto de Pontos de Vontade do Fogo nunca é declarado',
    onde: 'LJ:320-321 · LJ:332 · LJ:2037 · CC:770-771 · CC:1084',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:320-321 — "Cada personagem começa cada sessão com 3 PVF." · LJ:332 — "O Mestre '
      + 'concede 1 PVF (até 3) quando um jogador age conforme seu Ninja Way..." · LJ:2037 '
      + '(Konoha) — "1 Ponto de Vontade do Fogo adicional por sessão." · CC:770-771 '
      + '(Sarutobi) — "Você começa cada sessão com 4 Pontos de Vontade do Fogo em vez de '
      + '3." · CC:1084 (Ninja Comum, Estágio II) — "Teimosia: +1 Ponto de Vontade do Fogo '
      + 'por sessão."',
    decisao:
      'O teto de PVF de um personagem é igual ao seu valor inicial de sessão, e nada mais. '
      + 'O inicial é 3, somados os modificadores que digam "por sessão" ou "em vez de 3": '
      + 'Konoha +1, Sarutobi define 4 no lugar de 3, Ninja Comum de Estágio II +1. Um '
      + 'Sarutobi de Konoha começa com 5 e o teto dele é 5. A recuperação em jogo (LJ:332) '
      + 'enche até o teto do personagem, não até 3. PVF não se acumula entre sessões '
      + '(LJ:321).',
    porque:
      'P4: a base sai do texto vizinho na mesma unidade. "Até 3" em LJ:332 é o teto lido '
      + 'para o personagem padrão de LJ:320-321, cujo inicial é justamente 3 — as duas '
      + 'frases estão a doze linhas de distância e usam o mesmo número. Todos os efeitos '
      + 'que mexem no recurso mexem no valor inicial; nenhum dos cinco textos menciona um '
      + 'teto separado. E um teto fixo de 3 apagaria três passivas compradas, uma delas a '
      + 'passiva inteira de um clã (CC:772: "Nenhum outro clã interage com o recurso '
      + 'central do jogo").',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      pvf: {
        base: 3,
        teto: 'igual ao inicial do personagem',
        acumulaEntreSessoes: false,
        modificadores: { konoha: 1, sarutobi: { define: 4 }, ninja_comum_estagio_ii: 1 },
      },
    },
  },

  {
    id: 'A22',
    titulo: 'Respiro recupera "ESP + rank", e há sete ranks para cinco valores',
    onde: 'LJ:381 · LJ:109-116 · LJ:367-374 · LJ:2458-2465',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:381 — "Respiro · ~10 minutos · PC igual a ESP + rank (Genin 1… Kage 5). Uma vez '
      + 'por cena." · LJ:109-116 lista sete ranks · LJ:2465 (Apêndice) — "Na manobra '
      + 'Estudar, \'CD 10 + rank do alvo\' significa somar 1 para Genin, 2 para Chūnin, 3 '
      + 'para Jōnin Especial, 4 para Jōnin e 5 para Elite ou acima."',
    decisao:
      'Rank vale como número segundo esta tabela, e ela vale em toda fórmula dos dois '
      + 'livros que escreva "rank" como valor: Estudante 0 · Genin 1 · Chūnin 2 · Jōnin '
      + 'Especial 3 · Jōnin 4 · ANBU/Elite 5 · Kage/Sannin 5. Logo, o Respiro recupera '
      + 'ESP + esse número em PC, uma vez por cena.',
    porque:
      'P1 e P4: o livro já publicou esta conversão, com exatamente estes cinco valores, em '
      + 'LJ:2465 — e "Elite ou acima" já resolve ANBU e Kage juntos, exatamente como '
      + 'LJ:381 os resolve ao escrever "Genin 1… Kage 5". O Apêndice declara a conversão só '
      + 'para a manobra Estudar, mas é a única unidade numérica de rank que o sistema tem, '
      + 'e usá-la em outra fórmula é copiar o vizinho, não arbitrar. INVENÇÃO MINHA: o zero '
      + 'do Estudante, que não aparece em lugar nenhum; escolhi 0 porque o Estudante é o '
      + 'único rank com bônus negativo de PC (LJ:368: −4) e é declarado "prólogo opcional" '
      + '(LJ:110).',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      rankNumerico: { estudante: 0, genin: 1, chunin: 2, jonin_especial: 3, jonin: 4, anbu: 5, kage: 5 },
      usadoEm: ['respiro', 'selos_preparados', 'pv_marionete', 'pv_ninken', 'cd_estudar'],
    },
  },

  {
    id: 'C25',
    titulo: 'A "especialidade" do Jōnin Especial nunca é definida',
    onde: 'LJ:371 · LJ:465 · CC:328-329 · LJ:1942',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:371 — "Jōnin Especial · +14 PV · +10 PC · atributo máx. +5 · rank máx. de jutsu: '
      + 'B (A na especialidade)." · "Especialidade" não é escolhida em nenhum passo da '
      + 'criação (LJ:235-315) nem da progressão (LJ:2146-2181).',
    decisao:
      'Na promoção a Jōnin Especial o personagem declara uma especialidade e a registra na '
      + 'ficha, de uma vez e para sempre. A especialidade é um dos seis atributos (TAI, '
      + 'NIN, GEN, CTR, COR, ESP) ou a perícia Fūinjutsu. O rank máximo de jutsu passa a '
      + 'ser B em geral e A nas técnicas cujo campo Acerto seja o atributo declarado — ou, '
      + 'no caso do Fūinjutsu, nas técnicas do Cap. 18. Trocar a especialidade exige nova '
      + 'promoção.',
    porque:
      'P4: a única classificação que o livro usa para dizer "de que tipo é esta técnica" é '
      + 'o campo Acerto do Cap. 8 (LJ:465: "Qual atributo se soma ao d20"), e o Compêndio '
      + 'já usa exatamente esse recorte para um efeito de escolha declarada — Senju no '
      + 'Kamae (CC:328-329): "Declare uma disciplina (Taijutsu, Ninjutsu, Genjutsu, '
      + 'Controle)". O Fūinjutsu entra na lista porque o livro trata fūinjutsu como '
      + 'especialidade nomeada em requisitos: LJ:1942 exige "Fūinjutsu Mestre, CTR +6" para '
      + 'o Hiraishin, sem citar atributo de acerto.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      joninEspecial: {
        declararNaPromocao: true,
        opcoes: ['TAI', 'NIN', 'GEN', 'CTR', 'COR', 'ESP', 'fuinjutsu'],
        rankMaxJutsu: 'B',
        rankMaxNaEspecialidade: 'A',
      },
    },
  },

  {
    id: 'C07',
    titulo: 'Inton e Yang: custo em PT — PROPOSTA, aguarda o autor',
    onde: 'LJ:426-441 · LJ:2162',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:426-430 — "Primeira (afinidade) grátis · Segunda natureza 8 PT · Terceira 14 PT '
      + '· Quarta e quinta 20 PT cada", com rank mínimo Chūnin, Jōnin e Elite · '
      + 'LJ:433-439 — Inton exige "GEN +3, ou clã que a use por Hiden" e Yōton (Yang) exige '
      + '"CTR +4, ou clã que a use por Hiden", sem PT e sem rank · LJ:440-441 — "Onmyōton '
      + '(Yin-Yang) (...) Não é adquirível por PT."',
    //  ATENCAO: e a unica entrada que o autor reservou para si. Ele ja
    //  decidiu a FORMA ("requisito de atributo E custo proprio em PT") e
    //  disse que daria o numero. Enquanto o numero nao vier, a ficha NAO
    //  cobra nada: `PT_CUSTOS_AVDF.naturezaEspecial` segue `null` em
    //  dados.js. O texto abaixo e a proposta, nao a regra em vigor.
    aguardaAutor: true,
    decisao:
      'PROPOSTA, ainda nao em vigor — o autor reservou este numero para si. Inton e Yang entrariam na mesma tabela das cinco naturezas, ocupando a posicao '
      + 'seguinte na contagem do personagem: custam 8 PT se forem a sua segunda natureza, '
      + '14 se forem a terceira, 20 se forem a quarta ou quinta, e exigem o rank mínimo '
      + 'daquela posição (Chūnin, Jōnin, Elite) além do requisito de atributo próprio '
      + '(GEN +3 para Inton, CTR +4 para Yang). Quem recebe Yin ou Yang de graça pelo clã '
      + 'não gasta a posição. Onmyōton continua não comprável.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. Inton e Yōton estão impressos '
      + 'imediatamente abaixo da tabela de naturezas, no mesmo capítulo e na mesma página '
      + '(LJ:425-439), e o próprio livro retira explicitamente da tabela o que não deve '
      + 'entrar nela — LJ:440-441 faz isso com o Onmyōton, e não faz com Inton nem com '
      + 'Yang. Ler o silêncio como "grátis" tornaria Inton mais barato que Katon, e daria '
      + 'genjutsu de sombra de graça a qualquer personagem com GEN +3.',
    principio: 'P4',
    confianca: 'alta',
    //  Sem `aplica`: uma proposta nao mexe em numero nenhum.
  },

  {
    id: 'A09',
    titulo: 'Corrente de elementos: Fogo+Vento dá "área dobrada" sem base',
    onde: 'LJ:736 · LJ:964-967 · LJ:824-827',
    tipo: 'grandeza',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:736 — "Corrente de elementos: Dois jutsus compatíveis no mesmo alvo combinam: '
      + 'Fogo+Vento = área dobrada; Água+Raio = Atordoado; Terra+Água = Preso."',
    decisao:
      'Área dobrada = a técnica de Katon passa a cobrir uma zona adicional adjacente, à '
      + 'escolha de quem lançou o Katon. Se a técnica já cobre duas zonas, passa a cobrir '
      + 'quatro; se atinge um alvo e não uma zona, passa a atingir a zona inteira do alvo. '
      + 'O dano continua o da técnica de Katon, sem multiplicação.',
    porque:
      'P4: o livro mede área em zonas (LJ:574-582) e já tem a conta feita em dois lugares. '
      + 'Daitoppa (LJ:964-967) traz a mesma sinergia escrita como técnica — "Combinada com '
      + 'Katon aliado: Fogo +2d6 e dobra a área" — e Daigōkakyū (LJ:824-827) define o dobro '
      + 'do Gōkakyū como "Atinge duas zonas adjacentes". O dobro de "uma zona" no livro é '
      + '"duas zonas adjacentes". INVENÇÃO MINHA: quem escolhe a zona adicional; atribuí a '
      + 'quem lançou o Katon porque a sinergia é nomeada "Fogo+Vento", nessa ordem.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      correnteElementos: {
        fogo_vento: { efeito: '+1 zona adjacente (dobra a área medida em zonas)', escolhe: 'usuario_katon', danoInalterado: true },
      },
    },
  },

  {
    id: 'C-c7',
    titulo: 'Corrente de elementos: Água+Raio e Terra+Água sem teste e sem CD',
    onde: 'LJ:736 · LJ:687 · LJ:1012 · LJ:2544 · LJ:2554',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:736 — "Água+Raio = Atordoado; Terra+Água = Preso." (sem teste de resistência e, '
      + 'no caso de Preso, sem CD de escape) · LJ:687 — "Preso: (...) Ação Principal + TAI '
      + 'ou COR vs CD do efeito."',
    decisao:
      'Água+Raio: o alvo faz um teste de COR contra o CD do efeito; na falha, fica '
      + 'Atordoado. Terra+Água: o alvo fica Preso, sem teste de entrada, e sai pela regra '
      + 'normal do Cap. 14 contra o CD do efeito. Nos dois casos, o CD do efeito é 10 + o '
      + 'atributo de acerto do segundo jutsu da corrente — o que fecha a combinação.',
    porque:
      'P3 para o CD, literal. O teste de COR contra Atordoado vem por P4: toda imposição '
      + 'de Atordoado por Raiton no catálogo que não seja automática é resistida por COR — '
      + 'Shibire (LJ:1012) "COR CD 11 ou Atordoado", Raiton: Kage Bunshin (LJ:2544) "COR '
      + 'CD 14", Raiton: Raikōhō (LJ:2554) "COR CD 15". Raio atordoa contra COR, sempre. O '
      + 'Preso não recebe teste de entrada porque nenhuma das técnicas de Doton que o '
      + 'impõem dá um (Shichūrō LJ:1117, Yomi Numa LJ:1153, Iwa Yado Kuzushi LJ:1137): elas '
      + 'declaram o CD de saída e mais nada.',
    principio: 'P3',
    confianca: 'alta',
    aplica: {
      correnteElementos: {
        agua_raio: { teste: 'COR', cd: 'formula', condicao: 'Atordoado' },
        terra_agua: { teste: null, cd: 'formula', condicao: 'Preso' },
      },
      cdPadrao: 'formula',
    },
  },

  {
    id: 'A18',
    titulo: 'Modo Sábio exige "reservas excepcionais" sem limiar numérico',
    onde: 'LJ:536 · LJ:1734 · LJ:1737 · LJ:365-372',
    tipo: 'grandeza',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:536 — "Modo Sábio (S) · ① Sangue: Contrato + ESP +5 + reservas enormes." · '
      + 'LJ:1734 — "Selo de Sangue: ESP +5, reservas excepcionais e um contrato com sapos, '
      + 'cobras ou lesmas." · LJ:1737 — "Custo: 24 PT. Rank mínimo: Jōnin."',
    decisao:
      'Reservas excepcionais = PC máximo igual ou superior a 40. O Selo de Sangue do Modo '
      + 'Sábio fica assim: ESP +5, contrato assinado com sapos, cobras ou lesmas, rank '
      + 'mínimo Jōnin e PC máximo ≥ 40. Custo 24 PT, mais os Selos do Mestre e da Prova.',
    porque:
      'P4: a cláusula não é uma barreira nova, é um piso que confere o que os outros dois '
      + 'requisitos já produzem. Pela fórmula de LJ:365 e pelo bônus de rank de LJ:372, um '
      + 'Jōnin com ESP +5 tem PC 43 e um Jōnin com ESP +4 tem 40 — o limiar de 40 é a '
      + 'reserva mínima compatível com o resto do requisito, e o que ele efetivamente pega '
      + 'é o personagem que chegou a ESP +5 por outro caminho (talento Reservas Profundas, '
      + 'transplante, Sobrecarga) sem ter a reserva junto. INVENÇÃO MINHA: o número 40. '
      + 'Nenhum limiar aparece nos dois livros; ele foi derivado da fórmula de PC e não '
      + 'está escrito em lugar nenhum. CORREÇÃO DA AUDITORIA: as duas citações estão '
      + 'trocadas — é LJ:536 que diz "reservas enormes" e LJ:1734 que diz "reservas '
      + 'excepcionais", não o contrário.',
    principio: 'P4',
    confianca: 'baixa',
    aplica: {
      modoSabio: { pcMaximoMinimo: 40, esp: 5, contrato: ['sapos', 'cobras', 'lesmas'], rankMinimo: 'jonin', pt: 24 },
    },
  },

  {
    id: 'C-c9',
    titulo: 'Modificadores de PT: acumulam? existe piso?',
    onde: 'LJ:513-516 · LJ:1790 · LJ:543',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:513-514 — "Custo em PT: E 1 · D 2 · C 4 · B 8 · A 14 · S 24" · LJ:515-516 — '
      + '"Modificadores: natureza afim −1 PT · Hiden do próprio clã −2 PT · aprendida de um '
      + 'mestre em cena −2 PT · só por pergaminho, sem professor +2 PT · fora de qualquer '
      + 'natureza que você domine: impossível."',
    decisao:
      'Os modificadores de PT acumulam entre si, aplicados sobre o custo do rank, e o '
      + 'custo final nunca fica abaixo de 1 PT. Kinjutsu não recebe modificador nenhum '
      + '(LJ:1790). O acréscimo de +50% da pesquisa própria (LJ:543) é aplicado antes dos '
      + 'modificadores e arredondado para cima, como o texto manda.',
    porque:
      'P1 para o acúmulo: os quatro modificadores estão escritos na mesma linha, com o '
      + 'mesmo separador e o mesmo formato, do jeito que o livro escreve modificadores '
      + 'somáveis em toda parte. P5 para o piso — "nada que cause efeito cai a zero" — e '
      + 'reforçado por LJ:513-514, onde o menor custo publicado no livro inteiro é 1 PT. '
      + 'Sem o piso, um jutsu rank E aprendido de um mestre do próprio clã custaria −2 PT, '
      + 'ou seja, pagaria o jogador para aprender.',
    principio: 'P5',
    confianca: 'alta',
    aplica: {
      ptModificadores: {
        acumulam: true,
        piso: 1,
        valores: { natureza_afim: -1, hiden_do_proprio_cla: -2, mestre_em_cena: -2, so_pergaminho: 2 },
        kinjutsuSemDesconto: true,
        pesquisaPropria: { multiplicador: 1.5, arredonda: 'cima', antesDosModificadores: true },
      },
    },
  },

  {
    id: 'A17',
    titulo: 'Nenhuma arma da tabela é "arma grande"',
    onde: 'LJ:598 · LJ:2084-2093 · LJ:1679',
    tipo: 'grandeza',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:598 — "Arma branca (kunai, tantō, espada) · TAI · 1d6 +TAI (+1 se for uma arma '
      + 'grande)." · A tabela de equipamento (LJ:2084-2093) não marca nenhuma arma como '
      + 'grande, e a espada longa / ōdachi já causa 1d8+TAI (LJ:2090).',
    decisao:
      'Nenhuma arma comprável recebe o +1: onde a arma tem linha própria na tabela de '
      + 'equipamento, o dado dessa linha é o valor final e já embute o porte (kunai '
      + '1d6+TAI, espada longa 1d8+TAI, Fūma Shuriken 2d6+TAI). O "+1 se for uma arma '
      + 'grande" de LJ:598 é a regra genérica para armas grandes improvisadas e sem linha '
      + 'própria — um tronco, uma marreta, um remo, um portão arrancado: 1d6+TAI+1. Armas '
      + 'nomeadas de PNJ com dado declarado (Kubikiribōchō, 2d8+TAI, LJ:1679) seguem o '
      + 'mesmo princípio: o dado maior é o benefício, não um +1 somado por cima.',
    porque:
      'P1: onde há dado impresso, o dado vale, e o livro imprimiu dado para tudo o que '
      + 'vende. A tabela do Cap. 11 (LJ:596-603) é a tabela de ataques genéricos — o que '
      + 'fazer quando não há linha de arma — e o Cap. 32 sobrescreve cada caso nomeado. '
      + 'Somar o +1 à espada longa a levaria a 1d8+TAI+1, acima da própria escala de dano '
      + 'do rank C (2d6) num ataque que não custa nada.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      armaGrande: { naTabela: [], improvisada: { dano: '1d6+TAI+1' }, regra: 'dado da linha da arma prevalece' },
    },
  },

  {
    id: 'E12',
    titulo: 'Empate em duelo de jutsu cria "terreno alterado" sem regra',
    onde: 'LJ:624 · LJ:587 · LJ:1120-1123 · LJ:790-791 · LJ:2488-2489',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:622-624 — "Vencedor por 5+: o jutsu perdedor é anulado (...) Empate: ambos se '
      + 'anulam. O choque cria terreno alterado — vapor, cratera, chamas — que afeta a '
      + 'rodada seguinte."',
    decisao:
      'No empate de um duelo de jutsu, a zona de cada um dos dois jutsus (ou a zona única '
      + 'do choque, se colidirem no mesmo lugar) vira terreno difícil pela rodada seguinte: '
      + 'mover uma zona a partir dela gasta a Ação Menor além do movimento livre (LJ:587). '
      + 'Além disso, quem terminar o turno numa dessas zonas sofre 1d6 do elemento que '
      + 'vence na roda entre os dois; se os elementos empatarem na roda ou não houver '
      + 'elemento, 1d6 sem elemento. Ao fim da rodada seguinte, o terreno some.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. O livro já tem a forma pronta de '
      + '"o jutsu deixou terreno": Doryū Taiga (LJ:1120-1123) — "Duas zonas viram lama: '
      + 'terreno difícil"; Kaenbin (LJ:790-791) — "cria uma zona em chamas por 3 rodadas"; '
      + 'Hibashiri (LJ:805-806) — "Deixa terreno em chamas". E 1d6 é o dano de terreno '
      + 'persistente que o catálogo repete: Katon: Gōenkyū (LJ:2488-2489) "quem terminar o '
      + 'turno ali sofre 1d6" e Yōton: Yōgan Kyū (CC:1326) "1d6/rd a quem estiver nele". '
      + 'A duração de uma rodada é literal em LJ:624.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      duelo: {
        empate: { zonasAfetadas: 'a de cada jutsu', terreno: 'dificil', duracaoRodadas: 1, dano: '1d6', elemento: 'vencedor da roda, ou nenhum' },
      },
    },
  },

  {
    id: 'E03',
    titulo: 'Não existe regra de surpresa, mas surpresa concede acerto automático',
    onde: 'LJ:618 · LJ:2434 · LJ:163-164 · LJ:214-216 · CC:220-221 · CC:832 · LJ:1487 · LJ:1748 · CC:935',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:618 e LJ:2434 — "Alvo indefeso: Inconsciente, amarrado ou totalmente '
      + 'surpreendido: o ataque acerta automaticamente e é tratado como crítico." · Nenhum '
      + 'capítulo define como se determina surpresa. Dependem disso: CC:832 (Hatake, "Você '
      + 'nunca é surpreendido"), CC:220-221 (Byakugan, "não pode ser flanqueado nem '
      + 'surpreendido"), LJ:1487 (ANBU-ryū, "alvos que não sabem da sua presença"), LJ:1748 '
      + '(Modo Sábio, "Não pode ser surpreendido") e CC:935 (Ne no Kamae).',
    decisao:
      'Há surpresa quando um lado inicia o combate sem que o outro saiba da sua presença. '
      + 'Antes de rolar iniciativa, o lado oculto faz um teste resistido de Furtividade '
      + '(COR) contra a Percepção (ESP) do lado exposto — um teste por lado, resolvido pelo '
      + 'maior total, empate favorecendo o defensor (LJ:164). Quem perde fica TOTALMENTE '
      + 'SURPREENDIDO até agir pela primeira vez no combate: nesse intervalo é alvo '
      + 'indefeso (acerto automático tratado como crítico) e não tem Reação. Rolada a '
      + 'iniciativa, todos agem na ordem normal — não existe rodada de surpresa separada. '
      + 'Byakugan ativo, a passiva Instinto de Campo dos Hatake e o Modo Sábio ativo tornam '
      + 'o personagem imune: ele nunca perde esse resistido.',
    porque:
      'P4 e P1. O teste é o que o próprio livro nomeia como exemplo canônico de teste '
      + 'resistido: LJ:163-164 lista "furtividade contra percepção" ao lado de "genjutsu '
      + 'contra vontade" e "um agarrão", e as duas perícias existem com esses atributos '
      + '(LJ:214 e LJ:216). O efeito já está escrito em LJ:618 — não invento nenhum. A '
      + 'janela "até agir pela primeira vez" é a mais curta possível e evita tirar turnos '
      + 'de jogador, o que LJ:1470-1471 declara como regra de conduta do sistema; ela '
      + 'também combina com o Kanashibari (LJ:1218-1219), que já trata a abertura da luta '
      + 'como um estado distinto ("Ineficaz contra quem já luta há duas rodadas"). As três '
      + 'imunidades são literais nos textos citados.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      surpresa: {
        quando: 'antes da iniciativa',
        teste: 'resistido',
        ataque: 'Furtividade (COR)',
        defesa: 'Percepção (ESP)',
        empate: 'defensor',
        efeito: 'alvo indefeso e sem Reação, até agir pela primeira vez',
        rodadaDeSurpresa: false,
        imunes: ['byakugan_ativo', 'hatake_instinto_de_campo', 'modo_sabio_ativo'],
      },
    },
  },

  {
    id: 'E04',
    titulo: '"Adjacente" nunca é convertido em zona',
    onde: 'LJ:1493 · CC:878 · CC:1387 · CC:1705 · LJ:574-582 · LJ:733',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1493 (Jūjin) — "com o ninken adjacente, ambos +2 no acerto" · CC:878 (Shiroi '
      + 'Kiba: Kanzen) — "aliados adjacentes ganham +3 de Defesa" · CC:1387 (Samehada: '
      + 'Kyūin) — "direcionado a você ou a um aliado adjacente" · CC:1705 (Kugutsu: '
      + 'Sanshōuo) — "contra você ou um aliado adjacente" · LJ:574-582 mede distância só em '
      + 'zonas.',
    decisao:
      'Adjacente = na zona Contato (0–2 m, LJ:576). Toda ocorrência de "adjacente" nos '
      + 'dois volumes lê-se "em Contato com você". A ficha nunca oferece "adjacente" como '
      + 'faixa de alcance própria: converte na leitura.',
    porque:
      'P4: o sistema mede tudo em zonas, e a zona que significa "ao meu lado" é Contato. O '
      + 'próprio livro escreve a mesma ideia na unidade certa quando presta atenção — '
      + 'Flanqueio (LJ:733): "Dois aliados em Contato com o mesmo inimigo: ambos ganham +2 '
      + 'no acerto", que é exatamente o mesmo arranjo que o Jūjin (LJ:1493) descreve com '
      + '"adjacente" e o mesmo bônus de +2.',
    principio: 'P4',
    confianca: 'alta',
    aplica: { adjacente: 'contato' },
  },

  {
    id: 'C12',
    titulo: 'A condição Preso é aplicada sem CD por pelo menos nove técnicas',
    onde: 'LJ:687 · LJ:465 · CC:466 · CC:490 · CC:1151 · CC:1222 · CC:1768 · CC:1272 · CC:1988 · LJ:1066-1069 · LJ:1724 · LJ:736',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:687 — "Preso: Não pode se mover. Ataques contra você com Vantagem. Não pode '
      + 'Esquivar. Como sair: Ação Principal + TAI ou COR vs CD do efeito." · Aplicam '
      + 'Preso sem declarar CD: Kagemane (CC:466), Kagemane: Kanzen (CC:490), Tessenka no '
      + 'Mai: Tsuru (CC:1151), Suika: Kajō (CC:1222), Ketsueki Sōsa (CC:1768), Sensatsu '
      + 'Suishō (CC:1272), Daijurin no Jutsu (CC:1988), Rairyū no Tatsumaki (LJ:1066-1069), '
      + 'a invocação de Aranhas (LJ:1724) e a sinergia Terra+Água (LJ:736).',
    decisao:
      'Quando uma técnica impõe Preso, Selado ou qualquer condição cuja saída peça "o CD '
      + 'do efeito" e não declare um número, o CD do efeito é 10 + o atributo que a técnica '
      + 'usa para acertar (o campo Acerto do Cap. 8, LJ:465). Onde a técnica não tem '
      + 'rolagem de acerto, usa-se o atributo declarado no teste resistido; onde não há nem '
      + 'um nem outro, o atributo de moldagem: CTR para sombra, fio, marionete, selo e água '
      + 'contida; NIN para as elementais; TAI para as corporais; GEN para as ilusórias e '
      + 'de sangue. Onde a técnica JÁ traz CD impresso, o número impresso prevalece '
      + '(Shichūrō 15, Shinjū Zanshu 14, Shikōmenzuru 14, Kagenui 16, Sawarabi no Mai 17, '
      + 'Yomi Numa 18, Kongō Fūsa 20, Kuroari Higi 16, matilha de cães-ninja 16).',
    porque:
      'P3, literal: "CD de um efeito = 10 + o atributo que a técnica usa para acertar", '
      + 'pela mesma forma que o livro já usa em Defesa = 10 + COR (LJ:202) e Resiliência '
      + 'Mental = 10 + ESP (LJ:203). O campo Acerto existe justamente para isso (LJ:465) e '
      + 'toda técnica do catálogo o declara ou o dispensa por um teste resistido.',
    principio: 'P3',
    confianca: 'alta',
    aplica: {
      cdPadrao: 'formula',
      formula: '10 + atributo de acerto da técnica',
      cdImpressoPrevalece: true,
      condicaoCd: [
        { tecnica: 'kagemane', atributo: 'ctr' },
        { tecnica: 'kagemane_kanzen', atributo: 'ctr' },
        { tecnica: 'tessenka_no_mai_tsuru', atributo: 'tai' },
        { tecnica: 'suika_kajo', atributo: 'tai' },
        { tecnica: 'ketsueki_sosa', atributo: 'gen' },
        { tecnica: 'sensatsu_suisho', atributo: 'nin' },
        { tecnica: 'daijurin_no_jutsu', atributo: 'nin' },
        { tecnica: 'rairyu_no_tatsumaki', atributo: 'nin' },
        { tecnica: 'invocacao_aranhas', atributo: 'ctr' },
        { tecnica: 'sinergia_terra_agua', atributo: 'nin' },
      ],
    },
  },

  {
    id: 'C13',
    titulo: 'Envenenado sai "pela duração", e nenhuma fonte de veneno declara duração',
    onde: 'LJ:693 · CC:1537 · LJ:1668 · CC:1545 · CC:1699 · LJ:2102 · CC:1546 · LJ:791 · LJ:1167 · LJ:920 · LJ:1295',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:693 — "Envenenado: 1d6 no fim de cada turno e Desvantagem em COR. Como sair: '
      + 'Antídoto, Medicina CD 15, ou a duração." · Nenhuma fonte declara a sua: Kikōbachi '
      + '(CC:1537), Reservatório de veneno (LJ:1668), Hachi no Yoroi (CC:1545), Dokugiri '
      + '(CC:1699), Dokubari Arashi (CC:1546), Veneno de Suna (LJ:2102).',
    decisao:
      'A duração padrão de Envenenado é 3 rodadas em combate, contadas a partir da '
      + 'aplicação, ou uma cena fora de combate. Um novo acerto da mesma fonte reinicia a '
      + 'contagem e não empilha o dano. Fontes que declarem CD próprio mantêm o CD (Veneno '
      + 'de Suna CD 18, Dokugiri CD 16, Dokubari Arashi CD 18) e a duração padrão de 3 '
      + 'rodadas. Antídoto e Medicina CD 15 continuam encerrando antes do prazo, e o '
      + 'Dokunuki no Jutsu (LJ:1272-1275) remove a condição direto.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. Três rodadas é a duração que o '
      + 'catálogo repete para efeito persistente aplicado por técnica — Kaenbin (LJ:791) '
      + '"por 3 rodadas", Chakra Nagashi (LJ:1167) "por 3 rodadas", Goshokuzame (LJ:920) '
      + '"durante 3 rodadas", Ranshinshō (LJ:1295) "por 3 rodadas", Kirigakure Yūhei e '
      + 'Meisaigakure com a mesma janela. É a moda estatística do livro para "quanto tempo '
      + 'isso dura", e é curta o bastante para não decidir sozinha um combate de três a '
      + 'cinco rodadas (LJ:559-560).',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      duracaoPadrao: { envenenado: 3 },
      envenenado: { duracaoRodadas: 3, foraDeCombate: 'uma cena', acumula: false, saidas: ['antidoto', 'medicina_cd_15', 'dokunuki', 'duracao'] },
    },
  },

  {
    id: 'E02',
    titulo: '"Molhado" opera como condição e nunca é definida',
    onde: 'LJ:1023 · LJ:1027 · LJ:1069 · LJ:414 · LJ:929-930 · LJ:2518-2519 · LJ:695',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1023 (Jibashi) — "Dano dobrado contra alvos molhados." · LJ:1069 (Rairyū no '
      + 'Tatsumaki) — "alvos metálicos ou molhados ficam Presos." · LJ:1027 (Kangekiha) — '
      + '"alvos em terreno metálico ou aquático sofrem +2d6." · A condição não aparece na '
      + 'tabela do Cap. 14 (LJ:685-707).',
    decisao:
      'Molhado é uma condição, e entra na tabela do Cap. 14. Fica Molhado quem for '
      + 'atingido por um jutsu Suiton que projete água (não os defensivos, como o '
      + 'Suijinheki), quem estiver em terreno aquático ou alagado, e quem estiver sob '
      + 'chuva. Por si só não tem efeito nenhum: é um estado que outras técnicas consultam '
      + '(Jibashi dobra o dano, Rairyū no Tatsumaki impõe Preso, Kangekiha soma +2d6). Sai '
      + 'ao fim da cena, com uma Ação Menor para se secar, ou imediatamente ao sofrer '
      + 'qualquer dano de Katon. Terreno metálico e terreno aquático são terreno, não '
      + 'condição: valem enquanto o personagem estiver neles.',
    porque:
      'P4: "molhado" recebe a base na unidade que a regra já usa, e o gatilho está '
      + 'declarado no Cap. 7 — a coluna "REAÇÃO DO ALVO" diz que Suiton faz o alvo "Ficar '
      + 'úmido" (LJ:414). O terreno já é regrado: Bakusui Shōha (LJ:929-930) e Suiton: '
      + 'Suishōha (LJ:2518-2519) convertem o campo em aquático "pela cena". A saída por '
      + 'Ação Menor espelha a de Queimando (LJ:695: "Ação Principal para apagar"), '
      + 'rebaixada um degrau porque secar-se é menos trabalho que apagar fogo, e a saída '
      + 'por Katon é a mesma lógica invertida da própria linha de Queimando ("ou '
      + 'água/terra").',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      condicao: {
        nome: 'molhado',
        aplicaPor: ['suiton_ofensivo', 'terreno_aquatico', 'chuva'],
        efeitoProprio: null,
        saida: ['fim_da_cena', 'acao_menor', 'dano_katon'],
        consumidaPor: ['jibashi', 'rairyu_no_tatsumaki', 'kangekiha'],
      },
    },
  },

  {
    id: 'C23',
    titulo: 'Oito Portões: quando o dado de dano é aplicado',
    onde: 'LJ:1582-1584 · LJ:1587-1599',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1591-1594 — "4 Dor (Shōmon) · +4 TAI, +4 COR. Ataques ganham Vantagem. · 3 '
      + 'níveis +2d6 de dano · 5 Limite (Tomon) · 4 níveis +4d6 · 6 Visão (Keimon) · 5 '
      + 'níveis +6d6 · 7 Maravilha (Kyōmon) · Exaustão máx. +8d6. COR CD 20 para '
      + 'sobreviver." · LJ:1583-1584 — "Abrir um portão é Ação Menor. Os valores da tabela '
      + 'são totais, não somas: um portão substitui o anterior. A Exaustão só é aplicada ao '
      + 'fechar os portões, no fim da cena."',
    decisao:
      'O dano dos Portões 4 a 7 é aplicado no mesmo instante que a Exaustão: de uma vez '
      + 'só, ao fechar os portões, no fim da cena. Não é ao abrir, nem por rodada aberta. '
      + 'Aplica-se o valor do portão mais alto que chegou a ser aberto, e só ele — os '
      + 'valores da tabela são totais, não somas. Quem abriu até o Sexto Portão sofre 5 '
      + 'níveis de Exaustão e 6d6, não 3+4+5 níveis nem 2d6+4d6+6d6.',
    porque:
      'P1: a única frase do livro sobre o momento do custo é LJ:1583-1584, e ela diz "ao '
      + 'fechar os portões, no fim da cena". A coluna se chama CUSTO e traz Exaustão e '
      + 'dado de dano dentro da mesma célula ("3 níveis +2d6 de dano") — aplicar os dois no '
      + 'mesmo momento é ler a célula, não arbitrar. E "os valores da tabela são totais, '
      + 'não somas" é literal.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      oitoPortoes: {
        aplicaAoFechar: ['exaustao', 'dano'],
        valoresSaoTotais: true,
        abrirPortao: 'acao_menor',
        custo: { 4: { exaustao: 3, dano: '2d6' }, 5: { exaustao: 4, dano: '4d6' }, 6: { exaustao: 5, dano: '6d6' }, 7: { exaustao: 'maxima', dano: '8d6' } },
      },
    },
  },

  {
    id: 'C24',
    titulo: 'Portão 7: quando se rola o COR CD 20 e o que acontece na falha',
    onde: 'LJ:1594-1595 · LJ:1583-1584 · LJ:717-720 · LJ:390 · LJ:1596-1599',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1594-1595 — "7 Maravilha (Kyōmon) · +7 TAI, +7 COR. Supera fisicamente quase '
      + 'tudo que é vivo. · Exaustão máx. +8d6. COR CD 20 para sobreviver."',
    decisao:
      'O teste de COR CD 20 do Sétimo Portão é rolado uma única vez, no momento em que os '
      + 'portões são fechados, junto com a Exaustão e o 8d6 (ver C23). No sucesso, o '
      + 'personagem sobrevive à Exaustão máxima e ao dano. Na falha, o personagem cai a '
      + '0 PV imediatamente e começa a Morrer pelo procedimento normal do Cap. 14 (LJ:717-'
      + '720), com o agravante de que a Exaustão máxima já o deixa inconsciente (nível 5, '
      + 'LJ:715) — ele não pode se estabilizar sozinho e depende do time. O Oitavo Portão '
      + '(LJ:1596-1599) continua matando sem teste e sem exceção.',
    porque:
      'P1 e P4. O momento é o que LJ:1583-1584 já fixou para tudo o que está na coluna '
      + 'CUSTO, e o CD 20 está impresso na mesma célula do 8d6 e da Exaustão máxima. '
      + '"Sobreviver" recebe o significado que o livro já tem para o seu contrário: o Teste '
      + 'de Morte de LJ:717-720. E o precedente de como o sistema pune custo excessivo é '
      + 'LJ:390, no Queimar Vida — "Se a conversão levar seus PV a 0, você desmaia '
      + 'imediatamente" —, não morte instantânea; morte automática o livro reserva ao '
      + 'Oitavo Portão e diz isso com todas as letras.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      oitoPortoes: {
        portao7: { teste: 'COR', cd: 20, quando: 'ao fechar, junto com o custo', falha: '0 PV e Morrendo' },
        portao8: { morte: 'automática ao fim da 3ª rodada, sem teste' },
      },
    },
  },

  {
    id: 'C-c14',
    titulo: 'Cego, Lento e Marcado saem "Conforme a fonte", e várias fontes não dizem',
    onde: 'LJ:690 · LJ:699 · LJ:700-703 · LJ:1453-1456 · LJ:791 · LJ:1167 · LJ:920 · LJ:1295',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:690 — "Cego: Desvantagem em tudo que dependa de visão. Imune a genjutsu visual. '
      + 'Conforme a fonte." · LJ:699 — "Lento: Sem movimento livre. Iniciativa cai ao '
      + 'último lugar. Conforme a fonte." · LJ:700-703 — "Marcado: (...) Conforme a fonte: '
      + 'lavar-se, trocar de roupa, ou o fim da cena." · Kokuangyō (LJ:1453-1456) impõe '
      + '"Cego e sem alvos" sem duração.',
    decisao:
      'Quando a fonte não declara duração: Cego e Lento duram 3 rodadas; Marcado dura até '
      + 'o fim da cena, com as saídas que a própria condição já lista (lavar-se, trocar de '
      + 'roupa). Exceção: condição imposta por genjutsu não usa duração em rodadas — ela '
      + 'dura enquanto o alvo não vencer o Kai, pelas camadas (LJ:1396-1399). Por isso o '
      + 'Kokuangyō, que é genjutsu de profundidade 3, não recebe as 3 rodadas: sai por Kai.',
    porque:
      'P4, pelo mesmo bloco de precedentes de C13 — 3 rodadas é a duração que o catálogo '
      + 'repete para efeito persistente aplicado por técnica (LJ:791, LJ:920, LJ:1167, '
      + 'LJ:1295). Para Marcado, não há o que arbitrar: o próprio texto da condição já traz '
      + 'a saída completa em LJ:702-703, e a auditoria a leu como lacuna quando é regra. '
      + 'A exceção do genjutsu é P1: o Cap. 19 já tem um mecanismo de saída próprio e '
      + 'declarado, e ele prevalece.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      duracaoPadrao: { cego: 3, lento: 3, marcado: 'fim_da_cena' },
      excecao: { genjutsu: 'sai por camadas e Kai, não por duração' },
    },
  },

  {
    id: 'F14',
    titulo: 'Suijinheki contra Raiton: quem é "o alvo" que fica Atordoado',
    onde: 'LJ:882-885 · LJ:418-422 · LJ:416',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:882-885 — "Suijinheki — Muralha de Água · C · 4 · 4 selos · Reação. Reduz 3d6; '
      + 'contra Katon, o dobro. Contra Raiton não reduz nada — e o alvo é Atordoado."',
    decisao:
      '"O alvo" é quem usou o Suijinheki. Contra um ataque Raiton, a muralha não reduz '
      + 'nada, o defensor sofre o dano cheio e fica Atordoado até o fim do próximo turno '
      + 'dele (LJ:686), sem teste de resistência. A Reação é gasta do mesmo jeito.',
    porque:
      'P1 e a roda elemental. LJ:418 põe Raio vencendo Água, e LJ:422 já regra o caso '
      + 'geral — "em desvantagem elemental, a defesa é dobrada", isto é, a defesa errada '
      + 'custa caro a quem defende. A linha do Suijinheki é a versão extrema dessa mesma '
      + 'regra; ler "o alvo" como o atacante inverteria a roda e transformaria a defesa '
      + 'errada em contra-ataque. O Atordoado sem teste também é coerente com LJ:416, que '
      + 'define Raiton como o elemento que "atordoa" — e aqui o alvo já escolheu se expor '
      + 'ao conduzir corrente pela própria água.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      tecnica: 'suijinheki',
      rank: 'C',
      pc: 4,
      contraRaiton: { reducao: 0, condicao: 'Atordoado no defensor', teste: null },
      contraKaton: { reducao: '6d6' },
      reducaoPadrao: '3d6',
    },
  },

  {
    id: 'C18',
    titulo: 'As Sete Espadas da Névoa não têm rank, PC nem PT',
    onde: 'LJ:1674-1697 · LJ:505 · LJ:513-514',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1674-1676 — "Sete lâminas lendárias passadas desde o Primeiro Mizukage. Cada uma '
      + 'é uma técnica Ōgi: só se obtém tomando-a do portador anterior, e usá-la marca você '
      + 'como um dos Sete." · Nenhuma das sete traz rank, PC ou PT · LJ:505 — "Nenhuma '
      + 'técnica de rank S ou de acesso Ōgi pode ser adquirida só gastando PT. Ela exige '
      + 'três selos (...) e só depois deles o jogador paga os Pontos de Treino."',
    decisao:
      'Cada uma das Sete Espadas é uma técnica Ōgi de rank S: custa 24 PT e 0 PC — as '
      + 'propriedades listadas são da arma, e empunhá-la não gasta chakra. Os Três Selos '
      + 'são fixos e iguais para as sete: Selo de Sangue — possuir fisicamente a lâmina, '
      + 'tomada do portador anterior; Selo do Mestre — dispensado, a lâmina ensina; Selo da '
      + 'Prova — o combate em que ela foi tomada. Exceção declarada: o Hiramekarei cobra '
      + '4 PC por transformação (LJ:1694-1697) e mantém esse custo. Perder a lâmina '
      + 'suspende a técnica; os PT não são devolvidos.',
    porque:
      'P1 e P4. O rank e o PT não são invenção: o livro classifica as sete como "técnica '
      + 'Ōgi" (LJ:1675) e a tabela de LJ:513-514 diz que Ōgi/S custa 24 PT — a coluna que '
      + 'falta é lida a partir da que existe. O "sem PC" também sai do texto: todas as sete '
      + 'descrevem propriedades passivas da arma (dano, regeneração, ignorar redução), e a '
      + 'única que descreve um gasto declara o gasto, o que mostra que o autor escreveu PC '
      + 'onde havia PC. Os Três Selos são literais em LJ:1675 ("só se obtém tomando-a do '
      + 'portador anterior") cruzado com LJ:507-511.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      seteEspadas: {
        rank: 'S',
        pt: 24,
        pc: 0,
        acesso: 'ogi',
        tresSelos: { sangue: 'possuir a lâmina, tomada do portador anterior', mestre: 'dispensado', prova: 'o combate em que foi tomada' },
        excecao: { hiramekarei: { pc: 4, por: 'transformação' } },
        perderALamina: 'suspende a técnica, sem devolução de PT',
      },
    },
  },

  {
    id: 'C-c21',
    titulo: 'Samehada "escolhe seu portador" sem regra no Livro do Jogador',
    onde: 'LJ:1681-1684 · CC:1397-1400 · CC:1366',
    tipo: 'gatilho',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:1681-1684 — "Samehada — Pele de Tubarão · Arma senciente. Não corta: rala. '
      + '2d6+TAI e drena 1d6 PC para você. Escolhe seu portador." (sem teste) · '
      + 'CC:1397-1400 — "Sempre que você cair abaixo de 1/4 dos PC máximos em combate, '
      + 'teste ESP CD 15 — na falha, a espada se recusa a ser empunhada até o fim da cena, '
      + 'e pode tentar ir para a mão de um inimigo mais forte."',
    decisao:
      'Vale a regra do Compêndio, e ela é a regra da arma para qualquer portador, não só '
      + 'para um Hoshigaki: sempre que o portador cair abaixo de 1/4 dos PC máximos em '
      + 'combate, teste ESP CD 15; na falha, a Samehada se recusa a ser empunhada até o fim '
      + 'da cena e pode tentar ir para a mão de um inimigo mais forte. O mesmo teste é '
      + 'feito uma vez ao tomar a lâmina pela primeira vez: falhar significa que ela não '
      + 'aceita aquele portador enquanto ele não voltar com mais chakra.',
    porque:
      'P2: o Compêndio é o texto mais recente e mais específico, e é o único que estatiza a '
      + 'frase que o Livro do Jogador deixou solta. A extensão para o primeiro contato não '
      + 'é gratuita: o marco do Estágio III do Hoshigaki (CC:1366) é "Ser testado pela '
      + 'Samehada e não ser devorado por ela", o que exige que exista um teste de primeira '
      + 'vez — e o único teste que a arma tem é este.',
    principio: 'P2',
    confianca: 'media',
    aplica: {
      seteEspadas: {
        samehada: { teste: 'ESP', cd: 15, quando: ['abaixo de 1/4 dos PC máximos em combate', 'primeira vez que é empunhada'], falha: 'recusa até o fim da cena' },
      },
    },
  },

  {
    id: 'A20',
    titulo: 'Marionete tem "PV = 15 + (5 × rank)" e não se diz rank de quem',
    onde: 'LJ:1663-1664 · CC:1723 · LJ:2465',
    tipo: 'grandeza',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1663-1664 — "Uma marionete é um aliado controlado: PV = 15 + (5 × rank), Defesa '
      + 'igual à do marionetista, ataca com o CTR do usuário." · CC:1723 repete a frase '
      + 'inteira.',
    decisao:
      'Rank é o rank do marionetista, convertido em número pela tabela de A22. Marionete: '
      + 'PV = 15 + (5 × rankNumérico do marionetista), Defesa igual à do marionetista, '
      + 'ataca com o CTR dele. Na prática: Genin 20 PV · Chūnin 25 · Jōnin Especial 30 · '
      + 'Jōnin 35 · Elite ou acima 40. Os módulos de LJ:1665-1672 somam por cima (Blindagem '
      + 'de ferro +10 PV).',
    porque:
      'P4 e P1: os outros dois valores da mesma frase são do marionetista — "Defesa igual '
      + 'à do marionetista, ataca com o CTR do usuário" —, e o terceiro é lido do mesmo '
      + 'jeito, porque nenhuma outra entidade da frase tem rank. A conversão numérica é a '
      + 'que o livro publicou em LJ:2465 e que a decisão A22 generaliza.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      marionete: { pv: '15 + 5 × rankNumerico(marionetista)', defesa: 'do marionetista', acerto: 'CTR do marionetista', modulosSomam: true },
    },
  },

  {
    id: 'C17',
    titulo: 'Invocação Pequena e Média não têm manutenção listada',
    onde: 'LJ:1705-1711 · LJ:480 · CC:859-860',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:1706-1711 — "Pequena · 4 PC · C · (...) Não lutam. · Média · 7 PC · B · Aliado '
      + 'com PV 30, ataque 2d6+3. · Grande · 11 PC · A · (...) Manutenção 2 PC/rodada; age '
      + 'na própria iniciativa. · Colossal · 16 PC · S · (...) Manutenção 4 PC/rodada."',
    decisao:
      'Invocação Pequena e Média não têm manutenção: 0 PC por rodada. Uma vez pagas, ficam '
      + 'em campo pela cena. Grande custa 2 PC/rodada e Colossal 4 PC/rodada, como '
      + 'impresso.',
    porque:
      'P1: a omissão é sistemática e alinhada com o resto da tabela — as duas escalas sem '
      + 'manutenção são exatamente as duas que também não declaram "age na própria '
      + 'iniciativa", e a Média é descrita como "Aliado com PV 30", isto é, um aliado e não '
      + 'uma técnica Sustentada. O Cap. 8 (LJ:480) define Sustentada como a categoria que '
      + '"permanece ativa enquanto você paga a manutenção por rodada": onde o livro não '
      + 'declara manutenção, a técnica não é Sustentada. O Compêndio confirma na prática — '
      + 'Kuchiyose: Ninken (CC:859-860) é C · 4 PC e invoca de um a oito cães sem '
      + 'manutenção nenhuma.',
    principio: 'P1',
    confianca: 'alta',
    aplica: { invocacaoManutencao: { pequena: 0, media: 0, grande: 2, colossal: 4 } },
  },

  {
    id: 'C-c22',
    titulo: 'Quando se rola o teste de invocação recusada',
    onde: 'LJ:1702-1704 · LJ:1711 · LJ:146',
    tipo: 'gatilho',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:1703-1704 — "Cada clã testa quem o invoca: uma invocação recusada é ESP CD 15; '
      + 'na falha, a criatura ataca você ou vai embora com o chakra."',
    decisao:
      'O teste de ESP CD 15 é feito uma vez por escala de invocação, na primeira vez que o '
      + 'personagem invoca naquela escala. Passou, a criatura aceita o invocador naquela '
      + 'escala em definitivo e não se testa mais. Um Desastre (d20 natural = 1) numa '
      + 'rolagem feita no mesmo turno da invocação reabre o teste, uma vez. Escalas '
      + 'diferentes exigem testes diferentes.',
    porque:
      'P1 e P4: o próprio livro já descreve permissão de invocação como coisa que se pede '
      + 'uma vez e por escala — a linha Colossal (LJ:1711) exige "Jōnin e a permissão da '
      + 'criatura", e permissão concedida não se pede de novo a cada uso. Rolar a cada '
      + 'invocação daria a uma técnica de rank C cerca de 25% de chance de virar contra o '
      + 'usuário, o que nenhuma outra técnica do catálogo faz. A reabertura pelo Desastre '
      + 'não é invenção: LJ:146 já manda o Mestre "introduzir uma complicação nova" no 1 '
      + 'natural.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      invocacaoRecusada: { teste: 'ESP', cd: 15, frequencia: 'uma vez por escala, na primeira invocação', reabre: 'desastre (d20 natural 1)' },
    },
  },

  {
    id: 'C-c19',
    titulo: 'Tsukuyomi e Kotoamatsukami têm "esp." na coluna Camadas',
    onde: 'LJ:1463-1465 · LJ:1396-1402 · LJ:327',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1463-1465 — "Tsukuyomi / Kotoamatsukami · S · 16 · esp. · Ver Cap. 25. O ápice '
      + 'do genjutsu e o controle absoluto e indetectável. · Kekkei Genkai" · LJ:1396 — '
      + '"Camadas. Profundidade de 1 a 3. Cada libertação bem-sucedida remove uma camada."',
    decisao:
      '"esp." significa que a técnica não usa camadas: não há Kai. Tsukuyomi e '
      + 'Kotoamatsukami não podem ser rompidos por teste de ESP no fim do turno, por Kai de '
      + 'aliado, por dor autoinfligida nem por Sensoriamento. A única saída é gastar 1 '
      + 'Ponto de Vontade do Fogo (LJ:327), e mesmo assim o Tsukuyomi já terá resolvido o '
      + 'seu efeito no instante em que acertou (ver D09).',
    porque:
      'P1 e P4: LJ:1396 declara que a profundidade vai de 1 a 3, e "esp." é o valor fora '
      + 'dessa faixa — o único significado disponível para um valor fora da escala é "não '
      + 'se aplica". O texto da própria linha confirma: "o controle absoluto e '
      + 'indetectável" (LJ:1463-1464), e o Kai exige que o alvo perceba que está sob '
      + 'ilusão. O PVF continua funcionando porque LJ:327 diz "de qualquer rank", sem '
      + 'exceção — é a única porta que o livro deixou aberta de propósito.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      camadas: { tsukuyomi: 'esp', kotoamatsukami: 'esp' },
      semKai: ['tsukuyomi', 'kotoamatsukami'],
      quebraSoPor: ['pvf'],
    },
  },

  {
    id: 'C14',
    titulo: 'O genjutsu do Adendo não tem coluna de Camadas',
    onde: 'LJ:2601-2621 · LJ:1408-1462 · LJ:1396',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:2601-2621 (Adendo) — Magen: Karasu Sōran (B · 7), Magen: Kori Shinchū (C · 4) e '
      + 'Magen: Shibari Kage (B · 7) vêm com RANK, PC, EFEITO e ACESSO, e sem coluna CAM. · '
      + 'A tabela do Cap. 19 (LJ:1408-1462) tem a coluna e a preenche em todas as linhas.',
    decisao:
      'Profundidade de genjutsu, onde a coluna falta, sai do rank: E e D = 1 camada · C = '
      + '2 · B = 2 · A = 3 · S = ver C-c19. Logo, Magen: Karasu Sōran 2 camadas, Magen: '
      + 'Kori Shinchū 2, Magen: Shibari Kage 2. As saídas próprias que essas técnicas '
      + 'declaram (o teste de ESP no fim de cada turno em Kori Shinchū e Shibari Kage) são '
      + 'o Kai da camada, não um mecanismo paralelo.',
    porque:
      'P4: a base sai da tabela vizinha, na mesma unidade, e ela é regular. No Cap. 19, '
      + 'todo E e D tem 1 (Kokoro Midare, Narakumi), todo C tem 2 (Kyōten Chiten, Jubaku '
      + 'Satsu, Kasumi Enbu), todo B tem 2 (Kikō Junsa, Rasen Kokuin) e todo A tem 3 '
      + '(Kokuangyō, Mugen Meikyū). A única exceção é o Nehan Shōja (C com 1), que é a '
      + 'única de área. Ler a coluna que falta a partir da coluna que existe é aritmética.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      camadasPorRank: { E: 1, D: 1, C: 2, B: 2, A: 3 },
      camadas: { magen_karasu_soran: 2, magen_kori_shinchu: 2, magen_shibari_kage: 2 },
    },
  },

  {
    id: 'C03',
    titulo: 'Toda a linhagem do Rasengan está sem custo em PC',
    onde: 'LJ:1894-1913 · LJ:769-770 · LJ:2346-2352 · LJ:2390-2396 · LJ:1055',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1895-1913 — Rasengan (A · 5d6+CTR), Ōdama Rasengan (A · 6d6+CTR), Rasenrengan '
      + '(A · 2× 4d6), Fūton: Rasenshuriken (S · 8d6+NIN) e Rasenshuriken Modo Sábio '
      + '(S · 8d6+NIN) trazem RANK, DANO e "O QUE FAZ E O QUE CUSTA", e nenhuma traz PC. '
      + 'O Chidori, a técnica-espelho do mesmo capítulo, aparece em LJ:1055 com "A · 11".',
    decisao:
      'Custo em PC pela tabela do rank: Rasengan 11 PC · Ōdama Rasengan 11 · Rasenrengan '
      + '11 · Fūton: Rasenshuriken 16 · Senpō: Rasenshuriken 16. PT: 14 para os rank A e 24 '
      + 'para os rank S, sempre depois dos Três Selos (LJ:505, LJ:527-536). O Rasenrengan '
      + 'exige o Kage Bunshin, cujos 7 PC por clone (LJ:1243) se pagam à parte; o Ōdama '
      + 'Rasengan idem, por exigir um clone para moldá-lo.',
    porque:
      'P1 e P4: o rank de cada uma está impresso e o índice do apêndice confirma — LJ:2390-'
      + '2392 lista Rasengan, Ōdama Rasengan e Rasenrengan sob "A — ASSINATURA DE JŌNIN", e '
      + 'LJ:2394-2396 lista Fūton: Rasenshuriken e Senpō: Rasenshuriken sob "S — '
      + 'LENDÁRIAS". Falta só a coluna de custo, e a régua está declarada em LJ:769-770 e '
      + 'repetida em LJ:2346-2352. O Chidori, a técnica-espelho escrita no mesmo capítulo, '
      + 'já aparece com exatamente o valor da tabela ("A · 11", LJ:1055): aplicar a mesma '
      + 'régua ao Rasengan é copiar o vizinho.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      tecnicas: [
        { tecnica: 'rasengan', rank: 'A', pc: 11, pt: 14, dano: '5d6+CTR' },
        { tecnica: 'odama_rasengan', rank: 'A', pc: 11, pt: 14, dano: '6d6+CTR' },
        { tecnica: 'rasenrengan', rank: 'A', pc: 11, pt: 14, dano: '2× 4d6' },
        { tecnica: 'futon_rasenshuriken', rank: 'S', pc: 16, pt: 24, dano: '8d6+NIN' },
        { tecnica: 'senpo_rasenshuriken', rank: 'S', pc: 16, pt: 24, dano: '8d6+NIN' },
      ],
    },
  },

  {
    id: 'C04',
    titulo: 'Técnicas espaço-temporais sem PC e sem PT',
    onde: 'LJ:1936-1952 · LJ:1728 · LJ:2394-2396 · LJ:513-514',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1937 — "A categoria mais rara e mais poderosa do jogo: dobrar o espaço. Toda '
      + 'técnica aqui é rank S." · A tabela de LJ:1938-1952 traz REQUISITO e EFEITO, sem PC '
      + 'e sem PT · LJ:1952 — "Kuchiyose reverso de emergência · contrato + CTR +4 · Ver '
      + 'Cap. 22" · LJ:1728 — "Invocação reversa (Gyaku Kuchiyose): Rank B · 7 PC."',
    decisao:
      'Hiraishin no Jutsu, Hiraishin nível 2 e Kamui são rank S: 16 PC por uso e 24 PT, '
      + 'com os Três Selos. O Kamui mantém o custo adicional declarado (1d6 e sangramento '
      + 'do olho por uso). O Kuchiyose reverso de emergência NÃO é rank S: mantém o que o '
      + 'Cap. 22 já publicou — rank B, 7 PC, 8 PT —, porque a própria linha remete a ele.',
    porque:
      'P4 para as três primeiras: a abertura do capítulo declara o rank de todas '
      + '("Toda técnica aqui é rank S", LJ:1937) e a tabela de LJ:513-514 e LJ:769-770 dá o '
      + 'custo daquele rank; o índice do apêndice confirma, listando Hiraishin e Kamui sob '
      + '"S — LENDÁRIAS" (LJ:2394-2395). P1 para a quarta: o custo do Gyaku Kuchiyose '
      + 'existe impresso em LJ:1728, e LJ:1952 manda explicitamente ler o Cap. 22 — o livro '
      + 'apontou para onde estava o número.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      tecnicas: [
        { tecnica: 'hiraishin', rank: 'S', pc: 16, pt: 24 },
        { tecnica: 'hiraishin_nivel_2', rank: 'S', pc: 16, pt: 24 },
        { tecnica: 'kamui', rank: 'S', pc: 16, pt: 24, efeito: 'custo adicional: 1d6 e sangramento do olho por uso' },
        { tecnica: 'gyaku_kuchiyose', rank: 'B', pc: 7, pt: 8 },
      ],
    },
  },

  {
    id: 'C05',
    titulo: 'Técnicas de dōjutsu lendárias sem rank e sem PC',
    onde: 'LJ:1958-1980 · LJ:2394-2396 · LJ:641 · LJ:1654 · LJ:1841-1842 · LJ:1979',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1958-1980 — a tabela traz OLHO e EFEITO, sem rank e sem PC, para Tsukuyomi, '
      + 'Susanoo, Kotoamatsukami, Izanagi, Amaterasu/Kagutsuchi, Shinra Tensei, Banshō '
      + 'Ten\'in e Gedō: Rinne Tensei · LJ:1976-1978 — "Banshō Ten\'in — Atração Universal '
      + '· Rinnegan · Puxa um alvo ou objeto para você: prepara combos, desarma, arranca '
      + 'coberturas." (sem teste, sem alcance, sem limite de peso)',
    decisao:
      'Todas são rank S, 16 PC e 24 PT, com os Três Selos. As cinco que o Compêndio '
      + 'estatiza usam os valores já decididos em D08 a D11 e em C-c19. As três do Rinnegan '
      + 'ficam assim: (a) SHINRA TENSEI · S · 16 PC · Ação Principal · 6d6 em todos numa '
      + 'zona a Média, todos Empurrados uma zona e Caídos; recarga em A12. (b) BANSHŌ '
      + 'TEN\'IN · S · 16 PC · Ação Principal · alcance Média · teste resistido de CTR '
      + 'contra TAI ou COR do alvo (à escolha do alvo); no sucesso, o alvo ou um objeto que '
      + 'uma pessoa consiga carregar é trazido até a zona Contato do usuário. Objetos fixos '
      + '(uma cobertura, uma porta) vêm sem teste. (c) GEDŌ: RINNE TENSEI · S · custa toda '
      + 'a reserva de PC e toda a vida do usuário, que morre sem retorno.',
    porque:
      'P4 e P1 para rank e custo: o índice do apêndice (LJ:2394-2396) lista Tsukuyomi, '
      + 'Susanoo, Kotoamatsukami, Izanagi, Shinra Tensei e Amaterasu sob "S — LENDÁRIAS", '
      + 'e o custo do rank S está em LJ:769-770. O Rinne Tensei recebe o custo que o '
      + 'próprio livro escreve para o seu gêmeo, o Shiki Fūjin ("toda a reserva", LJ:1841-'
      + '1842), somado ao "Custa toda a vida do usuário" de LJ:1979. INVENÇÃO MINHA: o '
      + 'teste do Banshō Ten\'in. O livro não dá nenhum; usei CTR contra TAI ou COR porque '
      + 'é a forma que o próprio livro usa para arrastar alguém à força — a manobra '
      + 'Empurrar (LJ:641) é resistida de TAI, e o Kuroari Higi (LJ:1654) já engole um alvo '
      + 'com "teste resistido de CTR contra COR". Banshō Ten\'in e Rinne Tensei também são '
      + 'as duas únicas da tabela ausentes do índice do apêndice, o que enfraquece a '
      + 'atribuição de rank S para elas.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      tecnicas: [
        { tecnica: 'shinra_tensei', rank: 'S', pc: 16, pt: 24, dano: '6d6', efeito: 'todos Empurrados e Caídos numa zona a Média' },
        { tecnica: 'bansho_tenin', rank: 'S', pc: 16, pt: 24, efeito: 'resistido CTR vs TAI ou COR; puxa até Contato', alcance: 'media' },
        { tecnica: 'rinne_tensei', rank: 'S', pc: 'toda_a_reserva', pt: 24, custoVida: 'a vida do usuário' },
      ],
    },
  },

  {
    id: 'A12',
    titulo: 'Shinra Tensei tem "um intervalo de recarga" nunca quantificado',
    onde: 'LJ:1974-1975 · LJ:561-565 · LJ:1566-1567 · LJ:2419-2421',
    tipo: 'grandeza',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1974-1975 — "Shinra Tensei — Repulsão Divina · Rinnegan · Empurra tudo num raio '
      + 'enorme: 6d6 e todos Empurrados/Caídos. Há um intervalo de recarga que o inimigo '
      + 'pode explorar."',
    decisao:
      'Depois de usar o Shinra Tensei, o usuário precisa deixar passar um turno seu inteiro '
      + 'antes de usá-lo de novo: nunca duas vezes no mesmo turno, nunca em turnos '
      + 'consecutivos. O turno de intervalo é o que o inimigo explora, e o Mestre deve '
      + 'anunciar em voz alta quando a recarga termina, como faz com a canalização '
      + '(LJ:2221-2222).',
    porque:
      'P4 e P6: a única unidade de tempo que o combate tem é a rodada/turno (LJ:561-565), '
      + 'e o livro já usa exatamente esta forma para travar efeitos fortes — Hakkeshō '
      + 'Kaiten (LJ:1566-1567) "Máximo 1×/rodada e 2×/combate" e a regra 3 do Apêndice '
      + '(LJ:2419-2421) "nunca mais de uma vez na mesma rodada". Um turno de intervalo é a '
      + 'menor trava que ainda é uma trava. INVENÇÃO MINHA: o número. O livro não diz '
      + 'quantas rodadas, e escolhi a mais curta possível justamente por P6 — versão mínima '
      + 'que faz a frase valer alguma coisa.',
    principio: 'P6',
    confianca: 'baixa',
    aplica: { tecnica: 'shinra_tensei', recarga: { turnosDeIntervalo: 1, anunciar: true } },
  },

  {
    id: 'A13',
    titulo: 'Kotoamatsukami: "uma vez a cada muitos anos de jogo"',
    onde: 'LJ:1965-1966 · LJ:2751-2754 · LJ:2650-2655',
    tipo: 'grandeza',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:1965-1966 — "Kotoamatsukami · Mangekyō de Shisui · Controle mental indetectável: '
      + 'a vítima acredita que a decisão foi dela. Uma vez a cada muitos anos de jogo. O '
      + 'genjutsu definitivo."',
    decisao:
      'Kotoamatsukami · S · 16 PC · uma vez por campanha. O uso é declarado pelo jogador, '
      + 'gasta a técnica em definitivo para aquele personagem, e o Mestre deve avisar a '
      + 'mesa antes de a cena começar. Não tem camadas nem Kai (ver C-c19).',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. O Adendo tem duas técnicas com '
      + 'exatamente esta ideia e as duas a escrevem com número: Tengai Shinsei (LJ:2751-'
      + '2754) "Uma vez por campanha, e o Mestre deve avisar a mesa antes" e Yagai '
      + '(LJ:2650-2655) "Uma vez, em toda a campanha". "Uma vez a cada muitos anos de jogo" '
      + 'é a mesma frase antes de o autor ter fixado a formulação.',
    principio: 'P4',
    confianca: 'alta',
    aplica: { tecnica: 'kotoamatsukami', rank: 'S', pc: 16, pt: 24, usos: { quantidade: 1, por: 'campanha' }, camadas: 'esp' },
  },

  {
    id: 'C22',
    titulo: 'Kokuin — Selo Amaldiçoado: três buracos numa linha só',
    onde: 'LJ:1862-1867 · LJ:505 · LJ:511-512 · LJ:1761 · LJ:1765-1766 · LJ:697 · LJ:1470-1471',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1862-1867 — "Kokuin — Selo Amaldiçoado · S · — · Senjutsu de cobra num '
      + 'hospedeiro. Nível 1: +2 em tudo, PC dobrados. Nível 2: +4 e transformação. · Só 1 '
      + 'em 10 sobrevive. Dependência: ESP CD 16 ou a personalidade do aplicador se '
      + 'sobrepõe."',
    decisao:
      '(a) PASSAR DO NÍVEL 1 AO NÍVEL 2 é um Marco de História (LJ:511-512), não uma '
      + 'compra: exige um arco dedicado e a autorização do Mestre; não custa PT e nunca '
      + 'acontece em cena de combate. (b) O TESTE DE ESP CD 16 é rolado uma vez por cena, '
      + 'no primeiro turno em que o personagem usar o bônus do selo. (c) NA FALHA, o '
      + 'personagem fica Sob Ilusão (LJ:697) até o fim da cena, com a particularidade de '
      + 'que a realidade falsa é a vontade do aplicador: o Mestre declara em voz alta o '
      + 'objetivo do aplicador e o jogador continua jogando o personagem, agora '
      + 'perseguindo esse objetivo. Sai como qualquer Sob Ilusão — Kai (ESP contra CD 16) '
      + 'no fim de cada turno, Kai de aliado, dor autoinfligida, ou 1 PVF. Os bônus do '
      + 'selo respeitam o teto de atributo do rank (Apêndice, regra 1).',
    porque:
      'P4 e P6. O Nível 2 vira Marco porque o Cap. 24 põe o Kokuin em rank S e LJ:505 diz '
      + 'que rank S "não pode ser adquirido só gastando PT" — o livro já tinha a resposta '
      + 'para "como se sobe". A frequência do teste copia o vizinho na mesma tabela de '
      + 'poderes emprestados: os Mantos de bijū (LJ:1761 e LJ:1765-1766) testam ESP do '
      + 'mesmo jeito e pelo mesmo motivo. E "a personalidade do aplicador se sobrepõe" '
      + 'recebe a única mecânica que o livro tem para "você age segundo uma realidade que '
      + 'não é sua" — Sob Ilusão —, com a instrução explícita de LJ:1470-1471: "o Mestre '
      + 'descreve a cena falsa e o jogador age nela. Nunca tire o turno de alguém."',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      tecnica: 'kokuin',
      rank: 'S',
      nivel1: { bonus: 2, pcDobrados: true },
      nivel2: { bonus: 4, aquisicao: 'marco_de_historia', pt: 0 },
      dependencia: { teste: 'ESP', cd: 16, frequencia: 'uma vez por cena, ao usar o bônus', falha: 'Sob Ilusão até o fim da cena, com o objetivo do aplicador' },
      respeitaTetoDeAtributo: true,
    },
  },

  {
    id: 'F06',
    titulo: 'Mantos de bijū: quanto dura a perda de controle e quando se testa',
    onde: 'LJ:1756-1776 · LJ:1770-1771 · LJ:480-481 · CC:186 · LJ:1046 · LJ:1596-1599',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:1757-1761 — "Manto V1 · 4 PC/rd · (...) ESP CD 14 ou ataca o mais próximo." · '
      + 'LJ:1762-1766 — "Manto V2 · 8 PC/rd · (...) ESP CD 18 ou perde o controle — o '
      + 'Mestre assume." · LJ:1767-1772 — "Modo Chakra · 6 PC/rd · (...) CTR CD 15 no fim '
      + 'de cada rodada; duração máxima ESP rodadas."',
    decisao:
      'O teste é feito ao ativar o Manto e depois no fim de cada rodada em que ele '
      + 'continuar ativo. MANTO V1, falha no ESP CD 14: no seu próximo turno o personagem '
      + 'usa a Ação Principal para atacar o alvo mais próximo, aliado ou não, e volta a si '
      + 'em seguida. MANTO V2, falha no ESP CD 18: o Mestre assume o personagem por 3 '
      + 'rodadas; ao fim delas — ou antes, se o Manto for desativado por falta de PC — o '
      + 'jogador retoma o controle e o personagem ganha 1 nível de Exaustão.',
    porque:
      'P4 e P6. A frequência sai do vizinho, na mesma tabela e na mesma unidade: o Modo '
      + 'Chakra (LJ:1770-1771) diz "no fim de cada rodada", e o Cap. 8 (LJ:480-481) já '
      + 'estabelece que técnica Sustentada testa por rodada. A Exaustão de 1 nível ao '
      + 'encerrar copia o Raiton no Yoroi (LJ:1046), o outro "modo" do livro. INVENÇÃO '
      + 'MINHA: as 3 rodadas de perda de controle no V2. Escolhi 3 porque é a janela que o '
      + 'livro usa para estados extremos e irreversíveis (Izanagi 3 rodadas, CC:186; '
      + 'Oitavo Portão 3 rodadas, LJ:1596-1599), mas o número não está escrito.',
    principio: 'P4',
    confianca: 'baixa',
    aplica: {
      mantoBiju: {
        quandoTesta: ['ao ativar', 'fim de cada rodada'],
        v1: { teste: 'ESP', cd: 14, falha: 'ataca o mais próximo com a Ação Principal no próximo turno' },
        v2: { teste: 'ESP', cd: 18, falha: 'o Mestre assume por 3 rodadas', exaustaoAoRetomar: 1 },
      },
    },
  },

  {
    id: 'C-c24',
    titulo: 'Chimera: o que acontece ao falhar no teste de rejeição',
    onde: 'LJ:1879-1885 · LJ:709-716 · LJ:721-727 · LJ:717-720 · CC:1979-1980',
    tipo: 'gatilho',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:1879-1885 — "Chimera / Modificação Genética · S · varia · Enxerta tecido, dōjutsu '
      + 'ou Kekkei Genkai alheio: a habilidade com metade da eficácia. · Rejeição: COR CD '
      + '18 por semana durante um mês. A maioria dos sujeitos de Orochimaru morreu."',
    decisao:
      'São quatro testes de COR CD 18, um por semana, ao longo de um mês. Cada falha custa '
      + '1 nível de Exaustão que não se remove por descanso enquanto o mês não terminar. A '
      + 'partir da segunda falha, cada falha também impõe um Ferimento Grave rolado em 1d6 '
      + '(LJ:721-727). Quatro falhas: o enxerto é rejeitado por completo, o personagem '
      + 'perde a habilidade enxertada em definitivo e cai a 0 PV, começando a Morrer '
      + '(LJ:717-720). Quatro sucessos: o enxerto pega, e a habilidade funciona com metade '
      + 'da eficácia — dano pela metade e CDs −3, conforme CC:1979-1980.',
    porque:
      'P4: as duas escadas de dano permanente que o livro tem são a Exaustão cumulativa '
      + '(LJ:709-716) e o Ferimento Grave (LJ:721-727), e o jeito do sistema de dizer "a '
      + 'maioria morreu" sem matar automaticamente é o Teste de Morte (LJ:717-720) — o '
      + 'mesmo desenho de LJ:390 no Queimar Vida. A contagem de quatro semanas é literal. '
      + 'A "metade da eficácia" recebe o número que o Compêndio já publicou para '
      + 'transplantes (CC:1979-1980), o que é P2 aplicado a um termo do Livro do Jogador. '
      + 'INVENÇÃO MINHA: a escada exata — 1ª falha Exaustão, 2ª em diante também Ferimento '
      + 'Grave, 4ª morte. O livro só diz que a maioria morreu.',
    principio: 'P4',
    confianca: 'baixa',
    aplica: {
      chimera: {
        testes: { quantidade: 4, atributo: 'COR', cd: 18, intervalo: 'semanal' },
        falha1: 'Exaustão +1 (não removível durante o mês)',
        falha2ouMais: 'Exaustão +1 e Ferimento Grave (1d6)',
        falha4: 'rejeição total: perde a habilidade e cai a 0 PV, Morrendo',
        sucesso: { eficacia: 'metade', dano: 'metade', cd: -3 },
      },
    },
  },

  {
    id: 'C06',
    titulo: 'A tabela de compra de atributos só cobre +5 a +8',
    onde: 'LJ:2156-2158 · LJ:262-264 · LJ:2159-2160 · LJ:2150',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'LJ:2157-2158 — "Aumentar um atributo para X · 6 / 8 / 10 / 12 PT · Custo fixo por '
      + 'degrau: +5 custa 6 PT, +6 custa 8, +7 custa 10, +8 custa 12. Respeita o teto do '
      + 'rank." · Não há custo para subir até +1, +2, +3 ou +4 — que é a faixa inteira de '
      + 'um Genin (teto +4, LJ:369).',
    decisao:
      'Subir um atributo para +1, +2, +3 ou +4 custa 4 PT por degrau. A tabela completa '
      + 'fica: +1 a +4 custam 4 PT cada · +5 custa 6 · +6 custa 8 · +7 custa 10 · +8 custa '
      + '12. Continua valendo o teto do rank e continua sendo um degrau por compra.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. A tabela publicada é uma '
      + 'progressão aritmética de passo 2 (6, 8, 10, 12); continuada um degrau para trás, o '
      + 'anterior a +5 é 4 PT. O número também é conferido pelos vizinhos da própria '
      + 'tabela: 4 PT é o custo de um jutsu rank C (LJ:2161) e fica acima dos 3 PT de uma '
      + 'perícia treinada (LJ:2159-2160), o que mantém a ordem de preço que a tabela já '
      + 'tem. E é o ritmo que a economia sugere: quatro missões rank C (LJ:2150) por '
      + 'degrau. Um valor único para a faixa toda, em vez de 2/2/3/4, segue a leitura que o '
      + 'próprio autor faz da faixa baixa na criação (LJ:262-264), onde ela é tratada como '
      + 'um bloco só.',
    principio: 'P4',
    confianca: 'media',
    aplica: { ptAtributo: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 6, 6: 8, 7: 10, 8: 12 } },
  },

  {
    id: 'C09',
    titulo: 'As Vilas Menores não têm bônus de vila',
    onde: 'LJ:2055-2064 · LJ:2037-2053',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:2037-2053 — as cinco grandes vilas trazem "Bônus de vila" explícito · '
      + 'LJ:2055-2064 — a tabela de Vilas Menores (Amegakure, Otogakure, Takigakure, '
      + 'Kusagakure, Yugakure, Uzushiogakure) traz apenas PAÍS e SITUAÇÃO.',
    decisao:
      'Vilas menores não concedem bônus mecânico de vila, e isso é a regra e não uma '
      + 'omissão. Na ficha, o campo aparece preenchido com "sem bônus de vila" e não em '
      + 'branco, para que ninguém procure um número que não existe. O personagem de vila '
      + 'menor não fica atrás: a compensação é que ele também não carrega doutrina, e a '
      + 'ficha o trata como livre de qualquer restrição de doutrina de vila.',
    porque:
      'P1: não há número a corrigir e inventar um seria escrever cinco linhas de regra que '
      + 'o autor deliberadamente não escreveu — a tabela das vilas menores tem colunas '
      + 'próprias (PAÍS, SITUAÇÃO) e nenhuma delas é de bônus, o que é diferente de uma '
      + 'coluna de bônus deixada vazia. As descrições reforçam a leitura: Otogakure "Não é '
      + 'vila: uma rede de laboratórios" e Uzushiogakure "Destruída" não são lugares que '
      + 'treinem uma doutrina.',
    principio: 'P1',
    confianca: 'alta',
    aplica: { vilaMenor: { bonus: null, exibirComo: 'sem bônus de vila', restricaoDeDoutrina: false } },
  },

  {
    id: 'C-c34',
    titulo: 'Talento Instrutor: acumula com o desconto de mestre em cena?',
    onde: 'LJ:2176 · LJ:515 · LJ:509 · LJ:505',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:2176 — "Instrutor · Ensina jutsus a aliados como Selo do Mestre: eles pagam 2 PT '
      + 'a menos." · LJ:515 — "Modificadores: (...) aprendida de um mestre em cena −2 PT."',
    decisao:
      'O talento Instrutor não acumula: os "2 PT a menos" que ele concede SÃO o modificador '
      + 'de "aprendida de um mestre em cena" de LJ:515, aplicado uma única vez. O que o '
      + 'talento compra, e que justifica os 6 PT, é a capacidade de o próprio personagem '
      + 'ser esse mestre — inclusive para satisfazer o Selo do Mestre de técnicas rank S e '
      + 'Ōgi (LJ:509), o que nenhum outro talento faz.',
    porque:
      'P1 e P5: dois textos com o mesmo número e a mesma descrição são o mesmo efeito, e '
      + 'somá-los levaria um jutsu rank E de 1 PT a −3 PT, abaixo do piso fixado em C-c9. '
      + 'O valor real do talento está na primeira metade da frase, não na segunda: LJ:509 '
      + 'define o Selo do Mestre como "um professor vivo e disposto, um pergaminho '
      + 'completo, ou meses de pesquisa própria", e LJ:505 diz que sem ele não há técnica '
      + 'Ōgi nenhuma.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      talento: 'instrutor',
      pt: 6,
      descontoConcedido: 2,
      acumulaComMestreEmCena: false,
      satisfazSeloDoMestre: true,
    },
  },

  {
    id: 'C-c37',
    titulo: 'Guardião Reanimado (Edo Tensei) tem "PV —"',
    onde: 'LJ:2279-2281 · LJ:1847-1850 · LJ:2139-2140',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:2279-2281 — "Guardião Reanimado (Edo Tensei) · PV — · Def 16. Imortal: regenera '
      + 'todo dano no início do turno. Só pode ser selado. Use os atributos que tinha em '
      + 'vida." · LJ:1849-1850 — "O reanimado é imortal; só pode ser selado."',
    decisao:
      'O Guardião Reanimado não tem PV, e o travessão é a regra: a ficha registra PV como '
      + '"—" e desabilita a barra de vida do bloco. Dano contra ele é rolado e resolvido '
      + 'normalmente, para efeito de condições, empurrões e posicionamento, mas é '
      + 'integralmente regenerado no início de cada turno dele. A derrota vem por selamento '
      + '— qualquer técnica que sele criatura ou alma (Fūin: Kanzen Fūsatsu, Hakke no Fūin '
      + 'Shiki, Totsuka no Tsurugi, Kōkinjō e Benihisago, Gogyō Fūin contra a fonte) — ou '
      + 'por um efeito que o texto diga selar. Os atributos são os que ele tinha em vida, e '
      + 'o Mestre não precisa de rank para gerá-los, porque não há PV a calcular.',
    porque:
      'P1: o travessão é escolha e não omissão, e a própria linha já diz por quê — '
      + '"Imortal: regenera todo dano no início do turno. Só pode ser selado" —, repetido '
      + 'no Cap. 24 (LJ:1849-1850). O livro usa o mesmo desenho para os bijū e o declara '
      + 'em voz alta em LJ:2139-2140: "a condição de vitória nunca é reduzir PV a 0. É '
      + 'sempre selar, alcançar o hospedeiro ou evacuar." Calcular um PV para o Edo Tensei '
      + 'seria oferecer à mesa uma condição de vitória que o livro fecha de propósito.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      pnj: 'guardiao_reanimado',
      pv: null,
      defesa: 16,
      regeneraTodoDano: 'inicio do turno',
      derrotaPor: 'selamento',
      exigeRank: false,
    },
  },
];

