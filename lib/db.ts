import { MongoClient, Collection } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";
import { StandupEntry } from "./types";

const uri = process.env.MONGODB_URI!;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  attachDatabasePool(client);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

async function getCollection(): Promise<Collection> {
  const client = await clientPromise;
  return client.db("standup").collection("standups");
}

export async function dbInsert(entry: StandupEntry): Promise<string> {
  const col = await getCollection();
  const id = crypto.randomUUID();
  await col.insertOne({
    id,
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

export async function dbList(limit = 20, offset = 0): Promise<StandupEntry[]> {
  const col = await getCollection();
  const docs = await col
    .find({})
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
  const col = await getCollection();
  await col.updateOne(
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
  const col = await getCollection();
  await col.deleteOne({ id });
}
