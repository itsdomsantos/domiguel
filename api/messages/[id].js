import { applyCors } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  const { id } = req.query;

  // --- Marcar como lida / por ler ---
  if (req.method === 'PATCH') {
    const read = req.body?.read === false ? false : true;
    const { error } = await supabase.from('messages').update({ read }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  // --- Apagar ---
  if (req.method === 'DELETE') {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
