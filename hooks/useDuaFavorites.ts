"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dua_favorites";
const CHANGE_EVENT = "dua-favorites-changed";

export interface DuaFavorite {
  chapterId: number;
  duaId: number;
  chapterTitle: string;
  createdAt: string;
}

function favoriteKey(chapterId: number, duaId: number): string {
  return `${chapterId}:${duaId}`;
}

function readFavorites(): DuaFavorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: DuaFavorite[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useDuaFavorites() {
  const [favorites, setFavorites] = useState<DuaFavorite[]>([]);

  useEffect(() => {
    const load = () => setFavorites(readFavorites());
    load();
    window.addEventListener(CHANGE_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(CHANGE_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const isFavorite = useCallback(
    (chapterId: number, duaId: number) =>
      favorites.some(
        (f) => favoriteKey(f.chapterId, f.duaId) === favoriteKey(chapterId, duaId)
      ),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (chapterId: number, duaId: number, chapterTitle: string) => {
      const current = readFavorites();
      const key = favoriteKey(chapterId, duaId);
      const exists = current.some(
        (f) => favoriteKey(f.chapterId, f.duaId) === key
      );
      writeFavorites(
        exists
          ? current.filter((f) => favoriteKey(f.chapterId, f.duaId) !== key)
          : [
              ...current,
              {
                chapterId,
                duaId,
                chapterTitle,
                createdAt: new Date().toISOString(),
              },
            ]
      );
    },
    []
  );

  return { favorites, isFavorite, toggleFavorite };
}
