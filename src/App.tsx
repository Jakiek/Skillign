import { RouteAccessibility } from './components/RouteAccessibility';
import { BuatTantangan } from './pages/BuatTantangan';
import { lazy, Suspense } from 'react';
import { Beranda } from './pages/Beranda';
import { HalamanTantangan, HalamanTalenta } from './pages/Daftar';
import { HalamanDetailTantangan, HalamanDetailTalenta } from './pages/Detail';
import { Link, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';

const Analitik = lazy(() => import('./pages/Analitik').then((m) => ({ default: m.HalamanAnalitik })));

export function App() {
  return (
    <div className="flex min-h-screen flex-col lg:pl-60">
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:bg-card focus:p-4">Lewati ke konten</a>
      <Header />
      <RouteAccessibility />
      <main id="konten" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 sm:py-10">
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/analitik" element={<Suspense fallback={<p role="status">Memuat analitik…</p>}><Analitik /></Suspense>} />
          <Route path="/tantangan" element={<HalamanTantangan />} />
          <Route path="/tantangan/baru" element={<BuatTantangan />} />
          <Route path="/tantangan/:id" element={<HalamanDetailTantangan />} />
          <Route path="/talenta" element={<HalamanTalenta />} />
          <Route path="/talenta/:id" element={<HalamanDetailTalenta />} />
          <Route path="*" element={<section className="py-12"><h1 className="text-[32px] font-semibold">Halaman belum tersedia</h1><Link to="/" className="mt-5 inline-block text-brand underline">Kembali ke beranda</Link></section>} />
        </Routes>
      </main>
      <footer className="border-t border-line px-6 py-6 text-sm leading-6 text-muted">
        <p className="mx-auto max-w-7xl">Prototipe portofolio mandiri. Nama mitra dan topik terpilih merujuk sumber publik DTETI; atribut kecocokan, talenta, dan minat merupakan simulasi. Tidak berafiliasi dengan perusahaan atau institusi mana pun.</p>
      </footer>
    </div>
  );
}
