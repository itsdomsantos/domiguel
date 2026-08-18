import { applyCors } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  // --- Público: enviar mensagem de contacto ---
  if (req.method === 'POST') {
    const { name, email, subject, body } = req.body || {};
    if (!name || !email || !body) {
      return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({
        name: name.trim(),
        email: email.trim(),
        subject: (subject || '').trim(),
        body: body.trim(),
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, id: data.id });
  }

  // --- Admin: listar mensagens ---
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
