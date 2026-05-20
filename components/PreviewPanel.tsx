"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { buildText } from "@/lib/format";
import { StandupEntry } from "@/lib/types";

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

function StyledLine({ line }: { line: string }) {
  for (const [emoji, cls] of Object.entries(LINE_STYLES)) {
    if (line.startsWith(emoji)) return <span className={cls}>{line}</span>;
  }
  if (line === "* ไม่มี") return <span className="text-slate-600 italic">{line}</span>;
  if (line.startsWith("*")) return <span className="text-slate-300">{line}</span>;
  return <span>{line}</span>;
}

export default function PreviewPanel({ entry, jiraPrefix }: Props) {
  const [copied, setCopied] = useState(false);
  const text = buildText(entry, jiraPrefix);
  const lines = text.split("\n");

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Preview</span>
        <div className="flex gap-2">
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
        </div>
      </div>

      <motion.div
        className="flex-1 rounded-xl bg-white/[0.03] border border-white/8 p-4 font-mono text-sm
                   leading-[1.9] overflow-y-auto min-h-[320px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {lines.map((line, i) => (
          <div key={i}>
            <StyledLine line={line} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
