// Deprecated v1 route — journeys are now handled via /discover
export async function GET() {
  return Response.json({ message: "Use /api/entitlements instead" }, { status: 410 });
}

export async function POST() {
  return Response.json({ message: "Use /api/entitlements instead" }, { status: 410 });
}
