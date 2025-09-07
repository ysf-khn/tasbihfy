"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import BottomNav from "@/components/ui/BottomNav";
import { LocalStorageCleanup } from "@/lib/localStorage-cleanup";

interface LayoutClientProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  
  // Hide bottom nav on auth pages
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  
  // Run localStorage cleanup on app initialization
  useEffect(() => {
    // Only run once on mount
    const cleanup = () => {
      console.log('Running localStorage cleanup on app initialization...');
      const results = LocalStorageCleanup.runFullCleanup();
      
      // Check quota usage and warn if high
      const quotaInfo = LocalStorageCleanup.checkQuotaUsage();
      if (quotaInfo.isNearLimit) {
        console.warn(`localStorage usage is high: ${quotaInfo.usagePercent}%`);
      }
      
      console.log('App initialization cleanup completed:', results);
    };
    
    // Run cleanup after a short delay to not block initial render
    const timer = setTimeout(cleanup, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <div className={isAuthPage ? "" : "pb-20"}>
        {children}
      </div>
      {!isAuthPage && <BottomNav />}
    </>
  );
}