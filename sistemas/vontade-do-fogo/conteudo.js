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

// ── CONDIÇÕES (Fast Play, cap. 5) ─────────────────────────────────
//  As dez da tabela do livro, mais Morrendo — que não está na tabela
//  de condições, mas é o estado a 0 PV e o combate precisa marcá-lo.

const CONDICOES_AVDF = [
  { nome: 'Atordoado',   icone: '💫', efeito: 'Perde a Ação Principal. Mantém movimento e Reação. Sai no fim do próximo turno.' },
  { nome: 'Preso',       icone: '🔒', efeito: 'Não se move. Ataques contra você têm Vantagem. Não pode Esquivar.' },
  { nome: 'Caído',       icone: '🡇', efeito: 'Desvantagem nos seus ataques. Corpo a corpo contra você tem Vantagem; à distância, Desvantagem.' },
  { nome: 'Cego',        icone: '🌑', efeito: 'Desvantagem em tudo que dependa de visão — e imune a ilusões visuais.' },
  { nome: 'Selado',      icone: '🚫', efeito: 'Não usa chakra: sem técnicas, sem Substituição. Teste de CTR no fim de cada turno.' },
  { nome: 'Envenenado',  icone: '🧪', efeito: '1d6 no fim de cada turno e Desvantagem em testes de COR.' },
  { nome: 'Queimando',   icone: '🔥', efeito: '1d6 no fim de cada turno. Ação Principal para apagar, ou água.' },
  { nome: 'Sob Ilusão',  icone: '🌀', efeito: 'Percebe uma realidade falsa e age conforme ela. Sai com teste de ESP, ajuda de aliado ou dor.' },
  { nome: 'Ferido',      icone: '🩸', efeito: 'Automático abaixo de metade dos PV. Desvantagem em testes de COR.' },
  { nome: 'Sem Chakra',  icone: '💤', efeito: '0 PC. Sem técnicas. Desvantagem em CTR e NIN. Defesa −2.' },
  { nome: 'Morrendo',    icone: '☠', efeito: 'A 0 PV: inconsciente. Teste de Morte d20+COR CD 10 no início do turno. 3 sucessos estabiliza, 3 falhas mata.' },
];

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
