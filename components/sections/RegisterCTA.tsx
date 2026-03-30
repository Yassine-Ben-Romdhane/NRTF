"use client";

import { ArrowUpRight } from "lucide-react";
import { WipeReveal } from "@/components/ui/type-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// Replace with your actual Google Forms URL
const GOOGLE_FORM_URL = "https://forms.google.com";

export default function RegisterCTA() {
  return (
    <section id="register" className="relative py-20 md:py-28 overflow-hidden">
      {/* Aurora blobs */}
      <div
        className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(109,217,207,0.14) 0%, transparent 65%)", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(19,124,85,0.12) 0%, transparent 65%)", filter: "blur(90px)" }}
      />

      {/* Decorative top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(109,217,207,0.3) 30%, rgba(19,124,85,0.3) 70%, transparent 100%)" }}
      />

      <div className="w-full px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">

          {/* Big editorial headline */}
          <div>
            <WipeReveal className="mb-6">
              <h2 className="font-display leading-[0.88]">
                <span className="block italic font-normal text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-nrtf-text/80">
                  Join the
                </span>
                <span
                  className="block font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                  style={{
                    background: "linear-gradient(135deg, #6dd9cf 0%, #137c55 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Movement
                </span>
              </h2>
            </WipeReveal>
            <ScrollReveal delay={200}>
              <p className="text-nrtf-muted/50 text-base font-sans max-w-sm">
                1–3 May 2026 · INSAT, Tunis · Free entry for all students
              </p>
            </ScrollReveal>
          </div>

          {/* CTA block */}
          <ScrollReveal delay={150} className="flex flex-col items-start lg:items-end gap-6 flex-shrink-0">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-10 py-5 rounded-full font-display font-bold text-lg text-white transition-all duration-300 hover:shadow-[0_0_60px_rgba(109,217,207,0.3)] hover:scale-105"
              style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)" }}
            >
              Register Now
              <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </a>
            <p className="text-nrtf-muted/30 text-xs font-sans uppercase tracking-widest">
              No IEEE membership required
            </p>
          </ScrollReveal>

        </div>
      </div>

      {/* Decorative bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(109,217,207,0.15) 50%, transparent 100%)" }}
      />
    </section>
  );
}
