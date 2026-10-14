import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero, Container, Section } from "@/components/ui";
import { getService, SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Tell Fresh Solutions about your project — software, security, AI, engineering, training, or consultancy — and receive a clear, honest response.",
};

export default async function StartAProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; type?: string }>;
}) {
  const params = await searchParams;
  const service = params.service && getService(params.service) ? params.service : undefined;
  const kind = params.type === "quotation" ? "quotation" : "project";

  return (
    <>
      <PageHero
        eyebrow="Start a project"
        title="Tell us what you're working toward"
        intro="Six quick steps. No account needed, no obligation — just a clear reference and a real response from our team."
      />
      <Section className="pt-10 sm:pt-12">
        <Container className="max-w-3xl">
          <InquiryForm initialService={service} initialKind={kind} />
        </Container>
      </Section>
    </>
  );
}
