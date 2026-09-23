// Ícones desenhados à mão para cada ficheiro do desktop — cada um diz o que abre.

export function DrawerIcon({ className = 'dk-icon__svg' }) {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" className={className}>
      <path d="M5 10h17l3-5h11l3 5h20v36H5z" fill="var(--dk-paper-dim)" />
      <rect x="10" y="14" width="44" height="10" fill="var(--dk-ink)" stroke="var(--dk-paper)" strokeWidth="1.5" />
      <rect x="14" y="18" width="16" height="2" fill="var(--dk-accent)" />
      <path d="M2 22h60l-4 30H6z" fill="var(--dk-paper)" />
      <rect x="25" y="32" width="14" height="5" fill="var(--dk-ink)" />
      <rect x="29" y="34" width="6" height="1.5" fill="var(--dk-accent)" />
    </svg>
  );
}

export function SheetIcon({ className = 'dk-icon__svg' }) {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" className={className}>
      <path d="M13 2h27l12 12v41H13z" fill="var(--dk-paper)" />
      <path d="M40 2v12h12z" fill="var(--dk-paper-dim)" />
      <rect x="19" y="18" width="18" height="3" fill="var(--dk-ink)" />
      <rect x="19" y="26" width="27" height="1.5" fill="var(--dk-ink)" opacity="0.55" />
      <rect x="19" y="31" width="24" height="1.5" fill="var(--dk-ink)" opacity="0.55" />
      <rect x="19" y="36" width="27" height="1.5" fill="var(--dk-ink)" opacity="0.55" />
      <rect x="19" y="41" width="14" height="1.5" fill="var(--dk-ink)" opacity="0.55" />
      <rect x="34" y="39.5" width="2.5" height="5" fill="var(--dk-accent)" />
    </svg>
  );
}

export function PostcardIcon({ className = 'dk-icon__svg' }) {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" className={className}>
      <rect x="3" y="9" width="58" height="39" fill="var(--dk-paper)" />
      <rect
        x="45"
        y="14"
        width="11"
        height="13"
        fill="var(--dk-accent)"
        stroke="var(--dk-paper)"
        strokeWidth="1.5"
        strokeDasharray="1.5 1.5"
      />
      <circle cx="42" cy="26" r="6.5" fill="none" stroke="var(--dk-ink)" strokeWidth="1" opacity="0.5" />
      <path d="M33 16v27" stroke="var(--dk-ink)" strokeWidth="1" opacity="0.35" />
      <rect x="9" y="17" width="17" height="2.5" fill="var(--dk-ink)" />
      <rect x="9" y="24" width="20" height="1.5" fill="var(--dk-ink)" opacity="0.5" />
      <rect x="9" y="29" width="15" height="1.5" fill="var(--dk-ink)" opacity="0.5" />
      <rect x="37" y="37" width="19" height="1.5" fill="var(--dk-ink)" opacity="0.6" />
      <rect x="37" y="42" width="13" height="1.5" fill="var(--dk-ink)" opacity="0.6" />
    </svg>
  );
}
