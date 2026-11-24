# PawLoka

Progressive Web App untuk membantu calon adopter menemukan hewan dan shelter, membaca panduan adopsi, serta mengirim minat adopsi. Proyek ini dibuat sebagai Tugas Akhir Praktikum PPB Ganjil 2026.

## Struktur

- `frontend/` — React + Vite PWA.
- `backend/` — Express REST API, Supabase adapter, demo repository, dan SQL migrations.
- `docs/` — riset, PRD, dan desain teknis yang disetujui.

## Menjalankan mode demo lokal

Persyaratan: Node.js 20.19+ atau 22.12+ (sesuai Vite saat ini) dan npm.

1. Pada terminal pertama:

   ```powershell
   Set-Location backend
   Copy-Item .env.example .env
   # Pastikan DATA_MODE=demo di backend/.env
   npm install
   npm run dev
   ```

2. Pada terminal kedua:

   ```powershell
   Set-Location frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

3. Buka `http://localhost:5173`. Vite meneruskan request `/api` ke API lokal `http://localhost:3001`.

Mode demo hanya menyediakan data hewan/shelter sintetis untuk mencoba alur baca. Pengiriman formulir dan endpoint admin sengaja tidak mengaku berhasil tanpa konfigurasi Supabase. Data demo tidak disimpan.

## Mode Supabase

1. Buat proyek Supabase dan jalankan SQL secara berurutan:
   - `backend/supabase/migrations/202611170001_initial_schema.sql`
   - `backend/supabase/seed.sql`
2. Buat satu akun admin melalui Supabase Dashboard; catat UUID user admin.
3. Atur `backend/.env` dari `.env.example`:
   - `DATA_MODE=supabase`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USER_ID`
   - `CORS_ORIGIN` untuk origin frontend
4. Atur `frontend/.env`:
   - `VITE_API_BASE_URL` ke API backend (akhiri dengan `/api`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Disable public sign-up di Supabase Auth. Jangan menaruh service-role key pada frontend, Git, screenshots, atau log.

RLS aktif pada tabel aplikasi, dan akses tabel langsung oleh `anon`/`authenticated` dicabut. Semua operasi data PawLoka melalui API Express; endpoint admin memverifikasi access token dan ID admin di server.

## Pemeriksaan

Jalankan di folder aplikasi terkait:

```powershell
npm test
npm run lint
```

Tambahan frontend:

```powershell
npm run build
```

## Deployment

Hubungkan repository GitHub ke dua project Vercel:

- Frontend root directory `frontend/`, output `dist`.
- API root directory `backend/`; Express berjalan sebagai Vercel Functions.

Konfigurasikan environment variables pada project yang sesuai. Terapkan CORS hanya ke domain frontend yang benar. Periksa ulang persyaratan/kuota Vercel Hobby dan Supabase Free sebelum deploy. Free-tier bukan jaminan availability produksi; Supabase Free dapat pause setelah periode tidak aktif.

## Catatan data dan gambar

Gunakan data contoh saja untuk demo. Pengajuan berisi nama, email atau nomor telepon, hewan pilihan, pesan opsional, dan timestamp persetujuan. Jangan mencatat data pemohon ke log. Admin menghapus data secara manual setelah selesai atau atas permintaan. Foto katalog berupa URL HTTPS publik yang hak pakainya harus dipastikan oleh pengelola.
