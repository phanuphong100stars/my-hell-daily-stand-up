import { Collection } from "mongodb";
import { getDb } from "./mongo";
import { StandupEntry } from "./types";

async function col(): Promise<Collection> {
  const db = await getDb();
  return db.collection("standups");
}

export async function dbInsert(entry: StandupEntry): Promise<string> {
  const c = await col();
  const id = crypto.randomUUID();
  await c.insertOne({
    id,
    userId: entry.userId,
    name: entry.name,
    date: entry.date,
    yesterday: entry.yesterday,
    today: entry.today,
    blockers: entry.blockers,
    help: entry.help,
    createdAt: Date.now(),
  });
  return id;
}

export async function dbList(limit = 20, offset = 0, userId?: string): Promise<StandupEntry[]> {
  const c = await col();
  const query = userId ? { userId } : {};
  const docs = await c
    .find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
  return docs.map((d) => ({
    id: d.id as string,
    name: d.name as string,
    date: d.date as string,
    yesterday: d.yesterday,
    today: d.today,
    blockers: d.blockers as string,
    help: d.help as string,
    createdAt: d.createdAt as number,
  }));
}

export async function dbUpdate(entry: StandupEntry): Promise<void> {
  const c = await col();
  await c.updateOne(
    { id: entry.id },
    {
      $set: {
        name: entry.name,
        date: entry.date,
        yesterday: entry.yesterday,
        today: entry.today,
        blockers: entry.blockers,
        help: entry.help,
      },
    }
  );
}

export async function dbDelete(id: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ id });
}
