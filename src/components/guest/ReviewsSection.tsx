import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";

import type { ReviewCardData } from "@/lib/reviews";

export interface ReviewsSectionProps {
  reviews: ReviewCardData[];
  rating: number;
  reviewCount: number;
}

// Reviews section (plan 2 task 6, per mockup secondpage): Star fill +
// "**4.95** · 128 reviews" headline-sm header, 2-col review cards (avatar
// circle initial, name 14px/600, date 13px gray, body 14px) from
// listApprovedReviews (max 2 shown), ghost "Show all N reviews" button
// stubbed to `#` — full modal is spec §10 phase 2.
export function ReviewsSection({
  reviews,
  rating,
  reviewCount,
}: ReviewsSectionProps) {
  const shown = reviews.slice(0, 2);

  return (
    <section aria-labelledby="reviews-heading">
      <h2
        id="reviews-heading"
        className="flex items-center gap-2 text-headline-sm font-semibold leading-headline-sm tracking-headline-sm text-on-surface"
      >
        <Star
          size={24}
          weight="fill"
          strokeWidth={1.5}
          className="text-on-surface"
          aria-hidden="true"
        />
        <span>
          {rating.toFixed(2)} · {reviewCount} reviews
        </span>
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {shown.map((review) => (
          <article key={`${review.guestName}-${review.stayDate ?? ""}`}>
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-sm font-semibold text-on-surface"
                aria-hidden="true"
              >
                {review.guestName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {review.guestName}
                </p>
                {review.stayDate ? (
                  <p className="text-[13px] text-on-surface-variant">
                    {review.stayDate}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface">
              {review.body}
            </p>
          </article>
        ))}
      </div>

      {/* Ghost button per mockup; href stubbed to # — reviews modal is
          spec §10 phase 2. focus-visible ring comes from the global
          :focus-visible rule in globals.css (plan 2 task 7). */}
      <Link
        href="#"
        className="mt-8 inline-flex items-center justify-center rounded border border-outline-variant bg-transparent px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Show all {reviewCount} reviews
      </Link>
    </section>
  );
}
