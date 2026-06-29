// app/api/admin/settings/registration/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import { getRegistrationStatus, setRegistrationStatus } from "@/lib/services/admin.service";

// GET /api/admin/settings/registration
export async function GET() {
  try {
    await requireAdmin();
    const enabled = await getRegistrationStatus();
    return ok({ enabled });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}

// POST /api/admin/settings/registration
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const { enabled } = await req.json();

    const setting = await setRegistrationStatus(enabled, admin.id);
    return ok({ enabled: setting.value === "true" });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}