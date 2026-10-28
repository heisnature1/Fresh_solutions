import { classNames } from "@/lib/utils";

/**
 * Decorative 3D pricing cube. Pure CSS: no canvas, no layout shift, hidden from
 * assistive tech and print. Reduced-motion users see a static badge.
 */
export function PricingHeroMotion({ className }: { className?: string }) {
  return (
    <div className={classNames("pricing-hero-motion print:hidden", className)} aria-hidden="true">
      <div className="pricing-hero-orbit pricing-hero-orbit-outer" />
      <div className="pricing-hero-orbit pricing-hero-orbit-inner" />
      <div className="pricing-hero-cube">
        <span className="cube-face cube-front">GH₵</span>
        <span className="cube-face cube-back">GHS</span>
        <span className="cube-face cube-right">11</span>
        <span className="cube-face cube-left">47</span>
        <span className="cube-face cube-top" />
        <span className="cube-face cube-bottom" />
      </div>
      <span className="pricing-hero-chip pricing-hero-chip-one">Transparent</span>
      <span className="pricing-hero-chip pricing-hero-chip-two">Fixed scope</span>
      <span className="pricing-hero-chip pricing-hero-chip-three">Local currency</span>
    </div>
  );
}
