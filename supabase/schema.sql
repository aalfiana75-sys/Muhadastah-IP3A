-- =============================================
-- MUHADATSAH — Supabase schema
-- Cara pakai: buka Supabase Dashboard > SQL Editor
-- > New Query > paste seluruh file ini > Run
-- =============================================

-- 0. Profile admin untuk Supabase Auth
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

-- 1. Tabel dialogs (8 dialog awal = data lokal yg sudah ada)
create table if not exists dialogs (
  id bigint generated always as identity primary key,
  cat text not null default 'sapaan'
    check (cat in ('sapaan','sekolah','pasar','keluarga')),
  icon text not null default 'fa-comments',
  level text not null default 'Pemula',
  title_id text not null,
  title_en text not null,
  title_ar text not null,
  created_at timestamptz default now()
);

-- 2. Tabel dialog_lines (baris percakapan per dialog)
create table if not exists dialog_lines (
  id bigint generated always as identity primary key,
  dialog_id bigint not null references dialogs(id) on delete cascade,
  position int not null default 0,
  speaker text not null default 'A' check (speaker in ('A','B')),
  ar text not null,
  en text not null,
  idn text not null,
  created_at timestamptz default now()
);
create index if not exists idx_lines_dialog on dialog_lines(dialog_id, position);

-- 3. Tabel vocab (kosakata)
create table if not exists vocab (
  id bigint generated always as identity primary key,
  ar text not null,
  en text not null,
  idn text not null,
  cat text not null default 'sapaan'
    check (cat in ('sapaan','sekolah','pasar','keluarga')),
  created_at timestamptz default now()
);

-- 4. Tabel quiz_scores (riwayat nilai kuis + nama pemain)
create table if not exists quiz_scores (
  id bigint generated always as identity primary key,
  player_name text not null default 'Tamu',
  score int not null default 0,
  total int not null default 10,
  created_at timestamptz default now()
);

-- 6. Aktifkan Row Level Security dengan pendekatan serius.
-- Admin harus login via Supabase Auth, lalu role is_admin=true di tabel profiles.
alter table profiles enable row level security;
alter table dialogs enable row level security;
alter table dialog_lines enable row level security;
alter table vocab enable row level security;
alter table quiz_scores enable row level security;

create or replace function public.is_admin_user() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles as p
    where p.id = auth.uid() and p.is_admin = true
  );
$$;
revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "profiles select own" on profiles;
create policy "profiles select own" on profiles for select using (auth.uid() = id);

drop policy if exists "profiles admin manage" on profiles;
create policy "profiles admin manage" on profiles for all using (is_admin_user()) with check (is_admin_user());

drop policy if exists "public read dialogs" on dialogs;
create policy "public read dialogs" on dialogs for select using (true);
drop policy if exists "admin write dialogs" on dialogs;
create policy "admin write dialogs" on dialogs for insert with check (is_admin_user());
create policy "admin update dialogs" on dialogs for update using (is_admin_user()) with check (is_admin_user());
create policy "admin delete dialogs" on dialogs for delete using (is_admin_user());

drop policy if exists "public read lines" on dialog_lines;
create policy "public read lines" on dialog_lines for select using (true);
drop policy if exists "admin write lines" on dialog_lines;
create policy "admin write lines" on dialog_lines for insert with check (is_admin_user());
create policy "admin update lines" on dialog_lines for update using (is_admin_user()) with check (is_admin_user());
create policy "admin delete lines" on dialog_lines for delete using (is_admin_user());

drop policy if exists "public read vocab" on vocab;
create policy "public read vocab" on vocab for select using (true);
drop policy if exists "admin write vocab" on vocab;
create policy "admin write vocab" on vocab for insert with check (is_admin_user());
create policy "admin update vocab" on vocab for update using (is_admin_user()) with check (is_admin_user());
create policy "admin delete vocab" on vocab for delete using (is_admin_user());

drop policy if exists "public read scores" on quiz_scores;
create policy "public read scores" on quiz_scores for select using (true);
drop policy if exists "public insert scores" on quiz_scores;
-- Insert dibatasi: nama wajar (1-40 karakter), skor 0..100, total 1..100.
create policy "public insert scores" on quiz_scores for insert
  with check (
    char_length(player_name) between 1 and 40
    and score >= 0 and score <= 100
    and total between 1 and 100
  );
drop policy if exists "admin delete scores" on quiz_scores;
create policy "admin delete scores" on quiz_scores for delete using (is_admin_user());

-- 7. SEED: 8 dialog + 48 lines + 30 vocab (sama persis dgn data lokal)
-- Dialogs
insert into dialogs (cat, icon, level, title_id, title_en, title_ar)
values
('sapaan','fa-handshake','Pemula','Salam & Perkenalan','Greeting & Introduction','التَّحِيَّة وَالتَّعَارُف'),
('sekolah','fa-school','Pemula','Di Dalam Kelas','In the Classroom','فِي الْفَصْل'),
('pasar','fa-cart-shopping','Menengah','Berbelanja di Pasar','Shopping at the Market','التَّسَوُّق فِي السُّوق'),
('keluarga','fa-people-roof','Pemula','Bersama Keluarga','With Family','مَعَ الْأُسْرَة'),
('sapaan','fa-mug-saucer','Pemula','Bertamu & Minum Teh','Visiting & Drinking Tea','الزِّيَارَة وَالشَّاي'),
('sekolah','fa-book-open','Menengah','Di Perpustakaan','In the Library','فِي الْمَكْتَبَة'),
('pasar','fa-fish','Menengah','Membeli Ikan & Sayur','Buying Fish & Vegetables','شِرَاء السَّمَك وَالْخُضَار'),
('keluarga','fa-phone','Lanjutan','Menelepon Nenek','Calling Grandmother','الْاِتِّصَال بِالْجَدَّة')
on conflict do nothing;

-- Lines dialog 1
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(1,0,'A','اَلسَّلَامُ عَلَيْكُمْ، كَيْفَ حَالُكَ؟','Peace be upon you, how are you?','Assalamu''alaikum, apa kabarmu?'),
(1,1,'B','وَعَلَيْكُمُ السَّلَامُ، أَنَا بِخَيْرٍ، وَأَنْتَ؟','Peace be upon you too, I am fine, and you?','Wa''alaikumsalam, aku baik, dan kamu?'),
(1,2,'A','اَلْحَمْدُ لِلَّهِ، مَا اسْمُكَ؟','Praise be to God, what is your name?','Alhamdulillah, siapa namamu?'),
(1,3,'B','اِسْمِي أَحْمَدُ، وَمَا اسْمُكَ؟','My name is Ahmad, and what is yours?','Namaku Ahmad, dan siapa namamu?'),
(1,4,'A','اِسْمِي فَاطِمَةُ، تَشَرَّفْتُ بِلِقَائِكَ.','My name is Fatimah, nice to meet you.','Namaku Fatimah, senang bertemu denganmu.'),
(1,5,'B','وَأَنَا أَيْضًا، إِلَى اللِّقَاءِ!','Me too, see you!','Aku juga, sampai jumpa!');

-- Lines dialog 2
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(2,0,'A','صَبَاحُ الْخَيْرِ يَا أُسْتَاذُ!','Good morning, teacher!','Selamat pagi, Pak Guru!'),
(2,1,'B','صَبَاحُ النُّورِ، هَلْ أَحْضَرْتَ الْوَاجِبَ؟','Good morning too, did you bring the homework?','Selamat pagi juga, apakah kamu membawa PR?'),
(2,2,'A','نَعَمْ، هَذَا وَاجِبِي يَا أُسْتَاذُ.','Yes, this is my homework, teacher.','Ya, ini PR saya, Pak.'),
(2,3,'B','مُمْتَازٌ! اِجْلِسْ وَافْتَحِ الْكِتَابَ.','Excellent! Sit down and open the book.','Bagus sekali! Duduklah dan bukalah bukunya.'),
(2,4,'A','أَيَّ صَفْحَةٍ نَقْرَأُ الْيَوْمَ؟','Which page do we read today?','Halaman berapa yang kita baca hari ini?'),
(2,5,'B','نَقْرَأُ الصَّفْحَةَ الْعَاشِرَةَ عَنِ الْمُحَادَثَةِ.','We read page ten about conversation.','Kita membaca halaman sepuluh tentang percakapan.');

-- Lines dialog 3
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(3,0,'A','كَمْ سِعْرُ هَذَا التُّفَّاحِ؟','How much is this apple?','Berapa harga apel ini?'),
(3,1,'B','الْكِيلُو بِعَشَرَةِ آلَافِ رُوبِيَّةٍ.','One kilo is ten thousand rupiah.','Satu kilo sepuluh ribu rupiah.'),
(3,2,'A','هَلْ يُمْكِنُكَ تَخْفِيضُ السِّعْرِ قَلِيلًا؟','Can you lower the price a little?','Bisakah harganya diturunkan sedikit?'),
(3,3,'B','حَسَنًا، أُعْطِيكَ بِثَمَانِيَةِ آلَافٍ.','Okay, I give you eight thousand.','Baiklah, saya beri delapan ribu.'),
(3,4,'A','اِتَّفَقْنَا! أُرِيدُ كِيلُوَيْنِ مِنْ فَضْلِكَ.','Deal! I want two kilos, please.','Sepakat! Saya mau dua kilo, tolong.'),
(3,5,'B','تَفَضَّلْ، شُكْرًا لِزِيَارَتِكَ!','Here you are, thank you for visiting!','Silakan, terima kasih atas kunjunganmu!');

-- Lines dialog 4
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(4,0,'A','مَنْ هَذَا الرَّجُلُ يَا أُمِّي؟','Who is this man, Mom?','Siapa laki-laki ini, Bu?'),
(4,1,'B','هَذَا أَبُوكَ، عَادَ مِنَ الْعَمَلِ.','This is your father, he came back from work.','Ini ayahmu, beliau baru pulang kerja.'),
(4,2,'A','أَهْلًا بِأَبِي! كَيْفَ كَانَ يَوْمُكَ؟','Welcome Dad! How was your day?','Selamat datang Ayah! Bagaimana harimu?'),
(4,3,'B','كَانَ يَوْمًا جَمِيلًا، وَكَيْفَ مَدْرَسَتُكَ؟','It was a beautiful day, and how was your school?','Harinya menyenangkan, dan bagaimana sekolahmu?'),
(4,4,'A','كَانَتْ رَائِعَةً، حَصَلْتُ عَلَى دَرَجَةٍ مُمْتَازَةٍ!','It was great, I got an excellent grade!','Luar biasa, aku dapat nilai sempurna!'),
(4,5,'B','مَا شَاءَ اللَّهُ، أَنَا فَخُورٌ بِكَ!','What God wills, I am proud of you!','Masya Allah, Ayah bangga padamu!');

-- Lines dialog 5
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(5,0,'A','أَهْلًا وَسَهْلًا! تَفَضَّلْ بِالدُّخُولِ.','Welcome! Please come in.','Selamat datang! Silakan masuk.'),
(5,1,'B','شُكْرًا لَكَ، بَيْتُكَ جَمِيلٌ جِدًّا.','Thank you, your house is very beautiful.','Terima kasih, rumahmu indah sekali.'),
(5,2,'A','هَلْ تُرِيدُ شَايًا أَمْ قَهْوَةً؟','Do you want tea or coffee?','Kamu mau teh atau kopi?'),
(5,3,'B','أُرِيدُ شَايًا بِالنَّعْنَاعِ مِنْ فَضْلِكَ.','I want mint tea, please.','Aku mau teh mint, tolong.'),
(5,4,'A','تَفَضَّلِ الشَّايَ، بِالْعَافِيَةِ!','Here is the tea, enjoy it!','Ini tehnya, selamat menikmati!'),
(5,5,'B','جَزَاكَ اللَّهُ خَيْرًا، شَايٌ لَذِيذٌ!','May God reward you, delicious tea!','Jazakallah khairan, tehnya enak!');

-- Lines dialog 6
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(6,0,'A','عَفْوًا، أَيْنَ قِسْمُ الْكُتُبِ الْعَرَبِيَّةِ؟','Excuse me, where is the Arabic books section?','Permisi, di mana bagian buku-buku Arab?'),
(6,1,'B','فِي الطَّابَقِ الثَّانِي بِجَانِبِ النَّافِذَةِ.','On the second floor next to the window.','Di lantai dua di samping jendela.'),
(6,2,'A','هَلْ يُمْكِنُنِي اسْتِعَارَةُ هَذَا الْكِتَابِ؟','Can I borrow this book?','Bisakah saya meminjam buku ini?'),
(6,3,'B','بِالتَّأْكِيدِ، أَحْضِرْ بِطَاقَةَ الْعُضْوِيَّةِ.','Of course, bring your member card.','Tentu saja, bawalah kartu anggota.'),
(6,4,'A','كَمْ مُدَّةُ الْإِعَارَةِ؟','How long is the borrowing period?','Berapa lama masa peminjaman?'),
(6,5,'B','أُسْبُوعَانِ، وَيُمْكِنُكَ التَّمْدِيدُ مَرَّةً وَاحِدَةً.','Two weeks, and you can extend it once.','Dua minggu, dan kamu bisa perpanjang sekali.');

-- Lines dialog 7
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(7,0,'A','هَلِ السَّمَكُ طَازَجٌ الْيَوْمَ؟','Is the fish fresh today?','Apakah ikannya segar hari ini?'),
(7,1,'B','نَعَمْ، وَصَلَ هَذَا الصَّبَاحَ مِنَ الْبَحْرِ.','Yes, it arrived this morning from the sea.','Ya, baru datang pagi ini dari laut.'),
(7,2,'A','أَعْطِنِي سَمَكَتَيْنِ وَكِيلُو طَمَاطِمَ.','Give me two fish and a kilo of tomatoes.','Beri saya dua ikan dan satu kilo tomat.'),
(7,3,'B','حَاضِرٌ! هَلْ تُرِيدُ شَيْئًا آخَرَ؟','Right away! Do you want anything else?','Siap! Mau yang lainnya?'),
(7,4,'A','لَا شُكْرًا، كَمْ الْحِسَابُ كُلُّهُ؟','No thanks, how much is the total?','Tidak, terima kasih, berapa totalnya?'),
(7,5,'B','خَمْسَةٌ وَثَلَاثُونَ أَلْفًا فَقَطْ.','Only thirty-five thousand.','Hanya tiga puluh lima ribu.');

-- Lines dialog 8
insert into dialog_lines (dialog_id, position, speaker, ar, en, idn) values
(8,0,'A','مَسَاءُ الْخَيْرِ يَا جَدَّتِي الْحَبِيبَةُ!','Good evening my dear grandmother!','Selamat malam nenek tersayang!'),
(8,1,'B','مَسَاءُ النُّورِ يَا حَبِيبِي، كَيْفَ صِحَّتُكَ؟','Good evening darling, how is your health?','Selamat malam sayang, bagaimana kesehatanmu?'),
(8,2,'A','بِخَيْرٍ وَالْحَمْدُ لِلَّهِ، مَتَى تَزُورِينَنَا؟','Fine praise God, when will you visit us?','Baik alhamdulillah, kapan nenek berkunjung?'),
(8,3,'B','سَآتِي يَوْمَ الْجُمُعَةِ مَعَ خَالِكَ.','I will come on Friday with your uncle.','Nenek akan datang hari Jumat bersama pamanmu.'),
(8,4,'A','رَائِعٌ! سَنُحَضِّرُ لَكِ مُفَاجَأَةً.','Great! We will prepare a surprise for you.','Hebat! Kami akan siapkan kejutan untuk nenek.'),
(8,5,'B','حَفِظَكَ اللَّهُ يَا بُنَيَّ، أَرَاكَ قَرِيبًا.','God protect you my son, see you soon.','Semoga Allah menjagamu nak, sampai jumpa lagi.');

-- Vocab seed (30 kata, sama dgn data lokal)
insert into vocab (ar, en, idn, cat) values
('اَلسَّلَامُ عَلَيْكُمْ','Peace be upon you','Assalamu''alaikum','sapaan'),
('صَبَاحُ الْخَيْرِ','Good morning','Selamat pagi','sapaan'),
('مَسَاءُ الْخَيْرِ','Good evening','Selamat malam','sapaan'),
('كَيْفَ حَالُكَ؟','How are you?','Apa kabarmu?','sapaan'),
('شُكْرًا','Thank you','Terima kasih','sapaan'),
('عَفْوًا','Excuse me / You''re welcome','Permisi / Sama-sama','sapaan'),
('مَدْرَسَة','School','Sekolah','sekolah'),
('مُعَلِّم','Teacher (male)','Guru (lk)','sekolah'),
('كِتَاب','Book','Buku','sekolah'),
('قَلَم','Pen','Pulpen','sekolah'),
('دَفْتَر','Notebook','Buku tulis','sekolah'),
('مَكْتَبَة','Library','Perpustakaan','sekolah'),
('سُوق','Market','Pasar','pasar'),
('سِعْر','Price','Harga','pasar'),
('نُقُود','Money','Uang','pasar'),
('سَمَك','Fish','Ikan','pasar'),
('خُضَار','Vegetables','Sayuran','pasar'),
('فَاكِهَة','Fruit','Buah','pasar'),
('أَب','Father','Ayah','keluarga'),
('أُمّ','Mother','Ibu','keluarga'),
('أَخ','Brother','Saudara laki-laki','keluarga'),
('أُخْت','Sister','Saudara perempuan','keluarga'),
('جَدّ','Grandfather','Kakek','keluarga'),
('جَدَّة','Grandmother','Nenek','keluarga'),
('صَدِيق','Friend','Teman','sapaan'),
('بَيْت','House','Rumah','keluarga'),
('شَاي','Tea','Teh','pasar'),
('مَاء','Water','Air','pasar'),
('جَمِيل','Beautiful','Indah','sapaan'),
('كَبِير','Big','Besar','sekolah');

-- =============================================
-- 9. Cara membuat user admin pertama
-- =============================================
-- 1) Supabase Dashboard > Authentication > Users > Add user
--    (isi email + password, centang "Auto Confirm User")
-- 2) Jalankan SQL berikut dengan email tersebut:
--
--    insert into profiles (id, email, is_admin)
--    select id, email, true from auth.users where email = 'admin@example.com'
--    on conflict (id) do update set is_admin = true;
--
-- 3) Login di admin.html memakai email + password tersebut.
-- =============================================

-- Reset sequence agar id seed 1..8 tidak bentrok dengan insert berikutnya.
select setval(pg_get_serial_sequence('dialogs','id'), coalesce(max(id), 1)) from dialogs;
select setval(pg_get_serial_sequence('dialog_lines','id'), coalesce(max(id), 1)) from dialog_lines;
select setval(pg_get_serial_sequence('vocab','id'), coalesce(max(id), 1)) from vocab;

-- Index pencarian untuk katalog publik.
create index if not exists idx_dialogs_cat on dialogs(cat);
create index if not exists idx_vocab_cat on vocab(cat);
create index if not exists idx_scores_rank on quiz_scores(score desc, created_at desc);
