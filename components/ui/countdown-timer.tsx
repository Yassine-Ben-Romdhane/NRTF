"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2026-05-01T00:00:00");

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Tile({ value, label, compact }: { value: number; label: string; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: "rgba(109,217,207,0.06)",
            border: "1px solid rgba(109,217,207,0.15)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(109,217,207,0.45), transparent)" }}
          />
          <span className="font-display font-bold text-2xl md:text-3xl text-white tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
        </div>
        <span className="text-[10px] font-sans uppercase tracking-widest text-white/30">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: "rgba(109,217,207,0.06)",
          border: "1px solid rgba(109,217,207,0.15)",
          boxShadow: "0 0 32px rgba(19,124,85,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(109,217,207,0.5), transparent)" }}
        />
        <span className="font-display font-bold text-4xl md:text-5xl text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs font-sans uppercase tracking-widest text-white/35">{label}</span>
    </div>
  );
}

export default function CountdownTimer({ compact }: { compact?: boolean }) {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={compact ? "flex gap-3" : "flex gap-4 md:gap-6"}>
      <Tile value={time.days} label="Days" compact={compact} />
      <Tile value={time.hours} label="Hours" compact={compact} />
      <Tile value={time.minutes} label="Mins" compact={compact} />
      <Tile value={time.seconds} label="Secs" compact={compact} />
    </div>
  );
}
