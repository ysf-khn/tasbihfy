"use client";

import { useState } from "react";
import { names99Allah } from "@/data/99-names";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import Link from "next/link";

export default function Names99Client() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter names based on search term
  const filteredNames = names99Allah.filter(
    (name) =>
      name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.arabic.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <UnifiedHeader title="99 Names of Allah" showSignIn={true} />

      <div className="container mx-auto px-4 py-6 space-y-6 pt-4">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-base-content">
            99 Names of Allah
          </h1>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            <span className="text-lg arabic-text">أَسْمَاءُ ٱللَّٰهِ ٱلْحُسْنَىٰ</span>
            <br />
            Asma ul Husna - The Most Beautiful Names
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search names..."
                className="input input-bordered flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-square btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Names Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNames.map((name) => (
            <Link
              key={name.id}
              href={`/99-names/${name.slug}`}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">
                    {name.id}
                  </span>
                  <span className="text-xs text-base-content/50">
                    Click for details
                  </span>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl arabic-text text-base-content">
                    {name.arabic}
                  </h3>
                  <p className="font-semibold text-base-content">
                    {name.transliteration}
                  </p>
                  <p className="text-sm text-base-content/70">
                    {name.meaning}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No results */}
        {filteredNames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-base-content/50">
              No names found matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold text-base-content mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="/" className="btn btn-sm btn-outline">
                Dhikr Counter
              </Link>
              <Link href="/duas" className="btn btn-sm btn-outline">
                Daily Duas
              </Link>
              <Link href="/quran" className="btn btn-sm btn-outline">
                Read Quran
              </Link>
              <Link href="/prayer-times" className="btn btn-sm btn-outline">
                Prayer Times
              </Link>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold text-base-content mb-3">
              About the 99 Names of Allah
            </h3>
            <div className="space-y-3 text-sm text-base-content/70">
              <p>
                The 99 Names of Allah, known as <em>Asma ul Husna</em> (الأسماء الحسنى),
                are the beautiful names and attributes of Allah mentioned in the Quran and Hadith.
              </p>
              <p>
                Each name reflects a unique aspect of Allah's divine nature and attributes.
                Reciting and contemplating these names brings spiritual benefits and closeness to Allah.
              </p>
              <p>
                The Prophet Muhammad (ﷺ) said: "Allah has ninety-nine names. Whoever learns them will go to Paradise."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}