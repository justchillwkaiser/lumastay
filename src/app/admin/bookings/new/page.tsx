export const metadata = { title: "New booking — LumaStay Admin" };

// Manual "Add New Booking" — phase-1-lite stub (plan 3 task 7/self-review):
// the full manual booking form lands with admin booking mutations
// (task 9). Page exists so the SideNav CTA never 404s.
export default function NewBookingPage() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Add New Booking
      </h1>
      <p className="mt-2 max-w-[480px] text-body-md text-on-surface-variant">
        Manual booking entry is being finalised. For now, create bookings
        through the guest flow, then manage them from the Bookings table.
      </p>
    </div>
  );
}
