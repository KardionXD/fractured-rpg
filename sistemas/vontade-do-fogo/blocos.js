// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — BLOCOS EXCLUSIVOS DA FICHA
//
//  Rank, Naturezas de Chakra e as trilhas de Defesa/Resiliência não
//  existem em nenhum outro sistema. O motor da ficha não sabe o que
//  são: ele só reserva o espaço e chama estas funções.
//
//  O catálogo de técnicas, os clãs e os Pontos de Treino entram na
//  fase 9 — aqui ficam os campos livres, para a mesa já poder jogar.
// ══════════════════════════════════════════════════════════════════

//  O Rank. Vila e Idade foram para a Identidade (é lá que se diz quem
//  a pessoa é) e as Naturezas para a aba Técnicas (é lá que elas
//  importam: natureza é o que você pode aprender). O que sobrou aqui é
//  o rank e o que ele destrava — que é o assunto da aba Progressão.
function avdfHtmlRank() {
  //  Genin nasce marcado: é onde uma campanha padrão começa. Estudante
  //  é o prólogo opcional, e deixá-lo como padrão faria toda ficha nova
  //  abrir com −5 de Vida e −4 de Chakra sem ninguém ter escolhido isso.
  const padrao = S().progressao?.padrao || 'genin';
  const ranks = RANKS_AVDF.map(r =>
    `<option value="${r.id}" title="${r.oque}"${r.id === padrao ? ' selected' : ''}>${r.nome}</option>`).join('');
  return `<div class="field"><label>Rank</label>
          <select id="f-rank" onchange="avdfAoTrocarRank()">${ranks}</select>
          <div id="rank-info" class="profissao-info"></div>
        </div>`;
}

//  As cinco naturezas. Ficam na aba Técnicas porque é lá que elas
//  mandam: "jutsus de uma natureza que você não domina não podem ser
//  aprendidos".
function avdfHtmlNaturezas() {
  const caixa = n => `<label class="avdf-natureza" id="nat-cx-${n.id}" style="--cor-nat:${n.cor}">
            <input type="checkbox" id="f-nat-${n.id}" onchange="avdfAoMudarNatureza()">
            <span class="avdf-nat-nome">${esc(n.nome)} <span style="opacity:.65">(${esc(n.trad)})</span></span>
            ${n.requisitoTexto ? `<span class="avdf-nat-req" id="nat-req-${n.id}">${esc(n.requisitoTexto)}</span>` : ''}
          </label>`;

  return `<div class="avdf-nat-grupo">Cinco naturezas elementais</div>
        <div class="avdf-naturezas">
          ${NATUREZAS_AVDF.map(caixa).join('\n          ')}
        </div>

        <div class="avdf-nat-grupo">Yin, Yang e Yin-Yang <span>não são elementos — Cap. 07</span></div>
        <div class="avdf-naturezas avdf-naturezas-especiais">
          ${NATUREZAS_ESPECIAIS_AVDF.map(caixa).join('\n          ')}
        </div>
        <div class="avdf-nat-oque">
          ${NATUREZAS_ESPECIAIS_AVDF.map(n =>
            `<div><strong>${esc(n.nome)}</strong> — ${esc(n.oque)}</div>`).join('')}
        </div>

        <div class="avdf-onmyoton">
          <label class="avdf-natureza" style="--cor-nat:#cfcfe6">
            <input type="checkbox" id="f-nat-onmyoton" onchange="avdfAoMudarNatureza()">
            <span class="avdf-nat-nome">${esc(ONMYOTON_AVDF.nome)} <span style="opacity:.65">(${esc(ONMYOTON_AVDF.trad)})</span></span>
            <span class="avdf-nat-req avdf-nat-mestre">só por concessão do Mestre</span>
          </label>
          <div class="avdf-nat-oque"><div>${esc(ONMYOTON_AVDF.oque)}</div>
            <div style="color:var(--muted)">${esc(ONMYOTON_AVDF.regra)}</div></div>
        </div>

        <div class="avdf-nat-nota">O livro não diz se Yin e Yang custam PT como uma segunda natureza, nem se cumprir o requisito de atributo já as concede. Por isso a ficha mostra o requisito e deixa a marcação com você.</div>`;
}

//  Marca no rótulo quem já cumpre o requisito de atributo de Yin e de
//  Yang. NÃO marca a caixa sozinha: o livro dá o requisito, mas não diz
//  se cumpri-lo concede a natureza ou se ela ainda tem que ser
//  comprada. Inventar aqui seria dar Yin de graça a todo genjutsuka.
function avdfAtualizarNaturezasEspeciais() {
  const attr = typeof _attrDaTela === 'function' ? _attrDaTela() : {};
  NATUREZAS_ESPECIAIS_AVDF.forEach(n => {
    const rot = document.getElementById('nat-req-' + n.id);
    const cx  = document.getElementById('nat-cx-' + n.id);
    if (!rot || !cx) return;
    const cumpre = requisitoNaturezaCumpridoAvdf(n.id, attr);
    const marcada = document.getElementById('f-nat-' + n.id)?.checked;
    cx.classList.toggle('req-ok', cumpre);
    rot.textContent = marcada
      ? (cumpre ? 'requisito cumprido' : 'abaixo do requisito — ' + n.requisitoTexto)
      : (cumpre ? 'requisito cumprido · ' + n.requisitoTexto : n.requisitoTexto);
  });
}

function avdfAoMudarNatureza() {
  avdfAtualizarNaturezasEspeciais();
  if (typeof avdfBibDesenhar === 'function' && !document.getElementById('avdf-bib')?.hidden) avdfBibDesenhar();
  if (typeof autoSave === 'function') autoSave();
}

//  Defesa e Resiliência são valores que a mesa consulta o tempo todo
//  durante o combate — o alvo de um ataque e o alvo de um genjutsu.
//  Ficam grandes e juntos, não escondidos numa linha de texto.
function avdfHtmlAlvos() {
  return `<div class="avdf-alvos">
          <div class="avdf-alvo">
            <span class="avdf-alvo-rot">Defesa</span>
            <span class="avdf-alvo-val" id="avdf-defesa">10</span>
            <span class="avdf-alvo-sub">10 + COR · alvo de ataques</span>
          </div>
          <div class="avdf-alvo">
            <span class="avdf-alvo-rot">Resiliência</span>
            <span class="avdf-alvo-val" id="avdf-resiliencia">10</span>
            <span class="avdf-alvo-sub">10 + ESP · alvo de genjutsu</span>
          </div>
        </div>`;
}

//  Quando o rank muda, Vida e Chakra máximos mudam junto — o bônus de
//  rank entra nas duas fórmulas. Sem isto, o jogador subiria de Genin
//  para Chūnin e os medidores continuariam no valor antigo.
function avdfAoTrocarRank() {
  const sel = document.getElementById('f-rank');
  const r = rankAvdf(sel?.value);
  const info = document.getElementById('rank-info');
  if (info) {
    info.style.display = '';
    info.innerHTML = `<strong>${r.nome}</strong> — ${r.oque}<br>` +
      `<span style="color:var(--muted)">atributo máximo +${r.attrMax} · jutsu até rank ${r.jutsuMax} · ` +
      `PV ${r.pv >= 0 ? '+' : ''}${r.pv} · PC ${r.pc >= 0 ? '+' : ''}${r.pc}</span>`;
  }
  if (typeof avdfAtualizarDerivados === 'function') avdfAtualizarDerivados();
  //  O rank é teto de perícia também: Especialista exige Chūnin, Mestre
  //  exige Jōnin. Sem isto, o seletor continuaria oferecendo um grau
  //  que a regra não permite.
  if (typeof avdfAtualizarGrausPermitidos === 'function') avdfAtualizarGrausPermitidos();
  if (typeof autoSave === 'function') autoSave();
}

//  Recalcula Vida, Chakra, Defesa e Resiliência a partir do que está
//  na tela. Chamado quando um atributo ou o rank muda.
function avdfAtualizarDerivados() {
  const attr = { rank: document.getElementById('f-rank')?.value || 'genin' };
  S().atributos.forEach(a => {
    attr[a.id] = parseInt(document.getElementById('a-' + a.id)?.value, 10) || 0;
  });
  //  Sem o estado, Defesa ignorava o −2 de estar sem chakra e o PV
  //  máximo ignorava a Exaustão 4. A regra existia e a tela não a via.
  if (typeof avdfEstadoDaTela === 'function') attr.estado = avdfEstadoDaTela();

  const def = document.getElementById('avdf-defesa');
  const res = document.getElementById('avdf-resiliencia');
  if (def) def.textContent = avdfDefesa(attr);
  if (res) res.textContent = avdfResiliencia(attr);

  const fpv = document.getElementById('pv-formula');
  if (fpv) fpv.textContent = avdfVidaTexto(attr);
  const fpc = document.getElementById('pc-formula');
  if (fpc) fpc.textContent = avdfChakraTexto(attr);
}


// ══════════════════════════════════════════════════════════════════
//  LINHAGEM — O BLOCO QUE FALTAVA
//
//  A primeira versão desta ficha tratava tudo como "mais um elemento
//  marcado" e não tinha lugar nenhum para Kekkei Genkai. Estava errado:
//  o livro separa três coisas que não são a mesma.
//
//    · combinação de naturezas  (Hyōton = Água + Vento)
//    · linhagem própria         (Bakuton, Shōton — não saem de combinar)
//    · dōjutsu / traço de corpo (Sharingan, Byakugan, Shikotsumyaku)
//
//  E ainda há a ORIGEM: nascer com ela, ou receber um transplante —
//  que o livro trata como cirurgia ilegal com consequência permanente.
// ══════════════════════════════════════════════════════════════════

function avdfHtmlLinhagem() {
  const grupo = (rot, lista) =>
    `<optgroup label="${rot}">` +
    lista.map(k => `<option value="${k.id}">${k.nome}${k.trad ? ' (' + k.trad + ')' : ''}</option>`).join('') +
    `</optgroup>`;

  const elementais = KEKKEI_GENKAI_AVDF.filter(k => k.tipo === 'elemental');
  const proprias   = KEKKEI_GENKAI_AVDF.filter(k => k.tipo === 'propria' || k.tipo === 'derivada');
  const totas      = KEKKEI_GENKAI_AVDF.filter(k => k.tipo === 'tota');

  const origens = KG_ORIGENS.map(o =>
    `<option value="${o.id}" title="${o.obs}">${o.nome}</option>`).join('');

  return `<div class="grid-2">
          <div class="field"><label>Kekkei Genkai</label>
            <select id="f-kg" onchange="avdfAoTrocarKG()">
              <option value="">Nenhuma — chakra comum</option>
              ${grupo('Combinação de naturezas', elementais)}
              ${grupo('Linhagem própria', proprias)}
              ${grupo('Kekkei Tōta — três naturezas', totas)}
              ${grupo('Do corpo (dōjutsu e traços)', LINHAGENS_CORPO_AVDF)}
              <option value="outra">Outra — escrever à mão</option>
            </select>
          </div>
          <div class="field"><label>Como você a tem</label>
            <select id="f-kg-origem" onchange="autoSave()">${origens}</select>
          </div>
        </div>
        <div class="field" id="f-kg-outra-wrap" style="display:none;margin-top:8px">
          <label>Nome da linhagem</label>
          <input type="text" id="f-kg-outra" placeholder="A linhagem que a sua mesa criou..." oninput="autoSave()">
        </div>
        <div id="kg-info" class="profissao-info" style="display:none;margin-top:8px"></div>`;
}

//  Mostra do que a linhagem escolhida é feita, e avisa quando ela exige
//  outra coisa antes (o Enton exige Amaterasu, por exemplo).
function avdfAoTrocarKG() {
  const sel  = document.getElementById('f-kg');
  const info = document.getElementById('kg-info');
  const outra = document.getElementById('f-kg-outra-wrap');
  if (!sel || !info) return;

  if (outra) outra.style.display = sel.value === 'outra' ? '' : 'none';

  const k = kekkeiGenkaiAvdf(sel.value);
  if (!k) { info.style.display = 'none'; if (typeof autoSave === 'function') autoSave(); return; }

  const nat = (k.composicao || [])
    .map(id => NATUREZAS_AVDF.find(n => n.id === id))
    .filter(Boolean)
    .map(n => `<span style="color:${n.cor}">${n.nome}</span>`).join(' + ');

  const linhas = [];
  if (nat) linhas.push(`<strong>Composição:</strong> ${nat}`);
  if (k.tipo === 'propria')  linhas.push('<strong>Linhagem própria</strong> — não sai de combinar naturezas.');
  if (k.tipo === 'tota')     linhas.push('<strong>Kekkei Tōta</strong> — três naturezas ao mesmo tempo. Muito mais raro.');
  if (k.tipo === 'dojutsu')  linhas.push(`<strong>Dōjutsu</strong>${k.cla ? ' do clã ' + k.cla : ''}.`);
  if (k.tipo === 'corpo')    linhas.push(`<strong>Traço de corpo</strong>${k.cla ? ' do clã ' + k.cla : ''}.`);
  if (k.exige)       linhas.push(`<strong>Exige:</strong> ${k.exige}`);
  if (k.portadores)  linhas.push(`<span style="color:var(--muted)">Portadores canônicos: ${k.portadores}</span>`);
  linhas.push('<span style="color:var(--muted)">Nenhuma pode ser treinada — ou você nasce com ela, ou recebe um transplante.</span>');

  info.style.display = '';
  info.innerHTML = linhas.join('<br>');
  if (typeof autoSave === 'function') autoSave();
}


// ══════════════════════════════════════════════════════════════════
//  CLÃ — PASSIVA E A TRILHA DE CINCO ESTÁGIOS
//
//  Um clã não é um campo de texto: é uma trilha que o personagem
//  percorre durante meses. Cada estágio exige rank mínimo, custa PT e
//  — o que mais importa — exige um marco narrativo jogado em cena.
//  Por isso os cinco ficam visíveis o tempo todo, com o marco escrito:
//  é a lista de metas do jogador, não uma nota de rodapé.
// ══════════════════════════════════════════════════════════════════

function avdfHtmlCla() {
  //  Os trinta do Compêndio, agrupados pela região — que é como o livro
  //  os apresenta e como a pessoa procura. Antes só o Uchiha estava na
  //  lista, porque só ele tinha sido transcrito.
  //  Sem os que o livro marca como não jogáveis (o Ōtsutsuki: "nunca
  //  como opção de jogador").
  const grupos = clasAvdfPorRegiao(true);
  const ordemRegiao = ['Konohagakure', ...Object.keys(grupos).filter(r => r !== 'Konohagakure').sort()];
  const opcoes = '<option value="comum">Ninja Comum (sem clã)</option>' +
    ordemRegiao.filter(r => grupos[r]).map(r =>
      `<optgroup label="${esc(r)}">` +
      grupos[r].map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('') +
      `</optgroup>`).join('');

  return `<div class="grid-2">
          <div class="field"><label>Clã</label>
            <select id="f-cla" onchange="avdfAoTrocarCla()">
              <option value="">Selecionar...</option>
              ${opcoes}
            </select>
            <div id="cla-ajustes" class="avdf-cla-ajustes" hidden></div>
          </div>
          <div class="field"><label>Pontos de Treino disponíveis</label>
            <div style="display:flex;align-items:center;gap:6px">
              <button class="ct-pv-btn" onclick="avdfPT(-1)">−</button>
              <input type="number" id="f-pt" value="0" min="0" style="width:64px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:5px;font-size:15px;font-weight:700" oninput="autoSave()">
              <button class="ct-pv-btn" onclick="avdfPT(1)">+</button>
              <span style="font-size:10px;color:var(--muted)">gasta em técnica, estágio e talento</span>
            </div>
          </div>
        </div>
        <div id="cla-passiva" class="avdf-passiva" style="display:none"></div>
        <div id="cla-trilha" class="avdf-trilha"></div>
        <div id="cla-extra"></div>`;
}

function avdfPT(delta) {
  const el = document.getElementById('f-pt');
  if (!el) return;
  el.value = Math.max(0, (parseInt(el.value, 10) || 0) + delta);
  if (typeof autoSave === 'function') autoSave();
}

//  Quais estágios este personagem já destravou. Guardado como lista de
//  números romanos, para o dado sobreviver a uma mudança de clã.
function avdfEstagiosMarcados() {
  return [...document.querySelectorAll('#cla-trilha input[data-estagio]:checked')]
    .map(i => i.dataset.estagio);
}

function avdfAoTrocarCla(marcados) {
  const sel = document.getElementById('f-cla');
  const box = document.getElementById('cla-passiva');
  const tri = document.getElementById('cla-trilha');
  const ext = document.getElementById('cla-extra');
  if (!sel || !tri) return;

  const c = claAvdf(sel.value);
  const jaMarcados = marcados || avdfEstagiosMarcados();

  if (!c) { box.style.display = 'none'; tri.innerHTML = ''; ext.innerHTML = '';
            avdfAplicarClaNaFicha(null);
            if (typeof autoSave === 'function') autoSave(); return; }

  box.style.display = '';
  const fardo = c.fardo
    ? `<div class="avdf-passiva-rot" style="margin-top:10px">Fardo — ${esc(c.fardo.nome)}</div>
       <div class="avdf-passiva-txt">${esc(c.fardo.efeito)}</div>`
    : '';
  box.innerHTML = `<div class="avdf-passiva-rot">Passiva — ${esc(c.passiva?.nome || '—')}</div>
      <div class="avdf-passiva-txt">${esc(c.passiva?.efeito || '')}</div>${fardo}`;

  //  O Estágio I é de graça e já vem cumprido: é um rito de infância,
  //  não conquista de campanha. Por isso nasce marcado.
  tri.innerHTML = (c.estagios || []).map((e, i) => {
    const marcado = jaMarcados.length ? jaMarcados.includes(e.n) : i === 0;
    const rank = rankAvdf(e.rank);
    return `<label class="avdf-estagio${marcado ? ' aberto' : ''}">
        <input type="checkbox" data-estagio="${e.n}" ${marcado ? 'checked' : ''} onchange="avdfAoMarcarEstagio(this)">
        <div class="avdf-estagio-corpo">
          <div class="avdf-estagio-topo">
            <span class="avdf-estagio-n">${e.n} — ${esc(e.nome)}</span>
            <span class="avdf-estagio-custo">${esc(rank.nome)} · ${e.pt ? e.pt + ' PT' : 'grátis'}</span>
          </div>
          <div class="avdf-estagio-marco"><strong>Marco:</strong> ${esc(e.marco)}</div>
          <div class="avdf-estagio-destrava">${esc(e.destrava)}</div>
        </div>
      </label>`;
  }).join('');

  const extras = [];
  if (c.regraOpcional) {
    extras.push(`<div class="avdf-regra-opcional">
        <div class="avdf-regra-rot">Regra opcional — ${esc(c.regraOpcional.nome)}</div>
        <div>${esc(c.regraOpcional.texto)}</div>
      </div>`);
  }
  if (c.trilhaPropria) {
    const t = c.trilhaPropria;
    extras.push(`<div class="avdf-trilha-propria">
        <div class="avdf-passiva-rot">${esc(t.nome)}</div>
        <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
          <button class="ct-pv-btn" onclick="avdfTrilha('${t.id}',-1)">−</button>
          <input type="number" id="f-trilha-${t.id}" value="0" min="0" max="${t.max}"
            style="width:56px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:4px;font-size:15px;font-weight:700"
            oninput="autoSave()">
          <span style="color:var(--muted);font-size:12px">/ ${t.max}</span>
        </div>
        <div class="avdf-passiva-txt">${esc(t.dica)}</div>
      </div>`);
  }
  ext.innerHTML = extras.join('');
  avdfAplicarClaNaFicha(c);
  if (typeof autoSave === 'function') autoSave();
}

// ══════════════════════════════════════════════════════════════════
//  O CLÃ APLICADO NA FICHA (seus pontos 2 e 6)
//
//  Escolher o clã não deve deixar trabalho para o jogador: o que o clã
//  dá, a ficha já dá. E o que ela deu fica escrito, para ninguém ficar
//  olhando um número que mudou sozinho sem saber por quê.
//
//  Nada aqui TRANCA nada: todos os campos que isto mexe continuam
//  editáveis à mão.
// ══════════════════════════════════════════════════════════════════
function avdfAplicarClaNaFicha(c) {
  const aviso = document.getElementById('cla-ajustes');
  const linhas = [];

  //  Kekkei Genkai vem do clã, não de um seletor solto (seu ponto 14
  //  do primeiro documento). Só preenche se o campo estiver vazio ou
  //  com o KG de outro clã — nunca por cima de uma escolha do Mestre.
  const kg = document.getElementById('f-kg');
  if (kg && c?.linhagem) {
    const temOpcao = [...kg.options].some(o => o.value === c.linhagem);
    if (temOpcao && (!kg.value || _kgDeAlgumCla(kg.value))) {
      kg.value = c.linhagem;
      if (typeof avdfAoTrocarKG === 'function') avdfAoTrocarKG();
      linhas.push(`Kekkei Genkai: <strong>${esc(kekkeiGenkaiAvdf(c.linhagem)?.nome || c.linhagem)}</strong>`);
    }
  }

  //  Naturezas concedidas pelo clã.
  (c?.naturezas || []).forEach(n => {
    const el = document.getElementById('f-nat-' + n);
    if (el && !el.checked) {
      el.checked = true;
      linhas.push(`Natureza: <strong>${esc(naturezaAvdf(n)?.nome || n)}</strong>`);
    }
  });

  //  Perícias treinadas pelo clã. Só sobe de Não treinado para
  //  Treinado — nunca rebaixa o que já foi comprado com PT.
  (c?.ajustes?.periciasTreinadas || []).forEach(nome => {
    const el = document.getElementById('pg-' + avdfPericiaId(nome));
    if (el && (parseInt(el.value, 10) || 0) < 1) {
      el.value = '1';
      linhas.push(`Perícia treinada: <strong>${esc(nome)}</strong>`);
    }
  });
  if (typeof avdfPintarPericias === 'function') avdfPintarPericias();

  //  Recursos. O teto é recalculado por `recMax`, que já consulta o
  //  clã; aqui só repintamos e explicamos.
  (S().recursos || []).forEach(r => {
    const txt = typeof avdfExplicarAjuste === 'function' ? avdfExplicarAjuste(r.id) : '';
    if (txt) linhas.push(`${esc(r.nome)}: <strong>${esc(txt.replace(/^[^:]+:\s*/, ''))}</strong>`);
    if (typeof pintarRecurso === 'function') pintarRecurso(r.id);
  });
  if (typeof avdfPintarVontade === 'function') avdfPintarVontade();
  if (typeof avdfAtualizarDerivados === 'function') avdfAtualizarDerivados();

  if (aviso) {
    aviso.innerHTML = linhas.length
      ? `<span class="avdf-cla-auto">Aplicado pelo clã</span> ${linhas.join(' · ')}
         <span class="avdf-cla-nota">— tudo continua editável à mão</span>`
      : '';
    aviso.hidden = !linhas.length;
  }
}

//  O KG que está no campo veio de algum clã? Serve para saber se pode
//  ser substituído ao trocar de clã, ou se foi o Mestre que escolheu.
function _kgDeAlgumCla(id) {
  return clasAvdf().some(c => c.linhagem === id);
}

function avdfTrilha(id, delta) {
  const el = document.getElementById('f-trilha-' + id);
  if (!el) return;
  const max = parseInt(el.max, 10) || 99;
  el.value = Math.max(0, Math.min(max, (parseInt(el.value, 10) || 0) + delta));
  if (typeof autoSave === 'function') autoSave();
}

function avdfAoMarcarEstagio(input) {
  input.closest('.avdf-estagio')?.classList.toggle('aberto', input.checked);
  avdfAtualizarTecnicasDisponiveis();
  if (typeof autoSave === 'function') autoSave();
}


// ══════════════════════════════════════════════════════════════════
//  TÉCNICAS — COM OS OITO CAMPOS DO LIVRO
//
//  Antes era uma caixa de texto. Uma técnica tem Rank, custo em PC,
//  selos, atributo de acerto, alcance, acesso, custo em PT e categoria
//  — e o custo em PC e o dano base saem do rank, então não faz sentido
//  a pessoa digitar isso à mão e errar.
// ══════════════════════════════════════════════════════════════════

const AVDF_TEC_SLOTS = 8;

function avdfHtmlTecnicas() {
  //  Este bloco é a versão antiga (oito linhas em branco). A biblioteca
  //  de jutsus o substitui; ele fica dobrado, e só para quem já tinha
  //  escrito técnica à mão não perder o que escreveu.
  const ranks = JUTSU_RANKS_AVDF.map(r =>
    `<option value="${r.id}">${r.id} — ${r.pc} PC · ${r.dano}</option>`).join('');
  const cats = TECNICA_CATEGORIAS.map(c => `<option>${c}</option>`).join('');
  const aces = TECNICA_ACESSOS.map(a => `<option>${a}</option>`).join('');
  const alcs = TECNICA_ALCANCES.map(a => `<option>${a}</option>`).join('');
  const atrs = ['—', 'TAI', 'NIN', 'GEN', 'CTR'].map(a => `<option>${a}</option>`).join('');

  const cartoes = Array.from({ length: AVDF_TEC_SLOTS }, (_, i) => `
        <div class="avdf-tecnica">
          <div class="avdf-tec-linha1">
            <input type="text" id="t-nome-${i}" class="avdf-tec-nome" placeholder="Nome da técnica..."
              list="tecnicas-do-cla" oninput="avdfAoDigitarTecnica(${i})">
            <select id="t-rank-${i}" class="avdf-tec-rank" onchange="avdfAoTrocarRankTecnica(${i})">
              <option value="">rank</option>${ranks}
            </select>
            <button class="pericia-roll-btn" onclick="avdfRolarTecnica(${i})" title="Rolar o acerto desta técnica">${fracIcon('d20', { size: 14 })}</button>
          </div>
          <div class="avdf-tec-linha2">
            <select id="t-cat-${i}"  onchange="autoSave()"><option value="">categoria</option>${cats}</select>
            <select id="t-atrib-${i}" onchange="autoSave()"><option value="">acerto</option>${atrs}</select>
            <select id="t-alc-${i}"  onchange="autoSave()"><option value="">alcance</option>${alcs}</select>
            <select id="t-acesso-${i}" onchange="autoSave()"><option value="">acesso</option>${aces}</select>
            <input type="number" id="t-pc-${i}"    placeholder="PC"    min="0" title="Custo em chakra" oninput="autoSave()">
            <input type="number" id="t-selos-${i}" placeholder="selos" min="0" title="Número de selos de mão" oninput="autoSave()">
          </div>
          <input type="text" id="t-efeito-${i}" class="avdf-tec-efeito" placeholder="O que ela faz..." oninput="autoSave()">
        </div>`).join('');

  return `<div style="font-size:10px;color:var(--muted);margin-bottom:8px">
          O custo em PC e o dano base saem do rank (E:1/1d4 · D:2/1d6 · C:4/2d6 · B:7/3d6 · A:11/5d6 · S:16/8d6).
          Escolha o rank e o PC se preenche sozinho.
        </div>
        <datalist id="tecnicas-do-cla"></datalist>
        <div class="avdf-tecnicas">${cartoes}</div>`;
}

//  Escolheu o rank? O custo em PC vem junto — é tabelado, não é escolha.
function avdfAoTrocarRankTecnica(i) {
  const rk = document.getElementById('t-rank-' + i)?.value;
  const r  = JUTSU_RANKS_AVDF.find(x => x.id === rk);
  const pc = document.getElementById('t-pc-' + i);
  if (r && pc && !pc.dataset.mexido) pc.value = r.pc;
  if (typeof autoSave === 'function') autoSave();
}

//  Digitou o nome de uma técnica do próprio clã? Preenche o resto.
function avdfAoDigitarTecnica(i) {
  const nome = document.getElementById('t-nome-' + i)?.value.trim();
  const c = claAvdf(document.getElementById('f-cla')?.value);
  const t = (c?.tecnicas || []).find(x => x.nome.toLowerCase() === (nome || '').toLowerCase());
  if (t) {
    const set = (campo, v) => { const e = document.getElementById(campo + '-' + i); if (e && v != null) e.value = v; };
    set('t-rank', t.rk);
    set('t-pc', typeof t.pc === 'number' ? t.pc : String(t.pc));
    set('t-acesso', 'Hiden');
    set('t-efeito', t.efeito);
  }
  if (typeof autoSave === 'function') autoSave();
}

//  A lista de sugestões mostra só as técnicas dos estágios já abertos.
//  É a regra do livro: "cada técnica pertence a um Estágio e só fica
//  disponível quando aquele Estágio é destravado."
function avdfAtualizarTecnicasDisponiveis() {
  const dl = document.getElementById('tecnicas-do-cla');
  if (!dl) return;
  const c = claAvdf(document.getElementById('f-cla')?.value);
  const abertos = avdfEstagiosMarcados();
  const lista = (c?.tecnicas || []).filter(t => abertos.includes(t.est));
  dl.innerHTML = lista.map(t =>
    `<option value="${esc(t.nome)}">${t.rk} · ${t.pc} PC</option>`).join('');
}

//  Rola o acerto da técnica: d20 + o atributo que ela usa.
function avdfRolarTecnica(i) {
  const nome  = document.getElementById('t-nome-' + i)?.value.trim() || 'Técnica';
  const atrib = document.getElementById('t-atrib-' + i)?.value;
  const pc    = document.getElementById('t-pc-' + i)?.value;
  if (!atrib || atrib === '—') { toast('Escolha o atributo de acerto desta técnica.', 'err'); return; }
  const mod = modAtrib(document.getElementById('a-' + atrib.toLowerCase())?.value);
  const r = rolarPlano({ dados: [{ faces: 20, qtd: 1 }], bonus: mod });
  mostrarAnimacaoDado(20, r.principal, r.principal === 20, r.principal === 1);
  publicarSala('roll', {
    dado: 20, resultado_dado: r.principal, bonus: mod, total: r.total,
    oculto: typeof rolagemOculta === 'function' ? rolagemOculta() : false,
    sistema: sistemaId(),
    label: `${nome} · ${atrib} ${mod >= 0 ? '+' : '−'}${Math.abs(mod)}${pc ? ' · ' + pc + ' PC' : ''}`,
  });
}
