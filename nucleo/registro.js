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
