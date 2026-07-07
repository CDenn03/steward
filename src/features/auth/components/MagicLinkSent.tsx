import { Mail } from "lucide-react";

type MagicLinkSentProps = {
  email: string;
};

export function MagicLinkSent({ email }: MagicLinkSentProps) {
  return (
    <div className="w-full max-w-[400px]">
      <div className="bg-(--surface) border border-(--border) rounded-(--r-dialog) p-8 text-center">
        <Mail size={32} className="mx-auto mb-4 text-(--primary)" />
        <h2 className="text-[16px] font-semibold mb-2">Check your inbox</h2>
        <p className="text-[13px] text-(--muted)">
          We sent a sign-in link to <strong>{email}</strong>.
        </p>
      </div>
    </div>
  );
}