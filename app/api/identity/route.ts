import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// In-memory OTP store for demo (use Redis in production)
const otpStore = new Map<string, { code: string; expires: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/identity — send OTP or verify OTP
export async function POST(req: NextRequest) {
  const { action, phone, code, sessionId } = await req.json();

  if (action === "send") {
    if (!phone || !/^\+?[\d\s-]{7,15}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const otp = generateOTP();
    const normalizedPhone = phone.replace(/\s/g, "");
    otpStore.set(normalizedPhone, { code: otp, expires: Date.now() + 5 * 60 * 1000 });

    // In production: send via SMS gateway. For demo, return the code.
    return NextResponse.json({
      success: true,
      message: "OTP sent",
      // Demo only — remove in production:
      demoCode: otp,
    });
  }

  if (action === "verify") {
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/\s/g, "");
    const stored = otpStore.get(normalizedPhone);

    if (!stored || stored.expires < Date.now()) {
      return NextResponse.json({ error: "OTP expired or not found" }, { status: 400 });
    }

    if (stored.code !== code) {
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }

    otpStore.delete(normalizedPhone);

    // Upsert citizen record
    const citizen = await db.citizen.upsert({
      where: { phone: normalizedPhone },
      create: { phone: normalizedPhone, verified: true },
      update: { verified: true },
    });

    // Link session to citizen if provided
    if (sessionId) {
      await db.session.upsert({
        where: { id: sessionId },
        create: { id: sessionId, citizenId: citizen.id, messages: "[]" },
        update: { citizenId: citizen.id },
      });
    }

    return NextResponse.json({ success: true, citizenId: citizen.id });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// PATCH /api/identity/profile — update onboarding fields
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const body = await req.json();

  // Allow both session-based auth and explicit citizenId in body
  const citizenId = session?.citizenId ?? body.citizenId;
  if (!citizenId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { firstName, country, email, gender } = body;

  const updateData: Record<string, string | boolean> = { onboarded: true };
  if (firstName !== undefined) updateData.firstName = firstName;
  if (country   !== undefined) updateData.country   = country;
  if (email     !== undefined && email !== null) updateData.email = email;
  if (gender    !== undefined) updateData.gender = gender;

  const citizen = await db.citizen.update({
    where: { id: citizenId },
    data: updateData,
  });

  return NextResponse.json({ success: true, citizen });
}
