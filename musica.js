// ══════════════════════════════════════════════════
//  MÚSICA — YouTube sincronizado por mesa
//  Mestre cola o link e controla; players ouvem.
//  Sync via broadcast (canal musica-{mesa}) +
//  estado persistido em mesas.musica p/ quem entra depois.
// ══════════════════════════════════════════════════

const MUSICA = {
  player: null,        // YT.Player
  pronto: false,       // iframe API carregada + player criado
  chan: null,          // canal supabase
  estado: null,        // { videoId, playlistId, index, titulo, playing, startedAt, offset, volume, loop }
  somLiberado: false,  // players precisam de 1 clique p/ liberar áudio (política do navegador)
  apiCarregando: false,

  //  PLAYLIST — o que ESTE navegador já aplicou.
  //
  //  `indexAplicado` é a peça que faltava. Antes a faixa publicada era
  //  comparada com `getPlaylistIndex()` (onde o player está AGORA). Só
  //  que a playlist anda sozinha: depois de três músicas o player está
  //  no índice 3 e o estado publicado continua dizendo 0. Aí qualquer
  //  republicação — o mestre mexer no volume, o título chegar — era
  //  lida como "o mestre pulou para a faixa 0" e a mesa inteira voltava
  //  para a primeira música. Guardando a última ordem RECEBIDA, só uma
  //  ordem nova de verdade troca a faixa.
  playlistAtual: null,
  indexAplicado: null,
  loopPendente: null,  // setLoop só funciona depois que a lista chega
  erroFaixa: 0,        // faixas quebradas puladas seguidas (trava anti-loop)
  vigia: null,         // alarme de "carregou e não tocou"
};

// ── INIT (chamado quando a mesa é escolhida) ──────
function musicaInit() {
  if (!mesaId()) return;
  _musWidget();
  _musCanal();
  _musCarregarAPI();
  _musCarregarEstadoSalvo();

  //  Liga a trilha ao mixer local: daqui em diante, quem mexe no "meu
  //  volume" cai aqui e só aqui. Ver audio-local.js.
  if (typeof audioRegistrar === 'function') audioRegistrar('musica', _musAplicarVolume);
}

// ── VOLUME: a conta que mantém o volume individual ────────────────
//  O que sai no alto-falante = volume da mesa (do mestre, veio pela
//  rede) × meu volume (deste navegador). Mudo é meu OU ainda não
//  liberado pelo navegador.
function _musAplicarVolume() {
  if (!MUSICA.pronto || !MUSICA.player) return;
  const daMesa = MUSICA.estado?.volume ?? 60;
  const vol = (typeof audioVolumeEfetivo === 'function') ? audioVolumeEfetivo('musica', daMesa) : daMesa;
  const mudoLocal = (typeof audioEstaMudo === 'function') ? audioEstaMudo('musica') : false;
  //  O navegador só deixa tocar com som depois de um gesto da pessoa.
  //  O mestre já deu o gesto ao clicar em Tocar.
  const travadoPeloNavegador = !MUSICA.somLiberado && !isMaster;

  try {
    MUSICA.player.setVolume(vol);
    if (mudoLocal || travadoPeloNavegador || vol === 0) MUSICA.player.mute();
    else MUSICA.player.unMute();
  } catch (e) {}
}

// ── YOUTUBE IFRAME API ────────────────────────────
function _musCarregarAPI() {
  if (window.YT?.Player || MUSICA.apiCarregando) { _musCriarPlayer(); return; }
  MUSICA.apiCarregando = true;
  window.onYouTubeIframeAPIReady = _musCriarPlayer;
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}

function _musCriarPlayer() {
  if (MUSICA.player || !window.YT?.Player) return;
  let host = document.getElementById('musica-yt-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'musica-yt-host';
    //  Fica fora da tela, mas com tamanho de player de verdade. Um
    //  quadro de 1×1 é tratado como suspeito por navegador e pelo
    //  próprio YouTube (a documentação pede 200×200 no mínimo), e aí a
    //  reprodução pode ser recusada sem erro nenhum.
    host.style.cssText = 'position:fixed;bottom:-9999px;left:-9999px;width:200px;height:200px;opacity:0;pointer-events:none';
    document.body.appendChild(host);
  }
  MUSICA.player = new YT.Player('musica-yt-host', {
    width: 200, height: 200,
    playerVars: {
      autoplay: 0, controls: 0, disablekb: 1, playsinline: 1,
      //  SEM ISTO O CONTROLE NÃO CHEGA NO PLAYER.
      //
      //  O console do site mostrava, em toda sessão:
      //    "Failed to execute 'postMessage'… target origin
      //     ('https://www.youtube.com') does not match the recipient
      //     window's origin ('https://fractured-rpg.vercel.app')"
      //
      //  A API do YouTube conversa com o quadro por postMessage, e a
      //  mensagem só é entregue se a origem combinar. Sem declarar a
      //  origem do site, comandos como loadPlaylist podem simplesmente
      //  não chegar — sem erro, sem som.
      enablejsapi: 1,
      origin: location.origin,
    },
    events: {
      onReady: () => {
        MUSICA.pronto = true;
        _musAplicarVolume();   // a preferência salva vale desde o primeiro som
        if (MUSICA.estado?.playing) _musAplicarEstado(MUSICA.estado);
      },
      onStateChange: (e) => {
        // Loop manual (mais confiável que playlist trick)
        if (e.data === YT.PlayerState.ENDED && MUSICA.estado?.loop && MUSICA.estado?.playing && !MUSICA.estado?.playlistId) {
          MUSICA.player.seekTo(0, true);
          MUSICA.player.playVideo();
        }
        if (e.data === YT.PlayerState.PLAYING) {
          MUSICA.erroFaixa = 0;          // tocou, então a faixa presta
          _musPararVigia();              // começou a tocar: nada de alarme
          _musLoopPendente();
          _musMestreSeguirFaixa();
          _musAtualizarWidget();
        }
      },
      onError: _musErro,
    },
  });
}

// ── PLAYLIST: as três engrenagens ─────────────────

//  1) `setLoop` só pega depois que a lista existe no player. Chamar
//     logo após `loadPlaylist` às vezes caía no vazio (a correção
//     anterior era um setTimeout de 1,5s, que falhava em conexão lenta).
//     Agora a gente espera a lista chegar de verdade.
function _musLoopPendente() {
  if (MUSICA.loopPendente == null) return;
  const lista = MUSICA.player?.getPlaylist?.();
  if (!lista || !lista.length) return;
  try { MUSICA.player.setLoop(!!MUSICA.loopPendente); } catch (e) {}
  MUSICA.loopPendente = null;
}

//  2) A playlist anda sozinha. Quando ela vira a faixa no navegador do
//     MESTRE, isso vira ordem para a mesa — senão o estado publicado
//     envelhece na faixa 0 e quem entra depois começa do começo.
function _musMestreSeguirFaixa() {
  if (!isMaster || !MUSICA.estado?.playlistId) return;
  const i = MUSICA.player?.getPlaylistIndex?.();
  if (i == null || i < 0 || i === MUSICA.estado.index) return;
  MUSICA.indexAplicado = i;
  _musPublicar({ ...MUSICA.estado, index: i, playing: true, startedAt: Date.now(), offset: 0 });
}

//  3) Uma faixa bloqueada por região ou removida travava a mesa inteira
//     em silêncio. O mestre pula; ao pular, o item 2 avisa todo mundo.
function _musErro() {
  if (MUSICA.estado?.playlistId) {
    if (!isMaster) return;                  // o player espera a ordem do mestre
    if (++MUSICA.erroFaixa > 5) {           // lista inteira bloqueada: para de tentar
      toast('Várias faixas seguidas desta playlist não podem tocar aqui. Tenta outra lista.', 'err');
      MUSICA.erroFaixa = 0;
      return;
    }
    toast('Uma faixa da playlist não pode tocar aqui — pulando.', 'err');
    try { MUSICA.player.nextVideo(); } catch (e) {}
    return;
  }
  if (isMaster) toast('Esse vídeo não permite reprodução externa. Tenta outro link.', 'err');
}

//  4) O SILÊNCIO AVISA.
//
//  O pior defeito de uma playlist que não abre é não acontecer nada:
//  sem erro, sem som, sem pista. A API do YouTube nem sempre dispara
//  `onError` quando é a LISTA que não serve (privada, Mix, removida) —
//  ela simplesmente não começa. Então o mestre conta até oito: se nada
//  tocou, ele diz o que costuma ser.
function _musVigiar() {
  if (!isMaster) return;
  _musPararVigia();
  MUSICA.vigia = setTimeout(async () => {
    MUSICA.vigia = null;
    const estado = MUSICA.player?.getPlayerState?.();
    if (estado === 1) return;                       // está tocando, falso alarme
    const lista = MUSICA.player?.getPlaylist?.();

    //  PRIMEIRA SUSPEITA: extensão de bloqueio de anúncios.
    //
    //  Isto explica o caso mais confuso de todos — vídeo solto toca e
    //  playlist não. Para montar a LISTA, o YouTube chama
    //  `youtubei/v1/next`; um vídeo solto não precisa dessa chamada.
    //  Bloqueador que mata `youtubei/v1/*` deixa o vídeo passar e mata
    //  a playlist, sem erro nenhum na tela.
    if (await _musBloqueadorAtivo()) {
      toast('Uma extensão do navegador (bloqueador de anúncios) está barrando as chamadas do YouTube. '
          + 'Vídeo solto ainda toca, mas playlist não: a lista precisa de uma chamada que está bloqueada. '
          + 'Libere este site na extensão e recarregue.', 'err');
      return;
    }

    if (lista && lista.length) {
      toast('A playlist abriu, mas nenhuma faixa começou. As músicas dela podem bloquear reprodução fora do YouTube.', 'err');
    } else {
      toast('Essa playlist não abriu. Quase sempre é um destes: a lista é privada (só funciona pública ou não listada), é um Mix do YouTube, ou foi removida.', 'err');
    }
  }, 8000);
}

//  Pergunta direto: o navegador consegue falar com o YouTube?
//  `no-cors` não deixa ler a resposta, e não precisa — o que interessa é
//  se a requisição SAI. Bloqueador derruba antes de sair e a promessa
//  é recusada. Só é chamado quando algo já deu errado.
async function _musBloqueadorAtivo() {
  try {
    await fetch('https://www.youtube.com/generate_204', { mode: 'no-cors', cache: 'no-store' });
    return false;
  } catch (e) {
    return true;
  }
}

function _musPararVigia() {
  if (MUSICA.vigia) { clearTimeout(MUSICA.vigia); MUSICA.vigia = null; }
}

//  Listas que o YouTube não entrega pela API.
//
//  CUIDADO AQUI. A primeira versão disto barrava TODO id começado em
//  "RD" por ser Mix. Só que as playlists do YouTube Music — as mais
//  usadas para ambientação — têm id "RDCLAK5uy_…", e começam em RD sem
//  serem Mix. O site passou a recusar playlists perfeitamente válidas.
//
//  Lição: palpite sobre o formato do id não pode BARRAR nada. Só o
//  `WL`/`LL` é certeza (são listas pessoais, não existem para outra
//  conta). O resto, no máximo, avisa — e tenta assim mesmo.
function _musAvisoDeLista(id) {
  if (/^(WL|LL)$/i.test(id)) {
    return { bloquear: true,
      msg: '"Assistir mais tarde" e "Curtidas" são listas pessoais e não abrem para mais ninguém. Crie uma playlist e deixe como pública ou não listada.' };
  }
  //  Mix/rádio de verdade (RDMM…, RDEM…, RDGMEM…, RD<id do vídeo>…).
  //  RDCLAK… é playlist do YouTube Music e NÃO entra aqui.
  if (/^RD/i.test(id) && !/^RDCLAK/i.test(id)) {
    return { bloquear: false,
      msg: 'Isso parece um Mix do YouTube. Vou tentar, mas Mix costuma não tocar fora do site deles — se não rolar, abra a playlist de verdade e cole aquele link.' };
  }
  return null;
}

// ── CANAL DE SYNC ─────────────────────────────────
function _musCanal() {
  if (MUSICA.chan) return;
  MUSICA.chan = db.channel('musica-' + mesaId(), { config: { broadcast: { self: false } } });
  MUSICA.chan.on('broadcast', { event: 'musica' }, ({ payload }) => {
    if (!payload) return;
    MUSICA.estado = payload;
    _musAplicarEstado(payload);
  }).subscribe();
}

async function _musCarregarEstadoSalvo() {
  // Quem entra depois pega o estado salvo na mesa
  const { data } = await db.from('mesas').select('musica').eq('id', mesaId()).maybeSingle();
  if (data?.musica?.playing) {
    MUSICA.estado = data.musica;
    _musAplicarEstado(data.musica);
  }
}

async function _musPublicar(estado) {
  MUSICA.estado = estado;
  try { await MUSICA.chan.send({ type: 'broadcast', event: 'musica', payload: estado }); } catch(e) {}
  try { await db.from('mesas').update({ musica: estado }).eq('id', mesaId()); } catch(e) {}
}

// ── APLICAR ESTADO (todos) ────────────────────────
function _musAplicarEstado(st) {
  _musAtualizarWidget();
  if (!MUSICA.pronto || !st) return;

  if (!st.playing || (!st.videoId && !st.playlistId)) {
    try { MUSICA.player.pauseVideo(); } catch(e) {}
    //  Parar (sem playlist no estado) é diferente de pausar: esquece a
    //  lista carregada, senão tocar a MESMA playlist de novo caía no
    //  ramo "já é essa" e não recarregava nada.
    if (!st.playlistId) { MUSICA.playlistAtual = null; MUSICA.indexAplicado = null; }
    return;
  }

  // Offset: onde a música está agora (sincroniza quem entrou depois)
  let offset = Math.max(0, (st.offset || 0) + (Date.now() - (st.startedAt || Date.now())) / 1000);

  //  TRAVA: o estado fica salvo em `mesas.musica`. Se o mestre parou de
  //  mexer ontem, `startedAt` é de ontem e esta conta dá dezenas de
  //  milhares de segundos. Mandar isso como ponto de partida faz cada
  //  faixa começar DEPOIS do fim — a playlist corre inteira em silêncio
  //  e parece que não tocou nada. Acima de 6 horas o estado é velho
  //  demais para servir de sincronismo: começa do início.
  if (!Number.isFinite(offset) || offset > 6 * 3600) offset = 0;

  //  ATENÇÃO: o volume publicado pelo mestre NÃO é empurrado direto no
  //  player. Ele entra como base da conta em _musAplicarVolume, que o
  //  multiplica pelo volume local de quem está ouvindo. Era aqui que o
  //  volume do mestre era imposto a todo mundo.
  _musAplicarVolume();

  // ── PLAYLIST ──
  if (st.playlistId) {
    const faixa = st.index || 0;

    //  (a) Lista diferente: carrega, já na faixa e no ponto certos —
    //  quem entra no meio da sessão não recomeça do primeiro segundo.
    if (MUSICA.playlistAtual !== st.playlistId) {
      MUSICA.playlistAtual = st.playlistId;
      MUSICA.indexAplicado = faixa;
      MUSICA.loopPendente  = !!st.loop;
      MUSICA.player.loadPlaylist({
        list: st.playlistId, listType: 'playlist',
        index: faixa, startSeconds: offset,
      });
      _musVigiar();     // se em 8s nada tocar, o mestre fica sabendo
      return;
    }

    //  (b) Mesma lista, ORDEM NOVA de faixa: o mestre pulou. Compara com
    //  a última ordem recebida, não com onde o player está — a playlist
    //  anda sozinha, e comparar com o player fazia toda republicação
    //  (volume, título) arrastar a mesa de volta para a faixa 0.
    if (faixa !== MUSICA.indexAplicado) {
      MUSICA.indexAplicado = faixa;
      MUSICA.player.playVideoAt(faixa);
      if (offset > 2) { try { MUSICA.player.seekTo(offset, true); } catch(e) {} }
      return;
    }

    //  (c) Mesma lista, mesma faixa: nada de pular. Só garante que está
    //  tocando e reaproxima quem ficou muito para trás.
    const fora = Math.abs((MUSICA.player.getCurrentTime?.() || 0) - offset);
    if (fora > 5) { try { MUSICA.player.seekTo(offset, true); } catch(e) {} }
    MUSICA.player.playVideo();
    return;
  }

  // ── VÍDEO ÚNICO ──
  MUSICA.playlistAtual = null;
  // Rastreia o videoId aplicado por nós mesmos em vez de perguntar pro player
  // (getVideoData() do IFrame API pode ficar com valor desatualizado logo após
  // trocar de vídeo, fazendo a troca de faixa parecer travada na primeira música).
  if (MUSICA.videoIdAtual !== st.videoId) {
    MUSICA.videoIdAtual = st.videoId;
    MUSICA.player.loadVideoById({ videoId: st.videoId, startSeconds: offset });
  } else {
    const delta = Math.abs((MUSICA.player.getCurrentTime?.() || 0) - offset);
    if (delta > 3) MUSICA.player.seekTo(offset, true); // ressincroniza se desalinhar
    MUSICA.player.playVideo();
  }
}

// Pular faixa da playlist (mestre) — sincroniza todo mundo
async function musicaPular(dir) {
  if (!isMaster || !MUSICA.estado?.playlistId) return;

  const lista = MUSICA.player?.getPlaylist?.() || [];

  //  Logo depois de carregar, `getPlaylist()` ainda vem vazia — e a
  //  conta antiga virava `% 1`, ou seja, o botão de próxima sempre
  //  mandava para a faixa 0 e parecia não funcionar. Enquanto a lista
  //  não chega, usa os comandos do próprio player; o índice novo é
  //  publicado sozinho em _musMestreSeguirFaixa.
  if (lista.length < 2) {
    try { dir > 0 ? MUSICA.player.nextVideo() : MUSICA.player.previousVideo(); } catch (e) {}
    return;
  }

  const atual = MUSICA.player?.getPlaylistIndex?.() ?? MUSICA.estado.index ?? 0;
  const novo  = ((atual + dir) % lista.length + lista.length) % lista.length;
  MUSICA.indexAplicado = novo;
  MUSICA.player.playVideoAt(novo);
  await _musPublicar({ ...MUSICA.estado, index: novo, playing: true, startedAt: Date.now(), offset: 0 });
}

function musicaLiberarSom() {
  MUSICA.somLiberado = true;
  //  Libera o navegador, mas respeita quem pediu mudo: o clique aqui
  //  é "pode tocar", não "toca alto".
  try { MUSICA.player.playVideo(); } catch(e) {}
  _musAplicarVolume();
  _musAtualizarWidget();
}

// ── CONTROLES DO MESTRE ───────────────────────────
function _musExtrairId(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(url.trim()) ? url.trim() : null);
}

function _musExtrairPlaylist(url) {
  const m = String(url).match(/[?&]list=([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

async function musicaTocar() {
  if (!isMaster) return;
  const url = document.getElementById('mus-url')?.value.trim();
  let playlistId = _musExtrairPlaylist(url);
  const videoId = _musExtrairId(url);
  if (!videoId && !playlistId) { toast('Link do YouTube inválido. Cola o link do vídeo ou da playlist.', 'err'); return; }

  //  Só o que é impossível é recusado. O resto, na dúvida, tenta.
  if (playlistId) {
    const aviso = _musAvisoDeLista(playlistId);
    if (aviso?.bloquear) { toast(aviso.msg, 'err'); return; }
    if (aviso) toast(aviso.msg, 'err');
  }

  const estado = {
    videoId: playlistId ? null : videoId,
    playlistId: playlistId || null,
    index: 0,
    titulo: url,
    playing: true,
    startedAt: Date.now(),
    offset: 0,
    volume: parseInt(document.getElementById('mus-vol')?.value) || 60,
    loop: document.getElementById('mus-loop')?.checked !== false,
  };
  MUSICA.somLiberado = true; // clique do mestre já é o gesto
  _musAplicarEstado(estado);
  await _musPublicar(estado);
  toast('🎵 Tocando para toda a mesa!', 'ok');

  //  Título real do vídeo, depois que carregar (só cosmético). Vale só
  //  para vídeo único: numa playlist o nome muda a cada faixa, e cada
  //  navegador lê o seu — ver _musAtualizarWidget. Republicar o título
  //  de uma playlist só geraria tráfego para arrastar o estado inteiro.
  if (!estado.playlistId) {
    setTimeout(() => {
      const t = MUSICA.player?.getVideoData?.()?.title;
      if (t && MUSICA.estado?.videoId === videoId) {
        MUSICA.estado.titulo = t;
        _musPublicar({ ...MUSICA.estado });
      }
    }, 3000);
  }
}

async function musicaPausar() {
  if (!isMaster || !MUSICA.estado) return;
  const pos = MUSICA.player?.getCurrentTime?.() || 0;
  const st = { ...MUSICA.estado, playing: false, offset: pos };
  _musAplicarEstado(st);
  await _musPublicar(st);
}

async function musicaRetomar() {
  if (!isMaster || !(MUSICA.estado?.videoId || MUSICA.estado?.playlistId)) return;
  const st = { ...MUSICA.estado, playing: true, startedAt: Date.now() };
  MUSICA.somLiberado = true;
  _musAplicarEstado(st);
  await _musPublicar(st);
}

async function musicaParar() {
  if (!isMaster) return;
  //  Parar limpa a lista carregada em todo mundo. Sem isto, mandar a
  //  MESMA playlist tocar de novo não recarregava nada: o código via
  //  "já é essa lista" e dava playVideo() num player parado.
  const st = {
    videoId: null, playlistId: null, index: 0, titulo: '',
    playing: false, startedAt: Date.now(), offset: 0,
    volume: MUSICA.estado?.volume ?? 60,
    loop: MUSICA.estado?.loop !== false,
  };
  MUSICA.videoIdAtual  = null;
  MUSICA.playlistAtual = null;
  MUSICA.indexAplicado = null;
  MUSICA.loopPendente  = null;
  MUSICA.erroFaixa     = 0;
  _musPararVigia();
  try { MUSICA.player.stopVideo(); } catch(e) {}
  await _musPublicar(st);
  _musAtualizarWidget();
}

//  Volume DA MESA (só o mestre). Vira a base da conta de todo mundo —
//  e não o valor final no player de ninguém, nem do próprio mestre,
//  que também tem o seu volume local.
async function musicaVolume(v) {
  if (!isMaster || !MUSICA.estado) return;
  const st = { ...MUSICA.estado, volume: parseInt(v) };
  MUSICA.estado = st;
  _musAplicarVolume();
  await _musPublicar(st);
}

// ── WIDGET FLUTUANTE ──────────────────────────────
function _musWidget() {
  if (document.getElementById('musica-widget')) return;
  const w = document.createElement('div');
  w.id = 'musica-widget';
  w.style.cssText = 'position:fixed;bottom:14px;left:14px;z-index:8000;font-family:inherit';
  w.innerHTML = `
    <button id="mus-toggle" title="Música da mesa"
      style="width:42px;height:42px;border-radius:50%;border:1px solid var(--gold,#c9a84c);background:rgba(13,11,8,0.92);color:var(--gold,#c9a84c);cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center">${fracIcon('musica', { size: 19 })}</button>
    <div id="mus-painel" style="display:none;position:absolute;bottom:50px;left:0;width:270px;background:rgba(13,11,8,0.97);border:1px solid var(--border,#333);border-radius:10px;padding:12px;box-shadow:0 4px 18px rgba(0,0,0,0.6)">
      <div style="font-size:11px;font-weight:700;color:var(--gold,#c9a84c);letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:6px">${fracIcon('musica', { size: 13 })}MÚSICA DA MESA</div>
      <div id="mus-agora" style="font-size:11px;color:var(--muted,#888);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Nada tocando.</div>
      <button id="mus-liberar" onclick="musicaLiberarSom()" style="display:none;width:100%;margin-bottom:8px;padding:7px;border-radius:6px;border:1px solid var(--gold,#c9a84c);background:rgba(201,168,76,0.12);color:var(--gold,#c9a84c);font-size:11px;cursor:pointer">🔊 Ativar som da mesa</button>
      ${typeof audioPainelHtml === 'function' ? audioPainelHtml() : ''}
      <div id="mus-master" style="display:none">
        <input id="mus-url" placeholder="Link do YouTube (vídeo ou playlist)"
          style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--border,#333);border-radius:6px;color:var(--text,#eee);padding:7px 9px;font-size:11px;margin-bottom:7px">
        <div style="display:flex;gap:5px;margin-bottom:7px">
          <button class="btn-ghost" onclick="musicaTocar()" style="flex:1;font-size:11px;padding:6px">▶ Tocar</button>
          <button class="btn-ghost" onclick="musicaPular(-1)" style="font-size:11px;padding:6px 8px" title="Faixa anterior (playlist)">⏮</button>
          <button class="btn-ghost" onclick="musicaPular(1)" style="font-size:11px;padding:6px 8px" title="Próxima faixa (playlist)">⏭</button>
          <button class="btn-ghost" onclick="musicaPausar()" style="font-size:11px;padding:6px 9px" title="Pausar">⏸</button>
          <button class="btn-ghost" onclick="musicaRetomar()" style="font-size:11px;padding:6px 9px" title="Retomar">⏵</button>
          <button class="btn-ghost" onclick="musicaParar()" style="font-size:11px;padding:6px 9px;color:var(--red,#c0392b)" title="Parar">⏹</button>
        </div>
        <div class="aud-titulo" style="margin-top:4px">VOLUME DA MESA <span class="aud-so-eu" style="background:rgba(201,168,76,.14);color:var(--gold,#c9a84c)">todos</span></div>
        <div style="display:flex;align-items:center;gap:7px;font-size:10px;color:var(--muted,#888)">
          🔉 <input id="mus-vol" type="range" min="0" max="100" value="60" style="flex:1"
                title="Base para toda a mesa. Cada um ainda ajusta o próprio volume por cima disto."
                onchange="musicaVolume(this.value)">
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer"><input id="mus-loop" type="checkbox" checked> loop</label>
        </div>
      </div>
    </div>`;
  document.body.appendChild(w);
  document.getElementById('mus-toggle').onclick = () => {
    const p = document.getElementById('mus-painel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
    _musAtualizarWidget();
  };
}

function _musAtualizarWidget() {
  const agora   = document.getElementById('mus-agora');
  const master  = document.getElementById('mus-master');
  const liberar = document.getElementById('mus-liberar');
  const toggle  = document.getElementById('mus-toggle');
  if (!agora) return;

  if (master) master.style.display = isMaster ? 'block' : 'none';
  if (typeof audioPainelPintar === 'function') audioPainelPintar();

  const st = MUSICA.estado;
  if (st?.playing && (st.videoId || st.playlistId)) {
    //  Numa playlist o nome muda a cada faixa. Em vez de mandar o título
    //  pela rede toda vez, cada navegador pergunta ao próprio player —
    //  é sempre o nome do que ESTÁ tocando aqui, e não custa nada.
    let nome = (st.titulo && !st.titulo.startsWith('http')) ? st.titulo : '';
    let posicao = '';
    if (st.playlistId) {
      const daVez = MUSICA.player?.getVideoData?.()?.title;
      if (daVez) nome = daVez;
      const lista = MUSICA.player?.getPlaylist?.();
      const i = MUSICA.player?.getPlaylistIndex?.();
      if (lista?.length && i != null && i >= 0) posicao = ` (${i + 1}/${lista.length})`;
    }
    if (!nome) nome = st.playlistId ? 'Playlist tocando...' : 'Tocando...';
    agora.textContent = (st.playlistId ? '📻 ' : '▶ ') + nome + posicao;
    if (toggle) toggle.style.borderColor = 'var(--gold, #c9a84c)';
    if (toggle) toggle.style.animation = 'mus-pulse 2s infinite';
  } else {
    agora.textContent = (st?.videoId || st?.playlistId) ? '⏸ Pausado' : 'Nada tocando.';
    if (toggle) toggle.style.animation = '';
  }

  // Player precisa liberar o som (1 clique) por política do navegador
  if (liberar) liberar.style.display = (!isMaster && st?.playing && !MUSICA.somLiberado) ? 'block' : 'none';

  if (!document.getElementById('mus-pulse-style')) {
    const s = document.createElement('style');
    s.id = 'mus-pulse-style';
    s.textContent = '@keyframes mus-pulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.4)}50%{box-shadow:0 0 0 7px rgba(201,168,76,0)}}'
      + '@media (max-width:768px){#musica-widget{bottom:78px !important;left:10px !important}#mus-painel{width:min(270px,calc(100vw - 40px)) !important}}';
    document.head.appendChild(s);
  }
}
