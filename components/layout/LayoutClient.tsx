"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";

interface LayoutClientProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  
  // Hide bottom nav on auth pages
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  
  return (
    <>
      <div className={isAuthPage ? "" : "pb-20"}>
        {children}
      </div>
      {!isAuthPage && <BottomNav />}
    </>
  );
}