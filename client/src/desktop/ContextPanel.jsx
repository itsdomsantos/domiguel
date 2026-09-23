import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import { projectYear } from './windows.jsx';

// Painel lateral permanente: resumo por defeito, detalhes quando há um projeto selecionado.
// Em ecrã pequeno é uma folha inferior que se expande (expanded/onToggle).
export default function ContextPanel({ project, featured, expanded, onToggle, onSelect, onClear, onContact }) {
  const { t } = useLang();

  return (
    <aside className={`dk-panel ${expanded ? 'dk-panel--open' : ''}`} aria-label={t('desktop.showPanel')}>
      <button type="button" className="dk-panel__handle" aria-expanded={expanded} onClick={onToggle}>
        <span className="dk-panel__grip" aria-hidden="true" />
        <span className="dk-panel__handle-title">{project ? project.title : t('brand.tagline')}</span>
        <span className="dk-panel__handle-action">{expanded ? t('desktop.hidePanel') : t('desktop.showPanel')}</span>
      </button>

      <div className="dk-panel__body" aria-live="polite">
        {project ? (
          <div className="dk-detail" key={project.slug}>
            <button type="button" className="dk-link-btn" onClick={onClear}>
              {t('desktop.overview')}
            </button>
            <p className="dk-eyebrow">{project.category}</p>
            <h2 className="dk-panel__title">{project.title}</h2>
            {project.cover_image && (
              <div className="dk-detail__cover">
                <img src={project.cover_image} alt="" />
              </div>
            )}
            <p className="dk-panel__text">{project.summary}</p>

            <dl className="dk-specs">
              {project.tags?.length > 0 && (
                <div>
                  <dt>{t('desktop.tech')}</dt>
                  <dd className="dk-specs__tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </dd>
                </div>
              )}
              {projectYear(project) && (
                <div>
                  <dt>{t('desktop.year')}</dt>
                  <dd>{projectYear(project)}</dd>
                </div>
              )}
              {project.live_url && (
                <div>
                  <dt>{t('desktop.status')}</dt>
                  <dd>
                    <span className="dk-live" aria-hidden="true" />
                    {t('desktop.statusLive')}
                  </dd>
                </div>
              )}
            </dl>

            <div className="dk-detail__links">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="dk-btn dk-btn--accent">
                  {t('project.liveSite')}
                </a>
              )}
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noreferrer" className="dk-btn">
                  {t('desktop.repo')}
                </a>
              )}
              <Link to={`/projeto/${project.slug}`} className="dk-link-btn">
                {t('desktop.fullPage')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="dk-overview">
            <p className="dk-eyebrow">{t('home.eyebrow')}</p>
            <h2 className="dk-panel__title">
              {t('home.heroTitlePre')}
              <em>{t('home.heroTitleHighlight')}</em>
              {t('home.heroTitlePost')}
            </h2>
            <p className="dk-panel__text">{t('home.heroSub')}</p>

            {featured.length > 0 && (
              <>
                <h3 className="dk-panel__sub">{t('home.featuredTitle')}</h3>
                <ul className="dk-featured">
                  {featured.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => onSelect(p.slug)}>
                        <span>{p.title}</span>
                        <span className="dk-featured__meta">{p.category}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="dk-muted dk-overview__hint">{t('desktop.openProject')}</p>

            <div className="dk-overview__cta">
              <p>{t('home.ctaSub')}</p>
              <button type="button" className="dk-btn dk-btn--accent" onClick={onContact}>
                {t('home.ctaButton')} →
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
