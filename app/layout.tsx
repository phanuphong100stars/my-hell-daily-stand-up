import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "(HD) Hell Daily",
  description: "Generate daily standup reports fast",
};

const REQUIRED_ENV: Record<string, string> = {
  MONGODB_URI: "MongoDB connection string",
  SESSION_SECRET: "JWT signing secret (min 32 chars)",
};

function EnvBanner() {
  const missing = Object.entries(REQUIRED_ENV)
    .filter(([key]) => !process.env[key])
    .map(([key, desc]) => ({ key, desc }));

  const weak = process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32
    ? [{ key: "SESSION_SECRET", desc: "too short — must be at least 32 characters" }]
    : [];

  const issues = [...missing, ...weak];
  if (issues.length === 0) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "#7c2d12", borderBottom: "1px solid #b45309",
      padding: "10px 16px", fontFamily: "monospace", fontSize: "13px", color: "#fde68a",
    }}>
      <strong>⚠ Missing / invalid environment variables:</strong>
      <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
        {issues.map(({ key, desc }) => (
          <li key={key}><code>{key}</code> — {desc}</li>
        ))}
      </ul>
      <div style={{ marginTop: "4px", fontSize: "11px", color: "#fcd34d" }}>
        Set these in Vercel Dashboard → Settings → Environment Variables, then redeploy.
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased">
        <EnvBanner />
        {children}
      </body>
    </html>
  );
}
