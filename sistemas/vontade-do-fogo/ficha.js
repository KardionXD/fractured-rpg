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

function _avdfVontadeDoFogo(r) {
  const cargas = Array.from({ length: r.max }, (_, i) =>
    `<button type="button" class="avdf-chama" id="avdf-chama-${i}" onclick="avdfGastarVontade(${i})"
             aria-label="Carga ${i + 1} de Vontade do Fogo">🔥</button>`).join('');
  return `
        <div class="avdf-vontade">
          <div class="avdf-vontade-topo">
            <span class="avdf-vontade-nome">${_av(r.nome)}</span>
            <div class="avdf-chamas" id="avdf-chamas">${cargas}</div>
            <span class="avdf-vontade-conta" id="gauge-pvf-val">${r.max}</span>
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
  document.querySelectorAll('#avdf-chamas .avdf-chama').forEach((el, i) => {
    el.classList.toggle('apagada', i >= atual);
  });
  const conta = document.getElementById('gauge-pvf-val');
  if (conta) conta.textContent = String(atual);
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
//  EQUIPAMENTO E RYŌ (seu ponto 25)
//
//  O Kit Shinobi Padrão não é uma escolha: "todo ninja começa com ele".
//  Então ele já vem na ficha, marcado como kit — e o que a pessoa
//  acrescenta entra embaixo, sem se misturar.
// ══════════════════════════════════════════════════════════════════
let avdfItensN = 4;

function avdfHtmlEquipamento() {
  const kit = KIT_SHINOBI_AVDF.map(i => `
          <li class="avdf-kit-item">
            <span class="avdf-kit-qtd">${i.qtd}×</span>
            <span class="avdf-kit-nome">${_av(i.nome)}</span>
            ${i.detalhe ? `<span class="avdf-kit-det">${_av(i.detalhe)}</span>` : ''}
          </li>`).join('');
  return `<div class="avdf-equip">
        <div class="avdf-equip-kit">
          <div class="avdf-equip-sub">Kit Shinobi Padrão <span class="avdf-equip-auto">incluso — todo ninja começa com ele</span></div>
          <ul class="avdf-kit">${kit}</ul>
        </div>
        <div class="avdf-equip-ryo">
          <label for="f-ryo">Ryō</label>
          <input type="number" id="f-ryo" min="0" step="10" inputmode="numeric"
                 value="${RYO_INICIAL}" oninput="autoSave()">
          <span class="avdf-equip-auto">${RYO_INICIAL} na criação</span>
        </div>
        <div class="avdf-equip-sub">O que mais você carrega</div>
        <div class="avdf-itens" id="avdf-itens-list"></div>
        <button type="button" class="avdf-add" onclick="avdfAddItem()">＋ Item</button>
      </div>`;
}

function avdfMontarItens(dados) {
  const lista = document.getElementById('avdf-itens-list');
  if (!lista) return;
  const existentes = (dados && dados.length) ? dados : avdfColetarItens();
  avdfItensN = Math.max(4, existentes.length);
  lista.innerHTML = '';
  for (let i = 0; i < avdfItensN; i++) {
    const it = existentes[i] || {};
    const div = document.createElement('div');
    div.className = 'avdf-item';
    div.innerHTML = `
        <input type="number" id="ai-qtd-${i}" class="avdf-item-qtd" min="0" inputmode="numeric"
               placeholder="1" value="${it.qtd != null ? _av(it.qtd) : ''}" oninput="autoSave()">
        <input type="text" id="ai-nome-${i}" class="avdf-item-nome" placeholder="Nome do item..."
               value="${_av(it.nome || '')}" oninput="autoSave()">
        <input type="text" id="ai-obs-${i}" class="avdf-item-obs" placeholder="Observação..."
               value="${_av(it.obs || '')}" oninput="autoSave()">`;
    lista.appendChild(div);
  }
}

function avdfColetarItens() {
  const arr = [];
  for (let i = 0; i < avdfItensN; i++) {
    arr.push({
      qtd:  document.getElementById(`ai-qtd-${i}`)?.value || '',
      nome: document.getElementById(`ai-nome-${i}`)?.value || '',
      obs:  document.getElementById(`ai-obs-${i}`)?.value || '',
    });
  }
  return arr;
}

function avdfAddItem() {
  const atuais = avdfColetarItens();
  atuais.push({});
  avdfItensN = atuais.length;
  avdfMontarItens(atuais);
}


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
  if (typeof avdfAoTrocarRank === 'function') avdfAoTrocarRank();
  if (typeof avdfAoTrocarCla === 'function') avdfAoTrocarCla();
  if (typeof avdfAoTrocarKG === 'function') avdfAoTrocarKG();
  if (typeof avdfAtualizarTecnicasDisponiveis === 'function') avdfAtualizarTecnicasDisponiveis();
  avdfMontarVinculos(null);
  avdfMontarItens(null);
  avdfAoTrocarOrigem();
  avdfAtualizarGrausPermitidos();
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
  porCampo('avdf-exaustao', d.exa_atual || 0);

  (d.condicoes || []).forEach(id => {
    const el = document.getElementById('avdf-cond-' + id);
    if (el && !el.disabled) el.checked = true;
  });

  //  Naturezas, clã, linhagem, estágios e técnicas.
  NATUREZAS_AVDF.forEach(n => {
    const el = document.getElementById('f-nat-' + n.id);
    if (el) el.checked = (d.naturezas || []).includes(n.id);
  });
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
  avdfMontarItens(Array.isArray(d.itens) ? d.itens : null);
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
  const naturezas = NATUREZAS_AVDF
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
