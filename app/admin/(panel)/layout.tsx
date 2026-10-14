import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

/**
 * Server-side guard for the whole dashboard. Every admin page renders through
 * this layout; API routes independently re-verify the session.
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentAdmin();
  if (!session) redirect("/admin/login");

  return <AdminShell adminName={session.admin.name} adminEmail={session.admin.email}>{children}</AdminShell>;
}
