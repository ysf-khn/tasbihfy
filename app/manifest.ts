import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tasbihfy",
    short_name: "Tasbihfy",
    description:
      "Count your dhikr with a beautiful, offline-capable digital tasbih. Track your spiritual practice with customizable dhikr phrases and progress tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#57c5b6",
    orientation: "portrait-primary",
    categories: ["lifestyle", "spirituality", "productivity"],
    lang: "en",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Dhikr counter on desktop",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Dhikr counter on mobile",
      },
    ],
    shortcuts: [
      {
        name: "New Dhikr Session",
        short_name: "New Session",
        description: "Start a new dhikr counting session",
        url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "My Dhikrs",
        short_name: "My Dhikrs",
        description: "View and manage your saved dhikr phrases",
        url: "/dhikrs",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
