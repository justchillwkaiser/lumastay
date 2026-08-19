import { DataTable } from "@/components/admin/DataTable";
import { Toggle } from "@/components/admin/Toggle";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { listAdminProperties } from "@/lib/admin-derived";
import { formatMyrCompact } from "@/lib/format";

export const metadata = { title: "Properties — LumaStay Admin" };

// Properties (plan 3 task 11 lite): list + active toggle only.
export default async function AdminPropertiesPage() {
  const rows = await listAdminProperties();

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Properties
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        The collection — activate or pause a villa.
      </p>
      <div className="mt-6">
        <DataTable
          rows={rows}
          emptyLabel="No properties yet."
          columns={[
            {
              accessorKey: "shortName",
              header: () => <LabelCaps as="span">Property</LabelCaps>,
              cell: ({ row }) => (
                <div>
                  <p className="text-sm font-semibold text-on-surface">{row.original.shortName}</p>
                  <p className="text-sm text-on-surface-variant">{row.original.locationLine}</p>
                </div>
              ),
            },
            {
              accessorKey: "nightlyRate",
              header: () => <LabelCaps as="span">Rate</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-mono-data text-on-surface">
                  {formatMyrCompact(getValue<string>())} / night
                </span>
              ),
            },
            {
              accessorKey: "bookingCount",
              header: () => <LabelCaps as="span">Bookings</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-mono-data text-on-surface">{getValue<number>()}</span>
              ),
            },
            {
              accessorKey: "isActive",
              header: () => <LabelCaps as="span">Active</LabelCaps>,
              cell: ({ row }) => (
                <Toggle
                  id={row.original.id}
                  endpoint={`/api/admin/properties/${row.original.id}`}
                  field="isActive"
                  initial={row.original.isActive}
                  label={`Toggle ${row.original.shortName} active`}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
