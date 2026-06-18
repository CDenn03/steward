"use server";

import { cookies } from "next/headers";

export async function setActiveOrgCookie(orgSlug: string) {
  const cookieStore = await cookies();
  cookieStore.set("org_slug", orgSlug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}
