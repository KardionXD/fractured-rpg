// ══════════════════════════════════════════════════════════════════
//  NÚCLEO — MOTOR DA FICHA
//
//  Até aqui, a ficha do Fractured eram 136 linhas de HTML escritas à
//  mão dentro do app.html. Enquanto existisse um sistema só, isso
//  funcionava. Com dois, não existe HTML que sirva aos dois: um tem
//  Profissão, Trauma e Veículo; o outro tem Rank, Chakra e Jutsus.
//
//  Este motor monta a ficha a partir do que o sistema DECLARA. Ele
//  conhece alguns tipos de seção que servem a qualquer sistema —
//  identidade, atributos, recursos, medidor da mesa, perícias, notas —
//  e, para o que é exclusivo de um sistema, apenas reserva o espaço:
//  o próprio módulo devolve o HTML daquele pedaço.
//
//  REGRA QUE NÃO PODE SER QUEBRADA: os ids gerados aqui são os mesmos
//  ids que o HTML antigo tinha (`a-for`, `f-nome`, `pip-pv`,
//  `section-identidade`…). Cerca de cinquenta funções espalhadas pelo
//  projeto procuram por eles. Enquanto os ids forem os mesmos, nada
//  mais precisa mudar — e é isso que torna esta troca segura.
// ══════════════════════════════════════════════════════════════════

function _e(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── SEÇÃO: CABEÇALHO ──────────────────────────────────────────────
function _fmCabecalho(s) {
  const temas = (s.ficha.temas || []).map((t, i) =>
    `<button class="tema-btn${i === 0 ? ' active' : ''}" data-tema="${t.id}"` +
    `${' '.repeat(i === 0 ? 2 : 8)}onclick="setTemaFicha('${t.id}')">${_e(t.nome)}</button>`
  ).join('\n            ');
  return `<div class="page-header">
        <div><div class="page-title">${_e(s.ficha.titulo)}</div><div class="page-sub">${_e(s.ficha.subtitulo)}</div></div>
        <div class="ficha-header-right">
          <div class="tema-switch" id="tema-switch">
            ${temas}
          </div>
          <button class="btn-primary" style="width:auto;margin:0;padding:9px 20px" onclick="salvarFicha()">💾 Salvar</button>
        </div>
      </div>`;
}

// ── SEÇÃO: IDENTIDADE ─────────────────────────────────────────────
//  Foto, nome e jogador servem a qualquer sistema. O que muda entre um
//  e outro são os campos do meio: Profissão e Trauma no Fractured, Clã
//  e Vila em outro. Por isso eles vêm da declaração.
function _fmCampo(c) {
  const cls = 'field' + (c.classe ? ' ' + c.classe : '');
  const rot = `<label>${_e(c.rotulo)}</label>`;
  if (c.tipo === 'select') {
    return `<div class="${cls}">${rot}
                <select id="${c.id}" onchange="autoSave()"><option value="">${_e(c.vazio || 'Selecionar...')}</option></select>${c.extra || ''}
              </div>`;
  }
  return `<div class="${cls}">${rot}<input type="text" id="${c.id}" placeholder="${_e(c.dica || '...')}" oninput="autoSave()"></div>`;
}

function _fmIdentidade(s, sec) {
  const linha  = (sec.campos || []).filter(c => c.linha !== 'baixo');
  const abaixo = (sec.campos || []).filter(c => c.linha === 'baixo');
  return `<div class="section-card" id="section-identidade">
        <div class="section-card-title">${_e(sec.titulo)}</div>
        <div class="ficha-id-row">
          <div class="ficha-avatar-frame">
            <div class="ficha-avatar-shape"></div>
            <div class="ficha-avatar-inner" onclick="document.getElementById('char-foto-input').click()">
              <span id="char-foto-placeholder">🧑</span>
              <img id="char-foto-img" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:inherit">
            </div>
            <input type="file" id="char-foto-input" accept="image/*" style="display:none" onchange="uploadFotoPersonagem(this)">
            <span class="ficha-avatar-hint">Clique para trocar</span>
          </div>
          <div class="ficha-id-fields">
            <div class="grid-3">
              ${linha.map(_fmCampo).join('\n              ')}
            </div>
            ${abaixo.map(_fmCampo).join('\n            ')}
          </div>
        </div>
      </div>`;
}

// ── SEÇÃO: ATRIBUTOS ──────────────────────────────────────────────
//  Só a moldura: os cartões são desenhados por buildAttrGrid(), que já
//  lê os atributos do sistema desde a fase 2.
function _fmAtributos(s, sec) {
  return `<div class="section-card" id="section-atributos"><div class="section-card-title">${_e(sec.titulo)}</div><div class="attr-grid" id="attr-grid"></div></div>`;
}

// ── SEÇÃO: RECURSOS ───────────────────────────────────────────────
//  Cada recurso vira o mesmo par: a fileira de bolinhas e o medidor com
//  − e +. Antes, os três estavam escritos por extenso, quase iguais —
//  75 linhas para dizer três vezes a mesma coisa.
function _fmRecurso(r, i) {
  const rot   = _e(r.nome);
  const titAt = r.dica ? ` title="${_e(r.dica)}"` : '';
  const maxIni = typeof r.max === 'number' ? r.max : 20;
  const iniVal = r.comecaCheio ? `${maxIni}/${maxIni}` : `0/${maxIni}`;
  const formula = r.formulaId
    ? `\n                <div style="font-size:10px;color:var(--muted);margin-bottom:8px;padding-left:108px" id="${r.formulaId}">${_e(r.formulaTexto || '')}</div>`
    : '';
  const estiloLinha = i === 2 ? ' style="margin-top:5px"' : '';
  return `<div class="recurso-item">
              <div class="recurso-pip-block">
                <div class="pip-row"${estiloLinha}><span class="pip-label"${titAt}>${rot}</span><div class="pips" id="pip-${r.id}"></div><span class="pip-val" id="pip-${r.id}-val">${iniVal}</span></div>${formula}
              </div>
              <div class="recurso-gauge">
                <div class="recurso-gauge-head"><span class="recurso-gauge-icon" data-fic="${r.icone}" data-fic-size="16"></span><span class="recurso-gauge-label"${titAt}>${_e(r.nomeMedidor || r.nome)}</span><span class="recurso-gauge-val" id="gauge-${r.id}-val">${iniVal}</span></div>
                <div class="recurso-gauge-row">
                  <button type="button" class="recurso-gauge-btn" onclick="ajustarRecurso('${r.id}',-1)">−</button>
                  <div class="recurso-gauge-track"><div class="recurso-gauge-fill" id="gauge-${r.id}-fill"></div></div>
                  <button type="button" class="recurso-gauge-btn" onclick="ajustarRecurso('${r.id}',1)">+</button>
                </div>
                <span class="recurso-gauge-caption"${r.legendaId ? ` id="${r.legendaId}"` : ''}>${_e(r.legenda || '')}</span>
              </div>
            </div>`;
}

function _fmRecursos(s, sec) {
  const itens = s.recursos.map(_fmRecurso).join('\n            ');
  const medidor = sec.medidorDaMesa ? _fmMedidorMesa(s, sec.medidorDaMesa) : '';
  return `<div class="grid-recursos-tensao" id="section-recursos-tensao">
        <div class="section-card">
          <div class="section-card-title">${_e(sec.titulo)}</div>
          <div class="recursos-wrap">
            ${itens}
          </div>
        </div>
        ${medidor}
      </div>`;
}

// ── O MEDIDOR COMPARTILHADO DA MESA ───────────────────────────────
//  Tensão no Fractured; Vínculo de Equipe em A Vontade do Fogo. A
//  forma é a mesma: uma régua de 0 a 10 que a mesa inteira enxerga.
function _fmMedidorMesa(s, cfg) {
  const rec = (s.recursosMesa || []).find(r => r.id === cfg.id);
  if (!rec) return '';
  return `<div class="section-card">
          <div class="section-card-title">${_e(rec.nome)}</div>
          <div class="tensao-row">
            <span class="tensao-endlabel tensao-endlabel-start">${_e(cfg.inicio)}</span>
            <div class="tensao-pips" id="${cfg.pipsId}"></div>
            <span class="tensao-endlabel tensao-endlabel-end">${_e(cfg.fim)}</span>
          </div>
          <div class="tensao-legend" style="margin-top:6px;font-size:9px;color:var(--muted)">${_e(cfg.legenda)}</div>
        </div>`;
}

// ── SEÇÃO: PERÍCIAS (com um bloco ao lado) ────────────────────────
function _fmPericias(s, sec) {
  const lado = sec.aoLado ? _fmBlocoSimples(sec.aoLado) : '';
  return `<div class="grid-pericias-vinculos" id="section-pericias-vinculos">
        <div class="section-card"><div class="section-card-title">${_e(sec.titulo)}</div><div id="pericias-dica" class="pericias-dica">${_e(s.pericias.explicacao)}</div><div id="pericias-list" class="gap-12"></div></div>
        ${lado}
      </div>`;
}

function _fmBlocoSimples(b) {
  return `<div class="section-card"><div class="section-card-title">${b.tituloHtml || _e(b.titulo)}</div><div id="${b.id}"></div></div>`;
}

// ── SEÇÃO: NOTAS ──────────────────────────────────────────────────
function _fmNotas(s, sec) {
  return `<div class="section-card" id="section-notas"><div class="section-card-title">${_e(sec.titulo)}</div><textarea id="f-notas" placeholder="${_e(sec.dica)}" rows="4" oninput="autoSave()" class="textarea-bare"></textarea></div>`;
}

// ── SEÇÃO: SELO DO RODAPÉ ─────────────────────────────────────────
function _fmSelo() {
  return `<div class="ficha-footer-seal" id="ficha-footer-seal"><span class="ficha-footer-line"></span><span class="ficha-footer-icon" data-fic="logo" data-fic-size="20"></span><span class="ficha-footer-line"></span></div>`;
}

// ── SEÇÃO: BLOCO EXCLUSIVO DO SISTEMA ─────────────────────────────
//  Veículo e Inventário no Fractured; Jutsus, Clã e Naturezas em
//  A Vontade do Fogo. O motor não sabe o que são — só abre espaço.
function _fmBloco(s, sec) {
  const corpo = typeof sec.html === 'function' ? sec.html(s) : (sec.html || `<div id="${sec.lista}"></div>`);
  return `<div class="section-card" id="${sec.id}">
        <div class="section-card-title">${_e(sec.titulo)}</div>
        ${corpo}
      </div>`;
}

// ── O MONTADOR ────────────────────────────────────────────────────
const _FM_TIPOS = {
  identidade: _fmIdentidade,
  atributos:  _fmAtributos,
  recursos:   _fmRecursos,
  pericias:   _fmPericias,
  notas:      _fmNotas,
  bloco:      _fmBloco,
};

function fichaMotorHtml() {
  const s = S();
  const partes = [_fmCabecalho(s)];
  (s.ficha.secoes || []).forEach(sec => {
    const fn = _FM_TIPOS[sec.tipo];
    if (!fn) { console.warn('[ficha] tipo de seção desconhecido:', sec.tipo); return; }
    partes.push(fn(s, sec));
  });
  partes.push(_fmSelo());
  return partes.join('\n      ');
}

//  Desenha a ficha dentro do #page-ficha e converte os ícones da marca
//  (o script do app.html só converte os que existem quando a página
//  carrega; estes nascem depois).
function fichaMotorMontar() {
  const alvo = document.getElementById('page-ficha');
  if (!alvo) return;
  alvo.innerHTML = fichaMotorHtml();
  alvo.querySelectorAll('[data-fic]').forEach(el => {
    el.innerHTML = fracIcon(el.dataset.fic, { size: parseInt(el.dataset.ficSize) || 18 });
  });
}
