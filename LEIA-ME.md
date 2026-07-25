# Ficha: Veículo nos temas + selo SOBREVIVENTE

Este pacote **substitui** o anterior. Mesmos 7 arquivos, com as duas correções
novas já incluídas.

Copie tudo para a raiz do repositório. `conteudo.js` é novo; os outros seis
substituem os atuais. Nenhuma mudança no banco.

---

## O que mudou agora

### A seção Veículo voltou nas fichas dourada e verde

A seção sempre existiu no HTML — os dois temas é que a escondiam com
`display: none` (junto com a de Notas). Tirei o `display: none` do Veículo e
estilizei os campos no visual de cada tema: fundo, borda e raio da dourada;
fundo, borda e a fonte monoespaçada da verde.

O layout é o do seu mockup — **Tipo** à esquerda, **Integridade** e
**Combustível** à direita, cada um com atual / máximo. No celular tudo empilha
e os dois pares de números ficam lado a lado.

A ficha padrão não foi afetada: nela o Veículo nunca esteve escondido.

**Observação:** a seção de **Notas** continua escondida nos dois temas, pelo
mesmo `display: none`. Você não pediu, então não mexi — se quiser ela de volta
também, é uma linha.

### O selo SOBREVIVENTE agora fica acima da foto

Era um problema de empilhamento. O selo era um `::after` do
`.ficha-avatar-shape` (a moldura), e a foto é um elemento irmão que vem depois
no HTML. Como moldura e foto têm `transform`, cada uma cria o próprio contexto
de empilhamento — e aí `z-index` dentro de uma não vence a outra: a foto, por
vir depois, era sempre pintada por cima e cobria metade do selo.

Passei o selo para o `::after` do `.ficha-avatar-frame`, que é o pai comum e
não tem `transform`. Sendo o último a ser pintado, ele fica acima da foto
sempre. Conferi no desktop e no celular: aparece inteiro, sobre a borda da
moldura, como no seu mockup.

---

## O que já estava nos pacotes anteriores

**Situação com múltipla escolha** — lista de caixinhas que somam, com a Tensão
acompanhando a faixa atual da mesa.

**Erros de regra** — faixas da Tensão (0–2 / 3–5 / 6–8 / 9–10) e as penalidades
reais (−1 / −2 / −3 em todo teste); Suprimentos como recurso do grupo,
sincronizado; rótulos das perícias; condições de combate do Cap. 07.

**Bugs** — iniciativa de inimigo e NPC usando o modificador (era o valor bruto);
turno e dano sincronizando com os jogadores.

**Conteúdo** — `conteudo.js` com as 24 profissões e as 67 perícias, ligadas ao
select de profissão e ao autocomplete das perícias.
