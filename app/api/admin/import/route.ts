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

  // Pre-fetch all existing emails from both profiles and pending_attendees
  const [{ data: existingProfiles }, { data: existingPending }] = await Promise.all([
    serviceClient.from("profiles").select("email"),
    serviceClient.from("pending_attendees").select("email"),
  ]);

  const confirmedEmails = new Set((existingProfiles ?? []).map((p: { email: string }) => p.email.toLowerCase()));
  const pendingEmails = new Set((existingPending ?? []).map((p: { email: string }) => p.email.toLowerCase()));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const [full_name, email, , university] = row;
    if (!email || !full_name) continue;

    const normalizedEmail = (email as string).trim().toLowerCase();

    if (confirmedEmails.has(normalizedEmail) || pendingEmails.has(normalizedEmail)) {
      skipped++;
      continue;
    }

    const { error: insertError } = await serviceClient.from("pending_attendees").insert({
      full_name: (full_name as string).trim(),
      email: normalizedEmail,
      university: (university as string)?.trim() ?? "",
    });

    if (insertError) { errors.push(`${normalizedEmail}: ${insertError.message}`); continue; }

    imported++;
  }

  return NextResponse.json({ imported, skipped, errors });
}
