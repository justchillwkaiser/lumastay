import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/admin/DataTable";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { listAdminPayments } from "@/lib/admin-derived";
import { formatMyr } from "@/lib/format";

export const metadata = { title: "Payments — LumaStay Admin" };

const STATUSES = ["", "PENDING", "PAID", "FAILED", "REFUNDED"];

function tone(status: string): "confirmed" | "pending" | "cancelled" | "failed" {
  if (status === "PAID") return "confirmed";
  if (status === "PENDING") return "pending";
  if (status === "FAILED") return "failed";
  return "cancelled"; // REFUNDED
}

// Payments (plan 3 task 11 lite): list + status badges + filter.
export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const rows = await listAdminPayments({ status: status || undefined });

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Payments
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Recorded and gateway payments across all bookings.
      </p>

      <form method="get" className="mt-6 flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <LabelCaps htmlFor="status">Status</LabelCaps>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-outline"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "" ? "All statuses" : s}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Apply
        </button>
      </form>

      <div className="mt-6">
        <DataTable
          rows={rows}
          emptyLabel="No payments recorded."
          columns={[
            {
              accessorKey: "bookingReference",
              header: () => <LabelCaps as="span">Booking</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-mono-data text-on-surface-variant">{getValue<string>()}</span>
              ),
            },
            {
              accessorKey: "guestName",
              header: () => <LabelCaps as="span">Guest</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-sm font-semibold text-on-surface">{getValue<string>()}</span>
              ),
            },
            {
              accessorKey: "amount",
              header: () => <LabelCaps as="span">Amount</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-mono-data text-on-surface">{formatMyr(getValue<string>())}</span>
              ),
            },
            {
              accessorKey: "method",
              header: () => <LabelCaps as="span">Method</LabelCaps>,
              cell: ({ getValue }) => (
                <span className="text-sm text-on-surface-variant">{getValue<string>()}</span>
              ),
            },
            {
              accessorKey: "status",
              header: () => <LabelCaps as="span">Status</LabelCaps>,
              cell: ({ getValue }) => (
                <Badge tone={tone(getValue<string>())}>{getValue<string>()}</Badge>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
