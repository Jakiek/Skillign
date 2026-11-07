# Jembatan

Prototipe matchmaking industri–akademik untuk portofolio Naufal Dzaky.
**Prototipe konsep · Data contoh**: semua data yang akan digunakan bersifat sintetis; tidak ada afiliasi resmi dengan organisasi mana pun.

## Menjalankan

Gunakan Node.js 22 LTS (`nvm use` bila tersedia), kemudian:

```sh
npm ci
npm run dev
```

Buka URL lokal yang dicetak Vite. Untuk pemeriksaan:

```sh
npm run lint
npm run build
```

## Mencoba dengan data contoh tanpa Neon

Jalankan di dua terminal dari folder `jembatan`:

```sh
# Terminal 1: API + PostgreSQL tertanam sementara
npm run dev:contoh
```

```sh
# Terminal 2: frontend
npm run dev
```

Buka URL yang dicetak Vite. Mode ini memakai data sintetis dan tidak membaca atau mengubah database Neon. Data hanya berada dalam memori dan dibuat ulang setiap server contoh dijalankan. PGlite adalah dependensi pengembangan; adapter produksi tetap memakai `pg`. Jangan jalankan `dev:server` dan `dev:contoh` bersamaan karena keduanya menggunakan port 3001.

Halaman tersedia: `/`, `/tantangan`, `/tantangan/:id`, `/talenta`, `/talenta/:id`, `/tantangan/baru`, dan `/analitik`. Filter bidang serta skill tersimpan dalam URL dan ikut berubah saat Back/Forward browser digunakan. Filter mobile dapat dibuka melalui tombol **Filter tantangan**.

## Database dan API

Salin `.env.example` menjadi `.env` lalu isi `DATABASE_URL` dengan koneksi PostgreSQL khusus Jembatan. Frontend masih dapat dijalankan tanpa database.

```sh
npm run migrasi
# Di .env: ALLOW_SEED_RESET=true hanya untuk database contoh ini.
npm run seed
npm run dev:server
```

Seed mengosongkan tabel proyek dalam satu transaksi, mereset ID, lalu mengisi 40 skill, 12 organisasi fiktif (8 industri, 4 kampus), 30 tantangan, 60 talenta, dan 40 minat. Seed acak 2027 dan timestamp tetap membuat hasil pengulangan identik. Jangan gunakan pada database berisi data yang ingin dipertahankan.

Frontend Vite meneruskan `/api` ke Express di `127.0.0.1:3001`:

- `GET /api/skill`: katalog skill.
- `GET /api/organisasi`: organisasi fiktif untuk pilihan form.
- `GET /api/tantangan`: tantangan terbuka, organisasi, kebutuhan skill, dan jumlah minat.
- `GET /api/tantangan?bidang=web&skill=react,typescript`: semua skill terpilih harus tersedia (AND); slug dinormalkan ke huruf kecil.
- `GET /api/talenta`: profil talenta dan level skill.
- `GET /api/analitik`: ringkasan program, 10 permintaan skill teratas, kesenjangan, distribusi bidang, dan corong.
- `POST /api/tantangan`: simpan tantangan dan skill dalam satu statement atomik; respons 201 `{ id }`.
- `POST /api/minat`: catat minat pada tantangan terbuka; respons 201 `{ id }`, atau 409 untuk duplikat/tantangan ditutup.
- `GET /api/tantangan/:id`: `{ tantangan, rekomendasi }`, maksimal lima kandidat dengan `{ talenta, hasil }`.
- `GET /api/talenta/:id`: `{ talenta, rekomendasi, saranBelajar }`, maksimal lima tantangan terbuka dengan `{ tantangan, hasil }` dan maksimal tiga slug skill untuk dipelajari.

Setiap `hasil` berisi `skor`, `wajibCocok`, `wajibKurang`, dan `tambahanCocok`. ID harus bilangan bulat positif dalam rentang PostgreSQL INT; format salah menghasilkan 400, data tidak ditemukan 404. Detail tantangan ditutup masih dapat dibaca, tetapi tantangan tersebut tidak direkomendasikan ke talenta.

Respons daftar berupa array JSON. Filter salah menghasilkan 400, endpoint tak dikenal 404, dan kegagalan database 500 dengan `{ error: string }` tanpa detail internal.

## Membuat tantangan dan mengajukan minat

Form `/tantangan/baru` memilih organisasi yang sudah tersedia. Payload `POST /api/tantangan`:

```json
{
  "judul": "Portal katalog contoh",
  "deskripsi": "Bangun prototipe katalog menggunakan data sintetis.",
  "organisasiId": 1,
  "bidang": "web",
  "durasiBulan": 2,
  "skillWajib": ["react", "typescript"],
  "skillTambahan": ["figma"]
}
```

Judul 5–100 karakter, deskripsi 20–1000, durasi 1–6 bulan, wajib 1–5 skill, tambahan 0–5. Slug dinormalkan ke huruf kecil; duplikat dan irisan wajib/tambahan ditolak. Label `data_contoh=TRUE` ditentukan server. Referensi organisasi/skill yang tidak ditemukan ditolak tanpa meninggalkan tantangan setengah jadi. Setelah berhasil, form menuju detail baru beserta rekomendasi.

Tombol **Ajukan minat** membuka dialog native dengan pilihan talenta dan pesan opsional maksimal 1000 karakter. Payload: `{ "tantanganId": 1, "talentaId": 60, "pesan": "Pesan contoh" }`. Constraint unik dan `ON CONFLICT DO NOTHING` memastikan hanya satu minat tersimpan per pasangan, termasuk saat permintaan bersamaan. UI menampilkan penolakan tanpa menghapus pilihan. Tantangan ditutup menolak minat baru.

Form menampilkan error di bawah field dan pesan kegagalan server tanpa alert browser. Tombol penyimpanan dinonaktifkan selama permintaan; sukses ditandai toast tiga detik. Penutupan dialog selama penyimpanan dinonaktifkan agar status pengiriman tetap jelas. Pengujian jsdom mensimulasikan buka/tutup dialog; fokus terkurung dan perilaku Esc native masih perlu pemeriksaan browser nyata.

## Cara kerja skor

Rumus hanya ada di `src/domain/skor.ts` dan dipanggil server, tanpa menyimpan skor ke database. Skor merupakan nilai kecocokan 0–100, bukan probabilitas.

- Bobot level untuk skill wajib: dasar 0.6, menengah 0.85, mahir 1.
- Cakupan wajib = jumlah bobot skill wajib yang dimiliki / jumlah skill wajib.
- Cakupan tambahan = jumlah skill tambahan yang dimiliki / jumlah skill tambahan.
- Skor = `round(100 × (0.8 × cakupanWajib + 0.2 × cakupanTambahan))`.
- Tanpa skill tambahan, skor = `round(100 × cakupanWajib)`.

Contoh manual: tantangan membutuhkan React dan SQL sebagai wajib, Figma sebagai tambahan. Talenta memiliki React mahir (1), SQL menengah (0.85), dan Figma dasar. Cakupan wajib = `(1 + 0.85) / 2 = 0.925`; cakupan tambahan = `1 / 1 = 1`. Skor = `round(100 × (0.8 × 0.925 + 0.2 × 1)) = 94`. Pengujian integrasi memasang pasangan ini dalam transaksi sementara dan memastikan API mengembalikan 94 beserta alasannya.

Skill lain tidak menurunkan skor. Kebutuhan skill diperlakukan sebagai himpunan; duplikat tidak menggandakan bobot. Input tanpa skill wajib ditolak fungsi domain karena tantangan valid harus memiliki minimal satu skill wajib.

Rekomendasi diurutkan berdasarkan skor turun, nama/judul naik dengan locale Indonesia, lalu ID naik jika masih sama. Saran belajar menghitung frekuensi skill wajib yang kurang pada lima rekomendasi teratas, dengan urutan slug naik sebagai pemecah seri.

## Pengujian

```sh
npm run test:run
npm run lint
npm run build
```

Pengujian integrasi memakai PostgreSQL tertanam PGlite dalam memori, menjalankan SQL migrasi dan seed yang sama dengan aplikasi, lalu memanggil Express melalui Supertest. Pengujian tidak membutuhkan `.env` atau akun Neon. Supertest membutuhkan izin membuka port localhost sementara. Pengujian UI memakai Testing Library dan jsdom untuk interaksi filter, navigasi, pemuatan, error, dan respons asinkron; ini tidak menggantikan pemeriksaan visual di browser.

## Sumber analitik

Semua hitungan agregat berasal dari view SQL di `002_view_analitik.sql`:

| View | Makna |
| --- | --- |
| `v_permintaan_skill` | Jumlah tantangan terbuka yang membutuhkan skill wajib. |
| `v_ketersediaan_skill` | Jumlah talenta yang memiliki skill, pada semua level. |
| `v_kesenjangan_skill` | Permintaan, ketersediaan, dan rasio keduanya; rasio NULL ketika ketersediaan nol. |
| `v_tantangan_per_bidang` | Jumlah tantangan terbuka per bidang. |
| `v_minat_per_tantangan` | Minat per tantangan; `COUNT(m.id)` menjaga nilai nol saat belum ada minat. |
| `v_ringkasan_program` | Total tantangan terbuka, talenta, seluruh minat tercatat, dan tantangan terbuka yang punya minat. |

Pengecualian yang mengikuti arsitektur: server memanggil fungsi domain untuk menghitung tantangan dengan minimal satu kandidat berskor ≥60, lalu menurunkan persentasenya terhadap tantangan terbuka. Jika tidak ada tantangan, persentasenya nol. Komponen hanya menampilkan hasil API.

Dua kelompok terakhir pada corong dihitung mandiri: minat tidak mensyaratkan skor ≥60, sehingga jumlahnya tidak harus menurun. Ini bukan rasio konversi atau alokasi talenta. Tantangan ditutup dikecualikan dari permintaan, bidang, dan corong; kartu jumlah minat tetap mencakup seluruh minat tercatat.

Grafik memakai Recharts dengan tabel data yang dapat dibuka sebagai alternatif aksesibel. Halaman grafik dimuat terpisah agar kode grafik tidak masuk unduhan awal halaman daftar. Pemeriksaan visual browser dan target waktu muat <2 detik pada hosting masih perlu diverifikasi.

## QA dan kesiapan rilis

83 pengujian otomatis, lint, dan build lolos. Lihat [laporan QA](docs/QA.md) untuk bukti, perbaikan Fase 6, status dependensi, serta langkah verifikasi browser. Audit dependency masih melaporkan 9 temuan moderate (0 high/critical).

Screenshot asli desktop/mobile belum tersedia karena browser pengujian gagal tersambung. Kode MVP belum dinyatakan siap rilis publik sampai pemeriksaan visual, dialog native, dependensi, koneksi Neon, dan deployment selesai.

## Status

Kode fondasi data tersedia dan diuji lokal. Adapter Vercel dan rewrite SPA/API telah disiapkan; belum diverifikasi pada hosting Vercel. Koneksi Neon, repo publik, dan deploy ditunda selama fokus coding. Mesin kecocokan dua arah dan API detail tersedia. Halaman daftar/detail tantangan dan talenta, filter URL, alasan rekomendasi, serta saran belajar tersedia. Analitik dengan empat grafik dan ringkasan angka beranda tersedia. Form buat tantangan dan pengajuan minat tersedia dengan validasi Zod bersama di klien/server. Verifikasi visual dan perilaku dialog native pada browser masih tertunda.

Runtime proyek menargetkan Node 22 LTS (`.nvmrc`); pengujian sesi pengembangan awal memakai Node 25.8.2. Tidak ada perubahan pada keputusan domain yang dikunci.

Lihat `PROJECTBRIEF.md`, `docs/ROADMAP.md`, dan `docs/ARCHITECTURE.md` untuk cakupan dan urutan pengerjaan.
