import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PricingManager } from "@/components/admin/PricingManager";
import { getPricingConfigRecord } from "@/lib/pricing-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Edit the public pricing page, rate card, page copy, commercial terms and FAQs.",
};

export default async function AdminPricingPage() {
  const record = await getPricingConfigRecord();

  return (
    <>
      <PageHeader
        title="Pricing"
        description="Update anything on the public pricing page — prices, packages, copy, rules, payment terms, FAQs, SEO and more."
        actions={
          <ButtonLink href="/pricing" external variant="outline" size="sm">
            <Icon name="external" className="h-4 w-4" /> View public page
          </ButtonLink>
        }
      />
      <PricingManager
        initialConfig={record.config}
        isCustom={record.isCustom}
        updatedAt={record.updatedAt}
      />
    </>
  );
}
