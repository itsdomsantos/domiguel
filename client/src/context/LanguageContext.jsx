import { createContext, useContext, useEffect, useState } from 'react';
import { translations, DEFAULT_LANG } from '../i18n/translations.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'ddd-lang';

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      const meta = translations[lang]?.brand;
      if (meta) {
        document.title = meta.title;
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', meta.metaDescription);
      }
    }
  }, [lang]);

  function setLang(next) {
    if (translations[next]) setLangState(next);
  }

  // t('home.heroSub') -> string, or returns the raw value (arrays/objects) for structured keys.
  function t(path) {
    const parts = path.split('.');
    let node = translations[lang];
    for (const p of parts) {
      if (node == null) break;
      node = node[p];
    }
    if (node == null) {
      // fall back to default language before giving up
      let fallback = translations[DEFAULT_LANG];
      for (const p of parts) {
        if (fallback == null) break;
        fallback = fallback[p];
      }
      return fallback == null ? path : fallback;
    }
    return node;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider');
  return ctx;
}
