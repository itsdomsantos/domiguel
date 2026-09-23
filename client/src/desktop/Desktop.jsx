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
const WINDOWS = [...FILES, { id: 'project', Icon: SheetIcon, variant: 'paper', pos: { x: 210, y: 28 } }];

function Clock() {
  const { lang } = useLang();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);
  const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
  return (
    <time className="dk-clock" dateTime={now.toISOString()}>
      <span>{now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="dk-clock__date">{now.toLocaleDateString(locale)}</span>
    </time>
  );
}

export default function Desktop({ projects, loading, animateIn, onReplay }) {
  const { lang, setLang, t } = useLang();
  const [stack, setStack] = useState([]); // janelas abertas por ordem de profundidade (último = à frente)
  const [minimized, setMinimized] = useState([]);
  const [maximized, setMaximized] = useState([]);
  const [positions, setPositions] = useState(() => Object.fromEntries(WINDOWS.map((w) => [w.id, w.pos])));
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const selected = projects.find((p) => p.slug === selectedSlug) || null;
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const visibleStack = stack.filter((id) => !minimized.includes(id));
  const activeId = visibleStack[visibleStack.length - 1];

  function open(id) {
    setStack((s) => [...s.filter((w) => w !== id), id]);
    setMinimized((m) => m.filter((w) => w !== id));
  }
  function close(id) {
    setStack((s) => s.filter((w) => w !== id));
    setMinimized((m) => m.filter((w) => w !== id));
    setMaximized((m) => m.filter((w) => w !== id));
  }
  function minimize(id) {
    setMinimized((m) => (m.includes(id) ? m : [...m, id]));
  }
  function toggleMax(id) {
    setMaximized((m) => (m.includes(id) ? m.filter((w) => w !== id) : [...m, id]));
  }
  // botão da barra de tarefas: minimiza a janela ativa, senão traz para a frente
  function taskbarClick(id) {
    if (id === activeId) minimize(id);
    else open(id);
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

  const titleOf = (id) => (id === 'project' ? selected?.title : t(`desktop.files.${id}`));

  const content = {
    projects: (
      <ProjectsWindow projects={projects} loading={loading} selectedSlug={selectedSlug} onSelect={select} />
    ),
    about: <AboutWindow onContact={openContact} />,
    contact: <ContactWindow />,
    project: selected && <ProjectWindow project={selected} onContact={openContact} />,
  };

  const openWindows = WINDOWS.filter((w) => stack.includes(w.id) && content[w.id]);

  return (
    <div className={`dk ${animateIn ? 'dk--enter' : ''}`}>
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
        {openWindows.map(({ id, Icon, variant }) => (
          <Window
            key={id}
            id={id}
            title={titleOf(id)}
            Icon={Icon}
            variant={variant}
            z={10 + stack.indexOf(id)}
            pos={positions[id]}
            active={id === activeId}
            maximized={maximized.includes(id)}
            minimized={minimized.includes(id)}
            onMove={move}
            onFocus={open}
            onClose={close}
            onMinimize={minimize}
            onToggleMax={toggleMax}
          >
            {content[id]}
          </Window>
        ))}
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

      <footer className="dk-taskbar">
        <span className="dk-taskbar__brand">
          Dom Dot<span className="dk-dot">.</span>
        </span>

        <div className="dk-tasks" role="toolbar" aria-label={t('desktop.openWindows')}>
          {openWindows.map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              className={`dk-task ${minimized.includes(id) ? 'dk-task--min' : ''}`}
              aria-pressed={id === activeId}
              onClick={() => taskbarClick(id)}
            >
              <Icon className="dk-task__icon" />
              <span className="dk-task__label">{titleOf(id)}</span>
            </button>
          ))}
        </div>

        <div className="dk-tray">
          {onReplay && (
            <button type="button" className="dk-tray__btn" onClick={onReplay} title={t('desktop.replay')}>
              <span aria-hidden="true">⏻</span>
              <span className="dk-sr">{t('desktop.replay')}</span>
            </button>
          )}
          <div className="dk-lang" role="group" aria-label={t('nav.langLabel')}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className="dk-tray__btn"
                aria-pressed={lang === l.code}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Clock />
        </div>
      </footer>
    </div>
  );
}
