"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroScreenProps {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: IntroScreenProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // Phase: in (0.8s) → hold (1.0s) → out (0.8s) → done
    const holdTimer = setTimeout(() => setPhase("hold"), 800);
    const outTimer  = setTimeout(() => setPhase("out"),  1800);
    const doneTimer = setTimeout(() => onDone(),          2700);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, filter: "drop-shadow(0 0 0px rgba(109,217,207,0))" }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: "drop-shadow(0 0 32px rgba(109,217,207,0.35))",
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt="NRTF Logo"
              width={200}
              style={{ background: "transparent" }}
            />
          </motion.div>

          {/* NRTF text */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="relative z-10 mt-6 font-display font-bold tracking-[0.3em] text-base text-nrtf-light/80 uppercase"
          >
            National Re-Tech Fusion
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="outro"
          className="fixed inset-0 z-[100] bg-[#0f172a] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      )}
    </AnimatePresence>
  );
}
