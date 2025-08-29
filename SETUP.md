# Dhikr App Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git

## Setup Steps

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd dhikr
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database named `dhikr_db`
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/dhikr_db"
   BETTER_AUTH_SECRET="your-secret-key-here"  # Generate a secure random string
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

### 3. Initialize Database

```bash
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

✅ **Authentication** - Email/password login with Better Auth
✅ **Dhikr Management** - Create, edit, delete dhikr phrases  
✅ **Smart Counter** - Large tap area with haptic feedback
✅ **Session Tracking** - Auto-save progress every 5 seconds
✅ **Progress Tracking** - Visual progress ring and completion status
✅ **PWA Support** - Install as app, works offline
✅ **Theme Support** - 21 DaisyUI themes available
✅ **Completion Celebration** - Confetti animation on target reached
✅ **Mobile Optimized** - Touch-friendly, responsive design

## PWA Icons

Place your PWA icons in `/public/icons/` with these sizes:
- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Production Deployment

1. Set up your PostgreSQL database
2. Update environment variables for production
3. Build the app: `npm run build`
4. Start production server: `npm start`

The app includes service worker caching for offline functionality.

## Development

- **Database changes**: Run `npx prisma db push` after schema updates
- **Type generation**: Prisma types auto-generate on database push
- **Hot reload**: Turbopack enabled for fast development

## Tech Stack

- **Frontend**: Next.js 15.5.2 with App Router
- **UI**: DaisyUI + Tailwind CSS  
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better Auth with session management
- **PWA**: next-pwa with workbox
- **Animations**: canvas-confetti
- **TypeScript**: Full type safety