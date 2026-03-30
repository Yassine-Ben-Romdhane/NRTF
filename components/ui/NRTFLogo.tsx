"use client";

import { useId } from "react";

interface NRTFLogoProps {
  /** Width in px; height scales proportionally with the viewBox aspect ratio */
  size?: number;
  /** Render the glowing "NRTF" text below the leaves */
  showText?: boolean;
}

/**
 * NRTF three-leaf circuit logo.
 *
 * Geometry (viewBox 0 0 260 280):
 *   Top leaf    – upright, center ~(130, 92)
 *   Bottom-left – translate(86,188) rotate(+45)  → inner tip upper-right, outer tip lower-left
 *   Bottom-right– translate(174,188) rotate(-45) → inner tip upper-left,  outer tip lower-right
 */
export default function NRTFLogo({ size = 200, showText = false }: NRTFLogoProps) {
  const uid = useId().replace(/:/g, "");
  const gid  = `ng-${uid}`;   // leaf glow filter id
  const tgid = `ntg-${uid}`;  // text glow filter id

  const VBW  = 260;
  const VBH  = showText ? 308 : 280;
  const svgH = Math.round(size * VBH / VBW);

  // ── Paths ──────────────────────────────────────────────────────────────────
  const TOP_LEAF =
    "M 130,12 C 155,18 172,56 172,92 C 172,128 151,162 130,174 " +
    "C 109,162 88,128 88,92 C 88,56 105,18 130,12 Z";

  // Used in local-coord groups for the two side leaves
  const SIDE_LEAF =
    "M 0,-58 C 22,-46 40,-22 40,0 C 40,22 22,46 0,58 " +
    "C -22,46 -40,22 -40,0 C -40,-22 -22,-46 0,-58 Z";

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      width={size}
      height={svgH}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
    >
      <defs>
        {/* Leaf glow: double-pass for a bloom effect */}
        <filter id={gid} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Text glow */}
        <filter id={tgid} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ═══ TOP LEAF ═══ */}
      <g filter={`url(#${gid})`}>
        <path d={TOP_LEAF} fill="#141e36" stroke="#6dd9cf" strokeWidth="2" />
        <g stroke="#6dd9cf" fill="none" opacity="0.85">
          {/* Center vein */}
          <line x1="130" y1="16"  x2="130" y2="170" strokeWidth="1.4" />
          {/* Left PCB branches */}
          <polyline points="130,46  121,46  110,57"           strokeWidth="1" />
          <polyline points="130,70  120,70  107,81  107,90"   strokeWidth="1" />
          <polyline points="130,95  119,95  105,107"          strokeWidth="1" />
          <polyline points="130,119 121,119 109,131 109,138"  strokeWidth="1" />
          {/* Right PCB branches */}
          <polyline points="130,46  139,46  150,57"           strokeWidth="1" />
          <polyline points="130,70  140,70  153,81  153,90"   strokeWidth="1" />
          <polyline points="130,95  141,95  155,107"          strokeWidth="1" />
          <polyline points="130,119 139,119 151,131 151,138"  strokeWidth="1" />
          {/* End-point nodes */}
          <circle cx="110" cy="57"  r="1.8" fill="#6dd9cf" />
          <circle cx="107" cy="90"  r="1.8" fill="#6dd9cf" />
          <circle cx="105" cy="107" r="1.8" fill="#6dd9cf" />
          <circle cx="109" cy="138" r="1.8" fill="#6dd9cf" />
          <circle cx="150" cy="57"  r="1.8" fill="#6dd9cf" />
          <circle cx="153" cy="90"  r="1.8" fill="#6dd9cf" />
          <circle cx="155" cy="107" r="1.8" fill="#6dd9cf" />
          <circle cx="151" cy="138" r="1.8" fill="#6dd9cf" />
          {/* Mesh cross-links */}
          <line x1="110" y1="57"  x2="107" y2="90"  strokeWidth="0.5" opacity="0.5" />
          <line x1="107" y1="90"  x2="105" y2="107" strokeWidth="0.5" opacity="0.5" />
          <line x1="150" y1="57"  x2="153" y2="90"  strokeWidth="0.5" opacity="0.5" />
          <line x1="153" y1="90"  x2="155" y2="107" strokeWidth="0.5" opacity="0.5" />
          <line x1="110" y1="57"  x2="130" y2="70"  strokeWidth="0.5" opacity="0.5" />
          <line x1="150" y1="57"  x2="130" y2="70"  strokeWidth="0.5" opacity="0.5" />
          <line x1="107" y1="90"  x2="130" y2="95"  strokeWidth="0.5" opacity="0.5" />
          <line x1="153" y1="90"  x2="130" y2="95"  strokeWidth="0.5" opacity="0.5" />
        </g>
      </g>

      {/* ═══ BOTTOM-LEFT LEAF  rotate(+45): outer tip → lower-left, inner tip → upper-right ═══ */}
      <g transform="translate(86,188) rotate(45)" filter={`url(#${gid})`}>
        <path d={SIDE_LEAF} fill="#141e36" stroke="#6dd9cf" strokeWidth="2" />
        <g stroke="#6dd9cf" fill="none" opacity="0.85">
          <line x1="0" y1="-53" x2="0" y2="53" strokeWidth="1.4" />
          <polyline points="0,-28 -9,-28 -21,-17"       strokeWidth="1" />
          <polyline points="0,-8  -9,-8  -23,5  -23,13" strokeWidth="1" />
          <polyline points="0,15  -9,15  -21,26"         strokeWidth="1" />
          <polyline points="0,-28  9,-28  21,-17"       strokeWidth="1" />
          <polyline points="0,-8   9,-8   23,5   23,13" strokeWidth="1" />
          <polyline points="0,15   9,15   21,26"         strokeWidth="1" />
          <circle cx="-21" cy="-17" r="1.8" fill="#6dd9cf" />
          <circle cx="-23" cy="13"  r="1.8" fill="#6dd9cf" />
          <circle cx="-21" cy="26"  r="1.8" fill="#6dd9cf" />
          <circle cx="21"  cy="-17" r="1.8" fill="#6dd9cf" />
          <circle cx="23"  cy="13"  r="1.8" fill="#6dd9cf" />
          <circle cx="21"  cy="26"  r="1.8" fill="#6dd9cf" />
          <line x1="-21" y1="-17" x2="-23" y2="13"  strokeWidth="0.5" opacity="0.5" />
          <line x1="21"  y1="-17" x2="23"  y2="13"  strokeWidth="0.5" opacity="0.5" />
          <line x1="-21" y1="-17" x2="0"   y2="-8"  strokeWidth="0.5" opacity="0.5" />
          <line x1="21"  y1="-17" x2="0"   y2="-8"  strokeWidth="0.5" opacity="0.5" />
        </g>
      </g>

      {/* ═══ BOTTOM-RIGHT LEAF  rotate(-45): outer tip → lower-right, inner tip → upper-left ═══ */}
      <g transform="translate(174,188) rotate(-45)" filter={`url(#${gid})`}>
        <path d={SIDE_LEAF} fill="#141e36" stroke="#6dd9cf" strokeWidth="2" />
        <g stroke="#6dd9cf" fill="none" opacity="0.85">
          <line x1="0" y1="-53" x2="0" y2="53" strokeWidth="1.4" />
          <polyline points="0,-28 -9,-28 -21,-17"       strokeWidth="1" />
          <polyline points="0,-8  -9,-8  -23,5  -23,13" strokeWidth="1" />
          <polyline points="0,15  -9,15  -21,26"         strokeWidth="1" />
          <polyline points="0,-28  9,-28  21,-17"       strokeWidth="1" />
          <polyline points="0,-8   9,-8   23,5   23,13" strokeWidth="1" />
          <polyline points="0,15   9,15   21,26"         strokeWidth="1" />
          <circle cx="-21" cy="-17" r="1.8" fill="#6dd9cf" />
          <circle cx="-23" cy="13"  r="1.8" fill="#6dd9cf" />
          <circle cx="-21" cy="26"  r="1.8" fill="#6dd9cf" />
          <circle cx="21"  cy="-17" r="1.8" fill="#6dd9cf" />
          <circle cx="23"  cy="13"  r="1.8" fill="#6dd9cf" />
          <circle cx="21"  cy="26"  r="1.8" fill="#6dd9cf" />
          <line x1="-21" y1="-17" x2="-23" y2="13"  strokeWidth="0.5" opacity="0.5" />
          <line x1="21"  y1="-17" x2="23"  y2="13"  strokeWidth="0.5" opacity="0.5" />
          <line x1="-21" y1="-17" x2="0"   y2="-8"  strokeWidth="0.5" opacity="0.5" />
          <line x1="21"  y1="-17" x2="0"   y2="-8"  strokeWidth="0.5" opacity="0.5" />
        </g>
      </g>

      {/* ═══ NRTF TEXT ═══ */}
      {showText && (
        <text
          x="130"
          y="295"
          textAnchor="middle"
          fontFamily="'Courier New', monospace"
          fontSize="28"
          fontWeight="bold"
          fill="#6dd9cf"
          letterSpacing="6"
          filter={`url(#${tgid})`}
        >
          NRTF
        </text>
      )}
    </svg>
  );
}
