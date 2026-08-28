"use client";

import { CalculationInfo } from "@/types/prayer";

interface CalculationNoteProps {
  calculation?: CalculationInfo;
}

/**
 * Tells the user which ruleset produced these times. Asr in particular shifts
 * by about an hour between schools, so showing this turns "the times are wrong"
 * into a self-serve fix.
 */
export default function CalculationNote({ calculation }: CalculationNoteProps) {
  if (!calculation) return null;

  // Plain text for now; make this a link to the method setting once that ships.
  return (
    <p className="text-xs text-base-content/60 text-center lg:text-left">
      Calculated using {calculation.methodName} · {calculation.schoolName} Asr
    </p>
  );
}
