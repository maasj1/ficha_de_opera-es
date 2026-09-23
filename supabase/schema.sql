-- ============================================================
-- SISTEMA FICHA DE OPERAÇÕES PORTUÁRIAS
-- Execute este SQL no Supabase: Dashboard > SQL Editor > New Query
-- ============================================================

-- ---------- TABELA 1: FICHAS DE OPERAÇÃO (Pág. 1 do PDF) ----------
create table if not exists public.fichas_operacao (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- Vínculo do registro diário conjunto (ficha pág.1 + inspeção pág.2-3)
  grupo_id uuid,
  data_servico date,
  inspecao_id uuid,

  tecnico_operacoes text,
  fiel_armazem text,
  periodo_inicio date,
  periodo_fim date,

  -- BERÇO 01
  berco01_nome text,
  berco01_carga text,
  berco01_movimento text,          -- 'ATRACOU' | 'DESATRACOU'
  berco01_hora time,
  berco01_operacao text,           -- 'CARREGOU' | 'DESCARREGOU'
  berco01_toneladas numeric,
  berco01_ate date,
  berco01_agencia text,
  berco01_operador text,

  -- BERÇO 02
  berco02_nome text,
  berco02_carga text,
  berco02_movimento text,
  berco02_hora time,
  berco02_operacao text,
  berco02_toneladas numeric,
  berco02_ate date,
  berco02_agencia text,
  berco02_operador text,

  -- CARGAS (6 locais fixos do formulário, guardados como JSON)
  -- [{local, carga, quant_existente, quant_data, direcao:'ENTROU'|'SAIU', movimentado, hora}]
  cargas jsonb default '[]'::jsonb,

  observacoes_gpi text,
  observacoes_tecnico text,
  observacoes_fiel text
);

-- ---------- TABELA 2: INSPEÇÕES (Pág. 2 e 3 do PDF) ----------
create table if not exists public.inspecoes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- Vínculo do registro diário conjunto
  grupo_id uuid,
  data_servico date,
  ficha_id uuid,

  porto text,                       -- 'SALVADOR' | 'ARATU' | 'ILHEUS'
  data_inspecao date,
  hora_operacoes time,
  navios_atracados text,
  principais_operacoes text,

  -- Itens 1..24 do checklist: [{numero:int, resposta:'SIM'|'NAO'|'N/A'}]
  itens jsonb default '[]'::jsonb,

  observacoes_acoes text,

  tecnico_nome text,
  tecnico_data date,
  chefe_nome text,
  chefe_data date,
  gerente_nome text,
  gerente_data date
);

-- ---------- COLUNAS DO VÍNCULO (idempotente: funciona em base nova ou antiga) ----------
-- Se as tabelas já existiam (criadas antes do registro diário conjunto),
-- o CREATE TABLE acima não faz nada; estes ALTERs adicionam as colunas que faltam.
alter table public.fichas_operacao
  add column if not exists grupo_id uuid,
  add column if not exists data_servico date,
  add column if not exists inspecao_id uuid;

alter table public.inspecoes
  add column if not exists grupo_id uuid,
  add column if not exists data_servico date,
  add column if not exists ficha_id uuid;

-- ---------- RLS: liberar acesso (sistema interno) ----------
alter table public.fichas_operacao enable row level security;
alter table public.inspecoes enable row level security;

drop policy if exists "public_all_fichas" on public.fichas_operacao;
create policy "public_all_fichas" on public.fichas_operacao
  for all using (true) with check (true);

drop policy if exists "public_all_inspecoes" on public.inspecoes;
create policy "public_all_inspecoes" on public.inspecoes
  for all using (true) with check (true);

-- ---------- ÍNDICES ----------
create index if not exists idx_fichas_created on public.fichas_operacao (created_at desc);
create index if not exists idx_inspecoes_created on public.inspecoes (created_at desc);
create index if not exists idx_fichas_grupo on public.fichas_operacao (grupo_id);
create index if not exists idx_inspecoes_grupo on public.inspecoes (grupo_id);
