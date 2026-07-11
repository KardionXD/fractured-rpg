# FRACTURED VTT — Mesas Separadas + Música do YouTube

## O que mudou

**Sistema de Mesas** — agora o site suporta várias campanhas ao mesmo tempo:
- Qualquer usuário pode **criar uma mesa** (vira o mestre dela automaticamente)
- Cada mesa tem um **código de convite** de 6 letras (ex: `X7K2PA`) — o mestre clica no nome da mesa na topbar para copiar
- Players entram digitando o código na tela de seleção
- **Tudo é isolado por mesa**: mapa, fog, cenas, combate, chat/feed, galeria, fichas, NPCs e notas
- Ser "mestre" agora é **por mesa**: você pode ser mestre na sua e player na de outra pessoa
- Botão ⇄ na topbar para trocar de mesa

**Música via YouTube** — botão flutuante 🎵 no canto inferior esquerdo:
- Mestre cola o link do YouTube → ▶ Tocar → toca para **todos os players em tempo real**
- Controles: pausar, retomar, parar, volume e loop
- Quem entra no meio da música é sincronizado automaticamente no ponto certo
- Players veem um botão **"🔊 Ativar som da mesa"** na primeira vez — é obrigatório pelo navegador (política de autoplay), 1 clique e pronto
- Obs: alguns vídeos com restrição de embed não tocam fora do YouTube — se der erro, é só usar outro upload da mesma música

## Instalação (nessa ordem!)

**1. Rode o `MIGRACAO_MESAS.sql`** no Supabase → SQL Editor (o arquivo está na raiz do projeto). Ele cria as tabelas `mesas` e `mesa_membros`, adiciona `mesa_id` nas tabelas existentes, e configura as permissões.

**2. Suba o código** (git add/commit/push → Vercel).

**3. Entre no site** → vai aparecer a tela "Escolha sua mesa" → crie a sua mesa.

**4. Migre seus dados atuais para dentro dela** (para não perder o mapa, fichas, chat e cenas que já existem): pegue o id da mesa com `select id, nome from mesas;` e rode o bloco de UPDATEs que está comentado no final do `MIGRACAO_MESAS.sql`.

**5. Mande o código de convite** pros seus players (clique no nome da mesa na topbar = copia o código). Eles entram com o código e as fichas deles ficam vinculadas à mesa.

O outro mestre só precisa criar a mesa dele no passo 3 e mandar o código pros players dele. Zero interferência entre as campanhas — canais realtime, fog, dados, tudo separado.

## Arquivos novos
- `mesas.js` — tela de seleção, criação, código de convite, contexto MESA
- `musica.js` — player de YouTube sincronizado
- `MIGRACAO_MESAS.sql` — migração do banco

## Arquivos alterados
- `app.js` — init escolhe mesa antes de tudo; isMaster por mesa; feed/fichas/notas filtrados
- `mapa.js` — `mapa_estado` com uma linha por mesa (id = uuid da mesa); realtime filtrado
- `combate.js` — `combat_state` por mesa; lista de players = membros da mesa
- `npcs.js` — cenas e NPCs por mesa
- `fog.js` — canal de fog por mesa (`fog-live-{mesa}`)
- `sala.js` — chat e galeria por mesa
- `app.html` — scripts novos + cache bump v=9
