import { Prohibit } from "@phosphor-icons/react/dist/ssr";

import { LabelCaps } from "@/components/ui/LabelCaps";
import type { AdminMonthMatrix } from "@/lib/admin-calendar";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Availability calendar grid (plan 3 task 10): MON–SUN LabelCaps band,
// min-h-[96px] cells with 1px dividers; booking bars bg-primary-container
// white 11px truncate; holds sage; blocked surface-dim + centered Prohibit.
export function AvailabilityCalendar({
  matrix,
}: {
  matrix: AdminMonthMatrix;
}) {
  return (
    <div>
      <div className="grid grid-cols-7 border-b border-hairline bg-surface-container-low">
        {WEEKDAYS.map((d) => (
          <LabelCaps key={d} as="span" className="px-3 py-2">
            {d}
          </LabelCaps>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {matrix.weeks.flat().map((cell) => (
          <div
            key={cell.date}
            data-state={cell.state}
            className={`min-h-[96px] border-b border-r border-hairline p-2 ${
              cell.muted ? "opacity-40" : ""
            } ${
              cell.state === "blocked"
                ? "bg-surface-dim"
                : cell.state === "hold"
                  ? "bg-primary-fixed-dim"
                  : ""
            }`}
          >
            <span className="text-xs text-on-surface-variant">{cell.day}</span>
            {cell.state === "booked" && (
              <p className="mt-1 truncate rounded-sm bg-primary-container px-1.5 py-0.5 text-[11px] font-semibold text-on-primary">
                {cell.label}
              </p>
            )}
            {cell.state === "hold" && (
              <p className="mt-1 truncate rounded-sm px-1.5 py-0.5 text-[11px] font-semibold text-on-surface">
                {cell.label ?? "Hold"}
              </p>
            )}
            {cell.state === "blocked" && (
              <span className="mt-2 flex justify-center">
                <Prohibit size={18} strokeWidth={1.5} aria-hidden="true" className="text-on-surface-variant" />
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-5">
        {[
          ["bg-primary-container", "Booked"],
          ["bg-primary-fixed-dim", "Hold"],
          ["bg-surface-dim", "Blocked"],
          ["border border-outline-variant", "Available"],
        ].map(([swatch, label]) => (
          <span key={label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-3 w-3 rounded-sm ${swatch}`} />
            <LabelCaps as="span">{label}</LabelCaps>
          </span>
        ))}
      </div>
    </div>
  );
}
