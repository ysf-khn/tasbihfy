import { useQuranSettings } from "./useQuranSettings";

/**
 * Class name that switches Arabic text to the IndoPak typeface when that is the
 * reader's chosen script, so the preference set in the Quran settings carries
 * across the rest of the app.
 *
 * Returns an empty string for every other script, so it can be dropped into a
 * className unconditionally. Note this changes the letterforms only — text that
 * is stored in Uthmani orthography stays Uthmani; pages that have a genuine
 * IndoPak version of their text need to swap the string as well.
 */
export function useArabicScriptClass(): string {
  const { getSelectedScript } = useQuranSettings();

  return getSelectedScript() === "indopak" ? "script-indopak" : "";
}
