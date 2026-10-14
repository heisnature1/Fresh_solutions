import { PdfBuilder } from "./common";
import { formatMoney, formatDate } from "../utils";
import { repairStatusLabel, applianceCategoryLabel } from "../constants";
import type { schema } from "../db/client";

/**
 * Server-side document generation. Monetary totals are recomputed here from
 * the stored line items (never trusting a client-supplied grand total).
 */

type Quotation = typeof schema.quotations.$inferSelect;
type QuotationItem = typeof schema.quotationItems.$inferSelect;
type Proposal = typeof schema.proposals.$inferSelect;
type Repair = typeof schema.repairRequests.$inferSelect;
type RepairPart = typeof schema.repairParts.$inferSelect;

export function computeQuoteTotals(
  items: Array<{ quantity: string; unitPrice: string }>,
  discountType: string | null,
  discountValue: string | null,
  taxRate: string | null,
): { subtotal: number; discount: number; tax: number; total: number } {
  const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  const subtotal = round(
    items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0),
  );
  let discount = 0;
  if (discountType && discountValue) {
    const dv = Number(discountValue);
    if (Number.isFinite(dv) && dv > 0) {
      discount = discountType === "percent" ? round((subtotal * Math.min(dv, 100)) / 100) : round(Math.min(dv, subtotal));
    }
  }
  const afterDiscount = subtotal - discount;
  const rate = taxRate ? Number(taxRate) : 0;
  const tax = Number.isFinite(rate) && rate > 0 ? round((afterDiscount * rate) / 100) : 0;
  return { subtotal, discount, tax, total: round(afterDiscount + tax) };
}

interface CompanyInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
}

export async function buildQuotationPdf(
  quote: Quotation,
  items: QuotationItem[],
  company: CompanyInfo,
): Promise<Uint8Array> {
  const pdf = await PdfBuilder.create({ docTitle: `Quotation ${quote.quoteNumber}`, company });
  await pdf.header("Quotation", "QUOTATION NO.", quote.quoteNumber, "ISSUE DATE", formatDate(quote.issueDate));

  pdf.sectionLabel("Prepared for");
  pdf.kvGrid([
    [
      ["Client", quote.clientName],
      ["Organisation", quote.clientOrganisation ?? ""],
    ],
    [
      ["Email", quote.clientEmail ?? ""],
      ["Phone", quote.clientPhone ?? ""],
    ],
    ...(quote.clientAddress ? [[["Address", quote.clientAddress] as [string, string]]] : []),
    [
      ["Valid until", quote.expiryDate ? formatDate(quote.expiryDate) : "On request"],
      ["Currency", quote.currency],
    ],
  ] as [string, string][][]);

  pdf.sectionLabel("Itemised costs");
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  pdf.table(
    [
      { header: "Description", width: 52 },
      { header: "Qty", width: 10, align: "right" },
      { header: "Unit price", width: 19, align: "right" },
      { header: "Amount", width: 19, align: "right" },
    ],
    sorted.map((it) => [
      it.description,
      String(Number(it.quantity)),
      formatMoney(it.unitPrice, quote.currency),
      formatMoney(Number(it.quantity) * Number(it.unitPrice), quote.currency),
    ]),
  );

  const totals = computeQuoteTotals(sorted, quote.discountType, quote.discountValue, quote.taxRate);
  const rows: [string, string][] = [["Subtotal", formatMoney(totals.subtotal, quote.currency)]];
  if (totals.discount > 0) {
    rows.push([
      quote.discountType === "percent" ? `Discount (${Number(quote.discountValue)}%)` : "Discount",
      `−${formatMoney(totals.discount, quote.currency)}`,
    ]);
  }
  if (totals.tax > 0) rows.push([`Tax (${Number(quote.taxRate)}%)`, formatMoney(totals.tax, quote.currency)]);
  pdf.totalsBox(rows, ["TOTAL", formatMoney(totals.total, quote.currency)], `All amounts in ${quote.currency}.`);

  if (quote.scopeOfWork?.trim()) {
    pdf.sectionLabel("Scope of work");
    pdf.paragraph(quote.scopeOfWork);
  }
  if (quote.terms?.trim()) {
    pdf.sectionLabel("Terms & conditions");
    pdf.paragraph(quote.terms);
  }
  if (quote.notes?.trim()) {
    pdf.sectionLabel("Notes");
    pdf.paragraph(quote.notes);
  }

  return pdf.build(`Quotation ${quote.quoteNumber} · Valid until ${quote.expiryDate ? formatDate(quote.expiryDate) : "further notice"}`);
}

export async function buildProposalPdf(
  proposal: Proposal,
  company: CompanyInfo,
): Promise<Uint8Array> {
  const pdf = await PdfBuilder.create({ docTitle: `Proposal ${proposal.proposalNumber}`, company });
  await pdf.header("Project Proposal", "PROPOSAL NO.", proposal.proposalNumber, "DATE", formatDate(proposal.createdAt));

  pdf.sectionLabel("Prepared for");
  pdf.kvGrid([
    [
      ["Client", proposal.clientName],
      ["Organisation", proposal.clientOrganisation ?? ""],
    ],
    [
      ["Proposal", proposal.title],
      ["Validity", `${proposal.validityDays ?? 30} days`],
    ],
  ]);

  const sections: Array<[string, string | null]> = [
    ["Executive summary", proposal.executiveSummary],
    ["Your requirements", proposal.requirements],
    ["Proposed solution", proposal.solution],
    ["Scope of work", proposal.scopeOfWork],
    ["Deliverables", proposal.deliverables],
    ["Project milestones", proposal.milestones],
    ["Estimated timeline", proposal.timeline],
    [`Pricing (${proposal.currency})`, proposal.pricing],
    ["Assumptions", proposal.assumptions],
    ["Exclusions", proposal.exclusions],
    ["Terms & conditions", proposal.terms],
  ];
  for (const [label, content] of sections) {
    if (content?.trim()) {
      pdf.sectionLabel(label);
      pdf.paragraph(content);
    }
  }

  return pdf.build(`Proposal ${proposal.proposalNumber}`);
}

export async function buildJobCardPdf(
  repair: Repair,
  parts: RepairPart[],
  company: CompanyInfo,
  footerNote: string,
): Promise<Uint8Array> {
  const pdf = await PdfBuilder.create({ docTitle: `Repair Job Card ${repair.reference}`, company });
  await pdf.header("Repair Job Card", "REPAIR REF.", repair.reference, "RECEIVED", formatDate(repair.createdAt));

  pdf.sectionLabel("Customer");
  pdf.kvGrid([
    [
      ["Name", repair.customerName],
      ["Phone", repair.phone],
    ],
    [
      ["Email", repair.email ?? ""],
      ["Preferred contact", repair.preferredContact ?? "phone"],
    ],
  ]);

  pdf.sectionLabel("Appliance");
  pdf.kvGrid([
    [
      ["Category", applianceCategoryLabel(repair.applianceCategory)],
      ["Appliance", repair.applianceType],
    ],
    [
      ["Brand", repair.brand ?? ""],
      ["Model", repair.model ?? ""],
    ],
    [
      ["Powers on", repair.powersOn ?? "unknown"],
      ["Fault started", repair.faultStarted ?? ""],
    ],
  ]);

  pdf.sectionLabel("Reported fault");
  pdf.paragraph(repair.faultDescription);

  pdf.sectionLabel("Diagnosis");
  pdf.paragraph(repair.diagnosis?.trim() ? repair.diagnosis : "Pending diagnosis.");

  if (repair.estimatedCost) {
    pdf.sectionLabel("Estimate");
    pdf.kvGrid([
      [
        ["Estimated cost", formatMoney(repair.estimatedCost, "GHS")],
        ["Customer approval", repair.estimateApproved === true ? "Approved" : repair.estimateApproved === false ? "Declined" : "Pending"],
      ],
    ]);
    pdf.paragraph("Final pricing depends on inspection findings and parts availability.", { size: 8.5 });
  }

  if (parts.length > 0) {
    pdf.sectionLabel("Parts");
    pdf.table(
      [
        { header: "Part", width: 46 },
        { header: "Qty", width: 12, align: "right" },
        { header: "Unit cost", width: 21, align: "right" },
        { header: "Status", width: 21, align: "right" },
      ],
      parts.map((p) => [p.name, String(Number(p.quantity)), p.unitCost ? formatMoney(p.unitCost, "GHS") : "—", p.status]),
    );
  }

  if (repair.workPerformed?.trim()) {
    pdf.sectionLabel("Repair work performed");
    pdf.paragraph(repair.workPerformed);
  }
  if (repair.testingResults?.trim()) {
    pdf.sectionLabel("Testing & quality check");
    pdf.paragraph(repair.testingResults);
  }

  pdf.sectionLabel("Status & completion");
  pdf.kvGrid([
    [
      ["Status", repairStatusLabel(repair.status)],
      ["Completed", repair.completedAt ? formatDate(repair.completedAt) : "—"],
    ],
    [["Technician", repair.technician ?? ""], ["", ""]],
  ]);

  if (repair.warrantyTerms?.trim()) {
    pdf.sectionLabel("Warranty (as approved by Fresh Solutions)");
    pdf.paragraph(repair.warrantyTerms);
  }

  // Signature block
  pdf.space(20);
  pdf.kvGrid([
    [
      ["Customer signature", ""],
      ["Date", ""],
    ],
  ]);
  pdf.space(18);

  return pdf.build(footerNote || `Job card ${repair.reference}`);
}
