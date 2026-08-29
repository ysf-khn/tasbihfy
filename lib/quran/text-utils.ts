/**
 * Utility functions for processing Quran text, particularly translations with HTML markup
 */

/**
 * Clean translation text by processing HTML footnote markup
 * Converts <sup foot_note=xyz>1</sup> to proper superscript formatting
 */
export function cleanTranslationText(text: string): string {
  if (!text) return text;

  // Process footnote sup tags with foot_note attributes
  // Pattern: <sup foot_note="value">number</sup> or <sup foot_note=value>number</sup>
  let cleanedText = text.replace(
    /<sup\s+foot_note=["']?[^"'>]*["']?[^>]*>(\d+)<\/sup>/gi,
    (match, footnoteNumber) => {
      // Convert number to Unicode superscript
      return convertToSuperscript(footnoteNumber);
    }
  );

  // Also handle any remaining sup tags without foot_note attributes
  cleanedText = cleanedText.replace(
    /<sup[^>]*>(\d+)<\/sup>/gi,
    (match, footnoteNumber) => {
      return convertToSuperscript(footnoteNumber);
    }
  );

  // Clean up any other unwanted HTML tags (be conservative)
  cleanedText = cleanedText.replace(/<\/?span[^>]*>/gi, '');
  
  // Remove any stray HTML attributes that might be left
  cleanedText = cleanedText.replace(/\s+foot_note=["']?[^"'\s>]*["']?/gi, '');

  return cleanedText.trim();
}

/**
 * Strip characters that only render inside a Quran mushaf font from Arabic text
 * that is leaving the app (clipboard, share sheet).
 *
 * The IndoPak script encodes its ruku' markers and a handful of waqf signs in
 * the Private Use Area (U+E000-U+F8FF), which every general-purpose font draws
 * as a tofu box. The standard Unicode pause marks the text also carries
 * (U+06D6-U+06DC, U+0614, U+0615, U+06E9) are kept — those render fine
 * elsewhere. Uthmani text contains none of this and passes through unchanged.
 */
export function cleanArabicForExport(text: string): string {
  if (!text) return text;

  return text
    // Mushaf-font-only ornaments and waqf signs.
    .replace(/[\uE000-\uF8FF]/g, "")
    // Zero-width and bidi marks used for line breaking inside the mushaf.
    .replace(/[\u200B\u200F\uFEFF]/g, "")
    // En/em spaces used for justification collapse to a normal space.
    .replace(/[\u2002\u2003]/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

/**
 * Convert a number string to Unicode superscript characters
 */
function convertToSuperscript(numberStr: string): string {
  const superscriptMap: { [key: string]: string } = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹'
  };

  return numberStr
    .split('')
    .map(digit => superscriptMap[digit] || digit)
    .join('');
}

/**
 * Process translation text and return cleaned string with superscript formatting
 * This is an alternative to the JSX version for environments that need string output
 */
export function processTranslationText(text: string): string {
  return cleanTranslationText(text);
}

/**
 * Extract footnote information from translation text
 * Returns array of footnotes with their numbers and references
 */
export interface Footnote {
  number: string;
  reference: string;
  position: number;
}

export function extractFootnotes(text: string): Footnote[] {
  if (!text) return [];

  const footnotes: Footnote[] = [];
  const footnoteRegex = /<sup\s+foot_note=["']?([^"'>]*?)["']?[^>]*>(\d+)<\/sup>/gi;
  let match;

  while ((match = footnoteRegex.exec(text)) !== null) {
    footnotes.push({
      number: match[2],
      reference: match[1],
      position: match.index
    });
  }

  return footnotes;
}