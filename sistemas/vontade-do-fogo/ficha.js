// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — OS BLOCOS DA FICHA NOVA
//
//  Este arquivo existe porque a ficha Shinobi parou de ser a ficha do
//  Fractured com outros rótulos. Cada bloco daqui foi desenhado para
//  este sistema:
//
//   · o Status mostra 23 / 28, não vinte e oito bolinhas;
//   · a Exaustão aplica o que ela faz, em vez de ser um contador;
//   · a Vontade do Fogo é um recurso com lista de usos, não um medidor;
//   · as perícias são as dezoito do livro, cada uma com um grau;
//   · o Vínculo de Equipe é da MESA, e nunca do personagem;
//   · Vínculos narrativos são Personagem + Descrição — Promessa e
//     Dívida são do Fractured e não têm equivalente aqui.
//
//  Nenhum número está escrito neste arquivo: tudo vem de dados.js.
// ══════════════════════════════════════════════════════════════════

function _av(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//  O estado do personagem como as regras precisam ver: exaustão,
//  condições marcadas e os recursos atuais. É este objeto que
//  `avdfEfeitosAtivos` consome — e é por ele que uma penalidade de
//  Exaustão chega até a rolagem sem ninguém ter que lembrar dela.
function avdfEstadoDaTela() {
  return {
    exaustao:  parseInt(document.getElementById('avdf-exaustao')?.value, 10) || 0,
    //  Só as marcadas À MÃO. As automáticas (`data-auto`) são deduzidas
    //  de PV e PC por `condicoesAutomaticasAvdf` toda vez — lê-las da
    //  tela junto significaria contar duas vezes e, pior, carregar uma
    //  marca velha: uma ficha recém-montada nasce com 0 PV por um
    //  instante, e "Morrendo" ficava marcado depois de a Vida encher.
    condicoes: [...document.querySelectorAll('.avdf-cond-check:checked:not([data-auto])')].map(c => c.value),
    pv:    REC.pv ?? 0,
    pvMax: RECMAX.pv ?? 0,
    pc:    REC.pc ?? 0,
  };
}


// ══════════════════════════════════════════════════════════════════
//  ATRIBUTOS — uma linha por atributo (seu ponto 8)
//
//  "TAI — Taijutsu · +4 · 🎲". Sem VALOR e MOD lado a lado, porque
//  neste sistema os dois seriam o mesmo número.
// ══════════════════════════════════════════════════════════════════
function avdfCartaoAtributo(a) {
  return `
      <div class="avdf-attr">
        <div class="avdf-attr-id">
          <span class="avdf-attr-sigla">${_av(a.abbr)}</span>
          <span class="avdf-attr-nome">${_av(a.name)}</span>
        </div>
        <input type="number" class="avdf-attr-val" id="a-${a.id}"
               min="${a.min}" max="${a.max}" placeholder="0" inputmode="numeric"
               oninput="onAttrInput('${a.id}')">
        <button type="button" class="avdf-attr-rolar" onclick="rolarAtributoFicha('${a.id}')"
                title="Rolar d20 + ${_av(a.abbr)}" aria-label="Rolar ${_av(a.name)}"
                data-fic="d20" data-fic-size="15"></button>
      </div>`;
}

//  O rodapé dos atributos diz o que importa na criação: quanto foi
//  distribuído e qual é o teto do rank atual (seu ponto 7).
function avdfContadorAtributos(gasto, attr) {
  const rank = rankAvdf(attr?.rank || document.getElementById('f-rank')?.value || 'genin');
  const conj = (S().criacao.conjunto || []).reduce((a, b) => a + b, 0);
  const acima = (S().atributos || []).filter(
    a => (parseInt(document.getElementById('a-' + a.id)?.value, 10) || 0) > rank.attrMax
  );
  const alerta = acima.length
    ? `<span class="avdf-teto-alerta">⚠ ${acima.map(a => a.sigla).join(', ')} acima do teto — ${_av(rankAvdf(rank.id).nome)} permite até +${rank.attrMax}</span>`
    : `<span class="avdf-teto-ok">Teto do rank: +${rank.attrMax}</span>`;
  return `<span style="color:var(--muted);letter-spacing:1px">DISTRIBUÍDO</span>
    <span style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      ${alerta}
      <strong class="avdf-conta${gasto > conj ? ' acima' : ''}">${gasto} / ${conj}</strong>
    </span>`;
}


// ══════════════════════════════════════════════════════════════════
//  STATUS — Vida, Chakra, Exaustão e Vontade do Fogo (pontos 9 a 11)
//
//  Vida e Chakra como NÚMERO, não como fileira de bolinhas: um Jōnin
//  tem 45 PV, e quarenta e cinco bolinhas não são legíveis em nenhum
//  tamanho de tela. Os ids são os mesmos de sempre, então salvar,
//  carregar e o painel do mestre continuam funcionando.
// ══════════════════════════════════════════════════════════════════
function _avdfMedidorNumero(r) {
  return `
        <div class="avdf-medidor" data-rec="${r.id}">
          <div class="avdf-medidor-topo">
            <span class="avdf-medidor-icone" data-fic="${r.icone}" data-fic-size="15"></span>
            <span class="avdf-medidor-nome">${_av(r.nome)}</span>
            <span class="avdf-medidor-formula" id="${r.formulaId || ''}">${_av(r.formulaTexto || '')}</span>
          </div>
          <div class="avdf-medidor-linha">
            <button type="button" class="avdf-medidor-btn" onclick="ajustarRecurso('${r.id}',-1)" aria-label="Menos 1 de ${_av(r.nome)}">−</button>
            <div class="avdf-medidor-num" id="gauge-${r.id}-val"><span class="avdf-medidor-atual">0</span></div>
            <button type="button" class="avdf-medidor-btn" onclick="ajustarRecurso('${r.id}',1)" aria-label="Mais 1 de ${_av(r.nome)}">+</button>
          </div>
          <div class="avdf-medidor-barra"><div class="avdf-medidor-fill" id="gauge-${r.id}-fill"></div></div>
          <div class="avdf-medidor-teto">
            <label for="max-${r.id}">Máximo</label>
            <input type="number" id="max-${r.id}" class="avdf-medidor-max-input" min="0" inputmode="numeric"
                   placeholder="auto" onchange="recMaxDefinirManual('${r.id}', this.value)"
                   title="Vazio = calculado pela regra. Escreva um número para forçar outro valor.">
            <button type="button" class="avdf-medidor-auto" onclick="avdfVoltarAoAutomatico('${r.id}')"
                    title="Voltar ao valor da regra">↺</button>
            <span class="avdf-medidor-excecao" id="excecao-${r.id}" hidden>exceção do Mestre</span>
          </div>
          <span class="avdf-medidor-legenda"${r.legendaId ? ` id="${r.legendaId}"` : ''}>${_av(r.legenda || '')}</span>
        </div>`;
}

//  A Vontade do Fogo tem três cargas por sessão e uma lista fechada de
//  usos. Mostrar a lista ao lado das cargas é a diferença entre um
//  recurso que se usa e um recurso que se esquece.
const AVDF_USOS_VONTADE = [
  'Refazer uma rolagem que você acabou de ver falhar',
  'Agir uma vez estando a 0 PV, antes de cair',
  'Ignorar um nível de Exaustão até o fim da cena',
  'Recusar um genjutsu no momento em que ele te pega',
];

//  As chamas são desenhadas a partir do MÁXIMO ATUAL, não de um 3
//  cravado: o Sarutobi tem 4 ("Você começa cada sessão com 4 Pontos de
//  Vontade do Fogo em vez de 3"), e o Mestre pode pôr outro número.
function _avdfVontadeDoFogo(r) {
  return `
        <div class="avdf-vontade">
          <div class="avdf-vontade-topo">
            <span class="avdf-vontade-nome">${_av(r.nome)}</span>
            <div class="avdf-chamas" id="avdf-chamas"></div>
            <span class="avdf-vontade-conta" id="gauge-pvf-val">${r.max}</span>
            <input type="number" id="max-pvf" class="avdf-vontade-max" min="0" inputmode="numeric"
                   placeholder="auto" onchange="recMaxDefinirManual('pvf', this.value)"
                   title="Máximo. Vazio = o que a regra e o clã disserem.">
            <button type="button" class="avdf-medidor-auto" onclick="avdfVoltarAoAutomatico('pvf')"
                    title="Voltar ao valor da regra">↺</button>
          </div>
          <ul class="avdf-vontade-usos">
            ${AVDF_USOS_VONTADE.map(u => `<li>${_av(u)}</li>`).join('\n            ')}
          </ul>
          <span class="avdf-vontade-nota">${_av(r.legenda || '')}</span>
        </div>`;
}

//  Exaustão: um seletor de nível e, embaixo, o que aquele nível FAZ.
//  Não é decoração — o texto vem da mesma tabela que a rolagem usa.
function _avdfExaustao() {
  const ops = EXAUSTAO_AVDF.map(e =>
    `<option value="${e.n}">${e.n === 0 ? 'Descansado' : 'Nível ' + e.n}</option>`).join('');
  return `
        <div class="avdf-exaustao">
          <div class="avdf-exaustao-topo">
            <span class="avdf-exaustao-nome">Exaustão</span>
            <select id="avdf-exaustao" class="avdf-exaustao-sel" onchange="avdfAoMudarEstado()">${ops}</select>
          </div>
          <div class="avdf-exaustao-efeito" id="avdf-exaustao-efeito"></div>
        </div>`;
}

function avdfHtmlStatus() {
  const recs = S().recursos || [];
  const vida   = recs.find(r => r.id === 'pv');
  const chakra = recs.find(r => r.id === 'pc');
  const fogo   = recs.find(r => r.id === 'pvf');
  return `<div class="avdf-status">
        <div class="avdf-status-medidores">
          ${vida ? _avdfMedidorNumero(vida) : ''}
          ${chakra ? _avdfMedidorNumero(chakra) : ''}
        </div>
        ${_avdfExaustao()}
        ${fogo ? _avdfVontadeDoFogo(fogo) : ''}
      </div>`;
}

//  Gasta (ou devolve) uma carga de Vontade do Fogo clicando na chama.
function avdfGastarVontade(i) {
  const atual = REC.pvf ?? 0;
  REC.pvf = (i + 1 === atual) ? i : i + 1;
  avdfPintarVontade();
  autoSave();
}

function avdfPintarVontade() {
  const atual = REC.pvf ?? 0;
  const max   = RECMAX.pvf ?? recMax('pvf');
  const caixa = document.getElementById('avdf-chamas');
  if (caixa && caixa.childElementCount !== max) {
    caixa.innerHTML = Array.from({ length: max }, (_, i) =>
      `<button type="button" class="avdf-chama" id="avdf-chama-${i}" onclick="avdfGastarVontade(${i})"
               aria-label="Carga ${i + 1} de Vontade do Fogo">🔥</button>`).join('');
  }
  caixa?.querySelectorAll('.avdf-chama').forEach((el, i) => {
    el.classList.toggle('apagada', i >= atual);
  });
  const conta = document.getElementById('gauge-pvf-val');
  if (conta) conta.textContent = `${atual} / ${max}`;
  avdfPintarTetos();
}

//  Mostra em cada medidor o teto que está valendo, e marca quando ele
//  é uma exceção escrita à mão.
function avdfPintarTetos() {
  (S().recursos || []).forEach(r => {
    const campo = document.getElementById('max-' + r.id);
    if (!campo) return;
    const manual = recMaxEhManual(r.id);
    campo.value = manual ? RECMAXMANUAL[r.id] : '';
    campo.placeholder = String(recMaxAutomatico(r.id));
    campo.classList.toggle('manual', manual);
    const selo = document.getElementById('excecao-' + r.id);
    if (selo) selo.hidden = !manual;
  });
}

function avdfVoltarAoAutomatico(id) {
  recMaxDefinirManual(id, '');
  avdfPintarTetos();
  if (id === 'pvf') avdfPintarVontade();
}

// ══════════════════════════════════════════════════════════════════
//  O QUE O CLÃ MUDA NA FICHA (seus pontos 2 e 6)
//
//  "Ao selecionar Sarutobi, a ficha deve automaticamente atualizar o
//  valor máximo de Vontade do Fogo para 4."
//
//  Cada clã declara em `ajustes` o que altera. A ficha aplica sozinha,
//  mostra de onde veio o número — e o campo continua editável, porque
//  a campanha pode ter uma regra que nenhuma tabela previu.
// ══════════════════════════════════════════════════════════════════
function avdfAjusteDeRecurso(id, base) {
  const c = claAvdf(document.getElementById('f-cla')?.value);
  const a = c?.ajustes?.recursos;
  if (!a) return base;
  let v = base;
  if (a.pcMultiplicador && id === 'pc') v *= a.pcMultiplicador;
  if (a.pcPct && id === 'pc') v *= (1 + a.pcPct / 100);
  if (typeof a[id] === 'number') v += a[id];
  return v;
}

//  A frase que explica o ajuste, para a tela poder mostrar em vez de o
//  número simplesmente mudar sozinho sem explicação.
function avdfExplicarAjuste(id) {
  const c = claAvdf(document.getElementById('f-cla')?.value);
  const a = c?.ajustes?.recursos;
  if (!a || !c) return '';
  const partes = [];
  if (a.pcMultiplicador && id === 'pc') partes.push(`×${a.pcMultiplicador}`);
  if (a.pcPct && id === 'pc') partes.push(`+${a.pcPct}%`);
  if (typeof a[id] === 'number') partes.push(`${a[id] > 0 ? '+' : ''}${a[id]}`);
  return partes.length ? `${c.nome}: ${partes.join(' ')}` : '';
}

//  Chamado quando um recurso muda (bateu, gastou chakra). Refaz as
//  condições automáticas e os alvos, sem salvar de novo — quem mexeu no
//  recurso já salvou.
function avdfAoMudarRecurso() {
  avdfPintarCondicoesAutomaticas();
  avdfAtualizarDerivados();
}

//  Chamado quando exaustão ou condição mudam: reescreve o efeito na
//  tela, recalcula Defesa e PV máximo, e salva.
function avdfAoMudarEstado() {
  const estado = avdfEstadoDaTela();
  const ex = exaustaoAvdf(estado.exaustao);
  const el = document.getElementById('avdf-exaustao-efeito');
  if (el) {
    el.textContent = ex.efeito;
    el.classList.toggle('grave', ex.n >= 4);
    el.classList.toggle('nenhum', ex.n === 0);
  }
  avdfPintarCondicoesAutomaticas();
  avdfAtualizarDerivados(_attrDaTela());
  //  O PV máximo pode ter caído pela metade (Exaustão 4).
  if (typeof pintarRecurso === 'function') { pintarRecurso('pv'); pintarRecurso('pc'); }
  autoSave();
}


// ══════════════════════════════════════════════════════════════════
//  CONDIÇÕES (seu ponto 26)
//
//  As que a ficha consegue deduzir do próprio número — Ferido,
//  Exausto de Chakra, Morrendo — aparecem marcadas e travadas, com a
//  razão ao lado. As outras são caixas que a pessoa marca.
// ══════════════════════════════════════════════════════════════════
function avdfHtmlCondicoes() {
  const itens = CONDICOES_AVDF.map(c => `
        <label class="avdf-cond" for="avdf-cond-${c.id}" title="${_av(c.efeito)}">
          <input type="checkbox" class="avdf-cond-check" id="avdf-cond-${c.id}" value="${c.id}"
                 onchange="avdfAoMudarEstado()"${c.automatica ? ' data-auto="' + _av(c.automatica) + '"' : ''}>
          <span class="avdf-cond-icone">${_av(c.icone)}</span>
          <span class="avdf-cond-texto">
            <span class="avdf-cond-nome">${_av(c.nome)}</span>
            <span class="avdf-cond-efeito">${_av(c.efeito)}</span>
          </span>
        </label>`).join('');
  return `<div class="avdf-condicoes" id="avdf-condicoes">${itens}
        <div class="avdf-cond-resumo" id="avdf-cond-resumo"></div>
      </div>`;
}

//  Liga sozinha o que a ficha já sabe, e trava a caixa para ninguém
//  desmarcar um estado que é consequência de um número (seu ponto 29).
function avdfPintarCondicoesAutomaticas() {
  const estado = avdfEstadoDaTela();
  const ligadas = condicoesAutomaticasAvdf(estado);
  CONDICOES_AVDF.forEach(c => {
    const el = document.getElementById('avdf-cond-' + c.id);
    if (!el || !c.automatica) return;
    const deve = ligadas.includes(c.id);
    el.checked = deve;
    el.disabled = true;
    el.closest('.avdf-cond')?.classList.toggle('automatica', deve);
  });

  const efeitos = avdfEfeitosAtivos(avdfEstadoDaTela());
  const resumo = document.getElementById('avdf-cond-resumo');
  if (!resumo) return;
  if (!efeitos.porque.length) { resumo.textContent = 'Nada pesando nas suas rolagens agora.'; resumo.classList.remove('ativo'); return; }
  const partes = efeitos.porque.map(p => {
    const n = [];
    if (p.testes) n.push(`${p.testes} em testes`);
    if (p.defesa) n.push(`${p.defesa} de Defesa`);
    return `${p.de}${n.length ? ' (' + n.join(', ') + ')' : ''}`;
  });
  resumo.textContent = 'Entrando nas rolagens: ' + partes.join(' · ');
  resumo.classList.add('ativo');
}


// ══════════════════════════════════════════════════════════════════
//  PERÍCIAS (seu ponto 12)
//
//  As dezoito do livro, todas na ficha, cada uma com o seu grau. Não
//  existe "escolher qual das 67 aparece" — isso é o Fractured. O bônus
//  do grau sai da tabela e o botão rola d20 + atributo + grau + o que
//  a Exaustão e as condições estiverem cobrando.
// ══════════════════════════════════════════════════════════════════
function avdfMontarPericias() {
  const grupos = periciasAvdfPorCategoria();
  const rank = document.getElementById('f-rank')?.value || 'genin';
  let html = `<div class="avdf-pericias-busca">
        <input type="search" id="avdf-pericia-busca" placeholder="Buscar perícia..."
               oninput="avdfFiltrarPericias()" aria-label="Buscar perícia">
        <label class="avdf-pericias-so-treinadas">
          <input type="checkbox" id="avdf-pericia-so-treinadas" onchange="avdfFiltrarPericias()">
          <span>Só as treinadas</span>
        </label>
      </div>`;

  PERICIAS_AVDF_ORDEM.forEach(cat => {
    const lista = grupos[cat] || [];
    if (!lista.length) return;
    html += `<div class="avdf-pericia-cat" data-cat="${_av(cat)}">${_av(cat)}</div>`;
    lista.forEach(p => {
      const id = avdfPericiaId(p.nome);
      const ops = GRAUS_PERICIA_AVDF.map(g => {
        const ok = avdfRankAlcanca(rank, g.rankMin);
        return `<option value="${g.id}"${ok ? '' : ' disabled'}>${_av(g.nome)}${g.bonus ? ' +' + g.bonus : ''}${ok ? '' : ' · ' + _av(rankAvdf(g.rankMin).nome)}</option>`;
      }).join('');
      html += `
      <div class="avdf-pericia" data-pericia="${_av(p.nome)}" data-busca="${_av((p.nome + ' ' + p.uso).toLowerCase())}">
        <div class="avdf-pericia-id">
          <span class="avdf-pericia-nome">${_av(p.nome)}</span>
          <span class="avdf-pericia-uso">${_av(p.uso)}</span>
        </div>
        <span class="avdf-pericia-attr" title="Atributo do teste">${_av(p.attr)}</span>
        <select class="avdf-pericia-grau" id="pg-${id}" onchange="avdfAoMudarGrau('${id}')"
                aria-label="Graduação em ${_av(p.nome)}">${ops}</select>
        <span class="avdf-pericia-total" id="pt-${id}">+0</span>
        <button type="button" class="avdf-pericia-rolar" onclick="avdfRolarPericia('${id}')"
                title="Rolar ${_av(p.nome)}" aria-label="Rolar ${_av(p.nome)}"
                data-fic="d20" data-fic-size="14"></button>
      </div>`;
    });
  });
  return html;
}

//  Um id estável a partir do nome, para o grau da perícia sobreviver a
//  qualquer reordenação da lista.
function avdfPericiaId(nome) {
  return String(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function avdfPericiaPorId(id) {
  return PERICIAS_AVDF.find(p => avdfPericiaId(p.nome) === id) || null;
}

//  O atributo de uma perícia que aceita dois ("ESP ou COR"): vale o
//  melhor que o personagem tem. A ficha já sabe os dois números — não
//  faz sentido perguntar (seu ponto 29).
function avdfAtributoDaPericia(p) {
  const siglas = String(p.attr || '').split(' ou ').map(x => x.trim()).filter(Boolean);
  let melhor = null, valor = -99;
  siglas.forEach(sig => {
    const a = (S().atributos || []).find(x => x.sigla === sig);
    if (!a) return;
    const v = parseInt(document.getElementById('a-' + a.id)?.value, 10) || 0;
    if (v > valor) { valor = v; melhor = a; }
  });
  return { attr: melhor, valor: melhor ? valor : 0 };
}

//  O total que aparece ao lado de cada perícia: atributo + grau. As
//  penalidades de estado NÃO entram aqui de propósito — elas mudam a
//  toda hora e apareceriam como se fossem parte da perícia. Elas
//  entram na rolagem, e o chat mostra de onde vieram.
function avdfTotalPericia(id) {
  const p = avdfPericiaPorId(id);
  if (!p) return { total: 0 };
  const grau = parseInt(document.getElementById('pg-' + id)?.value, 10) || 0;
  const { attr, valor } = avdfAtributoDaPericia(p);
  return { total: valor + avdfBonusPericia(grau), attr, valor, grau, pericia: p };
}

function avdfPintarPericias() {
  PERICIAS_AVDF.forEach(p => {
    const id = avdfPericiaId(p.nome);
    const el = document.getElementById('pt-' + id);
    if (!el) return;
    const { total, grau } = avdfTotalPericia(id);
    el.textContent = (total > 0 ? '+' : total < 0 ? '−' : '±') + Math.abs(total);
    el.closest('.avdf-pericia')?.classList.toggle('treinada', grau > 0);
  });
  avdfAtualizarContagemPericias();
}

//  Quantas treinadas, contra quantas a criação dá.
function avdfAtualizarContagemPericias() {
  const el = document.getElementById('pericias-dica');
  if (!el) return;
  const treinadas = PERICIAS_AVDF.filter(p =>
    (parseInt(document.getElementById('pg-' + avdfPericiaId(p.nome))?.value, 10) || 0) > 0).length;
  const permitidas = avdfPericiasPermitidas();
  const daOrigem = avdfPericiaDaOrigem();
  const alvo = permitidas + (daOrigem ? 1 : 0);
  const extra = daOrigem ? ` (3 da criação + ${_av(daOrigem)}, da sua Origem)` : '';
  el.textContent = `${treinadas} de ${alvo} treinadas${extra}`;
  el.classList.toggle('acima', treinadas > alvo);
}

function avdfAoMudarGrau(id) {
  avdfPintarPericias();
  autoSave();
}

function avdfFiltrarPericias() {
  const termo = (document.getElementById('avdf-pericia-busca')?.value || '').toLowerCase().trim();
  const so = document.getElementById('avdf-pericia-so-treinadas')?.checked;
  document.querySelectorAll('.avdf-pericia').forEach(el => {
    const casa = !termo || (el.dataset.busca || '').includes(termo);
    const treinada = !so || el.classList.contains('treinada');
    el.hidden = !(casa && treinada);
  });
  //  Categoria sem nenhuma perícia visível some junto.
  document.querySelectorAll('.avdf-pericia-cat').forEach(cat => {
    let n = 0, el = cat.nextElementSibling;
    while (el && el.classList.contains('avdf-pericia')) { if (!el.hidden) n++; el = el.nextElementSibling; }
    cat.hidden = n === 0;
  });
}

//  A rolagem de perícia deste sistema: d20 + atributo + grau + o que o
//  estado estiver cobrando. O rótulo mostra a conta inteira, porque um
//  total sem explicação é um total em que ninguém confia.
function avdfRolarPericia(id) {
  const { total, attr, valor, grau, pericia } = avdfTotalPericia(id);
  if (!pericia) return;
  const plano = S().rolagem.montar({
    modAtrib: valor, modPericia: avdfBonusPericia(grau),
    estado: avdfEstadoDaTela(),
  });
  const r = rolarPlano(plano);
  mostrarAnimacaoDado(20, r.principal, r.principal === 20, r.principal === 1);

  const g = grauPericiaAvdf(grau);
  const pedacos = [`${attr ? attr.sigla : '—'} ${valor >= 0 ? '+' : '−'}${Math.abs(valor)}`];
  if (g.bonus) pedacos.push(`${g.nome} +${g.bonus}`);
  (plano.origens || []).forEach(o => { if (o.testes) pedacos.push(`${o.de} ${o.testes}`); });

  publicarSala('roll', {
    dado: 20, resultado_dado: r.principal, bonus: r.bonus, total: r.total,
    oculto: rolagemOculta(),
    label: `${pericia.nome} · ${pedacos.join(' · ')}`,
  });
}

//  Ler e escrever as perícias no formato que o banco guarda.
function avdfColetarPericias() {
  return PERICIAS_AVDF.map(p => {
    const id = avdfPericiaId(p.nome);
    return { nome: p.nome, grau: parseInt(document.getElementById('pg-' + id)?.value, 10) || 0 };
  }).filter(x => x.grau > 0);
}

function avdfAplicarPericias(lista) {
  //  Zera tudo antes: carregar outra ficha não pode deixar grau velho.
  PERICIAS_AVDF.forEach(p => {
    const el = document.getElementById('pg-' + avdfPericiaId(p.nome));
    if (el) el.value = '0';
  });
  (lista || []).forEach(x => {
    //  Aceita o formato novo ({nome, grau}) e o antigo ({nome, atrib}),
    //  para nenhuma ficha salva antes desta versão perder informação:
    //  ter a perícia escrita na linha antiga significava ser treinado.
    const nome = x?.nome; if (!nome) return;
    const el = document.getElementById('pg-' + avdfPericiaId(nome));
    if (el) el.value = String(x.grau ?? 1);
  });
  avdfPintarPericias();
}


// ══════════════════════════════════════════════════════════════════
//  ORIGEM (seu ponto 6)
//
//  "Origens não dão poder de combate: elas dizem quem você era." Cada
//  uma dá uma perícia treinada, um Traço e um Laço — e a ficha aplica
//  a perícia sozinha, em vez de mandar a pessoa procurar na lista.
// ══════════════════════════════════════════════════════════════════
function avdfHtmlOrigem() {
  const ops = ORIGENS_AVDF.map(o => `<option value="${o.id}">${_av(o.nome)}</option>`).join('');
  return `<div class="avdf-origem">
        <div class="field">
          <label>Origem</label>
          <select id="f-origem" onchange="avdfAoTrocarOrigem()">
            <option value="">Selecionar...</option>${ops}
          </select>
        </div>
        <div class="avdf-origem-info" id="avdf-origem-info"></div>
      </div>`;
}

function avdfOrigemAtual() {
  return origemAvdf(document.getElementById('f-origem')?.value);
}

function avdfPericiaDaOrigem() {
  return avdfOrigemAtual()?.pericia || null;
}

function avdfAoTrocarOrigem() {
  const o = avdfOrigemAtual();
  const info = document.getElementById('avdf-origem-info');
  if (info) {
    info.innerHTML = o ? `
        <div class="avdf-origem-linha"><span class="avdf-origem-rot">Perícia</span><span class="avdf-origem-val avdf-origem-aplicada">${_av(o.pericia)} — treinada automaticamente</span></div>
        <div class="avdf-origem-linha"><span class="avdf-origem-rot">Traço</span><span class="avdf-origem-val"><strong>${_av(o.traco.nome)}</strong> — ${_av(o.traco.efeito)}</span></div>
        <div class="avdf-origem-linha"><span class="avdf-origem-rot">Laço</span><span class="avdf-origem-val">${_av(o.laco)}</span></div>` : '';
    info.hidden = !o;
  }
  //  Aplica a perícia. Só sobe de Não treinado para Treinado — nunca
  //  rebaixa uma perícia que a pessoa já subiu com PT.
  if (o) {
    const el = document.getElementById('pg-' + avdfPericiaId(o.pericia));
    if (el && (parseInt(el.value, 10) || 0) < 1) { el.value = '1'; }
  }
  avdfPintarPericias();
  autoSave();
}


// ══════════════════════════════════════════════════════════════════
//  VÍNCULOS NARRATIVOS (seu ponto 27, primeira metade)
//
//  Personagem + Descrição. Nada de Promessa e Dívida: aquilo é a
//  mecânica de Vínculo do Fractured, e estava nesta ficha só porque a
//  caixa tinha sido copiada de lá.
//
//  O Vínculo de Equipe (Kizuna) NÃO está aqui: ele é da mesa, é um só
//  para o grupo inteiro, e mora na aba Combate junto do medidor.
// ══════════════════════════════════════════════════════════════════
let avdfVinculosN = 3;

function avdfHtmlVinculos() {
  return `<div class="avdf-vinculos" id="avdf-vinculos-list"></div>
      <button type="button" class="avdf-add" onclick="avdfAddVinculo()">＋ Vínculo</button>`;
}

function avdfMontarVinculos(dados) {
  const lista = document.getElementById('avdf-vinculos-list');
  if (!lista) return;
  const existentes = (dados && dados.length) ? dados : avdfColetarVinculos();
  avdfVinculosN = Math.max(3, existentes.length);
  lista.innerHTML = '';
  for (let i = 0; i < avdfVinculosN; i++) {
    const v = existentes[i] || {};
    const div = document.createElement('div');
    div.className = 'avdf-vinculo';
    div.innerHTML = `
        <span class="avdf-vinculo-n">${i + 1}</span>
        <input type="text" id="av-per-${i}" class="avdf-vinculo-quem" placeholder="Quem..."
               value="${_av(v.personagem || '')}" oninput="autoSave()">
        <input type="text" id="av-desc-${i}" class="avdf-vinculo-desc" placeholder="O que essa pessoa é para você..."
               value="${_av(v.descricao || '')}" oninput="autoSave()">`;
    lista.appendChild(div);
  }
}

function avdfColetarVinculos() {
  const arr = [];
  for (let i = 0; i < avdfVinculosN; i++) {
    const p = document.getElementById(`av-per-${i}`)?.value || '';
    const d = document.getElementById(`av-desc-${i}`)?.value || '';
    arr.push({ personagem: p, descricao: d });
  }
  return arr;
}

function avdfAddVinculo() {
  const atuais = avdfColetarVinculos();
  atuais.push({});
  avdfVinculosN = atuais.length;
  avdfMontarVinculos(atuais);
}


// ══════════════════════════════════════════════════════════════════
//  ALMA — Ninja Way e Fardo (seu ponto 28)
//
//  "Tratados como mecanicamente importantes." O Ninja Way é a frase
//  que o personagem não trai — e honrá-la num momento caro dá PT. O
//  Fardo é o que ele carrega. Os dois ficam grandes na tela porque
//  são grandes na mesa.
// ══════════════════════════════════════════════════════════════════
//  A HISTÓRIA DO PERSONAGEM (seu ponto 5)
//
//  Uma área só para isto, grande, separada de tudo o mais. Não é
//  personalidade, não é aparência, não é objetivo: é a história. O
//  campo cresce sozinho conforme a pessoa escreve, para escrever
//  quatro parágrafos não virar rolagem dentro de uma caixinha.
function avdfHtmlHistoria() {
  return `<div class="avdf-historia">
        <textarea id="f-historia" rows="14" oninput="avdfCrescerTextarea(this);autoSave()"
          placeholder="De onde ele veio, quem o criou, o que perdeu, por que virou ninja, o que aconteceu antes da primeira sessão..."></textarea>
        <div class="avdf-historia-rodape">
          <span id="avdf-historia-conta">0 palavras</span>
          <span>Escreva à vontade — o campo cresce com o texto.</span>
        </div>
      </div>`;
}

//  Um textarea que não obriga ninguém a escrever espiando por uma
//  fresta. Cresce até um teto e só então passa a rolar.
function avdfCrescerTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight + 2, 900) + 'px';
  const conta = document.getElementById('avdf-historia-conta');
  if (conta && el.id === 'f-historia') {
    const n = (el.value.trim().match(/\S+/g) || []).length;
    conta.textContent = `${n} ${n === 1 ? 'palavra' : 'palavras'}`;
  }
}

function avdfHtmlAlma() {
  return `<div class="avdf-alma">
        <div class="avdf-alma-campo">
          <label for="f-ninjaway">Ninja Way</label>
          <textarea id="f-ninjaway" rows="2" oninput="autoSave()"
            placeholder="A frase que seu personagem não trai, nem quando trair seria mais fácil..."></textarea>
          <span class="avdf-alma-dica">Honrar isto num momento caro rende +1 PT.</span>
        </div>
        <div class="avdf-alma-campo">
          <label for="f-fardo">Fardo</label>
          <textarea id="f-fardo" rows="2" oninput="autoSave()"
            placeholder="O que você carrega e não consegue largar..."></textarea>
          <span class="avdf-alma-dica">O Mestre usa isto para te colocar em situação impossível.</span>
        </div>
      </div>`;
}


// ══════════════════════════════════════════════════════════════════
//  EQUIPAMENTO
//
//  A primeira versão eram quatro linhas de texto livre. Virou cartão
//  clicável com a ficha completa do item — ver a seção EQUIPAMENTO EM
//  CARTÕES, mais abaixo neste arquivo.
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
//  O QUE O RANK PERMITE, APLICADO NA TELA (seu ponto 7)
// ══════════════════════════════════════════════════════════════════

//  Reabre ou tranca os graus de perícia conforme o rank atual, com a
//  razão escrita na própria opção. Trancar sem dizer por quê é pior do
//  que não trancar.
function avdfAtualizarGrausPermitidos() {
  const rank = document.getElementById('f-rank')?.value || 'genin';
  PERICIAS_AVDF.forEach(p => {
    const sel = document.getElementById('pg-' + avdfPericiaId(p.nome));
    if (!sel) return;
    [...sel.options].forEach(o => {
      const g = grauPericiaAvdf(o.value);
      const ok = avdfRankAlcanca(rank, g.rankMin);
      o.disabled = !ok;
      o.textContent = `${g.nome}${g.bonus ? ' +' + g.bonus : ''}` +
        (ok ? '' : ` · ${rankAvdf(g.rankMin).nome}`);
    });
    //  Já estava num grau que o rank novo não alcança? Não apaga o que
    //  a pessoa tem: mostra o aviso e deixa o Mestre resolver.
    const g = grauPericiaAvdf(sel.value);
    const alem = !avdfRankAlcanca(rank, g.rankMin);
    sel.closest('.avdf-pericia')?.classList.toggle('acima-do-rank', alem);
    sel.title = alem ? avdfLimiteAtributo(rank).aviso.replace('neste atributo', 'nesta perícia') : '';
  });
  //  E o teto de atributo, que aparece no rodapé dos atributos.
  if (typeof atualizarContadorPontos === 'function') atualizarContadorPontos();
}


// ══════════════════════════════════════════════════════════════════
//  OS GANCHOS QUE O NÚCLEO CHAMA
// ══════════════════════════════════════════════════════════════════

//  Depois que a ficha é desenhada.
function avdfFichaAoMontar() {
  //  As arbitragens que viram número entram ANTES de qualquer coisa ler
  //  o catálogo — senão a biblioteca mostraria o valor velho.
  if (typeof aplicarDecisoesAvdf === 'function') aplicarDecisoesAvdf();
  if (typeof avdfAoTrocarRank === 'function') avdfAoTrocarRank();
  if (typeof avdfAoTrocarCla === 'function') avdfAoTrocarCla();
  if (typeof avdfAoTrocarKG === 'function') avdfAoTrocarKG();
  if (typeof avdfAtualizarTecnicasDisponiveis === 'function') avdfAtualizarTecnicasDisponiveis();
  avdfMontarVinculos(null);
  avdfMontarItens(null);
  avdfPintarJutsus();
  avdfAoTrocarOrigem();
  avdfAtualizarGrausPermitidos();
  avdfAtualizarNaturezasEspeciais();
  avdfPintarVontade();
  avdfAoMudarEstado();
  //  O medidor de Vínculo de Equipe da mesa. Ele existe desde o começo,
  //  mas ninguém o desenhava numa ficha recém-montada — a caixa ficava
  //  vazia até alguém salvar.
  if (typeof medidorDaMesaPintar === 'function') medidorDaMesaPintar(tensaoFicha || 0, true);
}

//  Os campos que só esta ficha tem, na hora de carregar do banco.
function avdfAplicarCampos(d, porCampo) {
  porCampo('f-vila',     d.vila || '');
  porCampo('f-idade',    d.idade || '');
  porCampo('f-rank',     d.rank || 'genin');
  porCampo('f-origem',   d.origem || '');
  porCampo('f-ninjaway', d.ninjaway || '');
  porCampo('f-fardo',    d.fardo || '');
  porCampo('f-ryo',      d.ryo != null ? d.ryo : RYO_INICIAL);
  porCampo('f-historia', d.historia || '');
  porCampo('avdf-exaustao', d.exa_atual || 0);

  (d.condicoes || []).forEach(id => {
    const el = document.getElementById('avdf-cond-' + id);
    if (el && !el.disabled) el.checked = true;
  });

  //  Naturezas, clã, linhagem, estágios e técnicas.
  naturezasTodasAvdf().concat([ONMYOTON_AVDF]).forEach(n => {
    const el = document.getElementById('f-nat-' + n.id);
    if (el) el.checked = (d.naturezas || []).includes(n.id);
  });
  if (typeof avdfAtualizarNaturezasEspeciais === 'function') avdfAtualizarNaturezasEspeciais();
  porCampo('f-kg',        d.kg || '');
  porCampo('f-kg-origem', d.kg_origem || 'nascimento');
  porCampo('f-kg-outra',  d.kg_outra || '');
  porCampo('f-cla',       d.cla || '');
  porCampo('f-pt',        d.pt || 0);
  if (typeof avdfAoTrocarKG === 'function')  avdfAoTrocarKG();
  if (typeof avdfAoTrocarCla === 'function') avdfAoTrocarCla(d.cla_estagios || []);
  if (typeof avdfAoTrocarRank === 'function') avdfAoTrocarRank();
  avdfAplicarTecnicas(d.tecnicas || []);
  if (typeof avdfAtualizarTecnicasDisponiveis === 'function') avdfAtualizarTecnicasDisponiveis();

  avdfMontarVinculos(Array.isArray(d.vinculos) ? d.vinculos : null);
  avdfMontarItens(Array.isArray(d.itens) && d.itens.length ? d.itens : null);
  avdfAplicarJutsusNovos(d.jutsus || []);

  //  Tetos de recurso forçados à mão pelo Mestre.
  Object.keys(RECMAXMANUAL).forEach(k => delete RECMAXMANUAL[k]);
  Object.entries(d.maxManual || {}).forEach(([k, v]) => { if (v != null && v !== '') RECMAXMANUAL[k] = v; });
  pintarTodosOsRecursos();
  avdfPintarTetos();

  const hist = document.getElementById('f-historia');
  if (hist) avdfCrescerTextarea(hist);
  avdfAoTrocarOrigem();
  avdfAtualizarGrausPermitidos();
  avdfPintarVontade();
  avdfAoMudarEstado();
}

//  Tudo que só esta ficha tem, lido da tela na hora de salvar.
//
//  Isto não existia. `coletarFicha()` no núcleo montava a linha com os
//  campos do Fractured e mais nada — então rank, vila, idade, origem,
//  naturezas, Kekkei Genkai, clã, estágios, técnicas, PT e equipamento
//  nunca chegavam ao banco. `avdfParaDados` recebia uma linha sem
//  nenhum deles e gravava tudo vazio, sem erro nenhum na tela.
function avdfColetarCampos() {
  //  As cinco elementais mais Yin, Yang e Onmyōton.
  const naturezas = naturezasTodasAvdf().concat([ONMYOTON_AVDF])
    .filter(n => document.getElementById('f-nat-' + n.id)?.checked)
    .map(n => n.id);

  const estagios = typeof avdfEstagiosMarcados === 'function' ? avdfEstagiosMarcados() : [];

  return {
    rank:      document.getElementById('f-rank')?.value || 'genin',
    vila:      document.getElementById('f-vila')?.value || '',
    idade:     document.getElementById('f-idade')?.value || '',
    origem:    document.getElementById('f-origem')?.value || '',
    ninjaway:  document.getElementById('f-ninjaway')?.value || '',
    fardo:     document.getElementById('f-fardo')?.value || '',
    naturezas,

    kg:        document.getElementById('f-kg')?.value || '',
    kg_origem: document.getElementById('f-kg-origem')?.value || '',
    kg_outra:  document.getElementById('f-kg-outra')?.value || '',

    cla:          document.getElementById('f-cla')?.value || '',
    cla_estagios: estagios,
    pt:           parseInt(document.getElementById('f-pt')?.value, 10) || 0,

    exa_atual: parseInt(document.getElementById('avdf-exaustao')?.value, 10) || 0,
    condicoes: [...document.querySelectorAll('.avdf-cond-check:checked:not(:disabled)')].map(c => c.value),

    ryo:      parseInt(document.getElementById('f-ryo')?.value, 10) || 0,
    itens:    avdfColetarItens(),
    vinculos: avdfColetarVinculos(),
    tecnicas: avdfColetarTecnicas(),
    jutsus:   avdfColetarJutsusNovos(),
    historia: document.getElementById('f-historia')?.value || '',

    //  Os tetos que o Mestre forçou à mão. Guardados junto da ficha,
    //  porque uma exceção que some no recarregamento não é exceção.
    maxManual: { ...RECMAXMANUAL },
  };
}

//  As técnicas da tela, com os campos que o livro pede. (A remodelação
//  completa das técnicas — catálogo, busca e ação por tipo — é a
//  entrega seguinte; aqui elas passam a ser SALVAS, que é o que hoje
//  não acontecia.)
function avdfColetarTecnicas() {
  const arr = [];
  for (let i = 0; i < AVDF_TEC_SLOTS; i++) {
    const nome = document.getElementById('t-nome-' + i)?.value || '';
    if (!nome.trim()) continue;
    arr.push({
      nome,
      rank:   document.getElementById('t-rank-' + i)?.value || '',
      pc:     document.getElementById('t-pc-' + i)?.value || '',
      atrib:  document.getElementById('t-atrib-' + i)?.value || '',
      cat:    document.getElementById('t-cat-' + i)?.value || '',
      acesso: document.getElementById('t-acesso-' + i)?.value || '',
      alcance: document.getElementById('t-alc-' + i)?.value || '',
      selos:  document.getElementById('t-selos-' + i)?.value || '',
      efeito: document.getElementById('t-efeito-' + i)?.value || '',
    });
  }
  return arr;
}

function avdfAplicarTecnicas(lista) {
  for (let i = 0; i < AVDF_TEC_SLOTS; i++) {
    const t = (lista || [])[i] || {};
    [['nome', 't-nome-'], ['rank', 't-rank-'], ['pc', 't-pc-'], ['atrib', 't-atrib-'],
     ['cat', 't-cat-'], ['acesso', 't-acesso-'], ['alcance', 't-alc-'],
     ['selos', 't-selos-'], ['efeito', 't-efeito-']].forEach(([chave, pre]) => {
      const el = document.getElementById(pre + i);
      if (el) el.value = t[chave] || '';
    });
  }
}

//  `23 / 28` — o atual grande, o máximo pequeno. A Vontade do Fogo é
//  contada em chamas, então mostra só quantas restam.
function avdfFormatoRecurso(id, atual, total) {
  if (id === 'pvf') return String(atual);
  return `<span class="avdf-medidor-atual">${atual}</span>` +
         `<span class="avdf-medidor-max"> / ${total}</span>`;
}


// ══════════════════════════════════════════════════════════════════
//  A BIBLIOTECA DE JUTSUS (seu ponto 3)
//
//  203 técnicas não cabem numa lista aberta na ficha — e não deveriam
//  caber. A ficha mostra só o que o personagem SABE; o catálogo inteiro
//  mora atrás do botão "＋ Adicionar Jutsu", numa janela com busca e
//  filtros por rank, natureza, categoria, acesso e clã.
//
//  Nada aqui inventa regra: cada campo mostrado vem do que o livro
//  escreveu. Onde o livro não deu um dado, a linha simplesmente não
//  aparece — em vez de aparecer com um valor plausível.
// ══════════════════════════════════════════════════════════════════

//  Os jutsus que o personagem já anotou na ficha.
let AVDF_JUTSUS = [];

//  Estado dos filtros da janela.
const AVDF_BIB = { busca: '', rank: '', natureza: '', categoria: '', acesso: '', cla: '', so: '' };

const AVDF_CATEGORIA_NOME = {
  ninjutsu:  'Ninjutsu',
  genjutsu:  'Genjutsu',
  taijutsu:  'Taijutsu',
  fuinjutsu: 'Fūinjutsu',
  geral:     'Geral e Academia',
};

//  O catálogo inteiro: as do livro do jogador MAIS as exclusivas de
//  cada clã, que moram no Compêndio. As de clã ganham `cla` para o
//  filtro poder separá-las.
let _avdfCatalogo = null;

function avdfCatalogoJutsus() {
  if (_avdfCatalogo) return _avdfCatalogo;
  //  Sem cópia: o catálogo usa os MESMOS objetos de `JUTSUS_AVDF`. Com
  //  cópia, uma correção aplicada por uma decisão da casa valia num
  //  lugar e não no outro, e a ficha mostrava dois números diferentes
  //  para a mesma técnica.
  const base = (typeof JUTSUS_AVDF !== 'undefined' ? JUTSUS_AVDF : []);
  base.forEach(j => { if (j.cla === undefined) j.cla = null; });
  const deCla = [];
  (typeof clasAvdf === 'function' ? clasAvdf() : []).forEach(c => {
    (c.tecnicas || []).forEach(t => {
      deCla.push({
        id: `cla_${c.id}_${avdfPericiaId(t.nome)}`,
        nome: t.nome,
        rank: t.rk || t.rank || null,
        pc: t.pc ?? null,
        natureza: null,
        categoria: 'cla',
        acesso: `Exclusiva — ${c.nome}`,
        efeito: t.efeito || '',
        cla: c.id,
        claNome: c.nome,
        estagio: t.est || t.estagio || null,
      });
    });
  });
  _avdfCatalogo = base.concat(deCla);
  return _avdfCatalogo;
}

//  A janela. Nasce escondida e só é montada uma vez.
function avdfHtmlBiblioteca() {
  return `<div class="avdf-modal" id="avdf-bib" hidden role="dialog" aria-modal="true" aria-label="Biblioteca de Jutsus">
        <div class="avdf-modal-fundo" onclick="avdfFecharBiblioteca()"></div>
        <div class="avdf-modal-caixa">
          <div class="avdf-modal-topo">
            <h2>Biblioteca de Jutsus</h2>
            <button type="button" class="avdf-modal-x" onclick="avdfFecharBiblioteca()" aria-label="Fechar">✕</button>
          </div>
          <div class="avdf-bib-filtros">
            <input type="search" id="bib-busca" placeholder="Buscar por nome ou efeito..."
                   oninput="avdfBibFiltrar('busca', this.value)" aria-label="Buscar jutsu">
            <div class="avdf-bib-selects">
              <select id="bib-cat" onchange="avdfBibFiltrar('categoria', this.value)" aria-label="Categoria"></select>
              <select id="bib-rank" onchange="avdfBibFiltrar('rank', this.value)" aria-label="Rank"></select>
              <select id="bib-nat" onchange="avdfBibFiltrar('natureza', this.value)" aria-label="Natureza"></select>
              <select id="bib-acesso" onchange="avdfBibFiltrar('acesso', this.value)" aria-label="Acesso"></select>
              <select id="bib-cla" onchange="avdfBibFiltrar('cla', this.value)" aria-label="Clã"></select>
            </div>
            <div class="avdf-bib-atalhos">
              <button type="button" class="avdf-bib-chip" data-so="" onclick="avdfBibFiltrar('so','')">Tudo</button>
              <button type="button" class="avdf-bib-chip" data-so="posso" onclick="avdfBibFiltrar('so','posso')"
                      title="Dentro do seu rank e das naturezas que você domina">Que eu posso aprender</button>
              <button type="button" class="avdf-bib-chip" data-so="meucla" onclick="avdfBibFiltrar('so','meucla')">Do meu clã</button>
            </div>
            <div class="avdf-bib-conta" id="bib-conta"></div>
          </div>
          <div class="avdf-bib-lista" id="bib-lista"></div>
        </div>
      </div>`;
}

function _opcoes(sel, lista, rotuloVazio) {
  const el = document.getElementById(sel);
  if (!el) return;
  el.innerHTML = `<option value="">${rotuloVazio}</option>` +
    lista.map(o => `<option value="${_av(o.v)}">${_av(o.t)}</option>`).join('');
}

function avdfAbrirBiblioteca() {
  const cx = document.getElementById('avdf-bib');
  if (!cx) return;
  const cat = avdfCatalogoJutsus();

  _opcoes('bib-cat', [...new Set(cat.map(j => j.categoria).filter(Boolean))]
    .map(c => ({ v: c, t: c === 'cla' ? 'Exclusiva de clã' : (AVDF_CATEGORIA_NOME[c] || c) })), 'Toda categoria');
  _opcoes('bib-rank', JUTSU_RANKS_AVDF.map(r => ({ v: r.id, t: `Rank ${r.id} · ${r.pc} PC` })), 'Todo rank');
  _opcoes('bib-nat', NATUREZAS_AVDF.map(n => ({ v: n.id, t: `${n.nome} (${n.trad})` })), 'Toda natureza');
  _opcoes('bib-acesso', [...new Set(cat.map(j => j.acesso).filter(Boolean))].sort()
    .map(a => ({ v: a, t: a })), 'Todo acesso');
  _opcoes('bib-cla', clasAvdf().map(c => ({ v: c.id, t: c.nome })), 'Todo clã');

  cx.hidden = false;
  document.body.classList.add('avdf-modal-aberto');
  avdfBibDesenhar();
  setTimeout(() => document.getElementById('bib-busca')?.focus(), 40);
}

function avdfFecharBiblioteca() {
  const cx = document.getElementById('avdf-bib');
  if (cx) cx.hidden = true;
  document.body.classList.remove('avdf-modal-aberto');
}

function avdfBibFiltrar(campo, valor) {
  AVDF_BIB[campo] = valor;
  if (campo === 'so') {
    document.querySelectorAll('.avdf-bib-chip').forEach(b =>
      b.classList.toggle('ativo', (b.dataset.so || '') === valor));
  }
  avdfBibDesenhar();
}

//  "Que eu posso aprender": o rank alcança e, se for elemental, a
//  natureza está dominada. É a mesma regra que `avdfCustoJutsu` usa —
//  a janela não inventa critério próprio.
function _avdfPossoAprender(j) {
  const rank = document.getElementById('f-rank')?.value || 'genin';
  if (j.rank && !avdfJutsuPermitido(rank, j.rank)) return false;
  if (j.natureza) {
    const el = document.getElementById('f-nat-' + j.natureza);
    if (!el || !el.checked) return false;
  }
  //  Genjutsu de rank B+ exige Inton.
  if (j.categoria === 'genjutsu' && avdfGenjutsuExigeInton(j.rank)
      && !document.getElementById('f-nat-yin')?.checked) return false;
  if (j.cla && j.cla !== document.getElementById('f-cla')?.value) return false;
  return true;
}

function avdfBibDesenhar() {
  const lista = document.getElementById('bib-lista');
  if (!lista) return;
  const f = AVDF_BIB;
  const termo = f.busca.trim().toLowerCase();
  const meuCla = document.getElementById('f-cla')?.value || '';
  const jaTenho = new Set(AVDF_JUTSUS.map(j => j.id));

  const achados = avdfCatalogoJutsus().filter(j => {
    if (f.rank && j.rank !== f.rank) return false;
    if (f.natureza && j.natureza !== f.natureza) return false;
    if (f.categoria && j.categoria !== f.categoria) return false;
    if (f.acesso && j.acesso !== f.acesso) return false;
    if (f.cla && j.cla !== f.cla) return false;
    if (f.so === 'posso' && !_avdfPossoAprender(j)) return false;
    if (f.so === 'meucla' && j.cla !== meuCla) return false;
    if (termo) {
      const alvo = `${j.nome} ${j.traducao || ''} ${j.efeito || ''}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });

  const conta = document.getElementById('bib-conta');
  if (conta) conta.textContent = `${achados.length} de ${avdfCatalogoJutsus().length} técnicas`;

  if (!achados.length) {
    lista.innerHTML = `<div class="avdf-bib-vazio">Nenhuma técnica com esses filtros.</div>`;
    return;
  }

  //  Agrupadas pela seção do livro, para a janela ficar parecida com o
  //  capítulo de onde veio.
  const grupos = {};
  achados.forEach(j => {
    const g = j.cla ? `Exclusivas — ${j.claNome}` : (j.secao || AVDF_CATEGORIA_NOME[j.categoria] || 'Outras');
    (grupos[g] = grupos[g] || []).push(j);
  });

  lista.innerHTML = Object.keys(grupos).map(g => `
        <div class="avdf-bib-grupo">${_av(g)}</div>
        ${grupos[g].map(j => _avdfBibCartao(j, jaTenho.has(j.id))).join('')}`).join('');
}

function _avdfBibCartao(j, jaTem) {
  const nat = j.natureza ? NATUREZAS_AVDF.find(n => n.id === j.natureza) : null;
  const etiquetas = [
    j.rank ? `<span class="avdf-bib-rank">Rank ${_av(j.rank)}</span>` : '',
    j.pc != null ? `<span class="avdf-bib-pc">${_av(j.pc)} PC</span>` : '',
    j.selos != null ? `<span class="avdf-bib-tag">${_av(j.selos)} selos</span>` : '',
    nat ? `<span class="avdf-bib-nat" style="--cor-nat:${nat.cor}">${_av(nat.nome)}</span>` : '',
    j.acesso ? `<span class="avdf-bib-tag">${_av(j.acesso)}</span>` : '',
    j.estagio ? `<span class="avdf-bib-tag">Estágio ${_av(j.estagio)}</span>` : '',
  ].filter(Boolean).join('');

  //  Os campos que só algumas técnicas têm. Só entram quando existem.
  const extras = [
    ['Alcance', j.alcance], ['CD', j.cd], ['Duração', j.duracao], ['Ação', j.acao],
    ['Dano', j.dano], ['Acerto', j.acerto], ['Camadas', j.camadas], ['Estilo', j.estilo],
    ['Requisito', j.requisito], ['Custo real', j.custoReal], ['Olho', j.olho],
  ].filter(([, v]) => v != null && v !== '')
   .map(([k, v]) => `<span class="avdf-bib-extra"><b>${k}:</b> ${_av(v)}</span>`).join('');

  const pode = _avdfPossoAprender(j);
  return `<div class="avdf-bib-item${jaTem ? ' ja-tem' : ''}${pode ? '' : ' fora-do-alcance'}">
        <div class="avdf-bib-cabeca">
          <div class="avdf-bib-nome">
            ${_av(j.nome)}${j.traducao ? `<span class="avdf-bib-trad">${_av(j.traducao)}</span>` : ''}
          </div>
          <button type="button" class="avdf-bib-add" onclick="avdfAdicionarJutsu('${_av(j.id)}')"
                  ${jaTem ? 'disabled' : ''}>${jaTem ? 'na ficha' : '＋ Adicionar'}</button>
        </div>
        <div class="avdf-bib-tags">${etiquetas}</div>
        ${j.efeito ? `<div class="avdf-bib-efeito">${_av(j.efeito)}</div>` : ''}
        ${j.efeitoDetalhado ? `<div class="avdf-bib-efeito avdf-bib-detalhe">${_av(j.efeitoDetalhado)}</div>` : ''}
        ${extras ? `<div class="avdf-bib-extras">${extras}</div>` : ''}
        ${j.observacao ? `<div class="avdf-bib-obs">${_av(j.observacao)}</div>` : ''}
        ${pode ? '' : `<div class="avdf-bib-aviso">${_av(_avdfPorQueNaoPosso(j))}</div>`}
      </div>`;
}

//  Por que esta técnica está fora do alcance. Bloquear sem dizer o
//  motivo é pior do que não bloquear — e aqui não é bloqueio: o botão
//  continua funcionando, porque o Mestre manda mais que a tabela.
function _avdfPorQueNaoPosso(j) {
  const rank = document.getElementById('f-rank')?.value || 'genin';
  if (j.rank && !avdfJutsuPermitido(rank, j.rank)) return avdfLimiteJutsu(rank).aviso;
  if (j.natureza) {
    const el = document.getElementById('f-nat-' + j.natureza);
    if (!el || !el.checked) {
      const n = NATUREZAS_AVDF.find(x => x.id === j.natureza);
      return `Você não domina ${n ? n.nome : j.natureza} — o livro diz que jutsus de uma natureza que você não domina não podem ser aprendidos.`;
    }
  }
  if (j.categoria === 'genjutsu' && avdfGenjutsuExigeInton(j.rank)
      && !document.getElementById('f-nat-yin')?.checked) {
    return `Genjutsu de rank ${INTON_EXIGIDO_A_PARTIR_DE} ou superior exige Inton (Yin) dominado.`;
  }
  if (j.cla) return `Exclusiva do clã ${j.claNome}.`;
  return '';
}

function avdfAdicionarJutsu(id) {
  const j = avdfCatalogoJutsus().find(x => x.id === id);
  if (!j) return;
  if (AVDF_JUTSUS.some(x => x.id === id)) return;
  AVDF_JUTSUS.push({ ...j });
  avdfPintarJutsus();
  avdfBibDesenhar();
  if (typeof toast === 'function') toast(`${j.nome} adicionado à ficha.`, 'ok');
  if (typeof autoSave === 'function') autoSave();
}

function avdfRemoverJutsu(id) {
  AVDF_JUTSUS = AVDF_JUTSUS.filter(j => j.id !== id);
  avdfPintarJutsus();
  avdfBibDesenhar();
  if (typeof autoSave === 'function') autoSave();
}


// ══════════════════════════════════════════════════════════════════
//  OS JUTSUS NA FICHA
//
//  Cartão compacto que abre. Fechado mostra o que a mesa pergunta no
//  meio do turno: nome, rank e custo. Aberto mostra o resto.
// ══════════════════════════════════════════════════════════════════
function avdfHtmlJutsus() {
  return `<div class="avdf-jutsus-topo">
          <input type="search" id="avdf-jutsu-busca" placeholder="Buscar entre os seus..."
                 oninput="avdfPintarJutsus()" aria-label="Buscar nos seus jutsus">
          <button type="button" class="avdf-add avdf-add-forte" onclick="avdfAbrirBiblioteca()">＋ Adicionar Jutsu</button>
        </div>
        <div class="avdf-jutsus" id="avdf-jutsus-list"></div>
        ${avdfHtmlBiblioteca()}`;
}

function avdfPintarJutsus() {
  const lista = document.getElementById('avdf-jutsus-list');
  if (!lista) return;
  const termo = (document.getElementById('avdf-jutsu-busca')?.value || '').toLowerCase().trim();
  const meus = AVDF_JUTSUS.filter(j =>
    !termo || `${j.nome} ${j.efeito || ''}`.toLowerCase().includes(termo));

  if (!meus.length) {
    lista.innerHTML = AVDF_JUTSUS.length
      ? `<div class="avdf-vazio">Nenhum jutsu seu casa com "${_av(termo)}".</div>`
      : `<div class="avdf-vazio">Nenhum jutsu ainda. Use <strong>＋ Adicionar Jutsu</strong> para abrir a biblioteca do sistema.</div>`;
    return;
  }

  //  Separadas por tipo, como você pediu: Ninjutsu | Genjutsu |
  //  Taijutsu | Fūinjutsu | do Clã | Geral.
  const ordem = ['ninjutsu', 'genjutsu', 'taijutsu', 'fuinjutsu', 'cla', 'geral'];
  const grupos = {};
  meus.forEach(j => (grupos[j.categoria] = grupos[j.categoria] || []).push(j));

  lista.innerHTML = ordem.filter(c => grupos[c]).map(c => `
        <div class="avdf-jutsu-cat">${_av(c === 'cla' ? 'Do Clã' : (AVDF_CATEGORIA_NOME[c] || c))}</div>
        ${grupos[c].map(_avdfCartaoJutsu).join('')}`).join('');
}

function _avdfCartaoJutsu(j) {
  const nat = j.natureza ? NATUREZAS_AVDF.find(n => n.id === j.natureza) : null;
  const extras = [
    ['Alcance', j.alcance], ['CD', j.cd], ['Duração', j.duracao], ['Ação', j.acao],
    ['Dano', j.dano], ['Acerto', j.acerto], ['Selos', j.selos], ['Camadas', j.camadas],
    ['Estilo', j.estilo], ['Requisito', j.requisito], ['Acesso', j.acesso],
  ].filter(([, v]) => v != null && v !== '')
   .map(([k, v]) => `<span class="avdf-bib-extra"><b>${k}:</b> ${_av(v)}</span>`).join('');

  return `<details class="avdf-jutsu">
        <summary>
          <span class="avdf-jutsu-nome">${_av(j.nome)}</span>
          ${nat ? `<span class="avdf-bib-nat" style="--cor-nat:${nat.cor}">${_av(nat.nome)}</span>` : ''}
          ${j.rank ? `<span class="avdf-bib-rank">${_av(j.rank)}</span>` : ''}
          ${j.pc != null ? `<span class="avdf-jutsu-pc">${_av(j.pc)} PC</span>` : ''}
        </summary>
        <div class="avdf-jutsu-corpo">
          ${j.efeito ? `<div class="avdf-bib-efeito">${_av(j.efeito)}</div>` : ''}
          ${j.efeitoDetalhado ? `<div class="avdf-bib-efeito avdf-bib-detalhe">${_av(j.efeitoDetalhado)}</div>` : ''}
          ${extras ? `<div class="avdf-bib-extras">${extras}</div>` : ''}
          <div class="avdf-jutsu-acoes">
            <button type="button" class="avdf-jutsu-usar" onclick="avdfUsarJutsu('${_av(j.id)}')">Usar</button>
            <button type="button" class="avdf-jutsu-remover" onclick="avdfRemoverJutsu('${_av(j.id)}')">Remover</button>
          </div>
        </div>
      </details>`;
}

//  Usar um jutsu: confere e desconta o PC, e anuncia na mesa o que o
//  livro escreveu. NÃO inventa rolagem: se a técnica não tem ataque
//  previsto, nada é rolado — só o custo sai e o efeito é anunciado.
function avdfUsarJutsu(id) {
  const j = AVDF_JUTSUS.find(x => x.id === id);
  if (!j) return;
  const custo = parseInt(j.pc, 10);

  if (Number.isFinite(custo) && custo > 0) {
    if ((REC.pc ?? 0) < custo) {
      if (typeof toast === 'function') toast(`Chakra insuficiente: ${j.nome} custa ${custo} PC e você tem ${REC.pc ?? 0}.`, 'err');
      return;
    }
    REC.pc = (REC.pc ?? 0) - custo;
    pintarRecurso('pc');
    if (typeof S().ficha.aoMudarRecurso === 'function') S().ficha.aoMudarRecurso('pc');
  }

  const partes = [j.rank ? `rank ${j.rank}` : '', Number.isFinite(custo) ? `${custo} PC` : (j.pc ? String(j.pc) : '')]
    .filter(Boolean).join(' · ');
  if (typeof publicarSala === 'function') {
    publicarSala('msg', { texto: `⚡ **${j.nome}**${partes ? ` (${partes})` : ''}\n${j.efeito || ''}` });
  }
  if (typeof toast === 'function') toast(`${j.nome} usado${Number.isFinite(custo) && custo > 0 ? ` — ${custo} PC` : ''}.`, 'ok');
  if (typeof autoSave === 'function') autoSave();
}

function avdfColetarJutsusNovos() {
  return AVDF_JUTSUS.map(j => j.id);
}

function avdfAplicarJutsusNovos(ids) {
  const cat = avdfCatalogoJutsus();
  AVDF_JUTSUS = (ids || []).map(id => cat.find(j => j.id === id)).filter(Boolean);
  avdfPintarJutsus();
}


// ══════════════════════════════════════════════════════════════════
//  EQUIPAMENTO EM CARTÕES (seu ponto 4)
//
//  Na ficha aparece "Kunai ×10". Clicar abre a janela com tudo que o
//  livro diz daquele item: categoria, preço, dano, alcance, efeito,
//  regra especial, requisito. A ficha fica limpa e ninguém precisa
//  sair dela para consultar a regra de um selo explosivo.
//
//  Vale para o kit inicial e para qualquer item acrescentado depois:
//  quem digita um nome que existe no catálogo ganha o cartão junto.
// ══════════════════════════════════════════════════════════════════

//  O que está na mochila. Cada entrada é { nome, qtd } — o resto das
//  informações vem do catálogo pelo nome, para a ficha não guardar uma
//  cópia velha da regra de um item.
let AVDF_ITENS = [];

const AVDF_CAT_ITEM = {
  arma: 'Armas', ferramenta: 'Ferramentas',
  consumivel: 'Consumíveis', vestuario: 'Vestuário',
};

function avdfHtmlEquipamento() {
  return `<div class="avdf-equip">
        <div class="avdf-equip-linha">
          <div class="avdf-equip-ryo">
            <label for="f-ryo">Ryō</label>
            <input type="number" id="f-ryo" min="0" step="10" inputmode="numeric"
                   value="${RYO_INICIAL}" oninput="autoSave()">
            <span class="avdf-equip-auto">${RYO_INICIAL} na criação</span>
          </div>
          <button type="button" class="avdf-add avdf-add-forte" onclick="avdfAbrirLojinha()">＋ Adicionar Item</button>
        </div>
        <div class="avdf-equip-sub">Mochila <span class="avdf-equip-auto" id="avdf-equip-conta"></span></div>
        <div class="avdf-itens-grade" id="avdf-itens-list"></div>
        ${_avdfHtmlJanelaItem()}
        ${_avdfHtmlLojinha()}
      </div>`;
}

//  A mochila. Cada item é um cartão compacto; clicar abre a ficha dele.
function avdfMontarItens(dados) {
  const lista = document.getElementById('avdf-itens-list');
  if (!lista) return;
  //  Ficha nova nasce com o Kit Shinobi Padrão: "todo ninja começa com
  //  ele" — não é escolha, então não se pergunta.
  //  O kit sai do próprio catálogo (`kit: true`), e não de uma segunda
  //  lista escrita à mão. Com duas listas, os nomes divergiam — o kit
  //  dizia "Shuriken" e o catálogo "Shuriken (×10)" — e metade dos
  //  itens iniciais abria sem ficha nenhuma.
  if (dados) AVDF_ITENS = dados.slice();
  else if (!AVDF_ITENS.length) {
    const kit = typeof kitShinobiAvdf === 'function' ? kitShinobiAvdf() : [];
    AVDF_ITENS = kit.map(k => ({ nome: k.nome, qtd: k.qtdKit ?? 1, doKit: true }));
  }

  const conta = document.getElementById('avdf-equip-conta');
  if (conta) conta.textContent = `${AVDF_ITENS.length} ${AVDF_ITENS.length === 1 ? 'item' : 'itens'}`;

  lista.innerHTML = AVDF_ITENS.map((it, i) => {
    const d = typeof itemAvdf === 'function' ? itemAvdf(it.nome) : null;
    return `<div class="avdf-item-card${d ? ' com-ficha' : ''}${it.doKit ? ' do-kit' : ''}"
                 ${d ? `onclick="avdfAbrirItem(${i})" role="button" tabindex="0"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();avdfAbrirItem(${i})}"` : ''}>
        <span class="avdf-item-icone">${_av(d?.icone || '▫')}</span>
        <span class="avdf-item-txt">
          <span class="avdf-item-nome">${_av(it.nome)}</span>
          ${d?.categoria ? `<span class="avdf-item-cat">${_av(AVDF_CAT_ITEM[d.categoria] || d.categoria)}</span>` : ''}
        </span>
        <span class="avdf-item-qtd">×${_av(it.qtd ?? 1)}</span>
        <button type="button" class="avdf-item-x" title="Remover"
                onclick="event.stopPropagation();avdfRemoverItem(${i})">✕</button>
      </div>`;
  }).join('') || `<div class="avdf-vazio">Mochila vazia.</div>`;
}

function avdfColetarItens() { return AVDF_ITENS.slice(); }

function avdfRemoverItem(i) {
  AVDF_ITENS.splice(i, 1);
  avdfMontarItens(AVDF_ITENS);
  if (typeof autoSave === 'function') autoSave();
}

function avdfMudarQtd(i, delta) {
  const it = AVDF_ITENS[i]; if (!it) return;
  it.qtd = Math.max(0, (parseInt(it.qtd, 10) || 0) + delta);
  avdfMontarItens(AVDF_ITENS);
  avdfAbrirItem(i);
  if (typeof autoSave === 'function') autoSave();
}

// ── A ficha de um item ────────────────────────────────────────────
function _avdfHtmlJanelaItem() {
  return `<div class="avdf-modal" id="avdf-item-modal" hidden role="dialog" aria-modal="true">
        <div class="avdf-modal-fundo" onclick="avdfFecharItem()"></div>
        <div class="avdf-modal-caixa avdf-modal-estreita" id="avdf-item-corpo"></div>
      </div>`;
}

function avdfAbrirItem(i) {
  const it = AVDF_ITENS[i];
  const d = it && typeof itemAvdf === 'function' ? itemAvdf(it.nome) : null;
  const cx = document.getElementById('avdf-item-modal');
  const corpo = document.getElementById('avdf-item-corpo');
  if (!cx || !corpo || !d) return;

  //  Só entram as linhas que o livro realmente dá. Um campo vazio
  //  seria pior do que campo nenhum: dá a impressão de que a regra
  //  existe e ninguém preencheu.
  const linhas = [
    ['Categoria', AVDF_CAT_ITEM[d.categoria] || d.categoria],
    ['Preço', d.precoTexto || (d.preco != null ? `${d.preco} ryō` : null)],
    ['Dano', d.dano],
    ['Alcance', d.alcance],
    ['Zona', d.alcanceZona],
    ['Requisito', d.requisito || d.requisitoPara],
    ['Teste', d.teste],
    ['Condição', d.condicao],
    ['Doses', d.doses],
    ['Usos', d.usos],
    ['Duração', d.duracao],
    ['Custo em ação', d.custoAcao],
    ['Redução de dano', d.reducaoDano],
    ['Embalagem', d.embalagem],
    ['Regra especial', d.regraEspecial],
  ].filter(([, v]) => v != null && v !== '')
   .map(([k, v]) => `<div class="avdf-ficha-linha"><span>${k}</span><span>${_av(v)}</span></div>`).join('');

  corpo.innerHTML = `
        <div class="avdf-modal-topo">
          <h2><span class="avdf-item-icone-grande">${_av(d.icone || '▫')}</span> ${_av(d.nome)}</h2>
          <button type="button" class="avdf-modal-x" onclick="avdfFecharItem()" aria-label="Fechar">✕</button>
        </div>
        <div class="avdf-ficha-item">
          <div class="avdf-ficha-qtd">
            <button type="button" onclick="avdfMudarQtd(${i},-1)">−</button>
            <span>${_av(it.qtd ?? 1)}</span>
            <button type="button" onclick="avdfMudarQtd(${i},1)">+</button>
            <span class="avdf-ficha-qtd-rot">na mochila</span>
          </div>
          ${d.efeito ? `<div class="avdf-ficha-efeito">${_av(d.efeito)}</div>` : ''}
          ${linhas ? `<div class="avdf-ficha-tabela">${linhas}</div>` : ''}
          ${d.kit ? `<div class="avdf-ficha-nota">Faz parte do Kit Shinobi Padrão — todo ninja começa com ele.</div>` : ''}
        </div>`;
  cx.hidden = false;
  document.body.classList.add('avdf-modal-aberto');
}

function avdfFecharItem() {
  const cx = document.getElementById('avdf-item-modal');
  if (cx) cx.hidden = true;
  document.body.classList.remove('avdf-modal-aberto');
}

// ── O catálogo de equipamento ─────────────────────────────────────
function _avdfHtmlLojinha() {
  return `<div class="avdf-modal" id="avdf-loja" hidden role="dialog" aria-modal="true" aria-label="Equipamento">
        <div class="avdf-modal-fundo" onclick="avdfFecharLojinha()"></div>
        <div class="avdf-modal-caixa">
          <div class="avdf-modal-topo">
            <h2>Equipamento</h2>
            <button type="button" class="avdf-modal-x" onclick="avdfFecharLojinha()" aria-label="Fechar">✕</button>
          </div>
          <div class="avdf-bib-filtros">
            <input type="search" id="loja-busca" placeholder="Buscar item..." oninput="avdfLojaDesenhar()">
            <div class="avdf-bib-atalhos" id="loja-cats"></div>
            <div class="avdf-loja-livre">
              <input type="text" id="loja-livre" placeholder="Ou escreva um item que não está no livro...">
              <button type="button" class="avdf-add" onclick="avdfAddItemLivre()">Adicionar</button>
            </div>
          </div>
          <div class="avdf-bib-lista" id="loja-lista"></div>
        </div>
      </div>`;
}

let AVDF_LOJA_CAT = '';

function avdfAbrirLojinha() {
  const cx = document.getElementById('avdf-loja');
  if (!cx) return;
  const cats = document.getElementById('loja-cats');
  if (cats) {
    cats.innerHTML = [['', 'Tudo']].concat(Object.entries(AVDF_CAT_ITEM))
      .map(([v, t]) => `<button type="button" class="avdf-bib-chip${v === AVDF_LOJA_CAT ? ' ativo' : ''}"
             onclick="AVDF_LOJA_CAT='${v}';avdfAbrirLojinha()">${t}</button>`).join('');
  }
  cx.hidden = false;
  document.body.classList.add('avdf-modal-aberto');
  avdfLojaDesenhar();
}

function avdfFecharLojinha() {
  const cx = document.getElementById('avdf-loja');
  if (cx) cx.hidden = true;
  document.body.classList.remove('avdf-modal-aberto');
}

function avdfLojaDesenhar() {
  const lista = document.getElementById('loja-lista');
  if (!lista) return;
  const termo = (document.getElementById('loja-busca')?.value || '').toLowerCase().trim();
  const achados = (typeof ITENS_AVDF !== 'undefined' ? ITENS_AVDF : []).filter(d => {
    if (AVDF_LOJA_CAT && d.categoria !== AVDF_LOJA_CAT) return false;
    if (termo && !`${d.nome} ${d.efeito || ''}`.toLowerCase().includes(termo)) return false;
    return true;
  });
  lista.innerHTML = achados.map(d => `
        <div class="avdf-bib-item">
          <div class="avdf-bib-cabeca">
            <div class="avdf-bib-nome">${_av(d.icone || '')} ${_av(d.nome)}</div>
            <button type="button" class="avdf-bib-add" onclick="avdfAdicionarItem('${_av(d.id)}')">＋ Adicionar</button>
          </div>
          <div class="avdf-bib-tags">
            <span class="avdf-bib-tag">${_av(AVDF_CAT_ITEM[d.categoria] || d.categoria)}</span>
            ${d.precoTexto ? `<span class="avdf-bib-tag">${_av(d.precoTexto)}</span>` : ''}
            ${d.dano ? `<span class="avdf-bib-pc">${_av(d.dano)}</span>` : ''}
          </div>
          ${d.efeito ? `<div class="avdf-bib-efeito">${_av(d.efeito)}</div>` : ''}
        </div>`).join('') || `<div class="avdf-bib-vazio">Nenhum item com esses filtros.</div>`;
}

function avdfAdicionarItem(id) {
  const d = (typeof ITENS_AVDF !== 'undefined' ? ITENS_AVDF : []).find(x => x.id === id);
  if (!d) return;
  const ja = AVDF_ITENS.find(x => x.nome === d.nome);
  if (ja) ja.qtd = (parseInt(ja.qtd, 10) || 0) + 1;
  else AVDF_ITENS.push({ nome: d.nome, qtd: 1 });
  avdfMontarItens(AVDF_ITENS);
  if (typeof toast === 'function') toast(`${d.nome} na mochila.`, 'ok');
  if (typeof autoSave === 'function') autoSave();
}

//  Item que não está no livro. A mesa inventa coisa, e a ficha não
//  pode ser mais restrita que a mesa.
function avdfAddItemLivre() {
  const el = document.getElementById('loja-livre');
  const nome = (el?.value || '').trim();
  if (!nome) return;
  AVDF_ITENS.push({ nome, qtd: 1 });
  el.value = '';
  avdfMontarItens(AVDF_ITENS);
  if (typeof autoSave === 'function') autoSave();
}

//  Fechar qualquer janela com Esc.
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  ['avdf-bib', 'avdf-item-modal', 'avdf-loja'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.hidden) el.hidden = true;
  });
  document.body.classList.remove('avdf-modal-aberto');
});
