// app/api/admin/accounts/[accountId]/credit/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { manualCredit } from "@/lib/services/admin.service";

// POST /api/admin/accounts/:accountId/credit
export async function POST(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const admin = await requireAdmin();
    const { amount, description, externalAccountNumber, externalAccountHolder, externalBankName } = await req.json();

    if (!amount || isNaN(amount)) return fail("Valid amount is required.");

    const transaction = await manualCredit(
      accountId,
      Number(amount),
      admin.id,
      description,
      externalAccountNumber,
      externalAccountHolder,
      externalBankName
    );
    return ok(transaction, 201);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}