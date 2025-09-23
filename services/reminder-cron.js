// Daily reminder cron service (JavaScript version for production)
// Sends push notifications to users at their preferred time

const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const webpush = require("web-push");

// Initialize Prisma
const db = new PrismaClient();

// VAPID configuration
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_EMAIL || "mailto:yusufmohd72@gmail.com",
};

// Initialize web-push with VAPID details
let vapidConfigured = false;

function ensureVapidConfigured() {
  if (!vapidConfigured) {
    if (!vapidDetails.publicKey || !vapidDetails.privateKey) {
      throw new Error(
        "VAPID keys are required. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables."
      );
    }

    webpush.setVapidDetails(
      vapidDetails.subject,
      vapidDetails.publicKey,
      vapidDetails.privateKey
    );
    vapidConfigured = true;
    console.log("✅ VAPID configured successfully");
  }
}

// Random ayah service (simplified for production)
async function getRandomAyah() {
  try {
    const config = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-auth-token": process.env.QURAN_API_AUTH_TOKEN || "",
        "x-client-id": process.env.QURAN_API_CLIENT_ID || "",
      },
    };

    // Use translation ID 20 for English (Saheeh International)
    const url =
      "/api/quran/verses/random?translations=20&language=en&words=false";

    const response = await fetch(`http://localhost:3000${url}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.verse ||
      !data.verse.translations ||
      data.verse.translations.length === 0
    ) {
      throw new Error("No translation found in the response");
    }

    const verse = data.verse;
    const translation = verse.translations[0];

    return {
      verseKey: verse.verse_key,
      arabicText: verse.text_uthmani,
      translation: translation.text,
      chapterId: verse.chapter_id,
      verseNumber: verse.verse_number,
      translationSource: translation.resource_name,
      title: `Daily Ayah: ${verse.verse_key}`,
      body: translation.text,
    };
  } catch (error) {
    console.error("❌ Failed to fetch random ayah:", error);

    // Fallback ayah
    return {
      verseKey: "2:255",
      arabicText: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
      translation:
        "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.",
      chapterId: 2,
      verseNumber: 255,
      translationSource: "The Clear Quran",
      title: "Daily Ayah: 2:255",
      body: "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.",
    };
  }
}

// Timezone helper functions
function getCurrentTimeInTimezone(timezone) {
  try {
    const now = new Date();
    const options = {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return now.toLocaleTimeString("en-US", options);
  } catch (error) {
    console.error(`❌ Invalid timezone: ${timezone}`, error);
    return new Date().toTimeString().slice(0, 5); // Fallback to UTC
  }
}

function isTimeMatch(currentTime, reminderTime) {
  return currentTime === reminderTime;
}

function isToday(date) {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Send push notification
async function sendPushNotification(subscription, payload) {
  try {
    ensureVapidConfigured();

    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log("✅ Push notification sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to send push notification:", error);

    // Handle specific web-push errors
    if (error.statusCode === 410) {
      console.log("⚠️ Push subscription expired or invalid");
      return false; // Subscription should be removed from database
    }

    return false;
  }
}

// Send ayah notification to a user
async function sendAyahNotification(subscription, ayah) {
  const payload = {
    title: ayah.title,
    body: ayah.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "daily-ayah",
    data: {
      type: "daily-ayah",
      verseKey: ayah.verseKey,
      chapterId: ayah.chapterId,
      verseNumber: ayah.verseNumber,
      url: `/quran/${ayah.chapterId}?verse=${ayah.verseNumber}`,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "read-more",
        title: "Read More",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/icon-192x192.png",
      },
    ],
    vibrate: [200, 100, 200], // Gentle vibration pattern
  };

  return sendPushNotification(subscription, payload);
}

// Get users who should receive reminders at current time
async function getUsersForReminder() {
  try {
    console.log("🔍 Checking for users who need daily reminders...");

    // Get all users with reminder preferences enabled
    const reminderPreferences = await db.reminderPreferences.findMany({
      where: {
        reminderEnabled: true,
        pushSubscription: { not: null },
      },
      select: {
        userId: true,
        reminderTime: true,
        timezone: true,
        pushSubscription: true,
        lastReminderSent: true,
      },
    });

    if (reminderPreferences.length === 0) {
      console.log("ℹ️ No users with reminder preferences found");
      return [];
    }

    console.log(
      `📱 Found ${reminderPreferences.length} users with reminders enabled`
    );

    // Filter users who should receive reminder now
    const eligibleUsers = [];

    for (const pref of reminderPreferences) {
      // Skip if reminder already sent today
      if (isToday(pref.lastReminderSent)) {
        console.log(
          `⏩ Skipping user ${pref.userId}: reminder already sent today`
        );
        continue;
      }

      // Check if current time matches user's reminder time in their timezone
      const currentTimeInUserTz = getCurrentTimeInTimezone(pref.timezone);

      if (isTimeMatch(currentTimeInUserTz, pref.reminderTime)) {
        // Validate push subscription
        if (
          pref.pushSubscription &&
          typeof pref.pushSubscription.endpoint === "string" &&
          pref.pushSubscription.keys &&
          typeof pref.pushSubscription.keys.p256dh === "string" &&
          typeof pref.pushSubscription.keys.auth === "string"
        ) {
          eligibleUsers.push({
            userId: pref.userId,
            pushSubscription: pref.pushSubscription,
            timezone: pref.timezone,
            reminderTime: pref.reminderTime,
          });
          console.log(
            `✅ User ${pref.userId} eligible for reminder (${pref.reminderTime} in ${pref.timezone})`
          );
        } else {
          console.log(`⚠️ User ${pref.userId} has invalid push subscription`);
        }
      }
    }

    console.log(
      `🎯 Found ${eligibleUsers.length} users eligible for reminders right now`
    );
    return eligibleUsers;
  } catch (error) {
    console.error("❌ Error getting users for reminder:", error);
    return [];
  }
}

// Send daily reminders to eligible users
async function sendDailyReminders() {
  try {
    console.log("📅 Starting daily reminder process...");

    const eligibleUsers = await getUsersForReminder();

    if (eligibleUsers.length === 0) {
      console.log("ℹ️ No users eligible for reminders at this time");
      return;
    }

    // Get random ayah for today's reminders
    const ayah = await getRandomAyah();
    console.log(
      `📖 Using ayah: ${ayah.verseKey} - "${ayah.translation.substring(
        0,
        50
      )}..."`
    );

    let successful = 0;
    let failed = 0;
    const expiredUserIds = [];

    // Send notifications to each user
    for (const user of eligibleUsers) {
      try {
        const success = await sendAyahNotification(user.pushSubscription, ayah);
        if (success) {
          successful++;
        } else {
          failed++;
          expiredUserIds.push(user.userId);
        }

        // Add small delay between notifications to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `❌ Failed to send notification to user ${user.userId}:`,
          error
        );
        failed++;
        expiredUserIds.push(user.userId);
      }
    }

    console.log(`📊 Reminder results: ${successful} sent, ${failed} failed`);

    // Update lastReminderSent for successful notifications
    const successfulUserIds = eligibleUsers
      .filter((user) => !expiredUserIds.includes(user.userId))
      .map((user) => user.userId);

    if (successfulUserIds.length > 0) {
      await db.reminderPreferences.updateMany({
        where: { userId: { in: successfulUserIds } },
        data: { lastReminderSent: new Date() },
      });
      console.log(
        `✅ Updated lastReminderSent for ${successfulUserIds.length} users`
      );
    }

    // Handle expired subscriptions
    if (expiredUserIds.length > 0) {
      console.log(
        `🧹 Cleaning up ${expiredUserIds.length} expired subscriptions`
      );

      await db.reminderPreferences.updateMany({
        where: { userId: { in: expiredUserIds } },
        data: {
          pushSubscription: null,
          reminderEnabled: false,
        },
      });

      console.log(
        `✅ Cleaned up expired subscriptions for ${expiredUserIds.length} users`
      );
    }

    console.log("🎉 Daily reminder process completed successfully");
  } catch (error) {
    console.error("❌ Error in daily reminder process:", error);
  }
}

// Initialize and start the cron job
function startReminderCron() {
  console.log("🚀 Starting daily reminder cron service...");

  // Run every 5 minutes to check for reminders
  // Format: "minute hour day month day-of-week"
  const cronPattern = "*/5 * * * *"; // Every 5 minutes

  const task = cron.schedule(
    cronPattern,
    async () => {
      console.log(`⏰ Cron job triggered at ${new Date().toISOString()}`);
      await sendDailyReminders();
    },
    {
      scheduled: false, // Don't start immediately
      timezone: "UTC", // Run cron in UTC, handle timezones in logic
    }
  );

  // Start the cron job
  task.start();

  console.log(`✅ Daily reminder cron started with pattern: ${cronPattern}`);
  console.log("🔄 Checking for reminders every 5 minutes");

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("🛑 Stopping reminder cron service...");
    task.stop();
    db.$disconnect();
    console.log("✅ Reminder cron service stopped");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("🛑 Stopping reminder cron service...");
    task.stop();
    db.$disconnect();
    console.log("✅ Reminder cron service stopped");
    process.exit(0);
  });
}

// If this file is run directly, start the cron service
if (require.main === module) {
  console.log("📢 Daily Reminder Cron Service");
  console.log("==============================");
  startReminderCron();
}

module.exports = {
  startReminderCron,
  sendDailyReminders,
};
