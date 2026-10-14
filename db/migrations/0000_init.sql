CREATE TABLE "admin_sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip" varchar(64),
	"user_agent" varchar(400)
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(200) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) DEFAULT 'owner' NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "application_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"admin_id" uuid,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(24) NOT NULL,
	"vacancy_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(60) NOT NULL,
	"statement" text,
	"cv_storage_key" varchar(500) NOT NULL,
	"cv_original_name" varchar(300) NOT NULL,
	"status" varchar(30) DEFAULT 'received' NOT NULL,
	"interview_at" timestamp with time zone,
	"interview_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "article_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	CONSTRAINT "article_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(220) NOT NULL,
	"title" varchar(300) NOT NULL,
	"excerpt" text,
	"content" text DEFAULT '' NOT NULL,
	"category_id" uuid,
	"author_name" varchar(200),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"seo_title" varchar(300),
	"seo_description" varchar(400),
	"published_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"action" varchar(120) NOT NULL,
	"entity" varchar(80),
	"entity_id" varchar(80),
	"meta" jsonb,
	"ip" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(24) NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(60),
	"topic" varchar(300) NOT NULL,
	"preferred_window" varchar(200) NOT NULL,
	"method" varchar(40) DEFAULT 'any',
	"message" text,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consultations_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to_address" varchar(320) NOT NULL,
	"subject" varchar(400) NOT NULL,
	"template" varchar(120),
	"status" varchar(30) NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(24) NOT NULL,
	"kind" varchar(24) DEFAULT 'project' NOT NULL,
	"name" varchar(200) NOT NULL,
	"organisation" varchar(200),
	"email" varchar(320) NOT NULL,
	"phone" varchar(60),
	"preferred_contact" varchar(20) DEFAULT 'email',
	"services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"title" varchar(300),
	"problem" text,
	"description" text,
	"deliverables" text,
	"requirements" text,
	"budget" varchar(60),
	"timeline" varchar(60),
	"org_type" varchar(60),
	"consult_method" varchar(60),
	"message" text,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiries_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "inquiry_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"original_name" varchar(300) NOT NULL,
	"size_bytes" integer NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"admin_id" uuid,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(300) NOT NULL,
	"summary" text,
	"description" text,
	"problem" text,
	"solution" text,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deliverables" text,
	"results" text,
	"category" varchar(80),
	"industry" varchar(80),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"live_url" varchar(500),
	"external_url" varchar(500),
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"alt" varchar(300),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_number" varchar(24) NOT NULL,
	"inquiry_id" uuid,
	"client_name" varchar(200) NOT NULL,
	"client_organisation" varchar(200),
	"client_email" varchar(320),
	"title" varchar(300) NOT NULL,
	"executive_summary" text,
	"requirements" text,
	"solution" text,
	"scope_of_work" text,
	"deliverables" text,
	"milestones" text,
	"timeline" text,
	"pricing" text,
	"assumptions" text,
	"exclusions" text,
	"terms" text,
	"validity_days" integer DEFAULT 30,
	"currency" varchar(3) DEFAULT 'GHS' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proposals_proposal_number_unique" UNIQUE("proposal_number")
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_number" varchar(24) NOT NULL,
	"inquiry_id" uuid,
	"client_name" varchar(200) NOT NULL,
	"client_organisation" varchar(200),
	"client_email" varchar(320),
	"client_phone" varchar(60),
	"client_address" text,
	"issue_date" varchar(10) NOT NULL,
	"expiry_date" varchar(10),
	"currency" varchar(3) DEFAULT 'GHS' NOT NULL,
	"discount_type" varchar(10),
	"discount_value" numeric(12, 2),
	"tax_rate" numeric(6, 3),
	"subtotal" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"scope_of_work" text,
	"terms" text,
	"notes" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"payment_status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotations_quote_number_unique" UNIQUE("quote_number")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_id" uuid NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"original_name" varchar(300) NOT NULL,
	"size_bytes" integer NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_id" uuid NOT NULL,
	"admin_id" uuid,
	"kind" varchar(30) DEFAULT 'note' NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_id" uuid NOT NULL,
	"name" varchar(300) NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_cost" numeric(12, 2),
	"status" varchar(20) DEFAULT 'needed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(24) NOT NULL,
	"access_code_hash" varchar(64) NOT NULL,
	"customer_name" varchar(200) NOT NULL,
	"phone" varchar(60) NOT NULL,
	"email" varchar(320),
	"preferred_contact" varchar(20) DEFAULT 'phone',
	"appliance_category" varchar(60) NOT NULL,
	"appliance_type" varchar(120) NOT NULL,
	"brand" varchar(120),
	"model" varchar(120),
	"fault_description" text NOT NULL,
	"fault_started" varchar(60),
	"powers_on" varchar(10),
	"preferred_date" varchar(60),
	"additional_info" text,
	"status" varchar(40) DEFAULT 'new' NOT NULL,
	"technician" varchar(200),
	"diagnosis" text,
	"estimated_cost" numeric(12, 2),
	"estimate_approved" boolean,
	"work_performed" text,
	"testing_results" text,
	"warranty_terms" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repair_requests_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "repair_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_id" uuid NOT NULL,
	"from_status" varchar(40),
	"to_status" varchar(40) NOT NULL,
	"note" text,
	"changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text,
	"storage_key" varchar(500) NOT NULL,
	"original_name" varchar(300) NOT NULL,
	"size_bytes" integer NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(120) PRIMARY KEY NOT NULL,
	"value" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"role" varchar(200),
	"organisation" varchar(200),
	"content" text NOT NULL,
	"rating" integer,
	"source" varchar(20) DEFAULT 'customer' NOT NULL,
	"consent_recorded" boolean DEFAULT false NOT NULL,
	"consent_note" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"project_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(220) NOT NULL,
	"title" varchar(200) NOT NULL,
	"department" varchar(120),
	"employment_type" varchar(40) NOT NULL,
	"location" varchar(200),
	"remote" boolean DEFAULT false NOT NULL,
	"summary" text,
	"responsibilities" text,
	"skills" text,
	"qualifications" text,
	"deadline" varchar(10),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vacancies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_files" ADD CONSTRAINT "inquiry_files_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_notes" ADD CONSTRAINT "inquiry_notes_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_notes" ADD CONSTRAINT "inquiry_notes_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_portfolio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_files" ADD CONSTRAINT "repair_files_repair_id_repair_requests_id_fk" FOREIGN KEY ("repair_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_notes" ADD CONSTRAINT "repair_notes_repair_id_repair_requests_id_fk" FOREIGN KEY ("repair_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_notes" ADD CONSTRAINT "repair_notes_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_parts" ADD CONSTRAINT "repair_parts_repair_id_repair_requests_id_fk" FOREIGN KEY ("repair_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_status_history" ADD CONSTRAINT "repair_status_history_repair_id_repair_requests_id_fk" FOREIGN KEY ("repair_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_status_history" ADD CONSTRAINT "repair_status_history_changed_by_admins_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_portfolio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_expires_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "application_notes_application_idx" ON "application_notes" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "applications_vacancy_idx" ON "applications" USING btree ("vacancy_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "article_tags_unique" ON "article_tags" USING btree ("article_id","tag_id");--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "consultations_status_idx" ON "consultations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inquiries_created_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inquiry_files_inquiry_idx" ON "inquiry_files" USING btree ("inquiry_id");--> statement-breakpoint
CREATE INDEX "inquiry_notes_inquiry_idx" ON "inquiry_notes" USING btree ("inquiry_id");--> statement-breakpoint
CREATE INDEX "portfolio_status_idx" ON "portfolio_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "portfolio_featured_idx" ON "portfolio_projects" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "project_images_project_idx" ON "project_images" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "quotation_items_quotation_idx" ON "quotation_items" USING btree ("quotation_id");--> statement-breakpoint
CREATE INDEX "quotations_status_idx" ON "quotations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repair_files_repair_idx" ON "repair_files" USING btree ("repair_id");--> statement-breakpoint
CREATE INDEX "repair_notes_repair_idx" ON "repair_notes" USING btree ("repair_id");--> statement-breakpoint
CREATE INDEX "repair_parts_repair_idx" ON "repair_parts" USING btree ("repair_id");--> statement-breakpoint
CREATE INDEX "repair_requests_status_idx" ON "repair_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repair_requests_phone_idx" ON "repair_requests" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "repair_status_history_repair_idx" ON "repair_status_history" USING btree ("repair_id");--> statement-breakpoint
CREATE INDEX "testimonials_status_idx" ON "testimonials" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vacancies_status_idx" ON "vacancies" USING btree ("status");