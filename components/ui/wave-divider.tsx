interface WaveDividerProps {
  flip?: boolean;
  color?: string;
}

export default function WaveDivider({ flip = false, color = "#040d12" }: WaveDividerProps) {
  return (
    <div
      className="wave-divider w-full leading-[0] overflow-hidden"
      style={{ transform: flip ? "rotateX(180deg)" : undefined }}
    >
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-14"
      >
        <path
          d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28 L1440,56 L0,56 Z"
          fill={color}
        />
        {/* Neon accent line along wave */}
        <path
          d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28"
          stroke="url(#waveGrad)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="waveGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"    stopColor="#137c55" />
            <stop offset="50%"   stopColor="#6dd9cf" />
            <stop offset="100%"  stopColor="#6dd9cf" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
