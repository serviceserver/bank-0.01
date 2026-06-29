// app/api/admin/users/[userId]/block/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { blockUserLogin, unblockUserLogin } from "@/lib/services/admin.service";

// POST /api/admin/users/:userId/block
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const admin = await requireAdmin();
    const { action } = await req.json();

    if (action === "block") {
      const user = await blockUserLogin(userId, admin.id);
      return ok({ isLoginBlocked: user.isLoginBlocked });
    } else if (action === "unblock") {
      const user = await unblockUserLogin(userId, admin.id);
      return ok({ isLoginBlocked: user.isLoginBlocked });
    }

    return fail("Invalid action. Use 'block' or 'unblock'.");
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}