export interface AppSettings {
  jiraPrefix: string;
  defaultName: string;
}

const KEY = "standup_settings";

export const DEFAULT_SETTINGS: AppSettings = {
  jiraPrefix: "P100",
  defaultName: "",
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
