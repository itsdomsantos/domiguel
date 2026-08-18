import { applyCors } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { supabase, BUCKET } from '../_lib/supabase.js';

// Gera um URL de upload assinado. O browser envia a imagem diretamente para o
// Supabase Storage (sem passar pelos limites de tamanho das funções serverless).
export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const user = requireAuth(req, res);
  if (!user) return;

  const { filename } = req.body || {};
  const ext =
    (filename || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `covers/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return res.status(500).json({ error: error.message });

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return res.status(200).json({ path: data.path, token: data.token, publicUrl });
}
