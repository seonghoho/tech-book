// 관리자 세션 쿠키 서명/검증. Web Crypto만 사용해 proxy와 Node 런타임 양쪽에서 동작한다.

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type AdminSession = {
  githubId: string;
  login: string;
  exp: number; // epoch seconds
};

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const importKey = (secret: string) =>
  crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);

export async function signSession(session: AdminSession, secret: string) {
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const key = await importKey(secret);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): Promise<AdminSession | null> {
  if (!token || !secret) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  try {
    const key = await importKey(secret);
    // subtle.verify는 상수 시간 비교를 수행한다.
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(payload),
    );
    if (!valid) return null;

    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as AdminSession;
    if (typeof session.exp !== "number" || session.exp * 1000 <= now) return null;
    if (typeof session.githubId !== "string" || typeof session.login !== "string") return null;
    return session;
  } catch {
    return null;
  }
}

export function isAllowedAdmin(session: AdminSession | null, allowedGithubId: string | undefined) {
  return Boolean(session && allowedGithubId && session.githubId === allowedGithubId);
}
