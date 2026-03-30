"use client";

import { useState } from "react";
import IntroScreen from "@/components/sections/IntroScreen";

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}
      <div style={{ opacity: showIntro ? 0 : 1, transition: "opacity 0.8s ease-in-out", pointerEvents: showIntro ? "none" : "auto" }}>
        {children}
      </div>
    </>
  );
}
