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

//  Técnicas conhecidas: por enquanto, uma lista livre. Na fase 9 vira
//  o catálogo com rank, custo em PC, selos, alcance e acesso.
function avdfHtmlTecnicas() {
  return `<div style="font-size:10px;color:var(--muted);margin-bottom:8px">
          Nome · rank · custo em PC. O catálogo completo entra depois; por enquanto, escreva o que a mesa combinou.
        </div>
        <textarea id="f-tecnicas" rows="5" class="textarea-bare" oninput="autoSave()"
          placeholder="Katon: Gōkakyū no Jutsu — C — 4 PC — 2d6 de fogo em cone na zona Curta&#10;Kawarimi — D — 2 PC — anula um golpe, 2×/combate"></textarea>`;
}

//  Passivas de clã e talentos — também texto livre até a fase 9.
function avdfHtmlCla() {
  return `<div class="grid-2">
          <div class="field"><label>Clã</label>
            <input type="text" id="f-cla" placeholder="Uchiha, Hyūga, Nara... (ou Ninja Comum)" oninput="autoSave()">
          </div>
          <div class="field"><label>Estágio desbloqueado</label>
            <select id="f-cla-estagio" onchange="autoSave()">
              <option value="1">Estágio I — o rito de infância (grátis)</option>
              <option value="2">Estágio II</option>
              <option value="3">Estágio III</option>
              <option value="4">Estágio IV</option>
              <option value="5">Estágio V</option>
            </select>
          </div>
        </div>
        <div class="field" style="margin-top:8px"><label>Passivas e talentos</label>
          <textarea id="f-passivas" rows="3" class="textarea-bare" oninput="autoSave()"
            placeholder="A passiva do clã está sempre ativa — escreva aqui para não ter que consultar o livro no meio da cena."></textarea>
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
