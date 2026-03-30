"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WipeReveal } from "@/components/ui/type-reveal";

const days = [
  {
    day: 1,
    date: "1 Mai 2026",
    color: "#137c55",
    label: "Opening Day",
    events: [
      { time: "14:00", name: "Opening Ceremony",      description: "Kick off NRTF 3.0 with keynote addresses, welcome speeches, and the official launch of all congress tracks." },
      { time: "15:30", name: "Panel Discussion",       description: "Industry leaders and academics discuss the future of sustainable energy and technological innovation in Tunisia." },
      { time: "16:00", name: "Short Films Projection", description: "Curated short documentaries exploring breakthroughs in renewable energy, AI, and electronics engineering." },
      { time: "21:30", name: "Social Activities",      description: "Evening networking with organized games, music, and opportunities to connect with fellow attendees and speakers." },
    ],
  },
  {
    day: 2,
    date: "2 Mai 2026",
    color: "#6dd9cf",
    label: "Innovation Day",
    events: [
      { time: "09:00", name: "Hackathon Kick-off",    description: "Teams receive their challenges and begin building innovative solutions across energy, electronics, and AI tracks." },
      { time: "09:00", name: "Certified Workshops",   description: "Hands-on technical workshops led by industry experts, covering cutting-edge tools and methodologies." },
      { time: "13:00", name: "Project Exhibition",    description: "Showcase of student and startup projects, with interactive demos and live Q&A with the creators." },
      { time: "14:00", name: "Art Exhibition",        description: "Creative works at the intersection of technology and art — exploring sustainability through visual media." },
      { time: "21:30", name: "Social Activities",     description: "Wrap up the day with a networking dinner, team building activities, and an exclusive cultural evening." },
    ],
  },
  {
    day: 3,
    date: "3 Mai 2026",
    color: "#6dd9cf",
    label: "Awards Day",
    events: [
      { time: "10:00", name: "Pitching Session",   description: "Hackathon teams present their solutions to a jury panel of investors, engineers, and industry professionals." },
      { time: "12:30", name: "Closing Ceremony",   description: "Final reflections, announcements of future NRTF initiatives, and gratitude to all partners and attendees." },
      { time: "13:00", name: "Awards Ceremony",    description: "Recognition of outstanding participants, teams, and projects across all congress tracks and competitions." },
    ],
  },
];

type EventKey = `${number}-${number}`;

export default function Schedule() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<EventKey | null>(null);

  const toggle = (dayIdx: number, evIdx: number) => {
    const key: EventKey = `${dayIdx}-${evIdx}`;
    setExpanded(prev => (prev === key ? null : key));
  };

  return (
    <section id="schedule" ref={sectionRef} className="relative py-16 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-[10%] w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(109,217,207,0.05) 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      <div className="w-full px-8 md:px-16 lg:px-24">
        {/* Header */}
        <div className="relative mb-12">
          <WipeReveal>
            <h2 className="font-display text-5xl md:text-6xl text-nrtf-text leading-tight">
              <span className="italic font-normal">Our</span>{" "}
              <span className="font-bold"><span className="gradient-text">Schedule</span></span>
            </h2>
          </WipeReveal>
          <p className="text-nrtf-muted/40 text-sm mt-3 font-sans">
            Three days · Click any session to read more
          </p>
        </div>

        {/* Three-column broadcast grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgb(var(--rgb-border) / 0.05)" }}>
          {days.map((day, dayIdx) => (
            <div
              key={day.day}
              className="flex flex-col"
              style={{ background: "hsl(var(--nrtf-bg))" }}
            >
              {/* Day header */}
              <div
                className="px-6 py-5 border-b"
                style={{ borderColor: `${day.color}25`, background: `${day.color}08` }}
              >
                <div
                  className="font-display font-black text-[4.5rem] leading-none mb-1 tabular-nums"
                  style={{ color: `${day.color}30` }}
                >
                  0{day.day}
                </div>
                <div className="font-display font-bold text-lg leading-tight" style={{ color: day.color }}>
                  {day.label}
                </div>
                <div className="text-xs font-sans text-nrtf-muted/40 mt-0.5 uppercase tracking-widest">
                  {day.date}
                </div>
              </div>

              {/* Event list */}
              <div className="flex flex-col">
                {day.events.map((ev, evIdx) => {
                  const key: EventKey = `${dayIdx}-${evIdx}`;
                  const isOpen = expanded === key;

                  return (
                    <div key={key} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <button
                        onClick={() => toggle(dayIdx, evIdx)}
                        className="w-full text-left px-6 py-4 group flex items-start gap-4 transition-all duration-200"
                        style={{ background: isOpen ? `${day.color}0a` : "transparent" }}
                      >
                        {/* Time */}
                        <span
                          className="flex-shrink-0 font-sans text-xs tabular-nums pt-0.5 w-10"
                          style={{ color: `${day.color}70` }}
                        >
                          {ev.time}
                        </span>

                        {/* Dot + line */}
                        <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                          <div
                            className="w-2 h-2 rounded-full transition-all duration-200 flex-shrink-0"
                            style={{
                              background: isOpen ? day.color : `${day.color}40`,
                              boxShadow: isOpen ? `0 0 8px ${day.color}` : "none",
                            }}
                          />
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-display font-semibold text-sm leading-snug transition-colors duration-200"
                            style={{ color: isOpen ? "hsl(var(--nrtf-text))" : "rgb(var(--rgb-text) / 0.55)" }}
                          >
                            {ev.name}
                          </p>
                        </div>

                        {/* Arrow */}
                        <svg
                          width="12" height="12" viewBox="0 0 12 12"
                          className="flex-shrink-0 mt-1 transition-transform duration-200"
                          style={{
                            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            color: `${day.color}60`,
                          }}
                          fill="none"
                        >
                          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Expandable description */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p
                              className="px-6 pb-4 pt-0 text-xs font-sans leading-relaxed pl-[4.25rem]"
                              style={{ color: "rgba(248,250,252,0.45)" }}
                            >
                              {ev.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom border line */}
        <div className="h-px w-full mt-px" style={{ background: "rgb(var(--rgb-border) / 0.05)" }} />
      </div>
    </section>
  );
}
