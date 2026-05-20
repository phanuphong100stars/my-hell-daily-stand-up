export interface AppSettings {
  jiraPrefix: string;       // default/first prefix (synced to server)
  jiraPrefixes: string[];   // full list (local only)
}

const KEY = "standup_settings";

export const DEFAULT_SETTINGS: AppSettings = {
  jiraPrefix: "",
  jiraPrefixes: [],
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    // migrate: old single-prefix data
    if (!parsed.jiraPrefixes || parsed.jiraPrefixes.length === 0) {
      parsed.jiraPrefixes = parsed.jiraPrefix ? [parsed.jiraPrefix] : [];
    }
    if (!parsed.jiraPrefix && parsed.jiraPrefixes.length > 0) {
      parsed.jiraPrefix = parsed.jiraPrefixes[0];
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
