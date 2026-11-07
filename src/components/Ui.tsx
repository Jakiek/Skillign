import type { ReactNode } from 'react';

export function DataContoh() { return <span className="text-xs font-semibold text-muted">Data contoh</span>; }
export function SkillChip({ children, variant = 'netral' }: { children: ReactNode; variant?: 'netral' | 'wajib' | 'cocok' | 'kurang' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${variant === 'cocok' ? 'border-cocok text-cocok' : variant === 'kurang' ? 'border-transparent bg-kurang-soft text-[#87480E]' : 'border-line text-ink'} ${variant === 'wajib' ? 'font-semibold' : ''}`}>
    {variant === 'cocok' && <span aria-hidden="true">✓</span>}{variant === 'kurang' && <span aria-hidden="true">○</span>}{children}
  </span>;
}
export function Etat({ loading, error, retry, children }: { loading: boolean; error?: string; retry: () => void; children: ReactNode }) {
  if (loading) return <div role="status" aria-label="Memuat data" className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl border border-line bg-card p-5"><div className="h-4 w-2/3 rounded bg-line" /><div className="mt-5 h-3 w-1/2 rounded bg-line" /></div>)}</div>;
  if (error) return <div role="alert" className="rounded-xl border border-line bg-card p-5"><h2 className="font-semibold">Data belum tersedia</h2><p className="my-3 text-sm text-muted">{error}</p><button className="button-secondary" onClick={retry}>Coba lagi</button></div>;
  return <>{children}</>;
}
export function Kosong({ children }: { children: ReactNode }) { return <div className="rounded-xl border border-line bg-card p-8 text-sm leading-6 text-muted">{children}</div>; }
export function Judul({ title, children }: { title: string; children: ReactNode }) { return <div className="mb-8"><h1 className="text-[32px] font-semibold leading-tight tracking-tight">{title}</h1><p className="mt-3 max-w-prose leading-7 text-muted">{children}</p></div>; }
