import { NextResponse, type NextRequest } from "next/server";
import { getAuthEnv } from "@/lib/admin/env";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  signSession,
} from "@/lib/admin/session";

const OAUTH_STATE_COOKIE = "admin_oauth_state";

const fail = (request: NextRequest, reason: string) => {
  const url = new URL("/admin/login", request.nextUrl.origin);
  url.searchParams.set("error", reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/admin/auth" });
  return response;
};

export async function GET(request: NextRequest) {
  const { clientId, clientSecret, adminGithubId, sessionSecret } = getAuthEnv();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail(request, "state");
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: new URL("/api/admin/auth/callback", request.nextUrl.origin).toString(),
    }),
  });
  const tokenJson = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenJson.access_token) return fail(request, "token");

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!userResponse.ok) return fail(request, "user");
  const user = (await userResponse.json()) as { id: number; login: string };

  // 허용된 단 한 명의 GitHub 계정만 통과. 사용자 토큰은 신원 확인 후 버린다.
  if (String(user.id) !== adminGithubId) return fail(request, "forbidden");

  const token = await signSession(
    {
      githubId: String(user.id),
      login: user.login,
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SEC,
    },
    sessionSecret,
  );

  const response = NextResponse.redirect(new URL("/admin", request.nextUrl.origin));
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  });
  response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/admin/auth" });
  return response;
}
