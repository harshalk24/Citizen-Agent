import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

// Routes that require an authenticated session
const PROTECTED = ["/discover", "/plan", "/dashboard", "/chat"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!needsAuth) return NextResponse.next();

  const session = await getSessionFromRequest(req);
  if (!session) {
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pass citizen ID as a header so server components/route handlers can read it
  const res = NextResponse.next();
  res.headers.set("x-citizen-id", session.citizenId);
  return res;
}

export const config = {
  matcher: [
    "/discover/:path*",
    "/plan/:path*",
    "/dashboard/:path*",
    "/chat/:path*",
  ],
};
