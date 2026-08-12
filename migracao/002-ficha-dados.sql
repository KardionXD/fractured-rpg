-- ═══════════════════════════════════════════════════════════════════
--  MIGRAÇÃO 002 — a ficha ganha um formato que serve a qualquer sistema
--
--  COMO RODAR
--  Supabase → SQL Editor → New query → cole isto → Run.
--
--  É SEGURO? Sim, e é seguro rodar duas vezes.
--  · Só ADICIONA colunas. Nenhuma coluna é apagada ou alterada.
--  · As 22 colunas do Fractured continuam existindo e sendo gravadas.
--  · Ficha antiga continua abrindo normalmente: o site lê das colunas
--    de sempre e preenche a coluna nova sozinho, no primeiro acesso.
--
--  POR QUE ISTO EXISTE
--  `fichas` tem attr_for, pv_atual, veiculo_comb_max, trauma… — colunas
--  que só fazem sentido no Fractured. Uma ficha com chakra, rank e
--  jutsus não tem onde se encaixar ali. A coluna `dados` é livre: cada
--  sistema guarda o que precisa, no formato que precisa.
--
--  NADA É REMOVIDO AGORA. Enquanto as duas formas convivem, dá para
--  voltar o código a qualquer momento sem perder um personagem.
-- ═══════════════════════════════════════════════════════════════════

-- ── A ficha ────────────────────────────────────────────────────────
alter table public.fichas
  add column if not exists dados jsonb not null default '{}'::jsonb;

comment on column public.fichas.dados is
  'Ficha no formato livre, independente de sistema. Preenchida em paralelo às colunas antigas durante a migração. Ver sistemas/<id>/persistencia.js.';

-- ── Os NPCs do mestre ──────────────────────────────────────────────
alter table public.npcs_mestre
  add column if not exists dados jsonb not null default '{}'::jsonb;

comment on column public.npcs_mestre.dados is
  'Mesmo formato livre da ficha, para o NPC.';

-- ── Busca dentro do jsonb ──────────────────────────────────────────
-- Ainda não é usada, mas custa quase nada e evita ter que voltar aqui
-- quando alguém quiser filtrar ficha por sistema ou por atributo.
create index if not exists fichas_dados_gin       on public.fichas       using gin (dados);
create index if not exists npcs_mestre_dados_gin  on public.npcs_mestre  using gin (dados);

-- ── Conferência ────────────────────────────────────────────────────
-- Antes de abrir o site: "migradas" vem 0 — é o esperado.
-- Depois de cada jogador abrir a ficha uma vez, o número sobe sozinho.
select
  count(*)                                          as fichas_no_total,
  count(*) filter (where dados ? 'v')                as migradas,
  count(*) filter (where not (dados ? 'v'))          as ainda_no_formato_antigo
from public.fichas;
