import { Collection } from "mongodb";
import { getDb } from "./mongo";
import { User } from "./types";

async function col(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>("users");
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const c = await col();
  return c.findOne({ email: email.toLowerCase().trim() }) as Promise<User | null>;
}

export async function findUserById(id: string): Promise<User | null> {
  const c = await col();
  return c.findOne({ id }) as Promise<User | null>;
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
