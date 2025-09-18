import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/auth/*", // Protect authentication endpoints
          "/api/dhikrs/*", // Private user data
          "/api/sessions/*", // Private session data
          "/api/notifications/*", // Private notification data
          "/offline", // Offline page not useful for crawlers
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/auth/*",
          "/api/dhikrs/*",
          "/api/sessions/*",
          "/api/notifications/*",
          "/offline",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}