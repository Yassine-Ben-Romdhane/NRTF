"use client";

import { Marquee } from "@/components/ui/marquee";
import { WipeReveal } from "@/components/ui/type-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

function SponsorLogo({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div className="mx-14 flex flex-col items-center gap-3 opacity-40 hover:opacity-90 transition-opacity duration-300 cursor-pointer select-none">
      {icon}
      <span className="text-xs font-sans uppercase tracking-widest text-nrtf-muted/70">{name}</span>
    </div>
  );
}

const SPONSORS = [
  {
    name: "TechCorp",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="6" y="20" width="18" height="18" rx="4" fill="#6dd9cf" />
        <rect x="28" y="12" width="18" height="32" rx="4" fill="#137c55" />
      </svg>
    ),
  },
  {
    name: "Nexara",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <polygon points="28,6 50,46 6,46" fill="none" stroke="#6dd9cf" strokeWidth="2.5" />
        <polygon points="28,18 40,40 16,40" fill="#137c5540" stroke="#137c55" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Volta",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M14 10 L28 46 L42 10" stroke="#6dd9cf" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="20" y1="30" x2="36" y2="30" stroke="#137c55" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "InnoHub",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="20" fill="none" stroke="#6dd9cf" strokeWidth="2" />
        <circle cx="28" cy="28" r="8" fill="none" stroke="#137c55" strokeWidth="2" />
        <circle cx="28" cy="28" r="3" fill="#6dd9cf" />
      </svg>
    ),
  },
  {
    name: "Meridian",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="8" y="12" width="40" height="32" rx="6" fill="none" stroke="#6dd9cf" strokeWidth="2" />
        <line x1="8" y1="28" x2="48" y2="28" stroke="#6dd9cf" strokeWidth="1.5" />
        <line x1="28" y1="12" x2="28" y2="44" stroke="#137c55" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Axiom",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M10 46 L28 10 L46 46" stroke="#6dd9cf" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="18" y1="34" x2="38" y2="34" stroke="#137c55" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Enertek",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M28 6 L48 28 L28 50 L8 28 Z" fill="none" stroke="#137c55" strokeWidth="2.5" />
        <path d="M28 14 L42 28 L28 42 L14 28 Z" fill="#6dd9cf18" stroke="#6dd9cf" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Synthex",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M8 22 Q28 6 48 22 Q28 38 8 22Z" fill="#6dd9cf18" stroke="#6dd9cf" strokeWidth="2" />
        <path d="M8 34 Q28 18 48 34 Q28 50 8 34Z" fill="#137c5518" stroke="#137c55" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "GridX",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <line x1="10" y1="10" x2="46" y2="46" stroke="#6dd9cf" strokeWidth="3" strokeLinecap="round" />
        <line x1="46" y1="10" x2="10" y2="46" stroke="#137c55" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="28" r="5" fill="hsl(var(--nrtf-bg))" stroke="#6dd9cf" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Lumina",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="18" fill="none" stroke="#6dd9cf" strokeWidth="1.5" strokeDasharray="5 3" />
        <circle cx="28" cy="28" r="9" fill="none" stroke="#137c55" strokeWidth="2" />
        <circle cx="28" cy="28" r="4" fill="#6dd9cf" />
      </svg>
    ),
  },
  {
    name: "Arcwave",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M6 38 Q14 10 28 38 Q42 10 50 38" stroke="#6dd9cf" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M12 44 Q20 24 28 44 Q36 24 44 44" stroke="#137c55" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Zenith",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M10 14 L46 14 L10 42 L46 42" stroke="#137c55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="10" y1="28" x2="46" y2="28" stroke="#6dd9cf" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sponsors() {
  return (
    <section id="sponsors" className="relative py-16 overflow-hidden">
      <div className="w-full px-8 md:px-16 lg:px-24 mb-8">
        <div className="relative">
          <WipeReveal className="mb-4">
            <h2 className="font-display text-4xl md:text-5xl text-nrtf-text leading-tight">
              <span className="italic font-normal">Backed by</span>{" "}
              <span className="font-bold"><span className="gradient-text">Industry</span></span>
            </h2>
          </WipeReveal>
          <ScrollReveal delay={150}>
            <p className="text-nrtf-muted/50 text-sm max-w-md">
              Proudly supported by industry leaders who believe in the next generation of engineers.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Single scrolling row */}
      <Marquee duration={35} pauseOnHover fadeAmount={8}>
        {SPONSORS.map((s) => (
          <SponsorLogo key={s.name} icon={s.icon} name={s.name} />
        ))}
      </Marquee>

      {/* CTA */}
      <ScrollReveal delay={100} className="mt-16 text-center">
        <p className="text-nrtf-muted/40 text-sm mb-4">Interested in sponsoring NRTF 3.0?</p>
        <a
          href="mailto:national.re.tech.fusion.ieee.insat@gmail.com"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-nrtf-primary to-nrtf-secondary hover:opacity-90 hover:shadow-[0_0_24px_rgba(109,217,207,0.2)] transition-all duration-300"
        >
          Get in Touch
        </a>
      </ScrollReveal>
    </section>
  );
}
