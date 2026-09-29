-- ============================================================
-- EVIDÊNCIAS (fotos) + ASSINATURAS digitais
-- Execute DEPOIS das migrations anteriores no SQL Editor.
--
-- Fotos: bucket `evidencias` público para leitura (miniaturas no
-- formulário, relatório e PDF), escrita só para logados.
-- Referências ficam no JSONB: inspecoes.itens[].fotos = [paths].
-- Assinaturas: coluna inspecoes.assinaturas =
--   { tecnico: {nome, email, user_id, data_hora}, chefe: {...}, gerente: {...} }
-- ============================================================

-- ---------- BUCKET ----------
insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do update set public = true;

-- ---------- COLUNA ASSINATURAS ----------
alter table public.inspecoes
  add column if not exists assinaturas jsonb default '{}'::jsonb;

-- ---------- STORAGE: upload só logado ----------
drop policy if exists "evidencias_insert_auth" on storage.objects;
create policy "evidencias_insert_auth" on storage.objects
  for insert with check (bucket_id = 'evidencias' and auth.role() = 'authenticated');

-- ---------- STORAGE: leitura pública (thumbs, PDF, relatório) ----------
drop policy if exists "evidencias_select_public" on storage.objects;
create policy "evidencias_select_public" on storage.objects
  for select using (bucket_id = 'evidencias');

-- ---------- STORAGE: remover = dono ou gestor ----------
drop policy if exists "evidencias_delete_owner" on storage.objects;
create policy "evidencias_delete_owner" on storage.objects
  for delete using (
    bucket_id = 'evidencias'
    and (owner = auth.uid() or public.is_gestor())
  );
