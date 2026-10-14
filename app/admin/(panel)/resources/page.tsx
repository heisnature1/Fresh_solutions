import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader } from "@/components/admin/ui";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { publicFileUrl } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resources", robots: { index: false } };

function bytesLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminResourcesPage() {
  const db = await getDb();
  const rows = await db.select().from(schema.resources).orderBy(desc(schema.resources.createdAt)).limit(100);
  const withUrls = await Promise.all(
    rows.map(async (r) => ({ ...r, url: r.published ? await publicFileUrl(r.storageKey) : null })),
  );

  return (
    <>
      <PageHeader
        title="Resources"
        description="Downloadable guides and documents for the knowledge centre. Only published resources are visible publicly."
      />
      <ResourceManager
        resources={withUrls.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          originalName: r.originalName,
          sizeLabel: bytesLabel(r.sizeBytes),
          mimeType: r.mimeType,
          published: r.published,
          createdAt: formatDateTime(r.createdAt),
          url: r.url,
        }))}
      />
      {rows.length === 0 ? (
        <p className="mt-4 flex items-start gap-3 rounded-2xl border border-mist-200 bg-white p-5 text-sm text-mist-600 shadow-card">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
          No resources yet. Upload a guide, checklist or template above — it appears on the public Resources page the moment you publish it.
        </p>
      ) : null}
    </>
  );
}
