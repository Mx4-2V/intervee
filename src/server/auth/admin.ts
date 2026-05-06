import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";

import { getAdminAccess } from "~/server/auth/access";
import { auth } from "~/server/auth";

const ADMIN_SIGN_IN_URL = "/api/auth/signin?callbackUrl=/admin";

export async function requireAdminPage() {
  const session = await auth();
  const admin = await getAdminAccess(session?.user.email);

  if (!session?.user || !admin?.isActive) {
    redirect(ADMIN_SIGN_IN_URL);
  }

  return { admin, session };
}

export async function requireAdminApi() {
  const session = await auth();
  const admin = await getAdminAccess(session?.user.email);

  if (!session?.user || !admin?.isActive) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function assertAdminTRPC(session: Session | null) {
  const admin = await getAdminAccess(session?.user.email);

  if (!session?.user || !admin?.isActive) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return admin;
}
