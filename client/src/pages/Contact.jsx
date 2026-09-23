import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useContactForm, CONTACT_EMAIL, LINKEDIN_URL } from '../hooks/useContactForm.js';
import './contact.css';

export default function Contact() {
  const { form, status, sending, update, submit } = useContactForm();
  const { t } = useLang();

  return (
    <PageTransition>
      <section className="section" style={{ paddingTop: 130 }}>
        <div className="container contact">
          <motion.div
            className="contact__intro"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="eyebrow">{t('contact.eyebrow')}</span>
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.sub')}</p>
            <ul className="contact__list">
              <li>
                <span>✉️</span>
                <div>
                  <strong>{t('contact.emailLabel')}</strong>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </div>
              </li>
              <li>
                <span>⚡</span>
                <div>
                  <strong>{t('contact.fastReplyLabel')}</strong>
                  <span>{t('contact.fastReplyValue')}</span>
                </div>
              </li>
              <li>
                <span>🌍</span>
                <div>
                  <strong>{t('contact.whereLabel')}</strong>
                  <span>{t('contact.whereValue')}</span>
                </div>
              </li>
              <li>
                <span>🌐</span>
                <div>
                  <strong>{t('contact.linkedinLabel')}</strong>
                  <a href={LINKEDIN_URL}>{t('contact.linkedinValue')}</a>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.form
            className="contact__form card"
            onSubmit={submit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {status.msg && <div className={`alert alert-${status.type}`}>{status.msg}</div>}
            <div className="field">
              <label>{t('contact.fieldName')} *</label>
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder={t('contact.fieldNamePlaceholder')}
                required
              />
            </div>
            <div className="field">
              <label>{t('contact.fieldEmail')} *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                placeholder={t('contact.fieldEmailPlaceholder')}
                required
              />
            </div>
            <div className="field">
              <label>{t('contact.fieldSubject')}</label>
              <input
                name="subject"
                value={form.subject}
                onChange={update}
                placeholder={t('contact.fieldSubjectPlaceholder')}
              />
            </div>
            <div className="field">
              <label>{t('contact.fieldMessage')} *</label>
              <textarea
                name="body"
                value={form.body}
                onChange={update}
                placeholder={t('contact.fieldMessagePlaceholder')}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
              {sending ? t('contact.sending') : t('contact.send')}
            </button>
          </motion.form>
        </div>
      </section>
    </PageTransition>
  );
}
