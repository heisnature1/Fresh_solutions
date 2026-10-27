import type { Metadata } from "next";
import { Container, Section, SectionHeading, Card, ButtonLink, PageHero } from "@/components/ui";
import { Icon, ServiceIcon } from "@/components/icons";
import { Reveal } from "@/components/site/Reveal";
import { getPricingConfig } from "@/lib/pricing-store";
import { formatGHSFrom, getServiceStartingPriceFrom, pricingCopy, pricingCopyWith } from "@/lib/pricing-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Electrical & Electronic Appliance Repairs",
  description:
    "Fresh Solutions repairs mobile phones, laptops, kettles, and other electrical and electronic appliances. Honest diagnosis before any work — request a repair online.",
};

const GROUPS = [
  {
    icon: "smartphone",
    title: "Mobile phone repairs",
    intro: "Careful diagnosis first — we tell you honestly what is wrong and what it will take to fix.",
    items: [
      "Fault diagnosis",
      "Charging problems",
      "Battery-related problems",
      "Screen damage assessment",
      "Software troubleshooting",
      "Other supported hardware repairs",
    ],
  },
  {
    icon: "circuit",
    title: "Laptop & computer repairs",
    intro: "From software trouble to hardware faults, we work through the symptoms methodically.",
    items: [
      "Hardware diagnosis",
      "Operating system & software troubleshooting",
      "Storage and memory issues",
      "Charging and power-related faults",
      "Keyboard and display problems",
      "Component replacement where appropriate",
    ],
  },
  {
    icon: "tool",
    title: "Kettle & small-appliance repairs",
    intro: "Small appliances handled with the same care as anything else — and always with electrical safety first.",
    items: [
      "Power and connection problems",
      "Heating faults",
      "Switch-related faults",
      "Cord and plug assessment",
      "Other supported small-appliance faults",
    ],
  },
  {
    icon: "settings",
    title: "Other appliances",
    intro: "Something else on the bench? Ask us — we will tell you plainly whether it is within our capabilities and the parts available to us.",
    items: [
      "Assessment of other electrical & electronic appliances",
      "Subject to our actual technical capabilities",
      "Subject to parts availability",
      "Honest advice when a repair is not viable",
    ],
  },
];

const STEPS = [
  { title: "You submit a request", text: "Describe the appliance and the fault, optionally with photos. You receive a unique repair reference and access code straight away — no account needed." },
  { title: "We review & arrange inspection", text: "Our team reviews your request and contacts you to arrange drop-off, collection, or an on-site look where practical." },
  { title: "Diagnosis & estimate", text: "We diagnose the fault and share a written estimate. Work only begins after you approve it." },
  { title: "Repair, test & quality check", text: "Approved repairs are carried out and tested. Everything is recorded on your repair job card." },
  { title: "Collection & completion", text: "You collect your appliance (or we arrange delivery). Any applicable warranty terms are recorded on the job card." },
];

export default async function RepairsPage() {
  const config = await getPricingConfig();
  const starting = getServiceStartingPriceFrom(config, "appliance-repairs");
  const startingNote = starting
    ? pricingCopyWith(config, "pricing.repairsStartingNote", {
        price: formatGHSFrom(config, starting.amount),
        unit: starting.unit,
      })
    : "";

  return (
    <>
      <PageHero
        eyebrow="Repairs"
        title="Electrical & electronic appliance repairs, done properly"
        intro="Mobile phones, laptops, kettles, and other appliances — diagnosed honestly, priced transparently, and repaired carefully. We never promise a price or completion date before assessment."
      >
        {starting ? (
          <p className="mt-6 text-sm leading-relaxed text-mist-300">{startingNote}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="/repairs/request" size="lg">
            <Icon name="tool" className="h-5 w-5" /> Request a Repair
          </ButtonLink>
          <ButtonLink href="/pricing#appliance-repairs" variant="dark" size="lg">
            <Icon name="file-text" className="h-5 w-5" /> {pricingCopy(config, "pricing.repairsPricingCta")}
          </ButtonLink>
          <ButtonLink href="/repairs/track" variant="dark" size="lg">
            Track a repair
          </ButtonLink>
        </div>
      </PageHero>

      {/* safety notice */}
      <div className="border-b border-amber-200 bg-amber-50">
        <Container className="flex items-start gap-3 py-4">
          <Icon name="alert-triangle" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>Electrical safety:</strong> never open, probe, or try to repair a mains-powered appliance
            yourself. Faulty appliances can hold dangerous voltages even when unplugged. All mains-voltage work at
            Fresh Solutions is handled by suitably qualified personnel.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="What we repair"
            title="Repair services"
            intro="Every repair starts with diagnosis. Final pricing, parts availability, and repairability can only be confirmed after inspection."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {GROUPS.map((g, i) => (
              <Reveal key={g.title} delay={(i % 2) * 80}>
                <Card hover className="h-full p-7">
                  <div className="flex items-center gap-4">
                    <ServiceIcon icon={g.icon} />
                    <h3 className="font-display text-lg font-bold text-navy-900">{g.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-mist-600">{g.intro}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-mist-700">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-sm text-mist-500">
            We cannot guarantee that every appliance can be repaired — but if we cannot fix it, we will tell you why
            and what your options are.
          </p>
        </Container>
      </Section>

      <Section dark>
        <Container>
          <SectionHeading
            dark
            eyebrow="The process"
            title="How a repair works"
            intro="Clear steps, a written record at every stage, and a unique reference you can use to check status online."
          />
          <ol className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={i * 70}>
                  <Card dark className="h-full p-5">
                    <span className="font-display text-2xl font-bold text-electric-400">{i + 1}</span>
                    <h3 className="mt-2 text-sm font-bold text-white">{s.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-mist-400">{s.text}</p>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap justify-center gap-3.5">
            <ButtonLink href="/repairs/request" size="lg">
              Request a Repair <Icon name="arrow-right" className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/repairs/track" variant="dark" size="lg">
              Track an existing repair
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
