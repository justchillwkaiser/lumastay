// ICS calendar export — plan 3 task 5.
// RFC 5545: CRLF line endings, commas/semicolons/backslashes escaped in
// TEXT properties. UID = <reference>@lumastay (LS- format per spec §6).

export interface IcsBooking {
  reference: string;
  propertyName: string;
  locationLine: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  checkInTime: string; // e.g. "3:00 PM"
  checkOutTime: string; // e.g. "11:00 AM"
}

/** Escape a TEXT value per RFC 5545 §3.3.11. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** "2024-11-12" + "3:00 PM" → "20241112T150000" (floating local time). */
function toIcsDateTime(date: string, time: string): string {
  const compact = date.replace(/-/g, "");
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!m) return `${compact}T000000`;
  let h = Number(m[1]);
  const meridiem = m[3].toUpperCase();
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return `${compact}T${String(h).padStart(2, "0")}${m[2]}00`;
}

export function buildIcs(booking: IcsBooking): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LumaStay//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@lumastay`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${toIcsDateTime(booking.checkIn, booking.checkInTime)}`,
    `DTEND:${toIcsDateTime(booking.checkOut, booking.checkOutTime)}`,
    `SUMMARY:${esc(`LumaStay - ${booking.propertyName} (${booking.reference})`)}`,
    `LOCATION:${esc(booking.locationLine)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
