import { requireAdmin } from "@/lib/guards";
import { SideNav } from "@/components/admin/SideNav";
import { TopBar } from "@/components/admin/TopBar";

// Admin shell (plan 3 task 7): two-layer guard — proxy + requireAdmin()
// here. SideNav left (240px), TopBar on top of the content column.
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
        <TopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
