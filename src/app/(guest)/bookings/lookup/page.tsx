import { LookupForm } from "./LookupForm";

export const metadata = { title: "Find your booking — LumaStay" };

// /bookings/lookup (plan 3 task 5): ref + email → read-only detail card.
export default function LookupPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-16 lg:px-10 lg:py-24">
      <h1 className="text-center text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Find your booking
      </h1>
      <p className="mx-auto mt-3 max-w-[420px] text-center text-body-md text-on-surface-variant">
        Enter your booking reference and the email used at checkout.
      </p>
      <div className="mt-10">
        <LookupForm />
      </div>
    </div>
  );
}
