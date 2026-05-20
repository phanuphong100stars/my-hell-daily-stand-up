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
