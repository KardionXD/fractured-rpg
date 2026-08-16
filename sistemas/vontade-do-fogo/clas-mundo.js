// ══════════════════════════════════════════════════════════════════
//  CLÃS DE OUTRAS NAÇÕES E SEM VILA — A VONTADE DO FOGO
//  Livro V — Compêndio dos Clãs, Capítulo 28 (páginas 32 a 49).
//
//  "Konoha não tem monopólio sobre sangue especial. Kiri caçou os seus
//  até quase extingui-los, Iwa transformou os seus em armas, Suna
//  vendeu os seus por orçamento — e alguns dos clãs mais perigosos do
//  mundo não pertencem a vila nenhuma."
//
//  Complemento de CLAS_AVDF (conteudo.js), que guarda os clãs de
//  Konohagakure. Mesma estrutura: PASSIVA sempre ativa, FARDO, cinco
//  ESTÁGIOS (I grátis na criação, depois 6/8/12/18 PT) e um catálogo
//  de técnicas exclusivas presas a um estágio.
//
//  TRANSCRIÇÃO, NÃO RESUMO. Nada aqui foi inventado: os textos vêm do
//  Compêndio, com a formatação quebrada do PDF corrigida (palavras
//  coladas) e nada mais. Onde o livro não diz, o campo fica null ou
//  vazio e há um comentário `FALTA NO TEXTO`.
//
//  CONVENÇÕES DESTE ARQUIVO
//  • `kg`        — id de KEKKEI_GENKAI_AVDF/LINHAGENS_CORPO_AVDF, ou
//                  null quando o livro não trata o traço como kekkei
//                  genkai (hiden, traço hereditário, arte aprendida).
//  • `naturezas` — só entram as naturezas que o texto AFIRMA que o clã
//                  concede ou domina de graça. Técnica temática de água
//                  não conta como concessão.
//  • `ajustes`   — valores fixos de ficha alterados pela passiva.
//                  `recursos: { pv, pc, pcPct }` e `defesa`. Cada um
//                  vem com a frase do livro no comentário acima.
//  • Rank de estágio: o livro escreve "Elite" no Estágio V; aqui vira
//                  'anbu', que é o id de ANBU / Elite em RANKS_AVDF.
//  • PC de técnica sustentada é transcrito como está na tabela
//                  ('4+1/rd', '16+6/rd'); 'tudo' é literal do livro.
// ══════════════════════════════════════════════════════════════════

const CLAS_MUNDO_AVDF = [

  // ────────────────────────────────────────────────────────────────
  //  KAGUYA — Kirigakure — p. 32
  // ────────────────────────────────────────────────────────────────
  {
    id: 'kaguya', nome: 'Kaguya', regiao: 'Kirigakure', kanji: 'かぐや',
    lema: 'Amavam tanto a batalha que atacaram uma vila oculta sem plano.',
    resumo: 'O Shikotsumyaku — a linhagem de ossos mortos — dá controle absoluto sobre a densidade, o crescimento e a forma do próprio esqueleto. O clã era famoso menos pela técnica e mais pela mania: os Kaguya não lutavam por território nem dinheiro, lutavam porque gostavam; marcharam contra Kirigakure sem declaração de guerra e foram aniquilados até o último — exceto uma criança que o próprio clã mantinha numa jaula por ser instável demais até para eles.',
    passiva: {
      nome: 'Shikotsumyaku',
      efeito: 'Você conta permanentemente como armado (1d8+TAI), ganha +3 de Defesa pela densidade óssea, e ossos quebrados se reconstroem ao fim de cada combate. Você é imune a Desarmar e a efeitos que dependam de tirar sua arma.',
    },
    fardo: {
      nome: 'A doença e a fome de luta',
      efeito: 'O clã carregava uma degeneração óssea hereditária. O Mestre pode oferecer um relógio: um número de sessões antes que o corpo comece a falhar. Aceitar rende +2 PT por sessão — e o relógio corre de verdade. Além disso, sempre que houver chance de evitar um combate, teste ESP CD 13: a falha significa que o corpo dele já se moveu antes de você decidir.',
    },
    kg: 'shikotsumyaku',
    naturezas: [],   // FALTA NO TEXTO: o Compêndio não atribui nenhuma natureza ao Kaguya.
    //  Passiva: "ganha +3 de Defesa pela densidade óssea".
    ajustes: { defesa: +3 },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Sacar o primeiro osso como arma, o que dói exatamente como parece.',
        destrava: 'Estilo Shikotsu-ryū sem custo e a Dança da Camélia.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Vencer uma luta que você poderia ter evitado, e entender que quis lutar.',
        destrava: 'Dança do Salgueiro.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Encontrar outro vestígio do clã: um túmulo, um registro, um sobrevivente.',
        destrava: 'Dança da Samambaia e +5 de redução a dano físico.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Descobrir o que o clã fazia com os membros que não conseguiam parar.',
        destrava: 'Dança do Larício e reconstrução em combate.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: decidir se a linhagem continua com você ou termina com você.',
        destrava: 'Dança da Flor Sem Vida.' },
    ],
    tecnicas: [
      { nome: 'Tsubaki no Mai (Camélia)', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Saca um osso do braço como espada curta. Ataque adicional como Ação Menor, 1d8+TAI.' },
      { nome: 'Yanagi no Mai (Salgueiro)', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Lâminas ósseas brotam dos braços e costas. Dois ataques de 2d6+TAI por turno, e Vantagem para Bloquear.' },
      { nome: 'Shikotsumyaku: Hone Yari', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Projeta um osso da palma como projétil perfurante: 2d6+TAI a Média — a única resposta de alcance do clã.' },
      { nome: 'Sawarabi no Mai (Samambaia)', rank: 'A', pc: 11, estagio: 'III',
        efeito: 'Uma floresta de espinhos ósseos irrompe cobrindo três zonas: 4d6 a todos e Preso (CD 17). O terreno permanece pela cena.' },
      { nome: 'Tessenka no Mai: Tsuru', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Um chicote de coluna vertebral com alcance de duas zonas. Agarra e puxa: o alvo fica Preso e trazido para Contato.' },
      { nome: 'Shikotsumyaku: Hone Yoroi', rank: 'B', pc: '7+2/rd', estagio: 'IV',
        efeito: 'Sustentada. Casca óssea externa: redução 10 e imunidade a perfuração. Sem movimento livre.' },
      { nome: 'Karamatsu no Mai (Larício)', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Sustentada (2 PC/rd). Espinhos brotam de todo o corpo: todo atacante em Contato sofre 3d6 automaticamente, sem rolagem, ao atacar.' },
      { nome: 'Tessenka no Mai: Hana', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Uma broca óssea da densidade máxima: 6d6+TAI e ignora toda redução, incluindo jutsus defensivos de rank A.' },
      { nome: 'Dança da Flor Sem Vida', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Você deixa de ter forma humana. Por 5 rodadas: três ataques de 5d6+TAI/turno, redução 15, e cada ataque em Contato devolve 4d6. Ao fim: 3 Exaustão e um Ferimento Grave.' },
    ],
    estilo: 'O taijutsu definitivo. Nunca desarmado, nunca sem defesa, com resposta automática a quem chega perto e uma técnica que ignora qualquer proteção. A fraqueza é a de todo lutador corporal — alcance — agravada por o clã inteiro ser uma provocação ambulante para inimigos que preferem lutar de longe.',
  },

  // ────────────────────────────────────────────────────────────────
  //  HŌZUKI — Kirigakure — p. 33
  // ────────────────────────────────────────────────────────────────
  {
    id: 'hozuki', nome: 'Hōzuki', regiao: 'Kirigakure', kanji: '鬼灯',
    lema: 'Corpos que viram água. Todos os nomes terminam em "lua".',
    resumo: 'O Suika no Jutsu converte o próprio corpo em água — não como ilusão, literalmente. Contra taijutsu e armas, um Hōzuki é praticamente invencível; contra raio, é um cadáver — e Kirigakure usou essa vulnerabilidade sistematicamente nos expurgos de kekkei genkai. O clã sobreviveu por se dispersar e por produzir alguns dos portadores mais competentes das Sete Espadas.',
    passiva: {
      nome: 'Corpo Líquido',
      efeito: 'Como Reação, converta seu corpo em água: ataques físicos causam metade do dano. Gastando 2 PC, o dano é anulado por completo — no máximo duas vezes por combate, e o segundo uso custa 4 PC. Funciona contra taijutsu, armas, projéteis e Doton. Custos permanentes: Raiton causa dano dobrado a você, sempre. E você precisa se manter hidratado — em ambientes secos, perca 2 PV por rodada em combate.',
    },
    fardo: {
      nome: 'Raiton e a sede',
      efeito: 'A vulnerabilidade a raio é pública: qualquer inimigo que saiba o que "Hōzuki" significa vai levar um usuário de Raiton, e o Mestre deve fazer isso acontecer. Missões em deserto ou vulcão custam 2 PV por rodada e exigem carregar água — pesada, e destrutível pelo inimigo.',
    },
    kg: null,        // FALTA NO TEXTO: o livro não chama o Suika no Jutsu de kekkei genkai.
    naturezas: [],   // FALTA NO TEXTO: o livro não diz que o clã concede ou domina Suiton — as técnicas
                     // saem do próprio corpo ("sem fonte externa"), sem menção a concessão de natureza.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira liquefação involuntária, normalmente durante um susto.',
        destrava: 'Suika no Jutsu sustentado.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Escapar de uma prisão da qual ninguém escapa.',
        destrava: 'Dispersão — escape automático de qualquer condição Preso.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Sobreviver a um ataque de Raiton que deveria ter te matado.',
        destrava: 'Grande Hidrificação, e Raiton causa dano normal em vez de dobrado uma vez por combate.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Empunhar uma das Sete Espadas, o que exige tomá-la de alguém.',
        destrava: 'Fusão Aquática e proficiência com uma Espada da Névoa.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: reunir mais de uma das Sete Espadas, ou reconstruir o clã.',
        destrava: 'Suika: Kanzen Ekitai.' },
    ],
    tecnicas: [
      { nome: 'Suika no Jutsu', rank: 'C', pc: '4+1/rd', estagio: 'I',
        efeito: 'Sustentada. Imune a agarrões, prisões e a todo dano cortante ou perfurante. Atravessa frestas e grades.' },
      { nome: 'Mizu Teppō', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Jato pressurizado do próprio corpo, sem fonte externa: 1d6+NIN, alcance Média.' },
      { nome: 'Suika: Sanran', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Reação. Espalha-se em gotas por uma zona e se reconstitui em qualquer ponto. Escapa de cerco e de área de efeito.' },
      { nome: 'Daisuika no Jutsu', rank: 'B', pc: '7+3/rd', estagio: 'III',
        efeito: 'Absorve a água disponível e cresce: invocação Grande por 3 rodadas, 4d6+TAI, redução 8.' },
      { nome: 'Suika: Kajō', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Braço líquido por duas zonas: agarra (Preso) ou golpeia por 3d6+TAI, e não pode ser bloqueado.' },
      { nome: 'Suichū Yūgō', rank: 'A', pc: '11+3/rd', estagio: 'IV',
        efeito: 'Funde-se a qualquer corpo d’água: indetectável mesmo por sensores, velocidade máxima na água, ataca de qualquer ponto com Vantagem.' },
      { nome: 'Suika: Kanzen Ekitai', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Por 4 rodadas: imune a todo dano físico e elemental exceto Raiton, atravessa qualquer barreira não selada, ataques ignoram redução. Raiton causa triplo nessas rodadas.' },
    ],
    estilo: 'Quase imortal e catastroficamente vulnerável. Contra um time sem Raiton, não pode ser derrotado por meios convencionais; contra um único usuário de Raiton competente, morre mais rápido que qualquer outro clã. É o personagem mais binário do sistema, e isso é o ponto.',
  },

  // ────────────────────────────────────────────────────────────────
  //  YUKI — Kirigakure — p. 34
  // ────────────────────────────────────────────────────────────────
  {
    id: 'yuki', nome: 'Yuki', regiao: 'Kirigakure', kanji: '雪',
    lema: 'Perseguidos até a extinção por nascerem com uma vantagem.',
    resumo: 'O Hyōton combina Água e Vento para gerar gelo do nada — sem fonte, em qualquer clima. Linhagem elegante e de altíssima mobilidade; por um tempo os Yuki foram respeitados em Kirigakure, até a guerra civil, quando ter sangue especial em Kiri virou sentença de morte. Os sobreviventes cresceram sabendo que o dom que os define é a coisa que os mata.',
    passiva: {
      nome: 'Sangue de Gelo',
      efeito: 'Você domina Suiton e Fūton de graça e pode moldá-los simultaneamente. É imune a frio e a efeitos hostis de Suiton, e gera gelo sem fonte de água. Faz selos com uma única mão — a outra fica livre e seus jutsus ficam muito mais difíceis de prever.',
    },
    fardo: {
      nome: 'Um nome que mata',
      efeito: 'Se alguém em Kirigakure descobrir o que você é, existe uma ordem antiga nunca revogada. Fora de Kiri, você vale muito para colecionadores. Role 1d6 ao chegar em cidade nova: em 1, alguém reconheceu a técnica que você usou na última missão. E Katon de rank B+ derrete suas construções: contra fogo competente, metade do arsenal defensivo não existe.',
    },
    kg: 'hyoton',
    naturezas: ['suiton', 'futon'],
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira manifestação, normalmente involuntária e diante de testemunhas erradas.',
        destrava: 'Tsubame Fubuki e as técnicas de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Esconder o que você é de alguém que quase descobriu.',
        destrava: 'Espelho Único — teleporte entre espelhos de gelo.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Revelar o que você é a alguém, por escolha, e sobreviver a isso.',
        destrava: 'Sensatsu Suishō.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Encontrar outro Yuki vivo — e decidir se conta a ele que existem outros.',
        destrava: 'Makyō Hyōshō.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: forçar uma vila a reconhecer publicamente o que fez com a sua família.',
        destrava: 'Hyōton: Kōri Sekai.' },
    ],
    tecnicas: [
      { nome: 'Hyōton: Tsubame Fubuki', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Andorinhas de gelo teleguiadas: 2d6+NIN e Lento. Perseguem por uma rodada extra se errarem.' },
      { nome: 'Hyōton: Hyōten', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Congela o solo de uma zona: terreno difícil, e quem se mover nela testa COR CD 13 ou fica Caído.' },
      { nome: 'Hyōton: Hyōkagami', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Cria um espelho até Média. Ação Menor: teleporte-se até ele. Até três espelhos ativos.' },
      { nome: 'Hyōton: Sensatsu Suishō', rank: 'B', pc: 7, estagio: 'III',
        efeito: '5d6+NIN numa zona, sem esquiva — as agulhas vêm de todas as direções. Alvos atingidos ficam Presos.' },
      { nome: 'Hyōton: Nuregarasu', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Encasula o alvo na umidade do ar: Preso e Selado (CD 16), e perde 1d6 PV/rd de hipotermia.' },
      { nome: 'Hyōton: Rōga Nadare', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Lobos de gelo em avalanche: 5d6+NIN em três zonas, todos Caídos, e o terreno vira gelo escorregadio.' },
      { nome: 'Hyōton: Makyō Hyōshō', rank: 'A', pc: '11+4/rd', estagio: 'IV',
        efeito: 'Uma cúpula de espelhos numa zona: você se move entre eles livremente, dois ataques por turno, ataques contra você com Desvantagem, e ninguém sai sem quebrar um espelho (CD 18).' },
      { nome: 'Hyōton: Kōri Sekai', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Congela cinco zonas: 6d6 a todos os inimigos, todos Presos (CD 19), o terreno vira seu, e você teleporta para qualquer ponto como Ação Menor pela cena.' },
    ],
    estilo: 'Mobilidade absoluta e controle. Nenhum clã é mais difícil de acertar, e o Makyō Hyōshō é provavelmente a melhor técnica de rank A do livro para um duelo isolado. A fraqueza é fogo e escala: contra Katon pesado ou vários inimigos espalhados, o gelo derrete mais rápido do que você o cria.',
  },

  // ────────────────────────────────────────────────────────────────
  //  TERUMĪ — Kirigakure — p. 35
  // ────────────────────────────────────────────────────────────────
  {
    id: 'terumi', nome: 'Terumī', regiao: 'Kirigakure', kanji: '照美',
    lema: 'Dois kekkei genkai num só corpo — e a Mizukage que reconstruiu a Névoa Sangrenta.',
    resumo: 'Portar um kekkei genkai já é raro; portar dois foi documentado uma única vez, e produziu a Quinta Mizukage. Yōton (Lava) derrete; Futton (Vapor) corrói — juntos, não existe defesa material que sobreviva. A Quinta assumiu com uma agenda declarada: desmontar as castas, abolir a graduação por combate mortal, e transformar Kiri numa vila que as outras quatro não tratem como problema. Conseguiu a maior parte.',
    passiva: {
      nome: 'Sangue Corrosivo',
      efeito: 'Escolha Yōton (🔥+🪨) ou Futton (🔥+💧) na criação. Todos os seus jutsus daquela natureza reduzem a Defesa do alvo em 3 pelo resto da cena — armadura, pele e coberturas derretem. A corrosão não acumula: o máximo é −3 por alvo, e uma Ação Principal do alvo remove a camada superficial.',
    },
    fardo: {
      nome: 'Duas marcas',
      efeito: 'Você carrega duas linhagens que uma geração inteira foi caçada por ter. Em Kirigakure, membros mais velhos ainda se lembram; fora de Kiri, você é a aquisição mais valiosa do mercado negro. Mecanicamente, seus jutsus destroem terreno e coberturas permanentemente, inclusive as que o seu time usava — aliados na zona de efeito não recebem cortesia.',
    },
    //  O clã tem dois KG e o texto manda escolher um na criação; o Estágio III
    //  destrava "a segunda natureza do clã". Por isso o campo `kg` guarda a
    //  escolha padrão e `kgAlternativo` guarda a outra.
    kg: 'yoton',
    kgAlternativo: 'futton',
    //  Do próprio texto da passiva: Yōton = 🔥+🪨 (Katon+Doton), Futton = 🔥+💧
    //  (Katon+Suiton). Katon é comum às duas; a terra ou a água entra conforme
    //  a linhagem escolhida. O livro não diz "domina de graça" em lugar nenhum.
    naturezas: ['katon'],
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Descobrir qual das duas linhagens você herdou.',
        destrava: 'A técnica de assinatura da natureza escolhida.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Derreter uma defesa que era considerada impenetrável.',
        destrava: 'Derretimento: seus jutsus atravessam defesas de Doton e Suiton como se não existissem.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Sobreviver a alguém que descobriu o que você é e tentou coletar.',
        destrava: 'A segunda natureza do clã.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Assumir uma posição de comando em Kirigakure, com tudo que isso significa lá.',
        destrava: 'Técnicas de Estágio IV e autoridade política.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: mudar a lei de uma nação.',
        destrava: 'Yōton/Futton: Kaiyō Metsu.' },
    ],
    tecnicas: [
      { nome: 'Yōton: Yōkai no Jutsu', rank: 'C', pc: 4, estagio: 'I',
        efeito: '2d6+NIN, o alvo fica Queimando e o terreno vira lava por 2 rodadas.' },
      { nome: 'Futton: Kōmu no Jutsu', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Vapor corrosivo numa zona: 2d6/rd a quem permanecer, e armas e armaduras dentro são corroídas permanentemente.' },
      { nome: 'Yōton: Yōgan Kyū', rank: 'B', pc: 7, estagio: 'II',
        efeito: '3d6+NIN e o solo derrete: terreno difícil e 1d6/rd a quem estiver nele.' },
      { nome: 'Futton: Jōki Bakuha', rank: 'B', pc: 7, estagio: 'II',
        efeito: '3d6+NIN numa zona e todos ficam Cegos por uma rodada — o vapor ataca os olhos primeiro.' },
      { nome: 'Yōton: Yōgan Yōkai', rank: 'A', pc: 11, estagio: 'III',
        efeito: 'Inunda três zonas de rocha derretida: 5d6+NIN e terreno intransitável pela cena. Rompe fortificações de terra.' },
      { nome: 'Futton: Kōmu Rō', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Cúpula de vapor superaquecido em torno de um alvo: Preso (CD 16), 3d6/rd, e ele não vê para fora.' },
      { nome: 'Yōton: Kōkoku', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Jato cirúrgico que destrói selos, barreiras e fūinjutsu de rank A- sem teste. A resposta de Kiri a Uzushio.' },
      { nome: 'Kaiyō Metsu', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Lava e vapor simultâneos: 8d6 em duas zonas, ignora toda redução, destrói coberturas, e sobreviventes ficam Queimando com Defesa −5 pela cena.' },
    ],
    estilo: 'Quebrador de defesas. É a resposta direta a qualquer inimigo que dependa de fortificação, armadura, barreira ou selo — e nenhum outro clã reduz Defesa permanentemente. A fraqueza é o fogo amigo: quase todo o arsenal é área, corrosivo e persistente.',
  },

  // ────────────────────────────────────────────────────────────────
  //  HOSHIGAKI — Kirigakure — p. 37
  // ────────────────────────────────────────────────────────────────
  {
    id: 'hoshigaki', nome: 'Hoshigaki', regiao: 'Kirigakure', kanji: '干柿',
    lema: 'Traços de tubarão, reservas de chakra que assustam bijū.',
    resumo: 'Nascem com características físicas de tubarão: pele áspera acinzentada, guelras nas bochechas, dentes triangulares. O traço mais relevante é outro: a reserva de chakra é anormalmente grande, a ponto de um adulto rivalizar com um jinchūriki de cauda baixa — o que os tornou os portadores naturais da Samehada, a espada senciente que se alimenta de chakra e devora quem não tem o que oferecer.',
    passiva: {
      nome: 'Fisiologia de Tubarão',
      efeito: '+40% de PC máximos. Você respira debaixo d’água indefinidamente, nada à velocidade de corrida, e detecta sangue na água a até Longa. Seus ataques desarmados causam 1d8+TAI (mordida e pele abrasiva).',
    },
    fardo: {
      nome: 'A espada escolhe',
      efeito: 'A Samehada é senciente e desleal: testa o portador continuamente e abandona quem enfraquece. Sempre que você cair abaixo de 1/4 dos PC máximos em combate, teste ESP CD 15 — na falha, a espada se recusa a ser empunhada até o fim da cena, e pode tentar ir para a mão de um inimigo mais forte. Além disso, sua aparência é impossível de disfarçar: infiltração social está fechada para você.',
    },
    //  "Não é kekkei genkai formal, mas é hereditário e inconfundível."
    kg: null,
    naturezas: ['suiton'],   // Estágio I: "Suiton dominado de graça e as técnicas de Estágio I."
    //  Passiva: "+40% de PC máximos" — percentual, não valor fixo.
    ajustes: { recursos: { pcPct: +40 } },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'O primeiro combate submerso, que o clã trata como batismo.',
        destrava: 'Suiton dominado de graça e as técnicas de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Vencer alguém que tinha vantagem elemental sobre você por puro volume de chakra.',
        destrava: 'Kōkyū Suiton — gere água sem fonte externa.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Ser testado pela Samehada e não ser devorado por ela.',
        destrava: 'Proficiência com a Samehada ou outra Espada da Névoa.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Ser reconhecido como um dos Sete Espadachins Ninja da Névoa.',
        destrava: 'Daikōdan e as técnicas de Estágio IV.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: fundir-se parcialmente com a Samehada, o que muda o que você é.',
        destrava: 'Samehada Yūgō.' },
    ],
    tecnicas: [
      { nome: 'Suikōdan no Jutsu', rank: 'B', pc: 7, estagio: 'I',
        efeito: 'Um tubarão de água persegue o alvo: 3d6+NIN, sem penalidade por alcance, inesquivável por movimento.' },
      { nome: 'Samehada: Kezuri', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'A espada não corta, rala: 2d6+TAI e drena 1d6 PC do alvo, transferindo para você.' },
      { nome: 'Suiton: Bakusui Shōha', rank: 'A', pc: 11, estagio: 'III',
        efeito: 'Cospe água suficiente para inundar o campo: todo o terreno vira aquático pela cena, habilitando seus Suiton e dando posicionamento total.' },
      { nome: 'Goshokuzame', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Cinco tubarões guiados pelas mãos: 1d6+NIN/rd por 3 rodadas, sem gastar ação após a primeira.' },
      { nome: 'Samehada: Kyūin', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Reação. A Samehada devora um ninjutsu de rank A- direcionado a você ou a um aliado adjacente, convertendo em PC (metade do custo).' },
      { nome: 'Daikōdan no Jutsu', rank: 'S', pc: 16, estagio: 'IV',
        efeito: 'Um tubarão colossal que devora o chakra do jutsu inimigo: num duelo, absorve o rival, cresce, e atinge com 8d6 + o rank absorvido.' },
      { nome: 'Samehada Yūgō', rank: 'S', pc: '16+5/rd', estagio: 'V',
        efeito: 'Você e a Samehada viram uma criatura só. Por 5 rodadas: +4 TAI e COR, regenera 2d6 PV/rd, drena 2d6 PC de todo alvo que tocar. Ao fim, um Ferimento Grave.' },
    ],
    estilo: 'Atrito e absorção. Nenhum clã converte recursos inimigos em próprios com tanta eficiência — fica mais forte conforme a luta se estende, e é a resposta natural a especialistas em ninjutsu. A fraqueza é dependência de água para o melhor do arsenal, e uma arma que pode trair você no pior momento.',
  },

  // ────────────────────────────────────────────────────────────────
  //  YOTSUKI — Kumogakure — p. 38
  // ────────────────────────────────────────────────────────────────
  {
    id: 'yotsuki', nome: 'Yotsuki', regiao: 'Kumogakure', kanji: '夜鋤',
    lema: 'Sem sangue especial. Só músculo, raio e disciplina absurda.',
    resumo: 'O Primeiro Raikage concedeu terras aos Yotsuki na fundação de Kumo, e desde então o clã ocupa a espinha dorsal militar da vila. Sem kekkei genkai nem dōjutsu: têm um regime de treino que outras vilas consideram desumano e uma doutrina chamada nintaijutsu, que funde Raiton com combate corporal. Produziram o Quarto Raikage e o jinchūriki do Oito-Caudas.',
    passiva: {
      nome: 'Corpo de Kumogakure',
      efeito: '+12 PV e você reduz todo dano físico em 3. Domina Raiton de graça. Você é imune a efeitos de Empurrar e Derrubar vindos de fontes de rank C ou inferior.',
    },
    fardo: {
      nome: 'A reputação de Kumo',
      efeito: 'Fora do País do Raio, você é tratado como suspeito por padrão: Desvantagem em Persuasão com membros de clãs que possuem kekkei genkai ou dōjutsu, e clãs Hyūga e Yuki reagem à sua presença com hostilidade aberta. A Armadura de Raio também é cara: 3 PC por rodada esvazia até um Jōnin em poucos turnos.',
    },
    kg: null,   // "Sem kekkei genkai nem dōjutsu."
    naturezas: ['raiton'],
    //  Passiva: "+12 PV e você reduz todo dano físico em 3". Só o PV vira ajuste
    //  de ficha; a redução de dano é efeito de combate e fica na passiva.
    ajustes: { recursos: { pv: +12 } },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Completar o regime de condicionamento do clã sem desistir.',
        destrava: 'Nintaijutsu — desarmado causa 1d8+TAI e atordoa em Decisivo.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Aguentar um golpe destinado a outra pessoa e continuar de pé.',
        destrava: 'Raiton no Yoroi (11 PC na tabela) a custo reduzido: 8 PC.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Ser designado guarda-costas direto do Raikage por uma missão.',
        destrava: 'Reflexo Relâmpago — uma Reação adicional, uma vez por combate.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Vencer um duelo formal contra outro Yotsuki diante do clã.',
        destrava: 'Raigyaku Suihei e Velocidade do Raikage.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: erguer alguma coisa maior que você — literalmente ou não.',
        destrava: 'Raiton no Yoroi: Kanzen.' },
    ],
    tecnicas: [
      { nome: 'Raiton: Jūhō', rank: 'C', pc: 4, estagio: 'I',
        efeito: '2d6+TAI e Atordoado em Decisivo. Ignora Bloqueio com arma de metal.' },
      //  A tabela imprime rank A com 8 PC — o custo já reduzido do Estágio II.
      { nome: 'Raiton no Yoroi', rank: 'A', pc: '8+3/rd', estagio: 'II',
        efeito: 'Sustentada. +2 TAI e COR, movimento de duas zonas, Esquiva duas vezes por rodada. A marca dos Raikage.' },
      { nome: 'Rariatto', rank: 'B', pc: 7, estagio: 'II',
        efeito: 'Investida com o antebraço em corrida: 4d6+TAI, Empurrado duas zonas e Caído. Contra parede, +2d6.' },
      { nome: 'Raiton: Kage Bunshin no Ken', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Duas espadas de Kumo carregadas de raio: dois ataques de 1d8+TAI/turno, ambos atordoando em Decisivo.' },
      { nome: 'Shunshin: Raiton', rank: 'C', pc: 4, estagio: 'III',
        efeito: 'Ação Menor. Mova até três zonas instantaneamente e ataque ao chegar com Vantagem.' },
      { nome: 'Raigyaku Suihei', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Agarra e gira o alvo em alta velocidade antes de cravá-lo no solo: 5d6+TAI, Atordoado por duas rodadas, e perde a próxima Reação.' },
      { nome: 'Raiton no Yoroi: Kanzen', rank: 'S', pc: '16+6/rd', estagio: 'V',
        efeito: 'Enquanto ativa: +4 TAI e COR, você age duas vezes na iniciativa, reduz todo dano físico em 10, e quem te tocar sofre 3d6 de descarga.' },
    ],
    estilo: 'O lutador puro mais rápido e mais durável do livro, sem truques e sem defesa a ser rompida. A fraqueza é a queima de chakra e a ausência total de resposta a controle de campo — um Nara ou Aburame competente desmonta um Yotsuki sem nunca trocar um golpe.',
  },

  // ────────────────────────────────────────────────────────────────
  //  NII — Kumogakure — p. 39
  // ────────────────────────────────────────────────────────────────
  {
    id: 'nii', nome: 'Nii', regiao: 'Kumogakure', kanji: '二位',
    lema: 'A linhagem que Kumo escolheu para carregar o Dois-Caudas.',
    resumo: 'Família pequena com afinidade hereditária por fogo azul — variante de Katon que queima mais quente e responde mal a extinção convencional. Essa afinidade foi a razão de a vila escolher a linhagem para hospedar Matatabi, o Dois-Caudas; o clã aceitou a designação como honra e sofreu as consequências como qualquer família de jinchūriki: isolamento, vigilância e a certeza de que o filho mais promissor de cada geração pertence à vila antes de pertencer a eles.',
    passiva: {
      nome: 'Chama Azul',
      efeito: 'Seus jutsus Katon queimam mais quente: +1d6 ao dano, e a condição Queimando que você causa exige duas ações para ser apagada em vez de uma. Você domina Katon de graça e é imune a fogo comum.',
    },
    fardo: {
      nome: 'Escolhidos para carregar',
      efeito: 'A vila considera a sua linhagem propriedade estratégica. Se o Dois-Caudas ficar sem hospedeiro durante a campanha, você é o próximo nome na lista — e a decisão não é sua. Além disso, sua chama não distingue amigo de inimigo: aliados em área sofrem dano cheio, e o Queimando é mais difícil de apagar para eles também.',
    },
    kg: null,   // O texto chama de "afinidade hereditária por fogo azul", não de kekkei genkai.
    naturezas: ['katon'],
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira chama que sai azul e não vermelha.',
        destrava: 'Aoi Katon e as técnicas de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Controlar o fogo em um lugar onde ele não poderia se espalhar.',
        destrava: 'Nekomata no Kamae — postura felina, +2 em COR e Acrobacia.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Ser considerado para a designação de jinchūriki — e aceitar ou recusar.',
        destrava: 'Nekoashi e técnicas de Estágio III.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Aprender o método de selamento de Kumo, o Selo da Armadura de Ferro.',
        destrava: 'Aoi Enjin e Fūinjutsu treinado.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: dominar a chama a ponto de ela obedecer sem selo.',
        destrava: 'Nezumi Kedama.' },
    ],
    tecnicas: [
      { nome: 'Aoi Katon', rank: 'C', pc: 4, estagio: 'I',
        efeito: '2d6+NIN e Queimando reforçado. A chama atravessa Suijinheki de rank C sem ser apagada.' },
      { nome: 'Katon: Hibashira', rank: 'B', pc: 7, estagio: 'II',
        efeito: 'Coluna de fogo azul sob o alvo: 3d6+NIN, Empurrado para cima e Caído ao voltar.' },
      { nome: 'Aoi Bunshin', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Um clone que detona em chama azul ao ser destruído: 3d6 em Contato e o atacante fica Queimando.' },
      { nome: 'Nekoashi', rank: 'C', pc: 4, estagio: 'III',
        efeito: 'Garras de chakra azul nas mãos e pés: 2d6+TAI, escala qualquer superfície sem teste, e ataques em queda ganham Vantagem.' },
      { nome: 'Aoi Enjin', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Anel de fogo azul cerca uma zona: ninguém entra ou sai sem sofrer 4d6 e ficar Queimando. Dura 3 rodadas.' },
      { nome: 'Nezumi Kedama', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Esfera de chama azul comprimida que consome tudo que toca: 8d6, ignora redução, e o alvo queima 3d6/rd até ser submerso em água corrente ou o usuário cessar.' },
    ],
    estilo: 'Katon puro e agressivo, com a melhor persistência de dano do livro. A fraqueza é o controle: chama azul é difícil de conter, e um Nii em ambiente fechado, com aliados por perto ou em missão de captura, é um risco constante.',
  },

  // ────────────────────────────────────────────────────────────────
  //  KAMIZURU — Iwagakure — p. 40
  // ────────────────────────────────────────────────────────────────
  {
    id: 'kamizuru', nome: 'Kamizuru', regiao: 'Iwagakure', kanji: '上水流',
    lema: 'Já foram o clã mais poderoso de Iwa. Hoje são um nome que já foi grande.',
    resumo: 'O Hiden Kamizuru controla abelhas e vespas ninja — colônias treinadas ao longo de gerações, capazes de reconhecimento regional, envenenamento e imobilização por mel endurecido. A queda veio de uma invasão a Konoha planejada pelo clã sem apoio da vila, que terminou em desastre: perderam a maior parte dos membros, a confiança do Tsuchikage e a posição.',
    passiva: {
      nome: 'Colmeia de Guerra',
      efeito: 'Abelhas ninja obedecem você. Como Ação Menor: um enxame de reconhecimento mapeia uma área inteira em minutos, ou você marca um alvo com feromônio (Marcado permanentemente e rastreável a qualquer distância até que se lave).',
    },
    fardo: {
      nome: 'A humilhação herdada',
      efeito: 'Em Iwagakure, o sobrenome carrega o fracasso da invasão: Desvantagem em Persuasão com autoridades da vila até o Estágio IV. E a rivalidade com os Aburame não é retórica — encontrar um deles em campo significa que uma das colônias vai devorar a outra, e a sua é a que come mel, não chakra.',
    },
    kg: null,        // Hiden, não kekkei genkai.
    naturezas: [],   // FALTA NO TEXTO: o Compêndio não atribui natureza ao Kamizuru.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Receber a primeira colmeia portátil da família.',
        destrava: 'Kikōbachi no Jutsu.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Vencer um Aburame — ou perder de um jeito que o clã considere honroso.',
        destrava: 'Hachi Yari e alcance dobrado.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Recuperar algo que o clã perdeu na invasão fracassada.',
        destrava: 'Mitsu Rō e colônia venenosa.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Reconquistar a confiança formal do Tsuchikage.',
        destrava: 'Hachi no Yoroi e técnicas de Estágio IV.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: restaurar o clã à posição que tinha, ou aceitar que a era acabou.',
        destrava: 'Kuchiyose: Joō.' },
    ],
    tecnicas: [
      { nome: 'Kikōbachi no Jutsu', rank: 'C', pc: 4, estagio: 'I',
        efeito: '2d6+NIN numa zona e todos os atingidos ficam Envenenados.' },
      { nome: 'Hachi Yari', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Uma vespa gigante como projétil teleguiado: 2d6+NIN com Vantagem no acerto, alcance Média.' },
      { nome: 'Mitsu Rō no Jutsu', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Cobre uma zona de mel endurecido: terreno difícil e Preso (CD 15). O mel é inflamável — devastador com um aliado de Katon.' },
      { nome: 'Hachi no Yoroi', rank: 'B', pc: '7+2/rd', estagio: 'IV',
        efeito: 'Sustentada. Casulo vivo: redução 6, e todo atacante em Contato fica Envenenado.' },
      { nome: 'Dokubari Arashi', rank: 'A', pc: 11, estagio: 'IV',
        efeito: '5d6 a todos em duas zonas, todos Envenenados com veneno de CD 18 para curar.' },
      { nome: 'Kuchiyose: Joō', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Invoca a abelha-rainha (Grande, PV 60, 4d6+5) que gera um novo enxame por rodada — cada um causa 2d6 e Envenenado numa zona à sua escolha, sem gastar sua ação.' },
    ],
    estilo: 'Controle de terreno, veneno e o melhor reconhecimento de Iwa. Fica excelente ao lado de um usuário de Katon. A fraqueza é o dano direto baixo e a fragilidade das colônias contra fogo e vento.',
  },

  // ────────────────────────────────────────────────────────────────
  //  LINHAGEM JINTON — Iwagakure — p. 41
  //  Não é um clã: é uma linhagem/Kekkei Tōta. Traz a estrutura
  //  completa (passiva, cinco estágios, técnicas, fardo) e ainda um
  //  bloco extra, o AVISO DE DISPONIBILIDADE, guardado em `aviso`.
  // ────────────────────────────────────────────────────────────────
  {
    id: 'jinton', nome: 'Linhagem Jinton', regiao: 'Iwagakure', kanji: '塵遁',
    lema: 'Kekkei Tōta — três naturezas ao mesmo tempo. Existe uma no mundo.',
    resumo: 'Combinar duas naturezas já é raridade; combinar três é ordens de magnitude mais difícil, e o único caso confirmado é o Jinton — Elemento Pó — que mistura Terra, Vento e Fogo em cubos de expansão molecular que desintegram tudo dentro deles, sem resíduo. Dois Tsuchikage o portaram, e é uma anomalia que aparece a cada duas ou três gerações; a vila monitora cada nascimento à espera dela.',
    aviso: {
      nome: 'Aviso de disponibilidade',
      texto: 'O Jinton não é opção de criação. Exige rank Jōnin no mínimo, aprovação explícita do Mestre e um Marco de História completo. Um portador é figura de importância nacional. Antes do Estágio IV, joga como um especialista em Doton com afinidade tripla latente.',
    },
    passiva: {
      nome: 'Afinidade Tripla',
      efeito: 'Você domina Doton, Fūton e Katon de graça e pode moldar duas delas simultaneamente sem custo adicional. Jutsus dessas três naturezas custam 1 PT a menos.',
    },
    fardo: {
      nome: 'Você é a dissuasão',
      efeito: 'Um portador de Jinton é um item de tratado internacional. Iwa não permite que você opere fora do país sem escolta, outras nações têm planos de contingência para você, e qualquer uso público é um incidente diplomático. E o Jinton é indiscriminado: não há versão que poupe aliados — todo uso exige o time inteiro fora da área, e o Mestre deve cobrar isso.',
    },
    kg: 'jinton',
    naturezas: ['doton', 'futon', 'katon'],
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Ser testado pela vila e apresentar as três afinidades no papel de chakra.',
        destrava: 'Técnicas combinadas de duas naturezas.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Sobreviver ao regime de treinamento que Iwa aplica a candidatos.',
        destrava: 'Doton: Kajūgan e Fūton: Atsugai.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'A primeira manifestação instável do Jinton — que normalmente destrói alguma coisa cara.',
        destrava: 'Jinton: Shōhen (versão menor e instável).' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Treinamento direto com o Tsuchikage, que só concede a quem considera confiável.',
        destrava: 'Jinton: Genkai Hakuri no Jutsu.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: aceitar ser a arma de dissuasão de uma nação inteira.',
        destrava: 'Jinton: Genkai Byakugō no Jutsu.' },
    ],
    tecnicas: [
      { nome: 'Doton: Kajūgan', rank: 'A', pc: 11, estagio: 'II',
        efeito: 'Multiplica o peso do alvo: fica Lento e sofre 2d6/rd enquanto você mantiver (3 PC/rd).' },
      { nome: 'Doton: Iwa Yado Kuzushi', rank: 'B', pc: 7, estagio: 'II',
        efeito: 'Desaba estruturas de pedra sobre o alvo: 3d6+NIN e Preso sob escombros.' },
      { nome: 'Jinton: Shōhen', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Cubo pequeno de desintegração: 4d6, ignora redução. Instável: numa falha, o cubo se forma no lugar errado — 2d6 no usuário.' },
      { nome: 'Kūchū Idō', rank: 'A', pc: '11+2/rd', estagio: 'IV',
        efeito: 'Manipula o próprio peso para flutuar: voo livre, imunidade a terreno e a corpo a corpo de quem não alcança o ar.' },
      { nome: 'Jinton: Genkai Hakuri', rank: 'S', pc: 16, estagio: 'IV',
        efeito: 'Cubo de desintegração cobrindo duas zonas: 10d6, ignora toda redução e todo defensivo abaixo de rank S. O destruído é destruído permanentemente.' },
      //  A tabela imprime "tudo" na coluna PC — é literal do livro.
      { nome: 'Jinton: Genkai Byakugō', rank: 'S', pc: 'tudo', estagio: 'V',
        efeito: 'Escala de exército: cinco zonas, 15d6. Apaga uma unidade militar inteira em um segundo. Deixa o usuário Exausto de Chakra e com 3 Exaustão.' },
    ],
    estilo: 'Aniquilação. Nada no livro ignora tantas defesas nem destrói tanto. É por isso que é gate-keeped por rank, aprovação e política: um Jinton numa mesa de Genin quebra o jogo, e numa mesa de Jōnin muda o gênero da campanha de aventura para guerra.',
  },

  // ────────────────────────────────────────────────────────────────
  //  KAZEKAGE (JITON) — Sunagakure — p. 42
  // ────────────────────────────────────────────────────────────────
  {
    id: 'kazekage', nome: 'Kazekage', regiao: 'Sunagakure', kanji: '磁遁',
    lema: 'Jiton — magnetismo. A família governante de uma vila que vende os próprios filhos.',
    resumo: 'O Jiton combina Vento e Terra para gerar e controlar campos magnéticos, e sua expressão mais temida é a satetsu — areia de ferro moldável em qualquer forma e densidade. O Terceiro Kazekage, o mais forte da história de Suna, era o portador; depois do desaparecimento dele, a afinidade reapareceu diluída na família governante.',
    passiva: {
      nome: 'Campo Magnético',
      efeito: 'Você domina Fūton e Doton de graça. Todo metal a até Média responde a você: desarme automaticamente alvos com armas de aço (sem teste), redirecione projéteis metálicos como Reação, e ataques com armas metálicas contra você sofrem Desvantagem.',
    },
    fardo: {
      nome: 'O que Suna pede',
      efeito: 'Você nasceu numa família que decidiu o seu destino antes de você nascer, numa vila que já provou estar disposta a sacrificar os próprios filhos por orçamento. O Mestre deve fazer a vila pedir alguma coisa de você pelo menos uma vez por arco — e nunca é pequena. Mecanicamente, sua defesa depende de material: em terreno sem areia, pedra ou metal, a Armadura de Areia e metade das técnicas não funcionam.',
    },
    kg: 'jiton',
    naturezas: ['futon', 'doton'],
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A areia responder pela primeira vez sem você pedir.',
        destrava: 'Satetsu Shigure e Armadura de Areia.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Proteger alguém sem tocar nele.',
        destrava: 'Suna no Tate — a areia se defende sozinha, mas consome a sua Reação.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Enfrentar o que a sua família fez pela vila, e decidir se você faria igual.',
        destrava: 'Satetsu Kaihō.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Acessar os registros do Terceiro Kazekage — que a vila fingiu ter perdido.',
        destrava: 'Sabaku Sōsō e técnicas de Estágio IV.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: tornar-se Kazekage, ou impedir que a vila crie outro jinchūriki.',
        destrava: 'Satetsu Kesshū.' },
    ],
    tecnicas: [
      { nome: 'Suna no Yoroi', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Camada permanente sobre a pele: absorve 10 de dano por combate e se reconstrói entre cenas, sem manutenção.' },
      { nome: 'Satetsu Shigure', rank: 'C', pc: 4, estagio: 'I',
        efeito: '2d6+NIN numa zona, ignora cobertura leve, e o metal permanece no campo para uso posterior.' },
      { nome: 'Suna no Tate', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Gaste sua Reação: a areia intercepta o primeiro ataque físico do turno, reduzindo 3d6. Consome a Reação normal da rodada.' },
      { nome: 'Satetsu Kaihō', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Molda a areia de ferro em lanças, pilares, mandíbulas: 5d6 e o alvo fica Preso (CD 17).' },
      { nome: 'Sabaku Kyū', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Envolve um alvo em areia compactada: Preso (CD 18) e sem respirar — 2d6/rd e Desvantagem em tudo.' },
      { nome: 'Sabaku Sōsō', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Fecha a mão: um alvo já Preso por Sabaku Kyū sofre 8d6 automáticos, sem acerto e sem esquiva. Abaixo de 1/4 dos PV, é fatal.' },
      { nome: 'Ryūsa Bakuryū', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Onda de areia cobre quatro zonas: 4d6 a todos, terreno difícil permanente, e material para todas as técnicas pela cena.' },
      { nome: 'Satetsu Kesshū', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Toda a areia de ferro converge numa esfera colossal: 10d6 em três zonas; ao dispersar, todo inimigo com equipamento metálico fica Lento pela cena.' },
    ],
    estilo: 'Controle absoluto de campo com defesa embutida — o clã mais autossuficiente do livro, capaz de atacar, prender e se proteger sem depender de ninguém. A fraqueza é a dependência de material e a lentidão: contra alguém veloz o suficiente para não ser preso, o Jiton fica só assistindo.',
  },

  // ────────────────────────────────────────────────────────────────
  //  MARIONETISTAS DE SUNA — Sunagakure — p. 43
  //  "Não é um clã de sangue. É uma tradição fechada." A tabela de
  //  estágios vem intitulada só PROGRESSÃO (sem "DO CLÃ"), mas tem os
  //  cinco estágios normais. Traz um bloco extra de MÓDULOS DE
  //  MARIONETE, guardado em `modulos` e `marionete`.
  // ────────────────────────────────────────────────────────────────
  {
    id: 'marionetistas', nome: 'Marionetistas de Suna', regiao: 'Sunagakure', kanji: '傀儡',
    lema: 'Não é um clã de sangue. É uma tradição fechada — e um caminho sem volta.',
    resumo: 'O Corpo de Marionetes existe desde a Segunda Guerra e reúne os melhores kugutsu-nin de Suna. A arte é aprendida, não herdada, numa estrutura tão rígida quanto qualquer clã de sangue: um mestre, um discípulo, e o direito de herdar as marionetes do mestre quando ele morre. As técnicas que usam cadáveres de shinobi, preservando as técnicas deles, são a razão de nenhuma outra vila copiar a arte de Suna.',
    passiva: {
      nome: 'Fios de Chakra',
      efeito: 'Fabricação treinada. Você controla objetos inanimados a Média com fios de chakra invisíveis: mover, desarmar, acionar mecanismos, puxar um aliado caído. Começa com uma marionete equipada com dois módulos.',
    },
    fardo: {
      nome: 'A arte exige distância',
      efeito: 'Quanto melhor você fica, menos você sente — e o Mestre deve interpretar isso. Marionetes quebram: cada uma destruída custa uma semana de intervalo e material para reconstruir, e um marionetista sem marionetes é um civil com fios.',
    },
    kg: null,        // Arte aprendida, não linhagem.
    naturezas: [],   // FALTA NO TEXTO: nenhuma natureza é concedida.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Construir a primeira marionete inteira com as próprias mãos.',
        destrava: 'Kugutsu no Jutsu e dois módulos.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Perder uma marionete em campo e reconstruí-la melhor.',
        destrava: 'Segunda marionete e controle simultâneo de duas.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Ser aceito formalmente como discípulo de um mestre do Corpo.',
        destrava: 'Medicina treinada, venenos de CD 18, e Kuroari Higi.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Herdar a coleção de um mestre morto — com as instruções que vêm nela.',
        destrava: 'Terceira marionete e Aka Higi.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: converter o próprio corpo, e decidir o que isso te custa.',
        destrava: 'Hitokugutsu no Karada.' },
    ],
    tecnicas: [
      { nome: 'Kugutsu no Jutsu', rank: 'C', pc: '4+1/rd', estagio: 'I',
        efeito: 'Controla uma marionete, que age no seu turno com seu CTR. Cada adicional: +1 PC/rd e CTR CD 12 +2 por marionete.' },
      { nome: 'Dokugiri', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Uma marionete libera gás: todos numa zona ficam Envenenados (CD 16) e Cegos por uma rodada.' },
      { nome: 'Kugutsu: Kuroari Higi', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Uma marionete oca engole o alvo (Preso, CD 16); uma segunda crava lâminas envenenadas: 5d6 + Envenenado automático.' },
      { nome: 'Kugutsu: Sanshōuo', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Marionete-escudo blindada. Reação: reduz a todo dano contra você ou um aliado adjacente em 5d6. A marionete absorve o excedente e pode quebrar.' },
      { nome: 'Kugutsu: Aka Higi', rank: 'A', pc: '11+5/rd', estagio: 'IV',
        efeito: 'Dezenas de marionetes num pergaminho: unidade em duas zonas, 6d6/rd distribuídos como quiser, todos os atingidos Envenenados.' },
      //  A tabela marca esta com 禁 (kinjutsu).
      { nome: 'Hitokugutsu', rank: 'A', pc: 11, estagio: 'IV', kinjutsu: true,
        efeito: 'Marionete de um cadáver de shinobi, que preserva suas técnicas e natureza: use um jutsu que ele conhecia por rodada. Proibida em todas as vilas.' },
      //  A coluna PC traz "—": o livro não dá custo em PC para esta técnica.
      { nome: 'Hitokugutsu no Karada', rank: 'S', pc: null, estagio: 'V',
        efeito: 'Converte o próprio corpo: para de envelhecer, imune a veneno, dor e doença, reduz dano físico em 5. Em troca, ninjutsu médico não te cura, não recupera PV com descanso, e o núcleo vital é um alvo — um crítico nele te mata na hora.' },
    ],
    //  Bloco MÓDULOS DE MARIONETE, transcrito como está na página.
    modulos: [
      'Lâminas ocultas — 2 PT (2d6+CTR)',
      'Lançador de senbon — 2 PT (três alvos)',
      'Reservatório de veneno — 3 PT (Envenenado)',
      'Braço-mecanismo — 3 PT (Agarrar com CTR)',
      'Compartimento oco — 3 PT (engole um alvo)',
      'Blindagem de ferro — 3 PT (+10 PV, reduz 3)',
      'Núcleo de chakra — 6 PT (canaliza um jutsu seu, 1×/combate)',
    ],
    marionete: 'Marionete: PV 15 + (5 × rank), Defesa igual à sua, ataca com o seu CTR; imune a condições mentais, veneno e cansaço; não usa chakra próprio.',
    estilo: 'Comandante de campo. Multiplica ações mais que qualquer clã, nunca precisa entrar no alcance de ninguém, e combina veneno com controle de forma implacável. A fraqueza é o corpo: PV e Defesa baixos, e um inimigo que atravesse a linha de marionetes encontra alguém que não sabe lutar.',
  },

  // ────────────────────────────────────────────────────────────────
  //  CHINOIKE — Sem vila · País do Sangue — p. 45
  // ────────────────────────────────────────────────────────────────
  {
    id: 'chinoike', nome: 'Chinoike', regiao: 'Sem vila · País do Sangue', kanji: '血市',
    lema: 'Um olho que controla ferro — inclusive o que corre nas veias.',
    resumo: 'O Ketsuryūgan, o Olho do Dragão de Sangue, manipula ferro em qualquer forma: uma lâmina, um grilhão, a hemoglobina de um corpo vivo. Os Chinoike foram expulsos, caçados e empurrados para uma região que hoje se chama País do Sangue por causa deles; um Chinoike que apareça numa vila oculta é um problema diplomático antes de ser uma pessoa.',
    passiva: {
      nome: 'Ketsuryūgan',
      efeito: 'Seus genjutsu podem ser lançados por contato de pele além de contato visual — o que ignora quase toda defesa convencional (fechar os olhos não protege). Você percebe qualquer criatura viva pelo som do sangue dela em até Média, através de paredes.',
    },
    fardo: {
      nome: 'O nome que precede',
      efeito: 'Todo mundo que já ouviu falar dos Chinoike tem medo de você, e tem razão. Desvantagem permanente em Persuasão com quem conhece o clã, e nenhuma vila contrata um Chinoike sem segunda intenção. E suas melhores técnicas exigem sangue no campo — você fica mais forte quanto pior a situação, e a mesa vai perceber que você não tem pressa de curar ninguém.',
    },
    kg: 'ketsuryugan',
    naturezas: [],   // FALTA NO TEXTO: dōjutsu sem natureza associada no capítulo.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Rito: a família reconhece você como portador. O despertar segue "Ritos não são despertares" — o Mestre pode reservá-lo para uma cena de sangue derramado.',
        destrava: 'Chamado de Ferro e as técnicas de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Ser reconhecido como Chinoike por um estranho, e sobreviver ao que vem depois.',
        destrava: 'Genjutsu de Sangue.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Usar o olho contra alguém que você não queria machucar.',
        destrava: 'Chi Bunshin e manipulação de sangue derramado.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Encontrar os registros do clã antes do exílio, e descobrir o que fizeram para merecê-lo.',
        destrava: 'Ketsueki Sōsa completo.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: forçar o mundo a reconhecer o clã como gente, ou aceitar o papel de monstro.',
        destrava: 'Chi no Ryū.' },
    ],
    //  O catálogo não traz nenhuma técnica de Estágio IV — o Estágio IV
    //  destrava "Ketsueki Sōsa completo", que é a técnica de Estágio III.
    tecnicas: [
      { nome: 'Tetsu no Yobi', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Atrai ou repele metal a Média: desarma alvos com armas de aço e desvia projéteis metálicos como Reação.' },
      { nome: 'Magen: Chishio', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Genjutsu por toque, profundidade 2. Ignora vetores visuais e auditivos completamente.' },
      { nome: 'Ketsuryūgan: Mokushi', rank: 'B', pc: 7, estagio: 'II',
        efeito: 'Um alvo que sangre por sua causa fica vulnerável pelo resto da cena: Desvantagem em todos os testes de Kai contra você, até que passe em um deles.' },
      { nome: 'Ketsueki Sōsa', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Controla o sangue derramado: arma (3d6+GEN), amarra (Preso) ou escudo (reduz 3d6). Quanto mais sangue houve, mais forte: +1d6 por ferido na cena.' },
      { nome: 'Chi Bunshin', rank: 'C', pc: 4, estagio: 'III',
        efeito: 'Um clone do próprio sangue (custa 1d6 PV). Explode em respingos ao ser destruído, permitindo lançar genjutsu por contato em quem for atingido.' },
      { nome: 'Chi no Ryū', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Ferve o sangue dentro de um alvo em Contato: 8d6, sem acerto e sem esquiva, e Atordoado por duas rodadas. 1×/combate. Inútil contra alvos sem sangue.' },
    ],
    estilo: 'Assassino e torturador. Genjutsu por toque contorna quase toda defesa do sistema, e o clã escala com a brutalidade da luta. A fraqueza é a inutilidade contra alvos sem sangue e a impossibilidade de operar socialmente em qualquer lugar civilizado.',
  },

  // ────────────────────────────────────────────────────────────────
  //  CLÃ SEM NOME — Sem vila · próximo ao Ryūchidō — p. 46
  // ────────────────────────────────────────────────────────────────
  {
    id: 'sem_nome', nome: 'Clã Sem Nome', regiao: 'Sem vila · próximo ao Ryūchidō', kanji: '呪印の民',
    lema: 'Absorvem energia natural sem treinar. É um dom, e é uma doença.',
    resumo: 'Nunca teve nome registrado porque nunca teve vila nem sobreviventes suficientes para negociar um. Os corpos deles absorvem energia natural passivamente, do ar, o tempo todo — o preço é que a energia acumulada não tem para onde ir: satura o corpo e provoca surtos de violência incontrolável. Foi essa fisiologia que Orochimaru estudou para criar o Selo Amaldiçoado.',
    passiva: {
      nome: 'Absorção Natural',
      efeito: 'Enquanto estiver abaixo da metade dos seus PC, você recupera metade do seu ESP (arredondado para baixo, mínimo 1) a cada rodada, automaticamente, sem gastar ação. É o motor de chakra mais eficiente do livro. Custo permanente: ao fim de cada combate, teste ESP CD 14. A falha significa surto: por 1d4 rodadas você ataca o ser vivo mais próximo, aliado ou inimigo, e o Mestre controla o personagem.',
    },
    fardo: {
      nome: 'O surto',
      efeito: 'Isto não é decoração: em algum momento da campanha o seu personagem vai machucar um companheiro de time, e a mesa vai ter que lidar com isso. Combine antes com o Mestre e os jogadores até onde pode ir; se a mesa não estiver confortável com um PC que perde o controle, este clã não é para ela. Além disso, o Selo Amaldiçoado foi derivado da sua fisiologia — existe gente que quer você vivo num tanque.',
    },
    kg: null,        // FALTA NO TEXTO: o livro trata como fisiologia, não como kekkei genkai.
    naturezas: [],   // FALTA NO TEXTO: nenhuma natureza concedida.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'O primeiro surto, e o que ele custou.',
        destrava: 'Transformação Parcial.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Alguém do time te impedir durante um surto — e não te abandonar depois.',
        destrava: 'Adaptação de Combate.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Encontrar alguém cuja presença acalma você, e entender por quê.',
        destrava: 'Forma de Guerra e a CD do surto cai para 12.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Descobrir a ligação entre o seu clã, o Ryūchidō e o Selo Amaldiçoado.',
        destrava: 'Chakra Kyūshū e técnicas de Estágio IV.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: conversar com a própria fúria em vez de derrotá-la.',
        destrava: 'Os surtos cessam, e você entra em Modo Sábio sem contrato de invocação.' },
    ],
    tecnicas: [
      //  A tabela imprime rank C com 3 PC (o padrão de rank C é 4). Transcrito como está.
      { nome: 'Bubun Henge', rank: 'C', pc: 3, estagio: 'I',
        efeito: 'Converte um membro em arma orgânica — propulsor, lâmina, aríete, garra. +2d6 de dano e alcance estendido por 3 rodadas.' },
      { nome: 'Sentō Tekiō', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Após sofrer dano de um tipo (fogo, corte, raio, contusão), ganhe redução 3 contra ele pela cena. Acumula com tipos diferentes.' },
      { nome: 'Sentō Keitai', rank: 'B', pc: '7+3/rd', estagio: 'III',
        efeito: 'Transformação total: +2 TAI e COR (nunca acima do teto do rank), voo por propulsão, 4d6+TAI, redução 5. Enquanto ativa, a CD do surto sobe 4.' },
      { nome: 'Chakra Kyūshū', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Reação. Absorva um ninjutsu de rank A- direcionado a você, convertendo inteiramente em PC. O excedente acima do máximo vira dano em você.' },
      { nome: 'Kyojin Keitai', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Invocação Grande por 4 rodadas: 5d6+TAI, +40 PV temporários. Ao terminar, teste de surto com Desvantagem.' },
      { nome: 'Senjutsu no Karada', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Entra em Modo Sábio como Ação Menor, sem imobilidade, sem contrato e sem risco de Petrificação: +2 TAI, COR e ESP; jutsus +1d6; percepção total. Dura ESP rodadas.' },
    ],
    estilo: 'Potência bruta com chakra praticamente infinito e adaptação progressiva — o único personagem que nunca fica Exausto de Chakra. A fraqueza é dramática, não numérica: o risco recai sobre o time, e o arco inteiro é sobre merecer a confiança deles.',
  },

  // ────────────────────────────────────────────────────────────────
  //  IBURI — Sem vila · subterrâneo do País do Fogo — p. 47
  // ────────────────────────────────────────────────────────────────
  {
    id: 'iburi', nome: 'Iburi', regiao: 'Sem vila · subterrâneo do País do Fogo', kanji: '伊吹',
    lema: 'Viviam em cavernas porque o vento os mata.',
    resumo: 'Os Iburi convertem o corpo em fumaça. Não é técnica: é o que eles são, e crianças pequenas do clã se dissolvem involuntariamente antes de aprender a se manter sólidas. Orochimaru encontrou o clã, ofereceu ajuda para estabilizar a condição, e usou a família inteira como material de pesquisa; praticamente ninguém sobreviveu.',
    passiva: {
      nome: 'Corpo de Fumaça',
      efeito: 'Como Reação e 2 PC, torne-se fumaça: anula um ataque físico ou elemental, no máximo duas vezes por combate (o segundo uso custa 4 PC). Fora de combate, você atravessa frestas, grades e fechaduras livremente. Custos permanentes: Fūton causa dano dobrado a você e impede a transformação. Em áreas abertas e ventosas, sofra 1d6 por rodada enquanto em forma de fumaça.',
    },
    fardo: {
      nome: 'Vento e herança',
      efeito: 'Um único usuário de Fūton competente te transforma de intocável em cadáver. E alguém lá fora tem os arquivos: sabe do que você é feito, quanto tempo aguenta, e o que te dispersa. Esses arquivos existem porque a sua família morreu produzindo-os.',
    },
    kg: null,        // FALTA NO TEXTO: o livro diz "Não é técnica: é o que eles são", sem chamar de kekkei genkai.
    naturezas: [],   // FALTA NO TEXTO: nenhuma natureza concedida (Fūton é a fraqueza, não a afinidade).
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Aprender a se manter sólido por um dia inteiro sem esforço consciente.',
        destrava: 'Kemuri Bunshin e a forma de fumaça.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Entrar em algum lugar onde ninguém poderia entrar.',
        destrava: 'Infiltração e Furtividade treinada.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Encontrar o laboratório onde o clã foi estudado.',
        destrava: 'Kemuri no Umi.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Obter o selo de estabilização que Orochimaru desenvolveu e nunca entregou.',
        destrava: 'Estabilidade — Fūton causa dano normal, e a forma dura três rodadas seguidas.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: escolher entre ser curado e continuar sendo o que você é.',
        destrava: 'Kemuri Kōka.' },
    ],
    //  O catálogo não traz técnica de Estágio IV — o Estágio IV destrava
    //  "Estabilidade", que é um efeito permanente, não uma técnica.
    tecnicas: [
      { nome: 'Kemuri Bunshin', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Um clone que não se dissipa por dano — apenas por vento. Age normalmente e ocupa uma zona como cobertura.' },
      { nome: 'Kemuri Shinshoku', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Atravesse qualquer abertura, por menor que seja. Portas trancadas, cofres, grades e ductos deixam de ser obstáculos.' },
      { nome: 'Kemuri no Umi', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Você se dispersa por uma zona inteira: nada te atinge, você percebe tudo dentro dela, e reconstitui-se em qualquer ponto como Ação Menor.' },
      { nome: 'Kemuri Shibari', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'A fumaça entra pelas vias respiratórias do alvo: Preso (CD 16) e 2d6/rd de asfixia. Alvos que não respiram são imunes.' },
      { nome: 'Kemuri Kōka', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Mantém a forma de fumaça e pode interagir fisicamente. Por 5 rodadas: imune a todo dano exceto Fūton, ataques de 6d6 que ignoram redução, e atravessa inimigos causando dano ao passar.' },
    ],
    estilo: 'O infiltrador definitivo — nenhuma barreira física do sistema detém um Iburi, e a imunidade reativa é a melhor defesa do livro. A fraqueza é única, absoluta e conhecida: vento.',
  },

  // ────────────────────────────────────────────────────────────────
  //  TSUCHIGUMO — Sem vila · País do Fogo — p. 48
  // ────────────────────────────────────────────────────────────────
  {
    id: 'tsuchigumo', nome: 'Tsuchigumo', regiao: 'Sem vila · País do Fogo', kanji: '土蜘蛛',
    lema: 'A herança do clã é uma técnica que apaga vilas do mapa.',
    resumo: 'Os Tsuchigumo guardam um kinjutsu capaz, segundo os registros, de destruir uma vila oculta inteira em um único uso. Gerações do clã existiram com a única função de manter esse segredo selado e transmiti-lo intacto ao guardião seguinte; o Terceiro Hokage negociou um pacto: Konoha protege o clã, o clã mantém o selo fechado, e ninguém pergunta o que está lá dentro.',
    passiva: {
      nome: 'Guardião do Selo',
      efeito: 'Fūinjutsu treinado. Você carrega no corpo um selo que contém algo terrível, e a proximidade dele te dá +30% de PC máximos. Você também tem Vantagem para identificar e romper selos alheios.',
    },
    fardo: {
      nome: 'Você é o cofre',
      efeito: 'Literalmente. Existem organizações com pessoas trabalhando em tempo integral para te abrir, e elas não precisam te matar — precisam te capturar vivo. O Mestre rola 1d6 no início de cada arco: em 1 ou 2, alguém localizou você. E há a pergunta que a campanha inteira faz: em algum momento vai existir uma situação em que abrir o selo salvaria todo mundo. O que você faz então é o personagem.',
    },
    kg: null,        // Nenhuma linhagem: a herança do clã é o selo.
    naturezas: [],   // FALTA NO TEXTO: nenhuma natureza concedida.
    //  Passiva: "a proximidade dele te dá +30% de PC máximos".
    ajustes: { recursos: { pcPct: +30 } },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Receber o selo. Você não escolhe; você é escolhido, e é jovem demais para discordar.',
        destrava: 'Fio de Chakra Tecido.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Impedir alguém de tocar no selo pela primeira vez.',
        destrava: 'Kumo Nawa e leitura de selos.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Abrir o selo por uma fração de segundo, e sentir o que tem lá dentro.',
        destrava: 'Liberação Parcial.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Aprender a ler as instruções completas do kinjutsu herdado.',
        destrava: 'Kumo Sōkai e conhecimento do kinjutsu.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: usar o kinjutsu, destruí-lo de vez, ou passá-lo adiante conscientemente.',
        destrava: 'O Kinjutsu Herdado — criado pelo Mestre e pelo jogador juntos.' },
    ],
    tecnicas: [
      { nome: 'Kumo Nawa', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Teias de chakra puro cobrem uma zona: Preso (CD 15), e você sente tudo que toca a teia, mesmo sem ver.' },
      { nome: 'Kumo Bunshin', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Um clone de fios que, ao ser destruído, prende o atacante (Preso, CD 14).' },
      { nome: 'Fūin Kaihō: Bubun', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Abre o selo por uma rodada: todos os seus jutsus sobem um rank em dano naquele turno. Custa 1 Exaustão e o Mestre rola em segredo se alguém percebeu.' },
      { nome: 'Kumo Sōkai', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Estende a teia por três zonas como alarme e captura: ninguém se move nela sem que você saiba, e sair exige CD 17.' },
      //  A coluna PC traz "tudo" — literal do livro.
      { nome: 'Kinjutsu Herdado', rank: 'S', pc: 'tudo', estagio: 'V',
        efeito: 'Criado na mesa. O Mestre e o jogador desenham juntos uma técnica rank S proibida (Cap. 24): custo real que não é chakra, consequência social, sem desconto. Escala sugerida: destrói uma zona por ponto de ESP, e o usuário não sobrevive sem intervenção.' },
    ],
    estilo: 'Reserva enorme, controle de área por teias e uma bomba-relógio narrativa embutida na ficha. Feito para campanhas com trama política. A fraqueza é o dano próprio baixo antes do Estágio V — e o fato de ser um alvo permanente.',
  },

  // ────────────────────────────────────────────────────────────────
  //  ŌTSUTSUKI — Fora do mundo — p. 49
  //  ESTRUTURA DIFERENTE. Esta entrada NÃO segue o molde dos clãs:
  //  não tem passiva, não tem fardo, não tem progressão de cinco
  //  estágios e nenhuma técnica traz custo em PC. O que o livro
  //  traz é o texto de origem, um bloco USO NA MESA, uma tabela de
  //  PODERES CARACTERÍSTICOS marcada como referência do Mestre
  //  (coluna EST. = "PNJ") e uma NOTA PARA O MESTRE. Nada foi
  //  completado: os campos ausentes ficam null / vazios.
  // ────────────────────────────────────────────────────────────────
  {
    id: 'otsutsuki', nome: 'Ōtsutsuki', regiao: 'Fora do mundo', kanji: '大筒木',
    lema: 'A origem de todo chakra. Não jogável.',
    //  O livro é explícito: "nunca como opção de jogador". Fica no
    //  catálogo porque é a explicação da origem do chakra, mas sai da
    //  lista de escolha da ficha.
    jogavel: false,
    resumo: 'O chakra não é natural deste mundo: chegou com os Ōtsutsuki, um clã celestial que consome planetas — plantam a Árvore Divina, deixam-na drenar toda a vida do lugar, e colhem o fruto. Kaguya Ōtsutsuki comeu o fruto neste mundo e se tornou a primeira portadora de chakra; todo Sharingan, todo Byakugan, todo Rinnegan é um eco distante desse sangue.',
    passiva: null,   // FALTA NO TEXTO: a entrada não tem bloco de passiva.
    fardo: null,     // FALTA NO TEXTO: a entrada não tem bloco de fardo.
    kg: null,        // FALTA NO TEXTO: nenhum id de linhagem é atribuído (o Rinne Sharingan aparece só como poder de PNJ).
    naturezas: [],   // FALTA NO TEXTO: nenhuma natureza é listada.
    estagios: [],    // FALTA NO TEXTO: a entrada não tem progressão de estágios.
    usoNaMesa: 'Este clã existe como antagonista de fim de campanha e como explicação de origem — nunca como opção de jogador. Um Ōtsutsuki tem atributos entre +8 e +12, dezenas de milhares de PC, voo, Esferas Busca-Verdade que anulam qualquer ninjutsu, e ignora por definição a maior parte das regras deste livro. Se a sua campanha chegou até aqui, o sistema já cumpriu o papel dele: improvise, seja generoso, e deixe a vitória vir da Vontade do Fogo e dos vínculos — não da aritmética.',
    //  Tabela "PODERES CARACTERÍSTICOS (REFERÊNCIA DO MESTRE)". A coluna
    //  PC vem vazia ("—") em todas, e a coluna EST. traz "PNJ".
    tecnicas: [
      { nome: 'Gudōdama (Esferas Busca-Verdade)', rank: 'S', pc: null, estagio: 'PNJ',
        efeito: 'Esferas negras orbitando o portador. Reação: anulam qualquer ninjutsu de qualquer rank. Ataque: 12d6, destruição permanente.' },
      { nome: 'Yōton: Kōton (Cinzas de Osso)', rank: 'S', pc: null, estagio: 'PNJ',
        efeito: 'Toque que reduz matéria viva a pó. Sem teste de resistência.' },
      { nome: 'Amenominaka (Troca Dimensional)', rank: 'S', pc: null, estagio: 'PNJ',
        efeito: 'Move todos os presentes para outra dimensão à escolha: gelo, deserto, lava, ácido. O terreno vira arma.' },
      { nome: 'Rinne Sharingan', rank: 'S', pc: null, estagio: 'PNJ',
        efeito: 'O olho original. Habilita o Mugen Tsukuyomi e viagem dimensional. Ver Cap. 24 do Livro do Jogador.' },
    ],
    notaMestre: 'Se um jogador quiser jogar com um descendente distante dos Ōtsutsuki, a resposta certa é o clã Hyūga ou Uchiha — eles são isso. A linhagem já está no livro, distribuída em trinta famílias que passaram mil anos esquecendo de onde vieram.',
  },

];

//  Busca por id, no mesmo formato de claAvdf() em conteudo.js.
function claMundoAvdf(id) {
  return CLAS_MUNDO_AVDF.find(c => c.id === id) || null;
}
