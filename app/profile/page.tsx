"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Save } from "lucide-react";

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
      </motion.div>
    </main>
  );
}
