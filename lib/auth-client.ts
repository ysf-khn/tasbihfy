import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

// No baseURL: the auth API is same-origin, so the client uses the current
// origin — immune to whatever NEXT_PUBLIC_APP_URL was at build time
export const authClient = createAuthClient({});

export const { signIn, signUp, signOut, useSession } = authClient;
