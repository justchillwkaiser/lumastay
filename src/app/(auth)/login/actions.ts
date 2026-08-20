"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { claimGuestBookings } from "@/lib/guests";

// Login server action (plan 3 task 12 step 1): Better Auth email sign-in,
// then claim any guest bookings matching the email (phase-1-lite wiring),
// and return the role-based landing path.
//
// Better Auth's signInEmail returns Set-Cookie on its Response object, but
// server actions don't automatically forward those cookies to the browser.
// We must set them manually via next/headers cookies().
//
// Key gotcha: the cookie VALUE from Better Auth is URL-encoded (e.g. %2F).
// Next.js cookies().set() URL-encodes the value AGAIN, producing
// double-encoding (%252F) that invalidates the session token. Fix: decode
// the value before passing to cookies().set() so the net encoding is
// correct.
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
    const res = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });

    if (!res.ok) {
      return { ok: false, error: "Invalid email or password." };
    }

    // Forward Set-Cookie headers from Better Auth response to the browser.
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      const cookieStore = await cookies();
      // A single Set-Cookie header may contain multiple cookies separated by
      // commas that are NOT inside quoted values. Split carefully.
      const rawCookies = setCookie.split(/,(?=\s*[\w!#$%&'*+\-.^`|~]+=)/);
      for (const raw of rawCookies) {
        const trimmed = raw.trim();
        const semiIdx = trimmed.indexOf(";");
        const pair = semiIdx > -1 ? trimmed.slice(0, semiIdx) : trimmed;
        const eqIdx = pair.indexOf("=");
        if (eqIdx < 1) continue;
        const name = pair.slice(0, eqIdx).trim();
        // Decode the value to undo Better Auth's encoding — next/headers
        // cookies().set() will re-encode it, producing the correct value.
        const rawValue = pair.slice(eqIdx + 1).trim();
        const value = decodeURIComponent(rawValue);

        // Parse attributes from the rest of the cookie string.
        const rest = semiIdx > -1 ? trimmed.slice(semiIdx + 1) : "";
        const attrs: Record<string, string> = {};
        for (const part of rest.split(";")) {
          const [k, ...v] = part.trim().split("=");
          if (k) attrs[k.trim().toLowerCase()] = v.join("=").trim();
        }

        cookieStore.set(name, value, {
          httpOnly: true,
          secure: attrs.secure?.toLowerCase() === "true",
          sameSite: (attrs.samesite as "lax" | "strict" | "none") ?? "lax",
          path: attrs.path || "/",
          maxAge: attrs["max-age"] ? Number(attrs["max-age"]) : undefined,
        });
      }
    }

    // Read the user from the response body to get role + id.
    const data = await res.json();
    const role = (data.user as { role?: string }).role ?? "GUEST";
    await claimGuestBookings(data.user.id, email);
    const fallback = role === "ADMIN" || role === "STAFF" ? "/admin" : "/account";
    return { ok: true, redirectTo: next ?? fallback };
  } catch (error) {
    console.error("[loginAction] sign-in failed:", error);
    return { ok: false, error: "Invalid email or password." };
  }
}
