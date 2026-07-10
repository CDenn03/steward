"use client";
import Link from "next/link";
import { User, Mail, Lock, CheckCircle2 } from "lucide-react";
import { Button } from '@/components/ui/Button';

export function InviteForm() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <p className="text-[17px] font-semibold tracking-tight">Steward</p>
      </div>

      <div className="bg-(--surface) border border-(--border) rounded-(--r-dialog) p-7">
        <div className="flex items-center gap-3 bg-[var(--primary-light)] rounded-[10px] p-3.5 mb-6">
          <div className="w-9 h-9 rounded-full bg-(--primary) flex items-center justify-center text-white text-[14px] font-semibold shrink-0">GC</div>
          <div>
            <p className="text-[14px] font-medium">Grace Community Church</p>
            <p className="text-[12px] text-(--muted)">Invited by James Mwangi · Finance Officer</p>
          </div>
          <CheckCircle2 size={16} className="text-(--primary) ml-auto shrink-0" />
        </div>

        <h1 className="text-[18px] font-semibold mb-1">Create your account</h1>
        <p className="text-[14px] text-(--muted) mb-6">You&apos;re joining as a <strong>Department Head</strong></p>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Full name</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
              <input type="text" placeholder="Sarah Kamau" className="w-full pl-8 pr-3 py-2.5 text-[14px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
              <input type="email" defaultValue="sarah@gracecommunity.org" className="w-full pl-8 pr-3 py-2.5 text-[14px] bg-(--bg) border border-(--border) rounded-(--r-input) outline-none text-(--muted) transition-colors cursor-not-allowed" readOnly />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Create password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
              <input type="password" placeholder="At least 8 characters" className="w-full pl-8 pr-3 py-2.5 text-[14px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors" />
            </div>
          </div>
          <Button className="w-full justify-center">Accept Invitation & Create Account</Button>
        </div>
      </div>
      <p className="text-center text-[13px] text-(--muted) mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-(--primary) hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
