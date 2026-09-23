import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useContactForm, CONTACT_EMAIL, LINKEDIN_URL } from '../hooks/useContactForm.js';

export const projectYear = (p) => (p.created_at ? new Date(p.created_at).getFullYear() : '');

// Moldura de janela: barra de título arrastável (só com rato), foco ao abrir, Esc fecha.
export function Window({ id, title, variant, z, pos, onMove, onFocus, onClose, children }) {
  const ref = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  function startDrag(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button')) return;
    if (window.matchMedia('(max-width: 760px)').matches) return;
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;
    const move = (ev) => onMove(id, { x: ev.clientX - startX, y: Math.max(0, ev.clientY - startY) });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <section
      ref={ref}
      className={`dk-win dk-win--${variant}`}
      style={{ zIndex: z, '--x': `${pos.x}px`, '--y': `${pos.y}px` }}
      role="dialog"
      aria-labelledby={`dk-win-${id}`}
      tabIndex={-1}
      onPointerDown={() => onFocus(id)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose(id);
      }}
    >
      <header className="dk-win__bar" onPointerDown={startDrag}>
        <h2 id={`dk-win-${id}`} className="dk-win__title">
          {title}
        </h2>
        <button type="button" className="dk-win__close" onClick={() => onClose(id)} aria-label={t('desktop.close')}>
          ×
        </button>
      </header>
      <div className="dk-win__body">{children}</div>
    </section>
  );
}

const ALL = '__all__';

// Grelha de projetos — os mesmos dados da página /trabalho.
export function ProjectsWindow({ projects, loading, selectedSlug, onSelect }) {
  const { t } = useLang();
  const [filter, setFilter] = useState(ALL);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return [ALL, ...set];
  }, [projects]);

  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="dk-projects">
      {categories.length > 1 && (
        <div className="dk-filters" role="group">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="dk-filter"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c === ALL ? t('work.all') : c}
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <p className="dk-muted">{t('desktop.loading')}…</p>
      ) : visible.length === 0 ? (
        <p className="dk-muted">{t('work.empty')}</p>
      ) : (
        <ul className="dk-sheet">
          {visible.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className="dk-frame"
                aria-pressed={selectedSlug === p.slug}
                onClick={() => onSelect(p.slug)}
              >
                <span className="dk-frame__no">{String(i + 1).padStart(2, '0')}</span>
                <span className="dk-frame__media">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt="" loading="lazy" />
                  ) : (
                    <span className="dk-frame__letter">{p.title?.[0] || 'd'}</span>
                  )}
                </span>
                <span className="dk-frame__title">{p.title}</span>
                <span className="dk-frame__meta">
                  {[p.category, projectYear(p)].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Documento de texto — o conteúdo de apresentação que já existe no site.
export function AboutWindow({ onContact }) {
  const { t } = useLang();
  const services = t('home.services');
  return (
    <article className="dk-doc">
      <p className="dk-doc__eyebrow">{t('home.eyebrow')}</p>
      <h3 className="dk-doc__title">
        {t('home.heroTitlePre')}
        <em>{t('home.heroTitleHighlight')}</em>
        {t('home.heroTitlePost')}
      </h3>
      <p className="dk-doc__lead">{t('home.heroSub')}</p>

      <h4 className="dk-doc__h">{t('home.servicesTitle')}</h4>
      <p>{t('home.servicesSub')}</p>
      <ol className="dk-doc__list">
        {services.map((s) => (
          <li key={s.title}>
            <strong>{s.title}</strong>
            <span>{s.desc}</span>
          </li>
        ))}
      </ol>

      <hr className="dk-doc__rule" />
      <p className="dk-doc__closing">
        {t('home.ctaTitlePre')}
        <em>{t('home.ctaTitleHighlight')}</em>
      </p>
      <p>{t('home.ctaSub')}</p>
      <button type="button" className="dk-btn dk-btn--ink" onClick={onContact}>
        {t('home.ctaButton')} →
      </button>
    </article>
  );
}

// Cartão de contacto + formulário — mesma lógica da página /contacto.
export function ContactWindow() {
  const { t } = useLang();
  const { form, status, sending, update, submit } = useContactForm();
  return (
    <div className="dk-card">
      <div className="dk-card__front">
        <span className="dk-card__stamp" aria-hidden="true" />
        <h3 className="dk-card__title">{t('contact.title')}</h3>
        <p className="dk-card__sub">{t('contact.sub')}</p>
        <dl className="dk-card__list">
          <div>
            <dt>{t('contact.emailLabel')}</dt>
            <dd>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </dd>
          </div>
          <div>
            <dt>{t('contact.fastReplyLabel')}</dt>
            <dd>{t('contact.fastReplyValue')}</dd>
          </div>
          <div>
            <dt>{t('contact.whereLabel')}</dt>
            <dd>{t('contact.whereValue')}</dd>
          </div>
          <div>
            <dt>{t('contact.linkedinLabel')}</dt>
            <dd>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                {t('contact.linkedinValue')}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <form className="dk-form" onSubmit={submit}>
        {status.msg && (
          <p className={`dk-form__status dk-form__status--${status.type}`} role="status">
            {status.msg}
          </p>
        )}
        <label>
          <span>{t('contact.fieldName')} *</span>
          <input name="name" value={form.name} onChange={update} placeholder={t('contact.fieldNamePlaceholder')} required />
        </label>
        <label>
          <span>{t('contact.fieldEmail')} *</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            placeholder={t('contact.fieldEmailPlaceholder')}
            required
          />
        </label>
        <label>
          <span>{t('contact.fieldSubject')}</span>
          <input name="subject" value={form.subject} onChange={update} placeholder={t('contact.fieldSubjectPlaceholder')} />
        </label>
        <label>
          <span>{t('contact.fieldMessage')} *</span>
          <textarea
            name="body"
            value={form.body}
            onChange={update}
            placeholder={t('contact.fieldMessagePlaceholder')}
            required
          />
        </label>
        <button type="submit" className="dk-btn dk-btn--accent" disabled={sending}>
          {sending ? t('contact.sending') : t('contact.send')}
        </button>
      </form>
    </div>
  );
}
