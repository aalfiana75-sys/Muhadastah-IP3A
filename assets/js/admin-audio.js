/* global window, document */
// =============================================
// MUHADATSAH — Pemilih & pengunggah audio admin
// =============================================
// Memberi admin dua cara mengisi kolom "URL Audio" pada form baris dialog
// dan form kosakata:
//   1. Impor berkas dari komputer  -> diunggah ke Supabase Storage.
//   2. Ambil dari pustaka audio    -> daftar berkas yang sudah ada di bucket.
//
// Bucket penyimpanan bersifat publik (agar audio bisa diputar di halaman
// belajar), tetapi hanya admin terautentikasi yang boleh menulis — lihat
// kebijakan RLS `storage.objects` pada supabase/schema.sql.
//
// File ini sengaja memakai `var` + menempelkan API ke window agar konsisten
// dengan skrip klasik lain (bisa dipanggil dari onclick= dan page.evaluate()).
// =============================================

var AUDIO_BUCKET = 'dialog-audio';
var AUDIO_FOLDER = 'lines';
var AUDIO_MAX_BYTES = 10 * 1024 * 1024; // batas global Storage free tier: 50 MB
var AUDIO_EXTENSIONS = ['mp3', 'ogg', 'wav', 'm4a', 'aac', 'opus', 'webm'];
var AUDIO_ACCEPT =
  AUDIO_EXTENSIONS.map(function (e) {
    return '.' + e;
  }).join(',') + ',audio/*';

// Helper lokal (fallback bila security.js belum dimuat).
var audioEsc =
  window.esc ||
  function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
var audioSafeUrl =
  window.safeAudioUrl ||
  function (v) {
    return /^https:\/\/[^\s"'<>]+$/i.test(String(v || '')) ? String(v) : '';
  };
var AUDIO_MIME_BY_EXT = {
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  opus: 'audio/opus',
  webm: 'audio/webm'
};

function audioGetClient() {
  if (typeof window.getSupabaseClient === 'function') return window.getSupabaseClient();
  if (window.__muhadatsah_supabase) return window.__muhadatsah_supabase;
  if (
    !window.supabase ||
    window.SUPABASE_ENABLED !== true ||
    !window.SUPABASE_URL ||
    !window.SUPABASE_ANON_KEY
  )
    return null;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
}

function audioNotify(message, type) {
  if (typeof window.showToast === 'function') window.showToast(message, type);
  else if (type === 'error') console.warn(message);
}

function audioExtOf(name) {
  var parts = String(name || '').split('.');
  var ext = parts.length > 1 ? parts[parts.length - 1] : '';
  return ext.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function audioSlug(text) {
  var slug = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, 40) || 'audio';
}

function audioRandomSuffix() {
  try {
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint8Array(4);
      window.crypto.getRandomValues(buf);
      return Array.prototype.map
        .call(buf, function (b) {
          return ('0' + b.toString(16)).slice(-2);
        })
        .join('');
    }
  } catch (e) {
    /* fallback di bawah */
  }
  return String(Date.now()).slice(-6);
}

function audioTimestamp() {
  return new Date().toISOString().slice(0, 10);
}

// `prefix` = nilai data-audio-prefix pada tombol (mis. "arab" / "english").
function audioBuildPath(prefix, fileName) {
  var ext = audioExtOf(fileName);
  if (AUDIO_EXTENSIONS.indexOf(ext) === -1) ext = 'mp3';
  return (
    AUDIO_FOLDER +
    '/' +
    audioSlug(prefix) +
    '-' +
    audioTimestamp() +
    '-' +
    audioRandomSuffix() +
    '.' +
    ext
  );
}
// Semua kontrol (termasuk yang punya data-audio-prefix) di-wire di sini.
// Tombol berdata-branch ditangani terpisah oleh setupAudioBranchPickers.
// CATATAN: sebelumnya selector mengecualikan elemen berdata-audio-prefix,
// padahal semua tombol "Impor" di HTML memakai atribut itu — akibatnya
// tombol impor MP3 tidak pernah berfungsi.
function audioControlSelector(control) {
  return '[data-audio-' + control + ']:not([data-branch])';
}

// Validasi diterapkan ke semua kontrol, baik gaya lama maupun gaya cabang.
function audioValidateOne(input) {
  if (!input) return true;
  var url = input.value.trim();
  if (!url) return true;
  if (!audioSafeUrl(url)) {
    audioNotify('URL audio harus berupa tautan https:// yang valid.', 'error');
    return false;
  }
  return true;
}

// Dipanggil admin.js sebelum menyimpan baris/kosakata.
function validateAudioPickers() {
  var ok = true;
  document.querySelectorAll('[data-audio-field]').forEach(function (wrap) {
    var input = wrap.querySelector('[data-audio-url]');
    if (!input) return;
    if (!audioValidateOne(input)) ok = false;
  });
  return ok;
}

function audioPreviewMarkup(url) {
  var safe = audioSafeUrl(url);
  if (!safe) {
    return (
      '<span class="audio-preview-empty">Belum ada audio untuk baris/kosakata ini.</span>' +
      '<span class="audio-preview-empty">Impor berkas dari komputer, tempel URL https://, ' +
      'atau pilih dari pustaka audio.</span>'
    );
  }
  return (
    '<audio controls preload="none" src="' +
    audioEsc(safe) +
    '"></audio>' +
    '<a class="audio-preview-link" href="' +
    audioEsc(safe) +
    '" target="_blank" rel="noopener noreferrer">Buka di tab baru</a>'
  );
}

function audioPreviewBox(input) {
  if (!input) return null;
  if (input.dataset && input.dataset.audioPreview)
    return document.getElementById(input.dataset.audioPreview);
  var wrap = input.closest ? input.closest('[data-audio-preview]') : null;
  if (!wrap) return null;
  return wrap.querySelector('[data-audio-preview-box]') || wrap;
}

// Panggil setiap kali nilai input URL audio berubah.
// Kotak pratinjau dicari lewat elemen terdekat (data-audio-preview) agar tetap
// bekerja walau beberapa kolom audio dibungkus satu pembungkus bersama.
function updateAudioPreview(input) {
  if (!input) return;
  var box = audioPreviewBox(input);
  if (!box) return;
  var url = input.value.trim();
  if (url && !audioSafeUrl(url)) {
    box.innerHTML =
      '<span class="audio-preview-empty">URL belum valid — gunakan https:// (Link ' +
      'Supabase Storage).</span>';
    return;
  }
  box.innerHTML = audioPreviewMarkup(url);
}

// Dipanggil dari onchange="handleAudioFileInput(this)" pada input file
// (input file dibuat saat setup, bukan dari inline handler).
async function handleAudioFileInput(input) {
  if (!input || !input.files || !input.files.length) return;

  var targetId = input.dataset.audioTarget;
  var prefix = input.dataset.audioPrefix || 'audio';
  var file = input.files[0];
  input.value = ''; // agar berkas yang sama bisa dipilih lagi.

  // Gaya cabang: `data-branch` + `data-audio-target` diisi sendiri oleh
  // setupAudioBranchPickers (bukan id elemen), jadi resolusi lewat cabang dulu.
  var target = input.dataset.branch
    ? document.querySelector('[data-audio-url][data-branch="' + input.dataset.branch + '"]')
    : null;
  if (!target && targetId) target = document.getElementById(targetId);
  if (!target) {
    audioNotify('Kolom audio tujuan tidak ditemukan.', 'error');
    return;
  }

  if (file.size > AUDIO_MAX_BYTES) {
    audioNotify(
      'Audio terlalu besar (maksimal ' + Math.round(AUDIO_MAX_BYTES / (1024 * 1024)) + ' MB).',
      'error'
    );
    return;
  }

  var ext = audioExtOf(file.name);
  if (AUDIO_EXTENSIONS.indexOf(ext) === -1) {
    audioNotify(
      'Format audio harus salah satu dari: ' + AUDIO_EXTENSIONS.join(', ') + '.',
      'error'
    );
    return;
  }

  var client = audioGetClient();
  if (!client) {
    audioNotify(
      'Supabase belum aktif. Impor audio butuh penyimpanan Supabase; tempel URL HTTPS manual dulu.',
      'error'
    );
    return;
  }
  // Unggah ke Storage memerlukan sesi admin (RLS: hanya is_admin_user()).
  if (typeof window.sbCanWrite === 'function' && !window.sbCanWrite()) {
    audioNotify('Login admin diperlukan untuk mengunggah audio.', 'error');
    return;
  }

  var path = audioBuildPath(prefix, file.name);
  var contentType = AUDIO_MIME_BY_EXT[ext] || file.type || 'audio/mpeg';
  if (typeof window.setLoginBusy === 'function') window.setLoginBusy(true, 'Mengunggah audio...');

  try {
    var up = await client.storage
      .from(AUDIO_BUCKET)
      .upload(path, file, { contentType: contentType, upsert: false });
    if (up.error) throw new Error(up.error.message || 'unggah gagal');

    var pub = client.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(up.data && up.data.path ? up.data.path : path);
    var url = pub && pub.data ? pub.data.publicUrl : '';
    if (!url) throw new Error('URL publik tidak tersedia');

    target.value = url;
    updateAudioPreview(target);
    audioNotify('Audio berhasil diunggah. Jangan lupa klik Simpan.', 'success');
  } catch (e) {
    console.error(e);
    audioNotify('Gagal mengunggah audio: ' + (e.message || 'tidak diketahui'), 'error');
  } finally {
    if (typeof window.setLoginBusy === 'function') window.setLoginBusy(false);
  }
}
// ---- Pustaka audio: berkas yang sudah ada di bucket ----
function openAudioLibrary(picker) {
  picker.classList.remove('hidden');
  picker.setAttribute('aria-hidden', 'false');
  loadAudioLibrary(picker, '');
}

function closeAudioModal(picker) {
  if (!picker) return;
  picker.__pendingAudioUrl = '';
  picker.classList.add('hidden');
  picker.setAttribute('aria-hidden', 'true');
}

function audioLibraryStatus(picker, text) {
  var status = picker.querySelector('[data-audio-library-status]');
  if (status) status.textContent = text;
}

async function loadAudioLibrary(picker, query) {
  if (!picker) return;
  var grid = picker.querySelector('[data-audio-library-grid]');
  if (!grid) return;

  var client = audioGetClient();
  if (!client) {
    grid.innerHTML =
      '<p class="audio-preview-empty">Pustaka audio belum tersedia karena Supabase tidak aktif. ' +
      'Tempel URL audio (https://) secara manual.</p>';
    audioLibraryStatus(picker, '');
    return;
  }

  audioLibraryStatus(picker, 'Memuat daftar audio...');
  grid.innerHTML = '<p class="audio-preview-empty">Memuat...</p>';

  try {
    var folder = AUDIO_FOLDER;
    var res = await client.storage.from(AUDIO_BUCKET).list(folder, {
      limit: 200,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    if (res.error) throw new Error(res.error.message || 'gagal membaca pustaka');

    // Filter nama berkas di sisi klien: daftar Storage tidak mendukung
    // pencarian nama, dan memakai subfolder menghasilkan daftar kosong.
    var q = String(query || '').toLowerCase();
    var files = (res.data || []).filter(function (f) {
      if (!f || !f.id) return false;
      return (
        !q ||
        String(f.name || '')
          .toLowerCase()
          .indexOf(q) !== -1
      );
    });
    audioLibraryStatus(picker, files.length + ' berkas');
    if (!files.length) {
      grid.innerHTML = '<p class="audio-preview-empty">Belum ada audio di pustaka.</p>';
      return;
    }

    grid.innerHTML = files
      .map(function (file) {
        var path = AUDIO_FOLDER + '/' + file.name;
        var pub = client.storage.from(AUDIO_BUCKET).getPublicUrl(path);
        var url = pub && pub.data ? pub.data.publicUrl : '';
        return (
          '<div class="audio-library-card">' +
          '<div class="audio-library-name">' +
          audioEsc(file.name) +
          '</div>' +
          (url ? '<audio controls preload="none" src="' + audioEsc(url) + '"></audio>' : '') +
          '<button type="button" class="btn-baru audio-library-pick" data-audio-url="' +
          audioEsc(url) +
          '">Pakai audio ini</button>' +
          '</div>'
        );
      })
      .join('');
  } catch (e) {
    console.error(e);
    audioLibraryStatus(picker, '');
    grid.innerHTML =
      '<p class="audio-preview-empty">Gagal memuat pustaka audio (' +
      audioEsc(e.message || 'error') +
      '). Pastikan bucket <code>' +
      audioEsc(AUDIO_BUCKET) +
      '</code> sudah ada dan policies Storage sudah dijalankan.</p>';
  }
}
// Mencari input yang harus diisi: id langsung (gaya lama) atau cabang
// pada [data-audio-field] terdekat (gaya cabang).
function resolveAudioPickedTarget(picker) {
  var byId = picker.dataset.audioTarget
    ? document.getElementById(picker.dataset.audioTarget)
    : null;
  if (byId) return byId;
  var branch = picker.dataset.audioBranch || '';
  if (!branch) return null;
  return document.querySelector('[data-audio-url][data-branch="' + branch + '"]');
}

function confirmAudioLibraryPick(picker) {
  if (!picker) return;
  var url = picker.__pendingAudioUrl || '';
  var target = url ? resolveAudioPickedTarget(picker) : null;
  if (!target) {
    audioNotify('Pilih salah satu audio dari daftar terlebih dahulu.', 'error');
    return;
  }
  target.value = url;
  updateAudioPreview(target);
  audioNotify('URL audio diisi dari pustaka. Klik Simpan untuk menyimpan baris.', 'success');
  closeAudioModal(picker);
}

// Tombol “dengar” cepat pada input URL audio.
function playAudioUrl(id) {
  var input = document.getElementById(id);
  if (!input) return;
  var url = audioSafeUrl(input.value.trim());
  if (!url) {
    audioNotify('Belum ada URL audio yang valid untuk diputar.', 'error');
    return;
  }
  var player = new Audio(url);
  player.play().catch(function () {
    audioNotify('Audio tidak bisa diputar (URL salah atau diblokir browser).', 'error');
  });
}

// ---- Setup: pasang tombol & input file untuk setiap `[data-audio-field]` ----
function setupAudioPickers() {
  var fields = document.querySelectorAll('[data-audio-field]');
  var overlay = document.getElementById('audioPicker');
  var grid = overlay ? overlay.querySelector('[data-audio-library-grid]') : null;

  fields.forEach(function (wrap) {
    var input = wrap.querySelector('[data-audio-url]');
    if (!input) return;

    // Tombol Import: buat <input type=file> tersembunyi di samping tombol.
    wrap.querySelectorAll(audioControlSelector('import')).forEach(function (btn) {
      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = AUDIO_ACCEPT;
      fileInput.className = 'hidden';
      fileInput.dataset.audioTarget = input.id;
      fileInput.dataset.audioPrefix = btn.dataset.audioPrefix || input.id;
      fileInput.addEventListener('change', function () {
        handleAudioFileInput(fileInput);
      });
      wrap.appendChild(fileInput);

      btn.addEventListener('click', function () {
        // Picker berkas hanya bisa dibuka langsung dari gesture pengguna,
        // karena itu bukan onclick= di HTML.
        if (typeof window.sbOn === 'function' && !window.sbOn()) {
          audioNotify(
            'Supabase belum aktif. Aktifkan konfigurasi Supabase agar audio bisa diunggah.',
            'error'
          );
          return;
        }
        if (typeof window.sbCanWrite === 'function' && !window.sbCanWrite()) {
          audioNotify('Login admin diperlukan untuk mengunggah audio.', 'error');
          return;
        }
        fileInput.click();
      });
    });

    // Tombol pilih dari pustaka audio di Supabase Storage.
    wrap.querySelectorAll(audioControlSelector('library')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!overlay) return;
        overlay.__pendingAudioUrl = '';
        overlay.dataset.audioTarget = input.id;
        if (grid) {
          grid.innerHTML = '';
        }
        openAudioLibrary(overlay);
      });
    });

    // Kosongkan URL (mis. membatalkan audio pada kosakata).
    wrap.querySelectorAll(audioControlSelector('clear')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = '';
        updateAudioPreview(input);
      });
    });

    // Tombol putar cepat (dipakai form baris versi ringkas).
    wrap.querySelectorAll(audioControlSelector('play')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        playAudioUrl(btn.dataset.audioPlay);
      });
    });

    // Pengguna juga boleh menempel URL https:// secara manual.
    input.addEventListener('input', function () {
      updateAudioPreview(input);
    });

    updateAudioPreview(input);
  });

  setupAudioBranchPickers();

  if (overlay) {
    overlay.__pendingAudioUrl = '';
    overlay.querySelectorAll('[data-audio-library-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeAudioModal(overlay);
      });
    });
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeAudioModal(overlay);
    });
    if (grid) {
      grid.addEventListener('click', function (event) {
        var btn = event.target.closest ? event.target.closest('[data-audio-url]') : null;
        if (!btn) return;
        overlay.__pendingAudioUrl = btn.dataset.audioUrl || '';
        grid.querySelectorAll('[data-audio-url]').forEach(function (b) {
          b.classList.toggle('is-selected', b === btn);
        });
      });
    }
    overlay.querySelectorAll('[data-audio-choose]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        confirmAudioLibraryPick(overlay);
      });
    });

    var search = overlay.querySelector('[data-audio-library-search]');
    var searchBtn = overlay.querySelector('[data-audio-library-searchbtn]');
    if (search && searchBtn) {
      searchBtn.addEventListener('click', function () {
        loadAudioLibrary(overlay, search.value.trim().slice(0, 40));
      });
      search.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        loadAudioLibrary(overlay, search.value.trim().slice(0, 40));
      });
    }
  }

  // Escape menutup modal pustaka audio.
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var open = document.querySelector('.audio-picker:not(.hidden)');
    if (open) closeAudioModal(open);
  });
}

// ---- Gaya cabang: satu grup audio dengan beberapa tombol berdata-branch -------
// Dipakai oleh form yang menaruh "Audio Arab" dan "Audio Inggris" dalam satu
// <fieldset data-audio-field>. Setiap tombol membawa dua informasi:
//   data-branch          -> nama cabang (mis. "arab", "english")
//   data-audio-url/import/library/clear -> aksi yang dijalankan
function audioBranchNames(wrap) {
  var names = [];
  wrap.querySelectorAll('[data-audio-url][data-branch]').forEach(function (el) {
    var name = el.dataset.branch;
    if (name && names.indexOf(name) === -1) names.push(name);
  });
  return names;
}

function audioBranchInput(wrap, name) {
  return wrap.querySelector('[data-audio-url][data-branch="' + name + '"]');
}

function audioBranchPrefix(wrap, name) {
  var input = audioBranchInput(wrap, name);
  return (input && input.dataset.audioPrefix) || name;
}

function setAudioBranchVisibility(wrap, name) {
  var names = audioBranchNames(wrap);
  var trigger = wrap.querySelector('[data-audio-url][data-branch="' + name + '"]');
  var isCard = !!wrap.querySelector('[data-branch-card]');
  names.forEach(function (name_) {
    var input = audioBranchInput(wrap, name_);
    if (input && isCard && name_ !== name) input.value = '';
    if (input) updateAudioPreview(input);
  });
  if (trigger && trigger.type !== 'radio') return;
  names.forEach(function (name_) {
    var card = wrap.querySelector('[data-branch-card="' + name_ + '"]');
    if (card) card.classList.toggle('is-active', name_ === name);
  });
  wrap.querySelectorAll('[data-branch-btn]').forEach(function (el) {
    if (el.dataset.branch === name) el.classList.add('is-on');
    else el.classList.remove('is-on');
  });
}

function setupAudioBranchPickers() {
  document.querySelectorAll('[data-audio-field]').forEach(function (wrap) {
    var names = audioBranchNames(wrap);
    if (!names.length) return;

    // Sinkronkan tombol radio/checkbox dengan cabang yang tampil.
    names.forEach(function (name) {
      var trigger = wrap.querySelector('[data-audio-url][data-branch="' + name + '"]');
      if (!trigger || (trigger.type !== 'radio' && trigger.type !== 'checkbox')) return;
      trigger.addEventListener('change', function () {
        if (trigger.type === 'checkbox' && !trigger.checked) {
          var input = audioBranchInput(wrap, name);
          if (input) input.value = '';
          updateAudioPreview(input);
          return;
        }
        setAudioBranchVisibility(wrap, name);
      });
    });

    // Tombol kecil "sunting"/"ganti" di dalam kartu cabang.
    wrap.querySelectorAll('[data-branch-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = audioBranchInput(wrap, btn.dataset.branchOpen || '');
        if (!input) return;
        var trigger = wrap.querySelector(
          '[data-audio-url][data-branch="' + input.dataset.branch + '"]'
        );
        if (trigger && trigger.type === 'radio') trigger.checked = true;
        setAudioBranchVisibility(wrap, input.dataset.branch);
        if (input) input.focus();
      });
    });

    // Impor berkas dari komputer.
    wrap.querySelectorAll('[data-audio-import][data-branch]').forEach(function (btn) {
      var name = btn.dataset.branch;
      var id = 'audioFile' + audioSlug(name) + String(Date.now()).slice(-4);
      btn.setAttribute('data-audio-open', id);

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = id;
      fileInput.accept = AUDIO_ACCEPT;
      fileInput.className = 'hidden';
      fileInput.setAttribute('aria-hidden', 'true');
      fileInput.dataset.audioPrefix = audioBranchPrefix(wrap, name);
      fileInput.dataset.branch = name;
      fileInput.addEventListener('change', function () {
        handleAudioFileInput(fileInput);
      });
      wrap.appendChild(fileInput);

      btn.addEventListener('click', function () {
        if (typeof window.sbOn === 'function' && !window.sbOn()) {
          audioNotify(
            'Supabase belum aktif. Aktifkan konfigurasi Supabase agar audio bisa diunggah.',
            'error'
          );
          return;
        }
        if (typeof window.sbCanWrite === 'function' && !window.sbCanWrite()) {
          audioNotify('Login admin diperlukan untuk mengunggah audio.', 'error');
          return;
        }
        fileInput.click();
      });
    });

    // Pilih dari pustaka audio.
    wrap.querySelectorAll('[data-audio-library][data-branch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var overlay = document.getElementById('audioPicker');
        if (!overlay) return;
        overlay.__pendingAudioUrl = '';
        overlay.dataset.audioTarget = '';
        overlay.dataset.audioBranch = btn.dataset.branch || '';
        var grid = overlay.querySelector('[data-audio-library-grid]');
        if (grid) grid.innerHTML = '';
        openAudioLibrary(overlay);
      });
    });

    // Kosongkan audio pada cabang tertentu.
    wrap.querySelectorAll('[data-audio-clear][data-branch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = audioBranchInput(wrap, btn.dataset.branch || '');
        if (!input) return;
        input.value = '';
        updateAudioPreview(input);
      });
    });

    wrap.querySelectorAll('[data-audio-url][data-branch]').forEach(function (input) {
      input.addEventListener('input', function () {
        updateAudioPreview(input);
      });
    });

    var active = wrap.querySelector('[data-audio-url][data-branch]:checked');
    setAudioBranchVisibility(wrap, active ? active.dataset.branch : names[0]);
  });
}

// Dipanggil admin.js setiap form baris/kosakata dikosongkan.
function resetAudioPickers() {
  document.querySelectorAll('[data-audio-field]').forEach(function (wrap) {
    var input = wrap.querySelector('[data-audio-url]');
    if (!input) return;
    input.value = '';
    updateAudioPreview(input);
  });
}

window.AUDIO_BUCKET = AUDIO_BUCKET;
window.AUDIO_MAX_BYTES = AUDIO_MAX_BYTES;
window.setupAudioPickers = setupAudioPickers;
window.resetAudioPickers = resetAudioPickers;
window.updateAudioPreview = updateAudioPreview;
window.validateAudioPickers = validateAudioPickers;
window.setAudioBranchVisibility = setAudioBranchVisibility;
window.handleAudioFileInput = handleAudioFileInput;
window.playAudioUrl = playAudioUrl;
