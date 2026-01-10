# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Tasbihfy** - a comprehensive Islamic PWA featuring dhikr counting, Quran reading, prayer times, and daily reminders. It allows Muslims to count dhikr (remembrance of Allah), read Quran with audio, track prayer times, and receive daily spiritual reminders. App is deployed on CF Workers.

## Tech Stack

- **Frontend**: Next.js 15.5.2 with App Router and TypeScript
- **UI Framework**: DaisyUI 5.1.7 + Tailwind CSS 4.1.12
- **Authentication**: Better Auth 1.3.7
- **Database**: PostgreSQL with supabase
- **Icons**: Heroicons, Lucide React
- **Fonts**: Bricolage Grotesque (main), Noto Naskh Arabic, Noto Nastaliq Urdu
- **Utils**: clsx, tailwind-merge, class-variance-authority
- **Additional**: canvas-confetti, html-to-image, vaul (drawer), web-push
- **Validation**: Zod 4.1.4 for schema validation

## Development Commands

```bash
# Start development server
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start
```

## Architecture Overview

### Application Structure

The app uses Next.js App Router with route groups for organization:

**Route Structure:**

- `app/page.tsx` - Main dhikr counter page (accepts `?dhikr=id` param)
- `app/(auth)/` - Authentication pages (login, register) with separate layout
- `app/quran/` - Quran reader with surah pages and audio playback
- `app/duas/` - Duas collection with chapters and favorites
- `app/prayer/` - Prayer times with location-based calculations
- `app/daily/` - Daily progress tracking and analytics
- `app/settings/` - User preferences and notifications
- `app/api/auth/[...all]/` - Better Auth endpoint
- `app/api/dhikrs/` - Dhikr CRUD operations
- `app/api/sessions/` - Session tracking with offline sync
- `app/api/quran/` - Quran data, verses, audio, translations, tafsirs
- `app/api/prayer-times/` - Prayer time calculations and caching
- `app/api/notifications/` - Push notification system
- `app/api/cron/` - Scheduled tasks for reminders

**Key Architecture Patterns:**

- Route groups for layout separation (`(auth)`)
- Layout-based navigation with PWA components in `app/layout.tsx`
- Query parameter routing for counter state (`/?dhikr=123`)
- API routes with Supabase integration and caching strategies
- Offline-first architecture with localStorage and database sync
- Progressive Web App with service worker and manifest

### Database Schema

Implemented with Supabase + PostgreSQL:

**Authentication (Better Auth managed):**

- **User**: Core user data (id, name, email, emailVerified, image, timestamps)
- **Account**: OAuth and email/password accounts (accountId, providerId, userId, tokens)
- **Session**: User sessions (userId, token, expiresAt, ipAddress, userAgent)
- **verification**: Email verification tokens

**Dhikr & Progress Tracking:**

- **Dhikr**: User dhikr phrases (id, userId, name, targetCount, isFavorite, arabicText, transliteration)
- **DhikrSession**: Active counting sessions (dhikrId, userId, currentCount, completed, startedAt)
- **DailyProgress**: Daily dhikr tracking (userId, dhikrId, date, targetCount, currentCount, completed)

**Prayer Times & Location:**

- **PrayerLocation**: User's saved location (userId, name, latitude, longitude, timezone, country)
- **PrayerTimeCache**: Cached prayer times (locationQuery, date, fajr, dhuhr, asr, maghrib, isha, qibla)

**Notifications:**

- **ReminderPreferences**: Push notification settings (userId, reminderEnabled, reminderTime, timezone, pushSubscription)

### Key Components & Architecture

**Core Components:**

- `DhikrCounter` (`components/counter/`): Main counting interface with progress ring, haptic feedback
- `DhikrList/DhikrCard` (`components/dhikr/`): Dhikr management with CRUD operations
- `QuranReader` (`components/quran/`): Surah reading with audio playback and settings
- `PrayerTimes` (`components/prayer/`): Location-based prayer time calculations
- `AuthProvider` (`components/auth/`): Better Auth React context wrapper

**PWA Components:**

- `InstallPrompt`, `OfflineIndicator`, `ServiceWorkerRegistration`, `UpdateNotification` (`components/pwa/`)
- `LayoutClient` (`components/layout/`): Client-side navigation and theme management

**Critical Hooks:**

- `useSessionTracking` (`hooks/`): Complex offline-first counting state with auto-save
- `useQuranData`, `useQuranAudio`, `useQuranSettings` (`hooks/`): Quran reading functionality
- `useNotifications` (`hooks/`): Push notification management
- `useArabicSettings`, `useTranslationPreferences` (`hooks/`): Text display preferences

**Data Management:**

- `GuestStorage` (`lib/guestStorage.ts`): Offline storage for unauthenticated users
- `localStorage-cleanup` (`lib/`): Storage management and cleanup utilities
- Quran API integration (`lib/quran/`) with caching and token management

## Configuration Notes

### Styling Setup

- **Tailwind CSS**: v4 with `@import` and `@plugin` syntax in `app/globals.css`
- **DaisyUI**: v5.1.7 with semantic color system (avoid hardcoded colors, NO gradients)
- **Fonts**: Bricolage Grotesque (primary), Noto Naskh Arabic, Noto Nastaliq Urdu
- **PostCSS**: Minimal config with `@tailwindcss/postcss` plugin

### Authentication Configuration

- **Better Auth**: v1.3.7
- **Features**: Email/password + Google OAuth, 7-day sessions, no email verification
- **Client**: React hooks in `lib/auth-client.ts` (signIn, signUp, signOut, useSession)
- **Environment Variables**: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, Google OAuth keys

### Security & Performance

- **CSP Headers**: Configured in `next.config.ts` for security
- **Service Worker**: Custom SW with caching strategies
- **Bundle Optimization**: Turbopack for dev/build, tree-shaking
- **Import Aliases**: `@/*` maps to root directory

### State Management Architecture

- **Offline-First**: `useSessionTracking` manages complex counting state with localStorage
- **Guest Support**: `GuestStorage` for unauthenticated users with session persistence
- **Auto-save Strategy**: Saves on visibility changes, beforeunload, component unmount
- **Conflict Resolution**: Timestamp comparison between localStorage and database
- **Real-time Sync**: Background sync when connectivity returns

## Key Implementation Considerations

1. **Mobile-First Design**: Large touch targets, haptic feedback (Navigator.vibrate)
2. **Offline-First Architecture**: localStorage instant saves, background database sync
3. **Multi-Language Support**: Arabic/Urdu fonts, RTL text support, transliteration
4. **Progressive Web App**: Service worker, offline pages, installable
5. **Performance**: Component lazy loading, API caching, optimized images
6. **Audio Integration**: Quran recitation with multiple reciters and playback controls
7. **Location Services**: Geolocation for prayer times with fallback to manual entry
8. **Push Notifications**: Web Push API for daily reminders with timezone support

### Useful Scripts

- `scripts/deploy.sh` - Production deployment script for Hetzner VPS
- `scripts/generate-icons.js` - PWA icon generation
- `scripts/parse-hisn.ts` - Dhikr data parsing utilities

### Environment & Deployment

- **Production**: Deployed on Hetzner VPS with PostgreSQL
- **CI/CD**: GitHub Actions integration (see `CICD_SETUP.md`)
- **Domain**: Cloudflare-protected with SSL/HTTPS
- **Documentation**: `DEPLOYMENT.md` contains complete deployment guide

## Project Status

Fully functional Islamic PWA with:

- ✅ **Core Features**: Dhikr counting with offline support
- ✅ **Authentication**: Better Auth with Google OAuth + email/password
- ✅ **Database**: Complete Supabase DB schema with all models
- ✅ **Quran Integration**: Full Quran with audio, translations, tafsirs
- ✅ **Prayer Times**: Location-based calculations with caching
- ✅ **Daily Tracking**: Progress analytics and reminders
- ✅ **PWA Features**: Service worker, offline support, installable
- ✅ **Push Notifications**: Daily reminders with timezone support
- ✅ **Mobile Optimization**: Touch-friendly UI with haptic feedback

## Style Guidelines

- **NO gradients** in the app design
- **Use DaisyUI semantic colors** - avoid hardcoded color values
- **Mobile-first approach** with large touch targets
- **Arabic/RTL text support** where applicable
- **Consistent component patterns** following existing codebase conventions
