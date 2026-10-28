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
  `lib/pricing-store.ts` reads and writes the saved override. Invalid package or
  group IDs and stale `startingPlanId` references are repaired automatically on
  import, save, and when reading a saved override, so a draft is never lost to a
  broken ID. The editor also has a one-click **Fix IDs** action.
- Motion is powered by **GSAP + ScrollTrigger + `@gsap/react`**. The shared
  `components/site/MotionProvider.tsx` handles scroll reveals, word-split
  headings, staggered entrances, animated counters, scroll parallax, magnetic
  buttons, GSAP-driven 3D tilt and a global scroll-progress bar.
  `components/site/PricingHeroMotion.tsx` runs a bespoke 3D cube timeline and
  `components/site/SectionNav.tsx` uses ScrollTrigger for active section links.
  Modern CSS features include typed `@property` custom properties, `color-mix()`,
  `text-wrap: balance`, and `backdrop-filter`. All of it respects
  `prefers-reduced-motion` and is hidden or flattened for print.
- `PRICING_STANDARD.md` is the internal rate-card document generated from the
  built-in defaults. To document a saved configuration, download its JSON from
  `/admin/pricing` and run
  `npm run pricing:export -- --config ./fresh-solutions-pricing.json`.
- Run `npm test`, `npm run typecheck`, and `npm run build` before deploying code
  changes.

> The current amounts are a proposed rate card and should be approved by the
> business owner before the public pricing page is treated as final.
