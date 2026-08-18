// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — AS DECISÕES DA CASA
//
//  O livro deixou 142 buracos: números que faltam, efeitos nomeados e
//  nunca descritos, e passagens que se contradizem. Cada um deles foi
//  arbitrado seguindo os seis princípios de PRINCIPIOS-DE-ARBITRAGEM.md,
//  e cada arbitragem carrega o texto original, a regra nova, o princípio
//  que a produziu e a citação que a sustenta.
//
//  Este arquivo NÃO tem decisão nenhuma dentro dele. Ele só sabe:
//
//    · juntar as listas (`decisoes-livro.js`, `decisoes-clas-*.js`);
//    · achar a decisão que afeta uma técnica, um clã ou uma regra;
//    · aplicar as que viram número — o custo de atributo até +4, os
//      valores corrigidos de uma técnica, o CD que faltava;
//    · desenhar o painel onde elas ficam visíveis.
//
//  REGRA QUE NÃO SE QUEBRA: nada aqui se disfarça de livro. Toda regra
//  que veio de arbitragem aparece com o selo "decisão da casa" e o
//  texto original a um clique. Quem joga precisa saber o que é do autor
//  e o que é da ficha.
// ══════════════════════════════════════════════════════════════════

let _decisoes = null;

function decisoesAvdf() {
  if (_decisoes) return _decisoes;
  const lotes = [];
  //  Cada lote pode não estar carregado — uma instalação que copiou só
  //  parte dos arquivos continua funcionando com o que tiver.
  if (typeof DECISOES_LIVRO_AVDF !== 'undefined')       lotes.push(DECISOES_LIVRO_AVDF);
  if (typeof DECISOES_CLAS_KONOHA_AVDF !== 'undefined') lotes.push(DECISOES_CLAS_KONOHA_AVDF);
  if (typeof DECISOES_CLAS_KONOHA2_AVDF !== 'undefined') lotes.push(DECISOES_CLAS_KONOHA2_AVDF);
  if (typeof DECISOES_CLAS_MUNDO_AVDF !== 'undefined')  lotes.push(DECISOES_CLAS_MUNDO_AVDF);
  _decisoes = lotes.flat();
  return _decisoes;
}

function decisaoAvdf(id) {
  return decisoesAvdf().find(d => d.id === id) || null;
}

function decisoesDoClaAvdf(idCla) {
  return decisoesAvdf().filter(d => d.cla === idCla);
}

//  A decisão que corrige uma técnica do catálogo, se houver.
function decisaoDaTecnicaAvdf(idTecnica) {
  if (!idTecnica) return null;
  return decisoesAvdf().find(d => d.aplica && d.aplica.tecnica === idTecnica) || null;
}


// ══════════════════════════════════════════════════════════════════
//  APLICAR AS QUE VIRAM NÚMERO
//
//  Roda uma vez, quando o sistema carrega. Cada função abaixo aplica um
//  tipo de `aplica` e deixa registro de quantas mexeu, para o painel
//  poder dizer "34 técnicas corrigidas" em vez de mudar as coisas em
//  silêncio.
// ══════════════════════════════════════════════════════════════════

const APLICADAS_AVDF = { tecnicas: [], custos: [], cds: [], novas: [] };

//  1 · O custo de aumentar atributo. A tabela do livro só tinha +5 a
//     +8; um Genin (teto +4) não tinha preço para nada.
function _aplicarCustoDeAtributo() {
  const d = decisoesAvdf().find(x => x.aplica && x.aplica.ptAtributo);
  if (!d || typeof PT_CUSTOS_AVDF === 'undefined') return;
  const antes = { ...PT_CUSTOS_AVDF.atributo };
  Object.entries(d.aplica.ptAtributo).forEach(([grau, pt]) => {
    if (PT_CUSTOS_AVDF.atributo[grau] == null) PT_CUSTOS_AVDF.atributo[grau] = pt;
  });
  const novos = Object.keys(PT_CUSTOS_AVDF.atributo).filter(k => antes[k] == null);
  if (novos.length) APLICADAS_AVDF.custos.push({ id: d.id, graus: novos });
}

//  2 · As técnicas que ganharam rank, custo, dano ou selos. O catálogo
//     continua com o texto do livro; o que muda é o número, e a técnica
//     passa a carregar `decisao` para a tela poder marcar o selo.
//  Achar a técnica que uma decisão cita. O id da decisão nem sempre é
//  igual ao do catálogo — a decisão diz `gokakyu`, o catálogo tem
//  `katon_gokakyu`, porque lá o prefixo é a natureza. Então: id exato,
//  depois sufixo, depois o nome sem acento.
//  O acervo onde procurar: as técnicas do livro MAIS as exclusivas dos
//  clãs (que nascem em `clas-*.js` e só viram objeto de técnica quando
//  o catálogo é montado). Metade das decisões cita técnica de clã — o
//  Kagemane é do Nara —, então procurar só em JUTSUS_AVDF acha pouco.
function _acervoDeTecnicas() {
  const base = typeof JUTSUS_AVDF !== 'undefined' ? JUTSUS_AVDF : [];
  if (typeof _avdfCatalogo !== 'undefined' && _avdfCatalogo) return _avdfCatalogo;
  return base;
}

function _tecnicaCitada(ref) {
  const acervo = _acervoDeTecnicas();
  if (!ref || !acervo.length) return null;
  const alvo = String(ref).toLowerCase();
  return acervo.find(j => j.id === alvo)
      || acervo.find(j => j.id.endsWith('_' + alvo) || alvo.endsWith('_' + j.id))
      || acervo.find(j => avdfPericiaId(j.nome) === alvo)
      || acervo.find(j => avdfPericiaId(j.nome).endsWith('_' + alvo))
      || null;
}

function _aplicarCorrecoesDeTecnica() {
  if (typeof JUTSUS_AVDF === 'undefined') return;

  decisoesAvdf().forEach(d => {
    const a = d.aplica;
    if (!a || !a.tecnica) return;
    const j = _tecnicaCitada(a.tecnica);
    if (!j) return;
    const mudou = [];
    ['rank', 'pc', 'selos', 'dano', 'cd', 'duracao', 'alcance', 'acesso'].forEach(campo => {
      if (a[campo] != null && String(j[campo]) !== String(a[campo])) {
        j['_livro_' + campo] = j[campo];      // o valor original, para o painel mostrar
        j[campo] = a[campo];
        mudou.push(campo);
      }
    });
    if (a.efeito && a.efeito !== j.efeito) { j._livro_efeito = j.efeito; j.efeitoDaCasa = a.efeito; }
    if (mudou.length || a.efeito) {
      j.decisao = d.id;
      APLICADAS_AVDF.tecnicas.push({ id: d.id, tecnica: j.nome, campos: mudou });
    }
  });
}

//  3 · Os CDs que faltavam. A forma vem do princípio P3 — CD = 10 + o
//     atributo de quem aplicou —, então o que se guarda é a fórmula, e
//     não um número: a mesma técnica dá CD diferente em mãos diferentes.
function _aplicarCds() {
  if (typeof JUTSUS_AVDF === 'undefined') return;
  decisoesAvdf().forEach(d => {
    const a = d.aplica;
    if (!a) return;
    //  `condicaoCd` costuma vir como LISTA — uma decisão só resolve o CD
    //  de todas as técnicas que impõem a mesma condição.
    const bruto = a.condicaoCd || (a.cd != null && a.tecnica ? { tecnica: a.tecnica, cd: a.cd } : null);
    if (!bruto) return;
    const alvos = Array.isArray(bruto) ? bruto : [bruto];
    alvos.forEach(alvo => {
      if (!alvo || !alvo.tecnica) return;
      const j = _tecnicaCitada(alvo.tecnica);
      if (!j || j.cdDaCasa) return;
      j.cdDaCasa = alvo.atributo
        ? { base: alvo.base ?? 10, atributo: alvo.atributo }
        : { fixo: alvo.cd ?? a.cd };
      j.decisao = j.decisao || d.id;
      APLICADAS_AVDF.cds.push({ id: d.id, tecnica: j.nome });
    });
  });
}

//  4 · As técnicas que não existiam — os "efeitos nomeados e nunca
//     descritos" do princípio P6. Entram no catálogo marcadas como
//     `daCasa`, para nunca serem confundidas com técnica do livro.
function _aplicarTecnicasNovas() {
  if (typeof JUTSUS_AVDF === 'undefined') return;
  decisoesAvdf().forEach(d => {
    const t = d.aplica && d.aplica.tecnicaNova;
    if (!t || !t.nome) return;
    const id = 'casa_' + avdfPericiaId(t.nome);
    if (JUTSUS_AVDF.some(j => j.id === id)) return;
    JUTSUS_AVDF.push({
      id, nome: t.nome, rank: t.rank ?? null, pc: t.pc ?? null,
      natureza: t.natureza ?? null,
      categoria: t.categoria || (d.cla ? 'cla' : 'geral'),
      acesso: d.cla ? `Exclusiva — ${d.cla}` : 'Livre',
      efeito: t.efeito || '', alcance: t.alcance, cd: t.cd,
      acao: t.execucao, requisito: t.requisito,
      decisao: d.id, daCasa: true,
    });
    APLICADAS_AVDF.novas.push({ id: d.id, tecnica: t.nome });
  });
}

//  Chamado uma vez, quando a ficha do sistema é montada.
let _decisoesAplicadas = false;
function aplicarDecisoesAvdf() {
  if (_decisoesAplicadas) return APLICADAS_AVDF;
  _decisoesAplicadas = true;
  //  Monta o catálogo primeiro: é ele que tem as técnicas de clã, e
  //  metade das decisões fala delas.
  if (typeof avdfCatalogoJutsus === 'function') { try { avdfCatalogoJutsus(); } catch (e) {} }
  try {
    _aplicarCustoDeAtributo();
    _aplicarCorrecoesDeTecnica();
    _aplicarCds();
    _aplicarTecnicasNovas();
  } catch (e) {
    console.error('[decisões] falhei ao aplicar:', e);
  }
  return APLICADAS_AVDF;
}


// ══════════════════════════════════════════════════════════════════
//  O CD DE UMA TÉCNICA, JÁ RESOLVIDO
//
//  Se o livro deu um CD, é ele. Se não deu e há decisão, é a fórmula da
//  decisão aplicada aos atributos de quem está usando.
// ══════════════════════════════════════════════════════════════════
function cdDaTecnicaAvdf(j, attr) {
  if (!j) return null;
  if (j.cd != null && !j.cdDaCasa) return { valor: j.cd, doLivro: true };
  const c = j.cdDaCasa;
  if (!c) return null;
  if (c.fixo != null) return { valor: c.fixo, doLivro: false, decisao: j.decisao };
  const a = attr || (typeof _attrDaTela === 'function' ? _attrDaTela() : {});
  const mod = parseInt(a[c.atributo], 10) || 0;
  return {
    valor: c.base + mod, doLivro: false, decisao: j.decisao,
    conta: `${c.base} + ${String(c.atributo).toUpperCase()} (${mod >= 0 ? '+' : ''}${mod})`,
  };
}


// ══════════════════════════════════════════════════════════════════
//  NÃO EXISTE PAINEL AQUI, E É DE PROPÓSITO
//
//  Houve uma seção "Decisões da casa" na ficha, listando as 107
//  arbitragens com busca e filtros. Ela foi removida a pedido do autor.
//
//  O que ficou é o que importa em jogo: as decisões continuam VALENDO.
//  O custo de atributo até +4, os valores corrigidos das técnicas, os
//  CDs que faltavam — tudo isso segue sendo aplicado por
//  `aplicarDecisoesAvdf()` logo acima, e cada técnica corrigida ainda
//  carrega `decisao` (o id) e `_livro_<campo>` (o valor original), caso
//  algum dia se queira mostrar isso de novo.
//
//  O registro das decisões, para leitura humana, vive fora do site:
//  na Errata Oficial em PDF e nos arquivos `decisoes-*.js`.
// ══════════════════════════════════════════════════════════════════
