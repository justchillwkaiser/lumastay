"use client";

// Generalized data table (plan 3 task 11): the BookingsTable pattern
// distilled — RSC pages pass rows + column defs; selection/bulk stays with
// the specialized BookingsTable (this lite version is read-only + row
// actions slot).

import { flexRender, useTable, columnVisibilityFeature } from "@tanstack/react-table";
import type { ColumnDef, RowData } from "@tanstack/table-core";

const FEATURES = { columnVisibilityFeature };

export function DataTable<TRow extends RowData>({
  rows,
  columns,
  emptyLabel = "No records.",
}: {
  rows: TRow[];
  columns: ColumnDef<typeof FEATURES, TRow>[];
  emptyLabel?: string;
}) {
  const table = useTable({ features: FEATURES, columns, data: rows });
  const bodyRows = table.getRowModel().rows;

  return (
    <div className="overflow-x-auto rounded border border-outline-variant bg-surface-container-lowest">
      <table className="w-full text-left">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-hairline">
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {bodyRows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-on-surface-variant"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
          {bodyRows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-hairline transition-colors last:border-0 hover:bg-surface-container-low"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
