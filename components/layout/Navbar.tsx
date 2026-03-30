"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#about",    label: "About" },
  { href: "#axes",     label: "Our Axes" },
  { href: "#schedule", label: "Schedule" },
  { href: "#speakers", label: "Speakers" },
  { href: "#sponsors", label: "Sponsors" },
  { href: "#faq",      label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLink = () => setOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl border-b border-[rgba(109,217,207,0.15)] shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
          : ""
      }`}
      style={scrolled ? { background: "rgb(var(--rgb-bg) / 0.92)" } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF Logo" width={36} style={{ background: "transparent" }} />
          <span className="font-display font-bold text-lg tracking-tight gradient-text">
            NRTF<span className="text-nrtf-light">3.0</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-nrtf-muted hover:text-nrtf-light transition-colors duration-200 rounded-md hover:bg-[rgba(109,217,207,0.08)]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Register CTA */}
        <a
          href="#register"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-nrtf-primary to-nrtf-secondary text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(109,217,207,0.25)] transition-all duration-300 hover:scale-105"
        >
          Register Now
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-nrtf-light p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden backdrop-blur-xl border-t border-[rgba(109,217,207,0.12)] px-6 pb-6 pt-2"
          style={{ background: "rgb(var(--rgb-bg) / 0.97)" }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleLink}
              className="block py-3 text-nrtf-muted hover:text-nrtf-light font-medium border-b border-[rgba(109,217,207,0.06)] last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#register"
            onClick={handleLink}
            className="mt-4 flex items-center justify-center px-5 py-3 rounded-full bg-gradient-to-r from-nrtf-primary to-nrtf-secondary text-white font-semibold"
          >
            Register Now
          </a>
        </div>
      )}
    </nav>
  );
}
