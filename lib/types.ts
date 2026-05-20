export interface TaskItem {
  jira: string;
  desc: string;
}

export interface StandupEntry {
  id?: string;
  name: string;
  date: string;
  yesterday: TaskItem[];
  today: TaskItem[];
  blockers: string;
  help: string;
  createdAt?: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  nickname: string;
  avatar?: string;
  role: "admin" | "user";
  createdAt: number;
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  nickname: string;
  role: "admin" | "user";
}
