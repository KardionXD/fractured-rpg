# FRACTURED VTT — Correções: Cenas + Vídeo + Performance

## 1. `npcs.js` — `salvarCenaAtual()` (substituir a função inteira)

Corrige: video_url não salvo, array local stale, update silencioso por RLS.

```js
async function salvarCenaAtual() {
  if (!isMaster) return;
  if (!cenaAtiva) { toast('Nenhuma cena ativa.', 'err'); return; }

  const payload = {
    mapa_url:  (MAP?.imgUrl && MAP.imgUrl.startsWith('https://')) ? MAP.imgUrl : null,
    video_url: (typeof _vidUrl !== 'undefined' && _vidUrl && _vidUrl.startsWith('https://')) ? _vidUrl : null,
    tokens:    MAP?.tokens || [],
    grid_size: MAP?.gridSize || 60,
    fog:       typeof fogExport === 'function' ? fogExport() : null,
    paredes:   (typeof FOG !== 'undefined') ? FOG.paredes : [],
  };

  const { data, error } = await db.from('cenas_mapa')
    .update(payload)
    .eq('id', cenaAtiva)
    .select();               // <- detecta update bloqueado por RLS

  if (error) { toast('Erro ao salvar: ' + error.message, 'err'); return; }
  if (!data || !data.length) {
    toast('⚠ Nada foi salvo — verifique a policy de UPDATE (RLS) em cenas_mapa.', 'err');
    return;
  }

  // Atualiza o array local IMEDIATAMENTE (não depende do realtime)
  const idx = cenas.findIndex(c => c.id === cenaAtiva);
  if (idx !== -1) cenas[idx] = { ...cenas[idx], ...payload };

  toast('Cena salva!', 'ok');
  renderCenas();
  if (typeof renderCenasInline === 'function') renderCenasInline();
}
```

> **RLS**: se aparecer o aviso de "nada foi salvo", rode no SQL Editor do Supabase:
> ```sql
> create policy "master atualiza suas cenas"
> on cenas_mapa for update
> using (master_id = auth.uid())
> with check (master_id = auth.uid());
> ```

## 2. `npcs.js` — `carregarCenas()` (restaurar cenaAtiva no reload)

```js
async function carregarCenas() {
  const { data } = await db.from('cenas_mapa')
    .select('*')
    .eq('master_id', currentUser.id)
    .order('ordem');
  cenas = data || [];

  // Restaura a cena ativa após F5 (antes disso, salvar após reload falhava)
  if (!cenaAtiva) {
    const ativa = cenas.find(c => c.ativa);
    if (ativa) cenaAtiva = ativa.id;
  }

  renderCenas();
  subscribeCenas();
}
```

## 3. `mapa.js` — `mapaCarregarVideo()` (elimina carga dupla e RAF duplicado)

Corrige: eco realtime recarregando o vídeo, dois loops de RAF, `_vidUrl` setado tarde demais.

```js
let _vidLoadToken = 0;  // adicionar junto com _vid/_vidUrl/_vidRAF

function mapaCarregarVideo(url, resetView = true) {
  // Já está tocando essa URL? Não recarrega (mata o ping-pong do eco realtime)
  if (_vid && _vidUrl === url) return;

  _vidUrl = url;                    // seta ANTES do load, não no oncanplay
  const meuToken = ++_vidLoadToken; // invalida loads anteriores em andamento

  if (_vidRAF) { cancelAnimationFrame(_vidRAF); _vidRAF = null; }
  if (_vid && _vid.tagName === 'VIDEO') { _vid.pause(); _vid.src = ''; }
  _vid = null;

  const ext = url.split('?')[0].split('.').pop().toLowerCase();

  if (ext === 'gif') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (meuToken !== _vidLoadToken) return;  // load antigo, descarta
      _vid = img;
      if (resetView) mapaResetZoom();
      _vidStartLoop();
    };
    img.onerror = () => { if (meuToken === _vidLoadToken) toast('Erro ao carregar GIF.', 'err'); };
    img.src = url;
  } else {
    const v = document.createElement('video');
    v.src = url; v.loop = true; v.muted = true;
    v.playsInline = true; v.crossOrigin = 'anonymous';
    v.oncanplay = () => {
      if (meuToken !== _vidLoadToken) { v.pause(); v.src = ''; return; }  // load antigo
      if (_vid === v) return;  // oncanplay pode disparar mais de uma vez
      _vid = v;
      v.play().then(() => {
        if (resetView) mapaResetZoom();
        _vidStartLoop();
      }).catch(() => {});
    };
    v.onerror = () => { if (meuToken === _vidLoadToken) toast('Erro ao carregar vídeo.', 'err'); };
    v.load();
  }
}

// Loop otimizado: usa requestVideoFrameCallback quando disponível
// (redesenha só quando há frame NOVO do vídeo — ~24/30fps em vez de 60)
function _vidStartLoop() {
  if (_vidRAF) { cancelAnimationFrame(_vidRAF); _vidRAF = null; }

  if (_vid && _vid.tagName === 'VIDEO' && 'requestVideoFrameCallback' in _vid) {
    const vRef = _vid;
    const step = () => {
      if (_vid !== vRef || !MAP.canvas) return;  // vídeo trocou, encerra
      mapaDraw();
      vRef.requestVideoFrameCallback(step);
    };
    vRef.requestVideoFrameCallback(step);
  } else {
    _vidRAF = requestAnimationFrame(_vidLoop);   // fallback (GIF / Safari antigo)
  }
}
```

Em `mapaStopVideo()`, adicione `_vidLoadToken++;` na primeira linha para invalidar qualquer load pendente.

## 4. `mapa.js` — `mapaAplicarCena()` (troca de cena sem flash da imagem antiga)

```js
function mapaAplicarCena(cena) {
  if (!MAP.drag) MAP.tokens = cena.tokens || [];
  MAP.gridSize = cena.grid_size || 60;
  if (typeof fogImport === 'function') fogImport(cena.fog, cena.paredes);

  if (cena.video_url && cena.video_url.startsWith('https://')) {
    MAP.img = null; MAP.imgUrl = null;
    mapaCarregarVideo(cena.video_url, false);   // já ignora se for a mesma URL
  } else if (cena.mapa_url && cena.mapa_url.startsWith('https://')) {
    if (_vid) mapaStopVideo();
    if (MAP.imgUrl === cena.mapa_url && MAP.img) { mapaDraw(); return; }  // mesma imagem
    MAP.img = null;                              // <- limpa a imagem da cena ANTERIOR
    MAP.imgUrl = cena.mapa_url;
    mapaDraw();                                  // frame limpo enquanto carrega
    const img = new Image();
    img.onload  = () => { if (MAP.imgUrl === cena.mapa_url) { MAP.img = img; mapaDraw(); } };
    img.onerror = () => mapaDraw();
    img.src     = cena.mapa_url;
  } else {
    if (_vid) mapaStopVideo();
    MAP.img = null; MAP.imgUrl = null; mapaDraw();
  }
}
```

Aplique a mesma checagem `novaImgUrl !== MAP.imgUrl` + `MAP.img = null` antes do load no handler realtime de `mapa_estado` (ele já checa a URL, só falta limpar `MAP.img` antes do load async).

## 5. `mapa.js` — `mapaImportarVideo()` (limpar mapa_url da cena)

Troque o update na cena ativa por:

```js
if (typeof cenaAtiva !== 'undefined' && cenaAtiva) {
  await db.from('cenas_mapa')
    .update({ video_url: _vidUrl, mapa_url: null })   // <- limpa a imagem velha
    .eq('id', cenaAtiva);
}
```

Sem isso, a cena fica com `mapa_url` E `video_url` ao mesmo tempo — a raiz do conflito imagem×vídeo.

## 6. `mapa.js` — grid otimizado (um único path)

Dentro de `mapaDraw()`, substitua o bloco do grid:

```js
if (gridVisible && gridSize * zoom >= 4) {   // pula grid ilegível no zoom-out
  const hex = gridColor.replace('#', '');
  const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
  ctx.strokeStyle = `rgba(${r},${g},${b},${gridOpacity})`;
  ctx.lineWidth = 1 / zoom;
  const wx0 = -offX/zoom, wy0 = -offY/zoom;
  const wx1 = (W-offX)/zoom, wy1 = (H-offY)/zoom;
  const sx = Math.floor(wx0/gridSize)*gridSize;
  const sy = Math.floor(wy0/gridSize)*gridSize;
  ctx.beginPath();                              // UM path para o grid inteiro
  for (let x = sx; x <= wx1+gridSize; x += gridSize) {
    ctx.moveTo(x, wy0); ctx.lineTo(x, wy1);
  }
  for (let y = sy; y <= wy1+gridSize; y += gridSize) {
    ctx.moveTo(wx0, y); ctx.lineTo(wx1, y);
  }
  ctx.stroke();                                 // UM stroke em vez de centenas
}
```

Antes: 1 `beginPath()` + 1 `stroke()` **por linha** (centenas de draw calls × 60fps com vídeo). Depois: 1 draw call por frame.

## 7. Checklist de teste

1. Ativar cena com vídeo → mover token → 💾 Salvar → trocar de cena → voltar: tokens e vídeo devem persistir.
2. Trocar cena de vídeo para imagem → 💾 Salvar → reativar: a imagem deve aparecer (vídeo não volta mais).
3. F5 → editar → 💾 Salvar: não deve mais dar "Nenhuma cena ativa".
4. Trocar cena rapidamente vídeo↔imagem: sem flash da cena anterior, sem vídeo duplicado (verifique no console: só um `_vidLoop` ativo).
5. Player conectado durante a troca: mapa deve trocar uma única vez, sem restart do vídeo.
