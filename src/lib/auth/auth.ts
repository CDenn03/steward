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
        console.log("[CRED-authorize] called", JSON.stringify({ email: credentials?.email }));
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) {
          console.log("[CRED-authorize] validation fail");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        console.log("[CRED-authorize] user found:", !!user, user?.id);
        if (!user?.password) {
          console.log("[CRED-authorize] no password hash");
          return null;
        }

        const valid = await compare(parsed.data.password, user.password);
        console.log("[CRED-authorize] password valid:", valid);
        if (!valid) return null;

        console.log("[CRED-authorize] SUCCESS user:", user.id);
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    Credentials({
      id: "otp",
      name: "OTP",
      async authorize(credentials) {
        console.log("[OTP-authorize] called", JSON.stringify({ email: credentials?.email }));
        const parsed = z
          .object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/) })
          .safeParse(credentials);
        if (!parsed.success) {
          console.log("[OTP-authorize] validation fail");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.otp || !user?.otpExpiry || user.otpExpiry < new Date()) {
          console.log("[OTP-authorize] no valid OTP found");
          return null;
        }

        const valid = await compare(parsed.data.otp, user.otp);
        if (!valid) {
          console.log("[OTP-authorize] OTP mismatch");
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { otp: null, otpExpiry: null },
        });

        console.log("[OTP-authorize] SUCCESS user:", user.id);
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
    async jwt({ token, user, account, trigger, session }) {
      console.log("[JWT]", JSON.stringify({
        trigger, hasUser: !!user,
        subBefore: token.sub, subAfter: user?.id ?? token.sub,
        iat: token.iat, exp: token.exp,
        now: Math.floor(Date.now()/1000),
        expired: token.exp ? Date.now()/1000 > token.exp : false,
      }));
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      console.log("[SESSION]", JSON.stringify({
        hasToken: !!token, sub: token.sub,
        exp: token.exp,
        now: Date.now(),
        expired: token.exp ? Date.now()/1000 > token.exp : "no-exp",
        sessionUserId: session.user?.id,
        tokenSub: token.sub,
      }));
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  session: { strategy: "jwt" },
  logger: {
    error(error) {
      console.error("[AUTH_ERROR]", error);
    },
    warn(code) {
      console.warn("[AUTH_WARN]", code);
    },
    debug(code, metadata) {
      console.log("[AUTH_DEBUG]", code, JSON.stringify(metadata));
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
