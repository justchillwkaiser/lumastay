"use server";

import { auth } from "@/lib/auth";
import { claimGuestBookings } from "@/lib/guests";

// Login server action (plan 3 task 12 step 1): Better Auth email sign-in,
// then claim any guest bookings matching the email (phase-1-lite wiring),
// and return the role-based landing path.
export interface LoginResult {
  ok: boolean;
  redirectTo?: string;
  error?: string;
}

export async function loginAction(
  email: string,
  password: string,
  next: string | null,
): Promise<LoginResult> {
  try {
    const res = await auth.api.signInEmail({ body: { email, password } });
    const role = (res.user as { role?: string }).role ?? "GUEST";
    await claimGuestBookings(res.user.id, email);
    const fallback = role === "ADMIN" || role === "STAFF" ? "/admin" : "/account";
    return { ok: true, redirectTo: next ?? fallback };
  } catch {
    return { ok: false, error: "Invalid email or password." };
  }
}
