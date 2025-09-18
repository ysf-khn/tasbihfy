import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata-utils";
import AboutClient from "./AboutClient";

export const metadata: Metadata = pageMetadata.about();

export default function AboutPage() {
  return <AboutClient />;
}