"use client";
import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/format";
import "react-day-picker/style.css";

interface Props {
  value: string;
  onChange: (iso: string) => void;
  standupDates?: Set<string>;
}

function toDate(iso: string) {
  return iso ? new Date(iso + "T00:00:00") : new Date();
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function StandupDatePicker({ value, onChange, standupDates = new Set() }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => toDate(value));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = toDate(value);

  const standupModifier = [...standupDates]
    .filter((d) => d !== value)
    .map((d) => toDate(d));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5
                   border border-white/10 text-sm text-slate-200 focus:outline-none
                   focus:border-violet-500/60 hover:border-white/20 transition-colors"
      >
        <span>{formatDate(value) || "เลือกวันที่"}</span>
        <ChevronDown size={13} className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 z-50 rounded-xl border border-white/10
                       bg-[#0f1117] shadow-2xl p-3 standup-picker"
          >
            <DayPicker
              mode="single"
              selected={selected}
              month={month}
              onMonthChange={setMonth}
              onSelect={(d) => {
                if (!d) return;
                onChange(toISO(d));
                setOpen(false);
              }}
              modifiers={{ standup: standupModifier }}
              modifiersClassNames={{ standup: "rdp-standup" }}
              components={{
                PreviousMonthButton: ({ onClick }) => (
                  <button onClick={onClick} className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                ),
                NextMonthButton: ({ onClick }) => (
                  <button onClick={onClick} className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                ),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
