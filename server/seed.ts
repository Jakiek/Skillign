import { mitraReferensi, sumberDteti } from '../src/domain/sumber';
import type { Database } from './database';

const katalog = {
  web: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Express'],
  data: ['SQL', 'Python', 'pandas', 'Power BI', 'PostgreSQL', 'Excel', 'ETL', 'Statistik'],
  desain: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design System', 'Usability Testing', 'Wireframing', 'Aksesibilitas'],
  hardware: ['Arduino', 'ROS', 'ESP32', 'MQTT', 'C++', 'Sensor', 'Embedded Systems', 'Raspberry Pi'],
  manajemen: ['Git', 'Docker', 'Scrum', 'Dokumentasi', 'Komunikasi', 'Manajemen Proyek', 'Presentasi', 'Analisis Kebutuhan'],
};
const slug = (nama: string) => ({ 'Next.js': 'nextjs', 'Node.js': 'nodejs', 'C++': 'cpp' })[nama] ?? nama.toLowerCase().replaceAll(' ', '-');

function mulberry32(seed: number) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const pola = [
  { bidang: 'web', wajib: ['react', 'typescript'], tambahan: ['figma', 'git'], judul: ['Portal pemesanan bahan', 'Katalog produk usaha', 'Panel inventaris bengkel', 'Portal layanan pelanggan', 'Pelacakan pesanan produksi', 'Sistem reservasi ruang'] },
  { bidang: 'data', wajib: ['sql', 'python'], tambahan: ['power-bi', 'etl'], judul: ['Analitik penjualan harian', 'Pipeline data persediaan', 'Dashboard mutu produksi', 'Laporan pemakaian energi', 'Analisis keterlambatan kiriman', 'Pemetaan kebutuhan pelatihan'] },
  { bidang: 'iot', wajib: ['esp32', 'mqtt'], tambahan: ['arduino', 'sensor'], judul: ['Pemantauan suhu gudang', 'Pencatatan kelembapan kebun', 'Pengukur konsumsi listrik', 'Sensor kapasitas tangki', 'Monitor kualitas udara', 'Pencatat kondisi mesin'] },
  { bidang: 'desain', wajib: ['figma', 'ux-research'], tambahan: ['prototyping', 'aksesibilitas'], judul: ['Riset portal pemasok', 'Prototipe layanan perpustakaan', 'Desain pemesanan kantin', 'Evaluasi formulir pendaftaran', 'Sistem desain katalog', 'Uji kegunaan aplikasi logistik'] },
  { bidang: 'ai', wajib: ['python', 'statistik'], tambahan: ['pandas', 'docker'], judul: ['Klasifikasi umpan balik', 'Prediksi kebutuhan bahan', 'Deteksi anomali sensor', 'Pengelompokan produk', 'Evaluasi model permintaan', 'Pencarian dokumen internal'] },
];

// Hanya untuk database contoh khusus Skillign. Seluruh reset berada dalam transaksi.
export async function isiDataContoh(db: Database) {
  const random = mulberry32(2027);
  const pilih = (n: number) => Math.floor(random() * n);
  const waktu = '2026-01-01T00:00:00Z';
  await db.query('BEGIN');
  try {
    await db.query('TRUNCATE minat, talenta_skill, tantangan_skill, talenta, tantangan, organisasi, skill RESTART IDENTITY');
    for (const [kategori, namaSkill] of Object.entries(katalog)) {
      for (const nama of namaSkill) await db.query('INSERT INTO skill VALUES ($1, $2, $3)', [slug(nama), nama, kategori]);
    }
    const organisasi = [...mitraReferensi.map((m) => m.nama), 'Institut Cakrawala Contoh', 'Politeknik Reka Contoh', 'Universitas Lentera Contoh', 'Akademi Simpul Contoh'];
    for (const [i, nama] of organisasi.entries()) {
      await db.query('INSERT INTO organisasi (nama, jenis, kota, sumber_url) VALUES ($1,$2,$3,$4)', [nama, i < 8 ? 'industri' : 'kampus', i < 8 ? 'Lokasi belum diverifikasi' : 'Kota contoh', i < 8 ? sumberDteti : null]);
    }

    for (let i = 0; i < 30; i++) {
      const polaTantangan = pola[i % 5];
      const referensi = mitraReferensi.find((m) => m.index === i);
      const organisasiId = referensi ? mitraReferensi.indexOf(referensi) + 1 : 1 + i % 12;
      const judul = referensi?.topik ?? polaTantangan.judul[Math.floor(i / 5)];
      await db.query(`INSERT INTO tantangan (organisasi_id, judul, deskripsi, bidang, durasi_bulan, data_contoh, dibuat_pada, sumber_url)
        VALUES ($1,$2,$3,$4,$5,TRUE,$6,$7)`, [organisasiId, judul,
        `Data contoh: ${judul}. ${referensi ? 'Judul topik mengacu pada halaman publik DTETI. ' : ''}Deskripsi pekerjaan, bidang, skill wajib/tambahan, durasi, talenta, dan minat merupakan simulasi Skillign, bukan persyaratan atau lowongan resmi organisasi.`, polaTantangan.bidang, 1 + pilih(6), waktu, referensi ? sumberDteti : null]);
      for (const [wajib, skill] of [[true, polaTantangan.wajib], [false, polaTantangan.tambahan]] as const) {
        for (const id of skill) await db.query('INSERT INTO tantangan_skill VALUES ($1,$2,$3)', [i + 1, id, wajib]);
      }
    }
    const depan = ['Aruna', 'Bima', 'Citra', 'Damar', 'Elok', 'Faras', 'Gita', 'Harsa', 'Intan', 'Jati'];
    const belakang = ['Pradana', 'Laras', 'Kirana', 'Wisesa', 'Nirmala', 'Sasmita'];
    // Web dan SQL lebih jarang tersedia dibanding skill desain/hardware.
    const kelompok = [katalog.web, katalog.data, katalog.desain, katalog.hardware, katalog.manajemen];
    for (let i = 0; i < 60; i++) {
      const kampus = organisasi[8 + i % 4];
      await db.query(`INSERT INTO talenta (nama, peran, prodi, kampus, bio, data_contoh, dibuat_pada)
        VALUES ($1,$2,$3,$4,$5,TRUE,$6)`, [`${depan[i % 10]} ${belakang[Math.floor(i / 10)]}`, i % 10 === 0 ? 'dosen' : 'mahasiswa',
        ['Teknologi Informasi', 'Teknik Elektro', 'Sistem Informasi'][i % 3], kampus,
        'Profil fiktif untuk demonstrasi kecocokan skill pada Skillign.', waktu]);
      const utama = kelompok[i < 6 ? 0 : i < 12 ? 1 : 2 + i % 3];
      const skill = new Set<string>();
      while (skill.size < 4) skill.add(slug(utama[pilih(utama.length)]));
      skill.add('git');
      skill.add('komunikasi');
      for (const id of skill) await db.query('INSERT INTO talenta_skill VALUES ($1,$2,$3)', [i + 1, id, 1 + pilih(3)]);
    }
    // Pasangan unik, dengan sejumlah tantangan tanpa minat untuk analitik.
    for (let i = 0; i < 40; i++) {
      await db.query(`INSERT INTO minat (tantangan_id, talenta_id, pesan, dibuat_pada) VALUES ($1,$2,$3,$4)`,
        [1 + i % 20, 1 + i, 'Data contoh: tertarik berkontribusi pada prototipe ini.', waktu]);
    }
    await db.query('COMMIT');
  } catch (error) { await db.query('ROLLBACK'); throw error; }
}
