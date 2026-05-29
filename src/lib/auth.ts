import "server-only";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? (token.id as string | undefined) ?? token.sub;

      if (user) {
        token.id = userId;
        token.teamId = user.teamId ?? null;
        token.role = user.role ?? "MEMBER";
      } else if (userId) {
        token.id = userId;

        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            role: true,
            teamId: true,
          },
        });

        if (dbUser) {
          token.teamId = dbUser.teamId;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.teamId = (token.teamId as string) ?? null;
        session.user.role = (token.role as "ADMIN" | "MEMBER") ?? "MEMBER";
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.image = (token.picture as string) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
