import { MongoClient, Db } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.MONGODB_URI!;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  attachDatabasePool(client);
  global._mongoClientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await global._mongoClientPromise!;
  return client.db("standup");
}
