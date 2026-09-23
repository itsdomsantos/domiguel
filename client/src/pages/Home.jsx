import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useProjects } from '../hooks/useProjects.js';
import './home.css';

const serviceIcons = ['🌐', '📱', '🎨', '⚙️'];

export default function Home() {
  const featured = useProjects({ featured: true }).projects.slice(0, 3);
  const { t } = useLang();
  const services = t('home.services');

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
            <span className="eyebrow">{t('home.eyebrow')}</span>
            <h1 className="hero__title">
              {t('home.heroTitlePre')}
              <span className="gradient-text">{t('home.heroTitleHighlight')}</span>
              {t('home.heroTitlePost')}
            </h1>
            <p className="hero__sub">{t('home.heroSub')}</p>
            <div className="hero__actions">
              <Link to="/trabalho" className="btn btn-primary">
                {t('home.seeWork')}
              </Link>
              <Link to="/contacto" className="btn btn-ghost">
                {t('home.startProject')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">{t('home.servicesEyebrow')}</span>
            <h2>{t('home.servicesTitle')}</h2>
            <p>{t('home.servicesSub')}</p>
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
                <span className="service__icon">{serviceIcons[i]}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__head section__head--row">
              <div>
                <span className="eyebrow">{t('home.portfolioEyebrow')}</span>
                <h2>{t('home.featuredTitle')}</h2>
              </div>
              <Link to="/trabalho" className="btn btn-ghost">
                {t('home.seeAll')}
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
              {t('home.ctaTitlePre')}
              <span className="gradient-text">{t('home.ctaTitleHighlight')}</span>
            </h2>
            <p>{t('home.ctaSub')}</p>
            <Link to="/contacto" className="btn btn-primary">
              {t('home.ctaButton')}
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
