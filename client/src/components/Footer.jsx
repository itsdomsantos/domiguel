import { Link } from 'react-router-dom';
import './footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            domiguel<span>.</span>
          </Link>
          <p>Estúdio de desenvolvimento. Transformamos ideias em produtos digitais.</p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>Navegar</h4>
            <Link to="/">Início</Link>
            <Link to="/trabalho">Trabalho</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
          <div className="footer__col">
            <h4>Contacto</h4>
            <a href="mailto:ola@domiguel.dev">ola@domiguel.dev</a>
            <Link to="/contacto">Pedir orçamento</Link>
            <Link to="/login" className="footer__admin">
              Área reservada
            </Link>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {year} domiguel — Todos os direitos reservados.</span>
        <span>Feito com dedicação 🖤</span>
      </div>
    </footer>
  );
}
