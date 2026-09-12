/* global window, document, speechSynthesis, SpeechSynthesisUtterance, IntersectionObserver, DIALOGS, VOCAB, I18N */
var curCat = 'all',
  curDlg = null,
  scriptMode = 'all',
  quiz = { list: [], i: 0, score: 0, n: 10 };
var DB_SOURCE = 'local';
var $ = function (id) {
  return document.getElementById(id);
};
// Helper keamanan dari security.js (fallback aman bila belum dimuat).
var esc =
  window.esc ||
  function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
var escJs =
  window.escJs ||
  function (v) {
    return JSON.stringify(String(v == null ? '' : v));
  };
var safeIcon =
  window.safeIcon ||
  function (v, f) {
    return /^fa-[a-z0-9-]{1,40}$/.test(String(v || '')) ? v : f || 'fa-comments';
  };
function speak(t, lang) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang;
    u.rate = 0.85;
    if (lang.startsWith('ar')) {
      const v = speechSynthesis.getVoices().find((v) => v.lang.startsWith('ar'));
      if (v) u.voice = v;
    }
    speechSynthesis.speak(u);
  } catch (e) {}
}
function stopSpeak() {
  speechSynthesis.cancel();
  document.querySelectorAll('.dialog-line').forEach((x) => x.classList.remove('active'));
}
var CATS = [
  ['all', 'Semua', 'fa-layer-group'],
  ['sapaan', 'Sapaan', 'fa-handshake'],
  ['sekolah', 'Sekolah', 'fa-school'],
  ['pasar', 'Pasar', 'fa-cart-shopping'],
  ['keluarga', 'Keluarga', 'fa-people-roof']
];
function renderCats() {
  $('catTabs').innerHTML = CATS.map(
    (c) =>
      `<button onclick="setCat('${escJs(c[0]).slice(1, -1)}')" class="shrink-0 flex items-center gap-2 border px-5 py-2.5 text-sm font-bold rounded-full transition-all ${curCat === c[0] ? 'tab-active border-emerald-700 shadow-sm' : 'border-emerald-900/10 bg-white/80 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 dark:bg-stone-900/80 dark:text-stone-200'}"><i class="fa-solid ${safeIcon(c[2])}"></i>${esc(c[1])}</button>`
  ).join('');
}
function setCat(c) {
  curCat = c;
  renderCats();
  renderDialogs();
}
function renderDialogs(q = '') {
  const g = $('dialogGrid');
  const list = DIALOGS.filter(
    (d) =>
      (curCat === 'all' || d.cat === curCat) &&
      (!q ||
        (d.title.id + d.title.en + d.title.ar + d.lines.map((x) => x.ar + x.en + x.id).join(' '))
          .toLowerCase()
          .includes(q.toLowerCase()))
  );
  if (!list.length) {
    g.innerHTML = `<p class="col-span-full text-center text-stone-400 font-bold py-10">Tidak ditemukan. Coba kata kunci lain.</p>`;
    return;
  }
  g.innerHTML = list
    .map(
      (
        d
      ) => `<div onclick="openDlg(${escJs(d.id).slice(1, -1)})" class="group cursor-pointer rounded-[30px] border border-[#dfeae5] bg-[#f8f9f7] p-5 shadow-[0_20px_44px_-28px_rgba(8,52,39,0.42)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-[0_30px_70px_-28px_rgba(6,95,70,0.48)] dark:border-stone-700 dark:bg-stone-900/85">
<div class="flex items-center justify-between gap-3">
  <div class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-lg text-goldLight shadow-[0_12px_28px_-12px_rgba(6,95,70,0.85)] transition group-hover:scale-105"><i class="fa-solid ${safeIcon(d.icon)}"></i></div>
  <span class="rounded-full bg-[#f3d27a]/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8d6a1d] dark:text-goldLight">${esc(d.level)}</span>
</div>
<p class="mt-4 text-[1.05rem] font-extrabold leading-snug text-stone-900 dark:text-white">${esc(d.title.id)}</p>
<p class="mt-2 font-arab text-[1.9rem] leading-relaxed text-emerald-700 dark:text-goldLight">${esc(d.title.ar)}</p>
<p class="mt-2 text-sm font-medium text-stone-500 dark:text-stone-300">${esc(d.title.en)}</p>
<div class="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-4 text-xs font-bold text-stone-500 dark:border-stone-700 dark:text-stone-300">
  <span><i class="fa-solid fa-align-left mr-1"></i>${d.lines.length} baris • audio</span>
  <span class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700 dark:bg-emerald-900/35 dark:text-goldLight">Buka <i class="fa-solid fa-arrow-right ml-1"></i></span>
</div>
</div>`
    )
    .join('');
}
function openDlg(id) {
  curDlg = DIALOGS.find((d) => d.id === id);
  setScriptMode('all');
  $('dlgModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  stopSpeak();
  $('dlgModal').classList.add('hidden');
  document.body.style.overflow = '';
}
function setScriptMode(m) {
  scriptMode = m;
  ['mAll', 'mAr', 'mEn'].forEach(
    (x) => ($(x).className = 'px-4 py-2 rounded-full bg-stone-200 dark:bg-stone-800')
  );
  $({ all: 'mAll', ar: 'mAr', en: 'mEn' }[m]).className =
    'px-4 py-2 rounded-full bg-emerald-700 text-white';
  $('modalHead').innerHTML =
    `<p class="font-arab text-2xl">${esc(curDlg.title.ar)}</p><p class="font-extrabold text-xl">${esc(curDlg.title.id)}</p><p class="text-white/60 text-sm font-medium">${esc(curDlg.title.en)} • ${curDlg.lines.length} baris</p>`;
  $('modalBody').innerHTML = curDlg.lines
    .map((l, i) => {
      let body = '';
      if (scriptMode !== 'en')
        body += `<p class="font-arab text-2xl leading-relaxed chat-ar">${esc(l.ar)}</p>`;
      if (scriptMode !== 'ar')
        body += `<p class="font-semibold text-[15px]"><span class="text-emerald-700 dark:text-goldLight font-extrabold">EN:</span> ${esc(l.en)}</p>`;
      if (scriptMode === 'all')
        body += `<p class="text-sm text-stone-500"><span class="font-bold">ID:</span> ${esc(l.id)}</p>`;
      return `<div class="dialog-line flex gap-3 bg-stone-50 dark:bg-stone-800/60 border-2 border-transparent rounded-2xl p-4" id="line${i}"><div class="w-9 h-9 shrink-0 rounded-full ${l.sp === 'A' ? 'bg-emerald-700' : 'bg-gold text-stone-900'} text-white font-extrabold grid place-items-center text-sm">${esc(l.sp)}</div><div class="flex-1 space-y-1">${body}<div class="flex gap-2 pt-1"><button onclick="speakLine(${i},'ar')" class="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-goldLight px-3 py-1.5 rounded-full"><i class="fa-solid fa-volume-high mr-1"></i>AR</button><button onclick="speakLine(${i},'en')" class="text-[11px] font-bold bg-amber-100 dark:bg-stone-700 text-amber-800 dark:text-goldLight px-3 py-1.5 rounded-full"><i class="fa-solid fa-volume-high mr-1"></i>EN</button></div></div></div>`;
    })
    .join('');
}
function speakLine(i, which) {
  const l = curDlg.lines[i];
  document.querySelectorAll('.dialog-line').forEach((x) => x.classList.remove('active'));
  $('line' + i).classList.add('active');
  $('line' + i).scrollIntoView({ behavior: 'smooth', block: 'center' });
  speak(which === 'ar' ? l.ar : l.en, which === 'ar' ? 'ar-SA' : 'en-US');
}
function playDialog() {
  stopSpeak();
  let i = 0;
  const next = () => {
    if (!curDlg || $('dlgModal').classList.contains('hidden')) return;
    if (i >= curDlg.lines.length) {
      document.querySelectorAll('.dialog-line').forEach((x) => x.classList.remove('active'));
      return;
    }
    const l = curDlg.lines[i];
    document.querySelectorAll('.dialog-line').forEach((x) => x.classList.remove('active'));
    const el = $('line' + i);
    if (el) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const u = new SpeechSynthesisUtterance(l.ar);
    u.lang = 'ar-SA';
    u.rate = 0.85;
    u.onend = () => {
      const u2 = new SpeechSynthesisUtterance(l.en);
      u2.lang = 'en-US';
      u2.rate = 0.9;
      u2.onend = () => {
        i++;
        next();
      };
      speechSynthesis.speak(u2);
    };
    speechSynthesis.speak(u);
  };
  next();
}
function playAll() {
  const all = DIALOGS.flatMap((d) => d.lines.map((l) => l.ar));
  speak(all.slice(0, 6).join('. '), 'ar-SA');
  document.querySelector('#percakapan').scrollIntoView({ behavior: 'smooth' });
}
// VOCAB
function renderVocab(f = 'all', q = '') {
  const g = $('vocabGrid');
  const list = VOCAB.filter(
    (v) =>
      (f === 'all' || v.cat === f) &&
      (!q || (v.ar + v.en + v.id).toLowerCase().includes(q.toLowerCase()))
  );
  $('statVocab').textContent = VOCAB.length;
  $('statDialog').textContent = DIALOGS.length;
  if (!list.length) {
    g.innerHTML = `<div class="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-white/60 font-bold">Tidak ditemukan.</div>`;
    return;
  }
  g.innerHTML = `
<div class="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-soft">
  <div class="overflow-x-auto">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-white/5 text-white/70">
        <tr>
          <th class="px-4 py-3 font-bold">No</th>
          <th class="px-4 py-3 font-bold">Kategori</th>
          <th class="px-4 py-3 font-bold">Arab</th>
          <th class="px-4 py-3 font-bold">English</th>
          <th class="px-4 py-3 font-bold">Indonesia</th>
          <th class="px-4 py-3 font-bold text-right">Audio</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-white/10 bg-white/5">
        ${list
          .map(
            (v, i) => `
          <tr class="align-top transition hover:bg-white/5">
            <td class="px-4 py-3 text-xs font-bold text-goldLight">${i + 1}</td>
            <td class="px-4 py-3"><span class="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">${esc(v.cat)}</span></td>
            <td class="px-4 py-3"><p class="font-arab text-2xl leading-relaxed text-white">${esc(v.ar)}</p></td>
            <td class="px-4 py-3 font-medium text-white/90">${esc(v.en)}</td>
            <td class="px-4 py-3 text-white/75">${esc(v.id)}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button data-speak-index="${i}" data-speak-lang="ar-SA" class="speak-btn rounded-full bg-emerald-700 px-2.5 py-2 text-[10px] font-bold text-white"><i class="fa-solid fa-volume-high mr-1"></i>AR</button>
                <button data-speak-index="${i}" data-speak-lang="en-US" class="speak-btn rounded-full bg-gold px-2.5 py-2 text-[10px] font-bold text-stone-900"><i class="fa-solid fa-volume-high mr-1"></i>EN</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
        </table>
     </div>
    </div>`;
  // Pasang event listener (bukan string inline) agar data tidak pernah
  // dieksekusi sebagai kode -> aman dari XSS/HTML injection.
  g.querySelectorAll('.speak-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = list[Number(btn.dataset.speakIndex)];
      if (!item) return;
      var lang = btn.dataset.speakLang;
      speak(lang === 'ar-SA' ? item.ar : item.en, lang);
    });
  });
}
function filterVocab(c) {
  document.querySelectorAll('.vtab').forEach((b) => b.classList.remove('tab-active'));
  document.querySelector(`.vtab[data-cat="${c}"]`).classList.add('tab-active');
  renderVocab(c, $('globalSearch').value);
}
// QUIZ
function startQuiz(n) {
  quiz.n = n;
  quiz.list = [...VOCAB].sort(() => Math.random() - 0.5).slice(0, n);
  quiz.i = 0;
  quiz.score = 0;
  $('quizStart').classList.add('hidden');
  $('quizEnd').classList.add('hidden');
  $('quizPlay').classList.remove('hidden');
  showQ();
}
function speakQuiz() {
  speak(quiz.list[quiz.i].ar, 'ar-SA');
}
function showQ() {
  const q = quiz.list[quiz.i];
  $('qCount').textContent = `Soal ${quiz.i + 1}/${quiz.n}`;
  $('qScore').textContent = `Skor: ${quiz.score}`;
  $('qBar').style.width = (quiz.i / quiz.n) * 100 + '%';
  $('qArab').textContent = q.ar;
  const correct = `${q.en} • ${q.id}`;
  const opts = new Set([correct]);
  while (opts.size < 4) {
    const r = VOCAB[Math.floor(Math.random() * VOCAB.length)];
    opts.add(`${r.en} • ${r.id}`);
  }
  // Acak sekali saja, lalu pasang listener per tombol. Nilai opsi disimpan
  // sebagai data-attribute (bukan inline onclick) -> aman dari injeksi HTML.
  const shuffled = [...opts].sort(() => Math.random() - 0.5);
  $('qOpts').innerHTML = shuffled
    .map(
      (o) =>
        `<button class="q-option text-left bg-stone-100 dark:bg-stone-800 hover:border-emerald-500 border-2 border-transparent font-semibold text-sm rounded-2xl px-5 py-4 transition">${esc(o)}</button>`
    )
    .join('');
  [...$('qOpts').children].forEach(function (btn, idx) {
    var optionValue = shuffled[idx];
    btn.dataset.value = optionValue;
    btn.addEventListener('click', function () {
      answer(optionValue, btn);
    });
  });
}
function answer(o, btn) {
  const q = quiz.list[quiz.i];
  const correct = `${q.en} • ${q.id}`;
  var correctNode = [...$('qOpts').children].find(function (b) {
    return b.dataset.value === correct;
  });
  [...$('qOpts').children].forEach((b) => {
    b.disabled = true;
    if (b === correctNode) b.classList.add('!bg-emerald-600', '!text-white', '!border-emerald-600');
  });
  if (o === correct) {
    quiz.score += Math.round(100 / quiz.n);
    btn.classList.add('!bg-emerald-600', '!text-white');
    speak('Correct! Excellent!', 'en-US');
  } else {
    btn.classList.add('!bg-red-500', '!text-white');
    speak('Wrong. Keep learning!', 'en-US');
  }
  setTimeout(() => {
    quiz.i++;
    if (quiz.i < quiz.n) showQ();
    else endQuiz();
  }, 1100);
}
function endQuiz() {
  $('quizPlay').classList.add('hidden');
  $('quizEnd').classList.remove('hidden');
  $('qBar').style.width = '100%';
  $('qFinal').textContent = 'Skor: ' + quiz.score;
  const [e, m] =
    quiz.score >= 90
      ? ['🏆', 'Luar biasa! Kamu master muhadatsah!']
      : quiz.score >= 70
        ? ['🌟', 'Hebat! Sedikit lagi sempurna!']
        : quiz.score >= 50
          ? ['💪', 'Bagus! Terus berlatih ya!']
          : ['📚', 'Jangan menyerah, ayo belajar lagi!'];
  $('qEmoji').textContent = e;
  $('qMsg').textContent = m;
  var nameRow = $('quizNameRow');
  if (nameRow) nameRow.classList.remove('hidden');
  renderTop();
}
// Simpan skor lewat tombol form (menggantikan window.prompt yang blocking).
function saveQuizScore(event) {
  if (event) event.preventDefault();
  var input = $('quizName');
  var pid = (input && input.value ? input.value : 'Tamu').trim().slice(0, 40) || 'Tamu';
  var row = $('quizNameRow');
  if (row) row.classList.add('hidden');
  if (window.dbSaveScore) {
    window.dbSaveScore(pid, quiz.score, quiz.n).then(function () {
      renderTop();
    });
  } else {
    renderTop();
  }
  var btn = $('quizSaveBtn');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('opacity-60');
  }
}
function resetQuiz() {
  $('quizEnd').classList.add('hidden');
  $('quizStart').classList.remove('hidden');
}
async function renderTop() {
  var box = $('topScores');
  if (!box) return;
  if (!window.dbTopScores) {
    return;
  }
  var rows = await window.dbTopScores(5);
  if (!rows || !rows.length) {
    box.innerHTML =
      "<p class='text-xs text-stone-400 font-bold'>Belum ada skor tersimpan. Jadilah yang pertama!</p>";
    return;
  }
  box.innerHTML = rows
    .map(function (r, i) {
      return (
        "<div class='flex items-center justify-between bg-stone-100 dark:bg-stone-800 rounded-xl px-4 py-2.5 text-sm font-bold'><span>" +
        esc('🥇🥈🥉🎖️🏅'[i] || '•') +
        ' ' +
        esc(String(r.player_name).slice(0, 20)) +
        "</span><span class='text-emerald-700 dark:text-goldLight'>" +
        esc(r.score) +
        '</span></div>'
      );
    })
    .join('');
}
// UI LANG + SEARCH + DARK
$('uiLang').addEventListener('change', (e) => {
  const l = e.target.value;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const k = el.dataset.i18n;
    if (I18N[l][k]) el.textContent = I18N[l][k];
  });
  $('htmlRoot').lang = l;
  document.querySelectorAll('.font-arab').forEach(() => {});
  renderDialogs($('globalSearch').value);
});
$('globalSearch').addEventListener('input', (e) => {
  renderDialogs(e.target.value);
  var activeTab = document.querySelector('.vtab.tab-active');
  renderVocab(activeTab ? activeTab.dataset.cat : 'all', e.target.value);
});
var THEME_KEY = 'muhadatsah_theme';
function applyTheme(mode) {
  var dark = mode === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  var icon = $('darkBtn') && $('darkBtn').querySelector('i');
  if (icon) {
    icon.classList.toggle('fa-moon', !dark);
    icon.classList.toggle('fa-sun', dark);
  }
}
try {
  var savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    applyTheme('dark');
} catch (e) {}
$('darkBtn').addEventListener('click', () => {
  var next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (e) {}
});
$('dlgModal').addEventListener('click', (e) => {
  if (e.target.id === 'dlgModal') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = mobileMenuBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-xmark');
    }
  });
}
// reveal on scroll
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (es) => es.forEach((x) => x.isIntersecting && x.target.classList.add('visible')),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}
async function boot() {
  renderCats();
  renderDialogs();
  renderVocab();
  try {
    if (window.dbLoadAll) {
      var r = await window.dbLoadAll();
      DB_SOURCE = r.source;
      if (r.dialogs && r.dialogs.length) DIALOGS = r.dialogs;
      if (r.vocab && r.vocab.length) VOCAB = r.vocab;
      renderDialogs($('globalSearch') ? $('globalSearch').value : '');
      var f = document.querySelector('.vtab.tab-active');
      renderVocab(f ? f.dataset.cat : 'all', $('globalSearch') ? $('globalSearch').value : '');
      renderTop();
      var badge = $('dbBadge');
      if (badge)
        badge.textContent =
          DB_SOURCE === 'supabase'
            ? '🟢 Supabase live'
            : '🟡 Data lokal (isi config.js untuk live)';
    }
  } catch (e) {
    console.warn('DB load gagal, pakai lokal:', e);
  }
}
boot();
window.DIALOGS = DIALOGS;
window.VOCAB = VOCAB;
window.I18N = I18N;
window.openDlg = openDlg;
window.closeModal = closeModal;
window.setScriptMode = setScriptMode;
window.speakLine = speakLine;
window.playDialog = playDialog;
window.playAll = playAll;
window.stopSpeak = stopSpeak;
window.speak = speak;
window.startQuiz = startQuiz;
window.speakQuiz = speakQuiz;
window.answer = answer;
window.resetQuiz = resetQuiz;
window.setCat = setCat;
window.filterVocab = filterVocab;
window.renderDialogs = renderDialogs;
window.renderVocab = renderVocab;
window.renderTop = renderTop;
window.saveQuizScore = saveQuizScore;
window.applyTheme = applyTheme;
