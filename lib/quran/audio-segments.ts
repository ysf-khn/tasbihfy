import { WordSegment } from "./types";

/**
 * Normalise the raw `segments` array the recitation API returns.
 *
 * The common shape is a 4-tuple `[segmentIndex, wordPosition, startMs, endMs]`
 * (verified against reciters 6 and 7), but the API also emits 3-tuples
 * `[wordPosition, startMs, endMs]` for some recitations. Anything else is
 * dropped rather than guessed at, so a malformed entry degrades to
 * verse-level highlighting instead of highlighting the wrong word.
 */
export function parseSegments(raw?: number[][] | null): WordSegment[] {
  if (!raw?.length) return [];

  const segments: WordSegment[] = [];
  for (const entry of raw) {
    if (!Array.isArray(entry)) continue;

    let position: number, startMs: number, endMs: number;
    if (entry.length >= 4) {
      [, position, startMs, endMs] = entry;
    } else if (entry.length === 3) {
      [position, startMs, endMs] = entry;
    } else {
      continue;
    }

    if (!Number.isFinite(position) || !Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      continue;
    }
    segments.push({ position, startMs, endMs });
  }

  return segments.sort((a, b) => a.startMs - b.startMs);
}

/**
 * Find the word sounding at `timeMs`, as a 1-based word position.
 *
 * Returns the last word whose recitation has *started*, so the highlight holds
 * steady through the pauses between words and the silence trailing the final
 * word. Returning null in those gaps instead would blink the highlight off
 * several times a verse and remount anything keyed to it.
 *
 * Null only before the first word begins. Called from a requestAnimationFrame
 * loop, so it stays allocation-free.
 */
export function findWordAt(segments: WordSegment[], timeMs: number): number | null {
  if (segments.length === 0 || timeMs < segments[0].startMs) return null;

  let low = 0;
  let high = segments.length - 1;
  let position: number | null = null;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (segments[mid].startMs <= timeMs) {
      position = segments[mid].position;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return position;
}
