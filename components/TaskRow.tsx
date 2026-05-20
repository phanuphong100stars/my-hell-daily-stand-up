"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { TaskItem } from "@/lib/types";
import MentionInput, { MentionUser } from "./MentionInput";

interface Props {
  task: TaskItem;
  jiraPrefix: string;
  onChange: (t: TaskItem) => void;
  onRemove: () => void;
  mentionUsers: MentionUser[];
}

export default function TaskRow({ task, jiraPrefix, onChange, onRemove, mentionUsers }: Props) {
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
        <input
          type="text"
          value={task.jira}
          onChange={(e) => onChange({ ...task, jira: e.target.value })}
          placeholder={jiraPrefix ? `${jiraPrefix}-XX` : "P100-XX"}
          className="w-28 px-3 py-2 bg-transparent text-sm font-mono text-slate-300
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
