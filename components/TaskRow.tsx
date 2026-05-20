"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Plus } from "lucide-react";
import { TaskItem } from "@/lib/types";
import MentionInput, { MentionUser } from "./MentionInput";

interface Props {
  task: TaskItem;
  jiraPrefixes: string[];
  onChange: (t: TaskItem) => void;
  onRemove: () => void;
  onAddPrefix: (p: string) => void;
  mentionUsers: MentionUser[];
}

function parseJira(value: string): { prefix: string; num: string } {
  const clean = value.toUpperCase().startsWith("JIRA-") ? value.slice(5) : value;
  const dash = clean.indexOf("-");
  if (dash === -1) return { prefix: "", num: clean };
  return { prefix: clean.slice(0, dash), num: clean.slice(dash + 1) };
}

function combineJira(prefix: string, num: string): string {
  if (!prefix && !num) return "";
  if (!prefix) return num;
  return `${prefix}-${num}`;
}

export default function TaskRow({ task, jiraPrefixes, onChange, onRemove, onAddPrefix, mentionUsers }: Props) {
  const { prefix, num } = useMemo(() => parseJira(task.jira), [task.jira]);
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addVal, setAddVal] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const setPrefix = (p: string) => { onChange({ ...task, jira: combineJira(p, num) }); setOpen(false); };
  const setNum = (n: string) => onChange({ ...task, jira: combineJira(prefix, n) });

  const confirmAdd = () => {
    const p = addVal.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (p) { onAddPrefix(p); setPrefix(p); }
    setAddVal(""); setShowAdd(false);
  };

  const displayLabel = prefix || "–";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex gap-2 items-center"
    >
      {/* JIRA field */}
      <div className="flex items-center shrink-0 rounded-lg bg-white/5 border border-white/10
                      focus-within:border-violet-500/60 transition-colors overflow-hidden">

        {/* Custom prefix dropdown */}
        <div ref={dropRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 pl-2.5 pr-2 py-2 text-xs font-mono
                       border-r border-white/10 transition-colors hover:bg-white/5
                       text-slate-300 min-w-[52px]"
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronDown size={10} className={`text-slate-500 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 mt-1 z-50 min-w-[100px] rounded-xl
                           bg-[#1a1c2a] border border-white/12 shadow-2xl overflow-hidden py-1"
              >
                {/* None option */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); setPrefix(""); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono
                              hover:bg-white/8 transition-colors
                              ${!prefix ? "text-slate-300" : "text-slate-500"}`}
                >
                  <span>–</span>
                  {!prefix && <Check size={10} className="text-violet-400" />}
                </button>

                {jiraPrefixes.length > 0 && <div className="h-px bg-white/8 mx-2 my-1" />}

                {jiraPrefixes.map((p) => (
                  <button
                    key={p}
                    onMouseDown={(e) => { e.preventDefault(); setPrefix(p); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono
                                hover:bg-white/8 transition-colors
                                ${prefix === p ? "text-violet-300" : "text-slate-300"}`}
                  >
                    <span>{p}</span>
                    {prefix === p && <Check size={10} className="text-violet-400" />}
                  </button>
                ))}

                <div className="h-px bg-white/8 mx-2 my-1" />

                {/* Add new */}
                {showAdd ? (
                  <div className="px-2 py-1.5 flex gap-1">
                    <input
                      autoFocus
                      value={addVal}
                      onChange={(e) => setAddVal(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmAdd(); if (e.key === "Escape") { setShowAdd(false); setAddVal(""); } }}
                      placeholder="HBD"
                      className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/15 text-xs font-mono
                                 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 w-0"
                    />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); confirmAdd(); }}
                      disabled={!addVal.trim()}
                      className="px-2 py-1 rounded bg-violet-600/20 border border-violet-500/30
                                 text-violet-300 text-xs hover:bg-violet-600/30 transition-colors disabled:opacity-40"
                    >
                      <Check size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setShowAdd(true); }}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-violet-400
                               hover:bg-violet-500/10 transition-colors"
                  >
                    <Plus size={10} /> เพิ่มใหม่
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
