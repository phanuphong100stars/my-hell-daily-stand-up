import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Standup",
  description: "Generate daily standup reports fast",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
