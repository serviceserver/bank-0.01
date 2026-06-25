// app/api/accounts/[accountId]/transactions/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { getTransactionHistory } from "@/lib/services/transaction.service";
import { TransactionType, TransactionStatus } from "@prisma/client";

// GET /api/accounts/:accountId/transactions
export async function GET(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const user = await requireSession();
    const { searchParams } = new URL(req.url);

    const filters = {
      type: searchParams.get("type") as TransactionType | undefined,
      status: searchParams.get("status") as TransactionStatus | undefined,
      from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
      to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    };

    const result = await getTransactionHistory(accountId, user.id, filters);
    return ok(result);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "Unauthorized.") return fail("Unauthorized", 403);
    return fail(e.message);
  }
}