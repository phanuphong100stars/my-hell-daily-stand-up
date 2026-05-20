import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || (session.role !== "admin" && session.role !== "superAdmin")) return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = await getDb();
  const standups = db.collection("standups");
  const usersCol = db.collection("users");

  const todayISO = new Date().toISOString().split("T")[0];

  // last 7 days ISO strings (oldest → newest)
  const last7: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7.push(d.toISOString().split("T")[0]);
  }

  const since = last7[0];

  const [allUsers, recentStandups, todayStandups] = await Promise.all([
    usersCol.find({}).sort({ createdAt: 1 }).toArray(),
    standups.find({ date: { $gte: since } }).toArray(),
    standups.find({ date: todayISO }).toArray(),
  ]);

  const submittedTodayIds = new Set(todayStandups.map((s) => s.userId).filter(Boolean));

  const todaySubmitted = allUsers
    .filter((u) => submittedTodayIds.has(u.id))
    .map((u) => ({ id: u.id, nickname: u.nickname, name: u.name, avatar: u.avatar }));

  const todayMissing = allUsers
    .filter((u) => (u.requiresDaily ?? true) && !submittedTodayIds.has(u.id))
    .map((u) => ({ id: u.id, nickname: u.nickname, name: u.name, avatar: u.avatar }));

  // 7-day attendance grid per user
  const attendanceGrid = allUsers.map((u) => ({
    id: u.id,
    nickname: u.nickname,
    name: u.name,
    avatar: u.avatar,
    days: last7.map((d) => recentStandups.some((s) => s.userId === u.id && s.date === d)),
  }));

  // all-time count per user for ranking
  const allTimeCounts = await standups.aggregate([
    { $match: { userId: { $exists: true, $ne: null } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]).toArray();
  const countMap = new Map(allTimeCounts.map((c) => [c._id as string, c.count as number]));
  const top3 = allUsers
    .map((u) => ({ id: u.id, nickname: u.nickname, name: u.name, avatar: u.avatar, count: countMap.get(u.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter((u) => u.count > 0);

  const totalUsers = allUsers.length;
  const totalStandups = await standups.countDocuments();
  const last7Total = recentStandups.length;

  return NextResponse.json({
    todayISO,
    last7,
    todaySubmitted,
    todayMissing,
    attendanceGrid,
    top3,
    totalUsers,
    totalStandups,
    last7Total,
  });
}
