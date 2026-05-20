"use client";
import { motion } from "framer-motion";
import { X, CalendarDays, Flame, Trophy, BarChart2, Ticket, TrendingUp } from "lucide-react";
import { StandupEntry } from "@/lib/types";

interface Props {
  history: StandupEntry[];
  onClose: () => void;
}

// ---- helpers ----

function calcStreaks(history: StandupEntry[]) {
  const dates = [...new Set(history.map((e) => e.date).filter(Boolean))].sort();
  let current = 0;
  let longest = 0;
  let streak  = 0;

  // build set for quick lookup
  const set = new Set(dates);

  // current streak from today backwards
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  while (set.has(cur.toISOString().split("T")[0])) {
    current++;
    cur.setDate(cur.getDate() - 1);
  }

  // longest streak (consecutive calendar days)
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { streak = 1; continue; }
    const prev = new Date(dates[i - 1] + "T00:00:00");
    const curr = new Date(dates[i]     + "T00:00:00");
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }
  longest = Math.max(longest, streak, current);

  return { current, longest };
}

function workingDaysThisMonth() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  let count = 0;
  for (let d = 1; d <= today; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function standupsThisMonth(history: StandupEntry[]) {
  const now   = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return history.filter((e) => e.date.startsWith(prefix)).length;
}

function uniqueJiraTickets(history: StandupEntry[]) {
  const set = new Set<string>();
  for (const e of history) {
    for (const t of [...e.yesterday, ...e.today]) {
      const j = t.jira.trim();
      if (j) set.add(j.toUpperCase());
    }
  }
  return set.size;
}

function blockersRate(history: StandupEntry[]) {
  if (!history.length) return 0;
  return Math.round((history.filter((e) => e.blockers.trim()).length / history.length) * 100);
}

// ---- sub-components ----

function Card({
  icon: Icon,
  iconColor,
  value,
  label,
  sub,
  delay = 0,
  wide = false,
}: {
  icon: React.ElementType;
  iconColor: string;
  value: string | number;
  label: string;
  sub?: string;
  delay?: number;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22, ease: "easeOut" }}
      className={`rounded-xl bg-white/[0.04] border border-white/8 p-4 flex flex-col gap-2.5
                  ${wide ? "col-span-2" : ""}`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[26px] font-bold text-white leading-none tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ---- main ----

export default function StatsPanel({ history, onClose }: Props) {
  const { current, longest } = calcStreaks(history);
  const workDays  = workingDaysThisMonth();
  const thisMonth = standupsThisMonth(history);
  const jiraCount = uniqueJiraTickets(history);
  const bRate     = blockersRate(history);
  const monthPct  = workDays ? Math.round((thisMonth / workDays) * 100) : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                   w-[440px] max-w-[calc(100vw-2rem)] bg-[#0f1117] border border-white/10
                   rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-violet-400" />
            <span className="text-sm font-semibold text-slate-200">สถิติ</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500
                       hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card
              icon={CalendarDays}
              iconColor="bg-violet-500/20 text-violet-400"
              value={history.length}
              label="Standup ทั้งหมด"
              sub={`Blockers ${bRate}%`}
              delay={0.05}
            />
            <Card
              icon={Flame}
              iconColor={current >= 3 ? "bg-orange-500/20 text-orange-400" : "bg-slate-500/20 text-slate-400"}
              value={current}
              label="Streak ปัจจุบัน"
              sub="วันติดต่อกัน"
              delay={0.1}
            />
            <Card
              icon={Trophy}
              iconColor="bg-yellow-500/20 text-yellow-400"
              value={longest}
              label="สถิติสูงสุด"
              sub="วันติดต่อกัน"
              delay={0.15}
            />
          </div>

          {/* Row 2: 2 cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card
              icon={BarChart2}
              iconColor="bg-sky-500/20 text-sky-400"
              value={`${thisMonth}/${workDays}`}
              label="เดือนนี้"
              sub={`${monthPct}% ของวันทำงาน`}
              delay={0.2}
            />
            <Card
              icon={Ticket}
              iconColor="bg-emerald-500/20 text-emerald-400"
              value={jiraCount}
              label="JIRA tickets"
              sub="unique ทั้งหมด"
              delay={0.25}
            />
          </div>

          {/* Month consistency bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">consistency เดือนนี้</span>
              <span className="text-xs font-semibold text-slate-300">{monthPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${monthPct}%` }}
                transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  monthPct >= 80 ? "bg-emerald-500" :
                  monthPct >= 50 ? "bg-violet-500" :
                  "bg-amber-500"
                }`}
              />
            </div>
          </motion.div>

          <p className="text-center text-xs text-slate-700 pt-1">
            คำนวณจาก {history.length} รายการที่โหลด
          </p>
        </div>
      </motion.div>
    </>
  );
}
