// app/api/accounts/resolve/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { getAccountByNumber } from "@/lib/services/account.service";

// GET /api/accounts/resolve?accountNumber=9xxxxxxxxx
export async function GET(req: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get("accountNumber");

    if (!accountNumber) return fail("Account number is required.");

    const account = await getAccountByNumber(accountNumber);

    // Only expose what the frontend needs - never the full account object
    return ok({
      accountNumber: account.accountNumber,
      accountHolder: account.user.fullName,
      type: account.type,
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message);
  }
}