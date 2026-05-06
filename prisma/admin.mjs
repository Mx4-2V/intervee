import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();

const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3] === "ADMIN" || process.argv[3] === "VIEWER" ? process.argv[3] : "OWNER";

if (!email) {
  console.error("Usage: npm run db:admin -- admin@example.com [OWNER|ADMIN|VIEWER]");
  process.exit(1);
}

await db.adminWhitelist.upsert({
  create: { email, role },
  update: { isActive: true, role },
  where: { email },
});

await db.$disconnect();
console.log(`Admin whitelist updated for ${email} (${role}).`);
