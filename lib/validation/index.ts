import { z } from "zod";

/**
 * Shared validation schemas. The same schemas validate on the server (always)
 * and can power client-side hints. Every string is trimmed and length-capped.
 */

const str = (max: number, label = "This field") =>
  z.string().trim().max(max, `${label} is too long (maximum ${max} characters).`);

const req = (max: number, label = "This field") =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} is too long (maximum ${max} characters).`);

const email = z.string().trim().toLowerCase().max(320).email("Enter a valid email address.");
const optionalEmail = z.union([z.literal(""), email]).optional();

const phone = z
  .string()
  .trim()
  .max(40)
  .regex(/^[+\d][\d\s().-]{5,39}$/, "Enter a valid telephone number.")
  .optional()
  .or(z.literal(""));

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD date format.")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a real date.");

/** Honeypot: bots fill it, humans never see it. Must be empty. */
const honey = z.string().max(0).optional().or(z.literal(""));

const money = z.coerce
  .number({ invalid_type_error: "Enter a number." })
  .min(0, "Amount cannot be negative.")
  .max(1_000_000_000, "Amount is unrealistically large.")
  .multipleOf(0.01, "Use at most two decimal places.");

// ---------------------------------------------------------------------------
// Public forms
// ---------------------------------------------------------------------------

export const serviceSlugs = z.array(z.string().trim().min(1).max(80)).max(15);

export const contactSchema = z.object({
  kind: z.literal("contact"),
  name: req(200, "Name"),
  organisation: str(200, "Organisation").optional(),
  email,
  phone,
  preferredContact: z.enum(["email", "phone", "whatsapp"]).optional(),
  subject: req(300, "Subject"),
  message: req(5000, "Message"),
  website: honey,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const inquirySchema = z.object({
  kind: z.enum(["project", "quotation"]),
  services: serviceSlugs.min(1, "Select at least one service."),
  title: req(300, "Project title"),
  problem: str(3000, "Problem description").optional(),
  description: str(6000, "Project description").optional(),
  deliverables: str(3000, "Expected deliverables").optional(),
  requirements: str(3000, "Additional requirements").optional(),
  budget: str(60, "Budget range").optional(),
  timeline: str(60, "Timeline").optional(),
  orgType: str(60, "Organisation type").optional(),
  consultMethod: str(60, "Consultation method").optional(),
  name: req(200, "Name"),
  organisation: str(200, "Organisation").optional(),
  email,
  phone,
  preferredContact: z.enum(["email", "phone", "whatsapp"]).optional(),
  website: honey,
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const consultationSchema = z.object({
  name: req(200, "Name"),
  email,
  phone,
  topic: req(300, "Topic"),
  preferredWindow: req(200, "Preferred date or time window"),
  method: z.enum(["video", "phone", "in_person", "any"]).optional(),
  message: str(3000, "Message").optional(),
  website: honey,
});
export type ConsultationInput = z.infer<typeof consultationSchema>;

export const repairRequestSchema = z.object({
  customerName: req(200, "Your name"),
  phone: z
    .string()
    .trim()
    .min(6, "Telephone number is required.")
    .max(40)
    .regex(/^[+\d][\d\s().-]{5,39}$/, "Enter a valid telephone number."),
  email: optionalEmail,
  preferredContact: z.enum(["email", "phone", "whatsapp"]).optional(),
  applianceCategory: z.enum(["mobile_phone", "laptop_computer", "kettle_small_appliance", "other"]),
  applianceType: req(120, "Appliance type"),
  brand: str(120, "Brand").optional(),
  model: str(120, "Model").optional(),
  faultDescription: req(5000, "Fault description"),
  faultStarted: str(60, "When the fault started").optional(),
  powersOn: z.enum(["yes", "no", "unknown", "na"]).optional(),
  preferredDate: str(60, "Preferred service date").optional(),
  additionalInfo: str(3000, "Additional information").optional(),
  website: honey,
});
export type RepairRequestInput = z.infer<typeof repairRequestSchema>;

export const repairTrackSchema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^REP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Enter the full repair reference (e.g. REP-XXXX-XXXX-XXXX)."),
  code: z.string().trim().toUpperCase().min(6, "Enter the access code from your confirmation.").max(12),
});

export const applicationSchema = z.object({
  vacancyId: z.string().uuid("Invalid vacancy."),
  name: req(200, "Name"),
  email,
  phone: z
    .string()
    .trim()
    .min(6, "Telephone number is required.")
    .max(40)
    .regex(/^[+\d][\d\s().-]{5,39}$/, "Enter a valid telephone number."),
  statement: str(6000, "Your statement").optional(),
  website: honey,
});
export type ApplicationInput = z.infer<typeof applicationSchema>;

export const reviewSchema = z.object({
  name: req(200, "Name"),
  organisation: str(200, "Organisation").optional(),
  role: str(200, "Role").optional(),
  content: req(1500, "Your review"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  website: honey,
});

// ---------------------------------------------------------------------------
// Admin schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(200),
  newPassword: z.string().min(12, "New password must be at least 12 characters.").max(200),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(["new", "in_review", "quoted", "proposal_sent", "accepted", "declined", "closed", "spam"]),
  note: str(2000, "Note").optional(),
});

export const consultationUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "declined", "completed", "cancelled"]),
  confirmedAt: z.union([z.literal(""), isoDate]).optional(),
  confirmedTime: str(30).optional(),
  adminNotes: str(3000, "Notes").optional(),
});

export const repairAdminUpdateSchema = z.object({
  status: z.enum([
    "new", "awaiting_review", "awaiting_inspection", "diagnosis_in_progress",
    "awaiting_customer_approval", "awaiting_parts", "repair_in_progress", "testing",
    "ready", "completed", "unable_to_repair", "cancelled",
  ]).optional(),
  technician: str(200, "Technician").optional(),
  diagnosis: str(5000, "Diagnosis").optional(),
  estimatedCost: z.union([z.literal(""), money]).optional(),
  estimateApproved: z.coerce.boolean().optional(),
  workPerformed: str(5000, "Work performed").optional(),
  testingResults: str(5000, "Testing results").optional(),
  warrantyTerms: str(2000, "Warranty terms").optional(),
  statusNote: str(1000, "Status note").optional(),
  note: str(2000, "Note").optional(),
  noteKind: z.enum(["note", "diagnosis", "customer_communication"]).optional(),
});

export const repairPartSchema = z.object({
  name: req(300, "Part name"),
  quantity: money,
  unitCost: z.union([z.literal(""), money]).optional(),
  status: z.enum(["needed", "ordered", "received", "used"]).optional(),
});

export const quotationItemSchema = z.object({
  description: req(500, "Item description"),
  quantity: money.refine((v) => v > 0, "Quantity must be greater than zero."),
  unitPrice: money,
});

export const quotationSchema = z.object({
  inquiryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  clientName: req(200, "Client name"),
  clientOrganisation: str(200, "Client organisation").optional(),
  clientEmail: optionalEmail,
  clientPhone: str(60, "Client phone").optional(),
  clientAddress: str(500, "Client address").optional(),
  issueDate: isoDate,
  expiryDate: z.union([z.literal(""), isoDate]).optional(),
  currency: z.string().trim().length(3, "Use a 3-letter currency code (e.g. GHS).").toUpperCase(),
  discountType: z.union([z.literal(""), z.enum(["percent", "fixed"])]).optional(),
  discountValue: z.union([z.literal(""), money]).optional(),
  taxRate: z.union([z.literal(""), z.coerce.number().min(0).max(100, "Tax rate must be between 0 and 100%.")]).optional(),
  scopeOfWork: str(6000, "Scope of work").optional(),
  terms: str(6000, "Terms").optional(),
  notes: str(3000, "Notes").optional(),
  items: z.array(quotationItemSchema).max(100, "Too many line items."),
});
export type QuotationInput = z.infer<typeof quotationSchema>;

export const proposalSchema = z.object({
  inquiryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  clientName: req(200, "Client name"),
  clientOrganisation: str(200, "Client organisation").optional(),
  clientEmail: optionalEmail,
  title: req(300, "Proposal title"),
  executiveSummary: str(6000).optional(),
  requirements: str(6000).optional(),
  solution: str(8000).optional(),
  scopeOfWork: str(8000).optional(),
  deliverables: str(6000).optional(),
  milestones: str(6000).optional(),
  timeline: str(3000).optional(),
  pricing: str(6000).optional(),
  assumptions: str(6000).optional(),
  exclusions: str(6000).optional(),
  terms: str(6000).optional(),
  validityDays: z.coerce.number().int().min(1).max(365).optional(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
});
export type ProposalInput = z.infer<typeof proposalSchema>;

export const portfolioSchema = z.object({
  title: req(300, "Title"),
  slug: str(200, "Slug").optional(),
  summary: str(600, "Summary").optional(),
  description: str(10000, "Description").optional(),
  problem: str(6000, "Problem").optional(),
  solution: str(6000, "Solution").optional(),
  technologies: z.array(z.string().trim().min(1).max(60)).max(40).optional(),
  deliverables: str(6000).optional(),
  results: str(6000, "Results").optional(),
  category: str(80, "Category").optional(),
  industry: str(80, "Industry").optional(),
  liveUrl: z.union([z.literal(""), z.string().trim().url("Enter a valid URL (https://…).")]).optional(),
  externalUrl: z.union([z.literal(""), z.string().trim().url("Enter a valid URL (https://…).")]).optional(),
  featured: z.coerce.boolean().optional(),
});

export const articleSchema = z.object({
  title: req(300, "Title"),
  slug: str(220, "Slug").optional(),
  excerpt: str(600, "Excerpt").optional(),
  content: str(60000, "Content"),
  categoryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  tagsCsv: str(500, "Tags").optional(),
  authorName: str(200, "Author").optional(),
  featured: z.coerce.boolean().optional(),
  seoTitle: str(300, "SEO title").optional(),
  seoDescription: str(400, "SEO description").optional(),
  scheduledAt: z.union([z.literal(""), isoDate]).optional(),
});

export const categorySchema = z.object({
  name: req(120, "Category name"),
  slug: str(140, "Slug").optional(),
});

export const vacancySchema = z.object({
  title: req(200, "Job title"),
  slug: str(220, "Slug").optional(),
  department: str(120, "Department").optional(),
  employmentType: z.enum([
    "full_time", "part_time", "contract", "internship",
    "industrial_attachment", "national_service", "trainee",
  ]),
  location: str(200, "Location").optional(),
  remote: z.coerce.boolean().optional(),
  summary: str(1000, "Summary").optional(),
  responsibilities: str(8000, "Responsibilities").optional(),
  skills: str(6000, "Skills").optional(),
  qualifications: str(6000, "Qualifications").optional(),
  deadline: z.union([z.literal(""), isoDate]).optional(),
});
export type VacancyInput = z.infer<typeof vacancySchema>;

export const applicationUpdateSchema = z.object({
  status: z.enum([
    "received", "under_review", "shortlisted", "interview",
    "selected", "unsuccessful", "withdrawn",
  ]).optional(),
  interviewAt: z.union([z.literal(""), z.string().datetime({ offset: true }).or(isoDate)]).optional(),
  interviewNotes: str(3000).optional(),
  note: str(2000).optional(),
});

export const testimonialAdminSchema = z.object({
  name: req(200, "Name"),
  role: str(200).optional(),
  organisation: str(200).optional(),
  content: req(1500, "Testimonial"),
  rating: z.union([z.literal(""), z.coerce.number().int().min(1).max(5)]).optional(),
  consentRecorded: z.coerce.boolean(),
  consentNote: str(1000).optional(),
  featured: z.coerce.boolean().optional(),
});

export const testimonialModerationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  featured: z.coerce.boolean().optional(),
});

export const resourceSchema = z.object({
  title: req(300, "Title"),
  description: str(1000, "Description").optional(),
});

/** Parse helper: map zod errors to a flat field-error record. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
