import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './project-card.css';

export default function ProjectCard({ project, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <Link to={`/projeto/${project.slug}`} className="pcard">
        <div className="pcard__media">
          {project.cover_image ? (
            <img src={project.cover_image} alt={project.title} loading="lazy" />
          ) : (
            <div className="pcard__placeholder">{project.title?.[0] || 'd'}</div>
          )}
          {project.featured && <span className="pcard__featured">Destaque</span>}
        </div>
        <div className="pcard__body">
          <span className="pcard__category">{project.category}</span>
          <h3 className="pcard__title">{project.title}</h3>
          <p className="pcard__summary">{project.summary}</p>
          <div className="pcard__tags">
            {(project.tags || []).slice(0, 3).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
