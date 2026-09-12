// =============================================
// MUHADATSAH — Konfigurasi runtime (NON-RAHASIA)
// =============================================
// File ini hanya boleh memuat nilai publik:
//   - SUPABASE_URL       : URL project (publik)
//   - SUPABASE_ANON_KEY  : anon key (publik, dilindungi RLS)
//
// JANGAN pernah menulis di sini:
//   - service_role key, password admin, atau token rahasia apa pun.
//   - Semua operasi tulis (CRUD admin) divalidasi lewat Supabase Auth + RLS.
//
// Cara mengisi kredensial lokal tanpa masuk Git:
//   1. Buat file `assets/js/config.local.js` (sudah masuk .gitignore)
//   2. Isi: window.SUPABASE_ANON_KEY = "..."; window.SUPABASE_ENABLED = true;
//   3. Tambahkan satu baris di HTML SETELAH config.js:
//        <script src="assets/js/config.local.js"></script>
//      (sengaja tidak disertakan default agar tidak memicu 404.)
//
// Alternatif tanpa menyentuh HTML: gunakan <meta> tag (lihat bawah),
// atau set window.SUPABASE_* dari file yang Anda deploy terpisah.
// =============================================

/* global window, document */

(function () {
  'use strict';

  var DEFAULTS = {
    SUPABASE_URL: 'https://nvwgxdrlysrmvzdeyvev.supabase.co',
    SUPABASE_ANON_KEY: '',
    SUPABASE_ENABLED: false
  };

  if (typeof window.SUPABASE_URL !== 'string' || !window.SUPABASE_URL) {
    window.SUPABASE_URL = DEFAULTS.SUPABASE_URL;
  }
  if (typeof window.SUPABASE_ANON_KEY !== 'string') {
    window.SUPABASE_ANON_KEY = DEFAULTS.SUPABASE_ANON_KEY;
  }
  if (typeof window.SUPABASE_ENABLED !== 'boolean') {
    window.SUPABASE_ENABLED = DEFAULTS.SUPABASE_ENABLED;
  }

  // Override opsional dari <meta> tag untuk deploy tanpa build step.
  if (document && document.querySelector) {
    var metaUrl = document.querySelector('meta[name="supabase-url"]');
    var metaKey = document.querySelector('meta[name="supabase-anon-key"]');
    var metaEnabled = document.querySelector('meta[name="supabase-enabled"]');

    if (metaUrl && metaUrl.content) window.SUPABASE_URL = metaUrl.content.trim();
    if (metaKey && metaKey.content) window.SUPABASE_ANON_KEY = metaKey.content.trim();
    if (metaEnabled && metaEnabled.content) {
      window.SUPABASE_ENABLED = metaEnabled.content.trim().toLowerCase() === 'true';
    }
  }

  // Flag kenyamanan untuk badge status di UI.
  window.MUHADATSAH_READY = Boolean(
    window.SUPABASE_ENABLED && window.SUPABASE_URL && window.SUPABASE_ANON_KEY
  );
})();
