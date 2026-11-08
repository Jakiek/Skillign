import { CatatanDataContoh } from '../components/CatatanDataContoh';
import { RingkasanProgram } from '../components/RingkasanProgram';
import { Link, useNavigate } from 'react-router-dom';
import type { Analitik, Tantangan } from '../domain/types';
import { useApi } from '../hooks/useApi';
import { Etat, Kosong } from '../components/Ui';
import { KartuTantangan } from '../components/Kartu';

export function Beranda() {
  const analitik = useApi<Analitik>('analitik');
  const tantangan = useApi<Tantangan[]>('tantangan');
  const navigate = useNavigate();
  return <>
    <section className="mb-8 grid gap-8 border-b border-line pb-10 pt-3 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-end">
      <div><h1 className="max-w-[20ch] text-[32px] font-semibold leading-[1.2] tracking-tight sm:text-[40px]">Cocokkan skill. Temukan proyek yang sesuai.</h1>
        <p className="mt-4 max-w-[55ch] text-sm leading-7 text-muted">Bandingkan kebutuhan proyek dengan skill kandidat. Lihat alasan setiap rekomendasi dan analisis permintaan serta ketersediaan skill.</p>
        <form role="search" className="mt-6 flex flex-wrap gap-2 rounded-xl border border-line bg-card p-2" onSubmit={(e) => {
          e.preventDefault();
          const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
          navigate(q ? `/tantangan?${new URLSearchParams({ q })}` : '/tantangan');
        }}><label className="sr-only" htmlFor="cari-beranda">Cari judul atau organisasi</label><input id="cari-beranda" name="q" type="search" maxLength={100} autoComplete="off" placeholder="Topik atau nama organisasi…" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm" /><button className="button-primary" type="submit">Cari proyek</button></form>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm"><Link className="font-semibold text-brand underline" to="/tantangan">Lihat proyek</Link><Link className="text-brand underline" to="/analitik">Buka analitik</Link></div>
      </div>
      <div className="border-t border-line pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"><h2 className="text-lg font-semibold">Setiap skor punya alasan</h2><p className="mt-3 text-sm leading-7 text-muted">Lihat skill yang sesuai, kebutuhan yang belum terpenuhi, dan skill tambahan yang mendukung. Skor dihitung dengan aturan yang dapat ditelusuri.</p><Link className="mt-4 inline-block text-sm font-semibold text-brand underline" to="/talenta">Lihat kandidat</Link></div>
    </section>
    <section className="mb-8" aria-label="Ringkasan data contoh"><Etat {...analitik}>{analitik.data && <RingkasanProgram data={analitik.data.ringkasan} />}</Etat></section>
    <section><div className="mb-5 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-2xl font-semibold">Proyek terbaru</h2><Link className="text-sm text-brand underline" to="/tantangan">Lihat semua proyek</Link></div><Etat {...tantangan}>{tantangan.data?.length ? <div className="grid gap-4 xl:grid-cols-3">{tantangan.data.slice(0, 3).map((t) => <KartuTantangan key={t.id} item={t} />)}</div> : <Kosong>Belum ada proyek yang tersedia.</Kosong>}</Etat></section>
    <div className="mt-8"><CatatanDataContoh /></div>
  </>;
}
