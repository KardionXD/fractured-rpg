// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — TABELAS DE REGRA
//
//  Tudo o que é tabela do sistema mora aqui, e só aqui. Nenhum número
//  destes pode aparecer escrito dentro de uma tela: quando o livro
//  mudar, muda este arquivo e a ficha inteira acompanha.
//
//  Fonte: Livro do Jogador (Livros I a III) e Compêndio dos Clãs.
//  Onde as duas fontes discordavam, a versão foi confirmada com o autor
//  — cada caso está anotado no ponto onde acontece.
// ══════════════════════════════════════════════════════════════════

// ── ORIGENS (Passo 1 da criação) ──────────────────────────────────
//  "Toda origem dá exatamente a mesma coisa: uma perícia treinada, um
//  Traço estreito que só funciona numa situação específica, e um Laço,
//  que é a alça pela qual o Mestre puxa a sua história. Origens não dão
//  poder de combate: elas dizem quem você era."
//
//  A ficha aplica a perícia sozinha. O Traço e o Laço entram como
//  texto na Alma — são gancho de história, não número.

const ORIGENS_AVDF = [
  { id: 'filho_cla', nome: 'Filho de Clã', pericia: 'Saber Shinobi',
    traco: { nome: 'Nome reconhecido',
      efeito: '1×/sessão, Vantagem num teste social diante de quem conheça seu clã.' },
    laco: 'As obrigações da família cobram, e o Mestre pode invocá-las na hora errada.' },

  { id: 'orfao_guerra', nome: 'Órfão de Guerra', pericia: 'Sobrevivência',
    traco: { nome: 'Já perdi tudo antes',
      efeito: '1×/sessão, role de novo um teste de Determinação que tenha falhado.' },
    laco: 'Você reconhece de longe quem lucrou com a guerra — e eles reconhecem você.' },

  { id: 'prodigio', nome: 'Prodígio da Academia', pericia: 'Estratégia',
    traco: { nome: 'Leitura de manual',
      efeito: '1×/sessão, gaste a Ação Menor para dar Vantagem a um aliado contra um inimigo que você já tenha Estudado.' },
    laco: 'Todos esperam demais de você, e alguém quer ver você falhar.' },

  { id: 'filho_civis', nome: 'Filho de Civis', pericia: 'Persuasão',
    traco: { nome: 'Sei pelo que luto',
      efeito: '1×/sessão, ao arriscar algo real por um civil ou por alguém de fora do time, recupere 1 Ponto de Vontade do Fogo.' },
    laco: 'Sua família não entende o que você virou.' },

  { id: 'herdeiro_missing', nome: 'Herdeiro de Missing-nin', pericia: 'Enganação',
    traco: { nome: 'O que me ensinaram nas sombras',
      efeito: 'Vantagem para reconhecer técnicas proibidas, selos falsificados e sinais de deserção.' },
    laco: 'Alguém sabe do seu sangue e um dia vem cobrar.' },

  { id: 'corpo_medico', nome: 'Criado pelo Corpo Médico', pericia: 'Medicina',
    traco: { nome: 'Mãos firmes',
      efeito: '1×/combate, estabilizar um aliado Morrendo custa Ação Menor em vez de Ação Principal.' },
    laco: 'Você sabe o nome de todos que não voltaram, e visita as famílias.' },

  { id: 'ferreiro', nome: 'Aprendiz de Ferreiro', pericia: 'Fabricação',
    traco: { nome: 'Conheço o aço',
      efeito: 'Comece com uma arma de assinatura e, 1×/sessão, gaste a Ação Menor para repará-la ou improvisar uma ferramenta simples.' },
    laco: 'A oficina que você deixou ainda espera você voltar.' },

  { id: 'raiz', nome: 'Recruta da Raiz', pericia: 'Determinação',
    traco: { nome: 'Treinado para não dizer',
      efeito: 'Vantagem para resistir a interrogatório, tortura e leitura mental.' },
    laco: 'A Raiz não solta ninguém — você ainda carrega o selo na língua.' },
];

function origemAvdf(id) { return ORIGENS_AVDF.find(o => o.id === id) || null; }


// ── GRADUAÇÃO DE PERÍCIA ──────────────────────────────────────────
//  Quatro graus, não dois. A ficha anterior só conhecia "Treinado",
//  e por isso Especialista e Mestre simplesmente não existiam nela.
//  `rankMin` é null quando não há exigência de rank.

//  ATENÇÃO ao ler a tabela do livro: "3 / +6 / +12" são custos POR
//  DEGRAU, não um total. Subir de Treinado para Especialista custa 6,
//  e não 6 − 3. Quem chega a Mestre gastou 3 + 6 + 12 = 21 PT.
//  `pt` é o degrau; `ptAcumulado` é o total desde Não treinado.
const GRAUS_PERICIA_AVDF = [
  { id: 0, nome: 'Não treinado', bonus: 0, pt:  0, ptAcumulado:  0, rankMin: null,
    obs: 'Padrão. Você ainda pode tentar quase tudo.' },
  { id: 1, nome: 'Treinado',     bonus: 2, pt:  3, ptAcumulado:  3, rankMin: null,
    obs: 'Três de graça na criação; depois 3 PT cada.' },
  { id: 2, nome: 'Especialista', bonus: 4, pt:  6, ptAcumulado:  9, rankMin: 'chunin',
    obs: '6 PT adicionais. Exige rank Chūnin ou superior.' },
  { id: 3, nome: 'Mestre',       bonus: 6, pt: 12, ptAcumulado: 21, rankMin: 'jonin',
    obs: '12 PT adicionais. Exige rank Jōnin e justificativa narrativa.' },
];

function grauPericiaAvdf(id) {
  return GRAUS_PERICIA_AVDF.find(g => g.id === (parseInt(id, 10) || 0)) || GRAUS_PERICIA_AVDF[0];
}

//  Quantas perícias treinadas de graça a criação dá.
const PERICIAS_TREINADAS_NA_CRIACAO = 3;


// ── EXAUSTÃO (cumulativa) ─────────────────────────────────────────
//  Não é um contador: cada nível tem efeito mecânico, e o nível 3
//  também aparece na lista de circunstâncias que impõem Desvantagem.
//  `testes` é o modificador que entra em TODA rolagem.

const EXAUSTAO_AVDF = [
  { n: 0, testes:  0, efeito: 'Descansado.' },
  { n: 1, testes: -1, efeito: '−1 em todos os testes.' },
  { n: 2, testes: -2, efeito: '−2 em todos os testes. Sem movimento livre.',
    semMovimentoLivre: true },
  { n: 3, testes: -3, efeito: '−3 em todos os testes. Desvantagem em ataques.',
    semMovimentoLivre: true, desvantagemAtaque: true },
  { n: 4, testes: -4, efeito: '−4 em todos os testes. PV máximos reduzidos à metade.',
    semMovimentoLivre: true, desvantagemAtaque: true, pvMaxMetade: true },
  { n: 5, testes: -5, efeito: 'Inconsciente.', inconsciente: true },
  { n: 6, testes: -6, efeito: 'Morte.', morte: true },
];

const EXAUSTAO_MAX = 6;

function exaustaoAvdf(n) {
  return EXAUSTAO_AVDF[Math.max(0, Math.min(EXAUSTAO_MAX, parseInt(n, 10) || 0))];
}


// ── CONDIÇÕES ─────────────────────────────────────────────────────
//  As doze do Cap. 14, com os nomes do livro. `testes` e `desvantagem`
//  existem para a ficha poder aplicar sozinha o que for objetivo —
//  ninguém deveria ter que lembrar de baixar cinco números porque está
//  Cego. O que depende de julgamento fica só descrito.

const CONDICOES_AVDF = [
  { id: 'atordoado',  nome: 'Atordoado',  icone: '💫',
    efeito: 'Perde a Ação Principal. Mantém movimento e Reação.',
    sai: 'Fim do próximo turno.' },
  { id: 'preso',      nome: 'Preso',      icone: '🔒',
    efeito: 'Não se move. Ataques contra você têm Vantagem. Não pode Esquivar.',
    sai: 'Ação Principal + teste de TAI ou COR.' },
  { id: 'caido',      nome: 'Caído',      icone: '🡇', desvantagemAtaque: true,
    efeito: 'Desvantagem em ataques. Corpo a corpo contra você com Vantagem.',
    sai: 'Ação Menor para levantar.' },
  { id: 'cego',       nome: 'Cego',       icone: '🌑', desvantagemVisao: true,
    efeito: 'Desvantagem em tudo que dependa de visão. Imune a genjutsu visual.',
    sai: 'Conforme a fonte.' },
  { id: 'selado',     nome: 'Selado',     icone: '🚫', semChakra: true,
    efeito: 'Não pode usar chakra: sem jutsus, sem Substituição, sem dōjutsu.',
    sai: 'CTR no fim de cada turno, CD do efeito.' },
  { id: 'envenenado', nome: 'Envenenado', icone: '🧪', desvantagemCOR: true,
    efeito: '1d6 no fim de cada turno e Desvantagem em COR.',
    sai: 'Antídoto, Medicina CD 15, ou a duração.' },
  { id: 'queimando',  nome: 'Queimando',  icone: '🔥',
    efeito: '1d6 no fim de cada turno.',
    sai: 'Ação Principal para apagar, ou água/terra.' },
  { id: 'sob_ilusao', nome: 'Sob Ilusão', icone: '🌀',
    efeito: 'Percebe uma realidade falsa e age conforme ela.',
    sai: 'Kai, ajuda de aliado, ou dor autoinfligida.' },
  { id: 'lento',      nome: 'Lento',      icone: '🐌', semMovimentoLivre: true,
    efeito: 'Sem movimento livre. Iniciativa cai ao último lugar.',
    sai: 'Conforme a fonte.' },
  { id: 'marcado',    nome: 'Marcado',    icone: '🎯',
    efeito: 'Você carrega uma marca — cheiro, feromônio, tinta ou chakra. Quem a aplicou sabe onde você está a qualquer distância.',
    sai: 'Lavar-se, trocar de roupa, ou o fim da cena.' },
  { id: 'ferido',     nome: 'Ferido',     icone: '🩸', desvantagemCOR: true,
    automatica: 'pv < 50%',
    efeito: 'Automático abaixo de metade dos PV. Desvantagem em COR.',
    sai: 'Cura acima de metade dos PV.' },
  { id: 'exausto_chakra', nome: 'Exausto de Chakra', icone: '💤',
    automatica: 'pc = 0', defesa: -2, semChakra: true,
    efeito: '0 PC. Sem jutsus. Desvantagem em CTR e NIN. Defesa −2.',
    sai: 'Recuperar qualquer PC.' },
  //  Não está na tabela de condições do livro: é o estado a 0 PV,
  //  descrito na regra de morte. Fica aqui porque o combate precisa
  //  poder marcá-lo como marca qualquer outra.
  { id: 'morrendo',   nome: 'Morrendo',   icone: '\u2620', inconsciente: true,
    automatica: 'pv = 0',
    efeito: 'Inconsciente. Teste de Morte d20+COR CD 10 no início do turno. 3 sucessos estabiliza, 3 falhas mata.',
    sai: 'Estabilizar, ou qualquer cura.' },
];

//  As duas que a ficha liga sozinha, porque são consequência de um
//  número que ela já conhece.
function condicoesAutomaticasAvdf(estado) {
  const fora = [];
  const pv = estado?.pv ?? 0, pvMax = estado?.pvMax ?? 0, pc = estado?.pc ?? 0;
  if (pvMax > 0 && pv > 0 && pv < pvMax / 2) fora.push('ferido');
  if (pvMax > 0 && pv <= 0) fora.push('morrendo');
  if (pc === 0) fora.push('exausto_chakra');
  return fora;
}


// ── FERIMENTOS GRAVES ─────────────────────────────────────────────
//  Rolados quando a regra manda. Duram até tratamento: 2 semanas +
//  Medicina CD 16.

const FERIMENTOS_AVDF = [
  { d: 1, nome: 'Costelas quebradas', efeito: '−1 em COR. Desvantagem em Atletismo.' },
  { d: 2, nome: 'Mão ferida',         efeito: 'Selos exigem teste de CTR CD 12.' },
  { d: 3, nome: 'Perna ferida',       efeito: 'Movimento reduzido. Desvantagem em Acrobacia.' },
  { d: 4, nome: 'Olho ferido',        efeito: 'Desvantagem em testes de visão à distância.' },
  { d: 5, nome: 'Rede de chakra danificada', efeito: 'PC máximos reduzidos.' },
  { d: 6, nome: 'Trauma craniano',    efeito: 'Desvantagem em ESP e em testes de memória.' },
];


// ── TALENTOS ──────────────────────────────────────────────────────
//  6 PT cada. Não são técnicas nem estilos — categoria própria.

const TALENTOS_AVDF = [
  { id: 'selos_velozes',  nome: 'Selos Velozes',  pt: 6,
    efeito: 'Reduza a Carga de um jutsu em 1, uma vez por combate.' },
  { id: 'reservas',       nome: 'Reservas Profundas', pt: 6, repetivel: 3,
    efeito: '+8 PC máximos. Até três vezes.' },
  { id: 'couro_duro',     nome: 'Couro Duro',     pt: 6, repetivel: 3,
    efeito: '+10 PV máximos. Até três vezes.' },
  { id: 'reflexo',        nome: 'Reflexo Shinobi', pt: 6,
    efeito: 'Uma Reação adicional por rodada.' },
  { id: 'contra_ataque',  nome: 'Contra-ataque',  pt: 6,
    efeito: 'Ao Esquivar com sucesso, ataque imediatamente com Ação Menor.' },
  { id: 'mente_fria',     nome: 'Mente Fria',     pt: 6,
    efeito: 'Vantagem em todos os testes de Kai contra genjutsu.' },
  { id: 'substituicao',   nome: 'Substituição Aprimorada', pt: 6,
    efeito: 'Kawarimi três vezes por combate, sem escalonamento de custo.' },
  { id: 'instrutor',      nome: 'Instrutor',      pt: 6,
    efeito: 'Ensina jutsus a aliados como Selo do Mestre: eles pagam 2 PT a menos.' },
  { id: 'segunda_afinidade', nome: 'Segunda Afinidade', pt: 6,
    efeito: 'Trate uma segunda natureza como afim (descontos e sem penalidade).' },
];


// ── PONTOS DE TREINO ──────────────────────────────────────────────
//  A moeda da progressão. Rank NÃO se compra com PT.
//
//  NOTA DE CONFLITO RESOLVIDO: o Livro do Jogador trazia "Estágio de
//  progressão de clã — 8 PT", valor único; o Compêndio dos Clãs traz a
//  escala 6/8/12/18 por estágio. Confirmado com o autor que vale a do
//  Compêndio — o 8 fixo é valor antigo.

const PT_CUSTOS_AVDF = {
  //  Por degrau (ver a nota em GRAUS_PERICIA_AVDF).
  pericia:  { treinado: 3, especialista: 6, mestre: 12 },
  //  "Aumentar um atributo para X — custo fixo por degrau: +5 custa 6
  //  PT, +6 custa 8, +7 custa 10, +8 custa 12. Respeita o teto do rank."
  //  Até +4 não se compra: vem do conjunto da criação.
  atributo: { 5: 6, 6: 8, 7: 10, 8: 12 },
  jutsu:    { E: 1, D: 2, C: 4, B: 8, A: 14, S: 24 },
  natureza: { segunda: 8, terceira: 14, quartaEQuinta: 20 },

  //  Yin e Yang não são elementos e não entram na conta de "segunda /
  //  terceira natureza". O livro dá só o requisito de atributo
  //  (GEN +3 / CTR +4) e não diz preço. O autor decidiu que há
  //  requisito E preço — mas o número ainda não foi definido.
  //
  //  Enquanto for `null`, a ficha mostra o requisito, deixa a caixa
  //  para a pessoa marcar e NÃO cobra PT. Basta pôr o número aqui para
  //  a cobrança passar a valer em toda a ficha.
  naturezaEspecial: { inton: null, yang: null },
  talento:  6,
  estilo:   6,
  //  Por estágio, e não um valor único (ver nota acima).
  estagioCla: { I: 0, II: 6, III: 8, IV: 12, V: 18 },
};

//  Descontos conhecidos. `de` diz de onde vem, para a ficha poder
//  mostrar "custo base − desconto = custo final" em vez de um número
//  mágico.
//  Modificadores de custo de jutsu, do Cap. 09. São os quatro do livro
//  — inclusive o único que SOBE o preço — mais as duas travas.
function descontosDeAprendizado(ctx) {
  const lista = [];
  //  "Kinjutsu nunca recebe redução de PT por afinidade, clã ou mestre.
  //  O preço cheio é parte do ponto."
  if (ctx?.kinjutsu) return [{ de: 'Kinjutsu — sem desconto, por regra', pt: 0, trava: true }];
  if (ctx?.naturezaAfim)      lista.push({ de: 'Natureza afim',               pt: -1 });
  if (ctx?.hidenDoProprioCla) lista.push({ de: 'Hiden do próprio clã',        pt: -2 });
  if (ctx?.mestreEmCena)      lista.push({ de: 'Aprendida de um mestre em cena', pt: -2 });
  if (ctx?.instrutorAliado)   lista.push({ de: 'Selo do Mestre (talento Instrutor)', pt: -2 });
  if (ctx?.soPergaminho)      lista.push({ de: 'Só por pergaminho, sem professor', pt: +2 });
  return lista;
}

//  "Jutsus de uma natureza que você não domina não podem ser
//  aprendidos" — não é caro, é impossível. E rank S / Ōgi não se
//  compram só com PT.
function podeAprenderAvdf(ctx) {
  if (ctx?.foraDaNatureza) {
    return { pode: false, porque: 'Fora de qualquer natureza que você domine — impossível, a nenhum preço.' };
  }
  //  Genjutsu de rank B+ exige Inton (Yin) dominado.
  if (ctx?.categoria === 'genjutsu' && typeof avdfGenjutsuExigeInton === 'function'
      && avdfGenjutsuExigeInton(ctx?.rankJutsu) && !ctx?.temInton) {
    return { pode: false,
             porque: `Genjutsu de rank ${INTON_EXIGIDO_A_PARTIR_DE} ou superior exige Inton (Yin) dominado — "Inton é base de todo genjutsu".` };
  }
  if ((ctx?.rankJutsu === 'S' || ctx?.acesso === 'Ōgi') && !ctx?.tresSelos) {
    return { pode: false, porque: 'Rank S e acesso Ōgi exigem os três Selos conquistados em jogo antes de qualquer PT.' };
  }
  return { pode: true };
}

//  Os três Selos. Não são números — são condições de mesa —, mas
//  precisam estar aqui para a ficha poder cobrar as três em vez de
//  deixar alguém comprar um rank S com PT sobrando.
const SELOS_AVDF = [
  { id: 'sangue', nome: 'Selo de Sangue', pergunta: 'O corpo permite?',
    oque: 'Condição física, genética ou de recurso: um dōjutsu, uma reserva colossal, um Kekkei Genkai, um contrato.' },
  { id: 'mestre', nome: 'Selo do Mestre', pergunta: 'Alguém pode ensinar?',
    oque: 'Um professor vivo e disposto, um pergaminho completo, ou meses de pesquisa própria.' },
  { id: 'prova',  nome: 'Selo da Prova',  pergunta: 'Você merece?',
    oque: 'Um Marco de História: um arco dedicado à conquista.' },
];

//  De onde o PT entra. É esta lista que o histórico de PT oferece —
//  para o ganho ficar registrado com o motivo, e não como um número
//  que apareceu na ficha.
const PT_FONTES_AVDF = [
  { id: 'missao_d',    pt: 1, texto: 'Concluir uma missão rank D' },
  { id: 'missao_c',    pt: 2, texto: 'Concluir uma missão rank C' },
  { id: 'missao_b',    pt: 3, texto: 'Concluir uma missão rank B' },
  { id: 'missao_a',    pt: 5, texto: 'Concluir uma missão rank A' },
  { id: 'missao_s',    pt: 8, texto: 'Concluir uma missão rank S' },
  { id: 'interpretacao', pt: 1, texto: 'Interpretação de destaque, decisão difícil, honrar o Ninja Way num momento caro' },
  { id: 'sem_violencia', pt: 1, texto: 'Resolver um conflito sem violência quando a violência era mais fácil' },
  { id: 'treino',      pt: 1, texto: 'Sessão de treino dedicada em intervalo (máx. 1 por intervalo)' },
  { id: 'mestre',      pt: 0, texto: 'Concedido pelo Mestre', livre: true },
];

//  Promoção de rank: PT acumulado E um marco narrativo. O PT sozinho
//  não promove ninguém — quem promove é o Mestre.
const PROMOCAO_RANK_AVDF = [
  { para: 'chunin',    ptAprox:  25, marco: 'Exame Chūnin, ou comando sob fogo.' },
  { para: 'jonin_esp', ptAprox:  50, marco: 'Indicação do Kage.' },
  { para: 'jonin',     ptAprox:  80, marco: 'Domínio de duas naturezas.' },
  { para: 'anbu',      ptAprox: 130, marco: 'Convocação direta, sem cerimônia.' },
  { para: 'kage',      ptAprox: 200, marco: 'Fim de campanha. Vencer lutas não promove ninguém — avalia-se liderança e julgamento.' },
];


// ── EQUIPAMENTO INICIAL ───────────────────────────────────────────
//  Kit Shinobi Padrão (Passo 7). Todo ninja começa com ele.

const KIT_SHINOBI_AVDF = [
  { nome: 'Bandana da vila',            qtd: 1  },
  { nome: 'Kunai',                      qtd: 10 },
  { nome: 'Shuriken',                   qtd: 20 },
  { nome: 'Selo explosivo',             qtd: 3  },
  { nome: 'Fio ninja',                  qtd: 1, detalhe: '15 metros' },
  { nome: 'Pergaminho de armazenamento', qtd: 2 },
  { nome: 'Kit de primeiros socorros',  qtd: 1  },
  { nome: 'Rações',                     qtd: 1, detalhe: 'uma semana' },
];

const RYO_INICIAL = 3000;


// ── CIRCUNSTÂNCIAS DE VANTAGEM E DESVANTAGEM ──────────────────────
//  Lista fechada do Cap. 02. A ficha marca sozinha o que ela sabe
//  (Exaustão 3+, estar Ferido em testes de Corpo) e oferece o resto
//  como caixa para o jogador marcar — porque são julgamento de mesa.

const VANTAGEM_AVDF = [
  { id: 'estudou',   texto: 'Você Estudou o alvo' },
  { id: 'ajudar',    texto: 'Um aliado usou Ajudar' },
  { id: 'terreno',   texto: 'Terreno favorável' },
  { id: 'elemento',  texto: 'Vantagem elemental esmagadora' },
];

const DESVANTAGEM_AVDF = [
  { id: 'cego',      texto: 'Lutar cego, na escuridão ou na névoa' },
  { id: 'ferido',    texto: 'Estar Ferido, em testes de Corpo', automatica: true },
  { id: 'cobertura', texto: 'Alvo com cobertura pesada' },
  { id: 'longa',     texto: 'Agir a Longa distância sem arma apropriada' },
  { id: 'exaustao',  texto: 'Níveis 3+ de Exaustão', automatica: true },
];
