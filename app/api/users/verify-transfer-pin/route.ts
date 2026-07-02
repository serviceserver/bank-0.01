// app/api/users/verify-transfer-pin/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { verifyTransferPin } from "@/lib/services/pin.service";
import { z } from "zod";

const PinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

// POST - Verify transfer PIN
export async function POST(req: Request) {
  try {
    const user = await requireSession();
    const body = await req.json();

    const result = PinSchema.safeParse(body);
    if (!result.success) {
      return fail("Invalid PIN format");
    }

    const valid = await verifyTransferPin(user.id, result.data.pin);

    if (!valid) {
      return fail("Invalid PIN");
    }

    return ok({ valid: true });
  } catch {
    return fail("Unauthorized", 401);
  }
}