"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword]   = useState(false);
  const [mode, setMode]                   = useState<"password" | "magic">("password");
  const [loading, setLoading]             = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    // After login, always go to org picker so the user selects their context
    router.push("/org-picker");
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 bg-[var(--primary)] rounded-[10px] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div>
          <p className="text-[17px] font-semibold tracking-tight">Steward</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.5px]">Financial Governance</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-dialog)] p-7">
        <h1 className="text-[18px] font-semibold mb-1">Welcome back</h1>
        <p className="text-[13px] text-[var(--muted)] mb-6">Sign in with your email to continue</p>

        {/* Mode toggle */}
        <div className="flex rounded-[var(--r-btn)] border border-[var(--border)] overflow-hidden mb-5 text-[12px]">
          {(["password", "magic"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 font-medium transition-colors ${mode === m ? "bg-[var(--primary)] text-white" : "bg-transparent text-[var(--muted)] hover:text-[var(--text)]"}`}
            >
              {m === "password" ? "Password" : "Magic Link"}
            </button>
          ))}
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input type="email" defaultValue="james@steward.app" placeholder="you@example.org"
                className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors" />
            </div>
          </div>

          {mode === "password" && (
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[12px] font-medium">Password</label>
                <Link href="/forgot-password" className="text-[12px] text-[var(--primary)] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input type={showPassword ? "text" : "password"} defaultValue="password" placeholder="••••••••"
                  className="w-full pl-8 pr-9 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          )}

          <Button className="w-full justify-center" onClick={handleSignIn} loading={loading}>
            {mode === "password" ? <><ArrowRight size={13} /> Sign In</> : <><Mail size={13} /> Send Magic Link</>}
          </Button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[11px] text-[var(--muted)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-[var(--border)] rounded-[var(--r-btn)] text-[13px] font-medium hover:bg-[var(--bg)] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="text-center text-[12px] text-[var(--muted)] mt-5">
        Have an invite?{" "}
        <Link href="/invite" className="text-[var(--primary)] hover:underline font-medium">Accept invitation</Link>
      </p>
    </div>
  );
}
