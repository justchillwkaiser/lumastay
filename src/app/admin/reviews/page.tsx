import { DataTable } from "@/components/admin/DataTable";
import { Toggle } from "@/components/admin/Toggle";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { listAdminReviews } from "@/lib/admin-derived";

export const metadata = { title: "Reviews — LumaStay Admin" };

// Reviews (plan 3 task 11 lite): approve/hide toggle.
export default async function AdminReviewsPage() {
  const rows = await listAdminReviews();

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Reviews
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Approve reviews to publish them on property pages.
      </p>
      <div className="mt-6">
        <DataTable
          rows={rows}
          emptyLabel="No reviews yet."
          columns={[
            {
              accessorKey: "guestName",
              header: () => <LabelCaps as="span">Review</LabelCaps>,
              cell: ({ row }) => (
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {row.original.guestName} — {row.original.propertyName}
                  </p>
                  <p className="mt-1 max-w-[420px] truncate text-sm text-on-surface-variant">
                    {row.original.body}
                  </p>
                </div>
              ),
            },
            {
              accessorKey: "rating",
              header: () => <LabelCaps as="span">Rating</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-mono-data text-on-surface">{getValue<string>()}</span>
              ),
            },
            {
              accessorKey: "approved",
              header: () => <LabelCaps as="span">Published</LabelCaps>,
              cell: ({ row }) => (
                <Toggle
                  id={row.original.id}
                  endpoint={`/api/admin/reviews/${row.original.id}`}
                  field="approved"
                  initial={row.original.approved}
                  label={`Toggle review by ${row.original.guestName}`}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
