-- ─────────────────────────────────────────────────────────────
-- Esquema da base de dados do portfólio Dom Dot. Developments (Supabase / Postgres)
-- Cola isto no Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

-- Tabela de projetos
create table if not exists public.projects (
  id          bigint generated always as identity primary key,
  title       text not null,
  slug        text unique not null,
  summary     text default '',
  description text default '',
  category    text default 'Web',
  tags        jsonb default '[]'::jsonb,
  cover_image text default '',
  live_url    text default '',
  repo_url    text default '',
  featured    boolean default false,
  published   boolean default true,
  position    int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists projects_published_idx on public.projects (published);
create index if not exists projects_slug_idx on public.projects (slug);

-- Tabela de mensagens de contacto
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text not null,
  subject    text default '',
  body       text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

-- Nota sobre segurança:
-- Toda a escrita/leitura passa pelas funções serverless usando a
-- SERVICE ROLE KEY, que ignora o RLS. Por isso não são necessárias
-- políticas RLS para o funcionamento do site. Se ativares o RLS
-- (recomendado como boa prática), a service role continua a funcionar.
alter table public.projects enable row level security;
alter table public.messages enable row level security;

-- ─── Dados de exemplo (opcional) ───
insert into public.projects (title, slug, summary, description, category, tags, cover_image, featured, position)
values
  ('Plataforma E-commerce Nébula', 'plataforma-e-commerce-nebula',
   'Loja online completa com pagamentos, carrinho e dashboard de vendas.',
   'Uma plataforma de e-commerce moderna construída com React e Node.js, integrada com Stripe para pagamentos, gestão de stock em tempo real e um dashboard analítico para o vendedor.',
   'Web', '["React","Node.js","Stripe","PostgreSQL"]'::jsonb,
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80', true, 1),
  ('App Móvel FitPulse', 'app-movel-fitpulse',
   'Aplicação de fitness com planos personalizados e tracking de treinos.',
   'Aplicação móvel multiplataforma para acompanhamento de treinos e nutrição, com planos gerados por IA e sincronização com wearables.',
   'Mobile', '["React Native","Expo","Firebase"]'::jsonb,
   'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80', true, 2),
  ('Dashboard SaaS Orbital', 'dashboard-saas-orbital',
   'Painel analítico em tempo real para equipas de produto.',
   'Dashboard de analítica para produtos SaaS, com gráficos interativos, relatórios exportáveis e integrações via API.',
   'Web', '["Next.js","TypeScript","D3.js","Redis"]'::jsonb,
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', false, 3)
on conflict (slug) do nothing;
