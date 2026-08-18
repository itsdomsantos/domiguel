import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// --- Público: enviar mensagem de contacto ---
router.post('/', (req, res) => {
  const { name, email, subject, body } = req.body || {};
  if (!name || !email || !body) {
    return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido.' });
  }
  const info = db
    .prepare('INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)')
    .run(name.trim(), email.trim(), (subject || '').trim(), body.trim());
  res.status(201).json({ ok: true, id: info.lastInsertRowid });
});

// --- Admin: listar mensagens ---
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  res.json(rows.map((m) => ({ ...m, read: !!m.read })));
});

router.patch('/:id/read', requireAuth, (req, res) => {
  const read = req.body?.read === false ? 0 : 1;
  const info = db.prepare('UPDATE messages SET read = ? WHERE id = ?').run(read, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Mensagem não encontrada.' });
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Mensagem não encontrada.' });
  res.json({ ok: true });
});

export default router;
