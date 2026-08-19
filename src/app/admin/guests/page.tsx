import { DataTable } from "@/components/admin/DataTable";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { listAdminGuests } from "@/lib/admin-derived";

export const metadata = { title: "Guests — LumaStay Admin" };

// Guests (plan 3 task 11 lite): list + booking count.
export default async function AdminGuestsPage() {
  const rows = await listAdminGuests();

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Guests
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Every guest who has booked or enquired.
      </p>
      <div className="mt-6">
        <DataTable
          rows={rows}
          emptyLabel="No guests yet."
          columns={[
            {
              accessorKey: "name",
              header: () => <LabelCaps as="span">Guest</LabelCaps>,
              cell: ({ row }) => (
                <div>
                  <p className="text-sm font-semibold text-on-surface">{row.original.name}</p>
                  <p className="text-sm text-on-surface-variant">{row.original.email}</p>
                </div>
              ),
            },
            {
              accessorKey: "phone",
              header: () => <LabelCaps as="span">Phone</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-sm text-on-surface-variant">{getValue<string>()}</span>
              ),
            },
            {
              accessorKey: "bookingCount",
              header: () => <LabelCaps as="span">Bookings</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-mono-data text-on-surface">{getValue<number>()}</span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
