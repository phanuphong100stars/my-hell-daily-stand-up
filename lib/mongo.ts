import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Dev: reuse across hot-reloads. Prod: module-level cache per container.
if (!global._mongoClientPromise) {
  global._mongoClientPromise = new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await global._mongoClientPromise!;
  return client.db("standup");
}
