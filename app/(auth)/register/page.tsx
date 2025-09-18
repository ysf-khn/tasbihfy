import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata-utils";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = pageMetadata.register();

export default function RegisterPage() {
  return <RegisterClient />;
}