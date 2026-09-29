# Sistema Portuário — Registro Diário Conjunto (Ficha + Inspeção)

## Objetivo

Facilitar a alimentação de dados e substituir a folha de papel: digitalizar a Ficha de Operações e a Inspeção do Porto de Ilhéus em um único registro diário, preenchido pelo técnico no sistema em vez de no papel.

As **3 páginas** do documento oficial formam **um único registro do dia**:
- **Pág. 1:** Ficha de Operações — Porto de Ilhéus
- **Pág. 2–3:** Inspeção das Instalações e Operações Portuárias (24 itens)

O técnico preenche tudo no mesmo dia. Ficha + inspeção ficam vinculadas pelo mesmo `grupo_id`; campos vazios são permitidos e o registro pode ser completado depois.

Sem build, sem Node. HTML + CSS + JS + Supabase (via CDN).

## Fluxo

```
index.html     → lista de registros diários (cada linha = ficha + inspeção do dia)
registro.html  → formulário único das 3 páginas (Etapa 0 dia → 1 ficha → 2 inspeção → 3 revisar/salvar)
ficha.html     → edição avulsa só da pág.1 (vinculada ao grupo quando existe)
inspecao.html  → edição avulsa só da pág.2–3 (vinculada ao grupo quando existe)
```

Regras do conjunto:
- **Nenhum campo é obrigatório** — dá para salvar parcial e completar depois.
- A Revisão mostra o que está preenchido ou pendente, sem bloquear.
- Excluir no dashboard apaga **ficha + inspeção** do dia (só dono ou gestor vê o botão).

## Acesso (login obrigatório)

- Entrada por `login.html` (email + senha). Sem sessão, nenhuma página abre.
- Usuários criados manualmente em **Authentication > Users** no painel do Supabase.
- Papel de cada um em `profiles`: `tecnico` (padrão) ou `gestor` (exclui/edita tudo).
- No painel, em **Authentication > Configuration**: desligue "Confirm email" (uso interno) e cadastre `https://maasj1.github.io/ficha_de_opera-es/` em Site URL + Redirect Allow List.

## Perfis: função, setor e preenchimento automático

- `profiles` tem `funcao` (tecnico | fiel | chefe | gerente | outro) e `setor` (texto livre).
- No **primeiro login**, o técnico cai em `perfil.html` e preenche nome, função e setor sozinho.
- Tela `usuarios.html` (só gestor, com modo bootstrap para o 1º gestor): corrige dados e permissões.
- Ao abrir um novo registro, os campos são preenchidos com o nome do logado conforme a função: técnico → campos de técnico; fiel → campo de fiel; chefe/gerente → assinaturas.
- Fluxo: gestor cria o acesso → técnico entra e completa o perfil → (opcional) gestor ajusta em Usuários.

## Como rodar

```powershell
cd sistema
python -m http.server 8080
# abrir http://localhost:8080
```

## Supabase

- Base nova: rode `supabase/schema.sql` no SQL Editor (cria `fichas_operacao` + `inspecoes` com `grupo_id`, `data_servico` e vínculo cruzado).
- Base que já existia: rode `supabase/migration_grupo.sql` (adiciona as colunas e agrupa registros antigos).
- Depois: rode `supabase/migration_rls_auth.sql` (perfis, `created_by` e RLS restrito: leitura = logado, escrita = dono ou gestor).
- Depois: rode `supabase/migration_profiles_funcao.sql` (funcao/setor + gestão de perfis).
- Depois: rode `supabase/migration_profiles_hardening.sql` (trava permissão: ninguém vira gestor sozinho; libera o 1º gestor).
- A conexão (URL + key) fica em `js/config.js`, invisível na interface. Para trocar de projeto, edite esse arquivo.

## Estrutura

```
sistema/
  index.html        → dashboard de registros diários conjuntos + busca + stats
  registro.html     → wizard 4 etapas + PDF (campos opcionais, autofill por função)
  relatorios.html   → KPIs, gráficos, ranking de NÃO e exportação CSV
  login.html        → entrada por email/senha (erros amigáveis, garante perfil)
  perfil.html       → completar cadastro (nome, função, setor)
  usuarios.html     → gestão de perfis (só gestor, com bootstrap do 1º)
  ficha.html        → edição avulsa pág.1
  inspecao.html     → edição avulsa pág.2–3
  css/styles.css    → tema claro/escuro + impressão (PDF sempre claro)
  js/config.js      → URL/key do projeto (fixa, invisível na UI)
  js/db.js          → insert/update/list/listBy/get/remove (Supabase ou localStorage)
  js/auth.js        → sessão, guarda de rotas, usuário logado, gestor
  js/itens.js       → texto oficial dos 24 itens + rótulos curtos (fonte única)
  js/storage.js     → fotos: compactação + upload/remoção no bucket `evidencias`
  js/theme.js       → modo claro/escuro
  js/ui.js          → toasts + skeletons
  supabase/schema.sql       → tabelas + vínculo + RLS + índices
  supabase/migration_grupo.sql → migração para bancos antigos
  supabase/migration_rls_auth.sql → perfis + created_by + RLS dono/gestor
  supabase/migration_profiles_funcao.sql → funcao/setor + gestão de perfis
  supabase/migration_profiles_hardening.sql → trava escalação a gestor + bootstrap
  supabase/migration_evidencias_assinaturas.sql → bucket `evidencias` + coluna `assinaturas`
```

> CSS e JS têm versão (`?v=4`): ao mudar visual ou scripts, suba o número nos `<link>`/`<script>` das páginas para furar o cache.

## PDF final

Em `registro.html`, **PDF 3 páginas** imprime ficha + inspeção + revisão. Em `ficha.html`/`inspecao.html`, o PDF é só da página.

## Relatórios gerenciais

`relatorios.html` (qualquer logado): filtros por período/porto/busca, KPIs (registros, % completos, NÃO, conformidade), gráficos (NÃO por item, SIM/NÃO/N/A, NÃO por dia), ranking dos 24 itens e **exportação CSV** (separador `;`, abre direto no Excel; inclui links das fotos). Gráficos via Chart.js (CDN).

## Evidências e assinaturas digitais

- **Fotos por item** (etapa Inspeção, até 3 por item): câmera do celular ou upload, compactadas no envio, salvas no bucket `evidencias` (`grupo/itemN_timestamp.jpg`), referenciadas em `inspecoes.itens[].fotos`. Saem no PDF e no CSV.
- **Assinatura digital sem caneta**: cada responsável assina com a própria conta — grava nome, email, `user_id`, data e hora em `inspecoes.assinaturas`, com compatibilidade nos campos `*_nome/*_data`. Rode `supabase/migration_evidencias_assinaturas.sql`.
