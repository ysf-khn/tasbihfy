"use client";

import { useEffect, useRef } from "react";

const MANUAL_SCROLL_GRACE_MS = 4000;

/**
 * Keeps the verse being recited in view.
 *
 * Backs off for a few seconds after the reader scrolls by hand, so following
 * along visually never turns into the page yanking itself back. Programmatic
 * smooth scrolls fire `scroll` too, so they're flagged and ignored.
 */
export function useAudioAutoScroll(
  verseNumber: number | null,
  enabled: boolean = true
) {
  const lastManualScrollRef = useRef(0);
  const isAutoScrollingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;
      lastManualScrollRef.current = Date.now();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || verseNumber === null) return;
    if (Date.now() - lastManualScrollRef.current < MANUAL_SCROLL_GRACE_MS) return;

    const element = document.getElementById(`verse-${verseNumber}`);
    if (!element) return;

    isAutoScrollingRef.current = true;
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // Release the flag once the smooth scroll has settled, otherwise genuine
    // manual scrolling during the animation would be swallowed forever.
    const timer = setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 1000);

    return () => clearTimeout(timer);
  }, [verseNumber, enabled]);
}
