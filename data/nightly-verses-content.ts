// Static verse content for Nightly Recitations
// Total: 48 verses

export interface VerseContent {
  verseKey: string;
  textUthmani: string;
  textIndopak: string;
  translation: string;
}

export const nightlyVersesContent: VerseContent[] = [
  // Surah Al-Ikhlas (112) - 4 verses
  {
    verseKey: "112:1",
    textUthmani: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
    textIndopak: "قُلۡ هُوَ اللّٰهُ اَحَدٌ​ ۚ‏",
    translation: "Say, \"He is Allah, [who is] One,"
  },
  {
    verseKey: "112:2",
    textUthmani: "ٱللَّهُ ٱلصَّمَدُ",
    textIndopak: "اَللّٰهُ الصَّمَدُ​ ۚ‏",
    translation: "Allah, the Eternal Refuge."
  },
  {
    verseKey: "112:3",
    textUthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    textIndopak: "لَمۡ يَلِدۡ ۙ وَلَمۡ يُوۡلَدۡ​ ۙ‏",
    translation: "He neither begets nor is born,"
  },
  {
    verseKey: "112:4",
    textUthmani: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
    textIndopak: "وَلَمۡ يَكُنۡ لَّهٗ كُفُوًا اَحَدٌ‏",
    translation: "Nor is there to Him any equivalent.\""
  },

  // Surah Al-Falaq (113) - 5 verses
  {
    verseKey: "113:1",
    textUthmani: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
    textIndopak: "قُلۡ اَعُوۡذُ بِرَبِّ الۡفَلَقِ​ۙ‏",
    translation: "Say, \"I seek refuge in the Lord of daybreak"
  },
  {
    verseKey: "113:2",
    textUthmani: "مِن شَرِّ مَا خَلَقَ",
    textIndopak: "مِنۡ شَرِّ مَا خَلَقَ​ۙ‏",
    translation: "From the evil of that which He created"
  },
  {
    verseKey: "113:3",
    textUthmani: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
    textIndopak: "وَمِنۡ شَرِّ غَاسِقٍ اِذَا وَقَبَ​ۙ‏",
    translation: "And from the evil of darkness when it settles"
  },
  {
    verseKey: "113:4",
    textUthmani: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
    textIndopak: "وَمِنۡ شَرِّ النَّفّٰثٰتِ فِى الۡعُقَدِ​ۙ‏",
    translation: "And from the evil of the blowers in knots"
  },
  {
    verseKey: "113:5",
    textUthmani: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    textIndopak: "وَمِنۡ شَرِّ حَاسِدٍ اِذَا حَسَدَ‏",
    translation: "And from the evil of an envier when he envies.\""
  },

  // Surah An-Nas (114) - 6 verses
  {
    verseKey: "114:1",
    textUthmani: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
    textIndopak: "قُلۡ اَعُوۡذُ بِرَبِّ النَّاسِ​ۙ‏",
    translation: "Say, \"I seek refuge in the Lord of mankind,"
  },
  {
    verseKey: "114:2",
    textUthmani: "مَلِكِ ٱلنَّاسِ",
    textIndopak: "مَلِكِ النَّاسِ​ۙ‏",
    translation: "The Sovereign of mankind."
  },
  {
    verseKey: "114:3",
    textUthmani: "إِلَٰهِ ٱلنَّاسِ",
    textIndopak: "اِلٰهِ النَّاسِ​ۙ‏",
    translation: "The God of mankind,"
  },
  {
    verseKey: "114:4",
    textUthmani: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
    textIndopak: "مِنۡ شَرِّ الۡوَسۡوَاسِ ۙ الۡخَنَّاسِ​ۙ‏",
    translation: "From the evil of the retreating whisperer -"
  },
  {
    verseKey: "114:5",
    textUthmani: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
    textIndopak: "الَّذِىۡ يُوَسۡوِسُ فِىۡ صُدُوۡرِ النَّاسِ​ۙ‏",
    translation: "Who whispers [evil] into the breasts of mankind -"
  },
  {
    verseKey: "114:6",
    textUthmani: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
    textIndopak: "مِنَ الۡجِنَّةِ وَالنَّاسِ‏",
    translation: "From among the jinn and mankind.\""
  },

  // Ayatul Kursi (2:255) - 1 verse
  {
    verseKey: "2:255",
    textUthmani: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
    textIndopak: "اَللّٰهُ لَاۤ اِلٰهَ اِلَّا هُوَ​ ۚ اَلۡحَـىُّ الۡقَيُّوۡمُ​ ۚ لَا تَاۡخُذُهٗ سِنَةٌ وَّلَا نَوۡمٌ​ ؕ لَهٗ مَا فِى السَّمٰوٰتِ وَمَا فِى الۡاَرۡضِ​ ؕ مَنۡ ذَا الَّذِىۡ يَشۡفَعُ عِنۡدَهٗۤ اِلَّا بِاِذۡنِهٖ​ ؕ يَعۡلَمُ مَا بَيۡنَ اَيۡدِيۡهِمۡ وَمَا خَلۡفَهُمۡ​ ۚ وَلَا يُحِيۡطُوۡنَ بِشَىۡءٍ مِّنۡ عِلۡمِهٖۤ اِلَّا بِمَا شَآءَ​ ۚ وَسِعَ كُرۡسِيُّهُ السَّمٰوٰتِ وَالۡاَرۡضَ​ ۚ وَلَا يَـــُٔوۡدُهٗ حِفۡظُهُمَا​ ۚ وَهُوَ الۡعَلِىُّ الۡعَظِيۡمُ‏",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great."
  },

  // Last 2 verses of Surah Al-Baqarah (2:285-286) - 2 verses
  {
    verseKey: "2:285",
    textUthmani: "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ",
    textIndopak: "اٰمَنَ الرَّسُوۡلُ بِمَاۤ اُنۡزِلَ اِلَيۡهِ مِنۡ رَّبِّهٖ وَ الۡمُؤۡمِنُوۡنَ​ ؕ كُلٌّ اٰمَنَ بِاللّٰهِ وَمَلٰٓٮِٕكَتِهٖ وَكُتُبِهٖ وَرُسُلِهٖ لَا نُفَرِّقُ بَيۡنَ اَحَدٍ مِّنۡ رُّسُلِهٖ وَقَالُوۡا سَمِعۡنَا وَاَطَعۡنَا​ غُفۡرَانَكَ رَبَّنَا وَاِلَيۡكَ الۡمَصِيۡرُ‏",
    translation: "The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allah and His angels and His books and His messengers, [saying], \"We make no distinction between any of His messengers.\" And they say, \"We hear and we obey. [We seek] Your forgiveness, our Lord, and to You is the [final] destination.\""
  },
  {
    verseKey: "2:286",
    textUthmani: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ",
    textIndopak: "لَا يُكَلِّفُ اللّٰهُ نَفۡسًا اِلَّا وُسۡعَهَا​ ؕ لَهَا مَا كَسَبَتۡ وَعَلَيۡهَا مَا اكۡتَسَبَتۡ​ ؕ رَبَّنَا لَا تُؤَاخِذۡنَاۤ اِنۡ نَّسِيۡنَاۤ اَوۡ اَخۡطَاۡنَا​ ۚ رَبَّنَا وَلَا تَحۡمِلۡ عَلَيۡنَاۤ اِصۡرًا كَمَا حَمَلۡتَهٗ عَلَى الَّذِيۡنَ مِنۡ قَبۡلِنَا​ ۚ رَبَّنَا وَلَا تُحَمِّلۡنَا مَا لَا طَاقَةَ لَنَا بِهٖ​ ۚ وَاعۡفُ عَنَّا وَاغۡفِرۡ لَنَا وَارۡحَمۡنَا​ اَنۡتَ مَوۡلٰٮنَا فَانۡصُرۡنَا عَلَى الۡقَوۡمِ الۡكٰفِرِيۡنَ‏",
    translation: "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned. \"Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.\""
  },

  // Surah Al-Mulk (67) - 30 verses
  {
    verseKey: "67:1",
    textUthmani: "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    textIndopak: "تَبٰرَكَ الَّذِىۡ بِيَدِهِ الۡمُلۡكُ وَهُوَ عَلٰى كُلِّ شَىۡءٍ قَدِيۡرُۙ‏",
    translation: "Blessed is He in whose hand is dominion, and He is over all things competent -"
  },
  {
    verseKey: "67:2",
    textUthmani: "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ",
    textIndopak: "الَّذِىۡ خَلَقَ الۡمَوۡتَ وَالۡحَيٰوةَ لِيَبۡلُوَكُمۡ اَيُّكُمۡ اَحۡسَنُ عَمَلًا ​ؕ وَهُوَ الۡعَزِيۡزُ الۡغَفُوۡرُۙ‏",
    translation: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -"
  },
  {
    verseKey: "67:3",
    textUthmani: "ٱلَّذِى خَلَقَ سَبْعَ سَمَٰوَٰتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَٰنِ مِن تَفَٰوُتٍ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ",
    textIndopak: "الَّذِىۡ خَلَقَ سَبۡعَ سَمٰوٰتٍ طِبَاقًا ​ؕ مَا تَرٰى فِىۡ خَلۡقِ الرَّحۡمٰنِ مِنۡ تَفٰوُتٍ​ ؕ فَارۡجِعِ الۡبَصَرَۙ هَلۡ تَرٰى مِنۡ فُطُوۡرٍ‏",
    translation: "[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the sky]; do you see any breaks?"
  },
  {
    verseKey: "67:4",
    textUthmani: "ثُمَّ ٱرْجِعِ ٱلْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ ٱلْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ",
    textIndopak: "ثُمَّ ارۡجِعِ الۡبَصَرَ كَرَّتَيۡنِ يَنۡقَلِبۡ اِلَيۡكَ الۡبَصَرُ خَاسِئًا وَّهُوَ حَسِيۡرٌ‏",
    translation: "Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued."
  },
  {
    verseKey: "67:5",
    textUthmani: "وَلَقَدْ زَيَّنَّا ٱلسَّمَآءَ ٱلدُّنْيَا بِمَصَٰبِيحَ وَجَعَلْنَٰهَا رُجُومًا لِّلشَّيَٰطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ ٱلسَّعِيرِ",
    textIndopak: "وَلَقَدۡ زَيَّنَّا السَّمَآءَ الدُّنۡيَا بِمَصَابِيۡحَ وَجَعَلۡنٰهَا رُجُوۡمًا لِّلشَّيٰطِيۡنِ​ وَاَعۡتَدۡنَا لَهُمۡ عَذَابَ السَّعِيۡرِ‏",
    translation: "And We have certainly beautified the nearest heaven with stars and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze."
  },
  {
    verseKey: "67:6",
    textUthmani: "وَلِلَّذِينَ كَفَرُوا۟ بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ ٱلْمَصِيرُ",
    textIndopak: "وَلِلَّذِيۡنَ كَفَرُوۡا بِرَبِّهِمۡ عَذَابُ جَهَنَّمَ​ ؕ وَبِئۡسَ الۡمَصِيۡرُ‏",
    translation: "And for those who disbelieved in their Lord is the punishment of Hell, and wretched is the destination."
  },
  {
    verseKey: "67:7",
    textUthmani: "إِذَآ أُلْقُوا۟ فِيهَا سَمِعُوا۟ لَهَا شَهِيقًا وَهِىَ تَفُورُ",
    textIndopak: "اِذَاۤ اُلۡقُوۡا فِيۡهَا سَمِعُوۡا لَهَا شَهِيۡقًا وَّهِىَ تَفُوۡرُۙ‏",
    translation: "When they are thrown into it, they hear from it a [dreadful] inhaling while it boils up."
  },
  {
    verseKey: "67:8",
    textUthmani: "تَكَادُ تَمَيَّزُ مِنَ ٱلْغَيْظِ ۖ كُلَّمَآ أُلْقِىَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَآ أَلَمْ يَأْتِكُمْ نَذِيرٌ",
    textIndopak: "تَكَادُ تَمَيَّزُ مِنَ الۡغَيۡظِ​ ؕ كُلَّمَاۤ اُلۡقِىَ فِيۡهَا فَوۡجٌ سَاَلَهُمۡ خَزَنَـتُهَاۤ اَلَمۡ يَاۡتِكُمۡ نَذِيۡرٌ‏",
    translation: "It almost bursts with rage. Every time a company is thrown into it, its keepers ask them, \"Did there not come to you a warner?\""
  },
  {
    verseKey: "67:9",
    textUthmani: "قَالُوا۟ بَلَىٰ قَدْ جَآءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ ٱللَّهُ مِن شَىْءٍ إِنْ أَنتُمْ إِلَّا فِى ضَلَٰلٍ كَبِيرٍ",
    textIndopak: "قَالُوۡا بَلٰى قَدۡ جَآءَنَا نَذِيۡرٌ فَكَذَّبۡنَا وَقُلۡنَا مَا نَزَّلَ اللّٰهُ مِنۡ شَىۡءٍ اِنۡ اَنۡـتُمۡ اِلَّا فِىۡ ضَلٰلٍ كَبِيۡرٍ‏",
    translation: "They will say,\" Yes, a warner had come to us, but we denied and said, 'Allah has not sent down anything. You are not but in great error.'\""
  },
  {
    verseKey: "67:10",
    textUthmani: "وَقَالُوا۟ لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِىٓ أَصْحَٰبِ ٱلسَّعِيرِ",
    textIndopak: "وَقَالُوۡا لَوۡ كُنَّا نَسۡمَعُ اَوۡ نَعۡقِلُ مَا كُنَّا فِىۡۤ اَصۡحٰبِ السَّعِيۡرِ‏",
    translation: "And they will say, \"If only we had been listening or reasoning, we would not be among the companions of the Blaze.\""
  },
  {
    verseKey: "67:11",
    textUthmani: "فَٱعْتَرَفُوا۟ بِذَنۢبِهِمْ فَسُحْقًا لِّأَصْحَٰبِ ٱلسَّعِيرِ",
    textIndopak: "فَاعۡتَرَفُوۡا بِذَنۡۢبِهِمۡ​ ۚ فَسُحۡقًا لِّاَصۡحٰبِ السَّعِيۡرِ‏",
    translation: "And they will admit their sin, so [it is] alienation for the companions of the Blaze."
  },
  {
    verseKey: "67:12",
    textUthmani: "إِنَّ ٱلَّذِينَ يَخْشَوْنَ رَبَّهُم بِٱلْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ",
    textIndopak: "اِنَّ الَّذِيۡنَ يَخۡشَوۡنَ رَبَّهُمۡ بِالۡغَيۡبِ لَهُمۡ مَّغۡفِرَةٌ وَّاَجۡرٌ كَبِيۡرٌ‏",
    translation: "Indeed, those who fear their Lord unseen will have forgiveness and great reward."
  },
  {
    verseKey: "67:13",
    textUthmani: "وَأَسِرُّوا۟ قَوْلَكُمْ أَوِ ٱجْهَرُوا۟ بِهِۦٓ ۖ إِنَّهُۥ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ",
    textIndopak: "وَاَسِرُّوۡا قَوۡلَكُمۡ اَوِ اجۡهَرُوۡا بِهٖ​ ؕ اِنَّهٗ عَلِيۡمٌۢ بِذَاتِ الصُّدُوۡرِ‏",
    translation: "And conceal your speech or publicize it; indeed, He is Knowing of that within the breasts."
  },
  {
    verseKey: "67:14",
    textUthmani: "أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ ٱللَّطِيفُ ٱلْخَبِيرُ",
    textIndopak: "اَلَا يَعۡلَمُ مَنۡ خَلَقَ​ ؕ وَهُوَ اللَّطِيۡفُ الۡخَبِيۡرُ‏",
    translation: "Does He who created not know, while He is the Subtle, the Acquainted?"
  },
  {
    verseKey: "67:15",
    textUthmani: "هُوَ ٱلَّذِى جَعَلَ لَكُمُ ٱلْأَرْضَ ذَلُولًا فَٱمْشُوا۟ فِى مَنَاكِبِهَا وَكُلُوا۟ مِن رِّزْقِهِۦ ۖ وَإِلَيْهِ ٱلنُّشُورُ",
    textIndopak: "هُوَ الَّذِىۡ جَعَلَ لَـكُمُ الۡاَرۡضَ ذَلُوۡلًا فَامۡشُوۡا فِىۡ مَنَاكِبِهَا وَكُلُوۡا مِنۡ رِّزۡقِهٖ​ ؕ وَاِلَيۡهِ النُّشُوۡرُ‏",
    translation: "It is He who made the earth tame for you - so walk among its slopes and eat of His provision - and to Him is the resurrection."
  },
  {
    verseKey: "67:16",
    textUthmani: "ءَأَمِنتُم مَّن فِى ٱلسَّمَآءِ أَن يَخْسِفَ بِكُمُ ٱلْأَرْضَ فَإِذَا هِىَ تَمُورُ",
    textIndopak: "ءَاَمِنۡتُمۡ مَّنۡ فِى السَّمَآءِ اَنۡ يَّخۡسِفَ بِكُمُ الۡاَرۡضَ فَاِذَا هِىَ تَمُوۡرُۙ‏",
    translation: "Do you feel secure that He who [holds authority] in the heaven would not cause the earth to swallow you and suddenly it would sway?"
  },
  {
    verseKey: "67:17",
    textUthmani: "أَمْ أَمِنتُم مَّن فِى ٱلسَّمَآءِ أَن يُرْسِلَ عَلَيْكُمْ حَاصِبًا ۖ فَسَتَعْلَمُونَ كَيْفَ نَذِيرِ",
    textIndopak: "اَمۡ اَمِنۡتُمۡ مَّنۡ فِى السَّمَآءِ اَنۡ يُّرۡسِلَ عَلَيۡكُمۡ حَاصِبًا​ ؕ فَسَتَعۡلَمُوۡنَ كَيۡفَ نَذِيۡرِ‏",
    translation: "Or do you feel secure that He who [holds authority] in the heaven would not send against you a storm of stones? Then you would know how [severe] was My warning."
  },
  {
    verseKey: "67:18",
    textUthmani: "وَلَقَدْ كَذَّبَ ٱلَّذِينَ مِن قَبْلِهِمْ فَكَيْفَ كَانَ نَكِيرِ",
    textIndopak: "وَلَقَدۡ كَذَّبَ الَّذِيۡنَ مِنۡ قَبۡلِهِمۡ فَكَيۡفَ كَانَ نَكِيۡرِ‏",
    translation: "And already had those before them denied, and how [terrible] was My reproach."
  },
  {
    verseKey: "67:19",
    textUthmani: "أَوَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ فَوْقَهُمْ صَٰٓفَّٰتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَٰنُ ۚ إِنَّهُۥ بِكُلِّ شَىْءٍۭ بَصِيرٌ",
    textIndopak: "اَوَلَمۡ يَرَوۡا اِلَى الطَّيۡرِ فَوۡقَهُمۡ صٰٓفّٰتٍ وَّيَقۡبِضۡنَ​ ؕ مَا يُمۡسِكُهُنَّ اِلَّا الرَّحۡمٰنُ​ ؕ اِنَّهٗ بِكُلِّ شَىۡءٍۢ بَصِيۡرٌ‏",
    translation: "Do they not see the birds above them with wings outspread and [sometimes] folded in? None holds them [aloft] except the Most Merciful. Indeed He is, of all things, Seeing."
  },
  {
    verseKey: "67:20",
    textUthmani: "أَمَّنْ هَٰذَا ٱلَّذِى هُوَ جُندٌ لَّكُمْ يَنصُرُكُم مِّن دُونِ ٱلرَّحْمَٰنِ ۚ إِنِ ٱلْكَٰفِرُونَ إِلَّا فِى غُرُورٍ",
    textIndopak: "اَمَّنۡ هٰذَا الَّذِىۡ هُوَ جُنۡدٌ لَّكُمۡ يَنۡصُرُكُمۡ مِّنۡ دُوۡنِ الرَّحۡمٰنِ​ ؕ اِنِ الۡكٰفِرُوۡنَ اِلَّا فِىۡ غُرُوۡرٍ‏",
    translation: "Or who is it that could be an army for you to aid you other than the Most Merciful? The disbelievers are not but in delusion."
  },
  {
    verseKey: "67:21",
    textUthmani: "أَمَّنْ هَٰذَا ٱلَّذِى يَرْزُقُكُمْ إِنْ أَمْسَكَ رِزْقَهُۥ ۚ بَل لَّجُّوا۟ فِى عُتُوٍّ وَنُفُورٍ",
    textIndopak: "اَمَّنۡ هٰذَا الَّذِىۡ يَرۡزُقُكُمۡ اِنۡ اَمۡسَكَ رِزۡقَهٗ​ ۚ بَلْ لَّجُّوۡا فِىۡ عُتُوٍّ وَّنُفُوۡرٍ‏",
    translation: "Or who is it that could provide for you if He withheld His provision? But they have persisted in insolence and aversion."
  },
  {
    verseKey: "67:22",
    textUthmani: "أَفَمَن يَمْشِى مُكِبًّا عَلَىٰ وَجْهِهِۦٓ أَهْدَىٰٓ أَمَّن يَمْشِى سَوِيًّا عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ",
    textIndopak: "اَفَمَنۡ يَّمۡشِىۡ مُكِبًّا عَلٰى وَجۡهِهٖۤ اَهۡدٰٓى اَمَّنۡ يَّمۡشِىۡ سَوِيًّا عَلٰى صِرَاطٍ مُّسۡتَقِيۡمٍ‏",
    translation: "Then is one who walks fallen on his face better guided or one who walks erect on a straight path?"
  },
  {
    verseKey: "67:23",
    textUthmani: "قُلْ هُوَ ٱلَّذِىٓ أَنشَأَكُمْ وَجَعَلَ لَكُمُ ٱلسَّمْعَ وَٱلْأَبْصَٰرَ وَٱلْأَفْـِٔدَةَ ۖ قَلِيلًا مَّا تَشْكُرُونَ",
    textIndopak: "قُلۡ هُوَ الَّذِىۡۤ اَنۡشَاَكُمۡ وَجَعَلَ لَـكُمُ السَّمۡعَ وَالۡاَبۡصَارَ وَالۡاَفۡـــِٕدَةَ​ ؕ قَلِيۡلًا مَّا تَشۡكُرُوۡنَ‏",
    translation: "Say, \"It is He who has produced you and made for you hearing and vision and hearts; little are you grateful.\""
  },
  {
    verseKey: "67:24",
    textUthmani: "قُلْ هُوَ ٱلَّذِى ذَرَأَكُمْ فِى ٱلْأَرْضِ وَإِلَيْهِ تُحْشَرُونَ",
    textIndopak: "قُلۡ هُوَ الَّذِىۡ ذَرَاَكُمۡ فِى الۡاَرۡضِ وَاِلَيۡهِ تُحۡشَرُوۡنَ‏",
    translation: "Say, \"It is He who has multiplied you throughout the earth, and to Him you will be gathered.\""
  },
  {
    verseKey: "67:25",
    textUthmani: "وَيَقُولُونَ مَتَىٰ هَٰذَا ٱلْوَعْدُ إِن كُنتُمْ صَٰدِقِينَ",
    textIndopak: "وَيَقُوۡلُوۡنَ مَتٰى هٰذَا الۡوَعۡدُ اِنۡ كُنۡتُمۡ صٰدِقِيۡنَ‏",
    translation: "And they say, \"When is this promise, if you should be truthful?\""
  },
  {
    verseKey: "67:26",
    textUthmani: "قُلْ إِنَّمَا ٱلْعِلْمُ عِندَ ٱللَّهِ وَإِنَّمَآ أَنَا۠ نَذِيرٌ مُّبِينٌ",
    textIndopak: "قُلۡ اِنَّمَا الۡعِلۡمُ عِنۡدَ اللّٰهِ وَاِنَّمَاۤ اَنَا نَذِيۡرٌ مُّبِيۡنٌ‏",
    translation: "Say, \"The knowledge is only with Allah, and I am only a clear warner.\""
  },
  {
    verseKey: "67:27",
    textUthmani: "فَلَمَّا رَأَوْهُ زُلْفَةً سِيٓـَٔتْ وُجُوهُ ٱلَّذِينَ كَفَرُوا۟ وَقِيلَ هَٰذَا ٱلَّذِى كُنتُم بِهِۦ تَدَّعُونَ",
    textIndopak: "فَلَمَّا رَاَوۡهُ زُلۡفَةً سِيۡٓـَٔتۡ وُجُوۡهُ الَّذِيۡنَ كَفَرُوۡا وَقِيۡلَ هٰذَا الَّذِىۡ كُنۡتُمۡ بِهٖ تَدَّعُوۡنَ‏",
    translation: "But when they see it approaching, the faces of those who disbelieve will be distressed, and it will be said, \"This is that for which you used to call.\""
  },
  {
    verseKey: "67:28",
    textUthmani: "قُلْ أَرَءَيْتُمْ إِنْ أَهْلَكَنِىَ ٱللَّهُ وَمَن مَّعِىَ أَوْ رَحِمَنَا فَمَن يُجِيرُ ٱلْكَٰفِرِينَ مِنْ عَذَابٍ أَلِيمٍ",
    textIndopak: "قُلۡ اَرَءَيۡتُمۡ اِنۡ اَهۡلَـكَنِىَ اللّٰهُ وَمَنۡ مَّعِىَ اَوۡ رَحِمَنَا فَمَنۡ يُّجِيۡرُ الۡكٰفِرِيۡنَ مِنۡ عَذَابٍ اَلِيۡمٍ‏",
    translation: "Say, \"Have you considered: whether Allah should cause my death and those with me or have mercy upon us, who can protect the disbelievers from a painful punishment?\""
  },
  {
    verseKey: "67:29",
    textUthmani: "قُلْ هُوَ ٱلرَّحْمَٰنُ ءَامَنَّا بِهِۦ وَعَلَيْهِ تَوَكَّلْنَا ۖ فَسَتَعْلَمُونَ مَنْ هُوَ فِى ضَلَٰلٍ مُّبِينٍ",
    textIndopak: "قُلۡ هُوَ الرَّحۡمٰنُ اٰمَنَّا بِهٖ وَعَلَيۡهِ تَوَكَّلۡنَا​ ۚ فَسَتَعۡلَمُوۡنَ مَنۡ هُوَ فِىۡ ضَلٰلٍ مُّبِيۡنٍ‏",
    translation: "Say, \"He is the Most Merciful; we have believed in Him, and upon Him we have relied. And you will [come to] know who it is that is in clear error.\""
  },
  {
    verseKey: "67:30",
    textUthmani: "قُلْ أَرَءَيْتُمْ إِنْ أَصْبَحَ مَآؤُكُمْ غَوْرًا فَمَن يَأْتِيكُم بِمَآءٍ مَّعِينٍۭ",
    textIndopak: "قُلۡ اَرَءَيۡتُمۡ اِنۡ اَصۡبَحَ مَآؤُكُمۡ غَوۡرًا فَمَنۡ يَّاۡتِيۡكُمۡ بِمَآءٍ مَّعِيۡنٍ‏",
    translation: "Say, \"Have you considered: if your water was to become sunken [into the earth], then who could bring you flowing water?\""
  }
];

// Helper function to get verse content by key
export function getVerseContent(verseKey: string): VerseContent | undefined {
  return nightlyVersesContent.find(v => v.verseKey === verseKey);
}

// Helper function to get verse content by index
export function getVerseContentByIndex(index: number): VerseContent | undefined {
  return nightlyVersesContent[index];
}