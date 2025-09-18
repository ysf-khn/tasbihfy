import { Metadata } from "next";

// Base URL for the application
export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
};

// Default Open Graph image
export const getDefaultOGImage = () => {
  const baseUrl = getBaseUrl();
  return {
    url: `${baseUrl}/icons/icon-512x512.png`,
    width: 512,
    height: 512,
    alt: "Tasbihfy - Islamic Companion App",
  };
};

// Default Twitter card configuration
export const getDefaultTwitterCard = () => ({
  card: "summary_large_image" as const,
  site: "@tasbihfy",
  creator: "@tasbihfy",
  images: [`${getBaseUrl()}/icons/icon-512x512.png`],
});

// Base metadata configuration that all pages extend
export const getBaseMetadata = (): Partial<Metadata> => {
  const baseUrl = getBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    category: "Lifestyle",
    classification: "Islamic App",
    keywords: [
      "islamic",
      "islam",
      "muslim",
      "dhikr",
      "tasbih",
      "quran",
      "prayer",
      "duas",
      "spiritual",
      "meditation",
      "faith",
      "religion",
      "arabic",
      "worship",
      "devotion",
    ],
    authors: [{ name: "Tasbihfy Team" }],
    creator: "Tasbihfy",
    publisher: "Tasbihfy",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      // Add verification meta tags if needed for search engines
    },
    icons: {
      icon: [
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Tasbihfy",
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "application-name": "Tasbihfy",
      "msapplication-TileColor": "#57c5b6",
      "msapplication-TileImage": "/icons/icon-144x144.png",
      "theme-color": "#57c5b6",
    },
  };
};

// Create page-specific metadata
interface PageMetadataConfig {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  ogImageAlt?: string;
}

export const createPageMetadata = (config: PageMetadataConfig): Metadata => {
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${config.path}`;
  const baseMetadata = getBaseMetadata();

  return {
    ...baseMetadata,
    title: config.title,
    description: config.description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      type: config.type || "website",
      locale: "en_US",
      url: fullUrl,
      siteName: "Tasbihfy",
      title: config.title,
      description: config.description,
      images: [
        {
          ...getDefaultOGImage(),
          alt: config.ogImageAlt || "Tasbihfy - Islamic Companion App",
        },
      ],
      ...(config.type === "article" && {
        publishedTime: config.publishedTime,
        modifiedTime: config.modifiedTime,
        section: config.section,
        tags: config.tags,
        authors: ["Tasbihfy Team"],
      }),
    },
    twitter: {
      ...getDefaultTwitterCard(),
      title: config.title,
      description: config.description,
      images: [
        {
          url: `${baseUrl}/icons/icon-512x512.png`,
          alt: config.ogImageAlt || "Tasbihfy - Islamic Companion App",
        },
      ],
    },
  };
};

// Pre-configured metadata for common pages
export const pageMetadata = {
  home: (): Metadata =>
    createPageMetadata({
      title: "Tasbihfy - Digital Dhikr Counter & Islamic Companion App",
      description:
        "Count your daily dhikr with our digital tasbih counter. Access Quran, prayer times, and 250+ authentic duas. Start your spiritual journey today!",
      path: "/",
      ogImageAlt: "Tasbihfy - Digital Dhikr Counter and Islamic Companion App",
    }),

  prayer: (): Metadata =>
    createPageMetadata({
      title: "Prayer Times & Qibla Direction | Tasbihfy Islamic App",
      description:
        "Get accurate prayer times for your location with Qibla compass. Never miss a prayer with notifications. Check your prayer times now!",
      path: "/prayer-times",
      ogImageAlt: "Prayer Times and Qibla Direction - Tasbihfy",
    }),

  daily: (): Metadata =>
    createPageMetadata({
      title: "Daily Dhikr Progress Tracker | Tasbihfy",
      description:
        "Track your dhikr progress with detailed analytics. Set daily goals and build consistent spiritual habits. View your progress today!",
      path: "/daily",
      ogImageAlt: "Daily Dhikr Progress Tracker - Tasbihfy",
    }),

  about: (): Metadata =>
    createPageMetadata({
      title: "About Tasbihfy - Your Complete Islamic Companion",
      description:
        "Learn about Tasbihfy's mission to help Muslims worldwide with dhikr counting, Quran reading, and daily duas. Join our community!",
      path: "/about",
      type: "article",
      section: "About",
      ogImageAlt: "About Tasbihfy - Islamic Companion App",
    }),

  settings: (): Metadata =>
    createPageMetadata({
      title: "Settings & Preferences | Tasbihfy App",
      description:
        "Customize your Tasbihfy experience. Set reminders, adjust Arabic text size, and manage your preferences. Personalize now!",
      path: "/settings",
      ogImageAlt: "Settings and Preferences - Tasbihfy",
    }),

  login: (): Metadata =>
    createPageMetadata({
      title: "Sign In to Tasbihfy - Sync Your Dhikr Across Devices",
      description:
        "Access your dhikr history and sync across all devices. Continue your spiritual journey seamlessly. Sign in now!",
      path: "/login",
      ogImageAlt: "Sign In to Tasbihfy",
    }),

  register: (): Metadata =>
    createPageMetadata({
      title: "Join Tasbihfy - Free Islamic Dhikr & Quran App",
      description:
        "Create your free account to save dhikr progress, bookmark Quran verses, and get prayer reminders. Join today!",
      path: "/register",
      ogImageAlt: "Join Tasbihfy - Islamic Companion App",
    }),

  duas: (): Metadata =>
    createPageMetadata({
      title: "Hisnul Muslim Duas Collection - 128 Chapters | Tasbihfy",
      description:
        "Browse 128 chapters of authentic Islamic duas from Hisnul Muslim. Arabic text with translation and audio. Find your daily duas!",
      path: "/duas",
      type: "article",
      section: "Islamic Duas",
      tags: ["duas", "hisnul muslim", "islamic prayers", "supplication"],
      ogImageAlt: "Hisnul Muslim Duas Collection - Tasbihfy",
    }),
};
