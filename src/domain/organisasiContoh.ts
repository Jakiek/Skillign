// Organisasi fiktif untuk data contoh, meniru sektor program magang industri.
// Urutan menentukan ID organisasi 1–8 di seed; `index` menentukan tantangan seed
// yang memakai judul topik organisasi tersebut. Ubah keduanya hanya bila angka
// analitik seed memang boleh berubah.
export const organisasiContoh = [
  { nama: 'PT Akuatek Nusantara Contoh', topik: 'AI untuk sistem monitoring tambak', index: 4 },
  { nama: 'PT Sensorik Angkasa Contoh', topik: 'Pengembangan perangkat lidar dan komunikasi', index: 7 },
  { nama: 'CV Drone Survei Contoh', topik: 'Integrasi rangka dan PCB drone', index: 2 },
  { nama: 'PT Otonom Visi Contoh', topik: 'Deteksi objek umum berbasis visi', index: 9 },
  { nama: 'CV Instrumen Presisi Contoh', topik: 'Perakitan drone untuk misi pemetaan', index: 12 },
  { nama: 'PT Solusi Digital Contoh', topik: 'Asisten AI untuk dukungan teknis', index: 14 },
  { nama: 'PT Analitika Data Contoh', topik: 'Pipeline ETL dan ingest data', index: 1 },
  { nama: 'PT Mobilitas Cerdas Contoh', topik: 'Prediksi kepadatan penumpang transportasi umum', index: 6 },
] as const;
