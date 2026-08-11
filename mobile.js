// ══════════════════════════════════════════════════════════════════
//  FRACTURED — CAMADA MOBILE
//
//  Tudo aqui só liga no celular. Nada altera o comportamento do
//  desktop: as funções checam `ehCelular()` antes de agir, e as que
//  não checam (teclado certo, rótulo de acessibilidade) só ADICIONAM
//  atributos que o navegador de mesa ignora.
//
//  Ordem de prioridade adotada, na que você pediu:
//    Rapidez → Praticidade → Clareza → Conforto → Estética
// ══════════════════════════════════════════════════════════════════

const MOB = {
  LARGURA: 768,          // acima disto é desktop
  tecladoAberto: false,
  alturaBase: 0,
  _historico: 0,         // quantas entradas de histórico nós empilhamos
  _voltandoInterno: false,
};

function ehCelular() {
  return window.matchMedia('(max-width: ' + MOB.LARGURA + 'px)').matches;
}
function ehToque() {
  return window.matchMedia('(pointer: coarse)').matches;
}

// Guarda coisas pequenas sem explodir se o navegador bloquear storage
// (aba anônima do iOS, por exemplo).
function mobGuardar(chave, valor) {
  try { localStorage.setItem('frac:' + chave, JSON.stringify(valor)); } catch (e) {}
}
function mobLer(chave, padrao) {
  try {
    const v = localStorage.getItem('frac:' + chave);
    return v === null ? padrao : JSON.parse(v);
  } catch (e) { return padrao; }
}


// ══════════════════════════════════════════════════════════════════
//  1) TECLADO CERTO EM CADA CAMPO
//
//  O `type="number"` sozinho não garante teclado numérico no iPhone —
//  quem manda lá é o `inputmode`. Em vez de editar 40 campos à mão
//  (e os que o JS cria depois nem existiriam ainda), a regra é aplicada
//  no DOM inteiro e repetida sempre que algo novo aparece.
//
//  Campos que aceitam negativo (modificador da rolagem) ficam de fora:
//  o teclado `numeric` do iOS não tem a tecla de menos e a pessoa
//  perderia a possibilidade de digitar −2.
// ══════════════════════════════════════════════════════════════════

function mobAjustarCampos(raiz) {
  const base = raiz || document;
  if (!base.querySelectorAll) return;

  base.querySelectorAll('input[type="number"]:not([data-mob])').forEach(inp => {
    inp.setAttribute('data-mob', '1');
    const min = parseFloat(inp.getAttribute('min'));
    const aceitaNegativo = !(Number.isFinite(min) && min >= 0);
    if (!aceitaNegativo) inp.setAttribute('inputmode', 'numeric');
    else                 inp.setAttribute('inputmode', 'text');
    // Rolar a roda do mouse sobre um number muda o valor sem querer.
    inp.addEventListener('wheel', e => { if (document.activeElement === inp) e.preventDefault(); },
                         { passive: false });
  });

  base.querySelectorAll('input[type="text"]:not([data-mob])').forEach(inp => {
    inp.setAttribute('data-mob', '1');
    if (!inp.hasAttribute('autocomplete')) inp.setAttribute('autocomplete', 'off');
    // Nome próprio, título, pasta: começar com maiúscula ajuda.
    const id = inp.id || '';
    if (/nome|titulo|título|pasta|jogador|trauma/i.test(id)) {
      inp.setAttribute('autocapitalize', 'sentences');
    } else if (/emoji|codigo|convite/i.test(id)) {
      inp.setAttribute('autocapitalize', 'off');
      inp.setAttribute('autocorrect', 'off');
    }
  });

  base.querySelectorAll('textarea:not([data-mob])').forEach(t => {
    t.setAttribute('data-mob', '1');
    t.setAttribute('autocapitalize', 'sentences');
    if (!t.hasAttribute('enterkeyhint')) t.setAttribute('enterkeyhint', 'enter');
  });

  // Campo de mensagem do chat: a tecla azul do teclado vira "enviar".
  base.querySelectorAll('#chat-input, #msg-input, [data-chat-input]').forEach(el => {
    el.setAttribute('enterkeyhint', 'send');
    el.setAttribute('autocapitalize', 'sentences');
  });
}


// ══════════════════════════════════════════════════════════════════
//  2) O TECLADO NÃO PODE QUEBRAR O LAYOUT
//
//  Quando o teclado sobe, o Android encolhe a janela e o iOS não —
//  ele só rola a página por baixo. Nos dois casos a barra de navegação
//  fixa na base sobe junto com o teclado e cobre justamente o campo
//  que a pessoa está digitando.
//
//  A `visualViewport` diz quanto da tela sobrou de verdade. Com isso:
//    · escondemos a barra de baixo enquanto o teclado está aberto;
//    · rolamos o campo em foco para dentro da parte visível.
// ══════════════════════════════════════════════════════════════════

function mobIniciarTeclado() {
  const vv = window.visualViewport;
  if (!vv) return;
  MOB.alturaBase = vv.height;

  const aoMudar = () => {
    if (!ehCelular()) return;
    // Diferença grande entre a janela e a área visível = teclado aberto.
    const diff = window.innerHeight - vv.height;
    const aberto = diff > 150;
    if (aberto === MOB.tecladoAberto) return;
    MOB.tecladoAberto = aberto;
    document.body.classList.toggle('teclado-aberto', aberto);
    if (aberto) setTimeout(mobRevelarFoco, 60);
  };

  vv.addEventListener('resize', aoMudar);
  vv.addEventListener('scroll', aoMudar);

  document.addEventListener('focusin', e => {
    if (!ehCelular()) return;
    const t = e.target;
    if (!t.matches || !t.matches('input, textarea, select, [contenteditable="true"]')) return;
    setTimeout(mobRevelarFoco, 260);
  });
}

// Traz o campo em foco para a faixa visível, sem pular a tela inteira.
function mobRevelarFoco() {
  const el = document.activeElement;
  if (!el || !el.getBoundingClientRect) return;
  if (!el.matches('input, textarea, select, [contenteditable="true"]')) return;
  const vv = window.visualViewport;
  const limite = vv ? vv.height : window.innerHeight;
  const r = el.getBoundingClientRect();
  // 24px de folga embaixo para o campo não encostar no teclado.
  if (r.bottom > limite - 24 || r.top < 8) {
    el.scrollIntoView({ block: 'center', behavior: mobAnimacaoOk() ? 'smooth' : 'auto' });
  }
}

function mobAnimacaoOk() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


// ══════════════════════════════════════════════════════════════════
//  3) O APP LEMBRA ONDE VOCÊ ESTAVA
//
//  Abrir o site e cair sempre na Ficha custa dois toques a cada
//  recarregamento — e no celular a página recarrega sozinha quando o
//  sistema descarta a aba. Guardamos a última tela, a última aba da
//  Sala, a altura da folha e a pasta de NPCs escolhida.
// ══════════════════════════════════════════════════════════════════

function mobIniciarMemoria() {
  // ── última tela ──
  if (typeof window.navigate === 'function') {
    const anterior = window.navigate;
    window.navigate = function (page) {
      mobSalvarRolagemPagina();
      anterior.apply(this, arguments);
      mobGuardar('pagina', page);
      mobMarcarNav(page);
      // A Sala tem regras próprias de espaço (mapa em tela cheia).
      document.body.classList.toggle('na-sala', page === 'sala');
      requestAnimationFrame(() => mobRestaurarRolagemPagina(page));
    };
  }

  // ── pasta de NPCs ──
  if (typeof window.npcFiltrarPasta === 'function') {
    const anterior = window.npcFiltrarPasta;
    window.npcFiltrarPasta = function (p) { mobGuardar('npcPasta', p); return anterior.apply(this, arguments); };
  }

  // ── aba da folha na Sala ──
  if (typeof window.switchMobileTab === 'function') {
    const anterior = window.switchMobileTab;
    window.switchMobileTab = function (id) { mobGuardar('salaAba', id); return anterior.apply(this, arguments); };
  }
}

// Marca a aba certa também para leitores de tela.
function mobMarcarNav(page) {
  document.querySelectorAll('.mobile-nav-btn, .nav-item').forEach(b => {
    const ativo = b.classList.contains('active');
    if (ativo) b.setAttribute('aria-current', 'page');
    else       b.removeAttribute('aria-current');
  });
}

const _mobRolagem = {};
function mobSalvarRolagemPagina() {
  const atual = mobLer('pagina', 'ficha');
  const el = document.getElementById('page-' + atual);
  const cont = document.querySelector('.main-content');
  if (cont) _mobRolagem[atual] = cont.scrollTop;
  else if (el) _mobRolagem[atual] = el.scrollTop;
}
function mobRestaurarRolagemPagina(page) {
  const y = _mobRolagem[page];
  if (!y) return;
  const cont = document.querySelector('.main-content');
  if (cont) cont.scrollTop = y;
}

// Chamado depois que o app terminou de carregar (ver mobIniciar).
function mobVoltarParaUltimaTela() {
  const page = mobLer('pagina', null);
  if (!page || page === 'ficha') return;
  // Telas de mestre só existem se a pessoa for mestre.
  if ((page === 'master' || page === 'npcs') && !window.isMaster) return;
  const btn = document.getElementById('mnav-' + page) || document.getElementById('nav-' + page);
  if (!btn || btn.style.display === 'none') return;
  try { window.navigate(page); } catch (e) {}
}


// ══════════════════════════════════════════════════════════════════
//  4) O BOTÃO VOLTAR DO ANDROID FECHA O QUE ESTÁ ABERTO
//
//  Sem isto, quem tem um modal aberto e aperta "voltar" sai do app e
//  perde a sessão inteira. Agora "voltar" fecha o modal; só sai do app
//  quando não há nada aberto.
// ══════════════════════════════════════════════════════════════════

// Com um modal aberto, o fundo não pode rolar por baixo dele —
// no celular isso faz a pessoa perder a posição na lista sem perceber.
function mobTravarFundo() {
  const algumAberto = Array.from(document.querySelectorAll('.modal-overlay'))
    .some(m => getComputedStyle(m).display !== 'none');
  document.body.classList.toggle('folha-aberta', algumAberto && ehCelular());
}

function mobIniciarVoltar() {
  if (!ehToque()) return;

  const visiveis = () => Array.from(document.querySelectorAll('.modal-overlay'))
    .filter(m => getComputedStyle(m).display !== 'none');

  let abertosAntes = 0;

  const conferir = () => {
    const n = visiveis().length;
    if (n > abertosAntes) {
      // abriu um modal: empilha uma entrada para o "voltar" consumir
      for (let i = abertosAntes; i < n; i++) {
        history.pushState({ fracModal: true }, '');
        MOB._historico++;
      }
    } else if (n < abertosAntes && MOB._historico > 0 && !MOB._voltandoInterno) {
      // fechou pelo X: devolve a entrada que empilhamos
      MOB._voltandoInterno = true;
      MOB._historico--;
      history.back();
    }
    abertosAntes = n;
  };

  // Observa só o atributo `style` dos overlays — barato.
  const obs = new MutationObserver(() => { conferir(); mobTravarFundo(); });
  document.querySelectorAll('.modal-overlay').forEach(m =>
    obs.observe(m, { attributes: true, attributeFilter: ['style', 'class'] }));

  // Overlays criados depois (o JS monta alguns) entram no observador.
  new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1 && n.classList && n.classList.contains('modal-overlay')) {
        obs.observe(n, { attributes: true, attributeFilter: ['style', 'class'] });
      }
    }));
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', () => {
    if (MOB._voltandoInterno) { MOB._voltandoInterno = false; return; }
    const abertos = visiveis();
    if (abertos.length) {
      MOB._historico = Math.max(0, MOB._historico - 1);
      const topo = abertos[abertos.length - 1];
      topo.style.display = 'none';
      abertosAntes = visiveis().length;
      return;
    }
    // Folha da Sala expandida: voltar recolhe primeiro.
    const folha = document.getElementById('mobile-sheet');
    if (folha && folha.classList.contains('expanded')) {
      if (typeof window.switchMobileTab === 'function') window.switchMobileTab('mapa');
      history.pushState({ fracModal: true }, '');
      return;
    }
  });
}


// ══════════════════════════════════════════════════════════════════
//  5) MENOS TOQUES NO QUE MAIS SE REPETE
//
//  Na mesa, a ação mais repetida é rolar de novo o mesmo teste. Antes
//  eram cinco toques: abrir a folha → aba Dados → atributo → perícia →
//  rolar. Agora a última rolagem vira um botão de repetir.
// ══════════════════════════════════════════════════════════════════

const ULTIMA = { formula: null, expr: null };

function mobLembrarRolagem(tipo, dados) {
  if (tipo === 'formula') ULTIMA.formula = dados;
  if (tipo === 'expr')    ULTIMA.expr = dados;
  mobAtualizarBotaoRepetir();
}

function mobAtualizarBotaoRepetir() {
  const btn = document.getElementById('mob-repetir');
  if (!btn) return;
  const tem = !!(ULTIMA.formula || ULTIMA.expr);
  btn.disabled = !tem;
  btn.title = tem ? 'Repetir a última rolagem' : 'Role algo primeiro';
}

function mobRepetirRolagem() {
  if (ULTIMA.expr && typeof rolarExpressao === 'function') {
    rolarExpressao(ULTIMA.expr);
    if (typeof toast === 'function') toast('Repetiu: ' + ULTIMA.expr, 'ok');
    return;
  }
  if (ULTIMA.formula && typeof rolarFormula === 'function') {
    rolarFormula();
    return;
  }
  if (typeof toast === 'function') toast('Nenhuma rolagem para repetir ainda.', 'err');
}


// ══════════════════════════════════════════════════════════════════
//  6) FEEDBACK IMEDIATO
//
//  Toque que não responde na hora parece travamento, e a pessoa toca
//  de novo — o que no salvar da ficha vira duas gravações. Todo botão
//  que dispara ação de rede ganha estado "ocupado" por 700ms.
// ══════════════════════════════════════════════════════════════════

function mobIniciarFeedback() {
  document.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('button');
    if (!btn || btn.disabled) return;
    if (btn.classList.contains('mobile-nav-btn')) return;   // navegação é instantânea
    if (!/salvar|enviar|criar|adicionar|upload/i.test(btn.getAttribute('onclick') || '')) return;
    btn.classList.add('ocupado');
    setTimeout(() => btn.classList.remove('ocupado'), 700);
  }, true);
}


// ══════════════════════════════════════════════════════════════════
//  7) ACESSIBILIDADE — rótulo em botão que só tem ícone
//
//  Um botão com um emoji dentro é um botão sem nome para quem usa
//  leitor de tela. Onde existe `title`, ele vira `aria-label`; onde
//  não existe, usamos o texto do ícone.
// ══════════════════════════════════════════════════════════════════

function mobRotularBotoes(raiz) {
  const base = raiz || document;
  if (!base.querySelectorAll) return;
  base.querySelectorAll('button:not([aria-label]):not([data-mob-aria])').forEach(b => {
    b.setAttribute('data-mob-aria', '1');
    const texto = (b.textContent || '').trim();
    // Tem texto de verdade (mais que um emoji)? Então já tem nome.
    if (texto.replace(/[\p{Emoji}\p{S}\s·×✕✖]/gu, '').length >= 2) return;
    const rotulo = b.getAttribute('title') || b.getAttribute('data-fic') || texto;
    if (rotulo) b.setAttribute('aria-label', rotulo);
  });
  base.querySelectorAll('.modal-overlay:not([role])').forEach(m => {
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
  });
}


// ══════════════════════════════════════════════════════════════════
//  8) OBSERVADOR ÚNICO
//
//  O app monta boa parte da interface por JS. Um observador só, com
//  agendamento em quadro de animação, aplica os itens 1 e 7 no que
//  aparecer, sem custo perceptível.
// ══════════════════════════════════════════════════════════════════

// Imagens: só baixar o que está para aparecer.
// A galeria da mesa e a lista de NPCs podem ter dezenas de fotos. Sem
// `loading="lazy"` o celular baixa todas de uma vez ao abrir a tela —
// no 4G isso são vários megabytes antes de a primeira aparecer.
// `decoding="async"` tira a decodificação da linha de frente, então a
// rolagem não trava enquanto a imagem é processada.
function mobAliviarImagens(raiz) {
  const base = raiz || document;
  if (!base.querySelectorAll) return;
  base.querySelectorAll('img:not([data-mob-img])').forEach(img => {
    img.setAttribute('data-mob-img', '1');
    if (!img.hasAttribute('loading'))  img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    // Imagem sem descrição é ruído para leitor de tela; quando é só
    // enfeite (avatar ao lado do nome), o vazio é a resposta certa.
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
  });
}

let _mobPendente = false;
function mobAgendarVarredura() {
  if (_mobPendente) return;
  _mobPendente = true;
  requestAnimationFrame(() => {
    _mobPendente = false;
    mobAjustarCampos(document);
    mobRotularBotoes(document);
    mobAliviarImagens(document);
  });
}

function mobIniciarObservador() {
  new MutationObserver(muts => {
    for (const m of muts) {
      if (m.addedNodes.length) { mobAgendarVarredura(); return; }
    }
  }).observe(document.body, { childList: true, subtree: true });
}


// ══════════════════════════════════════════════════════════════════
//  9) ALTURA REAL DA JANELA
//
//  `100dvh` resolve na maioria dos navegadores, mas o Safari antigo e
//  alguns Android não conhecem. A variável `--vh` cobre esses casos.
// ══════════════════════════════════════════════════════════════════

function mobMedirAltura() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty('--vh', h + 'px');
}


// ══════════════════════════════════════════════════════════════════
//  PARTIDA
// ══════════════════════════════════════════════════════════════════

function mobIniciar() {
  try {
    mobAjustarCampos(document);
    mobRotularBotoes(document);
    mobAliviarImagens(document);
    mobIniciarObservador();
    mobIniciarTeclado();
    mobIniciarMemoria();
    mobIniciarVoltar();
    mobIniciarFeedback();
    mobMedirAltura();
    window.addEventListener('resize', mobMedirAltura);
    window.addEventListener('orientationchange', () => setTimeout(mobMedirAltura, 200));
    document.documentElement.classList.toggle('e-toque', ehToque());
  } catch (e) {
    console.warn('[mobile] ', e);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mobIniciar);
else mobIniciar();
