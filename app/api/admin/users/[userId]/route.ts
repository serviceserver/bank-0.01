// app/api/admin/users/[userId]/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { getUserById, verifyUser } from "@/lib/services/admin.service";

// GET /api/admin/users/:userId
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const user = await getUserById(userId);
    return ok(user);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}

// PATCH /api/admin/users/:userId/verify
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;
    const user = await verifyUser(userId, admin.id);
    return ok(user);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}