import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db/client";
import { SETTING_KEYS, setSetting } from "./settings";
import { DEFAULT_PRICING_CONFIG, normalizePricingConfig, type PricingConfig } from "./pricing-config";

export const PRICING_SETTING_KEY = SETTING_KEYS.pricingConfig;

export interface PricingConfigRecord {
  config: PricingConfig;
  isCustom: boolean;
  updatedAt: string | null;
}

function cloneDefault(): PricingConfig {
  return JSON.parse(JSON.stringify(DEFAULT_PRICING_CONFIG)) as PricingConfig;
}

/**
 * Read the admin-managed pricing configuration. The code defaults are used
 * until the first save, and also if the database is temporarily unavailable.
 */
export const getPricingConfigRecord = cache(async (): Promise<PricingConfigRecord> => {
  try {
    const db = await getDb();
    const [row] = await db
      .select({ value: schema.siteSettings.value, updatedAt: schema.siteSettings.updatedAt })
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.key, PRICING_SETTING_KEY))
      .limit(1);
    if (row?.value && typeof row.value === "object" && !Array.isArray(row.value)) {
      return {
        config: normalizePricingConfig(row.value),
        isCustom: true,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : null,
      };
    }
  } catch {
    // Public pages must still render without a database connection.
  }
  return { config: cloneDefault(), isCustom: false, updatedAt: null };
});

export const getPricingConfig = cache(async (): Promise<PricingConfig> => {
  return (await getPricingConfigRecord()).config;
});

export async function savePricingConfig(value: unknown): Promise<PricingConfig> {
  const config = normalizePricingConfig(value);
  await setSetting(PRICING_SETTING_KEY, config);
  return config;
}

export async function resetPricingConfig(): Promise<void> {
  const db = await getDb();
  await db.delete(schema.siteSettings).where(eq(schema.siteSettings.key, PRICING_SETTING_KEY));
}
