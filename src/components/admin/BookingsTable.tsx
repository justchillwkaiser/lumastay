"use client";

// TanStack Table v9 client leaf (plan 3 task 8): checkbox selection column,
// BOOKING ID / GUEST / PROPERTY / STAY DATES / AMOUNT / STATUS / row menu,
// bulk toolbar ("N selected" — actions disabled until selection), verbatim
// pagination footer. Rows arrive via props from the RSC page.

import {
  flexRender,
  rowSelectionFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  useTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/table-core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DotsThreeVertical } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/Badge";
import { LabelCaps } from "@/components/ui/LabelCaps";
import type { BookingRow } from "@/lib/admin-bookings";

const FEATURES = { rowSelectionFeature, columnVisibilityFeature, rowSortingFeature };

function statusTone(status: string): "confirmed" | "pending" | "cancelled" | "completed" | "failed" {
  if (status === "COMPLETED") return "completed";
  if (status === "CONFIRMED") return "confirmed";
  if (status === "PENDING") return "pending";
  if (status === "FAILED") return "failed";
  return "cancelled";
}

const columns: ColumnDef<typeof FEATURES, BookingRow>[] = [
  { id: "select", header: "select", cell: "select" },
  {
    accessorKey: "reference",
    header: () => <LabelCaps as="span">Booking ID</LabelCaps>,
    cell: ({ getValue, row }) => (
      <Link
        href={`/admin/bookings/${row.original.id}`}
        className="text-mono-data text-on-surface-variant underline-offset-4 transition-colors hover:text-on-surface hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {getValue<string>()}
      </Link>
    ),
  },
  {
    accessorKey: "guestName",
    enableSorting: true,
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting()}
        className="flex items-center gap-1 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Guest
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </button>
    ),
    cell: ({ getValue, row }) => (
      <Link
        href={`/admin/bookings/${row.original.id}`}
        className="text-sm font-semibold text-on-surface transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {getValue<string>()}
      </Link>
    ),
  },
  {
    accessorKey: "propertyName",
    header: () => <LabelCaps as="span">Property</LabelCaps>,
    cell: ({ getValue }) => (
      <span className="text-sm text-on-surface">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "stayDates",
    header: () => <LabelCaps as="span">Stay Dates</LabelCaps>,
    cell: ({ getValue }) => (
      <span className="text-sm text-on-surface-variant">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "amount",
    enableSorting: true,
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting()}
        className="block w-full text-right text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Amount
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </button>
    ),
    cell: ({ getValue }) => (
      <span className="block text-right text-mono-data text-on-surface">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    enableSorting: true,
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting()}
        className="text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Status
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </button>
    ),
    cell: ({ getValue }) => {
      const status = getValue<string>();
      return <Badge tone={statusTone(status)}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        href={`/admin/bookings/${row.original.id}`}
        aria-label={`View booking ${row.original.reference}`}
        className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <DotsThreeVertical size={18} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    ),
  },
];

export function BookingsTable({
  rows,
  total,
  page,
  pageSize,
  baseSearch,
}: {
  rows: BookingRow[];
  total: number;
  page: number;
  pageSize: number;
  baseSearch: string;
}) {
  const table = useTable(
    {
      features: FEATURES,
      columns,
      data: rows,
    },
    (state) => ({ rowSelection: state.rowSelection }),
  );

  const selectedCount = Object.keys(table.state.rowSelection ?? {}).length;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id);

  const bulkAction = async (action: "confirm" | "cancel") => {
    if (selectedIds.length === 0) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/bookings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (res.ok) {
        setFeedback(`${selectedIds.length} booking(s) ${action}ed.`);
        table.resetRowSelection();
        router.refresh();
      } else {
        setFeedback("Action failed. Please try again.");
      }
    } catch {
      setFeedback("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const pageHref = (p: number) => {
    const sp = new URLSearchParams(baseSearch);
    sp.set("page", String(p));
    return `/admin/bookings?${sp.toString()}`;
  };

  const pageNumbers: (number | "…")[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pageNumbers.push(p);
    else if (pageNumbers[pageNumbers.length - 1] !== "…") pageNumbers.push("…");
  }

  return (
    <div>
      {/* Bulk toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-label-caps text-on-surface-variant">
          {selectedCount} selected
        </span>
        <button
          type="button"
          disabled={selectedCount === 0 || busy}
          onClick={() => bulkAction("confirm")}
          className="rounded border border-outline-variant px-3 py-1.5 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Confirm
        </button>
        <button
          type="button"
          disabled={selectedCount === 0 || busy}
          onClick={() => bulkAction("cancel")}
          className="rounded border border-outline-variant px-3 py-1.5 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        {feedback && (
          <span role="status" className="text-sm text-on-surface-variant">
            {feedback}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-hairline">
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3">
                    {h.column.id === "select" ? (
                      <input
                        type="checkbox"
                        aria-label="Select all rows"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-hairline transition-colors last:border-0 hover:bg-surface-container-low"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {cell.column.id === "select" ? (
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.original.reference}`}
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination — verbatim mockup */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-on-surface-variant">
          Showing {from} to {to} of {total} results
        </span>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <a
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded px-3 py-1.5 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "text-on-surface hover:bg-surface-container-high"}`}
          >
            Prev
          </a>
          {pageNumbers.map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="px-2 text-on-surface-variant">…</span>
            ) : (
              <a
                key={p}
                href={pageHref(p)}
                aria-current={p === page ? "page" : undefined}
                className={`rounded px-3 py-1.5 text-sm ${
                  p === page
                    ? "bg-tertiary font-bold text-on-tertiary"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {p}
              </a>
            ),
          )}
          <a
            href={pageHref(Math.min(pageCount, page + 1))}
            aria-disabled={page >= pageCount}
            className={`rounded px-3 py-1.5 text-sm ${page >= pageCount ? "pointer-events-none opacity-40" : "text-on-surface hover:bg-surface-container-high"}`}
          >
            Next
          </a>
        </nav>
      </div>
    </div>
  );
}
