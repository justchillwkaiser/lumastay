"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GUEST_NAV_LINKS,
  sectionFromPathname,
  type GuestSection,
} from "./nav-links";
import { MobileNavDrawer } from "./MobileNavDrawer";

export interface TopNavBarProps {
  active?: GuestSection;
}

const linkBase =
  "text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// Guest chrome header per mockup: solid surface, ~88px tall, 1px bottom
// border, wordmark left / centered links / primary-container CTA right.
// Active link = on-surface + 1px underline offset 4px.
export function TopNavBar({ active }: TopNavBarProps) {
  const pathname = usePathname();
  const resolved = active ?? sectionFromPathname(pathname);

  return (
    <header className="h-[88px] border-b border-outline-variant bg-surface">
      <div className="relative mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 lg:px-10">
        <Link
          href="/"
          className="text-lg font-medium uppercase tracking-[0.15em] text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          LUMASTAY
        </Link>
        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex"
        >
          {GUEST_NAV_LINKS.map((link) => {
            const isActive = link.section === resolved;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
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
        </nav>
        <Link
          href="/book/dates"
          className="hidden rounded bg-primary-container px-7 py-3 text-sm font-semibold text-on-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:inline-flex"
        >
          Book Your Stay
        </Link>
        <MobileNavDrawer active={active} pathname={pathname} />
      </div>
    </header>
  );
}
