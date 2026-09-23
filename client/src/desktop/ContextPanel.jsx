import { useEffect, useState } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { projectYear } from './windows.jsx';

const SLIDE_MS = 5000;

function Cover({ project, className }) {
  return (
    <div className={className}>
      {project.cover_image ? (
        <img src={project.cover_image} alt="" />
      ) : (
        <span className="dk-cover__letter">{project.title?.[0] || 'd'}</span>
      )}
    </div>
  );
}

// Montra: os projetos em destaque a passar sozinhos (pára ao passar o rato e com movimento reduzido).
function Showcase({ items, onSelect }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const auto = !paused && !reduced && items.length > 1;
  const current = items[index % items.length];

  useEffect(() => {
    if (!auto) return undefined;
    const id = setTimeout(() => setIndex((i) => (i + 1) % items.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [auto, index, items.length]);

  return (
    <div className="dk-show" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <button type="button" className="dk-show__slide" onClick={() => onSelect(current.slug)}>
        <Cover project={current} className="dk-show__media" key={current.slug} />
        <span className="dk-show__caption">
          <span className="dk-show__meta">
            {[current.category, projectYear(current)].filter(Boolean).join(' · ')}
          </span>
          <span className="dk-show__title">{current.title}</span>
          {current.summary && <span className="dk-show__summary">{current.summary}</span>}
        </span>
      </button>
      {items.length > 1 && (
        <div className="dk-show__dots">
          {items.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              className={`dk-show__dot ${i === index % items.length ? 'dk-show__dot--on' : ''}`}
              aria-label={p.title}
              aria-current={i === index % items.length}
              onClick={() => setIndex(i)}
            >
              {i === index % items.length && auto && (
                <span className="dk-show__bar" style={{ animationDuration: `${SLIDE_MS}ms` }} key={index} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Painel lateral permanente: montra + lista por defeito, ficha rápida quando há um projeto selecionado.
// Em ecrã pequeno é uma folha inferior que se expande (expanded/onToggle).
export default function ContextPanel({
  project,
  projects,
  featured,
  expanded,
  onToggle,
  onSelect,
  onClear,
  onContact,
  onOpenProject,
}) {
  const { t } = useLang();
  const showcase = featured.length > 0 ? featured : projects.slice(0, 4);
  const index = project ? projects.findIndex((p) => p.slug === project.slug) : -1;
  const step = (d) => onSelect(projects[(index + d + projects.length) % projects.length].slug);

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
            <div className="dk-detail__nav">
              <button type="button" className="dk-link-btn" onClick={onClear}>
                {t('desktop.overview')}
              </button>
              {projects.length > 1 && (
                <span className="dk-stepper">
                  <button type="button" onClick={() => step(-1)} aria-label={t('desktop.prev')}>
                    ←
                  </button>
                  <span>
                    {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                  </span>
                  <button type="button" onClick={() => step(1)} aria-label={t('desktop.next')}>
                    →
                  </button>
                </span>
              )}
            </div>

            <button type="button" className="dk-detail__cover" onClick={onOpenProject}>
              <Cover project={project} className="dk-detail__media" />
              <span className="dk-detail__open">{t('desktop.fullPage')}</span>
            </button>

            <p className="dk-eyebrow">
              {[project.category, projectYear(project)].filter(Boolean).join(' · ')}
              {project.live_url && (
                <span className="dk-live-pill">
                  <span className="dk-live" aria-hidden="true" />
                  {t('desktop.statusLive')}
                </span>
              )}
            </p>
            <h2 className="dk-panel__title">{project.title}</h2>
            <p className="dk-panel__text">{project.summary}</p>

            {project.tags?.length > 0 && (
              <div className="dk-specs__tags dk-detail__tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}

            <div className="dk-detail__links">
              <button type="button" className="dk-btn dk-btn--accent" onClick={onOpenProject}>
                {t('desktop.openFile')}
              </button>
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="dk-btn">
                  {t('project.liveSite')}
                </a>
              )}
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noreferrer" className="dk-btn">
                  {t('desktop.repo')}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="dk-overview">
            <p className="dk-eyebrow">{t('home.eyebrow')}</p>
            <p className="dk-overview__lede">{t('home.heroSub')}</p>

            {showcase.length > 0 && (
              <>
                <h3 className="dk-panel__sub">{t('home.featuredTitle')}</h3>
                <Showcase items={showcase} onSelect={onSelect} />
              </>
            )}

            {projects.length > 0 && (
              <>
                <h3 className="dk-panel__sub">{t('work.title')}</h3>
                <ul className="dk-thumbs">
                  {projects.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => onSelect(p.slug)}>
                        <Cover project={p} className="dk-thumbs__media" />
                        <span className="dk-thumbs__text">
                          <span className="dk-thumbs__title">{p.title}</span>
                          <span className="dk-thumbs__meta">
                            {[p.category, projectYear(p)].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        <span className="dk-thumbs__arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

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
