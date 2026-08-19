"use client";

import { useRouter } from "next/navigation";

import { GuestCounters } from "./GuestCounters";

// Client leaf for /book/guests: counter changes are pushed into the URL so
// the RSC page re-renders the summary server-side (no client-global store).
export interface GuestsCountersClientProps {
  adults: number;
  children: number;
  maxGuests: number;
  baseSearch: string;
}

export function GuestsCountersClient({
  adults,
  children,
  maxGuests,
  baseSearch,
}: GuestsCountersClientProps) {
  const router = useRouter();

  const handleChange = (nextAdults: number, nextChildren: number) => {
    const sp = new URLSearchParams(baseSearch);
    sp.set("adults", String(nextAdults));
    sp.set("children", String(nextChildren));
    router.replace(`/book/guests?${sp.toString()}`, { scroll: false });
  };

  return (
    <GuestCounters
      adults={adults}
      children={children}
      maxGuests={maxGuests}
      onChange={handleChange}
    />
  );
}
