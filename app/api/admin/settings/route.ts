import { z } from "zod";
import { apiHandler, assertSameOrigin, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { SETTING_KEYS, setSetting } from "@/lib/settings";
import { clientIp, recordAudit } from "@/lib/audit";

/**
 * Website settings. Server-side allowlist of keys and per-field validation —
 * the client cannot write arbitrary settings.
 */
const url = z.union([z.literal(""), z.string().trim().max(500).url("Enter a valid URL (https://…).")]).optional();
const short = (n: number) => z.string().trim().max(n).optional();

const settingsSchema = z.object({
  group: z.enum(["company", "documents", "legal"]),
  companyDescription: short(2000),
  contactEmail: z.union([z.literal(""), z.string().trim().toLowerCase().max(320).email("Enter a valid email.")]).optional(),
  contactPhone: z.string().trim().max(40).regex(/^$|^[+\d][\d\s().-]{5,39}$/, "Enter a valid telephone number.").optional(),
  contactWhatsapp: z.string().trim().max(30).regex(/^$|^\+?[\d\s()-]{7,25}$/, "Enter the number in international format (digits, optionally starting with +).").optional(),
  contactLocation: short(200),
  businessHours: short(200),
  socialFacebook: url,
  socialInstagram: url,
  socialLinkedin: url,
  socialX: url,
  socialYoutube: url,
  socialTiktok: url,
  socialGithub: url,
  homeHeroHeadline: short(200),
  homeHeroSubtext: short(500),
  seoTitleSuffix: short(100),
  seoDefaultDescription: short(300),
  defaultCurrency: z.string().trim().length(3).toUpperCase().optional(),
  notifyEmail: z.union([z.literal(""), z.string().trim().toLowerCase().max(320).email("Enter a valid email.")]).optional(),
  quoteTerms: short(6000),
  jobCardFooter: short(300),
  legalPrivacy: short(60000),
  legalTerms: short(60000),
});

const FIELD_TO_KEY: Record<string, string | undefined> = {
  companyDescription: SETTING_KEYS.companyDescription,
  contactEmail: SETTING_KEYS.contactEmail,
  contactPhone: SETTING_KEYS.contactPhone,
  contactWhatsapp: SETTING_KEYS.contactWhatsapp,
  contactLocation: SETTING_KEYS.contactLocation,
  businessHours: SETTING_KEYS.businessHours,
  socialFacebook: SETTING_KEYS.socialFacebook,
  socialInstagram: SETTING_KEYS.socialInstagram,
  socialLinkedin: SETTING_KEYS.socialLinkedin,
  socialX: SETTING_KEYS.socialX,
  socialYoutube: SETTING_KEYS.socialYoutube,
  socialTiktok: SETTING_KEYS.socialTiktok,
  socialGithub: SETTING_KEYS.socialGithub,
  homeHeroHeadline: SETTING_KEYS.homeHeroHeadline,
  homeHeroSubtext: SETTING_KEYS.homeHeroSubtext,
  seoTitleSuffix: SETTING_KEYS.seoTitleSuffix,
  seoDefaultDescription: SETTING_KEYS.seoDefaultDescription,
  defaultCurrency: SETTING_KEYS.defaultCurrency,
  notifyEmail: SETTING_KEYS.notifyEmail,
  quoteTerms: SETTING_KEYS.quoteTerms,
  jobCardFooter: SETTING_KEYS.jobCardFooter,
  legalPrivacy: SETTING_KEYS.legalPrivacy,
  legalTerms: SETTING_KEYS.legalTerms,
};

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, settingsSchema);

  let saved = 0;
  for (const [field, value] of Object.entries(input)) {
    if (field === "group" || value === undefined) continue;
    const key = FIELD_TO_KEY[field];
    if (!key) continue;
    await setSetting(key as never, value);
    saved++;
  }

  await recordAudit({ adminId: admin.id, action: "settings.update", entity: "settings", meta: { group: input.group, fields: saved }, ip: clientIp(req.headers) });
  return jsonOk({ message: `Settings saved (${saved} field${saved === 1 ? "" : "s"}).` });
});

export const runtime = "nodejs";
