import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '@/components/ui/Toast';

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Steward — Financial Governance Platform",
  description: "Trusted stewardship platform for faith-based organizations and nonprofits",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const theme = headersList.get("x-theme") ?? "light";

  return (
    <html lang="en" className={`${theme === "dark" ? "dark" : ""} ${fraunces.variable} ${inter.variable}`}>
      <body>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
