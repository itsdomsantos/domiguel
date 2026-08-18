import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="container" style={{ padding: '180px 24px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '5rem' }}>
          404
        </h1>
        <p style={{ color: 'var(--text-soft)', margin: '12px 0 28px', fontSize: '1.1rem' }}>
          A página que procuras não existe.
        </p>
        <Link to="/" className="btn btn-primary">
          Voltar ao início
        </Link>
      </div>
    </PageTransition>
  );
}
