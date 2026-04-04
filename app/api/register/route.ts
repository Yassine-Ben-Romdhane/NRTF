import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createServiceClient } from "@/lib/supabase/server";

// Simple in-memory rate limiter: max 5 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

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
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error("Sheets backup failed (non-fatal):", err);
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      full_name, email, phone, cin, birthday,
      fac_or_org, participant_type, year,
      accommodation, facebook_link,
      bus, bus_city,
      hackathon, team_name, team_leader, team_members,
    } = body;

    // Validation
    if (!full_name?.trim()) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    if (!cin?.trim()) return NextResponse.json({ error: "CIN number is required." }, { status: 400 });
    if (!birthday) return NextResponse.json({ error: "Birthday is required." }, { status: 400 });
    if (!fac_or_org?.trim()) return NextResponse.json({ error: "Faculty / Organization name is required." }, { status: 400 });
    if (!participant_type) return NextResponse.json({ error: "Participant type is required." }, { status: 400 });
    if (participant_type === "student" && !year?.trim()) return NextResponse.json({ error: "Year of study is required." }, { status: 400 });
    if (!accommodation) return NextResponse.json({ error: "Accommodation type is required." }, { status: 400 });
    if (!facebook_link?.trim()) return NextResponse.json({ error: "Facebook profile link is required." }, { status: 400 });
    if (!bus) return NextResponse.json({ error: "Bus preference is required." }, { status: 400 });
    if (bus === "yes" && !bus_city) return NextResponse.json({ error: "Please select your bus city." }, { status: 400 });
    if (!hackathon) return NextResponse.json({ error: "Hackathon participation is required." }, { status: 400 });
    if (hackathon === "yes") {
      if (!team_name?.trim()) return NextResponse.json({ error: "Team name is required." }, { status: 400 });
      if (!team_leader?.trim()) return NextResponse.json({ error: "Team leader name is required." }, { status: 400 });
      if (!team_members?.trim()) return NextResponse.json({ error: "Team members are required." }, { status: 400 });
    }

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
      cin: cin.trim(),
      birthday,
      fac_or_org: fac_or_org.trim(),
      participant_type,
      year: participant_type === "student" ? (year?.trim() ?? "") : "",
      accommodation,
      facebook_link: facebook_link.trim(),
      bus,
      bus_city: bus === "yes" ? bus_city : "",
      hackathon,
      team_name: hackathon === "yes" ? (team_name?.trim() ?? "") : "",
      team_leader: hackathon === "yes" ? (team_leader?.trim() ?? "") : "",
      team_members: hackathon === "yes" ? (team_members?.trim() ?? "") : "",
    });

    if (insertError) {
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
      cin.trim(),
      birthday,
      fac_or_org.trim(),
      participant_type,
      participant_type === "student" ? (year?.trim() ?? "") : "",
      accommodation,
      facebook_link.trim(),
      bus,
      bus === "yes" ? bus_city : "",
      hackathon,
      hackathon === "yes" ? (team_name?.trim() ?? "") : "",
      hackathon === "yes" ? (team_leader?.trim() ?? "") : "",
      hackathon === "yes" ? (team_members?.trim() ?? "") : "",
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
