"use client";

// Shared front-page motion leaves (user request: front page must not feel
// static/rigid). All effects are token-safe, respect prefers-reduced-motion
// via useReducedMotion, and are scrub-linked to scroll (no autoplay loops)
// per the DESIGN.md microinteractions pattern.

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

/** Fade + slight upward drift when a section scrolls into view. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxHeroImageProps {
  src: string;
  alt: string;
}

// Hero background parallax: the photograph drifts up to 60px slower than
// the scroll, scaled 1.15 so the frame never exposes an edge. The scrim +
// content stay fixed to the grid — only the image layer moves.
export function ParallaxHeroImage({ src, alt }: ParallaxHeroImageProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0px", "60px"]);

  if (reduceMotion) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    );
  }
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="scale-[1.15] object-cover"
        />
      </motion.div>
    </div>
  );
}
