import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, InfoCard, DetailRow, Table, THead, Th, Td, EmptyRow } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { VacancyEditor } from "@/components/admin/VacancyEditor";
import { VacancyActions } from "@/components/admin/VacancyActions";
import { ApplicationManager } from "@/components/admin/ApplicationManager";
import { applicationStatusLabel, employmentTypeLabel } from "@/lib/constants";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vacancy", robots: { index: false } };

export default async function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const rows = await db.select().from(schema.vacancies).where(eq(schema.vacancies.id, id)).limit(1);
  if (!rows[0]) notFound();
  const vacancy = rows[0];

  const apps = await db
    .select()
    .from(schema.applications)
    .where(eq(schema.applications.vacancyId, id))
    .orderBy(desc(schema.applications.createdAt))
    .limit(200);

  return (
    <>
      <PageHeader
        title={vacancy.title}
        description={`Created ${formatDateTime(vacancy.createdAt)} · /careers/${vacancy.slug}`}
      />
      <VacancyActions vacancyId={vacancy.id} status={vacancy.status} slug={vacancy.slug} />

      <VacancyEditor
        mode="edit"
        vacancyId={vacancy.id}
        initial={{
          title: vacancy.title,
          slug: vacancy.slug,
          department: vacancy.department ?? "",
          employmentType: vacancy.employmentType,
          location: vacancy.location ?? "",
          remote: vacancy.remote,
          summary: vacancy.summary ?? "",
          responsibilities: vacancy.responsibilities ?? "",
          skills: vacancy.skills ?? "",
          qualifications: vacancy.qualifications ?? "",
          deadline: vacancy.deadline ?? "",
          status: vacancy.status,
        }}
      />

      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
          <Icon name="users" className="h-5 w-5 text-electric-600" /> Applications ({apps.length})
          <span className="text-sm font-normal text-mist-500">— CVs and cover letters are private; applicants never appear publicly</span>
        </h2>
        <div className="space-y-5">
          {apps.length === 0 ? (
            <p className="rounded-2xl border border-mist-200 bg-white p-6 text-sm text-mist-500 shadow-card">No applications received yet for this vacancy.</p>
          ) : (
            apps.map((a) => (
              <ApplicationManager
                key={a.id}
                application={{
                  id: a.id,
                  fullName: a.name,
                  email: a.email,
                  phone: a.phone,
                  statement: a.statement,
                  status: a.status,
                  interviewAt: a.interviewAt?.toISOString() ?? null,
                  interviewNotes: a.interviewNotes ?? "",
                  createdAt: a.createdAt.toISOString(),
                  cvName: a.cvOriginalName,
                  reference: a.reference,
                }}
                vacancyTitle={vacancy.title}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
