import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }

  // Verify this request is addressed to the current user and is still pending
  const { data: request } = await supabase
    .from("room_requests")
    .select("*")
    .eq("id", params.id)
    .eq("to_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (action === "decline") {
    const { error } = await supabase.from("room_requests").update({ status: "declined" }).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Accept: check if the requester is already in a room with space
  const { data: existingMembership } = await supabase
    .from("room_members")
    .select("room_id, rooms(capacity)")
    .eq("profile_id", request.from_id)
    .maybeSingle();

  let roomId: string;

  type ExistingMembership = { room_id: string; rooms: { capacity: number } | null };

  if (existingMembership) {
    const mem = existingMembership as ExistingMembership;
    roomId = mem.room_id;

    const { count } = await supabase
      .from("room_members")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    const capacity = mem.rooms?.capacity ?? 2;
    if ((count ?? 0) >= capacity) {
      return NextResponse.json({ error: "Room is already full" }, { status: 409 });
    }

    const { error: insertError } = await supabase.from("room_members").insert({ room_id: roomId, profile_id: user.id });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  } else {
    const { data: newRoom } = await supabase
      .from("rooms")
      .insert({ capacity: 2 })
      .select()
      .single();
    if (!newRoom) return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
    roomId = newRoom.id;
    const { error: insertError } = await supabase.from("room_members").insert([
      { room_id: roomId, profile_id: request.from_id },
      { room_id: roomId, profile_id: user.id },
    ]);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Mark as accepted only after room is successfully created
  const { error: updateError } = await supabase.from("room_requests").update({ status: "accepted" }).eq("id", params.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ success: true, room_id: roomId });
}
