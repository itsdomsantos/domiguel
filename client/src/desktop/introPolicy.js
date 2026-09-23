// Decide se a intro 3D corre ou se entramos direto no desktop.

const SEEN_KEY = 'ddd-intro-seen';

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// A intro pode correr neste dispositivo? (movimento reduzido, WebGL, hardware fraco)
export function canPlayIntro() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = window.navigator;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory < 4) return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse && (nav.hardwareConcurrency || 8) <= 4) return false;
  return hasWebGL();
}

// Deve correr agora? Só uma vez por sessão; ?intro força, ?nointro salta.
export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('nointro')) return false;
  if (params.has('intro')) return canPlayIntro();
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
  } catch {
    // sessionStorage indisponível — segue em frente
  }
  return canPlayIntro();
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // ignore
  }
}
