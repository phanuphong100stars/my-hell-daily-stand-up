import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { findUserByEmail } from "@/lib/users";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "กรุณากรอก email และรหัสผ่าน" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(String(password).trim(), user.passwordHash.trim()))) {
    return NextResponse.json({ error: "email หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    role: user.role,
    firstLogin: user.firstLogin,
  });

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, nickname: user.nickname, avatar: user.avatar, role: user.role, firstLogin: user.firstLogin },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
