// app/(admin)/admin/accounts/[accountId]/transactions/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { getAccountTransactions } from "@/lib/services/admin.service";

// GET /api/admin/accounts/:accountId/transactions
export async function GET(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    await requireAdmin();
    const { accountId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const result = await getAccountTransactions(accountId, page, limit);
    return ok(result);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}