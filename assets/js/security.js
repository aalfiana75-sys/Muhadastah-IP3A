// =============================================
// MUHADATSAH — Security utilities
// =============================================
// Kumpulan helper untuk mencegah XSS ketika merender data yang
// berasal dari Supabase / input admin. Semua nilai non-tepercaya
// HARUS melewati esc() sebelum ditempel ke innerHTML.
//
// Dimuat sebelum app.js / admin.js.
// =============================================

/* global window */

(function () {
  'use strict';

  var ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /**
   * Escape karakter HTML berbahaya.
   * @param {*} value nilai apa pun
   * @returns {string} string aman untuk innerHTML
   */
  function esc(value) {
    if (value === null || typeof value === 'undefined') return '';
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ESCAPE_MAP[ch];
    });
  }

  /**
   * Escape nilai untuk dipakai di dalam atribut HTML.
   * Sama seperti esc(), disediakan agar niat kode jelas.
   */
  function escAttr(value) {
    return esc(value);
  }

  /**
   * Escape string agar aman dipakai di dalam literal JS inline
   * (mis. onclick="fn('...')"). Membungkus dengan JSON.stringify
   * lalu menetralkan karakter yang bisa memutus atribut.
   */
  function escJs(value) {
    return JSON.stringify(String(value === null || typeof value === 'undefined' ? '' : value))
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E')
      .replace(/\//g, '\\u002F');
  }

  /**
   * Buang tag & rapikan teks bebas (untuk nilai yang hanya boleh teks).
   */
  function cleanText(value, maxLength) {
    var text = String(value === null || typeof value === 'undefined' ? '' : value)
      .replace(/<[^>]*>/g, '')
      .trim();
    if (typeof maxLength === 'number' && text.length > maxLength) {
      text = text.slice(0, maxLength);
    }
    return text;
  }

  /**
   * Validasi nama kelas ikon Font Awesome agar tidak bisa menyuntik
   * markup lewat kolom "icon".
   */
  function safeIcon(value, fallback) {
    var icon = String(value || '').trim();
    if (/^fa-[a-z0-9-]{1,40}$/.test(icon)) return icon;
    return fallback || 'fa-comments';
  }

  window.MuhadatsahSecurity = {
    esc: esc,
    escAttr: escAttr,
    escJs: escJs,
    cleanText: cleanText,
    safeIcon: safeIcon
  };

  // Alias global agar pemanggilan singkat: esc(...)
  window.esc = esc;
  window.escAttr = escAttr;
  window.escJs = escJs;
  window.cleanText = cleanText;
  window.safeIcon = safeIcon;
})();
