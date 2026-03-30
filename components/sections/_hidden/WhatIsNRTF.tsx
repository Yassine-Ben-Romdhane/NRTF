"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOP_LEAF =
  "M 130,12 C 155,18 172,56 172,92 C 172,128 151,162 130,174 " +
  "C 109,162 88,128 88,92 C 88,56 105,18 130,12 Z";

const SIDE_LEAF =
  "M 0,-58 C 22,-46 40,-22 40,0 C 40,22 22,46 0,58 " +
  "C -22,46 -40,22 -40,0 C -40,-22 -22,-46 0,-58 Z";

const axes = [
  {
    id: "energy",
    label: "Renewable Energy",
    color: "#137c55",
    desc: "Exploring solar, wind, and sustainable energy solutions that power a greener future.",
    position: "left" as const,
  },
  {
    id: "electronics",
    label: "Electronics",
    color: "#6dd9cf",
    desc: "Pushing the boundaries of power electronics, embedded systems, and IoT.",
    position: "right" as const,
  },
  {
    id: "ai",
    label: "Artificial Intelligence",
    color: "#6dd9cf",
    desc: "Harnessing machine learning and data science to solve pressing challenges.",
    position: "top" as const,
  },
];

function TopVeins({ color }: { color: string }) {
  return (
    <g stroke={color} fill="none" opacity="0.88">
      <line x1="130" y1="16" x2="130" y2="170" strokeWidth="1.4" />
      <polyline points="130,46  121,46  110,57"           strokeWidth="1" />
      <polyline points="130,70  120,70  107,81  107,90"   strokeWidth="1" />
      <polyline points="130,95  119,95  105,107"          strokeWidth="1" />
      <polyline points="130,119 121,119 109,131 109,138"  strokeWidth="1" />
      <polyline points="130,46  139,46  150,57"           strokeWidth="1" />
      <polyline points="130,70  140,70  153,81  153,90"   strokeWidth="1" />
      <polyline points="130,95  141,95  155,107"          strokeWidth="1" />
      <polyline points="130,119 139,119 151,131 151,138"  strokeWidth="1" />
      <circle cx="110" cy="57"  r="1.8" fill={color} />
      <circle cx="107" cy="90"  r="1.8" fill={color} />
      <circle cx="105" cy="107" r="1.8" fill={color} />
      <circle cx="109" cy="138" r="1.8" fill={color} />
      <circle cx="150" cy="57"  r="1.8" fill={color} />
      <circle cx="153" cy="90"  r="1.8" fill={color} />
      <circle cx="155" cy="107" r="1.8" fill={color} />
      <circle cx="151" cy="138" r="1.8" fill={color} />
      <line x1="110" y1="57"  x2="107" y2="90"  strokeWidth="0.5" opacity="0.5" />
      <line x1="107" y1="90"  x2="105" y2="107" strokeWidth="0.5" opacity="0.5" />
      <line x1="150" y1="57"  x2="153" y2="90"  strokeWidth="0.5" opacity="0.5" />
      <line x1="153" y1="90"  x2="155" y2="107" strokeWidth="0.5" opacity="0.5" />
      <line x1="110" y1="57"  x2="130" y2="70"  strokeWidth="0.5" opacity="0.5" />
      <line x1="150" y1="57"  x2="130" y2="70"  strokeWidth="0.5" opacity="0.5" />
      <line x1="107" y1="90"  x2="130" y2="95"  strokeWidth="0.5" opacity="0.5" />
      <line x1="153" y1="90"  x2="130" y2="95"  strokeWidth="0.5" opacity="0.5" />
    </g>
  );
}

function SideVeins({ color }: { color: string }) {
  return (
    <g stroke={color} fill="none" opacity="0.88">
      <line x1="0" y1="-53" x2="0" y2="53" strokeWidth="1.4" />
      <polyline points="0,-28 -9,-28 -21,-17"       strokeWidth="1" />
      <polyline points="0,-8  -9,-8  -23,5  -23,13" strokeWidth="1" />
      <polyline points="0,15  -9,15  -21,26"         strokeWidth="1" />
      <polyline points="0,-28  9,-28  21,-17"       strokeWidth="1" />
      <polyline points="0,-8   9,-8   23,5   23,13" strokeWidth="1" />
      <polyline points="0,15   9,15   21,26"         strokeWidth="1" />
      <circle cx="-21" cy="-17" r="1.8" fill={color} />
      <circle cx="-23" cy="13"  r="1.8" fill={color} />
      <circle cx="-21" cy="26"  r="1.8" fill={color} />
      <circle cx="21"  cy="-17" r="1.8" fill={color} />
      <circle cx="23"  cy="13"  r="1.8" fill={color} />
      <circle cx="21"  cy="26"  r="1.8" fill={color} />
      <line x1="-21" y1="-17" x2="-23" y2="13"  strokeWidth="0.5" opacity="0.5" />
      <line x1="21"  y1="-17" x2="23"  y2="13"  strokeWidth="0.5" opacity="0.5" />
      <line x1="-21" y1="-17" x2="0"   y2="-8"  strokeWidth="0.5" opacity="0.5" />
      <line x1="21"  y1="-17" x2="0"   y2="-8"  strokeWidth="0.5" opacity="0.5" />
    </g>
  );
}

function AxisPanel({ axis }: { axis: typeof axes[0] }) {
  return (
    <motion.div
      key={axis.id}
      initial={axis.position === "top" ? { opacity: 0, y: -16 } : axis.position === "left" ? { opacity: 0, x: -16 } : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={axis.position === "top" ? { opacity: 0, y: -10 } : axis.position === "left" ? { opacity: 0, x: -10 } : { opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3"
      style={{ maxWidth: 280 }}
    >
      <h3 className="font-display font-bold text-3xl md:text-4xl leading-tight" style={{ color: axis.color }}>
        {axis.label}
      </h3>
      <p className="text-nrtf-muted/60 text-base md:text-lg leading-relaxed font-sans">{axis.desc}</p>
    </motion.div>
  );
}

export default function WhatIsNRTF() {
  const [selected, setSelected] = useState(2);
  const current = axes[selected];

  return (
    <section id="axes" className="relative py-16 overflow-hidden">
      <div className="w-full px-8 md:px-16 lg:px-24">
        <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-0 items-start">

          {/* Section watermark */}
          <span className="absolute -top-4 -left-2 font-display font-black leading-none select-none pointer-events-none text-[8rem] md:text-[10rem] text-nrtf-accent/[0.04]">
            02
          </span>

          {/* Left side: header + axis panels */}
          <div className="lg:w-[40%] flex flex-col justify-center min-h-[560px] relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="h-px w-8 bg-nrtf-accent" />
              <span className="text-nrtf-accent text-sm font-sans uppercase tracking-widest">Our Axes</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-nrtf-text mb-10 leading-tight"
            >
              <span className="italic font-normal">Three pillars</span><br />
              <span className="font-bold">of <span className="gradient-text">innovation</span></span>
            </motion.h2>

            {/* All axis items — always visible, active one highlighted */}
            <div className="flex flex-col gap-6">
              {axes.map((axis, i) => (
                <motion.button
                  key={axis.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  onClick={() => setSelected(i)}
                  className="text-left group"
                >
                  <div
                    className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
                    style={{
                      background: selected === i ? `${axis.color}10` : "transparent",
                      border: `1px solid ${selected === i ? `${axis.color}30` : "transparent"}`,
                    }}
                  >
                    <div
                      className="mt-1 w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                      style={{
                        background: axis.color,
                        boxShadow: selected === i ? `0 0 10px ${axis.color}` : "none",
                        opacity: selected === i ? 1 : 0.3,
                      }}
                    />
                    <div>
                      <h3
                        className="font-display font-bold text-xl md:text-2xl leading-tight mb-1 transition-all duration-300"
                        style={{ color: selected === i ? axis.color : "rgba(248,250,252,0.4)" }}
                      >
                        {axis.label}
                      </h3>
                      <AnimatePresence>
                        {selected === i && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-nrtf-muted/60 text-sm md:text-base leading-relaxed font-sans overflow-hidden"
                          >
                            {axis.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="mt-6 text-xs font-sans uppercase tracking-widest text-nrtf-muted/25">
              tap a leaf to explore
            </p>
          </div>

          {/* Right side: SVG — takes remaining 60% */}
          <div className="lg:w-[60%] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            >
              <svg
                viewBox="-20 -10 300 330"
                width="480"
                height="528"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                overflow="visible"
              >
                {/* Top leaf — AI */}
                <g onClick={() => setSelected(2)} style={{ cursor: "pointer", opacity: selected === 2 ? 1 : 0.35, transition: "opacity 0.35s, filter 0.35s", filter: selected === 2 ? `drop-shadow(0 0 8px ${axes[2].color}) drop-shadow(0 0 22px ${axes[2].color}88)` : `drop-shadow(0 0 3px ${axes[2].color}44)` }}>
                  <path d={TOP_LEAF} fill="#141e36" stroke={axes[2].color} strokeWidth="2" />
                  <TopVeins color={axes[2].color} />
                </g>
                {/* Bottom-left leaf — Energy */}
                <g transform="translate(62,205) rotate(45)" onClick={() => setSelected(0)} style={{ cursor: "pointer", opacity: selected === 0 ? 1 : 0.35, transition: "opacity 0.35s, filter 0.35s", filter: selected === 0 ? `drop-shadow(0 0 8px ${axes[0].color}) drop-shadow(0 0 22px ${axes[0].color}88)` : `drop-shadow(0 0 3px ${axes[0].color}44)` }}>
                  <path d={SIDE_LEAF} fill="#141e36" stroke={axes[0].color} strokeWidth="2" />
                  <SideVeins color={axes[0].color} />
                </g>
                {/* Bottom-right leaf — Electronics */}
                <g transform="translate(198,205) rotate(-45)" onClick={() => setSelected(1)} style={{ cursor: "pointer", opacity: selected === 1 ? 1 : 0.35, transition: "opacity 0.35s, filter 0.35s", filter: selected === 1 ? `drop-shadow(0 0 8px ${axes[1].color}) drop-shadow(0 0 22px ${axes[1].color}88)` : `drop-shadow(0 0 3px ${axes[1].color}44)` }}>
                  <path d={SIDE_LEAF} fill="#141e36" stroke={axes[1].color} strokeWidth="2" />
                  <SideVeins color={axes[1].color} />
                </g>
              </svg>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
