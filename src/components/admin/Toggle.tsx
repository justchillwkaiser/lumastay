"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Toggle switch (plan 3 task 11): PATCHes the admin toggle endpoint and
// refreshes the RSC list. Used for property isActive + review approved.
export function Toggle({
  id,
  endpoint,
  field,
  initial,
  label,
}: {
  id: string;
  endpoint: string;
  field: string;
  initial: boolean;
  label: string;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  const flip = async () => {
    const next = !on;
    setOn(next); // optimistic (Optimistic UI pattern, DESIGN.md)
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      if (!res.ok) setOn(!next); // revert on failure
      router.refresh();
    } catch {
      setOn(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={flip}
      className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        on ? "bg-primary" : "bg-surface-dim"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
