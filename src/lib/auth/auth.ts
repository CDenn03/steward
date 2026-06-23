import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const valid = await compare(parsed.data.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    Credentials({
      id: "otp",
      name: "OTP",
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.otp || !user?.otpExpiry || user.otpExpiry < new Date()) return null;

        const valid = await compare(parsed.data.otp, user.otp);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { otp: null, otpExpiry: null },
        });

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: "noreply@steward.app",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  session: { strategy: "jwt" },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
