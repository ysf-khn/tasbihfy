# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Dhikr counting app** - a Progressive Web App (PWA) that allows Muslims to count dhikr (remembrance of Allah) with features like saved dhikr phrases, progress tracking, and offline support.

## Tech Stack

- **Frontend**: Next.js 15.5.2 with App Router and TypeScript
- **UI Framework**: DaisyUI 5.0.54 + Tailwind CSS 4.1.12
- **Authentication**: Better Auth 1.3.7 with Prisma adapter
- **Database**: PostgreSQL with Prisma ORM
- **PWA**: next-pwa 5.6.0 (configured)
- **Animations**: canvas-confetti 1.9.3 for completion celebrations
- **Validation**: Zod 4.1.4 for schema validation

## Development Commands

```bash
# Start development server with Turbopack
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
- `app/page.tsx` - Main counter page (accepts `?dhikr=id` param)
- `app/(auth)/` - Authentication pages (login, register)
- `app/api/auth/[...all]/route.ts` - Better Auth endpoint
- `app/api/dhikrs/` - Dhikr CRUD API routes
- `app/api/sessions/` - Session tracking API routes

**Key Architecture Patterns:**
- Route groups for layout separation (`(auth)`)
- Layout-based navigation in `app/layout.tsx`
- Query parameter routing for counter state (`/?dhikr=123`)
- API routes following RESTful patterns with Prisma integration

### Database Schema
Implemented with Prisma + PostgreSQL:
- **User**: Better Auth managed (id, name, email, emailVerified, image, timestamps)
- **Account**: Better Auth accounts (id, accountId, providerId, userId, password)
- **Session**: Better Auth sessions (id, userId, token, expiresAt, ipAddress, userAgent)
- **Dhikr**: User dhikr phrases (id, userId, name, targetCount, timestamps)
- **DhikrSession**: Counting sessions (id, dhikrId, userId, currentCount, completed, startedAt, completedAt)

### Key Components
- `DhikrCounter` (`components/counter/`): Main counting interface with progress ring and haptic feedback
- `DhikrList/DhikrCard` (`components/dhikr/`): Dhikr management with CRUD operations
- `CreateDhikrModal`: Modal for creating/editing dhikrs
- `AuthProvider` (`components/auth/`): Better Auth React context
- `Confetti` (`components/ui/`): Canvas confetti celebrations
- `useSessionTracking` (`hooks/`): Complex state management for offline-first counting

## Configuration Notes

### Styling Setup
- **Tailwind CSS**: Uses v4 with new `@import` and `@plugin` syntax in `app/globals.css`
- **DaisyUI**: Configured with all themes available (`themes: all`) in globals.css
- **Fonts**: Bricolage Grotesque as primary font (configured in globals.css)

### Authentication Configuration
- **Better Auth**: Configured with PostgreSQL Prisma adapter in `lib/auth.ts`
- **Client**: React client created in `lib/auth-client.ts` with hooks (signIn, signUp, signOut, useSession)
- **Session Management**: 7-day expiry with daily updates, no email verification required
- **Environment Variables**: Requires `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`

### Import Aliases
- `@/*` maps to root directory (configured in `tsconfig.json`)

### State Management Architecture
- **Session Tracking**: `useSessionTracking` hook manages complex offline-first counting
- **Local Storage**: Instant saves for offline persistence with conflict resolution
- **Auto-save Strategy**: Saves on page visibility changes, beforeunload, and component unmount
- **Conflict Resolution**: Compares timestamps between localStorage and database to determine newest count

## Key Implementation Considerations

1. **Mobile-First Design**: Large touch targets, haptic feedback via Navigator.vibrate()
2. **Offline-First Architecture**: localStorage for instant saves, database sync on connectivity
3. **Navigation Patterns**: Query parameter routing (`/?dhikr=123`), back navigation via Link components
4. **Performance**: DaisyUI components, Turbopack for dev/build, minimal bundle size
5. **Session Management**: Complex offline/online state reconciliation in `useSessionTracking`
6. **Data Integrity**: Auto-save on critical events (visibility change, beforeunload, unmount)

## Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Apply database migrations
npx prisma migrate dev

# Reset database (development)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## Project Status

Fully functional dhikr counting app with:
- ✅ Authentication (Better Auth + Prisma)
- ✅ Database schema with all models
- ✅ Main counter interface with offline support
- ✅ Dhikr management (CRUD operations)
- ✅ Session tracking and persistence
- ✅ Mobile-optimized UI with haptic feedback
- ✅ Confetti animations on completion
- 🔄 PWA features (next-pwa installed but not fully configured)

The PRD document (`dhikr_prd.txt`) contains the original implementation plan and feature specifications.


- DO NOT USE GRADIENTS IN THE APP
- Do NOT hardcode colors, use daisy ui semantic color system