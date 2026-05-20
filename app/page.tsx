"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Settings, X, BarChart2, LogOut, Users, UserCircle, HelpCircle } from "lucide-react";
import Tour, { TourStep, shouldShowTour } from "@/components/Tour";
import { StandupEntry } from "@/lib/types";
import { todayISO } from "@/lib/format";
import { AppSettings, loadSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import TaskSection from "@/components/TaskSection";
import PreviewPanel from "@/components/PreviewPanel";
import HistoryPanel from "@/components/HistoryPanel";
import AutoTextarea from "@/components/AutoTextarea";
import StatsPanel from "@/components/StatsPanel";
import StandupDatePicker from "@/components/StandupDatePicker";
import { HistorySkeleton } from "@/components/Skeleton";
import { saveStandup, updateStandup, getStandups, deleteStandup } from "@/lib/standup";
import { useRouter } from "next/navigation";

interface ProfileInfo { nickname: string; name: string; role: string; avatar?: string }

const EMPTY: StandupEntry = {
  name: "",
  date: "",
  yesterday: [{ jira: "", desc: "" }],
  today: [{ jira: "", desc: "" }],
  blockers: "",
  help: "",
};

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [entry, setEntry] = useState<StandupEntry>({ ...EMPTY, date: todayISO() });
  const [history, setHistory] = useState<StandupEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dbOk, setDbOk] = useState(true);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);

    fetch("/api/profile").then((r) => r.json()).then((u) => {
      setProfile(u);
      setEntry((e) => ({ ...e, name: u.nickname ?? e.name }));
      if (shouldShowTour()) setTimeout(() => setShowTour(true), 800);
    });

    getStandups(0).then((rows) => {
      setHistory(rows);
      setHasMore(rows.length === 20);
      if (rows.length > 0) setEntry((e) => ({ ...rows[0], name: e.name }));
      setHistoryLoading(false);
    }).catch(() => { setDbOk(false); setHistoryLoading(false); });
  }, []);

  const set = <K extends keyof StandupEntry>(key: K, val: StandupEntry[K]) =>
    setEntry((e) => ({ ...e, [key]: val }));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleNew = () => {
    setEntry({ ...EMPTY, date: todayISO(), name: profile?.nickname || "" });
    setMode("form");
  };

  const handleLoad = (e: StandupEntry) => {
    setEntry({ ...e });
    setMode("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (entry.id) {
        await updateStandup(entry);
        setHistory((h) => h.map((e) => (e.id === entry.id ? { ...entry } : e)));
        showToast("อัปเดตแล้ว ✓");
      } else {
        const id = await saveStandup(entry);
        const saved = { ...entry, id, createdAt: Date.now() };
        setEntry(saved);
        setHistory((h) => [saved, ...h]);
        showToast("บันทึกแล้ว ✓");
      }
    } catch {
      showToast("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteStandup(id).catch(() => {});
    setHistory((h) => h.filter((e) => e.id !== id));
    if (entry.id === id) setMode("list");
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const rows = await getStandups(history.length);
      setHistory((h) => [...h, ...rows]);
      setHasMore(rows.length === 20);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  const textareaClass =
    "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm " +
    "text-slate-200 placeholder:text-slate-600 focus:outline-none " +
    "focus:border-violet-500/60 transition-colors";

  return (
    <main className="relative z-10 min-h-screen px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto mb-8 space-y-3"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            <span className="text-slate-400">(HD)</span> Hell <span className="text-violet-400">Daily</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">กรอก แล้ว copy เลย</p>
        </div>

        {/* Nav row */}
        <div className="flex items-center justify-end flex-wrap gap-2">
          <motion.button
            id="nav-team"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/team")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                       text-slate-500 border border-white/8 bg-white/[0.03]
                       hover:text-slate-300 hover:border-white/15 transition-all duration-200"
          >
            <Users size={12} /> Team
          </motion.button>
          {profile?.role === "admin" && (
            <>
              <motion.button
                id="nav-dashboard"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/admin")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                           text-slate-500 border border-white/8 bg-white/[0.03]
                           hover:text-slate-300 hover:border-white/15 transition-all duration-200"
              >
                <BarChart2 size={12} /> Dashboard
              </motion.button>
              <motion.button
                id="nav-users"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/admin/users")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                           text-slate-500 border border-white/8 bg-white/[0.03]
                           hover:text-slate-300 hover:border-white/15 transition-all duration-200"
              >
                <UserCircle size={12} /> Users
              </motion.button>
            </>
          )}
          <motion.button
            id="nav-profile"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/profile")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                       text-slate-500 border border-white/8 bg-white/[0.03]
                       hover:text-slate-300 hover:border-white/15 transition-all duration-200"
          >
            {profile?.avatar ? (
              <img src={profile.avatar} className="w-4 h-4 rounded-full object-cover" alt="avatar" />
            ) : (
              <UserCircle size={12} />
            )}
            {profile?.nickname ?? "Profile"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                       text-slate-500 border border-white/8 bg-white/[0.03]
                       hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-200"
          >
            <LogOut size={12} />
            ออก
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowTour(true)}
            className="text-slate-600 hover:text-slate-400 transition-colors p-1"
            title="แนะนำการใช้งาน"
          >
            <HelpCircle size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* DB warning */}
      {!dbOk && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto mb-4 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30
                     text-amber-400 text-xs text-center"
        >
          ไม่สามารถโหลดข้อมูลได้ — ฟีเจอร์ Save/History จะไม่ทำงาน
        </motion.div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-5"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">ประวัติ</span>
                  <div className="flex items-center gap-3">
                    <motion.button
                      id="btn-new"
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={handleNew}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md
                                 bg-violet-600/20 border border-violet-500/40 text-violet-300
                                 hover:bg-violet-600/30 transition-colors"
                    >
                      <Plus size={12} /> New
                    </motion.button>
                    <motion.button
                      id="btn-stats"
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setShowStats(true)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <BarChart2 size={14} />
                    </motion.button>
                    <motion.button
                      id="btn-settings"
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSettings(true)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <Settings size={14} />
                    </motion.button>
                  </div>
                </div>

                {historyLoading ? <HistorySkeleton /> : (
                  <HistoryPanel
                    history={history}
                    onLoad={handleLoad}
                    onDelete={handleDelete}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadMore={handleLoadMore}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setMode("list")}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <ArrowLeft size={13} /> ประวัติ
                  </motion.button>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600">{entry.id ? "แก้ไข" : "ใหม่"}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSettings(true)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <Settings size={14} />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">ชื่อ</label>
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="ไมโครเวฟ"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm
                                 text-slate-200 placeholder:text-slate-600 focus:outline-none
                                 focus:border-violet-500/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">วันที่</label>
                    <StandupDatePicker
                      value={entry.date}
                      onChange={(iso) => set("date", iso)}
                      standupDates={new Set(history.map((e) => e.date))}
                    />
                  </div>
                </div>

                <div className="border-t border-white/8" />

                <TaskSection label="✅ เมื่อวาน" tasks={entry.yesterday} jiraPrefix={settings.jiraPrefix} onChange={(v) => set("yesterday", v)} />
                <div className="border-t border-white/8" />
                <TaskSection label="🎯 วันนี้" tasks={entry.today} jiraPrefix={settings.jiraPrefix} onChange={(v) => set("today", v)} />
                <div className="border-t border-white/8" />

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">🚧 Blockers</label>
                    <AutoTextarea value={entry.blockers} onChange={(e) => set("blockers", e.target.value)} placeholder="ไม่มี" className={textareaClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">🙋 ขอความช่วยเหลือ / Review</label>
                    <AutoTextarea value={entry.help} onChange={(e) => set("help", e.target.value)} placeholder="ไม่มี" className={textareaClass} />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2 rounded-lg bg-violet-600/20 border border-violet-500/40
                             text-violet-300 text-sm font-semibold hover:bg-violet-600/30
                             transition-colors disabled:opacity-50"
                >
                  {saving ? "กำลังบันทึก..." : entry.id ? "อัปเดต" : "บันทึก"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-2xl bg-white/[0.04] border border-white/10 p-5"
        >
          <PreviewPanel entry={entry} jiraPrefix={settings.jiraPrefix} />
        </motion.div>
      </div>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStats && <StatsPanel history={history} onClose={() => setShowStats(false)} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl
                       bg-white/10 backdrop-blur-md border border-white/15 text-sm text-slate-200
                       shadow-xl z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour */}
      {showTour && (() => {
        const baseSteps: TourStep[] = [
          { target: "btn-new", title: "สร้าง Standup ใหม่", desc: "กดเพื่อเริ่มกรอก daily standup ของวันนี้ใส่ task เมื่อวาน วันนี้ และ blockers" },
          { target: "btn-stats", title: "สถิติส่วนตัว", desc: "ดู streak ความสม่ำเสมอ JIRA tickets ที่ทำไปทั้งหมด และ consistency เดือนนี้" },
          { target: "btn-settings", title: "ตั้งค่า JIRA Prefix", desc: "กำหนด prefix เช่น P100 แล้วระบบจะสร้าง JIRA-P100-XX ให้อัตโนมัติ" },
          { target: "nav-team", title: "Team Daily", desc: "ดู standup ของเพื่อนร่วมทีมทุกคน และเช็คว่าใครยังไม่ได้ส่งวันนี้" },
          { target: "nav-profile", title: "โปรไฟล์", desc: "แก้ไขชื่อเล่น รูปโปรไฟล์ ชื่อของคุณจะแสดงใน standup ทุกครั้งที่สร้างใหม่" },
        ];
        const adminSteps: TourStep[] = [
          { target: "nav-dashboard", title: "Admin Dashboard", desc: "ดูภาพรวมทีมวันนี้ ใครส่งแล้ว ใครยังไม่ส่ง attendance 7 วัน และ ranking" },
          { target: "nav-users", title: "จัดการผู้ใช้", desc: "เพิ่มผู้ใช้ใหม่ และรีเซ็ตรหัสผ่านได้ที่นี่ (admin ไม่สามารถรีเซ็ตกันเองได้)" },
        ];
        const steps = profile?.role === "admin" ? [...baseSteps, ...adminSteps] : baseSteps;
        return <Tour steps={steps} onDone={() => setShowTour(false)} />;
      })()}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                         w-80 bg-[#13151f] border border-white/10 rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-slate-200">ตั้งค่า</span>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">JIRA Prefix</label>
                  <div className="flex items-center rounded-lg bg-white/5 border border-white/10
                                  focus-within:border-violet-500/60 transition-colors overflow-hidden">
                    <span className="pl-3 pr-1 text-xs font-mono text-slate-500 select-none">JIRA-</span>
                    <input
                      type="text"
                      value={settings.jiraPrefix}
                      onChange={(e) => setSettings((s) => ({ ...s, jiraPrefix: e.target.value }))}
                      placeholder="P100"
                      className="flex-1 py-2 pr-3 bg-transparent text-sm font-mono text-slate-200
                                 placeholder:text-slate-600 focus:outline-none"
                    />
                    <span className="pr-3 text-xs font-mono text-slate-500 select-none">-XX</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => {
                  saveSettings(settings);
                  setShowSettings(false);
                  showToast("บันทึกการตั้งค่าแล้ว ✓");
                }}
                className="w-full mt-5 py-2 rounded-lg bg-violet-600/20 border border-violet-500/40
                           text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-colors"
              >
                บันทึก
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
