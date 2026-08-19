"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Wrench } from "@phosphor-icons/react";

import { LabelCaps } from "@/components/ui/LabelCaps";

// Quick Actions (plan 3 task 10): "Set Maintenance Block" inline form →
// POST /api/admin/blocks; "Export PDF Schedule" = print stylesheet view
// (phase-1-lite).
export function QuickActions({ properties }: { properties: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: String(data.get("propertyId")),
          startDate: String(data.get("startDate")),
          endDate: String(data.get("endDate")),
          label: String(data.get("label") ?? ""),
        }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded border border-outline-variant bg-surface-container-lowest p-5">
      <LabelCaps as="span" className="block">
        Quick Actions
      </LabelCaps>
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex w-full items-center gap-2 rounded border border-outline-variant bg-transparent px-4 py-2.5 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Wrench size={14} strokeWidth={1.5} aria-hidden="true" />
          Set Maintenance Block
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex w-full items-center gap-2 rounded border border-outline-variant bg-transparent px-4 py-2.5 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Download size={14} strokeWidth={1.5} aria-hidden="true" />
          Export PDF Schedule
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t border-hairline pt-4">
          <div className="flex flex-col gap-1">
            <LabelCaps htmlFor="qa-property">Property</LabelCaps>
            <select
              id="qa-property"
              name="propertyId"
              className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-outline"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <LabelCaps htmlFor="qa-start">Start</LabelCaps>
              <input id="qa-start" name="startDate" type="date" required
                className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-outline" />
            </div>
            <div className="flex flex-col gap-1">
              <LabelCaps htmlFor="qa-end">End</LabelCaps>
              <input id="qa-end" name="endDate" type="date" required
                className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-outline" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <LabelCaps htmlFor="qa-label">Label</LabelCaps>
            <input id="qa-label" name="label" placeholder="Maintenance: pool pump"
              className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-outline" />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-primary px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Save block
          </button>
        </form>
      )}
    </div>
  );
}
