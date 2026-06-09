import { PlatformSidebar } from "@/components/shared/platform-sidebar";
import { PlatformTopbar } from "@/components/shared/platform-topbar";

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <PlatformSidebar />
      <div className="ml-[224px] flex-1 flex flex-col min-w-0">
        <PlatformTopbar />
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
