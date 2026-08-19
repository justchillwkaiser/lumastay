-- Booking reference sequence (spec §6): Booking.reference = 'LS-' || nextval.
-- Starts at 1024 so early references read as LS-1024, LS-1025, ...
-- Idempotent: safe to re-apply.

CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1024;
