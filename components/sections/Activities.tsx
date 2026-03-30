"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { WipeReveal } from "@/components/ui/type-reveal";
import {
  Zap,
  Lightbulb,
  Mic,
  Monitor,
  TrendingUp,
  Palette,
  Film,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Activity {
  id: string;
  tag: string;
  tagline: string;
  desc: string;
  accent: string;
  day: number;
  time: string;
  Icon: React.ElementType;
}

const activities: Activity[] = [
  {
    id: "hackathon",
    tag: "Flagship",
    tagline: "Build. Compete. Win.",
    desc: "Unleash your potential, collaborate with your team and bring bold ideas to life. With real-world problems and a spirit of innovation, it's your chance to showcase your skills.",
    accent: "#6dd9cf",
    day: 2,
    time: "09:00",
    Icon: Zap,
  },
  {
    id: "workshops",
    tag: "Education",
    tagline: "Learn. Create. Certify.",
    desc: "Hands-on sessions bring ideas to life with interactive activities, expert guidance, and a collaborative space to explore and create. Earn internationally recognised certificates.",
    accent: "#137c55",
    day: 2,
    time: "09:00",
    Icon: Lightbulb,
  },
  {
    id: "panel",
    tag: "Insights",
    tagline: "Think. Discuss. Inspire.",
    desc: "Industry leaders and academics take the stage to discuss the future of sustainable energy and technology across the region. Fresh perspectives, real conversations.",
    accent: "#6dd9cf",
    day: 1,
    time: "15:30",
    Icon: Mic,
  },
  {
    id: "exhibition",
    tag: "Showcase",
    tagline: "Show. Present. Impress.",
    desc: "Students present their engineering projects to a jury of experts and a live audience of peers, sponsors, and professionals. Your work, your moment on stage.",
    accent: "#137c55",
    day: 2,
    time: "13:00",
    Icon: Monitor,
  },
  {
    id: "pitching",
    tag: "Competition",
    tagline: "Pitch. Connect. Grow.",
    desc: "Present your startup idea or research concept to a panel of investors and decision-makers. Real feedback, real opportunities, real prizes waiting for you.",
    accent: "#6dd9cf",
    day: 3,
    time: "10:00",
    Icon: TrendingUp,
  },
  {
    id: "art",
    tag: "Culture",
    tagline: "Create. Express. Wonder.",
    desc: "A creative showcase at the intersection of technology and art, celebrating student expression and interdisciplinary thinking in a space that blurs every boundary.",
    accent: "#137c55",
    day: 2,
    time: "14:00",
    Icon: Palette,
  },
  {
    id: "films",
    tag: "Culture",
    tagline: "Watch. Learn. Wonder.",
    desc: "Curated short documentaries exploring breakthroughs in renewable energy, AI, and electronics engineering. Stories that inspire and leave you thinking.",
    accent: "#6dd9cf",
    day: 1,
    time: "16:00",
    Icon: Film,
  },
  {
    id: "social",
    tag: "Networking",
    tagline: "Meet. Connect. Grow.",
    desc: "We provide a space to connect, share ideas, and explore new opportunities. Expand your network, learn from others, and discover potential partnerships.",
    accent: "#137c55",
    day: 1,
    time: "21:30",
    Icon: Users,
  },
  {
    id: "awards",
    tag: "Ceremony",
    tagline: "Celebrate. Honor. Remember.",
    desc: "Closing celebration recognising outstanding teams and individuals across all congress tracks and competitions. The perfect end to three days of excellence.",
    accent: "#6dd9cf",
    day: 3,
    time: "13:00",
    Icon: Trophy,
  },
];

/* ── Single event card ─────────────────────────────────────────────── */
function EventCard({
  activity,
  isCenter,
}: {
  activity: Activity;
  isCenter: boolean;
}) {
  const { tag, tagline, desc, accent, day, time, Icon } = activity;

  return (
    <div
      className="flex flex-col gap-5 p-7 h-full"
      style={{
        background: isCenter
          ? `linear-gradient(160deg, hsl(var(--nrtf-surface)) 0%, color-mix(in srgb, ${accent} 9%, hsl(var(--nrtf-surface))) 100%)`
          : "hsl(var(--nrtf-surface))",
        borderRadius: "1.125rem",
        border: isCenter
          ? `1px solid ${accent}45`
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isCenter
          ? `0 24px 80px ${accent}18, 0 0 0 1px ${accent}12`
          : "none",
        minHeight: isCenter ? "420px" : "370px",
      }}
    >
      {/* Tag + day */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] px-3 py-1"
          style={{
            border: `1px solid ${accent}${isCenter ? "40" : "25"}`,
            color: isCenter ? accent : `${accent}70`,
            background: `${accent}${isCenter ? "14" : "0a"}`,
            borderRadius: "6px",
          }}
        >
          {tag}
        </span>
        <span
          className="text-[10px] font-sans uppercase tracking-widest"
          style={{ color: isCenter ? "rgba(248,250,252,0.4)" : "rgba(248,250,252,0.2)" }}
        >
          Day {day} · {time}
        </span>
      </div>

      {/* Icon */}
      <div className="flex-1 flex items-center justify-center py-4">
        <Icon
          size={isCenter ? 92 : 72}
          strokeWidth={1.15}
          style={{
            color: isCenter ? accent : `${accent}45`,
            filter: isCenter ? `drop-shadow(0 0 28px ${accent}45)` : "none",
            transition: "all 0.5s",
          }}
        />
      </div>

      {/* Tagline */}
      <h3
        className="font-display font-bold text-xl leading-snug text-center"
        style={{
          color: isCenter ? "rgba(248,250,252,0.95)" : "rgba(248,250,252,0.38)",
        }}
      >
        {tagline}
      </h3>

      {/* Description */}
      <p
        className="font-sans text-sm leading-relaxed text-center"
        style={{
          color: isCenter ? "rgba(248,250,252,0.55)" : "rgba(248,250,252,0.2)",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

/* ── Main section ──────────────────────────────────────────────────── */
export default function Activities() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });
  const [activeIdx, setActiveIdx] = useState(0);
  const n = activities.length;

  const navigate = (dir: -1 | 1) => {
    setActiveIdx((i) => (i + dir + n) % n);
  };

  return (
    <section id="activities" className="relative py-20 overflow-hidden">
      {/* Aurora — teal top-right */}
      <div
        className="absolute top-[-15%] right-[2%] w-[600px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(109,217,207,0.07) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      {/* Aurora — green bottom-left */}
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(19,124,85,0.07) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="w-full px-8 md:px-16 lg:px-24">
        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <WipeReveal delay={100}>
            <h2 className="font-display text-4xl md:text-5xl text-nrtf-text leading-tight">
              <span className="italic font-normal">What&apos;s</span>{" "}
              <span className="font-bold">
                happening{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #6dd9cf, #137c55)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  this year
                </span>
              </span>
            </h2>
          </WipeReveal>

          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 font-sans text-base"
            style={{ color: "rgba(248,250,252,0.4)" }}
          >
            Discover the exciting opportunities waiting for you at NRTF
          </motion.p>
        </motion.div>

        {/* ── Carousel ── */}
        <div className="flex items-end justify-center gap-3 md:gap-5 overflow-visible pb-10">
          {([-1, 0, 1] as const).map((offset) => {
            const idx = (activeIdx + offset + n) % n;
            const activity = activities[idx];
            const isCenter = offset === 0;

            return (
              <motion.div
                key={`slot-${offset}`}
                className={`flex-shrink-0 ${offset !== 0 ? "hidden sm:block" : ""}`}
                style={{
                  width: isCenter ? "min(320px, 88vw)" : "min(265px, 28vw)",
                  zIndex: isCenter ? 2 : 1,
                }}
                animate={{
                  y: isCenter ? -28 : 22,
                  scale: isCenter ? 1 : 0.88,
                  opacity: isCenter ? 1 : 0.52,
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <EventCard activity={activity} isCenter={isCenter} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-center gap-5 mt-2">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-11 h-11 flex items-center justify-center rounded-full"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(248,250,252,0.6)",
            }}
            whileHover={{
              scale: 1.08,
              borderColor: "rgba(109,217,207,0.45)",
              color: "#6dd9cf",
            }}
            whileTap={{ scale: 0.92 }}
            aria-label="Previous activity"
          >
            <ChevronLeft size={20} />
          </motion.button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {activities.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  width: i === activeIdx ? "22px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background:
                    i === activeIdx
                      ? "#6dd9cf"
                      : "rgba(255,255,255,0.18)",
                  transition: "all 0.35s ease",
                }}
                aria-label={`Activity ${i + 1}`}
              />
            ))}
          </div>

          <motion.button
            onClick={() => navigate(1)}
            className="w-11 h-11 flex items-center justify-center rounded-full"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(248,250,252,0.6)",
            }}
            whileHover={{
              scale: 1.08,
              borderColor: "rgba(109,217,207,0.45)",
              color: "#6dd9cf",
            }}
            whileTap={{ scale: 0.92 }}
            aria-label="Next activity"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        {/* Counter */}
        <div className="flex justify-center mt-5">
          <span
            className="font-sans text-[11px] uppercase tracking-[0.25em] tabular-nums"
            style={{ color: "rgba(248,250,252,0.28)" }}
          >
            {String(activeIdx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
