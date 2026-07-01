// app/api/admin/users/[userId]/transfer-pin/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { resetUserTransferPin } from "@/lib/services/admin.service";
import { z } from "zod";

const schema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;
    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid PIN format.", 400);
    }

    const user = await resetUserTransferPin(userId, admin.id, parsed.data.pin);
    return ok({ success: true, email: user.email });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message || "Failed to reset transfer PIN.", 400);
  }
}
