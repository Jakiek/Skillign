# ADR 002 — Organisasi fiktif untuk data contoh

**Status:** diterapkan · 8 November 2026

## Konteks

Versi awal data contoh memakai delapan nama organisasi dan judul topik dari daftar publik sebuah program magang kampus. Atribut lain (skill, bidang, durasi, status, kandidat, minat) sudah simulasi dan berlabel "Data contoh", serta ada pernyataan tidak berafiliasi.

## Keputusan

- Semua organisasi di seed fiktif dan berakhiran "Contoh": delapan organisasi industri dan empat kampus.
- Sektor dan jenis topik organisasi industri dipertahankan (akuakultur, lidar dan komunikasi, drone, visi komputer, perangkat lunak dan AI, data, transportasi) agar data tetap realistis.
- Tantangan yang dibuat lewat form demo publik disimpan dengan `dibuat_pengunjung = TRUE` dan ditampilkan dengan label "Dibuat pengunjung".
- Tidak ada lagi tautan atau rujukan ke sumber eksternal di kode, UI, maupun dokumen.

## Alasan

1. Atribut simulasi yang menempel pada nama organisasi sungguhan bisa dibaca sebagai informasi nyata, meskipun ada disclaimer.
2. Form publik memungkinkan pengunjung memasang proyek atas nama organisasi sungguhan.
3. Portofolio ini dinilai oleh pihak yang namanya bisa muncul di data; memakai nama mereka tanpa izin tidak sebanding manfaatnya.
4. Brief portofolio sendiri memutuskan untuk tidak menyebut nama mitra.

## Konsekuensi

- Angka analitik tidak berubah: urutan organisasi dan indeks topik dipertahankan, sehingga seed tetap deterministik dan respons `/api/analitik` identik dengan versi sebelumnya.
- Migrasi 004 menghapus kolom sumber eksternal yang ditambahkan migrasi 003 dan menambah `tantangan.dibuat_pengunjung`. Migrasi 001–003 tidak diubah.
- Database yang sudah berjalan perlu menjalankan migrasi 004 dan seed ulang agar nama lama hilang.
