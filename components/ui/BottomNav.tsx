"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  CalendarIcon as CalendarIconSolid,
  ClockIcon as ClockIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  SparklesIcon as SparklesIconSolid,
  EllipsisHorizontalIcon as EllipsisHorizontalIconSolid,
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: "Dhikr",
      path: "/dhikr",
      icon: SparklesIcon,
      activeIcon: SparklesIconSolid,
    },
    {
      name: "Prayer",
      path: "/prayer-times",
      icon: ClockIcon,
      activeIcon: ClockIconSolid,
    },
    {
      name: "Quran",
      path: "/quran",
      icon: BookOpenIcon,
      activeIcon: BookOpenIconSolid,
    },
    {
      name: "More",
      path: "/more",
      icon: EllipsisHorizontalIcon,
      activeIcon: EllipsisHorizontalIconSolid,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-base-100 border-t border-base-200 shadow-2xl">
      <div className="flex justify-around items-center py-3 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = active ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                active
                  ? "text-primary bg-primary/10"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
