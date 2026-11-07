import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try { return (window.localStorage.getItem('skillign-theme') ?? window.localStorage.getItem('jembatan-theme')) === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { window.localStorage.setItem('skillign-theme', dark ? 'dark' : 'light'); } catch { /* Tema tetap bekerja tanpa penyimpanan. */ }
  }, [dark]);
  return <button type="button" aria-pressed={dark} onClick={() => setDark((value) => !value)} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-brand-soft hover:text-brand"><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z" /></svg>Tampilan gelap</button>;
}
