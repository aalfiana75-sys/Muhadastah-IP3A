import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'assets/js/config.local.js']
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        DIALOGS: 'readonly',
        VOCAB: 'readonly',
        I18N: 'readonly',
        SUPABASE_URL: 'readonly',
        SUPABASE_ANON_KEY: 'readonly',
        SUPABASE_ENABLED: 'readonly',
        supabase: 'readonly'
      }
    },
    rules: {
      // Kode ini memakai var + assignment ke window by design (classic script
      // agar bisa dipanggil dari onclick= dan page.evaluate()).
      'no-var': 'off',
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'off',
      // Komentar `/* global X */` di header file mendeklarasikan global yang
      // memang sudah ada di environment; itu bukan deklarasi ulang.
      'no-redeclare': 'off',
      'no-global-assign': 'off'
    }
  },
  {
    // data.js sengaja mendeklarasikan global (DIALOGS, VOCAB, I18N) yang
    // dikonsumsi script lain — bukan variabel yang dipakai secara lokal.
    files: ['assets/js/data.js'],
    rules: {
      'no-unused-vars': 'off'
    }
  },
  {
    // Helper yang dideklarasikan di admin-audio.js dan dipakai oleh
    // admin-audio-studio.js (keduanya skrip klasik pada halaman yang sama).
    files: ['assets/js/admin-audio-studio.js'],
    languageOptions: {
      globals: {
        AUDIO_BUCKET: 'readonly',
        AUDIO_FOLDER: 'readonly',
        AUDIO_EXTENSIONS: 'readonly',
        AUDIO_MAX_BYTES: 'readonly',
        AUDIO_MIME_BY_EXT: 'readonly',
        audioEsc: 'readonly',
        audioSlug: 'readonly',
        audioExtOf: 'readonly',
        audioGetClient: 'readonly',
        audioBuildPath: 'readonly',
        APP_STATE: 'readonly'
      }
    }
  }
];
