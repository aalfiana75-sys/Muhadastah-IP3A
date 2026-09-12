var DIALOGS = [
  {
    id: 1,
    cat: 'sapaan',
    icon: 'fa-handshake',
    level: 'Pemula',
    title: {
      id: 'Salam & Perkenalan',
      en: 'Greeting & Introduction',
      ar: 'التَّحِيَّة وَالتَّعَارُف'
    },
    lines: [
      {
        sp: 'A',
        ar: 'اَلسَّلَامُ عَلَيْكُمْ، كَيْفَ حَالُكَ؟',
        en: 'Peace be upon you, how are you?',
        id: "Assalamu'alaikum, apa kabarmu?"
      },
      {
        sp: 'B',
        ar: 'وَعَلَيْكُمُ السَّلَامُ، أَنَا بِخَيْرٍ، وَأَنْتَ؟',
        en: 'Peace be upon you too, I am fine, and you?',
        id: "Wa'alaikumsalam, aku baik, dan kamu?"
      },
      {
        sp: 'A',
        ar: 'اَلْحَمْدُ لِلَّهِ، مَا اسْمُكَ؟',
        en: 'Praise be to God, what is your name?',
        id: 'Alhamdulillah, siapa namamu?'
      },
      {
        sp: 'B',
        ar: 'اِسْمِي أَحْمَدُ، وَمَا اسْمُكَ؟',
        en: 'My name is Ahmad, and what is yours?',
        id: 'Namaku Ahmad, dan siapa namamu?'
      },
      {
        sp: 'A',
        ar: 'اِسْمِي فَاطِمَةُ، تَشَرَّفْتُ بِلِقَائِكَ.',
        en: 'My name is Fatimah, nice to meet you.',
        id: 'Namaku Fatimah, senang bertemu denganmu.'
      },
      {
        sp: 'B',
        ar: 'وَأَنَا أَيْضًا، إِلَى اللِّقَاءِ!',
        en: 'Me too, see you!',
        id: 'Aku juga, sampai jumpa!'
      }
    ]
  },
  {
    id: 2,
    cat: 'sekolah',
    icon: 'fa-school',
    level: 'Pemula',
    title: { id: 'Di Dalam Kelas', en: 'In the Classroom', ar: 'فِي الْفَصْل' },
    lines: [
      {
        sp: 'A',
        ar: 'صَبَاحُ الْخَيْرِ يَا أُسْتَاذُ!',
        en: 'Good morning, teacher!',
        id: 'Selamat pagi, Pak Guru!'
      },
      {
        sp: 'B',
        ar: 'صَبَاحُ النُّورِ، هَلْ أَحْضَرْتَ الْوَاجِبَ؟',
        en: 'Good morning too, did you bring the homework?',
        id: 'Selamat pagi juga, apakah kamu membawa PR?'
      },
      {
        sp: 'A',
        ar: 'نَعَمْ، هَذَا وَاجِبِي يَا أُسْتَاذُ.',
        en: 'Yes, this is my homework, teacher.',
        id: 'Ya, ini PR saya, Pak.'
      },
      {
        sp: 'B',
        ar: 'مُمْتَازٌ! اِجْلِسْ وَافْتَحِ الْكِتَابَ.',
        en: 'Excellent! Sit down and open the book.',
        id: 'Bagus sekali! Duduklah dan bukalah bukunya.'
      },
      {
        sp: 'A',
        ar: 'أَيَّ صَفْحَةٍ نَقْرَأُ الْيَوْمَ؟',
        en: 'Which page do we read today?',
        id: 'Halaman berapa yang kita baca hari ini?'
      },
      {
        sp: 'B',
        ar: 'نَقْرَأُ الصَّفْحَةَ الْعَاشِرَةَ عَنِ الْمُحَادَثَةِ.',
        en: 'We read page ten about conversation.',
        id: 'Kita membaca halaman sepuluh tentang percakapan.'
      }
    ]
  },
  {
    id: 3,
    cat: 'pasar',
    icon: 'fa-cart-shopping',
    level: 'Menengah',
    title: {
      id: 'Berbelanja di Pasar',
      en: 'Shopping at the Market',
      ar: 'التَّسَوُّق فِي السُّوق'
    },
    lines: [
      {
        sp: 'A',
        ar: 'كَمْ سِعْرُ هَذَا التُّفَّاحِ؟',
        en: 'How much is this apple?',
        id: 'Berapa harga apel ini?'
      },
      {
        sp: 'B',
        ar: 'الْكِيلُو بِعَشَرَةِ آلَافِ رُوبِيَّةٍ.',
        en: 'One kilo is ten thousand rupiah.',
        id: 'Satu kilo sepuluh ribu rupiah.'
      },
      {
        sp: 'A',
        ar: 'هَلْ يُمْكِنُكَ تَخْفِيضُ السِّعْرِ قَلِيلًا؟',
        en: 'Can you lower the price a little?',
        id: 'Bisakah harganya diturunkan sedikit?'
      },
      {
        sp: 'B',
        ar: 'حَسَنًا، أُعْطِيكَ بِثَمَانِيَةِ آلَافٍ.',
        en: 'Okay, I give you eight thousand.',
        id: 'Baiklah, saya beri delapan ribu.'
      },
      {
        sp: 'A',
        ar: 'اِتَّفَقْنَا! أُرِيدُ كِيلُوَيْنِ مِنْ فَضْلِكَ.',
        en: 'Deal! I want two kilos, please.',
        id: 'Sepakat! Saya mau dua kilo, tolong.'
      },
      {
        sp: 'B',
        ar: 'تَفَضَّلْ، شُكْرًا لِزِيَارَتِكَ!',
        en: 'Here you are, thank you for visiting!',
        id: 'Silakan, terima kasih atas kunjunganmu!'
      }
    ]
  },
  {
    id: 4,
    cat: 'keluarga',
    icon: 'fa-people-roof',
    level: 'Pemula',
    title: { id: 'Bersama Keluarga', en: 'With Family', ar: 'مَعَ الْأُسْرَة' },
    lines: [
      {
        sp: 'A',
        ar: 'مَنْ هَذَا الرَّجُلُ يَا أُمِّي؟',
        en: 'Who is this man, Mom?',
        id: 'Siapa laki-laki ini, Bu?'
      },
      {
        sp: 'B',
        ar: 'هَذَا أَبُوكَ، عَادَ مِنَ الْعَمَلِ.',
        en: 'This is your father, he came back from work.',
        id: 'Ini ayahmu, beliau baru pulang kerja.'
      },
      {
        sp: 'A',
        ar: 'أَهْلًا بِأَبِي! كَيْفَ كَانَ يَوْمُكَ؟',
        en: 'Welcome Dad! How was your day?',
        id: 'Selamat datang Ayah! Bagaimana harimu?'
      },
      {
        sp: 'B',
        ar: 'كَانَ يَوْمًا جَمِيلًا، وَكَيْفَ مَدْرَسَتُكَ؟',
        en: 'It was a beautiful day, and how was your school?',
        id: 'Harinya menyenangkan, dan bagaimana sekolahmu?'
      },
      {
        sp: 'A',
        ar: 'كَانَتْ رَائِعَةً، حَصَلْتُ عَلَى دَرَجَةٍ مُمْتَازَةٍ!',
        en: 'It was great, I got an excellent grade!',
        id: 'Luar biasa, aku dapat nilai sempurna!'
      },
      {
        sp: 'B',
        ar: 'مَا شَاءَ اللَّهُ، أَنَا فَخُورٌ بِكَ!',
        en: 'What God wills, I am proud of you!',
        id: 'Masya Allah, Ayah bangga padamu!'
      }
    ]
  },
  {
    id: 5,
    cat: 'sapaan',
    icon: 'fa-mug-saucer',
    level: 'Pemula',
    title: {
      id: 'Bertamu & Minum Teh',
      en: 'Visiting & Drinking Tea',
      ar: 'الزِّيَارَة وَالشَّاي'
    },
    lines: [
      {
        sp: 'A',
        ar: 'أَهْلًا وَسَهْلًا! تَفَضَّلْ بِالدُّخُولِ.',
        en: 'Welcome! Please come in.',
        id: 'Selamat datang! Silakan masuk.'
      },
      {
        sp: 'B',
        ar: 'شُكْرًا لَكَ، بَيْتُكَ جَمِيلٌ جِدًّا.',
        en: 'Thank you, your house is very beautiful.',
        id: 'Terima kasih, rumahmu indah sekali.'
      },
      {
        sp: 'A',
        ar: 'هَلْ تُرِيدُ شَايًا أَمْ قَهْوَةً؟',
        en: 'Do you want tea or coffee?',
        id: 'Kamu mau teh atau kopi?'
      },
      {
        sp: 'B',
        ar: 'أُرِيدُ شَايًا بِالنَّعْنَاعِ مِنْ فَضْلِكَ.',
        en: 'I want mint tea, please.',
        id: 'Aku mau teh mint, tolong.'
      },
      {
        sp: 'A',
        ar: 'تَفَضَّلِ الشَّايَ، بِالْعَافِيَةِ!',
        en: 'Here is the tea, enjoy it!',
        id: 'Ini tehnya, selamat menikmati!'
      },
      {
        sp: 'B',
        ar: 'جَزَاكَ اللَّهُ خَيْرًا، شَايٌ لَذِيذٌ!',
        en: 'May God reward you, delicious tea!',
        id: 'Jazakallah khairan, tehnya enak!'
      }
    ]
  },
  {
    id: 6,
    cat: 'sekolah',
    icon: 'fa-book-open',
    level: 'Menengah',
    title: { id: 'Di Perpustakaan', en: 'In the Library', ar: 'فِي الْمَكْتَبَة' },
    lines: [
      {
        sp: 'A',
        ar: 'عَفْوًا، أَيْنَ قِسْمُ الْكُتُبِ الْعَرَبِيَّةِ؟',
        en: 'Excuse me, where is the Arabic books section?',
        id: 'Permisi, di mana bagian buku-buku Arab?'
      },
      {
        sp: 'B',
        ar: 'فِي الطَّابَقِ الثَّانِي بِجَانِبِ النَّافِذَةِ.',
        en: 'On the second floor next to the window.',
        id: 'Di lantai dua di samping jendela.'
      },
      {
        sp: 'A',
        ar: 'هَلْ يُمْكِنُنِي اسْتِعَارَةُ هَذَا الْكِتَابِ؟',
        en: 'Can I borrow this book?',
        id: 'Bisakah saya meminjam buku ini?'
      },
      {
        sp: 'B',
        ar: 'بِالتَّأْكِيدِ، أَحْضِرْ بِطَاقَةَ الْعُضْوِيَّةِ.',
        en: 'Of course, bring your member card.',
        id: 'Tentu saja, bawalah kartu anggota.'
      },
      {
        sp: 'A',
        ar: 'كَمْ مُدَّةُ الْإِعَارَةِ؟',
        en: 'How long is the borrowing period?',
        id: 'Berapa lama masa peminjaman?'
      },
      {
        sp: 'B',
        ar: 'أُسْبُوعَانِ، وَيُمْكِنُكَ التَّمْدِيدُ مَرَّةً وَاحِدَةً.',
        en: 'Two weeks, and you can extend it once.',
        id: 'Dua minggu, dan kamu bisa perpanjang sekali.'
      }
    ]
  },
  {
    id: 7,
    cat: 'pasar',
    icon: 'fa-fish',
    level: 'Menengah',
    title: {
      id: 'Membeli Ikan & Sayur',
      en: 'Buying Fish & Vegetables',
      ar: 'شِرَاء السَّمَك وَالْخُضَار'
    },
    lines: [
      {
        sp: 'A',
        ar: 'هَلِ السَّمَكُ طَازَجٌ الْيَوْمَ؟',
        en: 'Is the fish fresh today?',
        id: 'Apakah ikannya segar hari ini?'
      },
      {
        sp: 'B',
        ar: 'نَعَمْ، وَصَلَ هَذَا الصَّبَاحَ مِنَ الْبَحْرِ.',
        en: 'Yes, it arrived this morning from the sea.',
        id: 'Ya, baru datang pagi ini dari laut.'
      },
      {
        sp: 'A',
        ar: 'أَعْطِنِي سَمَكَتَيْنِ وَكِيلُو طَمَاطِمَ.',
        en: 'Give me two fish and a kilo of tomatoes.',
        id: 'Beri saya dua ikan dan satu kilo tomat.'
      },
      {
        sp: 'B',
        ar: 'حَاضِرٌ! هَلْ تُرِيدُ شَيْئًا آخَرَ؟',
        en: 'Right away! Do you want anything else?',
        id: 'Siap! Mau yang lainnya?'
      },
      {
        sp: 'A',
        ar: 'لَا شُكْرًا، كَمْ الْحِسَابُ كُلُّهُ؟',
        en: 'No thanks, how much is the total?',
        id: 'Tidak, terima kasih, berapa totalnya?'
      },
      {
        sp: 'B',
        ar: 'خَمْسَةٌ وَثَلَاثُونَ أَلْفًا فَقَطْ.',
        en: 'Only thirty-five thousand.',
        id: 'Hanya tiga puluh lima ribu.'
      }
    ]
  },
  {
    id: 8,
    cat: 'keluarga',
    icon: 'fa-phone',
    level: 'Lanjutan',
    title: { id: 'Menelepon Nenek', en: 'Calling Grandmother', ar: 'الْاِتِّصَال بِالْجَدَّة' },
    lines: [
      {
        sp: 'A',
        ar: 'مَسَاءُ الْخَيْرِ يَا جَدَّتِي الْحَبِيبَةُ!',
        en: 'Good evening my dear grandmother!',
        id: 'Selamat malam nenek tersayang!'
      },
      {
        sp: 'B',
        ar: 'مَسَاءُ النُّورِ يَا حَبِيبِي، كَيْفَ صِحَّتُكَ؟',
        en: 'Good evening darling, how is your health?',
        id: 'Selamat malam sayang, bagaimana kesehatanmu?'
      },
      {
        sp: 'A',
        ar: 'بِخَيْرٍ وَالْحَمْدُ لِلَّهِ، مَتَى تَزُورِينَنَا؟',
        en: 'Fine praise God, when will you visit us?',
        id: 'Baik alhamdulillah, kapan nenek berkunjung?'
      },
      {
        sp: 'B',
        ar: 'سَآتِي يَوْمَ الْجُمُعَةِ مَعَ خَالِكَ.',
        en: 'I will come on Friday with your uncle.',
        id: 'Nenek akan datang hari Jumat bersama pamanmu.'
      },
      {
        sp: 'A',
        ar: 'رَائِعٌ! سَنُحَضِّرُ لَكِ مُفَاجَأَةً.',
        en: 'Great! We will prepare a surprise for you.',
        id: 'Hebat! Kami akan siapkan kejutan untuk nenek.'
      },
      {
        sp: 'B',
        ar: 'حَفِظَكَ اللَّهُ يَا بُنَيَّ، أَرَاكَ قَرِيبًا.',
        en: 'God protect you my son, see you soon.',
        id: 'Semoga Allah menjagamu nak, sampai jumpa lagi.'
      }
    ]
  }
];
var VOCAB = [
  { ar: 'اَلسَّلَامُ عَلَيْكُمْ', en: 'Peace be upon you', id: "Assalamu'alaikum", cat: 'sapaan' },
  { ar: 'صَبَاحُ الْخَيْرِ', en: 'Good morning', id: 'Selamat pagi', cat: 'sapaan' },
  { ar: 'مَسَاءُ الْخَيْرِ', en: 'Good evening', id: 'Selamat malam', cat: 'sapaan' },
  { ar: 'كَيْفَ حَالُكَ؟', en: 'How are you?', id: 'Apa kabarmu?', cat: 'sapaan' },
  { ar: 'شُكْرًا', en: 'Thank you', id: 'Terima kasih', cat: 'sapaan' },
  { ar: 'عَفْوًا', en: "Excuse me / You're welcome", id: 'Permisi / Sama-sama', cat: 'sapaan' },
  { ar: 'مَدْرَسَة', en: 'School', id: 'Sekolah', cat: 'sekolah' },
  { ar: 'مُعَلِّم', en: 'Teacher (male)', id: 'Guru (lk)', cat: 'sekolah' },
  { ar: 'كِتَاب', en: 'Book', id: 'Buku', cat: 'sekolah' },
  { ar: 'قَلَم', en: 'Pen', id: 'Pulpen', cat: 'sekolah' },
  { ar: 'دَفْتَر', en: 'Notebook', id: 'Buku tulis', cat: 'sekolah' },
  { ar: 'مَكْتَبَة', en: 'Library', id: 'Perpustakaan', cat: 'sekolah' },
  { ar: 'سُوق', en: 'Market', id: 'Pasar', cat: 'pasar' },
  { ar: 'سِعْر', en: 'Price', id: 'Harga', cat: 'pasar' },
  { ar: 'نُقُود', en: 'Money', id: 'Uang', cat: 'pasar' },
  { ar: 'سَمَك', en: 'Fish', id: 'Ikan', cat: 'pasar' },
  { ar: 'خُضَار', en: 'Vegetables', id: 'Sayuran', cat: 'pasar' },
  { ar: 'فَاكِهَة', en: 'Fruit', id: 'Buah', cat: 'pasar' },
  { ar: 'أَب', en: 'Father', id: 'Ayah', cat: 'keluarga' },
  { ar: 'أُمّ', en: 'Mother', id: 'Ibu', cat: 'keluarga' },
  { ar: 'أَخ', en: 'Brother', id: 'Saudara laki-laki', cat: 'keluarga' },
  { ar: 'أُخْت', en: 'Sister', id: 'Saudara perempuan', cat: 'keluarga' },
  { ar: 'جَدّ', en: 'Grandfather', id: 'Kakek', cat: 'keluarga' },
  { ar: 'جَدَّة', en: 'Grandmother', id: 'Nenek', cat: 'keluarga' },
  { ar: 'صَدِيق', en: 'Friend', id: 'Teman', cat: 'sapaan' },
  { ar: 'بَيْت', en: 'House', id: 'Rumah', cat: 'keluarga' },
  { ar: 'شَاي', en: 'Tea', id: 'Teh', cat: 'pasar' },
  { ar: 'مَاء', en: 'Water', id: 'Air', cat: 'pasar' },
  { ar: 'جَمِيل', en: 'Beautiful', id: 'Indah', cat: 'sapaan' },
  { ar: 'كَبِير', en: 'Big', id: 'Besar', cat: 'sekolah' }
];
var I18N = {
  id: {
    nav_home: 'Beranda',
    nav_dialog: 'Percakapan',
    nav_vocab: 'Kosakata',
    nav_quiz: 'Kuis',
    hero_badge: 'Belajar Percakapan Arab • English Conversation',
    hero_desc:
      'Hafalkan dialog Arab–Inggris–Indonesia, dengarkan pelafalan native dengan audio, kuasai kosakata, dan uji dirimu lewat kuis interaktif.',
    hero_cta1: 'Mulai Percakapan',
    hero_cta2: 'Main Kuis',
    stat_d: 'Dialog',
    stat_v: 'Kosakata',
    dlg_title: 'Dialog Percakapan',
    dlg_sub: 'Klik dialog untuk membuka percakapan lengkap + audio per baris',
    voc_title: 'Flashcard Kosakata',
    voc_sub: 'Klik kartu untuk membalik & dengar pelafalannya',
    quiz_title: 'Uji Kemampuanmu',
    quiz_sub: '10 soal acak Arab → Inggris–Indonesia • skor + award',
    play_dlg: 'Putar Dialog',
    close: 'Tutup'
  },
  en: {
    nav_home: 'Home',
    nav_dialog: 'Dialogues',
    nav_vocab: 'Vocabulary',
    nav_quiz: 'Quiz',
    hero_badge: 'Learn Arabic Conversation • English Conversation',
    hero_desc:
      'Memorize Arabic–English–Indonesian dialogues, listen to native pronunciation with audio, master vocabulary, and test yourself with interactive quizzes.',
    hero_cta1: 'Start Dialogues',
    hero_cta2: 'Play Quiz',
    stat_d: 'Dialogues',
    stat_v: 'Words',
    dlg_title: 'Conversation Dialogues',
    dlg_sub: 'Click a dialogue to open the full conversation + audio per line',
    voc_title: 'Vocabulary Flashcards',
    voc_sub: 'Click a card to flip & hear pronunciation',
    quiz_title: 'Test Yourself',
    quiz_sub: '10 random Arabic → English–Indonesian questions • score + award',
    play_dlg: 'Play Dialogue',
    close: 'Close'
  },
  ar: {
    nav_home: 'الرَّئِيسِيَّة',
    nav_dialog: 'الْحِوَارَات',
    nav_vocab: 'الْمُفْرَدَات',
    nav_quiz: 'الْاِخْتِبَار',
    hero_badge: 'تَعَلُّم الْمُحَادَثَة الْعَرَبِيَّة • English Conversation',
    hero_desc:
      'اِحْفَظِ الْحِوَارَات بِالْعَرَبِيَّة وَالْإِنْجِلِيزِيَّة وَالْإِنْدُونِيسِيَّة، وَاسْتَمِعْ لِلنُّطْقِ الصَّحِيحِ، وَأَتْقِنِ الْمُفْرَدَاتِ، وَاخْتَبِرْ نَفْسَكَ.',
    hero_cta1: 'اِبْدَأِ الْحِوَار',
    hero_cta2: 'اِلْعَبِ الْاِخْتِبَار',
    stat_d: 'حِوَار',
    stat_v: 'مُفْرَدَة',
    dlg_title: 'اَلْحِوَارَات',
    dlg_sub: 'اِضْغَطْ عَلَى الْحِوَارِ لِفَتْحِ النَّصِّ الْكَامِلِ مَعَ الصَّوْت',
    voc_title: 'بِطَاقَات الْمُفْرَدَات',
    voc_sub: 'اِضْغَطْ عَلَى الْبِطَاقَةِ لِقَلْبِهَا وَسَمَاعِ النُّطْق',
    quiz_title: 'اِخْتَبِرْ نَفْسَك',
    quiz_sub: '١٠ أَسْئِلَة عَشْوَائِيَّة • دَرَجَة + جَائِزَة',
    play_dlg: 'تَشْغِيل الْحِوَار',
    close: 'إِغْلَاق'
  }
};
