# Tasbihfy

A comprehensive Islamic PWA for dhikr counting, Quran reading, prayer times, and daily spiritual reminders.

## Features

- **Dhikr Counter** - Count dhikr with haptic feedback, progress tracking, and offline support
- **Quran Reader** - Full Quran with audio recitation, translations, and tafsirs
- **Prayer Times** - Location-based prayer time calculations with Qibla direction
- **Daily Progress** - Track your daily dhikr goals and view analytics
- **Push Notifications** - Customizable daily reminders with timezone support
- **Offline-First** - Works without internet, syncs when back online
- **PWA** - Installable on mobile and desktop

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: DaisyUI + Tailwind CSS
- **Database**: PostgreSQL
- **Auth**: Better Auth with Google OAuth and email/password

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Clone the repository

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Configure the following:

   - `DATABASE_URL` - PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Random secret for auth
   - `BETTER_AUTH_URL` - Your app URL
   - Google OAuth credentials (optional)

4. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```
