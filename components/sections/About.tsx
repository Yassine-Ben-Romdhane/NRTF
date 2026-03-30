"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { WipeReveal } from "@/components/ui/type-reveal";

const highlights = [
  "3rd Edition of the National Re-Tech Fusion Congress",
  "3 days of innovation, workshops, competitions & culture",
  "7,000DT+ in Hackathon prizes",
  "Organised by IEEE PES × PELS Joint Student Chapter at INSAT",
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="relative py-20 overflow-visible">
      {/* Aurora */}
      <div
        className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(19,124,85,0.10) 0%, transparent 70%)", filter: "blur(100px)" }}
      />

      <div ref={ref} className="w-full px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center">

          {/* ── Left — Oversized overlapping logo ── */}
          <motion.div
            initial={{ opacity: 0, x: -48, scale: 0.94 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex-shrink-0 w-full lg:w-auto flex items-center justify-center lg:justify-start mb-8 lg:mb-0"
            style={{ zIndex: 1 }}
          >
            <Image
              src="/logo-mark.png"
              alt="NRTF Logo"
              width={480}
              height={480}
              className="w-[280px] sm:w-[380px] lg:w-[420px] xl:w-[480px] object-contain"
              priority
            />
          </motion.div>

          {/* ── Right — Content ── */}
          <div
            className="relative w-full lg:w-auto lg:flex-1 flex flex-col gap-6 lg:pl-8 xl:pl-16"
            style={{ zIndex: 2 }}
          >
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            >
              <WipeReveal delay={200}>
                <h2 className="font-display text-4xl md:text-5xl text-nrtf-text leading-tight font-bold">
                  About{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #6dd9cf, #137c55)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    NRTF
                  </span>
                </h2>
              </WipeReveal>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.28, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              <p className="font-sans text-base leading-relaxed" style={{ color: "rgba(248,250,252,0.62)" }}>
                <strong className="text-nrtf-light font-semibold">National Re-Tech Fusion</strong> is
                created by merging the IEEE PES × PELS Joint Student Chapter at INSAT — a vibrant
                convergence of{" "}
                <strong style={{ color: "#6dd9cf", fontWeight: 500 }}>renewable energy</strong>,{" "}
                <strong style={{ color: "#137c55", fontWeight: 500 }}>electronics technologies</strong>,
                and{" "}
                <strong style={{ color: "#6dd9cf", fontWeight: 500 }}>artificial intelligence</strong>{" "}
                as a dynamic platform for knowledge exchange.
              </p>
              <p className="font-sans text-base leading-relaxed" style={{ color: "rgba(248,250,252,0.62)" }}>
                Now in its 3rd edition, NRTF brings together students, professionals, and experts from
                across Tunisia and beyond for three days of innovation, competition, and collaboration.
              </p>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col gap-3"
            >
              {highlights.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.46 + i * 0.07, ease: "easeOut" }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.6}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "#6dd9cf" }}
                  />
                  <span className="font-sans text-sm" style={{ color: "rgba(248,250,252,0.68)" }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
              className="font-display font-bold text-lg italic"
              style={{ color: "rgba(109,217,207,0.65)" }}
            >
              Three days of innovation — already unforgettable.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
