"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { TeamSkeleton } from "@/components/Skeleton";
import { StandupEntry, PublicUser } from "@/lib/types";
import { buildText, formatDate } from "@/lib/format";
import StandupDatePicker from "@/components/StandupDatePicker";

interface TeamEntry extends StandupEntry {
  user?: { id: string; name: string; nickname: string; avatar?: string; jiraPrefix?: string } | null;
}

export default function TeamPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<TeamEntry[]>([]);
  const [missing, setMissing] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/team?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries ?? []);
        setMissing(d.missing ?? []);
        setLoading(false);
      });
  }, [date]);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={13} /> กลับ
          </button>
          <h1 className="text-sm font-semibold text-white">Team Daily</h1>
          <div className="w-36">
            <StandupDatePicker value={date} onChange={setDate} />
          </div>
        </div>

        {loading ? <TeamSkeleton /> : (
          <>
            {/* Status summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold uppercase tracking-wider mb-2">
                  <CheckCircle2 size={10} /> ส่งแล้ว ({entries.length})
                </div>
                {entries.length === 0 ? (
                  <p className="text-xs text-slate-600">—</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {entries.map((e) => {
                      const nick = e.user?.nickname ?? e.name;
                      const av = e.user?.avatar;
                      return (
                        <div key={e.id} className="flex items-center gap-1.5" title={nick}>
                          {av ? (
                            <img src={av} alt={nick} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 text-[10px] font-bold">
                              {nick[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-slate-300">{nick}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold uppercase tracking-wider mb-2">
                  <Clock size={10} /> ยังไม่ส่ง ({missing.length})
                </div>
                {missing.length === 0 ? (
                  <p className="text-xs text-slate-600">—</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {missing.map((u) => (
                      <div key={u.id} className="flex items-center gap-1.5" title={u.nickname}>
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.nickname} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                            {u.nickname[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-slate-500">{u.nickname}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Standup entries */}
            {entries.length === 0 ? (
              <div className="text-center py-12 text-slate-600 text-sm">ไม่มีข้อมูลวันที่เลือก</div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
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
                      {buildText(entry, entry.user?.jiraPrefix ?? "")}
                    </pre>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
