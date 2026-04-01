import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  const { data: pending, error: fetchError } = await serviceClient
    .from("pending_attendees")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !pending) {
    return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
  }

  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    pending.email,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal` }
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const { error: profileError } = await serviceClient.from("profiles").insert({
    id: inviteData.user.id,
    full_name: pending.full_name,
    email: pending.email,
    university: pending.university,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await serviceClient.from("pending_attendees").delete().eq("id", params.id);

  return NextResponse.json({ ok: true });
}
