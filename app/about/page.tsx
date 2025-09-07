"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Header with back button */}
      <div className="bg-base-100 shadow-sm">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link
            href="/settings"
            className="flex items-center gap-3 text-base-content hover:text-primary transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">
            About
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* App Icon and Name */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/tasbihfy_logo.jpeg"
              alt="Tasbihfy Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-base-content mb-2">
              Tasbihfy
            </h2>
            <p className="text-base-content/70">
              The Complete Islamic Companion
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 space-y-4">
          <h3 className="text-xl font-semibold text-base-content mb-4">
            Our Story
          </h3>

          <div className="space-y-4 text-base-content/80 leading-relaxed">
            <p>
              Tasbihfy was born from a simple request from a friend whose father
              needed a fast and simple app to count his daily dhikr. What
              started as a basic counting tool soon grew into something much
              more meaningful.
            </p>

            <p>
              We realized we had an opportunity to create more than just a
              counter. Why not build a comprehensive Islamic app that could
              benefit Muslims worldwide? We wanted to make dhikr counting
              effortless while also helping Muslims connect with the Quran and
              learn new duas.
            </p>

            <p>
              Our goal became clear: create a source of continuous good deeds
              (hasanat) - both for us as developers and for every user who
              benefits from the app. Every counted dhikr, every verse read, and
              every dua learned through Tasbihfy becomes a means of earning
              reward from Allah.
            </p>

            <p>
              Today, Tasbihfy serves Muslims of all ages and backgrounds, making
              it easier to maintain spiritual practices while providing tools to
              deepen understanding of Islamic teachings. It's more than an app -
              it's our humble contribution to helping the Ummah stay connected
              to Allah.
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 space-y-4">
          <h3 className="text-xl font-semibold text-base-content mb-4">
            Our Philosophy
          </h3>

          <div className="space-y-3 text-base-content/80">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p>
                <strong>Easy Dhikr Counting:</strong> Make tasbih counting
                simple and accessible for everyone.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p>
                <strong>Quran Understanding:</strong> Help Muslims connect with
                and understand the Quran's teachings.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p>
                <strong>Dua Learning:</strong> Provide a comprehensive
                collection of duas for daily life.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p>
                <strong>Continuous Reward:</strong> Build a tool that generates
                ongoing hasanat for users and developers.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p>
                <strong>Privacy Focused:</strong> Your spiritual practice is
                personal - we don't track or sell your data.
              </p>
            </div>
          </div>
        </div>

        {/* Gratitude Section */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-base-content">
              With Gratitude
            </h3>
            <p className="text-base-content/80 italic">
              "And whoever is grateful is grateful for [the benefit of]
              himself." - Quran 31:12
            </p>
            <p className="text-base-content/70 text-sm">
              May Allah accept our efforts and make this tool a means of benefit
              for the Ummah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
