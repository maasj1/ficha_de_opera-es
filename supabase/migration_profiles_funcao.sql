-- ============================================================
-- MIGRAÇÃO: função e setor no perfil + gestão de perfis
-- Execute DEPOIS do migration_rls_auth.sql no SQL Editor.
-- funcao: papel operacional (preenchimento automático dos campos)
--   'tecnico'  -> Técnico de Operações  (campos técnico)
--   'fiel'     -> Fiel de Armazém       (campo fiel)
--   'chefe'    -> Chefe de Área         (assinatura chefe)
--   'gerente'  -> Gerente do Porto      (assinatura gerente)
--   'outro'    -> Outra função (sem preenchimento automático)
-- setor: texto livre (ex.: Operações, Armazém, GPI)
-- papel (tecnico|gestor) continua controlando as permissões.
-- ============================================================

alter table public.profiles
  add column if not exists funcao text check (funcao is null or funcao in ('tecnico', 'fiel', 'chefe', 'gerente', 'outro')),
  add column if not exists setor text;

-- Gestor pode editar o perfil de qualquer usuário (tela Usuários)
drop policy if exists "profiles_update_gestor" on public.profiles;
create policy "profiles_update_gestor" on public.profiles
  for update using (public.is_gestor())
  with check (public.is_gestor());
