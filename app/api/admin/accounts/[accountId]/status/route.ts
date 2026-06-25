// app/api/admin/accounts/[accountId]/status/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { setAccountStatus } from "@/lib/services/account.service";
import { AccountStatus } from "@prisma/client";

// PATCH /api/admin/accounts/:accountId/status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const admin = await requireAdmin();
    const { status } = await req.json();

    if (!Object.values(AccountStatus).includes(status)) {
      return fail("Invalid account status.");
    }

    const account = await setAccountStatus(
      accountId,
      status,
      admin.id
    );
    return ok(account);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}