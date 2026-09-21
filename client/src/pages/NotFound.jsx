import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLang();
  return (
    <PageTransition>
      <div className="container" style={{ padding: '180px 24px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '5rem' }}>
          404
        </h1>
        <p style={{ color: 'var(--text-soft)', margin: '12px 0 28px', fontSize: '1.1rem' }}>
          {t('notFound.sub')}
        </p>
        <Link to="/" className="btn btn-primary">
          {t('notFound.home')}
        </Link>
      </div>
    </PageTransition>
  );
}
