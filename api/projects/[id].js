import { applyCors } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';
import { slugify, uniqueSlug, normalizeTags, serialize } from '../_lib/utils.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  const { id } = req.query;

  // --- Admin: obter um projeto (para editar) ---
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Projeto não encontrado.' });
    return res.status(200).json(serialize(data));
  }

  // --- Admin: atualizar ---
  if (req.method === 'PUT') {
    const { data: existing } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Projeto não encontrado.' });
    const b = req.body || {};
    const slug = await uniqueSlug(slugify(b.slug || b.title || existing.title), id);
    const upd = {
      title: b.title ?? existing.title,
      slug,
      summary: b.summary ?? existing.summary,
      description: b.description ?? existing.description,
      category: b.category ?? existing.category,
      tags: normalizeTags(b.tags ?? existing.tags),
      cover_image: b.cover_image ?? existing.cover_image,
      live_url: b.live_url ?? existing.live_url,
      repo_url: b.repo_url ?? existing.repo_url,
      featured: !!b.featured,
      published: b.published === false ? false : true,
      position: Number.isFinite(b.position) ? b.position : existing.position,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('projects').update(upd).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(serialize(data));
  }

  // --- Admin: apagar ---
  if (req.method === 'DELETE') {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
