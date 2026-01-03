"use client";

import Link from "next/link";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import {
  DocumentTextIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  UserIcon,
  ChartBarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// Features organized by category
const features = [
  {
    category: "Daily Worship",
    items: [
      {
        title: "Duas",
        description: "Daily supplications collection",
        href: "/duas",
        icon: DocumentTextIcon,
        color: "text-info",
        bgColor: "bg-info/10",
      },
      {
        title: "99 Names of Allah",
        description: "Allah's beautiful names",
        href: "/99-names",
        icon: HeartIcon,
        color: "text-error",
        bgColor: "bg-error/10",
      },
      {
        title: "Morning Adhkar",
        description: "Start your day right",
        href: "/morning-adhkar",
        icon: SunIcon,
        color: "text-warning",
        bgColor: "bg-warning/10",
      },
      {
        title: "Evening Adhkar",
        description: "End your day peacefully",
        href: "/evening-adhkar",
        icon: MoonIcon,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Ayatul Kursi",
        description: "The throne verse",
        href: "/ayatul-kursi",
        icon: BookOpenIcon,
        color: "text-accent",
        bgColor: "bg-accent/10",
      },
      {
        title: "Durood Shareef",
        description: "Blessings upon the Prophet",
        href: "/durood-shareef",
        icon: HeartIcon,
        color: "text-secondary",
        bgColor: "bg-secondary/10",
      },
    ],
  },
  {
    category: "Progress & Analytics",
    items: [
      {
        title: "Daily Progress",
        description: "Track your spiritual journey",
        href: "/daily",
        icon: ChartBarIcon,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
    ],
  },
  {
    category: "Settings & Account",
    items: [
      {
        title: "Settings",
        description: "App preferences & notifications",
        href: "/settings",
        icon: Cog6ToothIcon,
        color: "text-base-content",
        bgColor: "bg-base-content/10",
      },
      {
        title: "About",
        description: "Learn more about Tasbihfy",
        href: "/about",
        icon: InformationCircleIcon,
        color: "text-info",
        bgColor: "bg-info/10",
      },
    ],
  },
];

// Coming soon features
const comingSoon = [
  {
    title: "Hadith Collection",
    description: "Authentic sayings of Prophet Muhammad ﷺ",
    icon: BookOpenIcon,
  },
  {
    title: "Raheeq Al Makhtum",
    description: "The Sealed Nectar - Biography of Prophet ﷺ",
    icon: UserIcon,
  },
  {
    title: "Islamic Calendar",
    description: "Important dates and events",
    icon: CalendarDaysIcon,
  },
];

export default function MorePage() {
  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader showSignIn={true} />

      <div className="p-4 sm:p-6 space-y-6 pb-24">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
            More Features
          </h1>
          <p className="text-base-content/70">
            Explore all the Islamic tools and resources
          </p>
        </div>

        {/* Feature Categories */}
        {features.map((category) => (
          <div key={category.category} className="space-y-4">
            <h2 className="text-xl font-bold text-base-content">
              {category.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                      <div className="card-body">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${item.bgColor}`}>
                            <IconComponent className={`w-6 h-6 ${item.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-base-content/70 text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Coming Soon Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-base-content">
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comingSoon.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="card bg-base-100 shadow-lg opacity-60 cursor-not-allowed"
                >
                  <div className="card-body">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-base-content/10">
                        <IconComponent className="w-6 h-6 text-base-content/50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {item.title}
                          <span className="badge badge-outline badge-sm">
                            Soon
                          </span>
                        </h3>
                        <p className="text-base-content/70 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="card bg-primary/5 border border-primary/20">
          <div className="card-body text-center">
            <h3 className="font-bold text-lg">Have a suggestion?</h3>
            <p className="text-base-content/70">
              We'd love to hear what Islamic features you'd like to see next.
            </p>
            <div className="card-actions justify-center mt-4">
              <Link href="/about" className="btn btn-primary btn-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}