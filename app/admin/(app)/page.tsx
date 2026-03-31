import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminOverview() {
  const supabase = createClient();

  const { count: totalProfiles } = await supabase
    .from("profiles").select("*", { count: "exact", head: true });

  const { count: matchedCount } = await supabase
    .from("room_members").select("profile_id", { count: "exact", head: true });

  const { count: pendingCount } = await supabase
    .from("room_requests").select("*", { count: "exact", head: true }).eq("status", "pending");

  return (
    <main className="min-h-screen px-8 py-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF" width={36} />
          <span className="font-display font-bold text-lg gradient-text">Admin Panel</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Attendees", value: totalProfiles ?? 0 },
          { label: "Matched", value: matchedCount ?? 0 },
          { label: "Pending Requests", value: pendingCount ?? 0 },
        ].map(stat => (
          <div key={stat.label} className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5">
            <div className="text-2xl font-display font-bold gradient-text">{stat.value}</div>
            <div className="text-xs text-nrtf-muted/50 font-sans mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link href="/admin/attendees"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors">
          Manage Attendees
        </Link>
        <Link href="/admin/rooms"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors">
          Manage Rooms
        </Link>
      </div>
    </main>
  );
}
