import type { Metadata } from "next";
import { RepairTrackForm } from "@/components/forms/RepairTrackForm";
import { PageHero, Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Track a Repair",
  description:
    "Check the status of your Fresh Solutions repair with your repair reference and access code.",
};

export default function RepairTrackPage() {
  return (
    <>
      <PageHero
        eyebrow="Track a repair"
        title="Check your repair status"
        intro="Enter the repair reference and access code you received when you submitted your request. For your privacy, both are required."
      />
      <Section className="pt-10 sm:pt-12">
        <Container className="max-w-xl">
          <RepairTrackForm />
        </Container>
      </Section>
    </>
  );
}
