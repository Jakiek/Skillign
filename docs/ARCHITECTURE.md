# ARCHITECTURE — Skillign

## 1. Prinsip arsitektur

1. **Rumus kecocokan adalah fungsi murni.** Tinggal di `src/domain/`, tanpa React, tanpa `fetch`, tanpa database. Bisa dites dan dijelaskan.
2. **Angka analitik berasal dari SQL.** Komponen hanya menggambar hasil view. Tidak ada `reduce()` untuk statistik di komponen.
3. **Satu skema validasi untuk klien dan server.** Zod di `src/domain/schemas.ts`, dipakai di form dan di Express.
4. **Stack sama dengan Stock Tracker.** Tujuannya kecepatan, bukan eksperimen.

## 2. Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind + React Router | Sudah dipakai di Stock Tracker |
| Grafik | Recharts | Sudah dipakai di Stock Tracker |
| Backend | Express (Node 22) di Vercel Functions lewat `api/index.ts` | Pola yang sama dengan Stock Tracker (ADR 002 di sana) |
| Database | PostgreSQL di Neon, driver `pg` | Gratis, sudah dikenal |
| Validasi | Zod | Satu skema untuk klien dan server |
| Test | Vitest | Sudah dikenal |
| Deploy | Vercel | Sudah dikenal |

## 3. Struktur folder

```
skillign/
├── PROJECTBRIEF.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   └── decisions/              # ADR singkat bila ada keputusan baru
├── api/
│   └── index.ts                # membungkus app Express untuk Vercel
├── server/
│   ├── app.ts                  # routing Express
│   ├── db.ts                   # pool pg
│   ├── migrations.ts           # daftar migrasi SQL berurutan
│   ├── seed.ts                 # generator data contoh (seed tetap)
│   └── routes/
│       ├── tantangan.ts
│       ├── talenta.ts
│       ├── minat.ts
│       └── analitik.ts
├── src/
│   ├── domain/                 # fungsi murni + tipe + skema (boleh dipakai server)
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   ├── skor.ts             # rumus kecocokan
│   │   └── skor.test.ts
│   ├── data/
│   │   └── api.ts              # fetch ke /api, normalisasi respons
│   ├── hooks/                  # useTantangan, useTalenta, useAnalitik
│   ├── components/             # SkillChip, SkorBadge, KartuTantangan, ...
│   ├── pages/                  # Beranda, Tantangan, DetailTantangan, ...
│   └── main.tsx
└── vercel.json
```

Aturan impor:

```
components/ pages/ hooks/  →  boleh impor domain/, data/
data/                      →  boleh impor domain/
domain/                    →  tidak impor apa pun dari src/ selain domain/
server/                    →  hanya boleh impor src/domain/
```

## 4. Model data

### 4.1 Tabel

```sql
-- 001_skema.sql
CREATE TABLE skill (
  id        TEXT PRIMARY KEY,            -- slug huruf kecil, mis. 'react', 'sql', 'figma'
  nama      TEXT NOT NULL,               -- tampilan, mis. 'React'
  kategori  TEXT NOT NULL                -- 'web' | 'data' | 'desain' | 'hardware' | 'manajemen'
);

CREATE TABLE organisasi (
  id     SERIAL PRIMARY KEY,
  nama   TEXT NOT NULL,
  jenis  TEXT NOT NULL CHECK (jenis IN ('industri','kampus')),
  kota   TEXT NOT NULL
);

CREATE TABLE tantangan (
  id             SERIAL PRIMARY KEY,
  organisasi_id  INT NOT NULL REFERENCES organisasi(id),
  judul          TEXT NOT NULL,
  deskripsi      TEXT NOT NULL,
  bidang         TEXT NOT NULL,          -- 'web' | 'data' | 'iot' | 'desain' | 'ai'
  durasi_bulan   INT  NOT NULL CHECK (durasi_bulan BETWEEN 1 AND 6),
  status         TEXT NOT NULL DEFAULT 'terbuka' CHECK (status IN ('terbuka','ditutup')),
  data_contoh    BOOLEAN NOT NULL DEFAULT TRUE,
  dibuat_pada    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tantangan_skill (
  tantangan_id  INT  NOT NULL REFERENCES tantangan(id) ON DELETE CASCADE,
  skill_id      TEXT NOT NULL REFERENCES skill(id),
  wajib         BOOLEAN NOT NULL,
  PRIMARY KEY (tantangan_id, skill_id)
);

CREATE TABLE talenta (
  id           SERIAL PRIMARY KEY,
  nama         TEXT NOT NULL,
  peran        TEXT NOT NULL CHECK (peran IN ('mahasiswa','dosen')),
  prodi        TEXT NOT NULL,
  kampus       TEXT NOT NULL,
  bio          TEXT NOT NULL DEFAULT '',
  data_contoh  BOOLEAN NOT NULL DEFAULT TRUE,
  dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE talenta_skill (
  talenta_id  INT  NOT NULL REFERENCES talenta(id) ON DELETE CASCADE,
  skill_id    TEXT NOT NULL REFERENCES skill(id),
  level       INT  NOT NULL CHECK (level BETWEEN 1 AND 3),   -- 1 dasar, 2 menengah, 3 mahir
  PRIMARY KEY (talenta_id, skill_id)
);

CREATE TABLE minat (
  id            SERIAL PRIMARY KEY,
  tantangan_id  INT NOT NULL REFERENCES tantangan(id) ON DELETE CASCADE,
  talenta_id    INT NOT NULL REFERENCES talenta(id)   ON DELETE CASCADE,
  pesan         TEXT NOT NULL DEFAULT '',
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tantangan_id, talenta_id)
);
```

### 4.2 Tipe di `src/domain/types.ts`

```ts
export type SkillId = string;               // slug huruf kecil

export interface KebutuhanSkill { skillId: SkillId; wajib: boolean }
export interface SkillTalenta   { skillId: SkillId; level: 1 | 2 | 3 }

export interface HasilSkor {
  skor: number;                 // 0–100, bilangan bulat
  wajibCocok: SkillId[];
  wajibKurang: SkillId[];
  tambahanCocok: SkillId[];
}
```

## 5. Mesin kecocokan — `src/domain/skor.ts`

### 5.1 Rumus

```
W = himpunan skill wajib tantangan
T = himpunan skill tambahan tantangan
S = himpunan skill talenta (dengan level)

cakupanWajib   = Σ bobotLevel(s) untuk s ∈ W ∩ S  /  |W|        (0–1)
cakupanTambahan = |T ∩ S| / |T|   (bernilai 0 kalau T kosong)

skor = round( 100 × (0.8 × cakupanWajib + 0.2 × cakupanTambahan) )

bobotLevel: level 1 → 0.6, level 2 → 0.85, level 3 → 1.0
```

Kalau `T` kosong, bobot 0.2 dipindah ke cakupan wajib (skor = round(100 × cakupanWajib)).

### 5.2 Kenapa rumusnya begini

- **Skill wajib dominan (80%)** karena tantangan gagal kalau skill intinya tidak ada.
- **Level ikut dihitung** tapi level dasar tetap bernilai, supaya mahasiswa yang baru belajar tidak langsung nol.
- **Tidak memakai Jaccard murni** karena Jaccard menghukum talenta yang punya banyak skill di luar kebutuhan — padahal itu bukan kekurangan.

### 5.3 Fungsi publik

```ts
hitungSkor(kebutuhan: KebutuhanSkill[], skill: SkillTalenta[]): HasilSkor
rekomendasiTalenta(tantangan, semuaTalenta, n = 5): Array<{ talenta, hasil }>
rekomendasiTantangan(talenta, semuaTantangan, n = 5): Array<{ tantangan, hasil }>
saranBelajar(hasilTeratas: HasilSkor[], n = 3): SkillId[]   // skill paling sering ada di wajibKurang
```

Urutan rekomendasi: skor turun, lalu nama/judul naik. Selalu stabil.

### 5.4 Kasus test minimal (`skor.test.ts`)

1. Semua skill wajib dimiliki level 3, tidak ada tambahan → 100.
2. Tidak punya satu pun skill wajib → skor hanya dari tambahan (maks 20).
3. Separuh skill wajib, level 3 → 40 (+ tambahan).
4. Skill wajib dimiliki level 1 → bobot 0.6 diterapkan.
5. `T` kosong → bobot dipindah, skor = 100 × cakupanWajib.
6. Skill di luar kebutuhan tidak menurunkan skor.
7. `wajibKurang` berisi tepat skill wajib yang tidak dimiliki.
8. Urutan rekomendasi stabil saat skor sama.

## 6. API

Semua respons JSON. Error memakai bentuk `{ error: string, detail?: unknown }`.

| Method | Path | Isi |
|---|---|---|
| GET | `/api/skill` | Semua skill |
| GET | `/api/tantangan?skill=a,b&bidang=web` | Daftar tantangan terbuka + skill-nya |
| GET | `/api/tantangan/:id` | Detail + rekomendasi 5 talenta (skor dihitung di server memakai `src/domain/skor.ts`) |
| POST | `/api/tantangan` | Buat tantangan (validasi `skemaTantanganBaru`) |
| GET | `/api/talenta` | Daftar talenta |
| GET | `/api/talenta/:id` | Detail + rekomendasi 5 tantangan + saran belajar |
| POST | `/api/minat` | Ajukan minat (409 bila sudah pernah) |
| GET | `/api/analitik` | Satu objek berisi hasil semua view analitik |

Skor dihitung **on-the-fly** di server (data kecil, < 200 baris). Tidak disimpan di tabel.

## 7. Analitik — view SQL

```sql
-- 002_view_analitik.sql
CREATE VIEW v_permintaan_skill AS
SELECT ts.skill_id, s.nama, COUNT(*) AS permintaan
FROM tantangan_skill ts
JOIN tantangan t ON t.id = ts.tantangan_id AND t.status = 'terbuka'
JOIN skill s ON s.id = ts.skill_id
WHERE ts.wajib
GROUP BY ts.skill_id, s.nama;

CREATE VIEW v_ketersediaan_skill AS
SELECT tk.skill_id, COUNT(*) AS ketersediaan
FROM talenta_skill tk
GROUP BY tk.skill_id;

CREATE VIEW v_kesenjangan_skill AS
SELECT p.skill_id, p.nama, p.permintaan,
       COALESCE(k.ketersediaan, 0) AS ketersediaan,
       ROUND(p.permintaan::numeric / NULLIF(COALESCE(k.ketersediaan,0),0), 2) AS rasio
FROM v_permintaan_skill p
LEFT JOIN v_ketersediaan_skill k USING (skill_id);

CREATE VIEW v_tantangan_per_bidang AS
SELECT bidang, COUNT(*) AS jumlah
FROM tantangan WHERE status = 'terbuka'
GROUP BY bidang;

CREATE VIEW v_minat_per_tantangan AS
SELECT t.id AS tantangan_id, t.judul, COUNT(m.id) AS jumlah_minat
FROM tantangan t LEFT JOIN minat m ON m.tantangan_id = t.id
GROUP BY t.id, t.judul;
```

Langkah "punya kandidat cocok (skor ≥ 60)" di funnel **dihitung di server** dengan `rekomendasiTalenta`, karena rumus skor tinggal di domain, bukan di SQL. Ini satu-satunya angka analitik yang tidak berasal dari view.

Implementasi menambahkan `v_ringkasan_program` di migrasi 002 untuk memastikan total ringkasan dan jumlah tantangan terbuka yang memiliki minat juga berasal dari SQL. Persentase kandidat dihitung di server dari jumlah kandidat cocok dan total tantangan terbuka. Dua kelompok terakhir pada corong dihitung mandiri, bukan tahap konversi bersarang; minat tidak mensyaratkan skor ≥60.

## 8. Data contoh — `server/seed.ts`

- Seed acak tetap (mis. `mulberry32(2027)`) agar hasil selalu sama.
- 40 skill nyata (React, Next.js, TypeScript, SQL, Python, pandas, Power BI, Figma, Arduino, ROS, Docker, dll.).
- 12 organisasi fiktif (8 industri, 4 kampus, semua berakhiran "Contoh"), 30 tantangan, 60 talenta, ±40 minat.
- Distribusi sengaja **tidak seimbang** (mis. permintaan React/SQL tinggi, ketersediaan rendah) supaya grafik kesenjangan bercerita.
- Semua baris `data_contoh = TRUE`; nama orang fiktif.

Migrasi 003 pernah menambahkan kolom sumber eksternal; migrasi 004 menghapusnya dan menambah `tantangan.dibuat_pengunjung` (default `FALSE`, `TRUE` untuk tantangan dari `POST /api/tantangan`). Seluruh organisasi seed fiktif dan didefinisikan di `src/domain/organisasiContoh.ts`; urutan dan indeksnya menjaga seed tetap deterministik. Detail keputusan ada di `decisions/002_organisasi-fiktif.md`. API pencarian mendukung `q` judul/organisasi yang dapat digabung dengan filter; pencarian tidak peka kapital dan memakai parameter SQL.

## 9. Konfigurasi & lingkungan

```
DATABASE_URL=postgres://...      # Neon
```

`vercel.json` me-rewrite `/api/*` ke `api/index.ts`, sama seperti Stock Tracker.

## 10. Keputusan yang dikunci

1. Skor kecocokan dihitung dengan rumus di § 5.1 — tidak memakai AI/embedding di MVP.
2. Skor tidak disimpan di database.
3. Angka analitik berasal dari view SQL, kecuali satu angka funnel di § 7.
4. Skill memakai slug huruf kecil sebagai ID; nama tampilan terpisah.
5. Semua data contoh diberi label dan `data_contoh = TRUE`.

Mengubah salah satu keputusan ini harus didiskusikan dulu dan dicatat sebagai ADR di `docs/decisions/`.
