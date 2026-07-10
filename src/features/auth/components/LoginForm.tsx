"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from '@/components/ui/Button';

import { GoogleButton } from '@/features/auth/components/GoogleButton';
import { MagicLinkSent } from '@/features/auth/components/MagicLinkSent';
import { useState } from "react";
import { LoginMode, useLogin } from "../hooks/use-login";

const MODES: LoginMode[] = ["password", "magic"];

export function LoginForm() {
  const {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    sent,
    fieldErrors,
    handleSubmit,
    handleGoogle,
  } = useLogin();
  const [showPw, setShowPw] = useState(false);

  if (sent) {
    return <MagicLinkSent email={email} />;
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <div className="flex flex-col items-center">
          <p className="text-[17px] font-semibold tracking-tight">Steward</p>
          <p className="text-[11px] text-(--muted) uppercase tracking-[0.5px]">
            Financial Governance
          </p>
        </div>
      </div>

      <div className="bg-(--surface) border border-(--border) rounded-(--r-dialog) p-7">
        <h1 className="text-[18px] font-semibold mb-1">Welcome back</h1>
        <p className="text-[14px] text-(--muted) mb-6">Sign in to your account</p>

        <div
          role="tablist"
          aria-label="Sign-in method"
          className="flex rounded-[var(--r-btn)] border border-(--border) overflow-hidden mb-5 text-[13px]"
        >
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 font-medium transition-colors ${
                mode === m
                  ? "bg-(--primary) text-white"
                  : "bg-transparent text-(--muted) hover:text-(--text)"
              }`}
            >
              {m === "password" ? "Password" : "Magic Link"}
            </button>
          ))}
        </div>

        <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.org"
                className="w-full pl-8 pr-3 py-2.5 text-[14px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors border-(--border)"
                style={fieldErrors.email ? { borderColor: "#f87171" } : undefined}
              />
            </div>
          </div>

          {mode === "password" && (
            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="text-[13px] font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[13px] text-(--primary) hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-9 py-2.5 text-[14px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors border-(--border)"
                  style={fieldErrors.password ? { borderColor: "#f87171" } : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--text)"
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full justify-center" loading={loading}>
            {mode === "password" ? (
              <>
                <ArrowRight size={13} /> Sign In
              </>
            ) : (
              <>
                <Mail size={13} /> Send Magic Link
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-(--border)" />
          <span className="text-[12px] text-(--muted)">or</span>
          <div className="flex-1 h-px bg-(--border)" />
        </div>

        <GoogleButton onClick={handleGoogle} disabled={loading} />
      </div>

      <p className="text-center text-[13px] text-(--muted) mt-5">
        Have an invite?{" "}
        <Link href="/invite" className="text-(--primary) hover:underline font-medium">
          Accept invitation
        </Link>
      </p>
    </div>
  );
}