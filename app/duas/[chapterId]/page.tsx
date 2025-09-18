import { notFound } from "next/navigation";
import hisnulMuslim from "@/data/hisnul-muslim-complete.json";
import ChapterClient from "./ChapterClient";

// Generate static params for all chapters
export async function generateStaticParams() {
  return hisnulMuslim.chapters.map((chapter) => ({
    chapterId: chapter.id.toString(),
  }));
}

// Server component that fetches the chapter data
export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId: chapterIdString } = await params;
  const chapterId = parseInt(chapterIdString);
  const chapter = hisnulMuslim.chapters.find((c) => c.id === chapterId);

  if (!chapter) {
    notFound();
  }

  // Pass the chapter data to the client component
  return <ChapterClient chapter={chapter} />;
}
