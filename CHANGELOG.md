# Changelog

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
dan proyek ini menganut [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

### Security

- Menghapus seluruh kredensial yang tertanam di repositori: `ADMIN_USERNAME`,
  `ADMIN_PASSWORD`, `SUPABASE_ADMIN_TOKEN`, dan hardcoded anon key pada `config.js`.
- Menghapus header `x-admin-token` statis pada lapisan data; otorisasi tulis kini
  memakai access token Supabase Auth yang divalidasi RLS.
- Menambahkan `assets/js/security.js` berisi helper escape (`esc`, `escAttr`, `escJs`,
  `cleanText`, `safeIcon`) dan menerapkannya pada seluruh render data dinamis di
  `app.js` serta `admin.js` untuk mencegah XSS.
- Mengganti penyisipan data ke _inline event handler_ dengan atribut `data-*` dan
  `addEventListener` pada kartu kosakata dan opsi kuis.
- Menambahkan guard `ensureWritable()` sehingga operasi tulis ditolak ketika Supabase
  tidak aktif atau sesi admin tidak valid.
- Memperketat kebijakan RLS `quiz_scores`: insert publik dibatasi panjang nama dan
  rentang skor; penghapusan hanya untuk admin.
- Menambahkan validasi panjang/format pada seluruh payload form admin.
- Menambahkan `.gitignore` dan `.env.example`; `config.local.js` kini di-ignore.

### Added

- Halaman **Studio audio** (`admin-audio.html` + `assets/js/admin-audio-studio.js`):
  impor beberapa berkas sekaligus lewat drag & drop, ganti nama sebelum unggah, rekam
  langsung dari mikrofon (MediaRecorder), pemantauan status per berkas, serta pemasangan
  audio dari pustaka ke baris percakapan atau kosakata.
- Admin bisa **mengimpor berkas audio** (mp3/wav/ogg/m4a) langsung dari form baris
  percakapan dan kosakata; berkas diunggah ke bucket Supabase Storage `dialog-audio`
  (`assets/js/admin-audio.js`).
- Modal **Pustaka audio** untuk memilih audio yang sudah ada di Storage tanpa mengunggah
  ulang, plus pratinjau pemutar audio di setiap kolom URL audio.
- Kolom `vocab.audio_ar_url` dan bucket Storage `dialog-audio` + policies RLS-nya pada
  `supabase/schema.sql`.
- Dokumentasi profesional: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`,
  dan `CHANGELOG.md`.
- Tooling pengembangan: `package.json` (skrip dev/lint/format), `eslint.config.mjs`,
  `.prettierrc.json`, `.editorconfig`, dan `.vscode/extensions.json`.
- CI GitHub Actions (`.github/workflows/ci.yml`) untuk memeriksa format dan lint.
- `Dockerfile` + `.dockerignore` untuk deployment statis.

### Changed

- `config.js` diubah menjadi modul konfigurasi yang mendukung override via
  `<meta>` tag atau `config.local.js`, dengan default aman (`SUPABASE_ENABLED=false`).
- `admin.js`: autentikasi disederhanakan menjadi Supabase Auth murni; access token
  disinkronkan ke `db.js` pada setiap perubahan status sesi.
- `hydrateFromSource()` dirapikan menjadi `applySource()` agar tidak duplikatif dan
  mempertahankan dialog terpilih secara valid.
- `app.js`: menghapus `window.prompt()` yang memblokir alur kuis, diganti form nama
  skor; tema gelap kini persisten melalui `localStorage` dan menghormati
  `prefers-color-scheme`.
- `app.js`: memperbaiki urutan opsi kuis yang tidak sesuai setelah diacak.
- `index.html` / `admin.html`: menambahkan `security.js` dan `db.js` pada halaman
  utama, meta SEO, penanda `noindex` untuk admin, serta atribut aksesibilitas
  (`autocomplete`, `for`, label tersembunyi).
- `supabase/schema.sql`: seed menjadi idempoten, menambahkan reset sequence untuk
  seluruh tabel, index pencarian, dan panduan pembuatan admin pertama.
- `.vscode/settings.json`: menghapus API key pribadi dan menggantinya dengan
  pengaturan format/lint bersama.

## [1.0.0] - 2026-01-01

### Added

- Rilis awal: halaman beranda, dialog interaktif dengan Text-to-Speech, tabel
  kosakata, kuis, panel admin, integrasi Supabase, dan data seed lokal.
