"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, FileText, TrendingUp, CalendarDays } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { formatDate } from "@/lib/format";

interface Stats {
  byUser: { nickname: string; name: string; count: number }[];
  trend30: { date: string; count: number }[];
  byRole: { role: string; count: number }[];
  heatmap: { date: string; count: number }[];
  totalStandups: number;
  totalUsers: number;
  todayCount: number;
  last7: number;
}

const PIE_COLORS = ["#7c3aed", "#38bdf8", "#34d399", "#f472b6"];

const TOOLTIP_STYLE = {
  backgroundColor: "#13151f",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#cbd5e1",
};

function HeatmapCell({ count, date }: { count: number; date: string }) {
  const opacity = count === 0 ? 0.04 : count === 1 ? 0.25 : count <= 3 ? 0.5 : 0.85;
  return (
    <div
      title={`${formatDate(date)}: ${count}`}
      className="w-3.5 h-3.5 rounded-sm bg-violet-500 transition-opacity"
      style={{ opacity }}
    />
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
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

  // Build 10-week heatmap grid (70 days, Mon–Sun columns)
  const heatmapGrid = (() => {
    if (!stats) return [];
    const map = new Map(stats.heatmap.map((h) => [h.date, h.count]));
    const today = new Date();
    // start from Monday of 10 weeks ago
    const start = new Date(today);
    start.setDate(today.getDate() - 69);
    // align to Monday
    const dow = start.getDay(); // 0=Sun
    start.setDate(start.getDate() - ((dow + 6) % 7));

    const weeks: { date: string; count: number }[][] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = cursor.toISOString().split("T")[0];
        week.push({ date: iso, count: map.get(iso) ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  })();

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (!stats) return null;

  const hasAnyStandup = stats.totalStandups > 0;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={13} /> กลับ
          </button>
          <h1 className="text-sm font-semibold text-white">Dashboard</h1>
          <button onClick={() => router.push("/admin/users")} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            จัดการผู้ใช้ →
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Standups ทั้งหมด" value={stats.totalStandups} icon={<FileText size={16} />} />
          <StatCard label="ผู้ใช้งาน" value={stats.totalUsers} icon={<Users size={16} />} />
          <StatCard label="วันนี้" value={stats.todayCount} icon={<CalendarDays size={16} />} />
          <StatCard label="7 วันล่าสุด" value={stats.last7} icon={<TrendingUp size={16} />} />
        </div>

        {!hasAnyStandup ? (
          <div className="text-center py-16 text-slate-600 text-sm rounded-2xl border border-white/8 bg-white/[0.02]">
            ยังไม่มีข้อมูล standup
          </div>
        ) : (
          <>
            {/* Trend area chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl bg-white/[0.03] border border-white/8 p-4"
            >
              <p className="text-xs font-semibold text-slate-400 mb-4">Standups รายวัน (30 วัน)</p>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={stats.trend30} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v) => [v as number, "standups"]}
                    labelFormatter={(l) => formatDate(l as string)}
                  />
                  <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Bar chart + Pie chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white/[0.03] border border-white/8 p-4"
              >
                <p className="text-xs font-semibold text-slate-400 mb-4">Standups ต่อคน</p>
                {stats.byUser.every((u) => u.count === 0) ? (
                  <div className="text-center py-8 text-slate-600 text-xs">ยังไม่มีข้อมูล</div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={stats.byUser} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="nickname" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v as number, "standups"]} />
                      <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl bg-white/[0.03] border border-white/8 p-4"
              >
                <p className="text-xs font-semibold text-slate-400 mb-4">สัดส่วน Role</p>
                {stats.byRole.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-xs">ยังไม่มีข้อมูล</div>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={stats.byRole} dataKey="count" nameKey="role"
                          cx="50%" cy="50%" innerRadius={32} outerRadius={52}
                          paddingAngle={3}
                        >
                          {stats.byRole.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 flex-1">
                      {stats.byRole.map((r, i) => (
                        <div key={r.role} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-slate-400 capitalize">{r.role}</span>
                          <span className="text-slate-600 ml-auto">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white/[0.03] border border-white/8 p-4"
            >
              <p className="text-xs font-semibold text-slate-400 mb-4">Activity (70 วัน)</p>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {heatmapGrid.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((cell) => (
                      <HeatmapCell key={cell.date} date={cell.date} count={cell.count} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-600">
                <span>น้อย</span>
                {[0.04, 0.25, 0.5, 0.85].map((o, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm bg-violet-500" style={{ opacity: o }} />
                ))}
                <span>มาก</span>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
