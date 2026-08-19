"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Confirm button (plan 3 task 4): POST /api/bookings, loading state, on
// success redirect /book/confirmed?ref=<reference>; inline error otherwise.
export interface ConfirmButtonProps {
  payload: Record<string, unknown>;
  /** When true ("Pay now online"), redirect to the provider's payment page
   *  instead of straight to confirmed (plan 3 task 6 wiring). */
  payNow?: boolean;
}

export function ConfirmButton({ payload, payNow = false }: ConfirmButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) {
        setError(
          data.error === "DATES_UNAVAILABLE"
            ? "Those dates have just been taken. Please select different dates."
            : "Something went wrong. Please try again.",
        );
        return;
      }
      if (payNow) {
        router.push(`/pay/mock/${data.reference}`);
        return;
      }
      router.push(`/book/confirmed?ref=${data.reference}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className={
          payNow
            ? "inline-flex w-full items-center justify-center gap-2 rounded px-6 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface underline underline-offset-4 transition-colors hover:text-on-surface-variant disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            : "inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        }
      >
        {loading
          ? "Confirming…"
          : payNow
            ? "Pay now online"
            : "Confirm booking"}
      </button>
      {error && (
        <p className="mt-3 text-label-caps text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
