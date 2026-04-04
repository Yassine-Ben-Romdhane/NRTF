"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Calendar, MapPin, Ticket } from "lucide-react";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate / Master", "PhD"];

type Status = "idle" | "loading" | "success" | "error";

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

const ACCOMMODATION = [
  { value: "single", label: "Single", price: "300 DT" },
  { value: "double", label: "Double", price: "250 DT" },
  { value: "triple", label: "Triple", price: "200 DT" },
];

export default function Register() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    full_name: "",
    fac_or_org: "",
    participant_type: "",  // "student" | "professional"
    year: "",
    email: "",
    phone: "",
    cin: "",
    birthday: "",
    accommodation: "",
    facebook_link: "",
    bus: "",
    bus_city: "",
    hackathon: "",
    team_name: "",
    team_leader: "",
    team_members: "",
  });
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

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.cin.trim()) e.cin = "Required";
    if (!form.birthday) e.birthday = "Required";
    if (!form.fac_or_org.trim()) e.fac_or_org = "Required";
    if (!form.participant_type) e.participant_type = "Required";
    if (form.participant_type === "student" && !form.year) e.year = "Required";
    if (!form.accommodation) e.accommodation = "Required";
    if (!form.facebook_link.trim()) e.facebook_link = "Required";
    if (!form.bus) e.bus = "Required";
    if (form.bus === "yes" && !form.bus_city) e.bus_city = "Required";
    if (!form.hackathon) e.hackathon = "Required";
    if (form.hackathon === "yes") {
      if (!form.team_name.trim()) e.team_name = "Required";
      if (!form.team_leader.trim()) e.team_leader = "Required";
      if (!form.team_members.trim()) e.team_members = "Required";
    }
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
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#137c5520", border: "1px solid #137c55" }}>
              <Check size={32} style={{ color: "#137c55" }} />
            </div>
            <h3 className="font-display font-bold text-2xl text-nrtf-text">You&apos;re registered!</h3>
            <p className="text-nrtf-muted/70 max-w-sm">{message}</p>
            <p className="text-nrtf-muted/50 text-xs max-w-sm mt-2 font-sans">
              Once you receive your invite email, you can find a roommate at{" "}
              <a href="/portal" className="underline hover:text-nrtf-light transition-colors">/portal</a>.
            </p>
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

                {/* Personal info */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name *" error={errors.full_name}>
                    <input className={inputCls} placeholder="e.g. Foulen Ben Falten" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
                  </Field>
                  <Field label="Email *" error={errors.email}>
                    <input className={inputCls} type="email" placeholder="you@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                  <Field label="Phone Number *" error={errors.phone}>
                    <input className={inputCls} type="tel" placeholder="+216 XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </Field>
                  <Field label="CIN Number *" error={errors.cin}>
                    <input className={inputCls} placeholder="e.g. 12345678" value={form.cin} onChange={(e) => set("cin", e.target.value)} />
                  </Field>
                  <Field label="Birthday *" error={errors.birthday}>
                    <input className={inputCls} type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} />
                  </Field>
                </div>

                {/* Faculty / Organization */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Participant Type *" error={errors.participant_type}>
                    <div className="flex gap-4 pt-1">
                      {[{ value: "student", label: "Student (Faculty)" }, { value: "professional", label: "Organization" }].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="participant_type" value={opt.value} checked={form.participant_type === opt.value} onChange={() => set("participant_type", opt.value)} className="accent-nrtf-primary" />
                          <span className="text-sm text-nrtf-muted/80">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Faculty / Organization Name *" error={errors.fac_or_org}>
                    <input className={inputCls} placeholder="e.g. INSAT or IEEE" value={form.fac_or_org} onChange={(e) => set("fac_or_org", e.target.value)} />
                  </Field>
                </div>

                {form.participant_type === "student" && (
                  <Field label="Year of Study *" error={errors.year}>
                    <select className={inputCls} value={form.year} onChange={(e) => set("year", e.target.value)}>
                      <option value="" disabled style={{ color: "#111", background: "#fff" }}>Select year</option>
                      {YEARS.map((y) => <option key={y} value={y} style={{ color: "#111", background: "#fff" }}>{y}</option>)}
                    </select>
                  </Field>
                )}

                {/* Accommodation */}
                <Field label="Accommodation *" error={errors.accommodation}>
                  <div className="flex flex-wrap gap-3">
                    {ACCOMMODATION.map((opt) => {
                      const active = form.accommodation === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => set("accommodation", opt.value)}
                          className="flex flex-col items-start px-4 py-3 rounded-xl border transition-all duration-200 min-w-[100px]"
                          style={{ background: active ? "rgba(19,124,85,0.12)" : "rgba(255,255,255,0.03)", borderColor: active ? "#137c55" : "rgba(109,217,207,0.15)" }}>
                          <span className="text-sm font-semibold" style={{ color: active ? "#6dd9cf" : "rgba(109,217,207,0.6)" }}>{opt.label}</span>
                          <span className="text-xs mt-0.5" style={{ color: active ? "rgba(109,217,207,0.8)" : "rgba(109,217,207,0.35)" }}>{opt.price} / person</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Facebook */}
                <Field label="Facebook Profile Link *" error={errors.facebook_link}>
                  <input className={inputCls} type="url" placeholder="https://facebook.com/yourprofile" value={form.facebook_link} onChange={(e) => set("facebook_link", e.target.value)} />
                </Field>

                {/* Bus */}
                <Field label="Bus Transportation *" error={errors.bus}>
                  <div className="flex gap-4">
                    {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="bus" value={opt.value} checked={form.bus === opt.value} onChange={() => set("bus", opt.value)} className="accent-nrtf-primary" />
                        <span className="text-sm text-nrtf-muted/80">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                {form.bus === "yes" && (
                  <Field label="Bus Departure City *" error={errors.bus_city}>
                    <div className="flex gap-4">
                      {["Sfax", "Tunis"].map((city) => (
                        <label key={city} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="bus_city" value={city.toLowerCase()} checked={form.bus_city === city.toLowerCase()} onChange={() => set("bus_city", city.toLowerCase())} className="accent-nrtf-primary" />
                          <span className="text-sm text-nrtf-muted/80">{city}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                )}

                {/* Hackathon */}
                <Field label="Will you participate in the Hackathon? *" error={errors.hackathon}>
                  <div className="flex gap-4">
                    {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="hackathon" value={opt.value} checked={form.hackathon === opt.value} onChange={() => set("hackathon", opt.value)} className="accent-nrtf-primary" />
                        <span className="text-sm text-nrtf-muted/80">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                {form.hackathon === "yes" && (
                  <div className="grid sm:grid-cols-2 gap-5 pl-2 border-l-2 border-[rgba(109,217,207,0.2)]">
                    <Field label="Team Name *" error={errors.team_name}>
                      <input className={inputCls} placeholder="Your team name" value={form.team_name} onChange={(e) => set("team_name", e.target.value)} />
                    </Field>
                    <Field label="Team Leader Name *" error={errors.team_leader}>
                      <input className={inputCls} placeholder="Leader's full name" value={form.team_leader} onChange={(e) => set("team_leader", e.target.value)} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Team Members *" error={errors.team_members}>
                        <textarea className={`${inputCls} resize-none`} rows={3} placeholder="List all team members, one per line" value={form.team_members} onChange={(e) => set("team_members", e.target.value)} />
                      </Field>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{message}</p>
                )}

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
