# PawLoka — Riset Kelayakan MVP

**Tanggal riset:** 16 November 2026  
**Tujuan:** Memvalidasi kelayakan teknis proyek tugas akhir dalam tenggat 13–24 November 2026. Ini bukan riset pasar komersial.

## Ringkasan

PawLoka layak dibuat sebagai PWA React/Vite dengan API Node.js/Express dan Supabase. Scope saat ini mencakup katalog dan direktori publik, pengajuan minat adopsi yang menyimpan data pribadi minimum, serta portal admin untuk mengelola pengajuan, hewan, dan shelter. Karena portal mengubah data dan aplikasi menyimpan kontak pemohon, semua operasi admin harus dilindungi autentikasi dan otorisasi di backend; proteksi halaman di React saja tidak cukup.

Untuk menyesuaikan tenggat, gunakan satu akun admin, data contoh yang dikelola manual, tanpa login adopter/shelter, tanpa upload dokumen, tanpa workflow persetujuan kompleks, dan tanpa pengiriman data melalui layanan pihak ketiga. Sediakan deployment gratis, dengan catatan layanan API gratis dapat tidur saat tidak aktif dan database gratis dapat dijeda setelah masa tidak aktif.

## 1. Analisis Pasar

Analisis pasar, ukuran pasar, dan perbandingan kompetitor tidak diperlukan untuk tugas akhir kelas ini dan **tidak diteliti**. Validasi yang relevan adalah keterpenuhan sistematika PPB dan keberhasilan alur pengguna inti.

## 2. Rekomendasi Teknis

- **Frontend:** React + Vite; desain mobile-first dan responsive. Gunakan `vite-plugin-pwa` untuk manifest dan service worker.
- **Navigasi:** sekurangnya lima tampilan yang jelas, Bottom Navigation Bar, dua katalog/list yang dapat membuka detail (hewan dan shelter), serta Profile/About. Rute detail dapat berbagi template tanpa mengurangi jumlah halaman yang dapat diakses.
- **Backend:** Express/Node.js sebagai satu API REST untuk data publik dan operasi admin. Axios hanya memanggil API backend; browser tidak terhubung langsung ke kredensial database istimewa.
- **Database:** Supabase Postgres. Model awal mencakup hewan, shelter, dan pengajuan adopsi; relasi pengajuan ke hewan/shelter dan status harus menjaga referensi tetap valid.
- **Auth dan batas data:** Supabase Auth untuk satu admin. Backend memverifikasi token dan mengecek peran/identitas admin pada setiap endpoint admin. Jangan mengandalkan route guard frontend. Simpan `service_role` hanya sebagai secret backend jika memang dibutuhkan; jangan mengirimkannya ke browser. Aktifkan RLS dan batasi grants/policies, terutama untuk tabel pengajuan. Pengajuan publik hanya lewat endpoint yang tervalidasi dan dibatasi, bukan endpoint daftar pengajuan.
- **Data minimum formulir:** nama, salah satu kontak (email atau telepon), hewan yang diminati, pesan opsional. Jangan mengumpulkan alamat, nomor identitas, dokumen, atau foto. Tampilkan pemberitahuan penggunaan data dan sediakan penghapusan manual oleh admin setelah selesai atau atas permintaan.
- **PWA/offline:** cache aset aplikasi dan halaman statis; tampilkan pesan offline yang jelas. Jangan cache respons API pengajuan atau data admin. Catat bahwa perubahan data membutuhkan koneksi, dan service worker perlu strategi update yang dapat dipahami pengguna.
- **Gambar:** sumber dan lisensi foto belum diputuskan. Pilih aset yang boleh digunakan; hindari mengandalkan URL gambar yang tidak terverifikasi. Pilihan upload versus URL perlu dipersempit di Technical Design agar tidak mengganggu tenggat.

## 3. Tool dan Hosting

Keputusan deployment PawLoka: **Vercel Hobby** untuk frontend React/Vite dan API Express sebagai dua project Vercel dari repository yang sama, serta **Supabase Free** untuk Postgres/Auth. Dokumentasi Vercel saat diperiksa mendukung Express tanpa konfigurasi khusus dan menjalankannya melalui Vercel Functions. Ini sesuai untuk REST CRUD, tetapi bukan proses server persisten: jangan mengandalkan filesystem lokal, sesi memori, WebSocket, atau job panjang. Gunakan Supabase untuk data yang persisten, atur CORS ke origin frontend, dan simpan semua secret backend dalam environment variables.

Vercel mencantumkan Hobby $0/bulan; proyek tugas ini non-komersial, tetapi periksa kembali batas pemakaian dan ketentuan plan ketika deploy. Supabase menyebut proyek Free dapat dipause setelah satu minggu tidak aktif. Jalankan smoke test menjelang asistensi/responsi dan jangan menganggap layanan gratis sebagai jaminan ketersediaan produksi. Batas/ketentuan dapat berubah.

Vite PWA menyediakan manifest, service worker, dan registrasi service worker melalui `vite-plugin-pwa`. HTTPS diperlukan untuk penggunaan service worker pada deployment publik. Gunakan domain gratis bawaan host; domain kustom bukan kebutuhan MVP.

## 4. Prioritas MVP

**Must have**
1. Bottom Navigation Bar dan lima atau lebih tampilan: Beranda, Katalog Hewan, Direktori Shelter, Informasi Adopsi, Profile/About.
2. Daftar dan detail hewan, serta daftar dan detail shelter; item list membuka detail.
3. Pencarian/filter yang sesuai data contoh, status adopsi yang jelas, dan navigasi ke shelter terkait.
4. Formulir minat adopsi dengan data minimum, validasi input, status pengajuan, dan pesan sukses/gagal yang tidak menyamarkan error.
5. Portal admin yang hanya dapat diakses setelah login: kelola hewan, shelter, dan status/penghapusan pengajuan.
6. API buatan sendiri, Supabase, responsive layout, manifest/service worker, source code GitHub, dan deployment PWA gratis.

**Tunda dari MVP:** akun adopter/shelter, multi-admin/role kompleks, chat, notifikasi, upload berkas, pembayaran, moderasi otomatis, peta/geolokasi, dan AI.

## 5. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Data kontak pemohon terekspos melalui API atau key frontend | Data minimal; HTTPS; secret di backend; endpoint admin autentikasi/otorisasi; RLS/grants; jangan pernah menyediakan list pengajuan publik. |
| Spam atau input berbahaya ke formulir publik | Validasi di server, batas ukuran/format input, rate limit sederhana, pesan error yang aman, dan uji input invalid. |
| Siapa pun dapat mengubah katalog melalui portal admin | Wajib login dan pemeriksaan otorisasi pada API; jangan membuat endpoint CRUD tanpa auth. |
| Fungsi API/serverless atau kuota layanan gratis membatasi request | Buat API stateless untuk CRUD singkat, tampilkan state loading/retry, cek kuota/plan, dan smoke test sebelum demo. |
| Proyek Supabase berhenti setelah tidak aktif | Buka/test proyek menjelang demo; buat backup/seed SQL lokal dan simpan migrasi/seed di GitHub tanpa secret. |
| Foto tidak berizin atau URL gambar mati | Gunakan aset yang hak pakainya jelas dan fallback gambar; tetapkan metode pengelolaan gambar sebelum membangun admin. |
| Scope membesar menjelang tenggat | Satu admin, data contoh, formulir sederhana, tanpa aplikasi shelter mandiri dan tanpa workflow otomatis. Kerjakan kriteria wajib PPB dahulu. |
| Judul sama dengan praktikan lain | Belum dapat diperiksa dari workspace; praktikan perlu memastikan keunikan judul PawLoka untuk platform PWA. |

## 6. Estimasi Biaya

Target biaya awal **$0** dengan free tiers dan domain bawaan penyedia. Tidak ada biaya tool berbayar yang diperlukan untuk scope ini. Free tier punya batas pemakaian dan perilaku sleep/pause; biaya dapat berubah jika melewati batas, menambahkan domain, atau memilih plan berbayar. Jangan memasukkan kredensial pembayaran sebelum meninjau batas pemakaian dashboard.

## 7. AI dan Otomasi

Tidak ada fitur AI atau otomasi AI di produk. AI hanya boleh menjadi alat bantu pengembangan, bukan perantara untuk membaca/meneruskan data pelamar.

## 8. Langkah Berikutnya

1. Susun PRD dengan acceptance criteria yang langsung memetakan ketentuan PPB dan alur publik/admin.
2. Tetapkan skema database, autentikasi satu admin, perlindungan endpoint, deployment Vercel dua project, dan foto dengan URL publik.
3. Implementasikan satu alur end-to-end lebih dahulu (data hewan dari API → list → detail), lalu katalog/shelter lainnya, formulir, dan admin.
4. Uji akses tanpa login terhadap endpoint admin dan data pengajuan, lalu verifikasi alur responsi di deployment HTTPS.
5. Pastikan judul PawLoka unik pada daftar judul praktikan platform PWA.

## Sumber

Diakses 16 November 2026. Harga dan batas gratis dapat berubah; cek ulang sebelum deployment.

- Supabase Pricing — plan Free, kuota, proyek yang dapat dipause setelah satu minggu tidak aktif: https://supabase.com/pricing
- Supabase Connect to Postgres — pilihan koneksi frontend/backend: https://supabase.com/docs/guides/database/connecting-to-postgres
- Supabase Row Level Security — kebijakan akses, grants, dan kehati-hatian service role: https://supabase.com/docs/guides/database/postgres/row-level-security
- Render Free — layanan gratis, spin-down Web Service setelah 15 menit, dan batas Free: https://render.com/docs/free
- Render Static Sites — deployment frontend statis gratis dan HTTPS: https://render.com/docs/static-sites
- Vercel Express — dukungan deployment Express sebagai Vercel Functions: https://vercel.com/docs/frameworks/backend/express
- Vercel Node.js Runtime — cara kerja Node.js Functions dan rekomendasi entry point API: https://vercel.com/docs/functions/runtimes/node-js
- Vercel Functions Limits — batas fungsi yang perlu dicek kembali sebelum deployment: https://vercel.com/docs/functions/limitations
- Vite PWA — manifest, service worker, dan `vite-plugin-pwa`: https://vite-pwa-org.netlify.app/guide/
- Vercel Pricing — alternatif hosting frontend Hobby gratis: https://vercel.com/pricing

## Handoff Context
<!-- Machine-readable summary for the next workflow step. Preserve decisions and unknowns. -->
- Stage: research
- App name: PawLoka
- User level: C
- Target platform: web (PWA)
- Budget: gratis saja; domain bawaan
- Timeline: pengerjaan 13–24 November 2026; responsi 25–28 November 2026
- Mode: Deep (karena admin portal dan data pengajuan pribadi)
- AI in product scope: no
- Constraints: Tugas Akhir Praktikum PPB Ganjil 2026; individu; React/Vite/PWA + Express/Node.js + Axios + Supabase; wajib API buatan sendiri, Bottom Navigation Bar, minimal lima halaman, dua halaman list dengan detail, Profile/About, GitHub, hosting PWA gratis; judul PWA harus unik; pengalaman level C, ingin belajar melalui proyek.
- Decisions: Data katalog/shelter dikelola admin; satu admin dengan Supabase Auth; portal admin mengelola pengajuan, hewan, dan shelter; pengajuan disimpan dengan nama, email atau telepon, hewan pilihan, pesan opsional; tidak menyimpan alamat/ID/dokumen/foto; admin menghapus data secara manual setelah selesai atau atas permintaan; tidak ada login adopter/shelter; tidak ada AI; fokus calon adopter.
- Open questions: Konfirmasi judul unik oleh praktikan.
- Source files: docs/research-PawLoka.md, docs/PRD-PawLoka-MVP.md
