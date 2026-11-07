import type { Analitik } from '../domain/types';
export function RingkasanProgram({ data }: { data: Analitik['ringkasan'] }) {
  return <dl className="grid overflow-hidden rounded-xl border border-line bg-card sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan program">{[
    ['Proyek terbuka', data.tantanganTerbuka.toLocaleString('id-ID')], ['Kandidat', data.jumlahTalenta.toLocaleString('id-ID')],
    ['Minat tercatat', data.jumlahMinat.toLocaleString('id-ID')], ['Proyek dengan kandidat ≥60', `${data.persenPunyaKandidat.toLocaleString('id-ID')}%`],
  ].map(([label, value]) => <div key={label} className="min-w-0 border-b border-line px-5 py-5 last:border-b-0 sm:even:border-l xl:border-b-0 xl:[&:not(:first-child)]:border-l"><dt className="text-xs leading-5 text-muted">{label}</dt><dd className="mt-2 text-[32px] font-semibold tracking-tight tabular-nums">{value}</dd></div>)}</dl>;
}
