-- Race condition fix (plan 3 follow-up): prevent double booking at the
-- DATABASE level. Application-level checks (isRangeBookable) are necessary
-- but NOT sufficient — two concurrent requests can both pass the check,
-- then both insert. An exclusion constraint is enforced atomically by
-- PostgreSQL itself, so concurrent inserts can never both succeed.

-- Required for GiST exclusion constraints on scalar + range columns.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- No two active bookings (PENDING/CONFIRMED) may overlap for the same
-- property. CANCELLED/COMPLETED bookings do not block the range.
--
-- daterange(checkIn, checkOut) is [start, end) — end-exclusive, matching
-- the availability engine's "checkout day is free for the next guest" rule.
ALTER TABLE "Booking"
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
  "propertyId" WITH =,
  daterange("checkIn", "checkOut") WITH &&
)
WHERE ("status" IN ('PENDING', 'CONFIRMED'));
