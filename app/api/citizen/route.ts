import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// ── GET /api/citizen — full profile with saved services, deadlines, action plans
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const citizen = await db.citizen.findUnique({
    where: { id: session.citizenId },
    include: {
      savedServices: { orderBy: { createdAt: "desc" } },
      deadlines:     { where: { completed: false }, orderBy: { dueDate: "asc" } },
      actionPlans:   { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!citizen) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ citizen });
}

// ── PATCH /api/citizen — update name, country, lifeEvent, employment
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["name", "country", "lifeEvent", "employment", "profileContext"] as const;
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const citizen = await db.citizen.update({
    where: { id: session.citizenId },
    data: updates,
  });

  return NextResponse.json({ citizen });
}
