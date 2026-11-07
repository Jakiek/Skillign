import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Analitik } from '../domain/types';
import { useApi } from '../hooks/useApi';
import { DataContoh, Etat, Judul, Kosong } from '../components/Ui';
import { RingkasanProgram } from '../components/RingkasanProgram';
import type { ReactNode } from 'react';

function KartuGrafik({ title, cara, children, tabel }: { title: string; cara: string; children: ReactNode; tabel: ReactNode }) {
  return <section className="card"><h2 className="text-xl font-semibold">{title}</h2><p className="mb-5 mt-2 text-sm leading-6 text-muted">Cara membaca: {cara}</p>{children}<details className="mt-5 border-t border-line pt-4"><summary className="cursor-pointer text-sm font-semibold text-brand">Lihat tabel data: {title}</summary><div className="mt-3 overflow-x-auto">{tabel}</div></details></section>;
}
function Tabel({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return <table className="w-full text-left text-sm"><thead><tr>{headers.map((h) => <th key={h} scope="col" className="border-b border-line p-2 font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => j === 0 ? <th key={j} scope="row" className="border-b border-line p-2 font-normal">{v}</th> : <td key={j} className="border-b border-line p-2 tabular-nums">{v}</td>)}</tr>)}</tbody></table>;
}
function GrafikBatang({ data, kategori, horizontal = false, series }: { data: object[]; kategori: string; horizontal?: boolean; series: { key: string; nama: string; warna: string }[] }) {
  if (!data.length) return <Kosong>Belum ada data untuk ditampilkan.</Kosong>;
  return <div className="h-80 min-w-0" aria-label="Grafik batang; data lengkap tersedia pada tabel di bawah"><ResponsiveContainer width="100%" height="100%" minWidth={0}>
    <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, bottom: 24, left: 0 }} accessibilityLayer>
      <CartesianGrid stroke="rgb(var(--line))" horizontal={!horizontal} vertical={horizontal} />
      <XAxis type={horizontal ? 'number' : 'category'} dataKey={horizontal ? undefined : kategori} allowDecimals={false} tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} interval={0} angle={horizontal ? 0 : -30} textAnchor={horizontal ? 'middle' : 'end'} />
      <YAxis type={horizontal ? 'category' : 'number'} dataKey={horizontal ? kategori : undefined} width={horizontal ? 140 : 36} allowDecimals={false} tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} />
      <Tooltip contentStyle={{ background: 'rgb(var(--card))', color: 'rgb(var(--ink))', borderColor: 'rgb(var(--line))', borderRadius: 8 }} labelStyle={{ color: 'rgb(var(--ink))' }} cursor={{ fill: 'rgb(var(--brand-soft))' }} /><Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
      {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.nama} fill={s.warna} isAnimationActive={false} />)}
    </BarChart>
  </ResponsiveContainer></div>;
}
export function HalamanAnalitik() {
  const api = useApi<Analitik>('analitik');
  const data = api.data;
  return <><Judul title="Insights">Bandingkan permintaan skill pada proyek dengan ketersediaannya pada profil kandidat. Seluruh angka berasal dari Data contoh.</Judul><Etat {...api}>{data && <><div className="mb-4"><DataContoh /></div><RingkasanProgram data={data.ringkasan} /><p className="mb-8 mt-3 text-xs leading-5 text-muted">Proyek dinilai memiliki kandidat sesuai jika minimal satu profil mencapai skor ≥60. Satu kandidat dapat sesuai dengan beberapa proyek.</p><div className="grid gap-6 xl:grid-cols-2">
    <KartuGrafik title="10 skill paling dicari" cara="batang menunjukkan jumlah proyek yang membutuhkan setiap skill wajib." tabel={<Tabel headers={['Skill', 'Permintaan']} rows={data.permintaanSkill.map((s) => [s.nama, s.permintaan])} />}><GrafikBatang data={data.permintaanSkill} kategori="nama" horizontal series={[{ key: 'permintaan', nama: 'Proyek', warna: 'rgb(var(--brand))' }]} /></KartuGrafik>
    <KartuGrafik title="Kesenjangan skill" cara="bandingkan jumlah proyek yang membutuhkan skill dengan jumlah kandidat yang memilikinya pada semua level. Angka ini tidak menunjukkan alokasi kandidat." tabel={<Tabel headers={['Skill', 'Permintaan', 'Ketersediaan', 'Rasio']} rows={data.kesenjanganSkill.map((s) => [s.nama, s.permintaan, s.ketersediaan, s.rasio === null ? 'Tanpa talenta' : s.rasio.toLocaleString('id-ID')])} />}><GrafikBatang data={data.kesenjanganSkill} kategori="nama" series={[{ key: 'permintaan', nama: 'Permintaan', warna: 'rgb(var(--brand))' }, { key: 'ketersediaan', nama: 'Ketersediaan', warna: '#C9741F' }]} /></KartuGrafik>
    <KartuGrafik title="Proyek per bidang" cara="jumlah proyek terbuka per bidang. Proyek ditutup tidak ikut dihitung." tabel={<Tabel headers={['Bidang', 'Proyek']} rows={data.tantanganPerBidang.map((s) => [s.nama, s.jumlah])} />}><GrafikBatang data={data.tantanganPerBidang} kategori="nama" series={[{ key: 'jumlah', nama: 'Proyek', warna: 'rgb(var(--brand))' }]} /></KartuGrafik>
    <KartuGrafik title="Corong kolaborasi" cara="lihat proyek terbuka, proyek dengan kandidat sesuai, dan proyek yang menerima minat. Dua kelompok terakhir dihitung mandiri, sehingga jumlahnya tidak harus menurun; minat dapat diajukan tanpa skor ≥60." tabel={<Tabel headers={['Tahap', 'Proyek']} rows={data.funnel.map((s) => [s.tahap, s.jumlah])} />}><GrafikBatang data={data.funnel} kategori="tahap" horizontal series={[{ key: 'jumlah', nama: 'Proyek', warna: 'rgb(var(--brand))' }]} /></KartuGrafik>
    </div></>}</Etat></>;
}
