# DESIGN — Sistem Desain Jembatan

## 1. Arah visual

Tenang, rapi, dan "dashboard-like" — tujuan utamanya **membaca kecocokan dengan cepat**, bukan memamerkan dekorasi. Referensi rasa: halaman lowongan yang bersih (daftar kartu + filter di samping) dan dashboard analitik yang hemat warna.

- **Yang diambil:** kartu dengan hierarki jelas, chip skill, angka besar untuk ringkasan.
- **Yang tidak diambil:** ilustrasi besar, gradien mencolok, animasi berlebihan.

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
| `line` | `#E4E1DA` | Garis, border kartu |
| `bg` | `#F7F6F2` | Latar halaman |
| `card` | `#FFFFFF` | Latar kartu |
| `brand` | `#1F6F78` | Tombol utama, link, tab aktif |
| `brand-soft` | `#E3F0F1` | Latar chip terpilih |
| `cocok` | `#2E7D4F` | Skill cocok, skor tinggi |
| `kurang` | `#C9741F` | Skill wajib yang belum dimiliki |
| `kurang-soft` | `#F6E7D5` | Latar chip "kurang" |

Warna grafik (berurutan): `#1F6F78`, `#C9741F`, `#5B8DB8`, `#8A6FB0`, `#7A8B5C`.

### 3.2 Tipografi

- Font: **Inter** (fallback `system-ui, sans-serif`).
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
| `Header` | Logo teks "Jembatan", navigasi (Tantangan, Talenta, Analitik, Buat Tantangan), badge "Prototipe konsep · Data contoh" |
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
Hero singkat (judul + 1 kalimat + 2 tombol: "Lihat tantangan", "Buka analitik") → 4 `KartuAngka` → 3 tantangan terbaru.

### Tantangan `/tantangan`
Grid 12 kolom: kiri 3 kolom `FilterSkill` + filter bidang; kanan 9 kolom daftar `KartuTantangan` (1 kolom di mobile).

### Detail tantangan `/tantangan/:id`
Kiri 7 kolom: judul, organisasi, deskripsi, chip skill (wajib dulu), tombol "Ajukan minat". Kanan 5 kolom: "5 kandidat paling cocok" berisi `KartuRekomendasi`.

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
