/**
 * Generate PRICING_STANDARD.md from the built-in rate card or an exported
 * admin pricing configuration.
 *
 * Run `npm run pricing:export` for the built-in defaults, or
 * `npm run pricing:export -- --config ./pricing.json` for a JSON file exported
 * from /admin/pricing.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { planUnitLabel } from "../lib/pricing";
import {
  DEFAULT_PRICING_CONFIG,
  addOnPriceLabelFrom,
  formatEffectiveDateFrom,
  formatGHSFrom,
  getPricingGroupFrom,
  getPricingGroupServicesFrom,
  getServiceStartingPriceFrom,
  normalizePricingConfig,
  planPriceLabelFrom,
  serviceDisplayName,
} from "../lib/pricing-config";

function loadConfig() {
  const flagIndex = process.argv.indexOf("--config");
  const configPath = flagIndex >= 0 ? process.argv[flagIndex + 1] : process.env.PRICING_CONFIG_JSON;
  if (!configPath) return DEFAULT_PRICING_CONFIG;
  const parsed: unknown = JSON.parse(readFileSync(resolve(process.cwd(), configPath), "utf8"));
  const raw =
    parsed && typeof parsed === "object" && !Array.isArray(parsed) && "config" in parsed
      ? (parsed as { config: unknown }).config
      : parsed;
  return normalizePricingConfig(raw);
}

const config = loadConfig();
const lines: string[] = [];
const push = (...items: string[]) => lines.push(...items);

push(
  "# Fresh Solutions — Pricing Standard",
  "",
  "> **Owner review required:** the amounts in this rate card are proposed starting prices prepared for review. Confirm them before treating the public pricing page as final.",
  "",
  `**Currency:** ${config.currencyLabel} (${config.currency}, ${config.symbol})  `,
  `**Effective date:** ${formatEffectiveDateFrom(config)}  `,
  `**Review cycle:** ${config.standard.reviewCycle}  `,
  `**Written-quote validity:** ${config.standard.quoteValidityDays} days unless the scope changes  `,
  "**Editable source:** `/admin/pricing` (falls back to `lib/pricing.ts`)<br>",
  "**Public page:** `/pricing`",
  "",
  "---",
  "",
  "## 1. Purpose",
  "",
  "This standard gives customers enough published information to choose a service and price band without a lengthy back-and-forth. It also gives the Fresh Solutions team one consistent basis for fixed packages, starting prices, optional extras, and written quotations.",
  "",
  "## 2. Pricing principles",
  "",
);

for (const rule of config.rules) {
  push(`- **${rule.title}.** ${rule.description}`);
}

push(
  "",
  "## 3. Default commercial terms",
  "",
);

for (const term of config.paymentTerms) {
  push(`- ${term}`);
}

push(
  "",
  "## 4. Customer workflow",
  "",
);

config.process.forEach((step, index) => {
  push(`${index + 1}. **${step.title}.** ${step.text}`);
});

push(
  "",
  "## 5. Published starting prices by service",
  "",
  "| Service | Group | From | Unit |",
  "| --- | --- | ---: | --- |",
);

for (const entry of config.services) {
  const start = getServiceStartingPriceFrom(config, entry.serviceSlug);
  const group = getPricingGroupFrom(config, entry.groupId);
  push(
    `| ${serviceDisplayName(config, entry)} | ${group?.shortLabel ?? entry.groupId} | ${start ? `${start.kind === "from" ? "From " : ""}${formatGHSFrom(config, start.amount)}` : "—"} | ${start?.unit ?? "—"} |`,
  );
}

push("", "---", "", "## 6. Full package rate card", "");

for (const group of config.groups) {
  push(`### ${group.label}`, "", group.description, "");
  for (const entry of getPricingGroupServicesFrom(config, group.id)) {
    push(`#### ${serviceDisplayName(config, entry)}`, "", entry.intro, "", `**Scope note:** ${entry.note}`, "", "| Package | Published price | Unit | Type | Typical duration | Best for |", "| --- | ---: | --- | --- | --- | --- |");
    for (const plan of entry.plans) {
      push(
        `| ${plan.name} | ${planPriceLabelFrom(config, plan)} | ${planUnitLabel(plan)} | ${plan.kind === "fixed" ? "Fixed" : "Starting price"} | ${plan.duration} | ${plan.bestFor} |`,
      );
    }
    push("", "**Included in each package:**", "");
    for (const plan of entry.plans) {
      push(`- *${plan.name}:* ${plan.includes.join("; ")}.`);
    }
    push("", "**Optional extras:**", "");
    for (const addOn of entry.addOns) {
      push(`- ${addOn.label}: ${addOnPriceLabelFrom(config, addOn)}${addOn.note ? ` (${addOn.note})` : ""}.`);
    }
    push("");
  }
}

push("---", "", "## 7. Frequently asked questions", "");

for (const faq of config.faqs) {
  push(`### ${faq.question}`, "", faq.answer, "");
}

push(
  "---",
  "",
  "## 8. Changing a published price",
  "",
  "1. Sign in to `/admin/pricing` — this is the live source of truth for the public rate card.",
  "2. Change the relevant copy, group, service, package, extra, rule, payment term, FAQ, process step, or commercial setting.",
  "3. Save and review the public `/pricing` page. The checked-in `lib/pricing.ts` is only the fallback used before the first save or if saved settings are invalid.",
  "4. Optionally download the configuration JSON from `/admin/pricing` and run `npm run pricing:export -- --config ./pricing.json` to regenerate this document.",
  "5. Run `npm test`, `npm run typecheck`, and `npm run build` before deploying code changes.",
  "6. Update the effective date when a new rate card is approved.",
  "",
  "## 9. Owner approval checklist",
  "",
  "- [ ] Confirm every fixed package price and every starting price.",
  "- [ ] Confirm the deposit and milestone percentages.",
  "- [ ] Confirm the standard out-of-scope hourly rate.",
  "- [ ] Confirm which third-party costs are passed through and how receipts are shared.",
  "- [ ] Confirm VAT/tax treatment with the accountant.",
  "- [ ] Confirm the free introductory call duration.",
  "- [ ] Confirm the effective date and review owner.",
  "",
  "## 10. Assumptions behind this proposed rate card",
  "",
  "- Prices are in Ghana cedis and exclude applicable taxes unless stated otherwise.",
  "- Fixed prices assume customer content, feedback, and access are provided on time.",
  "- “From” prices cover only the stated starting scope and require a written quotation once details are known.",
  "- Recurring prices are per month and count as one billing period in indicative estimates.",
  "- Third-party services, parts, travel outside Greater Accra, and specialist certifications are excluded.",
  "- The website publishes prices and collects enquiries; it does not take online card payments.",
  "",
);

const outputPath = fileURLToPath(new URL("../PRICING_STANDARD.md", import.meta.url));
writeFileSync(outputPath, `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
