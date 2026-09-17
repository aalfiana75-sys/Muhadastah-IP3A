/* global window, document, MediaRecorder, Blob, File */
// =============================================
// MUHADATSAH — Studio audio admin (unggah massal + rekam)
// =============================================
// Melengkapi admin-audio.js: halaman admin-audio.html memakai berkas ini
// untuk
//   1. mengimpor beberapa berkas audio sekaligus (drag & drop / pilih),
//   2. mengganti nama berkas sebelum diunggah,
//   3. merekam suara langsung dari mikrofon,
//   4. memasang audio yang sudah ada ke baris percakapan / kosakata.
//
// Semua unggahan tetap memakai bucket `dialog-audio` dan otorisasi RLS
// `is_admin_user()` — tidak ada kredensial tambahan di sisi klien.
// =============================================

var AUDIO_STUDIO_FILES = [];

function studioNotify(message, type) {
  if (typeof window.showToast === 'function') window.showToast(message, type);
  else console.info(message);
}

function studioFormatSize(bytes) {
  var mb = bytes / (1024 * 1024);
  return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

function studioRenameOf(file) {
  var renamed = (document.getElementById('audioRename') || {}).value || '';
  return renamed.trim();
}

function studioTargetName(file, index) {
  var renamed = studioRenameOf(file);
  if (!renamed) return file.name;
  var base = audioSlug(renamed);
  var ext = audioExtOf(file.name) || 'mp3';
  var suffix = AUDIO_STUDIO_FILES.length > 1 ? '-' + (index + 1) : '';
  return base + suffix + '.' + ext;
}

function renderStudioFileList() {
  var list = document.getElementById('audioFileList');
  if (!list) return;
  if (!AUDIO_STUDIO_FILES.length) {
    list.innerHTML = '<span class="admin-audio-hint">Belum ada berkas dipilih.</span>';
    return;
  }
  var ready = AUDIO_STUDIO_FILES.filter(function (item) {
    return item.status === 'ready' || !item.status;
  });
  list.innerHTML =
    AUDIO_STUDIO_FILES.map(function (item, index) {
      var state = item.status || 'ready';
      var label = !studioRenameOf(item.file) ? '' : studioTargetName(item.file, index);
      return (
        '<div class="admin-audio-file' +
        (state === 'done' ? ' is-done' : '') +
        (state === 'error' ? ' is-error' : '') +
        '">' +
        '<i class="fa-solid fa-file-audio"></i>' +
        '<span class="admin-audio-file-name">' +
        audioEsc(item.name || item.file.name) +
        '</span>' +
        (label ? '<span class="admin-audio-file-rename">→ ' + audioEsc(label) + '</span>' : '') +
        '<span class="admin-audio-file-size">' +
        audioEsc(studioFormatSize(item.file.size)) +
        '</span>' +
        '<span class="admin-audio-file-state">' +
        audioEsc(
          state === 'done'
            ? 'terunggah'
            : state === 'uploading'
              ? 'mengunggah…'
              : state === 'error'
                ? 'gagal'
                : 'siap'
        ) +
        '</span>' +
        '</div>'
      );
    }).join('') +
    (ready.length
      ? '<span class="admin-audio-hint">' + ready.length + ' berkas siap diunggah.</span>'
      : '');
}

function studioAddFiles(fileList) {
  var added = 0;
  Array.prototype.forEach.call(fileList || [], function (file) {
    var ext = audioExtOf(file.name);
    if (AUDIO_EXTENSIONS.indexOf(ext) === -1) {
      studioNotify('Berkas dilewati (format belum didukung): ' + file.name, 'error');
      return;
    }
    if (file.size > AUDIO_MAX_BYTES) {
      studioNotify(
        'Berkas dilewati (lebih dari ' +
          Math.round(AUDIO_MAX_BYTES / (1024 * 1024)) +
          ' MB): ' +
          file.name,
        'error'
      );
      return;
    }
    var duplicate = AUDIO_STUDIO_FILES.some(function (item) {
      return item.file.name === file.name && item.file.size === file.size;
    });
    if (duplicate) return;
    AUDIO_STUDIO_FILES.push({ file: file, name: file.name, status: 'ready' });
    added++;
  });
  if (added) studioNotify(added + ' berkas audio ditambahkan.', 'success');
  renderStudioFileList();
}

async function studioUploadOne(item, index) {
  var client = audioGetClient();
  if (!client) throw new Error('Supabase belum aktif');

  var ext = audioExtOf(item.file.name) || 'mp3';
  var prefix = (document.getElementById('audioPrefix') || {}).value || 'audio';
  var contentType = AUDIO_MIME_BY_EXT[ext] || item.file.type || 'audio/mpeg';
  var path = audioBuildPath(prefix.trim().slice(0, 30), studioTargetName(item.file, index));

  item.status = 'uploading';
  renderStudioFileList();

  var uploadOptions = { contentType: contentType, upsert: false };
  var res = await client.storage.from(AUDIO_BUCKET).upload(path, item.file, uploadOptions);
  if (res.error) throw new Error(res.error.message || 'unggah gagal');

  var pub = client.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(res.data && res.data.path ? res.data.path : path);
  item.url = pub && pub.data ? pub.data.publicUrl : '';
  item.path = path;
  item.status = 'done';
  renderStudioFileList();
  return item.url;
}

async function studioUploadAll(event) {
  if (event) event.preventDefault();
  if (!AUDIO_STUDIO_FILES.length) {
    studioNotify('Pilih berkas audio terlebih dahulu.', 'error');
    return;
  }
  if (typeof window.sbCanWrite === 'function' && !window.sbCanWrite()) {
    studioNotify('Login admin diperlukan untuk mengunggah audio.', 'error');
    return;
  }
  if (typeof window.setLoginBusy === 'function') window.setLoginBusy(true, 'Mengunggah audio...');

  var done = 0;
  var failed = 0;
  for (var i = 0; i < AUDIO_STUDIO_FILES.length; i++) {
    var item = AUDIO_STUDIO_FILES[i];
    if (item.status === 'done') {
      done++;
      continue;
    }
    try {
      await studioUploadOne(item, i);
      done++;
    } catch (e) {
      console.error(e);
      item.status = 'error';
      failed++;
      renderStudioFileList();
    }
  }

  if (typeof window.setLoginBusy === 'function') window.setLoginBusy(false);
  studioNotify(
    failed
      ? done + ' berkas terunggah, ' + failed + ' gagal.'
      : done + ' berkas audio berhasil diunggah.',
    failed ? 'error' : 'success'
  );
  studioRenderLibrary('');
}

// ---- Rekaman mikrofon ----
var STUDIO_RECORDER = null;
var STUDIO_RECORDER_CHUNKS = [];

function studioSetRecording(active) {
  var start = document.getElementById('audioRecordBtn');
  var stop = document.getElementById('audioRecordStop');
  if (start) start.classList.toggle('hidden', active);
  if (stop) stop.classList.toggle('hidden', !active);
  var status = document.getElementById('audioRecorderStatus');
  if (status) status.textContent = active ? 'Merekam… tekan Hentikan rekaman bila selesai.' : '';
}

async function studioStartRecording() {
  var status = document.getElementById('audioRecorderStatus');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    studioNotify('Browser ini tidak mendukung perekaman audio.', 'error');
    return;
  }
  try {
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    STUDIO_RECORDER_CHUNKS = [];
    STUDIO_RECORDER = new MediaRecorder(stream);
    STUDIO_RECORDER.addEventListener('dataavailable', function (e) {
      if (e.data && e.data.size) STUDIO_RECORDER_CHUNKS.push(e.data);
    });
    STUDIO_RECORDER.addEventListener('stop', function () {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      studioSetRecording(false);
      if (!STUDIO_RECORDER_CHUNKS.length) {
        studioNotify('Rekaman kosong, coba lagi.', 'error');
        return;
      }
      var blob = new Blob(STUDIO_RECORDER_CHUNKS, { type: 'audio/webm' });
      var file = new File([blob], 'rekaman-' + Date.now() + '.webm', { type: 'audio/webm' });
      studioAddFiles([file]);
      studioNotify('Rekaman siap. Klik "Unggah ke pustaka" untuk menyimpan.', 'success');
    });
    STUDIO_RECORDER.start();
    studioSetRecording(true);
    if (status) status.textContent = 'Merekam… tekan Hentikan rekaman bila selesai.';
  } catch (e) {
    console.error(e);
    studioNotify('Tidak bisa mengakses mikrofon: ' + (e.message || 'izin ditolak'), 'error');
  }
}

function studioStopRecording() {
  if (STUDIO_RECORDER && STUDIO_RECORDER.state === 'recording') STUDIO_RECORDER.stop();
  else studioSetRecording(false);
}

// ---- Pustaka: pasang audio ke materi ----
function studioRenderLibrary(query) {
  var grid = document.getElementById('libraryGrid');
  var status = document.getElementById('libraryStatus');
  if (!grid) return;

  var client = audioGetClient();
  if (!client) {
    grid.innerHTML =
      '<p class="audio-preview-empty">Pustaka audio butuh Supabase aktif. Isi konfigurasi Supabase di config.local.js.</p>';
    if (status) status.textContent = '';
    return;
  }

  if (status) status.textContent = 'Memuat daftar audio...';
  grid.innerHTML = '<p class="audio-preview-empty">Memuat...</p>';

  var folder = AUDIO_FOLDER;
  client.storage
    .from(AUDIO_BUCKET)
    .list(folder, { limit: 200, offset: 0, sortBy: { column: 'created_at', order: 'desc' } })
    .then(function (res) {
      if (res.error) throw new Error(res.error.message || 'gagal membaca pustaka');
      // Filter nama berkas di sisi klien (pencarian subfolder menghasilkan kosong).
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
      if (status) status.textContent = files.length + ' berkas';
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
            '<div class="admin-audio-actions">' +
            '<button type="button" class="audio-library-pick" data-studio-attach="' +
            audioEsc(url) +
            '"><i class="fa-solid fa-link"></i> Pasang ke materi</button>' +
            '<button type="button" class="admin-audio-btn" data-studio-copy="' +
            audioEsc(url) +
            '"><i class="fa-solid fa-copy"></i> Salin URL</button>' +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    })
    .catch(function (e) {
      console.error(e);
      if (status) status.textContent = '';
      grid.innerHTML =
        '<p class="audio-preview-empty">Gagal memuat pustaka audio (' +
        audioEsc(e.message || 'error') +
        ').</p>';
    });
}

function studioRenderAttachOptions() {
  var lines = document.getElementById('attachLine');
  var vocab = document.getElementById('attachVocab');
  var state = window.APP_STATE || {};

  if (lines) {
    var allLines = state.lines || [];
    lines.innerHTML =
      '<option value="">Pilih baris percakapan…</option>' +
      allLines
        .map(function (line) {
          var label =
            (line.__dialogTitle ? line.__dialogTitle + ' • ' : '') +
            (line.sp || 'A') +
            ': ' +
            String(line.ar || '').slice(0, 40);
          return (
            '<option value="' +
            audioEsc(line.rowId || line.id) +
            '" data-ar="' +
            audioEsc(line.audio_ar_url || '') +
            '" data-en="' +
            audioEsc(line.audio_en_url || '') +
            '">' +
            audioEsc(label) +
            '</option>'
          );
        })
        .join('');
  }

  if (vocab) {
    vocab.innerHTML =
      '<option value="">Pilih kosakata…</option>' +
      (state.vocab || [])
        .map(function (item) {
          return (
            '<option value="' +
            audioEsc(item.id) +
            '" data-ar="' +
            audioEsc(item.audio_ar_url || '') +
            '">' +
            audioEsc(item.ar + ' — ' + item.idn) +
            '</option>'
          );
        })
        .join('');
  }
}

async function studioAttachAudio(url) {
  if (!url) return;
  if (!window.dbUpdateLine || !window.dbUpdateVocab) {
    studioNotify('Lapisan data belum siap.', 'error');
    return;
  }
  var state = window.APP_STATE || { lines: [], vocab: [] };
  var lineId = (document.getElementById('attachLine') || {}).value || '';
  var vocabId = (document.getElementById('attachVocab') || {}).value || '';

  if (!lineId && !vocabId) {
    studioNotify('Pilih dulu baris percakapan atau kosakata tujuan.', 'error');
    return;
  }

  if (lineId) {
    var line = (state.lines || []).find(function (item) {
      return String(item.rowId || item.id) === String(lineId);
    });
    if (!line) {
      studioNotify('Baris percakapan tidak ditemukan.', 'error');
      return;
    }
    try {
      await window.dbUpdateLine(Number(lineId), {
        audio_ar_url: url,
        audio_en_url: line.audio_en_url || null
      });
      studioNotify('Audio dipasang ke baris Arab. Muat ulang halaman bila perlu.', 'success');
    } catch (e) {
      console.error(e);
      studioNotify('Gagal memasang audio ke baris.', 'error');
      return;
    }
  }

  if (vocabId) {
    try {
      await window.dbUpdateVocab(Number(vocabId), { audio_ar_url: url });
      studioNotify('Audio dipasang ke kosakata.', 'success');
    } catch (e) {
      console.error(e);
      studioNotify('Gagal memasang audio ke kosakata.', 'error');
      return;
    }
  }

  if (typeof window.hydrateFromSource === 'function') window.hydrateFromSource();
  studioRenderAttachOptions();
}

function studioCopyUrl(url) {
  if (!url) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(
      function () {
        studioNotify('URL audio disalin ke papan klip.', 'success');
      },
      function () {
        studioNotify(url, 'success');
      }
    );
    return;
  }
  studioNotify(url, 'success');
}

function setupAudioStudio() {
  if (!document.getElementById('audioUploadForm')) return;

  var fileInput = document.getElementById('audioFileInput');
  var dropLabel = document.querySelector('.admin-audio-drop');

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      studioAddFiles(fileInput.files);
      fileInput.value = '';
    });
  }

  if (dropLabel) {
    ['dragenter', 'dragover'].forEach(function (evt) {
      dropLabel.addEventListener(evt, function (e) {
        e.preventDefault();
        dropLabel.classList.add('is-drag');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropLabel.addEventListener(evt, function (e) {
        e.preventDefault();
        dropLabel.classList.remove('is-drag');
      });
    });
    dropLabel.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) studioAddFiles(e.dataTransfer.files);
    });
    dropLabel.addEventListener('click', function () {
      if (fileInput) fileInput.click();
    });
  }

  var form = document.getElementById('audioUploadForm');
  if (form) form.addEventListener('submit', studioUploadAll);

  var rename = document.getElementById('audioRename');
  if (rename) rename.addEventListener('input', renderStudioFileList);

  var clear = document.getElementById('audioClearFiles');
  if (clear) {
    clear.addEventListener('click', function () {
      AUDIO_STUDIO_FILES = [];
      renderStudioFileList();
    });
  }

  var record = document.getElementById('audioRecordBtn');
  if (record) record.addEventListener('click', studioStartRecording);
  var recordStop = document.getElementById('audioRecordStop');
  if (recordStop) recordStop.addEventListener('click', studioStopRecording);

  var search = document.getElementById('librarySearch');
  var searchBtn = document.getElementById('librarySearchBtn');
  if (searchBtn)
    searchBtn.addEventListener('click', function () {
      studioRenderLibrary((search && search.value.trim().slice(0, 40)) || '');
    });
  if (search) {
    search.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      studioRenderLibrary(search.value.trim().slice(0, 40));
    });
  }

  var refresh = document.getElementById('audioRefreshBtn');
  if (refresh)
    refresh.addEventListener('click', function () {
      studioRenderLibrary((search && search.value.trim().slice(0, 40)) || '');
    });

  var grid = document.getElementById('libraryGrid');
  if (grid) {
    grid.addEventListener('click', function (event) {
      var attach = event.target.closest ? event.target.closest('[data-studio-attach]') : null;
      if (attach) {
        studioAttachAudio(attach.dataset.studioAttach || '');
        return;
      }
      var copy = event.target.closest ? event.target.closest('[data-studio-copy]') : null;
      if (copy) studioCopyUrl(copy.dataset.studioCopy || '');
    });
  }

  renderStudioFileList();
  studioRenderAttachOptions();
  studioRenderLibrary('');
}

// Render ulang daftar tujuan setiap admin.js selesai memuat data.
window.setupAudioStudio = setupAudioStudio;
window.renderStudioAttachOptions = studioRenderAttachOptions;
window.studioAddFiles = studioAddFiles;
window.studioRenderLibrary = studioRenderLibrary;
window.studioUploadAll = studioUploadAll;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAudioStudio);
} else {
  setupAudioStudio();
}
