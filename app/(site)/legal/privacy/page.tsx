import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container, Section, Alert } from "@/components/ui";
import { getSettings, whatsappLink } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Fresh Solutions collects, uses, and protects your information.",
  alternates: { canonical: "/legal/privacy" },
};

const DEFAULT_PRIVACY = `
## Our commitment

Fresh Solutions ("we", "us") respects your privacy. This policy explains what information we collect through this website and why, in plain language.

## What we collect

- **Contact details** you give us (name, email, phone number) through our contact, enquiry, repair, consultation, and job application forms.
- **Project & repair information** you provide: descriptions of the work you need, photos or documents you upload.
- **Job application materials**: CV, cover note, qualifications, and contact details.
- **Technical logs**: standard server logs (IP address, browser, time) kept for security and abuse prevention.

## What we do with it

- Respond to your enquiries and provide quotes, proposals, repairs, and consultations.
- Process job applications.
- Send transactional emails (e.g. repair status confirmations) where email is configured.
- Improve the website — we do not run advertising trackers or sell data to third parties.

## What we do not do

- We do not sell, rent, or trade your personal information.
- We do not send marketing newsletters without your explicit consent.
- We do not publish anything you send us without permission.

## Retention

We keep enquiry and repair records only as long as they are needed to serve you and meet legal obligations, then securely delete them. You may ask for your data to be corrected or deleted at any time.

## Your rights

Depending on your location (including under Ghana's Data Protection Act, 2012), you may request access, correction, or deletion of your personal information. Contact us using the details on the site.

## Changes

If this policy changes, the updated version will appear here with the date updated.
`;

export default async function PrivacyPage() {
  const settings = await getSettings();
  const custom = settings.legalPrivacy?.trim();
  const wa = whatsappLink(settings.contactWhatsapp);

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric-600">Legal</p>
          <h1 className="mb-2 mt-3 font-display text-4xl font-extrabold text-navy-900">Privacy Policy</h1>
          <p className="mb-8 text-sm text-mist-500">Last updated: 22 February 2026</p>

          {!custom ? (
            <div className="mb-8">
              <Alert tone="info">
                This is our standard template privacy policy, provided in good faith while the final reviewed version is
                prepared. It describes practices this website actually follows. A legally reviewed, company-specific
                version will replace it.
              </Alert>
            </div>
          ) : null}

          <div className="article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{custom ?? DEFAULT_PRIVACY}</ReactMarkdown>
          </div>

          <div className="mt-10 rounded-2xl bg-mist-50 p-6 text-sm text-mist-600">
            <p className="font-semibold text-navy-900">Questions about your data?</p>
            <p className="mt-1">
              {settings.contactEmail ? (
                <>Email <a href={`mailto:${settings.contactEmail}`} className="font-semibold text-electric-700 underline underline-offset-2">{settings.contactEmail}</a></>
              ) : wa ? (
                <>Message us on <a href={wa} className="font-semibold text-electric-700 underline underline-offset-2" rel="noopener noreferrer" target="_blank">WhatsApp</a></>
              ) : (
                <>Use the <a href="/contact" className="font-semibold text-electric-700 underline underline-offset-2">contact form</a> and we'll respond.</>
              )}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
