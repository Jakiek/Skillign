import type { Analitik, Bidang } from '../src/domain/types';
import { rekomendasiTalenta } from '../src/domain/skor';
import type { Database } from './database';
import { daftarTalenta, daftarTantangan } from './queries';

export async function bacaAnalitik(db: Database): Promise<Analitik> {
  const [ringkasan, permintaan, kesenjangan, bidang, tantangan, talenta] = await Promise.all([
    db.query(`SELECT tantangan_terbuka AS "tantanganTerbuka", jumlah_talenta AS "jumlahTalenta",
      jumlah_minat AS "jumlahMinat", tantangan_punya_minat AS "punyaMinat" FROM v_ringkasan_program`),
    db.query(`SELECT skill_id AS "skillId", nama, permintaan::int FROM v_permintaan_skill
      ORDER BY permintaan DESC, nama, skill_id LIMIT 10`),
    db.query(`SELECT skill_id AS "skillId", nama, permintaan::int, ketersediaan::int, rasio::float8
      FROM v_kesenjangan_skill ORDER BY permintaan DESC, nama, skill_id LIMIT 10`),
    db.query(`SELECT bidang, jumlah::int FROM v_tantangan_per_bidang ORDER BY jumlah DESC, bidang`),
    daftarTantangan(db), daftarTalenta(db),
  ]);
  const row = ringkasan.rows[0];
  const terbuka = Number(row.tantanganTerbuka);
  // Satu-satunya hitungan analitik di luar SQL: menggunakan rumus domain yang sama.
  const punyaKandidat = tantangan.filter((t) => (rekomendasiTalenta(t, talenta, 1)[0]?.hasil.skor ?? 0) >= 60).length;
  const namaBidang: Record<Bidang, string> = { web: 'Web', data: 'Data', iot: 'IoT', desain: 'Desain', ai: 'AI' };
  return {
    ringkasan: { tantanganTerbuka: terbuka, jumlahTalenta: Number(row.jumlahTalenta), jumlahMinat: Number(row.jumlahMinat),
      persenPunyaKandidat: terbuka ? Math.round(1000 * punyaKandidat / terbuka) / 10 : 0 },
    permintaanSkill: permintaan.rows.map((s) => ({ skillId: String(s.skillId), nama: String(s.nama), permintaan: Number(s.permintaan) })),
    kesenjanganSkill: kesenjangan.rows.map((s) => ({ skillId: String(s.skillId), nama: String(s.nama), permintaan: Number(s.permintaan), ketersediaan: Number(s.ketersediaan), rasio: s.rasio === null ? null : Number(s.rasio) })),
    tantanganPerBidang: bidang.rows.map((b) => ({ bidang: b.bidang as Bidang, nama: namaBidang[b.bidang as Bidang], jumlah: Number(b.jumlah) })),
    funnel: [{ tahap: 'Tantangan terbuka', jumlah: terbuka }, { tahap: 'Punya kandidat ≥60', jumlah: punyaKandidat }, { tahap: 'Punya minat', jumlah: Number(row.punyaMinat) }],
  };
}
