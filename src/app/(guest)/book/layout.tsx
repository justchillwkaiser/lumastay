import Link from "next/link";

import { Footer } from "@/components/guest/Footer";
import { LabelCaps } from "@/components/ui/LabelCaps";

// Secure-booking chrome (plan 3 task 3): intentionally NOT the guest
// TopNavBar — h-16, wordmark left, LabelCaps "SECURE BOOKING" center,
// black Close right, 1px bottom border. Footer below children.
export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-hairline bg-surface px-5 lg:px-10">
        <Link
          href="/"
          className="text-[13px] font-medium uppercase tracking-[0.15em] text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          LUMASTAY
        </Link>
        <LabelCaps as="span" className="absolute left-1/2 -translate-x-1/2">
          Secure Booking
        </LabelCaps>
        <Link
          href="/villas"
          className="inline-flex items-center justify-center rounded bg-tertiary px-4 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-tertiary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Close
        </Link>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
