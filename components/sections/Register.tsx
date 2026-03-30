"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Calendar, MapPin, Ticket } from "lucide-react";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate / Master", "PhD"];
const INTERESTS = ["Renewable Energy", "Electronics", "Artificial Intelligence"];
const EVENTS = ["Opening Ceremony", "Hackathon", "Certified Workshops", "Project Exhibition", "Art Exhibition", "Pitching", "Awards Ceremony"];

type Status = "idle" | "loading" | "success" | "error";

function MultiSelect({ options, selected, onChange, color }: { options: string[]; selected: string[]; onChange: (val: string[]) => void; color: string }) {
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
            style={{ background: active ? `${color}20` : "transparent", borderColor: active ? color : "rgba(109,217,207,0.15)", color: active ? color : "rgba(109,217,207,0.5)" }}>
            {active && <Check size={12} className="inline mr-1" />}{opt}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-nrtf-muted/80">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-[rgba(109,217,207,0.15)] rounded-xl px-4 py-3 text-sm text-nrtf-text placeholder:text-nrtf-muted/30 focus:outline-none focus:border-nrtf-primary focus:bg-white/8 transition-colors";

const INFO_CARDS = [
  { Icon: Calendar, title: "1–3 May 2026", sub: "Three days of innovation" },
  { Icon: MapPin, title: "INSAT, Tunis", sub: "Institut National des Sciences Appliquées" },
  { Icon: Ticket, title: "Free Entry", sub: "Open to all students and professionals" },
];

export default function Register() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", university: "", field: "", year: "", interests: [] as string[], events: [] as string[], ieee_member: "", ieee_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.querySelectorAll(".reveal").forEach((el, i) => setTimeout(() => el.classList.add("visible"), i * 80)); }),
      { threshold: 0.05 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const set = (key: string, value: unknown) => { setForm((prev) => ({ ...prev, [key]: value })); setErrors((prev) => ({ ...prev, [key]: "" })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.university.trim()) e.university = "Required";
    if (!form.field.trim()) e.field = "Required";
    if (!form.year) e.year = "Required";
    if (!form.interests.length) e.interests = "Select at least one";
    if (!form.events.length) e.events = "Select at least one";
    if (!form.ieee_member) e.ieee_member = "Required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setStatus("success"); setMessage(data.message); }
      else { setStatus("error"); setMessage(data.error); }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section id="register" ref={sectionRef} className="relative py-28">
      <div className="w-full px-8 md:px-16 lg:px-24">

        {status === "success" ? (
          <div className="reveal flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#137c5520", border: "1px solid #137c55" }}>
              <Check size={32} style={{ color: "#137c55" }} />
            </div>
            <h3 className="font-display font-bold text-2xl text-nrtf-text">You&apos;re registered!</h3>
            <p className="text-nrtf-muted/70 max-w-sm">{message}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

            {/* Left col */}
            <div className="lg:w-[35%] lg:sticky lg:top-28">
              <h2 className="reveal font-display font-bold text-4xl md:text-5xl text-nrtf-text mb-4 leading-tight">
                Register <span className="gradient-text">Now</span>
              </h2>
              <p className="reveal text-nrtf-muted/60 text-sm mb-10">
                Join NRTF 3.0 — 1–3 May 2026 at INSAT, Tunis. Fill in your details below to secure your spot.
              </p>
              <div className="reveal flex flex-col gap-4">
                {INFO_CARDS.map(({ Icon, title, sub }) => (
                  <div key={title} className="flex items-start gap-4 px-4 py-3 rounded-xl" style={{ borderLeft: "3px solid #137c55", background: "rgba(19,124,85,0.06)" }}>
                    <Icon size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#6dd9cf" }} />
                    <div>
                      <div className="text-sm font-semibold text-nrtf-text">{title}</div>
                      <div className="text-xs text-nrtf-muted/50 mt-0.5">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col — form */}
            <div className="lg:w-[65%]">
              <form onSubmit={handleSubmit} className="reveal space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name *" error={errors.full_name}><input className={inputCls} placeholder="e.g. Foulen Ben Falten" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
                  <Field label="Email *" error={errors.email}><input className={inputCls} type="email" placeholder="you@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                  <Field label="Phone Number *" error={errors.phone}><input className={inputCls} type="tel" placeholder="+216 XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
                  <Field label="University / Institution *" error={errors.university}><input className={inputCls} placeholder="e.g. INSAT" value={form.university} onChange={(e) => set("university", e.target.value)} /></Field>
                  <Field label="Field of Study *" error={errors.field}><input className={inputCls} placeholder="e.g. Electrical Engineering" value={form.field} onChange={(e) => set("field", e.target.value)} /></Field>
                  <Field label="Year of Study *" error={errors.year}>
                    <select className={inputCls} value={form.year} onChange={(e) => set("year", e.target.value)}>
                      <option value="" disabled>Select year</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Areas of Interest *" error={errors.interests}><MultiSelect options={INTERESTS} selected={form.interests} onChange={(v) => set("interests", v)} color="#6dd9cf" /></Field>
                <Field label="Events to Attend *" error={errors.events}><MultiSelect options={EVENTS} selected={form.events} onChange={(v) => set("events", v)} color="#137c55" /></Field>
                <Field label="IEEE Member? *" error={errors.ieee_member}>
                  <div className="flex gap-4">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="ieee_member" value={opt} checked={form.ieee_member === opt} onChange={() => set("ieee_member", opt)} className="accent-nrtf-primary" />
                        <span className="text-sm text-nrtf-muted/80">{opt}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                {form.ieee_member === "Yes" && (
                  <Field label="IEEE Member ID"><input className={inputCls} placeholder="Your IEEE Member ID" value={form.ieee_id} onChange={(e) => set("ieee_id", e.target.value)} /></Field>
                )}
                {status === "error" && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{message}</p>}
                <button type="submit" disabled={status === "loading"}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-nrtf-primary to-nrtf-secondary hover:opacity-90 transition-opacity disabled:opacity-60">
                  {status === "loading" ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Submit Registration"}
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
