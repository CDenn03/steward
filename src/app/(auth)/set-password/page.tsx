"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setFirstLoginPassword } from "@/features/auth/actions/first-login";

export default function SetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const res = await setFirstLoginPassword(password, confirmPassword);
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    toast(res.message ?? "Password set.", "success");
    if (res.email) {
      const signInRes = await signIn("credentials", {
        email: res.email,
        password,
        redirect: false,
      });

      if (!signInRes?.error) {
        router.push("/org-picker");
        return;
      }
    }

    router.push("/login");
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 bg-[var(--primary)] rounded-[10px] flex items-center justify-center">
          <Lock size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[17px] font-semibold tracking-tight">Steward</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.5px]">Secure access</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-dialog)] p-7">
        <h1 className="text-[18px] font-semibold mb-1">Set your password</h1>
        <p className="text-[13px] text-[var(--muted)] mb-6">Create a password to finish your first sign-in.</p>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-8 pr-9 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Confirm password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type={showPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Repeat password"
                className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-[12px] text-danger">{error}</p>}

          <Button className="w-full justify-center" onClick={handleSubmit} loading={loading}>
            <ArrowRight size={13} /> Save password
          </Button>
        </div>
      </div>

      <p className="text-center text-[12px] text-[var(--muted)] mt-5">
        <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">Back to sign in</Link>
      </p>
    </div>
  );
}
