# Fresh_solutions

Fresh Solutions business website and management platform.

## Pricing standard

The public pricing guide is available at `/pricing`. It lists fixed and starting
prices for all 11 services in Ghana cedis (GHS), with package inclusions,
optional extras, estimate building, commercial terms, and FAQs.

- Admins edit the live rate card, copy, SEO, groups, packages, extras, rules,
  payment terms, FAQs, process steps and commercial settings at `/admin/pricing`.
  Changes are saved in the database and audited; public pages revalidate after saving.
- `lib/pricing.ts` is the checked-in fallback rate card, used before the first
  admin save and if saved settings are invalid.
- `lib/pricing-config.ts` validates the full admin-editable configuration;
  `lib/pricing-store.ts` reads and writes the saved override.
- `PRICING_STANDARD.md` is the internal rate-card document generated from the
  built-in defaults. To document a saved configuration, download its JSON from
  `/admin/pricing` and run
  `npm run pricing:export -- --config ./fresh-solutions-pricing.json`.
- Run `npm test`, `npm run typecheck`, and `npm run build` before deploying code
  changes.

> The current amounts are a proposed rate card and should be approved by the
> business owner before the public pricing page is treated as final.
