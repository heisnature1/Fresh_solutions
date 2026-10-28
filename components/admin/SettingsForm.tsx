"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Input, Label, Textarea } from "@/components/ui";
import type { SiteSettings } from "@/lib/settings";

type Group = "company" | "documents" | "legal";

const GROUPS: Array<{ id: Group; label: string }> = [
  { id: "company", label: "Company & contact" },
  { id: "documents", label: "Documents & branding" },
  { id: "legal", label: "Legal pages" },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [group, setGroup] = useState<Group>("company");
  const [f, setF] = useState(() => ({
    ...settings,
    socialFacebook: settings.social.facebook ?? "",
    socialInstagram: settings.social.instagram ?? "",
    socialLinkedin: settings.social.linkedin ?? "",
    socialX: settings.social.x ?? "",
    socialYoutube: settings.social.youtube ?? "",
    socialTiktok: settings.social.tiktok ?? "",
    socialGithub: settings.social.github ?? "",
  }));

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    const payload: Record<string, unknown> = { group };
    if (group === "company") {
      Object.assign(payload, {
        companyDescription: f.companyDescription,
        contactEmail: f.contactEmail,
        contactPhone: f.contactPhone,
        contactWhatsapp: f.contactWhatsapp,
        contactLocation: f.contactLocation,
        businessHours: f.businessHours,
        socialFacebook: f.socialFacebook ?? "",
        socialInstagram: f.socialInstagram ?? "",
        socialLinkedin: f.socialLinkedin ?? "",
        socialX: f.socialX ?? "",
        socialYoutube: f.socialYoutube ?? "",
        socialTiktok: f.socialTiktok ?? "",
        socialGithub: f.socialGithub ?? "",
        homeHeroHeadline: f.homeHeroHeadline,
        homeHeroSubtext: f.homeHeroSubtext,
        seoTitleSuffix: f.seoTitleSuffix,
        seoDefaultDescription: f.seoDefaultDescription,
        notifyEmail: f.notifyEmail,
      });
    } else if (group === "documents") {
      Object.assign(payload, {
        defaultCurrency: f.defaultCurrency,
        quoteTerms: f.quoteTerms,
        jobCardFooter: f.jobCardFooter,
      });
    } else {
      Object.assign(payload, { legalPrivacy: f.legalPrivacy, legalTerms: f.legalTerms });
    }
    await run(() => apiCall("/api/admin/settings", "POST", payload), {
      onSuccess: (data) => router.refresh(),
    });
  }

  return (
    <div className="rounded-2xl border border-mist-200 bg-white shadow-card">
      <div className="flex flex-wrap gap-1 border-b border-mist-200 p-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroup(g.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${group === g.id ? "bg-navy-900 text-white" : "text-mist-600 hover:bg-mist-100 hover:text-navy-900"}`}
            aria-pressed={group === g.id}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {group === "company" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="s-email">Public contact email</Label><Input id="s-email" type="email" value={f.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} maxLength={320} placeholder="hello@yourcompany.com" /></div>
              <div><Label htmlFor="s-phone">Public telephone</Label><Input id="s-phone" value={f.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} maxLength={40} placeholder="+233 30 000 0000" /></div>
              <div><Label htmlFor="s-wa">WhatsApp number <span className="font-normal text-mist-500">(international format — enables chat buttons)</span></Label><Input id="s-wa" value={f.contactWhatsapp} onChange={(e) => set("contactWhatsapp", e.target.value)} maxLength={30} placeholder="+233 24 000 0000" /></div>
              <div><Label htmlFor="s-notify">Notification inbox <span className="font-normal text-mist-500">(receives copy of new enquiries)</span></Label><Input id="s-notify" type="email" value={f.notifyEmail} onChange={(e) => set("notifyEmail", e.target.value)} maxLength={320} /></div>
              <div><Label htmlFor="s-loc">Office location</Label><Input id="s-loc" value={f.contactLocation} onChange={(e) => set("contactLocation", e.target.value)} maxLength={200} placeholder="e.g. Accra, Ghana" /></div>
              <div><Label htmlFor="s-hours">Business hours</Label><Input id="s-hours" value={f.businessHours} onChange={(e) => set("businessHours", e.target.value)} maxLength={200} placeholder="e.g. Mon–Fri, 8:30am–5:30pm" /></div>
              <div className="sm:col-span-2"><Label htmlFor="s-desc">Company description <span className="font-normal text-mist-500">(footer + about)</span></Label><Textarea id="s-desc" value={f.companyDescription} onChange={(e) => set("companyDescription", e.target.value)} rows={3} maxLength={2000} /></div>
              <div><Label htmlFor="s-hero">Homepage headline</Label><Input id="s-hero" value={f.homeHeroHeadline} onChange={(e) => set("homeHeroHeadline", e.target.value)} maxLength={200} /></div>
              <div><Label htmlFor="s-herosub">Homepage subtext</Label><Textarea id="s-herosub" value={f.homeHeroSubtext} onChange={(e) => set("homeHeroSubtext", e.target.value)} rows={2} maxLength={500} /></div>
              <div><Label htmlFor="s-seosuf">SEO title suffix</Label><Input id="s-seosuf" value={f.seoTitleSuffix} onChange={(e) => set("seoTitleSuffix", e.target.value)} maxLength={100} /></div>
              <div><Label htmlFor="s-seodesc">Default SEO description</Label><Textarea id="s-seodesc" value={f.seoDefaultDescription} onChange={(e) => set("seoDefaultDescription", e.target.value)} rows={2} maxLength={300} /></div>
            </div>
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-navy-900">Social links <span className="font-normal text-mist-500">(only filled ones are shown)</span></legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["socialFacebook", "Facebook"], ["socialInstagram", "Instagram"], ["socialLinkedin", "LinkedIn"],
                  ["socialX", "X (Twitter)"], ["socialYoutube", "YouTube"], ["socialTiktok", "TikTok"], ["socialGithub", "GitHub"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <Label htmlFor={`sl-${key}`}>{label} URL</Label>
                    <Input id={`sl-${key}`} type="url" value={(f as unknown as Record<string, string>)[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder="https://…" maxLength={500} />
                  </div>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}

        {group === "documents" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="s-cur">Default currency</Label>
                <Input id="s-cur" value={f.defaultCurrency} onChange={(e) => set("defaultCurrency", e.target.value.toUpperCase().slice(0, 3))} maxLength={3} />
                <p className="mt-1 text-xs text-mist-500">ISO code, e.g. GHS. Used for new quotations and repair estimates.</p>
              </div>
            </div>
            <div>
              <Label htmlFor="s-terms">Default quotation terms & conditions</Label>
              <Textarea id="s-terms" value={f.quoteTerms} onChange={(e) => set("quoteTerms", e.target.value)} rows={6} maxLength={6000} />
              <p className="mt-1 text-xs text-mist-500">Pre-filled on every new quotation; editable per document.</p>
            </div>
            <div>
              <Label htmlFor="s-footer">Job card footer line</Label>
              <Input id="s-footer" value={f.jobCardFooter} onChange={(e) => set("jobCardFooter", e.target.value)} maxLength={300} />
            </div>
            <p className="rounded-xl bg-mist-50 px-4 py-3 text-xs leading-relaxed text-mist-600">
              Logo: the official Fresh Solutions logo is included in the website and documents. Brand assets are managed in /public/brand.
            </p>
          </>
        ) : null}

        {group === "legal" ? (
          <>
            <div>
              <Label htmlFor="s-privacy">Privacy policy content</Label>
              <Textarea id="s-privacy" value={f.legalPrivacy} onChange={(e) => set("legalPrivacy", e.target.value)} rows={10} maxLength={60000} placeholder="Paste your real privacy policy. Until you save one, the public page shows a default template marked as a template." />
            </div>
            <div>
              <Label htmlFor="s-terms2">Terms of service content</Label>
              <Textarea id="s-terms2" value={f.legalTerms} onChange={(e) => set("legalTerms", e.target.value)} rows={10} maxLength={60000} placeholder="Paste your real terms of service." />
            </div>
            <p className="rounded-xl bg-mist-50 px-4 py-3 text-xs leading-relaxed text-mist-600">
              Empty fields mean the site displays clearly-labelled default templates, with a visible note that they are
              templates to be replaced with your reviewed documents. Never ship legal pages you haven't written.
            </p>
          </>
        ) : null}

        <div className="space-y-3 border-t border-mist-100 pt-5">
          <ErrorBanner message={error} />
          <NoticeBanner message={notice} />
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save this section"}</Button>
        </div>
      </div>
    </div>
  );
}
