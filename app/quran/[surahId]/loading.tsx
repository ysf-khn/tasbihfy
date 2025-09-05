import UnifiedHeader from "@/components/ui/UnifiedHeader";
import Image from "next/image";
import kaabaImage from "@/public/kaaba.jpeg";

export default function Loading() {
  return (
    <div className="min-h-screen bg-base-200 pb-20">
      <UnifiedHeader title="Quran" showSignIn={true} />

      <div className="container mx-auto px-4 py-6 max-w-4xl pt-4">
        {/* Surah Header Skeleton */}
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg h-40">
          {/* Background Image - Static during loading */}
          <Image
            src={kaabaImage}
            alt="Kaaba"
            fill
            className="object-cover"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          {/* Header Content Skeleton */}
          <div className="relative z-10 h-full flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              {/* Back Button Skeleton */}
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
              
              {/* Title and Info Skeleton */}
              <div>
                <div className="h-6 bg-white/30 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Debug Info Skeleton (if in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="card bg-base-100 border border-base-200 mb-6 animate-pulse">
            <div className="card-body p-4">
              <div className="h-4 bg-base-300 rounded w-20 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-base-200 rounded w-full"></div>
                <div className="h-3 bg-base-200 rounded w-3/4"></div>
                <div className="h-3 bg-base-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        )}

        {/* Verses Loading Skeletons */}
        <div className="space-y-6">
          {/* Generate 5 verse card skeletons */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="card bg-base-100 border border-base-200 animate-pulse"
            >
              <div className="card-body p-6">
                {/* Verse Header Skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Verse Number Circle */}
                    <div className="w-10 h-8 bg-primary/10 border border-primary/20 rounded-full"></div>
                  </div>
                  
                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, btnIndex) => (
                      <div
                        key={btnIndex}
                        className="w-8 h-8 bg-base-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Arabic Text Skeleton */}
                <div className="mb-4">
                  <div className="space-y-2">
                    <div className="h-8 bg-base-200 rounded w-full"></div>
                    <div className="h-8 bg-base-200 rounded w-5/6"></div>
                    <div className="h-8 bg-base-200 rounded w-4/5"></div>
                  </div>
                </div>

                {/* Translation Skeletons */}
                <div className="space-y-4">
                  {/* First Translation */}
                  <div>
                    <div className="h-3 bg-base-200 rounded w-32 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-base-200 rounded w-full"></div>
                      <div className="h-4 bg-base-200 rounded w-11/12"></div>
                      <div className="h-4 bg-base-200 rounded w-3/4"></div>
                    </div>
                  </div>

                  {/* Second Translation */}
                  <div>
                    <div className="h-3 bg-base-200 rounded w-28 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-base-200 rounded w-full"></div>
                      <div className="h-4 bg-base-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>

                {/* Metadata Skeleton */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-base-200">
                  <div className="h-3 bg-base-200 rounded w-12"></div>
                  <div className="h-3 bg-base-200 rounded w-10"></div>
                  <div className="h-3 bg-base-200 rounded w-14"></div>
                  <div className="h-3 bg-base-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Message */}
        <div className="text-center mt-8">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70 text-sm">Loading Surah...</p>
        </div>
      </div>
    </div>
  );
}