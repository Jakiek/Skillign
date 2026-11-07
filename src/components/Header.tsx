import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { pathname } = useLocation();
  const buat = pathname === '/tantangan/baru';
  const links = [['/tantangan', 'Tantangan'], ['/talenta', 'Talenta'], ['/analitik', 'Analitik'], ['/tantangan/baru', 'Buat tantangan']];
  return <header className="border-b border-line bg-card">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5">
      <Link to="/" translate="no" className="text-2xl font-semibold tracking-tight text-brand" aria-label="Jembatan — beranda">Jembatan</Link>
      <nav aria-label="Navigasi utama" className="order-3 flex w-full flex-wrap gap-x-6 gap-y-2 text-sm md:order-none md:w-auto md:flex-1">
        {links.map(([to, label]) => {
          const active = to === '/tantangan/baru' ? buat : pathname.startsWith(to) && !(to === '/tantangan' && buat);
          return <Link key={to} to={to} aria-current={active ? 'page' : undefined} className={`border-b-2 py-2 ${active ? 'border-brand font-semibold text-brand' : 'border-transparent text-muted hover:text-brand'}`}>{label}</Link>;
        })}
      </nav>
      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">Prototipe konsep · Data contoh</span>
    </div>
  </header>;
}
