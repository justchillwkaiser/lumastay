"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DatePicker } from "@/components/guest/booking/DatePicker";
import type { DateState } from "@/lib/availability";

// Client leaf for /book/dates: owns the in-flight range selection and
// pushes the chosen range into the URL so the RSC page re-validates +
// recomputes the summary server-side (no client-global store).
export interface DatesPickerClientProps {
  month: { year: number; month: number };
  states: Record<string, DateState>;
  value: { checkIn: string | null; checkOut: string | null };
  /** Serialized base params (property/adults/children) to preserve in the URL. */
  baseSearch: string;
}

export function DatesPickerClient({
  month,
  states,
  value,
  baseSearch,
}: DatesPickerClientProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(month);

  const handleChange = (checkIn: string | null, checkOut: string | null) => {
    const sp = new URLSearchParams(baseSearch);
    if (checkIn) sp.set("checkIn", checkIn);
    else sp.delete("checkIn");
    if (checkOut) sp.set("checkOut", checkOut);
    else sp.delete("checkOut");
    router.replace(`/book/dates?${sp.toString()}`, { scroll: false });
  };

  return (
    <DatePicker
      month={currentMonth}
      states={states}
      value={value}
      onChange={handleChange}
      onMonthChange={setCurrentMonth}
    />
  );
}
