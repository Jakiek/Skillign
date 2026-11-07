# PROJECT BRIEF — Jembatan

> Platform matchmaking industri–akademik: perusahaan memasang tantangan nyata, mahasiswa dan dosen menemukan tantangan yang cocok dengan skill mereka, dan semua aktivitasnya bisa dianalisis.

Dokumen ini adalah PRD (product requirements document). Rancangan teknis ada di [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), urutan pengerjaan di [`docs/ROADMAP.md`](docs/ROADMAP.md), aturan tampilan di [`docs/DESIGN.md`](docs/DESIGN.md).

---

## 1. Ringkasan

| | |
|---|---|
| **Nama** | Jembatan |
| **Jenis** | Aplikasi web fullstack (prototipe konsep) |
| **Pemilik** | Naufal Dzaky — Teknologi Informasi UGM |
| **Tujuan utama** | Portofolio pengembangan aplikasi web dan analitik data |
| **Target waktu MVP** | 1 hari kerja (lihat ROADMAP) |
| **Status data** | **Data contoh (sintetis)**. Bukan data perusahaan atau kampus mana pun. |

### Kenapa proyek ini ada

Proyek ini menunjukkan dua kemampuan sekaligus:

1. **Pengembangan aplikasi web** — alur lengkap dari database, API, sampai antarmuka yang di-deploy.
2. **Analitik data** — halaman analitik yang menghitung permintaan skill, ketersediaan skill, dan kesenjangannya dengan SQL.

> **Catatan kejujuran.** Jembatan adalah prototipe konsep buatan sendiri. Tidak berafiliasi dengan perusahaan atau institusi mana pun. Semua nama organisasi dan orang di data contoh adalah fiktif dan diberi label "Data contoh" di antarmuka.

---

## 2. Masalah

- **Perusahaan** punya masalah teknis kecil–menengah yang cocok dikerjakan mahasiswa atau dosen, tapi tidak tahu harus mencari ke mana.
- **Mahasiswa dan dosen** punya skill yang relevan, tapi informasi peluang tersebar di grup chat, poster Instagram, dan spreadsheet.
- **Pengelola program** (misalnya tim magang departemen) tidak punya gambaran data: skill apa yang paling dicari industri, skill apa yang kurang, dan tantangan mana yang sepi peminat.

## 3. Solusi

Satu tempat untuk:

1. Memasang **tantangan** (masalah nyata dari organisasi) beserta skill yang dibutuhkan.
2. Menyimpan **profil talenta** (mahasiswa/dosen) beserta skill dan levelnya.
3. Menghitung **skor kecocokan** dua arah — tantangan → talenta yang cocok, dan talenta → tantangan yang cocok — lengkap dengan **alasan** (skill yang cocok dan yang belum ada).
4. Menyajikan **analitik** permintaan vs ketersediaan skill untuk pengelola program.

---

## 4. Pengguna

| Persona | Kebutuhan utama | Halaman utama |
|---|---|---|
| **Perwakilan industri** (mis. engineer di startup robotika) | Memasang tantangan, melihat kandidat yang paling cocok | Buat Tantangan, Detail Tantangan |
| **Mahasiswa** (mis. semester 5 TI) | Menemukan tantangan yang sesuai skill, tahu skill apa yang perlu dipelajari | Tantangan, Detail Talenta |
| **Pengelola program** (mis. tim magang departemen) | Melihat tren permintaan skill dan kesenjangan | Analitik |

Tidak ada login di MVP. Semua halaman bisa dibuka siapa pun; pembuatan tantangan dan pengajuan minat dicatat sebagai data contoh.

---

## 5. Ruang lingkup

### Masuk MVP

- Daftar tantangan dengan filter skill dan bidang.
- Detail tantangan + **5 talenta paling cocok** beserta skor dan alasannya.
- Daftar talenta + detail talenta + **5 tantangan paling cocok**.
- Form **Buat Tantangan** dengan validasi.
- Tombol **Ajukan minat** di detail tantangan (mencatat baris `minat`).
- Halaman **Analitik**: 4 grafik + ringkasan angka.
- Data contoh yang di-generate dengan seed tetap (hasil sama setiap dijalankan).
- Deploy publik + README + screenshot.

### Tidak masuk MVP (sengaja)

- Login/akun, peran, dan hak akses.
- Notifikasi email, chat, unggah file.
- Matching berbasis AI/embedding. **Skor harus bisa dijelaskan dengan aturan sederhana.**
- Edit/hapus tantangan dan profil (cukup buat baru).

---

## 6. User stories & kriteria terima

### US-1 — Melihat tantangan
Sebagai mahasiswa, saya ingin melihat daftar tantangan terbuka agar tahu peluang yang ada.
- [ ] Menampilkan judul, organisasi, bidang, durasi, dan maksimal 5 chip skill.
- [ ] Filter berdasarkan satu atau lebih skill dan satu bidang; filter tercermin di URL (`?skill=react&bidang=web`).
- [ ] Ada tampilan kosong yang jelas saat filter tidak menemukan hasil.

### US-2 — Kandidat yang cocok untuk tantangan
Sebagai perwakilan industri, saya ingin melihat kandidat paling cocok untuk tantangan saya.
- [ ] Detail tantangan menampilkan 5 talenta dengan skor tertinggi (0–100).
- [ ] Setiap kandidat menampilkan **skill wajib yang cocok**, **skill wajib yang belum dimiliki**, dan skill tambahan yang cocok.
- [ ] Urutan stabil: skor turun, lalu nama naik sebagai pemecah seri.

### US-3 — Tantangan yang cocok untuk saya
Sebagai mahasiswa, saya ingin tahu tantangan mana yang paling cocok dan skill apa yang perlu saya pelajari.
- [ ] Detail talenta menampilkan 5 tantangan dengan skor tertinggi.
- [ ] Menampilkan skill yang paling sering muncul sebagai "belum dimiliki" di tantangan-tantangan tersebut (saran belajar).

### US-4 — Membuat tantangan
Sebagai perwakilan industri, saya ingin memasang tantangan baru.
- [ ] Form: judul (5–100 karakter), deskripsi (20–1000), organisasi, bidang, durasi (1–6 bulan), skill wajib (1–5), skill tambahan (0–5).
- [ ] Validasi dengan Zod di klien dan server (skema yang sama).
- [ ] Setelah simpan, pengguna diarahkan ke detail tantangan baru dan langsung melihat kandidat yang cocok.

### US-5 — Mengajukan minat
- [ ] Tombol "Ajukan minat" di detail tantangan membuka dialog: pilih talenta (dropdown) + pesan opsional.
- [ ] Satu talenta hanya bisa mengajukan minat sekali per tantangan (dicegah di database dan dijelaskan di UI).

### US-6 — Analitik program
Sebagai pengelola program, saya ingin melihat permintaan dan ketersediaan skill.
- [ ] Ringkasan angka: jumlah tantangan terbuka, talenta, minat, dan **persentase tantangan yang punya minimal satu kandidat dengan skor ≥ 60**.
- [ ] Grafik 1: 10 skill paling dicari (dari skill wajib).
- [ ] Grafik 2: **kesenjangan skill** — permintaan vs ketersediaan untuk 10 skill teratas.
- [ ] Grafik 3: jumlah tantangan per bidang.
- [ ] Grafik 4: corong (funnel) — tantangan → punya kandidat cocok → punya minat.
- [ ] Semua angka berasal dari **view SQL**, bukan dihitung ulang di komponen.

---

## 7. Metrik keberhasilan (untuk proyek portofolio)

| Metrik | Target |
|---|---|
| Deploy publik dan bisa dibuka tanpa login | Ya |
| Semua user story US-1 sampai US-6 lolos kriteria terima | Ya |
| Test untuk fungsi skor kecocokan | Minimal 8 kasus, semua hijau |
| Waktu muat halaman analitik | < 2 detik di koneksi biasa |

## 8. Batasan & asumsi

- Dikerjakan satu orang.
- Memakai stack yang sudah dikuasai dari proyek Stock Tracker agar cepat (lihat ARCHITECTURE).
- Database gratis (Neon) dan hosting gratis (Vercel).

## 9. Risiko

| Risiko | Mitigasi |
|---|---|
| Waktu tidak cukup | Ikuti *cut list* di ROADMAP — analitik dan matching didahulukan, form dan minat boleh dipotong |
| Skor terasa "acak" | Rumus sederhana + alasan ditampilkan + test |
| Data contoh tidak realistis | Generator memakai daftar skill dan bidang nyata dunia industri, dengan bobot yang masuk akal |
| Dianggap produk resmi organisasi tertentu | Label "Prototipe konsep · Data contoh" di header dan README |
