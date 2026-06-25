// lib/utils/getSession.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireSession();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}