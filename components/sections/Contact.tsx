"use client";

import { useEffect, useRef } from "react";
import { Phone, Mail, ExternalLink } from "lucide-react";

const team = [
  {
    name: "Ons Sassi",
    role: "Project Manager",
    phone: "56402968",
    email: "onssassi830@gmail.com",
    color: "#28a078",
  },
  {
    name: "Khalil Khadhraoui",
    role: "Sponsoring Leader",
    phone: "55292516",
    email: "khalil.khadhraoui@insat.tn",
    color: "#2ea8a5",
  },
];

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 110);
          });
        }
      }),
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="relative py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-nrtf-primary" />
          <span className="text-nrtf-primary text-sm font-sans uppercase tracking-widest">Contact</span>
        </div>

        <h2 className="reveal font-display font-bold text-4xl md:text-5xl text-nrtf-text mb-16 leading-tight">
          Let's build something{" "}
          <span className="gradient-text">together</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-8 max-w-2xl">
          {team.map((member, idx) => (
            <div
              key={member.name}
              className="reveal"
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              <h3 className="font-display font-bold text-lg text-nrtf-text">{member.name}</h3>
              <p className="text-sm mb-4" style={{ color: member.color }}>{member.role}</p>

              <div className="space-y-2">
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-2.5 text-sm text-nrtf-muted/70 hover:text-nrtf-light transition-colors"
                >
                  <Phone size={14} style={{ color: member.color }} />
                  <span className="font-sans">{member.phone}</span>
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2.5 text-sm text-nrtf-muted/70 hover:text-nrtf-light transition-colors"
                >
                  <Mail size={14} style={{ color: member.color }} />
                  <span className="font-sans">{member.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal mt-12">
          <p className="text-nrtf-muted/40 text-xs mb-2 uppercase tracking-wider">General inquiries</p>
          <a
            href="mailto:national.re.tech.fusion.ieee.insat@gmail.com"
            className="inline-flex items-center gap-2 text-nrtf-light font-sans text-sm hover:text-white transition-colors"
          >
            national.re.tech.fusion.ieee.insat@gmail.com
            <ExternalLink size={12} className="opacity-50" />
          </a>
        </div>
      </div>
    </section>
  );
}
