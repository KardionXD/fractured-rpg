# Situação com múltipla escolha — e o resto das correções

Este pacote **substitui** o anterior. São os mesmos arquivos de antes, mais
`sala.js`, e com a mudança nova da Situação já incluída.

Copie os 7 arquivos para a raiz do repositório. `conteudo.js` é novo; os outros
seis substituem os atuais. Nenhuma mudança no banco.

    conteudo.js   (NOVO)
    app.js
    app.html
    sala.js
    combate.js
    npcs.js
    style.css

---

## O que mudou agora

### Situação virou múltipla escolha

O `<select>` só deixava aplicar um modificador por vez. Agora é uma lista de
caixinhas: marque tudo que vale na cena e os valores se somam, como o Cap. 02
manda. O botão mostra o resultado direto — *"3 selecionadas — total −2"* — e
tem um "limpar" no topo da lista.

Funciona com toque, então serve no celular igual (o `<select multiple>` do
navegador exigiria Ctrl+clique, que não existe em tela sensível).

As escolhas ficam marcadas entre rolagens, para você não ter que remarcar tudo
a cada teste na mesma cena.

O texto da rolagem no feed passou a listar tudo:

    FOR +2 · Com perícia (+3) · +3 Vínculo Ativo · −3 Tensão da mesa · −2 Escuridão / Névoa · 2 ajudante(s) (+4)

### Dois ajustes que vieram junto

**"Ferido <50%" virou "Ferido (PV<75%)"** — acompanhando a correção que você
fez no livro.

**"Tensão Alta" virou "Tensão da mesa"**, e o valor deixou de ser fixo: ele
segue a faixa atual da trilha da mesa, como manda a Regra Única da Tensão
(Cap. 06). Se a mesa está em PERIGO a linha mostra −2; se sobe para TERROR,
vira −3 sozinha; em CALMA fica ±0. O mestre mexe na trilha e a opção acompanha
em tempo real, sem ninguém precisar lembrar do número.

Se preferir o −2 fixo do quadro do Cap. 02, é uma linha em `conteudo.js`: apague
o `dyn: 'tensao'` da entrada.

### Um aviso

"Aliado Ajuda" (+2) e o contador de "Ajudantes" (+2 cada) são a mesma regra
escrita em dois lugares da interface. Com uma seleção só isso não incomodava;
marcando várias, dá para contar o mesmo aliado duas vezes sem perceber. Não
mexi porque não sei qual dos dois você quer manter — me diga e eu tiro um.

---

## O que já estava no pacote anterior

Erros de regra corrigidos: faixas da Tensão (0–2 / 3–5 / 6–8 / 9–10) e as
penalidades reais (−1 / −2 / −3 em todo teste); Suprimentos como recurso do
grupo, sincronizado; rótulos das perícias; condições de combate do Cap. 07.

Bugs: iniciativa de inimigo e NPC usando o modificador (era o valor bruto);
turno e dano sincronizando com os jogadores.

Conteúdo: `conteudo.js` com as 24 profissões e as 67 perícias, ligadas ao select
de profissão e ao autocomplete das perícias.
