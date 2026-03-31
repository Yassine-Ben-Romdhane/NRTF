import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import RoomEditor from "./RoomEditor";

type RoomRow = {
  id: string;
  room_number: string | null;
  capacity: number;
  created_at: string;
};

type MemberRow = {
  room_id: string;
  profiles: { id: string; full_name: string; university: string } | null;
};

export default async function AdminRoomsPage() {
  const supabase = createClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_number, capacity, created_at")
    .order("created_at");

  const { data: members } = await supabase
    .from("room_members")
    .select("room_id, profiles(id, full_name, university)");

  const membersByRoom: Record<string, { id: string; full_name: string; university: string }[]> = {};
  ((members ?? []) as MemberRow[]).forEach((m) => {
    if (!m.profiles) return;
    if (!membersByRoom[m.room_id]) membersByRoom[m.room_id] = [];
    membersByRoom[m.room_id].push(m.profiles);
  });

  return (
    <main className="min-h-screen px-8 py-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Rooms ({rooms?.length ?? 0})</h1>
      </div>

      {(!rooms || rooms.length === 0) ? (
        <p className="text-sm text-nrtf-muted/50 font-sans">No rooms yet. They are created when attendees accept requests.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {(rooms as RoomRow[]).map((room) => (
            <div key={room.id} className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-xs text-nrtf-muted/50 font-sans mb-1">Room</div>
                  <div className="font-display font-bold text-lg gradient-text">
                    {room.room_number ?? "Unassigned"}
                  </div>
                </div>
                <RoomEditor roomId={room.id} currentNumber={room.room_number} currentCapacity={room.capacity} />
              </div>
              <div className="text-xs text-nrtf-muted/50 font-sans mb-2">
                Members ({membersByRoom[room.id]?.length ?? 0}/{room.capacity})
              </div>
              {(membersByRoom[room.id] ?? []).map(m => (
                <div key={m.id} className="text-sm text-nrtf-text font-sans">
                  {m.full_name} · <span className="text-nrtf-muted/50">{m.university}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
