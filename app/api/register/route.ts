import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createServiceClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

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
      accommodation, roommate1, roommate2, facebook_link,
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
      roommate1: roommate1?.trim() ?? "",
      roommate2: accommodation === "triple" ? (roommate2?.trim() ?? "") : "",
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

    // Fire-and-forget confirmation email
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const accommodationLabel: Record<string, string> = {
          single: "Single Room – 335 DT",
          double: "Double Room – 250 DT",
          triple: "Triple Room – 230 DT",
        };

        await transporter.sendMail({
          from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
          to: normalizedEmail,
          subject: "NRTF 3.0 – Payment Confirmation & Registration Details",
          html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid rgba(109,217,207,0.2);">
    <div style="background:linear-gradient(135deg,#137c55,#6dd9cf);padding:32px 40px;">
      <h1 style="margin:0;font-size:22px;color:#fff;">NRTF 3.0</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Payment Confirmation &amp; Registration Details</p>
    </div>
    <div style="padding:32px 40px;">
      <p>Dear <strong>${full_name.trim()}</strong>,</p>
      <p>Welcome to NRTF 3.0! We're thrilled to have you on board and look forward to an exciting and enriching experience together.</p>
      <p>To secure your spot, please complete your payment using the details below.</p>

      <div style="background:rgba(109,217,207,0.06);border:1px solid rgba(109,217,207,0.15);border-radius:8px;padding:20px;margin:24px 0;">
        <h3 style="margin:0 0 12px;color:#6dd9cf;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Payment Information</h3>
        <p style="margin:0 0 8px;">⏳ <strong>Deadline: April 20th, 2026</strong></p>
        <p style="margin:0;color:rgba(226,232,240,0.7);font-size:13px;">Your registration is only confirmed once payment is completed. As spots are limited and allocated on a first-come, first-served basis, we encourage you to act promptly.</p>
      </div>

      <div style="background:rgba(19,124,85,0.08);border:1px solid rgba(19,124,85,0.2);border-radius:8px;padding:20px;margin:24px 0;">
        <h3 style="margin:0 0 12px;color:#6dd9cf;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Your Accommodation</h3>
        <p style="margin:0;font-size:15px;"><strong>${accommodationLabel[accommodation] ?? accommodation}</strong></p>
      </div>

      <p style="color:rgba(226,232,240,0.8);font-size:13px;background:rgba(255,200,0,0.06);border:1px solid rgba(255,200,0,0.2);border-radius:8px;padding:14px;">
        ⚠️ <strong>Important:</strong> If you are sharing a room or in need of a roommate, please contact us first before making any payment. Do not pay until you have coordinated with us.
      </p>

      <div style="margin:24px 0;">
        <h3 style="color:#6dd9cf;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">D17 Payment Process</h3>
        <p style="font-size:13px;color:rgba(226,232,240,0.8);">To pay via D17, please reach out to one of the following organizers first — they will provide you with the D17 payment details:</p>
        <ul style="font-size:13px;line-height:2;padding-left:20px;">
          <li>📞 <strong>Ons Sassi</strong>, Project Manager: 56 402 968</li>
          <li>📞 <strong>Hene Nayet Yahia</strong>, HR Manager: 21 869 840</li>
          <li>📞 <strong>Khalil Khadhraoui</strong>, Sponsorship Manager: 52 529 512</li>
        </ul>
        <p style="font-size:12px;color:rgba(226,232,240,0.5);">📌 These are contact numbers only, not D17 payment numbers. Once you receive the payment details and complete your transfer, send a screenshot to the same contact to validate your registration.</p>
        <p style="font-size:12px;color:rgba(226,232,240,0.5);">⚠️ D17 applies a 1% transaction fee. Please include it to ensure the correct amount is received.</p>
      </div>

      <div style="border-top:1px solid rgba(109,217,207,0.1);padding-top:20px;margin-top:24px;">
        <h3 style="color:#6dd9cf;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Reminders</h3>
        <ul style="font-size:13px;color:rgba(226,232,240,0.8);line-height:2;padding-left:20px;">
          <li>Your spot is only confirmed after payment validation</li>
          <li>Places are limited — complete payment as soon as possible</li>
          <li>If you're attending with friends, please remind them of the deadline</li>
        </ul>
      </div>

      <p style="font-size:13px;color:rgba(226,232,240,0.8);">If you have any questions or need assistance, feel free to contact:<br/>
        📞 Ons Sassi: 56 402 968<br/>
        📞 Hene Nayet Yahia: 21 869 840
      </p>

      <p style="margin-top:32px;">We look forward to welcoming you to NRTF 3.0 ✨</p>
      <p style="color:rgba(226,232,240,0.6);font-size:13px;">Best regards,<br/><strong>NRTF 3.0 Team</strong></p>
    </div>
    <div style="background:rgba(0,0,0,0.2);padding:16px 40px;text-align:center;font-size:11px;color:rgba(226,232,240,0.3);">
      © 2026 National Re-Tech Fusion · INSAT, Tunis, Tunisia
    </div>
  </div>
</body>
</html>`,
        });
      } catch (err) {
        console.error("Confirmation email failed (non-fatal):", err);
      }
    })();

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
