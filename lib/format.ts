import { StandupEntry, TaskItem } from "./types";

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function relativeDay(iso: string): "today" | "yesterday" | "tomorrow" | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  const diff = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff === -1) return "tomorrow";
  return null;
}

export function buildJiraId(suffix: string, prefix: string): string {
  const v = suffix.trim();
  if (!v) return "";
  // full id already typed by user (starts with JIRA-)
  if (v.toUpperCase().startsWith("JIRA-")) return v;
  // has dash but no JIRA- prefix → user typed e.g. "P100-42"
  if (v.includes("-")) return `JIRA-${v}`;
  // legacy: just a number, combine with default prefix
  if (prefix.trim()) return `JIRA-${prefix.trim()}-${v}`;
  return v;
}

function formatTasks(tasks: TaskItem[], jiraPrefix: string): string {
  const lines = tasks
    .filter((t) => t.jira.trim() || t.desc.trim())
    .map((t) => {
      const jira = buildJiraId(t.jira, jiraPrefix);
      const desc = t.desc.trim();
      if (jira && desc) return `* ${jira} : ${desc}`;
      if (jira) return `* ${jira}`;
      if (desc) return `* ${desc}`;
      return null;
    })
    .filter(Boolean);
  return lines.length ? lines.join("\n") : "* ไม่มี";
}

export function buildText(entry: StandupEntry, jiraPrefix = ""): string {
  const name = entry.name.trim() || "ชื่อ";
  const dateStr = formatDate(entry.date) || "วันที่";

  const blockers = entry.blockers.trim()
    ? entry.blockers.trim().split("\n").map((l) => `* ${l}`).join("\n")
    : "* ไม่มี";

  const help = entry.help.trim()
    ? entry.help.trim().split("\n").map((l) => `* ${l}`).join("\n")
    : "* ไม่มี";

  return [
    `📅 Standup — [${name}] [${dateStr}]`,
    `✅ เมื่อวาน`,
    formatTasks(entry.yesterday, jiraPrefix),
    `🎯 วันนี้`,
    formatTasks(entry.today, jiraPrefix),
    `🚧 Blockers`,
    blockers,
    `🙋 ขอความช่วยเหลือ / Review`,
    help,
  ].join("\n");
}
