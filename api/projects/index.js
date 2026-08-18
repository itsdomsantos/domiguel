import { applyCors } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';
import { slugify, uniqueSlug, normalizeTags, serialize } from '../_lib/utils.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  // --- Público: listar projetos publicados ---
  if (req.method === 'GET') {
    const { category, featured } = req.query;
    let query = supabase.from('projects').select('*').eq('published', true);
    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('featured', true);
    query = query.order('position', { ascending: true }).order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data.map(serialize));
  }

  // --- Admin: criar projeto ---
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;
    const b = req.body || {};
    if (!b.title) return res.status(400).json({ error: 'O título é obrigatório.' });
    const slug = await uniqueSlug(slugify(b.slug || b.title));
    const row = {
      title: b.title,
      slug,
      summary: b.summary || '',
      description: b.description || '',
      category: b.category || 'Web',
      tags: normalizeTags(b.tags),
      cover_image: b.cover_image || '',
      live_url: b.live_url || '',
      repo_url: b.repo_url || '',
      featured: !!b.featured,
      published: b.published === false ? false : true,
      position: Number(b.position) || 0,
    };
    const { data, error } = await supabase.from('projects').insert(row).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(serialize(data));
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
