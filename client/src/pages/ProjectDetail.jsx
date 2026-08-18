import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import PageTransition from '../components/PageTransition.jsx';
import './project-detail.css';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/projects/slug/${slug}`)
      .then((res) => setProject(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <PageTransition>
        <div className="container" style={{ padding: '160px 24px', textAlign: 'center' }}>
          <h2>Projeto não encontrado</h2>
          <p style={{ color: 'var(--text-soft)', margin: '12px 0 24px' }}>
            Este projeto pode ter sido removido.
          </p>
          <Link to="/trabalho" className="btn btn-primary">
            Ver todos os projetos
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <article className="pd">
        <div className="container">
          <Link to="/trabalho" className="pd__back">
            ← Voltar ao trabalho
          </Link>
          <span className="pd__category">{project.category}</span>
          <h1 className="pd__title">{project.title}</h1>
          <p className="pd__summary">{project.summary}</p>

          <div className="pd__tags">
            {(project.tags || []).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>

          <div className="pd__links">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-primary">
                Ver site ao vivo ↗
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Código ↗
              </a>
            )}
          </div>
        </div>

        {project.cover_image && (
          <div className="container">
            <div className="pd__cover">
              <img src={project.cover_image} alt={project.title} />
            </div>
          </div>
        )}

        <div className="container">
          <div className="pd__content">
            {(project.description || '').split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="pd__cta">
            <h3>Gostaste deste projeto?</h3>
            <p>Vamos criar algo assim (ou melhor) para ti.</p>
            <Link to="/contacto" className="btn btn-primary">
              Iniciar um projeto
            </Link>
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
