# DESIGN — Sistem Desain Skillign

## 1. Arah visual

Tenang, rapi, dan "dashboard-like" — tujuan utamanya **membaca kecocokan dengan cepat**, bukan memamerkan dekorasi. Referensi rasa: halaman lowongan yang bersih (daftar kartu + filter di samping) dan dashboard analitik yang hemat warna.

- **Yang diambil:** kartu dengan hierarki jelas, chip skill, angka besar untuk ringkasan.
- **Yang tidak diambil:** ilustrasi besar, gradien mencolok, animasi berlebihan.

Navigasi utama menjadi sidebar tetap selebar 240 px mulai 1024 px. Di layar kecil kembali ke header dengan navigasi membungkus. Konten menggunakan latar abu kehijauan, kartu putih, border tipis, dan aksen hijau; font tetap Inter. Avatar organisasi berupa inisial teks, bukan logo resmi.

Referensi utama adalah dua screenshot milik pemilik dalam folder lokal `Frontend ins`: MagangHub (22.34.12) dan Octave Customer Health & Account Detail (22.36.50). Keduanya sudah ditinjau secara visual. MagangHub memberi acuan filter, pencarian, dan chip aktif; Octave memberi acuan sidebar, kepadatan informasi, serta tema gelap. Screenshot referensi tidak disalin sebagai aset aplikasi atau dipublikasikan di repo.

Hierarki disesuaikan dengan Skillign: pencarian menjadi titik masuk beranda, ringkasan program berada dalam satu panel terbagi, dan kartu rekomendasi menampilkan nama serta skor di atas bukti skill yang berkelompok. Tidak ada klaim sebagai salinan persis desain referensi.

## 2. Prinsip

1. **Skor selalu disertai alasan.** Angka skor tidak pernah tampil sendirian tanpa daftar skill yang cocok/kurang.
2. **Warna punya arti.** Hijau = cocok, oranye = kurang, abu = netral. Tidak dipakai untuk hiasan.
3. **Data contoh selalu terlihat sebagai data contoh.** Ada badge "Data contoh" di header dan di setiap kartu yang `data_contoh = true`.
4. **Satu tindakan utama per halaman.**

## 3. Token

### 3.1 Warna (Tailwind `theme.extend.colors`)

| Token | Hex | Pemakaian |
|---|---|---|
| `ink` | `#1C2430` | Teks utama, header |
| `muted` | `#5B6573` | Teks sekunder |
| `line` | `#E0E6E2` | Garis, border kartu |
| `bg` | `#F4F6F5` | Latar halaman |
| `card` | `#FFFFFF` | Latar kartu |
| `brand` | `#28634F` | Tombol utama, link, tab aktif |
| `brand-soft` | `#E9F2EC` | Latar chip terpilih |
| `cocok` | `#2E7D4F` | Skill cocok, skor tinggi |
| `kurang` | `#C9741F` | Skill wajib yang belum dimiliki |
| `kurang-soft` | `#F6E7D5` | Latar chip "kurang" |

Warna grafik (berurutan): `#28634F`, `#C9741F`, `#5B8DB8`, `#8A6FB0`, `#7A8B5C`.

### 3.2 Tipografi

- Wordmark Skillign: **Libre Baskerville Italic**, bobot 400, 32 px, tracking -0.035em. Fallback Georgia/serif. Terinspirasi pasangan serif ekspresif dan sans pada gambar referensi tipografi pemilik (`Util/Font .png`).
- Navigasi dan isi: **Inter** (fallback `system-ui, sans-serif`) agar teks padat dan angka mudah dibaca.
- Skala: 12 / 14 / 16 / 20 / 24 / 32 px. Judul halaman 32 semibold, judul kartu 16–18 semibold, isi 14–16 regular.
- Angka di ringkasan dan skor memakai `tabular-nums`.

### 3.3 Spasi, radius, bayangan

- Spasi kelipatan 4 (Tailwind default). Padding kartu `p-5`, jarak antar-kartu `gap-4`.
- Radius kartu `rounded-xl`, chip `rounded-full`, input `rounded-lg`.
- Bayangan hanya `shadow-sm` saat hover kartu.

## 4. Aturan tampilan domain

### 4.1 Skor

| Rentang | Label | Warna badge |
|---|---|---|
| 80–100 | Sangat cocok | `cocok` |
| 60–79 | Cocok | `brand` |
| 40–59 | Sebagian | `muted` |
| 0–39 | Kurang cocok | `line` dengan teks `muted` |

Format: `82` besar + label kecil di bawahnya. Tidak memakai persen (`82%`) agar tidak dibaca sebagai probabilitas.

### 4.2 Chip skill

- `SkillChip` varian: `netral` (border `line`), `cocok` (teks `cocok`, ikon ✓), `kurang` (latar `kurang-soft`, teks `kurang`, ikon ○), `wajib` (teks tebal).
- Maksimal 5 chip di kartu daftar; sisanya "+3".

### 4.3 Level skill talenta

Tiga titik: ●○○ dasar, ●●○ menengah, ●●● mahir. Ada tooltip teks untuk aksesibilitas.

## 5. Komponen

| Komponen | Isi |
|---|---|
| `Header` | Logo teks "Skillign", navigasi (Opportunities, Talents, Insights, New opportunity), badge "Prototipe konsep · Data contoh" |
| `KartuTantangan` | Judul, organisasi + kota, bidang, durasi, chip skill, jumlah minat |
| `KartuTalenta` | Nama, peran, prodi + kampus, chip skill dengan level |
| `KartuRekomendasi` | `SkorBadge` di kiri, nama/judul, chip cocok + kurang |
| `SkorBadge` | Angka + label sesuai § 4.1 |
| `FilterSkill` | Multi-select chip; sinkron dengan query string |
| `KartuAngka` | Angka besar + label (dipakai di Beranda dan Analitik) |
| `KartuGrafik` | Judul, subjudul satu kalimat "cara membaca", isi grafik Recharts |
| `DialogMinat` | Dropdown talenta, textarea pesan, tombol Kirim |

## 6. Tata letak halaman

### Beranda `/`
Pembuka dua kolom pada layar lebar: judul/pencarian di kiri dan penjelasan kecocokan di kanan. Empat ringkasan berada dalam satu panel terbagi, diikuti tiga tantangan terbaru serta catatan data contoh. Navigasi Lihat tantangan/Buka analitik tetap tersedia.

### Tantangan `/tantangan`
Pencarian judul/organisasi tersimpan sebagai `q` di URL. Filter di sisi kiri, hasil di kanan. Kartu dua kolom mulai 1280 px, satu kolom di bawahnya. Pada mobile panel filter dapat dibuka lewat tombol. Query, bidang, dan skill terpilih tampil sebagai chip yang dapat dihapus satu per satu tanpa menghapus filter lainnya.

### Detail tantangan `/tantangan/:id`
Mulai 1280 px, kiri 7 kolom: judul, organisasi, deskripsi, chip skill (wajib dulu), tombol "Ajukan minat". Kanan 5 kolom: "5 kandidat paling cocok" berisi `KartuRekomendasi`.

### Talenta `/talenta` dan detail `/talenta/:id`
Pola sama dengan tantangan. Detail talenta punya kotak "Saran belajar" berisi 3 skill.

### Buat tantangan `/tantangan/baru`
Satu kolom selebar 720 px. Error validasi muncul di bawah field, bukan alert.

### Analitik `/analitik`
4 `KartuAngka` di atas, lalu grid 2×2 `KartuGrafik`:
1. Bar horizontal — 10 skill paling dicari.
2. Bar berkelompok — permintaan vs ketersediaan (10 skill teratas).
3. Bar — tantangan per bidang.
4. Funnel — tantangan → punya kandidat ≥ 60 → punya minat.

Setiap grafik punya satu kalimat "Cara membaca" di bawah judul.

## 7. State

| State | Tampilan |
|---|---|
| Memuat | Skeleton kartu abu, bukan spinner layar penuh |
| Kosong | Ikon sederhana + kalimat + tombol "Reset filter" |
| Error | Kotak dengan pesan manusiawi + tombol "Coba lagi"; detail teknis hanya di console |
| Sukses simpan | Toast kecil di kanan bawah, 3 detik |

## 8. Responsif & aksesibilitas

- Breakpoint: mobile < 768 px satu kolom; filter jadi tombol "Filter" yang membuka panel.
- Kontras teks minimal 4.5:1. Chip tidak mengandalkan warna saja (ada ikon ✓/○).
- Semua tombol bisa difokus dengan keyboard; dialog menjebak fokus dan tertutup dengan Esc.

## 9. Tema gelap

Tombol Tampilan gelap di navigasi memakai `aria-pressed` dan menyimpan pilihan lokal. Default terang. Warna Tailwind berasal dari variabel CSS agar kartu, teks, border, input, dialog, dan grafik mengikuti tema yang sama.

| Token | Gelap |
| --- | --- |
| bg | #111419 |
| card | #181C22 |
| ink | #EDEFF2 |
| muted | #A9B0BB |
| line | #2F343E |
| brand | #BDADF6 |
| brand-soft | #2C2541 |
| cocok | #80D1A5 |
| warning | #F6C185 |
| kurang-soft | #3E2C1D |

Tema terang mempertahankan hijau, tema gelap memakai aksen ungu. Warna semantik tetap membedakan skill cocok dan kurang. Tidak ada animasi otomatis pada grafik; fokus keyboard tetap terlihat di kedua tema.

## 10. Bahasa dan identitas Skillign

Nama produk: **Skillign**, menekankan pencocokan skill yang dapat dijelaskan serta analitik permintaan–ketersediaan. Navigasi dan judul halaman menggunakan Opportunities, Talents, Insights, serta New opportunity. Penjelasan, label form, dan pesan sistem memakai bahasa Indonesia yang ringkas dan konkret.

Istilah antarmuka: proyek untuk tantangan dan kandidat untuk profil talenta. Kata skill dipakai konsisten. Hindari slogan umum tentang kolaborasi atau peluang; jelaskan fungsi dan tindakan langsung. Judul beranda: “Cocokkan skill. Temukan proyek yang sesuai.” Label Data contoh, batas data simulasi, dan keterangan sumber tetap terlihat.

Nama domain dan merek dagang belum diverifikasi. Pergantian merek tidak mengubah nama folder kerja, URL, tipe domain, atau tabel database. Preferensi tema lama tetap dibaca agar pilihan pengguna tidak hilang; penyimpanan berikutnya memakai kunci Skillign.

Font wordmark disajikan lokal melalui paket font dengan subset Latin dan hanya varian italic 400 yang dipakai. Tidak ada italic sintetis atau permintaan font eksternal saat web dibuka.
