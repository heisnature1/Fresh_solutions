import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container, Section, Alert } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing the use of the Fresh Solutions website and services.",
  alternates: { canonical: "/legal/terms" },
};

const DEFAULT_TERMS = `
## Agreement

By using this website and our services, you agree to these terms. If you do not agree, please don't use the site.

## Our services

Fresh Solutions provides technology services including custom software development, cybersecurity consulting, AI solutions, IT support, electrical and electronic appliance repairs, and business consultancy. Specific work is governed by individually agreed quotations and proposals, which take precedence over this page.

## Quotations and proposals

Quotations issued by Fresh Solutions are valid for 30 days unless stated otherwise. Prices are quoted in the currency stated on the document. Work commences once the client formally accepts a quotation or proposal.

## Repairs

Repair estimates are based on initial diagnosis. If our engineer finds additional faults, we will contact you for approval before proceeding and before any additional cost is incurred. We do not guarantee parts for third-party damage or pre-existing faults beyond what is stated.

## Website content

All text, images, and layout on this website are the property of Fresh Solutions unless credited otherwise. You may link to public pages; you may not reproduce substantial content without permission.

## Accuracy

We work hard to keep information on this site accurate. Because we commit to real, current content, if we discover an error we will correct it promptly rather than leave it up.

## Liability

To the fullest extent permitted by law, Fresh Solutions is not liable for indirect or consequential losses arising from use of this website or our services. Our total liability is limited to the fees actually paid for the relevant work.

## Changes

We may update these terms; the "last updated" date will change when we do. Continued use after a change constitutes acceptance.

## Contact

Questions about these terms — contact us through the website.
`;

export default async function TermsPage() {
  const settings = await getSettings();
  const custom = settings.legalTerms?.trim();

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric-600">Legal</p>
          <h1 className="mb-2 mt-3 font-display text-4xl font-extrabold text-navy-900">Terms of Service</h1>
          <p className="mb-8 text-sm text-mist-500">Last updated: 22 February 2026</p>

          {!custom ? (
            <div className="mb-8">
              <Alert tone="info">
                This is our standard template terms of service, provided in good faith while the final reviewed version
                is prepared. It reflects how this business actually operates. A legally reviewed, company-specific
                version will replace it.
              </Alert>
            </div>
          ) : null}

          <div className="article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{custom ?? DEFAULT_TERMS}</ReactMarkdown>
          </div>
        </div>
      </Container>
    </Section>
  );
}
