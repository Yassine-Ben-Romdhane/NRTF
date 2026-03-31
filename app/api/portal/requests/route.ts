import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to_id } = await req.json();
  if (!to_id) return NextResponse.json({ error: "to_id required" }, { status: 400 });
  if (to_id === user.id) return NextResponse.json({ error: "Cannot request yourself" }, { status: 400 });

  // Check for duplicate
  const { data: existing } = await supabase
    .from("room_requests")
    .select("id")
    .eq("from_id", user.id)
    .eq("to_id", to_id)
    .in("status", ["pending", "accepted"])
    .single();

  if (existing) return NextResponse.json({ error: "Request already exists" }, { status: 409 });

  const { error } = await supabase
    .from("room_requests")
    .insert({ from_id: user.id, to_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true }, { status: 201 });
}
