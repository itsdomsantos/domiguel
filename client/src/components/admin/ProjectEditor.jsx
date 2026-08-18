import { useEffect, useState, useRef } from 'react';
import api from '../../api.js';

const empty = {
  title: '',
  summary: '',
  description: '',
  category: 'Web',
  tags: '',
  cover_image: '',
  live_url: '',
  repo_url: '',
  featured: false,
  published: true,
  position: 0,
};

const categories = ['Web', 'Mobile', 'Design', 'Backend', 'Outro'];

export default function ProjectEditor({ projectId, onSaved, onCancel }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!!projectId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (!projectId) return;
    api
      .get(`/projects/admin/${projectId}`)
      .then((res) => {
        const p = res.data;
        setForm({ ...p, tags: (p.tags || []).join(', ') });
      })
      .catch(() => setError('Não foi possível carregar o projeto.'))
      .finally(() => setLoading(false));
  }, [projectId]);

  function update(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/projects/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, cover_image: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar imagem.');
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, position: Number(form.position) || 0 };
      if (projectId) await api.put(`/projects/${projectId}`, payload);
      else await api.post('/projects', payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <form className="editor" onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="editor__grid">
        <div className="field editor__full">
          <label>Título *</label>
          <input name="title" value={form.title} onChange={update} required />
        </div>

        <div className="field editor__full">
          <label>Resumo curto</label>
          <input
            name="summary"
            value={form.summary}
            onChange={update}
            placeholder="Uma frase que descreve o projeto"
          />
        </div>

        <div className="field editor__full">
          <label>Descrição completa</label>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            placeholder="Detalhes do projeto, tecnologia, desafios... (parágrafos separados por linhas)"
          />
        </div>

        <div className="field">
          <label>Categoria</label>
          <select name="category" value={form.category} onChange={update}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Tags (separadas por vírgula)</label>
          <input name="tags" value={form.tags} onChange={update} placeholder="React, Node.js, ..." />
        </div>

        <div className="field">
          <label>URL do site ao vivo</label>
          <input name="live_url" value={form.live_url} onChange={update} placeholder="https://..." />
        </div>

        <div className="field">
          <label>URL do repositório</label>
          <input name="repo_url" value={form.repo_url} onChange={update} placeholder="https://github.com/..." />
        </div>

        <div className="field editor__full">
          <label>Imagem de capa</label>
          <div className="upload-box">
            {form.cover_image && (
              <img src={form.cover_image} alt="pré-visualização" className="upload-preview" />
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'A carregar...' : 'Carregar imagem'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={uploadImage}
              style={{ display: 'none' }}
            />
          </div>
          <input
            name="cover_image"
            value={form.cover_image}
            onChange={update}
            placeholder="ou cola um URL de imagem"
            style={{ marginTop: 10 }}
          />
        </div>

        <div className="field">
          <label>Ordem (posição)</label>
          <input type="number" name="position" value={form.position} onChange={update} />
        </div>

        <div className="editor__full">
          <div className="checkbox-row">
            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={update} />
            <label htmlFor="featured">Projeto em destaque (aparece na página inicial)</label>
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="published" name="published" checked={form.published} onChange={update} />
            <label htmlFor="published">Publicado (visível no site)</label>
          </div>
        </div>
      </div>

      <div className="editor__actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'A guardar...' : projectId ? 'Guardar alterações' : 'Criar projeto'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
