import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { listAdminUsers } from "@/lib/admin-derived";

export const metadata = { title: "Settings — LumaStay Admin" };

// Settings (plan 3 task 11 lite): brand info read-only + users list.
export default async function AdminSettingsPage() {
  const users = await listAdminUsers();

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Settings
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Brand and access configuration.
      </p>

      <div className="mt-8 grid max-w-[960px] gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <LabelCaps as="span" className="block">Brand</LabelCaps>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Name", "LumaStay"],
              ["Tagline", "Architectural Permanence. Natural Serenity."],
              ["Region", "Malaysia"],
              ["Currency", "MYR (RM)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">{k}</dt>
                <dd className="text-right text-on-surface">{v}</dd>
              </div>
            ))}
          </dl>
          <Divider className="my-4" />
          <p className="text-label-caps text-on-surface-variant">
            Read-only in phase 1
          </p>
        </Card>

        <Card className="p-6">
          <LabelCaps as="span" className="block">Users</LabelCaps>
          <div className="mt-4 space-y-3">
            {users.length === 0 && (
              <p className="text-sm text-on-surface-variant">
                No users found (offline mode).
              </p>
            )}
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {u.name ?? u.email}
                  </p>
                  <p className="text-sm text-on-surface-variant">{u.email}</p>
                </div>
                <LabelCaps as="span">{u.role}</LabelCaps>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
