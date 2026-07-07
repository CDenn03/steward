"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from '@/components/ui/Button';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 bg-(--primary) rounded-[10px] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <p className="text-[17px] font-semibold tracking-tight">Steward</p>
      </div>

      <div className="bg-(--surface) border border-(--border) rounded-(--r-dialog) p-7">
        {!sent ? (
          <>
            <h1 className="text-[18px] font-semibold mb-1">Reset your password</h1>
            <p className="text-[13px] text-(--muted) mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <div className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-medium mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
                  <input
                    type="email"
                    placeholder="james@gracecommunity.org"
                    className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors"
                  />
                </div>
              </div>
              <Button className="w-full justify-center" onClick={() => setSent(true)}>
                <Mail size={13} /> Send Reset Link
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <h2 className="text-[16px] font-semibold mb-2">Check your email</h2>
            <p className="text-[13px] text-(--muted)">
              We&apos;ve sent a password reset link to your email address.
            </p>
          </div>
        )}
      </div>
      <div className="text-center mt-5">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[12px] text-(--muted) hover:text-(--text) transition-colors">
          <ArrowLeft size={12} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
