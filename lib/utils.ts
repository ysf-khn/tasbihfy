import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
export function toArabicNumerals(number: number | string): string {
  const arabicNumerals = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩'
  };

  return String(number)
    .split('')
    .map(digit => arabicNumerals[digit as keyof typeof arabicNumerals] || digit)
    .join('');
}
