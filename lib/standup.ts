import { StandupEntry } from "./types";

export async function saveStandup(entry: StandupEntry): Promise<string> {
  const res = await fetch("/api/standup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("save failed");
  const { id } = await res.json();
  return id;
}

export async function getStandups(offset = 0, limit = 20): Promise<StandupEntry[]> {
  const res = await fetch(`/api/standup?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function updateStandup(entry: StandupEntry): Promise<void> {
  const res = await fetch("/api/standup", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("update failed");
}

export async function deleteStandup(id: string): Promise<void> {
  await fetch(`/api/standup?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}
