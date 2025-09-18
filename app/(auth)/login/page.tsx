import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata-utils";
import LoginClient from "./LoginClient";

export const metadata: Metadata = pageMetadata.login();

export default function LoginPage() {
  return <LoginClient />;
}