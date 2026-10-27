/**
 * Fresh Solutions public pricing defaults.
 *
 * This file contains the fallback rate card used when no admin-managed
 * configuration has been saved yet. The live public site reads its pricing
 * configuration from the database via `lib/pricing-store.ts`; admins edit it in
 * `/admin/pricing`. Keep this file valid so the site still works before the
 * first admin save or if the database is temporarily unavailable.
 *
 * All amounts are whole Ghana cedis (GHS). Third-party costs and applicable
 * taxes are excluded unless a package explicitly says otherwise.
 */

import { getService, SERVICES } from "./constants";

export const PRICING_CURRENCY = "GHS" as const;
export const PRICING_CURRENCY_LABEL = "Ghanaian Cedi";
export const PRICING_SYMBOL = "GH₵";

export interface PricingStandardSettings {
  effectiveDate: string;
  quoteValidityDays: number;
  reviewCycle: string;
  includedRevisionRounds: number;
  standardHourlyRate: number;
  depositPercent: number;
  largeProjectThreshold: number;
  freeIntroCallMinutes: number;
}

export const PRICING_STANDARD: PricingStandardSettings = {
  effectiveDate: "2026-10-27",
  quoteValidityDays: 30,
  reviewCycle: "quarterly",
  includedRevisionRounds: 2,
  standardHourlyRate: 350,
  depositPercent: 50,
  largeProjectThreshold: 20_000,
  freeIntroCallMinutes: 15,
};

/** Group IDs are strings so admins can add or rename pricing sections. */
export type PricingGroupId = string;
/** Units are strings so admins can introduce a new billing unit if needed. */
export type PricingUnit = string;
export const PRICING_UNITS = [
  "one-time",
  "per hour",
  "per month",
  "per session",
  "per participant",
  "per device",
  "per assessment",
  "per visit",
  "per day",
] as const;
export type PriceKind = "fixed" | "from";

export interface PricingGroup {
  id: PricingGroupId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface PricingPlan {
  id: string;
  serviceSlug: string;
  name: string;
  summary: string;
  price: number;
  unit: PricingUnit;
  kind: PriceKind;
  duration: string;
  bestFor: string;
  includes: string[];
  featured?: boolean;
}

export interface PricingAddOn {
  label: string;
  price: number;
  unit: PricingUnit;
  note?: string;
}

export interface ServicePricing {
  serviceSlug: string;
  groupId: PricingGroupId;
  intro: string;
  note: string;
  plans: PricingPlan[];
  addOns: PricingAddOn[];
  actionHref?: string;
  actionLabel?: string;
  /** Admin overrides for services not present in the code service directory. */
  name?: string;
  shortName?: string;
  icon?: string;
  detailsHref?: string;
  /** Representative package used for "from" badges and at-a-glance cards. */
  startingPlanId?: string;
}

export interface PricingRule {
  icon: string;
  title: string;
  description: string;
}

export interface PricingFaq {
  question: string;
  answer: string;
}

export const PRICING_GROUPS: PricingGroup[] = [
  {
    id: "digital",
    label: "Web, mobile & custom software",
    shortLabel: "Digital products",
    description: "Websites, online shops, mobile apps, and business systems with a defined starting scope.",
  },
  {
    id: "intelligence",
    label: "Security, AI & business advice",
    shortLabel: "Security & advisory",
    description: "Authorised security assessments, practical automation, and evidence-based technology advice.",
  },
  {
    id: "operations",
    label: "IT support & cloud operations",
    shortLabel: "IT & cloud",
    description: "Day-to-day technical support, managed hosting, and dependable cloud operations.",
  },
  {
    id: "engineering",
    label: "Training, hardware & repairs",
    shortLabel: "Hands-on services",
    description: "Skills training, electronics prototypes, and careful diagnosis before any repair work.",
  },
];

type PlanInput = Omit<PricingPlan, "serviceSlug">;

function defineServicePricing(
  input: Omit<ServicePricing, "plans"> & { plans: PlanInput[] },
): ServicePricing {
  return {
    ...input,
    plans: input.plans.map((plan) => ({ ...plan, serviceSlug: input.serviceSlug })),
  };
}

/**
 * Proposed published rate card. These are starting/package prices, not a
 * substitute for a written quotation when a requirement falls outside scope.
 */
export const SERVICE_PRICING: ServicePricing[] = [
  defineServicePricing({
    serviceSlug: "web-development",
    groupId: "digital",
    intro: "Choose a website package based on the number of pages, content updates, and transactions you need.",
    note: "Domain names, hosting, premium themes, paid stock assets, payment-provider fees, and content creation are excluded unless listed.",
    plans: [
      {
        id: "web-launch-page",
        name: "Launch Page",
        summary: "A focused one-page website for a new business or campaign.",
        price: 2_500,
        unit: "one-time",
        kind: "fixed",
        duration: "5–7 working days",
        bestFor: "Individuals and new businesses that need a credible online presence.",
        includes: ["Up to 5 sections", "Mobile-friendly responsive design", "Contact and WhatsApp links", "Basic on-page SEO setup", "2 rounds of revisions"],
      },
      {
        id: "web-business-site",
        name: "Business Website",
        summary: "A complete multi-page company website with structured content.",
        price: 6_000,
        unit: "one-time",
        kind: "fixed",
        duration: "2–3 weeks",
        bestFor: "Established SMEs that need to explain services and generate enquiries.",
        includes: ["Up to 8 pages", "Responsive design and enquiry form", "Service/project galleries", "Analytics and search-console setup", "2 rounds of revisions", "Handover guide"],
        featured: true,
      },
      {
        id: "web-online-store",
        name: "Online Store",
        summary: "A catalogue and order-management website ready for payment integration.",
        price: 12_000,
        unit: "one-time",
        kind: "from",
        duration: "3–6 weeks",
        bestFor: "Retailers ready to receive and manage online orders.",
        includes: ["Up to 50 products", "Product categories and search", "Cart and order administration", "Order notification emails", "Payment-ready structure", "Admin training"],
      },
      {
        id: "web-care-plan",
        name: "Website Care",
        summary: "Monthly updates, backups, monitoring, and technical care after launch.",
        price: 500,
        unit: "per month",
        kind: "from",
        duration: "Monthly, cancel with 30 days' notice",
        bestFor: "Businesses that want their website kept current and secure.",
        includes: ["Up to 4 content updates", "Software and plugin updates", "Weekly backups", "Uptime and security checks", "Monthly health summary"],
      },
    ],
    addOns: [
      { label: "Additional website page", price: 350, unit: "one-time" },
      { label: "Batch of 25 extra products", price: 600, unit: "one-time" },
      { label: "Professional copywriting", price: 250, unit: "one-time", note: "per page" },
      { label: "Payment gateway integration", price: 2_500, unit: "one-time" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "mobile-app-development",
    groupId: "digital",
    intro: "Start with a testable prototype or commission a production app for one or both platforms.",
    note: "App-store accounts, developer-programme fees, backend hosting, third-party APIs, and device testing costs are billed separately.",
    plans: [
      {
        id: "mobile-prototype",
        name: "Clickable Prototype",
        summary: "A visual, clickable app concept you can test with real users.",
        price: 8_000,
        unit: "one-time",
        kind: "fixed",
        duration: "2–3 weeks",
        bestFor: "Founders validating an idea before committing to a full build.",
        includes: ["Up to 10 designed screens", "Core user journey", "Interactive clickable prototype", "2 rounds of revisions", "Design-file handover"],
      },
      {
        id: "mobile-single-platform",
        name: "Single-platform MVP",
        summary: "A working Android or iOS application for one platform.",
        price: 18_000,
        unit: "one-time",
        kind: "from",
        duration: "6–8 weeks",
        bestFor: "Businesses launching a focused first version of an app.",
        includes: ["Android or iOS build", "Up to 12 screens", "User accounts and basic backend", "Push-notification-ready structure", "Store submission handover", "Bug-fix period"],
        featured: true,
      },
      {
        id: "mobile-cross-platform",
        name: "Cross-platform Business App",
        summary: "One shared codebase delivered on both Android and iOS.",
        price: 35_000,
        unit: "one-time",
        kind: "from",
        duration: "10–14 weeks",
        bestFor: "Teams that need a broader app with an admin dashboard.",
        includes: ["Android and iOS builds", "Shared backend and admin dashboard", "Offline-ready data handling", "Analytics and crash reporting", "App-store submission support", "Training and documentation"],
      },
      {
        id: "mobile-app-care",
        name: "App Care",
        summary: "Ongoing compatibility fixes, monitoring, and small improvements.",
        price: 900,
        unit: "per month",
        kind: "from",
        duration: "Monthly, cancel with 30 days' notice",
        bestFor: "Published apps that must keep pace with OS and store changes.",
        includes: ["Compatibility updates", "Bug fixes", "Crash monitoring", "Security patch review", "Monthly status report"],
      },
    ],
    addOns: [
      { label: "Additional platform build", price: 8_000, unit: "one-time" },
      { label: "Push notification setup", price: 2_000, unit: "one-time" },
      { label: "Payment integration", price: 2_500, unit: "one-time" },
      { label: "App-store account setup", price: 1_500, unit: "one-time" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "software-development",
    groupId: "digital",
    intro: "Custom systems are priced by the number of workflows, roles, integrations, and reports required.",
    note: "Legacy data cleanup, third-party licence fees, server infrastructure, and ongoing process redesign are quoted separately.",
    plans: [
      {
        id: "software-internal-tool",
        name: "Internal Tool",
        summary: "A focused application that replaces one manual or spreadsheet-based process.",
        price: 7_500,
        unit: "one-time",
        kind: "fixed",
        duration: "3–4 weeks",
        bestFor: "Small teams with one clearly defined operational bottleneck.",
        includes: ["One core workflow", "Up to 3 user roles", "Secure database", "Basic reporting", "2 rounds of revisions", "User handover"],
      },
      {
        id: "software-management-system",
        name: "Management System",
        summary: "A multi-module system for records, operations, inventory, or reporting.",
        price: 25_000,
        unit: "one-time",
        kind: "from",
        duration: "8–12 weeks",
        bestFor: "Organisations that need several connected departments in one system.",
        includes: ["Up to 5 modules", "Role-based permissions", "Audit trail", "Management dashboards", "Data import templates", "Admin training"],
        featured: true,
      },
      {
        id: "software-integration",
        name: "API & System Integration",
        summary: "Connect two existing systems so data moves reliably between them.",
        price: 9_000,
        unit: "one-time",
        kind: "from",
        duration: "3–6 weeks",
        bestFor: "Teams duplicating work across separate tools.",
        includes: ["Up to 2 system connections", "Field and data mapping", "Error handling and logs", "Authentication and secrets handling", "Integration documentation"],
      },
      {
        id: "software-care",
        name: "Software Care",
        summary: "Maintenance and small enhancements for software we built or formally reviewed.",
        price: 1_200,
        unit: "per month",
        kind: "from",
        duration: "Monthly, cancel with 30 days' notice",
        bestFor: "Businesses running a custom system in daily operations.",
        includes: ["Priority bug fixes", "Dependency and security updates", "Database backup checks", "Up to 6 hours of minor changes", "Monthly report"],
      },
    ],
    addOns: [
      { label: "Additional system module", price: 5_000, unit: "one-time" },
      { label: "Team training session", price: 2_000, unit: "per session" },
      { label: "Data migration", price: 3_000, unit: "one-time" },
      { label: "On-site rollout", price: 2_500, unit: "per day" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "cybersecurity",
    groupId: "intelligence",
    intro: "Defensive security packages with a documented scope. Testing never starts without written owner authorisation.",
    note: "Security tooling subscriptions, cloud-provider fees, remediation work, and testing of third-party systems are outside these prices.",
    plans: [
      {
        id: "security-health-check",
        name: "Security Health Check",
        summary: "A practical review of your current security posture and quick wins.",
        price: 2_500,
        unit: "one-time",
        kind: "fixed",
        duration: "3–5 working days",
        bestFor: "Small organisations that need a clear starting point.",
        includes: ["Up to 5 in-scope assets", "Account and configuration review", "Prioritised findings report", "30-minute remediation call", "Written authorisation process"],
      },
      {
        id: "security-vulnerability-assessment",
        name: "Vulnerability Assessment",
        summary: "Scanning plus manual verification to identify and prioritise weaknesses.",
        price: 7_500,
        unit: "one-time",
        kind: "from",
        duration: "1–2 weeks",
        bestFor: "Teams that need a repeatable view of technical risk.",
        includes: ["Up to 10 in-scope assets", "Automated and manual verification", "Risk-ranked findings", "Remediation guidance", "One validation retest"],
        featured: true,
      },
      {
        id: "security-penetration-test",
        name: "Authorised Penetration Test",
        summary: "Controlled testing of an agreed application or network boundary.",
        price: 12_000,
        unit: "one-time",
        kind: "from",
        duration: "2–3 weeks",
        bestFor: "Organisations with mature systems that need evidence of real-world exposure.",
        includes: ["Documented rules of engagement", "One application or network boundary", "Manual exploitation of in-scope findings", "Executive and technical reports", "Remediation retest"],
      },
      {
        id: "security-awareness-training",
        name: "Awareness Training",
        summary: "A live session that helps staff recognise phishing, fraud, and unsafe habits.",
        price: 2_000,
        unit: "per session",
        kind: "fixed",
        duration: "Half-day session",
        bestFor: "Teams of up to 20 people.",
        includes: ["Up to 20 participants", "Phishing and password awareness", "Practical reporting guidance", "Q&A session", "Attendance summary"],
      },
    ],
    addOns: [
      { label: "Additional in-scope asset", price: 500, unit: "one-time" },
      { label: "Extra staff training session", price: 1_500, unit: "per session" },
      { label: "Security policy starter pack", price: 3_000, unit: "one-time" },
      { label: "Additional remediation retest", price: 2_000, unit: "one-time" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "ai-automation",
    groupId: "intelligence",
    intro: "AI and automation prices are tied to real workflows, integrations, and measurable outputs — not vague promises.",
    note: "AI/API usage, model subscriptions, data storage, and third-party platform licences are billed separately and disclosed before purchase.",
    plans: [
      {
        id: "ai-opportunity-review",
        name: "AI Opportunity Review",
        summary: "A short, honest workshop to find where automation genuinely helps.",
        price: 1_500,
        unit: "one-time",
        kind: "fixed",
        duration: "90-minute workshop + written notes",
        bestFor: "Teams curious about AI but unsure where to begin.",
        includes: ["Process discovery", "Up to 3 candidate workflows", "Risk and data-readiness review", "Build/buy/do-nothing recommendation", "Written summary"],
      },
      {
        id: "ai-knowledge-chatbot",
        name: "Knowledge Chatbot",
        summary: "A grounded assistant connected to your approved business content.",
        price: 8_000,
        unit: "one-time",
        kind: "from",
        duration: "3–5 weeks",
        bestFor: "Customer-service teams answering the same questions repeatedly.",
        includes: ["One web or chat channel", "Up to 100 knowledge documents", "Human handoff path", "Conversation logs and basic analytics", "Admin training"],
        featured: true,
      },
      {
        id: "ai-workflow-automation",
        name: "Workflow Automation",
        summary: "Automated handoffs, notifications, and approvals across your existing tools.",
        price: 10_000,
        unit: "one-time",
        kind: "from",
        duration: "4–6 weeks",
        bestFor: "Operations teams with repetitive, rules-based work.",
        includes: ["Up to 3 workflows", "Up to 5 integrations", "Error logging and retries", "Human approval steps", "Process documentation"],
      },
      {
        id: "ai-custom-integration",
        name: "Custom AI Integration",
        summary: "A scoped AI application with data handling, evaluation, and deployment.",
        price: 20_000,
        unit: "one-time",
        kind: "from",
        duration: "6–10 weeks",
        bestFor: "Organisations with a specific AI use case and usable data.",
        includes: ["Discovery and technical design", "Working prototype", "Data and model integration", "Evaluation and guardrails", "Deployment and handover"],
      },
    ],
    addOns: [
      { label: "Additional automation workflow", price: 2_500, unit: "one-time" },
      { label: "Additional system integration", price: 1_500, unit: "one-time" },
      { label: "AI usage and cost audit", price: 2_000, unit: "one-time" },
      { label: "Monthly automation support", price: 800, unit: "per month" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "business-consultancy",
    groupId: "intelligence",
    intro: "Advisory work is priced by session, defined outcome, or monthly availability.",
    note: "Implementation work, software licences, staff time, and travel outside Greater Accra are quoted separately.",
    plans: [
      {
        id: "consult-advisory-session",
        name: "Technology Advisory Session",
        summary: "Focused time with an advisor to work through one decision or problem.",
        price: 800,
        unit: "per hour",
        kind: "fixed",
        duration: "1 hour, remote or in person",
        bestFor: "Owners and managers who need an informed second opinion.",
        includes: ["Pre-session question form", "Up to 2 participants", "Live advisory discussion", "Written notes and recommended next steps"],
      },
      {
        id: "consult-digital-roadmap",
        name: "Digital Roadmap",
        summary: "A prioritised 12-month plan for systems, processes, and capability.",
        price: 6_000,
        unit: "one-time",
        kind: "fixed",
        duration: "2–3 weeks",
        bestFor: "Organisations planning meaningful digital change.",
        includes: ["Stakeholder interviews", "Current-state assessment", "Prioritised 12-month roadmap", "Budget and risk guidance", "Presentation session"],
        featured: true,
      },
      {
        id: "consult-process-review",
        name: "Process Improvement Review",
        summary: "Map and improve the processes that create delays and rework.",
        price: 9_000,
        unit: "one-time",
        kind: "from",
        duration: "3–4 weeks",
        bestFor: "Teams with recurring operational bottlenecks.",
        includes: ["Up to 3 processes", "Workflow mapping", "Root-cause analysis", "Practical improvement options", "Implementation plan"],
      },
      {
        id: "consult-fractional-advisor",
        name: "Fractional Technology Advisor",
        summary: "Regular advisory availability without hiring a full-time executive.",
        price: 5_000,
        unit: "per month",
        kind: "from",
        duration: "Monthly, 3-month minimum",
        bestFor: "Growing organisations making regular technology decisions.",
        includes: ["Up to 8 advisory hours", "Monthly strategy review", "Vendor and proposal review", "Priority email support", "Written monthly notes"],
      },
    ],
    addOns: [
      { label: "Additional advisory hour", price: 800, unit: "per hour" },
      { label: "Additional stakeholder interview", price: 600, unit: "per session" },
      { label: "Board or management presentation", price: 2_000, unit: "per session" },
      { label: "On-site facilitation", price: 3_000, unit: "per day" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "it-services",
    groupId: "operations",
    intro: "Straightforward rates for one-off fixes and predictable monthly support for small teams.",
    note: "Replacement hardware, licensed software, internet-service charges, and travel outside Greater Accra are excluded.",
    plans: [
      {
        id: "it-remote-support",
        name: "Remote Support",
        summary: "Secure remote troubleshooting for a defined computer or software issue.",
        price: 300,
        unit: "per hour",
        kind: "fixed",
        duration: "Minimum 1 hour",
        bestFor: "Individuals and remote workers who need quick help.",
        includes: ["Remote diagnosis", "Software and configuration fixes", "Plain-language explanation", "Written summary of work done"],
      },
      {
        id: "it-onsite-visit",
        name: "On-site Visit",
        summary: "A technician attends your location within Greater Accra.",
        price: 650,
        unit: "per visit",
        kind: "fixed",
        duration: "Up to 2 hours on site",
        bestFor: "Hardware, network, or multi-device issues that cannot be fixed remotely.",
        includes: ["Travel within Greater Accra", "Up to 2 hours of diagnosis", "Minor configuration fixes", "Written findings and next steps"],
        featured: true,
      },
      {
        id: "it-device-setup",
        name: "Device Setup & Troubleshooting",
        summary: "Get a new or troublesome laptop/desktop ready for safe daily use.",
        price: 450,
        unit: "per device",
        kind: "from",
        duration: "1–2 working days",
        bestFor: "New staff onboarding or persistent device problems.",
        includes: ["OS and driver updates", "Security baseline setup", "Essential software installation", "Data-transfer assistance", "Basic user orientation"],
      },
      {
        id: "it-network-setup",
        name: "Office Network Setup",
        summary: "A secure, documented network foundation for a small office.",
        price: 3_500,
        unit: "one-time",
        kind: "from",
        duration: "3–5 working days",
        bestFor: "Offices setting up or reorganising their network.",
        includes: ["Router and Wi-Fi configuration", "Up to 5 access points", "Guest-network separation", "Basic firewall rules", "Network diagram and passwords handover"],
      },
      {
        id: "it-sme-support",
        name: "SME Support Plan",
        summary: "A monthly support arrangement for a small team and its devices.",
        price: 2_500,
        unit: "per month",
        kind: "from",
        duration: "Monthly, cancel with 30 days' notice",
        bestFor: "Businesses without a full-time internal IT team.",
        includes: ["Up to 10 devices", "Up to 8 support hours", "Remote and on-site support", "Patch and backup checks", "Priority response and monthly report"],
      },
    ],
    addOns: [
      { label: "Extra support hour", price: 300, unit: "per hour" },
      { label: "Additional managed device", price: 150, unit: "per month", note: "per device" },
      { label: "Additional network access point", price: 450, unit: "one-time" },
      { label: "After-hours emergency call-out", price: 1_000, unit: "per visit" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "cloud-hosting",
    groupId: "operations",
    intro: "Managed hosting and cloud setup with the ongoing responsibilities stated up front.",
    note: "Cloud-provider invoices, domains, email-platform licences, and premium backup storage are passed on separately and approved before purchase.",
    plans: [
      {
        id: "cloud-essential-hosting",
        name: "Essential Website Hosting",
        summary: "Managed hosting for a low-traffic business website.",
        price: 350,
        unit: "per month",
        kind: "fixed",
        duration: "Monthly, cancel with 30 days' notice",
        bestFor: "Brochure websites and small business landing pages.",
        includes: ["Managed shared hosting", "SSL certificate", "Weekly backups", "Platform updates", "Uptime checks"],
      },
      {
        id: "cloud-business-hosting",
        name: "Business Hosting",
        summary: "More resources, daily backups, and a staging environment for active websites.",
        price: 900,
        unit: "per month",
        kind: "from",
        duration: "Monthly, cancel with 30 days' notice",
        bestFor: "Busy websites, online catalogues, and web applications.",
        includes: ["Dedicated application resources", "Daily backups", "Staging environment", "Performance monitoring", "Priority incident triage"],
        featured: true,
      },
      {
        id: "cloud-migration",
        name: "Cloud Setup & Migration",
        summary: "Move an existing website or application to a cleaner cloud setup.",
        price: 6_000,
        unit: "one-time",
        kind: "from",
        duration: "1–2 weeks",
        bestFor: "Teams moving away from unreliable or undocumented hosting.",
        includes: ["Up to 2 services", "DNS and SSL setup", "Backup and rollback plan", "Security baseline", "Migration documentation"],
      },
      {
        id: "cloud-managed-operations",
        name: "Managed Cloud Operations",
        summary: "Ongoing care for production cloud infrastructure.",
        price: 1_800,
        unit: "per month",
        kind: "from",
        duration: "Monthly, cancel with 30 days' notice",
        bestFor: "Businesses running customer-facing systems in the cloud.",
        includes: ["Patching and uptime monitoring", "Backup verification", "Incident response", "Capacity and cost review", "Monthly operations report"],
      },
    ],
    addOns: [
      { label: "Backup and recovery setup", price: 2_500, unit: "one-time" },
      { label: "Additional managed service", price: 700, unit: "per month" },
      { label: "Disaster-recovery test", price: 2_000, unit: "one-time" },
      { label: "SSL/DNS troubleshooting", price: 600, unit: "per hour" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "training-education",
    groupId: "engineering",
    intro: "Training is priced per hour, per session, or per participant for a defined group size.",
    note: "Venue hire, participant travel, printed workbooks, and travel outside Greater Accra are quoted separately.",
    plans: [
      {
        id: "training-one-to-one",
        name: "One-to-one Coaching",
        summary: "Personal digital-skills coaching at your pace.",
        price: 250,
        unit: "per hour",
        kind: "fixed",
        duration: "Book in 1-hour blocks",
        bestFor: "Individuals who want practical, focused help.",
        includes: ["Needs check before the session", "One participant", "Hands-on exercises", "Follow-up resource list"],
      },
      {
        id: "training-half-day",
        name: "Half-day Group Workshop",
        summary: "A practical introduction for a small team.",
        price: 3_500,
        unit: "per session",
        kind: "fixed",
        duration: "3.5 hours",
        bestFor: "Up to 10 participants from one organisation.",
        includes: ["One focused topic", "Live demonstrations", "Hands-on exercises", "Digital handouts", "Q&A session"],
        featured: true,
      },
      {
        id: "training-full-day",
        name: "Full-day Team Training",
        summary: "A deeper workshop with exercises and an applied team project.",
        price: 6_500,
        unit: "per session",
        kind: "fixed",
        duration: "6 hours",
        bestFor: "Up to 15 participants from one organisation.",
        includes: ["Pre-training needs form", "Practical exercises", "Team case study", "Digital handouts", "Attendance certificates"],
      },
      {
        id: "training-skills-cohort",
        name: "Four-week Skills Cohort",
        summary: "A structured course with live sessions, practice, and feedback.",
        price: 1_200,
        unit: "per participant",
        kind: "from",
        duration: "4 weeks · minimum 8 participants",
        bestFor: "Schools, teams, and groups building a shared foundation.",
        includes: ["8 live sessions", "Weekly practical assignments", "One capstone exercise", "Progress feedback", "Completion certificates"],
      },
    ],
    addOns: [
      { label: "Additional participant", price: 250, unit: "per participant" },
      { label: "Custom curriculum design", price: 4_000, unit: "one-time" },
      { label: "Recorded session copy", price: 1_000, unit: "per session" },
      { label: "Post-training assessment", price: 1_500, unit: "one-time" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "hardware-embedded-systems",
    groupId: "engineering",
    intro: "Hardware work starts with a feasibility decision, then moves to a documented prototype or pilot.",
    note: "Electronic components, PCB fabrication, enclosures, certification, cloud subscriptions, and specialist test equipment are excluded.",
    plans: [
      {
        id: "hardware-feasibility",
        name: "Feasibility & Design Review",
        summary: "Decide whether a hardware idea is practical before buying components.",
        price: 1_500,
        unit: "one-time",
        kind: "fixed",
        duration: "90-minute review + written notes",
        bestFor: "Inventors and teams at the idea stage.",
        includes: ["Technical feasibility review", "Component options", "Connectivity approach", "Risk and cost considerations", "Recommended next step"],
      },
      {
        id: "hardware-prototype",
        name: "Working Prototype",
        summary: "A bench-ready prototype that demonstrates the core function.",
        price: 6_500,
        unit: "one-time",
        kind: "from",
        duration: "3–5 weeks",
        bestFor: "Concepts that need a physical proof of concept.",
        includes: ["One working device", "Basic sensors or outputs", "Embedded firmware", "Test and demo script", "Bill of materials"],
        featured: true,
      },
      {
        id: "hardware-iot-pilot",
        name: "IoT Pilot",
        summary: "Connected devices with a dashboard and secure data flow.",
        price: 15_000,
        unit: "one-time",
        kind: "from",
        duration: "6–10 weeks",
        bestFor: "Teams testing a small field deployment.",
        includes: ["Up to 3 connected devices", "Device provisioning", "Data dashboard", "Secure connectivity baseline", "Pilot test plan"],
      },
      {
        id: "hardware-firmware-integration",
        name: "Firmware & Integration",
        summary: "Improve or connect firmware on existing hardware.",
        price: 8_000,
        unit: "one-time",
        kind: "from",
        duration: "4–6 weeks",
        bestFor: "Products that need reliable device-to-system communication.",
        includes: ["Firmware review", "Data protocol implementation", "API or dashboard connection", "Error handling", "Integration test report"],
      },
    ],
    addOns: [
      { label: "Additional pilot device", price: 2_500, unit: "one-time" },
      { label: "Custom PCB design", price: 6_000, unit: "one-time" },
      { label: "Enclosure design", price: 4_000, unit: "one-time" },
      { label: "Pilot support", price: 3_000, unit: "per month" },
    ],
  }),

  defineServicePricing({
    serviceSlug: "appliance-repairs",
    groupId: "engineering",
    intro: "Diagnosis is charged up front and credited toward an approved repair. No repair work starts without your approval.",
    note: "Replacement parts, special-order components, delivery outside Greater Accra, and repairs outside our technical capability are quoted separately.",
    actionHref: "/repairs/request",
    actionLabel: "Request a Repair",
    plans: [
      {
        id: "repair-small-appliance-diagnosis",
        name: "Small Appliance Diagnosis",
        summary: "Safety and fault assessment for kettles and other small appliances.",
        price: 80,
        unit: "per assessment",
        kind: "fixed",
        duration: "1–2 working days",
        bestFor: "Kettles and small electrical/electronic appliances.",
        includes: ["Visual and electrical safety checks", "Fault diagnosis", "Written repair estimate", "Fee credited if repair is approved", "No-obligation decline option"],
      },
      {
        id: "repair-phone-diagnosis",
        name: "Phone Diagnosis",
        summary: "A careful check of charging, battery, display, and software faults.",
        price: 100,
        unit: "per assessment",
        kind: "fixed",
        duration: "1–2 working days",
        bestFor: "Mobile phones with an unknown fault.",
        includes: ["Hardware and software assessment", "Parts availability check", "Written repair estimate", "Fee credited if repair is approved", "Repairability advice"],
      },
      {
        id: "repair-laptop-diagnosis",
        name: "Laptop / Computer Diagnosis",
        summary: "Methodical diagnosis of power, storage, display, and software issues.",
        price: 150,
        unit: "per assessment",
        kind: "fixed",
        duration: "2–3 working days",
        bestFor: "Laptops and desktop computers with persistent faults.",
        includes: ["Hardware diagnostics", "OS and software checks", "Written repair estimate", "Fee credited if repair is approved", "Data-risk explanation"],
      },
      {
        id: "repair-standard-labour",
        name: "Standard Repair Labour",
        summary: "Labour for straightforward, approved repairs and software fixes.",
        price: 200,
        unit: "one-time",
        kind: "from",
        duration: "Confirmed after diagnosis",
        bestFor: "Simple component or software repairs.",
        includes: ["Approved repair work", "Basic cleaning and reassembly", "Functional testing", "Job-card record", "Parts quoted separately"],
        featured: true,
      },
      {
        id: "repair-advanced-labour",
        name: "Advanced Repair Labour",
        summary: "Labour for more involved component-level or multi-fault repairs.",
        price: 450,
        unit: "one-time",
        kind: "from",
        duration: "Confirmed after diagnosis",
        bestFor: "Complex faults that require deeper diagnosis and testing.",
        includes: ["Advanced fault isolation", "Component-level repair attempt", "Extended functional testing", "Job-card record", "Parts quoted separately"],
      },
      {
        id: "repair-onsite-callout",
        name: "On-site Call-out",
        summary: "Assessment at your premises within Greater Accra where practical.",
        price: 200,
        unit: "per visit",
        kind: "fixed",
        duration: "Subject to appointment availability",
        bestFor: "Equipment that is difficult to transport.",
        includes: ["Travel within Greater Accra", "Initial on-site assessment", "Written next-step estimate", "Repair appointment arrangement where possible"],
      },
    ],
    addOns: [
      { label: "Software / OS setup", price: 250, unit: "one-time" },
      { label: "Data transfer assistance", price: 200, unit: "one-time" },
      { label: "Pick-up or delivery within Greater Accra", price: 150, unit: "per visit" },
      { label: "Additional diagnostic hour", price: 150, unit: "per hour" },
    ],
  }),
];

export const PRICING_RULES: PricingRule[] = [
  {
    icon: "file-text",
    title: "Every price is in Ghana cedis",
    description: "Published prices and final invoices use GHS (GH₵). Applicable taxes are itemised separately on the invoice.",
  },
  {
    icon: "layers",
    title: "A fixed package needs a fixed scope",
    description: "A fixed price applies when your requirements match the package limits. “From” prices are minimums for the stated starting scope.",
  },
  {
    icon: "check-circle",
    title: "A written quote comes before work",
    description: "We confirm the scope, deliverables, timeline, exclusions, and total in writing. No project or repair work begins without your approval.",
  },
  {
    icon: "refresh",
    title: "Changes are agreed first",
    description: "Two revision rounds are included in fixed packages. Additional or changed work is quoted before it is carried out.",
  },
  {
    icon: "clock",
    title: "Published prices hold for 30 days",
    description: `Prices are reviewed ${PRICING_STANDARD.reviewCycle}. An accepted written quotation stays fixed for ${PRICING_STANDARD.quoteValidityDays} days unless the scope changes.`,
  },
  {
    icon: "info",
    title: "Third-party costs stay transparent",
    description: "Domains, hosting, software licences, AI/API usage, app-store fees, hardware parts, and specialist travel are disclosed and approved separately.",
  },
];

export const PAYMENT_TERMS: string[] = [
  `Projects below ${formatGHS(PRICING_STANDARD.largeProjectThreshold)}: ${PRICING_STANDARD.depositPercent}% deposit to book the work and ${100 - PRICING_STANDARD.depositPercent}% before final handover.`,
  `Projects of ${formatGHS(PRICING_STANDARD.largeProjectThreshold)} or more: 40% deposit, 30% at the agreed midpoint, and 30% before handover.`,
  "Monthly retainers and hosting plans are billed in advance. Recurring third-party costs are shown separately.",
  "Repairs: the diagnosis fee is paid before assessment; the approved repair balance is due before collection or delivery.",
  "Work outside a package is quoted from GH₵350 per hour, except specialist security or embedded-engineering work, which is quoted in writing.",
  "Payment instructions are provided on the invoice. This website does not take online card payments.",
];

export const PRICING_FAQS: PricingFaq[] = [
  {
    question: "Are the published prices final?",
    answer: "A fixed package price is final when the requirements fit the package scope. A “from” price is the minimum for the stated starting scope. Every customer receives a written quotation before work starts, so there is one agreed final price.",
  },
  {
    question: "Can I choose more than one package?",
    answer: "Yes. The estimate builder lets you combine packages — for example, a Business Website with Website Care or an IT Support Plan with Device Setup. Recurring prices are counted for one billing period in the indicative total.",
  },
  {
    question: "Is the first conversation free?",
    answer: `A ${PRICING_STANDARD.freeIntroCallMinutes}-minute fit call is free. Detailed advice is charged at the published advisory rate or included in a discovery package.`,
  },
  {
    question: "Are VAT and third-party costs included?",
    answer: "No. Published prices exclude VAT and other statutory charges, which are itemised on the invoice. Third-party costs are confirmed with you before purchase and shown separately.",
  },
  {
    question: "What if I change my mind about the scope?",
    answer: "Tell us before the extra work is done. We issue a short written change request with the price and timeline impact, and you decide whether to proceed.",
  },
  {
    question: "Do I pay on the website?",
    answer: "No. This site publishes prices and helps you choose a package. After you approve the written quotation, payment instructions are provided on your invoice.",
  },
  {
    question: "What happens after I submit a package enquiry?",
    answer: "We check that the selected package fits your requirements, confirm any exclusions, and send a written quotation. Once you approve it and the first payment is received, work is scheduled.",
  },
];

export interface PricingProcessStep {
  title: string;
  text: string;
}

export const PRICING_PROCESS: PricingProcessStep[] = [
  { title: "Choose a package", text: "Compare published GHS prices, package limits, and optional extras without waiting for a sales call." },
  { title: "Send the short enquiry", text: "Your chosen package and indicative total are carried into the project form automatically." },
  { title: "Confirm the written quote", text: "We verify scope and send one clear quotation, including taxes, exclusions, and payment milestones." },
  { title: "Approve and begin", text: "After your approval and first payment, we schedule the work and share progress against the agreed scope." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatGHS(amount: number, symbol: string = PRICING_SYMBOL): string {
  const rounded = Number.isInteger(amount) ? amount : Math.round(amount * 100) / 100;
  return `${symbol}${new Intl.NumberFormat("en-GH", { maximumFractionDigits: 2 }).format(rounded)}`;
}

export function formatEffectiveDate(date: string = PRICING_STANDARD.effectiveDate): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function planPriceLabel(plan: PricingPlan, symbol: string = PRICING_SYMBOL): string {
  return `${plan.kind === "from" ? "From " : ""}${formatGHS(plan.price, symbol)}`;
}

export function planUnitLabel(plan: PricingPlan): string {
  return plan.unit === "one-time" ? "one-time" : plan.unit;
}

export function addOnPriceLabel(addOn: PricingAddOn, symbol: string = PRICING_SYMBOL): string {
  return `${formatGHS(addOn.price, symbol)} ${addOn.unit === "one-time" ? "" : addOn.unit}`.trim();
}

const PRICING_BY_SERVICE = new Map(SERVICE_PRICING.map((entry) => [entry.serviceSlug, entry]));
export const ALL_PRICING_PLANS: PricingPlan[] = SERVICE_PRICING.flatMap((entry) => entry.plans);
const PLAN_BY_ID = new Map(ALL_PRICING_PLANS.map((plan) => [plan.id, plan]));

/** The most representative entry-level package shown in service summaries. */
export const STARTING_PLAN_IDS: Record<string, string> = {
  "web-development": "web-launch-page",
  "mobile-app-development": "mobile-prototype",
  "software-development": "software-internal-tool",
  cybersecurity: "security-awareness-training",
  "ai-automation": "ai-opportunity-review",
  "business-consultancy": "consult-advisory-session",
  "it-services": "it-remote-support",
  "cloud-hosting": "cloud-essential-hosting",
  "training-education": "training-one-to-one",
  "hardware-embedded-systems": "hardware-feasibility",
  "appliance-repairs": "repair-small-appliance-diagnosis",
};

export function getServicePricing(slug: string): ServicePricing | undefined {
  return PRICING_BY_SERVICE.get(slug);
}

export function getServiceStartingPrice(slug: string): { amount: number; unit: PricingUnit; kind: PriceKind } | undefined {
  const entry = getServicePricing(slug);
  if (!entry || entry.plans.length === 0) return undefined;
  const preferred = getPricingPlan(STARTING_PLAN_IDS[slug]);
  if (preferred && preferred.serviceSlug === slug) {
    return { amount: preferred.price, unit: preferred.unit, kind: preferred.kind };
  }
  // Prefer one-off/session rates when no representative package is configured.
  const nonMonthly = entry.plans.filter((plan) => plan.unit !== "per month");
  const candidates = nonMonthly.length > 0 ? nonMonthly : entry.plans;
  const lowest = [...candidates].sort((a, b) => a.price - b.price)[0];
  return { amount: lowest.price, unit: lowest.unit, kind: lowest.kind };
}

export function getPricingGroup(groupId: PricingGroupId): PricingGroup | undefined {
  return PRICING_GROUPS.find((group) => group.id === groupId);
}

export function getPricingGroupServices(groupId: PricingGroupId): ServicePricing[] {
  return SERVICE_PRICING.filter((entry) => entry.groupId === groupId);
}

export function getServicePricingAnchor(slug: string): string {
  return `#${getServicePricing(slug)?.groupId ?? "packages"}`;
}

export function getPricingPlan(id: string): PricingPlan | undefined {
  return PLAN_BY_ID.get(id);
}

/** Resolve package IDs from a URL, ignoring unknown or duplicate values. */
export function getPricingPlans(ids: readonly string[], limit = 12): PricingPlan[] {
  const seen = new Set<string>();
  const plans: PricingPlan[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const plan = getPricingPlan(id);
    if (!plan) continue;
    seen.add(id);
    plans.push(plan);
    if (plans.length >= limit) break;
  }
  return plans;
}

export function estimateTotal(plans: readonly PricingPlan[]): number {
  return plans.reduce((total, plan) => total + plan.price, 0);
}

export function estimateHasStartingPrice(plans: readonly PricingPlan[]): boolean {
  return plans.some((plan) => plan.kind === "from");
}

export function buildEstimateTitle(plans: readonly PricingPlan[]): string {
  if (plans.length === 0) return "";
  const names = plans.slice(0, 2).map((plan) => plan.name);
  const suffix = plans.length > 2 ? ` + ${plans.length - 2} more` : "";
  return `${names.join(" + ")}${suffix} enquiry`;
}

export function buildEstimateBrief(plans: readonly PricingPlan[]): string {
  if (plans.length === 0) return "";
  const total = estimateTotal(plans);
  const minimum = estimateHasStartingPrice(plans);
  const lines = plans.map((plan) => {
    const service = getService(plan.serviceSlug)?.shortName ?? plan.serviceSlug;
    return `• ${service} — ${plan.name}: ${planPriceLabel(plan)} ${planUnitLabel(plan)}`;
  });
  return [
    "Selected from the Fresh Solutions pricing guide:",
    ...lines,
    "",
    `Indicative published total${minimum ? " (minimum)" : ""}: ${formatGHS(total)} GHS${minimum ? "+" : ""}.`,
    "Recurring prices are counted for one billing period only. Please confirm the final scope, taxes, third-party costs, and payment milestones in a written quotation before work begins.",
  ].join("\n");
}

export function pricingServicesInSiteOrder(): ServicePricing[] {
  return SERVICES.map((service) => getServicePricing(service.slug)).filter(
    (entry): entry is ServicePricing => Boolean(entry),
  );
}
