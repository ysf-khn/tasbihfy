import { Metadata } from "next";
import { parseDhikrSlug } from "@/lib/url-utils";
import DhikrClient from "./DhikrClient";

// Common dhikr types for static generation
const commonDhikrTypes = [
  "subhanallah-33-times",
  "alhamdulillah-33-times",
  "allahu-akbar-34-times",
  "la-illaha-illa-allah",
  "astaghfirullah",
  "bismillah",
  "la-hawla-wa-la-quwwata-illa-billah",
  "subhan-allah-wa-bihamdihi",
  "subhan-allah-al-azeem",
  "allahu-akbar-100-times",
];

// Generate metadata for each dhikr type
export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const { name, count } = parseDhikrSlug(type);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const pageUrl = `${baseUrl}/dhikr/${type}`;

  const dhikrName = name.charAt(0).toUpperCase() + name.slice(1);
  const title = count
    ? `${dhikrName} ${count} Times - Digital Dhikr Counter | Tasbihfy`
    : `${dhikrName} - Digital Dhikr Counter | Tasbihfy`;

  const description = count
    ? `Count ${dhikrName} ${count} times with our digital tasbih counter. Track your dhikr progress with haptic feedback and daily goals.`
    : `Count ${dhikrName} with our digital tasbih counter. Track your dhikr progress with haptic feedback and daily goals.`;

  return {
    title,
    description,
    keywords: [
      "dhikr",
      "tasbih",
      "digital counter",
      "islamic remembrance",
      "tasbeeh",
      name.replace(/-/g, " "),
      "muslim prayer",
      "spiritual practice",
      "daily dhikr",
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${dhikrName} Counter - Tasbihfy`,
      description,
      url: pageUrl,
      type: "website",
      siteName: "Tasbihfy",
      images: [
        {
          url: `${baseUrl}/icons/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: "Tasbihfy - Digital Dhikr Counter",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${dhikrName} Counter`,
      description,
      images: [`${baseUrl}/icons/icon-512x512.png`],
    },
  };
}

// Generate static params for common dhikr types
export async function generateStaticParams() {
  return commonDhikrTypes.map((type) => ({
    type,
  }));
}

export default function DhikrPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  return <DhikrClient params={params} />;
}