"use client";

// Booking flow step transition (follow-up: booking flow animations).
// Konsep: setiap step dalam booking flow (dates → guests → details → review)
// masuk dengan fade + subtle slide, bukan hard page-flash. Swiss UI =
// restrained — animasi untuk feedback spatial (forward/back), bukan
// decoration.
//
// Analogi: macam berjalan masuk bilik — kau nampak bilik baru "muncul"
// secara beransur, bukan teleport.

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Wrap kandungan step page dengan transition masuk.
 * Direction: "forward" (slide dari kanan) atau "back" (dari kiri).
 * Default forward sebab booking flow biasanya linear.
 */
export function StepTransition({
  children,
  direction = "forward",
  className,
}: {
  children: ReactNode;
  direction?: "forward" | "back";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  // Reduced motion → render statik terus (accessibility).
  if (reduceMotion) return <div className={className}>{children}</div>;

  const x = direction === "forward" ? 24 : -24;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
