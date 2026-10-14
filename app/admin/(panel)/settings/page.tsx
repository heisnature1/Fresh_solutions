import type { Metadata } from "next";
import { PageHeader, InfoCard, DetailRow } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";
import { emailConfigured } from "@/lib/email";
import { storageStatus } from "@/lib/storage";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage() {
  const settings = await getSettings();
  const store = storageStatus();
  const emailOk = emailConfigured();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Everything on the public site is driven from here — change these instead of editing code."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <InfoCard title="Integration status">
            <dl className="divide-y divide-mist-100">
              <DetailRow
                label="Email (SMTP)"
                value={
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${emailOk ? "text-emerald-600" : "text-amber-600"}`}>
                    <Icon name={emailOk ? "check-circle" : "info"} className="h-4 w-4" />
                    {emailOk ? "Configured — emails will be sent" : "Not configured"}
                  </span>
                }
              />
              <DetailRow
                label="File storage"
                value={
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${store.configured ? "text-emerald-600" : "text-amber-600"}`}>
                    <Icon name={store.configured ? "check-circle" : "info"} className="h-4 w-4" />
                    {store.driver === "s3" ? "S3 object storage" : "Local object store (development)"}
                  </span>
                }
              />
              <DetailRow
                label="WhatsApp link"
                value={<span className="text-sm text-mist-600">{settings.contactWhatsapp ? `+Active (${settings.contactWhatsapp})` : "Hidden until a number is saved"}</span>}
              />
              <DetailRow
                label="Database"
                value={<span className="text-sm font-semibold text-emerald-600">Live — real data only</span>}
              />
            </dl>
            {!emailOk ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (and SMTP_FROM) in the environment to enable
                enquiry notifications and document emailing. Nothing here pretends email works when it doesn't.
              </p>
            ) : null}
            <p className="mt-3 text-xs leading-relaxed text-mist-400">
              Secrets live in environment variables, never in these settings — see .env.example for every option.
            </p>
          </InfoCard>
        </div>

        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
