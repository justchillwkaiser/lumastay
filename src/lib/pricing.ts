// Pricing service — spec FR-1.5.
// ALL math in integer cents (string-safe). Never trust client totals;
// server recomputes from Property rates at review + booking creation.

export interface PriceBreakdown {
  nights: number;
  nightlyRate: string;
  subtotal: string;
  cleaningFee: string;
  serviceFee: string;
  taxAmount: string;
  total: string;
}

export interface PriceInput {
  nightlyRate: string;
  cleaningFee: string;
  serviceFeePct: string;
  taxPct: string;
}

/** Parse a decimal string ("3200.00", "5.0") to integer cents / hundredths. */
function toCents(value: string | number): number {
  const s = String(value).trim();
  const neg = s.startsWith("-");
  const abs = neg ? s.slice(1) : s;
  const [whole, frac = ""] = abs.split(".");
  const cents = Number(whole || "0") * 100 + Number((frac + "00").slice(0, 2));
  return neg ? -cents : cents;
}

/** Format integer cents back to a 2-decimal string. */
function fromCents(cents: number): string {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const s = `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
  return neg ? `-${s}` : s;
}

/** Integer percent of an amount, rounded half-up. pct like "5.0" (= 5%). */
function pctOf(amountCents: number, pct: string | number): number {
  // pct in hundredths of a percent: 5.0% -> 500. amount * pctH / 10000.
  const pctH = toCents(pct);
  const num = amountCents * pctH;
  const half = 10000 / 2;
  return num >= 0
    ? Math.floor((num + half) / 10000)
    : -Math.floor((-num + half) / 10000);
}

export function computePrice(property: PriceInput, nights: number): PriceBreakdown {
  if (!Number.isInteger(nights) || nights < 1) {
    throw new Error(`computePrice: nights must be a positive integer, got ${nights}`);
  }
  const nightlyCents = toCents(property.nightlyRate);
  const cleaningCents = toCents(property.cleaningFee);

  const subtotal = nightlyCents * nights;
  // serviceFee = pct × (subtotal + cleaningFee)
  const serviceFee = pctOf(subtotal + cleaningCents, property.serviceFeePct);
  // tax = pct × (subtotal + cleaning + service)
  const taxAmount = pctOf(subtotal + cleaningCents + serviceFee, property.taxPct);
  const total = subtotal + cleaningCents + serviceFee + taxAmount;

  return {
    nights,
    nightlyRate: fromCents(nightlyCents),
    subtotal: fromCents(subtotal),
    cleaningFee: fromCents(cleaningCents),
    serviceFee: fromCents(serviceFee),
    taxAmount: fromCents(taxAmount),
    total: fromCents(total),
  };
}
