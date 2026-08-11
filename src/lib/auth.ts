// src/lib/auth.ts
// Auth.js v5 configuration. Sessions are JWT-based and carry { id, role, fullName }
// so every server component/route can read the current user without a DB round trip
// (permission checks still re-verify isActive against the DB on sensitive routes —
// see requirePermission() in src/lib/session.ts).

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import { logActivity } from "./activity-log";
import { loginSchema } from "./validation/auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      fullName: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: Role;
    fullName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    fullName: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hour session — sensible for a school day
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        // Deliberately generic failure path (no "user not found" vs "wrong password"
        // distinction) to avoid account enumeration.
        if (!user || !user.isActive) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        await logActivity({
          userId: user.id,
          action: "USER_LOGIN",
          entityType: "User",
          entityId: user.id,
        });

        return { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.fullName = token.fullName;
      return session;
    },
  },
});
