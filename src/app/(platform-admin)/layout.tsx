import { requirePlatformAdmin } from "@/lib/auth/session";
import { PlatformSidebar } from "@/components/shared/platform-sidebar";
import { PlatformTopbar } from "@/components/shared/platform-topbar";
import { PlatformMobileSidebar } from "@/components/shared/platform-mobile-sidebar";

export default async function PlatformAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePlatformAdmin();

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <PlatformSidebar />
      </div>
      <PlatformMobileSidebar />
      <div className="md:ml-[232px] flex-1 flex flex-col min-w-0">
        <PlatformTopbar />
        <main className="flex-1 p-4 md:p-7 pt-14 md:pt-4">{children}</main>
      </div>
    </div>
  );
}