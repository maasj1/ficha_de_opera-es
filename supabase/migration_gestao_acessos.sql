-- ============================================================
-- GESTÃO DE ACESSOS: ativar/desativar usuários + trocar/recuperar senha
-- Execute DEPOIS das migrations anteriores no SQL Editor.
--
-- profiles.ativo: false = acesso cortado (UI e API).
-- A senha em si fica no Supabase Auth (troca/recuperação via app).
-- ============================================================

alter table public.profiles
  add column if not exists ativo boolean default true;
update public.profiles set ativo = true where ativo is null;
alter table public.profiles alter column ativo set default true;
alter table public.profiles alter column ativo set not null;

-- ---------- Helper: usuário está ativo? ----------
create or replace function public.is_ativo()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select ativo from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_ativo() to authenticated;

-- ---------- FICHAS: exige ativo em tudo ----------
drop policy if exists "fichas_select_auth" on public.fichas_operacao;
create policy "fichas_select_auth" on public.fichas_operacao
  for select using (auth.role() = 'authenticated' and public.is_ativo());

drop policy if exists "fichas_insert_auth" on public.fichas_operacao;
create policy "fichas_insert_auth" on public.fichas_operacao
  for insert with check (auth.role() = 'authenticated' and public.is_ativo() and created_by = auth.uid());

drop policy if exists "fichas_update_owner" on public.fichas_operacao;
create policy "fichas_update_owner" on public.fichas_operacao
  for update
  using (auth.role() = 'authenticated' and public.is_ativo() and (created_by = auth.uid() or public.is_gestor()))
  with check (auth.role() = 'authenticated' and public.is_ativo() and (created_by = auth.uid() or public.is_gestor()));

drop policy if exists "fichas_delete_owner" on public.fichas_operacao;
create policy "fichas_delete_owner" on public.fichas_operacao
  for delete using (auth.role() = 'authenticated' and public.is_ativo() and (created_by = auth.uid() or public.is_gestor()));

-- ---------- INSPEÇÕES: exige ativo em tudo ----------
drop policy if exists "inspecoes_select_auth" on public.inspecoes;
create policy "inspecoes_select_auth" on public.inspecoes
  for select using (auth.role() = 'authenticated' and public.is_ativo());

drop policy if exists "inspecoes_insert_auth" on public.inspecoes;
create policy "inspecoes_insert_auth" on public.inspecoes
  for insert with check (auth.role() = 'authenticated' and public.is_ativo() and created_by = auth.uid());

drop policy if exists "inspecoes_update_owner" on public.inspecoes;
create policy "inspecoes_update_owner" on public.inspecoes
  for update
  using (auth.role() = 'authenticated' and public.is_ativo() and (created_by = auth.uid() or public.is_gestor()))
  with check (auth.role() = 'authenticated' and public.is_ativo() and (created_by = auth.uid() or public.is_gestor()));

drop policy if exists "inspecoes_delete_owner" on public.inspecoes;
create policy "inspecoes_delete_owner" on public.inspecoes
  for delete using (auth.role() = 'authenticated' and public.is_ativo() and (created_by = auth.uid() or public.is_gestor()));

-- ---------- PROFILES: escrita exige ativo (leitura segue aberta a logados) ----------
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.role() = 'authenticated' and public.is_ativo() and id = auth.uid())
  with check (auth.role() = 'authenticated' and public.is_ativo() and id = auth.uid());

drop policy if exists "profiles_update_gestor" on public.profiles;
create policy "profiles_update_gestor" on public.profiles
  for update using (public.is_gestor() and public.is_ativo())
  with check (public.is_gestor() and public.is_ativo());

-- ---------- STORAGE: upload/remoção exigem ativo ----------
drop policy if exists "evidencias_insert_auth" on storage.objects;
create policy "evidencias_insert_auth" on storage.objects
  for insert with check (bucket_id = 'evidencias' and auth.role() = 'authenticated' and public.is_ativo());

drop policy if exists "evidencias_delete_owner" on storage.objects;
create policy "evidencias_delete_owner" on storage.objects
  for delete using (
    bucket_id = 'evidencias'
    and public.is_ativo()
    and (owner = auth.uid() or public.is_gestor())
  );

-- ---------- TRIGGER: papel E ativo só mudam por gestor ----------
create or replace function public.protect_profiles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_gestor boolean;
begin
  -- INSERT feito pelo próprio usuário nasce sempre como tecnico ativo
  if TG_OP = 'INSERT' then
    if NEW.id = auth.uid() and not public.is_gestor() then
      NEW.papel := 'tecnico';
      NEW.ativo := true;
    end if;
    return NEW;
  end if;

  -- UPDATE de papel: só gestor (ou bootstrap do 1º)
  if TG_OP = 'UPDATE' and NEW.papel is distinct from OLD.papel then
    if public.is_gestor() then
      return NEW;
    end if;
    select exists (select 1 from public.profiles where papel = 'gestor') into has_gestor;
    if NEW.papel = 'gestor' and not has_gestor then
      return NEW; -- bootstrap: permite o primeiro gestor
    end if;
    raise exception 'Apenas o gestor pode alterar permissões.';
  end if;

  -- UPDATE de ativo: só gestor (sem bootstrap)
  if TG_OP = 'UPDATE' and NEW.ativo is distinct from OLD.ativo and not public.is_gestor() then
    raise exception 'Apenas o gestor pode ativar/desativar usuários.';
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_protect_profiles on public.profiles;
create trigger trg_protect_profiles
  before insert or update on public.profiles
  for each row execute function public.protect_profiles();
