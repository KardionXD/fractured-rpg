// ══════════════════════════════════════════════════════════════════
//  CONTEÚDO OFICIAL — A VONTADE DO FOGO
//  Livro do Jogador (Livros I a III) + Fast Play
//
//  Nada aqui é inventado: cada número sai dos livros, e os valores
//  derivados foram conferidos contra as cinco fichas prontas do
//  Fast Play (Katsurō, Hinaru, Miyu, Ren, Tarou).
// ══════════════════════════════════════════════════════════════════

// ── PERÍCIAS (Cap. 03) ────────────────────────────────────────────
//  Dezoito. `attr` é o atributo em que a perícia soma; algumas aceitam
//  dois, e aí a pessoa usa o que fizer sentido na cena.
//  Ser treinado vale +2 (o Fractured usa +3 — não é o mesmo sistema).

const PERICIAS_AVDF = [
  { nome: 'Atletismo',     attr: 'COR',        cat: 'CORPO',        uso: 'Correr, saltar, escalar, nadar, resistir a esforço extremo.' },
  { nome: 'Furtividade',   attr: 'COR',        cat: 'CORPO',        uso: 'Mover-se sem ser visto ou ouvido; suprimir presença física.' },
  { nome: 'Acrobacia',     attr: 'COR',        cat: 'CORPO',        uso: 'Equilíbrio, quedas, manobras aéreas, escapar de amarras.' },

  { nome: 'Percepção',     attr: 'ESP',        cat: 'ESPÍRITO',     uso: 'Notar detalhes, emboscadas, mentiras, sinais de chakra próximos.' },
  { nome: 'Sensoriamento', attr: 'ESP',        cat: 'ESPÍRITO',     uso: 'Detectar e identificar assinaturas de chakra à distância. Requer treino.' },
  { nome: 'Determinação',  attr: 'ESP',        cat: 'ESPÍRITO',     uso: 'Resistir a tortura, medo, dor e coerção mental.' },
  { nome: 'Saber Shinobi', attr: 'ESP',        cat: 'ESPÍRITO',     uso: 'História, clãs, política das vilas, reconhecer técnicas e brasões.' },
  { nome: 'Rastreamento',  attr: 'ESP ou COR', cat: 'ESPÍRITO',     uso: 'Seguir trilhas, ler terreno, caçar. Inuzuka usam COR (olfato).' },

  { nome: 'Medicina',      attr: 'CTR',        cat: 'CONTROLE',     uso: 'Primeiros socorros, diagnóstico, venenos e antídotos, cirurgia.' },
  { nome: 'Fūinjutsu',     attr: 'CTR',        cat: 'CONTROLE',     uso: 'Ler, desenhar, aplicar e romper selos.' },
  { nome: 'Armadilhas',    attr: 'CTR',        cat: 'CONTROLE',     uso: 'Montar, detectar e desarmar armadilhas e fios.' },
  { nome: 'Fabricação',    attr: 'CTR',        cat: 'CONTROLE',     uso: 'Forjar armas, montar marionetes, produzir ferramentas e explosivos.' },

  { nome: 'Enganação',     attr: 'GEN',        cat: 'GENJUTSU',     uso: 'Mentir, disfarçar-se, manter uma identidade falsa.' },
  { nome: 'Estratégia',    attr: 'GEN ou ESP', cat: 'GENJUTSU',     uso: 'Planejar, prever movimentos inimigos, comandar uma formação.' },
  { nome: 'Persuasão',     attr: 'GEN ou ESP', cat: 'GENJUTSU',     uso: 'Convencer, negociar, inspirar, acalmar.' },

  { nome: 'Bukijutsu',     attr: 'TAI',        cat: 'TAIJUTSU',     uso: 'Uso especializado de armas: espadas, lanças, marionetes, arremesso de precisão.' },
  { nome: 'Intimidação',   attr: 'TAI ou ESP', cat: 'TAIJUTSU',     uso: 'Ameaçar, dominar pela presença, interrogar sob pressão.' },

  { nome: 'Sobrevivência', attr: 'COR ou ESP', cat: 'SOBREVIVÊNCIA', uso: 'Terreno selvagem, forragem, abrigo, navegação, clima.' },
];

const PERICIAS_AVDF_ORDEM = ['CORPO', 'ESPÍRITO', 'CONTROLE', 'GENJUTSU', 'TAIJUTSU', 'SOBREVIVÊNCIA'];

function periciasAvdfPorCategoria() {
  const grupos = {};
  PERICIAS_AVDF_ORDEM.forEach(c => grupos[c] = []);
  PERICIAS_AVDF.forEach(p => (grupos[p.cat] = grupos[p.cat] || []).push(p));
  return grupos;
}

function periciaAvdf(nome) {
  return PERICIAS_AVDF.find(p => p.nome === nome) || null;
}

function atributoDaPericiaAvdf(nome) {
  return periciaAvdf(nome)?.attr || '';
}

// ── RANKS (Cap. 01 e 06) ──────────────────────────────────────────
//  A espinha dorsal do sistema: o rank limita o atributo máximo, dá
//  bônus de PV e PC, e diz até que rank de jutsu você alcança.
//  O Fractured não tem nada parecido — não há nível, não há avanço
//  de poder. É a diferença mais funda entre os dois.

const RANKS_AVDF = [
  { id: 'estudante', nome: 'Estudante',      pv:  -5, pc:  -4, attrMax: 3, jutsuMax: 'D',
    oque: 'Ainda na Academia. Sabe teoria e três jutsus básicos.' },
  { id: 'genin',     nome: 'Genin',          pv:   0, pc:   0, attrMax: 4, jutsuMax: 'C',
    oque: 'Ninja formado. Trabalha em time de três sob um sensei.' },
  { id: 'chunin',    nome: 'Chūnin',         pv:   8, pc:   6, attrMax: 5, jutsuMax: 'B',
    oque: 'Aprovado por liderança e cabeça fria, não por força. Pode comandar.' },
  { id: 'jonin_esp', nome: 'Jōnin Especial', pv:  14, pc:  10, attrMax: 5, jutsuMax: 'B',
    oque: 'Especialista extremo em uma única área. Um bisturi, não um canivete.' },
  { id: 'jonin',     nome: 'Jōnin',          pv:  20, pc:  16, attrMax: 6, jutsuMax: 'A',
    oque: 'Elite. Domina duas ou mais naturezas. Opera sozinho.' },
  { id: 'anbu',      nome: 'ANBU / Elite',   pv:  28, pc:  24, attrMax: 7, jutsuMax: 'A',
    oque: 'Operações negras diretamente sob o Kage. Sem nome, sem rosto.' },
  { id: 'kage',      nome: 'Kage / Sannin',  pv:  38, pc:  34, attrMax: 8, jutsuMax: 'S',
    oque: 'Lenda viva. Seu nome sozinho é um dissuasor militar.' },
];

function rankAvdf(id) {
  return RANKS_AVDF.find(r => r.id === id) || RANKS_AVDF[1];   // padrão: Genin
}

// ── RANK DE JUTSU (Cap. 06) ───────────────────────────────────────
//  Custo em PC e dano base de cada rank de técnica.

const JUTSU_RANKS_AVDF = [
  { id: 'E', pc:  1, dano: '1d4', perfil: 'Fundamento da Academia' },
  { id: 'D', pc:  2, dano: '1d6', perfil: 'Ferramenta de Genin' },
  { id: 'C', pc:  4, dano: '2d6', perfil: 'Padrão de campo' },
  { id: 'B', pc:  7, dano: '3d6', perfil: 'Especialista' },
  { id: 'A', pc: 11, dano: '5d6', perfil: 'Assinatura de Jōnin' },
  { id: 'S', pc: 16, dano: '8d6', perfil: 'Lendária' },
];

// ── NATUREZAS DE CHAKRA (Cap. 07) ─────────────────────────────────

const NATUREZAS_AVDF = [
  { id: 'katon',  nome: 'Katon',  trad: 'Fogo',  cor: '#e05a2b' },
  { id: 'suiton', nome: 'Suiton', trad: 'Água',  cor: '#3a86c8' },
  { id: 'futon',  nome: 'Fūton',  trad: 'Vento', cor: '#6fc48a' },
  { id: 'raiton', nome: 'Raiton', trad: 'Raio',  cor: '#e8c23a' },
  { id: 'doton',  nome: 'Doton',  trad: 'Terra', cor: '#a07a4e' },
];

// ── CONDIÇÕES ──────────────────────────────────────────
//  Moraram aqui até a remodelação da ficha. Agora estão em dados.js,
//  junto das outras tabelas de regra, com os efeitos mecânicos que a
//  ficha aplica sozinha.

// ── VÍNCULO DE EQUIPE / KIZUNA (Cap. 05) ──────────────────────────
//  O medidor coletivo da mesa, de 0 a 10. Começa em 2 numa campanha
//  nova. É o análogo estrutural da Tensão do Fractured — mesma forma,
//  regra oposta: a Tensão sobe contra o grupo, o Vínculo a favor.

const VINCULO_GANHOS = [
  { v: +1, quando: 'Concluir uma missão sem que ninguém do time caia a 0 PV' },
  { v: +1, quando: 'Um personagem arrisca a própria vida por outro do time' },
  { v: +1, quando: 'Uma cena em que dois vínculos escritos na ficha são explorados a sério' },
  { v: +2, quando: 'Sobreviver juntos a uma missão de rank acima do rank do time' },
  { v: -2, quando: 'Um personagem abandona o time em uma cena decisiva' },
];

const VINCULO_GASTOS = [
  { nome: 'Ataque Combinado',         custo: 1, efeito: 'Dois personagens atacam o mesmo alvo no mesmo turno: ambos com Vantagem e dano somado antes de qualquer redução.' },
  { nome: 'Cobertura Perfeita',       custo: 1, efeito: 'Um aliado toma o lugar de outro sem gastar reação, e reduz o dano recebido pela metade.' },
  { nome: 'Leitura de Time',          custo: 1, efeito: 'Todo o time age imediatamente após o personagem atual, reordenando a iniciativa por uma rodada.' },
  { nome: 'Formação',                 custo: 2, efeito: 'Executa uma Técnica de Formação de clã ou de treino. Requer que os participantes a conheçam.' },
  { nome: 'Não Vamos Perder Ninguém', custo: 3, efeito: 'Um aliado que caiu a 0 PV se estabiliza e volta com PV igual ao valor atual do Vínculo.' },
];

// ── ZONAS DE DISTÂNCIA (Fast Play, cap. 2) ────────────────────────
//  "Não existe grade nem fita métrica." O campo é dividido em zonas e
//  o mestre diz em qual cada um está.

const ZONAS_AVDF = [
  { id: 'contato', nome: 'Contato', dist: '0–2 m',  oque: 'Taijutsu, espadas, agarrões e técnicas de toque.' },
  { id: 'curta',   nome: 'Curta',   dist: '~10 m',  oque: 'Kunais, shurikens e a maior parte das técnicas elementais.' },
  { id: 'media',   nome: 'Média',   dist: '~30 m',  oque: 'Projéteis, técnicas de área, fio ninja. O alcance padrão.' },
  { id: 'longa',   nome: 'Longa',   dist: '~100 m', oque: 'Poucas técnicas chegam aqui. Senbon de precisão, olhos treinados.' },
];


// ══════════════════════════════════════════════════════════════════
//  LINHAGEM — KEKKEI GENKAI E KEKKEI TŌTA (Cap. 07)
//
//  "Duas naturezas moldadas simultaneamente produzem uma terceira,
//  exclusiva de linhagem. Três ao mesmo tempo produzem um Kekkei Tōta,
//  muito mais raro. Nenhuma pode ser treinada — ou você nasce com ela,
//  ou recebe um transplante."
//
//  Repare que nem toda Kekkei Genkai é elemental. Bakuton e Shōton são
//  linhagem própria, Enton deriva do Mangekyō, e as do corpo (Sharingan,
//  Byakugan, Shikotsumyaku) vêm do clã, não de uma combinação. Por isso
//  a ficha separa os TIPOS em vez de tratar tudo como "um elemento a
//  mais" — foi exatamente esse o buraco da primeira versão.
// ══════════════════════════════════════════════════════════════════

const KEKKEI_GENKAI_AVDF = [
  { id: 'hyoton',  nome: 'Hyōton',  trad: 'Gelo',       tipo: 'elemental',
    composicao: ['suiton', 'futon'],  portadores: 'Clã Yuki — Haku' },
  { id: 'mokuton', nome: 'Mokuton', trad: 'Madeira',    tipo: 'elemental',
    composicao: ['suiton', 'doton'],  portadores: 'Hashirama Senju; Yamato (implante)' },
  { id: 'yoton',   nome: 'Yōton',   trad: 'Lava',       tipo: 'elemental',
    composicao: ['katon', 'doton'],   portadores: 'Mei Terumī, Rōshi, Han' },
  { id: 'ranton',  nome: 'Ranton',  trad: 'Tempestade', tipo: 'elemental',
    composicao: ['raiton', 'suiton'], portadores: 'Darui de Kumogakure' },
  { id: 'jiton',   nome: 'Jiton',   trad: 'Magnetismo', tipo: 'elemental',
    composicao: ['futon', 'doton'],   portadores: 'Terceiro Kazekage' },
  { id: 'futton',  nome: 'Futton',  trad: 'Vapor',      tipo: 'elemental',
    composicao: ['katon', 'suiton'],  portadores: 'Raro; associado a Kirigakure' },

  { id: 'bakuton', nome: 'Bakuton', trad: 'Explosão',   tipo: 'propria',
    composicao: null, portadores: 'Deidara de Iwagakure' },
  { id: 'shoton',  nome: 'Shōton',  trad: 'Cristal',    tipo: 'propria',
    composicao: null, portadores: 'Guren' },
  { id: 'enton',   nome: 'Enton',   trad: 'Chama Negra', tipo: 'derivada',
    composicao: null, portadores: 'Sasuke Uchiha — exige Amaterasu',
    exige: 'Derivado do Mangekyō' },

  { id: 'jinton',  nome: 'Jinton',  trad: 'Pó',         tipo: 'tota',
    composicao: ['doton', 'futon', 'katon'], portadores: 'Mū e Ōnoki de Iwagakure' },
];

//  As linhagens que são do CORPO, não de elemento: dōjutsu e traços de
//  esqueleto/sangue. Vêm do clã e por isso não estão na tabela do Cap. 07.
//  Enquanto o Compêndio não estiver todo cadastrado, isto fica como uma
//  lista de partida — dá para escrever qualquer outra à mão.
const LINHAGENS_CORPO_AVDF = [
  { id: 'sharingan',      nome: 'Sharingan',       cla: 'Uchiha',  tipo: 'dojutsu' },
  { id: 'mangekyo',       nome: 'Mangekyō Sharingan', cla: 'Uchiha', tipo: 'dojutsu' },
  { id: 'byakugan',       nome: 'Byakugan',        cla: 'Hyūga',   tipo: 'dojutsu' },
  { id: 'ketsuryugan',    nome: 'Ketsuryūgan',     cla: 'Chinoike', tipo: 'dojutsu' },
  { id: 'shikotsumyaku',  nome: 'Shikotsumyaku',   cla: 'Kaguya',  tipo: 'corpo' },
];

const KG_ORIGENS = [
  { id: 'nascimento',  nome: 'De nascimento',
    obs: 'A linhagem é sua por sangue.' },
  { id: 'transplante', nome: 'Transplante',
    obs: 'Cirurgia ilegal, com consequências permanentes (Cap. 28). Combine com o Mestre.' },
];


// ══════════════════════════════════════════════════════════════════
//  CLÃS (Livro V — Compêndio dos Clãs)
//
//  Cada clã tem uma PASSIVA sempre ativa e uma PROGRESSÃO DE CINCO
//  ESTÁGIOS. Cada estágio custa PT, exige um rank mínimo e — mais
//  importante — exige um MARCO NARRATIVO: uma cena que aconteceu na
//  mesa. "PT é só a contabilidade. Um marco bom acontece em cena e não
//  em resumo, custa alguma coisa ao personagem, e envolve pelo menos um
//  PNJ do clã com nome e opinião própria."
//
//  REGRA DO ESTÁGIO I GRATUITO: todo personagem começa a campanha com o
//  Estágio I já desbloqueado, sem custo em PT. Não é conquista de
//  campanha — é o rito de infância.
//
//  O catálogo abaixo está sendo preenchido a partir do Compêndio. O que
//  está aqui foi transcrito do livro, não resumido.
// ══════════════════════════════════════════════════════════════════

const CLAS_AVDF = [
  {
    id: 'uchiha', nome: 'Uchiha', vila: 'Konohagakure', kanji: '団扇',
    lema: 'O clã cujo amor, quando perdido, vira poder — e cuja glória sempre custou alguém.',
    passiva: {
      nome: 'Chama Interior',
      efeito: 'Você domina Katon de graça mesmo que sua afinidade seja outra, aprende técnicas Katon por 1 PT a menos, e tem Vantagem em testes para reconhecer, identificar ou reproduzir de memória qualquer técnica, selo ou sequência de movimentos que já tenha visto executar.',
    },
    linhagem: 'sharingan',
    estagios: [
      { n: 'I',   nome: 'Iniciação', rank: 'genin',  pt: 0,
        marco: 'Executar o Gōkakyū diante de um parente mais velho — o rito que marca a maioridade Uchiha.',
        destrava: 'Gōkakyū e (opcional) o Sharingan de Um Tomoe: Ação Menor, 2 PC/rd, Vantagem em Percepção e contra genjutsu, +2 Defesa.' },
      { n: 'II',  nome: 'Herança',  rank: 'genin',  pt: 6,
        marco: 'Sobreviver a um combate em que você deveria ter morrido. O olho amadurece sob risco, não sob treino.',
        destrava: 'Dois Tomoe. Previsão: o primeiro ataque de cada inimigo em cada rodada tem Desvantagem, e você ganha +3 em Esquiva.' },
      { n: 'III', nome: 'Maestria', rank: 'chunin', pt: 8,
        marco: 'Escolher entre lealdade ao clã e à vila, numa cena onde as duas se excluem.',
        destrava: 'Três Tomoe. Cópia de técnicas, hipnose por contato visual, Vantagem para interromper jutsus.' },
      { n: 'IV',  nome: 'Segredo',  rank: 'jonin',  pt: 12,
        marco: 'Perder alguém que você amava — e ser, de algum modo, responsável. Não é negociável.',
        destrava: 'Mangekyō Sharingan. Uma técnica à escolha: Amaterasu, Tsukuyomi, Susanoo ou Kamui.' },
      { n: 'V',   nome: 'Legado',   rank: 'anbu',   pt: 18,
        marco: 'Marco de História: transplantar os olhos Mangekyō de um irmão de sangue.',
        destrava: 'Mangekyō Eterno. Remove a Cegueira acumulada e destrava uma segunda técnica Mangekyō.' },
    ],
    regraOpcional: {
      nome: 'O rito e o olho são coisas diferentes',
      texto: 'O Uchiha começa conhecendo o Gōkakyū e portando a Passiva; o Sharingan fica bloqueado até um momento narrativo à altura (perigo de morte, perda, virada emocional). Enquanto bloqueado: um jutsu comum extra e +1 PT por missão. O despertar não custa PT e não exige o marco do Estágio II — o despertar é o marco. Recomendada para campanhas que começam no rank Genin.',
    },

    //  Técnicas que ninguém fora do clã aprende. Cada uma pertence a um
    //  Estágio e só fica disponível quando aquele Estágio é destravado.
    tecnicas: [
      { nome: 'Gōkakyū no Jutsu',      rk: 'D', pc: 2,  est: 'I',
        efeito: 'O rito do clã. Esfera flamejante numa zona a Curta/Média: 1d6+NIN a todos, atingidos ficam Queimando.' },
      { nome: 'Hōsenka: Tsumabeni',    rk: 'C', pc: 4,  est: 'I',
        efeito: 'Rajada de chamas com shurikens escondidos. 2d6+NIN entre três alvos; quem esquiva do fogo enfrenta um projétil (1d6+TAI) inesquivável.' },
      { nome: 'Uchiha Gaeshi',         rk: 'C', pc: 4,  est: 'II',
        efeito: 'Reação. Desvia um ataque físico com a lâmina e o devolve: anula o dano e causa 2d6+TAI ao atacante. Exige Sharingan e estar armado.' },
      { nome: 'Katon: Ryūka no Jutsu', rk: 'C', pc: 4,  est: 'II',
        efeito: 'Chama que percorre um fio ninja. Contra alvo Preso por fio, acerta automaticamente e é crítico.' },
      { nome: 'Sharingan: Kopī (Cópia)', rk: 'C', pc: 4, est: 'III',
        efeito: 'Após ver uma técnica executada até o fim, aprenda-a ignorando o Selo do Mestre, pagando PT normal. Não ignora o Selo de Sangue.' },
      { nome: 'Magen: Sharingan',      rk: 'B', pc: 7,  est: 'III',
        efeito: 'Genjutsu por contato visual, Ação Menor, profundidade 2. Pode plantar uma ordem que o alvo executa na rodada seguinte.' },
      { nome: 'Katon: Gōryūka no Jutsu', rk: 'A', pc: 11, est: 'III',
        efeito: 'Vários dragões de fogo: 5d6+NIN, até três alvos ou uma zona. Com outro Uchiha, +2d6 por participante.' },
      { nome: 'Amaterasu',             rk: 'S', pc: 16, est: 'IV', cegueira: 1,
        efeito: 'Chamas negras onde o olho mira, acerto automático. 8d6 no impacto e 3d6/rd até consumir. Cada uso: 1d6 e sangramento ocular.' },
      { nome: 'Tsukuyomi',             rk: 'S', pc: 16, est: 'IV', cegueira: 1,
        efeito: 'Genjutsu absoluto, contato visual, GEN +5. 72h subjetivas num segundo real; o alvo fica inconsciente e sofre Trauma Craniano.' },
      { nome: 'Susanoo',               rk: 'S', pc: '16+6/rd', est: 'IV', cegueira: 1,
        efeito: 'Avatar de chakra. Estágios: costelas (red. 10) → torso (red. 20, 6d6) → armadura (red. 30, 8d6) → Completo (invocação Colossal).' },
      { nome: 'Enton: Kagutsuchi',     rk: 'S', pc: 16, est: 'V', cegueira: 1,
        efeito: 'Molda o Amaterasu em lanças, redes, armadura sobre o Susanoo. Requer conhecer Amaterasu.' },
      { nome: 'Izanagi',               rk: 'S', pc: 16, est: 'V', kinjutsu: true,
        efeito: 'Por 3 rodadas tudo o que acontece com você vira ilusão: anule dano ou morte retroativamente. O olho usado fica cego. Uso único por olho.' },
    ],

    //  A trava que impede o Sharingan de dominar a campanha. Fica na
    //  ficha porque o livro pede que o jogador diga o número em voz alta
    //  ao gastar — e para isso ele precisa estar visível.
    trilhaPropria: {
      id: 'cegueira', nome: 'Cegueira', max: 20,
      dica: 'Cada uso de técnica Mangekyō acumula 1. A cada 5 pontos, −1 em todo teste visual e −1 de Defesa, cumulativos. Aos 20, cegueira permanente. Só o Mangekyō Eterno reverte.',
    },
  },
];

//  Sem clã é uma escolha legítima do livro, não a ausência de uma.
const NINJA_COMUM = {
  id: 'comum', nome: 'Ninja Comum', vila: '—',
  lema: 'Sem linhagem, sem teto: Naruto, Sakura, Rock Lee e Guy começaram aqui.',
  passiva: {
    nome: 'Sem Amarras',
    efeito: '+3 pontos de atributo na criação (limite +4), uma perícia treinada extra, um jutsu comum extra e um talento à escolha (valor 6 PT). Aprende jutsus fora da natureza afim por 1 PT a menos. No rank Chūnin, ganha uma segunda perícia Especialista de graça.',
  },
  linhagem: null,
  estagios: [],
};

// ══════════════════════════════════════════════════════════════════
//  TODOS OS CLÃS, NUMA LISTA SÓ
//
//  O Uchiha foi transcrito primeiro e ficou aqui em cima. Os outros 29
//  vieram depois, do Compêndio dos Clãs, e moram em `clas-konoha.js` e
//  `clas-mundo.js` — dois arquivos separados porque juntos passariam de
//  1900 linhas e ninguém acha nada num arquivo desses.
//
//  Os dois lotes usam nomes de campo um pouco diferentes (`vila` x
//  `regiao`, `linhagem` x `kg`, `rk`/`est` x `rank`/`estagio`). Em vez
//  de reescrever 30 clãs à mão — e arriscar errar num —, a diferença é
//  aplainada aqui, uma vez, na primeira consulta.
// ══════════════════════════════════════════════════════════════════

//  Deixa qualquer clã na mesma forma, venha do lote que vier.
function _normalizarCla(c) {
  const a = c.ajustes || {};
  //  `ajustes` veio em duas formas: solta (`pv: 5`) e aninhada
  //  (`recursos: { pv: 12 }`). As duas passam a valer o mesmo.
  const rec = { ...(a.recursos || {}) };
  ['pv', 'pc', 'pvf', 'pcPct', 'pcMultiplicador'].forEach(k => {
    if (a[k] != null && rec[k] == null) rec[k] = a[k];
  });
  return {
    ...c,
    vila:     c.vila || c.regiao || '',
    linhagem: c.linhagem ?? c.kg ?? null,
    estagios: (c.estagios || []).map(e => ({ ...e, n: e.n })),
    tecnicas: (c.tecnicas || []).map(t => ({
      ...t,
      rk:  t.rk  ?? t.rank,
      est: t.est ?? t.estagio,
    })),
    ajustes: { ...a, recursos: rec },
  };
}

let _clasTodos = null;

function clasAvdf() {
  if (_clasTodos) return _clasTodos;
  const lotes = [CLAS_AVDF];
  //  Os arquivos extras podem não estar carregados (uma instalação que
  //  não copiou os dois novos). A ficha continua funcionando com o que
  //  existir, em vez de quebrar inteira.
  if (typeof CLAS_KONOHA_AVDF !== 'undefined') lotes.push(CLAS_KONOHA_AVDF);
  if (typeof CLAS_MUNDO_AVDF  !== 'undefined') lotes.push(CLAS_MUNDO_AVDF);
  _clasTodos = lotes.flat().map(_normalizarCla)
    .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  return _clasTodos;
}

//  Agrupados pela região, que é como o Compêndio os apresenta e como a
//  pessoa procura ("o clã é de Konoha ou de fora?").
function clasAvdfPorRegiao(soJogaveis) {
  const grupos = {};
  clasAvdf().filter(c => !soJogaveis || c.jogavel !== false).forEach(c => {
    const r = c.vila || 'Sem vila';
    (grupos[r] = grupos[r] || []).push(c);
  });
  return grupos;
}

function claAvdf(id) {
  if (id === 'comum') return NINJA_COMUM;
  return clasAvdf().find(c => c.id === id) || null;
}

function kekkeiGenkaiAvdf(id) {
  return KEKKEI_GENKAI_AVDF.find(k => k.id === id)
      || LINHAGENS_CORPO_AVDF.find(k => k.id === id) || null;
}


// ── PONTOS DE TREINO (PT) ────────────────────────────────
//  A tabela de custos mora em dados.js. Ficava aqui numa versão
//  resumida e já desatualizada — o estágio de clã custava 8 fixo, e
//  o valor certo é a escala 6/8/12/18 do Compêndio.

//  Categorias e acessos, para os campos da técnica na ficha (Cap. 08 e 09).
const TECNICA_CATEGORIAS = ['Ofensiva', 'Defensiva', 'Suplementar', 'Controle', 'Sensorial', 'Sustentada'];
const TECNICA_ACESSOS    = ['Livre', 'Restrito', 'Hiden', 'Kekkei Genkai', 'Kinjutsu', 'Ōgi'];
const TECNICA_ALCANCES   = ['—', 'Contato', 'Curta', 'Média', 'Longa', 'Extrema'];
