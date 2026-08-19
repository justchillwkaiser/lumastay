"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/Input";
import { LabelCaps } from "@/components/ui/LabelCaps";

// Details form (plan 3 task 3): react-hook-form + zod. On submit the values
// are carried forward as URL params (GET-style navigation) so /book/review
// stays a pure RSC with server re-validation.
const detailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+60[\d\s-]{8,}$/, "Use Malaysian format, e.g. +60 12 345 6789"),
  requests: z.string().max(500, "Keep it under 500 characters").optional(),
});

export type DetailsFormValues = z.infer<typeof detailsSchema>;

export interface DetailsFormProps {
  defaults: DetailsFormValues;
  /** Serialized booking params (property/dates/guests) to preserve. */
  baseSearch: string;
}

export function DetailsForm({ defaults, baseSearch }: DetailsFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: defaults,
  });

  const onSubmit = (values: DetailsFormValues) => {
    const sp = new URLSearchParams(baseSearch);
    sp.set("name", values.name);
    sp.set("email", values.email);
    sp.set("phone", values.phone);
    if (values.requests?.trim()) sp.set("requests", values.requests.trim());
    else sp.delete("requests");
    router.push(`/book/review?${sp.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-[420px]">
      <div className="space-y-6">
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          placeholder="+60 12 345 6789"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <div className="flex flex-col gap-1">
          <LabelCaps htmlFor="requests">Special requests (optional)</LabelCaps>
          <textarea
            id="requests"
            rows={4}
            className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface outline-none focus:border-outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            {...register("requests")}
          />
          {errors.requests?.message ? (
            <p className="text-label-caps text-error" role="alert">
              {errors.requests.message}
            </p>
          ) : null}
        </div>
      </div>
      <button
        type="submit"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Continue to review
      </button>
    </form>
  );
}
