import type { Analitik } from '../domain/types';
export function RingkasanProgram({ data }: { data: Analitik['ringkasan'] }) {
  return <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan program">{[
    ['Tantangan terbuka', data.tantanganTerbuka.toLocaleString('id-ID')], ['Talenta', data.jumlahTalenta.toLocaleString('id-ID')],
    ['Minat tercatat', data.jumlahMinat.toLocaleString('id-ID')], ['Tantangan punya kandidat ≥60', `${data.persenPunyaKandidat.toLocaleString('id-ID')}%`],
  ].map(([label, value]) => <div key={label} className="card"><dt className="text-sm leading-6 text-muted">{label}</dt><dd className="mt-3 text-[32px] font-semibold tabular-nums">{value}</dd></div>)}</dl>;
}
