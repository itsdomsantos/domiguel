import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import './footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-accent">Dom</span> Dot<span className="footer__logo-accent">.</span>{' '}
            <span className="footer__logo-muted">Developments</span>
          </Link>
          <p>{t('footer.blurb')}</p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>{t('footer.navigate')}</h4>
            <Link to="/">{t('nav.home')}</Link>
            <Link to="/trabalho">{t('nav.work')}</Link>
            <Link to="/contacto">{t('nav.contact')}</Link>
          </div>
          <div className="footer__col">
            <h4>Contacto</h4>
            <a href="mailto:domdotdevelopments@gmail.com">domdotdevelopments@gmail.com</a>
            <Link to="/contacto">Pedir orçamento</Link>
            <Link to="/login" className="footer__admin">
              {t('footer.admin')}
            </Link>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {year} Dom Dot. Developments — {t('footer.rights')}</span>
        <span>{t('footer.madeWith')}</span>
      </div>
    </footer>
  );
}
