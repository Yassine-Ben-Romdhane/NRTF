"use client";

import { useEffect, useRef } from "react";
import { Trophy, Network, Lightbulb, Building2, Users, GraduationCap } from "lucide-react";

const uniqueness = [
  {
    icon:  Trophy,
    title: "First in Tunisia",
    desc:  "The first event in Tunisia to bring together these three leading sectors — renewable energy, electronics, and AI — under one roof.",
    color: "#137c55",
  },
  {
    icon:  Network,
    title: "Innovative Platform",
    desc:  "A unique bridge connecting industry leaders, decision-makers, and the next generation of engineers through panels and hackathons.",
    color: "#6dd9cf",
  },
  {
    icon:  Lightbulb,
    title: "Unique Hackathon",
    desc:  "A dedicated hackathon that sparks innovative ideas and sustainable solutions — with real prizes and real impact.",
    color: "#6dd9cf",
  },
];

const partnerBenefits = [
  {
    icon:  Building2,
    title: "Foster Innovation",
    desc:  "Promoting sustainable entrepreneurship and positioning your brand at the forefront of the tech innovation landscape.",
    color: "#137c55",
  },
  {
    icon:  Users,
    title: "Targeted Audience",
    desc:  "Engage directly with a highly targeted audience of engineering students, researchers, and industry professionals.",
    color: "#6dd9cf",
  },
  {
    icon:  GraduationCap,
    title: "Shape the Future",
    desc:  "Encouraging and investing in the next generation of engineers and technology leaders who will define tomorrow.",
    color: "#6dd9cf",
  },
];

export default function WhyPartner() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 90);
          });
        }
      }),
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="partner" ref={sectionRef} className="relative py-28 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(19,124,85,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section label */}
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-nrtf-accent" />
          <span className="text-nrtf-accent text-sm font-sans uppercase tracking-widest">Opportunities</span>
        </div>

        <div className="reveal mb-5">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-nrtf-text leading-tight">
            One event,{" "}
            <span className="gradient-text">countless opportunities</span>
          </h2>
        </div>

        {/* Block 1: What makes it unique */}
        <div className="reveal mb-4 mt-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-5 rounded-full bg-nrtf-accent" />
            <h3 className="font-display font-semibold text-xl text-nrtf-text">
              What makes this event unique?
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {uniqueness.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="reveal glass rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    borderColor: `${item.color}25`,
                    transitionDelay: `${idx * 80}ms`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}35` }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <h4 className="font-display font-bold text-base text-nrtf-text mb-2">{item.title}</h4>
                  <p className="text-nrtf-muted/65 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="reveal my-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(109,217,207,0.15)] to-transparent" />
          <span className="text-nrtf-muted/40 text-xs uppercase tracking-widest font-sans">Partnership</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(109,217,207,0.15)] to-transparent" />
        </div>

        {/* Block 2: Why become a partner */}
        <div className="reveal mb-4">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-5 rounded-full bg-nrtf-secondary" />
            <h3 className="font-display font-semibold text-xl text-nrtf-text">
              Why Become Our Partner?
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {partnerBenefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="reveal glass rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    borderColor: `${item.color}25`,
                    transitionDelay: `${idx * 80}ms`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}35` }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <h4 className="font-display font-bold text-base text-nrtf-text mb-2">{item.title}</h4>
                  <p className="text-nrtf-muted/65 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom call-out */}
        <div className="reveal mt-14 glass rounded-2xl p-8 text-center border border-[rgba(109,217,207,0.10)]">
          <p className="text-nrtf-muted/70 text-base max-w-2xl mx-auto leading-relaxed">
            Our ecosystem is built on sponsorships and funding to create{" "}
            <strong className="text-nrtf-light">meaningful opportunities for students</strong>.
            Your contribution plays a vital role in making this initiative possible.
          </p>
          <a
            href="#packs"
            className="inline-flex items-center gap-2 mt-6 px-7 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-nrtf-primary to-nrtf-secondary hover:shadow-[0_0_24px_rgba(109,217,207,0.25)] hover:scale-105 transition-all duration-300"
          >
            View Partnership Packs
          </a>
        </div>
      </div>
    </section>
  );
}
