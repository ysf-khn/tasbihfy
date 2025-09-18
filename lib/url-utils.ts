import { surahNames } from "@/data/surah-names";

/**
 * Create URL-friendly slug from text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "") // Remove apostrophes
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate Quran surah slug in format: surah-name-surah-number
 */
export function generateSurahSlug(surahId: number): string {
  const surah = surahNames.find(s => s.id === surahId);
  if (!surah) return `surah-${surahId}`;

  const nameSlug = createSlug(surah.name);
  return `${nameSlug}-surah-${surahId}`;
}

/**
 * Parse surah slug to extract surah ID
 */
export function parseSurahSlug(slug: string): number | null {
  const match = slug.match(/-surah-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Generate duas category mappings
 */
export const duaCategories = {
  1: "waking",
  2: "clothing",
  3: "clothing",
  4: "clothing",
  5: "clothing",
  6: "toilet",
  7: "toilet",
  8: "wudu",
  9: "wudu",
  10: "home",
  11: "home",
  12: "mosque",
  13: "prayer",
  14: "prayer",
  15: "prayer",
  16: "prayer",
  17: "prayer",
  18: "prayer",
  19: "prayer",
  20: "prayer",
  21: "prayer",
  22: "prayer",
  23: "prayer",
  24: "morning",
  25: "evening",
  26: "evening",
  27: "sleep",
  28: "sleep",
  29: "sleep",
  30: "sleep",
  31: "sleep",
  32: "sleep",
  33: "sleep",
  34: "family",
  35: "family",
  36: "family",
  37: "family",
  38: "guests",
  39: "guests",
  40: "food",
  41: "food",
  42: "food",
  43: "food",
  44: "food",
  45: "food",
  46: "food",
  47: "travel",
  48: "travel",
  49: "travel",
  50: "travel",
  51: "travel",
  52: "travel",
  53: "travel",
  54: "travel",
  55: "travel",
  56: "travel",
  57: "travel",
  58: "travel",
  59: "travel",
  60: "weather",
  61: "weather",
  62: "weather",
  63: "weather",
  64: "weather",
  65: "weather",
  66: "weather",
  67: "hardship",
  68: "hardship",
  69: "hardship",
  70: "hardship",
  71: "hardship",
  72: "hardship",
  73: "hardship",
  74: "hardship",
  75: "hardship",
  76: "hardship",
  77: "hardship",
  78: "hardship",
  79: "hardship",
  80: "hardship",
  81: "hardship",
  82: "hardship",
  83: "hardship",
  84: "hardship",
  85: "hardship",
  86: "hardship",
  87: "hardship",
  88: "health",
  89: "health",
  90: "health",
  91: "health",
  92: "health",
  93: "health",
  94: "health",
  95: "health",
  96: "health",
  97: "health",
  98: "health",
  99: "health",
  100: "health",
  101: "social",
  102: "social",
  103: "social",
  104: "social",
  105: "social",
  106: "social",
  107: "social",
  108: "social",
  109: "social",
  110: "social",
  111: "worship",
  112: "worship",
  113: "worship",
  114: "worship",
  115: "worship",
  116: "worship",
  117: "worship",
  118: "worship",
  119: "worship",
  120: "worship",
  121: "worship",
  122: "worship",
  123: "worship",
  124: "worship",
  125: "worship",
  126: "worship",
  127: "worship",
  128: "worship",
  129: "general",
  130: "general",
  131: "general",
  132: "general"
} as const;

/**
 * Generate duas URL slug
 */
export function generateDuaSlug(chapterId: number, title: string): string {
  const category = duaCategories[chapterId as keyof typeof duaCategories] || "general";
  const titleSlug = createSlug(title);
  return `${category}/${titleSlug}`;
}

/**
 * Parse duas URL to extract chapter info
 */
export function parseDuaSlug(category: string, slug: string): { category: string; slug: string } {
  return { category, slug };
}

/**
 * Generate location slug for prayer times
 */
export function generateLocationSlug(location: string): string {
  return createSlug(location);
}

/**
 * Parse location slug
 */
export function parseLocationSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate dhikr type slug
 */
export function generateDhikrSlug(dhikrName: string, count?: number): string {
  const nameSlug = createSlug(dhikrName);
  return count ? `${nameSlug}-${count}-times` : nameSlug;
}

/**
 * Parse dhikr slug
 */
export function parseDhikrSlug(slug: string): { name: string; count?: number } {
  const match = slug.match(/^(.+)-(\d+)-times$/);
  if (match) {
    return {
      name: match[1].replace(/-/g, " "),
      count: parseInt(match[2], 10)
    };
  }
  return { name: slug.replace(/-/g, " ") };
}