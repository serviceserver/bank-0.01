// app/api/accounts/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { createAccount, getUserAccounts } from "@/lib/services/account.service";
import { AccountType } from "@prisma/client";

// GET /api/accounts - fetch all accounts for logged-in user
export async function GET() {
  try {
    const user = await requireSession();
    const accounts = await getUserAccounts(user.id);
    return ok(accounts);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message);
  }
}

// POST /api/accounts - create a new account
export async function POST(req: Request) {
  try {
    const user = await requireSession();
    const { type } = await req.json();

    if (!Object.values(AccountType).includes(type)) {
      return fail("Invalid account type.");
    }

    const account = await createAccount(user.id, type);
    return ok(account, 201);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message);
  }
}