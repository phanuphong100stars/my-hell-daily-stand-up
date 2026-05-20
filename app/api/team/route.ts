import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { listUsers } from "@/lib/users";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // optional filter by date

  const db = await getDb();
  const query = date ? { date } : {};
  const standups = await db.collection("standups")
    .find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(200)
    .toArray();

  const users = await listUsers();
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const entries = standups.map((s) => ({
    id: s.id,
    userId: s.userId,
    name: s.name,
    date: s.date,
    yesterday: s.yesterday,
    today: s.today,
    blockers: s.blockers,
    help: s.help,
    createdAt: s.createdAt,
    user: s.userId ? userMap[s.userId] ?? null : null,
  }));

  // users who haven't submitted for the filtered date
  const missing = date
    ? users.filter((u) => !standups.some((s) => s.userId === u.id))
    : [];

  return NextResponse.json({ entries, missing });
}
