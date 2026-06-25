// app/api/admin/transactions/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { getAllTransactions } from "@/lib/services/admin.service";
import { TransactionType, TransactionStatus } from "@prisma/client";

// GET /api/admin/transactions
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const filters = {
      type: searchParams.get("type") as TransactionType | undefined,
      status: searchParams.get("status") as TransactionStatus | undefined,
      from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
      to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
    };

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const result = await getAllTransactions(page, limit, filters);
    return ok(result);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}