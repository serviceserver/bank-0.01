// app/api/accounts/[accountId]/transfer/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { transfer } from "@/lib/services/transaction.service";

// POST /api/accounts/:accountId/transfer
export async function POST(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const user = await requireSession();
    const { toAccountNumber, amount, description } = await req.json();

    if (!toAccountNumber) return fail("Recipient account number is required.");
    if (!amount || isNaN(amount)) return fail("Valid amount is required.");

    const transaction = await transfer(
      accountId,
      user.id,
      toAccountNumber,
      Number(amount),
      description
    );
    return ok(transaction, 201);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message);
  }
}