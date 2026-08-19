// Shared MYR formatting (plan 3 self-review: consolidate inline formatting
// here from task 8 onward).
export function formatMyr(amount: string | number): string {
  return `RM ${Number(amount).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Compact style for table cells: "RM 1,240" (no decimals). */
export function formatMyrCompact(amount: string | number): string {
  return `RM ${Number(amount).toLocaleString("en-MY", {
    maximumFractionDigits: 0,
  })}`;
}
