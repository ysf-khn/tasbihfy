"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

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
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">About</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* App Icon and Name */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-primary-content text-3xl font-bold">ت</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-base-content mb-2">Tasbihfy</h2>
            <p className="text-base-content/70">Digital Tasbih for Modern Muslims</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 space-y-4">
          <h3 className="text-xl font-semibold text-base-content mb-4">Our Story</h3>
          
          <div className="space-y-4 text-base-content/80 leading-relaxed">
            <p>
              Tasbihfy began with a simple but heartfelt request. A dear friend approached me about creating something special for his father - an elderly man who was deeply committed to his daily dhikr but struggled with traditional tasbih beads due to arthritis in his hands.
            </p>
            
            <p>
              "Could you make something digital?" he asked. "Something that would make it easier for my father to continue his spiritual practice without the physical strain."
            </p>
            
            <p>
              What started as a weekend project quickly became something much more meaningful. I watched as this simple app transformed not just my friend's father's daily routine, but also touched the lives of many others in our community who faced similar challenges.
            </p>
            
            <p>
              This is why Tasbihfy remains purposefully simple. In a world of complex apps with countless features, we believe that the most powerful tools are often the most straightforward ones. Every design decision has been made with one question in mind: "Will this help someone focus on their remembrance of Allah?"
            </p>
            
            <p>
              From that first conversation to today, our mission remains unchanged: to provide a beautiful, accessible, and distraction-free way for Muslims everywhere to maintain their spiritual practice, regardless of age, ability, or circumstance.
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 space-y-4">
          <h3 className="text-xl font-semibold text-base-content mb-4">Our Philosophy</h3>
          
          <div className="space-y-3 text-base-content/80">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p><strong>Simplicity First:</strong> No unnecessary features, just what you need for meaningful dhikr.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p><strong>Accessibility:</strong> Designed for users of all ages and abilities.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p><strong>Privacy:</strong> Your spiritual practice is personal - we don't track or sell your data.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
              <p><strong>Offline First:</strong> Works perfectly without an internet connection.</p>
            </div>
          </div>
        </div>

        {/* Gratitude Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-base-content">With Gratitude</h3>
            <p className="text-base-content/80 italic">
              "And whoever is grateful is grateful for [the benefit of] himself." - Quran 31:12
            </p>
            <p className="text-base-content/70 text-sm">
              May Allah accept our efforts and make this tool a means of benefit for the Ummah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}