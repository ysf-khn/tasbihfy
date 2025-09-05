import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://verses.quran.foundation https://www.googletagmanager.com https://www.google-analytics.com; media-src 'self' https://verses.quran.foundation; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'",
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://verses.quran.foundation https://www.googletagmanager.com https://www.google-analytics.com; media-src 'self' https://verses.quran.foundation; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
