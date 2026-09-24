# Sistema Portuário — Registro Diário Conjunto (Ficha + Inspeção)

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
- Tela `usuarios.html` (só gestor): define nome, função, setor e permissão de cada técnico.
- Ao abrir um novo registro, os campos são preenchidos com o nome do logado conforme a função: técnico → campos de técnico; fiel → campo de fiel; chefe/gerente → assinaturas.
- Fluxo: gestor cria o acesso → técnico entra uma vez (perfil aparece em Usuários) → gestor define função e setor.

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
- A conexão (URL + key) fica em `js/config.js`, invisível na interface. Para trocar de projeto, edite esse arquivo.

## Estrutura

```
sistema/
  index.html        → dashboard de registros diários conjuntos + busca + stats
  registro.html     → wizard 4 etapas + PDF (campos opcionais, autofill por função)
  login.html        → entrada por email/senha
  usuarios.html     → gestão de perfis (só gestor)
  ficha.html        → edição avulsa pág.1
  inspecao.html     → edição avulsa pág.2–3
  css/styles.css    → tema claro/escuro + impressão (PDF sempre claro)
  js/config.js      → URL/key do projeto (fixa, invisível na UI)
  js/db.js          → insert/update/list/listBy/get/remove (Supabase ou localStorage)
  js/auth.js        → sessão, guarda de rotas, usuário logado, gestor
  js/theme.js       → modo claro/escuro
  js/ui.js          → toasts + skeletons
  supabase/schema.sql       → tabelas + vínculo + RLS + índices
  supabase/migration_grupo.sql → migração para bancos antigos
  supabase/migration_rls_auth.sql → perfis + created_by + RLS dono/gestor
  supabase/migration_profiles_funcao.sql → funcao/setor + gestão de perfis
```

## PDF final

Em `registro.html`, **PDF 3 páginas** imprime ficha + inspeção + revisão. Em `ficha.html`/`inspecao.html`, o PDF é só da página.
