import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

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

  // generateLink with type "invite" creates the auth user if they don't exist,
  // or reuses them if they do — avoiding the "already registered" error from createUser.
  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    type: "invite",
    email: registration.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/portal`,
    },
  });

  if (linkError || !linkData) {
    return NextResponse.json({ error: linkError?.message ?? "Failed to generate invite link" }, { status: 500 });
  }

  // Upsert profile so re-inviting a user doesn't crash on duplicate key
  const { error: profileError } = await serviceClient.from("profiles").upsert({
    id: linkData.user.id,
    full_name: registration.full_name,
    email: registration.email,
    university: registration.fac_or_org,
  }, { onConflict: "id" });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Send invite email via nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const inviteUrl = linkData.properties.action_link;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: registration.email,
    subject: "You're invited to NRTF3",
    html: `
      <p>Hi ${registration.full_name},</p>
      <p>You've been invited to the NRTF3 portal. Click the link below to set up your account:</p>
      <p><a href="${inviteUrl}">Accept Invitation</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });

  await serviceClient
    .from("registrations")
    .update({ status: "invited" })
    .eq("id", params.id);

  return NextResponse.json({ ok: true });
}
