// ══════════════════════════════════════════════════════════════════
//  NÚCLEO — O ROLADOR
//
//  Rolar um dado parece a parte mais simples de um VTT, e é a que mais
//  varia entre sistemas. O Fractured rola 1d20, soma modificadores e
//  compara com uma dificuldade: deu ou não deu. A Vontade do Fogo rola
//  2d20 e fica com o maior quando você tem Vantagem, e depois separa o
//  resultado em quatro faixas — Decisivo, Sucesso, Falha Próxima,
//  Falha Grave. Não é o mesmo motor com outro número.
//
//  Por isso o sistema declara duas funções:
//    montar(ctx)                → quais dados rolar e quanto somar
//    interpretar(total, dif, d) → o que aquele número significa
//
//  Este arquivo só executa: sorteia, aplica "fica com o maior/menor" e
//  devolve o resultado pronto para o feed.
// ══════════════════════════════════════════════════════════════════

function _d(faces) { return Math.floor(Math.random() * faces) + 1; }

//  Rola o que o sistema pediu.
//  Devolve { valores, principal, soma, bonus, total }.
//    valores   todos os dados sorteados (para mostrar "18, 7" na Vantagem)
//    principal o dado que conta — o maior, o menor, ou o único
function rolarPlano(plano) {
  const valores = [];
  let soma = 0, principal = null;

  (plano.dados || []).forEach(grupo => {
    const qtd = Math.max(1, grupo.qtd || 1);
    const faces = grupo.faces || 20;
    const saiu = Array.from({ length: qtd }, () => _d(faces));
    valores.push(...saiu);

    let conta;
    if (grupo.manter === 'maior')      conta = [Math.max(...saiu)];
    else if (grupo.manter === 'menor') conta = [Math.min(...saiu)];
    else                               conta = saiu;

    soma += conta.reduce((s, v) => s + v, 0);
    if (principal === null) principal = conta[0];
  });

  const bonus = plano.bonus || 0;
  return { valores, principal, soma, bonus, total: soma + bonus };
}

//  A leitura do resultado. Se o sistema não declarar `interpretar`,
//  cai na regra mais comum: total ≥ dificuldade é sucesso.
function interpretarRolagem(total, dif, principal) {
  const f = S().rolagem?.interpretar;
  if (typeof f !== 'function') {
    if (dif == null) return null;
    return total >= dif
      ? { chave: 'sucesso', texto: '✓ SUCESSO', cor: 'var(--green)' }
      : { chave: 'falha',   texto: '✗ FALHA',   cor: 'var(--red)'   };
  }
  try { return f(total, dif, principal); }
  catch (e) { console.error('[rolagem] o sistema não conseguiu ler o resultado:', e); return null; }
}
