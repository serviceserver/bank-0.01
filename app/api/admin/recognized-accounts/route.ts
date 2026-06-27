// app/api/admin/recognized-accounts/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import {
  getRecognizedAccounts,
  addRecognizedAccount,
  addExternalRecognizedAccount,
} from "@/lib/services/admin.service";

// GET /api/admin/recognized-accounts
export async function GET() {
  try {
    await requireAdmin();
    const accounts = await getRecognizedAccounts();
    return ok(accounts);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}

// POST /api/admin/recognized-accounts
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const { accountId, accountNumber, accountHolder, bankName } = await req.json();

    // Support both internal accounts and external accounts
    if (accountId) {
      const account = await addRecognizedAccount(accountId, admin.id);
      return ok(account, 201);
    }

    if (accountNumber && accountHolder) {
      const account = await addExternalRecognizedAccount(
        accountNumber,
        accountHolder,
        bankName,
        admin.id
      );
      return ok(account, 201);
    }

    return fail("Either accountId or both accountNumber and accountHolder are required.");
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}