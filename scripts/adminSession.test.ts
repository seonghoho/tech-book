import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isAllowedAdmin, signSession, verifySession } from "../src/lib/admin/session.ts";

const SECRET = "test-secret-that-is-long-enough-1234567890";
const future = Math.floor(Date.now() / 1000) + 3600;

describe("admin session", () => {
  it("round-trips a signed session", async () => {
    const token = await signSession({ githubId: "42", login: "me", exp: future }, SECRET);
    const session = await verifySession(token, SECRET);
    assert.deepEqual(session, { githubId: "42", login: "me", exp: future });
  });

  it("rejects tampered payloads and wrong secrets", async () => {
    const token = await signSession({ githubId: "42", login: "me", exp: future }, SECRET);
    const [, signature] = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ githubId: "1", login: "evil", exp: future }),
    ).toString("base64url");
    assert.equal(await verifySession(`${forgedPayload}.${signature}`, SECRET), null);
    assert.equal(await verifySession(token, "another-secret"), null);
    assert.equal(await verifySession("garbage", SECRET), null);
    assert.equal(await verifySession(undefined, SECRET), null);
  });

  it("rejects expired sessions", async () => {
    const token = await signSession({ githubId: "42", login: "me", exp: 1000 }, SECRET);
    assert.equal(await verifySession(token, SECRET), null);
  });

  it("only allows the configured GitHub id", () => {
    const session = { githubId: "42", login: "me", exp: future };
    assert.equal(isAllowedAdmin(session, "42"), true);
    assert.equal(isAllowedAdmin(session, "43"), false);
    assert.equal(isAllowedAdmin(session, undefined), false);
    assert.equal(isAllowedAdmin(null, "42"), false);
  });
});
