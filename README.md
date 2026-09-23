# Sistema Portuário — Registro Diário Conjunto (Ficha + Inspeção)

As **3 páginas** do documento oficial formam **um único registro do dia**:
- **Pág. 1:** Ficha de Operações — Porto de Ilhéus
- **Pág. 2–3:** Inspeção das Instalações e Operações Portuárias (24 itens)

O técnico preenche tudo no mesmo dia. O sistema **só salva o conjunto completo** (ficha + inspeção vinculadas pelo mesmo `grupo_id`).

Sem build, sem Node. HTML + CSS + JS + Supabase (via CDN).

## Fluxo

```
index.html     → lista de registros diários (cada linha = ficha + inspeção do dia)
registro.html  → formulário único das 3 páginas (Etapa 0 dia → 1 ficha → 2 inspeção → 3 revisar/salvar)
ficha.html     → edição avulsa só da pág.1 (vinculada ao grupo quando existe)
inspecao.html  → edição avulsa só da pág.2–3 (vinculada ao grupo quando existe)
```

Regras do conjunto:
- Obrigatórios: data do serviço, porto, técnico, fiel, período, ao menos 1 navio, data/hora da inspeção, **os 24 itens**, assinatura do técnico.
- Se houver item **NÃO**, as observações/ações RIP/ROP passam a ser obrigatórias.
- Excluir no dashboard apaga **ficha + inspeção** do dia.

## Como rodar

```powershell
cd sistema
python -m http.server 8080
# abrir http://localhost:8080
```

## Supabase

- Base nova: rode `supabase/schema.sql` no SQL Editor (cria `fichas_operacao` + `inspecoes` com `grupo_id`, `data_servico` e vínculo cruzado).
- Base que já existia: rode `supabase/migration_grupo.sql` (adiciona as colunas e agrupa registros antigos).
- A conexão (URL + key) fica em `js/config.js`, invisível na interface. Para trocar de projeto, edite esse arquivo.

## Estrutura

```
sistema/
  index.html        → dashboard de registros diários conjuntos + busca + stats
  registro.html     → formulário único 3 páginas com validação conjunta + PDF
  ficha.html        → edição avulsa pág.1
  inspecao.html     → edição avulsa pág.2–3
  css/styles.css    → tema claro/escuro + impressão (PDF sempre claro)
  js/config.js      → URL/key padrão do projeto
  js/db.js          → insert/update/list/listBy/get/remove (Supabase ou localStorage)
  js/theme.js       → modo claro/escuro
  js/ui.js          → toasts + skeletons
  supabase/schema.sql       → tabelas + vínculo + RLS + índices
  supabase/migration_grupo.sql → migração para bancos antigos
```

## PDF final

Em `registro.html`, **PDF 3 páginas** imprime ficha + inspeção + revisão. Em `ficha.html`/`inspecao.html`, o PDF é só da página.
