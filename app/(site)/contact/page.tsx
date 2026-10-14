import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { getSettings, whatsappLink } from "@/lib/settings";
import { ContactForm } from "@/components/forms/ContactForm";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { ReviewForm } from "@/components/forms/ReviewForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Fresh Solutions — message, WhatsApp, email, or book a consultation.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ form?: string }> }) {
  const params = await searchParams;
  const settings = await getSettings();
  const wa = whatsappLink(settings.contactWhatsapp, "Hello Fresh Solutions — I'd like to get in touch.");
  const defaulted = params.form === "consultation";

  return (
    <>
      <Section className="bg-navy-950 pb-16 pt-16 text-white">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric-300">Contact</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold">Let's talk about what you need</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist-300">
            Send a message, request a consultation, or check the details below. Whatever route you choose, a real person
            reads and responds.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              {/* Tabbed form switcher (server-driven via ?form=) */}
              <div className="mb-6 inline-flex rounded-xl bg-mist-100 p-1" role="tablist" aria-label="How would you like to reach us?">
                <Link
                  href="/contact"
                  role="tab"
                  aria-selected={!defaulted}
                  className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${!defaulted ? "bg-white text-navy-900 shadow-card" : "text-mist-600 hover:text-navy-900"}`}
                >
                  Send a message
                </Link>
                <Link
                  href="/contact?form=consultation"
                  role="tab"
                  aria-selected={defaulted}
                  className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${defaulted ? "bg-white text-navy-900 shadow-card" : "text-mist-600 hover:text-navy-900"}`}
                >
                  Request a consultation
                </Link>
              </div>

              <Card className="p-7">
                {defaulted ? (
                  <>
                    <h2 className="mb-1.5 font-display text-xl font-bold text-navy-900">Request a consultation</h2>
                    <p className="mb-6 text-sm text-mist-600">
                      Tell us what you'd like to discuss and your preferred time. We'll reply to confirm or suggest
                      alternatives — appointments are only final once we've confirmed them with you.
                    </p>
                    <ConsultationForm />
                  </>
                ) : (
                  <>
                    <h2 className="mb-1.5 font-display text-xl font-bold text-navy-900">Send us a message</h2>
                    <p className="mb-6 text-sm text-mist-600">
                      Questions, ideas, problems — whatever it is. We read every message.
                    </p>
                    <ContactForm />
                  </>
                )}
              </Card>
            </div>

            <div className="space-y-5">
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="border-emerald-200 bg-emerald-50/60 p-6 transition-colors hover:border-emerald-300">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25d366] text-white">
                        <Icon name="whatsapp" className="h-5.5 w-5.5" />
                      </span>
                      <div>
                        <h2 className="font-display text-base font-bold text-navy-900">Chat on WhatsApp</h2>
                        <p className="text-xs text-mist-600">Opens WhatsApp with a fresh chat — nothing is automated</p>
                      </div>
                    </div>
                  </Card>
                </a>
              ) : null}

              <Card className="p-6">
                <h2 className="mb-4 font-display text-base font-bold text-navy-900">Other ways to reach us</h2>
                <ul className="space-y-4 text-sm">
                  {settings.contactEmail ? (
                    <li className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric-100"><Icon name="mail" className="h-4 w-4 text-electric-700" /></span>
                      <div>
                        <p className="font-semibold text-navy-900">Email</p>
                        <a href={`mailto:${settings.contactEmail}`} className="text-electric-700 underline underline-offset-2">{settings.contactEmail}</a>
                      </div>
                    </li>
                  ) : null}
                  {settings.contactPhone ? (
                    <li className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric-100"><Icon name="phone" className="h-4 w-4 text-electric-700" /></span>
                      <div>
                        <p className="font-semibold text-navy-900">Phone</p>
                        <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`} className="text-navy-900">{settings.contactPhone}</a>
                      </div>
                    </li>
                  ) : null}
                  {settings.contactLocation ? (
                    <li className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric-100"><Icon name="map-pin" className="h-4 w-4 text-electric-700" /></span>
                      <div>
                        <p className="font-semibold text-navy-900">Location</p>
                        <p className="text-mist-600">{settings.contactLocation}</p>
                      </div>
                    </li>
                  ) : null}
                  {settings.businessHours ? (
                    <li className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric-100"><Icon name="clock" className="h-4 w-4 text-electric-700" /></span>
                      <div>
                        <p className="font-semibold text-navy-900">Hours</p>
                        <p className="text-mist-600">{settings.businessHours}</p>
                      </div>
                    </li>
                  ) : null}
                  {!settings.contactEmail && !settings.contactPhone ? (
                    <li className="text-mist-600">
                      Direct contact details are being configured — the form here reaches us in the meantime.
                    </li>
                  ) : null}
                </ul>
              </Card>

              <Card className="bg-navy-900 p-6 text-white">
                <h2 className="font-display text-base font-bold">Quick links</h2>
                <ul className="mt-3 space-y-2.5 text-sm">
                  <li><Link href="/start-a-project" className="font-semibold text-electric-300 transition-colors hover:text-electric-200">→ Start a project (guided form)</Link></li>
                  <li><Link href="/repairs/request" className="font-semibold text-electric-300 transition-colors hover:text-electric-200">→ Request a device repair</Link></li>
                  <li><Link href="/repairs/track" className="font-semibold text-electric-300 transition-colors hover:text-electric-200">→ Track an existing repair</Link></li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-mist-50 pt-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <Badge tone="blue">Share your experience</Badge>
              <h2 className="mb-2 mt-3 font-display text-2xl font-extrabold text-navy-900">Worked with us before?</h2>
              <p className="mb-7 text-sm text-mist-600">
                Tell others how it went. Your review is moderated before publishing — we publish genuine feedback with
                the reviewer's consent, and we never invent reviews to fill the page.
              </p>
            </div>
            <Card className="p-7">
              <ReviewForm />
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
