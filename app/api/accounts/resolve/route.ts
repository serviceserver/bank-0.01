// app/api/accounts/resolve/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { getAccountByNumber } from "@/lib/services/account.service";
import prisma from "@/lib/db/prisma";

// GET /api/accounts/resolve?accountNumber=9xxxxxxxxx
export async function GET(req: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get("accountNumber");

    if (!accountNumber) return fail("Account number is required.");

    // First check if this is an external recognized account
    const externalRecognized = await prisma.recognizedAccount.findFirst({
      where: { externalAccountNumber: accountNumber },
      select: {
        externalAccountNumber: true,
        externalAccountHolder: true,
        externalBankName: true,
      },
    });

    if (externalRecognized) {
      return ok({
        accountId: null,
        accountNumber: externalRecognized.externalAccountNumber,
        accountHolder: externalRecognized.externalAccountHolder,
        type: "EXTERNAL",
        routingNumber: null,
        isRecognized: true,
        recognizedBy: null,
        isExternal: true,
        bankName: externalRecognized.externalBankName,
      });
    }

    // Otherwise try to resolve as internal account
    try {
      const account = await getAccountByNumber(accountNumber);

      const recognized = await prisma.recognizedAccount.findUnique({
        where: { accountId: account.id },
        include: {
          admin: { select: { fullName: true } },
        },
      });

      return ok({
        accountId: account.id,
        accountNumber: account.accountNumber,
        accountHolder: account.user.fullName,
        type: account.type,
        routingNumber: account.routingNumber,
        isRecognized: !!recognized,
        recognizedBy: recognized?.admin.fullName ?? null,
        isExternal: false,
      });
    } catch {
      return fail("Account number not found");
    }
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message);
  }
}