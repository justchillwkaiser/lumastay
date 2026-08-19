import { LabelCaps } from "@/components/ui/LabelCaps";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { listBookings } from "@/lib/admin-bookings";

export const metadata = { title: "Bookings — LumaStay Admin" };

const STATUSES = ["", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

// Admin Bookings (plan 3 task 8): RSC — search + filters as GET form
// (server round-trip), TanStack table in client leaf via props.
export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const query = {
    status: str("status") || undefined,
    search: str("search") || undefined,
    page: Number(str("page") ?? "1") || 1,
  };
  const { rows, total } = await listBookings(query);

  const baseSearch = new URLSearchParams();
  if (query.status) baseSearch.set("status", query.status);
  if (query.search) baseSearch.set("search", query.search);

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Bookings
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Search, filter, and manage every reservation.
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <LabelCaps htmlFor="search">Search</LabelCaps>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={query.search}
            placeholder="Reference, guest, property…"
            className="w-64 rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <LabelCaps htmlFor="status">Status</LabelCaps>
          <select
            id="status"
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Apply
        </button>
      </form>

      <div className="mt-6">
        <BookingsTable
          rows={rows}
          total={total}
          page={query.page}
          pageSize={10}
          baseSearch={baseSearch.toString()}
        />
      </div>
    </div>
  );
}
