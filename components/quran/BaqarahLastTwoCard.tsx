"use client";

import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function BaqarahLastTwoCard() {
  return (
    <Link href="/baqarah-last-two" className="block w-full">
      <div className="card bg-base-100 hover:bg-base-200 transition-colors duration-200 cursor-pointer border border-base-300">
        <div className="card-body p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-base-content">
                Last 2 Ayahs of Al-Baqarah
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                Protection before sleep (2:285-286)
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-base-content/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
