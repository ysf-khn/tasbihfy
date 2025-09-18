import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata-utils";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = pageMetadata.settings();

export default function SettingsPage() {
  return <SettingsClient />;
}