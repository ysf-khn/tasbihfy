"use client";

import { useEffect, useState } from "react";

/**
 * Height in pixels currently occupied by the bottom navigation, or 0 when it
 * isn't on screen (desktop, where the nav is `lg:hidden`).
 *
 * Measured rather than hard-coded: the nav's height already folds in
 * `env(safe-area-inset-bottom)`, which varies by device, so anything anchored
 * above it has to read the real box or it ends up partly underneath.
 *
 * `retrigger` re-runs the measurement — pass whatever controls the consumer's
 * visibility, since an element that mounts hidden may measure before the nav
 * has been laid out.
 */
export function useBottomNavOffset(retrigger?: unknown): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let observer: ResizeObserver | undefined;
    let frame: number | undefined;

    const measure = () => {
      // `lg:hidden` collapses the nav to zero height rather than removing it.
      const nav = document.querySelector<HTMLElement>("[data-bottom-nav]");
      setOffset(nav ? nav.getBoundingClientRect().height : 0);
    };

    const attach = () => {
      const nav = document.querySelector<HTMLElement>("[data-bottom-nav]");
      if (!nav) {
        // The nav renders after its siblings; try again once laid out.
        frame = requestAnimationFrame(attach);
        return;
      }
      measure();
      observer = new ResizeObserver(measure);
      observer.observe(nav);
    };

    attach();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [retrigger]);

  return offset;
}
