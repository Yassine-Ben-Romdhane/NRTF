import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import RequestButton from "./RequestButton";

export default async function BrowsePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  // Check if current user is already in a full room
  const { data: myMembership } = await supabase
    .from("room_members")
    .select("room_id, rooms(capacity)")
    .eq("profile_id", user.id)
    .single();

  // Get rooms that are full (member count >= capacity)
  const { data: fullRoomMembers } = await supabase
    .from("room_members")
    .select("profile_id, room_id");

  const roomCounts: Record<string, number> = {};
  (fullRoomMembers ?? []).forEach(({ room_id }: { room_id: string }) => {
    roomCounts[room_id] = (roomCounts[room_id] ?? 0) + 1;
  });

  const fullRoomProfileIds = new Set(
    (fullRoomMembers ?? [])
      .filter(({ room_id }: { room_id: string }) => roomCounts[room_id] >= 3)
      .map(({ profile_id }: { profile_id: string }) => profile_id)
  );

  // Get IDs we've already sent a request to (pending or accepted)
  const { data: sentRequests } = await supabase
    .from("room_requests")
    .select("to_id, status")
    .eq("from_id", user.id)
    .in("status", ["pending", "accepted"]);

  const alreadyRequestedIds = new Set((sentRequests ?? []).map((r: { to_id: string }) => r.to_id));

  // Fetch attendees who are looking
  const { data: attendees } = await supabase
    .from("profiles")
    .select("id, full_name, university, bio, is_looking")
    .eq("is_looking", true)
    .neq("id", user.id);

  const available = (attendees ?? []).filter(
    (a: { id: string }) => !fullRoomProfileIds.has(a.id) && !alreadyRequestedIds.has(a.id)
  );

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/portal" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Find a Roommate</h1>
      </div>

      {myMembership && (
        <div className="mb-6 p-4 rounded border border-[rgba(109,217,207,0.15)] text-sm text-nrtf-muted/60 font-sans">
          You&apos;re already matched. You can still browse to add a 3rd roommate if your room allows it.
        </div>
      )}

      {available.length === 0 ? (
        <p className="text-sm text-nrtf-muted/50 font-sans">No attendees available to match right now.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {available.map((attendee: { id: string; full_name: string; university: string; bio: string | null }) => (
            <div key={attendee.id}
              className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <div className="font-sans font-medium text-nrtf-text text-sm">{attendee.full_name}</div>
                <div className="text-xs text-nrtf-muted/50 font-sans mt-0.5">{attendee.university}</div>
                {attendee.bio && (
                  <div className="text-xs text-nrtf-muted/60 font-sans mt-2 max-w-xs">{attendee.bio}</div>
                )}
              </div>
              <RequestButton toId={attendee.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
