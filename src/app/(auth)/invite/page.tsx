"use client";
import Link from "next/link";
import { User, Mail, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <div className="w-9 h-9 bg-[var(--primary)] rounded-[10px] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <p className="text-[17px] font-semibold tracking-tight">Steward</p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-dialog)] p-7">
        {/* Invite context */}
        <div className="flex items-center gap-3 bg-[var(--primary-light)] rounded-[10px] p-3.5 mb-6">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0">GC</div>
          <div>
            <p className="text-[13px] font-medium">Grace Community Church</p>
            <p className="text-[11px] text-[var(--muted)]">Invited by James Mwangi · Finance Officer</p>
          </div>
          <CheckCircle2 size={16} className="text-[var(--primary)] ml-auto flex-shrink-0" />
        </div>

        <h1 className="text-[18px] font-semibold mb-1">Create your account</h1>
        <p className="text-[13px] text-[var(--muted)] mb-6">You&apos;re joining as a <strong>Department Head</strong></p>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Full name</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input type="text" placeholder="Sarah Kamau" className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input type="email" defaultValue="sarah@gracecommunity.org" className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r-input)] outline-none text-[var(--muted)] transition-colors cursor-not-allowed" readOnly />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Create password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input type="password" placeholder="At least 8 characters" className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors" />
            </div>
          </div>
          <Button className="w-full justify-center">Accept Invitation & Create Account</Button>
        </div>
      </div>
      <p className="text-center text-[12px] text-[var(--muted)] mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
