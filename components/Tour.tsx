"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export interface TourStep {
  target: string;
  title: string;
  desc: string;
}

const TOUR_KEY = "hd_tour_v1";
const PAD = 8;

export function shouldShowTour(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(TOUR_KEY);
}
export function markTourDone(): void { localStorage.setItem(TOUR_KEY, "1"); }
export function resetTour(): void { localStorage.removeItem(TOUR_KEY); }

interface Rect { top: number; left: number; width: number; height: number }
interface WinSize { w: number; h: number }

function getWin(): WinSize {
  return typeof window !== "undefined"
    ? { w: window.innerWidth, h: window.innerHeight }
    : { w: 1200, h: 800 };
}

export default function Tour({ steps, onDone }: { steps: TourStep[]; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [win, setWin] = useState<WinSize>(getWin);

  const current = steps[step];
  const isMobile = win.w < 640;

  useEffect(() => {
    const update = () => {
      setWin(getWin());
      const el = document.getElementById(current.target);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step, current.target]);

  const done = () => { markTourDone(); onDone(); };
  const next = () => step < steps.length - 1 ? setStep((s) => s + 1) : done();
  const prev = () => setStep((s) => Math.max(0, s - 1));

  // Desktop tooltip positioning (relative to spotlight)
  const tipW = Math.min(284, win.w - 24);
  const tipTop = rect
    ? rect.top + PAD * 2 + rect.height + 14 > win.h - 180
      ? rect.top - PAD - 160
      : rect.top + PAD * 2 + rect.height + 14
    : win.h / 2 - 80;
  const tipLeft = rect
    ? Math.max(12, Math.min(rect.left + rect.width / 2 - tipW / 2, win.w - tipW - 12))
    : (win.w - tipW) / 2;

  const tooltip = (
    <motion.div
      key={`tooltip-${step}`}
      initial={{ opacity: 0, y: isMobile ? 16 : 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isMobile ? 16 : 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
      style={isMobile
        ? { position: "fixed", bottom: 24, left: 12, right: 12, zIndex: 10 }
        : { position: "fixed", top: tipTop, left: tipLeft, width: tipW, zIndex: 10 }
      }
      className="bg-[#13151f] border border-white/15 rounded-2xl p-4 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 16 : 6, opacity: i === step ? 1 : 0.3 }}
              transition={{ duration: 0.2 }}
              className="h-1.5 rounded-full bg-violet-400"
            />
          ))}
        </div>
        <button onClick={done} className="text-slate-600 hover:text-slate-400 transition-colors p-1">
          <X size={13} />
        </button>
      </div>

      <p className="text-sm font-semibold text-white mb-1.5">{current.title}</p>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{current.desc}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 disabled:opacity-0 transition-colors"
        >
          <ChevronLeft size={12} /> ก่อนหน้า
        </button>
        <span className="text-[10px] text-slate-700">{step + 1}/{steps.length}</span>
        <button
          onClick={next}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     bg-violet-600/30 border border-violet-500/50 text-violet-300
                     hover:bg-violet-600/45 transition-all"
        >
          {step === steps.length - 1 ? "เสร็จสิ้น" : "ถัดไป"}
          {step < steps.length - 1 && <ChevronRight size={12} />}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.01)" }}
        onClick={done}
      />

      {/* Spotlight */}
      {rect && (
        <motion.div
          key={current.target}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 10,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
            border: "1.5px solid rgba(139,92,246,0.65)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {tooltip}
    </div>
  );
}
