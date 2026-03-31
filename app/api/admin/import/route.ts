import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { google } from "googleapis";

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return NextResponse.json({ error: "Missing GOOGLE_SHEET_ID" }, { status: 500 });

  const sheets = getSheets();
  let rows: string[][];
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A2:K",
    });
    rows = (result.data.values ?? []) as string[][];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to read Google Sheet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  const serviceClient = createServiceClient();

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const [full_name, email, , university] = row;
    if (!email || !full_name) continue;

    const normalizedEmail = (email as string).trim().toLowerCase();

    // Check if user already exists in profiles
    const { data: existing } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) { skipped++; continue; }

    // Create Supabase auth user and send invite
    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
      normalizedEmail,
      { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal` }
    );

    if (inviteError) { errors.push(`${normalizedEmail}: ${inviteError.message}`); continue; }

    // Create profile row
    const { error: profileError } = await serviceClient.from("profiles").insert({
      id: inviteData.user.id,
      full_name: (full_name as string).trim(),
      email: normalizedEmail,
      university: (university as string)?.trim() ?? "",
    });

    if (profileError) { errors.push(`${normalizedEmail}: ${profileError.message}`); continue; }

    imported++;
  }

  return NextResponse.json({ imported, skipped, errors });
}
