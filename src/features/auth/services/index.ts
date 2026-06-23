import { signIn } from "next-auth/react";

export type SignInResult =
  | { ok: true }
  | { ok: false; reason: "invalid_credentials" | "magic_link_failed" | "unknown" };

export async function signInWithCredentials(
  email: string,
  password: string
): Promise<SignInResult> {
  const res = await signIn("credentials", { email, password, redirect: false });

  if (res?.error) {
    return { ok: false, reason: "invalid_credentials" };
  }
  return { ok: true };
}

export async function signInWithMagicLink(email: string): Promise<SignInResult> {
  const res = await signIn("resend", { email, redirect: false });

  if (res?.error) {
    return { ok: false, reason: "magic_link_failed" };
  }
  return { ok: true };
}

export async function signInWithGoogle(callbackUrl: string): Promise<void> {
  await signIn("google", { callbackUrl });
}