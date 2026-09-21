import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import { LANGUAGES } from '../i18n/translations.js';
import './navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLang();

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/trabalho', label: t('nav.work') },
    { to: '/contacto', label: t('nav.contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <Link to="/" className="nav__logo">
          <span className="nav__logo-accent">Dom</span> Dot<span className="nav__logo-accent">.</span>{' '}
          <span className="nav__logo-muted">Developments</span>
        </Link>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}

          <div className="nav__lang" role="group" aria-label={t('nav.langLabel')}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`nav__lang-btn ${lang === l.code ? 'nav__lang-btn--active' : ''}`}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
              >
                {l.label}
              </button>
            ))}
          </div>

          <Link to="/contacto" className="btn btn-primary nav__cta">
            {t('nav.cta')}
          </Link>
        </nav>

        <button
          className={`nav__burger ${open ? 'nav__burger--open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
