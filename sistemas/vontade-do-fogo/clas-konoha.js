// ══════════════════════════════════════════════════════════════════
//  CLÃS DE KONOHAGAKURE — A VONTADE DO FOGO
//  Livro V — Compêndio dos Clãs, Cap. 27 (págs. 8 a 30)
//
//  Transcrição literal do Compêndio. Nada aqui foi inventado: passiva,
//  fardo, os cinco Estágios e o catálogo de técnicas saem do texto do
//  livro, com a formatação quebrada do PDF corrigida (palavras coladas
//  do tipo "AçãoMenor" → "Ação Menor") e mais nada.
//
//  Treze clãs — o Uchiha (pág. 6) já está em conteudo.js, na constante
//  CLAS_AVDF, e por isso não se repete aqui.
//
//  CONVENÇÕES DESTE ARQUIVO
//  · `kg`        id do Kekkei Genkai / linhagem de corpo (ver
//                KEKKEI_GENKAI_AVDF e LINHAGENS_CORPO_AVDF em
//                conteudo.js). null quando o livro diz que o clã não
//                tem — e a maioria dos clãs de Konoha não tem.
//  · `naturezas` só recebe uma natureza quando o livro afirma, em nível
//                de clã (passiva ou linha de Estágio), que o clã domina
//                ou destrava aquela natureza. Ter uma técnica Katon no
//                catálogo não basta: isso não é o livro concedendo a
//                natureza, e preencher assim seria invenção.
//  · `ajustes`   só existe quando o clã mexe num valor da ficha (PV, PC,
//                Vontade do Fogo, Defesa, atributo, perícia treinada).
//                Cada campo vem com a frase do livro que o originou.
//  · `pt`        conforme impresso na tabela de progressão do clã. Os
//                treze clãs seguem a escala 0/6/8/12/18 do Cap. 26 —
//                nenhum precisou do valor padrão por omissão.
//  · Campos extras (`kanji`, `lema`, `estiloDeJogo`, e os blocos
//                próprios de cada clã) são texto do livro que não cabe
//                no esqueleto comum; estão comentados onde aparecem.
//  · Estágio V é impresso como "Elite · 18"; usa-se o id de rank `anbu`
//                ("ANBU / Elite"), o mesmo que o Uchiha usa.
//  · `resumo`    é montado com frases do parágrafo de história do próprio
//                verbete, sem acrescentar informação nova.
//  · `estiloDeJogo` é o parágrafo "Estilo de jogo:" que fecha cada verbete,
//                copiado inteiro (só a inicial virou maiúscula, porque no
//                livro ela vem depois de dois-pontos).
//
//  Passivas, fardos, marcos, destravas e efeitos de técnica foram
//  conferidos caractere a caractere contra o texto extraído do PDF:
//  batem 100%, ignorando os espaços que o PDF comeu.
// ══════════════════════════════════════════════════════════════════

const CLAS_KONOHA_AVDF = [

  // ════════════════════════════════════════════════════════════════
  //  HYŪGA — pág. 8
  // ════════════════════════════════════════════════════════════════
  {
    id: 'hyuga',
    nome: 'Hyūga',
    regiao: 'Konohagakure',
    kanji: '日向',                                   // impresso no cabeçalho do verbete
    lema: 'O clã mais antigo da Folha, e o único que marca os próprios filhos a ferro.',
    resumo: 'O Byakugan é anterior ao Sharingan e às vilas ocultas: descende de Hamura Ōtsutsuki e é provavelmente o dōjutsu mais antigo em circulação. A estrutura interna divide o clã em dois — o Sōke (Ramo Principal) herda a liderança, e o Bunke (Ramo Secundário) existe para protegê-lo, marcado aos três anos com o Selo do Pássaro Enjaulado.',
    passiva: {
      nome: 'Byakugan',
      efeito: 'Ação Menor, 1 PC/rodada — o dōjutsu mais barato do livro. Visão de 360° com um ponto cego na nuca: não pode ser flanqueado nem surpreendido. Enxerga através de matéria sólida até Média e telescópico até Longa. Visualiza a rede de chakra de qualquer alvo: PC atuais, quais clones são reais, se está sob genjutsu, e selos ou implantes no corpo. Mesmo desativado, concede Percepção treinada.',
    },
    fardo: {
      nome: 'O Selo do Pássaro Enjaulado',
      efeito: 'Se você é do Bunke: qualquer Sōke a até Média distância ativa o selo como Ação Menor — 3d6, Atordoado e Selado por uma rodada, sem teste; ao morrer, seu Byakugan é destruído. Se você é do Sōke: você carrega a capacidade de fazer isso com parentes, e todos sabem. Um Bunke que destrave o Estágio V fica imune — provavelmente o arco mais satisfatório que este clã oferece.',
    },
    kg: 'byakugan',
    naturezas: [],                                  // nenhuma natureza citada no verbete
    // A passiva concede uma perícia treinada — é o único valor de ficha que o clã mexe.
    // "Mesmo desativado, concede Percepção treinada." (Passiva — Byakugan)
    ajustes: { periciasTreinadas: ['Percepção'] },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira sessão formal de Jūken diante do instrutor do clã.',
        destrava: 'Estilo Jūken: golpes causam metade do dano, drenam 1d6 PC e ignoram redução por armadura.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Vencer um duelo interno sem causar um ferimento visível. O Jūken se prova pela ausência de sangue.',
        destrava: 'Leitura de Tenketsu. Um golpe que acerte alguém Canalizando cancela o jutsu sem teste.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Ser reconhecido publicamente pelo chefe do clã — para um Bunke, alguém do Sōke quebrar protocolo por você.',
        destrava: 'Hakkeshō Kaiten e as técnicas de Estágio III.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Acesso à biblioteca fechada do Sōke, com autorização escrita.',
        destrava: 'Hakke Rokujūyon Shō e ler selos alheios com o Byakugan.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: mudar o clã. Abolir o Selo, assumir a liderança, ou romper de vez.',
        destrava: 'Hakke Hyakunijūhachi Shō e imunidade permanente ao Selo do Pássaro Enjaulado.' },
    ],
    tecnicas: [
      { nome: 'Jūken: Ippo', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Golpe preciso num ponto de chakra: drena 1d6 PC e Desvantagem no próximo teste de CTR. A base de tudo.' },
      { nome: 'Hakke Kūshō', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Golpe de chakra a Curta: 2d6+TAI e Empurrado uma zona. A única ferramenta de alcance do clã.' },
      { nome: 'Hakke Sanjūni Shō', rank: 'C', pc: 4, estagio: 'II',
        efeito: '32 golpes em tenketsu: 2d6+TAI e drena 2d6 PC. O alvo fica com Desvantagem em CTR até o fim da cena.' },
      { nome: 'Jūkenpō: Shōkyaku', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Lâmina de chakra nos dedos: ataques de Jūken ganham alcance estendido e causam dano cheio além da drenagem, por 3 rodadas.' },
      // Estas duas estão impressas como "A 8" na tabela do livro — rank A com custo 8 PC,
      // fora da escala padrão (rank A = 11 PC, JUTSU_RANKS_AVDF). Copiado como está.
      { nome: 'Hakkeshō Kaiten', rank: 'A', pc: 8, estagio: 'III',
        efeito: 'Reação. Gira o corpo expelindo chakra: anula qualquer ataque físico ou ninjutsu de rank A- e empurra todos em Contato. A defesa absoluta do clã.' },
      // DIVERGÊNCIA DO LIVRO: a tabela de técnicas marca esta como Estágio III, mas a
      // linha do Estágio IV diz "Hakke Rokujūyon Shō e ler selos alheios com o Byakugan".
      // Mantido o que está na tabela de técnicas; a decisão de qual vale é do Mestre.
      { nome: 'Hakke Rokujūyon Shō', rank: 'A', pc: 8, estagio: 'III',
        efeito: '5d6+TAI e o alvo fica Selado pela cena (CD 20). Exige Byakugan e Contato. Faz Jōnin de ninjutsu perderem para Chūnin de taijutsu.' },
      { nome: 'Hakke Kūhekishō', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Kūshō em cone: 3d6+TAI a todos numa zona a Curta, todos Empurrados e Caídos. Rompe cobertura leve.' },
      { nome: 'Hakke Kūshō: Shishi', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Leões gêmeos de chakra nas mãos. Por 4 rodadas, cada ataque de Jūken causa 4d6+TAI, drena 2d6 PC e atinge alvos intangíveis.' },
      { nome: 'Hakke Hyakunijūhachi Shō', rank: 'S', pc: 16, estagio: 'V',
        efeito: '128 golpes em todos os tenketsu: 8d6+TAI, alvo Selado permanentemente (só médico de elite reverte) e sem Reação durante a sequência.' },
      { nome: 'Sōshiken', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Os leões ganham autonomia. Enquanto ativo (6 PC/rd), um ataque de Jūken adicional por rodada, e alvos em Contato perdem 1d6 PC no fim do turno deles.' },
    ],
    // Bloco próprio do verbete: "DŌJUTSU — O BYAKUGAN" (pág. 11).
    dojutsu: {
      nome: 'Byakugan',
      texto: 'O dōjutsu mais sustentável e o menos espetacular. Não tem estágios de despertar, não degrada a visão, não custa a vida de ninguém. Resolve emboscadas, clones falsos, genjutsu, ocultação, névoa e "quanto chakra ele ainda tem?". O que não resolve é dano: todo o poder ofensivo depende do Jūken, que exige Contato. Existe um ponto cego na base da nuca — o Mestre deve permitir que inimigos inteligentes tentem atacar de lá.',
    },
    estiloDeJogo: 'Anti-ninjutsu absoluto e informação total. Sufoca quem depende de chakra, cancela canalizações sem causar dano, e torna o time imune a emboscadas e ilusões. A fraqueza é estrutural: tudo acontece em Contato. Contra quem voe ou mantenha distância, o Hyūga precisa do resto do time para chegar lá.',
  },

  // ════════════════════════════════════════════════════════════════
  //  SENJU — pág. 11
  // ════════════════════════════════════════════════════════════════
  {
    id: 'senju',
    nome: 'Senju',
    regiao: 'Konohagakure',
    kanji: '千手',
    lema: '"Mil Habilidades" — o clã que fundou a vila e desapareceu dentro dela.',
    resumo: 'Descendem de Asura Ōtsutsuki, o filho mais novo do Sábio, que não herdou olhos especiais e compensou tudo com trabalho e cooperação. As guerras consumiram os Senju de forma desproporcional, pois estavam sempre na frente; hoje "Senju" é menos um clã e mais uma herança dispersa.',
    passiva: {
      nome: 'Mil Habilidades',
      efeito: 'Você não tem especialidade porque tem todas. Trate todo jutsu de acesso Livre como da sua natureza afim (desconto e sem penalidade), e aprenda a segunda natureza sem custo de PT ao atingir Chūnin. A vitalidade lendária concede +5 PV e +1 em todos os Testes de Morte.',
    },
    fardo: {
      nome: 'O último de alguma coisa',
      efeito: 'Você é herdeiro de gente que fundou o mundo, e todos têm uma expectativa pronta. Ao falhar gravemente numa missão pública, o Mestre pode impor Desvantagem no próximo teste social em Konoha. E seu sangue vale dinheiro: role 1d6 no início de cada missão fora da vila; em 1, alguém veio coletar amostra.',
    },
    // O Mokuton aparece no Estágio V, e condicionado: "Mokuton (Cap. 29), ou, se o Mestre
    // negar, Sōzō Saisei e o Byakugō no In" — o marco diz explicitamente "o Mestre deve
    // dizer 'talvez não'". Não é uma linhagem que o Senju tem na criação.
    kg: 'mokuton',
    kgCondicional: 'Só no Estágio V, e o Mestre pode negar. Se negar, o Estágio V entrega Sōzō Saisei e o Byakugō no In no lugar.',
    // A passiva dá "a segunda natureza sem custo de PT ao atingir Chūnin", mas não diz
    // qual — é escolha do jogador. Por isso a lista fica vazia: dizer qual seria invenção.
    naturezas: [],
    // "A vitalidade lendária concede +5 PV e +1 em todos os Testes de Morte." (Passiva)
    // "Corpo de Ferro. +10 PV e imunidade a venenos e doenças comuns." (Estágio II)
    ajustes: { pv: 5, testeMorte: 1, pvEstagioII: 10 },
    // FALTA NO TEXTO: a passiva dá "a segunda natureza sem custo de PT ao atingir Chūnin"
    // sem dizer qual — o livro não nomeia nenhuma natureza para o clã.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Descobrir a própria ascendência — por acidente, não por cerimônia.',
        destrava: 'Adaptação. Uma vez por combate, ignore uma vantagem elemental usada contra você.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Resolver uma missão inteira sem usar a mesma técnica duas vezes.',
        destrava: 'Corpo de Ferro. +10 PV e imunidade a venenos e doenças comuns.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Comandar um grupo maior que o seu time e trazer todos de volta vivos.',
        destrava: 'Vontade de Fogo Herdada. 1×/sessão, conceda a todos os aliados à vista 1 PVF.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Acesso aos arquivos pessoais do Primeiro e do Segundo Hokage.',
        destrava: 'Regeneração Senju. Regenere 1d6 PV no início de cada turno em combate.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História, e o Mestre deve dizer "talvez não". O Mokuton não se treina.',
        destrava: 'Mokuton (Cap. 29), ou, se o Mestre negar, Sōzō Saisei e o Byakugō no In.' },
    ],
    tecnicas: [
      { nome: 'Senju no Kamae', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Ação Menor. Declare uma disciplina (Taijutsu, Ninjutsu, Genjutsu, Controle): +2 nela até o fim da rodada.' },
      { nome: 'Sōkyū no Jutsu', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Analise um inimigo: natureza de chakra, rank aproximado e a técnica mais forte que ele ainda não usou. Vantagem contra ele.' },
      { nome: 'Katon: Karyūdan', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Jato de fogo compacto, 2d6+NIN. O clã ensina uma técnica de cada natureza — troque por Suiton, Fūton, Raiton ou Doton equivalente.' },
      { nome: 'Kongōheki', rank: 'B', pc: 7, estagio: 'II',
        efeito: 'Barreira de chakra bruto sem elemento, imune à roda elemental: absorve 6d6 de qualquer dano, inclusive Fūton e ataques que ignoram redução.' },
      { nome: 'Tajū Nagashi', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Canalize duas naturezas ao mesmo tempo por 3 rodadas: +1d6 de cada, e o alvo sofre os dois efeitos colaterais elementais.' },
      { nome: 'Senju no Michi', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Por 4 rodadas, use qualquer jutsu de acesso Livre que tenha visto nesta cena, mesmo sem conhecê-lo, pagando o dobro em PC. A doutrina máxima.' },
      // O livro imprime "—" na coluna PC destas duas: o custo não é em PC.
      { nome: 'Sōzō Saisei', rank: 'S', pc: null, estagio: 'V', kinjutsu: true,
        efeito: 'Consome toda a sua reserva de PC. Recupere todos os PV e regenere 3d6/rd pela cena; cura Ferimentos Graves. Sem o Byakugō, envelhece 1d10 anos por uso.' },
      { nome: 'Byakugō no In', rank: 'S', pc: null, estagio: 'V', kinjutsu: true,
        efeito: 'Reservatório de chakra na testa: segunda reserva de PC igual ao máximo, e habilita Sōzō Saisei sem custo de vida. Exige três anos de jogo.' },
    ],
    estiloDeJogo: 'O generalista de elite. Sem picos e sem buracos, nunca tem resposta ruim para nada — e é o único clã que melhora ao não se especializar. A fraqueza é essa mesma: em qualquer situação específica existe alguém melhor que você nela. Você vence por não ter fraqueza para explorar.',
  },

  // ════════════════════════════════════════════════════════════════
  //  UZUMAKI — pág. 13
  // ════════════════════════════════════════════════════════════════
  {
    id: 'uzumaki',
    nome: 'Uzumaki',
    regiao: 'Konohagakure',
    regiaoLivro: 'Uzushio · Konohagakure',          // o cabeçalho do verbete traz as duas
    kanji: '渦巻',
    lema: 'Destruídos por serem bons demais em selar coisas.',
    resumo: 'Vinham de Uzushiogakure, a Vila dos Redemoinhos, parentes distantes dos Senju — motivo pelo qual todo colete Chūnin e Jōnin da Folha carrega o brasão espiral de Uzushio nas costas. Duas coisas os definiam: vitalidade absurda e o fūinjutsu, no qual eram simplesmente os melhores do mundo; foi por isso que três nações se aliaram para apagar a vila.',
    passiva: {
      nome: 'Vitalidade Uzumaki',
      efeito: '+50% de PC máximos e +10 PV. Recupera o dobro em qualquer descanso, envelhece na metade da velocidade, e tem Vantagem para resistir a venenos, doenças e drenagem de chakra. Fūinjutsu treinado de graça. É a passiva numericamente mais forte do livro — compensada pelo Fardo: essa reserva faz de você o recipiente ideal para o que ninguém deveria carregar.',
    },
    fardo: {
      nome: 'O recipiente perfeito',
      efeito: 'Sua reserva e vitalidade fazem de você o hospedeiro ideal para um bijū, um selo amaldiçoado ou qualquer coisa que precise de um corpo que aguente. Role 1d6 no início de cada missão fora de Konoha; em 1-2, alguém sabe quem você é e ajustou o plano dele. E você não pode ocultar a identidade de um sensor competente: a assinatura Uzumaki é grande demais.',
    },
    kg: null,                                       // o verbete não atribui kekkei genkai ao clã
    naturezas: [],
    // "+50% de PC máximos e +10 PV. (...) Fūinjutsu treinado de graça." (Passiva)
    // "Fūinjutsu vira Mestre (+6)" (Estágio V) — nível de perícia, não bônus solto.
    ajustes: {
      pcMultiplicador: 1.5,
      pv: 10,
      periciasTreinadas: ['Fūinjutsu'],
      fuinjutsuMestreEstagioV: 6,
    },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Desenhar o primeiro selo funcional de próprio punho, sem cópia.',
        destrava: 'Selos de Sangue. Você prepara o dobro de selos por vez.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Romper um selo alheio que prendia alguém — pessoa, criatura ou porta.',
        destrava: 'Leitura Instintiva. Vantagem para identificar selos; percebe selos ocultos a Curta.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Encontrar algo de Uzushio: um pergaminho, uma ruína, um sobrevivente.',
        destrava: 'Kongō Fūsa e as técnicas de Estágio III.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Ser reconhecido como mestre selador por alguém com autoridade para dizê-lo.',
        destrava: 'Improviso. 1×/cena, desenhe e aplique um selo em combate como Ação Principal, sem preparo.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: reerguer alguma coisa de Uzushio — a arte, a vila ou a linhagem.',
        destrava: 'Fūinjutsu vira Mestre (+6), e o Hakke no Fūin Shiki: a capacidade de selar um bijū.' },
    ],
    tecnicas: [
      { nome: 'Uzumaki Fūin: Hokan', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Armazenamento aprimorado: guarda objetos vivos de pequeno porte e libera como ação livre.' },
      { nome: 'Kekkai: Uzumaki', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Barreira que cobre uma zona. Quem a cruze sofre 2d6 e fica Marcado; você sabe quem entrou e por onde.' },
      { nome: 'Fūin: Chakura Kyūin', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Selo sanguessuga por toque ou arremesso: o alvo perde 1d6 PC/rd por 4 rodadas, e você recebe metade. CTR CD 15 para remover.' },
      { nome: 'Gogyō Fūin', rank: 'B', pc: 7, estagio: 'II',
        efeito: 'Cinco dedos ao abdômen: o alvo fica Selado pela cena (CD 18). Também corrige um selo danificado num aliado.' },
      { nome: 'Kongō Fūsa', rank: 'A', pc: 11, estagio: 'III',
        efeito: 'Correntes de chakra dourado sem selos de mão. Prendem qualquer criatura, inclusive um bijū: Preso e Selado (CD 20). Até três alvos.' },
      { nome: 'Fūin: Shishō Kekkai', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Normalmente exige quatro seladores; um Uzumaki a ergue sozinho. Cúpula impenetrável cobrindo até quatro zonas.' },
      { nome: 'Fūin: Kanzen Fūsatsu', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Sela uma criatura, objeto ou técnica ativa num recipiente. CTR resistido vs Vontade; abaixo de 1/4 dos PV, sem resistência.' },
      { nome: 'Adamantine Fūsa: Rō', rank: 'A', pc: '11+4/rd', estagio: 'IV',
        efeito: 'Sustentada. Jaula esférica em torno de um alvo colossal: nem invocações Colossais nem um bijū em Modo Bijū agem. Você fica imóvel.' },
      { nome: 'Hakke no Fūin Shiki', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Sela um bijū num hospedeiro. Ritual de horas e a vida de quem o aplica — exceto um Uzumaki de Estágio V, que sobrevive debilitado.' },
    ],
    estiloDeJogo: 'O único clã que gasta chakra sem contar, com o melhor kit de controle e negação. Desliga invocações, prende chefes e cancela ninjutsu com selos preparados antes da luta. A fraqueza é o ritmo: quase todo fūinjutsu exige preparo fora de combate — um Uzumaki pego de surpresa é só um saco de PC muito grande. Recompensa quem faz reconhecimento.',
  },

  // ════════════════════════════════════════════════════════════════
  //  NARA — pág. 14
  // ════════════════════════════════════════════════════════════════
  {
    id: 'nara',
    nome: 'Nara',
    regiao: 'Konohagakure',
    kanji: '奈良',
    lema: 'Criadores de veados, farmacêuticos e a razão de Konoha ganhar guerras que deveria perder.',
    resumo: 'Vivem num bosque cercado onde criam veados cujos chifres fornecem metade dos remédios do Corpo Médico. Clã pequeno, sem ambição política, com fama merecida de preguiçoso — e a técnica de sombra é Hiden e usa natureza Yin: dano quase nulo, controle absoluto. O clã nunca produziu um lendário; produziu comandantes.',
    passiva: {
      nome: 'Mente de Estrategista',
      efeito: 'Você domina Yin de graça e tem Estratégia treinada. Uma vez por combate, declare em voz alta o que um inimigo fará no próximo turno dele. Se acertar, todo o time ganha Vantagem contra ele naquela rodada. Se errar, nada acontece — a manobra não custa ação nem chakra, só a exposição de errar em voz alta.',
    },
    fardo: {
      nome: 'Você enxerga o fim',
      efeito: 'O personagem calcula resultados o tempo todo, inclusive os que não queria. Sempre que o time entrar numa situação em que alguém vai se machucar, o Mestre conta ao jogador Nara — e só a ele — qual é o custo provável do plano atual. O que ele faz com isso é dele. Mecanicamente, as técnicas são Sustentadas: sofrer dano exige teste de CTR, e você precisa ficar parado enquanto controla.',
    },
    kg: null,
    // A passiva diz "Você domina Yin de graça". Yin NÃO é uma das cinco naturezas
    // elementais (katon/suiton/futon/raiton/doton), então não entra na lista — inventar
    // um id 'yin' seria criar dado que o modelo de naturezas não tem.
    naturezas: ['yin'],   // "Você domina Yin de graça" (Passiva)
    dominioExtra: 'Yin (natureza Yin, de graça — citada na Passiva; não é uma das cinco naturezas elementais do Cap. 07)',
    // "Você domina Yin de graça e tem Estratégia treinada." (Passiva)
    ajustes: { periciasTreinadas: ['Estratégia'] },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Vencer um mais velho do clã num shōgi ou go. Ninguém vai deixar você ganhar.',
        destrava: 'Kagemane no Jutsu e as técnicas de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Salvar uma missão com uma decisão tática, não com um golpe. O Mestre reconhece na cena.',
        destrava: 'Sombra Estendida. Alcance +1 zona, e você usa a sombra de aliados e objetos.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Comandar uma operação em que alguém sob o seu comando se machuca por uma ordem sua.',
        destrava: 'Kagekubi Shibari e Kagenui.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Um posto na Divisão de Criptoanálise, concedido por quem confia em você mais do que deveria.',
        destrava: 'Controle Múltiplo. Técnicas de sombra afetam até três alvos; manipula objetos com a sombra.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: a estratégia do personagem decide o destino de mais gente do que ele consegue contar.',
        destrava: 'Kage Yose e sombras sem fonte de luz definida.' },
    ],
    tecnicas: [
      { nome: 'Kagemane no Jutsu', rank: 'C', pc: '4+2/rd', estagio: 'I',
        efeito: 'Sustentada. CTR vs Vontade: o alvo fica Preso e copia seus movimentos. O alcance depende da sombra — o Mestre deve dizer a hora do dia sempre que houver um Nara.' },
      { nome: 'Kage Shuriken', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'A sombra arremessa suas armas de um ângulo invisível. 1d6+TAI, não pode ser Bloqueado.' },
      { nome: 'Kage Sōkyū', rank: 'D', pc: 2, estagio: 'II',
        efeito: 'Estenda a sombra por baixo de uma porta e perceba o outro lado. Reconhecimento indetectável por sensores.' },
      { nome: 'Kagemane Shuriken', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Prende a sombra a uma arma arremessada, esticando o alcance da posse até onde ela pousar.' },
      { nome: 'Kagekubi Shibari', rank: 'B', pc: '7+3/rd', estagio: 'III',
        efeito: 'A sombra fecha na garganta de um alvo já Preso: 2d6/rd e ele não pode falar — sem comandos, invocações ou pedidos de ajuda.' },
      { nome: 'Kagenui no Jutsu', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Agulhas de sombra prendem até três alvos ao chão (CD 16), sem contato contínuo — você fica livre para agir.' },
      { nome: 'Kage Nui: Kunren', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Cobre uma zona de agulhas: terreno difícil, e quem terminar o turno nela testa COR CD 15 ou fica Preso.' },
      // DIVERGÊNCIA DO LIVRO: a tabela marca Estágio IV, mas o Estágio V diz "Kage Yose e
      // sombras sem fonte de luz definida". Mantida a tabela.
      { nome: 'Kage Yose no Jutsu', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'A sombra pega objetos: puxe uma arma, um pergaminho ou um aliado caído a até Média para a sua mão. Desarma um alvo Preso.' },
      { nome: 'Kagemane: Kanzen', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'A sombra opera sem depender de luz. Até cinco alvos Presos; presos não usam Reação nem Substituição, e você pode forçá-los a atacar uns aos outros.' },
    ],
    estiloDeJogo: 'Controle de campo puro e liderança. Causa pouquíssimo dano e decide combates mesmo assim, prendendo o inimigo certo na hora certa. A fraqueza é dupla e explorável: depende de luz e geometria (uma sala escura, um inimigo voando ou o sol a pino reduzem o alcance) e de concentração — você é o primeiro nome na lista de qualquer inimigo com meio cérebro.',
  },

  // ════════════════════════════════════════════════════════════════
  //  AKIMICHI — pág. 16
  // ════════════════════════════════════════════════════════════════
  {
    id: 'akimichi',
    nome: 'Akimichi',
    regiao: 'Konohagakure',
    kanji: '秋道',
    lema: 'Gentis fora de combate, catastróficos dentro dele.',
    resumo: 'Convertem calorias em chakra puro — fisiologia hereditária que nenhum outro clã possui —, o que torna a relação com comida um assunto militar. Mantêm aliança formal com Nara e Yamanaka desde antes da fundação; na formação Ino-Shika-Chō eles são o muro que segura enquanto os outros dois montam a armadilha.',
    passiva: {
      nome: 'Reservas Calóricas',
      efeito: '+15 PV. Uma vez por combate, como Ação Menor, coma alguma coisa e recupere PC igual a ESP + 3. Imune a penalidades de fome e sobrevive ao dobro do tempo sem suprimentos.',
    },
    fardo: {
      nome: 'O combustível acaba',
      efeito: 'Passe uma cena inteira sem comer e perde a Passiva até a próxima refeição, com −1 em TAI e COR. Em missões longas sem suprimento, isso vira o problema do time. E você é grande, lento e visível: sua Defesa é a mais baixa entre os clãs de linha de frente, e todo arqueiro sabe onde você está.',
    },
    kg: null,                                       // "fisiologia hereditária", não nomeada kekkei genkai
    naturezas: [],
    // "+15 PV." (Passiva) · "Nikudan Sensha e +5 PV adicionais." (Estágio II)
    // O Fardo impõe −1 em TAI e COR enquanto a Passiva estiver perdida por falta de comida.
    ajustes: {
      pv: 15,
      pvEstagioII: 5,
      penalidadeSemComer: { tai: -1, cor: -1, obs: 'Só enquanto a Passiva estiver perdida por passar uma cena inteira sem comer (Fardo).' },
    },
    // FALTA NO TEXTO: a "Formação Ino-Shika-Chō" (Estágio III, sem custo de PT) é citada
    // aqui, no Yamanaka e no Nara, mas o capítulo não descreve o efeito da formação.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira refeição ritual, em que a família mede quanto chakra você converte.',
        destrava: 'Baika no Jutsu e as técnicas de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Segurar sozinho uma posição enquanto o time se reorganiza atrás de você.',
        destrava: 'Nikudan Sensha e +5 PV adicionais.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Ser formalmente admitido na formação Ino-Shika-Chō da sua geração.',
        destrava: 'Chō Baika e a Formação Ino-Shika-Chō sem custo de PT.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Receber do chefe o estojo das Três Pílulas — e a explicação do que a vermelha faz.',
        destrava: 'Acesso às Pílulas de Três Cores e técnicas de Estágio IV.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: tomar a Pílula Vermelha por alguém, e sobreviver.',
        destrava: 'Chō Chōji / Modo Borboleta.' },
    ],
    tecnicas: [
      { nome: 'Baika no Jutsu', rank: 'C', pc: '4+1/rd', estagio: 'I',
        efeito: 'Sustentada. Dano de taijutsu vira 2d6+TAI, alcance +1 zona, +10 PV temporários. Sua Defesa cai 2 — você é um alvo maior.' },
      { nome: 'Bubun Baika', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Amplia só um membro: um ataque de 2d6+TAI com alcance estendido, sem a penalidade de Defesa. A ferramenta cirúrgica do clã.' },
      { nome: 'Nikudan Sensha', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Vira bola giratória e atravessa uma zona: 3d6+TAI a todos, todos Caídos, coberturas leves destruídas.' },
      { nome: 'Nikudan Hari Sensha', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'O cabelo endurece em espinhos no rolamento. Igual ao Sensha, mas 4d6+TAI, ignora Bloqueio, atinge cobertura pesada.' },
      { nome: 'Chō Baika no Jutsu', rank: 'B', pc: '7+3/rd', estagio: 'III',
        efeito: 'Escala colossal. Invocação Grande por 3 rodadas: 4d6+TAI numa zona inteira, carrega o time. Movimento reduzido a uma zona.' },
      { nome: 'Bubun Baika: Konoha Ryūshō', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Uma palma gigantesca desce sobre uma zona. 3d6+TAI e todos Presos sob a mão (CD 16) até você levantá-la.' },
      { nome: 'Chō Harite', rank: 'A', pc: 11, estagio: 'IV',
        efeito: '5d6+TAI e o alvo é Empurrado três zonas. Contra parede ou penhasco, +3d6. Uma das mais eficazes do livro.' },
      { nome: 'Chō Hari Jizō', rank: 'A', pc: 11, estagio: 'V',
        efeito: 'Postura defensiva. Reação: reduza todo dano recebido pelo time numa zona em 4d6, e atacantes em Contato sofrem 3d6.' },
      { nome: 'Chō Chōji Butterfly', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Requer a Pílula Vermelha. Asas de chakra: +4 TAI e COR, voo, taijutsu vira 6d6+TAI, ignora toda redução. Dura 5 rodadas.' },
    ],
    // Bloco próprio do verbete: "AS PÍLULAS DE TRÊS CORES" (pág. 19).
    pilulas: [
      { cor: 'Verde', efeito: 'Dobra o dano de taijutsu por 3 rodadas (1 nível de Exaustão).' },
      { cor: 'Amarela', efeito: '+3 em TAI e COR por 5 rodadas (2 níveis).' },
      { cor: 'Vermelha', efeito: 'Destrava o Modo Borboleta e converte a reserva calórica inteira; o personagem morre em uma hora sem tratamento de um médico Especialista. Não há teste, não há sorte. É uma decisão.' },
    ],
    estiloDeJogo: 'Tanque e demolidor. Nenhum clã absorve mais dano nem empurra mais gente para fora de posição. A fraqueza é mobilidade e Defesa — você acerta forte, mas é acertado sempre, e quase todo o seu poder tem duração curta e custo de Exaustão.',
  },

  // ════════════════════════════════════════════════════════════════
  //  YAMANAKA — pág. 18
  // ════════════════════════════════════════════════════════════════
  {
    id: 'yamanaka',
    nome: 'Yamanaka',
    regiao: 'Konohagakure',
    kanji: '山中',
    lema: 'Floricultores que sabem tudo o que você preferia esconder.',
    resumo: 'Mantêm a floricultura mais conhecida de Konoha e a Força de Tortura e Interrogação, e não veem contradição nisso. O Hiden manipula a mente diretamente: projetar a consciência para dentro de outro corpo, ler memórias, plantar sugestões, conectar dezenas de pessoas numa rede.',
    passiva: {
      nome: 'Mente Aberta',
      efeito: 'Sensoriamento treinado de graça. Você se comunica telepaticamente com qualquer aliado que já tenha tocado, a qualquer distância, por 1 PC por mensagem. Percebe automaticamente quando alguém à vista está sob genjutsu ou controle mental.',
    },
    fardo: {
      nome: 'Memórias que não são suas',
      efeito: 'Cada uso de Shinkenkai ou Kokoro Rō deixa uma memória alheia com você. A cada três acumuladas, teste ESP CD 15 no início de cada sessão: a falha permite ao Mestre, uma vez, narrar você reagindo com o sentimento de outra pessoa. Mecanicamente você é frágil: enquanto usa Shintenshin ou Shinshin, seu corpo fica inconsciente e indefeso na zona onde o deixou.',
    },
    kg: null,
    naturezas: [],
    // "Sensoriamento treinado de graça." (Passiva)
    ajustes: { periciasTreinadas: ['Sensoriamento'] },
    // FALTA NO TEXTO: "Interrogatório Profundo" (Estágio III) e "Rede de Guerra"
    // (Estágio IV) são nomeados como o que o Estágio destrava, mas o Compêndio não
    // descreve o efeito de nenhum dos dois nem os põe na tabela de técnicas.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira transferência mental supervisionada — normalmente para dentro de um animal da loja.',
        destrava: 'Shintenshin no Jutsu.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Usar a mente do clã para salvar alguém, e não para vencer alguém.',
        destrava: 'Shinranshin e alcance telepático dobrado.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Um turno na Força de Tortura e Interrogação. Você vai ver o que se faz lá.',
        destrava: 'Interrogatório Profundo e a Formação Ino-Shika-Chō sem custo.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Ser designado para a rede de comando de uma operação de grande escala.',
        destrava: 'Rede de Guerra.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: sobreviver a ter a própria mente invadida por algo maior, e voltar inteiro.',
        destrava: 'Shinden e imunidade permanente a controle mental.' },
    ],
    tecnicas: [
      { nome: 'Shintenshin no Jutsu', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'GEN vs Resiliência Mental a Média. Sucesso: controla o corpo do alvo por uma rodada. Seu corpo fica indefeso; se o alvo sair do alcance, você fica preso nele.' },
      { nome: 'Shinransen', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Toque um alvo desprevenido e leia a superfície da mente: a emoção dominante, se mente, e o que mais teme.' },
      { nome: 'Shinranshin no Jutsu', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Corrompa o controle: o alvo ataca o aliado mais próximo com a própria ação. Não exige abandonar o corpo.' },
      { nome: 'Shinten Bunshin', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Divide sua consciência em três projeções-sensores em zonas diferentes. Você percebe tudo o que elas percebem.' },
      { nome: 'Shinkenkai', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Leia memórias específicas de um alvo capturado, inconsciente ou morto há menos de 24h. Resolve investigações e cria dilemas éticos na mesma cena.' },
      { nome: 'Shinshin no Jutsu', rank: 'A', pc: '11+3/rd', estagio: 'IV',
        efeito: 'Conecte telepaticamente até 50 pessoas: todos agem na mesma iniciativa e compartilham percepção. Você fica imóvel.' },
      { nome: 'Kokoro Rō', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Tranca o alvo dentro da própria cabeça: Sob Ilusão profundidade 3, revivendo a pior memória. 2d6 mental/rd.' },
      { nome: 'Shinden', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Transferência mental permanente e sem retorno para outro corpo. Seu corpo original morre. Usada uma vez na história do clã.' },
    ],
    estiloDeJogo: 'Controle mental, reconhecimento e inteligência. Resolve investigações inteiras com uma técnica e desmonta formações virando um inimigo contra os outros. A fraqueza é brutal: PV baixos, e quase todas as técnicas boas exigem que você abandone o próprio corpo em campo.',
  },

  // ════════════════════════════════════════════════════════════════
  //  INUZUKA — pág. 20
  // ════════════════════════════════════════════════════════════════
  {
    id: 'inuzuka',
    nome: 'Inuzuka',
    regiao: 'Konohagakure',
    kanji: '犬塚',
    lema: 'Dois corpos, uma mente.',
    resumo: 'Toda criança Inuzuka recebe um filhote no ano em que entra na Academia, e os dois crescem, treinam e se formam juntos. O ninken não é invocação nem ferramenta: é um parceiro com nome e opinião, e o clã trata a morte de um cão de combate como trataria a de um shinobi.',
    passiva: {
      nome: 'Sentidos Bestiais',
      efeito: 'Rastreamento treinado usando COR em vez de ESP (olfato). Ignora penalidades de escuridão e névoa, detecta mentiras pelo cheiro do medo (Vantagem em Percepção contra Enganação), e localiza qualquer pessoa cujo cheiro você conheça em até um quilômetro.',
    },
    fardo: {
      nome: 'Ele não é equipamento',
      efeito: 'Metade da sua ficha respira. O ninken é o alvo mais fácil que um inimigo inteligente identifica, e perdê-lo custa poder, Vínculo e uma sessão de consequências. E o olfato é faca de dois gumes: contra fumaça, ácido, gás ou o Aburame errado, Desvantagem em todos os testes de percepção.',
    },
    kg: null,
    naturezas: [],
    // "Rastreamento treinado usando COR em vez de ESP (olfato)." (Passiva) — o clã muda o
    // atributo de uma perícia, o que a tabela de PERICIAS_AVDF já antecipa ("Inuzuka usam COR").
    ajustes: {
      periciasTreinadas: ['Rastreamento'],
      atributoDePericia: { Rastreamento: 'COR' },
    },
    // FALTA NO TEXTO: o "estilo Jūjin Taijutsu" (Estágio I) é concedido sem custo de PT,
    // mas o capítulo não descreve o que o estilo faz.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'O dia em que o filhote escolhe você — e não o contrário.',
        destrava: 'Parceiro Ninken e o estilo Jūjin Taijutsu sem custo de PT.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Rastrear e encontrar algo que ninguém mais conseguiu.',
        destrava: 'Shikyaku no Jutsu e Tsūga.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Uma missão em que você e o ninken se separam, e um volta para buscar o outro.',
        destrava: 'Gatsūga e o ninken sobe para PV 20 + (8 × rank).' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Ser admitido na unidade de rastreamento de elite do clã.',
        destrava: 'Uma segunda matilha invocável, e o ninken passa a ter a própria Reação por rodada.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: a fusão exige confiança absoluta, e o clã testa isso de um jeito que ninguém gosta de descrever.',
        destrava: 'Jinjū Konbi Henge: Sōtōrō.' },
    ],
    tecnicas: [
      // DIVERGÊNCIA DO LIVRO: a tabela de técnicas marca Shikyaku no Jutsu como Estágio I,
      // mas a linha do Estágio II diz "Shikyaku no Jutsu e Tsūga". Mantida a tabela.
      { nome: 'Shikyaku no Jutsu', rank: 'D', pc: '2+1/rd', estagio: 'I',
        efeito: 'Sustentada. Postura animal: +2 COR, movimento de duas zonas, garras de 1d6+TAI. Base de todas as técnicas.' },
      { nome: 'Jūjin Bunshin', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'O ninken assume a sua forma exata. Dois alvos idênticos: ataques contra vocês têm Desvantagem por uma rodada.' },
      { nome: 'Tsūga', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Gira como broca humana atravessando uma zona: 2d6+TAI, ignora cobertura leve, termina do outro lado.' },
      { nome: 'Dynamic Marking', rank: 'D', pc: 2, estagio: 'II',
        efeito: 'O ninken marca um alvo à distância: Marcado permanentemente até se lavar, rastreável a qualquer distância. Humilhante e eficaz.' },
      { nome: 'Gatsūga', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Ninja e ninken como brocas gêmeas: Vantagem, 4d6+TAI, atravessa a zona atingindo todos.' },
      { nome: 'Garōga', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Três investidas em rodadas consecutivas, 3d6+TAI cada, sem gastar ação após a primeira. O alvo não pode se afastar sem sofrer um ataque.' },
      { nome: 'Tsūga: Rendan', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Você e o ninken alternam investidas opostas. O alvo fica Atordoado e sem Reação até o fim da rodada seguinte.' },
      { nome: 'Jinjū Konbi Henge: Sōtōrō', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Ninja e ninken se fundem numa fera de duas cabeças. Invocação Grande: 6d6+TAI, duas Ações Principais, redução 5. Dura 4 rodadas; ao fim, 2 Exaustão.' },
    ],
    // Bloco próprio do verbete: "O NINKEN" (pág. 23). É uma ficha à parte que anda junto
    // com a do personagem — nenhum outro clã de Konoha tem coisa igual.
    ninken: {
      nome: 'Ninken',
      texto: 'Aliado permanente, não invocação. PV 20 + (5 × seu rank), subindo para 20 + (8 × rank) no Estágio III. Defesa 13, ataque 1d6+TAI. Age no seu turno usando a sua Ação Menor, tem Vantagem em Rastreamento e é imune a genjutsu visual humano. Ele envelhece, se machuca e discorda de você. Se cair a 0 PV, faz Testes de Morte; se morrer, o time perde 2 pontos de Vínculo e conseguir outro exige um novo marco de Estágio I.',
      pv: '20 + (5 × rank)',
      pvEstagioIII: '20 + (8 × rank)',
      defesa: 13,
      ataque: '1d6+TAI',
    },
    estiloDeJogo: 'Mobilidade, rastreamento e economia de ações. Age duas vezes por rodada sem gastar nada, atravessa o campo e nunca perde um alvo. A fraqueza é a dependência do parceiro e a ausência total de alcance — sem o ninken, metade das técnicas não funciona.',
  },

  // ════════════════════════════════════════════════════════════════
  //  ABURAME — pág. 21
  // ════════════════════════════════════════════════════════════════
  {
    id: 'aburame',
    nome: 'Aburame',
    regiao: 'Konohagakure',
    kanji: '油女',
    lema: 'Um corpo oferecido como colmeia no dia em que nasce.',
    resumo: 'No nascimento, o corpo de uma criança Aburame é oferecido a uma colônia de kikaichū, insetos devoradores de chakra: eles vivem dentro dela, alimentam-se do chakra dela pela vida toda, e obedecem. A doutrina é a paciência — Aburame não vencem lutas, eles as tornam impossíveis de vencer.',
    passiva: {
      nome: 'Colônia',
      efeito: 'Seus insetos agem sem selos de mão. Como Ação Menor: marcar um alvo tocado (Marcado e rastreável por uma semana, a qualquer distância), criar cobertura leve instantânea, ou detectar todos os seres vivos numa zona, mesmo através de paredes.',
    },
    fardo: {
      nome: 'A colônia come você',
      efeito: 'Os insetos são alimentados mesmo sem uso: você perde 2 PC por dia, automaticamente, sem recuperar com descanso curto. Fogo, ácido e vento destroem parte da colônia — dano de Katon ou Fūton reduz seu enxame, e você perde as técnicas de Estágio III+ até uma semana de recuperação. E se você morrer, a colônia procura outro hospedeiro.',
    },
    kg: null,
    naturezas: [],
    // O clã não mexe em nenhum valor de criação, mas cobra manutenção contínua de PC:
    // "você perde 2 PC por dia, automaticamente, sem recuperar com descanso curto." (Fardo)
    ajustes: { pcPorDia: -2 },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira vez que a colônia obedece a uma ordem complexa em campo, e não em treino.',
        destrava: 'Mushi Kame no Jutsu e Mushi Bunshin.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Sacrificar parte da colônia para salvar alguém. Os insetos não são reposta grátis.',
        destrava: 'Mushidama e alcance de controle dobrado.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Cultivar uma colônia especializada do zero, o que leva meses de intervalo.',
        destrava: 'Colônias Especializadas — escolha duas.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Acesso ao arquivo entomológico do clã, que descreve espécies que ninguém deveria cultivar.',
        destrava: 'Mushikabe e uma terceira colônia especializada.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: tornar-se, você mesmo, a colmeia rainha de uma linhagem nova.',
        destrava: 'Mushi Jamu — enxame de escala militar.' },
    ],
    tecnicas: [
      { nome: 'Mushi Kame no Jutsu', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'O enxame envolve um alvo: Preso e perde 1d6 PC/rd, transferidos para você. Difícil de esquivar — o enxame se espalha e cerca.' },
      { nome: 'Mushi Bunshin', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Um clone de insetos: ao ser atingido, explode em enxame e o atacante perde 1d6 PC.' },
      { nome: 'Mushidama', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Comprime o enxame numa esfera e arremessa. 2d6+NIN e o alvo fica Cego por uma rodada.' },
      { nome: 'Mushi Yose', rank: 'D', pc: 2, estagio: 'II',
        efeito: 'Convoca insetos selvagens: reconhecimento total de um quilômetro em uma hora, sem risco.' },
      { nome: 'Hijutsu: Mushidama', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Esfera de insetos se fecha sobre o alvo: 4d6 e drena 3d6 PC. Se ficar sem PC dentro dela, fica Selado pela cena.' },
      // DIVERGÊNCIA DO LIVRO: a tabela marca Estágio III, mas o Estágio IV diz "Mushikabe e
      // uma terceira colônia especializada". Mantida a tabela.
      { nome: 'Mushikabe no Jutsu', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Parede viva numa zona: absorve 6d6 e consome ninjutsu de rank B- que a atinja, convertendo em PC para você.' },
      { nome: 'Kidaichū: Ōgi', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Os insetos crescem ao tamanho de punhos: 5d6 a todos em duas zonas, e o terreno vira difícil pela cena.' },
      { nome: 'Mushi Jamu', rank: 'S', pc: '16+5/rd', estagio: 'V',
        efeito: 'Sustentada. Cobre três zonas: todos perdem 2d6 PC/rd, ficam Cegos e sem técnicas sensoriais. Você enxerga tudo dentro com perfeição.' },
    ],
    // Bloco próprio do verbete: "COLÔNIAS ESPECIALIZADAS (ESTÁGIO III)" (pág. 25).
    // "Escolha duas; uma terceira no Estágio IV; não trocáveis depois."
    coloniasEspecializadas: {
      regra: 'Escolha duas; uma terceira no Estágio IV; não trocáveis depois.',
      opcoes: [
        { nome: 'Kikaichū', efeito: 'Drena chakra (padrão).' },
        { nome: 'Kōchū', efeito: 'Veneno paralisante: Lento e Envenenado.' },
        { nome: 'Rinkaichū', efeito: 'Devoram chakra e tecido: 3d6 real/rd, destroem selos e implantes.' },
        { nome: 'Shōkaichū', efeito: 'Rastreiam assinaturas específicas a 10 km.' },
        { nome: 'Kidaichū', efeito: 'Crescem e devoram matéria: abrem passagem por madeira, pedra ou fūinjutsu simples.' },
      ],
    },
    estiloDeJogo: 'Atrito, negação de recursos e reconhecimento total. Não mata: esvazia. Contra quem depende de chakra, vence lentamente sem nunca ser tocado. A fraqueza é o tempo — o clã mais lento do livro, e contra um lutador de taijutsu que não precisa de chakra, o enxame só atrasa o inevitável.',
  },

  // ════════════════════════════════════════════════════════════════
  //  SARUTOBI — pág. 23
  //  O único clã que mexe no recurso central do jogo (ver `ajustes`).
  // ════════════════════════════════════════════════════════════════
  {
    id: 'sarutobi',
    nome: 'Sarutobi',
    regiao: 'Konohagakure',
    kanji: '猿飛',
    lema: 'Sem sangue especial. Só vontade, e três gerações de comando.',
    resumo: 'Não têm kekkei genkai, dōjutsu nem técnica de sangue: o que têm é uma tradição ininterrupta de liderança — o Terceiro Hokage veio deles, governou por décadas e foi chamado de "o Professor". A doutrina da Vontade do Fogo é formulação Sarutobi, e o clã mantém laços com o Templo do Fogo e com os Doze Guardiões Ninja.',
    passiva: {
      nome: 'Vontade do Fogo Encarnada',
      efeito: 'Você começa cada sessão com 4 Pontos de Vontade do Fogo em vez de 3. Além disso, como ação livre, gaste 1 PVF seu para dar 1 PVF a um aliado que possa te ouvir. Nenhum outro clã interage com o recurso central do jogo.',
    },
    fardo: {
      nome: 'A conta do Professor',
      efeito: 'Você herda um nome que representa a Vontade do Fogo, e o mundo vai testar se você acredita nela. Sempre que o time tomar uma decisão que sacrifique alguém pelo bem maior, o Mestre deve perguntar ao jogador Sarutobi, em voz alta, se ele concorda — e a resposta deve ter consequência. Além disso, a Passiva dá aos outros um recurso que sai do seu bolso: um Sarutobi generoso termina as sessões sem nada guardado para si.',
    },
    kg: null,                                       // "Não têm kekkei genkai, dōjutsu nem técnica de sangue."
    // Confirmado pelas linhas de Estágio, e não só pelo catálogo de técnicas:
    // Estágio I destrava "as técnicas Katon de Estágio I" e o Estágio II dá
    // "Fūton: Chakra Nagashi permanente nas facas".
    naturezas: ['katon', 'futon'],
    // CONFIRMADO NO TEXTO. Passiva — Vontade do Fogo Encarnada, pág. 23:
    // "Você começa cada sessão com 4 Pontos de Vontade do Fogo em vez de 3."
    // O recurso padrão é 3, então o ajuste é +1. A doação de PVF ("gaste 1 PVF seu
    // para dar 1 PVF a um aliado") é ação de jogo, não alteração de valor da ficha.
    ajustes: { recursos: { pvf: +1 } },
    // FALTA NO TEXTO: as "Facas de Chakra" (Estágio I) não têm estatística própria no
    // capítulo — aparecem só como o equipamento que Hien e as técnicas Katon usam.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Receber o par de facas de trincheira da família, de alguém que já as usou em guerra.',
        destrava: 'Facas de Chakra e as técnicas Katon de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Proteger um civil, um subordinado ou um estranho quando ninguém estava olhando.',
        destrava: 'Fūton: Chakra Nagashi permanente nas facas.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Comandar um time que não é o seu, numa situação em que você não pediu para comandar.',
        destrava: 'Gōka Mekkyaku e o contrato de invocação com os macacos.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Ser convidado para os Doze Guardiões Ninja, ou recusar por um bom motivo.',
        destrava: 'Hien e Guardião: 1×/sessão, anule um efeito que atingiria um aliado a até duas zonas.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: assumir a responsabilidade por Konoha inteira, ainda que por uma noite.',
        destrava: 'Enma: Kongōnyoi e Shiki Fūjin (kinjutsu, com todo o custo).' },
    ],
    tecnicas: [
      { nome: 'Katon: Haisekishō', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Nuvem de cinzas quentes numa zona (Desvantagem dentro). Ação Menor: estale os dentes e detone — 3d6 a todos na nuvem.' },
      { nome: 'Katon: Endan', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Jato compacto de fogo: 2d6+NIN e o alvo fica Queimando.' },
      // DIVERGÊNCIA DO LIVRO: a tabela marca Hien como Estágio II, mas a linha do Estágio IV
      // diz "Hien e Guardião: 1×/sessão, anule um efeito...". Mantida a tabela.
      { nome: 'Hien', rank: 'B', pc: 7, estagio: 'II',
        efeito: 'Fūton nas facas, estendendo a lâmina em vento invisível. Por 4 rodadas, +2d6, ignora toda redução, alcança Curta.' },
      { nome: 'Katon: Karyū Endan', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Jato contínuo em dragão: 3d6+NIN em linha até Longa, atravessando cobertura leve.' },
      { nome: 'Katon: Gōka Mekkyaku', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Muralha de fogo varrendo o campo a partir de você. Aliados na sua zona testam COR CD 13 para escapar ilesos.' },
      { nome: 'Kuchiyose: Enma', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Invoca Enma, que vira um bastão adamantino: ataques de 4d6+TAI, alcance Média, indestrutível (não quebra nem é desarmado).' },
      { nome: 'Enma: Kongōnyoi', rank: 'A', pc: 11, estagio: 'V',
        efeito: 'O bastão se divide numa jaula de barras indestrutíveis. Um alvo fica Preso sem escape abaixo de rank S; pode agir, mas não sair.' },
      // A coluna PC desta técnica traz a palavra "tudo", não um número.
      { nome: 'Shiki Fūjin', rank: 'S', pc: 'tudo', estagio: 'V', kinjutsu: true,
        efeito: 'Invoca o Shinigami, que arranca a alma do alvo e a sela com a sua. Funciona contra qualquer coisa, inclusive um bijū. O usuário morre.' },
    ],
    estiloDeJogo: 'Líder e protetor. É o único clã que melhora a ficha dos outros jogadores, e as facas de chakra com Hien são uma das melhores linhas de dano sustentado do livro. A fraqueza é a ausência de algo que resolva um problema sozinho: o Sarutobi vence porque o time inteiro joga melhor com ele em campo, e perde quando está sozinho.',
  },

  // ════════════════════════════════════════════════════════════════
  //  HATAKE — pág. 25
  // ════════════════════════════════════════════════════════════════
  {
    id: 'hatake',
    nome: 'Hatake',
    regiao: 'Konohagakure',
    kanji: 'はたけ',
    lema: 'Um clã do tamanho de uma família, que produziu um homem comparado aos Sannin.',
    resumo: 'Nunca foram muitos — algumas casas, nenhum kekkei genkai. O que os tornou famosos foi um único homem: a Presa Branca de Konoha, que carregava um sabre curto de chakra branco visível e que, numa missão crítica, escolheu salvar os companheiros em vez de completar o objetivo — e foi tratado como fracasso até não aguentar mais.',
    passiva: {
      nome: 'Instinto de Campo',
      efeito: 'Você nunca é surpreendido e rola iniciativa com Vantagem. Fora de combate, Vantagem em Percepção. É a passiva mais discreta do livro e a que mais decide combates, porque agir primeiro contra um canalizador é o jogo inteiro.',
    },
    fardo: {
      nome: 'A escolha do pai',
      efeito: 'A pergunta que destruiu a Presa Branca vai voltar para você, e o Mestre deve montá-la ao menos uma vez por campanha: a missão ou o companheiro. Escolher a missão custa 1 ponto de Vínculo do time; escolher o companheiro faz a missão falhar de verdade, com consequências reais. Não existe terceira opção, e essa é a questão.',
    },
    kg: null,                                       // "algumas casas, nenhum kekkei genkai"
    // O Estágio III destrava a técnica "Raiton: Shiroi Kiba", mas o livro em momento
    // nenhum diz que o clã concede ou domina Raiton — só entrega aquela técnica. Por isso
    // a lista fica vazia; preenchê-la a partir do nome de uma técnica seria inferência.
    naturezas: [],
    // Nenhum ajuste permanente de ficha. Os bônus numéricos do clã são condicionais e
    // vivem nos Estágios ("+3 de Defesa contra ela pela cena", Estágio II) — não são
    // valores de ficha. Por isso não há `ajustes` aqui.
    // FALTA NO TEXTO: "Duplo Tempo" e o "Estilo ANBU-ryū" (Estágio IV) não têm efeito
    // descrito neste capítulo — o estilo provavelmente vem de outro livro, e Duplo Tempo
    // tem nome parecido com Nikai Jikan, mas o Compêndio não afirma que são o mesmo.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Herdar o Sabre de Chakra Branco, normalmente de alguém que morreu.',
        destrava: 'Sabre de Chakra Branco e o contrato com os cães-ninja.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Ser atingido em cheio por uma técnica e sobreviver — e nunca mais cair para ela.',
        destrava: 'Leitura de Combate: após ser atingido por uma técnica, +3 de Defesa contra ela pela cena.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Enfrentar a escolha do pai: a missão ou os companheiros. Não existe resposta certa.',
        destrava: 'Raiton: Shiroi Kiba e a matilha completa.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Ser recrutado para o ANBU, ou recusar e explicar por quê.',
        destrava: 'Estilo ANBU-ryū sem custo, e Duplo Tempo.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: reabilitar o nome do clã, ou enterrá-lo de vez em seus próprios termos.',
        destrava: 'Herdeiro da Presa Branca — 1×/combate, duas Ações Principais no mesmo turno.' },
    ],
    tecnicas: [
      { nome: 'Shiroi Kiba', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'A lâmina emite chakra branco. 1d8+TAI, aceita Chakra Nagashi permanente sem custo, e corta chakra intangível: atinge incorpóreos e desfaz jutsus Sustentados em Contato.' },
      { nome: 'Kuchiyose: Ninken', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Invoca de um a oito cães rastreadores. Vantagem automática em Rastreamento; matilha de quatro impõe Preso (CD 16).' },
      { nome: 'Ninken: Dosu Kagi', rank: 'D', pc: 2, estagio: 'II',
        efeito: 'De uma gota de sangue ou objeto pessoal, a matilha localiza o alvo em qualquer lugar do país em 1d4 dias.' },
      { nome: 'Raiton: Shiroi Kiba', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Raiton no sabre. Por 4 rodadas: +2d6, ignora redução, e o alvo tem Desvantagem para Esquivar.' },
      { nome: 'Sōsa no Kamae', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Reação. Ao ser alvo de um ataque, Percepção vs o acerto do inimigo: sucesso anula o ataque e você aprende a técnica dele para a Leitura de Combate.' },
      { nome: 'Nikai Jikan', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Uma vez por combate, execute duas Ações Principais no mesmo turno. Simples, caro e decisivo.' },
      { nome: 'Ninken: Hōimō', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'A matilha cerca uma zona. Ninguém entra ou sai sem sofrer 2d6 de cada cão e COR CD 15 para não ficar Preso.' },
      { nome: 'Shiroi Kiba: Kanzen', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Sabre e matilha como um organismo. Por 5 rodadas: três ataques de 4d6+TAI/rd, você não pode ser flanqueado, e aliados adjacentes ganham +3 de Defesa.' },
    ],
    estiloDeJogo: 'Duelista técnico e adaptativo. Sem poder bruto e sem linhagem, vence por iniciativa, informação e por nunca cair duas vezes no mesmo truque. A fraqueza é a ausência de escala: contra área, contra números ou contra um inimigo que não teve tempo de ler, é só um Jōnin muito competente.',
  },

  // ════════════════════════════════════════════════════════════════
  //  SHIMURA — pág. 26
  //  O outro clã que mexe na Vontade do Fogo — mas para tirar.
  // ════════════════════════════════════════════════════════════════
  {
    id: 'shimura',
    nome: 'Shimura',
    regiao: 'Konohagakure',
    kanji: '志村',
    lema: 'Criados para não amar ninguém.',
    resumo: 'Clã pequeno e político, indissociável da Raiz — o ramo do ANBU que fazia o que o Hokage não podia saber que tinha sido feito. A doutrina era simples: emoção é vulnerabilidade; os recrutas eram criados como irmãos, obrigados a se matar entre si, e os sobreviventes recebiam um selo amaldiçoado na língua. O ninjutsu de tinta é a arte de assinatura.',
    passiva: {
      nome: 'Emoção Selada',
      efeito: 'Você é imune a leitura mental, intimidação e a qualquer genjutsu que dependa de explorar sentimentos. Nada extrai informação de você — nem tortura, nem Shintenshin. Custo permanente: você não pode gastar Vontade do Fogo para ajudar outra pessoa. Proteger, doar, interceptar — nada disso está disponível. Recuperar é um arco inteiro.',
    },
    fardo: {
      nome: 'O selo na língua',
      efeito: 'Até o Estágio V, você não consegue fisicamente revelar informações sobre a Raiz — tentar causa 2d6 de dano e paralisia por uma rodada. Você não pode gastar Vontade do Fogo por ninguém. E o time vai perceber: em algum momento alguém vai perguntar por que você nunca ajuda, e você não vai poder explicar.',
    },
    kg: null,
    naturezas: [],
    // Duas alterações de ficha, ambas citadas:
    // "Custo permanente: você não pode gastar Vontade do Fogo para ajudar outra pessoa.
    //  Proteger, doar, interceptar — nada disso está disponível." (Passiva; repetido no Fardo)
    //  O Estágio V devolve isso: "a Passiva perde o custo permanente."
    // "Chōjū Giga e Furtividade treinada." (Estágio I — que é gratuito na criação)
    ajustes: {
      pvfParaAliados: false,
      pvfParaAliadosLiberadoNoEstagio: 'V',
      periciasTreinadas: ['Furtividade'],
    },
    // FALTA NO TEXTO: o "Estilo ANBU-ryū" (Estágio III, sem custo) não é descrito neste
    // capítulo — mesma lacuna do Hatake.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Receber o codinome que substitui o seu nome, e o pincel.',
        destrava: 'Chōjū Giga e Furtividade treinada.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Completar uma missão que o time não pode saber que existiu.',
        destrava: 'Sem Rastro: sensores não detectam você, e você não deixa assinatura de chakra.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Desobedecer a uma ordem da Raiz pela primeira vez — ou obedecer a uma que sabia ser errada.',
        destrava: 'Estilo ANBU-ryū sem custo e as técnicas de Estágio III.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Acesso aos arquivos que a Raiz manteve sobre a própria vila.',
        destrava: 'Instrumento: 1×/sessão, ignore completamente um efeito incapacitante — dor, medo, veneno, ilusão.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: quebrar o selo, sentir alguma coisa, e escolher o que fazer com isso.',
        destrava: 'Chōjū Giga: Gunzei e a Passiva perde o custo permanente.' },
    ],
    tecnicas: [
      { nome: 'Chōjū Giga', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'Desenhe uma criatura e ela ganha vida: PV 15, Def 13, ataque 2d6+CTR, age com sua Ação Menor. Até duas simultâneas.' },
      { nome: 'Sumi Bunshin', rank: 'D', pc: 2, estagio: 'I',
        efeito: 'Um clone que se desfaz em respingos de tinta ao ser atingido, cegando o atacante por uma rodada.' },
      { nome: 'Chōjū Giga: Tori', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Aves de transporte e reconhecimento: carregam duas pessoas, voam por uma cena, e dão posicionamento vertical.' },
      { nome: 'Sumi Nagashi', rank: 'D', pc: 2, estagio: 'II',
        efeito: 'Tinta invisível marca um alvo tocado: rastreável por três dias, e você sabe se está vivo.' },
      { nome: 'Chōjū Giga: Jūshi', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Uma matilha de cinco feras (PV 12) cerca uma zona: alvos dentro ficam Presos (CD 15) e sofrem 1d6/rd.' },
      { nome: 'Sumi Rō', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'A tinta envolve e endurece: um alvo fica Preso e Selado (CD 17). A captura padrão da Raiz.' },
      { nome: 'Ne no Kamae', rank: 'B', pc: 7, estagio: 'IV',
        efeito: 'Por 3 rodadas, todo ataque contra um alvo que não saiba da sua presença é crítico automático, e você recupera a furtividade após cada ataque.' },
      { nome: 'Chōjū Giga: Gunzei', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Um pergaminho ganha vida: dezenas de feras cobrindo três zonas. Concede Vantagem a todos os aliados dentro e causa 5d6/rd aos inimigos. Dura 4 rodadas.' },
    ],
    estiloDeJogo: 'Espião, assassino e invocador. O ninjutsu de tinta dá mais ações por rodada que qualquer outro clã e resolve transporte, reconhecimento, captura e dano em área. A fraqueza é toda social: imune a controle mental e incapaz de ajudar quem está do seu lado — a campanha inteira é sobre reverter isso.',
  },

  // ════════════════════════════════════════════════════════════════
  //  KURAMA — pág. 28
  //  Único clã cujo catálogo tem custo em PC fora da tabela padrão:
  //  todas as técnicas estão impressas com +2 PC embutido, por causa
  //  da Passiva ("todo genjutsu que você lança custa +2 PC").
  // ════════════════════════════════════════════════════════════════
  {
    id: 'kurama',
    nome: 'Kurama',
    regiao: 'Konohagakure',
    kanji: '鞍馬',
    lema: 'Quando a ilusão deixa de ser ilusão.',
    resumo: 'Já foram dos mais temidos de Konoha por uma razão: o genjutsu deles não engana o cérebro, reescreve o que acontece — uma ilusão Kurama que queima alguém deixa queimaduras reais. A capacidade salta gerações e produz no máximo um portador por geração, que quase nunca sobrevive à adolescência, porque o dom vem acompanhado de uma segunda personalidade que se manifesta sob estresse.',
    passiva: {
      nome: 'Ilusão Concreta',
      efeito: 'O dano dos seus genjutsu é dano real, não mental: um alvo levado a 0 PV pela sua ilusão fica Morrendo, não inconsciente. Objetos e terreno criados pela sua ilusão têm consistência física enquanto ela durar. Custo: todo genjutsu que você lança custa +2 PC.',
    },
    fardo: {
      nome: 'A segunda personalidade',
      efeito: 'Sempre que usar um genjutsu de rank B ou superior, teste ESP CD 15. Na falha, o Mestre controla parcialmente o seu personagem por uma cena — não para arruiná-lo, mas para mostrar o que a outra faria com o mesmo poder e menos escrúpulo. Anote cada ocorrência: na terceira da campanha, o clã fica sabendo.',
    },
    kg: null,                                       // o verbete não chama a capacidade de kekkei genkai
    naturezas: [],
    // "Custo: todo genjutsu que você lança custa +2 PC." (Passiva). É por isso que os
    // custos da tabela de técnicas deste clã não batem com JUTSU_RANKS_AVDF: C sai por 6
    // em vez de 4, D por 4, B por 9 e A por 13 — o livro já imprimiu o +2 embutido.
    ajustes: { pcGenjutsu: +2 },
    // FALTA NO TEXTO: "Mundo Interior" (Estágio III) e "Realidade Reescrita" (Estágio IV)
    // não têm efeito descrito nem entrada na tabela de técnicas. Os nomes lembram
    // Magen: Naibu Sekai e Jitsuzai Kaihen, mas o livro não diz que são a mesma coisa —
    // e afirmar isso seria inferência.
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'A primeira ilusão que deixa uma marca física em alguém — normalmente por acidente.',
        destrava: 'Magen: Jubaku Satsu com profundidade 3.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Ser selado pela primeira vez pelo clã, e negociar a própria liberdade.',
        destrava: 'Vetor Duplo: seus genjutsu usam dois vetores; bloquear apenas um não protege.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Encarar a segunda personalidade de frente e não perder o controle da cena.',
        destrava: 'Mundo Interior.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Encontrar os registros do último portador do clã, e o que fizeram com ele.',
        destrava: 'Realidade Reescrita e as técnicas de Estágio IV.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: fazer as pazes com a segunda personalidade em vez de derrotá-la.',
        destrava: 'Idaten, e a segunda personalidade vira aliada em vez de risco.' },
    ],
    tecnicas: [
      { nome: 'Magen: Jubaku Satsu', rank: 'C', pc: 6, estagio: 'I',
        efeito: 'Profundidade 3. O alvo sente uma árvore crescendo através de si — e, sendo Kurama, ela cresce: 2d6 real/rd enquanto acreditar.' },
      { nome: 'Magen: Kokoro no Kizu', rank: 'D', pc: 4, estagio: 'I',
        efeito: 'Ilusão cirúrgica: o alvo acredita ter sido cortado. 1d6 real e sangramento visível que ninguém consegue explicar.' },
      { nome: 'Kasumi Jūsha', rank: 'C', pc: 6, estagio: 'II',
        efeito: 'Três figuras ilusórias que atacam de verdade (1d6+GEN cada). Somem ao sofrer dano, mas o dano que causaram fica.' },
      { nome: 'Magen: Naibu Sekai', rank: 'B', pc: 9, estagio: 'III',
        efeito: 'Ilusão de área cobrindo três zonas, que persiste sem manutenção pela cena. O terreno ilusório funciona como terreno real.' },
      { nome: 'Magen: Shikkoku', rank: 'B', pc: 9, estagio: 'III',
        efeito: 'Rouba os sentidos: Cego e Sob Ilusão profundidade 3, sofrendo 2d6 reais/rd de puro terror.' },
      { nome: 'Jitsuzai Kaihen', rank: 'A', pc: 13, estagio: 'IV',
        efeito: 'O que você imagina passa a existir fisicamente enquanto durar: paredes, fogo, criaturas, um abismo. Sustentada, 4 PC/rd. Tudo se desfaz ao terminar — mas os ferimentos não.' },
      { nome: 'Magen: Meikai', rank: 'A', pc: 13, estagio: 'IV',
        efeito: 'Até três alvos arrastados para uma ilusão compartilhada da qual só saem juntos. Cada rodada dentro custa 3d6 reais a cada um.' },
      { nome: 'Idaten', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Cede o controle à segunda personalidade por 4 rodadas: +4 GEN e ESP, genjutsu com profundidade máxima e CD +5, imune a Kai. Ao fim, 3 Exaustão — e o Mestre narra o que ela fez.' },
    ],
    estiloDeJogo: 'Genjutsu levado ao extremo letal. É o único personagem que mata com ilusão, e o único cujo dano ignora armadura, bloqueio e resistência elemental por completo. A fraqueza compensa: custo aumentado em todo genjutsu, PV baixos, inutilidade contra quem bloqueie o vetor — e o risco de o Mestre assumir a sua ficha.',
  },

  // ════════════════════════════════════════════════════════════════
  //  FŪMA — pág. 29
  // ════════════════════════════════════════════════════════════════
  {
    id: 'fuma',
    nome: 'Fūma',
    regiao: 'Konohagakure',
    kanji: '風魔',
    lema: 'Herdaram a Polícia Militar e todo o ressentimento que vinha junto.',
    resumo: 'Parentes distantes dos Uchiha, sem o Sharingan e sem a fama. A especialidade é o fūma shuriken — a lâmina gigante dobrável de quatro pontas — e um estilo de arremesso que trata o campo como geometria de ângulos e ricochetes. Depois do massacre, a Polícia Militar caiu no clã com o parentesco mais próximo: uma promoção que ninguém queria.',
    passiva: {
      nome: 'Mestre das Lâminas Giratórias',
      efeito: 'Bukijutsu treinado. Seus ataques com projéteis alcançam uma zona a mais sem penalidade, e ricocheteiam: se você errar um ataque à distância, role novamente contra outro alvo na mesma zona.',
    },
    fardo: {
      nome: 'Ninguém gosta da polícia',
      efeito: 'Dentro de Konoha, Desvantagem em Persuasão com civis e com shinobi que já tiveram problemas com a lei — praticamente todo mundo interessante. E você tem obrigação legal de agir: presenciar um crime e não intervir é falta funcional, e o Mestre deve pôr o time em ao menos uma situação em que o dever do PC conflita com o objetivo da missão.',
    },
    kg: null,                                       // "sem o Sharingan e sem a fama"
    naturezas: [],
    // "Bukijutsu treinado." (Passiva)
    ajustes: { periciasTreinadas: ['Bukijutsu'] },
    estagios: [
      { n: 'I', nome: 'Iniciação', rank: 'genin', pt: 0,
        marco: 'Forjar a própria fūma shuriken, o que leva semanas e custa dedos.',
        destrava: 'Fūma Shuriken e as técnicas de Estágio I.' },
      { n: 'II', nome: 'Herança', rank: 'genin', pt: 6,
        marco: 'Fazer uma prisão sozinho, sem violência e sem apoio.',
        destrava: 'Sōshuriken e Vantagem em Intimidação dentro de Konoha.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Prender alguém que você conhece — e não abrir exceção.',
        destrava: 'Kage Fūma Shuriken e o distintivo de investigador.' },
      { n: 'IV', nome: 'Segredo', rank: 'jonin', pt: 12,
        marco: 'Ser encarregado de um caso que envolve alguém acima de você na hierarquia.',
        destrava: 'Bakuretsu Fūma e autoridade de prisão sobre qualquer rank abaixo de Kage.' },
      { n: 'V', nome: 'Legado', rank: 'anbu', pt: 18,
        marco: 'Marco de História: reformar a Polícia Militar, ou provar que ela nunca deveria ter existido.',
        destrava: 'Fūma: Senbon Arashi.' },
    ],
    tecnicas: [
      { nome: 'Fūma Shuriken', rank: 'D', pc: 2, estagio: 'I',
        efeito: '2d6+TAI a Média, atinge todos em linha reta, e retorna à sua mão no fim do turno.' },
      { nome: 'Kaiten Shuriken', rank: 'C', pc: 4, estagio: 'I',
        efeito: 'A shuriken orbita você por 3 rodadas: todo inimigo em Contato sofre 2d6, e você a redireciona como Ação Menor.' },
      { nome: 'Sōshuriken no Jutsu', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Duas lâminas na sombra uma da outra. Quem Esquivar da primeira é atingido automaticamente pela segunda. A manobra que define o clã.' },
      { nome: 'Tsuna Shuriken', rank: 'C', pc: 4, estagio: 'II',
        efeito: 'Fio ninja preso à lâmina. Ao acertar, o alvo fica Preso (CD 14) e você o puxa uma zona como Ação Menor.' },
      { nome: 'Kage Fūma Shuriken', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Multiplica em dezenas: 3d6+TAI a todos numa zona; alvos que Esquivarem ainda sofrem metade.' },
      { nome: 'Fūma: Kōsa', rank: 'B', pc: 7, estagio: 'III',
        efeito: 'Duas lâminas cruzam a zona em ângulos opostos e se encontram no alvo. Ignora cobertura: 4d6+TAI, sem Esquiva.' },
      { nome: 'Bakuretsu Fūma', rank: 'A', pc: 11, estagio: 'IV',
        efeito: 'Selos explosivos nas pontas: 5d6+TAI numa zona, e a explosão destrói cobertura pesada permanentemente.' },
      { nome: 'Fūma: Senbon Arashi', rank: 'S', pc: 16, estagio: 'V',
        efeito: 'Ação Principal: ataque todos os inimigos até Média, 3d6+TAI cada, rolados separadamente. Ricochetes se aplicam. 1×/combate.' },
    ],
    estiloDeJogo: 'Controle de área à distância, sem depender de chakra. É o melhor clã para quem quer contribuir com o tanque vazio, e o Sōshuriken pune esquiva como nenhuma outra técnica. A fraqueza é a ausência de defesa própria e de resposta ao corpo a corpo: encurralado, é um alvo grande com uma lâmina que precisa de espaço para girar.',
  },

];
