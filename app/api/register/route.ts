import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Registration for NRTF 3.0 closed after the May 2026 congress." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
