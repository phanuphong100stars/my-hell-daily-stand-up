"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface MentionUser {
  id: string;
  nickname: string;
  name: string;
  avatar?: string;
}

interface MentionState { query: string; atIndex: number }

function getMention(value: string, cursor: number): MentionState | null {
  const before = value.slice(0, cursor);
  const idx = before.lastIndexOf("@");
  if (idx === -1) return null;
  const between = before.slice(idx + 1);
  if (between.includes(" ") || between.includes("\n")) return null;
  return { query: between, atIndex: idx };
}

function applyMention(value: string, cursor: number, nickname: string) {
  const before = value.slice(0, cursor);
  const after = value.slice(cursor);
  const idx = before.lastIndexOf("@");
  const newBefore = before.slice(0, idx) + `@${nickname}`;
  return { value: newBefore + " " + after.trimStart(), cursor: newBefore.length + 1 };
}

function filterUsers(users: MentionUser[], query: string) {
  if (!query) return users.slice(0, 6);
  const q = query.toLowerCase();
  return users.filter(
    (u) => u.nickname.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
  ).slice(0, 6);
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  users: MentionUser[];
  placeholder?: string;
  className?: string;
}

export default function MentionInput({ value, onChange, users, placeholder, className }: Props) {
  const [mention, setMention] = useState<MentionState | null>(null);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = mention ? filterUsers(users, mention.query) : [];

  const commit = (nickname: string) => {
    const cursor = inputRef.current?.selectionStart ?? value.length;
    const { value: next, cursor: nextCursor } = applyMention(value, cursor, nickname);
    onChange(next);
    setMention(null);
    setSelected(0);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    const m = getMention(e.target.value, e.target.selectionStart ?? 0);
    setMention(m);
    setSelected(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mention || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => (s + 1) % suggestions.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => (s - 1 + suggestions.length) % suggestions.length); }
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); commit(suggestions[selected].nickname); }
    if (e.key === "Escape") setMention(null);
  };

  useEffect(() => { if (!value.includes("@")) setMention(null); }, [value]);

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setMention(null), 150)}
        placeholder={placeholder}
        className={className}
      />
      <AnimatePresence>
        {mention && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 z-50 w-52 rounded-xl bg-[#13151f] border border-white/12
                       shadow-2xl overflow-hidden"
          >
            {suggestions.map((u, i) => (
              <button
                key={u.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); commit(u.nickname); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors
                  ${i === selected ? "bg-violet-500/15" : "hover:bg-white/5"}`}
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.nickname} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-500/25 flex items-center justify-center text-violet-300 text-[10px] font-bold flex-shrink-0">
                    {u.nickname[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">@{u.nickname}</p>
                  <p className="text-[10px] text-slate-600 truncate">{u.name}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
