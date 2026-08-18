import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api.js';
import ProjectEditor from '../components/admin/ProjectEditor.jsx';
import './admin.css';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '◇' },
  { id: 'projects', label: 'Projetos', icon: '▦' },
  { id: 'messages', label: 'Mensagens', icon: '✉' },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([
        api.get('/projects/admin/all'),
        api.get('/messages'),
      ]);
      setProjects(p.data);
      setMessages(m.data);
    } catch {
      /* ignora */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unread = messages.filter((m) => !m.read).length;

  async function deleteProject(id) {
    if (!confirm('Tens a certeza que queres apagar este projeto?')) return;
    await api.delete(`/projects/${id}`);
    load();
  }

  async function toggleRead(m) {
    await api.patch(`/messages/${m.id}/read`, { read: !m.read });
    load();
  }

  async function deleteMessage(id) {
    if (!confirm('Apagar esta mensagem?')) return;
    await api.delete(`/messages/${id}`);
    load();
  }

  function onSaved() {
    setEditing(null);
    setTab('projects');
    load();
  }

  const Nav = () => (
    <>
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`admin__navlink ${tab === t.id && !editing ? 'admin__navlink--active' : ''}`}
          onClick={() => {
            setTab(t.id);
            setEditing(null);
          }}
        >
          <span>{t.icon}</span>
          {t.label}
          {t.id === 'messages' && unread > 0 && <span className="count">{unread}</span>}
        </button>
      ))}
    </>
  );

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__logo">
          domiguel<span>.</span>
        </div>
        <nav className="admin__nav">
          <Nav />
        </nav>
        <div className="admin__spacer" />
        <div className="admin__user">{user?.email}</div>
        <button className="admin__logout" onClick={logout}>
          Terminar sessão
        </button>
      </aside>

      <div className="admin__mobile-nav">
        <Nav />
      </div>

      <main className="admin__main">
        {loading ? (
          <div className="center-screen">
            <div className="spinner" />
          </div>
        ) : editing ? (
          <>
            <div className="admin__header">
              <div>
                <h1>{editing === 'new' ? 'Novo projeto' : 'Editar projeto'}</h1>
                <p>Preenche os detalhes da criação.</p>
              </div>
            </div>
            <ProjectEditor
              projectId={editing === 'new' ? null : editing}
              onSaved={onSaved}
              onCancel={() => setEditing(null)}
            />
          </>
        ) : tab === 'dashboard' ? (
          <Dashboard projects={projects} messages={messages} onNew={() => setEditing('new')} onGo={setTab} />
        ) : tab === 'projects' ? (
          <ProjectsPanel
            projects={projects}
            onNew={() => setEditing('new')}
            onEdit={(id) => setEditing(id)}
            onDelete={deleteProject}
          />
        ) : (
          <MessagesPanel messages={messages} onToggle={toggleRead} onDelete={deleteMessage} />
        )}
      </main>
    </div>
  );
}

function Dashboard({ projects, messages, onNew, onGo }) {
  const published = projects.filter((p) => p.published).length;
  const featured = projects.filter((p) => p.featured).length;
  const unread = messages.filter((m) => !m.read).length;
  return (
    <>
      <div className="admin__header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do teu portfólio.</p>
        </div>
        <button className="btn btn-primary" onClick={onNew}>
          + Novo projeto
        </button>
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <strong>{projects.length}</strong>
          <span>Projetos totais</span>
        </div>
        <div className="stat-card">
          <strong>{published}</strong>
          <span>Publicados</span>
        </div>
        <div className="stat-card">
          <strong>{featured}</strong>
          <span>Em destaque</span>
        </div>
        <div className="stat-card">
          <strong>{unread}</strong>
          <span>Mensagens por ler</span>
        </div>
      </div>

      <div className="admin__header">
        <h1 style={{ fontSize: '1.3rem' }}>Mensagens recentes</h1>
        <button className="btn btn-ghost" onClick={() => onGo('messages')}>
          Ver todas
        </button>
      </div>
      {messages.slice(0, 3).map((m) => (
        <div key={m.id} className={`msg-item ${!m.read ? 'msg-item--unread' : ''}`}>
          <div className="msg-item__head">
            <strong>{m.name}</strong>
            <span className="msg-item__meta">{new Date(m.created_at).toLocaleString('pt-PT')}</span>
          </div>
          <div className="msg-item__body">{m.body.slice(0, 120)}...</div>
        </div>
      ))}
      {messages.length === 0 && <div className="empty-state">Ainda não há mensagens.</div>}
    </>
  );
}

function ProjectsPanel({ projects, onNew, onEdit, onDelete }) {
  return (
    <>
      <div className="admin__header">
        <div>
          <h1>Projetos</h1>
          <p>Gere as tuas criações — cria, edita e organiza.</p>
        </div>
        <button className="btn btn-primary" onClick={onNew}>
          + Novo projeto
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>Ainda não tens projetos. Cria o primeiro!</p>
        </div>
      ) : (
        <div className="adm-table">
          {projects.map((p) => (
            <div key={p.id} className="adm-item">
              {p.cover_image ? (
                <img src={p.cover_image} alt="" className="adm-item__thumb" />
              ) : (
                <div className="adm-item__thumb" />
              )}
              <div className="adm-item__info">
                <h4>{p.title}</h4>
                <p>{p.category} · {p.summary || 'Sem resumo'}</p>
              </div>
              <div className="adm-item__badges">
                {p.featured && <span className="badge badge-brand">Destaque</span>}
                {p.published ? (
                  <span className="badge badge-success">Publicado</span>
                ) : (
                  <span className="badge badge-muted">Rascunho</span>
                )}
              </div>
              <div className="adm-item__actions">
                <button className="icon-btn" onClick={() => onEdit(p.id)}>
                  Editar
                </button>
                <button className="icon-btn icon-btn--danger" onClick={() => onDelete(p.id)}>
                  Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MessagesPanel({ messages, onToggle, onDelete }) {
  return (
    <>
      <div className="admin__header">
        <div>
          <h1>Mensagens</h1>
          <p>Pedidos de contacto dos clientes.</p>
        </div>
      </div>
      {messages.length === 0 ? (
        <div className="empty-state">Ainda não há mensagens.</div>
      ) : (
        messages.map((m) => (
          <div key={m.id} className={`msg-item ${!m.read ? 'msg-item--unread' : ''}`}>
            <div className="msg-item__head">
              <strong>
                {m.name} · <a href={`mailto:${m.email}`} style={{ color: 'var(--brand-2)' }}>{m.email}</a>
              </strong>
              <span className="msg-item__meta">{new Date(m.created_at).toLocaleString('pt-PT')}</span>
            </div>
            {m.subject && <div className="msg-item__subject">{m.subject}</div>}
            <div className="msg-item__body">{m.body}</div>
            <div className="msg-item__actions">
              <button className="icon-btn" onClick={() => onToggle(m)}>
                {m.read ? 'Marcar por ler' : 'Marcar como lida'}
              </button>
              <a className="icon-btn" href={`mailto:${m.email}`}>
                Responder
              </a>
              <button className="icon-btn icon-btn--danger" onClick={() => onDelete(m.id)}>
                Apagar
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
