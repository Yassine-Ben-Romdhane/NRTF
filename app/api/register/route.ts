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

    // Send confirmation email — awaited so Vercel doesn't kill it before it sends
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

        await transporter.sendMail({
          from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
          to: normalizedEmail,
          subject: "NRTF 3.0 – Payment Confirmation & Registration Details",
          html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px 20px;background:#c9e1da;font-family:Arial,Helvetica,sans-serif;">
  <div style="background:#e6f2ed;max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;">

    <!-- Header -->
    <div style="background:#1a3d3b;padding:32px 40px;">
      <div style="font-size:11px;font-weight:500;letter-spacing:1.5px;color:#7fbfb0;text-transform:uppercase;margin-bottom:8px;">Registration Confirmation</div>
      <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:500;line-height:1.3;">Payment Details &amp; Next Steps</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="font-size:15px;color:#2a5250;margin:0 0 6px 0;">Dear <strong>${full_name.trim()}</strong>,</p>
      <p style="font-size:15px;color:#3a4a48;line-height:1.7;margin:0 0 24px 0;">Welcome to <strong>NRTF 3.0</strong>! We're thrilled to have you on board and look forward to an exciting and enriching experience together. To secure your spot, please complete your payment using the details below.</p>

      <!-- Payment deadline -->
      <div style="background:#cfe6d9;border-radius:10px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:500;letter-spacing:1.2px;color:#2a6e5a;text-transform:uppercase;margin-bottom:12px;">Payment deadline</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="background:#1a3d3b;color:#7fbfb0;font-size:11px;font-weight:500;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:6px;white-space:nowrap;">Deadline</span>
          <span style="font-size:15px;font-weight:500;color:#1a3d3b;">April 20th, 2026</span>
        </div>
        <p style="font-size:14px;color:#2a3d3a;line-height:1.6;margin:0;">Your registration is only confirmed once payment is completed. Spots are limited and allocated on a <strong>first-come, first-served basis</strong> — we encourage you to act promptly.</p>
      </div>

      <!-- Accommodation fees -->
      <div style="background:#cfe6d9;border-radius:10px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:500;letter-spacing:1.2px;color:#2a6e5a;text-transform:uppercase;margin-bottom:12px;">Accommodation fees</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:8px;">
          <tr>
            <td style="background:#e6f2ed;border-radius:8px;padding:12px;text-align:center;width:33%;">
              <div style="font-size:11px;color:#5a7a76;margin-bottom:4px;">Single room</div>
              <div style="font-size:16px;font-weight:500;color:#1a3d3b;">335 DT</div>
            </td>
            <td style="background:#e6f2ed;border-radius:8px;padding:12px;text-align:center;width:33%;">
              <div style="font-size:11px;color:#5a7a76;margin-bottom:4px;">Double room</div>
              <div style="font-size:16px;font-weight:500;color:#1a3d3b;">250 DT</div>
            </td>
            <td style="background:#e6f2ed;border-radius:8px;padding:12px;text-align:center;width:33%;">
              <div style="font-size:11px;color:#5a7a76;margin-bottom:4px;">Triple room</div>
              <div style="font-size:16px;font-weight:500;color:#1a3d3b;">230 DT</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- D17 payment process -->
      <div style="background:#cfe6d9;border-radius:10px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:500;letter-spacing:1.2px;color:#2a6e5a;text-transform:uppercase;margin-bottom:12px;">D17 payment process</div>
        <p style="font-size:14px;color:#2a3d3a;line-height:1.6;margin:0 0 14px 0;">Please reach out to one of the organizers below first — they will provide you with the D17 payment details.</p>

        <!-- Contact: Ons -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
          <tr>
            <td width="36" valign="middle">
              <div style="width:36px;height:36px;border-radius:50%;background:#1a3d3b;text-align:center;line-height:36px;font-size:12px;font-weight:500;color:#7fbfb0;">OS</div>
            </td>
            <td style="padding-left:12px;" valign="middle">
              <div style="font-size:14px;font-weight:500;color:#1a3d3b;">Ons Sassi</div>
              <div style="font-size:12px;color:#5a7a76;">Project Manager</div>
            </td>
            <td align="right" valign="middle">
              <span style="font-size:13px;color:#2a5250;font-weight:500;">56 402 968</span>
            </td>
          </tr>
        </table>

        <!-- Contact: Hene -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
          <tr>
            <td width="36" valign="middle">
              <div style="width:36px;height:36px;border-radius:50%;background:#1a3d3b;text-align:center;line-height:36px;font-size:12px;font-weight:500;color:#7fbfb0;">HN</div>
            </td>
            <td style="padding-left:12px;" valign="middle">
              <div style="font-size:14px;font-weight:500;color:#1a3d3b;">Hene Nayet Yahia</div>
              <div style="font-size:12px;color:#5a7a76;">HR Manager</div>
            </td>
            <td align="right" valign="middle">
              <span style="font-size:13px;color:#2a5250;font-weight:500;">21 869 840</span>
            </td>
          </tr>
        </table>

        <!-- Contact: Khalil -->
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="36" valign="middle">
              <div style="width:36px;height:36px;border-radius:50%;background:#1a3d3b;text-align:center;line-height:36px;font-size:12px;font-weight:500;color:#7fbfb0;">KK</div>
            </td>
            <td style="padding-left:12px;" valign="middle">
              <div style="font-size:14px;font-weight:500;color:#1a3d3b;">Khalil Khadhraoui</div>
              <div style="font-size:12px;color:#5a7a76;">Sponsorship Manager</div>
            </td>
            <td align="right" valign="middle">
              <span style="font-size:13px;color:#2a5250;font-weight:500;">52 529 512</span>
            </td>
          </tr>
        </table>

        <div style="background:#b8d9cc;border-left:3px solid #1a3d3b;border-radius:0 8px 8px 0;padding:12px 16px;margin-top:12px;font-size:13px;color:#1a3d3b;line-height:1.6;">
          These are contact numbers only, not D17 payment numbers. Once you receive the details and complete your transfer, please send a screenshot to the same contact to validate your registration. Note that D17 applies a <strong>1% transaction fee</strong> — please include it to ensure the correct amount is received.
        </div>
      </div>

      <!-- Divider -->
      <hr style="border:none;border-top:1px solid #b8d9cc;margin:24px 0;">

      <!-- Reminders -->
      <div style="font-size:11px;font-weight:500;letter-spacing:1.2px;color:#2a6e5a;text-transform:uppercase;margin-bottom:12px;">Reminders</div>
      <ul style="margin:0 0 24px 0;padding-left:20px;list-style:disc;">
        <li style="font-size:14px;color:#2a3d3a;line-height:1.5;margin-bottom:8px;">Your spot is only confirmed after payment validation.</li>
        <li style="font-size:14px;color:#2a3d3a;line-height:1.5;margin-bottom:8px;">Places are limited — complete your payment as soon as possible.</li>
        <li style="font-size:14px;color:#2a3d3a;line-height:1.5;margin-bottom:8px;">If you're attending with friends, please remind them of the deadline.</li>
        <li style="font-size:14px;color:#2a3d3a;line-height:1.5;">If you are registering as a team, all members must enter the <strong>exact same team name</strong> with the <strong>same spelling</strong> when filling out the form.</li>
      </ul>

      <!-- Divider -->
      <hr style="border:none;border-top:1px solid #b8d9cc;margin:24px 0;">

      <!-- Help -->
      <p style="font-size:14px;color:#3a4a48;line-height:1.7;margin:0 0 16px 0;">If you have any questions or need assistance, feel free to reach out:</p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="font-size:13px;padding-right:20px;"><strong style="color:#1a3d3b;">Ons Sassi</strong> <span style="color:#5a7a76;">— 56 402 968</span></td>
          <td style="font-size:13px;"><strong style="color:#1a3d3b;">Hene Nayet Yahia</strong> <span style="color:#5a7a76;">— 21 869 840</span></td>
        </tr>
      </table>

      <p style="font-size:15px;color:#3a4a48;line-height:1.7;margin:0;">We look forward to welcoming you to <strong>NRTF 3.0</strong>.</p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #b8d9cc;padding:20px 40px;">
      <div style="font-size:13px;font-weight:500;color:#1a3d3b;">NRTF 3.0 Team</div>
      <div style="font-size:12px;color:#5a7a76;">Best regards</div>
    </div>

  </div>
</body>
</html>`,
        });
      } catch (err) {
      console.error("Confirmation email failed (non-fatal):", err);
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
      roommate1?.trim() ?? "",
      accommodation === "triple" ? (roommate2?.trim() ?? "") : "",
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
