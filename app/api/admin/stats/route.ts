import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = await getDb();
  const standups = db.collection("standups");
  const users = db.collection("users");

  // Last 70 days for heatmap
  const since = new Date();
  since.setDate(since.getDate() - 69);
  const sinceISO = since.toISOString().split("T")[0];

  const [allStandups, allUsers] = await Promise.all([
    standups.find({}).sort({ date: -1 }).toArray(),
    users.find({}).toArray(),
  ]);

  // Standups per user (bar chart)
  const perUser: Record<string, { name: string; nickname: string; count: number }> = {};
  for (const u of allUsers) {
    perUser[u.id] = { name: u.name, nickname: u.nickname, count: 0 };
  }
  for (const s of allStandups) {
    if (s.userId && perUser[s.userId]) perUser[s.userId].count++;
  }
  const byUser = Object.values(perUser).sort((a, b) => b.count - a.count);

  // Standups per date (last 70 days for heatmap + last 30 days bar)
  const byDate: Record<string, number> = {};
  for (const s of allStandups) {
    if (s.date >= sinceISO) byDate[s.date] = (byDate[s.date] ?? 0) + 1;
  }

  // Last 30 days trend (area chart)
  const trend30: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    trend30.push({ date: iso, count: byDate[iso] ?? 0 });
  }

  // Role distribution (pie chart)
  const roleCounts = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});
  const byRole = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

  // Heatmap: last 70 days
  const heatmap = Object.entries(byDate).map(([date, count]) => ({ date, count }));

  // Summary stats
  const totalStandups = allStandups.length;
  const totalUsers = allUsers.length;
  const todayISO = new Date().toISOString().split("T")[0];
  const todayCount = byDate[todayISO] ?? 0;
  const last7 = trend30.slice(-7).reduce((s, d) => s + d.count, 0);

  return NextResponse.json({ byUser, trend30, byRole, heatmap, totalStandups, totalUsers, todayCount, last7 });
}
