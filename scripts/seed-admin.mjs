import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv(file) {
  try {
    return Object.fromEntries(
      readFileSync(file, "utf8")
        .split("\n")
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
        })
    );
  } catch {
    return {};
  }
}

const env = { ...loadEnv(resolve(root, ".env")), ...loadEnv(resolve(root, ".env.local")) };

const uri = env.MONGODB_URI;
const passwordHash = env.ADMIN_PASSWORD_HASH?.trim();
const email = env.ADMIN_EMAIL;
const name = env.ADMIN_NAME ?? "Admin";
const nickname = env.ADMIN_NICKNAME ?? "Admin";

if (!uri) throw new Error("MONGODB_URI not set");
if (!passwordHash) throw new Error("ADMIN_PASSWORD_HASH not set");
if (!email) throw new Error("ADMIN_EMAIL not set in .env.local");

const client = new MongoClient(uri);
try {
  await client.connect();
  const col = client.db("standup").collection("users");

  const existing = await col.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`⚠️  Admin ${email} already exists — skipped`);
  } else {
    await col.insertOne({
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      passwordHash,
      name,
      nickname,
      role: "admin",
      firstLogin: false,
      createdAt: Date.now(),
    });
    console.log(`✅ Admin created: ${email} (${name} / ${nickname})`);
  }
} finally {
  await client.close();
}
