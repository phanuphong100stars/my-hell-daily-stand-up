"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { TaskItem } from "@/lib/types";
import MentionInput, { MentionUser } from "./MentionInput";

interface Props {
  task: TaskItem;
  jiraPrefixes: string[];
  onChange: (t: TaskItem) => void;
  onRemove: () => void;
  mentionUsers: MentionUser[];
}

function parseJira(value: string, prefixes: string[]): { prefix: string; num: string } {
  const clean = value.toUpperCase().startsWith("JIRA-") ? value.slice(5) : value;
  const dash = clean.indexOf("-");
  if (dash === -1) return { prefix: prefixes[0] ?? "", num: clean };
  return { prefix: clean.slice(0, dash), num: clean.slice(dash + 1) };
}

function combineJira(prefix: string, num: string): string {
  if (!prefix && !num) return "";
  if (!prefix) return num;
  return `${prefix}-${num}`;
}

export default function TaskRow({ task, jiraPrefixes, onChange, onRemove, mentionUsers }: Props) {
  const { prefix, num } = useMemo(() => parseJira(task.jira, jiraPrefixes), [task.jira, jiraPrefixes]);

  const setPrefix = (p: string) => onChange({ ...task, jira: combineJira(p, num) });
  const setNum = (n: string) => onChange({ ...task, jira: combineJira(prefix, n) });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex gap-2 items-center"
    >
      <div className="flex items-center shrink-0 rounded-lg bg-white/5 border border-white/10
                      focus-within:border-violet-500/60 transition-colors overflow-hidden">
        {jiraPrefixes.length > 0 ? (
          <select
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="pl-2.5 py-2 bg-transparent text-xs font-mono text-slate-400
                       focus:outline-none cursor-pointer border-r border-white/10 pr-1
                       appearance-none"
            style={{ maxWidth: "80px" }}
          >
            {jiraPrefixes.map((p) => (
              <option key={p} value={p} className="bg-[#13151f]">{p}</option>
            ))}
            {prefix && !jiraPrefixes.includes(prefix) && (
              <option value={prefix} className="bg-[#13151f]">{prefix}</option>
            )}
          </select>
        ) : (
          <span className="pl-2.5 pr-1 text-xs font-mono text-slate-600 select-none">–</span>
        )}
        <span className="text-xs font-mono text-slate-600 select-none px-0.5">-</span>
        <input
          type="text"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="XX"
          className="w-14 pr-2.5 py-2 bg-transparent text-sm font-mono text-slate-300
                     placeholder:text-slate-600 focus:outline-none"
        />
      </div>
      <MentionInput
        value={task.desc}
        onChange={(v) => onChange({ ...task, desc: v })}
        users={mentionUsers}
        placeholder="รายละเอียด..."
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm
                   text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60
                   transition-colors"
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-white/10
                   text-slate-500 hover:text-red-400 hover:border-red-500/40 transition-colors"
      >
        <X size={14} />
      </motion.button>
    </motion.div>
  );
}
