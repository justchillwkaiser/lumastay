"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Pay Success / Simulate Failure (plan 3 task 6): both POST the callback;
// success → /book/confirmed, fail → /book/review?error=payment_failed.
export function PayButtons({
  reference,
  total,
}: {
  reference: string;
  total: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"success" | "fail" | null>(null);

  const pay = async (outcome: "success" | "fail") => {
    setLoading(outcome);
    try {
      const res = await fetch("/api/payments/mock/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, outcome }),
      });
      const data = (await res.json()) as { status: string };
      if (outcome === "success" && data.status === "paid") {
        router.push(`/book/confirmed?ref=${reference}`);
      } else {
        router.push("/book/review?error=payment_failed");
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => pay("success")}
        className="inline-flex w-full items-center justify-center rounded bg-primary px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {loading === "success"
          ? "Processing…"
          : `Pay Success - RM ${Number(total).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => pay("fail")}
        className="inline-flex w-full items-center justify-center rounded border border-outline-variant bg-transparent px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Simulate Failure
      </button>
    </div>
  );
}
