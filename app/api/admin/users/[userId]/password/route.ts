// app/api/admin/users/[userId]/password/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { resetUserPassword } from "@/lib/services/admin.service";
import { resetPasswordSchema } from "@/lib/validators/admin.validators";

// POST /api/admin/users/:userId/password
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Validation failed.", 400);
    }

    await resetUserPassword(userId, admin.id, parsed.data.newPassword);
    return ok({ message: "Password reset successfully." });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}
