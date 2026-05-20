"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, Medal } from "lucide-react";
import { formatDate } from "@/lib/format";

interface UserChip {
  id: string;
  nickname: string;
  name: string;
  avatar?: string;
}

interface Stats {
  todayISO: string;
  last7: string[];
  todaySubmitted: UserChip[];
  todayMissing: UserChip[];
  attendanceGrid: (UserChip & { days: boolean[] })[];
  top3: (UserChip & { count: number })[];
  totalUsers: number;
  totalStandups: number;
  last7Total: number;
}

function Avatar({ user, size = "sm" }: { user: UserChip; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-8 h-8 text-sm" : "w-7 h-7 text-xs";
  return user.avatar ? (
    <img src={user.avatar} alt={user.nickname} className={`${dim} rounded-full object-cover flex-shrink-0`} />
  ) : (
    <div className={`${dim} rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold flex-shrink-0`}>
      {user.nickname[0]?.toUpperCase()}
    </div>
  );
}

function UserPill({ user, done }: { user: UserChip; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${done ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
      <Avatar user={user} />
      <div className="min-w-0">
        <p className={`text-xs font-medium truncate ${done ? "text-emerald-300" : "text-amber-300"}`}>{user.nickname}</p>
        <p className="text-[10px] text-slate-600 truncate">{user.name}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 403) { router.push("/"); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setStats(d); setLoading(false); } });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (!stats) return null;

  const submittedCount = stats.todaySubmitted.length;
  const totalCount = stats.totalUsers;
  const allDone = submittedCount === totalCount && totalCount > 0;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={13} /> กลับ
          </button>
          <h1 className="text-sm font-semibold text-white">Dashboard</h1>
          <div className="w-20" />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3 text-center">
            <p className="text-lg font-bold text-white">{submittedCount}<span className="text-slate-600 text-sm font-normal">/{totalCount}</span></p>
            <p className="text-[10px] text-slate-500 mt-0.5">ส่งวันนี้</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3 text-center">
            <p className="text-lg font-bold text-white">{stats.last7Total}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">7 วันล่าสุด</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3 text-center">
            <p className="text-lg font-bold text-white">{stats.totalStandups}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">ทั้งหมด</p>
          </div>
        </div>

        {/* Today status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300">วันนี้ — {formatDate(stats.todayISO)}</p>
            {allDone && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 size={12} /> ครบทุกคนแล้ว
              </span>
            )}
          </div>

          {totalCount === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">ยังไม่มีผู้ใช้งาน</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Submitted */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
                  <CheckCircle2 size={10} /> ส่งแล้ว ({submittedCount})
                </div>
                {stats.todaySubmitted.length === 0 ? (
                  <p className="text-xs text-slate-600 py-2">—</p>
                ) : (
                  <div className="space-y-1.5">
                    {stats.todaySubmitted.map((u) => <UserPill key={u.id} user={u} done />)}
                  </div>
                )}
              </div>

              {/* Missing */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold uppercase tracking-wider">
                  <Clock size={10} /> ยังไม่ส่ง ({stats.todayMissing.length})
                </div>
                {stats.todayMissing.length === 0 ? (
                  <p className="text-xs text-slate-600 py-2">—</p>
                ) : (
                  <div className="space-y-1.5">
                    {stats.todayMissing.map((u) => <UserPill key={u.id} user={u} done={false} />)}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Top 3 ranking */}
        {stats.top3.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl bg-white/[0.03] border border-white/8 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Medal size={13} className="text-yellow-400" />
              <p className="text-xs font-semibold text-slate-300">Ranking — ส่ง Daily เก่งที่สุด</p>
            </div>
            <div className="space-y-2">
              {stats.top3.map((u, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const barColors = ["bg-yellow-500", "bg-slate-400", "bg-amber-700"];
                const maxCount = stats.top3[0].count;
                const pct = maxCount > 0 ? (u.count / maxCount) * 100 : 0;
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-lg w-7 text-center flex-shrink-0">{medals[i]}</span>
                    <Avatar user={u} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300 font-medium truncate">{u.nickname}</span>
                        <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{u.count} standups</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                          className={`h-full rounded-full ${barColors[i]}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 7-day attendance grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/[0.03] border border-white/8 p-4"
        >
          <p className="text-xs font-semibold text-slate-300 mb-4">Attendance — 7 วันล่าสุด</p>

          {stats.attendanceGrid.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">ยังไม่มีผู้ใช้งาน</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-slate-600 font-normal pb-2 pr-3 min-w-[100px]">ชื่อ</th>
                    {stats.last7.map((d, i) => {
                      const isToday = d === stats.todayISO;
                      const date = new Date(d + "T00:00:00");
                      const dd = date.getDate();
                      const mm = date.toLocaleString("en", { month: "short" });
                      return (
                        <th key={d} className={`text-center font-normal pb-2 px-1 min-w-[36px] ${isToday ? "text-violet-400" : "text-slate-600"}`}>
                          <div>{dd}</div>
                          <div className="text-[9px]">{mm}</div>
                        </th>
                      );
                    })}
                    <th className="text-center text-slate-600 font-normal pb-2 pl-2 min-w-[32px]">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {stats.attendanceGrid.map((u) => {
                    const pct = Math.round((u.days.filter(Boolean).length / 7) * 100);
                    return (
                      <tr key={u.id}>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <Avatar user={u} size="sm" />
                            <span className="text-slate-300 truncate max-w-[80px]">{u.nickname}</span>
                          </div>
                        </td>
                        {u.days.map((done, i) => {
                          const isToday = stats.last7[i] === stats.todayISO;
                          return (
                            <td key={i} className="py-2 px-1 text-center">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold
                                ${done
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : isToday
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-white/[0.03] text-slate-700"
                                }`}>
                                {done ? "✓" : "–"}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-2 pl-2 text-center">
                          <span className={`text-xs font-medium ${pct >= 80 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-slate-600"}`}>
                            {pct}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>
    </main>
  );
}
