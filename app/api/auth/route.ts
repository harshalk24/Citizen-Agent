import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, sessionCookieOptions } from "@/lib/session";

// ── POST /api/auth ─────────────────────────────────────────────────────────
// action: "login"  → create citizen (name optional), set JWT cookie
// action: "logout" → clear session cookie
export async function POST(req: NextRequest) {
  const { action, name } = await req.json();

  if (action === "login") {
    const citizen = await db.citizen.create({
      data: { name: name?.trim() || null },
    });

    const token = await signSession({
      citizenId: citizen.id,
      phone: citizen.id, // use id as identifier — phone field kept for future
      name: citizen.name ?? undefined,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  }

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: "ca_session", value: "", maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
