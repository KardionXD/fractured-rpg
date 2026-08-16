// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — CATÁLOGO DE EQUIPAMENTO
//
//  Transcrição literal das três tabelas de equipamento do Livro do
//  Jogador (capítulo de Economia e Equipamento):
//
//    · ARMA / FERRAMENTA  PREÇO  EFEITO
//    · CONSUMÍVEL         PREÇO  EFEITO
//    · VESTUÁRIO          FONTE  EFEITO
//
//  Mais os itens do Kit Shinobi Padrão (Passo 7 da criação), que é o
//  equipamento inicial de todo ninja:
//
//    "bandana da vila, 10 kunais, 20 shurikens, 3 selos explosivos,
//     15 m de fio ninja, 2 pergaminhos de armazenamento, kit de
//     primeiros socorros, rações para uma semana e 3.000 ryō."
//
//  Os 3.000 ryō do kit são dinheiro, não item, e por isso não têm
//  entrada própria nesta lista.
//
//  Abertura da seção, palavra do livro: "O ryō é a moeda do
//  continente. Ferramentas ninja são baratas; o que custa caro é
//  informação, veneno e qualquer coisa que envolva fūinjutsu."
//
//  REGRA DESTE ARQUIVO: nada aqui é invenção. Todo texto de `efeito`,
//  `preco`, `dano` e afins é cópia do livro, corrigida apenas na
//  junção de palavras que a extração do PDF comeu ("AçãoMenor" →
//  "Ação Menor"). O ÚNICO campo escolhido por quem transcreveu é o
//  `icone`. Onde o livro não diz, o campo é `null` e há um comentário
//  "FALTA NO TEXTO".
//
//  Campos extras que aparecem quando o livro dá o dado:
//    requisito · regraEspecial · doses · embalagem · reducaoDano
//    alcanceZona (vem da tabela ZONAS DE DISTÂNCIA, não da linha do
//    item — está sempre anotado quando é o caso) · duracao
// ══════════════════════════════════════════════════════════════════

//  Referências cruzadas usadas abaixo, também do livro:
//
//  TIPO DE ATAQUE (tabela de combate):
//    Corpo a corpo desarmado ......... acerto TAI · 1d6 + TAI
//    Arma branca (kunai, tantō, espada) acerto TAI · 1d6 + TAI
//                                      (+1 se for uma arma grande)
//    Arma arremessada ................ acerto TAI · 1d6 + TAI,
//                                      alcance Curta/Média
//    Rajada de shurikens ............. acerto TAI · 1d4 + TAI contra
//                                      até 3 alvos na mesma zona
//
//  ZONAS DE DISTÂNCIA:
//    Contato 0–2 m · Curta ~10 m (kunais, shurikens) ·
//    Média ~30 m (jutsus de projétil e área, arcos, fio ninja) ·
//    Longa ~100 m (senbon de precisão, Byakugan, rank A+) ·
//    Extrema além.
//    "Atacar uma zona além do alcance impõe Desvantagem; duas além
//     é impossível."

const ITENS_AVDF = [

  // ── ARMA / FERRAMENTA ───────────────────────────────────────────

  {
    id: 'kunai',
    nome: 'Kunai',
    categoria: 'arma',
    preco: 50,
    precoTexto: '50 ryō',
    dano: '1d6+TAI',
    alcance: 'Corpo a corpo ou arremesso',
    alcanceZona: 'Curta ~10 m',   // da tabela ZONAS DE DISTÂNCIA, não da linha do item
    efeito: '1d6+TAI. Corpo a corpo ou arremesso. Aceita selo explosivo amarrado.',
    kit: true,
    qtdKit: 10,
    icone: '🗡️',
  },

  {
    id: 'shuriken',
    nome: 'Shuriken (×10)',
    categoria: 'arma',
    preco: 100,
    precoTexto: '100 ryō',
    dano: '1d4+TAI',
    alcance: null,                // FALTA NO TEXTO: a linha do item não dá alcance
    alcanceZona: 'Curta ~10 m',   // da tabela ZONAS DE DISTÂNCIA
    efeito: '1d4+TAI, até três alvos na mesma zona.',
    embalagem: '×10',
    kit: true,
    qtdKit: 20,                   // o Kit Shinobi Padrão diz "20 shurikens"; a tabela vende em pacotes de 10
    icone: '✴️',
  },

  {
    id: 'fuma_shuriken',
    nome: 'Fūma Shuriken',
    categoria: 'arma',
    preco: 2000,
    precoTexto: '2.000 ryō',
    dano: '2d6+TAI',
    alcance: 'Média',
    efeito: '2d6+TAI a Média, atinge todos em linha. Dobrável.',
    regraEspecial: 'Atinge todos em linha. Dobrável.',
    kit: false,
    icone: '❇️',
  },

  {
    id: 'senbon',
    nome: 'Senbon (×20)',
    categoria: 'arma',
    preco: 150,
    precoTexto: '150 ryō',
    dano: '1d4+TAI',
    alcance: null,                // FALTA NO TEXTO: a linha do item não dá alcance
    alcanceZona: 'Longa ~100 m (senbon de precisão)',  // da tabela ZONAS DE DISTÂNCIA
    efeito: '1d4+TAI. Com Medicina, mira pontos vitais: troca dano por Atordoado ou paralisia.',
    regraEspecial: 'Com Medicina, mira pontos vitais: troca dano por Atordoado ou paralisia.',
    embalagem: '×20',
    kit: false,
    icone: '📍',
  },

  {
    id: 'tanto',
    nome: 'Tantō / espada curta',
    categoria: 'arma',
    preco: 1500,
    precoTexto: '1.500 ryō',
    dano: '1d6+TAI',
    alcance: null,                // FALTA NO TEXTO
    efeito: '1d6+TAI. Aceita Chakra Nagashi.',
    kit: false,
    icone: '🔪',
  },

  {
    id: 'espada_longa',
    nome: 'Espada longa / ōdachi',
    categoria: 'arma',
    preco: 4000,
    precoTexto: '4.000 ryō',
    dano: '1d8+TAI',
    alcance: null,                // FALTA NO TEXTO
    efeito: '1d8+TAI. Exige Bukijutsu treinado.',
    requisito: 'Bukijutsu treinado',
    kit: false,
    icone: '⚔️',
  },

  {
    id: 'facas_de_chakra',
    nome: 'Facas de chakra',
    categoria: 'arma',
    preco: 8000,
    precoTexto: '8.000 ryō',
    dano: '1d6+TAI',
    alcance: null,                // FALTA NO TEXTO
    efeito: '1d6+TAI, e Chakra Nagashi custa Ação Menor gratuita.',
    regraEspecial: 'Chakra Nagashi custa Ação Menor gratuita.',
    kit: false,
    icone: '⚡',
  },

  {
    id: 'leque_de_guerra',
    nome: 'Leque de guerra',
    categoria: 'arma',
    preco: 6000,
    precoTexto: '6.000 ryō',
    dano: null,                   // FALTA NO TEXTO: o livro só diz que cada "lua" aberta adiciona 1d6
    alcance: null,                // FALTA NO TEXTO
    efeito: 'Requisito para Kamaitachi. Cada "lua" aberta adiciona 1d6, até um máximo de três luas.',
    regraEspecial: 'Cada "lua" aberta adiciona 1d6, até um máximo de três luas.',
    requisitoPara: 'Kamaitachi',
    kit: false,
    icone: '🪭',
  },

  {
    id: 'fio_ninja',
    nome: 'Fio ninja (15 m)',
    categoria: 'ferramenta',
    preco: 100,
    precoTexto: '100 ryō',
    dano: null,
    alcance: null,                // FALTA NO TEXTO na linha do item
    alcanceZona: 'Média ~30 m',   // da tabela ZONAS DE DISTÂNCIA
    efeito: 'Armadilhas, guiar projéteis, prender alvos. Combina com Katon.',
    kit: true,
    qtdKit: 1,                    // o Kit Shinobi Padrão diz "15 m de fio ninja", que é exatamente uma unidade desta linha
    icone: '🕸️',
  },

  // ── CONSUMÍVEL ──────────────────────────────────────────────────

  {
    id: 'selo_explosivo',
    nome: 'Selo explosivo',
    categoria: 'consumivel',
    preco: 400,
    precoTexto: '400 ryō',
    dano: '2d6',
    alcance: null,                // FALTA NO TEXTO
    efeito: '2d6 em uma zona; teste de COR CD 13 reduz à metade. Detona por tempo, gatilho, selo de mão ou fogo. Funciona sob chuva.',
    regraEspecial: 'Detona por tempo, gatilho, selo de mão ou fogo. Funciona sob chuva.',
    teste: 'COR CD 13 reduz à metade',
    kit: true,
    qtdKit: 3,
    icone: '💥',
  },

  {
    id: 'bomba_de_fumaca',
    nome: 'Bomba de fumaça',
    categoria: 'consumivel',
    preco: 200,
    precoTexto: '200 ryō',
    dano: null,
    alcance: null,                // FALTA NO TEXTO
    efeito: 'Cobre uma zona: Desvantagem em ataques e Percepção. Permite Retirada Tática gratuita.',
    kit: false,
    icone: '💨',
  },

  {
    id: 'pilula_de_soldado',
    nome: 'Pílula de soldado',
    categoria: 'consumivel',
    preco: 1000,
    precoTexto: '1.000 ryō',
    dano: null,
    alcance: null,
    efeito: 'Ação Menor. Recupera 10 PC. A segunda no dia causa 1 nível de Exaustão; a terceira, 3.',
    custoAcao: 'Ação Menor',
    regraEspecial: 'A segunda no dia causa 1 nível de Exaustão; a terceira, 3.',
    kit: false,
    icone: '💊',
  },

  {
    id: 'pilulas_akimichi',
    nome: 'Pílulas Akimichi (Hiden)',
    categoria: 'consumivel',
    preco: null,                  // o livro põe "Hiden" na coluna PREÇO: não se compra
    precoTexto: 'Hiden',
    dano: null,
    alcance: null,
    efeito: 'Verde dobra o dano de taijutsu; Amarela dá +3 TAI/COR; Vermelha destrava o Modo Borboleta e mata em uma hora.',
    kit: false,
    icone: '🍬',
  },

  {
    id: 'veneno_de_suna',
    nome: 'Veneno de Suna',
    categoria: 'consumivel',
    preco: 5000,
    precoTexto: '5.000 ryō',
    dano: '2d6/rodada',
    alcance: null,
    efeito: 'Aplica Envenenado (CD 18), 2d6/rodada. Três doses.',
    condicao: 'Envenenado (CD 18)',
    doses: 3,
    kit: false,
    icone: '☠️',
  },

  {
    id: 'papel_de_chakra',
    nome: 'Papel de chakra',
    categoria: 'consumivel',
    preco: 300,
    precoTexto: '300 ryō',
    dano: null,
    alcance: null,
    efeito: 'Revela a natureza de chakra de quem o segurar.',
    kit: false,
    icone: '📄',
  },

  {
    id: 'pergaminho_de_selamento',
    nome: 'Pílula / pergaminho de selamento',
    categoria: 'consumivel',      // está na tabela CONSUMÍVEL, embora o livro diga "Reutilizável"
    preco: 600,
    precoTexto: '600 ryō',
    dano: null,
    alcance: null,
    efeito: 'Armazena o equivalente a um baú. Reutilizável.',
    // O Kit Shinobi Padrão lista "2 pergaminhos de armazenamento". O livro
    // não afirma em nenhum ponto que são a mesma coisa que este item; a
    // ligação foi feita pelo nome. Se a mesa discordar, é aqui que muda.
    kit: true,
    qtdKit: 2,
    icone: '📜',
  },

  // ── VESTUÁRIO ───────────────────────────────────────────────────
  //  Nesta tabela a coluna não é PREÇO, é FONTE.

  {
    id: 'colete_chunin_jonin',
    nome: 'Colete Chūnin/Jōnin',
    categoria: 'vestuario',
    preco: null,                  // não se compra: a coluna FONTE diz "emitido"
    precoTexto: 'emitido',
    dano: null,
    alcance: null,
    efeito: 'Reduz dano físico em 2. Múltiplos bolsos selados (saque como ação livre).',
    reducaoDano: 2,
    kit: false,
    icone: '🦺',
  },

  {
    id: 'armadura_anbu',
    nome: 'Armadura ANBU',
    categoria: 'vestuario',
    preco: null,                  // coluna FONTE: "emitida"
    precoTexto: 'emitida',
    dano: null,
    alcance: null,
    efeito: 'Reduz dano físico em 4. Protetores de braço metálicos que servem para bloquear.',
    reducaoDano: 4,
    kit: false,
    icone: '🛡️',
  },

  {
    id: 'mascara_anbu',
    nome: 'Máscara ANBU',
    categoria: 'vestuario',
    preco: null,                  // coluna FONTE: "emitida"
    precoTexto: 'emitida',
    dano: null,
    alcance: null,
    efeito: 'Oculta identidade. Vantagem em Intimidação; ninguém lê sua expressão.',
    kit: false,
    icone: '🎭',
  },

  {
    id: 'pesos_de_treino',
    nome: 'Pesos de treino',
    categoria: 'vestuario',
    preco: 2000,
    precoTexto: '2.000 ryō',
    dano: null,
    alcance: null,
    efeito: 'Desvantagem em COR enquanto usados; ao remover, +1 em COR pelo combate. Só se usados por meses, e uma vez por dia.',
    requisito: 'Usados por meses',
    regraEspecial: 'Uma vez por dia.',
    kit: false,
    icone: '🏋️',
  },

  // ── ITENS DO KIT SHINOBI PADRÃO SEM LINHA NAS TABELAS ───────────
  //  O livro só os cita na frase do Passo 7 da criação. Não há preço,
  //  efeito nem regra publicada para nenhum dos três.

  {
    id: 'bandana',
    nome: 'Bandana da vila',
    categoria: 'vestuario',       // categoria inferida: o livro não classifica o item, só o cita no kit
    preco: null,                  // FALTA NO TEXTO: nenhuma tabela dá preço da bandana
    precoTexto: null,             // FALTA NO TEXTO
    dano: null,
    alcance: null,
    efeito: null,                 // FALTA NO TEXTO: nenhum efeito mecânico publicado
    kit: true,
    qtdKit: 1,
    icone: '🎗️',
  },

  {
    id: 'kit_primeiros_socorros',
    nome: 'Kit de primeiros socorros',
    categoria: 'ferramenta',      // categoria inferida: o livro não classifica o item, só o cita no kit
    preco: null,                  // FALTA NO TEXTO
    precoTexto: null,             // FALTA NO TEXTO
    dano: null,
    alcance: null,
    efeito: null,                 // FALTA NO TEXTO: nenhum efeito mecânico publicado
    // A perícia Medicina (CTR) cobre "primeiros socorros, diagnóstico,
    // venenos e antídotos, cirurgia" — o livro não liga a perícia a este item.
    kit: true,
    qtdKit: 1,
    icone: '🩹',
  },

  {
    id: 'racoes',
    nome: 'Rações para uma semana',
    categoria: 'consumivel',      // categoria inferida: o livro não classifica o item, só o cita no kit
    preco: null,                  // FALTA NO TEXTO
    precoTexto: null,             // FALTA NO TEXTO
    dano: null,
    alcance: null,
    efeito: null,                 // FALTA NO TEXTO: nenhum efeito mecânico publicado
    duracao: 'uma semana',
    kit: true,
    qtdKit: 1,
    icone: '🍙',
  },

];

// ── BUSCA ─────────────────────────────────────────────────────────
//  Acha um item pelo id ou pelo nome, ignorando acento, maiúscula e
//  pontuação: itemAvdf('Fūma Shuriken'), itemAvdf('fuma_shuriken') e
//  itemAvdf('FUMA SHURIKEN') devolvem o mesmo objeto.

function avdfChaveItem(texto) {
  return String(texto == null ? '' : texto)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

//  A busca precisa ser tolerante porque o Kit Shinobi e a tabela de
//  preços chamam a mesma coisa de dois jeitos: o kit diz "Shuriken",
//  "Fio ninja" e "Rações"; a tabela diz "Shuriken (×10)", "Fio ninja
//  (15 m)" e "Rações para uma semana". Sem isso, quatro dos oito itens
//  iniciais abriam sem ficha nenhuma.
//
//  A tolerância é só de FORMA (parênteses, quantidade, "para uma
//  semana"). Nada é casado por adivinhação: se dois nomes forem
//  realmente diferentes, o item fica sem ficha, e isso é o certo.
function _avdfNomeCurto(nome) {
  return avdfChaveItem(String(nome)
    .replace(/\([^)]*\)/g, '')                    // "(×10)", "(15 m)"
    .replace(/\bpara uma semana\b/gi, '')
    .replace(/\bx\s*\d+\b/gi, '')
    .trim());
}

function itemAvdf(idOuNome) {
  const chave = avdfChaveItem(idOuNome);
  if (!chave) return null;
  const exato = ITENS_AVDF.find(i => avdfChaveItem(i.id) === chave)
             || ITENS_AVDF.find(i => avdfChaveItem(i.nome) === chave);
  if (exato) return exato;

  const curto = _avdfNomeCurto(idOuNome);
  if (!curto) return null;
  return ITENS_AVDF.find(i => _avdfNomeCurto(i.nome) === curto) || null;
}

// ── ATALHOS ───────────────────────────────────────────────────────

//  Os itens que todo ninja começa tendo (Kit Shinobi Padrão).
//  Além destes, o kit inclui 3.000 ryō em dinheiro.
function kitShinobiAvdf() {
  return ITENS_AVDF.filter(i => i.kit === true);
}

function itensAvdfPorCategoria(categoria) {
  const chave = avdfChaveItem(categoria);
  return ITENS_AVDF.filter(i => avdfChaveItem(i.categoria) === chave);
}
