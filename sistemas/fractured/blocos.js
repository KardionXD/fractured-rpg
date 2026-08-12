// ══════════════════════════════════════════════════════════════════
//  BLOCOS QUE SÓ O FRACTURED TEM
//
//  O motor da ficha (nucleo/ficha-motor.js) sabe montar identidade,
//  atributos, recursos, perícias e notas — coisas que qualquer sistema
//  de RPG tem. Veículo não é uma delas: é uma regra do Cap. 09 deste
//  livro e de mais nenhum. Então o HTML dele mora aqui, no módulo do
//  sistema, e o motor só reserva o espaço.
//
//  É o mesmo lugar onde, um dia, ficarão os Jutsus e os Clãs de
//  A Vontade do Fogo — cada um na sua pasta.
// ══════════════════════════════════════════════════════════════════

const FRAC_VEICULOS = [
  'Bicicleta', 'Motocicleta', 'Sedan / Utilitário',
  'Caminhonete / Pickup', 'Ônibus / Caminhão', 'Barco a Motor',
];

//  Integridade e Combustível têm exatamente a mesma forma: atual / máximo.
function _fracParVeiculo(rotulo, idA, idM) {
  return `<div class="field" style="flex:1"><label>${rotulo}</label>
              <div style="display:flex;gap:4px;align-items:center">
                <input type="number" id="${idA}" min="0" max="20" placeholder="0" style="text-align:center" oninput="autoSave()">
                <span style="color:var(--muted)">/</span>
                <input type="number" id="${idM}" min="0" max="20" placeholder="0" style="text-align:center" oninput="autoSave()">
              </div>
            </div>`;
}

function fracHtmlVeiculo() {
  const opcoes = FRAC_VEICULOS.map(v => `<option>${v}</option>`).join('');
  return `<div class="grid-2">
          <div class="field"><label>Tipo</label>
            <select id="f-veiculo-tipo" onchange="autoSave()">
              <option value="">Nenhum</option>${opcoes}
            </select>
          </div>
          <div style="display:flex;gap:8px">
            ${_fracParVeiculo('Integridade', 'f-vti-a', 'f-vti-m')}
            ${_fracParVeiculo('Combustível', 'f-vcomb-a', 'f-vcomb-m')}
          </div>
        </div>`;
}
