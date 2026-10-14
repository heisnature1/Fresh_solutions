import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { VacancyEditor } from "@/components/admin/VacancyEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New vacancy", robots: { index: false } };

export default function NewVacancyPage() {
  return (
    <>
      <PageHeader title="New vacancy" description="Post only real, funded openings. Vacancies stay draft until you publish them." />
      <VacancyEditor
        mode="create"
        initial={{
          title: "", slug: "", department: "", employmentType: "", location: "", remote: false,
          summary: "", responsibilities: "", skills: "", qualifications: "", deadline: "", status: "draft",
        }}
      />
    </>
  );
}
