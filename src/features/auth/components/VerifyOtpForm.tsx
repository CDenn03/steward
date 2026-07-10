"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, KeyRound, RotateCcw } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  startFirstLogin,
  verifyFirstLoginOtp,
  resendLoginOtp,
} from "@/features/auth/actions/first-login";

export function VerifyOtpForm({ initialEmail, devOtp: initialDevOtp, otpType }: { initialEmail: string; devOtp?: string; otpType?: "login" }) {
  const router = useRouter();
  const { toast } = useToast();
  const isLogin = otpType === "login";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(initialDevOtp);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    if (isLogin) {
      console.log("[VERIFY] calling signIn('otp', ...)", { email, otpLen: otp.length });
      const result = await signIn("otp", { email, otp, redirect: false });
      console.log("[VERIFY] signIn result:", {
        ok: !result?.error,
        error: result?.error,
        status: result?.status,
        url: result?.url,
      });
      console.log("[VERIFY] cookies after signIn:", document.cookie);
      setLoading(false);

      if (result?.error) {
        setError("Invalid or expired verification code.");
        return;
      }

      toast("Signed in successfully.", "success");
      router.push("/org-picker");
      return;
    }

    const res = await verifyFirstLoginOtp(email, otp);
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    toast(res.message ?? "Code verified.", "success");
    router.push("/set-password");
  };

  const handleResend = async () => {
    setError("");
    setResending(true);

    const res = isLogin ? await resendLoginOtp(email) : await startFirstLogin(email);
    setResending(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    if (res.otp) setDevOtp(res.otp);
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 bg-(--primary) rounded-[10px] flex items-center justify-center">
          <KeyRound size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[17px] font-semibold tracking-tight">Steward</p>
          <p className="text-[11px] text-(--muted) uppercase tracking-[0.5px]">{isLogin ? "Two-factor" : "First login"}</p>
        </div>
      </div>

      <div className="bg-(--surface) border border-(--border) rounded-(--r-dialog) p-7">
        <h1 className="text-[18px] font-semibold mb-1">Verify your account</h1>
        <p className="text-[14px] text-(--muted) mb-6">
          {isLogin ? "Enter the one-time code sent to your email." : "Enter the one-time code for your first sign-in."}
        </p>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-medium mb-1.5">One-time code</label>
            <div className="relative">
              <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="000000"
                className="w-full pl-8 pr-3 py-2.5 text-[14px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-[13px] text-danger">{error}</p>}

          {devOtp && (
            <p className="text-[13px] font-mono text-center text-(--muted) bg-(--bg) border border-(--border) rounded-(--r-input) px-3 py-2 select-all">
              Dev OTP: {devOtp}
            </p>
          )}

          <Button className="w-full justify-center" onClick={handleVerify} loading={loading}>
            <ArrowRight size={13} /> Continue
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center"
            onClick={handleResend}
            loading={resending}
          >
            <RotateCcw size={13} /> Resend code
          </Button>
        </div>
      </div>

      <p className="text-center text-[13px] text-(--muted) mt-5">
        <Link href="/login" className="text-(--primary) hover:underline font-medium">Back to sign in</Link>
      </p>
    </div>
  );
}
