// app/api/admin/users/[userId]/info/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { updateUserInfo } from "@/lib/services/admin.service";
import { updateUserInfoSchema } from "@/lib/validators/admin.validators";

// PATCH /api/admin/users/:userId/info
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = updateUserInfoSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Validation failed.", 400);
    }

    const user = await updateUserInfo(userId, admin.id, parsed.data);
    return ok(user);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}
