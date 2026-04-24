"use client";

import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { WipeReveal } from "@/components/ui/type-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

function SponsorLogo({ src, name, imgStyle }: { src: string; name: string; imgStyle?: React.CSSProperties }) {
  return (
    <div className="mx-14 flex flex-col items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer select-none">
      <div className="relative h-14 w-40">
        <Image src={src} alt={name} fill className="object-contain" style={imgStyle} />
      </div>
      <span className="text-xs font-sans uppercase tracking-widest text-nrtf-muted/70">{name}</span>
    </div>
  );
}

// Logos with white backgrounds need invert(1) to appear on the dark site background.
// The PES section logo has a black background → mix-blend-mode:screen drops the black.
const SPONSORS = [
  { name: "INSAT Student Branch", src: "/partners/Insat student branch.png",    imgStyle: { filter: "invert(1)" } },
  { name: "INSAT",                src: "/partners/Insat-removebg-preview.png",  imgStyle: { filter: "invert(1)" } },
  { name: "IEEE PELS",            src: "/partners/pels.png",                    imgStyle: { filter: "invert(1)" } },
  { name: "IEEE PES Section",     src: "/partners/pes section .png",            imgStyle: { mixBlendMode: "screen" as const, filter: "brightness(1.4)" } },
  { name: "PES INSAT",            src: "/partners/pesinsat.png",               imgStyle: { filter: "invert(1)" } },
  { name: "Primavera",            src: "/partners/primavera.png",               imgStyle: undefined },
  { name: "iSol Metal",           src: "/partners/isolmetal.png",               imgStyle: undefined },
  { name: "Kilani Groupe",        src: "/partners/kilani.png",                  imgStyle: undefined },
  { name: "Tunisian Automotive Association", src: "/partners/taa.png",          imgStyle: undefined },
  { name: "Orange Digital Center", src: "/partners/orange-digital-center.png", imgStyle: undefined },
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
          <SponsorLogo key={s.name} src={s.src} name={s.name} imgStyle={s.imgStyle} />
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
