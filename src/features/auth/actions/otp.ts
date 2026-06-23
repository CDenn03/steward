import { createHmac, timingSafeEqual } from "crypto";

export const OTP_EMAIL_COOKIE = "steward_otp_email";

const OTP_TTL_MS = 10 * 60 * 1000;

function getSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-first-login-secret";
}

function signOtpEmail(email: string, expiresAt: number) {
  return createHmac("sha256", getSecret()).update(`otp:${email}.${expiresAt}`).digest("hex");
}

export function buildOtpEmailCookie(email: string, devOtp?: string) {
  const expiresAt = Date.now() + OTP_TTL_MS;
  const otp = devOtp ?? "";
  return `${email}.${otp}.${expiresAt}.${signOtpEmail(email, expiresAt)}`;
}

export function readOtpEmailCookie(value?: string) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length < 4) return null;
  const signature = parts.pop()!;
  const expiresAtRaw = parts.pop()!;
  const otp = parts.pop()!;
  const email = parts.join(".");
  const expiresAt = Number(expiresAtRaw);
  if (!email || !expiresAt || !signature || Date.now() > expiresAt) return null;
  const expected = signOtpEmail(email, expiresAt);
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) return null;
  return { email, devOtp: otp || undefined };
}
