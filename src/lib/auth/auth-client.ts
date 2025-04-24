import { createAuthClient } from "better-auth/react";
import { env } from "~/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  endpoints: {
    signOut: "/api/auth/signout"
  }
});

export const {
  signIn,
  signOut,
  signUp,
  useSession
} = authClient;

export type Session = typeof authClient.$Infer.Session;

