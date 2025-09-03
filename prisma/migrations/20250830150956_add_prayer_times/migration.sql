-- CreateTable
CREATE TABLE "public"."PrayerLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "timezone" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrayerTimeCache" (
    "id" TEXT NOT NULL,
    "locationQuery" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "fajr" TEXT NOT NULL,
    "shurooq" TEXT NOT NULL,
    "dhuhr" TEXT NOT NULL,
    "asr" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "isha" TEXT NOT NULL,
    "qiblaDirection" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "timezone" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "temperature" TEXT,
    "pressure" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerTimeCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLocation_userId_key" ON "public"."PrayerLocation"("userId");

-- CreateIndex
CREATE INDEX "PrayerLocation_userId_idx" ON "public"."PrayerLocation"("userId");

-- CreateIndex
CREATE INDEX "PrayerTimeCache_date_idx" ON "public"."PrayerTimeCache"("date");

-- CreateIndex
CREATE INDEX "PrayerTimeCache_locationQuery_idx" ON "public"."PrayerTimeCache"("locationQuery");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTimeCache_locationQuery_date_key" ON "public"."PrayerTimeCache"("locationQuery", "date");

-- AddForeignKey
ALTER TABLE "public"."PrayerLocation" ADD CONSTRAINT "PrayerLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
