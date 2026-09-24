-- ============================================================
-- HARDENING de perfis: ninguém vira gestor sozinho
-- Execute DEPOIS do migration_profiles_funcao.sql no SQL Editor.
--
-- Problema que isto fecha: as policies "own" permitiriam a um
-- técnico mal-intencionado gravar papel='gestor' na própria linha
-- via API direta. O trigger abaixo impede, com uma exceção:
-- bootstrap do PRIMEIRO gestor (quando ainda não existe nenhum).
-- ============================================================

create or replace function public.protect_profiles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_gestor boolean;
begin
  -- INSERT feito pelo próprio usuário nasce sempre como tecnico
  if TG_OP = 'INSERT' then
    if NEW.id = auth.uid() and not public.is_gestor() then
      NEW.papel := 'tecnico';
    end if;
    return NEW;
  end if;

  -- UPDATE: troca de papel só por gestor (ou bootstrap do 1º)
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

  return NEW;
end;
$$;

drop trigger if exists trg_protect_profiles on public.profiles;
create trigger trg_protect_profiles
  before insert or update on public.profiles
  for each row execute function public.protect_profiles();
