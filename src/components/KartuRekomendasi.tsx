import { Link } from 'react-router-dom';
import type { HasilSkor } from '../domain/types';
import { DataContoh, SkillChip } from './Ui';
export function SkorBadge({ skor }: { skor: number }) {
  const [label, color] = skor >= 80 ? ['Sangat cocok', 'text-cocok'] : skor >= 60 ? ['Cocok', 'text-brand'] : skor >= 40 ? ['Sebagian', 'text-muted'] : ['Kurang cocok', 'text-muted'];
  return <div className={`min-w-20 rounded-lg bg-bg p-3 text-center ${color}`}><span className="block text-[32px] font-semibold leading-none tabular-nums">{skor}</span><span className="mt-2 block text-xs">{label}</span></div>;
}
export function KartuRekomendasi({ nama, to, hasil, skillNama, dataContoh }: { nama: string; to: string; hasil: HasilSkor; skillNama: Record<string, string>; dataContoh: boolean }) {
  return <article className="card">
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="text-lg font-semibold leading-6"><Link className="hover:text-brand hover:underline" to={to}>{nama}</Link></h3>{dataContoh && <div className="mt-2"><DataContoh /></div>}</div><SkorBadge skor={hasil.skor} /></div>
    <div className="mt-5 grid gap-x-4 gap-y-4 border-t border-line pt-4 sm:grid-cols-2">
      {([{ title: 'Wajib cocok', ids: hasil.wajibCocok, variant: 'cocok' }, { title: 'Wajib belum dimiliki', ids: hasil.wajibKurang, variant: 'kurang' }, { title: 'Tambahan cocok', ids: hasil.tambahanCocok, variant: 'cocok' }] as const).map((g) => <div key={g.title} className={g.title === 'Tambahan cocok' ? 'sm:col-span-2' : ''}><p className="mb-2 text-xs font-semibold text-muted">{g.title}</p><div className="flex flex-wrap gap-2">{g.ids.length ? g.ids.map((id) => <SkillChip key={id} variant={g.variant}>{skillNama[id] ?? id}</SkillChip>) : <span className="text-xs text-muted">Tidak ada</span>}</div></div>)}
    </div>
  </article>;
}
