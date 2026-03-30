"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

/* ─── TypeReveal ───────────────────────────────────────────────────────
   Character-by-character typewriter for plain string elements.
   Shows a blinking cursor while typing; cursor disappears when done.
──────────────────────────────────────────────────────────────────────── */

interface TypeRevealProps {
  text: string;
  className?: string;
  /** delay before typing starts, in ms */
  delay?: number;
  /** ms per character */
  speed?: number;
}

export function TypeReveal({ text, className, delay = 0, speed = 55 }: TypeRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i++;
        setCount(i);
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [inView, text, delay, speed]);

  const done = count >= text.length;

  return (
    <span ref={ref} className={className}>
      {text.slice(0, count)}
      {!done && (
        <span
          aria-hidden
          className="inline-block w-[2px] h-[0.85em] ml-[1px] animate-blink"
          style={{ background: "currentColor", verticalAlign: "middle" }}
        />
      )}
    </span>
  );
}

/* ─── WipeReveal ───────────────────────────────────────────────────────
   Left-to-right clip-path reveal for any JSX content (headings, etc.).
   Creates the same "being written" feel for elements that aren't plain strings.
──────────────────────────────────────────────────────────────────────── */

interface WipeRevealProps {
  children: React.ReactNode;
  className?: string;
  /** delay before wipe starts, in ms */
  delay?: number;
  /** wipe duration in seconds */
  duration?: number;
}

export function WipeReveal({ children, className, delay = 0, duration = 1.4 }: WipeRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration, delay: delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
