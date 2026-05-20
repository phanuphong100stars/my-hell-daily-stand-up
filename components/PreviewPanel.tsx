"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, FileText } from "lucide-react";
import { buildText } from "@/lib/format";
import { StandupEntry, TaskItem } from "@/lib/types";

interface Props {
  entry: StandupEntry;
  jiraPrefix: string;
}

const LINE_STYLES: Record<string, string> = {
  "📅": "text-sky-400 font-bold",
  "✅": "text-emerald-400 font-semibold",
  "🎯": "text-orange-400 font-semibold",
  "🚧": "text-amber-400 font-semibold",
  "🙋": "text-pink-400 font-semibold",
};

// Render @mentions as colored inline chips
function renderMentions(text: string) {
  const parts = text.split(/(@[^\s@]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-violet-300 font-semibold bg-violet-500/12 px-1 rounded-sm">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function StyledLine({ line }: { line: string }) {
  for (const [emoji, cls] of Object.entries(LINE_STYLES)) {
    if (line.startsWith(emoji)) return <span className={cls}>{renderMentions(line)}</span>;
  }
  if (line === "* ไม่มี") return <span className="text-slate-600 italic">{line}</span>;
  if (line.startsWith("*")) return <span className="text-slate-300">{renderMentions(line)}</span>;
  return <span className="text-slate-400">{renderMentions(line)}</span>;
}

function hasContent(entry: StandupEntry): boolean {
  const hasTask = (tasks: TaskItem[]) => tasks.some((t) => t.jira.trim() || t.desc.trim());
  return hasTask(entry.yesterday) || hasTask(entry.today) ||
    !!entry.blockers.trim() || !!entry.help.trim();
}

export default function PreviewPanel({ entry, jiraPrefix }: Props) {
  const [copied, setCopied] = useState(false);
  const text = buildText(entry, jiraPrefix);
  const lines = text.split("\n");
  const empty = !hasContent(entry);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Preview</span>
        {!empty && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${copied
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : "bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30"
              }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "check" : "copy"}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1.5"
              >
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {empty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 rounded-xl bg-white/[0.02] border border-dashed border-white/8 min-h-[320px]
                       flex flex-col items-center justify-center gap-3 text-center px-6"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <FileText size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">ยังไม่มีรายการ</p>
              <p className="text-xs text-slate-700 mt-1">กรอก task เมื่อวานและวันนี้<br />แล้ว preview จะแสดงที่นี่</p>
            </div>
            <p className="text-[10px] text-slate-700 mt-2">
              พิมพ์ <span className="text-violet-500 font-mono">@</span> เพื่อแท็กเพื่อนร่วมทีม
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 rounded-xl bg-white/[0.03] border border-white/8 p-4 font-mono text-sm
                       leading-[1.9] overflow-y-auto min-h-[320px]"
          >
            {lines.map((line, i) => (
              <div key={i}>
                <StyledLine line={line} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
