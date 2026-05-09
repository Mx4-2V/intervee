import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { env } from "~/env";
import { getAdminAccess, getUserAccess } from "~/server/auth/access";
import { verifyPassword } from "~/server/auth/password";
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
        role?: "OWNER" | "ADMIN" | "USER";
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

const providers = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Contrasena", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      const access = await getUserAccess(parsed.data.email);

      if (!access?.isActive) {
        return null;
      }

      const user = await db.user.findUnique({
        where: { email: parsed.data.email },
      });

      if (!user?.passwordHash) {
        return null;
      }

      if (!verifyPassword(parsed.data.password, user.passwordHash)) {
        return null;
      }

      return user;
    },
  }),
  ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? [
        GoogleProvider({
          allowDangerousEmailAccountLinking: true,
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),
];

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers,
  adapter: PrismaAdapter(db),
  pages: {
    error: "/",
    signIn: "/",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      const email = user.email?.toLowerCase() ?? profile?.email?.toLowerCase();

      if (!email) {
        return false;
      }

      if (account?.provider === "google" && profile?.email_verified !== true) {
        return false;
      }

      const access = await getUserAccess(email);

      return access?.isActive === true;
    },
    async session({ session, user }) {
      const admin = await getAdminAccess(user.email);

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: admin?.role ?? "USER",
        },
      };
    },
  },
} satisfies NextAuthConfig;
