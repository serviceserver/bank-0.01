// app/api/auth/register/route.ts

import { ok, fail } from "@/lib/utils/apiResponse";
import { registerSchema } from "@/lib/validators/auth.validators";
import { registerUser } from "@/lib/services/auth.service";
import { getRegistrationStatus } from "@/lib/services/admin.service";

export async function POST(req: Request) {
  try {
    const registrationEnabled = await getRegistrationStatus();
    if (!registrationEnabled) {
      return fail("Registration is currently disabled. Please try again later.");
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0].message;
      return fail(message);
    }

    const user = await registerUser(parsed.data);
    return ok(user, 201);
  } catch (e: any) {
    return fail(e.message);
  }
}