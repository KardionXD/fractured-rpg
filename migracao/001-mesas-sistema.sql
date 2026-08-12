-- ═══════════════════════════════════════════════════════════════════
--  MIGRAÇÃO 001 — a mesa passa a saber qual sistema usa
--
--  COMO RODAR
--  1. Abra o painel do Supabase do projeto.
--  2. Menu lateral → SQL Editor → New query.
--  3. Cole tudo isto e clique em Run.
--
--  É SEGURO RODAR? Sim, e é seguro rodar duas vezes.
--  · Só ADICIONA uma coluna. Nada é apagado, nada é alterado.
--  · Toda mesa que já existe recebe 'fractured', que é o que elas são.
--  · O site funciona igual ANTES e DEPOIS: enquanto nada lê a coluna,
--    ela é só um campo a mais.
--
--  E SE EU NÃO RODAR AGORA? Também funciona. O código trata a coluna
--  ausente como 'fractured'. Rode quando for criar a primeira mesa de
--  outro sistema.
-- ═══════════════════════════════════════════════════════════════════

-- ── A coluna ───────────────────────────────────────────────────────
alter table public.mesas
  add column if not exists sistema text not null default 'fractured';

-- ── Garantia para as mesas antigas ─────────────────────────────────
-- O default acima só vale para linha nova. Esta linha cuida das que já
-- existem (e de qualquer uma que tenha ficado com o campo vazio).
update public.mesas
   set sistema = 'fractured'
 where sistema is null or sistema = '';

-- ── Trava contra erro de digitação ─────────────────────────────────
-- Impede que uma mesa nasça com um sistema que o site não conhece.
-- Ao adicionar o terceiro sistema, acrescente o id dele aqui.
alter table public.mesas
  drop constraint if exists mesas_sistema_valido;

alter table public.mesas
  add constraint mesas_sistema_valido
  check (sistema in ('fractured', 'vontade-do-fogo', 'ficha-livre'));

-- ── Busca por sistema ──────────────────────────────────────────────
-- Barato agora, útil quando houver muitas mesas.
create index if not exists mesas_sistema_idx on public.mesas (sistema);

-- ── Conferência ────────────────────────────────────────────────────
-- Deve devolver uma linha só: fractured, com o total de mesas.
select sistema, count(*) as mesas
  from public.mesas
 group by sistema
 order by mesas desc;
