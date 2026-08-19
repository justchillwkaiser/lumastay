import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — LumaStay" };

// Login (plan 3 task 12): Swiss card centered — wordmark, email/password,
// primary Sign In, inline error; role-based landing via server action.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-5">
      <Link
        href="/"
        className="text-[13px] font-medium uppercase tracking-[0.15em] text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        LUMASTAY
      </Link>
      <LabelCaps as="span" className="mt-2">
        Sign in to continue
      </LabelCaps>
      <Card className="mt-8 w-full max-w-[400px] p-8">
        <LoginForm next={next} />
      </Card>
    </div>
  );
}
