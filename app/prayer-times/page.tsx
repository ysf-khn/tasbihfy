import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata-utils";
import PrayerClient from "./PrayerClient";

export const metadata: Metadata = pageMetadata.prayer();

export default function PrayerTimesPage() {
  return <PrayerClient />;
}