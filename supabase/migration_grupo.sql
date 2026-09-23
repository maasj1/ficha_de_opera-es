-- ============================================================
-- MIGRAÇÃO: registro diário conjunto (ficha + inspeção ligadas)
-- Execute no SQL Editor do Supabase (vale p/ base nova ou existente)
-- A ficha (pág.1) e a inspeção (pág.2-3) passam a compartilhar o
-- mesmo grupo_id: um turno/dia só existe se os DOIS existirem.
-- ============================================================

alter table public.fichas_operacao
  add column if not exists grupo_id uuid,
  add column if not exists data_servico date,
  add column if not exists inspecao_id uuid;

alter table public.inspecoes
  add column if not exists grupo_id uuid,
  add column if not exists data_servico date,
  add column if not exists ficha_id uuid;

create index if not exists idx_fichas_grupo on public.fichas_operacao (grupo_id);
create index if not exists idx_inspecoes_grupo on public.inspecoes (grupo_id);
create index if not exists idx_fichas_data_servico on public.fichas_operacao (data_servico desc);
create index if not exists idx_inspecoes_data_servico on public.inspecoes (data_servico desc);

-- Retrocompatibilidade: registros antigos avulsos ganham um grupo próprio
update public.fichas_operacao
  set grupo_id = coalesce(grupo_id, gen_random_uuid()),
      data_servico = coalesce(data_servico, periodo_inicio, created_at::date)
  where grupo_id is null;

update public.inspecoes
  set grupo_id = coalesce(grupo_id, gen_random_uuid()),
      data_servico = coalesce(data_servico, data_inspecao, created_at::date)
  where grupo_id is null;
