// ══════════════════════════════════════════════════════════════════
//  MIXER LOCAL — o volume de cada um, no ouvido de cada um
//
//  Por que isto existe separado de `musica.js`:
//
//  O áudio da mesa tem DOIS volumes, e eles não são a mesma coisa.
//
//  1. O VOLUME DA MESA — é do mestre, viaja pela rede, fica salvo em
//     `mesas.musica.volume`. É a intenção dele: "esta trilha entra
//     baixinha". Quem chega depois recebe essa mesma intenção.
//
//  2. O MEU VOLUME — é meu, nunca sai deste navegador, fica no
//     localStorage. É o meu fone, o meu quarto, a minha vizinha
//     dormindo. Mexer nele não muda nada para ninguém.
//
//  O que o alto-falante toca é o produto dos dois. O mestre abaixa a
//  trilha e todos ouvem mais baixo; eu abaixo o meu e só eu ouço mais
//  baixo. Nunca um sobrescreve o outro.
//
//  PREPARADO PARA CRESCER: hoje a mesa tem um único canal de áudio (a
//  trilha do YouTube). Se amanhã entrar ambiente e efeitos, basta
//  registrar o canal em AUDIO_CANAIS e o painel passa a mostrar um
//  controle para cada um, sem mexer em mais nada aqui.
// ══════════════════════════════════════════════════════════════════

//  Os canais de áudio da mesa.
//
//  Enquanto houver só um, o painel mostra um controle único ("Meu
//  volume") — dois controles para a mesma coisa só confundiria. Com
//  dois ou mais, ele mostra o geral mais um por canal, e aí o jogador
//  pode baixar o ambiente sem baixar a música.
//
//  Para somar um canal: ponha o objeto aqui e chame
//  `audioRegistrar('<id>', aplicador)` onde esse áudio é criado. O
//  aplicador recebe (volume 0–100 já calculado, mudo true/false).
const AUDIO_CANAIS = [
  { id: 'musica', nome: 'Música', icone: '🎵' },
  //  { id: 'ambiente', nome: 'Ambiente', icone: '🌧' },
  //  { id: 'efeitos',  nome: 'Efeitos',  icone: '💥' },
];

const AUDIO_LOCAL = {
  pref: null,            // { geral:{volume,mudo}, musica:{volume,mudo}, ... }
  aplicadores: {},       // id do canal → função que empurra o valor pro player
};

const _AUD_CHAVE = 'fractured_audio_local';

//  Preferência própria deste navegador. Nunca vai para o banco: é
//  sobre o ouvido de quem está aqui, não sobre a mesa.
function audioPref() {
  if (AUDIO_LOCAL.pref) return AUDIO_LOCAL.pref;
  let salvo = {};
  try { salvo = JSON.parse(localStorage.getItem(_AUD_CHAVE) || '{}') || {}; } catch (e) { salvo = {}; }

  const canal = (origem) => ({
    volume: Number.isFinite(+origem?.volume) ? Math.min(100, Math.max(0, +origem.volume)) : 100,
    mudo:   !!origem?.mudo,
  });

  const pref = { geral: canal(salvo.geral) };
  AUDIO_CANAIS.forEach(c => { pref[c.id] = canal(salvo[c.id]); });
  AUDIO_LOCAL.pref = pref;
  return pref;
}

function _audSalvar() {
  try { localStorage.setItem(_AUD_CHAVE, JSON.stringify(audioPref())); } catch (e) {}
}

//  Liga um canal ao player que de fato toca o som.
function audioRegistrar(canalId, aplicador) {
  AUDIO_LOCAL.aplicadores[canalId] = aplicador;
}

//  O volume que o player deve receber: a vontade do mestre multiplicada
//  pela minha. `volumeDaMesa` é o que veio pela rede (0–100).
function audioVolumeEfetivo(canalId, volumeDaMesa) {
  const p = audioPref();
  const mesa = Number.isFinite(+volumeDaMesa) ? Math.min(100, Math.max(0, +volumeDaMesa)) : 100;
  const meu  = (p.geral.volume / 100) * ((p[canalId]?.volume ?? 100) / 100);
  return Math.round(mesa * meu);
}

//  Mudo é um OU: o geral silencia tudo, o do canal silencia um canal.
function audioEstaMudo(canalId) {
  const p = audioPref();
  return !!(p.geral.mudo || p[canalId]?.mudo);
}

//  Reaplica a preferência em todos os canais ligados. Chamado quando o
//  jogador mexe num controle e quando um player novo é criado.
function audioAplicar() {
  Object.keys(AUDIO_LOCAL.aplicadores).forEach(id => {
    try { AUDIO_LOCAL.aplicadores[id](); } catch (e) {}
  });
}

function audioDefinirVolume(canalId, v) {
  const p = audioPref();
  const alvo = p[canalId] || (p[canalId] = { volume: 100, mudo: false });
  alvo.volume = Math.min(100, Math.max(0, parseInt(v, 10) || 0));
  //  Mexer no volume tira do mudo: ninguém arrasta o cursor querendo
  //  continuar sem ouvir nada.
  if (alvo.volume > 0) alvo.mudo = false;
  _audSalvar();
  audioAplicar();
  audioPainelPintar();
}

function audioAlternarMudo(canalId) {
  const p = audioPref();
  const alvo = p[canalId] || (p[canalId] = { volume: 100, mudo: false });
  alvo.mudo = !alvo.mudo;
  _audSalvar();
  audioAplicar();
  audioPainelPintar();
}

// ── O PAINEL ──────────────────────────────────────────────────────
//  Mora dentro do widget de música, que fica sempre na tela: é o lugar
//  onde a pessoa já procura o som. Dois cliques no meio de um combate:
//  abre o widget, arrasta (ou toca no alto-falante para mudo).

function _audLinhaHtml(id, nome, icone, destaque) {
  const p = audioPref()[id] || { volume: 100, mudo: false };
  return `
    <div class="aud-linha" data-aud="${id}">
      <button class="aud-mudo" onclick="audioAlternarMudo('${id}')"
        title="${p.mudo ? 'Tirar do mudo' : 'Silenciar só para mim'}"
        aria-label="${p.mudo ? 'Tirar do mudo' : 'Silenciar'}">${p.mudo ? '🔇' : (icone || '🔊')}</button>
      <input class="aud-range" type="range" min="0" max="100" value="${p.volume}"
        aria-label="Volume: ${nome}"
        oninput="audioDefinirVolume('${id}', this.value)">
      <span class="aud-num">${p.mudo ? '—' : p.volume}</span>
    </div>
    ${destaque ? `<div class="aud-nome">${nome}</div>` : ''}`;
}

function audioPainelHtml() {
  const varios = AUDIO_CANAIS.length > 1;
  let html = `<div id="aud-painel" class="aud-painel">
    <div class="aud-titulo">MEU VOLUME <span class="aud-so-eu">só para mim</span></div>
    ${_audLinhaHtml('geral', varios ? 'Tudo' : 'Música', '🔊', false)}`;

  //  Um controle por canal só quando existe mais de um canal.
  if (varios) {
    html += '<div class="aud-canais">';
    AUDIO_CANAIS.forEach(c => {
      html += `<div class="aud-canal"><span class="aud-canal-nome">${c.nome}</span>${_audLinhaHtml(c.id, c.nome, c.icone, false)}</div>`;
    });
    html += '</div>';
  }
  return html + '</div>';
}

//  Redesenha os controles depois de mexer neles (e quando o painel
//  abre), para o número e o ícone de mudo acompanharem.
function audioPainelPintar() {
  const painel = document.getElementById('aud-painel');
  if (!painel) return;
  const ids = ['geral'].concat(AUDIO_CANAIS.length > 1 ? AUDIO_CANAIS.map(c => c.id) : []);
  ids.forEach(id => {
    const linha = painel.querySelector(`.aud-linha[data-aud="${id}"]`);
    if (!linha) return;
    const p = audioPref()[id] || { volume: 100, mudo: false };
    const range = linha.querySelector('.aud-range');
    const num   = linha.querySelector('.aud-num');
    const mudo  = linha.querySelector('.aud-mudo');
    if (range && document.activeElement !== range) range.value = p.volume;
    if (num)  num.textContent = p.mudo ? '—' : p.volume;
    if (mudo) {
      const canal = AUDIO_CANAIS.find(c => c.id === id);
      mudo.textContent = p.mudo ? '🔇' : (canal?.icone || '🔊');
      mudo.title = p.mudo ? 'Tirar do mudo' : 'Silenciar só para mim';
      mudo.classList.toggle('aud-mudo-on', p.mudo);
    }
  });
}
