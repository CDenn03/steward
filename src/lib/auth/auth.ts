/**
 * Auth.js v5 configuration
 *
 * Setup:
 *   npm install next-auth@beta @auth/prisma-adapter
 *
 * Then uncomment the code below and configure your providers.
 */

// import NextAuth, { type NextAuthConfig } from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/prisma/client";
// import Google from "next-auth/providers/google";
// import Resend from "next-auth/providers/resend";

// export const authConfig: NextAuthConfig = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     Resend({
//       apiKey: process.env.AUTH_RESEND_KEY!,
//       from: "noreply@steward.app",
//     }),
//   ],
//   pages: {
//     signIn: "/login",
//     error: "/login",
//     verifyRequest: "/verify",
//   },
//   callbacks: {
//     async session({ session, token }) {
//       if (token.sub) session.user.id = token.sub;
//       return session;
//     },
//     async jwt({ token, user }) {
//       if (user) token.sub = user.id;
//       return token;
//     },
//   },
//   session: { strategy: "jwt" },
// };

// export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

export const authConfig = {} as const;
