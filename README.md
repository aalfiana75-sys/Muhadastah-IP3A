# Muhadatsah — Belajar Percakapan Bahasa Arab & Inggris

> Platform belajar percakapan (muhadatsah) tiga bahasa — **Arab • Inggris • Indonesia** — dengan dialog interaktif, kosakata, kuis, dan panel admin berbasis Supabase.

![Status](https://img.shields.io/badge/status-active-success)
![Lisensi](https://img.shields.io/badge/lisensi-MIT-blue)
![Tanpa Build](https://img.shields.io/badge/build-tanpa%20bundler-informational)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)

---

## Daftar Isi

- [Fitur](#fitur)
- [Demo Alur](#demo-alur)
- [Arsitektur](#arsitektur)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Konfigurasi Supabase](#konfigurasi-supabase)
- [Skema Database](#skema-database)
- [Membuat Akun Admin](#membuat-akun-admin)
- [Model Keamanan](#model-keamanan)
- [Skrip NPM](#skrip-npm)
- [Deployment](#deployment)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Fitur

| Fitur                        | Keterangan                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🗣️ **Dialog interaktif**     | Dialog dua arah dengan mode tampilan Arab saja, Inggris saja, atau lengkap (AR • EN • ID).                                                                             |
| � **Tabel kosakata**        | Kosakata terkelompok per kategori (sapaan, sekolah, pasar, keluarga) dengan pencarian instan.                                                                          |
| 🧠 **Kuis interaktif**       | 5 atau 10 soal acak Arab → Inggris/Indonesia, dengan skor dan papan peringkat.                                                                                         |
| 🌗 **Mode gelap**            | Tema terang/gelap dengan preferensi yang tersimpan di `localStorage`.                                                                                                  |
| 🌐 **Antarmuka tiga bahasa** | Label UI dapat diganti ID / EN / AR melalui i18n ringan bawaan.                                                                                                        |
| 🔍 **Pencarian global**      | Mencari dialog dan kosakata sekaligus dari satu kolom pencarian.                                                                                                       |
| 🛠️ **Panel admin**           | CRUD dialog, baris percakapan, dan kosakata lewat Supabase Auth.                                                                                                       |
| 📱 **Responsif**             | Tata letak adaptif untuk seluler, tablet, dan desktop.                                                                                                                 |

## Demo Alur

1. **Beranda** — hero, kalimat harian, dan pencarian global.
2. **Percakapan** — filter kategori → pilih kartu dialog → modal dengan teks per baris.
3. **Kosakata** — tabel kosakata terstruktur per kategori.
4. **Kuis** — pilih jumlah soal → jawab → lihat skor → simpan nama ke papan peringkat.

> Butuh server HTTP (bukan `file://`) agar skrip browser dapat berjalan dengan benar.

## Arsitektur

Aplikasi ini sengaja dibuat **tanpa build step / bundler** agar mudah dipelajari, di-deploy, dan dimodifikasi:

- **Frontend:** HTML statis + Tailwind CSS (CDN) + Font Awesome + Google Fonts.
- **Logika:** _classic scripts_ (`assets/js/*.js`) yang menempelkan fungsi ke `window`
  sehingga bisa dipanggil dari `onclick="..."` dan otomatis dari _browser automation_.
- **Backend opsional:** Supabase (Postgres + Auth + REST). Bila tidak dikonfigurasi,
  aplikasi otomatis memakai **data lokal** dari `assets/js/data.js`.
- **Lapisan data:** `db.js` memilih Supabase atau data lokal melalui satu fungsi `dbLoadAll()`.

```text
Browser
  ├─ index.html ──► config → security → data → db → app.js
  └─ admin.html ──► config → security → data → db → admin.js
                                   │
                                   ├── Supabase REST (dialogs, dialog_lines, vocab, quiz_scores)
                                   └── fallback: assets/js/data.js
```

## Struktur Proyek

```text
muhadastah/
├── index.html                  # Halaman utama
├── admin.html                  # Panel admin (login Supabase)
├── assets/
│   ├── css/style.css           # Gaya kustom + tema admin
│   └── js/
│       ├── config.js           # Konfigurasi publik (URL + anon key)
│       ├── security.js         # Helper anti-XSS (esc, escAttr, escJs, safeIcon)
│       ├── data.js             # Data seed lokal (dialog, kosakata, i18n)
│       ├── db.js               # Lapisan data: Supabase REST / lokal
│       ├── app.js              # Logika halaman utama
│       └── admin.js            # Logika panel admin
├── supabase/schema.sql         # Skema + RLS + seed database
├── .env.example                # Contoh variabel lingkungan
├── package.json                # Skrip dev, lint, format
├── eslint.config.mjs           # Aturan ESLint
└── .prettierrc.json            # Aturan Prettier
```

## Menjalankan Secara Lokal

**Prasyarat:** Node.js ≥ 18 (hanya untuk dev server & lint; runtime aplikasi tidak butuh Node).

```bash
# 1. Install tooling pengembangan
npm install

# 2. Jalankan dev server
npm run dev
```

Buka `http://localhost:5173`.

Ingin tanpa install? Gunakan server statis apa pun, misalnya:

```bash
python -m http.server 5173
# atau
npx serve .
```

## Konfigurasi Supabase

### 1. Buat project

Daftar di [supabase.com](https://supabase.com), buat project baru, lalu ambil **Project URL** dan **anon public key** dari _Project Settings → API_.

### 2. Isi konfigurasi lokal

Karena anon key bersifat publik namun tetap lebih rapi bila tidak di-commit, gunakan file lokal:

```js
// assets/js/config.local.js  (sudah masuk .gitignore)
window.SUPABASE_URL = 'https://your-project-ref.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-public-key';
window.SUPABASE_ENABLED = true;
```

Alternatif untuk deploy statis: gunakan `<meta>` tag pada `index.html` & `admin.html`:

```html
<meta name="supabase-url" content="https://your-project-ref.supabase.co" />
<meta name="supabase-anon-key" content="your-anon-public-key" />
<meta name="supabase-enabled" content="true" />
```

> Bila `SUPABASE_ENABLED` bernilai `false` atau anon key kosong, aplikasi tetap berjalan penuh dengan **data lokal**. Operasi tulis admin akan ditolak dengan pesan yang jelas.

### 3. Terapkan skema database

Buka _Supabase Dashboard → SQL Editor → New Query_, tempel isi `supabase/schema.sql`, lalu **Run**. Skrip ini membuat tabel, kebijakan RLS, index, dan data awal yang idempoten (aman dijalankan berulang).

## Skema Database

| Tabel          | Isi                                               | Akses baca             | Akses tulis                              |
| -------------- | ------------------------------------------------- | ---------------------- | ---------------------------------------- |
| `profiles`     | Profil + flag `is_admin`                          | hanyailik `auth.uid()` | admin                                    |
| `dialogs`      | Metadata dialog (judul ID/EN/AR, kategori, level) | publik                 | admin                                    |
| `dialog_lines` | Baris percakapan per dialog                       | publik                 | admin                                    |
| `vocab`        | Kosakata tiga bahasa                              | publik                 | admin                                    |
| `quiz_scores`  | Papan peringkat kuis                              | publik                 | insert publik (tervalidasi), hapus admin |

Constraint penting:

- `cat` dibatasi ke `sapaan | sekolah | pasar | keluarga`.
- `speaker` dibatasi ke `A | B`.
- Insert `quiz_scores` dibatasi: panjang nama 1–40, skor 0–100, total 1–100.


## Membuat Akun Admin

1. **Authentication → Users → Add user** — isi email & password, centang **Auto Confirm User**.
2. Jalankan SQL berikut dengan email tersebut:

```sql
insert into profiles (id, email, is_admin)
select id, email, true from auth.users where email = 'admin@example.com'
on conflict (id) do update set is_admin = true;
```

3. Buka `admin.html` dan login memakai email + password tadi.

## Model Keamanan

| Aspek              | Implementasi                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Kredensial**     | Tidak ada password/token rahasia di repositori. Login memakai Supabase Auth.                                                            |
| **Otorisasi**      | RLS memverifikasi `is_admin_user()` di server untuk setiap operasi tulis.                                                               |
| **XSS**            | Semua render data melewati `esc()` / `escAttr()` dari `security.js`; nilai dinamis tidak pernah masuk ke _inline handler_.              |
| **Validasi input** | Pembatasan panjang & format di klien (admin.js) + constraint di database.                                                               |
| **Field ikon**     | Divalidasi terhadap pola `^fa-[a-z0-9-]{1,40}$` oleh `safeIcon()`.                                                                      |
| **Fallback aman**  | Bila Supabase tidak aktif, operasi tulis ditolak dengan pesan jelas — tidak ada penulisan diam-diam.                                    |

Detail lengkap dan cara melaporkan kerentanan ada di [SECURITY.md](SECURITY.md).

## Skrip NPM

| Perintah               | Fungsi                                                                |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run dev`          | Menjalankan dev server dengan live reload (`http-server`, port 5173). |
| `npm run serve`        | Dev server tanpa membuka browser.                                     |
| `npm run lint`         | Menjalankan ESLint pada seluruh skrip.                                |
| `npm run lint:fix`     | ESLint dengan perbaikan otomatis.                                     |
| `npm run format`       | Merapikan format dengan Prettier.                                     |
| `npm run format:check` | Memeriksa format tanpa mengubah berkas.                               |
| `npm run check`        | Pemeriksaan lengkap (format + lint) — dipakai di CI.                  |

## Deployment

Karena aplikasi sepenuhnya statis, dapat di-deploy ke layanan hosting mana pun:

- **GitHub Pages** — unggah branch ke Pages, arahkan ke root.
- **Netlify / Vercel / Cloudflare Pages** — _build command_ kosong, _publish directory_ `.`
  (atau `npm run dev` tidak diperlukan sama sekali).
- **Docker** — tersedia `Dockerfile` berbasis Node + `http-server`:

```bash
docker build -t muhadatsah .
docker run --rm -p 8080:8080 muhadatsah
# buka http://localhost:8080
```

> Jangan lupa mengisi konfigurasi Supabase pada lingkungan produksi (meta tag atau
> `config.local.js` yang di-deploy terpisah).

## Kontribusi

Kontribusi sangat diterima! Bacalah [CONTRIBUTING.md](CONTRIBUTING.md) untuk alur kerja,
standar kode, dan **aturan keamanan yang wajib dipatuhi** (terutama larangan menulis
kredensial ke repositori dan kewajiban meng-escape data sebelum render).

## Lisensi

Dirilis di bawah [Lisensi MIT](LICENSE) © 2026 Muhadatsah Contributors.
