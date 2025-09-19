// Service Worker configuration with automatic versioning
export const SW_VERSION = `v${Date.now()}` // Auto-generated version based on build time

// Cache names with versioning
export const CACHE_NAMES = {
  STATIC: `static-${SW_VERSION}`,
  RUNTIME: `runtime-${SW_VERSION}`,
  API: `api-${SW_VERSION}`,
  IMAGES: `images-${SW_VERSION}`,
  QURAN_AUDIO: `quran-audio-${SW_VERSION}`,
} as const

// Cache expiration times (in seconds)
export const CACHE_EXPIRATION = {
  API: 5 * 60, // 5 minutes for API responses
  RUNTIME: 24 * 60 * 60, // 1 day for runtime assets
  IMAGES: 7 * 24 * 60 * 60, // 1 week for images
  QURAN_AUDIO: 30 * 24 * 60 * 60, // 30 days for audio files
} as const

// Maximum cache sizes (in number of entries)
export const MAX_CACHE_SIZE = {
  API: 50,
  RUNTIME: 100,
  IMAGES: 50,
  QURAN_AUDIO: 114, // Max surahs
} as const

// Essential routes to cache on install
export const PRECACHE_ROUTES = [
  '/',
  '/dhikrs',
  '/quran',
  '/duas',
  '/prayer',
  '/settings',
  '/daily',
] as const

// Static assets to cache immediately
export const STATIC_ASSETS = [
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
] as const

// API endpoints that should use stale-while-revalidate
export const SWR_APIS = [
  '/api/dhikrs',
  '/api/duas',
  '/api/quran/chapters',
  '/api/prayer-times',
] as const

// Network timeout for different request types (in milliseconds)
export const NETWORK_TIMEOUTS = {
  API: 3000,
  PAGE: 5000,
  ASSET: 10000,
} as const