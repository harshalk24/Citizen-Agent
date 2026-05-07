import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { completed } = await req.json();
  if (typeof completed !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const deadline = await db.deadline.findFirst({
    where: { id: params.id, citizenId: session.citizenId },
  });
  if (!deadline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.deadline.update({
    where: { id: params.id },
    data: { completed },
  });

  return NextResponse.json(updated);
}
