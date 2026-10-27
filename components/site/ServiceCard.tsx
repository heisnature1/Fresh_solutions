import Link from "next/link";
import { Service } from "@/lib/constants";
import { ServiceIcon, Icon } from "@/components/icons";
import { Card } from "@/components/ui";
import { formatGHS, getServiceStartingPrice, getServicePricingAnchor } from "@/lib/pricing";

export function ServiceCard({ service, dark }: { service: Service; dark?: boolean }) {
  const href = service.isRepairService ? "/repairs" : `/solutions/${service.slug}`;
  const starting = getServiceStartingPrice(service.slug);
  return (
    <Card hover dark={dark} className="group flex h-full flex-col p-6 card-lift">
      <ServiceIcon icon={service.icon} />
      <h3 className={`mt-4 font-display text-lg font-bold ${dark ? "text-white" : "text-navy-900"}`}>
        {service.shortName}
      </h3>
      <p className={`mt-2 flex-1 text-sm leading-relaxed ${dark ? "text-mist-400" : "text-mist-600"}`}>
        {service.summary}
      </p>
      {starting ? (
        <Link
          href={`/pricing${getServicePricingAnchor(service.slug)}`}
          className={`mt-4 inline-flex flex-wrap items-center gap-x-2 text-sm font-bold ${dark ? "text-electric-300" : "text-electric-700"}`}
          aria-label={`View ${service.shortName} prices from ${formatGHS(starting.amount)} Ghana cedis`}
        >
          From {formatGHS(starting.amount)}
          <span className={`text-xs font-medium ${dark ? "text-mist-400" : "text-mist-500"}`}>{starting.unit}</span>
        </Link>
      ) : null}
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-600 transition-colors group-hover:gap-2.5 hover:text-electric-500"
        aria-label={`${service.cta} — learn more about ${service.name}`}
      >
        {service.cta}
        <Icon name="arrow-right" className="h-4 w-4 transition-all" />
      </Link>
    </Card>
  );
}
