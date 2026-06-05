import type { Metadata } from "next";
import "./globals.css";
import { OrgProvider } from "@/lib/org/context";

export const metadata: Metadata = {
  title: "Steward — Financial Governance Platform",
  description: "Trusted stewardship platform for faith-based organizations and nonprofits",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OrgProvider>{children}</OrgProvider>
      </body>
    </html>
  );
}
