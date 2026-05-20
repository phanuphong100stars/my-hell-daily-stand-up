import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifySession, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { findUserById, updateUser, updateUserPassword } from "@/lib/users";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findUserById(session.sub);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id, email: user.email, name: user.name, nickname: user.nickname,
    avatar: user.avatar, role: user.role, firstLogin: user.firstLogin,
  });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, nickname, avatar } = await req.json();
  if (!name?.trim() || !nickname?.trim()) {
    return NextResponse.json({ error: "ชื่อและชื่อเล่นจำเป็น" }, { status: 400 });
  }

  // Limit avatar to 512KB base64
  if (avatar && avatar.length > 700_000) {
    return NextResponse.json({ error: "รูปภาพใหญ่เกินไป (max 512KB)" }, { status: 400 });
  }

  const updated = await updateUser(session.sub, {
    name: name.trim(),
    nickname: nickname.trim(),
    avatar: avatar ?? undefined,
    firstLogin: false,
  });

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Re-issue JWT with updated info + firstLogin: false
  const newToken = await signSession({
    sub: session.sub,
    email: session.email,
    name: updated.name,
    nickname: updated.nickname,
    role: session.role,
    firstLogin: false,
  });

  const res = NextResponse.json({ ok: true, user: updated });
  res.cookies.set(SESSION_COOKIE, newToken, sessionCookieOptions());
  return res;
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }

  const user = await findUserById(session.sub);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash.trim());
  if (!valid) return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });

  await updateUserPassword(session.sub, await bcrypt.hash(newPassword, 12));
  return NextResponse.json({ ok: true });
}
