"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { startFirstLogin, sendLoginOtp } from "@/features/auth/actions/first-login";
import {
  signInWithMagicLink,
  signInWithGoogle,
} from "@/features/auth/services";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { formatErrorMessage, REASON_MESSAGES } from "@/lib/utils";

export type LoginMode = "password" | "magic";
export type FieldErrors = Partial<Record<"email" | "password", string>>;

export function useLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const startOtpFlow = async () => {
    const firstLogin = await startFirstLogin(email);

    if (!firstLogin.ok) {
      toast(
        firstLogin.code === "password_required"
          ? "This account uses a password. Please enter it."
          : formatErrorMessage(firstLogin.message),
        "error"
      );
      return;
    }

    if (firstLogin.otp) console.log(`[OTP] ${firstLogin.otp}`);
    toast("Verification code sent. Check your inbox.", "success");
    router.push("/verify-otp");
  };

  const submitPassword = async () => {
    if (!password) {
      await startOtpFlow();
      return;
    }

    const result = await sendLoginOtp(email, password);

    if (!result.ok) {
      const firstLogin = await startFirstLogin(email);
      if (firstLogin.ok) {
        if (firstLogin.otp) console.log(`[OTP] ${firstLogin.otp}`);
        toast("Verification code sent. Check your inbox.", "success");
        router.push("/verify-otp");
      } else {
        toast(result.message, "error");
      }
      return;
    }

    if (result.otp) console.log(`[OTP] ${result.otp}`);
    toast("Verification code sent. Check your inbox.", "success");
    router.push("/verify-otp?type=login");
  };

  const submitMagicLink = async () => {
    const result = await signInWithMagicLink(email);

    if (!result.ok) {
      toast(formatErrorMessage(REASON_MESSAGES[result.reason]), "error");
      return;
    }

    toast("Magic link sent. Check your inbox.", "success");
    setSent(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errs[field]) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      toast(parsed.error.issues[0]?.message ?? "Invalid input.", "error");
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      if (mode === "password") {
        await submitPassword();
      } else {
        await submitMagicLink();
      }
    } catch (e) {
      toast(formatErrorMessage(e instanceof Error ? e.message : null), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle("/org-picker");
    } catch {
      toast(formatErrorMessage(null, "Could not sign in with Google."), "error");
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    email,
    setEmail: (v: string) => { setEmail(v); setFieldErrors((p) => ({ ...p, email: undefined })); },
    password,
    setPassword: (v: string) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: undefined })); },
    loading,
    sent,
    fieldErrors,
    handleSubmit,
    handleGoogle,
  };
}