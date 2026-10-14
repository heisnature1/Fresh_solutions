import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section, Badge, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { getVacancyBySlug } from "@/lib/queries";
import { employmentTypeLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ApplicationForm } from "@/components/forms/ApplicationForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getVacancyBySlug(slug);
  if (!vacancy) return { title: "Not found" };
  return { title: `${vacancy.title} — Careers`, description: vacancy.summary ?? `Apply for ${vacancy.title} at Fresh Solutions.` };
}

export default async function VacancyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vacancy = await getVacancyBySlug(slug);
  if (!vacancy) notFound();

  const sections = [
    { label: "What you'll do", content: vacancy.responsibilities },
    { label: "Skills & tools", content: vacancy.skills },
    { label: "Qualifications", content: vacancy.qualifications },
  ].filter((s) => s.content && s.content.trim().length > 0);

  return (
    <>
      <Section className="bg-navy-950 pb-14 pt-16 text-white">
        <Container>
          <Link href="/careers" className="text-sm font-semibold text-mist-300 transition-colors hover:text-white">← All roles</Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge tone="blue">{employmentTypeLabel(vacancy.employmentType)}</Badge>
            {vacancy.department ? <span className="text-sm text-mist-300">{vacancy.department}</span> : null}
            {vacancy.location ? <span className="text-sm text-mist-300">{vacancy.location}{vacancy.remote ? " · Remote-friendly" : ""}</span> : null}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">{vacancy.title}</h1>
          {vacancy.deadline ? <p className="mt-4 text-sm font-semibold text-amber-300">Applications close {formatDate(vacancy.deadline)}</p> : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {vacancy.summary ? <p className="text-lg leading-relaxed text-mist-600">{vacancy.summary}</p> : null}
              <div className="mt-8 space-y-8">
                {sections.map((s) => (
                  <section key={s.label}>
                    <h2 className="mb-3 flex items-center gap-2.5 font-display text-xl font-bold text-navy-900">
                      <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-electric-600 to-electric-400" aria-hidden />
                      {s.label}
                    </h2>
                    <p className="whitespace-pre-line leading-relaxed text-mist-600">{s.content}</p>
                  </section>
                ))}
              </div>

              <Card id="apply" className="mt-10 border-electric-200 p-7">
                <h2 className="mb-1.5 font-display text-xl font-bold text-navy-900">Apply for this role</h2>
                <p className="mb-6 text-sm text-mist-600">
                  Your CV and cover note are submitted privately and handled securely — only the hiring team sees them.
                  We reply to applications that are a genuine match for the role.
                </p>
                <ApplicationForm vacancyId={vacancy.id} vacancyTitle={vacancy.title} />
              </Card>
            </div>

            <div>
              <div className="sticky top-24 space-y-5">
                <Card className="bg-navy-900 p-6 text-white">
                  <h2 className="font-display text-base font-bold">At a glance</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-mist-400">Role</dt><dd className="font-semibold">{vacancy.title}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-mist-400">Type</dt><dd className="font-semibold">{employmentTypeLabel(vacancy.employmentType)}</dd></div>
                    {vacancy.department ? <div className="flex justify-between gap-3"><dt className="text-mist-400">Department</dt><dd className="font-semibold">{vacancy.department}</dd></div> : null}
                    {vacancy.location ? <div className="flex justify-between gap-3"><dt className="text-mist-400">Location</dt><dd className="font-semibold">{vacancy.location}</dd></div> : null}
                    <div className="flex justify-between gap-3"><dt className="text-mist-400">Remote</dt><dd className="font-semibold">{vacancy.remote ? "Remote-friendly" : "On-site"}</dd></div>
                    {vacancy.deadline ? <div className="flex justify-between gap-3"><dt className="text-mist-400">Deadline</dt><dd className="font-semibold text-amber-300">{formatDate(vacancy.deadline)}</dd></div> : null}
                  </dl>
                  <a href="#apply" className="mt-5 block rounded-xl bg-electric-600 px-5 py-3 text-center text-sm font-bold transition-colors hover:bg-electric-500">
                    Apply now
                  </a>
                </Card>
                <div className="rounded-2xl border border-mist-200 bg-mist-50 p-5 text-sm text-mist-600">
                  <p className="flex items-start gap-2">
                    <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
                    We never advertise fake openings. If this role is listed, we are genuinely hiring for it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
