/* global window, document, localStorage, confirm */
// =============================================
// MUHADATSAH — Admin panel controller
// =============================================
// Otentikasi memakai Supabase Auth (email + password yang dibuat di
// Supabase Dashboard). Tidak ada kredensial yang disimpan di repo.
// Setelah login, access token diteruskan ke lapisan db.js agar RLS
// mengenali user sebagai admin (profiles.is_admin = true).
// =============================================
var ADMIN_SESSION_KEY = 'muhadatsah_admin_session';
var APP_STATE = {
  dialogs: [],
  vocab: [],
  lines: [],
  selectedDialogId: null,
  selectedLineId: null,
  selectedVocabId: null
};

// Helper keamanan (fallback bila security.js belum dimuat).
var esc =
  window.esc ||
  function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
var safeIcon =
  window.safeIcon ||
  function (v, f) {
    return /^fa-[a-z0-9-]{1,40}$/.test(String(v || '')) ? v : f || 'fa-comments';
  };

// Teruskan access token Supabase ke db.js setiap kali sesi berubah.
function syncAccessToken(session) {
  var token = session && session.access_token ? session.access_token : null;
  if (window.setAccessToken) window.setAccessToken(token);
}

function getSupabaseClient() {
  if (!window.supabase) return null;
  if (!window.__muhadatsah_supabase) {
    window.__muhadatsah_supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  return window.__muhadatsah_supabase;
}

function showToast(message, type) {
  var el = document.getElementById('loginMessage');
  if (!el) return;
  el.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-emerald-100', 'text-emerald-700');
  el.textContent = message;
  el.classList.add(type === 'error' ? 'bg-red-100' : 'bg-emerald-100');
  el.classList.add(type === 'error' ? 'text-red-700' : 'text-emerald-700');
}

async function isLoggedIn() {
  var client = getSupabaseClient();
  if (!client) return false;
  var session = await client.auth.getSession();
  var active = !!(session && session.data && session.data.session);
  syncAccessToken(active ? session.data.session : null);
  return active;
}

function setLoggedIn(flag) {
  // Penanda UI saja. Otorisasi sebenarnya tetap diverifikasi oleh
  // Supabase sesi + RLS di server, bukan oleh flag ini.
  if (flag) localStorage.setItem(ADMIN_SESSION_KEY, '1');
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

function getDialogById(id) {
  return (
    APP_STATE.dialogs.find(function (d) {
      return String(d.id) === String(id);
    }) || null
  );
}

// Terapkan hasil load ke APP_STATE + gambar ulang UI.
function applySource(result) {
  var fallback = { dialogs: window.DIALOGS || [], vocab: window.VOCAB || [] };
  APP_STATE.dialogs =
    (result && result.dialogs && result.dialogs.length ? result.dialogs : fallback.dialogs) || [];
  APP_STATE.vocab =
    (result && result.vocab && result.vocab.length ? result.vocab : fallback.vocab) || [];
  APP_STATE.lines = APP_STATE.dialogs.reduce(function (acc, dialog) {
    return acc.concat(
      (dialog.lines || []).map(function (line, index) {
        return Object.assign({}, line, {
          dialog_id: dialog.id,
          position: typeof line.position === 'number' ? line.position : index,
          __dialogTitle: dialog.title && dialog.title.id ? dialog.title.id : ''
        });
      })
    );
  }, []);
  var stillValid = APP_STATE.dialogs.some(function (d) {
    return String(d.id) === String(APP_STATE.selectedDialogId);
  });
  if (!stillValid)
    APP_STATE.selectedDialogId = APP_STATE.dialogs.length ? APP_STATE.dialogs[0].id : null;
  renderAll();
}

function hydrateFromSource() {
  if (!window.dbLoadAll) {
    applySource(null);
    return Promise.resolve();
  }
  return window
    .dbLoadAll()
    .then(function (result) {
      applySource(result);
    })
    .catch(function (e) {
      console.warn('loadAll gagal, gunakan fallback lokal', e);
      applySource(null);
    });
}

function renderAll() {
  renderDialogList();
  renderLineList();
  renderVocabList();
  renderDialogSelector();
  updateAdminStats();
  updateDbBadge();
}

function updateAdminStats() {
  var dialogs = document.getElementById('statDialogs');
  var lines = document.getElementById('statLines');
  var vocabs = document.getElementById('statVocabs');
  var active = document.getElementById('activeDialogName');
  var selectedDialog = getDialogById(APP_STATE.selectedDialogId);
  if (dialogs) dialogs.textContent = APP_STATE.dialogs.length;
  if (lines) lines.textContent = APP_STATE.lines.length;
  if (vocabs) vocabs.textContent = APP_STATE.vocab.length;
  if (active)
    active.textContent =
      selectedDialog && selectedDialog.title ? selectedDialog.title.id || '-' : '-';
}

function updateDbBadge() {
  var badge = document.getElementById('dbBadge');
  if (!badge) return;
  var live = typeof window.sbOn === 'function' && window.sbOn();
  badge.textContent = live ? 'Supabase live' : 'Data lokal';
  badge.className = live
    ? 'admin-status rounded-full bg-emerald-100 text-emerald-700 px-3 py-2 text-xs font-bold'
    : 'admin-status rounded-full bg-amber-100 text-amber-700 px-3 py-2 text-xs font-bold';
}

function renderDialogList() {
  var list = document.getElementById('dialogList');
  if (!list) return;
  if (!APP_STATE.dialogs.length) {
    list.innerHTML =
      '<div class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">Belum ada dialog.</div>';
    return;
  }

  list.innerHTML =
    '<div class="overflow-hidden rounded-[22px] border border-stone-200 bg-stone-50">' +
    '<div class="overflow-x-auto">' +
    '<table class="min-w-full text-left text-sm">' +
    '<thead class="bg-stone-100 text-stone-600">' +
    '<tr><th class="px-4 py-3 font-bold">Judul</th><th class="px-4 py-3 font-bold">Kategori</th><th class="px-4 py-3 font-bold">Level</th><th class="px-4 py-3 font-bold text-right">Aksi</th></tr>' +
    '</thead>' +
    '<tbody class="divide-y divide-stone-200 bg-white">' +
    APP_STATE.dialogs
      .map(function (dialog) {
        var selected = String(dialog.id) === String(APP_STATE.selectedDialogId);
        return (
          '<tr class="transition hover:bg-emerald-50/70 ' +
          (selected ? 'bg-emerald-50/80' : '') +
          '">' +
          '<td class="px-4 py-3 align-top"><div class="font-bold text-stone-900">' +
          esc(dialog.title && dialog.title.id ? dialog.title.id : '') +
          '</div><div class="mt-1 text-xs text-stone-500">' +
          esc(dialog.title && dialog.title.en ? dialog.title.en : '') +
          '</div></td>' +
          '<td class="px-4 py-3 align-top"><span class="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-stone-600">' +
          esc(dialog.cat || 'sapaan') +
          '</span></td>' +
          '<td class="px-4 py-3 align-top"><span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">' +
          esc(dialog.level || 'Pemula') +
          '</span></td>' +
          '<td class="px-4 py-3 align-top">' +
          '<div class="flex justify-end gap-2 whitespace-nowrap">' +
          '<button data-action="select-dialog" data-id="' +
          esc(dialog.id) +
          '" class="rounded-full bg-stone-900 px-2.5 py-2 text-[11px] font-bold text-white">Pilih</button>' +
          '<button data-action="edit-dialog" data-id="' +
          esc(dialog.id) +
          '" class="rounded-full bg-emerald-700 px-2.5 py-2 text-[11px] font-bold text-white">Edit</button>' +
          '<button data-action="delete-dialog" data-id="' +
          esc(dialog.id) +
          '" class="rounded-full bg-red-600 px-2.5 py-2 text-[11px] font-bold text-white">Hapus</button>' +
          '</div>' +
          '</td>' +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table></div></div>';

  list.querySelectorAll('button[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = Number(btn.dataset.id);
      var action = btn.dataset.action;
      if (action === 'select-dialog') {
        APP_STATE.selectedDialogId = id;
        APP_STATE.selectedLineId = null;
        renderAll();
      }
      if (action === 'edit-dialog') {
        fillDialogForm(id);
      }
      if (action === 'delete-dialog') {
        deleteDialogById(id);
      }
    });
  });
}

function renderDialogSelector() {
  var select = document.getElementById('lineDialogId');
  if (!select) return;
  select.innerHTML = APP_STATE.dialogs
    .map(function (dialog) {
      return (
        '<option value="' +
        esc(dialog.id) +
        '">' +
        esc(dialog.title && dialog.title.id ? dialog.title.id : dialog.id) +
        '</option>'
      );
    })
    .join('');
  if (APP_STATE.selectedDialogId) {
    select.value = String(APP_STATE.selectedDialogId);
  }
}

function fillDialogForm(id) {
  var dialog = getDialogById(id);
  if (!dialog) return;
  APP_STATE.selectedDialogId = id;
  document.getElementById('dialogId').value = dialog.id || '';
  document.getElementById('dialogCat').value = dialog.cat || 'sapaan';
  document.getElementById('dialogIcon').value = dialog.icon || 'fa-comments';
  document.getElementById('dialogLevel').value = dialog.level || 'Pemula';
  document.getElementById('dialogTitleId').value = (dialog.title && dialog.title.id) || '';
  document.getElementById('dialogTitleEn').value = (dialog.title && dialog.title.en) || '';
  document.getElementById('dialogTitleAr').value = (dialog.title && dialog.title.ar) || '';
  renderAll();
}

function clearDialogForm() {
  document.getElementById('dialogForm').reset();
  document.getElementById('dialogId').value = '';
  document.getElementById('dialogCat').value = 'sapaan';
  document.getElementById('dialogIcon').value = 'fa-comments';
  document.getElementById('dialogLevel').value = 'Pemula';
}

function renderLineList() {
  var list = document.getElementById('lineList');
  if (!list) return;
  var selectedDialog = APP_STATE.selectedDialogId
    ? getDialogById(APP_STATE.selectedDialogId)
    : null;
  var lines = selectedDialog ? selectedDialog.lines || [] : [];
  if (!lines.length) {
    list.innerHTML =
      '<div class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">Pilih dialog lalu tambahkan baris percakapan.</div>';
    return;
  }

  list.innerHTML =
    '<div class="overflow-hidden rounded-[22px] border border-stone-200 bg-stone-50">' +
    '<div class="overflow-x-auto">' +
    '<table class="min-w-full text-left text-sm">' +
    '<thead class="bg-stone-100 text-stone-600">' +
    '<tr><th class="px-4 py-3 font-bold">#</th><th class="px-4 py-3 font-bold">Speaker</th><th class="px-4 py-3 font-bold">Arab</th><th class="px-4 py-3 font-bold">English</th><th class="px-4 py-3 font-bold text-right">Aksi</th></tr>' +
    '</thead>' +
    '<tbody class="divide-y divide-stone-200 bg-white">' +
    lines
      .map(function (line, index) {
        return (
          '<tr class="align-top hover:bg-emerald-50/70">' +
          '<td class="px-4 py-3 font-bold text-stone-500">' +
          (index + 1) +
          '</td>' +
          '<td class="px-4 py-3"><span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">' +
          esc(line.sp || 'A') +
          '</span></td>' +
          '<td class="px-4 py-3"><p class="font-arab text-xl leading-relaxed text-stone-900">' +
          esc(line.ar || '') +
          '</p></td>' +
          '<td class="px-4 py-3"><p class="text-stone-700">' +
          esc(line.en || '') +
          '</p><p class="mt-1 text-xs text-stone-500">ID: ' +
          esc(line.id || '') +
          '</p></td>' +
          '<td class="px-4 py-3"><div class="flex justify-end gap-2 whitespace-nowrap">' +
          '<button data-action="edit-line" data-id="' +
          esc(line.id) +
          '" class="rounded-full bg-emerald-700 px-2.5 py-2 text-[11px] font-bold text-white">Edit</button>' +
          '<button data-action="delete-line" data-id="' +
          esc(line.id) +
          '" class="rounded-full bg-red-600 px-2.5 py-2 text-[11px] font-bold text-white">Hapus</button>' +
          '</div></td>' +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table></div></div>';

  list.querySelectorAll('button[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = Number(btn.dataset.id);
      var action = btn.dataset.action;
      if (action === 'edit-line') fillLineForm(id);
      if (action === 'delete-line') deleteLineById(id);
    });
  });
}

function fillLineForm(id) {
  var line = APP_STATE.lines.find(function (item) {
    return Number(item.id) === Number(id);
  });
  if (!line) return;
  APP_STATE.selectedLineId = id;
  document.getElementById('lineId').value = line.id || '';
  document.getElementById('lineDialogId').value = String(
    line.dialog_id || APP_STATE.selectedDialogId
  );
  document.getElementById('linePosition').value = line.position || 0;
  document.getElementById('lineSpeaker').value = line.sp || 'A';
  document.getElementById('lineAr').value = line.ar || '';
  document.getElementById('lineEn').value = line.en || '';
  document.getElementById('lineIdn').value = line.id || '';
}

function clearLineForm() {
  document.getElementById('lineForm').reset();
  document.getElementById('lineId').value = '';
  document.getElementById('lineSpeaker').value = 'A';
  document.getElementById('lineDialogId').value = String(APP_STATE.selectedDialogId || '');
}

function renderVocabList() {
  var list = document.getElementById('vocabList');
  if (!list) return;
  if (!APP_STATE.vocab.length) {
    list.innerHTML =
      '<div class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">Belum ada kosakata.</div>';
    return;
  }

  list.innerHTML =
    '<div class="overflow-hidden rounded-[22px] border border-stone-200 bg-stone-50">' +
    '<div class="overflow-x-auto">' +
    '<table class="min-w-full text-left text-sm">' +
    '<thead class="bg-stone-100 text-stone-600">' +
    '<tr><th class="px-4 py-3 font-bold">Arab</th><th class="px-4 py-3 font-bold">English</th><th class="px-4 py-3 font-bold">Kategori</th><th class="px-4 py-3 font-bold text-right">Aksi</th></tr>' +
    '</thead>' +
    '<tbody class="divide-y divide-stone-200 bg-white">' +
    APP_STATE.vocab
      .map(function (vocab) {
        return (
          '<tr class="align-top hover:bg-emerald-50/70">' +
          '<td class="px-4 py-3"><p class="font-arab text-2xl leading-relaxed text-stone-900">' +
          esc(vocab.ar || '') +
          '</p></td>' +
          '<td class="px-4 py-3"><p class="font-medium text-stone-700">' +
          esc(vocab.en || '') +
          '</p><p class="mt-1 text-xs text-stone-500">ID: ' +
          esc(vocab.idn || '') +
          '</p></td>' +
          '<td class="px-4 py-3"><span class="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700">' +
          esc(vocab.cat || 'sapaan') +
          '</span></td>' +
          '<td class="px-4 py-3"><div class="flex justify-end gap-2 whitespace-nowrap">' +
          '<button data-action="edit-vocab" data-id="' +
          esc(vocab.id) +
          '" class="rounded-full bg-emerald-700 px-2.5 py-2 text-[11px] font-bold text-white">Edit</button>' +
          '<button data-action="delete-vocab" data-id="' +
          esc(vocab.id) +
          '" class="rounded-full bg-red-600 px-2.5 py-2 text-[11px] font-bold text-white">Hapus</button>' +
          '</div></td>' +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table></div></div>';

  list.querySelectorAll('button[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = Number(btn.dataset.id);
      var action = btn.dataset.action;
      if (action === 'edit-vocab') fillVocabForm(id);
      if (action === 'delete-vocab') deleteVocabById(id);
    });
  });
}

function fillVocabForm(id) {
  var vocab = APP_STATE.vocab.find(function (item) {
    return Number(item.id) === Number(id);
  });
  if (!vocab) return;
  APP_STATE.selectedVocabId = id;
  document.getElementById('vocabId').value = vocab.id || '';
  document.getElementById('vocabAr').value = vocab.ar || '';
  document.getElementById('vocabEn').value = vocab.en || '';
  document.getElementById('vocabIdn').value = vocab.idn || '';
  document.getElementById('vocabCat').value = vocab.cat || 'sapaan';
}

function clearVocabForm() {
  document.getElementById('vocabForm').reset();
  document.getElementById('vocabId').value = '';
}

function setLoginScreen(showLogin) {
  document.getElementById('loginScreen').classList.toggle('hidden', !showLogin);
  document.getElementById('adminScreen').classList.toggle('hidden', showLogin);
}

async function handleLogin(event) {
  event.preventDefault();
  var client = getSupabaseClient();
  if (!client) {
    showToast('Supabase JS belum dimuat. Pastikan script @supabase/supabase-js aktif.', 'error');
    return;
  }

  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;

  if (!email || !password) {
    showToast('Email dan password harus diisi.', 'error');
    return;
  }

  try {
    var result = await client.auth.signInWithPassword({ email: email, password: password });
    if (result.error) {
      showToast(result.error.message || 'Login gagal.', 'error');
      return;
    }

    syncAccessToken(result.data ? result.data.session : null);
    setLoggedIn(true);
    setLoginScreen(false);
    document.getElementById('loginForm').reset();
    hydrateFromSource();
    showToast('Login berhasil via Supabase Auth.', 'success');
  } catch (e) {
    console.error(e);
    showToast('Login gagal. Cek email/password dan konfigurasi Supabase.', 'error');
  }
}

async function handleLogout() {
  var client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
  syncAccessToken(null);
  setLoggedIn(false);
  clearDialogForm();
  clearLineForm();
  clearVocabForm();
  setLoginScreen(true);
}

// Guard: hanya boleh menulis bila Supabase aktif DAN admin sudah login.
// Bila mode data lokal, perubahan tidak tersimpan ke server — beri tahu user.
function ensureWritable() {
  if (typeof window.sbCanWrite === 'function' && window.sbCanWrite()) return true;
  if (typeof window.sbOn === 'function' && !window.sbOn()) {
    showToast(
      'Mode data lokal: perubahan tidak disimpan ke server. Aktifkan Supabase di config.js.',
      'error'
    );
    return false;
  }
  showToast('Sesi admin tidak valid. Silakan login ulang.', 'error');
  return false;
}

async function saveDialog(event) {
  event.preventDefault();
  if (!ensureWritable()) return;
  var id = document.getElementById('dialogId').value;
  var payload = {
    cat: document.getElementById('dialogCat').value,
    // Icon dibatasi ke pola kelas Font Awesome agar tidak bisa menyuntik markup.
    icon: safeIcon(document.getElementById('dialogIcon').value),
    level: document.getElementById('dialogLevel').value.trim().slice(0, 40),
    title_id: document.getElementById('dialogTitleId').value.trim().slice(0, 160),
    title_en: document.getElementById('dialogTitleEn').value.trim().slice(0, 160),
    title_ar: document.getElementById('dialogTitleAr').value.trim().slice(0, 160)
  };

  if (!payload.title_id || !payload.title_en || !payload.title_ar) {
    showToast('Judul ID, EN, dan AR wajib diisi.', 'error');
    return;
  }

  try {
    if (id) {
      await window.dbUpdateDialog(Number(id), payload);
    } else {
      var created = await window.dbCreateDialog(payload);
      APP_STATE.selectedDialogId = created.id;
    }
    await hydrateFromSource();
    clearDialogForm();
    showToast('Dialog berhasil disimpan.', 'success');
  } catch (e) {
    console.error(e);
    showToast('Gagal menyimpan dialog.', 'error');
  }
}

async function deleteDialogById(id) {
  if (!ensureWritable()) return;
  if (!confirm('Hapus dialog ini? Tindakan ini tidak dapat dibatalkan.')) return;
  try {
    await window.dbDeleteDialog(id);
    await hydrateFromSource();
    clearDialogForm();
    showToast('Dialog berhasil dihapus.', 'success');
  } catch (e) {
    console.error(e);
    showToast('Gagal menghapus dialog.', 'error');
  }
}

async function saveLine(event) {
  event.preventDefault();
  if (!ensureWritable()) return;
  var id = document.getElementById('lineId').value;
  var selectedDialogId = document.getElementById('lineDialogId').value;
  var payload = {
    dialog_id: Number(selectedDialogId),
    position: Number(document.getElementById('linePosition').value || 0),
    speaker: document.getElementById('lineSpeaker').value === 'B' ? 'B' : 'A',
    ar: document.getElementById('lineAr').value.trim().slice(0, 500),
    en: document.getElementById('lineEn').value.trim().slice(0, 500),
    idn: document.getElementById('lineIdn').value.trim().slice(0, 500)
  };

  if (!payload.dialog_id || !payload.ar || !payload.en || !payload.idn) {
    showToast('Dialog, teks Arab, English, dan Indonesia wajib diisi.', 'error');
    return;
  }

  try {
    if (id) {
      await window.dbUpdateLine(Number(id), payload);
    } else {
      var created = await window.dbCreateLine(payload);
      APP_STATE.selectedDialogId = Number(selectedDialogId);
      APP_STATE.selectedLineId = created.id;
    }
    await hydrateFromSource();
    clearLineForm();
    showToast('Baris percakapan berhasil disimpan.', 'success');
  } catch (e) {
    console.error(e);
    showToast('Gagal menyimpan baris.', 'error');
  }
}

async function deleteLineById(id) {
  if (!ensureWritable()) return;
  if (!confirm('Hapus baris ini? Tindakan ini tidak dapat dibatalkan.')) return;
  try {
    await window.dbDeleteLine(id);
    await hydrateFromSource();
    clearLineForm();
    showToast('Baris berhasil dihapus.', 'success');
  } catch (e) {
    console.error(e);
    showToast('Gagal menghapus baris.', 'error');
  }
}

async function saveVocab(event) {
  event.preventDefault();
  if (!ensureWritable()) return;
  var id = document.getElementById('vocabId').value;
  var payload = {
    ar: document.getElementById('vocabAr').value.trim().slice(0, 200),
    en: document.getElementById('vocabEn').value.trim().slice(0, 200),
    idn: document.getElementById('vocabIdn').value.trim().slice(0, 200),
    cat: document.getElementById('vocabCat').value
  };

  if (!payload.ar || !payload.en || !payload.idn) {
    showToast('Kosakata Arab, English, dan Indonesia wajib diisi.', 'error');
    return;
  }

  try {
    if (id) {
      await window.dbUpdateVocab(Number(id), payload);
    } else {
      var created = await window.dbCreateVocab(payload);
      APP_STATE.selectedVocabId = created.id;
    }
    await hydrateFromSource();
    clearVocabForm();
    showToast('Kosakata berhasil disimpan.', 'success');
  } catch (e) {
    console.error(e);
    showToast('Gagal menyimpan kosakata.', 'error');
  }
}

async function deleteVocabById(id) {
  if (!ensureWritable()) return;
  if (!confirm('Hapus kosakata ini? Tindakan ini tidak dapat dibatalkan.')) return;
  try {
    await window.dbDeleteVocab(id);
    await hydrateFromSource();
    clearVocabForm();
    showToast('Kosakata berhasil dihapus.', 'success');
  } catch (e) {
    console.error(e);
    showToast('Gagal menghapus kosakata.', 'error');
  }
}

function setupEvents() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('newDialogBtn').addEventListener('click', function () {
    clearDialogForm();
    APP_STATE.selectedDialogId = null;
    renderAll();
  });
  document.getElementById('newLineBtn').addEventListener('click', function () {
    clearLineForm();
    if (APP_STATE.selectedDialogId)
      document.getElementById('lineDialogId').value = String(APP_STATE.selectedDialogId);
  });
  document.getElementById('newVocabBtn').addEventListener('click', clearVocabForm);
  document.getElementById('dialogForm').addEventListener('submit', saveDialog);
  document.getElementById('lineForm').addEventListener('submit', saveLine);
  document.getElementById('vocabForm').addEventListener('submit', saveVocab);
  document.getElementById('lineDialogId').addEventListener('change', function () {
    APP_STATE.selectedDialogId = Number(this.value);
    renderAll();
  });
}

async function bootAdmin() {
  var client = getSupabaseClient();
  if (client && client.auth && client.auth.onAuthStateChange) {
    client.auth.onAuthStateChange(function (event, session) {
      syncAccessToken(session);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setLoginScreen(false);
        setLoggedIn(true);
        hydrateFromSource();
      }
      if (event === 'SIGNED_OUT') {
        setLoggedIn(false);
        setLoginScreen(true);
      }
    });
  }

  var loggedIn = await isLoggedIn();
  if (loggedIn) {
    setLoginScreen(false);
    hydrateFromSource();
  } else {
    setLoginScreen(true);
  }
  setupEvents();
}

bootAdmin();
