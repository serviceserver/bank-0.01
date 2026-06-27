// app/api/accounts/search-recognized/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { searchRecognizedAccounts } from "@/lib/services/admin.service";

// GET /api/accounts/search-recognized?q=partial
export async function GET(req: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const accounts = await searchRecognizedAccounts(query);
    return ok(accounts);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message);
  }
}