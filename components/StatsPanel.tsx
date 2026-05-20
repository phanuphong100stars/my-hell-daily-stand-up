"use client";
import { motion } from "framer-motion";
import { X, CalendarDays, Trophy, BarChart2, Ticket, TrendingUp } from "lucide-react";
import { StandupEntry } from "@/lib/types";

interface Props {
  history: StandupEntry[];
  onClose: () => void;
}

function calcStreaks(history: StandupEntry[]) {
  const dates = [...new Set(history.map((e) => e.date).filter(Boolean))].sort();
  let current = 0;
  let longest = 0;
  let streak = 0;
  const set = new Set(dates);

  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  while (set.has(cur.toISOString().split("T")[0])) {
    current++;
    cur.setDate(cur.getDate() - 1);
  }

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { streak = 1; continue; }
    const prev = new Date(dates[i - 1] + "T00:00:00");
    const curr = new Date(dates[i] + "T00:00:00");
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }
  longest = Math.max(longest, streak, current);
  return { current, longest };
}

function workingDaysThisMonth() {
  const now = new Date();
  const year = now.getFullYear();
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
  const now = new Date();
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

// Animated fire based on streak level
function FireDisplay({ streak }: { streak: number }) {
  if (streak === 0) {
    return <span className="text-4xl opacity-20">🔥</span>;
  }

  const level = streak >= 14 ? 3 : streak >= 7 ? 2 : streak >= 3 ? 1 : 0;

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      {/* Outer glow for high streaks */}
      {level >= 2 && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-orange-500 blur-xl"
        />
      )}
      {/* Background fire (blurred) for level 2+ */}
      {level >= 1 && (
        <motion.span
          animate={{
            scale: [1, 1.3, 0.9, 1.2, 1],
            opacity: [0.2, 0.45, 0.2, 0.4, 0.2],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute text-5xl blur-sm"
          style={{ filter: "blur(4px)" }}
        >
          🔥
        </motion.span>
      )}
      {/* Main fire */}
      <motion.span
        animate={{
          scale: level >= 2
            ? [1, 1.15, 0.9, 1.1, 1]
            : level >= 1
              ? [1, 1.08, 0.96, 1.04, 1]
              : [1, 1.03, 1],
          rotate: level >= 1 ? [-3, 3, -2, 2, 0] : [0],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative text-5xl"
        style={{ filter: level >= 2 ? "drop-shadow(0 0 8px rgba(251,146,60,0.8))" : undefined }}
      >
        🔥
      </motion.span>
    </div>
  );
}

function Card({
  icon: Icon,
  iconColor,
  value,
  label,
  sub,
  delay = 0,
}: {
  icon: React.ElementType;
  iconColor: string;
  value: string | number;
  label: string;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22, ease: "easeOut" }}
      className="rounded-xl bg-white/[0.04] border border-white/8 p-4 flex flex-col gap-2.5"
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

export default function StatsPanel({ history, onClose }: Props) {
  const { current, longest } = calcStreaks(history);
  const workDays = workingDaysThisMonth();
  const thisMonth = standupsThisMonth(history);
  const jiraCount = uniqueJiraTickets(history);
  const bRate = blockersRate(history);
  const monthPct = workDays ? Math.round((thisMonth / workDays) * 100) : 0;

  const streakLevel = current >= 14 ? 3 : current >= 7 ? 2 : current >= 3 ? 1 : 0;
  const streakGlow =
    streakLevel >= 2
      ? "border-orange-500/50 shadow-lg shadow-orange-500/15"
      : streakLevel >= 1
        ? "border-amber-500/30"
        : "border-white/8";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                   w-[460px] max-w-[calc(100vw-2rem)] bg-[#0f1117] border border-white/10
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
          {/* Streak hero — full width, prominent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`rounded-xl bg-white/[0.04] border p-5 flex items-center gap-5 ${streakGlow}`}
          >
            <FireDisplay streak={current} />
            <div className="flex-1">
              <motion.p
                key={current}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`text-5xl font-black leading-none tracking-tight ${
                  streakLevel >= 2 ? "text-orange-400" : streakLevel >= 1 ? "text-amber-400" : "text-white"
                }`}
              >
                {current}
              </motion.p>
              <p className="text-sm font-semibold text-slate-300 mt-1">Streak ปัจจุบัน</p>
              <p className="text-xs text-slate-500 mt-0.5">วันติดต่อกัน</p>
              {current > 0 && (
                <p className="text-xs text-amber-500/80 mt-1.5">
                  {current >= 14 ? "🏆 ตำนาน! ไม่มีใครหยุดได้" : current >= 7 ? "🔥 สัปดาห์เต็ม ยอดเยี่ยม!" : current >= 3 ? "💪 เริ่มต้นดี ไปต่อ!" : "✨ ดี ทำต่อเนื่องไว้!"}
                </p>
              )}
            </div>
            <div className="text-center border-l border-white/8 pl-5">
              <p className="text-2xl font-bold text-yellow-400">{longest}</p>
              <div className="flex items-center gap-1 justify-center mt-1">
                <Trophy size={11} className="text-yellow-500" />
                <p className="text-[10px] text-slate-500">สถิติสูงสุด</p>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <Card
              icon={CalendarDays}
              iconColor="bg-violet-500/20 text-violet-400"
              value={history.length}
              label="Standup ทั้งหมด"
              sub={`Blockers ${bRate}%`}
              delay={0.1}
            />
            <Card
              icon={BarChart2}
              iconColor="bg-sky-500/20 text-sky-400"
              value={`${thisMonth}/${workDays}`}
              label="เดือนนี้"
              sub={`${monthPct}% ของวันทำงาน`}
              delay={0.15}
            />
            <Card
              icon={Ticket}
              iconColor="bg-emerald-500/20 text-emerald-400"
              value={jiraCount}
              label="JIRA tickets"
              sub="unique ทั้งหมด"
              delay={0.2}
            />
          </div>

          {/* Month consistency bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
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
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  monthPct >= 80 ? "bg-emerald-500" : monthPct >= 50 ? "bg-violet-500" : "bg-amber-500"
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
