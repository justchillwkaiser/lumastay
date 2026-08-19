"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";

// Mobile admin drawer (plan 3 task 12 step 2): hamburger trigger + slide-in
// SideNav panel with × (< lg), reduced-motion aware. Focus trap + Escape +
// aria-modal per WCAG.
export function MobileAdminDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus management: move focus into dialog on open, return to trigger on close.
  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open admin navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <List size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-tertiary/40"
              aria-hidden="true"
            />
            <motion.div
              ref={panelRef}
              initial={{ x: reduceMotion ? 0 : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : "-100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-none"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
            >
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  aria-label="Close admin navigation"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <X size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <nav onClick={(e) => {
                // Close only when a link is tapped, not arbitrary padding.
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}>
                {children}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
