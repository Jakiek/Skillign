# ADR 001 — Referensi publik DTETI untuk data contoh

Status: diterapkan atas permintaan pemilik setelah MVP coding awal.

## Keputusan

Gunakan snapshot terpilih delapan nama mitra dan delapan judul topik dari halaman publik [Daftar Mitra Magang DTETI 2027](https://sarjana.jteti.ugm.ac.id/akademik/penjelasan-aktivitas-akademik/daftar-mitra-magang-dteti-2027/). Snapshot berada di `src/domain/sumber.ts`; ini bukan salinan lengkap direktori atau sinkronisasi otomatis.

Nama organisasi dan judul topik terpilih merupakan referensi publik. Deskripsi, bidang pengelompokan, skill wajib/tambahan, durasi, status terbuka, profil talenta, kecocokan, dan minat adalah simulasi. Tidak ada klaim status lowongan aktif atau afiliasi dengan DTETI/mitra. Kuota, insentif, jadwal, kontak pribadi, dan persyaratan resmi tidak diimpor.

Migrasi 003 menambahkan `sumber_url` ke organisasi dan tantangan tanpa mengubah migrasi yang sudah ada. Seed mempertahankan 30 tantangan (8 berjudul topik referensi, 22 judul simulasi), 60 talenta fiktif, 40 minat, dan 40 skill. Delapan organisasi memakai nama publik; empat kampus tetap fiktif. Lokasi organisasi publik diberi keterangan belum diverifikasi, bukan kota rekaan.

## Konsekuensi

Label Data contoh dan `data_contoh=TRUE` tetap digunakan untuk semua tantangan/talenta. UI membedakan topik referensi dan tantangan simulasi, menyediakan tautan sumber, dan menjelaskan batas data pada detail. Form baru tetap menciptakan tantangan simulasi tanpa `sumber_url` topik resmi. Analitik hanya menggambarkan dataset demonstrasi, bukan kebutuhan aktual seluruh mitra DTETI.

Rumus skor, SQL analitik, serta batas lapisan tetap sama. Atribut skill/durasi tidak boleh dikutip sebagai persyaratan organisasi. Menggunakan identitas organisasi tidak memberi izin mengklaim kerja sama resmi atau memakai logo institusi sebagai identitas Skillign.
