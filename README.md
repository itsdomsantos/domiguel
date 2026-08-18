# domiguel — Estúdio de Desenvolvimento

Website de portfólio moderno, limpo e fluido para mostrar criações, expor trabalho e receber contactos de novos clientes. Inclui um **painel de administração** completo para gerir os projetos sem tocar em código.

**Arquitetura:** React (Vite) + funções serverless no **Vercel** + **Supabase** (Postgres + Storage).

![stack](https://img.shields.io/badge/Vercel-serverless-black) ![stack](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

## ✨ Funcionalidades

- Página inicial com hero animado, serviços e projetos em destaque
- Portefólio filtrável por categoria e página de projeto individual
- Formulário de contacto que guarda as mensagens no Supabase
- **Painel de administração** protegido por login (JWT):
  - Dashboard com estatísticas
  - Gestão de projetos (criar, editar, apagar, destacar, publicar/rascunho)
  - Upload de imagens direto para o Supabase Storage
  - Caixa de mensagens dos clientes
- Design responsivo, tema escuro, animações fluidas (Framer Motion)

## 🧱 Stack

| Camada        | Tecnologia                                             |
| ------------- | ------------------------------------------------------ |
| Frontend      | React 18, Vite, React Router, Framer Motion, Axios     |
| API           | Funções serverless (Vercel), `@supabase/supabase-js`   |
| Base de dados | Supabase (Postgres)                                    |
| Imagens       | Supabase Storage (upload via URL assinado)             |
| Auth          | JWT (admin único via variáveis de ambiente)            |

## 📁 Estrutura

```
domiguel/
├── api/                  # Funções serverless (Vercel)
│   ├── _lib/             # supabase, auth (JWT), utils, cors
│   ├── auth/             # login, me
│   ├── projects/         # index, [id], slug/[slug], admin/all, upload-url
│   └── messages/         # index, [id]
├── client/               # Frontend React (Vite)
│   └── src/              # pages, components, context, supabaseClient
├── supabase-schema.sql   # SQL das tabelas (+ dados de exemplo)
├── vercel.json           # build + rewrites (SPA)
└── package.json          # dependências das funções serverless
```

---

## 🚀 Pôr online (Vercel + Supabase)

### 1. Supabase — base de dados

1. No teu projeto Supabase, abre **SQL Editor → New query**.
2. Cola o conteúdo de [`supabase-schema.sql`](./supabase-schema.sql) e clica **Run**.
   (cria as tabelas `projects` e `messages` e alguns projetos de exemplo)

### 2. Supabase — Storage (imagens)

1. **Storage → New bucket** → nome **`project-images`** → marca **Public bucket** → criar.
2. É só. Os uploads usam URLs assinados gerados pela API (service role).

### 3. Supabase — chaves

Em **Project Settings → API** copia:

- **Project URL** → `SUPABASE_URL` e `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY` (pode ir no frontend)
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **secreta**, nunca no frontend)

### 4. Vercel — importar o projeto

1. Em [vercel.com](https://vercel.com) → **Add New → Project** → importa o repositório `itsdomsantos/domiguel`.
2. O Vercel deteta automaticamente o `vercel.json` (build do `client`, funções em `/api`).
3. Em **Settings → Environment Variables**, adiciona:

   | Variável | Valor |
   | --- | --- |
   | `SUPABASE_URL` | o Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | a service_role key |
   | `SUPABASE_BUCKET` | `project-images` |
   | `ADMIN_EMAIL` | o teu email de admin |
   | `ADMIN_PASSWORD` | uma password forte |
   | `JWT_SECRET` | um valor aleatório longo |
   | `VITE_SUPABASE_URL` | o Project URL |
   | `VITE_SUPABASE_ANON_KEY` | a anon key |
   | `VITE_SUPABASE_BUCKET` | `project-images` |

4. **Deploy**. No fim tens o site em `https://<o-teu-projeto>.vercel.app`.

> As variáveis `VITE_*` são lidas no build; se as alterares, faz **Redeploy**.

### 5. Aceder ao admin

Vai a `https://<o-teu-projeto>.vercel.app/login` e usa o `ADMIN_EMAIL` / `ADMIN_PASSWORD` que definiste.

---

## 💻 Desenvolvimento local (opcional)

Usa a CLI do Vercel, que arranca o frontend e as funções `/api` juntos:

```bash
npm i -g vercel
vercel link            # associa à pasta ao projeto Vercel (uma vez)
vercel env pull        # traz as variáveis para .env.local
vercel dev             # abre em http://localhost:3000
```

> Também podes criar `.env` (raiz) e `client/.env` a partir dos respetivos
> `.env.example` se preferires definir as variáveis à mão.

## 🔌 Endpoints da API

| Método | Rota                       | Acesso  | Descrição                    |
| ------ | -------------------------- | ------- | ---------------------------- |
| POST   | `/api/auth/login`          | Público | Iniciar sessão               |
| GET    | `/api/projects`            | Público | Listar projetos publicados   |
| GET    | `/api/projects/slug/:slug` | Público | Ver um projeto               |
| GET    | `/api/projects/:id`        | Admin   | Obter projeto (editar)       |
| POST   | `/api/projects`            | Admin   | Criar projeto                |
| PUT    | `/api/projects/:id`        | Admin   | Editar projeto               |
| DELETE | `/api/projects/:id`        | Admin   | Apagar projeto               |
| GET    | `/api/projects/admin/all`  | Admin   | Listar todos (inc. rascunhos)|
| POST   | `/api/projects/upload-url` | Admin   | URL assinado para imagem     |
| POST   | `/api/messages`            | Público | Enviar mensagem de contacto  |
| GET    | `/api/messages`            | Admin   | Ler mensagens                |
| PATCH  | `/api/messages/:id`        | Admin   | Marcar lida / por ler        |
| DELETE | `/api/messages/:id`        | Admin   | Apagar mensagem              |

---

Feito com dedicação 🖤 — **domiguel**
