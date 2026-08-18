import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api.js';
import PageTransition from '../components/PageTransition.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import './home.css';

const services = [
  {
    icon: '🌐',
    title: 'Websites & Web Apps',
    desc: 'Sites institucionais, plataformas e aplicações web rápidas, responsivas e escaláveis.',
  },
  {
    icon: '📱',
    title: 'Aplicações Móveis',
    desc: 'Apps nativas e multiplataforma com foco em experiência e performance.',
  },
  {
    icon: '🎨',
    title: 'UI / UX Design',
    desc: 'Interfaces limpas e intuitivas, desenhadas para converter e encantar.',
  },
  {
    icon: '⚙️',
    title: 'APIs & Backend',
    desc: 'Arquiteturas robustas, integrações e sistemas preparados para crescer.',
  },
];

/*const stats = [
  { value: '30+', label: 'Projetos entregues' },
  { value: '100%', label: 'Clientes satisfeitos' },
  { value: '5★', label: 'Avaliação média' },
];*/

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get('/projects', { params: { featured: 'true' } })
      .then((res) => setFeatured(res.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <PageTransition>
      {/* HERO */}
      <section className="hero">
        <div className="container hero__inner">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero__content"
          >
            <span className="eyebrow">● Estúdio de desenvolvimento</span>
            <h1 className="hero__title">
              Construímos <span className="gradient-text">produtos digitais</span> que fazem a
              diferença.
            </h1>
            <p className="hero__sub">
              Somos a domiguel. Desenhamos e desenvolvemos websites, aplicações e experiências
              digitais modernas — do conceito ao lançamento.
            </p>
            <div className="hero__actions">
              <Link to="/trabalho" className="btn btn-primary">
                Ver o nosso trabalho →
              </Link>
              <Link to="/contacto" className="btn btn-ghost">
                Iniciar um projeto
              </Link>
            </div>
            {/*<div className="hero__stats">
              {stats.map((s) => (
                <div key={s.label} className="hero__stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>*/}
          </motion.div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">O que fazemos</span>
            <h2>Serviços end-to-end</h2>
            <p>Do primeiro esboço à entrega final, tratamos de tudo com rigor e criatividade.</p>
          </div>
          <div className="services__grid">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                className="service card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <span className="service__icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJETOS EM DESTAQUE */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__head section__head--row">
              <div>
                <span className="eyebrow">Portefólio</span>
                <h2>Trabalho em destaque</h2>
              </div>
              <Link to="/trabalho" className="btn btn-ghost">
                Ver tudo
              </Link>
            </div>
            <div className="grid-3">
              {featured.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta">
            <h2>
              Tens uma ideia? <span className="gradient-text">Vamos construí-la.</span>
            </h2>
            <p>Conta-nos o que precisas e recebe uma proposta em 48h.</p>
            <Link to="/contacto" className="btn btn-primary">
              Falar connosco
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
