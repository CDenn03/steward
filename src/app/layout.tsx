import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: "Steward — Financial Governance Platform",
  description: "Trusted stewardship platform for faith-based organizations and nonprofits",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const theme = headersList.get("x-theme") ?? "light";

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <body className={theme === "dark" ? "bg-gray-950 text-gray-100" : ""}>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
