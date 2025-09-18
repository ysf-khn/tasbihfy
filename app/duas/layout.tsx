import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata-utils";

export const metadata: Metadata = pageMetadata.duas();

export default function DuasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}