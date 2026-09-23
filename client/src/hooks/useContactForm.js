import { useState } from 'react';
import api from '../api.js';
import { useLang } from '../context/LanguageContext.jsx';

export const CONTACT_EMAIL = 'ola@domiguel.dev';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/dawnofdom/';

const initial = { name: '', email: '', subject: '', body: '' };

// Estado e envio do formulário de contacto (POST /api/messages).
export function useContactForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [sending, setSending] = useState(false);
  const { t } = useLang();

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setSending(true);
    try {
      await api.post('/messages', form);
      setStatus({ type: 'success', msg: t('contact.success') });
      setForm(initial);
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.error || t('contact.errorGeneric'),
      });
    } finally {
      setSending(false);
    }
  }

  return { form, status, sending, update, submit };
}
