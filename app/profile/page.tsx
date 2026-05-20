"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Save, KeyRound, ChevronDown } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFirst, setIsFirst] = useState(false);

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((u) => {
      setName(u.name ?? "");
      setNickname(u.nickname ?? "");
      setAvatar(u.avatar);
      setIsFirst(u.firstLogin ?? false);
      setLoading(false);
    });
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        setAvatar(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim() || !nickname.trim()) {
      setError("กรุณากรอกชื่อและชื่อเล่น");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nickname, avatar }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error);
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (newPw !== confirmPw) { setPwError("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    if (newPw.length < 6) { setPwError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setPwSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    if (res.ok) {
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setPwSuccess(false); setShowPwForm(false); }, 2000);
    } else {
      const d = await res.json();
      setPwError(d.error);
    }
    setPwSaving(false);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm " +
    "text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {isFirst && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 text-center">
            ยินดีต้อนรับ! กรุณาตั้งค่าโปรไฟล์ก่อนใช้งาน
          </div>
        )}

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-7 space-y-5">
          <h1 className="text-base font-semibold text-white text-center">โปรไฟล์</h1>

          {/* Avatar */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-white/10
                         hover:border-violet-500/50 transition-colors"
            >
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-slate-500 text-2xl font-bold">
                  {nickname?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-8 rounded-lg bg-white/5 animate-pulse" />
              <div className="h-8 rounded-lg bg-white/5 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">ชื่อจริง</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Panuphong" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">ชื่อเล่น</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="ไมโครเวฟ" className={inputClass} />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full py-2 rounded-lg bg-violet-600/20 border border-violet-500/40
                       text-violet-300 text-sm font-semibold hover:bg-violet-600/30
                       transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </motion.button>

          {!isFirst && (
            <button onClick={() => router.back()} className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ยกเลิก
            </button>
          )}
        </div>

        {/* Change password section */}
        {!isFirst && (
          <div className="mt-3 rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
            <button
              onClick={() => { setShowPwForm((v) => !v); setPwError(""); setPwSuccess(false); }}
              className="w-full flex items-center justify-between px-5 py-4 text-sm text-slate-400
                         hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <KeyRound size={14} className="text-slate-500" />
                เปลี่ยนรหัสผ่าน
              </span>
              <motion.div animate={{ rotate: showPwForm ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-slate-600" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showPwForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleChangePassword} className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">รหัสผ่านปัจจุบัน</label>
                      <input
                        type="password" value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        placeholder="••••••••" className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">รหัสผ่านใหม่</label>
                      <input
                        type="password" value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="อย่างน้อย 6 ตัวอักษร" className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                      <input
                        type="password" value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="••••••••" className={inputClass}
                      />
                    </div>
                    {pwError && <p className="text-xs text-red-400">{pwError}</p>}
                    {pwSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-emerald-400"
                      >
                        เปลี่ยนรหัสผ่านสำเร็จ ✓
                      </motion.p>
                    )}
                    <button
                      type="submit"
                      disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                      className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300
                                 text-sm font-semibold hover:bg-white/8 transition-colors disabled:opacity-40"
                    >
                      {pwSaving ? "กำลังบันทึก..." : "ยืนยันเปลี่ยนรหัสผ่าน"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </main>
  );
}
