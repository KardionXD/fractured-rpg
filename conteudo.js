// ══════════════════════════════════════════════════
//  CONTEÚDO OFICIAL — FRACTURED
//  Livro Base v4 (Cap. 03 e 04) + Expansão v3 (Exp. 01 e 02)
//  Fonte única de profissões e perícias. Nada aqui é inventado:
//  cada linha sai direto do livro.
// ══════════════════════════════════════════════════

// ── PERÍCIAS ──────────────────────────────────────
// attr: o atributo em que a perícia soma +3.
// cat:  a categoria em que ela é listada no livro. Igual a attr, exceto
//       SOBREVIVÊNCIA, que é temática — o atributo vem entre colchetes.
// livro: 'base' (25 perícias, Cap. 04) ou 'expansao' (42 perícias, Exp. 02).

const PERICIAS = [
  // ── FORÇA ──
  { nome: 'Força Bruta',                attr: 'FOR', cat: 'FORÇA',         livro: 'base' },
  { nome: 'Atletismo',                  attr: 'FOR', cat: 'FORÇA',         livro: 'base' },
  { nome: 'Intimidação Física',         attr: 'FOR', cat: 'FORÇA',         livro: 'base' },
  { nome: 'Carga Pesada',               attr: 'FOR', cat: 'FORÇA',         livro: 'base' },
  { nome: 'Arremesso Preciso',          attr: 'FOR', cat: 'FORÇA',         livro: 'expansao' },
  { nome: 'Arrombamento Bruto',         attr: 'FOR', cat: 'FORÇA',         livro: 'expansao' },
  { nome: 'Grito de Guerra',            attr: 'FOR', cat: 'FORÇA',         livro: 'expansao' },
  { nome: 'Resistência ao Agarrão',     attr: 'FOR', cat: 'FORÇA',         livro: 'expansao' },
  { nome: 'Derrubada',                  attr: 'FOR', cat: 'FORÇA',         livro: 'expansao' },
  { nome: 'Quebrar Equipamento',        attr: 'FOR', cat: 'FORÇA',         livro: 'expansao' },

  // ── RESISTÊNCIA ──
  { nome: 'Tolerância a Dano',          attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'base' },
  { nome: 'Privação',                   attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'base' },
  { nome: 'Sutura de Emergência',       attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'base' },
  { nome: 'Recuperação',                attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'base' },
  { nome: 'Resistência a Toxinas',      attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'expansao' },
  { nome: 'Fôlego de Combate',          attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'expansao' },
  { nome: 'Cicatrização Acelerada',     attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'expansao' },
  { nome: 'Apneia Controlada',          attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'expansao' },
  { nome: 'Resistência à Dor',          attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'expansao' },
  { nome: 'Corpo Calejado',             attr: 'RES', cat: 'RESISTÊNCIA',   livro: 'expansao' },

  // ── COMBATE ──
  { nome: 'Luta Corpo-a-Corpo',         attr: 'COM', cat: 'COMBATE',       livro: 'base' },
  { nome: 'Tiro de Precisão',           attr: 'COM', cat: 'COMBATE',       livro: 'base' },
  { nome: 'Manobra',                    attr: 'COM', cat: 'COMBATE',       livro: 'base' },
  { nome: 'Armas Pesadas',              attr: 'COM', cat: 'COMBATE',       livro: 'base' },
  { nome: 'Tiro Duplo',                 attr: 'COM', cat: 'COMBATE',       livro: 'expansao' },
  { nome: 'Desarmamento',               attr: 'COM', cat: 'COMBATE',       livro: 'expansao' },
  { nome: 'Combate às Cegas',           attr: 'COM', cat: 'COMBATE',       livro: 'expansao' },
  { nome: 'Recarga Rápida',             attr: 'COM', cat: 'COMBATE',       livro: 'expansao' },
  { nome: 'Contra-Ataque',              attr: 'COM', cat: 'COMBATE',       livro: 'expansao' },
  { nome: 'Supressão',                  attr: 'COM', cat: 'COMBATE',       livro: 'expansao' },

  // ── SOCIAL ──
  { nome: 'Interrogatório',             attr: 'SOC', cat: 'SOCIAL',        livro: 'base' },
  { nome: 'Negociação',                 attr: 'SOC', cat: 'SOCIAL',        livro: 'base' },
  { nome: 'Liderança',                  attr: 'SOC', cat: 'SOCIAL',        livro: 'base' },
  { nome: 'Leitura de Pessoas',         attr: 'SOC', cat: 'SOCIAL',        livro: 'base' },
  { nome: 'Blefe Profissional',         attr: 'SOC', cat: 'SOCIAL',        livro: 'expansao' },
  { nome: 'Mediação de Conflito',       attr: 'SOC', cat: 'SOCIAL',        livro: 'expansao' },
  { nome: 'Memória Social',             attr: 'SOC', cat: 'SOCIAL',        livro: 'expansao' },
  { nome: 'Autoridade de Crise',        attr: 'SOC', cat: 'SOCIAL',        livro: 'expansao' },
  { nome: 'Reputação de Campo',         attr: 'SOC', cat: 'SOCIAL',        livro: 'expansao' },
  { nome: 'Leitura de Tensão',          attr: 'SOC', cat: 'SOCIAL',        livro: 'expansao' },

  // ── CONHECIMENTO ──
  { nome: 'Improviso de Armas',         attr: 'CON', cat: 'CONHECIMENTO',  livro: 'base' },
  { nome: 'Reparo de Veículo',          attr: 'CON', cat: 'CONHECIMENTO',  livro: 'base' },
  { nome: 'Síntese Médica',             attr: 'CON', cat: 'CONHECIMENTO',  livro: 'base' },
  { nome: 'Armadilha Técnica',          attr: 'CON', cat: 'CONHECIMENTO',  livro: 'base' },
  { nome: 'Análise de Estrutura',       attr: 'CON', cat: 'CONHECIMENTO',  livro: 'expansao' },
  { nome: 'Química Aplicada',           attr: 'CON', cat: 'CONHECIMENTO',  livro: 'expansao' },
  { nome: 'Fabricação Avançada',        attr: 'CON', cat: 'CONHECIMENTO',  livro: 'expansao' },
  { nome: 'Manutenção de Equipamento',  attr: 'CON', cat: 'CONHECIMENTO',  livro: 'expansao' },
  { nome: 'Diagnóstico Rápido',         attr: 'CON', cat: 'CONHECIMENTO',  livro: 'expansao' },
  { nome: 'Rastreamento Técnico',       attr: 'CON', cat: 'CONHECIMENTO',  livro: 'expansao' },

  // ── AGILIDADE ──
  { nome: 'Furtividade',                attr: 'AGI', cat: 'AGILIDADE',     livro: 'base' },
  { nome: 'Sentido de Perigo',          attr: 'AGI', cat: 'AGILIDADE',     livro: 'base' },
  { nome: 'Emboscada',                  attr: 'AGI', cat: 'AGILIDADE',     livro: 'base' },
  { nome: 'Evasão',                     attr: 'AGI', cat: 'AGILIDADE',     livro: 'base' },
  { nome: 'Montaria',                   attr: 'AGI', cat: 'AGILIDADE',     livro: 'base' },
  { nome: 'Rolamento de Combate',       attr: 'AGI', cat: 'AGILIDADE',     livro: 'expansao' },
  { nome: 'Silêncio Aprimorado',        attr: 'AGI', cat: 'AGILIDADE',     livro: 'expansao' },
  { nome: 'Acrobacia de Combate',       attr: 'AGI', cat: 'AGILIDADE',     livro: 'expansao' },
  { nome: 'Instinto de Fuga',           attr: 'AGI', cat: 'AGILIDADE',     livro: 'expansao' },
  { nome: 'Escalada Veloz',             attr: 'AGI', cat: 'AGILIDADE',     livro: 'expansao' },
  { nome: 'Gatilho Reflexo',            attr: 'AGI', cat: 'AGILIDADE',     livro: 'expansao' },

  // ── SOBREVIVÊNCIA (categoria temática — o atributo vem entre colchetes) ──
  { nome: 'Acampamento Seguro',         attr: 'CON', cat: 'SOBREVIVÊNCIA', livro: 'expansao' },
  { nome: 'Preparo de Alimento',        attr: 'CON', cat: 'SOBREVIVÊNCIA', livro: 'expansao' },
  { nome: 'Leitura de Terreno',         attr: 'AGI', cat: 'SOBREVIVÊNCIA', livro: 'expansao' },
  { nome: 'Armadilha de Caça',          attr: 'CON', cat: 'SOBREVIVÊNCIA', livro: 'expansao' },
  { nome: 'Orientação Noturna',         attr: 'AGI', cat: 'SOBREVIVÊNCIA', livro: 'expansao' },
  { nome: 'Socorro Improvisado',        attr: 'CON', cat: 'SOBREVIVÊNCIA', livro: 'expansao' },
];

// ── PROFISSÕES ────────────────────────────────────
// attrs: os dois atributos-chave, como impressos no livro.
// base / extra: as duas perícias candidatas — o personagem escolhe UMA.
// traco: nome do Traço exclusivo + o que ele faz.

const PROFISSOES = [
  // ── LIVRO BASE (Cap. 03) ──
  { nome: 'Médico de Campo', attrs: 'RES / SOC', livro: 'base',
    base: 'Sutura de Emergência', extra: 'Tolerância a Dano',
    traco: 'Triagem', tracoDesc: '1× por sessão, estabilize um personagem em 0 PV sem gastar Suprimento.' },
  { nome: 'Mecânico', attrs: 'CON / AGI', livro: 'base',
    base: 'Reparo de Veículo', extra: 'Improviso de Armas',
    traco: 'Gambiarra', tracoDesc: 'Faça qualquer veículo ou máquina funcionar por 1 cena com material mínimo.' },
  { nome: 'Ex-Policial', attrs: 'COM / AGI', livro: 'base',
    base: 'Luta Corpo-a-Corpo', extra: 'Interrogatório',
    traco: 'Autoridade', tracoDesc: '+3 em Intimidação Física ao exibir arma ou distintivo danificado.' },
  { nome: 'Engenheiro Civil', attrs: 'CON / RES', livro: 'base',
    base: 'Armadilha Técnica', extra: 'Recuperação',
    traco: 'Arquiteto', tracoDesc: 'Construa abrigos e barricadas em metade do tempo normal.' },
  { nome: 'Jornalista', attrs: 'SOC / AGI', livro: 'base',
    base: 'Leitura de Pessoas', extra: 'Negociação',
    traco: 'Testemunha', tracoDesc: '+3 em SOCIAL para detectar mentiras sobre eventos que você presenciou.' },
  { nome: 'Atirador Militar', attrs: 'COM / AGI', livro: 'base',
    base: 'Tiro de Precisão', extra: 'Manobra',
    traco: 'Campo de Tiro', tracoDesc: '1× por combate: sem se mover na rodada, seu disparo causa dano máximo ao acertar.' },
  { nome: 'Agricultor / Botânico', attrs: 'CON / RES', livro: 'base',
    base: 'Síntese Médica', extra: 'Privação',
    traco: 'Reserva Verde', tracoDesc: '1× por arco, o grupo não gasta Suprimentos de comida por 1 sessão inteira.' },
  { nome: 'Psicólogo / Conselheiro', attrs: 'SOC / AGI', livro: 'base',
    base: 'Leitura de Pessoas', extra: 'Liderança',
    traco: 'Âncora', tracoDesc: 'Quando um aliado cai abaixo de 5 Humanidade, gaste 1 ação para bloquear o teste de Ressonância.' },
  { nome: 'Químico / Farmacêutico', attrs: 'CON / AGI', livro: 'base',
    base: 'Síntese Médica', extra: 'Armadilha Técnica',
    traco: 'Alquimista', tracoDesc: 'Crie qualquer substância com materiais equivalentes. O Guarda define os efeitos colaterais.' },
  { nome: 'Líder Comunitário', attrs: 'SOC / RES', livro: 'base',
    base: 'Liderança', extra: 'Negociação',
    traco: 'Discurso', tracoDesc: '1× por sessão, restaure 1 Humanidade em todos os aliados com um discurso de 1 minuto.' },
  { nome: 'Ladrão / Arrombador', attrs: 'AGI / CON', livro: 'base',
    base: 'Furtividade', extra: 'Evasão',
    traco: 'Escapista', tracoDesc: 'Escapa de qualquer contenção física — grilhões, celas, laços — gastando 1 ação e sem teste.' },
  { nome: 'Sem Profissão Definida', attrs: 'Qualquer', livro: 'base',
    base: '1 Perícia à sua escolha', extra: '1 Perícia à sua escolha',
    traco: 'Curinga', tracoDesc: '1× por sessão, adote temporariamente qualquer Perícia de outro Sobrevivente por 1 cena completa.' },

  // ── EXPANSÃO v3 (Exp. 01) ──
  { nome: 'Veterinário / Biólogo', attrs: 'CON / RES', livro: 'expansao',
    base: 'Síntese Médica', extra: 'Diagnóstico Rápido',
    traco: 'Análise de Campo', tracoDesc: '1× por sessão, examinando uma criatura morta por 1 ação, o Guarda revela ao grupo uma fraqueza concreta daquela espécie. Você também cuida de companheiros animais (Cap. 12) sem gastar Suprimento.' },
  { nome: 'Piloto / Motorista', attrs: 'AGI / CON', livro: 'expansao',
    base: 'Reparo de Veículo', extra: 'Rastreamento Técnico',
    traco: 'Controle Total', tracoDesc: 'Enquanto você dirige, o veículo não perde Integridade por terreno difícil, e todo dano de colisão sofrido pelos ocupantes cai em 1d4.' },
  { nome: 'Professor / Acadêmico', attrs: 'CON / SOC', livro: 'expansao',
    base: 'Análise de Estrutura', extra: 'Química Aplicada',
    traco: 'Memória Enciclopédica', tracoDesc: '1× por sessão, declare que seu personagem conhece um fato técnico ou histórico útil à cena. O Guarda define o alcance e os limites do que você sabe.' },
  { nome: 'Ferreiro / Artesão', attrs: 'CON / FOR', livro: 'expansao',
    base: 'Improviso de Armas', extra: 'Manutenção de Equipamento',
    traco: 'Forja Improvisada', tracoDesc: 'Com materiais brutos, fogo e 45 minutos, um teste de CONHECIMENTO ≥ 14 cria uma arma corpo-a-corpo funcional com +1 de dano. Falhar produz uma arma comum, sem o bônus.' },
  { nome: 'Caçador / Rastreador', attrs: 'AGI / CON', livro: 'expansao',
    base: 'Leitura de Terreno', extra: 'Armadilha de Caça',
    traco: 'Caçada Preparada', tracoDesc: '1× por sessão, após seguir um alvo por 10 minutos ou mais sem ser notado, seu primeiro ataque contra ele soma +4 no confronto.' },
  { nome: 'Catador / Sucateiro', attrs: 'CON / FOR', livro: 'expansao',
    base: 'Fabricação Avançada', extra: 'Análise de Estrutura',
    traco: 'Olho de Sucata', tracoDesc: 'Revistando um ambiente por 15 minutos com CONHECIMENTO ≥ 13, você sempre encontra um material útil que o resto do grupo passou batido. Uma vez por local.' },
  { nome: 'Bombeiro / Resgate', attrs: 'FOR / RES', livro: 'expansao',
    base: 'Sutura de Emergência', extra: 'Carga Pesada',
    traco: 'Resgate Forçado', tracoDesc: 'Você carrega um aliado incapacitado e continua lutando sem penalidade em nenhum dos dois. Além disso, ignora a penalidade de fumaça e de calor.' },
  { nome: 'Sobrevivente Nato', attrs: 'RES / CON', livro: 'expansao',
    base: 'Privação', extra: 'Corpo Calejado',
    traco: 'Força da Necessidade', tracoDesc: '1× por sessão, ao cair para o estado CRÍTICO, você age como ÍNTEGRO por uma rodada completa — sem penalidade de estado nenhuma. Depois dela, o corpo cobra tudo de uma vez.' },
  { nome: 'Artista / Contador de Histórias', attrs: 'SOC / CON', livro: 'expansao',
    base: 'Liderança', extra: 'Memória Social',
    traco: 'Voz da Humanidade', tracoDesc: '1× por arco narrativo, uma apresentação genuína diante do grupo — história, música, desenho — devolve 1 ponto de Humanidade a cada pessoa presente (Cap. 08).' },
  { nome: 'Diplomata / Negociador', attrs: 'SOC / CON', livro: 'expansao',
    base: 'Negociação', extra: 'Mediação de Conflito',
    traco: 'Zona de Trégua', tracoDesc: '1× por sessão, declare trégua entre dois grupos hostis por uma cena inteira. Quem quebrar a trégua primeiro fica com −2 em SOCIAL contra o grupo traído pelo resto do arco.' },
  { nome: 'Ex-Presidiário', attrs: 'FOR / AGI', livro: 'expansao',
    base: 'Manobra', extra: 'Furtividade',
    traco: 'Adaptação Extrema', tracoDesc: 'Sempre que for capturado, amarrado ou trancado, role FORÇA ou AGILIDADE ≥ 13 para se soltar. Falhando, você pode tentar de novo na rodada seguinte, quantas vezes precisar.' },
  { nome: 'Segurança Privado', attrs: 'COM / RES', livro: 'expansao',
    base: 'Luta Corpo-a-Corpo', extra: 'Leitura de Pessoas',
    traco: 'Escudo Vivo', tracoDesc: '1× por cena, ao ver um aliado adjacente ser atacado, você assume o ataque no lugar dele: role a sua defesa normalmente e aplique a sua redução de dano.' },
];

// ── TENSÃO ────────────────────────────────────────
// Cap. 06 — "A REGRA ÚNICA DA TENSÃO: a penalidade da faixa atual entra
// em todo teste feito sob pressão." Uma fonte só para toda a aplicação.

const TENSAO_FAIXAS = [
  { max: 2,  label: 'CALMA',  cls: 'calma',  pen:  0, dica: 'Sem penalidade. Ninguém está caçando vocês agora.' },
  { max: 5,  label: 'ALERTA', cls: 'alerta', pen: -1, dica: '−1 em todo teste. Algo mudou — ainda dá para escolher.' },
  { max: 8,  label: 'PERIGO', cls: 'perigo', pen: -2, dica: '−2 em todo teste. A ameaça sabe onde vocês estão.' },
  { max: 10, label: 'TERROR', cls: 'terror', pen: -3, dica: '−3 em todo teste. Movimento Duro a cada rodada; teste refeito custa 1 Suprimento.' },
];

function tensaoFaixa(valor) {
  const v = Math.max(0, Math.min(10, parseInt(valor) || 0));
  return TENSAO_FAIXAS.find(f => v <= f.max) || TENSAO_FAIXAS[TENSAO_FAIXAS.length - 1];
}

// Letra de cada pip (1 a 10) — derivada das faixas, não escrita à mão.
const TENSAO_TYPES = Array.from({ length: 10 }, (_, i) => tensaoFaixa(i + 1).label[0]);

// ── BÔNUS E PENALIDADES DE SITUAÇÃO ───────────────
// Cap. 02. Podem ser combinados — o Guarda decide o que vale na cena.
// A entrada de Tensão é dinâmica: usa a penalidade da faixa atual da mesa
// (Cap. 06), em vez de um −2 fixo.

const SITUACOES = [
  { id: 'vinculo',  val:  3, nome: 'Vínculo Ativo',       desc: 'Expressando genuinamente o vínculo com o aliado' },
  { id: 'ferram',   val:  2, nome: 'Ferramenta',          desc: 'Equipamento específico e em boas condições' },
  { id: 'aliado',   val:  2, nome: 'Aliado Ajuda',        desc: 'Personagem em posição vantajosa auxilia' },
  { id: 'vantagem', val:  2, nome: 'Vantagem',            desc: 'Terreno elevado ou emboscada preparada' },
  { id: 'ferido',   val: -2, nome: 'Ferido (PV<75%)',     desc: 'Estado FERIDO ou pior — ver a trilha de PV no Cap. 07' },
  { id: 'tensao',   val: -2, nome: 'Tensão da mesa',      desc: 'A penalidade da faixa atual entra em todo teste sob pressão', dyn: 'tensao' },
  { id: 'semequip', val: -3, nome: 'Sem Equipamento',     desc: 'Tentando sem as ferramentas mínimas' },
  { id: 'escuro',   val: -2, nome: 'Escuridão / Névoa',   desc: 'Visibilidade extremamente reduzida' },
];

// ── HELPERS ───────────────────────────────────────

function pericia(nome) {
  if (!nome) return null;
  const alvo = nome.trim().toLowerCase();
  return PERICIAS.find(p => p.nome.toLowerCase() === alvo) || null;
}

function atributoDaPericia(nome) {
  const p = pericia(nome);
  return p ? p.attr : '';
}

function profissao(nome) {
  if (!nome) return null;
  return PROFISSOES.find(p => p.nome === nome) || null;
}

// Perícias agrupadas na ordem em que o livro as apresenta.
const PERICIAS_ORDEM = ['FORÇA', 'RESISTÊNCIA', 'COMBATE', 'SOCIAL', 'CONHECIMENTO', 'AGILIDADE', 'SOBREVIVÊNCIA'];

function periciasPorCategoria() {
  const out = {};
  PERICIAS_ORDEM.forEach(c => { out[c] = PERICIAS.filter(p => p.cat === c); });
  return out;
}
