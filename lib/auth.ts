import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function signSession(): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE };
