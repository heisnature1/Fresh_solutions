import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialCard } from "@/components/admin/TestimonialCard";
import { TestimonialCreateForm } from "@/components/admin/TestimonialCreateForm";
import { emailConfigured } from "@/lib/email";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Testimonials", robots: { index: false } };

export default async function TestimonialsPage() {
  const db = await getDb();
  const rows = await db.select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt)).limit(200);
  const approved = rows.filter((t) => t.status === "approved").length;
  const pending = rows.filter((t) => t.status === "pending").length;

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Only approved testimonials appear publicly. Approving a customer-submitted review requires recording consent first — nothing is ever fabricated."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Approved (live)", value: approved, tone: "text-emerald-600" },
          { label: "Pending moderation", value: pending, tone: "text-amber-600" },
          { label: "Total recorded", value: rows.length, tone: "text-navy-900" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card">
            <p className="text-[13px] font-semibold text-mist-500">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mb-6 flex items-start gap-3 rounded-2xl border border-mist-200 bg-white p-5 text-sm text-mist-600 shadow-card">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
          No testimonials yet — the public site hides the testimonials section entirely rather than showing placeholder reviews. Add one below only when a real client has given you feedback you are allowed to quote, and record their consent.
        </p>
      ) : null}

      <div className="mb-8 rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-navy-900">
          <Icon name="plus" className="h-4 w-4 text-electric-600" /> Record a client testimonial
        </h2>
        <p className="mb-4 text-sm text-mist-500">
          For feedback a client gave you directly (in person, by email, on WhatsApp). You must confirm the client's
          consent before it is saved — the record is timestamped in the audit log.
        </p>
        <TestimonialCreateForm />
      </div>

      <div className="space-y-4">
        {rows.map((t) => (
          <TestimonialCard
            key={t.id}
            testimonial={{
              id: t.id,
              name: t.name,
              role: t.role,
              organisation: t.organisation,
              content: t.content,
              rating: t.rating,
              status: t.status,
              source: t.source,
              featured: t.featured,
              consentRecorded: t.consentRecorded,
              consentNote: t.consentNote,
              createdAt: t.createdAt.toISOString(),
            }}
          />
        ))}
      </div>
    </>
  );
}
