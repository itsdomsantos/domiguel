import { useEffect, useState } from 'react';
import api from '../api.js';

// Único ponto de acesso à lista pública de projetos (GET /api/projects).
// Usado pela página de trabalho, pela home e pelo desktop.
export function useProjects({ featured = false } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/projects', { params: featured ? { featured: 'true' } : undefined })
      // Sem API (ex.: só o Vite a correr) a resposta pode ser o index.html — só aceitamos listas.
      .then((res) => alive && setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [featured]);

  return { projects, loading };
}
