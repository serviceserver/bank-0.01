// app/api/users/transfer-pin/confirm/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { setTransferPin } from "@/lib/services/pin.service";
import { verifyTransferPinOtp } from "@/lib/services/otp.service";
import { z } from "zod";

const ConfirmSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
  otp: z.string().length(6, "Verification code must be 6 digits."),
});

export async function POST(req: Request) {
  try {
    const user = await requireSession();
    const body = await req.json();

    const parsed = ConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid input.", 400);
    }

    const { pin, otp } = parsed.data;

    const otpValid = verifyTransferPinOtp(user.id, otp);
    if (!otpValid) {
      return fail("Invalid or expired verification code.", 400);
    }

    await setTransferPin(user.id, pin);

    return ok({ success: true, message: "Transfer PIN updated successfully." });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message || "Failed to update PIN.");
  }
}
