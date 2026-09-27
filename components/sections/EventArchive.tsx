import { ArrowUpRight } from "lucide-react";

export default function EventArchive() {
  return (
    <section id="archive" className="relative px-8 py-20 md:px-16 lg:px-24">
      <div className="relative overflow-hidden rounded-3xl border border-nrtf-light/20 bg-nrtf-light/[0.04] px-8 py-12 md:px-14 md:py-16">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-nrtf-secondary/10 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-nrtf-light">Event archive</p>
          <h2 className="font-display text-4xl font-bold leading-tight text-nrtf-text md:text-6xl">
            NRTF 3.0 has concluded
          </h2>
          <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-nrtf-muted/80">
            The 2026 congress took place from 1–3 May in Sousse, Tunisia. This site remains available as a record of the program, organizing team, and partners. Registration is closed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#schedule" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-nrtf-primary to-nrtf-secondary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              View the program <ArrowUpRight size={16} />
            </a>
            <a href="#speakers" className="inline-flex items-center gap-2 rounded-full border border-nrtf-light/30 px-6 py-3 text-sm font-semibold text-nrtf-text transition-colors hover:bg-white/5">
              Meet the organizers <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
