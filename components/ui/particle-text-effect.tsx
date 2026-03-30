"use client";

import { useEffect, useRef } from "react";

interface Vector2D {
  x: number;
  y: number;
}

const WORD_COLORS: Record<string, { r: number; g: number; b: number }> = {
  NATIONAL:  { r: 184, g: 204, b: 199 },
  "RE-TECH": { r: 176, g: 198, b: 189 },
  FUSION:    { r: 200, g: 217, b: 214 },
};
const FALLBACK_COLOR = { r: 200, g: 217, b: 214 };

class Particle {
  pos: Vector2D = { x: 0, y: 0 };
  vel: Vector2D = { x: 0, y: 0 };
  acc: Vector2D = { x: 0, y: 0 };
  target: Vector2D = { x: 0, y: 0 };
  closeEnoughTarget = 50;
  maxSpeed = 1.0;
  maxForce = 0.1;
  particleSize = 10;
  isKilled = false;
  startColor = { r: 0, g: 0, b: 0 };
  targetColor = { r: 0, g: 0, b: 0 };
  colorWeight = 0;
  colorBlendRate = 0.01;

  move() {
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) +
      Math.pow(this.pos.y - this.target.y, 2)
    );
    const proximityMult = distance < this.closeEnoughTarget
      ? distance / this.closeEnoughTarget
      : 1;

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };
    const magnitude = Math.sqrt(
      towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y
    );
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    };
    const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
    if (steerMag > 0) {
      steer.x = (steer.x / steerMag) * this.maxForce;
      steer.y = (steer.y / steerMag) * this.maxForce;
    }

    this.acc.x += steer.x;
    this.acc.y += steer.y;
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.vel.x *= 0.95;
    this.vel.y *= 0.95;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }
    const c = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    };
    ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
    ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      const rp = randomPosOnEdge(width / 2, height / 2, (width + height) / 2);
      this.target.x = rp.x;
      this.target.y = rp.y;
      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      };
      this.targetColor = { r: 245, g: 243, b: 240 };
      this.colorWeight = 0;
      this.isKilled = true;
    }
  }
}

function randomPosOnEdge(cx: number, cy: number, mag: number): Vector2D {
  // Use actual canvas half-dimensions passed in
  const rx = Math.random() * (cx * 2);
  const ry = Math.random() * (cy * 2);
  const dir = { x: rx - cx, y: ry - cy };
  const m = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
  if (m > 0) { dir.x = (dir.x / m) * mag; dir.y = (dir.y / m) * mag; }
  return { x: cx + dir.x, y: cy + dir.y };
}

interface ParticleTextEffectProps {
  words?: string[];
  framesBetweenWords?: number;
  onComplete?: () => void;
}

const DEFAULT_WORDS = ["NATIONAL", "RE-TECH", "FUSION"];

export function ParticleTextEffect({
  words = DEFAULT_WORDS,
  framesBetweenWords = 220,
  onComplete,
}: ParticleTextEffectProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef     = useRef(0);
  const wordIdxRef   = useRef(0);
  const completedRef = useRef(false);
  const mouseRef     = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false });

  const pixelSteps = 18;

  const nextWord = (word: string, canvas: HTMLCanvasElement) => {
    const off    = document.createElement("canvas");
    off.width    = canvas.width;
    off.height   = canvas.height;
    const offCtx = off.getContext("2d")!;

    // Font scales with canvas width, capped at 200px
    const fontSize = Math.round(Math.min(canvas.width / 5.5, 200));
    offCtx.fillStyle    = "white";
    offCtx.font         = `bold ${fontSize}px 'Plus Jakarta Sans', Arial`;
    offCtx.textAlign    = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(word, canvas.width / 2, canvas.height / 2);

    const { data: pixels } = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const newColor = WORD_COLORS[word] ?? FALLBACK_COLOR;
    const particles = particlesRef.current;
    let pi = 0;

    const coords: number[] = [];
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) coords.push(i);
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coords[i], coords[j]] = [coords[j], coords[i]];
    }

    for (const idx of coords) {
      if (pixels[idx + 3] > 0) {
        const x = (idx / 4) % canvas.width;
        const y = Math.floor(idx / 4 / canvas.width);
        let p: Particle;
        if (pi < particles.length) {
          p = particles[pi];
          p.isKilled = false;
          p.colorBlendRate = Math.random() * 0.012 ;
          pi++;
        } else {
          p = new Particle();
          const rp = randomPosOnEdge(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2);
          p.pos.x = rp.x;
          p.pos.y = rp.y;
          p.maxSpeed = Math.random() * 3 + 4;
          p.maxForce = p.maxSpeed * 0.1;
          p.particleSize = Math.random() * 6 + 6;
          p.colorBlendRate = Math.random() * 0.012 ;
          particles.push(p);
        }
        p.startColor = {
          r: p.startColor.r + (p.targetColor.r - p.startColor.r) * p.colorWeight,
          g: p.startColor.g + (p.targetColor.g - p.startColor.g) * p.colorWeight,
          b: p.startColor.b + (p.targetColor.b - p.startColor.b) * p.colorWeight,
        };
        p.targetColor = newColor;
        p.colorWeight = 0;
        p.target.x = x;
        p.target.y = y;
      }
    }
    for (let i = pi; i < particles.length; i++) particles[i].kill(canvas.width, canvas.height);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const particles = particlesRef.current;

    ctx.fillStyle = "rgba(30, 35, 64, 0.22)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.move();
      p.draw(ctx);
      if (p.isKilled && (p.pos.x < 0 || p.pos.x > canvas.width || p.pos.y < 0 || p.pos.y > canvas.height)) {
        particles.splice(i, 1);
      }
    }

    if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
      particles.forEach((p) => {
        const d = Math.sqrt(Math.pow(p.pos.x - mouseRef.current.x, 2) + Math.pow(p.pos.y - mouseRef.current.y, 2));
        if (d < 50) p.kill(canvas.width, canvas.height);
      });
    }

    frameRef.current++;

    // Advance to next word — particles transition directly (no dissolve)
    if (frameRef.current > 0 && frameRef.current % framesBetweenWords === 0) {
      const nextIdx = wordIdxRef.current + 1;
      if (nextIdx < words.length) {
        wordIdxRef.current = nextIdx;
        nextWord(words[nextIdx], canvas);

        // After the last word has formed, schedule completion
        if (nextIdx === words.length - 1 && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete?.(), 2000);
        }
      }
    }

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Wait for fonts before sampling pixel data so Space Grotesk is used, not fallback
    document.fonts.ready.then(() => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      nextWord(words[0], canvas);
      animate();
    });

    const handleResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-render current word at new dimensions
      nextWord(words[wordIdxRef.current], canvas);
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isPressed    = true;
      mouseRef.current.isRightClick = e.button === 2;
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
    };
    const handleMouseUp   = () => { mouseRef.current.isPressed = false; mouseRef.current.isRightClick = false; };
    const handleMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
    };
    const handleCtxMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener("resize",    handleResize);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup",   handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("contextmenu", handleCtxMenu);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize",    handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup",   handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("contextmenu", handleCtxMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    />
  );
}
