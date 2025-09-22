import { Metadata } from 'next';
import NightlyRecitationsViewer from '@/components/nightly/NightlyRecitationsViewer';

export const metadata: Metadata = {
  title: 'Nightly Recitations - Protection Before Sleep',
  description: 'Recite Al-Ikhlas, Al-Falaq, An-Nas, Ayatul Kursi, last 2 verses of Al-Baqarah, and Surah Al-Mulk for protection during sleep.',
  keywords: [
    'nightly recitations',
    'bedtime prayers',
    'Islamic protection',
    'Al-Ikhlas',
    'Al-Falaq',
    'An-Nas',
    'Ayatul Kursi',
    'Surah Mulk',
    'night prayers',
    'sleep protection'
  ],
  alternates: {
    canonical: '/nightly-recitations'
  }
};

export default function NightlyRecitationsPage() {
  return <NightlyRecitationsViewer />;
}