import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-32-chars-minimum-pad!!";
});

describe("bcrypt password comparison", () => {
  it("hash matches original password", async () => {
    const hash = await bcrypt.hash("test-password-123", 10);
    expect(await bcrypt.compare("test-password-123", hash)).toBe(true);
  });

  it("wrong password does not match", async () => {
    const hash = await bcrypt.hash("test-password-123", 10);
    expect(await bcrypt.compare("wrong", hash)).toBe(false);
  });

  it("trim does not affect numeric password", async () => {
    const hash = await bcrypt.hash("test-password-123", 10);
    expect(await bcrypt.compare("test-password-123".trim(), hash.trim())).toBe(true);
  });

  it("hash with whitespace fails without trim", async () => {
    const hash = await bcrypt.hash("test-password-123", 10);
    // simulates corrupted env var with trailing newline
    const corruptedHash = hash + "\n";
    expect(await bcrypt.compare("test-password-123", corruptedHash)).toBe(false);
  });

  it("hash with whitespace passes after trim", async () => {
    const hash = await bcrypt.hash("test-password-123", 10);
    const corruptedHash = hash + "\n";
    expect(await bcrypt.compare("test-password-123", corruptedHash.trim())).toBe(true);
  });
});

const mockPayload = {
  sub: "user-123",
  email: "test@example.com",
  name: "Test User",
  nickname: "tester",
  role: "user" as const,
  firstLogin: false,
};

describe("JWT session", () => {
  it("sign and verify returns payload", async () => {
    const { signSession, verifySession } = await import("@/lib/auth");
    const token = await signSession(mockPayload);
    const result = await verifySession(token);
    expect(result?.sub).toBe("user-123");
    expect(result?.email).toBe("test@example.com");
  });

  it("tampered token returns null", async () => {
    const { verifySession } = await import("@/lib/auth");
    expect(await verifySession("invalid.token.here")).toBeNull();
  });
});
