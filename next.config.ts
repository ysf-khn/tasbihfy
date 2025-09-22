import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },

  // No longer need rewrites since we have an explicit route handler for /sw.js
  // async rewrites() {
  //   return [
  //     {
  //       source: '/sw.js',
  //       destination: '/api/service-worker',
  //     },
  //   ];
  // },

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
            value: "default-src 'self'; img-src 'self' data: blob:; connect-src 'self' data: blob: https://verses.quran.foundation https://www.googletagmanager.com https://www.google-analytics.com; media-src 'self' https://verses.quran.foundation; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'",
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
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: blob:; connect-src 'self' data: blob: https://verses.quran.foundation https://www.googletagmanager.com https://www.google-analytics.com; media-src 'self' https://verses.quran.foundation; script-src 'self'",
          },
        ],
      },
      // Headers for dynamic service worker endpoint
      {
        source: '/api/service-worker',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Performance headers
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(.+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
