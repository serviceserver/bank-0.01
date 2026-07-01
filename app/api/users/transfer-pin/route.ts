// app/api/users/transfer-pin/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { setTransferPin, hasTransferPin } from "@/lib/services/pin.service";
import { z } from "zod";

const PinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

// GET - Check if user has PIN set
export async function GET() {
  try {
    const user = await requireSession();
    const userHasPin = await hasTransferPin(user.id);
    return ok({ hasPin: userHasPin });
  } catch {
    return fail("Unauthorized", 401);
  }
}

// POST - Set or update PIN
export async function POST(req: Request) {
  try {
    const user = await requireSession();
    const body = await req.json();

    const result = PinSchema.safeParse(body);
    if (!result.success) {
      return fail(result.error.errors[0]?.message ?? "Invalid PIN format");
    }

    await setTransferPin(user.id, result.data.pin);

    return ok({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message || "Failed to set PIN");
  }
}