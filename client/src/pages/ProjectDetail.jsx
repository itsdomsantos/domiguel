import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import PageTransition from '../components/PageTransition.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import './project-detail.css';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { t } = useLang();

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
          <h2>{t('project.notFoundTitle')}</h2>
          <p style={{ color: 'var(--text-soft)', margin: '12px 0 24px' }}>
            {t('project.notFoundSub')}
          </p>
          <Link to="/trabalho" className="btn btn-primary">
            {t('project.seeAll')}
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
            {t('project.back')}
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
                {t('project.liveSite')}
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                {t('project.code')}
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
            <h3>{t('project.likedTitle')}</h3>
            <p>{t('project.likedSub')}</p>
            <Link to="/contacto" className="btn btn-primary">
              {t('project.startProject')}
            </Link>
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
