import { Icon } from "@/components/icons";
import { classNames } from "@/lib/utils";

/** Animated value-proposition marquee ("motive" strip) under the pricing hero. */
export function PricingMotiveStrip({ items, className }: { items: string[]; className?: string }) {
  const labels = items.filter(Boolean);
  if (labels.length === 0) return null;
  const track = [...labels, ...labels];

  return (
    <div className={classNames("pricing-motive print:hidden", className)} data-reveal>
      <div className="pricing-motive-glow" aria-hidden />
      <div className="ticker relative z-10">
        <div className="ticker-track pricing-motive-track">
          {track.map((label, index) => (
            <span key={`${label}-${index}`} className="pricing-motive-item">
              <Icon name="sparkles" className="h-3.5 w-3.5 text-electric-300" />
              {label}
              <span className="pricing-motive-dot" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
