import { requireAdmin } from "@/lib/guards";
import { MobileAdminDrawer } from "@/components/admin/MobileAdminDrawer";
import { SideNav, SideNavContent } from "@/components/admin/SideNav";
import { TopBar } from "@/components/admin/TopBar";

// Admin shell (plan 3 task 7): two-layer guard — proxy + requireAdmin()
// here. SideNav left (240px) on desktop; mobile (task 12) gets a hamburger
// topbar with the slide-in drawer rendering the same nav content.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-dvh bg-surface">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar: hamburger + centered wordmark + avatar */}
        <div className="flex h-14 items-center justify-between border-b border-hairline bg-surface px-4 lg:hidden">
          <MobileAdminDrawer>
            <SideNavContent />
          </MobileAdminDrawer>
          <span className="text-[13px] font-medium uppercase tracking-[0.15em] text-on-surface">
            LUMASTAY
          </span>
          <span
            aria-label="Admin user"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-label-caps font-bold text-on-primary"
          >
            A
          </span>
        </div>
        <div className="hidden lg:block">
          <TopBar />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
