"use client";

import { useId } from "react";

/**
 * Animated circuit-leaf mark for the About section.
 * Three geometric leaves with pulsing glow, animated circuit nodes,
 * breathing motion, and a rotating orbit ring.
 */
export default function AnimatedLeafMark({ size = 420 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  const glowId   = `alm-glow-${uid}`;
  const glowIdG  = `alm-glow-g-${uid}`;
  const blurId   = `alm-blur-${uid}`;

  const VBW = 320;
  const VBH = 320;
  const svgH = Math.round(size * VBH / VBW);

  /* ── leaf paths (same geometry as NRTFLogo, shifted to center of 320×320 vb) ── */
  // offset: cx=160, cy=155 (was 130,140 in 260vb)
  const TOP_LEAF =
    "M 160,30 C 188,37 207,80 207,120 C 207,160 184,198 160,212 " +
    "C 136,198 113,160 113,120 C 113,80 132,37 160,30 Z";

  const SIDE_LEAF =
    "M 0,-68 C 26,-54 46,-26 46,0 C 46,26 26,54 0,68 " +
    "C -26,54 -46,26 -46,0 C -46,-26 -26,-54 0,-68 Z";

  return (
    <div style={{ width: size, height: svgH }} className="relative select-none">
      <style>{`
        /* ── breathing ── */
        @keyframes alm-breathe {
          0%,100% { transform: scale(1);      }
          50%      { transform: scale(1.022);  }
        }
        /* ── individual leaf pulse ── */
        @keyframes alm-leaf-glow {
          0%,100% { opacity: 0.75; }
          50%      { opacity: 1;   }
        }
        /* ── circuit node pulse ── */
        @keyframes alm-node {
          0%,100% { r: 2.2; opacity: 0.55; }
          50%      { r: 3.6; opacity: 1;   }
        }
        /* ── orbit ring spin ── */
        @keyframes alm-orbit {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        /* ── counter-spin inner ring ── */
        @keyframes alm-orbit-rev {
          from { transform: rotate(0deg);    }
          to   { transform: rotate(-360deg); }
        }
        /* ── energy particle drift ── */
        @keyframes alm-particle {
          0%   { opacity: 0;   transform: translate(0,0) scale(0.5);   }
          30%  { opacity: 0.9; }
          100% { opacity: 0;   transform: translate(var(--dx),var(--dy)) scale(0.2); }
        }
        /* ── background orb pulse ── */
        @keyframes alm-orb {
          0%,100% { opacity: 0.08; transform: scale(1);    }
          50%      { opacity: 0.15; transform: scale(1.12); }
        }

        .alm-breathe {
          transform-box: fill-box;
          transform-origin: center;
          animation: alm-breathe 5s ease-in-out infinite;
        }
        .alm-leaf-top   { animation: alm-leaf-glow 3.5s ease-in-out infinite; }
        .alm-leaf-bl    { animation: alm-leaf-glow 3.5s ease-in-out infinite 0.8s; }
        .alm-leaf-br    { animation: alm-leaf-glow 3.5s ease-in-out infinite 1.6s; }

        .alm-orbit-outer {
          transform-box: fill-box;
          transform-origin: center;
          animation: alm-orbit 18s linear infinite;
        }
        .alm-orbit-inner {
          transform-box: fill-box;
          transform-origin: center;
          animation: alm-orbit-rev 12s linear infinite;
        }
        .alm-orb {
          transform-box: fill-box;
          transform-origin: center;
          animation: alm-orb 4s ease-in-out infinite;
        }

        .alm-n1  { animation: alm-node 2.4s ease-in-out infinite 0.0s; }
        .alm-n2  { animation: alm-node 2.4s ease-in-out infinite 0.3s; }
        .alm-n3  { animation: alm-node 2.4s ease-in-out infinite 0.6s; }
        .alm-n4  { animation: alm-node 2.4s ease-in-out infinite 0.9s; }
        .alm-n5  { animation: alm-node 2.4s ease-in-out infinite 1.2s; }
        .alm-n6  { animation: alm-node 2.4s ease-in-out infinite 1.5s; }
        .alm-n7  { animation: alm-node 2.4s ease-in-out infinite 1.8s; }
        .alm-n8  { animation: alm-node 2.4s ease-in-out infinite 2.1s; }
      `}</style>

      <svg
        viewBox={`0 0 ${VBW} ${VBH}`}
        width={size}
        height={svgH}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          {/* teal glow filter */}
          <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* green glow filter for BL leaf */}
          <filter id={glowIdG} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b1" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* soft radial blur for background orb */}
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* ── background orb ── */}
        <circle
          cx="160" cy="155"
          r="110"
          fill="#6dd9cf"
          filter={`url(#${blurId})`}
          className="alm-orb"
        />

        {/* ── outer orbit ring (dashed, rotating) ── */}
        <g className="alm-orbit-outer">
          <circle
            cx="160" cy="155" r="148"
            stroke="#6dd9cf"
            strokeWidth="0.8"
            strokeDasharray="6 10"
            opacity="0.22"
          />
          {/* 4 accent dots on the ring */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 160 + 148 * Math.cos(rad);
            const y = 155 + 148 * Math.sin(rad);
            return (
              <circle key={deg} cx={x} cy={y} r="2.5" fill="#6dd9cf" opacity="0.55" />
            );
          })}
        </g>

        {/* ── inner orbit ring (counter-rotating) ── */}
        <g className="alm-orbit-inner">
          <circle
            cx="160" cy="155" r="128"
            stroke="#137c55"
            strokeWidth="0.6"
            strokeDasharray="3 16"
            opacity="0.3"
          />
          {[45, 135, 225, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 160 + 128 * Math.cos(rad);
            const y = 155 + 128 * Math.sin(rad);
            return (
              <circle key={deg} cx={x} cy={y} r="1.8" fill="#137c55" opacity="0.5" />
            );
          })}
        </g>

        {/* ── all three leaves + circuit (breathing together) ── */}
        <g className="alm-breathe">

          {/* TOP LEAF ── teal */}
          <g filter={`url(#${glowId})`} className="alm-leaf-top">
            <path d={TOP_LEAF} fill="#0f1e35" stroke="#6dd9cf" strokeWidth="2.2" />
            <g stroke="#6dd9cf" fill="none" opacity="0.9">
              {/* center vein */}
              <line x1="160" y1="34"  x2="160" y2="208" strokeWidth="1.5" />
              {/* left branches */}
              <polyline points="160,68  148,68  134,82"           strokeWidth="1.1" />
              <polyline points="160,96  147,96  131,110 131,121"  strokeWidth="1.1" />
              <polyline points="160,124 148,124 133,138"          strokeWidth="1.1" />
              <polyline points="160,152 149,152 136,165 136,173"  strokeWidth="1.1" />
              {/* right branches */}
              <polyline points="160,68  172,68  186,82"           strokeWidth="1.1" />
              <polyline points="160,96  173,96  189,110 189,121"  strokeWidth="1.1" />
              <polyline points="160,124 172,124 187,138"          strokeWidth="1.1" />
              <polyline points="160,152 171,152 184,165 184,173"  strokeWidth="1.1" />
              {/* mesh */}
              <line x1="134" y1="82"  x2="131" y2="121" strokeWidth="0.5" opacity="0.45" />
              <line x1="186" y1="82"  x2="189" y2="121" strokeWidth="0.5" opacity="0.45" />
            </g>
            {/* animated nodes */}
            <circle cx="134" cy="82"  className="alm-n1" fill="#6dd9cf" r="2.2" />
            <circle cx="131" cy="121" className="alm-n2" fill="#6dd9cf" r="2.2" />
            <circle cx="133" cy="138" className="alm-n3" fill="#6dd9cf" r="2.2" />
            <circle cx="136" cy="173" className="alm-n4" fill="#6dd9cf" r="2.2" />
            <circle cx="186" cy="82"  className="alm-n5" fill="#6dd9cf" r="2.2" />
            <circle cx="189" cy="121" className="alm-n6" fill="#6dd9cf" r="2.2" />
            <circle cx="187" cy="138" className="alm-n7" fill="#6dd9cf" r="2.2" />
            <circle cx="184" cy="173" className="alm-n8" fill="#6dd9cf" r="2.2" />
          </g>

          {/* BOTTOM-LEFT LEAF ── green */}
          <g transform="translate(108,232) rotate(45)" filter={`url(#${glowIdG})`} className="alm-leaf-bl">
            <path d={SIDE_LEAF} fill="#0f1e35" stroke="#137c55" strokeWidth="2.2" />
            <g stroke="#137c55" fill="none" opacity="0.9">
              <line x1="0" y1="-63" x2="0" y2="63" strokeWidth="1.5" />
              <polyline points="0,-36 -10,-36 -24,-22"       strokeWidth="1.1" />
              <polyline points="0,-12 -10,-12 -27,4  -27,14" strokeWidth="1.1" />
              <polyline points="0,18  -10,18  -24,30"        strokeWidth="1.1" />
              <polyline points="0,-36  10,-36  24,-22"       strokeWidth="1.1" />
              <polyline points="0,-12  10,-12  27,4   27,14" strokeWidth="1.1" />
              <polyline points="0,18   10,18   24,30"        strokeWidth="1.1" />
              <line x1="-24" y1="-22" x2="-27" y2="14" strokeWidth="0.5" opacity="0.45" />
              <line x1="24"  y1="-22" x2="27"  y2="14" strokeWidth="0.5" opacity="0.45" />
            </g>
            <circle cx="-24" cy="-22" className="alm-n3" fill="#137c55" r="2.2" />
            <circle cx="-27" cy="14"  className="alm-n6" fill="#137c55" r="2.2" />
            <circle cx="-24" cy="30"  className="alm-n1" fill="#137c55" r="2.2" />
            <circle cx="24"  cy="-22" className="alm-n4" fill="#137c55" r="2.2" />
            <circle cx="27"  cy="14"  className="alm-n7" fill="#137c55" r="2.2" />
            <circle cx="24"  cy="30"  className="alm-n2" fill="#137c55" r="2.2" />
          </g>

          {/* BOTTOM-RIGHT LEAF ── teal */}
          <g transform="translate(212,232) rotate(-45)" filter={`url(#${glowId})`} className="alm-leaf-br">
            <path d={SIDE_LEAF} fill="#0f1e35" stroke="#6dd9cf" strokeWidth="2.2" />
            <g stroke="#6dd9cf" fill="none" opacity="0.9">
              <line x1="0" y1="-63" x2="0" y2="63" strokeWidth="1.5" />
              <polyline points="0,-36 -10,-36 -24,-22"       strokeWidth="1.1" />
              <polyline points="0,-12 -10,-12 -27,4  -27,14" strokeWidth="1.1" />
              <polyline points="0,18  -10,18  -24,30"        strokeWidth="1.1" />
              <polyline points="0,-36  10,-36  24,-22"       strokeWidth="1.1" />
              <polyline points="0,-12  10,-12  27,4   27,14" strokeWidth="1.1" />
              <polyline points="0,18   10,18   24,30"        strokeWidth="1.1" />
              <line x1="-24" y1="-22" x2="-27" y2="14" strokeWidth="0.5" opacity="0.45" />
              <line x1="24"  y1="-22" x2="27"  y2="14" strokeWidth="0.5" opacity="0.45" />
            </g>
            <circle cx="-24" cy="-22" className="alm-n5" fill="#6dd9cf" r="2.2" />
            <circle cx="-27" cy="14"  className="alm-n2" fill="#6dd9cf" r="2.2" />
            <circle cx="-24" cy="30"  className="alm-n8" fill="#6dd9cf" r="2.2" />
            <circle cx="24"  cy="-22" className="alm-n1" fill="#6dd9cf" r="2.2" />
            <circle cx="27"  cy="14"  className="alm-n4" fill="#6dd9cf" r="2.2" />
            <circle cx="24"  cy="30"  className="alm-n6" fill="#6dd9cf" r="2.2" />
          </g>

        </g>{/* end breathe group */}
      </svg>
    </div>
  );
}
