"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import {
  GUEST_NAV_LINKS,
  sectionFromPathname,
  type GuestSection,
} from "./nav-links";

const linkBase =
  "block py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

interface MobileNavDrawerProps {
  active?: GuestSection;
  pathname: string | null;
}

// Client leaf: hamburger trigger + slide-in drawer (< lg). Collapses to a
// plain open/close swap when the user prefers reduced motion.
export function MobileNavDrawer({ active, pathname }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const resolved = active ?? sectionFromPathname(pathname);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center p-2 text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <List size={24} strokeWidth={1.5} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-outline-variant bg-surface px-8 py-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium uppercase tracking-[0.15em] text-on-surface">
                LUMASTAY
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center p-2 text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-8 flex flex-col">
              {GUEST_NAV_LINKS.map((link) => {
                const isActive = link.section === resolved;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={[
                      linkBase,
                      isActive
                        ? "text-on-surface underline underline-offset-4 decoration-1"
                        : "text-on-surface-variant",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/book/dates"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex items-center justify-center rounded bg-primary-container px-7 py-3 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Book Your Stay
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
