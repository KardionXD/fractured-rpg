// ══════════════════════════════════════════════════════════════════
//  NÚCLEO — REGISTRO DE SISTEMAS
//
//  Este arquivo é o único lugar do projeto que sabe que existe mais de
//  um sistema de RPG. Nada além dele pergunta "qual é o sistema?" —
//  o resto do código pergunta "o que o sistema declarou?".
//
//  Um sistema é um objeto que descreve seus atributos, como o valor
//  bruto vira modificador, quais valores são derivados, quais recursos
//  o personagem tem, como se rola e como se calcula a iniciativa.
//  Quem quiser adicionar um quarto sistema cria uma pasta em
//  /sistemas, chama registrarSistema() e não toca em mais nada.
//
//  Ordem de carregamento (ver app.html):
//    1. nucleo/registro.js        ← este arquivo
//    2. sistemas/<id>/conteudo.js ← as listas (perícias, profissões…)
//    3. sistemas/<id>/regras.js   ← as fórmulas
//    4. sistemas/<id>/sistema.js  ← a declaração, que chama registrarSistema
//    5. o resto do app
// ══════════════════════════════════════════════════════════════════

const SISTEMAS = {};
let _sistemaPadrao = null;

function registrarSistema(def) {
  if (!def || !def.id) { console.error('[sistema] definição sem id', def); return; }
  SISTEMAS[def.id] = def;
  if (!_sistemaPadrao) _sistemaPadrao = def.id;
}

// Todos os sistemas registrados, para a tela de escolha da mesa.
function sistemasDisponiveis() {
  return Object.values(SISTEMAS);
}

// ── O SISTEMA DA MESA ABERTA ─────────────────────────────────────
//
//  A mesa é o contexto. Ela sabe qual sistema usa, e o app inteiro
//  pergunta a ela — nunca ao usuário, nunca a uma variável de tela.
//
//  Enquanto a coluna `mesas.sistema` não existir no banco, `MESA.sistema`
//  vem `undefined` e caímos no Fractured. É de propósito: toda mesa que
//  existe hoje é Fractured, e assim o código novo roda antes da migração.
function S() {
  let id = null;
  // `MESA` é declarada com `let` em mesas.js, que carrega DEPOIS deste
  // arquivo. Ler uma variável `let` antes da declaração executar não dá
  // `undefined` — dá ReferenceError, e `typeof` também estoura. Por isso
  // o try: se alguém chamar S() cedo demais, cai no padrão em vez de
  // derrubar a página.
  try { id = (MESA && MESA.sistema) || null; } catch (e) { id = null; }
  const s = SISTEMAS[id || _sistemaPadrao] || SISTEMAS[_sistemaPadrao];
  if (!s) throw new Error('[sistema] nenhum sistema registrado — confira a ordem dos <script> em app.html');
  return s;
}

function sistemaId() { return S().id; }

// ── ATALHOS QUE O NÚCLEO USA ─────────────────────────────────────

//  Normaliza atributos vindos de qualquer lugar para { for, res, com, ... }.
//  As fichas vêm do banco com `attr_res`; os NPCs vêm com `res`; a tela
//  às vezes tem só um valor solto. Esta função aceita os três.
function atributosDe(origem) {
  if (!origem) return {};
  const out = {};
  S().atributos.forEach(a => {
    const v = origem['attr_' + a.id] ?? origem[a.id] ?? origem[a.sigla?.toLowerCase()];
    out[a.id] = parseInt(v, 10) || 0;
  });
  return out;
}

//  Valor bruto → bônus. No Fractured é `valor − 3`; em outro sistema
//  pode ser o próprio valor, ou (valor − 10) / 2.
function modAtrib(valor) {
  return S().modificador(parseInt(valor, 10) || 0);
}

//  Um valor derivado (PV máximo, Chakra máximo, Defesa…) pelo id.
//  `attr` é o objeto normalizado de atributosDe().
function derivado(id, attr) {
  const d = (S().derivados || []).find(x => x.id === id);
  if (!d) { console.warn('[sistema] derivado desconhecido:', id, 'em', S().id); return 0; }
  return d.calc(attr || {});
}

//  O texto de ajuda que acompanha o derivado na ficha ("RES × 4 = máx 20").
function derivadoTexto(id, attr) {
  const d = (S().derivados || []).find(x => x.id === id);
  return d && d.formula ? d.formula(attr || {}) : '';
}

//  Iniciativa — cada sistema decide o que soma ao d20.
function rolarIniciativa(attr) {
  return S().combate.iniciativa(attr || {});
}


// ══════════════════════════════════════════════════════════════════
//  A FICHA NO BANCO — ESCRITA DUPLA E LEITURA EM CASCATA
//
//  A tabela `fichas` nasceu com 22 colunas do Fractured. Para caber
//  outro sistema ela ganhou uma coluna `dados` (jsonb), livre.
//
//  A troca não pode ser de uma vez: enquanto houver alguém com o site
//  aberto na versão antiga, quem grava é o código antigo, e ele só
//  conhece as colunas. Por isso, nesta fase:
//
//    · GRAVAR  → escreve nos DOIS lugares, sempre.
//    · LER     → para o Fractured, as colunas mandam (é o formato que
//                todo cliente sabe escrever). Para um sistema novo,
//                que não tem colunas, lê de `dados`.
//
//  Quando a ficha declarativa entrar (fase 5) e as colunas pararem de
//  ser escritas, basta tirar o `colunasLegado: true` do módulo — e a
//  leitura passa a vir de `dados` sem mais nenhuma mudança.
// ══════════════════════════════════════════════════════════════════

//  A coluna `dados` só existe depois que a migração 002 for rodada no
//  Supabase. Se alguém subir o site antes de rodar o SQL, gravar com o
//  campo faria o salvamento FALHAR — e o jogador perderia a ficha sem
//  entender por quê. Este sinalizador desliga o formato novo assim que
//  o banco disser que a coluna não existe: o site volta a gravar só nas
//  colunas antigas, como antes, e continua funcionando.
let _semColunaDados = false;

//  O banco reclamou de coluna inexistente? (PostgREST 204 / Postgres 42703)
function erroDeColunaAusente(erro, coluna) {
  if (!erro) return false;
  const txt = `${erro.code || ''} ${erro.message || ''} ${erro.details || ''}`.toLowerCase();
  return (erro.code === 'PGRST204' || erro.code === '42703' ||
          txt.includes('does not exist') || txt.includes('não existe'))
      && txt.includes(coluna);
}

// ══════════════════════════════════════════════════════════════════
//  O QUE PODE IR PARA AS COLUNAS DA TABELA — E O QUE NÃO PODE
//
//  A tabela `fichas` tem colunas do Fractured: attr_for, trauma,
//  veiculo_comb_max, profissao… Um sistema novo tem campos que NÃO
//  existem lá — rank, vila, clã, naturezas, jutsus — e mandar um
//  desses para o Supabase derruba a gravação inteira:
//
//      Could not find the 'cla' column of 'fichas' in the schema cache
//
//  A regra passa a ser: campo de sistema NUNCA vira coluna. Ele vai
//  dentro de `dados` (jsonb), que é livre. `_sistema` é a bandeja onde
//  a tela entrega esses campos ao núcleo; ela é lida por `paraDados` e
//  removida antes de a linha chegar ao banco.
//
//  Isto resolve a classe do problema, não um campo: qualquer campo que
//  um sistema inventar amanhã já nasce do lado certo.
// ══════════════════════════════════════════════════════════════════

//  A visão completa da ficha — colunas + campos do sistema — para quem
//  precisa montar o `dados`.
function fichaCompleta(linha) {
  const extra = linha && linha._sistema;
  return extra ? { ...linha, ...extra } : (linha || {});
}

//  A linha pronta para o banco: sem a bandeja, e sem nenhuma chave que
//  não seja coluna de verdade.
function fichaParaBanco(linha) {
  const fora = { ...linha };
  delete fora._sistema;
  //  Colunas que o banco recusou em alguma gravação anterior desta
  //  sessão. Ver `fichaTratarErro`.
  _colunasRecusadas.forEach(c => delete fora[c]);
  return fora;
}

//  Acrescenta `dados` à linha que vai para o banco, e tira dela tudo o
//  que não é coluna.
function fichaComDados(linha) {
  const base = fichaParaBanco(linha);
  if (_semColunaDados) return base;
  const f = S().ficha || {};
  if (typeof f.paraDados !== 'function') return base;
  try {
    return { ...base, dados: f.paraDados(fichaCompleta(linha)) };
  } catch (e) {
    // Um erro aqui NÃO pode impedir o salvamento. Grava sem `dados`;
    // a próxima gravação tenta de novo.
    console.error('[ficha] não consegui montar o formato novo:', e);
    return base;
  }
}

//  Colunas que este banco não tem. Descobertas pelo próprio erro, e
//  lembradas até a página recarregar — assim o segundo salvamento já
//  nasce certo em vez de errar de novo.
const _colunasRecusadas = new Set();

//  Qual coluna o banco disse que não existe? A mensagem do PostgREST é
//  «Could not find the 'cla' column of 'fichas' in the schema cache»;
//  a do Postgres é «column "cla" of relation "fichas" does not exist».
function _colunaDoErro(erro) {
  const txt = `${erro?.message || ''} ${erro?.details || ''}`;
  const m = txt.match(/'([^']+)' column/) || txt.match(/column "([^"]+)"/);
  return m ? m[1] : null;
}

//  Chamado quando a gravação falha. Devolve `true` quando vale a pena
//  tentar de novo — porque a linha foi corrigida.
//
//  Dois casos:
//   · a coluna `dados` não existe → a migração 002 não foi rodada;
//     desliga o formato novo e grava só nas colunas de sempre.
//   · qualquer OUTRA coluna não existe → o campo não pertence a esta
//     tabela. Anota, avisa no console e tenta de novo sem ele. Nenhum
//     jogador fica com a ficha travada por causa de um campo só.
function fichaTratarErro(erro) {
  if (erroDeColunaAusente(erro, 'dados')) {
    _semColunaDados = true;
    console.warn('[ficha] a coluna `dados` ainda não existe no banco — ' +
                 'gravando só no formato antigo. Rode migracao/002-ficha-dados.sql ' +
                 'no Supabase para ligar o formato novo.');
    return true;
  }
  const col = _colunaDoErro(erro);
  if (col && (erro.code === 'PGRST204' || erro.code === '42703') && !_colunasRecusadas.has(col)) {
    _colunasRecusadas.add(col);
    console.warn(`[ficha] a tabela não tem a coluna \`${col}\` — ` +
                 'gravando sem ela. Se este campo é de um sistema, ele deveria ' +
                 'estar dentro de `dados` (ver _sistema em coletarFicha).');
    return true;
  }
  return false;
}

//  A linha do banco, já no formato que a tela espera.
function fichaLida(linha) {
  if (!linha) return linha;
  const f = S().ficha || {};
  if (f.colunasLegado) return linha;              // Fractured: colunas mandam
  if (!linha.dados || !linha.dados.v) return linha;
  if (typeof f.deDados !== 'function') return linha;
  try {
    return { ...linha, ...f.deDados(linha.dados) };
  } catch (e) {
    console.error('[ficha] não consegui ler o formato novo:', e);
    return linha;
  }
}

//  Ficha antiga (gravada antes desta fase) não tem `dados`. Em vez de
//  pedir para a pessoa "salvar de novo", preenchemos em silêncio no
//  primeiro acesso. Ela não percebe, e na fase 5 já está tudo pronto.
async function fichaMigrarEmSilencio(linha) {
  if (_semColunaDados) return;
  if (!linha || !linha.id) return;
  if (linha.dados && linha.dados.v) return;       // já migrada
  const f = S().ficha || {};
  if (typeof f.paraDados !== 'function') return;
  try {
    const dados = f.paraDados(linha);
    const { error } = await db.from('fichas').update({ dados }).eq('id', linha.id);
    if (error) { fichaTratarErro(error); return; }
    console.info('[ficha] formato novo preenchido para a ficha', linha.id);
  } catch (e) {
    // Falhar aqui é inofensivo: a próxima gravação normal resolve.
    console.warn('[ficha] não deu para preencher o formato novo agora:', e?.message || e);
  }
}

//  Conferência de ida e volta. Roda uma vez por sessão, no primeiro
//  salvamento: passa a ficha pelas duas traduções e avisa se algum
//  campo não voltou igual. É o alarme que pega um erro de tradução
//  ANTES de ele virar dado perdido.
let _fichaConferida = false;
function fichaConferirIdaEVolta(bandeja) {
  if (_fichaConferida) return;
  _fichaConferida = true;
  const f = S().ficha || {};
  if (typeof f.paraDados !== 'function' || typeof f.deDados !== 'function') return;
  try {
    //  A conferência precisa da ficha INTEIRA — colunas mais os campos
    //  do sistema. Sem isso ela acusaria como perdido tudo o que mora
    //  em `_sistema`.
    const linha = fichaCompleta(bandeja);
    const volta = f.deDados(f.paraDados(linha));
    const difs = Object.keys(volta).filter(k =>
      JSON.stringify(volta[k]) !== JSON.stringify(linha[k] ?? volta[k]));
    if (difs.length) {
      console.warn('[ficha] ida e volta não bateu nos campos:', difs,
                   '\nIsso não perdeu nada (as colunas continuam sendo gravadas),',
                   'mas é um erro de tradução que precisa ser corrigido.');
    }
  } catch (e) {
    console.warn('[ficha] não consegui conferir a ida e volta:', e?.message || e);
  }
}

//  Os atributos de um NPC no formato que `derivado()` espera: as
//  chaves `attr_<id>` viram `<id>`.
function attributosDoNpc(attrs) {
  const fora = {};
  Object.keys(attrs || {}).forEach(k => { fora[k.replace(/^attr_/, '')] = attrs[k]; });
  return fora;
}
