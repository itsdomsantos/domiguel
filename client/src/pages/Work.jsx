import { useEffect, useMemo, useState } from 'react';
import api from '../api.js';
import PageTransition from '../components/PageTransition.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

export default function Work() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    api
      .get('/projects')
      .then((res) => setProjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['Todos', ...set];
  }, [projects]);

  const visible = filter === 'Todos' ? projects : projects.filter((p) => p.category === filter);

  return (
    <PageTransition>
      <section className="section" style={{ paddingTop: 130 }}>
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Portefólio</span>
            <h2>O nosso trabalho</h2>
            <p>Uma seleção de projetos que desenhámos e construímos com paixão.</p>
          </div>

          {categories.length > 1 && (
            <div className="filters">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`filter ${filter === c ? 'filter--active' : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="center-screen">
              <div className="spinner" />
            </div>
          ) : visible.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', marginTop: 40 }}>
              Ainda não há projetos nesta categoria. Volta em breve!
            </p>
          ) : (
            <div className="grid-3">
              {visible.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 36px; }
        .filter {
          padding: 9px 18px; border-radius: 999px; font-family: var(--font-display);
          font-weight: 500; font-size: 0.9rem; color: var(--text-soft);
          background: var(--surface); border: 1px solid var(--border);
          transition: all 0.2s ease;
        }
        .filter:hover { color: var(--text); border-color: var(--border-strong); }
        .filter--active { color: #08080f; background: var(--accent-grad); border-color: transparent; }
      `}</style>
    </PageTransition>
  );
}
