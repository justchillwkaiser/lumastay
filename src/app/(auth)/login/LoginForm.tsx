"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAction } from "./actions";

export function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await loginAction(
        String(data.get("email") ?? ""),
        String(data.get("password") ?? ""),
        next,
      );
      if (!result.ok) {
        setError(result.error ?? "Sign-in failed.");
        return;
      }
      router.push(result.redirectTo ?? "/");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input label="Password" name="password" type="password" autoComplete="current-password" required />
      {error && (
        <p className="text-label-caps text-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
