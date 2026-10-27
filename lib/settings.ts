import { cache } from "react";
import { getDb, schema } from "./db/client";
import { eq } from "drizzle-orm";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "./constants";

/**
 * Owner-managed site settings stored in the database. Every value has a safe
 * code default so the site works before the owner configures anything; the
 * admin settings screen shows which values are configured vs placeholders.
 */

export const SETTING_KEYS = {
  companyDescription: "company.description",
  contactEmail: "contact.email",
  contactPhone: "contact.phone",
  contactWhatsapp: "contact.whatsapp", // international format, digits only
  contactLocation: "contact.location", // e.g. "Accra, Ghana" — label only
  businessHours: "contact.business_hours",
  socialFacebook: "social.facebook",
  socialInstagram: "social.instagram",
  socialLinkedin: "social.linkedin",
  socialX: "social.x",
  socialYoutube: "social.youtube",
  socialTiktok: "social.tiktok",
  socialGithub: "social.github",
  homeHeroHeadline: "home.hero_headline",
  homeHeroSubtext: "home.hero_subtext",
  seoTitleSuffix: "seo.title_suffix",
  seoDefaultDescription: "seo.default_description",
  defaultCurrency: "defaults.currency",
  notifyEmail: "notifications.admin_email",
  quoteTerms: "documents.default_quote_terms",
  jobCardFooter: "documents.job_card_footer",
  legalPrivacy: "legal.privacy",
  legalTerms: "legal.terms",
  pricingConfig: "pricing.config",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export interface SiteSettings {
  companyDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactLocation: string;
  businessHours: string;
  social: Record<string, string>;
  homeHeroHeadline: string;
  homeHeroSubtext: string;
  seoTitleSuffix: string;
  seoDefaultDescription: string;
  defaultCurrency: string;
  notifyEmail: string;
  quoteTerms: string;
  jobCardFooter: string;
  legalPrivacy: string;
  legalTerms: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  companyDescription: SITE_DESCRIPTION,
  contactEmail: "",
  contactPhone: "",
  contactWhatsapp: "",
  contactLocation: "",
  businessHours: "",
  social: {},
  homeHeroHeadline: SITE_TAGLINE,
  homeHeroSubtext:
    "From intelligent software and digital security to engineering, IT support, and electrical appliance repairs, Fresh Solutions delivers practical solutions designed around your needs.",
  seoTitleSuffix: "Fresh Solutions",
  seoDefaultDescription: SITE_DESCRIPTION,
  defaultCurrency: "GHS",
  notifyEmail: "",
  quoteTerms:
    "This quotation is valid until the stated expiry date. Work commences after written acceptance. Final invoicing may vary if the agreed scope changes. Payment terms will be confirmed on acceptance.",
  jobCardFooter: "Thank you for choosing Fresh Solutions.",
  legalPrivacy: "",
  legalTerms: "",
};

const KEY_TO_FIELD: Record<string, keyof SiteSettings> = {
  [SETTING_KEYS.companyDescription]: "companyDescription",
  [SETTING_KEYS.contactEmail]: "contactEmail",
  [SETTING_KEYS.contactPhone]: "contactPhone",
  [SETTING_KEYS.contactWhatsapp]: "contactWhatsapp",
  [SETTING_KEYS.contactLocation]: "contactLocation",
  [SETTING_KEYS.businessHours]: "businessHours",
  [SETTING_KEYS.homeHeroHeadline]: "homeHeroHeadline",
  [SETTING_KEYS.homeHeroSubtext]: "homeHeroSubtext",
  [SETTING_KEYS.seoTitleSuffix]: "seoTitleSuffix",
  [SETTING_KEYS.seoDefaultDescription]: "seoDefaultDescription",
  [SETTING_KEYS.defaultCurrency]: "defaultCurrency",
  [SETTING_KEYS.notifyEmail]: "notifyEmail",
  [SETTING_KEYS.quoteTerms]: "quoteTerms",
  [SETTING_KEYS.jobCardFooter]: "jobCardFooter",
  [SETTING_KEYS.legalPrivacy]: "legalPrivacy",
  [SETTING_KEYS.legalTerms]: "legalTerms",
};

const SOCIAL_KEY_TO_NAME: Record<string, string> = {
  [SETTING_KEYS.socialFacebook]: "facebook",
  [SETTING_KEYS.socialInstagram]: "instagram",
  [SETTING_KEYS.socialLinkedin]: "linkedin",
  [SETTING_KEYS.socialX]: "x",
  [SETTING_KEYS.socialYoutube]: "youtube",
  [SETTING_KEYS.socialTiktok]: "tiktok",
  [SETTING_KEYS.socialGithub]: "github",
};

/** Load all settings (cached per request). */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const out: SiteSettings = structuredClone(DEFAULT_SETTINGS);
  out.social = {};
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.siteSettings);
    for (const row of rows) {
      const field = KEY_TO_FIELD[row.key];
      if (field) {
        const v = row.value;
        (out[field] as unknown) = typeof v === "string" ? v : (v as string | null) ?? "";
        continue;
      }
      const social = SOCIAL_KEY_TO_NAME[row.key];
      if (social && typeof row.value === "string" && row.value) out.social[social] = row.value;
    }
  } catch {
    // DB may be unavailable during very early boot; safe defaults apply.
  }
  return out;
});

export async function getSetting(key: SettingKey): Promise<unknown> {
  const db = await getDb();
  const rows = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: SettingKey, value: unknown): Promise<void> {
  const db = await getDb();
  await db
    .insert(schema.siteSettings)
    .values({ key, value: value as never, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value: value as never, updatedAt: new Date() } });
}

/** Useful contact helpers for public pages. */
export function whatsappDigits(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export function whatsappLink(raw: string, message?: string): string | null {
  const digits = whatsappDigits(raw);
  if (!digits || digits.length < 7) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
