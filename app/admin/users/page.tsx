"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, UserCircle, KeyRound, AlertTriangle, Trash2 } from "lucide-react";
import { PublicUser } from "@/lib/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", nickname: "", role: "user", requiresDaily: true });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset password state
  const [resetTarget, setResetTarget] = useState<PublicUser | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSaving, setResetSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<PublicUser | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 403) { router.push("/"); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setUsers(d); setLoading(false); } });
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await fetch("/api/admin/users").then((r) => r.json());
      setUsers(updated);
      setShowForm(false);
      setForm({ email: "", password: "", name: "", nickname: "", role: "user", requiresDaily: true });
    } else {
      const d = await res.json();
      setError(d.error);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    setDeleteError("");
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      const d = await res.json();
      setDeleteError(d.error);
    }
    setDeleteSaving(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetSaving(true);
    setResetError("");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resetTarget.id, newPassword: resetPw }),
    });
    if (res.ok) {
      setResetTarget(null);
      setResetPw("");
    } else {
      const d = await res.json();
      setResetError(d.error);
    }
    setResetSaving(false);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm " +
    "text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors";

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={13} /> กลับ
          </button>
          <h1 className="text-sm font-semibold text-white">จัดการผู้ใช้</h1>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg
                       bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 transition-colors"
          >
            <Plus size={12} /> เพิ่มผู้ใช้
          </motion.button>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
            ))
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">ยังไม่มีผู้ใช้งาน</div>
          ) : users.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8"
            >
              {u.avatar ? (
                <img src={u.avatar} alt={u.nickname} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 text-sm font-bold flex-shrink-0">
                  {u.nickname[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">
                  {u.nickname} <span className="text-slate-500 font-normal">({u.name})</span>
                </p>
                <p className="text-xs text-slate-600 truncate">{u.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role === "admin" ? "border-violet-500/40 text-violet-400 bg-violet-500/10" : "border-white/10 text-slate-500"}`}>
                {u.role}
              </span>
              {!u.requiresDaily && (
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-600">ไม่บังคับ</span>
              )}
              {u.firstLogin && (
                <span className="text-xs text-amber-500/80">ยังไม่ได้ login</span>
              )}
              {u.role !== "admin" && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setResetTarget(u); setResetPw(""); setResetError(""); }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    title="รีเซ็ตรหัสผ่าน"
                  >
                    <KeyRound size={13} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setDeleteTarget(u); setDeleteError(""); }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="ลบผู้ใช้"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Create user modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                           w-full max-w-sm bg-[#13151f] border border-white/10 rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-semibold text-white flex items-center gap-2"><UserCircle size={15} /> เพิ่มผู้ใช้ใหม่</span>
                  <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={15} /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">ชื่อจริง</label>
                      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Panuphong" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">ชื่อเล่น</label>
                      <input value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="ไมโครเวฟ" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@example.com" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">รหัสผ่านเริ่มต้น</label>
                    <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="อย่างน้อย 6 ตัว" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Role</label>
                    <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      className={inputClass + " cursor-pointer"}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                    <div>
                      <p className="text-xs text-slate-300">จำเป็นต้องส่ง daily</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">นับใน missing ถ้าไม่ส่ง</p>
                    </div>
                    <div
                      onClick={() => setForm((f) => ({ ...f, requiresDaily: !f.requiresDaily }))}
                      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0
                        ${form.requiresDaily ? "bg-violet-500" : "bg-white/10"}`}
                    >
                      <motion.div
                        animate={{ x: form.requiresDaily ? 16 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                      />
                    </div>
                  </label>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button type="submit" disabled={saving}
                    className="w-full py-2 rounded-lg bg-violet-600/20 border border-violet-500/40
                               text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-colors disabled:opacity-50">
                    {saving ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete user confirm modal */}
        <AnimatePresence>
          {deleteTarget && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDeleteTarget(null)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                           w-full max-w-sm bg-[#13151f] border border-white/10 rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <Trash2 size={14} className="text-red-400" /> ลบผู้ใช้
                  </span>
                  <button onClick={() => setDeleteTarget(null)} className="text-slate-500 hover:text-slate-300"><X size={15} /></button>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/8 border border-red-500/20 mb-5">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300/80">
                    ลบ <span className="font-semibold">{deleteTarget.nickname}</span> ({deleteTarget.email}) ถาวร ไม่สามารถกู้คืนได้
                  </p>
                </div>
                {deleteError && <p className="text-xs text-red-400 mb-3">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={handleDelete}
                    disabled={deleteSaving}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/40
                               text-red-300 text-sm font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {deleteSaving ? "กำลังลบ..." : "ยืนยันลบ"}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Reset password confirm modal */}
        <AnimatePresence>
          {resetTarget && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setResetTarget(null)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                           w-full max-w-sm bg-[#13151f] border border-white/10 rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-400" /> รีเซ็ตรหัสผ่าน
                  </span>
                  <button onClick={() => setResetTarget(null)} className="text-slate-500 hover:text-slate-300"><X size={15} /></button>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 mb-4">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-300/80">
                    รีเซ็ตรหัสผ่านสำหรับ <span className="font-semibold">{resetTarget.nickname}</span> ({resetTarget.email})
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">รหัสผ่านใหม่</label>
                    <input
                      type="password"
                      value={resetPw}
                      onChange={(e) => setResetPw(e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      autoFocus
                      className={inputClass}
                    />
                  </div>
                  {resetError && <p className="text-xs text-red-400">{resetError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setResetTarget(null)}
                      className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={resetSaving || resetPw.length < 6}
                      className="flex-1 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40
                                 text-amber-300 text-sm font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                    >
                      {resetSaving ? "กำลังรีเซ็ต..." : "ยืนยันรีเซ็ต"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
