-- CreateTable
CREATE TABLE "public"."ReminderPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT NOT NULL DEFAULT '09:00',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "pushSubscription" JSONB,
    "lastReminderSent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReminderPreferences_userId_key" ON "public"."ReminderPreferences"("userId");

-- CreateIndex
CREATE INDEX "ReminderPreferences_userId_idx" ON "public"."ReminderPreferences"("userId");

-- AddForeignKey
ALTER TABLE "public"."ReminderPreferences" ADD CONSTRAINT "ReminderPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
