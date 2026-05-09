import { db } from "~/server/db";

export async function getUserAccess(email?: string | null) {
  if (!email) return null;

  const normalizedEmail = email.toLowerCase();

  return db.adminWhitelist.findUnique({
    where: { email: normalizedEmail },
    select: { email: true, isActive: true, role: true },
  });
}

export async function getAdminAccess(email?: string | null) {
  const access = await getUserAccess(email);

  if (!access?.isActive) {
    return null;
  }

  if (access.role === "USER") {
    return null;
  }

  return access;
}
