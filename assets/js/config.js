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
// Konfigurasi database aktif ada di DEFAULTS di bawah. Untuk deployment,
// gunakan <meta> tag atau atur window.SUPABASE_* melalui konfigurasi hosting.
// =============================================

/* global window, document */

(function () {
  'use strict';

  var DEFAULTS = {
    // Nilai URL/key di sini bersifat publik; jangan pernah memakai service_role key.
    SUPABASE_URL: 'https://blvqzmqorzhfsazrdbex.supabase.co',
    SUPABASE_ANON_KEY:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdnF6bXFvcnpoZnNhenJkYmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMDQ2MzUsImV4cCI6MjEwODY4MDYzNX0.QV89S5Ch_UI0eN6IVicBZhjK71a-nxFldKf4jXgCUto',
    SUPABASE_ENABLED: true,
    MUHADATSAH_RECAPTCHA_SITE_KEY: '',
    MUHADATSAH_RECAPTCHA_ENABLED: false
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
