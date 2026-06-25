// app/api/admin/accounts/[accountId]/debit/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { manualDebit } from "@/lib/services/admin.service";

// POST /api/admin/accounts/:accountId/debit
export async function POST(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const admin = await requireAdmin();
    const { amount, description } = await req.json();

    if (!amount || isNaN(amount)) return fail("Valid amount is required.");

    const transaction = await manualDebit(
      accountId,
      Number(amount),
      admin.id,
      description
    );
    return ok(transaction, 201);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}