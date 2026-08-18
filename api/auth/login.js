import { applyCors } from '../_lib/http.js';
import { signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password são obrigatórios.' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (String(email).toLowerCase() !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const user = { email: adminEmail };
  return res.status(200).json({ token: signToken(user), user });
}
