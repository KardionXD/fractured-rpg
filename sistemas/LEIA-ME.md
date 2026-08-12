# Como adicionar um sistema de RPG novo

Cada sistema é uma pasta aqui dentro. Adicionar um **não exige mexer em
nenhum arquivo do núcleo** — nem em `app.js`, nem em `combate.js`, nem em
`mapa.js`.

## Os quatro passos

**1. Crie a pasta e os três arquivos**

```
sistemas/meu-sistema/
├── conteudo.js   as listas: perícias, classes, magias, o que for
├── regras.js     as fórmulas: modificador, vida máxima, iniciativa
└── sistema.js    a declaração, que chama registrarSistema({...})
```

Copie a **forma** de `sistemas/fractured/` — não o conteúdo.

**2. Ligue no `app.html`**, logo depois do bloco do Fractured:

```html
<script src="sistemas/meu-sistema/conteudo.js?v=1"></script>
<script src="sistemas/meu-sistema/regras.js?v=1"></script>
<script src="sistemas/meu-sistema/sistema.js?v=1"></script>
```

A ordem importa: conteúdo → regras → declaração.

**3. Libere o id no banco.** Em `migracao/001-mesas-sistema.sql` existe uma
trava que só aceita ids conhecidos. Rode no SQL Editor do Supabase:

```sql
alter table public.mesas drop constraint if exists mesas_sistema_valido;
alter table public.mesas add constraint mesas_sistema_valido
  check (sistema in ('fractured', 'vontade-do-fogo', 'ficha-livre', 'meu-sistema'));
```

**4. Pronto.** O sistema aparece na escolha da mesa (quando a fase 7 estiver
feita) e a mesa que escolher ele passa a usar seus atributos, suas fórmulas e
suas rolagens.

## O que o núcleo pergunta ao sistema

| Pergunta do núcleo | Campo na declaração |
|---|---|
| Quais são os atributos e seus limites? | `atributos` |
| Como o valor bruto vira bônus? | `modificador` |
| Quanto é a vida máxima? E o resto? | `derivados` |
| Que recursos o personagem gasta? | `recursos` |
| E o que o grupo compartilha? | `recursosMesa` |
| Como se rola, e o que o resultado significa? | `rolagem` |
| Como se calcula a iniciativa? | `combate.iniciativa` |
| O mapa mede em quê? | `mapa` |
| Que seções a ficha tem? | `ficha.secoes` |

Se o seu sistema tem algo que nenhum outro tem — jutsus, magias, veículos —
declare em `blocos`, com uma função que desenha aquilo. O núcleo reserva o
espaço e não pergunta o que é.

## A regra de ouro

Se você precisou escrever `if (sistema === 'alguma-coisa')` em qualquer
arquivo fora de `/sistemas`, o contrato está faltando alguma coisa.
Acrescente o campo na declaração em vez do `if`.
