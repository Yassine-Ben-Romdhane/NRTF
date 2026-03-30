"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { WipeReveal } from "@/components/ui/type-reveal";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface Member {
  id: string;
  name: string;
  role: string;
  photo: string;
  linkedinUrl: string;
  color: string;
}

const members: Member[] = [
  { id: "1", name: "Member Name", role: "President",            photo: "https://i.pravatar.cc/300?img=11", linkedinUrl: "https://linkedin.com", color: "#6dd9cf" },
  { id: "2", name: "Member Name", role: "Vice President",       photo: "https://i.pravatar.cc/300?img=12", linkedinUrl: "https://linkedin.com", color: "#137c55" },
  { id: "3", name: "Member Name", role: "Technical Lead",       photo: "https://i.pravatar.cc/300?img=13", linkedinUrl: "https://linkedin.com", color: "#6dd9cf" },
  { id: "4", name: "Member Name", role: "Logistics Lead",       photo: "https://i.pravatar.cc/300?img=14", linkedinUrl: "https://linkedin.com", color: "#137c55" },
  { id: "5", name: "Member Name", role: "Sponsorship Lead",     photo: "https://i.pravatar.cc/300?img=15", linkedinUrl: "https://linkedin.com", color: "#6dd9cf" },
  { id: "6", name: "Member Name", role: "Communications Lead",  photo: "https://i.pravatar.cc/300?img=16", linkedinUrl: "https://linkedin.com", color: "#137c55" },
  { id: "7", name: "Member Name", role: "Design Lead",          photo: "https://i.pravatar.cc/300?img=17", linkedinUrl: "https://linkedin.com", color: "#6dd9cf" },
  { id: "8", name: "Member Name", role: "Program Coordinator",  photo: "https://i.pravatar.cc/300?img=18", linkedinUrl: "https://linkedin.com", color: "#137c55" },
];

const MemberCard: React.FC<{ member: Member }> = ({ member }) => (
  <div
    className="group relative overflow-hidden rounded-2xl flex-shrink-0 w-[210px]"
    style={{ border: "1px solid rgba(109,217,207,0.10)", background: "rgba(109,217,207,0.03)" }}
  >
    {/* Photo */}
    <div className="relative w-[210px] h-[210px] overflow-hidden bg-nrtf-bg/80">
      {/* Initials placeholder */}
      <div
        className="absolute inset-0 flex items-center justify-center text-3xl font-display font-bold select-none"
        style={{ background: `linear-gradient(135deg, ${member.color}18, hsl(var(--nrtf-bg)))`, color: `${member.color}40` }}
      >
        {member.name.split(" ").map(w => w[0]).join("")}
      </div>

      {/* Photo — grayscale → colour on hover */}
      <Image
        src={member.photo}
        alt={member.name}
        fill
        className="object-cover object-top transition-all duration-500 grayscale group-hover:grayscale-0"
        sizes="210px"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-nrtf-bg/30 group-hover:bg-nrtf-bg/0 transition-all duration-500" />

      {/* LinkedIn — slides up on hover */}
      <a
        href={member.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${member.name} on LinkedIn`}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: member.color, color: "#0f172a" }}
      >
        <LinkedinIcon size={13} />
      </a>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: `linear-gradient(90deg, ${member.color}, transparent)` }}
      />
    </div>

    {/* Info */}
    <div className="px-4 py-3">
      <h3 className="font-display font-bold text-nrtf-text text-sm mb-0.5 group-hover:text-nrtf-light transition-colors duration-300 truncate">
        {member.name}
      </h3>
      <p className="text-xs font-sans uppercase tracking-wide truncate" style={{ color: member.color }}>
        {member.role}
      </p>
    </div>
  </div>
);

export default function Speakers() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scroll = (dir: "left" | "right") =>
    trackRef.current?.scrollBy({ left: dir === "right" ? 600 : -600, behavior: "smooth" });

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  return (
    <section id="speakers" ref={sectionRef} className="relative py-16 overflow-hidden">
      <div className="w-full px-8 md:px-16 lg:px-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative mb-10"
        >
          <WipeReveal className="mb-4">
            <h2 className="font-display text-4xl md:text-5xl text-nrtf-text leading-tight">
              <span className="italic font-normal">Organizing</span>{" "}
              <span className="font-bold"><span className="gradient-text">Committee</span></span>
            </h2>
          </WipeReveal>
          <p className="text-nrtf-muted/60 text-sm max-w-md">
            The people behind NRTF 3.0 — dedicated students building something extraordinary.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          {/* Left fade edge */}
          <div
            className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, hsl(var(--nrtf-bg)), transparent)" }}
          />
          {/* Right fade edge */}
          <div
            className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, hsl(var(--nrtf-bg)), transparent)" }}
          />

          {/* Scrollable track */}
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex gap-3 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Leading spacer so first card clears the fade */}
            <div className="flex-shrink-0 w-2" />
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
            {/* Trailing spacer */}
            <div className="flex-shrink-0 w-2" />
          </div>

          {/* Scroll buttons */}
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => scroll("left")}
              disabled={!canLeft}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 border-nrtf-accent/30 text-nrtf-light hover:bg-nrtf-accent/15 hover:border-nrtf-accent/60 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canRight}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 border-nrtf-accent/30 text-nrtf-light hover:bg-nrtf-accent/15 hover:border-nrtf-accent/60 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
