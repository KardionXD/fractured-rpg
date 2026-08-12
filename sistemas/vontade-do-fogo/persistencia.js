// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — A FICHA NO BANCO
//
//  Aqui não existe dívida: este sistema nunca teve colunas próprias na
//  tabela `fichas`, então ele nasce lendo e gravando SÓ na coluna
//  `dados` (jsonb). Por isso não há `colunasLegado` na declaração — e
//  por isso este arquivo é bem menor que o equivalente do Fractured,
//  que ainda precisa traduzir 22 colunas.
// ══════════════════════════════════════════════════════════════════

function _an(v) { return parseInt(v, 10) || 0; }

//  A ficha vai para o banco no formato livre. `deDados` devolve o
//  objeto achatado que a tela usa, com o mesmo nome de campo dos ids.
function avdfDeDados(dados) {
  const d = dados || {};
  const a = d.attr     || {};
  const c = d.recursos || {};
  const m = d.campos   || {};
  const b = d.blocos   || {};
  return {
    attr_tai: _an(a.tai), attr_nin: _an(a.nin), attr_gen: _an(a.gen),
    attr_ctr: _an(a.ctr), attr_cor: _an(a.cor), attr_esp: _an(a.esp),

    pv_atual:  _an(c.pv),
    pc_atual:  _an(c.pc),
    pvf_atual: c.pvf ?? 3,       // Vontade do Fogo começa cheia a cada sessão
    exa_atual: _an(c.exa),

    rank:      d.progressao || 'genin',
    vila:      m.vila || '',
    idade:     m.idade || '',
    ninjaway:  m.ninjaway || '',
    naturezas: Array.isArray(b.naturezas) ? b.naturezas : [],
    cla:         b.cla || '',
    cla_estagio: b.claEstagio || '1',
    passivas:    b.passivas || '',
    tecnicas:    b.tecnicas || '',
    pericias:  Array.isArray(d.pericias) ? d.pericias : [],
  };
}

//  O caminho inverso: da tela para o banco.
function avdfParaDados(linha) {
  const r = linha || {};
  return {
    v: 1,
    sistema: 'vontade-do-fogo',
    attr: {
      tai: _an(r.attr_tai), nin: _an(r.attr_nin), gen: _an(r.attr_gen),
      ctr: _an(r.attr_ctr), cor: _an(r.attr_cor), esp: _an(r.attr_esp),
    },
    recursos: {
      pv:  _an(r.pv_atual),  pc:  _an(r.pc_atual),
      pvf: r.pvf_atual ?? 3, exa: _an(r.exa_atual),
    },
    progressao: r.rank || 'genin',      // o rank do personagem
    pericias:   Array.isArray(r.pericias) ? r.pericias : [],
    campos: {
      vila: r.vila || '', idade: r.idade || '', ninjaway: r.ninjaway || '',
    },
    blocos: {
      naturezas:   Array.isArray(r.naturezas) ? r.naturezas : [],
      cla:         r.cla || '',
      claEstagio:  r.cla_estagio || '1',
      passivas:    r.passivas || '',
      tecnicas:    r.tecnicas || '',
    },
  };
}
