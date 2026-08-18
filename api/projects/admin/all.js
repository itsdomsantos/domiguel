import { applyCors } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { supabase } from '../../_lib/supabase.js';
import { serialize } from '../../_lib/utils.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data.map(serialize));
}
