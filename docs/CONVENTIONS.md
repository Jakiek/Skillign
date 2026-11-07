# CONVENTIONS — Jembatan

Aturan teknis yang berlaku untuk semua kode di repo ini.

---

## Konteks

Jembatan adalah prototipe platform matchmaking industri–akademik dengan halaman analitik. Semua data di dalamnya adalah data contoh.

Kebutuhan: [`PROJECTBRIEF.md`](PROJECTBRIEF.md) · Rancangan: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Urutan kerja: [`docs/ROADMAP.md`](docs/ROADMAP.md) · Tampilan: [`docs/DESIGN.md`](docs/DESIGN.md)

---

## Aturan domain — tidak boleh dilanggar

1. **Rumus skor hanya ada di `src/domain/skor.ts`.**
   Tidak boleh ada perhitungan skor di komponen, hook, route Express, atau SQL. Server memanggil fungsi domain.

2. **Skor selalu disertai alasan.**
   Setiap tempat yang mengembalikan skor juga mengembalikan `wajibCocok`, `wajibKurang`, dan `tambahanCocok`.

3. **Skor tidak disimpan.** Selalu dihitung ulang dari skill tantangan dan skill talenta.

4. **Angka analitik berasal dari view SQL** (`docs/ARCHITECTURE.md § 7`). Satu-satunya pengecualian adalah angka funnel "punya kandidat ≥ 60", yang dihitung di server dengan fungsi domain.

5. **Skill ID adalah slug huruf kecil** (`react`, `power-bi`). Normalkan input sebelum disimpan. Nama tampilan disimpan terpisah.

6. **Data contoh selalu berlabel.** Kolom `data_contoh` tidak boleh dihapus, dan badge "Data contoh" tidak boleh hilang dari UI.

---

## Aturan lapisan

```
components/ pages/ hooks/  →  boleh impor domain/, data/
data/                      →  boleh impor domain/
domain/                    →  tidak impor apa pun di luar domain/
server/                    →  hanya boleh impor src/domain/
```

- `src/domain/` tidak boleh mengimpor React, `fetch`, `pg`, atau Express.
- Komponen mengakses data lewat hook di `src/hooks/`, bukan `fetch` langsung.
- Migrasi database tidak pernah diubah setelah dijalankan. Tambahkan migrasi baru.

---

## Konvensi kode

- TypeScript `strict`. Tidak ada `any`; pakai `unknown` lalu persempit.
- Nama domain dalam bahasa Indonesia (`tantangan`, `talenta`, `skor`, `wajibKurang`), istilah teknis dalam bahasa Inggris (`hook`, `route`, `schema`).
- Validasi input dengan Zod di `src/domain/schemas.ts`, dipakai klien dan server.
- State: `useState` dan Context. Tidak menambah Redux atau Zustand.
- Styling dengan Tailwind, token dari `docs/DESIGN.md § 3`.
- SQL ditulis dengan parameter (`$1`, `$2`), tidak pernah dengan string concatenation.

---

## Yang tidak boleh dilakukan

- Mengklaim di UI atau README bahwa proyek ini bekerja sama dengan perusahaan atau institusi mana pun.
- Menghapus atau melemahkan test agar hijau. Kalau test gagal, laporkan.
- Menghitung statistik analitik di komponen dengan `reduce()`.
- Menyimpan `.env` atau `DATABASE_URL` ke git.
- Mengubah keputusan di `docs/ARCHITECTURE.md § 10` tanpa membahasnya lebih dulu.

---

## Perintah

```bash
npm run dev            # Vite (frontend)
npm run dev:server     # Express di :3001, Vite mem-proxy /api
npm run migrasi        # jalankan migrasi di server/migrations.ts
npm run seed           # isi ulang data contoh (seed tetap)
npm test               # Vitest, mode watch
npm run test:run       # sekali jalan
npm run lint
npm run build
```

---

## Kesalahan yang sering terjadi

| Gejala | Kemungkinan penyebab |
|---|---|
| Skor `NaN` | Tantangan tanpa skill tambahan → pembagian dengan nol (lihat ARCHITECTURE § 5.1) |
| Urutan rekomendasi berubah setiap refresh | Tidak ada pemecah seri (nama/judul) |
| Skill "React" dan "react" dihitung terpisah | Slug tidak dinormalkan sebelum disimpan |
| Jumlah minat 1 padahal belum ada | `COUNT(*)` pada `LEFT JOIN`; pakai `COUNT(m.id)` |
| Data dobel setelah seed | Seed tidak mengosongkan tabel lebih dulu |
| API jalan di lokal, error di Vercel | `DATABASE_URL` belum diatur di environment Vercel |
