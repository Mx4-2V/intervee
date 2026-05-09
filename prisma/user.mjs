import { randomBytes, scryptSync } from "node:crypto";

import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();
const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
const role =
  process.argv[4] === "OWNER" || process.argv[4] === "ADMIN"
    ? process.argv[4]
    : "USER";

function hashPassword(value) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(value, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

if (!email || !password) {
  console.error(
    "Usage: npm run db:user -- user@example.com \"password\" [USER|ADMIN|OWNER]",
  );
  process.exit(1);
}

await db.adminWhitelist.upsert({
  create: { email, role },
  update: { isActive: true, role },
  where: { email },
});

await db.user.upsert({
  create: {
    email,
    emailVerified: new Date(),
    passwordHash: hashPassword(password),
  },
  update: {
    emailVerified: new Date(),
    passwordHash: hashPassword(password),
  },
  where: { email },
});

await db.$disconnect();
console.log(`Whitelist and credentials updated for ${email} (${role}).`);
