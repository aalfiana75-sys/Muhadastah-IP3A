# Muhadatsah — Belajar Percakapan Bahasa Arab & Inggris

> Platform belajar percakapan (muhadatsah) tiga bahasa — **Arab • Inggris • Indonesia** — dengan dialog interaktif, kosakata, audio pelafalan (Text-to-Speech), kuis, dan panel admin berbasis Supabase.

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
| 🔊 **Text-to-Speech**        | Pelafalan Arab (`ar-SA`) dan Inggris (`en-US`) per baris dialog maupun per kosakata.                                                                                   |
| ▶️ **Putar otomatis**        | Memutar seluruh isi dialog secara berurutan dengan highlight baris aktif.                                                                                              |
| 📚 **Tabel kosakata**        | Kosakata terkelompok per kategori (sapaan, sekolah, pasar, keluarga) dengan pencarian instan.                                                                          |
| 🧠 **Kuis interaktif**       | 5 atau 10 soal acak Arab → Inggris/Indonesia, dengan skor dan papan peringkat.                                                                                         |
| 🌗 **Mode gelap**            | Tema terang/gelap dengan preferensi yang tersimpan di `localStorage`.                                                                                                  |
| 🌐 **Antarmuka tiga bahasa** | Label UI dapat diganti ID / EN / AR melalui i18n ringan bawaan.                                                                                                        |
| 🔍 **Pencarian global**      | Mencari dialog dan kosakata sekaligus dari satu kolom pencarian.                                                                                                       |
| 🛠️ **Panel admin**           | CRUD dialog, baris percakapan, dan kosakata lewat Supabase Auth.                                                                                                       |
| 🎧 **Impor audio admin**     | Admin bisa mengunggah berkas audio (mp3/wav/ogg/m4a) ke Supabase Storage atau memilih dari pustaka audio yang sudah ada — tanpa perlu meng-upload ke hosting sendiri.  |
| 📱 **Responsif**             | Tata letak adaptif untuk seluler, tablet, dan desktop.                                                                                                                 |
| 🎚️ **Studio audio admin**    | Halaman `admin-audio.html` untuk impor massal (drag & drop), ganti nama sebelum unggah, rekam langsung dari mikrofon, dan memasang audio ke baris percakapan/kosakata. |

## Demo Alur

1. **Beranda** — hero, kalimat harian, dan pencarian global.
2. **Percakapan** — filter kategori → pilih kartu dialog → modal dengan audio per baris.
3. **Kosakata** — tabel dengan tombol audio Arab/Inggris di setiap baris.
4. **Kuis** — pilih jumlah soal → jawab → lihat skor → simpan nama ke papan peringkat.

> Butuh server HTTP (bukan `file://`) karena aplikasi memuat skrip dan memanggil TTS.

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
├── admin-audio.html            # Studio audio: impor massal & rekam
├── assets/
│   ├── css/style.css           # Gaya kustom + tema admin
│   └── js/
│       ├── config.js           # Konfigurasi publik (URL + anon key)
│       ├── security.js         # Helper anti-XSS (esc, escAttr, escJs, safeIcon)
│       ├── data.js             # Data seed lokal (dialog, kosakata, i18n)
│       ├── db.js               # Lapisan data: Supabase REST / lokal
│       ├── app.js              # Logika halaman utama
│       ├── admin.js            # Logika panel admin
│       ├── admin-audio.js      # Impor / pustaka audio admin (Supabase Storage)
│       └── admin-audio-studio.js # Studio audio: unggah massal, ganti nama, rekam
├── supabase/schema.sql         # Skema + RLS + bucket storage + seed database
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

### Storage audio

`supabase/schema.sql` juga membuat bucket **`dialog-audio`** (publik, agar audio bisa
langsung diputar oleh `index.html`) beserta policies RLS-nya:

| Operasi pada `storage.objects` | Policy                          |
| ------------------------------ | ------------------------------- |
| `select`                       | publik (siapa pun boleh baca)   |
| `insert` / `update` / `delete` | hanya `is_admin_user()` (admin) |

Berkas disimpan dengan nama acak di folder `lines/` (mis. `lines/arab-2026-01-01-a1b2c3d4.mp3`).

> Jalankan ulang `supabase/schema.sql` pada project yang sudah ada untuk menambah bucket,
> policies, dan kolom `vocab.audio_ar_url`.

## Membuat Akun Admin

1. **Authentication → Users → Add user** — isi email & password, centang **Auto Confirm User**.
2. Jalankan SQL berikut dengan email tersebut:

```sql
insert into profiles (id, email, is_admin)
select id, email, true from auth.users where email = 'admin@example.com'
on conflict (id) do update set is_admin = true;
```

3. Buka `admin.html` dan login memakai email + password tadi.

## Mengelola Audio di Admin

Ada dua jalur, dan keduanya memakai bucket `dialog-audio` yang sama:

### A. Studio audio (`admin-audio.html`)

Halaman khusus untuk mengelola audio sebagai berkas:

1. Buka **Audio** pada navigasi admin.
2. **Impor berkas** — klik area unggah atau jatuhkan beberapa berkas audio sekaligus
   (drag & drop). Isi **Label / prefix nama** (mis. `arab`, `kosakata`) agar nama berkas di
   Storage mudah dikenali, dan **Ganti nama sebelum unggah** bila ingin menimpa nama asli.
3. **Rekam dari mikrofon** — tombol _Rekam dari mikrofon_ merekam suara lalu menyimpannya
   sebagai berkas `.webm` yang siap diunggah bersama berkas lain.
4. Klik **Unggah ke pustaka**. Status tiap berkas (siap / mengunggah / terunggah / gagal)
   tampil di daftar berkas.
5. **Pasang ke materi** — pilih baris percakapan dan/atau kosakata pada bagian
   _Pasang Audio ke Materi_, lalu klik **Pasang ke materi** pada kartu audio di pustaka.
   Tombol **Salin URL** menyalin tautan publik untuk dipakai di tempat lain.

> Mengubah audio baris lewat studio hanya mengisi kolom Arab bila baris itu belum punya
> audio arahan Arab; kolom URL di form baris/kosakata tetap menjadi sumber utama.

### B. Pemilih audio di form

1. Buka halaman **Dialog**, **Conversation lines**, atau **Vocabulary** lalu pilih tombol
   **Edit**/**Tambah** agar form muncul.
2. Pada bagian **Audio Arab** / **Audio Inggris**, pilih salah satu cara:
   - **Import Audio** — pilih berkas dari komputer (mp3, wav, ogg, m4a, aac, opus, webm,
     maksimal 20 MB). Berkas langsung diunggah ke bucket `dialog-audio` dan URL publiknya
     terisi otomatis.
   - **Pilih dari Pustaka** — membuka modal berisi semua audio yang sudah ada di bucket;
     tombol **Pakai audio ini** mengisi URL tanpa mengunggah ulang.
   - **Tempel URL** — menempel URL `https://...` secara manual (mis. dari CDN lain).
3. Klik **Simpan Baris** / **Simpan Kosakata**. URL audio disimpan di kolom
   `dialog_lines.audio_ar_url`, `dialog_lines.audio_en_url`, atau `vocab.audio_ar_url`.

Catatan:

- Unggah hanya bisa dilakukan setelah login admin (RLS `is_admin_user()`), dan hanya bila
  `SUPABASE_ENABLED=true` beserta anon key terisi.
- Batas ukuran berkas global project Supabase Free adalah 50 MB; aplikasi sudah membatasi
  20 MB agar aman.
- Bila pemutar otomatis gagal (audio hilang/URL salah), halaman belajar tetap memakai
  Text-to-Speech sebagai fallback.

## Model Keamanan

| Aspek              | Implementasi                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Kredensial**     | Tidak ada password/token rahasia di repositori. Login memakai Supabase Auth.                                                            |
| **Otorisasi**      | RLS memverifikasi `is_admin_user()` di server untuk setiap operasi tulis.                                                               |
| **XSS**            | Semua render data melewati `esc()` / `escAttr()` dari `security.js`; nilai dinamis tidak pernah masuk ke _inline handler_.              |
| **Validasi input** | Pembatasan panjang & format di klien (admin.js) + constraint di database.                                                               |
| **Unggahan audio** | Hanya admin dapat menulis ke bucket `dialog-audio` (policy RLS `storage.objects`); ekstensi & ukuran diperiksa di klien sebelum unggah. |
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
