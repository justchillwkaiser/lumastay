"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Prohibit } from "@phosphor-icons/react";

import { LabelCaps } from "@/components/ui/LabelCaps";

// Booking detail actions (plan 3 task 9): Print (window.print), Confirm
// (POST PATCH), Cancel (error-container full width + confirm dialog),
// Record Payment inline form, Add Note.
export function BookingActions({
  id,
  status,
  unpaid,
}: {
  id: string;
  status: string;
  unpaid: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const patch = async (action: "confirm" | "cancel") => {
    setBusy(true);
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  };

  const submitPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await fetch(`/api/admin/bookings/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: String(data.get("amount")),
          method: String(data.get("method")),
          note: String(data.get("note") ?? ""),
        }),
      });
      router.refresh();
      setShowPayment(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded border border-outline-variant bg-transparent px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Printer size={14} strokeWidth={1.5} aria-hidden="true" />
          Print
        </button>
        {status === "PENDING" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patch("confirm")}
            className="inline-flex items-center rounded bg-primary px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Confirm Booking
          </button>
        )}
      </div>

      {unpaid && (
        <div>
          <button
            type="button"
            onClick={() => setShowPayment((v) => !v)}
            className="text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Record Payment
          </button>
          {showPayment && (
            <form onSubmit={submitPayment} className="mt-3 space-y-3 rounded border border-outline-variant p-4">
              <div className="flex flex-col gap-1">
                <LabelCaps htmlFor="amount">Amount (RM)</LabelCaps>
                <input
                  id="amount"
                  name="amount"
                  required
                  inputMode="decimal"
                  className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-outline"
                />
              </div>
              <div className="flex flex-col gap-1">
                <LabelCaps htmlFor="method">Method</LabelCaps>
                <select
                  id="method"
                  name="method"
                  className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-outline"
                >
                  <option value="bank-transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <LabelCaps htmlFor="note">Note (optional)</LabelCaps>
                <input
                  id="note"
                  name="note"
                  className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-outline"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded bg-primary px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary disabled:opacity-50"
              >
                Save payment
              </button>
            </form>
          )}
        </div>
      )}

      {status !== "CANCELLED" && (
        <div>
          {confirmCancel ? (
            <div className="rounded bg-error-container p-4">
              <p className="text-sm font-semibold text-error">
                Cancel this booking? The dates will be released immediately.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => patch("cancel")}
                  className="rounded bg-error px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-error disabled:opacity-50"
                >
                  Yes, cancel
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="rounded border border-outline-variant px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface"
                >
                  Keep
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-error-container px-4 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-error transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Prohibit size={14} strokeWidth={1.5} aria-hidden="true" />
              Cancel Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function AddNoteForm({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      await fetch(`/api/admin/bookings/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: String(data.get("body")) }),
      });
      form.reset();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4">
      <textarea
        name="body"
        rows={3}
        required
        placeholder="Add an internal note…"
        className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded border border-outline-variant px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Add note
      </button>
    </form>
  );
}
