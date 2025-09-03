"use client";

import Link from "next/link";
import type { Dhikr, DhikrSession } from "@prisma/client";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface DhikrWithSession extends Omit<Dhikr, 'isFavorite'> {
  sessions: DhikrSession[];
  isFavorite?: boolean;
}

interface HomeDhikrCardProps {
  dhikr: DhikrWithSession;
  onToggleFavorite?: (id: string) => void;
}

export default function HomeDhikrCard({ dhikr, onToggleFavorite }: HomeDhikrCardProps) {
  const currentSession = dhikr.sessions[0];
  const currentCount = currentSession?.currentCount || 0;
  const isFavorite = dhikr.isFavorite || false;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(dhikr.id);
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 bg-base-100 rounded-2xl shadow-sm border border-base-200">
      {/* Left: Heart + Dhikr Info */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <button
          onClick={handleToggleFavorite}
          className="p-2 rounded-full hover:bg-base-200 transition-colors"
        >
          {isFavorite ? (
            <HeartIconSolid className="w-6 h-6 text-error" />
          ) : (
            <HeartIcon className="w-6 h-6 text-base-content/40" />
          )}
        </button>
        
        <div>
          <h3 className="font-semibold text-lg text-base-content">
            {dhikr.name}
          </h3>
          <p className="text-sm text-base-content/60">
            {dhikr.targetCount} times
          </p>
        </div>
      </div>

      {/* Right: Start Button */}
      <Link
        href={`/?dhikr=${dhikr.id}`}
        className="btn btn-primary rounded-full px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base shrink-0"
      >
        Start
      </Link>
    </div>
  );
}