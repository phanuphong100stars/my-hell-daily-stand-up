"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, ChevronRight, Check, X } from "lucide-react";
import { StandupEntry } from "@/lib/types";
import { formatDate, relativeDay } from "@/lib/format";

interface Props {
  history: StandupEntry[];
  onLoad: (entry: StandupEntry) => void;
  onDelete: (id: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

function taskCount(entry: StandupEntry) {
  const filled = (tasks: typeof entry.yesterday) =>
    tasks.filter((t) => t.jira.trim() || t.desc.trim()).length;
  return { y: filled(entry.yesterday), t: filled(entry.today) };
}

export default function HistoryPanel({ history, onLoad, onDelete, hasMore, loadingMore, onLoadMore }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-600 text-sm gap-2">
        <Clock size={28} strokeWidth={1.5} />
        <p>ยังไม่มีประวัติ</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {history.map((entry) => {
          const { y, t } = taskCount(entry);
          const isConfirming = confirmId === entry.id;
          const rel = relativeDay(entry.date);

          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03]
                         border border-white/8 hover:border-white/15 transition-colors cursor-pointer"
              onClick={() => !isConfirming && onLoad(entry)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-300">{formatDate(entry.date) || "ไม่ระบุวันที่"}</p>
                  {rel === "today" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                                     bg-violet-500/20 text-violet-400 border border-violet-500/30">
                      วันนี้
                    </span>
                  )}
                  {rel === "yesterday" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md
                                     bg-white/5 text-slate-500 border border-white/8">
                      เมื่อวาน
                    </span>
                  )}
                  {rel === "tomorrow" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                                     bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      พรุ่งนี้
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-600">✅ {y}</span>
                  <span className="text-xs text-slate-600">🎯 {t}</span>
                  {entry.blockers.trim() && (
                    <span className="text-xs text-amber-600/70">🚧</span>
                  )}
                </div>
              </div>


              <div className="flex items-center gap-1 shrink-0">
                {isConfirming ? (
                  <>
                    <motion.button
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry.id!);
                        setConfirmId(null);
                      }}
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-500/15 transition-colors"
                    >
                      <Check size={13} />
                    </motion.button>
                    <motion.button
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                      className="p-1.5 rounded-md text-slate-500 hover:bg-white/5 transition-colors"
                    >
                      <X size={13} />
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setConfirmId(entry.id!); }}
                      className="p-1.5 rounded-md text-slate-700 hover:text-red-400 hover:bg-red-500/10
                                 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </motion.button>
                    <ChevronRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {hasMore && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onLoadMore}
          disabled={loadingMore}
          className="w-full py-2 rounded-lg border border-dashed border-white/10 text-slate-600
                     hover:border-white/20 hover:text-slate-400 text-xs transition-colors disabled:opacity-40"
        >
          {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
        </motion.button>
      )}
    </div>
  );
}
