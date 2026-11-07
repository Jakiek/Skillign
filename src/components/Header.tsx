import { ThemeToggle } from './ThemeToggle';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { pathname } = useLocation();
  const buat = pathname === '/tantangan/baru';
  const ikon: Record<string, string> = {
    '/tantangan': 'M4 7h16v13H4z M9 7V4h6v3 M4 12h16 M10 12v3h4v-3',
    '/talenta': 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M3 20v-2a6 6 0 0 1 12 0v2 M16 5a3 3 0 0 1 0 6 M18 15a5 5 0 0 1 3 5',
    '/analitik': 'M4 4v16h16 M8 16v-4 M12 16V8 M16 16V5',
    '/tantangan/baru': 'M12 5v14 M5 12h14',
  };
  const links = [['/tantangan', 'Opportunities'], ['/talenta', 'Talents'], ['/analitik', 'Insights'], ['/tantangan/baru', 'New opportunity']];
  return <header className="border-b border-line bg-card lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-60 lg:border-b-0 lg:border-r">
    <div className="mx-auto flex h-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5 lg:flex-col lg:flex-nowrap lg:items-stretch lg:justify-start lg:gap-8 lg:py-8">
      <Link to="/" translate="no" className="inline-block self-start font-display text-[32px] font-normal italic leading-tight tracking-[-0.035em] text-brand" aria-label="Skillign — beranda">Skillign</Link>
      <nav aria-label="Navigasi utama" className="order-3 flex w-full flex-wrap gap-x-6 gap-y-2 text-sm md:order-none md:w-auto md:flex-1 lg:flex-none lg:flex-col lg:gap-2">
        {links.map(([to, label]) => {
          const active = to === '/tantangan/baru' ? buat : pathname.startsWith(to) && !(to === '/tantangan' && buat);
          return <Link key={to} to={to} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg border-b-2 px-2 py-2 lg:border-0 lg:px-3 lg:py-3 ${active ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-transparent text-muted hover:text-brand'}`}><svg aria-hidden="true" className="hidden h-[18px] w-[18px] shrink-0 lg:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={ikon[to]} /></svg>{label}</Link>;
        })}
      </nav>
      <ThemeToggle />
      <span className="rounded-xl leading-5 lg:mt-auto bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">Prototipe konsep · Data contoh</span>
    </div>
  </header>;
}
