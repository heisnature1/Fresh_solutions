import { classNames } from "@/lib/utils";

/** Compact animated stats strip for the public pricing guide. */
export function PricingStatsBar({
  services,
  packages,
  groups,
  revisions,
  className,
}: {
  services: number;
  packages: number;
  groups: number;
  revisions: number;
  className?: string;
}) {
  const stats = [
    { value: services, label: "services" },
    { value: packages, label: "packages" },
    { value: groups, label: "groups" },
    { value: revisions, label: "revision rounds" },
  ];

  return (
    <div className={classNames("pricing-stats-bar print:hidden", className)} data-reveal="zoom" data-delay="120">
      <div className="pricing-stats-grid" data-stagger>
        {stats.map((stat) => (
          <div key={stat.label} className="pricing-stat" aria-label={`${stat.value} ${stat.label}`}>
            <span className="pricing-stat-value" data-counter-to={stat.value} aria-hidden="true">
              0
            </span>
            <span className="pricing-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="pricing-stats-glow" aria-hidden />
    </div>
  );
}
