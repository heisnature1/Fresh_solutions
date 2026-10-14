import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Identity & sessions
// ---------------------------------------------------------------------------

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("owner"),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    // SHA-256 hex of the bearer token — the raw token only ever lives in the cookie.
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ip: varchar("ip", { length: 64 }),
    userAgent: varchar("user_agent", { length: 400 }),
  },
  (t) => [index("admin_sessions_expires_idx").on(t.expiresAt)],
);

// ---------------------------------------------------------------------------
// Site settings (singleton key/value store; values are JSON-encoded)
// ---------------------------------------------------------------------------

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Inquiries (project inquiries, quotation requests, contact messages)
// ---------------------------------------------------------------------------

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 24 }).notNull().unique(),
    // project | quotation | contact | consultation-linked message
    kind: varchar("kind", { length: 24 }).notNull().default("project"),
    name: varchar("name", { length: 200 }).notNull(),
    organisation: varchar("organisation", { length: 200 }),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 60 }),
    preferredContact: varchar("preferred_contact", { length: 20 }).default("email"),
    services: jsonb("services").$type<string[]>().notNull().default([]),
    title: varchar("title", { length: 300 }),
    problem: text("problem"),
    description: text("description"),
    deliverables: text("deliverables"),
    requirements: text("requirements"),
    budget: varchar("budget", { length: 60 }),
    timeline: varchar("timeline", { length: 60 }),
    orgType: varchar("org_type", { length: 60 }),
    consultMethod: varchar("consult_method", { length: 60 }),
    message: text("message"),
    // new | in_review | quoted | proposal_sent | accepted | declined | closed | spam
    status: varchar("status", { length: 30 }).notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("inquiries_status_idx").on(t.status),
    index("inquiries_created_idx").on(t.createdAt),
  ],
);

export const inquiryNotes = pgTable(
  "inquiry_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    adminId: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiry_notes_inquiry_idx").on(t.inquiryId)],
);

export const inquiryFiles = pgTable(
  "inquiry_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    originalName: varchar("original_name", { length: 300 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiry_files_inquiry_idx").on(t.inquiryId)],
);

// ---------------------------------------------------------------------------
// Consultations
// ---------------------------------------------------------------------------

export const consultations = pgTable(
  "consultations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 24 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 60 }),
    topic: varchar("topic", { length: 300 }).notNull(),
    preferredWindow: varchar("preferred_window", { length: 200 }).notNull(),
    method: varchar("method", { length: 40 }).default("any"),
    message: text("message"),
    // pending | approved | declined | completed | cancelled
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("consultations_status_idx").on(t.status)],
);

// ---------------------------------------------------------------------------
// Repairs
// ---------------------------------------------------------------------------

export const repairRequests = pgTable(
  "repair_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 24 }).notNull().unique(),
    // Additional secret for public status lookups (only the hash is stored).
    accessCodeHash: varchar("access_code_hash", { length: 64 }).notNull(),
    customerName: varchar("customer_name", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 60 }).notNull(),
    email: varchar("email", { length: 320 }),
    preferredContact: varchar("preferred_contact", { length: 20 }).default("phone"),
    applianceCategory: varchar("appliance_category", { length: 60 }).notNull(),
    applianceType: varchar("appliance_type", { length: 120 }).notNull(),
    brand: varchar("brand", { length: 120 }),
    model: varchar("model", { length: 120 }),
    faultDescription: text("fault_description").notNull(),
    faultStarted: varchar("fault_started", { length: 60 }),
    powersOn: varchar("powers_on", { length: 10 }), // yes | no | unknown | na
    preferredDate: varchar("preferred_date", { length: 60 }),
    additionalInfo: text("additional_info"),
    // See REPAIR_STATUSES in lib/constants.ts ("new", "awaiting_review", ... "cancelled")
    status: varchar("status", { length: 40 }).notNull().default("new"),
    technician: varchar("technician", { length: 200 }),
    diagnosis: text("diagnosis"),
    estimatedCost: numeric("estimated_cost", { precision: 12, scale: 2 }),
    estimateApproved: boolean("estimate_approved"),
    workPerformed: text("work_performed"),
    testingResults: text("testing_results"),
    warrantyTerms: text("warranty_terms"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("repair_requests_status_idx").on(t.status),
    index("repair_requests_phone_idx").on(t.phone),
  ],
);

export const repairFiles = pgTable(
  "repair_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repairId: uuid("repair_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    originalName: varchar("original_name", { length: 300 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("repair_files_repair_idx").on(t.repairId)],
);

export const repairNotes = pgTable(
  "repair_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repairId: uuid("repair_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    adminId: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),
    // note | diagnosis | customer_communication
    kind: varchar("kind", { length: 30 }).notNull().default("note"),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("repair_notes_repair_idx").on(t.repairId)],
);

export const repairStatusHistory = pgTable(
  "repair_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repairId: uuid("repair_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    fromStatus: varchar("from_status", { length: 40 }),
    toStatus: varchar("to_status", { length: 40 }).notNull(),
    note: text("note"),
    changedBy: uuid("changed_by").references(() => admins.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("repair_status_history_repair_idx").on(t.repairId)],
);

export const repairParts = pgTable(
  "repair_parts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repairId: uuid("repair_id")
      .notNull()
      .references(() => repairRequests.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 300 }).notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
    unitCost: numeric("unit_cost", { precision: 12, scale: 2 }),
    // needed | ordered | received | used
    status: varchar("status", { length: 20 }).notNull().default("needed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("repair_parts_repair_idx").on(t.repairId)],
);

// ---------------------------------------------------------------------------
// Quotations
// ---------------------------------------------------------------------------

export const quotations = pgTable(
  "quotations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteNumber: varchar("quote_number", { length: 24 }).notNull().unique(),
    inquiryId: uuid("inquiry_id").references(() => inquiries.id, {
      onDelete: "set null",
    }),
    clientName: varchar("client_name", { length: 200 }).notNull(),
    clientOrganisation: varchar("client_organisation", { length: 200 }),
    clientEmail: varchar("client_email", { length: 320 }),
    clientPhone: varchar("client_phone", { length: 60 }),
    clientAddress: text("client_address"),
    issueDate: varchar("issue_date", { length: 10 }).notNull(), // YYYY-MM-DD
    expiryDate: varchar("expiry_date", { length: 10 }),
    currency: varchar("currency", { length: 3 }).notNull().default("GHS"),
    discountType: varchar("discount_type", { length: 10 }), // percent | fixed | null
    discountValue: numeric("discount_value", { precision: 12, scale: 2 }),
    taxRate: numeric("tax_rate", { precision: 6, scale: 3 }), // percentage
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
    scopeOfWork: text("scope_of_work"),
    terms: text("terms"),
    notes: text("notes"),
    // draft | sent | accepted | rejected | expired | cancelled
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    // Structured so a payment gateway can be attached later (MVP: no payments)
    paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"),
    createdBy: uuid("created_by").references(() => admins.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("quotations_status_idx").on(t.status)],
);

export const quotationItems = pgTable(
  "quotation_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quotationId: uuid("quotation_id")
      .notNull()
      .references(() => quotations.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default("1"),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull().default("0"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("quotation_items_quotation_idx").on(t.quotationId)],
);

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------

export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalNumber: varchar("proposal_number", { length: 24 }).notNull().unique(),
  inquiryId: uuid("inquiry_id").references(() => inquiries.id, { onDelete: "set null" }),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  clientOrganisation: varchar("client_organisation", { length: 200 }),
  clientEmail: varchar("client_email", { length: 320 }),
  title: varchar("title", { length: 300 }).notNull(),
  executiveSummary: text("executive_summary"),
  requirements: text("requirements"),
  solution: text("solution"),
  scopeOfWork: text("scope_of_work"),
  deliverables: text("deliverables"),
  milestones: text("milestones"),
  timeline: text("timeline"),
  pricing: text("pricing"),
  assumptions: text("assumptions"),
  exclusions: text("exclusions"),
  terms: text("terms"),
  validityDays: integer("validity_days").default(30),
  currency: varchar("currency", { length: 3 }).notNull().default("GHS"),
  // draft | sent | accepted | rejected | expired | cancelled
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  createdBy: uuid("created_by").references(() => admins.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export const portfolioProjects = pgTable(
  "portfolio_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    title: varchar("title", { length: 300 }).notNull(),
    summary: text("summary"),
    description: text("description"),
    problem: text("problem"),
    solution: text("solution"),
    technologies: jsonb("technologies").$type<string[]>().notNull().default([]),
    deliverables: text("deliverables"),
    results: text("results"),
    category: varchar("category", { length: 80 }),
    industry: varchar("industry", { length: 80 }),
    // draft | published | archived
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    liveUrl: varchar("live_url", { length: 500 }),
    externalUrl: varchar("external_url", { length: 500 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("portfolio_status_idx").on(t.status),
    index("portfolio_featured_idx").on(t.featured),
  ],
);

export const projectImages = pgTable(
  "project_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => portfolioProjects.id, { onDelete: "cascade" }),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    alt: varchar("alt", { length: 300 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("project_images_project_idx").on(t.projectId)],
);

// ---------------------------------------------------------------------------
// Knowledge centre
// ---------------------------------------------------------------------------

export const articleCategories = pgTable("article_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    title: varchar("title", { length: 300 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull().default(""),
    categoryId: uuid("category_id").references(() => articleCategories.id, {
      onDelete: "set null",
    }),
    authorName: varchar("author_name", { length: 200 }),
    // draft | published | archived
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    seoTitle: varchar("seo_title", { length: 300 }),
    seoDescription: varchar("seo_description", { length: 400 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("articles_status_idx").on(t.status)],
);

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("article_tags_unique").on(t.articleId, t.tagId)],
);

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  originalName: varchar("original_name", { length: 300 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Careers / recruitment
// ---------------------------------------------------------------------------

export const vacancies = pgTable(
  "vacancies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    department: varchar("department", { length: 120 }),
    // full_time | part_time | contract | internship | industrial_attachment |
    // national_service | trainee
    employmentType: varchar("employment_type", { length: 40 }).notNull(),
    location: varchar("location", { length: 200 }),
    remote: boolean("remote").notNull().default(false),
    summary: text("summary"),
    responsibilities: text("responsibilities"),
    skills: text("skills"),
    qualifications: text("qualifications"),
    deadline: varchar("deadline", { length: 10 }), // YYYY-MM-DD
    // draft | published | closed
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("vacancies_status_idx").on(t.status)],
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 24 }).notNull().unique(),
    vacancyId: uuid("vacancy_id")
      .notNull()
      .references(() => vacancies.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 60 }).notNull(),
    statement: text("statement"),
    cvStorageKey: varchar("cv_storage_key", { length: 500 }).notNull(),
    cvOriginalName: varchar("cv_original_name", { length: 300 }).notNull(),
    // received | under_review | shortlisted | interview | selected | unsuccessful |
    // withdrawn
    status: varchar("status", { length: 30 }).notNull().default("received"),
    interviewAt: timestamp("interview_at", { withTimezone: true }),
    interviewNotes: text("interview_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("applications_vacancy_idx").on(t.vacancyId),
    index("applications_status_idx").on(t.status),
  ],
);

export const applicationNotes = pgTable(
  "application_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    adminId: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("application_notes_application_idx").on(t.applicationId)],
);

// ---------------------------------------------------------------------------
// Testimonials & reviews
// ---------------------------------------------------------------------------

export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    role: varchar("role", { length: 200 }),
    organisation: varchar("organisation", { length: 200 }),
    content: text("content").notNull(),
    rating: integer("rating"),
    // admin (created by admin with recorded consent) | customer (submitted publicly)
    source: varchar("source", { length: 20 }).notNull().default("customer"),
    consentRecorded: boolean("consent_recorded").notNull().default(false),
    consentNote: text("consent_note"),
    // pending | approved | rejected
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    featured: boolean("featured").notNull().default(false),
    projectId: uuid("project_id").references(() => portfolioProjects.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("testimonials_status_idx").on(t.status)],
);

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export const emailLog = pgTable("email_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  toAddress: varchar("to_address", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 400 }).notNull(),
  template: varchar("template", { length: 120 }),
  // sent | failed | skipped_unconfigured
  status: varchar("status", { length: 30 }).notNull(),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),
    action: varchar("action", { length: 120 }).notNull(),
    entity: varchar("entity", { length: 80 }),
    entityId: varchar("entity_id", { length: 80 }),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    ip: varchar("ip", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_created_idx").on(t.createdAt)],
);

// DB-backed fixed-window rate limiting so limits hold across restarts.
export const rateLimits = pgTable("rate_limits", {
  key: varchar("key", { length: 200 }).primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});
