# Fresh_solutions

Fresh Solutions business website and management platform.

## Pricing standard

The public pricing guide is available at `/pricing`. It lists fixed and starting
prices for all 11 services in Ghana cedis (GHS), with package inclusions,
optional extras, estimate building, commercial terms, and FAQs.

- `lib/pricing.ts` is the single source of truth for published prices.
- `PRICING_STANDARD.md` is the internal rate-card document generated from that file.
- Run `npm run pricing:export` after changing any price or commercial term.
- Run `npm test`, `npm run typecheck`, and `npm run build` before deploying.

> The current amounts are a proposed rate card and should be approved by the
> business owner before the public pricing page is treated as final.
