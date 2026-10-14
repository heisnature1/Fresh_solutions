import type { Metadata } from "next";
import { RepairRequestForm } from "@/components/forms/RepairRequestForm";
import { PageHero, Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Request a Repair",
  description:
    "Request a repair for your mobile phone, laptop, kettle, or other appliance. Unique reference issued instantly — no account needed.",
};

export default function RepairRequestPage() {
  return (
    <>
      <PageHero
        eyebrow="Request a repair"
        title="Tell us about the fault"
        intro="Fill in what you know — we'll take it from there. You will receive a repair reference and a status access code immediately after submitting."
      />
      <Section className="pt-10 sm:pt-12">
        <Container className="max-w-3xl">
          <RepairRequestForm />
        </Container>
      </Section>
    </>
  );
}
