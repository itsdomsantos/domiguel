import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './navbar.css';

const links = [
  { to: '/', label: 'Início' },
  { to: '/trabalho', label: 'Trabalho' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
          <span className="nav__logo-prefix">dom</span>iguel<span>.</span>
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
          <Link to="/contacto" className="btn btn-primary nav__cta">
            Vamos falar
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
