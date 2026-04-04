import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.room_number !== undefined) {
    if (typeof body.room_number !== "string" || body.room_number.trim().length === 0 || body.room_number.length > 50)
      return NextResponse.json({ error: "room_number must be a non-empty string (max 50 chars)" }, { status: 400 });
    updates.room_number = body.room_number.trim();
  }

  if (body.capacity !== undefined) updates.capacity = body.capacity;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  if (updates.capacity !== undefined && ![2, 3].includes(updates.capacity as number)) {
    return NextResponse.json({ error: "capacity must be 2 or 3" }, { status: 400 });
  }

  // Use service client for the update (bypasses RLS)
  const serviceClient = createServiceClient();
  const { error } = await serviceClient.from("rooms").update(updates).eq("id", params.id);
  if (error) {
    console.error("Room update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
