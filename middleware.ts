import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if user has session token
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  // Debug logging
  if (pathname.startsWith("/api/auth")) {
    console.log(`[Middleware] API Auth request: ${request.method} ${pathname}`);
  }

  // Public paths that don't require authentication
  const publicPaths = [
    "/login",
    "/register",
    "/",
    "/prayer-times",
    "/quran",
    "/duas",
    "/settings",
  ];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // Protected paths that require authentication
  const protectedPaths: string[] = [];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // API routes and auth routes are handled elsewhere
  if (pathname.startsWith("/api/")) {
    console.log(`[Middleware] Allowing API route: ${pathname}`);
    return NextResponse.next();
  }

  // If no session and trying to access protected route, redirect to login
  if (!sessionToken && isProtectedPath) {
    console.log(
      `[Middleware] No session, redirecting protected route ${pathname} to /login`
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If has session and trying to access auth pages, redirect to home
  if (
    sessionToken &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    console.log(
      `[Middleware] Has session, redirecting auth page ${pathname} to /`
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|manifest.webmanifest).*)",
  ],
};
