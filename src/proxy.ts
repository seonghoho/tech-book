import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isAllowedAdmin, verifySession } from "@/lib/admin/session";

// /admin 과 /api/admin 의 1차 관문. 각 route/action 에서도 requireAdmin() 으로 다시 검사한다.
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/auth/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const session = await verifySession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    process.env.ADMIN_SESSION_SECRET ?? "",
  );
  if (isAllowedAdmin(session, process.env.ADMIN_GITHUB_ID)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
