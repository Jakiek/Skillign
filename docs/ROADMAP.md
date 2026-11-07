# ROADMAP — Jembatan

## Ringkasan proyek

Prototipe platform matchmaking industri–akademik dengan halaman analitik, dibangun dalam **±1 hari**. Detail kebutuhan di [`../PROJECTBRIEF.md`](../PROJECTBRIEF.md).

## Aturan main sepanjang proyek

1. **Selesaikan satu fase sampai *definition of done*, baru lanjut.**
2. **Deploy sejak awal** (Fase 1), bukan di akhir. Deploy terakhir-menit hampir selalu bermasalah.
3. **Setiap fase ditutup dengan commit yang rapi** dan pesan commit yang menjelaskan apa yang berubah.
4. **Kalau tertinggal dari jadwal, pakai *cut list*** di bagian bawah. Jangan mengorbankan jam tidur untuk fitur yang bisa dipotong.

## Peta fase

| Fase | Isi | Waktu | Jam (contoh) |
|---|---|---|---|
| 0 | Persiapan repo & keputusan | 30 mnt | 07.00–07.30 |
| 1 | Fondasi: skema, seed, API dasar, deploy pertama | 2 jam | 07.30–09.30 |
| 2 | Mesin skor + test | 1,5 jam | 09.30–11.00 |
| 3 | Halaman tantangan & talenta + rekomendasi | 2,5 jam | 11.00–13.30 + istirahat |
| 4 | Analitik (view SQL + grafik) | 2 jam | 14.00–16.00 |
| 5 | Form buat tantangan + ajukan minat | 1,5 jam | 16.00–17.30 |
| 6 | Poles, README, screenshot, deploy final | 1,5 jam | 19.00–20.30 |

Total ±11,5 jam termasuk jeda. Fase 5 adalah kandidat pertama untuk dipotong.

---

## Fase 0 — Persiapan (30 menit)

Status 7 November 2026:
- [x] Fondasi Vite + React 18 + TypeScript strict + Tailwind tersedia.
- [x] Header dan label "Prototipe konsep · Data contoh" tersedia.
- [x] `.env`, bahan pribadi, dan output build masuk `.gitignore`.
- [x] `npm run lint` dan `npm run build` lolos; server dev memberi HTTP 200.
- [ ] Verifikasi visual desktop/mobile (browser pengujian gagal pada metadata sandbox).
- [ ] Repo GitHub publik, project Neon, dan `DATABASE_URL` belum disiapkan.

Fase 0 belum ditandai selesai seluruhnya. Tidak ada commit atau publikasi pada tahap ini.


### Yang dikerjakan
- Buat repo `jembatan` di GitHub (public).
- Salin `PROJECTBRIEF.md`, `.gitignore`, dan folder `docs/` ke repo. **Pastikan `.gitignore` ada sebelum commit pertama.**
- Buat project Neon baru, simpan `DATABASE_URL` di `.env` (jangan di-commit).
- Inisialisasi Vite + React + TS + Tailwind (salin konfigurasi dari Stock Tracker bila perlu).

### Definition of done
- `npm run dev` menampilkan halaman kosong dengan header.
- `.env` ada di `.gitignore`.

---

## Fase 1 — Fondasi (2 jam)

Status coding:
- [x] Migrasi skema transaksional dengan pencatatan versi.
- [x] Seed tetap, reset transaksional, dan pengaman `ALLOW_SEED_RESET`.
- [x] API daftar skill, tantangan (filter bidang dan semua skill), serta talenta.
- [x] Adapter Vercel dan konfigurasi rewrite disiapkan.
- [x] Pengujian integrasi SQL/API lokal, lint, dan build.
- [ ] Verifikasi koneksi Neon dan deploy Vercel ditunda atas arahan pemilik untuk fokus coding.

Arahan pemilik: selesaikan coding per milestone; catatan belajar dan tanya jawab wawancara disiapkan setelah Jembatan dan Getar selesai. Fase 1 belum dinyatakan selesai untuk cakupan hosting.


### Yang dikerjakan
- `server/migrations.ts` dengan `001_skema.sql` (ARCHITECTURE § 4.1).
- `server/seed.ts` sesuai ARCHITECTURE § 8 (seed tetap).
- Express: `GET /api/skill`, `GET /api/tantangan`, `GET /api/talenta`.
- `api/index.ts` + `vercel.json`, lalu **deploy pertama ke Vercel**.

### Definition of done
- `npm run migrasi && npm run seed` mengisi database tanpa error, dan menjalankan seed dua kali menghasilkan data yang sama.
- URL Vercel `/api/tantangan` mengembalikan JSON berisi 30 tantangan.

### Jebakan
- Lupa mengatur `DATABASE_URL` di environment variable Vercel.
- Seed tidak idempoten (data dobel). Kosongkan tabel di awal seed.

---

## Fase 2 — Mesin skor + test (1,5 jam)

Status coding:
- [x] Fungsi murni skor, rekomendasi dua arah, dan saran belajar.
- [x] API detail tantangan dan talenta, termasuk validasi ID serta error 404.
- [x] Urutan stabil: skor turun, nama/judul naik, lalu ID naik.
- [x] Pengujian domain dan integrasi API, lint, serta build lolos.
- [x] Contoh hitung manual 94 di README diverifikasi melalui API.

Milestone coding Fase 2 selesai. Pengujian database menggunakan PGlite lokal; hosting tetap ditunda.


### Yang dikerjakan
- `src/domain/types.ts`, `src/domain/skor.ts` sesuai ARCHITECTURE § 5.
- `src/domain/skor.test.ts` dengan 8 kasus di § 5.4.
- `GET /api/tantangan/:id` dan `GET /api/talenta/:id` memakai fungsi domain.

### Definition of done
- `npm run test:run` hijau, 8 kasus atau lebih.
- Satu contoh skor dihitung dengan tangan di README (bagian "Cara kerja skor") dan hasilnya sama dengan API.

### Jebakan
- Pembagian dengan nol saat tantangan tidak punya skill tambahan.
- Urutan rekomendasi berubah-ubah karena tidak ada pemecah seri.

---

## Fase 3 — Halaman utama (2,5 jam)

Status coding:
- [x] Beranda dengan tiga tantangan terbaru.
- [x] Daftar tantangan, filter skill/bidang di URL, dan reset filter.
- [x] Daftar talenta serta detail dua arah dengan alasan rekomendasi.
- [x] Saran belajar, level skill aksesibel, dan label Data contoh.
- [x] Skeleton, state kosong, pesan error, dan coba ulang.
- [x] Panel filter mobile, layout responsif, fokus keyboard.
- [x] Mode lokal `dev:contoh` tanpa akun Neon.
- [x] 45 pengujian (termasuk tujuh interaksi UI), lint, dan build lolos.
- [ ] Verifikasi visual desktop/mobile: browser pengujian belum dapat dijalankan karena kesalahan konfigurasi lingkungan sandbox.
- [x] Ringkasan angka beranda serta tautan analitik ditambahkan pada Fase 4 dari sumber SQL.

US-1 sampai US-3 telah diimplementasikan; verifikasi visual belum selesai. Form dan pengajuan minat tetap di Fase 5. Tidak ada data statistik tiruan pada beranda.


### Yang dikerjakan
- Komponen: `Header`, `SkillChip`, `SkorBadge`, `KartuTantangan`, `KartuTalenta`, `KartuRekomendasi`, `FilterSkill`.
- Halaman: Beranda, Tantangan (dengan filter di URL), Detail Tantangan, Talenta, Detail Talenta (dengan saran belajar).
- State memuat, kosong, error (DESIGN § 7).

### Definition of done
- US-1, US-2, US-3 di PROJECTBRIEF lolos semua kriteria.
- Badge "Data contoh" terlihat.

### Jebakan
- Logika skor tertulis ulang di komponen. Komponen hanya menampilkan `HasilSkor` dari API.

---

## Fase 4 — Analitik (2 jam)

Status coding:
- [x] Migrasi 002: lima view arsitektur dan view ringkasan program, masing-masing berkomentar.
- [x] API analitik dengan kandidat ≥60 dari fungsi domain di server.
- [x] Empat grafik Recharts dengan cara membaca dan tabel data aksesibel.
- [x] Empat ringkasan angka di analitik dan beranda, navigasi analitik.
- [x] Halaman grafik dimuat terpisah dari halaman daftar.
- [x] 52 pengujian lolos, termasuk SQL kosong, rasio tanpa talenta, tantangan ditutup, dan ambang tepat 60; lint dan build berhasil.
- [ ] Verifikasi visual desktop/mobile dan target waktu muat hosting <2 detik masih tertunda.

Milestone coding analitik selesai; verifikasi visual dan hosting belum selesai. Angka corong untuk kandidat dan minat merupakan kelompok mandiri, dijelaskan di UI dan README.


### Yang dikerjakan
- Migrasi `002_view_analitik.sql` (ARCHITECTURE § 7).
- `GET /api/analitik` yang membaca semua view + menghitung satu angka funnel di server.
- Halaman Analitik: 4 `KartuAngka` + 4 `KartuGrafik` dengan kalimat "Cara membaca".

### Definition of done
- US-6 lolos.
- Setiap view punya komentar SQL satu baris yang menjelaskan isinya.

### Jebakan
- Menghitung statistik di komponen dengan `reduce()`. Pindahkan ke SQL.
- `COUNT(*)` pada `LEFT JOIN` menghitung baris kosong sebagai 1 — pakai `COUNT(m.id)`.

---

## Fase 5 — Form & minat (1,5 jam) — *boleh dipotong*

Status coding:
- [x] Skema Zod bersama untuk tantangan dan minat, normalisasi slug, batas isian, dan larangan duplikat/irisan skill.
- [x] Form Buat tantangan, dropdown organisasi, error per field, dan pengalihan ke detail baru.
- [x] Penyimpanan tantangan beserta skill atomik, seluruh tantangan baru berlabel Data contoh.
- [x] Dialog minat native, pilihan talenta, pesan opsional, penanganan 409, dan toast sukses.
- [x] Minat duplikat bersamaan hanya menyimpan satu baris; tantangan ditutup menolak minat.
- [x] 78 pengujian lolos (domain, SQL/API, UI), lint dan build berhasil.
- [ ] Pemeriksaan visual desktop/mobile dan focus trap/Esc dialog pada browser nyata masih tertunda karena lingkungan browser.

Milestone coding US-4 dan US-5 selesai; QA browser dan hosting belum selesai. Tidak ada catatan belajar atau materi wawancara baru, sesuai arahan pemilik.


### Yang dikerjakan
- `skemaTantanganBaru` (Zod) di `src/domain/schemas.ts`, dipakai form dan server.
- `POST /api/tantangan`, halaman Buat Tantangan.
- `POST /api/minat` + `DialogMinat` (409 bila duplikat).

### Definition of done
- US-4 dan US-5 lolos.

---

## Fase 6 — Poles & rilis (1,5 jam)

Status:
- [x] README mencakup setup, mode contoh lokal, rumus, API, dan sumber view SQL.
- [x] Perbaikan navigasi aktif, fokus form, judul halaman, respons API, dan aset font.
- [x] 83 pengujian, lint, dan build lolos; laporan di `docs/QA.md`.
- [x] Audit dependency dilakukan: 9 moderate, 0 high/critical; perlu ditinjau sebelum rilis.
- [ ] Verifikasi visual desktop/mobile dan dialog native terhambat error browser lingkungan.
- [ ] Tiga screenshot asli belum diambil.
- [ ] Verifikasi runtime Node 22 dan koneksi Neon belum dilakukan.
- [ ] Repo publik, deploy, dan QA URL publik ditunda.

Coding dan QA otomatis selesai; Fase 6 keseluruhan **belum selesai**. Tidak ada screenshot atau hasil verifikasi hosting yang dibuat-buat.


### Yang dikerjakan
- README: deskripsi, screenshot, cara menjalankan, rumus skor, daftar view SQL, catatan "Prototipe konsep · Data contoh".
- 3 screenshot untuk portofolio: Detail Tantangan (dengan rekomendasi), Analitik, Tantangan (dengan filter). Simpan di `docs/`.
- Cek tampilan mobile, perbaiki yang rusak.
- Deploy final, cek semua halaman di URL publik.

### Definition of done
- Link publik bisa dibuka di HP tanpa error.
- README menjelaskan rumus skor dan setiap view SQL.

---

## Cut list (kalau tertinggal)

Potong dari atas ke bawah:

1. Fase 5 seluruhnya (form & minat). Ganti dengan data minat dari seed.
2. Detail Talenta "Saran belajar".
3. Grafik funnel di Analitik (sisakan 3 grafik).
4. Tampilan mobile (pastikan desktop rapi).

**Jangan dipotong:** mesin skor + test, halaman Detail Tantangan dengan alasan kecocokan, halaman Analitik minimal 2 grafik, deploy publik, README.
