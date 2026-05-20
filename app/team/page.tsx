"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";
import { TeamSkeleton } from "@/components/Skeleton";
import { StandupEntry } from "@/lib/types";
import { buildText } from "@/lib/format";

interface TeamEntry extends StandupEntry {
  user?: { id: string; name: string; nickname: string; avatar?: string } | null;
}

export default function TeamPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/team?date=${date}`)
      .then((r) => r.json())
      .then((d) => { setEntries(d); setLoading(false); });
  }, [date]);

  const grouped = entries.reduce<Record<string, TeamEntry[]>>((acc, e) => {
    const key = e.date;
    acc[key] = [...(acc[key] ?? []), e];
    return acc;
  }, {});

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={13} /> กลับ
          </button>
          <h1 className="text-sm font-semibold text-white">Team Daily</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={12} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-400 focus:outline-none focus:text-slate-200"
            />
          </div>
        </div>

        {loading ? <TeamSkeleton /> : entries.length === 0 ? (
          <div className="text-center py-16 text-slate-600 text-sm">ไม่มีข้อมูลวันที่เลือก</div>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([d, items]) => (
            <div key={d}>
              <p className="text-xs text-slate-600 mb-2 font-mono">{d}</p>
              <div className="space-y-3">
                {items.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-white/[0.03] border border-white/8 p-4"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      {entry.user?.avatar ? (
                        <img src={entry.user.avatar} alt={entry.user.nickname} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0">
                          {(entry.user?.nickname ?? entry.name)?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-200">{entry.user?.nickname ?? entry.name}</p>
                        {entry.user && <p className="text-xs text-slate-600">{entry.user.name}</p>}
                      </div>
                    </div>
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-white/[0.02] rounded-lg p-3 overflow-x-auto">
                      {buildText(entry)}
                    </pre>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
