"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

const packs = [
  {
    tier: "Bronze", price: "3 000", color: "#e0a458",
    perks: [
      "Logo on all social media publications",
      "Logo on badges, posters, and flyers",
      "Acknowledgement in front of the audience",
      "Welcome package",
    ],
  },
  {
    tier: "Silver", price: "7 000", color: "#a8b8c8",
    perks: [
      "All Bronze benefits",
      "Logo on audiovisual materials during sessions",
      "Partnership announcement on social media",
      "20-second promotional video during ceremonies",
    ],
  },
  {
    tier: "Gold", price: "10 000", color: "#e8c358", featured: true,
    perks: [
      "All Silver benefits",
      "5-minute company presentation at opening",
      "Access to participants' database",
      "Opportunity to host a 15-minute conference",
    ],
  },
  {
    tier: "Platinum", price: "15 000", color: "#6dd9cf",
    perks: [
      "All Gold benefits",
      "Special mentions during interviews and TV",
      "One-minute teaser video at end of event",
      "An award presented in your company's name",
    ],
  },
];

export default function Packs() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 100);
          });
        }
      }),
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="packs" ref={sectionRef} className="relative py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-nrtf-secondary" />
          <span className="text-nrtf-secondary text-sm font-sans uppercase tracking-widest">Sponsorship</span>
        </div>

        <h2 className="reveal font-display font-bold text-4xl md:text-5xl text-nrtf-text mb-4 leading-tight">
          Partnership <span className="gradient-text">Packs</span>
        </h2>
        <p className="reveal text-nrtf-muted/60 text-sm max-w-md mb-16">
          Choose the partnership tier that best fits your engagement goals.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {packs.map((pack, idx) => (
            <div
              key={pack.tier}
              className={`reveal relative rounded-2xl p-7 border transition-all duration-300 hover:translate-y-[-2px] ${
                pack.featured ? "ring-1" : ""
              }`}
              style={{
                background: `${pack.color}08`,
                borderColor: `${pack.color}30`,
                transitionDelay: `${idx * 80}ms`,
              }}
            >
              {pack.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ background: pack.color, color: "#0f172a" }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-baseline justify-between mb-5">
                <h3
                  className="font-display font-bold text-xl"
                  style={{ color: pack.color }}
                >
                  {pack.tier.toUpperCase()}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-2xl text-nrtf-text">{pack.price}</span>
                  <span className="text-xs text-nrtf-muted/50 font-sans">DT</span>
                </div>
              </div>

              <div
                className="h-px mb-5"
                style={{ background: `linear-gradient(90deg, ${pack.color}40, transparent)` }}
              />

              <ul className="space-y-2.5">
                {pack.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5">
                    <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: pack.color }} />
                    <span className="text-sm text-nrtf-muted/70">{perk}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="mt-6 flex items-center justify-center w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:brightness-110"
                style={{
                  background: `${pack.color}15`,
                  border: `1px solid ${pack.color}30`,
                  color: pack.color,
                }}
              >
                Choose {pack.tier}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
