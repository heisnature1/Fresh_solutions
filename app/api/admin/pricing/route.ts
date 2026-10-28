import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { clientIp, recordAudit } from "@/lib/audit";
import { getPricingConfigRecord, resetPricingConfig, savePricingConfig } from "@/lib/pricing-store";
import { repairPricingConfig, validatePricingConfig } from "@/lib/pricing-config";

const saveSchema = z
  .object({ config: z.unknown() })
  .refine(({ config }) => config !== undefined, { message: "A pricing configuration is required." });

function revalidatePricingPages() {
  // Public pages that read the pricing configuration.
  revalidatePath("/", "layout");
  for (const path of ["/pricing", "/solutions", "/repairs", "/start-a-project", "/sitemap.xml"]) {
    revalidatePath(path);
  }
  revalidatePath("/solutions/[slug]", "page");
}

export const GET = apiHandler(async () => {
  await requireAdmin();
  const record = await getPricingConfigRecord();
  return jsonOk({ config: record.config, isCustom: record.isCustom, updatedAt: record.updatedAt });
});

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { config } = await parseJson(req, saveSchema);
  const { config: repairedConfig, repairs } = repairPricingConfig(config);
  const validated = validatePricingConfig(repairedConfig);
  if (!validated.ok) {
    return jsonError("Please correct the pricing configuration before saving.", 422, { issues: validated.issues, repairs });
  }

  await savePricingConfig(validated.config);
  revalidatePricingPages();
  await recordAudit({
    adminId: admin.id,
    action: "pricing.update",
    entity: "pricing",
    meta: {
      services: validated.config.services.length,
      plans: validated.config.services.reduce((total, entry) => total + entry.plans.length, 0),
      repairs: repairs.length,
    },
    ip: clientIp(req.headers),
  });
  return jsonOk({
    message: repairs.length
      ? `Pricing saved. ${repairs.length} ID/reference issue(s) were repaired automatically.`
      : "Pricing saved. The public site now uses these settings.",
    repairs,
  });
});

export const DELETE = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  await resetPricingConfig();
  revalidatePricingPages();
  await recordAudit({ adminId: admin.id, action: "pricing.reset", entity: "pricing", ip: clientIp(req.headers) });
  return jsonOk({ message: "Pricing reset to the built-in defaults." });
});

export const runtime = "nodejs";
