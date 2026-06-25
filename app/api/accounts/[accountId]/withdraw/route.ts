// app/api/accounts/[accountId]/withdraw/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { withdraw } from "@/lib/services/transaction.service";

// POST /api/accounts/:accountId/withdraw
export async function POST(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const user = await requireSession();
    const { amount, description } = await req.json();

    if (!amount || isNaN(amount)) return fail("Valid amount is required.");

    const transaction = await withdraw(
      accountId,
      user.id,
      Number(amount),
      description
    );
    return ok(transaction, 201);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message);
  }
}