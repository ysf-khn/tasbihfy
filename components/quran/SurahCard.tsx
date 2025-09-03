"use client";

import Link from 'next/link';
import { Surah } from '@/lib/quran/types';

interface SurahCardProps {
  surah: Surah;
}

export default function SurahCard({ surah }: SurahCardProps) {
  return (
    <Link href={`/quran/${surah.id}`} className="block group">
      <div className="flex items-center px-2 py-4 hover:bg-base-100/50 transition-all duration-200">
        {/* 8-pointed Star with Surah Number */}
        <div className="relative w-6 h-6 flex-shrink-0 mr-4">
          <div className="star-8 w-full h-full bg-orange-50 border border-orange-200 flex items-center justify-center">
            <span className="text-xs font-bold text-orange-600">{surah.id}</span>
          </div>
        </div>

        {/* Surah Info - Left Side */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-base-content mb-1">
            {surah.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-base-content/60">
            <span>{surah.total_verses} Verses</span>
            <span>|</span>
            <span className="capitalize">{surah.type}</span>
          </div>
        </div>

        {/* Arabic Name - Right Side */}
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-xl font-arabic text-base-content">
            {getArabicName(surah.id)}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Helper function to get Arabic names (this could be moved to constants)
function getArabicName(surahId: number): string {
  const arabicNames: Record<number, string> = {
    1: 'الفَاتِحَة',
    2: 'البَقَرَة',
    3: 'آل عِمرَان',
    4: 'النِّسَاء',
    5: 'المَائدة',
    6: 'الأَنعَام',
    7: 'الأَعرَاف',
    8: 'الأَنفَال',
    9: 'التوبَة',
    10: 'يُونُس',
    11: 'هُود',
    12: 'يُوسُف',
    13: 'الرَّعد',
    14: 'إِبراهِيم',
    15: 'الحِجر',
    16: 'النَّحل',
    17: 'الإِسرَاء',
    18: 'الكَهف',
    19: 'مَريَم',
    20: 'طه',
    21: 'الأَنبيَاء',
    22: 'الحَجّ',
    23: 'المُؤمِنُون',
    24: 'النُّور',
    25: 'الفُرقَان',
    26: 'الشُّعَرَاء',
    27: 'النَّمل',
    28: 'القَصَص',
    29: 'العَنكبُوت',
    30: 'الرُّوم',
    31: 'لُقمَان',
    32: 'السَّجدَة',
    33: 'الأَحزَاب',
    34: 'سَبَأ',
    35: 'فَاطِر',
    36: 'يس',
    37: 'الصَّافَّات',
    38: 'ص',
    39: 'الزُّمَر',
    40: 'غَافِر',
    41: 'فُصِّلَت',
    42: 'الشُّورَى',
    43: 'الزُّخرُف',
    44: 'الدُّخَان',
    45: 'الجَاثيَة',
    46: 'الأَحقَاف',
    47: 'مُحَمَّد',
    48: 'الفَتح',
    49: 'الحُجُرَات',
    50: 'ق',
    51: 'الذَّاريَات',
    52: 'الطُّور',
    53: 'النَّجم',
    54: 'القَمَر',
    55: 'الرَّحمَن',
    56: 'الوَاقِعَة',
    57: 'الحَديد',
    58: 'المُجَادلَة',
    59: 'الحَشر',
    60: 'المُمتَحنَة',
    61: 'الصَّف',
    62: 'الجُمُعَة',
    63: 'المُنَافِقُون',
    64: 'التَّغَابُن',
    65: 'الطَّلَاق',
    66: 'التَّحرِيم',
    67: 'المُلك',
    68: 'القَلَم',
    69: 'الحَاقَّة',
    70: 'المَعَارِج',
    71: 'نُوح',
    72: 'الجِنّ',
    73: 'المُزَّمِّل',
    74: 'المُدَّثِّر',
    75: 'القِيَامَة',
    76: 'الإِنسَان',
    77: 'المُرسَلَات',
    78: 'النَّبَأ',
    79: 'النَّازِعَات',
    80: 'عَبَسَ',
    81: 'التَّكوِير',
    82: 'الإِنفِطَار',
    83: 'المُطَفِّفِين',
    84: 'الإِنشِقَاق',
    85: 'البُرُوج',
    86: 'الطَّارِق',
    87: 'الأَعلَى',
    88: 'الغَاشِيَة',
    89: 'الفَجر',
    90: 'البَلَد',
    91: 'الشَّمس',
    92: 'اللَّيل',
    93: 'الضُّحَى',
    94: 'الشَّرح',
    95: 'التِّين',
    96: 'العَلَق',
    97: 'القَدر',
    98: 'البَيِّنَة',
    99: 'الزَّلزَلَة',
    100: 'العَادِيات',
    101: 'القَارِعَة',
    102: 'التَّكَاثُر',
    103: 'العَصر',
    104: 'الهُمَزَة',
    105: 'الفِيل',
    106: 'قُرَيش',
    107: 'المَاعُون',
    108: 'الكَوثَر',
    109: 'الكَافِرُون',
    110: 'النَّصر',
    111: 'المَسَد',
    112: 'الإِخلَاص',
    113: 'الفَلَق',
    114: 'النَّاس',
  };

  return arabicNames[surahId] || '';
}