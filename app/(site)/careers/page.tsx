import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { getPublishedVacancies } from "@/lib/queries";
import { employmentTypeLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at Fresh Solutions — real vacancies only.",
  alternates: { canonical: "/careers" },
};

export default async function CareersPage() {
  const vacancies = await getPublishedVacancies();

  return (
    <>
      <Section className="bg-navy-950 pb-16 pt-16 text-white">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric-300">Careers</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold">Build what's next with us</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist-300">
            We hire for the roles we're actually filling — nothing more, nothing staged. When there are no open roles,
            we'll say so rather than keep a fake listing up.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          {vacancies.length === 0 ? (
            <div className="rounded-2xl border border-mist-200 bg-white px-6 py-16 text-center shadow-card">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric-100">
                <Icon name="users" className="h-7 w-7 text-electric-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-navy-900">No open positions right now</h2>
              <p className="mx-auto mt-2 max-w-md text-mist-600">
                We don't keep "talent pool" listings. When a real role opens — engineer, technician, analyst — it will
                appear on this page with a full description and application form.
              </p>
              <p className="mt-5 text-sm text-mist-500">
                You can still introduce yourself via the{" "}
                <Link href="/contact" className="font-semibold text-electric-700 underline underline-offset-2">contact page</Link>
                {" "}— just be aware we only respond properly when a genuine opening exists.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {vacancies.map((v) => (
                <Link key={v.id} href={`/careers/${v.slug}`} className="group block">
                  <Card className="p-6 transition-transform duration-300 group-hover:-translate-y-0.5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-display text-xl font-bold text-navy-900 transition-colors group-hover:text-electric-600">{v.title}</h2>
                        {v.summary ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-600 line-clamp-2">{v.summary}</p> : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge tone="blue">{employmentTypeLabel(v.employmentType)}</Badge>
                          {v.department ? <Badge tone="slate">{v.department}</Badge> : null}
                          {v.location ? <Badge tone="slate">{v.location}{v.remote ? " · Remote-friendly" : ""}</Badge> : null}
                        </div>
                      </div>
                      <div className="text-right">
                        {v.deadline ? <p className="text-xs font-semibold text-amber-600">Apply by {formatDate(v.deadline)}</p> : null}
                        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-600">
                          View & apply <Icon name="arrow-right" className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
