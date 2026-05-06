import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "~/env";
import { getAdminAccess } from "~/server/auth/access";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
        id: string;
        role?: "OWNER" | "ADMIN" | "VIEWER";
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

const providers =
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? [
        GoogleProvider({
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : [];

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers,
  adapter: PrismaAdapter(db),
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      const isVerifiedGoogleEmail = profile?.email_verified === true;

      if (!email || !isVerifiedGoogleEmail) {
        return false;
      }

      const admin = await getAdminAccess(email);

      return admin?.isActive === true;
    },
    async session({ session, user }) {
      const admin = await getAdminAccess(user.email);

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: admin?.role,
        },
      };
    },
  },
} satisfies NextAuthConfig;
