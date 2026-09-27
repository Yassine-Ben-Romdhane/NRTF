"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WipeReveal } from "@/components/ui/type-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const faqs = [
  {
    q: "Who was NRTF 3.0 for?",
    a: "The 2026 edition welcomed engineering and science students, professionals, and researchers from Tunisia and beyond.",
  },
  {
    q: "When and where was NRTF 3.0 held?",
    a: "The congress took place 1–3 May 2026 at Hotel Rivera in Sousse, Tunisia.",
  },
  {
    q: "Was IEEE membership required?",
    a: "No, IEEE membership was not required for the 2026 edition.",
  },
  {
    q: "What was the hackathon team size?",
    a: "The 2026 program preferred teams of 2 to 5 members.",
  },
  {
    q: "Can I still register?",
    a: "No. NRTF 3.0 ended on 3 May 2026, and registration is closed.",
  },
  {
    q: "Who organized the 2026 edition?",
    a: "The IEEE PES × PELS Joint Student Chapter at INSAT organized NRTF 3.0.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-16 overflow-hidden">
      <div className="w-full px-8 md:px-16 lg:px-24">
        <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left col (35%): label, h2 — sticky */}
          <div className="lg:w-[35%] lg:sticky lg:top-28">
            <ScrollReveal className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-nrtf-secondary" />
              <span className="text-nrtf-secondary text-sm font-sans uppercase tracking-widest">FAQ</span>
            </ScrollReveal>
            <WipeReveal>
              <h2 className="font-display text-4xl md:text-5xl text-nrtf-text leading-tight">
                <span className="italic font-normal">Frequently</span><br />
                <span className="font-bold">Asked <span className="gradient-text">Questions</span></span>
              </h2>
            </WipeReveal>
          </div>

          {/* Right col (65%): accordion */}
          <div className="lg:w-[65%] space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="rounded-2xl border border-[rgba(109,212,200,0.12)] overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="font-display font-semibold text-nrtf-text text-sm md:text-base">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className="flex-shrink-0 text-nrtf-primary transition-transform duration-300"
                      style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 pt-4 text-nrtf-muted/70 text-sm leading-relaxed border-t border-[rgba(109,212,200,0.08)]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
