import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const VALID_STATUSES = ["not_started", "in_progress", "completed"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const service = await db.savedService.findFirst({
    where: { id: params.id, citizenId: session.citizenId },
  });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.savedService.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
