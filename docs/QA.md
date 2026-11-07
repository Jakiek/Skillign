# QA Skillign

Status: coding MVP dan pemeriksaan otomatis selesai; verifikasi browser dan rilis publik belum selesai.

## Bukti otomatis

- `npm run lint`: lolos tanpa warning lint.
- `npm run build`: lolos, mencakup typecheck frontend, server, dan adapter API.
- `npm run test:run`: 90 pengujian pada lima berkas, seluruhnya lolos.
- Domain: rumus, alasan skor, urutan stabil, saran belajar, validasi batas form.
- SQL/API: migrasi berulang, seed identik dan rollback, constraint, filter, analitik, penyimpanan atomik, duplikat minat bersamaan.
- UI jsdom: filter URL, reset, navigasi dua arah, retry, respons asinkron, tabel analitik, form, dialog, status sukses, navigasi aktif, fokus kesalahan, fokus setelah navigasi, dan judul dokumen.
- Lapisan API frontend: respons non-JSON dan detail validasi rusak menghasilkan pesan yang dapat dipahami.

Pengujian dijalankan dengan Node 25.8.2; sasaran proyek pada `.nvmrc` adalah Node 22. Belum ada verifikasi ulang dengan Node 22.

## Perbaikan pada Fase 6

- Navigasi Tantangan dan Buat tantangan tidak aktif bersamaan.
- Submit form invalid memfokuskan isian pertama yang salah; pesan error ditautkan ke kontrol dan diumumkan.
- Perubahan halaman memfokuskan konten utama dan memperbarui judul dokumen. Perubahan filter tidak mencuri fokus.
- Respons non-JSON tidak membocorkan pesan parser. Respons simpan yang tidak terbaca menyarankan pemeriksaan daftar sebelum mengirim ulang.
- Heading menangani teks panjang; kontrol sentuh, caret, tema native terang, dan overscroll dialog disesuaikan.
- Font Inter hanya memakai subset Latin. Halaman grafik tetap dimuat terpisah.
- Adapter Vercel menggunakan ulang instance aplikasi dalam proses yang sama.

Audit kode memakai Web Interface Guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## Hasil audit dependensi

`npm audit`: 9 temuan moderate, 0 high, 0 critical. Paket langsung yang dilaporkan: `react-router-dom` dan `typescript-eslint` (termasuk rantai dependensi minimatch). Perbaikan React Router yang ditawarkan memerlukan major upgrade ke v7; belum diterapkan dalam pemeriksaan ini. Tidak ada klaim bahwa dependensi bebas kerentanan. Tinjau dan perbaiki sebelum rilis publik.

Build mengeluarkan catatan dari komentar anotasi dependency Zod; build tetap berhasil. Tidak ada perubahan pada kode dependency untuk menyembunyikannya.

## Verifikasi yang masih diperlukan

Browser pengujian belum dapat dijalankan karena kesalahan konfigurasi lingkungan sandbox. Pengujian jsdom tidak memverifikasi layout, rendering grafik, focus trap, atau perilaku native dialog. Belum ada screenshot yang dapat dinyatakan sebagai bukti.

Saat browser tersedia, jalankan `npm run dev:contoh` dan `npm run dev`, lalu:

- Periksa semua halaman pada desktop 1440 px dan mobile 390/320 px: tanpa overflow, teks/kartu/grafik terbaca.
- Uji Tab, Shift+Tab, fokus terkurung dalam dialog, Esc, dan pengembalian fokus. Saat pengiriman berlangsung, penutupan dialog sengaja ditahan.
- Uji Back/Forward pada filter, tautan langsung ke detail, dan reset filter.
- Buat tantangan dan ajukan minat memakai API contoh asli, lalu periksa perubahan jumlah minat dan analitik.
- Uji data kosong, koneksi gagal, label Data contoh, dan pembesaran teks.
- Ambil tiga screenshot asli: detail tantangan beserta kandidat, analitik, dan daftar tantangan dengan filter; simpan di `docs/screenshots/`.

Koneksi Neon, migrasi/seed pada PostgreSQL eksternal, kesesuaian rewrite Vercel, refresh URL langsung pada hosting, dan target waktu muat analitik <2 detik belum diverifikasi. Pembuatan repo publik serta deploy tetap ditunda sesuai arahan pemilik.

## Pembaruan referensi publik dan UI

- Migrasi 003, seed, dan API memisahkan sumber nama/topik publik dari atribut simulasi.
- Pengujian memverifikasi delapan topik dengan sumber, pasangan organisasi yang benar, 22 judul simulasi, pencarian judul/organisasi, kombinasi filter, serta input SQL yang diperlakukan sebagai teks.
- UI mendukung pencarian URL dan reset, sidebar desktop, kartu katalog, serta penjelasan sumber pada daftar/detail.
- Tiga pengujian integrasi dan satu pengujian UI tambahan lolos; total 87 test, lint/build lolos.
- Pemeriksaan visual perubahan terbaru belum dilakukan karena browser pengujian masih gagal dijalankan. Screenshot referensi Octave kini sudah ditinjau dari folder lokal pemilik; hasil aplikasi sendiri tetap belum diverifikasi visual di browser.

## Iterasi berdasarkan screenshot pemilik

Dua screenshot lokal MagangHub dan Octave sudah diperiksa. Pencarian beranda, chip filter individual, panel ringkasan terpadu, pengelompokan bukti kecocokan, ikon navigasi, serta tema gelap dengan pilihan tersimpan ditambahkan. Test memakai fixture browser Storage dalam memori karena storage native Node 25 belum terinisialisasi pada lingkungan pengujian; pilihan tema dan persistensinya tetap diuji. Total 90 pengujian lolos setelah perbaikan; lint/build berhasil. Tata letak dan kontras kedua tema pada browser nyata masih perlu diperiksa.

## Pergantian identitas Skillign

Nama produk, judul tab browser, metadata, nama paket, dokumentasi, dan teks simulasi diselaraskan menjadi Skillign. Navigasi/judul memakai Opportunities, Talents, Insights, dan New opportunity; penjelasan memakai bahasa Indonesia ringkas. Uji navigasi, fokus, judul halaman, form, pencarian, dan tema tetap lolos: 90 test, lint/build berhasil. Data contoh serta keterangan sumber tetap dipertahankan.
