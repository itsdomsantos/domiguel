import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useProjects } from '../hooks/useProjects.js';
import { canPlayIntro, shouldPlayIntro, markIntroSeen } from './introPolicy.js';
import Desktop from './Desktop.jsx';
import './desktop.css';

// three.js só é descarregado quando a intro vai mesmo correr.
const LaptopIntro = lazy(() => import('./LaptopIntro.jsx'));

// Página inicial: intro 3D (portátil) → desktop em HTML/CSS.
// stage: 'intro' (só a cena) → 'handoff' (desktop a aparecer por cima) → 'desktop' (cena desmontada).
export default function DesktopExperience() {
  const { t } = useLang();
  const { projects, loading } = useProjects(); // começa a carregar durante a intro
  const [stage, setStage] = useState(() => (shouldPlayIntro() ? 'intro' : 'desktop'));
  const [animateIn, setAnimateIn] = useState(false);
  const introAvailable = useMemo(canPlayIntro, []);

  const handoff = useCallback(() => {
    setAnimateIn(true);
    setStage('handoff');
  }, []);
  const finish = useCallback(() => {
    markIntroSeen();
    setStage('desktop');
  }, []);

  return (
    <div className="dk-root">
      {stage !== 'intro' && (
        <Desktop
          projects={projects}
          loading={loading}
          animateIn={animateIn}
          onReplay={introAvailable ? () => setStage('intro') : null}
        />
      )}
      {stage !== 'desktop' && (
        <div className="intro-layer">
          <Suspense
            fallback={
              <div className="intro intro--loading">
                <span>{t('desktop.loading')}…</span>
              </div>
            }
          >
            <LaptopIntro
              labels={{ hint: t('desktop.hint'), open: t('desktop.open') }}
              onHandoff={handoff}
              onDone={finish}
            />
          </Suspense>
          {stage === 'intro' && (
            <button type="button" className="intro__skip" onClick={finish}>
              {t('desktop.skip')} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
