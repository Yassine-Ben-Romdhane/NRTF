import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  const { data: registration, error: fetchError } = await serviceClient
    .from("registrations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !registration) {
    return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
  }

  if (registration.status === "invited") {
    return NextResponse.json({ error: "Already invited" }, { status: 409 });
  }

  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    registration.email,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/portal` }
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const { error: profileError } = await serviceClient.from("profiles").insert({
    id: inviteData.user.id,
    full_name: registration.full_name,
    email: registration.email,
    university: registration.university,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await serviceClient
    .from("registrations")
    .update({ status: "invited" })
    .eq("id", params.id);

  return NextResponse.json({ ok: true });
}
