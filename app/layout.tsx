import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import LayoutClient from "@/components/layout/LayoutClient";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic-naskh",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-arabic-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tasbihfy",
    template: "%s | Dhikr",
  },
  description:
    "Count your dhikr with a beautiful tasbih. Track your spiritual practice with customizable dhikr phrases and progress tracking.",
  keywords: [
    "dhikr",
    "tasbih",
    "islamic",
    "muslim",
    "prayer",
    "remembrance",
    "spiritual",
    "counter",
    "pwa",
  ],
  authors: [{ name: "Tasbihfy App Team" }],
  creator: "Tasbihfy App",
  publisher: "Tasbihfy App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Tasbihfy",
    title: "Tasbihfy",
    description:
      "Count your dhikr with a beautiful, offline-capable digital tasbih",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Tasbihfy App Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Tasbihfy",
    description:
      "Count your dhikr with a beautiful, offline-capable digital tasbih",
    images: ["/icons/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tasbihfy",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/icon-512x512.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/icon-512x512.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  verification: {
    // Add verification meta tags if needed for search engines
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
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Dhikr",
    "application-name": "Dhikr",
    "msapplication-TileColor": "#570df8",
    "msapplication-TileImage": "/icons/icon-144x144.png",
    "msapplication-tap-highlight": "no",
    "theme-color": "#570df8",
  },
};

export const viewport: Viewport = {
  themeColor: "#570df8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolageGrotesque.variable} ${notoNaskhArabic.variable} ${notoNastaliqUrdu.variable} antialiased`}
      >
        <Providers>
          <ServiceWorkerRegistration />
          <LayoutClient>
            {children}
          </LayoutClient>
          <OfflineIndicator />
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
