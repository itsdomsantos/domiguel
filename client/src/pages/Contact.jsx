import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api.js';
import PageTransition from '../components/PageTransition.jsx';
import './contact.css';

const initial = { name: '', email: '', subject: '', body: '' };

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [sending, setSending] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setSending(true);
    try {
      await api.post('/messages', form);
      setStatus({ type: 'success', msg: 'Mensagem enviada! Respondemos em 48h. 🎉' });
      setForm(initial);
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.error || 'Não foi possível enviar. Tenta novamente.',
      });
    } finally {
      setSending(false);
    }
  }

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
            <span className="eyebrow">Contacto</span>
            <h2>Vamos trabalhar juntos</h2>
            <p>
              Conta-nos sobre o teu projeto, ideia ou desafio. Respondemos a todas as mensagens em
              menos de 48 horas.
            </p>
            <ul className="contact__list">
              <li>
                <span>✉️</span>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:domdotdevelopments@gmail.com">domdotdevelopments@gmail.com</a>
                </div>
              </li>
              <li>
                <span>⚡</span>
                <div>
                  <strong>Resposta rápida</strong>
                  <span>Proposta em 48 horas</span>
                </div>
              </li>
              <li>
                <span>🌍</span>
                <div>
                  <strong>Onde estamos</strong>
                  <span>Trabalhamos remotamente, para todo o mundo</span>
                </div>
              </li>
              <li>
                <span>🌐</span>
                <div>
                  <strong>Linkdin</strong>
                  <a href="https://www.linkedin.com/in/dawnofdom/">Domingos Santos (dev)</a>
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
              <label>Nome *</label>
              <input name="name" value={form.name} onChange={update} placeholder="O teu nome" required />
            </div>
            <div className="field">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="field">
              <label>Assunto</label>
              <input
                name="subject"
                value={form.subject}
                onChange={update}
                placeholder="Sobre o que queres falar?"
              />
            </div>
            <div className="field">
              <label>Mensagem *</label>
              <textarea
                name="body"
                value={form.body}
                onChange={update}
                placeholder="Descreve o teu projeto ou ideia..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
              {sending ? 'A enviar...' : 'Enviar mensagem'}
            </button>
          </motion.form>
        </div>
      </section>
    </PageTransition>
  );
}
