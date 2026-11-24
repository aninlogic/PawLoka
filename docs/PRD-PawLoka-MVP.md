# PawLoka — Product Requirements Document (MVP)

**Product name:** PawLoka  
**Tagline:** Temukan teman baru, temukan tempat yang tepat.  
**Platform:** Progressive Web App (PWA)  
**Document status:** MVP scope confirmed on 16 November 2026

## 1. Product Overview

PawLoka adalah PWA informasi adopsi hewan yang membantu calon adopter menemukan hewan dan shelter, memahami persyaratan adopsi, dan menyampaikan minat adopsi melalui formulir sederhana. Satu admin mengelola katalog, direktori shelter, dan pengajuan melalui portal terproteksi.

Proyek ini dibuat sebagai Tugas Akhir Praktikum PPB Ganjil 2026 untuk memenuhi ketentuan platform dan sekaligus memberi pemilik proyek latihan end-to-end dengan React, Vite, PWA, Express/Node.js, Axios, dan Supabase.

**Tujuan rilis:** menyelesaikan MVP yang dapat dijalankan dan didemokan, dideploy pada hosting gratis, serta memenuhi kriteria PPB paling lambat 24 November 2026.

## 2. Target Users

### Pengguna utama — Calon adopter

Ingin menemukan hewan yang sesuai, meninjau detail dan shelter terkait, memahami prosedur, lalu menyampaikan minat tanpa harus menghubungi beberapa sumber informasi secara terpisah.

### Pengguna pendukung — Admin PawLoka

Satu admin memasukkan dan memperbarui informasi hewan/shelter, melihat status pengajuan, dan menghapus data pemohon setelah selesai atau atas permintaan.

Shelter bukan pengguna terautentikasi pada MVP; admin mengelola informasi mereka. Adopter juga tidak perlu akun.

## 3. Problem Statement

Informasi hewan yang dapat diadopsi dan lokasi shelter sulit ditinjau dalam satu alur yang konsisten. Calon adopter memerlukan katalog yang mudah dicari, informasi shelter yang terkait, dan petunjuk langkah berikutnya. PawLoka menyatukan informasi tersebut dan menyediakan saluran minat yang jelas tanpa mengambil alih proses keputusan adopsi shelter.

## 4. User Journey

1. Calon adopter membuka Beranda di ponsel atau desktop.
2. Mereka membuka Katalog Hewan, mencari atau memfilter jenis/usia/status, lalu memilih item.
3. Halaman Detail Hewan menampilkan foto, atribut, deskripsi, status, dan shelter terkait.
4. Calon adopter membuka Detail Shelter atau Panduan Adopsi untuk meninjau lokasi, kontak, dan persyaratan.
5. Mereka mengisi formulir minat dengan nama, domisili, alasan adopsi, pengalaman memelihara, dan catatan opsional; nomor WhatsApp pemohon tidak diminta.
6. Setelah membaca dan menyetujui pemberitahuan penggunaan data, mereka menyimpan pengajuan. WhatsApp terbuka otomatis dengan draf yang sudah terisi melalui QR kontak tetap PawLoka; pesan hanya terkirim jika mereka menekan Kirim di WhatsApp.
7. Mereka melihat status pengajuan melalui token akses khusus yang disimpan pada perangkat; tidak diperlukan akun adopter.
8. Admin login ke portal, melihat pengajuan, memperbarui status, dan menghapus pengajuan setelah selesai atau atas permintaan.

## 5. MVP Features and Acceptance Criteria

### F1 — Bottom Navigation dan halaman publik

- Tersedia Bottom Navigation Bar dengan tujuan Beranda, Hewan, Shelter, Favorite, Adopsi, dan Profil.
- Halaman Favorite memuat hewan dari API berdasarkan ID yang disimpan pada perangkat dan mendukung penghapusan dari daftar.
- Tersedia setidaknya lima halaman yang berbeda: Beranda, Katalog Hewan, Detail Hewan, Direktori Shelter, Detail Shelter, Panduan Adopsi, dan Profile/About.
- Navigasi dapat digunakan dengan keyboard dan sentuhan; item aktif terlihat.

### F2 — Katalog dan detail hewan

- Katalog menampilkan data hewan dari API buatan sendiri.
- Setiap item dapat diklik dan membuka Detail Hewan yang sesuai.
- Detail menampilkan foto, nama, jenis, ras, usia, jenis kelamin, deskripsi, status adopsi, dan shelter terkait.
- Pencarian/filter yang tersedia mencakup jenis hewan, usia, dan status adopsi.
- Jenis yang dicakup data contoh: kucing, anjing, burung, hamster, sugar glider, kelinci, kura-kura, ikan hias, dan landak mini.
- Hasil kosong dan kegagalan API diberi tampilan informatif.

### F3 — Direktori dan detail shelter

- Direktori menampilkan shelter dari API; setiap item membuka detail shelter yang sesuai.
- Detail shelter menampilkan nama, lokasi, kontak, deskripsi, dan daftar hewan yang terkait/tersedia.
- Informasi kontak shelter ditampilkan dari database. Semua handoff WhatsApp memakai satu nomor global yang dikonfigurasi terpusat di frontend, bukan `shelters.phone`; nomor telepon pemohon tidak dikumpulkan.

### F4 — Panduan adopsi

- Halaman Panduan Adopsi menampilkan persyaratan dan langkah umum yang dapat dipahami tanpa akun.
- Informasi diberi penanda bahwa keputusan akhir dan ketentuan aktual ditetapkan shelter.

### F5 — Formulir minat adopsi

- Formulir mengirimkan data melalui API Express ke Supabase.
- Field mencakup nama, domisili, alasan adopsi, pengalaman memelihara, hewan pilihan, dan catatan opsional; nomor WhatsApp pemohon tidak dikumpulkan.
- Validasi dijalankan pada klien untuk UX dan diulang di server sebelum penyimpanan.
- Sebelum submit, pengguna harus menyetujui pemberitahuan yang menerangkan data yang disimpan, akses admin, token riwayat perangkat, pembukaan WhatsApp, dan cara meminta penghapusan.
- Aplikasi tidak mengumpulkan alamat rumah lengkap, nomor identitas, dokumen, atau foto pelamar.
- Setelah berhasil disimpan, aplikasi otomatis membuka tautan `wa.me` ke nomor global dengan pesan yang memuat data pemohon dan hewan; pesan tidak dikirim otomatis dan tetap harus dikirim manual oleh pengguna. Jika tab otomatis diblokir browser, tautan tetap tersedia pada ringkasan.
- Setiap pengajuan menghasilkan token acak sekali tampil; hanya hash token yang disimpan di database, sedangkan token disimpan di perangkat pengguna untuk mengakses status satu pengajuan.
- Akses riwayat publik harus memvalidasi ID dan token, hanya mengembalikan status/tanggal serta hewan dan shelter terkait, menerapkan rate limit dan `Cache-Control: no-store`, dan tidak menyediakan endpoint daftar publik.
- Pengguna melihat status loading, konfirmasi sukses, dan error yang jelas; kegagalan tidak ditampilkan sebagai sukses. Status awal `pending` ditampilkan sebagai “Menunggu Konfirmasi”; status diubah hanya oleh admin.

### F6 — Admin portal

- Portal admin memiliki autentikasi Supabase Auth untuk satu admin; tidak ada pendaftaran adopter/shelter.
- Halaman dan endpoint admin menolak akses tanpa sesi/token valid.
- Admin dapat membuat, membaca, memperbarui, dan menghapus data hewan dan shelter.
- Admin dapat meninjau pengajuan, memperbarui statusnya, dan menghapusnya secara manual setelah selesai atau atas permintaan.
- API memeriksa autentikasi/otorisasi dan memvalidasi setiap perubahan; menyembunyikan tombol di frontend saja tidak memenuhi kriteria.
- Tidak ada endpoint daftar publik. Pembacaan status oleh pemohon hanya tersedia untuk satu pengajuan dengan token pemilik.

### F7 — Profile/About

- Profile/About menjelaskan tujuan aplikasi dan proyek tugas akhir.
- Informasi identitas pengembang hanya dicantumkan bila disediakan oleh pengembang; jangan mengarang detail pribadi.

### F8 — PWA dan rilis tugas

- PWA memiliki manifest yang benar, ikon yang sesuai, dan service worker terdaftar pada deployment HTTPS.
- Layout bekerja pada viewport ponsel dan desktop.
- Aset statis dapat dimuat saat offline; respons API dan data admin/pengajuan tidak dicache oleh service worker.
- Source code berada di repository GitHub dan URL repository disiapkan untuk pengumpulan.
- PWA dideploy pada layanan gratis. Uji deployment ketika layanan aktif; jelaskan bila free-tier menyebabkan cold start.

## 6. Success Metrics

Tidak ada target jumlah pengguna karena proyek ini tugas kuliah dan belum memiliki kanal akuisisi/analitik. Keberhasilan diukur dengan bukti berikut:

1. Semua acceptance criteria F1–F8 yang berlaku lulus pengujian.
2. Dua alur list → detail (hewan dan shelter) berhasil; pencarian/filter mengubah hasil secara benar.
3. Alur publik hingga penyimpanan pengajuan, ringkasan, dan pembukaan draf WhatsApp berhasil; pesan hanya terkirim secara manual, admin dapat meninjau/memperbarui/menghapus pengajuan, dan pemohon dapat membaca statusnya dengan token.
4. Endpoint admin dan daftar pengajuan menolak akses tanpa autentikasi/otorisasi yang valid; riwayat publik hanya dapat membaca satu pengajuan dengan token yang benar.
5. Data hewan/shelter dibaca dari Supabase melalui API Express, bukan dataset frontend yang menjadi sumber produksi.
6. PWA dapat dibuka melalui URL HTTPS dan source code tersedia di GitHub.
7. Pengembang dapat menerangkan arsitektur, alur data, autentikasi, dan batas data pribadi saat asistensi/responsi.

## 7. Design Direction

Gaya yang diminta: **modern, playful, clean, friendly, fresh, vibrant, profesional**.

- Palet: soft mint green, off-white, deep forest green, lavender, aksen kuning dan coral.
- Beranda: navbar minimalis dengan logo PawLoka; hero berheadline besar, deskripsi singkat, CTA yang jelas, dan foto anjing/kucing besar dengan efek cutout serta dekorasi bentuk organik.
- Katalog: grid kartu dengan foto sebagai fokus; nama, jenis, usia, dan jenis kelamin pada label putih di bagian bawah foto. Kartu dapat memakai aksen warna berbeda tanpa mengurangi keterbacaan.
- Direktori shelter dan Panduan Adopsi mengikuti palet dan gaya yang sama.
- Gunakan rounded corners, tipografi modern, whitespace, soft shadows, dan dekorasi dinamis secara terukur.
- Prioritaskan layout mobile-first, fokus keyboard, teks alternatif gambar, dan kontras yang memadai.
- Lisensi dan cara pengelolaan foto perlu ditetapkan sebelum katalog/admin dibangun.

## 8. Technical and Data Considerations

- Stack pilihan: React + Vite + PWA, Axios, Express/Node.js, Supabase Postgres/Auth.
- Browser berbicara ke API Express; backend berbicara ke Supabase. Kunci istimewa tidak boleh berada pada bundle frontend.
- Tabel inti: hewan, shelter, pengajuan. Pengajuan memiliki relasi ke hewan/shelter, status, timestamp, dan data kontak minimum.
- Kunci publik database/API tidak dapat membaca daftar pengajuan atau mengubah katalog; API hanya menyediakan pembacaan satu status pengajuan dengan token pemilik.
- Autentikasi admin dan pemeriksaan otorisasi wajib dilakukan server-side; aktifkan RLS dan berikan grants/policies sesempit mungkin.
- Validasi dan batas permintaan pada server; tambahkan rate limit untuk endpoint submit publik.
- CORS hanya mengizinkan origin frontend yang dideploy.
- Jangan mencatat data kontak/message ke log. Penghapusan manual harus mencakup pengajuan di database.
- Persetujuan pada formulir dan kebijakan data harus menyebutkan bahwa data pengajuan disimpan di Supabase, diproses oleh admin, token akses riwayat disimpan di perangkat, draf WhatsApp dibuka melalui QR kontak tetap dan baru dikirim setelah tindakan manual, serta penghapusan dapat diminta.
- Deployment memakai dua project Vercel (frontend dan API Functions) serta Supabase. API tidak boleh mengandalkan state lokal/persisten; periksa batas Vercel Hobby dan Supabase Free sebelum deployment. Supabase Free dapat pause setelah tidak aktif.

## 9. AI / Automation Scope

Tidak ada fitur AI, layanan model, atau otomasi AI di dalam produk. AI hanya boleh menjadi alat bantu pengembangan dan tidak menerima data pelamar.

## 10. Constraints and Explicit Non-Goals

**Batasan:** biaya layanan nol; deadline pengerjaan 24 November 2026; deployment gratis; materi kuliah dan ketentuan PPB; judul untuk platform PWA harus unik; individu; pengalaman level C yang ingin belajar.

**Bukan bagian MVP:** akun adopter/shelter, pengelolaan katalog mandiri oleh shelter, banyak peran admin, chat internal, pengiriman otomatis ke shelter, unggah dokumen/foto pelamar, pembayaran, peta/geolokasi, notifikasi, analitik perilaku, dan fitur AI.

**Open decisions:** konfirmasi keunikan judul oleh praktikan.

## 11. Definition of Done

- Kriteria akademik F1–F8 terpetakan dan diuji.
- Data publik datang dari API Express dan Supabase; form submit tersimpan dengan status yang benar.
- Admin yang login dapat mengelola data; pengguna publik tidak dapat mendaftar/menelusuri pengajuan atau mengubah katalog/shelter; satu pengajuan hanya dapat dibaca melalui token pemilik.
- Form memiliki pemberitahuan penggunaan data dan menolak submit tanpa persetujuan atau field wajib; handoff WhatsApp tidak mengirim pesan otomatis.
- Loading, kosong, offline, sukses, dan gagal ditangani dengan benar.
- PWA di-deploy melalui HTTPS pada hosting gratis dan dapat diuji dengan URL publik.
- Source code dan instruksi menjalankan proyek tersedia di GitHub tanpa secrets.
- Pengembang melakukan sedikitnya satu asistensi dan mencatat lembar asistensi sesuai ketentuan praktikum.

---
```json
{
  "schemaVersion": 1,
  "documentType": "prd",
  "appName": "PawLoka",
  "oneLiner": "PWA yang membantu calon adopter menemukan hewan dan shelter, membaca panduan, serta menyampaikan minat adopsi.",
  "targetUsers": "Calon adopter; satu admin PawLoka mengelola katalog, shelter, dan pengajuan.",
  "phase": "Foundation",
  "mustHave": [
    "Bottom Navigation Bar dan lima atau lebih halaman publik",
    "Katalog hewan dan direktori shelter dengan halaman detail yang dapat dibuka dari setiap item",
    "Pencarian/filter hewan dan Profile/About",
    "Panduan dan formulir minat adopsi dengan pemberitahuan privasi",
    "Admin portal terautentikasi untuk mengelola hewan, shelter, dan pengajuan",
    "API Express + Supabase, PWA terdeploy gratis, dan source code GitHub"
  ],
  "niceToHave": [
    "Pengalaman instalasi PWA yang teruji",
    "Fallback gambar dan empty/error states yang konsisten"
  ],
  "notInMvp": [
    "Akun adopter/shelter",
    "Chat dan pengiriman otomatis",
    "Unggah dokumen/foto pelamar",
    "Peta/geolokasi dan notifikasi",
    "Fitur AI"
  ],
  "successMetrics": [
    "Semua kriteria PPB dan acceptance criteria MVP lulus",
    "Alur publik hingga submit dan alur admin kelola data berhasil",
    "Endpoint admin dan daftar pengajuan menolak akses tanpa autentikasi",
    "PWA HTTPS terdeploy dan repository GitHub tersedia"
  ]
}
```

## Handoff Context
<!-- Machine-readable summary for the next workflow step. Preserve unknowns explicitly. -->
- Stage: PRD
- App name: PawLoka
- User level: C
- Target platform: web (PWA)
- Budget: gratis saja; domain bawaan
- Timeline: pengerjaan 13–24 November 2026; responsi 25–28 November 2026
- Mode: Deep
- AI in product scope: no
- Constraints: Tugas Akhir Praktikum PPB Ganjil 2026; individu; React/Vite/PWA + Express/Node.js + Axios + Supabase; wajib API buatan sendiri, Bottom Navigation Bar, minimal lima halaman, dua halaman list dengan detail, Profile/About, GitHub, hosting PWA gratis; judul PWA harus unik; target selesai 24 November 2026.
- Decisions: Fokus calon adopter; satu admin Auth; form menyimpan nama, domisili, alasan adopsi, pengalaman, hewan, dan pesan opsional setelah consent, tanpa nomor WhatsApp pemohon; tidak menyimpan alamat rumah lengkap/ID/dokumen/foto; token acak per pengajuan disimpan di localStorage dan hash-nya di database untuk baca satu status saja; satu nomor WhatsApp global dari konfigurasi frontend menjadi tujuan semua hewan dan pesan hanya dikirim manual; tidak ada akun adopter, daftar pengajuan publik, AI, chat internal, atau pengiriman pesan otomatis; admin menghapus data manual.
- Open questions: Konfirmasi judul unik oleh praktikan.
- Source files: docs/research-PawLoka.md, docs/PRD-PawLoka-MVP.md
