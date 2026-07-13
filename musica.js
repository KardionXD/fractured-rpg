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
  estado: null,        // { videoId, titulo, playing, startedAt, offset, volume, loop }
  somLiberado: false,  // players precisam de 1 clique p/ liberar áudio (política do navegador)
  apiCarregando: false,
};

// ── INIT (chamado quando a mesa é escolhida) ──────
function musicaInit() {
  if (!mesaId()) return;
  _musWidget();
  _musCanal();
  _musCarregarAPI();
  _musCarregarEstadoSalvo();
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
    host.style.cssText = 'position:fixed;bottom:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(host);
  }
  MUSICA.player = new YT.Player('musica-yt-host', {
    width: 1, height: 1,
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 },
    events: {
      onReady: () => {
        MUSICA.pronto = true;
        if (MUSICA.estado?.playing) _musAplicarEstado(MUSICA.estado);
      },
      onStateChange: (e) => {
        // Loop manual (mais confiável que playlist trick)
        if (e.data === YT.PlayerState.ENDED && MUSICA.estado?.loop && MUSICA.estado?.playing && !MUSICA.estado?.playlistId) {
          MUSICA.player.seekTo(0, true);
          MUSICA.player.playVideo();
        }
        if (e.data === YT.PlayerState.PLAYING) _musAtualizarWidget();
      },
      onError: () => { if (isMaster) toast('Esse vídeo não permite reprodução externa. Tenta outro link.', 'err'); },
    },
  });
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
    return;
  }

  // Offset: onde a música está agora (sincroniza quem entrou depois)
  const offset = Math.max(0, (st.offset || 0) + (Date.now() - (st.startedAt || Date.now())) / 1000);

  MUSICA.player.setVolume(st.volume ?? 60);
  // Sem gesto do usuário o navegador só permite tocar MUDO
  if (!MUSICA.somLiberado && !isMaster) MUSICA.player.mute();

  // ── PLAYLIST ──
  if (st.playlistId) {
    if (MUSICA.playlistAtual !== st.playlistId) {
      MUSICA.playlistAtual = st.playlistId;
      MUSICA.player.loadPlaylist({ list: st.playlistId, listType: 'playlist', index: st.index || 0 });
      setTimeout(() => { try { MUSICA.player.setLoop(!!st.loop); } catch(e) {} }, 1500);
    } else if ((st.index ?? null) !== null && MUSICA.player.getPlaylistIndex?.() !== st.index) {
      MUSICA.player.playVideoAt(st.index); // mestre pulou de faixa
    } else {
      MUSICA.player.playVideo();
    }
    return;
  }

  // ── VÍDEO ÚNICO ──
  MUSICA.playlistAtual = null;
  const atual = MUSICA.player.getVideoData?.()?.video_id;
  if (atual !== st.videoId) {
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
  const len = MUSICA.player?.getPlaylist?.()?.length || 1;
  const atual = MUSICA.player?.getPlaylistIndex?.() || 0;
  const novo = ((atual + dir) % len + len) % len;
  const st = { ...MUSICA.estado, index: novo, playing: true, startedAt: Date.now(), offset: 0 };
  MUSICA.player.playVideoAt(novo);
  await _musPublicar(st);
}

function musicaLiberarSom() {
  MUSICA.somLiberado = true;
  try { MUSICA.player.unMute(); MUSICA.player.playVideo(); } catch(e) {}
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
  const playlistId = _musExtrairPlaylist(url);
  const videoId = _musExtrairId(url);
  if (!videoId && !playlistId) { toast('Link do YouTube inválido. Cola o link do vídeo ou da playlist.', 'err'); return; }

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

  // Pega o título real do vídeo depois que carregar (só cosmético)
  setTimeout(() => {
    const t = MUSICA.player?.getVideoData?.()?.title;
    if (t && MUSICA.estado?.videoId === videoId) {
      MUSICA.estado.titulo = t;
      _musPublicar({ ...MUSICA.estado });
    }
  }, 3000);
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
  const st = { videoId: null, playing: false };
  try { MUSICA.player.stopVideo(); } catch(e) {}
  await _musPublicar(st);
  _musAtualizarWidget();
}

async function musicaVolume(v) {
  if (!isMaster || !MUSICA.estado) return;
  const st = { ...MUSICA.estado, volume: parseInt(v) };
  MUSICA.player?.setVolume(st.volume);
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
      style="width:42px;height:42px;border-radius:50%;border:1px solid var(--gold,#c9a84c);background:rgba(13,11,8,0.92);color:var(--gold,#c9a84c);font-size:18px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.5)">🎵</button>
    <div id="mus-painel" style="display:none;position:absolute;bottom:50px;left:0;width:270px;background:rgba(13,11,8,0.97);border:1px solid var(--border,#333);border-radius:10px;padding:12px;box-shadow:0 4px 18px rgba(0,0,0,0.6)">
      <div style="font-size:11px;font-weight:700;color:var(--gold,#c9a84c);letter-spacing:1px;margin-bottom:8px">🎵 MÚSICA DA MESA</div>
      <div id="mus-agora" style="font-size:11px;color:var(--muted,#888);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Nada tocando.</div>
      <button id="mus-liberar" onclick="musicaLiberarSom()" style="display:none;width:100%;margin-bottom:8px;padding:7px;border-radius:6px;border:1px solid var(--gold,#c9a84c);background:rgba(201,168,76,0.12);color:var(--gold,#c9a84c);font-size:11px;cursor:pointer">🔊 Ativar som da mesa</button>
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
        <div style="display:flex;align-items:center;gap:7px;font-size:10px;color:var(--muted,#888)">
          🔉 <input id="mus-vol" type="range" min="0" max="100" value="60" style="flex:1" onchange="musicaVolume(this.value)">
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

  const st = MUSICA.estado;
  if (st?.playing && st.videoId) {
    agora.textContent = (st.playlistId ? '📻 ' : '▶ ') + (st.titulo && !st.titulo.startsWith('http') ? st.titulo : (st.playlistId ? 'Playlist tocando...' : 'Tocando...'));
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
    s.textContent = '@keyframes mus-pulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.4)}50%{box-shadow:0 0 0 7px rgba(201,168,76,0)}}';
    document.head.appendChild(s);
  }
}
