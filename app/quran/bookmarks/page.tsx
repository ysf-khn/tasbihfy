import type { Metadata } from "next";
import BookmarksClient from "./BookmarksClient";

export const metadata: Metadata = {
  title: "Quran Bookmarks | Tasbihfy",
  description: "Your bookmarked Quran verses, grouped by surah.",
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}
