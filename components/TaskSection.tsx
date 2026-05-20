"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { TaskItem } from "@/lib/types";
import TaskRow from "./TaskRow";
import { MentionUser } from "./MentionInput";

interface Props {
  label: string;
  tasks: TaskItem[];
  jiraPrefixes: string[];
  onChange: (tasks: TaskItem[]) => void;
  mentionUsers: MentionUser[];
}

export default function TaskSection({ label, tasks, jiraPrefixes, onChange, mentionUsers }: Props) {
  const add = () => onChange([...tasks, { jira: "", desc: "" }]);
  const update = (i: number, t: TaskItem) => {
    const next = [...tasks];
    next[i] = t;
    onChange(next);
  };
  const remove = (i: number) => {
    const next = tasks.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [{ jira: "", desc: "" }]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((t, i) => (
            <TaskRow
              key={i}
              task={t}
              jiraPrefixes={jiraPrefixes}
              onChange={(nt) => update(i, nt)}
              onRemove={() => remove(i)}
              mentionUsers={mentionUsers}
            />
          ))}
        </AnimatePresence>
      </div>
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={add}
        className="w-full py-2 rounded-lg border border-dashed border-white/15 text-slate-500
                   hover:border-violet-500/50 hover:text-violet-400 text-sm transition-colors
                   flex items-center justify-center gap-1.5"
      >
        <Plus size={13} />
        เพิ่มรายการ
      </motion.button>
    </div>
  );
}
