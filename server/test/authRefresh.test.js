import assert from "node:assert/strict";
import test from "node:test";

test("refresh tokens contain unique rotation identifiers", async () => {
  process.env.JWT_REFRESH_SECRET ||= "pathforge-refresh-test-secret";
  const { generateRefreshToken, verifyRefreshToken } = await import("../utils/token.util.js");
  const user = { _id: "66b8c8e2a7d631b9cc93c101" };
  const first = generateRefreshToken(user);
  const second = generateRefreshToken(user);
  const firstPayload = verifyRefreshToken(first);
  const secondPayload = verifyRefreshToken(second);

  assert.notEqual(first, second);
  assert.ok(firstPayload.jti);
  assert.ok(secondPayload.jti);
  assert.notEqual(firstPayload.jti, secondPayload.jti);
});
