import { applyCors } from '../../_lib/http.js';
import { supabase } from '../../_lib/supabase.js';
import { serialize } from '../../_lib/utils.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const { slug } = req.query;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Projeto não encontrado.' });
  return res.status(200).json(serialize(data));
}
