import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { listUsers, createUser, findUserByEmail, findUserById, updateUserPassword } from "@/lib/users";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await listUsers());
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, password, name, nickname, role = "user", requiresDaily = true } = await req.json();
  if (!email || !password || !name || !nickname) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) return NextResponse.json({ error: "Email นี้มีอยู่แล้ว" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  await createUser({
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash,
    name: name.trim(),
    nickname: nickname.trim(),
    role: role === "admin" ? "admin" : "user",
    firstLogin: true,
    requiresDaily: requiresDaily !== false,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, newPassword } = await req.json();
  if (!id || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });

  const target = await findUserById(id);
  if (!target) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  if (target.role === "admin") return NextResponse.json({ error: "ไม่สามารถรีเซ็ตรหัสผ่าน admin ได้" }, { status: 403 });

  const hash = await bcrypt.hash(newPassword.trim(), 12);
  await updateUserPassword(id, hash);
  return NextResponse.json({ ok: true });
}
