"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import hisnulMuslim from "@/data/hisnul-muslim-complete.json";

export default function DuasPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChapters = hisnulMuslim.chapters.filter((chapter) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      chapter.title.toLowerCase().includes(searchLower) ||
      chapter.arabicTitle.includes(searchTerm) ||
      chapter.duas.some(
        (dua) =>
          dua.arabic.includes(searchTerm) ||
          dua.translation.toLowerCase().includes(searchLower) ||
          dua.transliteration.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader title="Duas" showSignIn={true} />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Hisnul Muslim</h1>
          <p className="text-center text-base-content/70 mb-4">
            Fortress of the Muslim
          </p>

          {/* Search Bar */}
          <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
          <input
            type="text"
            placeholder="Search duas..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chapter List */}
      <div className="space-y-2">
        {filteredChapters.map((chapter) => (
          <Link key={chapter.id} href={`/duas/${chapter.id}`} className="block">
            <div className="card bg-base-100 border border-base-200 hover:border-primary/50 hover:shadow-md transition-all duration-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-content text-sm font-medium flex items-center justify-center flex-shrink-0">
                        {chapter.id}
                      </span>
                      <h3 className="font-medium text-base-content">
                        {chapter.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-ghost badge-sm px-3">
                      {chapter.duas.length} {chapter.duas.length === 1 ? 'dua' : 'duas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

        {filteredChapters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-base-content/50">
              No duas found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
