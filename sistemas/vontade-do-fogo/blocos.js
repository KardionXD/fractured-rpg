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

//  Rank + Vila + Idade + Naturezas: a faixa de identidade shinobi.
function avdfHtmlRank() {
  //  Genin nasce marcado: é onde uma campanha padrão começa. Estudante
  //  é o prólogo opcional, e deixá-lo como padrão faria toda ficha nova
  //  abrir com −5 de Vida e −4 de Chakra sem ninguém ter escolhido isso.
  const padrao = S().progressao?.padrao || 'genin';
  const ranks = RANKS_AVDF.map(r =>
    `<option value="${r.id}" title="${r.oque}"${r.id === padrao ? ' selected' : ''}>${r.nome}</option>`).join('');
  const nat = NATUREZAS_AVDF.map(n =>
    `<label class="avdf-natureza" style="--cor-nat:${n.cor}">
              <input type="checkbox" id="f-nat-${n.id}" onchange="autoSave()">
              <span>${n.nome} <span style="opacity:.65">(${n.trad})</span></span>
            </label>`).join('\n            ');

  return `<div class="grid-2">
          <div class="field"><label>Rank</label>
            <select id="f-rank" onchange="avdfAoTrocarRank()">${ranks}</select>
            <div id="rank-info" class="profissao-info"></div>
          </div>
          <div style="display:flex;gap:8px">
            <div class="field" style="flex:1"><label>Vila</label>
              <input type="text" id="f-vila" placeholder="Konoha, Suna..." oninput="autoSave()">
            </div>
            <div class="field" style="flex:1"><label>Idade</label>
              <input type="number" id="f-idade" min="0" max="120" placeholder="12" style="text-align:center" oninput="autoSave()">
            </div>
          </div>
        </div>
        <div class="field" style="margin-top:8px"><label>Naturezas de Chakra</label>
          <div class="avdf-naturezas">
            ${nat}
          </div>
        </div>`;
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
  if (typeof autoSave === 'function') autoSave();
}

//  Recalcula Vida, Chakra, Defesa e Resiliência a partir do que está
//  na tela. Chamado quando um atributo ou o rank muda.
function avdfAtualizarDerivados() {
  const attr = { rank: document.getElementById('f-rank')?.value || 'genin' };
  S().atributos.forEach(a => {
    attr[a.id] = parseInt(document.getElementById('a-' + a.id)?.value, 10) || 0;
  });

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
  const opcoes = [{ id: 'comum', nome: 'Ninja Comum (sem clã)' }]
    .concat(CLAS_AVDF.map(c => ({ id: c.id, nome: c.nome + (c.vila ? ' · ' + c.vila : '') })))
    .map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

  return `<div class="grid-2">
          <div class="field"><label>Clã</label>
            <select id="f-cla" onchange="avdfAoTrocarCla()">
              <option value="">Selecionar...</option>
              ${opcoes}
            </select>
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
            if (typeof autoSave === 'function') autoSave(); return; }

  box.style.display = '';
  box.innerHTML = `<div class="avdf-passiva-rot">Passiva — ${esc(c.passiva.nome)}</div>
      <div class="avdf-passiva-txt">${esc(c.passiva.efeito)}</div>`;

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
  if (typeof autoSave === 'function') autoSave();
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
