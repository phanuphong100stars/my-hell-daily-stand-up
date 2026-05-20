import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash || !password || !(await bcrypt.compare(password, hash))) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  const token = await signSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
