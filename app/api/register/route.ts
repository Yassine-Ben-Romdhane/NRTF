import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createServiceClient } from "@/lib/supabase/server";

function getSheets() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) throw new Error("Missing Google credentials");

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function appendToSheet(row: string[]): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return;
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error("Sheets backup failed (non-fatal):", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, phone, university, field, year, interests, events, ieee_member, ieee_id } = body;

    // Validation
    if (!full_name?.trim()) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    if (!university?.trim()) return NextResponse.json({ error: "University is required." }, { status: 400 });
    if (!field?.trim()) return NextResponse.json({ error: "Field of study is required." }, { status: 400 });
    if (!year) return NextResponse.json({ error: "Year of study is required." }, { status: 400 });
    if (!interests?.length) return NextResponse.json({ error: "Select at least one area of interest." }, { status: 400 });
    if (!events?.length) return NextResponse.json({ error: "Select at least one event." }, { status: 400 });
    if (!ieee_member) return NextResponse.json({ error: "IEEE membership status is required." }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();
    const serviceClient = createServiceClient();

    // Duplicate check via Supabase
    const { data: existing } = await serviceClient
      .from("registrations")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    // Primary insert into Supabase
    const { error: insertError } = await serviceClient.from("registrations").insert({
      full_name: full_name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      university: university.trim(),
      field: field.trim(),
      year,
      interests,
      events,
      ieee_member,
      ieee_id: ieee_id?.trim() ?? "",
    });

    if (insertError) {
      // Race condition: two requests passed the duplicate check simultaneously
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }
      throw insertError;
    }

    // Fire-and-forget Sheets backup
    void appendToSheet([
      full_name.trim(),
      normalizedEmail,
      phone.trim(),
      university.trim(),
      field.trim(),
      year,
      JSON.stringify(interests),
      JSON.stringify(events),
      ieee_member,
      ieee_id?.trim() ?? "",
      new Date().toISOString(),
    ]);

    return NextResponse.json(
      { success: true, message: "Registration successful! We'll be in touch soon." },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
