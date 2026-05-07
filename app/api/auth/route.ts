import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, sessionCookieOptions } from "@/lib/session";

// In-memory OTP store — persisted on globalThis so hot reloads don't wipe it
// Swap to Redis in production
const g = globalThis as unknown as { otpStore?: Map<string, { code: string; expiresAt: number }> };
if (!g.otpStore) g.otpStore = new Map();
const otpStore = g.otpStore;

// ── POST /api/auth ────────────────────────────────────────────────────────────
// action: "send"   → generate OTP, return it (demo mode — prod would use SMS)
// action: "verify" → validate OTP, upsert Citizen, set JWT cookie
// action: "logout" → clear session cookie
export async function POST(req: NextRequest) {
  const { action, phone, code, name } = await req.json();

  // ── Send OTP ────────────────────────────────────────────────────────────────
  if (action === "send") {
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // In production: send via SMS gateway. For now, return code in response.
    console.log(`[AUTH] OTP for ${phone}: ${otp}`);
    return NextResponse.json({ sent: true, code: otp }); // remove `code` in prod
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  if (action === "verify") {
    if (!phone || !code) return NextResponse.json({ error: "Phone and code required" }, { status: 400 });

    const stored = otpStore.get(phone);
    if (!stored || stored.code !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return NextResponse.json({ error: "Code expired" }, { status: 401 });
    }
    otpStore.delete(phone);

    // Upsert citizen
    const citizen = await db.citizen.upsert({
      where: { phone },
      update: { verified: true, ...(name ? { name } : {}) },
      create: { phone, verified: true, name: name ?? null },
    });

    const token = await signSession({ citizenId: citizen.id, phone, name: citizen.name ?? undefined });
    const res = NextResponse.json({ ok: true, citizen: { id: citizen.id, name: citizen.name, phone } });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: "ca_session", value: "", maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
