import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { slugify, uniqueSlug, normalizeTags } from '../utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(png|jpe?g|webp|gif|svg\+xml)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas.'));
  },
});

const router = Router();

function serialize(row) {
  if (!row) return row;
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
    featured: !!row.featured,
    published: !!row.published,
  };
}

// --- Público: lista de projetos publicados ---
router.get('/', (req, res) => {
  const { category, featured } = req.query;
  let sql = 'SELECT * FROM projects WHERE published = 1';
  const params = [];
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (featured === 'true') {
    sql += ' AND featured = 1';
  }
  sql += ' ORDER BY position ASC, created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(serialize));
});

// --- Público: projeto individual por slug ---
router.get('/slug/:slug', (req, res) => {
  const row = db
    .prepare('SELECT * FROM projects WHERE slug = ? AND published = 1')
    .get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Projeto não encontrado.' });
  res.json(serialize(row));
});

// --- Admin: lista completa (inclui rascunhos) ---
router.get('/admin/all', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY position ASC, created_at DESC').all();
  res.json(rows.map(serialize));
});

router.get('/admin/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Projeto não encontrado.' });
  res.json(serialize(row));
});

// --- Admin: criar ---
router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  if (!b.title) return res.status(400).json({ error: 'O título é obrigatório.' });
  const base = slugify(b.slug || b.title);
  const slug = uniqueSlug(db, base);
  const info = db
    .prepare(
      `INSERT INTO projects (title, slug, summary, description, category, tags, cover_image, live_url, repo_url, featured, published, position)
       VALUES (@title, @slug, @summary, @description, @category, @tags, @cover_image, @live_url, @repo_url, @featured, @published, @position)`
    )
    .run({
      title: b.title,
      slug,
      summary: b.summary || '',
      description: b.description || '',
      category: b.category || 'Web',
      tags: JSON.stringify(normalizeTags(b.tags)),
      cover_image: b.cover_image || '',
      live_url: b.live_url || '',
      repo_url: b.repo_url || '',
      featured: b.featured ? 1 : 0,
      published: b.published === false ? 0 : 1,
      position: Number.isFinite(b.position) ? b.position : 0,
    });
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(serialize(row));
});

// --- Admin: atualizar ---
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Projeto não encontrado.' });
  const b = req.body || {};
  const base = slugify(b.slug || b.title || existing.title);
  const slug = uniqueSlug(db, base, existing.id);
  db.prepare(
    `UPDATE projects SET
      title = @title, slug = @slug, summary = @summary, description = @description,
      category = @category, tags = @tags, cover_image = @cover_image,
      live_url = @live_url, repo_url = @repo_url, featured = @featured,
      published = @published, position = @position, updated_at = datetime('now')
     WHERE id = @id`
  ).run({
    id: existing.id,
    title: b.title ?? existing.title,
    slug,
    summary: b.summary ?? existing.summary,
    description: b.description ?? existing.description,
    category: b.category ?? existing.category,
    tags: JSON.stringify(normalizeTags(b.tags ?? JSON.parse(existing.tags || '[]'))),
    cover_image: b.cover_image ?? existing.cover_image,
    live_url: b.live_url ?? existing.live_url,
    repo_url: b.repo_url ?? existing.repo_url,
    featured: b.featured ? 1 : 0,
    published: b.published === false ? 0 : 1,
    position: Number.isFinite(b.position) ? b.position : existing.position,
  });
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(existing.id);
  res.json(serialize(row));
});

// --- Admin: apagar ---
router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Projeto não encontrado.' });
  res.json({ ok: true });
});

// --- Admin: upload de imagem ---
router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;
