import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[72px] font-semibold tracking-tight text-(--border) leading-none mb-4">404</p>
        <h1 className="text-[20px] font-semibold mb-2">Page not found</h1>
        <p className="text-[13px] text-(--muted) mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-(--primary) text-white text-[13px] font-medium px-4 py-2 rounded-[var(--r-btn)] hover:bg-[#1a3e85] transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
