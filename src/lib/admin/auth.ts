import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthEnv } from "@/lib/admin/env";
import { ADMIN_SESSION_COOKIE, isAllowedAdmin, verifySession } from "@/lib/admin/session";

export class AdminAuthError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export async function getAdminSession() {
  const { sessionSecret, adminGithubId } = getAuthEnv();
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value, sessionSecret);
  return isAllowedAdmin(session, adminGithubId) ? session : null;
}

// proxy 에서 1차로 막지만, 모든 쓰기 경로(server action, route handler)에서 다시 확인한다.
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new AdminAuthError();
  return session;
}

// 페이지용: 예외 대신 로그인 화면으로 보낸다.
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
