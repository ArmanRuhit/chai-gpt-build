"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type WrapperProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Rises in on mount — for above-the-fold content.
 * `fade={false}` keeps text at full opacity (rise only) so contrast audits
 * can never sample it mid-fade; use it for above-the-fold copy. */
export function FadeIn({
  children,
  className,
  delay = 0,
  fade = true,
}: WrapperProps & { fade?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: fade ? 0 : 1, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Rises in when scrolled into view — once per section. */
export function Reveal({ children, className, delay = 0 }: WrapperProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Springy hover/press feedback for calls to action. */
export function CtaMotion({ children, className }: WrapperProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
