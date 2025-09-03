"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PlayIcon,
  ShareIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "@/components/ui/PageHeader";
import HeaderControls from "@/components/ui/HeaderControls";
import { useArabicSettings } from "@/hooks/useArabicSettings";
import hisnulMuslim from "@/data/hisnul-muslim-complete.json";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = parseInt(params.chapterId as string);
  const chapter = hisnulMuslim.chapters.find((c) => c.id === chapterId);
  const { getArabicClasses } = useArabicSettings();

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
        <button onClick={() => router.back()} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shareDua = async (dua: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${chapter.title} - ${dua.hisnNumber}`,
          text: `${dua.arabic}\n\n${dua.translation}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard(`${dua.arabic}\n\n${dua.translation}`);
    }
  };

  const startDhikr = (dua: any) => {
    // Navigate to counter with temporary dhikr using IDs only
    const searchParams = new URLSearchParams({
      temp: "true",
      chapterId: chapter.id.toString(),
      duaId: dua.id.toString(),
    });
    router.push(`/?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <PageHeader 
        fixed={true}
        glassmorphism={true}
        rightContent={<HeaderControls />}
      />
      <div className="container mx-auto px-4 py-6 max-w-2xl pt-6">
        {/* Chapter Info */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary badge-sm">{chapter.id}</span>
              <h1 className="text-xl font-bold">{chapter.title}</h1>
            </div>
          </div>
        </div>

        {/* Duas List */}
        <div className="space-y-6">
          {chapter.duas.map((dua) => (
            <div
              key={dua.id}
              className="card bg-base-100 border border-base-200"
            >
              <div className="card-body p-6">
                {/* Dua Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="badge badge-outline badge-sm">
                    {dua.hisnNumber}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(dua.arabic)}
                      className="btn btn-ghost btn-sm btn-square"
                      title="Copy Arabic"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareDua(dua)}
                      className="btn btn-ghost btn-sm btn-square"
                      title="Share"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startDhikr(dua)}
                      className="btn btn-primary btn-sm"
                      title="Start Dhikr"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Start</span>
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="mb-4">
                  <p
                    className={`leading-relaxed text-right text-base-content ${getArabicClasses()}`}
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                {dua.transliteration && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-primary mb-1">
                      Transliteration:
                    </p>
                    <p className="text-base italic text-base-content/80 leading-relaxed">
                      {dua.transliteration}
                    </p>
                  </div>
                )}

                {/* Translation */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-primary mb-1">
                    Translation:
                  </p>
                  <p className="text-base text-base-content leading-relaxed">
                    {dua.translation}
                  </p>
                </div>

                {/* Reference */}
                {dua.reference && (
                  <div className="text-xs text-base-content/60 italic">
                    <span className="font-medium">Reference:</span>{" "}
                    {dua.reference}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
