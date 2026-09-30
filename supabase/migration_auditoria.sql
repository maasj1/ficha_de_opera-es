-- ============================================================
-- AUDITORIA: quem alterou e quando (nível de registro)
-- Execute DEPOIS das migrations anteriores no SQL Editor.
--
-- updated_at/updated_by são carimbados por trigger no servidor:
-- o app não precisa (nem consegue) forjar esses valores.
-- ============================================================

alter table public.fichas_operacao
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by uuid references auth.users (id);

alter table public.inspecoes
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by uuid references auth.users (id);

-- Registros antigos: última alteração = criação
update public.fichas_operacao set updated_at = created_at where updated_at is null;
update public.inspecoes set updated_at = created_at where updated_at is null;

create or replace function public.touch_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  return NEW;
end;
$$;

drop trigger if exists trg_touch_fichas on public.fichas_operacao;
create trigger trg_touch_fichas
  before update on public.fichas_operacao
  for each row execute function public.touch_audit();

drop trigger if exists trg_touch_inspecoes on public.inspecoes;
create trigger trg_touch_inspecoes
  before update on public.inspecoes
  for each row execute function public.touch_audit();

create index if not exists idx_fichas_updated on public.fichas_operacao (updated_at desc);
create index if not exists idx_inspecoes_updated on public.inspecoes (updated_at desc);
