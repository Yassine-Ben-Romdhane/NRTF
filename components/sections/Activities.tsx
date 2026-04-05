"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { WipeReveal } from "@/components/ui/type-reveal";
import {
  Zap,
  Lightbulb,
  TrendingUp,
  Film,
  Users,
  Trophy,
  Star,
  PartyPopper,
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
    id: "opening",
    tag: "Ceremony",
    tagline: "Welcome. Launch. Begin.",
    desc: "Kick off NRTF 3.0 with keynote addresses, welcome speeches, and the official launch of all congress tracks. The start of three days of innovation.",
    accent: "#137c55",
    day: 1,
    time: "14:00",
    Icon: Star,
  },
  {
    id: "films-expo",
    tag: "Culture",
    tagline: "Watch. Explore. Wonder.",
    desc: "Short film projections (courts métrages) paired with an artistic and scientific exhibition — a unique blend of creativity and engineering that blurs every boundary.",
    accent: "#6dd9cf",
    day: 1,
    time: "16:00",
    Icon: Film,
  },
  {
    id: "social",
    tag: "Networking",
    tagline: "Meet. Connect. Grow.",
    desc: "Evening networking with organized games, music, and opportunities to connect with fellow attendees and speakers. Expand your network and discover new partnerships.",
    accent: "#137c55",
    day: 1,
    time: "21:30",
    Icon: Users,
  },
  {
    id: "hackathon",
    tag: "Flagship",
    tagline: "Build. Compete. Win.",
    desc: "Unleash your potential, collaborate with your team and bring bold ideas to life. With real-world problems and a spirit of innovation, it's your chance to shine.",
    accent: "#6dd9cf",
    day: 2,
    time: "08:00",
    Icon: Zap,
  },
  {
    id: "workshops",
    tag: "Education",
    tagline: "Learn. Create. Certify.",
    desc: "Hands-on sessions with expert guidance and a collaborative space to explore and create. Earn internationally recognised certificates.",
    accent: "#137c55",
    day: 2,
    time: "09:00",
    Icon: Lightbulb,
  },
  {
    id: "pitching",
    tag: "Competition",
    tagline: "Pitch. Connect. Grow.",
    desc: "Present your solutions to a panel of investors and decision-makers. Real feedback, real opportunities, and real prizes waiting for you.",
    accent: "#6dd9cf",
    day: 3,
    time: "08:30",
    Icon: TrendingUp,
  },
  {
    id: "closing",
    tag: "Ceremony",
    tagline: "Reflect. Thank. Celebrate.",
    desc: "Final reflections, announcements of future NRTF initiatives, and heartfelt gratitude to all partners, speakers, and attendees who made it possible.",
    accent: "#137c55",
    day: 3,
    time: "11:30",
    Icon: PartyPopper,
  },
  {
    id: "awards",
    tag: "Awards",
    tagline: "Celebrate. Honor. Remember.",
    desc: "Recognition and celebration of outstanding participants, teams, and projects across all congress tracks. The perfect end to three days of excellence.",
    accent: "#6dd9cf",
    day: 3,
    time: "12:00",
    Icon: Trophy,
  },
];

const CARD_WIDTH = 300;
const CARD_GAP = 20;

/* ── Single event card ─────────────────────────────────────────────── */
function EventCard({
  activity,
  isActive,
  index,
}: {
  activity: Activity;
  isActive: boolean;
  index: number;
}) {
  const { tag, tagline, desc, accent, day, time, Icon } = activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      animate={{
        scale: isActive ? 1 : 0.95,
        opacity: isActive ? 1 : 0.55,
      }}
      whileHover={{ scale: 1.02, opacity: 1 }}
      className="flex flex-col gap-5 p-7 h-full select-none"
      style={{
        width: CARD_WIDTH,
        minWidth: CARD_WIDTH,
        background: isActive
          ? `linear-gradient(160deg, hsl(var(--nrtf-surface)) 0%, color-mix(in srgb, ${accent} 9%, hsl(var(--nrtf-surface))) 100%)`
          : "hsl(var(--nrtf-surface))",
        borderRadius: "1.125rem",
        border: isActive
          ? `1px solid ${accent}45`
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isActive
          ? `0 24px 80px ${accent}18, 0 0 0 1px ${accent}12`
          : "none",
        transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
      }}
    >
      {/* Tag + day */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] px-3 py-1"
          style={{
            border: `1px solid ${accent}${isActive ? "40" : "25"}`,
            color: isActive ? accent : `${accent}70`,
            background: `${accent}${isActive ? "14" : "0a"}`,
            borderRadius: "6px",
            transition: "all 0.4s ease",
          }}
        >
          {tag}
        </span>
        <span
          className="text-[10px] font-sans uppercase tracking-widest"
          style={{
            color: isActive ? "rgba(248,250,252,0.4)" : "rgba(248,250,252,0.2)",
            transition: "color 0.4s ease",
          }}
        >
          Day {day} · {time}
        </span>
      </div>

      {/* Icon */}
      <div className="flex-1 flex items-center justify-center py-4">
        <Icon
          size={isActive ? 80 : 64}
          strokeWidth={1.15}
          style={{
            color: isActive ? accent : `${accent}45`,
            filter: isActive ? `drop-shadow(0 0 28px ${accent}45)` : "none",
            transition: "all 0.4s ease",
          }}
        />
      </div>

      {/* Tagline */}
      <h3
        className="font-display font-bold text-xl leading-snug text-center"
        style={{
          color: isActive ? "rgba(248,250,252,0.95)" : "rgba(248,250,252,0.38)",
          transition: "color 0.4s ease",
        }}
      >
        {tagline}
      </h3>

      {/* Description */}
      <p
        className="font-sans text-sm leading-relaxed text-center"
        style={{
          color: isActive ? "rgba(248,250,252,0.55)" : "rgba(248,250,252,0.2)",
          transition: "color 0.4s ease",
        }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

/* ── Main section ──────────────────────────────────────────────────── */
export default function Activities() {
  const headerRef = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });
  const [activeIdx, setActiveIdx] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Directly set padding on the DOM element so it's applied before scroll reset
  const applyPadding = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const p = Math.max(32, Math.floor(el.clientWidth / 2 - CARD_WIDTH / 2));
    el.style.paddingLeft = `${p}px`;
    el.style.paddingRight = `${p}px`;
    el.scrollLeft = 0;
  }, []);

  useEffect(() => {
    applyPadding();
    window.addEventListener("resize", applyPadding);
    return () => window.removeEventListener("resize", applyPadding);
  }, [applyPadding]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    const idx = Math.round(el.scrollLeft / (CARD_WIDTH + CARD_GAP));
    setActiveIdx(Math.max(0, Math.min(idx, activities.length - 1)));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const scrollTo = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD_WIDTH + CARD_GAP), behavior: "smooth" });
  };

  // With symmetric padding, scrollLeft = idx * step perfectly centers card[idx]
  const scrollToCard = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * (CARD_WIDTH + CARD_GAP), behavior: "smooth" });
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

      <div className="w-full">
        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center px-8 md:px-16 lg:px-24"
        >
          <WipeReveal delay={100} className="text-center">
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

        {/* ── Horizontal scroll area ── */}
        <div className="relative">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, hsl(var(--nrtf-bg)), transparent)",
              opacity: canScrollLeft ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, hsl(var(--nrtf-bg)), transparent)",
              opacity: canScrollRight ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />

          <div
            ref={scrollRef}
            className="flex items-stretch overflow-x-auto pb-8 scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{
              gap: CARD_GAP,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingLeft: 32,
              paddingRight: 32,
            }}
          >
            {activities.map((activity, i) => (
              <div
                key={activity.id}
                className="flex-shrink-0"
                style={{ scrollSnapAlign: "center" }}
              >
                <EventCard
                  activity={activity}
                  isActive={i === activeIdx}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-center gap-5 mt-4 px-8">
          <motion.button
            onClick={() => scrollTo(-1)}
            className="w-11 h-11 flex items-center justify-center rounded-full"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: canScrollLeft ? "rgba(248,250,252,0.6)" : "rgba(248,250,252,0.15)",
              pointerEvents: canScrollLeft ? "auto" : "none",
              transition: "color 0.3s ease",
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
                onClick={() => scrollToCard(i)}
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
            onClick={() => scrollTo(1)}
            className="w-11 h-11 flex items-center justify-center rounded-full"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: canScrollRight ? "rgba(248,250,252,0.6)" : "rgba(248,250,252,0.15)",
              pointerEvents: canScrollRight ? "auto" : "none",
              transition: "color 0.3s ease",
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
            {String(activeIdx + 1).padStart(2, "0")} / {String(activities.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
