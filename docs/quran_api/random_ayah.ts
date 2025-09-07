// Perfect! I can see this is exactly what you need for your PWA push notification service. The Quran Foundation API has a random ayah endpoint that's ideal for your use case. Let me break down how you can implement this:

// API Endpoint Details
// URL: https://apis-prelive.quran.foundation/content/api/v4/verses/random

// Method: GET

// Required Headers:

// x-auth-token: Your JWT access token
// x-client-id: Your client ID
// Key Parameters for Push Notifications
// For your push notification service, you'll want to focus on these query parameters:

// translations: Comma-separated IDs of translations to load for each ayah
// language: Language to fetch translation in (default: "en")
// words: Set to "false" to exclude word-by-word translation and keep response lightweight
// Implementation for PWA Push Notifications
// Here's how you can structure this for your push notification service:

// Example API call for push notifications
const getRandomAyahForNotification = async () => {
  const config = {
    method: "get",
    url: "https://apis-prelive.quran.foundation/content/api/v4/verses/random",
    headers: {
      Accept: "application/json",
      "x-auth-token": "YOUR_AUTH_TOKEN",
      "x-client-id": "YOUR_CLIENT_ID",
    },
    params: {
      translations: "131", // Popular English translation ID
      language: "en",
      words: "false", // Keep response lightweight
    },
  };
  //@ts-ignore
  const response = await axios(config);
  return response.data;
};

// Extract translation for notification
const createNotificationContent = (apiResponse: any) => {
  const verse = apiResponse.verse;
  const translation = verse.translations[0]; // First translation

  return {
    title: `Ayah ${verse.verse_key}`,
    body: translation.text,
    // Optional: include chapter info
    tag: verse.verse_key,
    data: {
      verseKey: verse.verse_key,
      chapterId: verse.chapter_id,
    },
  };
};
// Benefits of This Endpoint for Push Notifications
// Perfect for notifications: Returns just one random ayah each time
// Translation-focused: You can get just the translation text without Arabic text
// Lightweight: Set words=false to minimize payload
// Flexible: Can filter by chapter, juz, page, etc. if needed
// Rich metadata: Includes verse reference (like "2:255") for the notification title
// The response will give you everything you need - the translation text for the notification body, and verse reference details for the title and metadata.
