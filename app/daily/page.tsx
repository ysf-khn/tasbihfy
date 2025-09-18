import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata-utils";
import DailyClient from "./DailyClient";

export const metadata: Metadata = pageMetadata.daily();

export default function DailyPage() {
  return <DailyClient />;
}