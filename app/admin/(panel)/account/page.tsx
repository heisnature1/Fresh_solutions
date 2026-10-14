import type { Metadata } from "next";
import { PageHeader, InfoCard, DetailRow } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const session = await getCurrentAdmin();
  if (!session) return null; // layout redirects
  const admin = session.admin;

  return (
    <>
      <PageHeader title="Your account" description="Single-owner administration. There is exactly one admin account; protect it well." />
      <div className="grid gap-6 xl:grid-cols-2">
        <InfoCard title="Profile">
          <dl className="divide-y divide-mist-100">
            <DetailRow label="Name" value={admin.name} />
            <DetailRow label="Email" value={admin.email} />
            <DetailRow label="Role" value="Site administrator" />
          </dl>
          <p className="mt-4 rounded-xl bg-mist-50 px-4 py-3 text-xs leading-relaxed text-mist-600">
            To change the registered name or email, run the secure provisioning command again on the server:
            <code className="mx-1 rounded bg-mist-200 px-1.5 py-0.5 text-[11px]">npm run provision:admin</code>
          </p>
        </InfoCard>
        <PasswordForm />
      </div>
    </>
  );
}
