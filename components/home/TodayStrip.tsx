"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import { useTodaySummary } from "@/hooks/useTodaySummary";

/**
 * The user's own state, which the home screen otherwise never showed. Sits
 * directly under the prayer band so the first two things on the page are
 * "what's next" and "where you are".
 */
export default function TodayStrip({ user }: { user: unknown }) {
  const { todayCount, streak, resumeHref, resumeName, loading } =
    useTodaySummary(user);

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-base-content/50">
            Today
          </div>

          {loading ? (
            <div className="mt-2 h-9 w-28 rounded bg-base-300 animate-pulse" />
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums text-base-content">
                {todayCount.toLocaleString()}
              </span>
              <span className="text-sm text-base-content/60">
                {todayCount === 1 ? "recitation" : "recitations"}
              </span>
            </div>
          )}

          {!loading && streak > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-base-content bg-secondary/20 rounded-full px-2.5 py-1">
              <FireIcon className="w-3.5 h-3.5 text-secondary" />
              {streak} day{streak === 1 ? "" : "s"} in a row
            </div>
          )}
        </div>

        <Link
          href={resumeHref}
          className="btn btn-primary btn-sm sm:btn-md shrink-0"
        >
          {todayCount > 0 ? "Continue" : "Start counting"}
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {!loading && resumeName && (
        <div className="mt-3 border-t border-base-300 pt-3 text-sm text-base-content/60 truncate">
          Last counted:{" "}
          <span className="text-base-content/80 font-medium">{resumeName}</span>
        </div>
      )}
    </div>
  );
}
