"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, KeyRound, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  startFirstLogin,
  verifyFirstLoginOtp,
} from "@/features/auth/actions/first-login";

export function VerifyOtpForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setLoading(true);

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

    const res = await startFirstLogin(email);
    setResending(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    if (res.otp) toast(`Development OTP: ${res.otp}`, "info");
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 bg-[var(--primary)] rounded-[10px] flex items-center justify-center">
          <KeyRound size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[17px] font-semibold tracking-tight">Steward</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.5px]">First login</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-dialog)] p-7">
        <h1 className="text-[18px] font-semibold mb-1">Verify your account</h1>
        <p className="text-[13px] text-[var(--muted)] mb-6">Enter the one-time code for your first sign-in.</p>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.org"
                className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">One-time code</label>
            <div className="relative">
              <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="000000"
                className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-[12px] text-danger">{error}</p>}

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

      <p className="text-center text-[12px] text-[var(--muted)] mt-5">
        <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">Back to sign in</Link>
      </p>
    </div>
  );
}
