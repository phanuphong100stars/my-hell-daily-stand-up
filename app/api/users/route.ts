import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { listUsers } from "@/lib/users";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await listUsers();
  return NextResponse.json(users.map((u) => ({ id: u.id, nickname: u.nickname, name: u.name, avatar: u.avatar })));
}
