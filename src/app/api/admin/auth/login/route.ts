import { NextResponse, type NextRequest } from "next/server";
import { getAuthEnv } from "@/lib/admin/env";

const OAUTH_STATE_COOKIE = "admin_oauth_state";

export async function GET(request: NextRequest) {
  const { clientId } = getAuthEnv();
  const state = Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("hex");
  const redirectUri = new URL("/api/admin/auth/callback", request.nextUrl.origin).toString();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  // 신원 확인만 필요하므로 최소 scope. 저장소 쓰기는 서버의 fine-grained PAT가 담당한다.
  authorizeUrl.searchParams.set("scope", "read:user");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("allow_signup", "false");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin/auth",
    maxAge: 600,
  });
  return response;
}
