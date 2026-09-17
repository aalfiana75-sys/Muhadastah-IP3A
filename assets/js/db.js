// =============================================
// MUHADATSAH — DB layer (Supabase REST via fetch, tanpa SDK)
// =============================================
// - Jika SUPABASE_ENABLED=false / URL kosong -> pakai data lokal data.js
// - Otentikasi tulis memakai access token Supabase Auth (JWT user),
//   bukan token statis. RLS di database yang menentukan izin.
// - Semua fungsi memakai `var` + ditempel ke window agar bisa
//   dipanggil dari onclick="..." dan page.evaluate().
// =============================================

/* global window, fetch, DIALOGS, VOCAB */

// Access token aktif (diisi oleh admin.js setelah login Supabase).
window.SUPABASE_ACCESS_TOKEN = window.SUPABASE_ACCESS_TOKEN || null;

function setAccessToken(token) {
  window.SUPABASE_ACCESS_TOKEN = token || null;
}

// Ambil access token dari sesi Supabase yang sudah tersimpan di browser.
// Dipakai oleh halaman admin mana pun saat dimuat, sehingga admin yang
// sudah login di admin.html tidak diminta login ulang ketika berpindah
// ke admin-dialog.html / admin-lines.html / admin-vocab.html / admin-audio.html.
async function restoreAccessToken() {
  if (!window.supabase || window.SUPABASE_ENABLED !== true) return null;
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return null;
  if (!window.__muhadatsah_supabase) {
    window.__muhadatsah_supabase = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );
  }
  try {
    var result = await window.__muhadatsah_supabase.auth.getSession();
    var session = result && result.data ? result.data.session : null;
    setAccessToken(session ? session.access_token : null);
    return session;
  } catch (e) {
    console.warn('restoreAccessToken gagal', e);
    setAccessToken(null);
    return null;
  }
}
window.restoreAccessToken = restoreAccessToken;

function sbHeaders(extra) {
  // Selalu kirim anon key sebagai apikey. Authorization memakai access
  // token user bila tersedia (diperlukan RLS is_admin_user()).
  var bearer = window.SUPABASE_ACCESS_TOKEN || SUPABASE_ANON_KEY;
  var h = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + bearer,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
  if (extra) {
    for (var k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k];
    }
  }
  return h;
}

function sbOn() {
  return SUPABASE_ENABLED === true && Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}

// Wajib login (punya access token) untuk operasi tulis.
function sbCanWrite() {
  return sbOn() && Boolean(window.SUPABASE_ACCESS_TOKEN);
}

function sbUrl(path) {
  return SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path;
}

function assertWritable() {
  if (!sbCanWrite()) {
    throw new Error('Tidak berwenang: login admin diperlukan untuk operasi tulis.');
  }
}

async function sbGet(table, query) {
  var res = await fetch(sbUrl(table) + (query || ''), { headers: sbHeaders() });
  if (!res.ok) throw new Error('Supabase GET ' + table + ': ' + res.status);
  return res.json();
}

async function sbPost(table, body) {
  assertWritable();
  var res = await fetch(sbUrl(table), {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Supabase POST ' + table + ': ' + res.status);
  return res.json();
}

async function sbPatch(table, query, body) {
  assertWritable();
  var res = await fetch(sbUrl(table) + query, {
    method: 'PATCH',
    headers: sbHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Supabase PATCH ' + table + ': ' + res.status);
  return res.json();
}

async function sbDelete(table, query) {
  assertWritable();
  var res = await fetch(sbUrl(table) + query, {
    method: 'DELETE',
    headers: sbHeaders()
  });
  if (!res.ok) throw new Error('Supabase DELETE ' + table + ': ' + res.status);
  return true;
}

// ---- LOAD: dialogs + lines + vocab (dipakai index & admin) ----
async function dbLoadAll() {
  // fallback lokal
  if (!sbOn()) {
    return {
      source: 'local',
      dialogs: DIALOGS.map(function (d) {
        return {
          id: d.id,
          cat: d.cat,
          icon: d.icon,
          level: d.level,
          title: { id: d.title.id, en: d.title.en, ar: d.title.ar },
          lines: d.lines.map(function (l) {
            return {
              sp: l.sp,
              ar: l.ar,
              en: l.en,
              id: l.id,
              audio_ar_url: l.audio_ar_url || null,
              audio_en_url: l.audio_en_url || null
            };
          })
        };
      }),
      vocab: VOCAB.map(function (v, i) {
        return {
          id: i + 1,
          ar: v.ar,
          en: v.en,
          idn: v.id,
          cat: v.cat,
          audio_url: v.audio_url || null
        };
      })
    };
  }
  // dari Supabase
  var dialogs = await sbGet('dialogs', '?select=*&order=id.asc');
  var lines = await sbGet('dialog_lines', '?select=*&order=dialog_id.asc,position.asc');
  var vocab = await sbGet('vocab', '?select=*&order=id.asc');
  var byId = {};
  lines.forEach(function (l) {
    // CATATAN: sebelumnya baris ini punya dua key 'id' (id baris DAN id teks
    // Indonesia). Akibatnya terjemahan Indonesia tertimpa dan hilang.
    // Kini: `id` = id teks Indonesia (dipakai UI), `rowId` = primary key DB.
    (byId[l.dialog_id] = byId[l.dialog_id] || []).push({
      rowId: l.id,
      sp: l.speaker,
      ar: l.ar,
      en: l.en,
      id: l.idn,
      audio_ar_url: l.audio_ar_url,
      audio_en_url: l.audio_en_url,
      position: l.position
    });
  });
  return {
    source: 'supabase',
    dialogs: dialogs.map(function (d) {
      return {
        id: d.id,
        cat: d.cat,
        icon: d.icon,
        level: d.level,
        title: { id: d.title_id, en: d.title_en, ar: d.title_ar },
        lines: (byId[d.id] || []).sort(function (a, b) {
          return a.position - b.position;
        })
      };
    }),
    vocab: vocab.map(function (v) {
      return {
        id: v.id,
        ar: v.ar,
        en: v.en,
        idn: v.idn,
        cat: v.cat,
        audio_ar_url: v.audio_ar_url || null
      };
    })
  };
}

// ---- CRUD dialogs ----
async function dbCreateDialog(d) {
  var rows = await sbPost('dialogs', [
    {
      cat: d.cat,
      icon: d.icon,
      level: d.level,
      title_id: d.title_id,
      title_en: d.title_en,
      title_ar: d.title_ar
    }
  ]);
  return rows[0];
}
async function dbUpdateDialog(id, d) {
  await sbPatch('dialogs', '?id=eq.' + encodeURIComponent(id), d);
}
async function dbDeleteDialog(id) {
  await sbDelete('dialogs', '?id=eq.' + encodeURIComponent(id));
}

// ---- CRUD lines ----
async function dbCreateLine(l) {
  var rows = await sbPost('dialog_lines', [
    {
      dialog_id: l.dialog_id,
      position: l.position,
      speaker: l.speaker,
      ar: l.ar,
      en: l.en,
      idn: l.idn,
      audio_ar_url: l.audio_ar_url || null,
      audio_en_url: l.audio_en_url || null
    }
  ]);
  return rows[0];
}
async function dbUpdateLine(id, l) {
  await sbPatch('dialog_lines', '?id=eq.' + encodeURIComponent(id), l);
}
async function dbDeleteLine(id) {
  await sbDelete('dialog_lines', '?id=eq.' + encodeURIComponent(id));
}

// ---- CRUD vocab ----
async function dbCreateVocab(v) {
  var rows = await sbPost('vocab', [
    {
      ar: v.ar,
      en: v.en,
      idn: v.idn,
      cat: v.cat,
      audio_ar_url: v.audio_ar_url || null
    }
  ]);
  return rows[0];
}
async function dbUpdateVocab(id, v) {
  await sbPatch('vocab', '?id=eq.' + encodeURIComponent(id), v);
}
async function dbDeleteVocab(id) {
  await sbDelete('vocab', '?id=eq.' + encodeURIComponent(id));
}

// ---- quiz scores ----
async function dbSaveScore(player, score, total) {
  if (!sbOn()) return null;
  try {
    // Skor boleh dikirim tanpa login (policy insert publik), tetapi tetap
    // dibatasi & dibersihkan panjangnya oleh RLS + constraint di schema.
    var safeName = String(player || 'Tamu').slice(0, 40);
    var safeScore = Math.max(0, Math.min(100, Number(score) || 0));
    var safeTotal = Math.max(1, Math.min(100, Number(total) || 10));
    var res = await fetch(sbUrl('quiz_scores'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify([{ player_name: safeName, score: safeScore, total: safeTotal }])
    });
    if (!res.ok) throw new Error('Supabase POST quiz_scores: ' + res.status);
    var rows = await res.json();
    return rows[0];
  } catch (e) {
    console.warn('save score gagal:', e);
    return null;
  }
}
async function dbTopScores(limit) {
  if (!sbOn()) return [];
  try {
    return await sbGet(
      'quiz_scores',
      '?select=*&order=score.desc,created_at.desc&limit=' + (limit || 10)
    );
  } catch (e) {
    return [];
  }
}

// expose ke window (wajib utk onclick + page.evaluate)
window.sbOn = sbOn;
window.sbCanWrite = sbCanWrite;
window.setAccessToken = setAccessToken;
window.dbLoadAll = dbLoadAll;
window.dbCreateDialog = dbCreateDialog;
window.dbUpdateDialog = dbUpdateDialog;
window.dbDeleteDialog = dbDeleteDialog;
window.dbCreateLine = dbCreateLine;
window.dbUpdateLine = dbUpdateLine;
window.dbDeleteLine = dbDeleteLine;
window.dbCreateVocab = dbCreateVocab;
window.dbUpdateVocab = dbUpdateVocab;
window.dbDeleteVocab = dbDeleteVocab;
window.dbSaveScore = dbSaveScore;
window.dbTopScores = dbTopScores;
