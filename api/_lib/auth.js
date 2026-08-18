import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Verifica a autenticação e responde 401 se falhar. Devolve o utilizador ou null.
export function requireAuth(req, res) {
  const user = verifyAuth(req);
  if (!user) {
    res.status(401).json({ error: 'Não autenticado.' });
    return null;
  }
  return user;
}
