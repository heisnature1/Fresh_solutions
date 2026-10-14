import { and, eq } from "drizzle-orm";
import { apiHandler, checkRateLimit, jsonError, jsonOk, parseJson } from "@/lib/api";
import { repairTrackSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { sha256 } from "@/lib/crypto";
import { repairStatusLabel } from "@/lib/constants";
import { desc } from "drizzle-orm";

/**
 * Secure public repair-status lookup. Requires both the repair reference AND
 * the access code issued at submission — a reference number alone is never
 * enough, and lookup is strictly rate-limited against enumeration.
 */
export const POST = apiHandler(async (req: Request) => {
  await checkRateLimit(req, "public:repair-track", 10, 600);
  const { reference, code } = await parseJson(req, repairTrackSchema);

  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.repairRequests)
    .where(and(eq(schema.repairRequests.reference, reference), eq(schema.repairRequests.accessCodeHash, sha256(code))))
    .limit(1);

  if (!rows[0]) {
    return jsonError("No repair found with that reference and access code. Please check both and try again.", 404);
  }

  const repair = rows[0];
  const history = await db
    .select({ toStatus: schema.repairStatusHistory.toStatus, createdAt: schema.repairStatusHistory.createdAt })
    .from(schema.repairStatusHistory)
    .where(eq(schema.repairStatusHistory.repairId, repair.id))
    .orderBy(desc(schema.repairStatusHistory.createdAt))
    .limit(10);

  // Only non-sensitive, customer-facing fields are returned.
  return jsonOk({
    repair: {
      reference: repair.reference,
      status: repair.status,
      statusLabel: repairStatusLabel(repair.status),
      applianceType: repair.applianceType,
      brand: repair.brand,
      createdAt: repair.createdAt.toISOString(),
      completedAt: repair.completedAt ? repair.completedAt.toISOString() : null,
      history: history.reverse().map((h) => ({
        status: repairStatusLabel(h.toStatus),
        at: h.createdAt.toISOString(),
      })),
    } as unknown as Record<string, unknown>,
  });
});

export const runtime = "nodejs";
