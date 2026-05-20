import { getDb } from "./mongo";
import { User, PublicUser } from "./types";

type UserCol = import("mongodb").Collection<User>;

async function col(): Promise<UserCol> {
  const db = await getDb();
  return db.collection<User>("users");
}

function toPublic(u: User): PublicUser {
  return {
    id: u.id, email: u.email, name: u.name, nickname: u.nickname, avatar: u.avatar,
    role: u.role, firstLogin: u.firstLogin, jiraPrefix: u.jiraPrefix,
    requiresDaily: u.requiresDaily ?? true,
    createdAt: u.createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const c = await col();
  return c.findOne({ email: email.toLowerCase().trim() }) as Promise<User | null>;
}

export async function findUserById(id: string): Promise<User | null> {
  const c = await col();
  return c.findOne({ id }) as Promise<User | null>;
}

export async function listUsers(): Promise<PublicUser[]> {
  const c = await col();
  const users = await c.find({}).sort({ createdAt: 1 }).toArray();
  return users.map(toPublic);
}

export async function createUser(user: Omit<User, "createdAt">): Promise<void> {
  const c = await col();
  await c.insertOne({ ...user, email: user.email.toLowerCase().trim(), createdAt: Date.now() } as User);
}

export async function upsertUserByEmail(user: Omit<User, "createdAt">): Promise<void> {
  const c = await col();
  await c.updateOne(
    { email: user.email.toLowerCase().trim() },
    { $setOnInsert: { ...user, email: user.email.toLowerCase().trim(), createdAt: Date.now() } },
    { upsert: true }
  );
}

export async function updateUser(id: string, patch: Partial<Pick<User, "name" | "nickname" | "avatar" | "firstLogin" | "jiraPrefix" | "requiresDaily">>): Promise<PublicUser | null> {
  const c = await col();
  await c.updateOne({ id }, { $set: patch });
  const updated = await c.findOne({ id });
  return updated ? toPublic(updated as User) : null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  const c = await col();
  await c.updateOne({ id }, { $set: { passwordHash } });
}

export async function deleteUser(id: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ id });
}
