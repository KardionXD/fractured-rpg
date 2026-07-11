-- ══════════════════════════════════════════════════
--  MIGRACAO_MESAS.sql — rodar no SQL Editor do Supabase
--  Cria o sistema de mesas separadas + player de música
-- ══════════════════════════════════════════════════

-- 1. TABELA DE MESAS ─────────────────────────────────
create table if not exists mesas (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  codigo     text unique not null,
  master_id  uuid not null references auth.users(id) on delete cascade,
  musica     jsonb,
  created_at timestamptz default now()
);

create table if not exists mesa_membros (
  mesa_id    uuid not null references mesas(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (mesa_id, user_id)
);

-- 2. COLUNA mesa_id NAS TABELAS EXISTENTES ──────────
alter table sala          add column if not exists mesa_id uuid references mesas(id) on delete cascade;
alter table cenas_mapa    add column if not exists mesa_id uuid references mesas(id) on delete cascade;
alter table fichas        add column if not exists mesa_id uuid references mesas(id) on delete cascade;
alter table npcs_mestre   add column if not exists mesa_id uuid references mesas(id) on delete cascade;
alter table notas_sessao  add column if not exists mesa_id uuid references mesas(id) on delete cascade;
alter table mapa_estado   add column if not exists video_url text; -- garante coluna de vídeo

-- mapa_estado e combat_state usam a coluna `id` (text) como chave:
-- cada mesa passa a ter sua própria linha com id = uuid da mesa.
-- Nada a alterar na estrutura delas.

create index if not exists idx_sala_mesa   on sala(mesa_id, created_at desc);
create index if not exists idx_cenas_mesa  on cenas_mapa(mesa_id);
create index if not exists idx_fichas_mesa on fichas(mesa_id, user_id);
create index if not exists idx_npcs_mesa   on npcs_mestre(mesa_id);
create index if not exists idx_notas_mesa  on notas_sessao(mesa_id, user_id);

-- 3. FUNÇÃO AUXILIAR (evita recursão de RLS) ────────
create or replace function is_membro_mesa(m uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from mesa_membros where mesa_id = m and user_id = auth.uid());
$$;

create or replace function is_mestre_mesa(m uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from mesas where id = m and master_id = auth.uid());
$$;

-- 4. RLS DAS NOVAS TABELAS ──────────────────────────
alter table mesas enable row level security;
alter table mesa_membros enable row level security;

drop policy if exists "mesas select" on mesas;
create policy "mesas select" on mesas for select
  using (true);  -- necessário para buscar mesa pelo código de convite

drop policy if exists "mesas insert" on mesas;
create policy "mesas insert" on mesas for insert
  with check (master_id = auth.uid());

drop policy if exists "mesas update" on mesas;
create policy "mesas update" on mesas for update
  using (master_id = auth.uid() or is_membro_mesa(id))  -- membros atualizam só via app (musica)
  with check (true);

drop policy if exists "mesas delete" on mesas;
create policy "mesas delete" on mesas for delete
  using (master_id = auth.uid());

drop policy if exists "membros select" on mesa_membros;
create policy "membros select" on mesa_membros for select
  using (user_id = auth.uid() or is_mestre_mesa(mesa_id) or is_membro_mesa(mesa_id));

drop policy if exists "membros insert" on mesa_membros;
create policy "membros insert" on mesa_membros for insert
  with check (user_id = auth.uid() or is_mestre_mesa(mesa_id));

drop policy if exists "membros delete" on mesa_membros;
create policy "membros delete" on mesa_membros for delete
  using (user_id = auth.uid() or is_mestre_mesa(mesa_id));

-- 5. POLICY DE UPDATE DAS CENAS (corrige o bug do salvar) ──
drop policy if exists "master atualiza suas cenas" on cenas_mapa;
create policy "master atualiza suas cenas" on cenas_mapa for update
  using (master_id = auth.uid())
  with check (master_id = auth.uid());

-- 6. REALTIME ───────────────────────────────────────
-- Garante que as tabelas estão na publicação do realtime
-- (ignora erro se já estiverem)
do $$ begin
  begin alter publication supabase_realtime add table mesas; exception when others then null; end;
  begin alter publication supabase_realtime add table cenas_mapa; exception when others then null; end;
  begin alter publication supabase_realtime add table mapa_estado; exception when others then null; end;
  begin alter publication supabase_realtime add table combat_state; exception when others then null; end;
  begin alter publication supabase_realtime add table sala; exception when others then null; end;
end $$;

-- 7. MIGRAR SEUS DADOS ATUAIS PARA A SUA PRIMEIRA MESA ─────
-- Depois de criar sua mesa pelo site, pegue o id dela:
--   select id, nome, codigo from mesas;
-- E rode (trocando <MESA_ID> pelo uuid):
--
--   update sala         set mesa_id = '<MESA_ID>' where mesa_id is null;
--   update cenas_mapa   set mesa_id = '<MESA_ID>' where mesa_id is null;
--   update fichas       set mesa_id = '<MESA_ID>' where mesa_id is null;
--   update npcs_mestre  set mesa_id = '<MESA_ID>' where mesa_id is null;
--   update notas_sessao set mesa_id = '<MESA_ID>' where mesa_id is null;
--   update mapa_estado  set id = '<MESA_ID>' where id = 'sessao_atual';
--   update combat_state set id = '<MESA_ID>' where id = 'sessao';
--
-- Isso move todo o conteúdo atual (chat, cenas, fichas, mapa, combate)
-- para dentro da sua mesa, sem perder nada.
