import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { slugify } from './utils.js';

// Cria o utilizador admin e alguns projetos de exemplo se a BD estiver vazia.
export function ensureSeed() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@domiguel.dev').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'domiguel123';

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(adminEmail, hash);
    console.log(`👤 Admin criado: ${adminEmail}`);
  }

  const count = db.prepare('SELECT COUNT(*) AS n FROM projects').get().n;
  if (count === 0) {
    const sample = [
      {
        title: 'Plataforma E-commerce Nébula',
        summary: 'Loja online completa com pagamentos, carrinho e dashboard de vendas.',
        description:
          'Uma plataforma de e-commerce moderna construída com React e Node.js, integrada com Stripe para pagamentos, gestão de stock em tempo real e um dashboard analítico para o vendedor. Foco em performance e experiência de utilizador fluida.',
        category: 'Web',
        tags: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
        cover_image:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
        featured: 1,
        position: 1,
      },
      {
        title: 'App Móvel FitPulse',
        summary: 'Aplicação de fitness com planos personalizados e tracking de treinos.',
        description:
          'Aplicação móvel multiplataforma para acompanhamento de treinos e nutrição. Inclui planos gerados por IA, sincronização com wearables e uma comunidade integrada para motivação.',
        category: 'Mobile',
        tags: ['React Native', 'Expo', 'Firebase'],
        cover_image:
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
        featured: 1,
        position: 2,
      },
      {
        title: 'Dashboard SaaS Orbital',
        summary: 'Painel analítico em tempo real para equipas de produto.',
        description:
          'Dashboard de analítica para produtos SaaS, com gráficos interativos, relatórios exportáveis e integrações via API. Arquitetura escalável preparada para milhares de eventos por segundo.',
        category: 'Web',
        tags: ['Next.js', 'TypeScript', 'D3.js', 'Redis'],
        cover_image:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        featured: 0,
        position: 3,
      },
      {
        title: 'Identidade Visual Aurora',
        summary: 'Branding e website institucional para uma startup de energia limpa.',
        description:
          'Projeto completo de identidade visual e desenvolvimento do website institucional. Design system consistente, animações fluidas e otimização SEO desde a base.',
        category: 'Design',
        tags: ['Branding', 'Figma', 'Framer Motion'],
        cover_image:
          'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80',
        featured: 0,
        position: 4,
      },
    ];

    const insert = db.prepare(
      `INSERT INTO projects (title, slug, summary, description, category, tags, cover_image, featured, published, position)
       VALUES (@title, @slug, @summary, @description, @category, @tags, @cover_image, @featured, 1, @position)`
    );
    for (const p of sample) {
      insert.run({ ...p, slug: slugify(p.title), tags: JSON.stringify(p.tags) });
    }
    console.log(`📦 ${sample.length} projetos de exemplo criados.`);
  }
}

// Permite correr `npm run seed` diretamente.
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureSeed();
  console.log('✅ Seed concluído.');
  process.exit(0);
}
