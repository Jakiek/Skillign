export function CatatanDataContoh({ dibuatPengunjung = false }: { dibuatPengunjung?: boolean }) {
  return <aside className="rounded-xl border border-line bg-brand-soft p-4 text-sm leading-6"><p className="font-semibold text-brand">Data contoh · Prototipe konsep</p><p className="mt-1 text-muted">Semua organisasi, proyek, kandidat, dan minat di Skillign adalah data fiktif untuk demonstrasi. Skor menunjukkan kecocokan berbasis aturan, bukan probabilitas diterima.{dibuatPengunjung && ' Proyek ini dibuat oleh pengunjung demo dan belum ditinjau.'}</p></aside>;
}
