"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner } from "./client-utils";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CURRENCIES } from "@/lib/constants";

export interface QuoteItemInput {
  description: string;
  quantity: string;
  unitPrice: string;
}

export interface QuoteFormData {
  inquiryId?: string;
  clientName: string;
  clientOrganisation: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  issueDate: string;
  expiryDate: string;
  currency: string;
  discountType: string;
  discountValue: string;
  taxRate: string;
  scopeOfWork: string;
  terms: string;
  notes: string;
  items: QuoteItemInput[];
}

const emptyItem: QuoteItemInput = { description: "", quantity: "1", unitPrice: "" };

export function QuotationEditor({
  mode,
  quoteId,
  initial,
  defaultTerms,
  prefillFromInquiry,
}: {
  mode: "create" | "edit";
  quoteId?: string;
  initial?: Partial<QuoteFormData>;
  defaultTerms: string;
  prefillFromInquiry?: { id: string; reference: string; name: string; organisation: string | null; email: string; phone: string | null } | null;
}) {
  const router = useRouter();
  const { busy, error, run } = useBusy();
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState<QuoteFormData>({
    inquiryId: initial?.inquiryId ?? prefillFromInquiry?.id ?? "",
    clientName: initial?.clientName ?? prefillFromInquiry?.name ?? "",
    clientOrganisation: initial?.clientOrganisation ?? prefillFromInquiry?.organisation ?? "",
    clientEmail: initial?.clientEmail ?? prefillFromInquiry?.email ?? "",
    clientPhone: initial?.clientPhone ?? prefillFromInquiry?.phone ?? "",
    clientAddress: initial?.clientAddress ?? "",
    issueDate: initial?.issueDate ?? today,
    expiryDate: initial?.expiryDate ?? "",
    currency: initial?.currency ?? "GHS",
    discountType: initial?.discountType ?? "",
    discountValue: initial?.discountValue ?? "",
    taxRate: initial?.taxRate ?? "",
    scopeOfWork: initial?.scopeOfWork ?? "",
    terms: initial?.terms ?? defaultTerms,
    notes: initial?.notes ?? "",
    items: initial?.items ?? [{ ...emptyItem }],
  });

  const set = (k: keyof QuoteFormData, v: unknown) => setF((prev) => ({ ...prev, [k]: v }));
  const setItem = (i: number, k: keyof QuoteItemInput, v: string) =>
    setF((prev) => ({ ...prev, items: prev.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));

  const totals = useMemo(() => {
    const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    const subtotal = round(f.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0));
    let discount = 0;
    const dv = Number(f.discountValue) || 0;
    if (f.discountType === "percent") discount = round(Math.min(100, dv) * subtotal / 100);
    if (f.discountType === "fixed") discount = round(Math.min(dv, subtotal));
    const tax = round(((Number(f.taxRate) || 0) * (subtotal - discount)) / 100);
    return { subtotal, discount, tax, total: round(subtotal - discount + tax) };
  }, [f.items, f.discountType, f.discountValue, f.taxRate]);

  const fmt = (n: number) => `${f.currency} ${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  async function save() {
    const items = f.items.filter((it) => it.description.trim());
    const payload = {
      inquiryId: f.inquiryId || undefined,
      clientName: f.clientName,
      clientOrganisation: f.clientOrganisation || undefined,
      clientEmail: f.clientEmail || undefined,
      clientPhone: f.clientPhone || undefined,
      clientAddress: f.clientAddress || undefined,
      issueDate: f.issueDate,
      expiryDate: f.expiryDate || undefined,
      currency: f.currency,
      discountType: f.discountType || undefined,
      discountValue: f.discountValue === "" ? undefined : f.discountValue,
      taxRate: f.taxRate === "" ? undefined : f.taxRate,
      scopeOfWork: f.scopeOfWork || undefined,
      terms: f.terms || undefined,
      notes: f.notes || undefined,
      items: items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
      })),
    };
    await run(
      () =>
        mode === "create"
          ? apiCall("/api/admin/quotations", "POST", payload)
          : apiCall(`/api/admin/quotations/${quoteId}`, "PATCH", payload),
      {
        onSuccess: (data) => {
          router.push(`/admin/quotations/${mode === "create" ? data?.id : quoteId}`);
          router.refresh();
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {prefillFromInquiry && !initial?.clientName ? (
        <p className="rounded-xl border border-electric-200 bg-electric-50 px-4 py-3 text-sm text-navy-900">
          Client details pre-filled from inquiry <strong className="font-mono">{prefillFromInquiry.reference}</strong> — the quotation will be linked to it.
        </p>
      ) : null}

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Client</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="q-name" required>Client name</Label><Input id="q-name" value={f.clientName} onChange={(e) => set("clientName", e.target.value)} maxLength={200} /></div>
          <div><Label htmlFor="q-org">Organisation</Label><Input id="q-org" value={f.clientOrganisation} onChange={(e) => set("clientOrganisation", e.target.value)} maxLength={200} /></div>
          <div><Label htmlFor="q-email">Email</Label><Input id="q-email" type="email" value={f.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} maxLength={320} /></div>
          <div><Label htmlFor="q-phone">Phone</Label><Input id="q-phone" value={f.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} maxLength={60} /></div>
          <div className="sm:col-span-2"><Label htmlFor="q-address">Address</Label><Input id="q-address" value={f.clientAddress} onChange={(e) => set("clientAddress", e.target.value)} maxLength={500} /></div>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Dates & currency</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label htmlFor="q-issue" required>Issue date</Label><Input id="q-issue" type="date" value={f.issueDate} onChange={(e) => set("issueDate", e.target.value)} required /></div>
          <div><Label htmlFor="q-expiry">Expiry date</Label><Input id="q-expiry" type="date" value={f.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} /></div>
          <div>
            <Label htmlFor="q-currency">Currency</Label>
            <Select id="q-currency" value={f.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-navy-900">Line items</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setF((p) => ({ ...p, items: [...p.items, { ...emptyItem }] }))}>
            <Icon name="plus" className="h-4 w-4" /> Add item
          </Button>
        </div>
        <div className="space-y-3">
          {f.items.map((item, i) => (
            <div key={i} className="grid gap-2.5 rounded-xl bg-mist-50 p-3.5 sm:grid-cols-[1fr_90px_140px_40px] sm:items-center">
              <Input placeholder="Description of work or item" aria-label={`Item ${i + 1} description`} value={item.description} onChange={(e) => setItem(i, "description", e.target.value)} maxLength={500} />
              <Input type="number" min="0" step="0.01" placeholder="Qty" aria-label={`Item ${i + 1} quantity`} value={item.quantity} onChange={(e) => setItem(i, "quantity", e.target.value)} />
              <Input type="number" min="0" step="0.01" placeholder="Unit price" aria-label={`Item ${i + 1} unit price`} value={item.unitPrice} onChange={(e) => setItem(i, "unitPrice", e.target.value)} />
              <button
                type="button"
                onClick={() => setF((p) => ({ ...p, items: p.items.length > 1 ? p.items.filter((_, j) => j !== i) : p.items }))}
                className="rounded-lg p-2 text-mist-400 transition-colors hover:bg-white hover:text-red-600"
                aria-label={`Remove item ${i + 1}`}
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="q-dtype">Discount</Label>
            <Select id="q-dtype" value={f.discountType} onChange={(e) => set("discountType", e.target.value)}>
              <option value="">None</option>
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="q-dval">Discount value</Label>
            <Input id="q-dval" type="number" min="0" step="0.01" value={f.discountValue} onChange={(e) => set("discountValue", e.target.value)} disabled={!f.discountType} />
          </div>
          <div>
            <Label htmlFor="q-tax">Tax rate (%)</Label>
            <Input id="q-tax" type="number" min="0" max="100" step="0.1" value={f.taxRate} onChange={(e) => set("taxRate", e.target.value)} placeholder="e.g. 21.9" />
          </div>
        </div>

        <div className="ml-auto mt-5 w-full max-w-xs space-y-1.5 rounded-xl bg-navy-900 p-4 text-sm text-white">
          <p className="flex justify-between"><span className="text-mist-300">Subtotal</span><span>{fmt(totals.subtotal)}</span></p>
          {totals.discount > 0 ? <p className="flex justify-between"><span className="text-mist-300">Discount</span><span>−{fmt(totals.discount)}</span></p> : null}
          {totals.tax > 0 ? <p className="flex justify-between"><span className="text-mist-300">Tax</span><span>{fmt(totals.tax)}</span></p> : null}
          <p className="flex justify-between border-t border-white/15 pt-1.5 font-display text-base font-bold"><span>Total</span><span>{fmt(totals.total)}</span></p>
          <p className="text-right text-[10px] text-mist-400">Totals are recomputed on the server — this is a preview.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Scope, terms & notes</h2>
        <div className="space-y-4">
          <div><Label htmlFor="q-scope">Scope of work</Label><Textarea id="q-scope" value={f.scopeOfWork} onChange={(e) => set("scopeOfWork", e.target.value)} rows={4} maxLength={6000} /></div>
          <div><Label htmlFor="q-terms">Terms & conditions</Label><Textarea id="q-terms" value={f.terms} onChange={(e) => set("terms", e.target.value)} rows={4} maxLength={6000} /></div>
          <div><Label htmlFor="q-notes">Internal notes <span className="font-normal text-mist-500">(not on the PDF)</span></Label><Textarea id="q-notes" value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={2} maxLength={3000} /></div>
        </div>
      </div>

      <ErrorBanner message={error} />
      <div className="flex gap-3">
        <Button onClick={save} disabled={busy || !f.clientName.trim() || !f.issueDate} size="lg">
          {busy ? "Saving…" : mode === "create" ? "Create draft quotation" : "Save draft"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
