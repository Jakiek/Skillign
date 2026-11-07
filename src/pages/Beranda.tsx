import { RingkasanProgram } from '../components/RingkasanProgram';
import { Link } from 'react-router-dom';
import type { Analitik, Tantangan } from '../domain/types';
import { useApi } from '../hooks/useApi';
import { Etat, Kosong } from '../components/Ui';
import { KartuTantangan } from '../components/Kartu';
export function Beranda() {
  const analitik = useApi<Analitik>('analitik');
  const tantangan = useApi<Tantangan[]>('tantangan');
  return <><section className="max-w-3xl pb-12 pt-4 sm:pt-8"><h1 className="text-[32px] font-semibold leading-tight tracking-tight">Menghubungkan tantangan industri dengan talenta akademik.</h1><p className="mt-5 max-w-prose leading-7 text-muted">Temukan tantangan yang sesuai dengan skill mahasiswa dan dosen, lengkap dengan alasan kecocokan dan peluang untuk belajar.</p><div className="mt-6 flex flex-wrap gap-3"><Link className="button-primary" to="/tantangan">Lihat tantangan</Link><Link className="button-secondary" to="/analitik">Buka analitik</Link></div></section><section className="mb-10" aria-label="Ringkasan data contoh"><Etat {...analitik}>{analitik.data && <RingkasanProgram data={analitik.data.ringkasan} />}</Etat></section><section><div className="mb-5 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-2xl font-semibold">Tantangan terbaru</h2><Link className="text-sm text-brand underline" to="/tantangan">Lihat semua tantangan</Link></div><Etat {...tantangan}>{tantangan.data?.length ? <div className="grid gap-4 lg:grid-cols-3">{tantangan.data.slice(0, 3).map((t) => <KartuTantangan key={t.id} item={t} />)}</div> : <Kosong>Belum ada tantangan terbuka.</Kosong>}</Etat></section></>;
}
