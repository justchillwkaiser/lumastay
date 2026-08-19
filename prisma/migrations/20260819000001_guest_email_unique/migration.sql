-- Guest email uniqueness (plan 3 task 4): createBooking upserts guests by
-- email inside the booking transaction, so email must be a unique key.
-- Replaces the previous non-unique @@index([email]).

DROP INDEX IF EXISTS "Guest_email_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "Guest_email_key" ON "Guest"("email");
