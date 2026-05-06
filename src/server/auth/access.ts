import { db } from "~/server/db";

export async function getAdminAccess(email?: string | null) {
  if (!email) return null;

  const normalizedEmail = email.toLowerCase();

  return db.adminWhitelist.findUnique({
    where: { email: normalizedEmail },
    select: { email: true, isActive: true, role: true },
  });
}
