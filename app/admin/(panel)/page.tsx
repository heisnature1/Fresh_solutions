import type { Metadata } from "next";
import Link from "next/link";
import { sql, eq, desc, and, inArray, gte } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, StatCard, Table, THead, Th, Td, RowLink, EmptyRow, InfoCard } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { repairStatusLabel, inquiryStatusLabel, ACTIVE_REPAIR_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { emailStatus } from "@/lib/email";
import { storageStatus } from "@/lib/storage";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

async function count(table: any, column: any, statuses?: string[]): Promise<Map<string, number>> {
  const db = await getDb();
  const rows = await db
    .select({ status: column, count: sql<number>`count(*)::int` })
    .from(table)
    .groupBy(column);
  return new Map(rows.map((r: any) => [r.status, r.count]));
}

export default async function AdminOverviewPage() {
  const db = await getDb();
  const [inq, rep, con, qt, projects, articles, vacancies, applications, testimonials] = await Promise.all([
    count(schema.inquiries, schema.inquiries.status),
    count(schema.repairRequests, schema.repairRequests.status),
    count(schema.consultations, schema.consultations.status),
    count(schema.quotations, schema.quotations.status),
    count(schema.portfolioProjects, schema.portfolioProjects.status),
    count(schema.articles, schema.articles.status),
    count(schema.vacancies, schema.vacancies.status),
    count(schema.applications, schema.applications.status),
    count(schema.testimonials, schema.testimonials.status),
  ]);

  const sum = (m: Map<string, number>) => Array.from(m.values()).reduce((a, b) => a + b, 0);
  const activeRepairs = (ACTIVE_REPAIR_STATUSES as readonly string[]).reduce((a, s) => a + (rep.get(s) ?? 0), 0);
  const outstandingQuotes = (qt.get("draft") ?? 0) + (qt.get("sent") ?? 0);

  const [recentActivity, recentInquiries, recentRepairs] = await Promise.all([
    db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(10),
    db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt)).limit(6),
    db
      .select()
      .from(schema.repairRequests)
      .orderBy(desc(schema.repairRequests.createdAt))
      .limit(6),
  ]);

  const email = emailStatus();
  const storage = storageStatus();
  const settings = await getSettings();

  return (
    <>
      <PageHeader title="Overview" description="Live figures from the database — nothing here is sample data." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total inquiries" value={sum(inq)} icon="inbox" href="/admin/inquiries" hint={`${inq.get("new") ?? 0} new`} />
        <StatCard label="Active repair jobs" value={activeRepairs} icon="tool" tone="amber" href="/admin/repairs" hint={`${sum(rep)} total`} />
        <StatCard label="Outstanding quotations" value={outstandingQuotes} icon="file-text" tone="purple" href="/admin/quotations" />
        <StatCard label="Pending consultations" value={con.get("pending") ?? 0} icon="calendar" tone="green" href="/admin/consultations" />
        <StatCard label="Published projects" value={projects.get("published") ?? 0} icon="layers" href="/admin/portfolio" />
        <StatCard label="Published articles" value={articles.get("published") ?? 0} icon="book" href="/admin/articles" />
        <StatCard label="Open vacancies" value={vacancies.get("published") ?? 0} icon="briefcase" href="/admin/careers" hint={`${applications.get("received") ?? 0} new applications`} />
        <StatCard label="Reviews awaiting moderation" value={testimonials.get("pending") ?? 0} icon="star" href="/admin/testimonials" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Recent inquiries */}
        <InfoCard title="Latest inquiries">
          <Table minWidth={520}>
            <THead>
              <Th>Reference</Th><Th>From</Th><Th>Type</Th><Th>Status</Th><Th>Received</Th>
            </THead>
            <tbody>
              {recentInquiries.length === 0 ? (
                <EmptyRow colSpan={5} message="No inquiries yet — they'll appear here the moment one arrives." />
              ) : (
                recentInquiries.map((i) => (
                  <tr key={i.id} className="transition-colors hover:bg-mist-50">
                    <Td><RowLink href={`/admin/inquiries/${i.id}`}>{i.reference}</RowLink></Td>
                    <Td>{i.name}</Td>
                    <Td className="capitalize">{i.kind.replace("_", " ")}</Td>
                    <Td><Badge tone={statusTone(i.status)}>{inquiryStatusLabel(i.status)}</Badge></Td>
                    <Td className="whitespace-nowrap text-xs">{formatDateTime(i.createdAt)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <Link href="/admin/inquiries" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-600">
            All inquiries <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </InfoCard>

        {/* Recent repairs */}
        <InfoCard title="Latest repair jobs">
          <Table minWidth={520}>
            <THead>
              <Th>Reference</Th><Th>Customer</Th><Th>Appliance</Th><Th>Status</Th><Th>Received</Th>
            </THead>
            <tbody>
              {recentRepairs.length === 0 ? (
                <EmptyRow colSpan={5} message="No repair requests yet — they'll appear here as soon as one is submitted." />
              ) : (
                recentRepairs.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-mist-50">
                    <Td><RowLink href={`/admin/repairs/${r.id}`}>{r.reference}</RowLink></Td>
                    <Td>{r.customerName}</Td>
                    <Td>{r.applianceType}</Td>
                    <Td><Badge tone={statusTone(r.status)}>{repairStatusLabel(r.status)}</Badge></Td>
                    <Td className="whitespace-nowrap text-xs">{formatDateTime(r.createdAt)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <Link href="/admin/repairs" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-600">
            All repairs <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </InfoCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Integration status — honest reporting */}
        <InfoCard title="Integration status">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Icon name={email.configured ? "check-circle" : "alert-triangle"} className={`mt-0.5 h-4.5 w-4.5 ${email.configured ? "text-emerald-500" : "text-amber-500"}`} />
              <div>
                <p className="font-semibold text-navy-900">Email {email.configured ? "configured" : "not configured"}</p>
                <p className="text-xs text-mist-500">{email.note}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Icon name={storage.configured ? "check-circle" : "alert-triangle"} className={`mt-0.5 h-4.5 w-4.5 ${storage.configured ? "text-emerald-500" : "text-amber-500"}`} />
              <div>
                <p className="font-semibold text-navy-900">File storage ({storage.driver})</p>
                <p className="text-xs text-mist-500">{storage.note}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Icon name={settings.contactWhatsapp ? "check-circle" : "info"} className={`mt-0.5 h-4.5 w-4.5 ${settings.contactWhatsapp ? "text-emerald-500" : "text-mist-400"}`} />
              <div>
                <p className="font-semibold text-navy-900">WhatsApp click-to-chat</p>
                <p className="text-xs text-mist-500">
                  {settings.contactWhatsapp
                    ? "Click-to-chat link is active. Automated WhatsApp messaging is not configured or claimed."
                    : "No WhatsApp number configured in Settings."}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Icon name={process.env.DATABASE_URL ? "check-circle" : "info"} className={`mt-0.5 h-4.5 w-4.5 ${process.env.DATABASE_URL ? "text-emerald-500" : "text-mist-400"}`} />
              <div>
                <p className="font-semibold text-navy-900">Database</p>
                <p className="text-xs text-mist-500">
                  {process.env.DATABASE_URL ? "Managed PostgreSQL via DATABASE_URL." : "Embedded local Postgres (development). Set DATABASE_URL for production."}
                </p>
              </div>
            </li>
          </ul>
        </InfoCard>

        {/* Recent activity */}
        <InfoCard title="Recent administrative activity">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-mist-500">No activity recorded yet.</p>
          ) : (
            <ol className="space-y-2.5 text-sm">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 border-b border-mist-100 pb-2.5 last:border-0">
                  <span className="text-mist-700">
                    <span className="font-semibold text-navy-900">{a.action}</span>
                    {a.entity ? <span className="text-mist-500"> · {a.entity}</span> : null}
                  </span>
                  <span className="whitespace-nowrap text-xs text-mist-400">{formatDateTime(a.createdAt)}</span>
                </li>
              ))}
            </ol>
          )}
        </InfoCard>
      </div>
    </>
  );
}
