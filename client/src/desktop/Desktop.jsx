import { useEffect, useState } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { LANGUAGES } from '../i18n/translations.js';
import { DrawerIcon, SheetIcon, PostcardIcon } from './icons.jsx';
import { Window, ProjectsWindow, ProjectWindow, AboutWindow, ContactWindow } from './windows.jsx';
import ContextPanel from './ContextPanel.jsx';

const FILES = [
  { id: 'projects', Icon: DrawerIcon, variant: 'dark', pos: { x: 132, y: 20 } },
  { id: 'about', Icon: SheetIcon, variant: 'paper', pos: { x: 176, y: 44 } },
  { id: 'contact', Icon: PostcardIcon, variant: 'card', pos: { x: 154, y: 32 } },
];

// Janelas possíveis: os ficheiros do desktop + a ficha completa de um projeto.
const WINDOWS = [...FILES, { id: 'project', variant: 'paper', pos: { x: 210, y: 28 } }];

function Clock() {
  const { lang } = useLang();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);
  return (
    <time className="dk-menubar__clock" dateTime={now.toISOString()}>
      {now.toLocaleTimeString(lang === 'pt' ? 'pt-PT' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
    </time>
  );
}

export default function Desktop({ projects, loading, animateIn, onReplay }) {
  const { lang, setLang, t } = useLang();
  const [stack, setStack] = useState([]); // ids por ordem de profundidade (último = à frente)
  const [positions, setPositions] = useState(() => Object.fromEntries(WINDOWS.map((f) => [f.id, f.pos])));
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const selected = projects.find((p) => p.slug === selectedSlug) || null;
  const featured = projects.filter((p) => p.featured).slice(0, 4);

  function open(id) {
    setStack((s) => [...s.filter((w) => w !== id), id]);
  }
  function close(id) {
    setStack((s) => s.filter((w) => w !== id));
  }
  function move(id, pos) {
    setPositions((p) => ({ ...p, [id]: pos }));
  }
  function select(slug) {
    setSelectedSlug(slug);
    setPanelOpen(true);
  }
  function openContact() {
    open('contact');
    setPanelOpen(false);
  }
  function openProject() {
    open('project');
    setPanelOpen(false);
  }
  function clearSelection() {
    setSelectedSlug(null);
    close('project');
  }

  const content = {
    projects: (
      <ProjectsWindow projects={projects} loading={loading} selectedSlug={selectedSlug} onSelect={select} />
    ),
    about: <AboutWindow onContact={openContact} />,
    contact: <ContactWindow />,
    project: selected && <ProjectWindow project={selected} onContact={openContact} />,
  };

  return (
    <div className={`dk ${animateIn ? 'dk--enter' : ''}`}>
      <header className="dk-menubar">
        <span className="dk-menubar__brand">
          Dom Dot<span className="dk-dot">.</span>
        </span>
        <nav className="dk-menubar__nav">
          <button type="button" onClick={() => open('projects')}>
            {t('nav.work')}
          </button>
          <button type="button" onClick={() => open('about')}>
            {t('desktop.about')}
          </button>
          <button type="button" onClick={() => open('contact')}>
            {t('nav.contact')}
          </button>
        </nav>
        <div className="dk-menubar__right">
          {onReplay && (
            <button type="button" className="dk-menubar__btn" onClick={onReplay} title={t('desktop.replay')}>
              <span aria-hidden="true">⏻</span>
              <span className="dk-sr">{t('desktop.replay')}</span>
            </button>
          )}
          <div className="dk-lang" role="group" aria-label={t('nav.langLabel')}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className="dk-menubar__btn"
                aria-pressed={lang === l.code}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Clock />
        </div>
      </header>

      <main className="dk-surface">
        <ul className="dk-files">
          {FILES.map(({ id, Icon }) => (
            <li key={id}>
              <button
                type="button"
                className={`dk-icon dk-icon--${id}`}
                aria-pressed={stack.includes(id)}
                onClick={() => open(id)}
              >
                <Icon />
                <span className="dk-icon__label">{t(`desktop.files.${id}`)}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* ordem do DOM fixa (não perde foco ao trocar de janela); a profundidade vem do z-index */}
        {WINDOWS.filter((w) => stack.includes(w.id) && content[w.id]).map((file) => {
          const { id } = file;
          return (
            <Window
              key={id}
              id={id}
              title={id === 'project' ? selected.title : t(`desktop.files.${id}`)}
              variant={file.variant}
              z={10 + stack.indexOf(id)}
              pos={positions[id]}
              onMove={move}
              onFocus={open}
              onClose={close}
            >
              {content[id]}
            </Window>
          );
        })}
      </main>

      <ContextPanel
        project={selected}
        featured={featured}
        expanded={panelOpen}
        onToggle={() => setPanelOpen((o) => !o)}
        onSelect={select}
        onClear={clearSelection}
        onContact={openContact}
        onOpenProject={openProject}
      />
    </div>
  );
}
