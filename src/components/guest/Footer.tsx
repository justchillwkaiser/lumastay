import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Press Kit", href: "/press-kit" },
  { label: "Contact", href: "/contact" },
];

// Guest chrome footer per mockup: surface-container-low band, text-only —
// wordmark + 4 links row, then two uppercase legal lines. No newsletter,
// no social icons, no dividers.
export function Footer() {
  return (
    <footer className="bg-surface-container-low">
      <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-[13px] font-medium uppercase tracking-[0.15em] text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            LUMASTAY
          </Link>
          <nav
            aria-label="Footer"
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-on-surface-variant transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-[38px] space-y-2 text-[11.5px] uppercase leading-relaxed tracking-[0.12em] text-on-surface-variant">
          <p>© 2026 LUMASTAY MALAYSIA.</p>
          <p>ARCHITECTURAL PERMANENCE.</p>
        </div>
      </div>
    </footer>
  );
}
