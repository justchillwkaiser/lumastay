import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { getBookingByReference } from "@/lib/booking-detail";
import { PayButtons } from "./PayButtons";

export const metadata = { title: "Mock payment — LumaStay" };

const BANKS = ["Maybank2u", "CIMB Clicks", "Public Bank", "Bank Islam"];

function formatMyr(amount: string): string {
  return `RM ${Number(amount).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Mock FPX page (plan 3 task 6): Swiss bank-picker list + Pay Success /
// Simulate Failure buttons → POST /api/payments/mock/callback.
export default async function MockPayPage({
  params,
}: {
  params: Promise<{ bookingRef: string }>;
}) {
  const { bookingRef } = await params;
  const booking = await getBookingByReference(bookingRef);
  if (!booking) notFound();

  return (
    <div className="mx-auto w-full max-w-[520px] px-5 py-16 lg:py-24">
      <LabelCaps as="span" className="block text-center">
        LumaStay Mock FPX
      </LabelCaps>
      <h1 className="mt-2 text-center text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Select your bank
      </h1>
      <p className="mt-3 text-center text-body-md text-on-surface-variant">
        Reference #{booking.reference} — {formatMyr(booking.totalAmount)}
      </p>

      <Card className="mt-10">
        {BANKS.map((bank, i) => (
          <div key={bank}>
            {i > 0 && <Divider />}
            <label className="flex cursor-pointer items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-container-low">
              <input
                type="radio"
                name="bank"
                defaultChecked={i === 0}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              <span className="text-sm font-semibold text-on-surface">{bank}</span>
            </label>
          </div>
        ))}
      </Card>

      <PayButtons reference={booking.reference} total={booking.totalAmount} />
    </div>
  );
}
