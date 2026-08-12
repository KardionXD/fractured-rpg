// ══════════════════════════════════════════════════════════════════
//  FRACTURED — TRADUÇÃO ENTRE O BANCO ANTIGO E O FORMATO NOVO
//
//  A tabela `fichas` tem 22 colunas que só fazem sentido no Fractured:
//  attr_for, pv_atual, veiculo_comb_max, trauma, profissao… Um sistema
//  com chakra e rank não tem onde se encaixar ali.
//
//  A saída é uma coluna `dados` (jsonb) com um formato que serve a
//  qualquer sistema. Este arquivo faz as duas traduções:
//
//    paraDados  colunas antigas  →  objeto aninhado    (na hora de gravar)
//    deDados    objeto aninhado  →  colunas antigas    (na hora de ler)
//
//  Durante a transição as DUAS formas são gravadas a cada salvamento.
//  É o que torna esta fase reversível: se algo der errado, basta voltar
//  o código — as colunas continuam lá, completas e atualizadas.
//
//  As duas funções são inversas uma da outra. Existe um teste que passa
//  uma ficha por `paraDados` e depois por `deDados` e exige que volte
//  idêntica; se alguém mexer numa e esquecer a outra, o teste acusa.
// ══════════════════════════════════════════════════════════════════

function _n(v) { return parseInt(v, 10) || 0; }

// ── COLUNAS → OBJETO ──────────────────────────────────────────────
function fracParaDados(linha) {
  const r = linha || {};
  return {
    v: 1,
    sistema: 'fractured',

    // Atributos, com a chave curta que o contrato usa.
    attr: {
      for: _n(r.attr_for), res: _n(r.attr_res), com: _n(r.attr_com),
      soc: _n(r.attr_soc), con: _n(r.attr_con), agi: _n(r.attr_agi),
    },

    // Valores ATUAIS dos recursos. O máximo é sempre recalculado a
    // partir dos atributos — guardar máximo dá ficha desatualizada
    // quando a regra muda.
    recursos: {
      pv:     _n(r.pv_atual),
      sup:    _n(r.suprimentos),
      hum:    r.humanidade ?? null,   // null = ficha nova; a tela usa 10
      tensao: _n(r.tensao),
    },

    pericias:  Array.isArray(r.pericias) ? r.pericias : [],
    arquetipo: r.profissao || '',      // "Profissão" no Fractured

    campos: { trauma: r.trauma || '' },

    // Coisas que só o Fractured tem. Outro sistema traz outras chaves
    // aqui, e o núcleo não precisa saber o que são.
    blocos: {
      vinculos: Array.isArray(r.vinculos) ? r.vinculos : [],
      itens:    Array.isArray(r.itens)    ? r.itens    : [],
      veiculo: {
        tipo:      r.veiculo_tipo || '',
        tiAtual:   _n(r.veiculo_ti_atual),
        tiMax:     _n(r.veiculo_ti_max),
        combAtual: _n(r.veiculo_comb_atual),
        combMax:   _n(r.veiculo_comb_max),
      },
      // Fichas bem antigas tinham só um texto livre de inventário.
      // Carregamos junto para não perder o que a pessoa escreveu.
      inventarioLegado: r.inventario || '',
    },
  };
}

// ── OBJETO → COLUNAS ──────────────────────────────────────────────
function fracDeDados(dados) {
  const d = dados || {};
  const a = d.attr     || {};
  const c = d.recursos || {};
  const b = d.blocos   || {};
  const v = b.veiculo  || {};
  return {
    attr_for: _n(a.for), attr_res: _n(a.res), attr_com: _n(a.com),
    attr_soc: _n(a.soc), attr_con: _n(a.con), attr_agi: _n(a.agi),

    pv_atual:    _n(c.pv),
    suprimentos: _n(c.sup),
    humanidade:  c.hum ?? null,
    tensao:      _n(c.tensao),

    pericias:  Array.isArray(d.pericias) ? d.pericias : [],
    profissao: d.arquetipo || '',
    trauma:    (d.campos || {}).trauma || '',

    vinculos: Array.isArray(b.vinculos) ? b.vinculos : [],
    itens:    Array.isArray(b.itens)    ? b.itens    : [],

    veiculo_tipo:       v.tipo || '',
    veiculo_ti_atual:   _n(v.tiAtual),
    veiculo_ti_max:     _n(v.tiMax),
    veiculo_comb_atual: _n(v.combAtual),
    veiculo_comb_max:   _n(v.combMax),

    inventario: b.inventarioLegado || '',
  };
}

// ══════════════════════════════════════════════════════════════════
//  O MESMO, PARA OS NPCs DO MESTRE
//
//  A tabela `npcs_mestre` tem as mesmas seis colunas de atributo
//  (`for_`, `res`, `com`, `soc`, `con`, `agi`) e o mesmo problema.
//  A tradução é mais simples porque um NPC é quase só atributos.
//  Repare no `for_`: "for" é palavra reservada em SQL.
// ══════════════════════════════════════════════════════════════════

function fracNpcParaDados(linha) {
  const r = linha || {};
  return {
    v: 1,
    sistema: 'fractured',
    attr: {
      for: _n(r.for_), res: _n(r.res), com: _n(r.com),
      soc: _n(r.soc), con: _n(r.con), agi: _n(r.agi),
    },
    recursos: { pvMax: _n(r.pv_max) },
    campos: {
      habilidades: r.habilidades || '',
      fraqueza:    r.fraqueza    || '',
    },
  };
}

function fracNpcDeDados(dados) {
  const d = dados || {};
  const a = d.attr || {};
  const c = d.recursos || {};
  const m = d.campos || {};
  return {
    for_: _n(a.for), res: _n(a.res), com: _n(a.com),
    soc:  _n(a.soc), con: _n(a.con), agi: _n(a.agi),
    pv_max: _n(c.pvMax),
    habilidades: m.habilidades || null,
    fraqueza:    m.fraqueza    || null,
  };
}
