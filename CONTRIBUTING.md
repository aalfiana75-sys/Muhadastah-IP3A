# Contributing to Muhadatsah

Terima kasih atas minat Anda untuk berkontribusi! Dokumen ini menjelaskan alur kerja, standar kode, dan aturan keamanan yang wajib diikuti.

## 1. Persiapan lingkungan

```bash
git clone <url-repo-anda>
cd muhadastah
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

Jika ingin menghubungkan ke Supabase, buat file `assets/js/config.local.js` (sudah di-ignore Git):

```js
window.SUPABASE_URL = 'https://xxxx.supabase.co';
window.SUPABASE_ANON_KEY = 'xxxx';
window.SUPABASE_ENABLED = true;
```

## 2. Alur kerja Git

- Buat branch fitur dari `main`:
  - `feat/nama-fitur`
  - `fix/nama-bug`
  - `docs/nama-dokumen`
  - `chore/nama-tugas`
- Commit mengikuti [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: tambah filter level pada daftar dialog`
  - `fix: perbaiki pencarian kosakata saat modal terbuka`
  - `docs: perjelas langkah membuat admin Supabase`
- Satu pull request = satu tujuan yang jelas. Jelaskan _apa_ dan _mengapa_ pada deskripsi PR.

## 3. Standar kode

- Bahasa: JavaScript (ES2022), _classic script_ (bukan modul) agar kompatibel dengan `onclick="..."`.
- Selalu jalankan sebelum commit:

```bash
npm run check
```

- Penamaan mengikuti kode sekitar: `camelCase` untuk fungsi/variabel, `UPPER_SNAKE_CASE` untuk konstanta.
- Komentar ditulis singkat dan menjelaskan **mengapa**, bukan sekadar mengulang kode.

## 4. Aturan keamanan (WAJIB)

1. **Jangan pernah** menulis kredensial ke repo: password, `service_role key`, token API, atau private key.
2. Semua nilai yang berasal dari pengguna/Supabase **wajib** melewati helper escape dari `assets/js/security.js` (`esc`, `escAttr`, `escJs`) sebelum masuk ke `innerHTML`.
3. Hindari _inline event handler_ yang menyisipkan data (`onclick="fn('${data}')"`). Gunakan `data-*` + `addEventListener`.
4. Operasi tulis ke database harus lewat Supabase Auth + RLS. Jangan menambah backdoor atau bypass admin.
5. Jangan menurunkan kebijakan RLS menjadi `using (true)` untuk tabel yang punya kolom tulisan admin.

## 5. Checklist Pull Request

- [ ] `npm run check` lulus tanpa error.
- [ ] Tidak ada kredensial atau data pribadi di diff.
- [ ] Perubahan yang memengaruhi UI sudah diuji di mode terang & gelap, desktop & mobile.
- [ ] Perubahan skema database disertai pembaruan `supabase/schema.sql` dan catatan migrasi.
- [ ] README/CHANGELOG diperbarui bila ada perubahan perilaku.

## 6. Melaporkan masalah keamanan

Jangan membuka issue publik untuk kerentanan. Ikuti panduan pada [SECURITY.md](SECURITY.md).
