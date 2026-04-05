"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const ORG_BADGES = [
  {
    name: "IEEE PES × PELS Joint Student Chapter",
    logos: [
      { src: "/partners/pesinsat.png",  alt: "IEEE PES INSAT" },
      { src: "/partners/pels.png",      alt: "IEEE PELS INSAT" },
    ],
  },
  {
    name: "INSAT IEEE Student Branch",
    logos: [
      { src: "/partners/Insat student branch.png", alt: "INSAT IEEE Student Branch" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[rgba(109,217,207,0.12)] py-8 overflow-hidden">
      {/* Subtle gradient top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #6dd9cf, #137c55, #6dd9cf, transparent)",
        }}
      />

      <div className="w-full px-8 md:px-16 lg:px-24">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + name */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="NRTF Logo" width={48} style={{ background: "transparent" }} />
              <div>
                <div className="font-display font-bold text-base gradient-text">
                  National Re-Tech Fusion
                </div>
                <div className="text-xs text-nrtf-muted/40 font-sans">3rd Edition · 2026</div>
              </div>
            </div>

            {/* Org badges */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {ORG_BADGES.map((org) => (
                <div
                  key={org.name}
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  {org.logos.map((logo) => (
                    <div key={logo.alt} className="relative h-6 w-10 flex-shrink-0">
                      <Image src={logo.src} alt={logo.alt} fill className="object-contain" style={{ filter: "invert(1)", opacity: 0.7 }} />
                    </div>
                  ))}
                  <span className="text-xs font-sans text-nrtf-muted/50">{org.name}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/national.retech.fusion/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nrtf-muted/50 hover:text-nrtf-light transition-colors"
                aria-label="Instagram"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61556516330833"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nrtf-muted/50 hover:text-nrtf-light transition-colors"
                aria-label="Facebook"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>

            {/* General email */}
            <a
              href="mailto:national.re.tech.fusion.ieee.insat@gmail.com"
              className="flex items-center gap-2 text-xs text-nrtf-muted/50 hover:text-nrtf-light transition-colors font-sans"
            >
              <Mail size={12} />
              national.re.tech.fusion.ieee.insat@gmail.com
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} className="mt-8 text-center text-xs text-nrtf-muted/30 font-sans">
          © {year} National Re-Tech Fusion. All rights reserved. · INSAT, Tunis, Tunisia
        </ScrollReveal>
      </div>
    </footer>
  );
}
