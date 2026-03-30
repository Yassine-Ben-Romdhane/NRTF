import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

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

export async function POST(req: NextRequest) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

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

    const sheets = getSheets();
    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate email in column B
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "B:B",
    });

    const emails = (existing.data.values ?? []).flat().map((e: string) => e.toLowerCase());
    if (emails.includes(normalizedEmail)) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    // Append registration row
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          full_name.trim(),
          normalizedEmail,
          phone.trim(),
          university.trim(),
          field.trim(),
          year,
          JSON.stringify(interests),
          JSON.stringify(events),
          ieee_member,
          ieee_id?.trim() || "",
          new Date().toISOString(),
        ]],
      },
    });

    return NextResponse.json(
      { success: true, message: "Registration successful! We'll be in touch soon." },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
