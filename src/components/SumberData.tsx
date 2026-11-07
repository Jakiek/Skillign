import { sumberDteti } from '../domain/sumber';
export function SumberData({ url = sumberDteti, topikPublik }: { url?: string; topikPublik?: boolean }) {
  const keterangan = topikPublik === true
    ? 'Nama organisasi dan judul topik ini mengacu pada sumber DTETI 2027. Deskripsi, skill, bidang, durasi, kandidat, dan minat adalah Data contoh.'
    : topikPublik === false
      ? 'Proyek ini dibuat untuk simulasi Skillign. Nama organisasi dapat merujuk daftar publik; judul, deskripsi, skill, bidang, durasi, kandidat, dan minat bukan informasi resmi organisasi.'
      : 'Delapan nama mitra dan topik terpilih mengacu pada daftar DTETI 2027. Proyek lainnya, skill, durasi, kandidat, dan minat adalah Data contoh.';
  return <aside className="rounded-xl border border-line bg-brand-soft p-4 text-sm leading-6"><p className="font-semibold text-brand">Referensi publik · Simulasi Skillign</p><p className="mt-1 text-muted">{keterangan} Bukan informasi pendaftaran resmi dan tidak menyiratkan afiliasi.</p><a className="mt-2 inline-block font-semibold text-brand underline" href={url} target="_blank" rel="noreferrer">Baca sumber DTETI 2027<span className="sr-only"> (tab baru)</span></a></aside>;
}
