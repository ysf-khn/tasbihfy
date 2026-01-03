import hadithsData from '@/data/hadiths.json';

export interface Hadith {
  id: number;
  text: string;
  source: string;
}

/**
 * Get the hadith of the day based on the current date
 * Rotates through 50 hadiths every 50 days
 */
export function getHadithOfTheDay(): Hadith {
  const now = new Date();

  // Get day of the year (1-365/366)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Use modulo to cycle through 50 hadiths
  const hadithIndex = (dayOfYear - 1) % 50; // -1 because array is 0-indexed

  // Get the hadith from our collection
  const hadith = hadithsData.hadiths[hadithIndex];

  if (!hadith) {
    // Fallback to first hadith if something goes wrong
    return hadithsData.hadiths[0];
  }

  return hadith;
}

/**
 * Get a specific hadith by ID
 */
export function getHadithById(id: number): Hadith | null {
  return hadithsData.hadiths.find(hadith => hadith.id === id) || null;
}

/**
 * Get all hadiths
 */
export function getAllHadiths(): Hadith[] {
  return hadithsData.hadiths;
}

/**
 * Get a random hadith
 */
export function getRandomHadith(): Hadith {
  const randomIndex = Math.floor(Math.random() * hadithsData.hadiths.length);
  return hadithsData.hadiths[randomIndex];
}