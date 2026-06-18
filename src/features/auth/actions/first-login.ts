"use server";

import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const emailSchema = z.string().email();
const otpSchema = z.string().regex(/^\d{6}$/);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");

const OTP_TTL_MS = 10 * 60 * 1000;
const SET_PASSWORD_TTL_MS = 10 * 60 * 1000;
const COOKIE_NAME = "steward_first_login";

type ActionResult =
  | { ok: true; message?: string; otp?: string; email?: string }
  | { ok: false; code?: "password_required"; message: string };

function getSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-first-login-secret";
}

function signToken(userId: string, expiresAt: number) {
  return createHmac("sha256", getSecret()).update(`${userId}.${expiresAt}`).digest("hex");
}

function buildToken(userId: string) {
  const expiresAt = Date.now() + SET_PASSWORD_TTL_MS;
  return `${userId}.${expiresAt}.${signToken(userId, expiresAt)}`;
}

function readToken(value?: string) {
  if (!value) return null;

  const [userId, expiresAtRaw, signature] = value.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!userId || !expiresAt || !signature || Date.now() > expiresAt) return null;

  const expected = signToken(userId, expiresAt);
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  return { userId };
}

export async function startFirstLogin(email: string): Promise<ActionResult> {
  const parsedEmail = emailSchema.safeParse(email.trim().toLowerCase());
  if (!parsedEmail.success) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsedEmail.data },
    select: { id: true, password: true },
  });

  if (!user) {
    return { ok: false, message: "We could not find an account for that email." };
  }

  if (user.password) {
    return { ok: false, code: "password_required", message: "Use your password to sign in." };
  }

  const otp = String(randomInt(100000, 1000000));
  const otpHash = await hash(otp, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: otpHash,
      otpExpiry: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return {
    ok: true,
    message: "Verification code generated.",
    otp: process.env.NODE_ENV === "production" ? undefined : otp,
  };
}

export async function verifyFirstLoginOtp(email: string, otp: string): Promise<ActionResult> {
  const parsedEmail = emailSchema.safeParse(email.trim().toLowerCase());
  const parsedOtp = otpSchema.safeParse(otp.trim());

  if (!parsedEmail.success || !parsedOtp.success) {
    return { ok: false, message: "Enter the 6-digit verification code." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsedEmail.data },
    select: { id: true, password: true, otp: true, otpExpiry: true },
  });

  if (!user || user.password || !user.otp || !user.otpExpiry) {
    return { ok: false, message: "Request a new verification code." };
  }

  if (user.otpExpiry.getTime() < Date.now()) {
    return { ok: false, message: "That verification code has expired." };
  }

  const valid = await compare(parsedOtp.data, user.otp);
  if (!valid) {
    return { ok: false, message: "Invalid verification code." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, buildToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SET_PASSWORD_TTL_MS / 1000,
    path: "/",
  });

  return { ok: true, message: "Verification code accepted." };
}

export async function setFirstLoginPassword(
  password: string,
  confirmPassword: string
): Promise<ActionResult> {
  const parsedPassword = passwordSchema.safeParse(password);
  if (!parsedPassword.success) {
    return { ok: false, message: parsedPassword.error.errors[0]?.message ?? "Invalid password." };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: "Passwords do not match." };
  }

  const cookieStore = await cookies();
  const token = readToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!token) {
    return { ok: false, message: "Verify your one-time code before setting a password." };
  }

  const user = await prisma.user.findUnique({
    where: { id: token.userId },
    select: { id: true, email: true, password: true },
  });

  if (!user || user.password) {
    cookieStore.delete(COOKIE_NAME);
    return { ok: false, message: "This password setup link is no longer valid." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hash(password, 10),
      otp: null,
      otpExpiry: null,
    },
  });

  cookieStore.delete(COOKIE_NAME);
  return { ok: true, message: "Password set. You are signed in.", email: user.email };
}
