// app/api/users/transfer-pin/route.ts

import { requireSession } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { hasTransferPin } from "@/lib/services/pin.service";
import { sendTransferPinOtp } from "@/lib/services/otp.service";

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

// POST - Request OTP to update transfer PIN
export async function POST() {
  try {
    const user = await requireSession();
    if (!user.email) {
      return fail("Unauthorized", 401);
    }
    await sendTransferPinOtp(user.id, user.email);
    return ok({ success: true, message: "Verification code sent to your email." });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    return fail(e.message || "Failed to send verification code.");
  }
}
