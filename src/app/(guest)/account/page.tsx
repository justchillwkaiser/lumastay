import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { listBookingsForUser } from "@/lib/guests";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "Your stays — LumaStay" };

function formatShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// /account (plan 3 task 5, phase-1-lite): authenticated guest's bookings.
export default async function AccountPage() {
  const session = await requireUser();
  const bookings = await listBookingsForUser(session.user.id);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-16 lg:px-10 lg:py-24">
      <LabelCaps as="span">Account</LabelCaps>
      <h1 className="mt-2 text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Your stays
      </h1>

      {bookings.length === 0 ? (
        <Card className="mt-10 max-w-[560px] p-8 text-center">
          <p className="text-body-md text-on-surface-variant">
            No bookings yet. When you reserve a villa with this email, it will
            appear here.
          </p>
          <Link
            href="/villas"
            className="mt-6 inline-flex items-center justify-center rounded bg-primary px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse the collection
          </Link>
        </Card>
      ) : (
        <div className="mt-10 max-w-[720px] space-y-4">
          {bookings.map((b) => (
            <Card key={b.reference} className="p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-mono-data font-bold text-on-surface">
                    #{b.reference}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">
                    {b.propertyName}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {formatShort(b.checkIn)} → {formatShort(b.checkOut)}
                  </p>
                </div>
                <div className="text-right">
                  <LabelCaps as="span">{b.status}</LabelCaps>
                  <p className="mt-1 text-mono-data text-on-surface">
                    RM {Number(b.totalAmount).toLocaleString("en-MY", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <Divider className="my-4" />
              <a
                href={`/api/bookings/${b.reference}/ics`}
                className="text-sm font-semibold text-on-surface underline underline-offset-4 transition-colors hover:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Add to calendar
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
