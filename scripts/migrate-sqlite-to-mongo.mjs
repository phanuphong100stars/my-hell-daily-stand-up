import { MongoClient } from "mongodb";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load MONGODB_URI from .env.local
const envRaw = readFileSync(resolve(root, ".env.local"), "utf8");
const uriMatch = envRaw.match(/^MONGODB_URI=(.+)$/m);
if (!uriMatch) throw new Error("MONGODB_URI not found in .env.local");
const uri = uriMatch[1].trim();

const dbPath = resolve(root, "standup.db");
const json = execSync(`sqlite3 "${dbPath}" ".mode json" "SELECT * FROM standups;"`).toString();
const rows = JSON.parse(json);

const docs = rows.map((r) => ({
  id: r.id,
  name: r.name,
  date: r.date,
  yesterday: JSON.parse(r.yesterday),
  today: JSON.parse(r.today),
  blockers: r.blockers,
  help: r.help,
  createdAt: r.created_at,
}));

const client = new MongoClient(uri);
try {
  await client.connect();
  const col = client.db("standup").collection("standups");

  const existing = await col.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  Collection already has ${existing} docs. Skipping duplicates by id.`);
  }

  let inserted = 0;
  for (const doc of docs) {
    const exists = await col.findOne({ id: doc.id });
    if (!exists) {
      await col.insertOne(doc);
      inserted++;
    }
  }

  console.log(`✅ Migrated ${inserted}/${docs.length} docs (${docs.length - inserted} skipped as duplicate)`);
} finally {
  await client.close();
}
