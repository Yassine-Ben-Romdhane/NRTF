"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  pauseOnHover?: boolean;
  direction?: "left" | "right" | "up" | "down";
  fade?: boolean;
  fadeAmount?: number;
}

export function Marquee({
  children,
  className,
  duration = 20,
  pauseOnHover = false,
  direction = "left",
  fade = true,
  fadeAmount = 10,
  ...props
}: MarqueeProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const items = React.Children.toArray(children);
  const isVertical = direction === "up" || direction === "down";

  const animName =
    isVertical
      ? direction === "up" ? "marquee-y" : "marquee-y-rev"
      : direction === "left" ? "marquee-x" : "marquee-x-rev";

  const handleMouseEnter = () => {
    if (!pauseOnHover) return;
    scrollerRef.current?.getAnimations().forEach((a) => { a.playbackRate = 0.15; });
  };

  const handleMouseLeave = () => {
    if (!pauseOnHover) return;
    scrollerRef.current?.getAnimations().forEach((a) => { a.playbackRate = 1; });
  };

  return (
    <>
      <style>{`
        @keyframes marquee-x     { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
        @keyframes marquee-x-rev { from { transform: translateX(-50%); } to { transform: translateX(0); }   }
        @keyframes marquee-y     { from { transform: translateY(0); }    to { transform: translateY(-50%); } }
        @keyframes marquee-y-rev { from { transform: translateY(-50%); } to { transform: translateY(0); }   }
        .marquee-scroller {
          display: flex;
          animation: ${animName} ${duration}s linear infinite;
        }
      `}</style>
      <div
        className={cn("flex w-full overflow-hidden", isVertical && "flex-col", className)}
        style={{
          ...(fade && {
            maskImage: isVertical
              ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
            WebkitMaskImage: isVertical
              ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
          }),
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div ref={scrollerRef} className={cn("marquee-scroller flex shrink-0", isVertical && "flex-col")}>
          {items.map((item, i) => (
            <div key={`a-${i}`} className={cn("flex shrink-0", isVertical && "w-full")}>{item}</div>
          ))}
          {items.map((item, i) => (
            <div key={`b-${i}`} className={cn("flex shrink-0", isVertical && "w-full")}>{item}</div>
          ))}
        </div>
      </div>
    </>
  );
}
