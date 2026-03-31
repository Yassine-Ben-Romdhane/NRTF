import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type MembershipWithRoom = {
  room_id: string;
  rooms: { room_number: string | null; capacity: number } | null;
};

type RoommateRow = {
  profiles: { full_name: string; university: string; id: string } | null;
};

export default async function PortalDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if already in a room
  const { data: membership } = await supabase
    .from("room_members")
    .select("room_id, rooms(room_number, capacity)")
    .eq("profile_id", user.id)
    .single();

  // Load roommates if matched
  let roommates: { id: string; full_name: string; university: string }[] = [];
  if (membership) {
    const { data } = await supabase
      .from("room_members")
      .select("profiles(id, full_name, university)")
      .eq("room_id", (membership as MembershipWithRoom).room_id)
      .neq("profile_id", user.id);
    roommates = (data ?? [])
      .map((d) => (d as RoommateRow).profiles)
      .filter((p): p is { full_name: string; university: string; id: string } => p !== null);
  }

  // Count pending incoming requests
  const { count: pendingCount } = await supabase
    .from("room_requests")
    .select("*", { count: "exact", head: true })
    .eq("to_id", user.id)
    .eq("status", "pending");

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/portal/login");
  }

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF" width={36} />
          <span className="font-display font-bold text-lg gradient-text">Room Matching</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted transition-colors font-sans">
            Sign out
          </button>
        </form>
      </div>

      <h1 className="font-display font-bold text-3xl text-nrtf-text mb-1">
        Welcome, {profile?.full_name?.split(" ")[0] ?? "Attendee"}
      </h1>
      <p className="text-sm text-nrtf-muted/60 font-sans mb-8">{profile?.university}</p>

      {membership ? (
        <div className="border border-[rgba(109,217,207,0.2)] rounded-lg p-6 mb-6">
          <div className="text-xs font-sans text-nrtf-muted/50 mb-3 uppercase tracking-wider">Your Room</div>
          {(membership as MembershipWithRoom).rooms?.room_number ? (
            <div className="text-2xl font-display font-bold gradient-text mb-4">
              Room {(membership as MembershipWithRoom).rooms?.room_number}
            </div>
          ) : (
            <div className="text-sm text-nrtf-muted/50 font-sans mb-4">Room number will be assigned by the organizers.</div>
          )}
          <div className="text-xs text-nrtf-muted/50 font-sans mb-2">Roommates</div>
          {roommates.length === 0 ? (
            <p className="text-sm text-nrtf-muted/40 font-sans">No other roommates yet.</p>
          ) : (
            roommates.map(r => (
              <div key={r.id} className="text-sm text-nrtf-text font-sans">
                {r.full_name} · <span className="text-nrtf-muted/50">{r.university}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="border border-[rgba(109,217,207,0.1)] rounded-lg p-6 mb-6 text-sm text-nrtf-muted/60 font-sans">
          You haven&apos;t been matched yet. Browse attendees to find a roommate.
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/portal/browse"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm font-medium border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors">
          Browse Attendees
        </Link>
        <Link href="/portal/requests"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm font-medium border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors relative">
          Requests
          {(pendingCount ?? 0) > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
              style={{ background: "#137c55", color: "#fff" }}>
              {pendingCount}
            </span>
          )}
        </Link>
      </div>
    </main>
  );
}
