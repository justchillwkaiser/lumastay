"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarBlank,
  CreditCard,
  Gauge,
  GearSix,
  House,
  Star,
  Users,
  Notebook,
  Plus,
} from "@phosphor-icons/react";

import { LabelCaps } from "@/components/ui/LabelCaps";

const NAV = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/bookings", label: "Bookings", icon: Notebook },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarBlank },
  { href: "/admin/properties", label: "Properties", icon: House },
  { href: "/admin/guests", label: "Guests", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

// Admin sidebar (plan 3 task 7): 240px, brand block, black "+ Add New
// Booking", 7 nav items with phosphor icons + active pill, divider,
// Settings pinned bottom.
export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface lg:flex">
      <div className="px-5 pb-5 pt-6">
        <Link
          href="/admin"
          className="text-[13px] font-medium uppercase tracking-[0.15em] text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          LUMASTAY
        </Link>
        <LabelCaps as="span" className="mt-1 block">
          Admin Console
        </LabelCaps>
        <Link
          href="/admin/bookings/new"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-tertiary px-4 py-2.5 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-tertiary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Add New Booking
        </Link>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active
                  ? "bg-primary-container font-semibold text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline px-3 py-4">
        <Link
          href="/admin/settings"
          aria-current={pathname.startsWith("/admin/settings") ? "page" : undefined}
          className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            pathname.startsWith("/admin/settings")
              ? "bg-primary-container font-semibold text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          <GearSix size={18} strokeWidth={1.5} aria-hidden="true" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
