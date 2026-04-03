"use client";

import NeuralBackground from "@/components/ui/flow-field-background";
import { Typewriter } from "@/components/ui/typewriter-text";
import CountdownTimer from "@/components/ui/countdown-timer";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useRef } from "react";

const AXES_WORDS = ["Energy", "Electronics", "Artificial Intelligence"];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: "easeOut" as const },
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden pt-20 pb-16 md:pb-24"
    >
      {/* ── Background ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, #137c5528 0%, transparent 65%), radial-gradient(ellipse 60% 60% at 30% 80%, #6dd9cf12 0%, transparent 55%), linear-gradient(160deg, #0a1628 0%, #0f172a 45%, #0d2a22 80%, #0f172a 100%)",
        }}
      />
      <motion.div className="absolute inset-0 z-[1]" style={{ opacity: bgOpacity }}>
        <NeuralBackground color="#6dd9cf" trailOpacity={0.05} particleCount={120} speed={0.4} />
      </motion.div>

      {/* Top vignette — darkens top edge so navbar stays readable */}
      <div className="absolute top-0 left-0 right-0 h-40 z-[2] bg-gradient-to-b from-nrtf-bg/70 to-transparent pointer-events-none" />
      {/* Bottom fade — blends hero into the next section seamlessly */}
      <div className="absolute bottom-0 left-0 right-0 h-64 z-[2] bg-gradient-to-t from-nrtf-bg via-nrtf-bg/80 to-transparent pointer-events-none" />

      {/* ── Main content — bottom-left ── */}
      <motion.div
        className="relative z-20 px-8 md:px-16 lg:px-24 max-w-[900px]"
        style={{ y: contentY }}
      >
        {/* Title — editorial italic + bold mix */}
        <motion.h1 {...fadeUp(0.2)} className="leading-[0.9] mb-8">
          <span
            className="block font-display italic text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] text-white/90"
          >
            National Re-Tech
          </span>
          <span
            className="block font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[7rem]"
            style={{
              background: "linear-gradient(135deg, #6dd9cf 0%, #137c55 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Fusion 3.0
          </span>
        </motion.h1>

        {/* Typewriter subtitle */}
        <motion.div
          {...fadeUp(0.35)}
          className="flex items-baseline gap-3 text-white/40 text-lg md:text-2xl font-display mb-8"
        >
          <span>The event that unites</span>
          <span
            style={{
              background: "linear-gradient(90deg, #6dd9cf, #137c55)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <Typewriter
              text={AXES_WORDS}
              speed={110}
              deleteSpeed={60}
              delay={2200}
              loop={true}
              cursor="|"
              className="font-bold"
            />
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row items-start gap-4 mb-10">
          <a
            href="#register"
            className="relative text-sm font-semibold rounded-full h-12 ps-6 pe-14 flex items-center overflow-hidden group transition-all duration-500 hover:ps-14 hover:pe-6 bg-gradient-to-r from-nrtf-primary to-nrtf-secondary text-white shadow-[0_0_32px_rgba(109,217,207,0.2)] hover:shadow-[0_0_48px_rgba(109,217,207,0.3)]"
          >
            <span className="relative z-10 transition-all duration-500 whitespace-nowrap">Register Now</span>
            <div className="absolute right-1 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
              <ArrowUpRight size={16} />
            </div>
          </a>

          <a
            href="#about"
            className="relative text-sm font-semibold rounded-full h-12 ps-6 pe-14 flex items-center overflow-hidden group transition-all duration-500 hover:ps-14 hover:pe-6 border border-white/20 text-white/70 hover:border-nrtf-light/50 hover:text-white hover:bg-white/5"
          >
            <span className="relative z-10 transition-all duration-500 whitespace-nowrap">Explore</span>
            <div className="absolute right-1 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-90">
              <ChevronDown size={16} />
            </div>
          </a>
        </motion.div>

        {/* Countdown — horizontal, compact */}
        <motion.div {...fadeUp(0.55)}>
          <p className="text-white/25 text-xs font-sans uppercase tracking-widest mb-3">Don&apos;t miss out</p>
          <CountdownTimer compact />
        </motion.div>
      </motion.div>

      {/* ── Bottom-right metadata ── */}
      <motion.div
        {...fadeUp(0.5)}
        className="absolute bottom-16 right-8 md:right-16 lg:right-24 z-20 text-right hidden md:block"
      >
        <p className="text-white/20 text-xs font-sans uppercase tracking-widest mb-1">Location</p>
        <p className="text-white/50 text-sm font-sans font-semibold">INSAT, Tunis</p>
        <p className="text-white/20 text-xs font-sans uppercase tracking-widest mt-3 mb-1">Date</p>
        <p className="text-white/50 text-sm font-sans font-semibold">1–3 May 2026</p>
      </motion.div>
    </section>
  );
}
