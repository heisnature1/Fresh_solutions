import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { PortfolioEditor } from "@/components/admin/PortfolioEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New project", robots: { index: false } };

export default function NewPortfolioPage() {
  return (
    <>
      <PageHeader
        title="New portfolio project"
        description="Describe real, completed work only — no invented clients, figures, or testimonials."
      />
      <PortfolioEditor
        mode="create"
        initial={{
          status: "draft",
          title: "",
          slug: "",
          summary: "",
          description: "",
          problem: "",
          solution: "",
          deliverables: "",
          results: "",
          technologies: "",
          category: "",
          industry: "",
          liveUrl: "",
          externalUrl: "",
          featured: false,
        }}
      />
    </>
  );
}
