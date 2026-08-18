# domiguel — Estúdio de Desenvolvimento

Website de portfólio moderno, limpo e fluido para mostrar criações, expor trabalho e receber contactos de novos clientes. Inclui um **painel de administração** completo para gerir os projetos sem tocar em código.

![stack](https://img.shields.io/badge/stack-React%20%2B%20Node.js-7c5cff)

## ✨ Funcionalidades

- **Página inicial** com hero animado, serviços e projetos em destaque
- **Portefólio** filtrável por categoria
- **Página de projeto** individual com galeria, tags e links
- **Formulário de contacto** que guarda as mensagens
- **Painel de administração** protegido por login:
  - Dashboard com estatísticas
  - Gestão de projetos (criar, editar, apagar, destacar, publicar/rascunho)
  - Upload de imagens
  - Caixa de mensagens dos clientes
- Design responsivo, animações fluidas (Framer Motion), tema escuro moderno

## 🧱 Stack

| Camada    | Tecnologia                                        |
| --------- | ------------------------------------------------- |
| Frontend  | React 18, Vite, React Router, Framer Motion, Axios |
| Backend   | Node.js, Express                                  |
| Base de dados | SQLite (`node:sqlite`, embutido no Node — sem compilação) |
| Auth      | JWT + bcrypt                                       |
| Uploads   | Multer                                             |

## 🚀 Como correr localmente

Precisas de **Node.js 22.5+** (recomendado Node 24+) — usa o SQLite embutido no Node, por isso **não precisas de compilar nada** nem de Visual Studio / build tools.

### 1. Backend (API)

```bash
cd server
cp .env.example .env      # ajusta o segredo e as credenciais de admin
npm install
npm start                 # arranca em http://localhost:4000
```

No primeiro arranque é criado o utilizador admin e alguns projetos de exemplo.

### 2. Frontend (site)

Noutro terminal:

```bash
cd client
npm install
npm run dev               # arranca em http://localhost:5173
```

O Vite faz proxy dos pedidos `/api` e `/uploads` para o backend.

### Aceder ao admin

Vai a **http://localhost:5173/login** e usa as credenciais definidas no `.env`:

```
Email:    admin@domiguel.dev
Password: domiguel123
```

> ⚠️ Muda estas credenciais e o `JWT_SECRET` antes de ir para produção.

## 📦 Build para produção

```bash
cd client && npm install && npm run build
cd ../server && npm install && npm start
```

O servidor Express serve automaticamente o frontend compilado (`client/dist`)
e a API na mesma porta.

## 📁 Estrutura

```
domiguel/
├── client/          # Frontend React (Vite)
│   └── src/
│       ├── components/   # Navbar, Footer, ProjectCard, admin/...
│       ├── context/      # AuthContext
│       ├── pages/        # Home, Work, ProjectDetail, Contact, Login, Admin
│       └── styles/       # CSS global (design system)
└── server/          # Backend Express + SQLite
    └── src/
        ├── routes/       # auth, projects, messages
        ├── db.js         # esquema da base de dados
        ├── seed.js       # admin + dados de exemplo
        └── index.js      # servidor
```

## 🔌 Endpoints principais da API

| Método | Rota                        | Acesso  | Descrição                     |
| ------ | --------------------------- | ------- | ----------------------------- |
| POST   | `/api/auth/login`           | Público | Iniciar sessão                |
| GET    | `/api/projects`             | Público | Listar projetos publicados    |
| GET    | `/api/projects/slug/:slug`  | Público | Ver um projeto                |
| POST   | `/api/projects`             | Admin   | Criar projeto                 |
| PUT    | `/api/projects/:id`         | Admin   | Editar projeto                |
| DELETE | `/api/projects/:id`         | Admin   | Apagar projeto                |
| POST   | `/api/projects/upload`      | Admin   | Upload de imagem              |
| POST   | `/api/messages`             | Público | Enviar mensagem de contacto   |
| GET    | `/api/messages`             | Admin   | Ler mensagens                 |

---

Feito com dedicação 🖤 — **domiguel**
