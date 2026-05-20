"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error);
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm " +
    "text-slate-200 placeholder:text-slate-600 focus:outline-none " +
    "focus:border-violet-500/60 transition-colors";

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/[0.04] border border-white/10 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">
            <span className="text-slate-400">(HD)</span> Hell <span className="text-violet-400">Daily</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2 rounded-lg bg-violet-600/20 border border-violet-500/40
                       text-violet-300 text-sm font-semibold hover:bg-violet-600/30
                       transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </main>
  );
}
