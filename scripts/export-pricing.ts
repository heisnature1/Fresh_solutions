/**
 * Generate PRICING_STANDARD.md from the canonical rate card in lib/pricing.ts.
 * Run `npm run pricing:export` after changing any published price.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getService } from "../lib/constants";
import {
  addOnPriceLabel,
  formatEffectiveDate,
  formatGHS,
  getPricingGroupServices,
  getServiceStartingPrice,
  PAYMENT_TERMS,
  planPriceLabel,
  planUnitLabel,
  PRICING_CURRENCY,
  PRICING_CURRENCY_LABEL,
  PRICING_FAQS,
  PRICING_GROUPS,
  PRICING_PROCESS,
  PRICING_RULES,
  PRICING_STANDARD,
  SERVICE_PRICING,
} from "../lib/pricing";

const lines: string[] = [];
const push = (...items: string[]) => lines.push(...items);

push(
  "# Fresh Solutions — Pricing Standard",
  "",
  "> **Owner review required:** the amounts in this rate card are proposed starting prices prepared for review. Confirm them before treating the public pricing page as final.",
  "",
  `**Currency:** ${PRICING_CURRENCY_LABEL} (${PRICING_CURRENCY}, GH₵)  `,
  `**Effective date:** ${formatEffectiveDate()}  `,
  `**Review cycle:** ${PRICING_STANDARD.reviewCycle}  `,
  `**Written-quote validity:** ${PRICING_STANDARD.quoteValidityDays} days unless the scope changes  `,
  "**Canonical source:** `lib/pricing.ts`  ",
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

for (const rule of PRICING_RULES) {
  push(`- **${rule.title}.** ${rule.description}`);
}

push(
  "",
  "## 3. Default commercial terms",
  "",
);

for (const term of PAYMENT_TERMS) {
  push(`- ${term}`);
}

push(
  "",
  "## 4. Customer workflow",
  "",
);

PRICING_PROCESS.forEach((step, index) => {
  push(`${index + 1}. **${step.title}.** ${step.text}`);
});

push(
  "",
  "## 5. Published starting prices by service",
  "",
  "| Service | Group | From | Unit |",
  "| --- | --- | ---: | --- |",
);

for (const entry of SERVICE_PRICING) {
  const service = getService(entry.serviceSlug);
  const start = getServiceStartingPrice(entry.serviceSlug);
  const group = PRICING_GROUPS.find((item) => item.id === entry.groupId);
  push(
    `| ${service?.name ?? entry.serviceSlug} | ${group?.shortLabel ?? entry.groupId} | ${start ? `${start.kind === "from" ? "From " : ""}${formatGHS(start.amount)}` : "—"} | ${start?.unit ?? "—"} |`,
  );
}

push("", "---", "", "## 6. Full package rate card", "");

for (const group of PRICING_GROUPS) {
  push(`### ${group.label}`, "", group.description, "");
  for (const entry of getPricingGroupServices(group.id)) {
    const service = getService(entry.serviceSlug);
    push(`#### ${service?.name ?? entry.serviceSlug}`, "", entry.intro, "", `**Scope note:** ${entry.note}`, "", "| Package | Published price | Unit | Type | Typical duration | Best for |", "| --- | ---: | --- | --- | --- | --- |");
    for (const plan of entry.plans) {
      push(
        `| ${plan.name} | ${planPriceLabel(plan)} | ${planUnitLabel(plan)} | ${plan.kind === "fixed" ? "Fixed" : "Starting price"} | ${plan.duration} | ${plan.bestFor} |`,
      );
    }
    push("", "**Included in each package:**", "");
    for (const plan of entry.plans) {
      push(`- *${plan.name}:* ${plan.includes.join("; ")}.`);
    }
    push("", "**Optional extras:**", "");
    for (const addOn of entry.addOns) {
      push(`- ${addOn.label}: ${addOnPriceLabel(addOn)}${addOn.note ? ` (${addOn.note})` : ""}.`);
    }
    push("");
  }
}

push("---", "", "## 7. Frequently asked questions", "");

for (const faq of PRICING_FAQS) {
  push(`### ${faq.question}`, "", faq.answer, "");
}

push(
  "---",
  "",
  "## 8. Changing a published price",
  "",
  "1. Open `lib/pricing.ts` — it is the single source of truth for the public rate card.",
  "2. Change the relevant `price`, `unit`, `kind`, inclusions, or add-on in `SERVICE_PRICING`.",
  "3. If commercial terms change, update `PRICING_STANDARD`, `PAYMENT_TERMS`, `PRICING_RULES`, or `PRICING_FAQS` in the same file.",
  "4. Run `npm run pricing:export` to regenerate this document.",
  "5. Run `npm test`, `npm run typecheck`, and `npm run build` before deploying.",
  "6. Update the `effectiveDate` when a new rate card is approved.",
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
