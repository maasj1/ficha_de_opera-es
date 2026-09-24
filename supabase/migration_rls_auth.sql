-- ============================================================
-- MIGRAÇÃO: autenticação + RLS restrito (dono + gestor)
-- Execute DEPOIS do schema.sql no SQL Editor do Supabase.
-- Pré-requisito no painel: Authentication com login por email/senha
-- e usuários criados em Authentication > Users.
-- ============================================================

-- ---------- PERFIS (papel de cada usuário) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  papel text not null default 'tecnico' check (papel in ('tecnico', 'gestor')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_auth" on public.profiles;
create policy "profiles_select_auth" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.role() = 'authenticated' and id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.role() = 'authenticated' and id = auth.uid())
  with check (auth.role() = 'authenticated' and id = auth.uid());

-- ---------- FUNÇÃO AUXILIAR: é gestor? ----------
create or replace function public.is_gestor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and papel = 'gestor'
  );
$$;

grant execute on function public.is_gestor() to authenticated;

-- ---------- AUTORIA DOS REGISTROS ----------
alter table public.fichas_operacao
  add column if not exists created_by uuid references auth.users (id);
alter table public.inspecoes
  add column if not exists created_by uuid references auth.users (id);

-- ---------- DERRUBA AS POLICIES ABERTAS ----------
drop policy if exists "public_all_fichas" on public.fichas_operacao;
drop policy if exists "public_all_inspecoes" on public.inspecoes;

-- ---------- FICHAS: leitura = logado ----------
drop policy if exists "fichas_select_auth" on public.fichas_operacao;
create policy "fichas_select_auth" on public.fichas_operacao
  for select using (auth.role() = 'authenticated');

-- ---------- FICHAS: inserir = logado (dono = quem cria) ----------
drop policy if exists "fichas_insert_auth" on public.fichas_operacao;
create policy "fichas_insert_auth" on public.fichas_operacao
  for insert with check (auth.role() = 'authenticated' and created_by = auth.uid());

-- ---------- FICHAS: atualizar = dono ou gestor ----------
drop policy if exists "fichas_update_owner" on public.fichas_operacao;
create policy "fichas_update_owner" on public.fichas_operacao
  for update
  using (auth.role() = 'authenticated' and (created_by = auth.uid() or public.is_gestor()))
  with check (auth.role() = 'authenticated' and (created_by = auth.uid() or public.is_gestor()));

-- ---------- FICHAS: excluir = dono ou gestor ----------
drop policy if exists "fichas_delete_owner" on public.fichas_operacao;
create policy "fichas_delete_owner" on public.fichas_operacao
  for delete using (auth.role() = 'authenticated' and (created_by = auth.uid() or public.is_gestor()));

-- ---------- INSPEÇÕES: mesmas regras ----------
drop policy if exists "inspecoes_select_auth" on public.inspecoes;
create policy "inspecoes_select_auth" on public.inspecoes
  for select using (auth.role() = 'authenticated');

drop policy if exists "inspecoes_insert_auth" on public.inspecoes;
create policy "inspecoes_insert_auth" on public.inspecoes
  for insert with check (auth.role() = 'authenticated' and created_by = auth.uid());

drop policy if exists "inspecoes_update_owner" on public.inspecoes;
create policy "inspecoes_update_owner" on public.inspecoes
  for update
  using (auth.role() = 'authenticated' and (created_by = auth.uid() or public.is_gestor()))
  with check (auth.role() = 'authenticated' and (created_by = auth.uid() or public.is_gestor()));

drop policy if exists "inspecoes_delete_owner" on public.inspecoes;
create policy "inspecoes_delete_owner" on public.inspecoes
  for delete using (auth.role() = 'authenticated' and (created_by = auth.uid() or public.is_gestor()));

-- ---------- ÍNDICES ----------
create index if not exists idx_fichas_created_by on public.fichas_operacao (created_by);
create index if not exists idx_inspecoes_created_by on public.inspecoes (created_by);
