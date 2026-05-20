import { NextResponse } from "next/server";

export async function GET() {
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  return NextResponse.json({
    hashLength: hash.length,
    hashPrefix: hash.slice(0, 7),
    sessionSecretLength: (process.env.SESSION_SECRET ?? "").length,
  });
}
