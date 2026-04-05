"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WipeReveal } from "@/components/ui/type-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const faqs = [
  {
    q: "Who can participate in NRTF 3.0?",
    a: "NRTF 3.0 is open to all engineering and science students from Tunisian universities, regardless of their year or field of study. Professionals and researchers are also welcome to attend.",
  },
  {
    q: "When and where does the event take place?",
    a: "NRTF 3.0 takes place from May 1st to 3rd, 2026 at a 4-star hotel! Hotel Rivera, Sousse.",
  },
  {
    q: "Do I need to be an IEEE member to register?",
    a: "No, IEEE membership is not required.",
  },
  {
    q: "Can I participate in the Hackathon alone or do I need a team?",
    a: "Teams of 2 to 5 members are preferred for the Hackathon.",
  },
  {
    q: "What should I bring to the event?",
    a: "Bring your student ID, a laptop (especially for the Hackathon and workshops), and your enthusiasm! Meals and refreshments will be provided during the event days.",
  },
  {
    q: "How can my company become a sponsor?",
    a: "Contact us at national.re.tech.fusion.ieee.insat@gmail.com for sponsorship packages and partnership opportunities tailored to your company's goals.",
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
