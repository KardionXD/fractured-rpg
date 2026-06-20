// ══════════════════════════════════════════════════
//  FRACTURED — combate.js  (v2)
//  Combat Tracker + Mapa unificados
// ══════════════════════════════════════════════════

// ── BESTIÁRIO ─────────────────────────────────────
const BESTIARIO = {
  infectados: [
    { id:'corredor',     nome:'Corredor',          pv:10, com:1,  agi:2,  res:0,  emoji:'🧟', tipo:'infectado',
      habilidades:['Enxame: 3+ atacam o mesmo alvo','Hesitação: para 1 round ao ver rosto familiar','Grito de Atração: chama outros'],
      fraqueza:'Qualquer dano direto. Separe e elimine individualmente.' },
    { id:'perseguidor',  nome:'Perseguidor',        pv:15, com:2,  agi:1,  res:1,  emoji:'🧟', tipo:'infectado',
      habilidades:['Emboscada automática','Gavinhas de Parede: +3 surpresa','Perseguição Tenaz'],
      fraqueza:'Fogo e impacto contundente. Armadilhas de arame.' },
    { id:'estalador',    nome:'Estalador',          pv:20, com:3,  agi:1,  res:2,  emoji:'🕷️', tipo:'infectado',
      habilidades:['Sonar Perfeito: detecta >30dB','Agarrão Fatal: mata em 1 round','Blindagem: −2 dano exceto fogo'],
      fraqueza:'Fogo. Morte silenciosa: AGI≥17 + faca.' },
    { id:'baiacu',       nome:'Baiacu',             pv:35, com:4,  agi:-1, res:4,  emoji:'💀', tipo:'infectado',
      habilidades:['Armadura: dano reduzido à metade','Nuvem de Esporos 5m ao morrer','Investida: +2d6 estrutural'],
      fraqueza:'Explosivos e fogo prolongado APENAS.' },
    { id:'tropego',      nome:'Trôpego',            pv:30, com:3,  agi:-1, res:3,  emoji:'💣', tipo:'infectado',
      habilidades:['Não morde','Explosão de Esporos: qualquer dano → esporos 3m','Resistência Ácida'],
      fraqueza:'Explosivos a distância APENAS.' },
    { id:'rei_ratos',    nome:'Rei dos Ratos',      pv:80, com:5,  agi:-2, res:6,  emoji:'👑', tipo:'infectado',
      habilidades:['Divisão: 50% PV → 2d4 infectados','Rede 100m raio','Cascata de Morte','Regeneração +5PV/round'],
      fraqueza:'Destrua 5+ nós da rede primeiro.' },
  ],
  animais: [
    { id:'lobo',   nome:'Lobo / Cão Selvagem', pv:12, com:2, agi:3,  res:0,  emoji:'🐺', tipo:'animal',
      habilidades:['Flanqueio: +2 dano','Avaliação de Presa: 1 round','Perseguição 500m'],
      fraqueza:'Mate o alfa → 60% recua. Fogo os afasta.' },
    { id:'urso',   nome:'Urso',                pv:45, com:4, agi:0,  res:5,  emoji:'🐻', tipo:'animal',
      habilidades:['Investida: +3 dano, derruba','Resistência: −2 dano','Com filhotes: nunca recua'],
      fraqueza:'Rifle pesado ou explosivos. Suba em estruturas.' },
    { id:'javali', nome:'Javali',              pv:20, com:3, agi:1,  res:2,  emoji:'🐗', tipo:'animal',
      habilidades:['Carga: AGI≥13 para desviar','Presa: 2d6+3','Bando: +1 Tensão'],
      fraqueza:'Tiro na cabeça. Suba.' },
    { id:'corvo',  nome:'Corvo de Bando',      pv:3,  com:0, agi:4,  res:-2, emoji:'🐦', tipo:'animal',
      habilidades:['Delator: revela posição','Alarme: +1 Tensão se assustados'],
      fraqueza:'Ignore. Matar piora.' },
  ],
  humanos: [
    { id:'saqueador', nome:'Saqueador',          pv:14, com:1, agi:1,  res:-1, emoji:'🔪', tipo:'humano',
      habilidades:['Moral Frágil: SOCIAL≥11','Rendição possível','Armamento improvisado'],
      fraqueza:'Intimide antes de atacar.' },
    { id:'atirador',  nome:'Atirador de Facção', pv:18, com:3, agi:2,  res:0,  emoji:'🔫', tipo:'humano',
      habilidades:['Cobertura: +2 defesa','Relata à facção','Tiro coordenado'],
      fraqueza:'Flanqueie ou destrua cobertura.' },
    { id:'lider',     nome:'Líder de Bando',     pv:25, com:4, agi:2,  res:3,  emoji:'😈', tipo:'humano',
      habilidades:['Imune a intimidação simples','Eleva aliados','Negocia por interesse'],
      fraqueza:'Eliminar o líder quebra o grupo.' },
    { id:'cacador',   nome:'Caçador Profissional',pv:22, com:4, agi:3,  res:-2, emoji:'🏹', tipo:'humano',
      habilidades:['Emboscada: INSTINTO≥16','Rastreamento 24h','Tiro Silencioso'],
      fraqueza:'Mude de rota. Inverta a caça.' },
  ],
  animais_infectados: [
    { id:'cao_corredor',   nome:'Cão Corredor',   pv:16, com:3, agi:4,  res:1,  emoji:'🐕', tipo:'animal_infectado',
      habilidades:['Age 2x/round','Rastreamento fúngico','Mordida infectante RES≥13'],
      fraqueza:'Armadilhas de laço. Fogo desorienta.' },
    { id:'urso_estalador', nome:'Urso Estalador', pv:60, com:5, agi:0,  res:6,  emoji:'🐻', tipo:'animal_infectado',
      habilidades:['Sonar: >20dB','Armadura Dupla: −3 dano','Investida: +3d6','Agarrão: 2d8/round'],
      fraqueza:'Explosivos pesados e fogo prolongado. Fuja em silêncio.' },
  ]
};
const TODOS_INIMIGOS = Object.values(BESTIARIO).flat();

// ── ESTADO COMBAT TRACKER ─────────────────────────
let combatentes   = [];
let turnoAtual    = 0;
let rodadaAtual   = 1;
let combateAtivo  = false;
let mostrarPVInimigos = true;

// ── ESTADO MAPA ───────────────────────────────────
let tokens        = [];
let tokenSel      = null;
let dragTok       = null;
let dragOX = 0, dragOY = 0;
let gridSize      = 60;
let gridVisivel   = true;
let mapaImg       = null;
let mapaUrl       = null;
let medindoDistancia = false;
let medirStart    = null;
let medirEnd      = null;
let metrosPorCelula = 1.5;

let canvas, ctx;
const CW = 1200, CH = 700;

// ══════════════════════════════════════════════════
//  COMBAT TRACKER
// ══════════════════════════════════════════════════
function renderCT() {
  const lista = document.getElementById('ct-lista');
  if (!lista) return;

  if (combatentes.length === 0) {
    lista.innerHTML = '<div class="ct-empty">Adicione combatentes para iniciar o combate.</div>';
    document.getElementById('ct-rodada').textContent  = 'Rodada 1';
    document.getElementById('ct-turno-info').textContent = 'Combate não iniciado';
    return;
  }

  const ord = [...combatentes].sort((a,b) => b.iniciativa - a.iniciativa);
  lista.innerHTML = '';

  ord.forEach((c, idx) => {
    const isAtual = combateAtivo && ord[turnoAtual]?.id === c.id;
    const pct     = c.pvMax ? Math.max(0, Math.round((c.pvAtual/c.pvMax)*100)) : 100;
    const barCol  = pct > 50 ? '#27ae60' : pct > 25 ? '#f39c12' : '#c0392b';
    const estado  = !c.pvMax ? '' : pct > 75 ? '' : pct > 50 ? '🩹 Ferido' : pct > 25 ? '⚠️ Grave' : pct > 0 ? '💀 Crítico' : '☠️ Incapacitado';
    const ocultarPV = !c.isPC && !mostrarPVInimigos;
    const imgTag  = c.imgUrl
      ? `<img src="${c.imgUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0">`
      : `<span style="font-size:26px;flex-shrink:0">${c.emoji||'❓'}</span>`;

    const div = document.createElement('div');
    div.className = 'ct-item' + (isAtual?' ct-ativo':'') + (c.pvAtual<=0&&c.pvMax?' ct-morto':'');
    div.innerHTML = `
      <div class="ct-ordem">${isAtual?'▶':idx+1}</div>
      ${imgTag}
      <div class="ct-info">
        <div class="ct-nome">${c.nome}${c.tag?`<span class="ct-tag">${c.tag}</span>`:''}</div>
        <div class="ct-ini">Iniciativa: <strong>${c.iniciativa}</strong>${estado?' · '+estado:''}</div>
        ${c.pvMax && !ocultarPV ? `
        <div class="ct-bar-wrap"><div class="ct-bar" style="width:${pct}%;background:${barCol}"></div></div>
        <div class="ct-pv-row">
          <span class="ct-pv-label">PV</span>
          <button class="ct-pv-btn" onclick="alterarPV('${c.id}',-1)">−</button>
          <input type="number" class="ct-pv-input" value="${c.pvAtual}" min="0" max="${c.pvMax}"
            onchange="setPV('${c.id}',this.value)">
          <span class="ct-pv-sep">/${c.pvMax}</span>
          <button class="ct-pv-btn" onclick="alterarPV('${c.id}',1)">+</button>
          <button class="ct-pv-btn ct-pv-dmg" onclick="danoRapido('${c.id}')" title="Dano rápido">⚔</button>
        </div>` : c.pvMax && ocultarPV ? `<div style="font-size:10px;color:var(--muted)">PV oculto</div>` : ''}
        ${c.condicoes?.length ? `<div class="ct-condicoes">${c.condicoes.map(cn=>`<span class="ct-cond">${cn}</span>`).join('')}</div>` : ''}
        ${c.habilidades ? `<details class="ct-detalhes"><summary>Habilidades</summary><ul>${c.habilidades.map(h=>`<li>${h}</li>`).join('')}</ul>${c.fraqueza?`<div class="ct-fraqueza">⚡ ${c.fraqueza}</div>`:''}</details>` : ''}
      </div>
      <div class="ct-acoes">
        <button class="ct-btn" onclick="toggleCond('${c.id}','Atordoado')" title="Atordoado">😵</button>
        <button class="ct-btn" onclick="toggleCond('${c.id}','Envenenado')" title="Envenenado">☠</button>
        <button class="ct-btn" onclick="toggleCond('${c.id}','Imobilizado')" title="Imobilizado">🔒</button>
        <button class="ct-btn ct-btn-red" onclick="removerComb('${c.id}')" title="Remover">✕</button>
      </div>
    `;
    lista.appendChild(div);
  });

  document.getElementById('ct-rodada').textContent     = `Rodada ${rodadaAtual}`;
  document.getElementById('ct-turno-info').textContent = combateAtivo
    ? `Turno: ${[...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa)[turnoAtual]?.nome||'—'}`
    : 'Clique em Iniciar';
}

function adicionarInimigoCT(inimigo) {
  const existentes = combatentes.filter(c=>c.id.startsWith(inimigo.id));
  combatentes.push({
    id: inimigo.id+'_'+Date.now(),
    nome: inimigo.nome, emoji: inimigo.emoji,
    tag: existentes.length>0 ? ` #${existentes.length+1}` : '',
    pvMax: inimigo.pv, pvAtual: inimigo.pv,
    iniciativa: Math.floor(Math.random()*20)+1+(inimigo.agi||0),
    tipo: inimigo.tipo, habilidades: inimigo.habilidades,
    fraqueza: inimigo.fraqueza, condicoes: [], isPC: false,
  });
  renderCT();
}

function adicionarPCCT() {
  const nome = document.getElementById('ct-pc-nome')?.value.trim();
  const ini  = parseInt(document.getElementById('ct-pc-ini')?.value)||10;
  const pv   = parseInt(document.getElementById('ct-pc-pv')?.value)||20;
  if (!nome) return;
  combatentes.push({
    id:'pc_'+Date.now(), nome, emoji:'🧑',
    pvMax:pv, pvAtual:pv, iniciativa:ini,
    tipo:'pc', isPC:true, condicoes:[],
  });
  if (document.getElementById('ct-pc-nome')) document.getElementById('ct-pc-nome').value='';
  renderCT();
}

function iniciarCombate() {
  if (!combatentes.length) return;
  combateAtivo=true; turnoAtual=0; rodadaAtual=1;
  renderCT();
}

function proximoTurno() {
  if (!combateAtivo||!combatentes.length) return;
  const ord=[...combatentes].sort((a,b)=>b.iniciativa-a.iniciativa);
  turnoAtual++;
  if (turnoAtual>=ord.length){turnoAtual=0;rodadaAtual++;}
  let t=0;
  while(ord[turnoAtual]?.pvAtual<=0&&ord[turnoAtual]?.pvMax&&t<ord.length){
    turnoAtual++; if(turnoAtual>=ord.length){turnoAtual=0;rodadaAtual++;} t++;
  }
  renderCT();
}

function encerrarCombate() {
  if (!confirm('Encerrar combate e limpar lista?')) return;
  combatentes=[]; turnoAtual=0; rodadaAtual=1; combateAtivo=false; renderCT();
}

function alterarPV(id,delta) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  c.pvAtual=Math.max(0,Math.min(c.pvMax,c.pvAtual+delta));
  sincronizarTokenPV(id, c.pvAtual);
  renderCT();
}

function setPV(id,val) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  c.pvAtual=Math.max(0,Math.min(c.pvMax,parseInt(val)||0));
  sincronizarTokenPV(id, c.pvAtual);
  renderCT();
}

function sincronizarTokenPV(combId, pvAtual) {
  const t=tokens.find(x=>x.combId===combId);
  if(t){t.pvAtual=pvAtual; desenharMapa();}
}

function danoRapido(id) {
  const v=prompt('Quanto de dano?'); if(!v) return;
  const d=parseInt(v); if(isNaN(d)) return;
  alterarPV(id,-d);
}

function toggleCond(id,cond) {
  const c=combatentes.find(x=>x.id===id); if(!c) return;
  if(!c.condicoes) c.condicoes=[];
  const i=c.condicoes.indexOf(cond);
  if(i>=0) c.condicoes.splice(i,1); else c.condicoes.push(cond);
  renderCT();
}

function removerComb(id) {
  combatentes=combatentes.filter(c=>c.id!==id);
  if(turnoAtual>=combatentes.length) turnoAtual=0;
  renderCT();
}

function togglePVInimigos() {
  mostrarPVInimigos=!mostrarPVInimigos;
  const btn=document.getElementById('btn-toggle-pv');
  if(btn) btn.textContent=mostrarPVInimigos?'👁 PV Oculto Inimigos':'👁 PV Visível Inimigos';
  renderCT();
}

function renderBestiarioCT() {
  const lista=document.getElementById('ct-bestiario-lista'); if(!lista) return;
  const filtro=(document.getElementById('ct-filtro')?.value||'').toLowerCase();
  lista.innerHTML='';
  const nomes={infectados:'Infectados',animais:'Animais',humanos:'Humanos',animais_infectados:'Animais Infectados'};
  Object.entries(BESTIARIO).forEach(([cat,inimigos])=>{
    const fil=inimigos.filter(i=>i.nome.toLowerCase().includes(filtro));
    if(!fil.length) return;
    const h=document.createElement('div'); h.className='ct-categoria'; h.textContent=nomes[cat]; lista.appendChild(h);
    fil.forEach(ini=>{
      const div=document.createElement('div'); div.className='ct-inimigo-item';
      div.innerHTML=`
        <span class="ct-inimigo-emoji">${ini.emoji}</span>
        <div class="ct-inimigo-info">
          <div class="ct-inimigo-nome">${ini.nome}</div>
          <div class="ct-inimigo-stats">PV ${ini.pv} · COM ${ini.com>=0?'+':''}${ini.com} · AGI ${ini.agi>=0?'+':''}${ini.agi}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          ${isMaster?`<button class="ct-add-btn" onclick='adicionarInimigoCT(${JSON.stringify(ini).replace(/'/g,"&#39;")})'>+CT</button>`:''}
          ${isMaster?`<button class="ct-add-btn ct-add-mapa" onclick='adicionarTokenMapa(${JSON.stringify(ini).replace(/'/g,"&#39;")})'>+🗺</button>`:''}
        </div>
      `;
      lista.appendChild(div);
    });
  });
}

// ══════════════════════════════════════════════════
//  MAPA
// ══════════════════════════════════════════════════
function initMapa() {
  canvas=document.getElementById('mapa-canvas'); if(!canvas) return;
  ctx=canvas.getContext('2d');
  canvas.width=CW; canvas.height=CH;

  canvas.addEventListener('mousedown', onMDown);
  canvas.addEventListener('mousemove', onMMove);
  canvas.addEventListener('mouseup',   onMUp);
  canvas.addEventListener('touchstart',onTStart,{passive:false});
  canvas.addEventListener('touchmove', onTMove, {passive:false});
  canvas.addEventListener('touchend',  onTEnd);

  carregarMapaDB();
}

function desenharMapa() {
  if(!ctx) return;
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#05050a'; ctx.fillRect(0,0,CW,CH);

  if(mapaImg) ctx.drawImage(mapaImg,0,0,CW,CH);

  // Grid
  if(gridVisivel) {
    ctx.strokeStyle='rgba(192,57,43,0.18)'; ctx.lineWidth=1;
    for(let x=0;x<=CW;x+=gridSize){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
    for(let y=0;y<=CH;y+=gridSize){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
  }

  // Régua
  if(medindoDistancia && medirStart && medirEnd) {
    ctx.beginPath();
    ctx.moveTo(medirStart.x,medirStart.y);
    ctx.lineTo(medirEnd.x,medirEnd.y);
    ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2;
    ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
    const dx=medirEnd.x-medirStart.x, dy=medirEnd.y-medirStart.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const metros=(dist/gridSize*metrosPorCelula).toFixed(1);
    ctx.font='bold 14px sans-serif'; ctx.fillStyle='#f1c40f';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(`${metros}m`, (medirStart.x+medirEnd.x)/2, (medirStart.y+medirEnd.y)/2-4);
  }

  tokens.forEach(t=>desenharToken(t));
}

function desenharToken(t) {
  const r=gridSize*0.42;
  const cx=t.x+gridSize/2, cy=t.y+gridSize/2;

  // Seleção
  if(tokenSel?.id===t.id){
    ctx.beginPath(); ctx.arc(cx,cy,r+5,0,Math.PI*2);
    ctx.strokeStyle='#f1c40f'; ctx.lineWidth=3; ctx.stroke();
  }

  if(t.imgUrl) {
    // Token com imagem
    const img=new Image(); img.src=t.imgUrl;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip();
    try{ctx.drawImage(img,cx-r,cy-r,r*2,r*2);}catch(e){}
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    const cor=corTipo(t.tipo);
    ctx.strokeStyle=cor; ctx.lineWidth=2.5; ctx.stroke();
  } else {
    const cor=corTipo(t.tipo);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle=cor; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.font=`${gridSize*0.36}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(t.emoji||'?',cx,cy);
  }

  // Nome
  ctx.font=`bold ${Math.max(9,gridSize*0.13)}px sans-serif`;
  ctx.fillStyle='#fff'; ctx.strokeStyle='rgba(0,0,0,0.8)'; ctx.lineWidth=3;
  ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.strokeText(t.nome.substring(0,10),cx,t.y+gridSize-15);
  ctx.fillText(t.nome.substring(0,10),cx,t.y+gridSize-15);

  // Barra PV — só mostra para PCs ou se mestre
  const deveMostrarPV = t.pvMax && (t.isPC || isMaster || mostrarPVInimigos);
  if(deveMostrarPV) {
    const bw=gridSize-8, bh=5, bx=t.x+4, by=t.y+3;
    const pct=Math.max(0,t.pvAtual/t.pvMax);
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle=pct>0.5?'#27ae60':pct>0.25?'#f39c12':'#c0392b';
    ctx.fillRect(bx,by,bw*pct,bh);
  }
}

function corTipo(tipo) {
  const mapa={'pc':'#2980b9','infectado':'#c0392b','animal':'#27ae60','animal_infectado':'#8e44ad','humano':'#e67e22','custom':'#7f8c8d'};
  return mapa[tipo]||'#555';
}

function snap(v){return Math.round(v/gridSize)*gridSize;}

function getTokenAt(x,y){
  return tokens.slice().reverse().find(t=>x>=t.x&&x<=t.x+gridSize&&y>=t.y&&y<=t.y+gridSize);
}

function cPos(e){
  const r=canvas.getBoundingClientRect();
  return{x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};
}

function onMDown(e){
  const p=cPos(e);
  if(medindoDistancia){medirStart=p;medirEnd=p;return;}
  const t=getTokenAt(p.x,p.y);
  if(t){
    if(!podeMoverToken(t)) return;
    dragTok=t; dragOX=p.x-t.x; dragOY=p.y-t.y; tokenSel=t; desenharMapa(); mostrarInfoToken(t);
  } else { tokenSel=null; desenharMapa(); esconderInfoToken(); }
}

function onMMove(e){
  const p=cPos(e);
  if(medindoDistancia&&medirStart){medirEnd=p;desenharMapa();return;}
  if(!dragTok) return;
  dragTok.x=Math.max(0,Math.min(CW-gridSize,p.x-dragOX));
  dragTok.y=Math.max(0,Math.min(CH-gridSize,p.y-dragOY));
  desenharMapa();
}

function onMUp(){
  if(medindoDistancia){return;}
  if(!dragTok) return;
  dragTok.x=snap(dragTok.x); dragTok.y=snap(dragTok.y);
  dragTok=null; desenharMapa(); salvarMapaDB();
}

function onTStart(e){e.preventDefault();const t=e.touches[0];onMDown({clientX:t.clientX,clientY:t.clientY});}
function onTMove(e){e.preventDefault();const t=e.touches[0];onMMove({clientX:t.clientX,clientY:t.clientY});}
function onTEnd(){onMUp();}

function podeMoverToken(t){
  if(isMaster) return true;
  if(t.isPC && t.userId===currentUser?.id) return true;
  return false;
}

// ── INFO TOKEN ────────────────────────────────────
function mostrarInfoToken(t) {
  const el=document.getElementById('token-info'); if(!el) return;
  el.style.display='block';
  const podeEditar=isMaster||(t.isPC&&t.userId===currentUser?.id);
  el.innerHTML=`
    <div class="token-info-header">
      ${t.imgUrl?`<img src="${t.imgUrl}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:`<span style="font-size:24px">${t.emoji||'?'}</span>`}
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${t.nome}</div>
        <div style="font-size:10px;color:var(--muted)">${t.tipo||''}</div>
      </div>
      ${podeEditar?`<button class="btn-icon" onclick="removerToken('${t.id}')" title="Remover">🗑</button>`:''}
    </div>
    ${t.pvMax?`
    <div class="token-pv-row">
      <span style="font-size:10px;color:var(--muted)">PV</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',-1)">−</button>
      <input type="number" value="${t.pvAtual}" min="0" max="${t.pvMax}"
        style="width:44px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px;font-size:13px"
        onchange="setPVToken('${t.id}',this.value)">
      <span style="color:var(--muted);font-size:12px">/ ${t.pvMax}</span>
      <button class="ct-pv-btn" onclick="alterarPVToken('${t.id}',1)">+</button>
    </div>`:``}
    ${podeEditar?`
    <div style="margin-top:8px">
      <label style="font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase">Imagem do Token</label>
      <input type="file" accept="image/*" style="display:none" id="token-img-input-${t.id}"
        onchange="uploadTokenImg('${t.id}',this)">
      <button class="btn-ghost" style="width:100%;margin-top:4px;font-size:10px"
        onclick="document.getElementById('token-img-input-${t.id}').click()">📷 Trocar imagem</button>
    </div>`:''}
  `;
}

function esconderInfoToken(){const el=document.getElementById('token-info');if(el)el.style.display='none';}

function alterarPVToken(id,delta){
  const t=tokens.find(x=>x.id===id); if(!t) return;
  t.pvAtual=Math.max(0,Math.min(t.pvMax,t.pvAtual+delta));
  const c=combatentes.find(x=>x.combId===id);
  if(c){c.pvAtual=t.pvAtual;renderCT();}
  mostrarInfoToken(t); desenharMapa(); salvarMapaDB();
}

function setPVToken(id,val){
  const t=tokens.find(x=>x.id===id); if(!t) return;
  t.pvAtual=Math.max(0,Math.min(t.pvMax,parseInt(val)||0));
  const c=combatentes.find(x=>x.combId===id);
  if(c){c.pvAtual=t.pvAtual;renderCT();}
  desenharMapa(); salvarMapaDB();
}

function removerToken(id){
  tokens=tokens.filter(t=>t.id!==id); tokenSel=null;
  esconderInfoToken(); desenharMapa(); salvarMapaDB();
}

// ── UPLOAD IMAGEM TOKEN ───────────────────────────
async function uploadTokenImg(tokenId, input) {
  const file=input.files[0]; if(!file) return;
  const ext=file.name.split('.').pop();
  const path=`${currentUser.id}/${tokenId}.${ext}`;

  const{error}=await db.storage.from('tokens').upload(path,file,{upsert:true});
  if(error){toast('Erro no upload: '+error.message,'err');return;}

  const{data}=db.storage.from('tokens').getPublicUrl(path);
  const t=tokens.find(x=>x.id===tokenId);
  if(t){t.imgUrl=data.publicUrl; mostrarInfoToken(t); desenharMapa(); salvarMapaDB();}
  toast('Imagem do token atualizada!','ok');
}

// ── ADICIONAR TOKENS ──────────────────────────────
function adicionarTokenMapa(inimigo) {
  if(!isMaster){toast('Só o mestre pode adicionar inimigos.','err');return;}
  const id=inimigo.id+'_'+Date.now();
  tokens.push({
    id, nome:inimigo.nome, emoji:inimigo.emoji, tipo:inimigo.tipo,
    x:snap(Math.random()*(CW-gridSize*3)+gridSize),
    y:snap(Math.random()*(CH-gridSize*3)+gridSize),
    pvMax:inimigo.pv, pvAtual:inimigo.pv,
    habilidades:inimigo.habilidades, isPC:false,
  });
  desenharMapa(); salvarMapaDB();
}

function adicionarTokenPC() {
  const nome=document.getElementById('mapa-pc-nome')?.value.trim(); if(!nome) return;
  const id='pc_'+Date.now();
  tokens.push({
    id, nome, emoji:'🧑', tipo:'pc',
    x:snap(gridSize), y:snap(gridSize),
    isPC:true, userId:currentUser?.id,
  });
  if(document.getElementById('mapa-pc-nome')) document.getElementById('mapa-pc-nome').value='';
  desenharMapa(); salvarMapaDB();
}

// Token customizado pelo mestre
function abrirCriarTokenCustom() {
  const modal=document.getElementById('modal-token-custom'); if(modal) modal.style.display='flex';
}
function fecharCriarTokenCustom() {
  const modal=document.getElementById('modal-token-custom'); if(modal) modal.style.display='none';
}

let tokenCustomImg=null;
function tokenCustomImgPreview(input) {
  const file=input.files[0]; if(!file) return;
  tokenCustomImg=file;
  const reader=new FileReader();
  reader.onload=e=>{
    const prev=document.getElementById('token-custom-preview');
    if(prev){prev.src=e.target.result;prev.style.display='block';}
  };
  reader.readAsDataURL(file);
}

async function criarTokenCustom() {
  const nome=document.getElementById('tc-nome')?.value.trim()||'Token';
  const pvMax=parseInt(document.getElementById('tc-pv')?.value)||0;
  const tipo=document.getElementById('tc-tipo')?.value||'custom';
  const emoji=document.getElementById('tc-emoji')?.value||'⭐';
  const id='custom_'+Date.now();

  let imgUrl=null;
  if(tokenCustomImg){
    const ext=tokenCustomImg.name.split('.').pop();
    const path=`${currentUser.id}/${id}.${ext}`;
    const{error}=await db.storage.from('tokens').upload(path,tokenCustomImg,{upsert:true});
    if(!error){const{data}=db.storage.from('tokens').getPublicUrl(path);imgUrl=data.publicUrl;}
  }

  tokens.push({
    id,nome,emoji,tipo,imgUrl,
    x:snap(CW/2),y:snap(CH/2),
    pvMax:pvMax||undefined, pvAtual:pvMax||undefined,
    isPC:false,
  });
  tokenCustomImg=null;
  fecharCriarTokenCustom();
  desenharMapa(); salvarMapaDB();
  toast('Token criado!','ok');
}

// ── CONTROLES MAPA ────────────────────────────────
function toggleGrid(){
  gridVisivel=!gridVisivel;
  const btn=document.getElementById('btn-grid');
  if(btn)btn.textContent=gridVisivel?'⬛ Ocultar Grid':'⬛ Mostrar Grid';
  desenharMapa();
}

function alterarGrid(delta){
  gridSize=Math.max(30,Math.min(120,gridSize+delta));
  const el=document.getElementById('grid-size-val');
  if(el)el.textContent=gridSize+'px';
  desenharMapa();
}

function toggleRegua(){
  medindoDistancia=!medindoDistancia;
  medirStart=null; medirEnd=null;
  const btn=document.getElementById('btn-regua');
  if(btn){btn.textContent=medindoDistancia?'📏 Cancelar Régua':'📏 Régua';
  btn.style.color=medindoDistancia?'var(--gold)':'var(--muted)';}
  if(!medindoDistancia) desenharMapa();
}

function importarMapaImg(){
  const input=document.createElement('input');
  input.type='file'; input.accept='image/*';
  input.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{mapaImg=img;desenharMapa();salvarMapaDB();};
      img.src=ev.target.result; mapaUrl=ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function limparTokens(){
  if(!isMaster){toast('Só o mestre pode limpar.','err');return;}
  if(!confirm('Limpar todos os tokens?')) return;
  tokens=[]; tokenSel=null; esconderInfoToken(); desenharMapa(); salvarMapaDB();
}

// ── PERSISTÊNCIA ──────────────────────────────────
async function salvarMapaDB(){
  if(!isMaster) return;
  try{
    await db.from('mapa_estado').upsert({
      id:'sessao_atual',
      tokens: tokens.map(t=>({...t,imgUrl:t.imgUrl||null})),
      grid_size:gridSize, grid_visivel:gridVisivel,
      mapa_url:mapaUrl||null,
      updated_at:new Date().toISOString()
    });
  }catch(e){console.error('Erro ao salvar mapa:',e);}
}

async function carregarMapaDB(){
  try{
    const{data}=await db.from('mapa_estado').select('*').eq('id','sessao_atual').single();
    if(data){
      tokens=data.tokens||[];
      gridSize=data.grid_size||60;
      gridVisivel=data.grid_visivel!==false;
      if(data.mapa_url){
        mapaUrl=data.mapa_url;
        const img=new Image(); img.onload=()=>{mapaImg=img;desenharMapa();};
        img.src=data.mapa_url;
      }
      const el=document.getElementById('grid-size-val');
      if(el)el.textContent=gridSize+'px';
      const btn=document.getElementById('btn-grid');
      if(btn)btn.textContent=gridVisivel?'⬛ Ocultar Grid':'⬛ Mostrar Grid';
    }
  }catch(e){}
  desenharMapa();
  subscribeMapaRealtime();
}

let mapaRealtimeSub=null;
function subscribeMapaRealtime(){
  if(mapaRealtimeSub) return;
  mapaRealtimeSub=db.channel('mapa-realtime')
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'mapa_estado'},payload=>{
      const d=payload.new;
      if(!d) return;
      tokens=d.tokens||[];
      gridSize=d.grid_size||60;
      gridVisivel=d.grid_visivel!==false;
      if(d.mapa_url && d.mapa_url!==mapaUrl){
        mapaUrl=d.mapa_url;
        const img=new Image(); img.onload=()=>{mapaImg=img;desenharMapa();};
        img.src=d.mapa_url;
      }
      desenharMapa();
    })
    .subscribe();
}

