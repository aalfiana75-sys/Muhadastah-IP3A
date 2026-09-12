# Security Policy

## Versi yang didukung

Kami menerima laporan keamanan untuk versi terbaru pada branch `main`.

## Melaporkan kerentanan

**Jangan** membuka issue publik untuk masalah keamanan.

1. Kirim laporan melalui _Security Advisory_ privat GitHub pada repositori ini
   (tab **Security** → **Report a vulnerability**), atau
2. Hubungi pemelihara proyek secara langsung melalui email yang tercantum pada profil GitHub pemilik repositori.

Sertakan:

- Deskripsi kerentanan dan dampaknya.
- Langkah reproduksi (langkah demi langkah).
- Perkiraan tingkat keparahan (rendah / sedang / tinggi / kritis).
- Saran perbaikan bila ada.

Kami berusaha merespons dalam **3×24 jam** dan akan mengabari Anda saat perbaikan dirilis.

## Praktik keamanan proyek ini

- **Tanpa kredensial di repo.** Kunci `anon` Supabase bersifat publik dan dilindungi
  Row Level Security. Kredensial rahasia (service role, password) tidak pernah disimpan
  dalam repositori — lihat `.env.example`.
- **Otorisasi di server.** Seluruh operasi tulis divalidasi Supabase Auth + RLS
  (`profiles.is_admin = true`), bukan oleh JavaScript di klien.
- **Pencegahan XSS.** Semua data yang dirender berasal dari helper escape pada
  `assets/js/security.js`. Tidak ada penyisipan data ke _inline event handler_.
- **Validasi input.** Form admin membatasi panjang dan format nilai sebelum dikirim,
  dengan constraint tambahan pada skema database.
- **Dependency minimal.** Aplikasi tidak memakai bundler dan hanya memuat dependensi
  runtime dari CDN tepercaya.

## Di luar cakupan

- Kerentanan pada layanan pihak ketiga (Supabase, CDN Tailwind/Font Awesome/Google Fonts).
- Serangan yang memerlukan akses fisik ke perangkat pengguna.
- Kebijakan _rate limiting_ pada project Supabase (atur di dashboard Supabase Anda).
