/**
 * Central content and vocabulary for Fresh Solutions.
 * Service copy is company-authored content stored in code (versioned with the
 * site); owner-editable site text (contact details, hero copy, legal pages,
 * defaults) lives in the database via the admin settings panel.
 */

export const SITE_NAME = "Fresh Solutions";
export const SITE_TAGLINE = "Engineering the Future. Empowering Progress.";
export const SITE_DESCRIPTION =
  "Fresh Solutions combines technology, engineering, cybersecurity, software development, artificial intelligence, IT support, electrical and electronic appliance repairs, and business consultancy to help individuals and organisations solve problems and achieve their goals.";

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  icon: string; // key into components/site/ServiceIcon
  tagline: string;
  summary: string;
  description: string;
  features: ServiceFeature[];
  cta: string;
  /** Marks the repairs service, which has a dedicated workflow. */
  isRepairService?: boolean;
}

export const SERVICES: Service[] = [
  {
    slug: "web-development",
    name: "Web Development",
    shortName: "Web Development",
    icon: "globe",
    tagline: "Modern, fast, and secure websites and web applications.",
    summary:
      "Business websites, e-commerce, portals, and administrative systems built with modern, secure technology.",
    description:
      "We design and build professional websites and web applications that are fast, secure, and easy to maintain — from a first business website to customer portals and administrative systems.",
    features: [
      { title: "Business websites", description: "Professional, mobile-friendly company websites that present your organisation credibly." },
      { title: "E-commerce websites", description: "Online storefronts with product catalogues, structured for future payment integration." },
      { title: "Web applications", description: "Interactive, database-driven applications tailored to your operations." },
      { title: "Customer portals", description: "Secure self-service portals for your clients and partners." },
      { title: "Administrative systems", description: "Internal dashboards and back-office tools that keep your team organised." },
      { title: "Website maintenance", description: "Ongoing improvements, updates, monitoring, and support for existing sites." },
    ],
    cta: "Request Web Development",
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    shortName: "Mobile Apps",
    icon: "smartphone",
    tagline: "Android, iOS, and cross-platform applications.",
    summary:
      "Android and iOS applications, cross-platform builds, and mobile tools that support your business processes.",
    description:
      "From a first prototype to a published application, we build mobile products that are reliable, maintainable, and designed around your users.",
    features: [
      { title: "Android applications", description: "Native-quality Android apps for customers and internal teams." },
      { title: "iOS applications", description: "Applications for iPhone and iPad built with current platform tooling." },
      { title: "Cross-platform applications", description: "One codebase, both platforms — efficient builds with shared logic." },
      { title: "Mobile business tools", description: "Field data capture, task management, and workflow apps for teams." },
      { title: "Application maintenance", description: "Updates, fixes, and improvements for existing applications." },
    ],
    cta: "Request Mobile App Development",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    shortName: "Cybersecurity",
    icon: "shield",
    tagline: "Practical, defensive security for your systems and team.",
    summary:
      "Authorised security assessments, penetration testing, vulnerability management, consulting, and awareness training.",
    description:
      "We help organisations understand and reduce their security risks. All security testing is performed only with appropriate, documented authorisation from the system owner.",
    features: [
      { title: "Authorised security assessments", description: "Structured reviews of your systems, performed only with written authorisation." },
      { title: "Penetration testing", description: "Controlled, authorised testing that identifies exploitable weaknesses before attackers do." },
      { title: "Vulnerability assessment & management", description: "Identification, prioritisation, and tracking of vulnerabilities over time." },
      { title: "Security consulting", description: "Practical guidance on policies, architecture, and secure configuration." },
      { title: "Security awareness training", description: "Training that helps your team recognise phishing, fraud, and unsafe habits." },
      { title: "Defensive security recommendations", description: "Concrete, prioritised hardening steps matched to your environment." },
    ],
    cta: "Request a Security Consultation",
  },
  {
    slug: "ai-automation",
    name: "AI & Automation",
    shortName: "AI & Automation",
    icon: "cpu",
    tagline: "Applied AI and workflow automation that saves real time.",
    summary:
      "AI-powered applications, chatbots, document processing, and workflow automation — implemented and configured honestly.",
    description:
      "We design practical AI and automation solutions that remove repetitive work and improve decisions. We only describe an AI capability as operational once its integration is implemented and configured for your environment.",
    features: [
      { title: "AI-powered applications", description: "Applications that use machine learning or AI services where they add measurable value." },
      { title: "Chatbots", description: "Assistants for customer service and internal knowledge, connected to your real content." },
      { title: "Business workflow automation", description: "Automated handoffs, notifications, and approvals across your tools." },
      { title: "Document-processing workflows", description: "Extraction, classification, and routing of documents with human review where needed." },
      { title: "Intelligent business tools", description: "Forecasting, search, and decision-support tools tailored to your data." },
      { title: "AI integration consultancy", description: "Vendor-neutral advice on where AI genuinely helps — and where it does not." },
    ],
    cta: "Discuss an AI Project",
  },
  {
    slug: "software-development",
    name: "Software Development",
    shortName: "Software",
    icon: "code",
    tagline: "Custom software built around how your organisation works.",
    summary:
      "Custom business software, management systems, internal tools, data processing, and integrations.",
    description:
      "We build dependable custom software — management systems, internal tools, and integrations — designed around your actual processes rather than forcing you into a generic product.",
    features: [
      { title: "Custom business software", description: "Purpose-built applications for the processes that make your organisation unique." },
      { title: "Management systems", description: "Systems for records, inventory, operations, and reporting." },
      { title: "Internal business tools", description: "Small, sharp tools that remove daily friction for your team." },
      { title: "Data-processing applications", description: "Reliable pipelines for cleaning, transforming, and analysing data." },
      { title: "Workflow systems", description: "Structured approvals, task routing, and audit trails." },
      { title: "Software integration", description: "Connecting your existing systems so data moves once, accurately." },
    ],
    cta: "Request Custom Software",
  },
  {
    slug: "it-services",
    name: "IT Services",
    shortName: "IT Services",
    icon: "wrench",
    tagline: "Dependable IT support for people and organisations.",
    summary:
      "Troubleshooting, IT support, networking, system administration, and software installation and configuration.",
    description:
      "Practical, responsive IT support — from a single troublesome computer to networking and system administration for a whole office.",
    features: [
      { title: "Computer troubleshooting", description: "Diagnosis and resolution of hardware and software problems." },
      { title: "IT support", description: "Ongoing support arrangements for small teams and organisations." },
      { title: "Networking", description: "Office network setup, Wi-Fi optimisation, and secure configuration." },
      { title: "System administration", description: "Server and workstation administration, updates, and backup routines." },
      { title: "Software installation & configuration", description: "Correct, licensed, and secure setup of business software." },
      { title: "General technical support", description: "Patient, plain-language help for everyday technology problems." },
    ],
    cta: "Request IT Support",
  },
  {
    slug: "business-consultancy",
    name: "Business Consultancy",
    shortName: "Consultancy",
    icon: "briefcase",
    tagline: "Technology decisions made with clarity and evidence.",
    summary:
      "Digital transformation, technology strategy, process improvement, and workflow optimisation.",
    description:
      "We help organisations make sound technology decisions: what to build, what to buy, what to change, and in what order — with honest, practical advice.",
    features: [
      { title: "Digital transformation", description: "Realistic roadmaps that move paper and manual processes into well-run digital workflows." },
      { title: "Technology strategy", description: "Technology plans aligned to your budget, capacity, and goals." },
      { title: "Business process improvement", description: "Analysis and redesign of processes to remove waste and errors." },
      { title: "Technology selection", description: "Independent evaluation of tools and vendors against your real requirements." },
      { title: "Workflow optimisation", description: "Streamlining how work moves between people and systems." },
      { title: "Digital operations consultancy", description: "Day-to-day operational advice for running digital services well." },
    ],
    cta: "Book a Consultation",
  },
  {
    slug: "cloud-hosting",
    name: "Cloud & Hosting",
    shortName: "Cloud & Hosting",
    icon: "cloud",
    tagline: "Your website and systems, deployed and kept running.",
    summary:
      "Website deployment, domain and hosting configuration, cloud solutions, migrations, and troubleshooting.",
    description:
      "We take care of the unglamorous but critical work of getting your website or system onto reliable infrastructure — and keeping it there.",
    features: [
      { title: "Website deployment", description: "Professional deployment with build pipelines, rollbacks, and monitoring basics." },
      { title: "Domain configuration assistance", description: "DNS, domains, and records configured correctly and documented." },
      { title: "Hosting configuration", description: "Right-sized hosting set up for performance, security, and cost." },
      { title: "Cloud solutions", description: "Cloud storage, databases, and services matched to your needs." },
      { title: "Deployment troubleshooting", description: "Diagnosing broken builds, failed deploys, and configuration errors." },
      { title: "Website migration", description: "Careful moves between hosts or platforms with minimal downtime." },
    ],
    cta: "Request Hosting Assistance",
  },
  {
    slug: "training-education",
    name: "Training & Education",
    shortName: "Training",
    icon: "book",
    tagline: "Practical technology skills, taught clearly.",
    summary:
      "Practical technology training, cybersecurity awareness, software development education, and computer skills.",
    description:
      "We deliver practical, hands-on technology education for individuals, teams, and institutions — focused on skills learners can use immediately.",
    features: [
      { title: "Practical technology training", description: "Hands-on sessions built around real tasks, not slideware alone." },
      { title: "Cybersecurity awareness", description: "Essential safety training for staff and students: phishing, passwords, fraud." },
      { title: "Software development education", description: "Structured learning paths in programming and modern development practice." },
      { title: "Computer skills", description: "Foundational digital literacy: documents, spreadsheets, email, and safe browsing." },
      { title: "AI & automation education", description: "Understanding what AI tools can and cannot do, and how to use them responsibly." },
      { title: "Hardware & electronics learning", description: "Introductions to electronics, repair fundamentals, and embedded systems." },
    ],
    cta: "Enquire About Training",
  },
  {
    slug: "hardware-embedded-systems",
    name: "Hardware & Embedded Systems",
    shortName: "Hardware & IoT",
    icon: "circuit",
    tagline: "Electronics and embedded systems, from prototype to deployment.",
    summary:
      "Microcontroller projects, IoT solutions, electronics prototyping, smart devices, and embedded software.",
    description:
      "We design and build electronics and embedded systems: sensor networks, controllers, prototypes, and the software that runs them.",
    features: [
      { title: "Microcontroller projects", description: "Projects built on platforms such as Arduino, ESP32, and similar controllers." },
      { title: "IoT solutions", description: "Connected devices that monitor, report, and control — with secure defaults." },
      { title: "Electronics prototyping", description: "From schematic to breadboard to a working prototype you can evaluate." },
      { title: "Smart devices", description: "Custom devices for monitoring, automation, and data collection." },
      { title: "Hardware integration", description: "Connecting hardware to software systems and business workflows." },
      { title: "Embedded software", description: "Firmware and embedded code written for reliability in the field." },
    ],
    cta: "Discuss a Hardware Project",
  },
  {
    slug: "appliance-repairs",
    name: "Electrical & Electronic Appliance Repairs",
    shortName: "Appliance Repairs",
    icon: "tool",
    tagline: "Careful diagnosis and repair of phones, laptops, kettles, and other appliances.",
    summary:
      "Diagnosis and repair of mobile phones, laptops, kettles, and other electrical and electronic appliances within our technical capabilities.",
    description:
      "Fresh Solutions repairs electrical and electronic appliances — mobile phones, laptops and computers, kettles and small appliances, and other equipment within our technical capabilities. Every repair begins with honest diagnosis; final pricing and repairability can only be confirmed after inspection.",
    features: [
      { title: "Mobile phone repairs", description: "Charging problems, battery issues, screen damage assessment, software troubleshooting, and component repairs." },
      { title: "Laptop & computer repairs", description: "Hardware diagnosis, OS and software troubleshooting, storage and memory, power faults, keyboards and displays." },
      { title: "Kettle & small-appliance repairs", description: "Power and connection problems, heating faults, switches, cords and plugs." },
      { title: "Other appliances", description: "Other electrical and electronic appliances, subject to our actual capabilities and parts availability — ask us first." },
    ],
    cta: "Request a Repair",
    isRepairService: true,
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

// ---------------------------------------------------------------------------

export const INDUSTRIES = [
  { slug: "individuals", name: "Individuals", description: "Personal technology, device repairs, and digital skills support." },
  { slug: "small-medium-businesses", name: "Small & Medium Businesses", description: "Right-sized systems, websites, support, and automation for growing businesses." },
  { slug: "large-businesses", name: "Large Businesses & Corporations", description: "Projects, integrations, security work, and consultancy at organisational scale." },
  { slug: "schools-universities", name: "Schools & Universities", description: "Training, labs, systems, and reliable IT for teaching and learning." },
  { slug: "nonprofits", name: "Nonprofits & Community Organisations", description: "Practical, budget-conscious technology for organisations doing community work." },
  { slug: "institutions", name: "Other Institutions", description: "Tailored technology and engineering support for institutions of every kind." },
] as const;

// ---------------------------------------------------------------------------

export const REPAIR_STATUSES = [
  { value: "new", label: "New Request" },
  { value: "awaiting_review", label: "Awaiting Initial Review" },
  { value: "awaiting_inspection", label: "Awaiting Physical Inspection" },
  { value: "diagnosis_in_progress", label: "Diagnosis in Progress" },
  { value: "awaiting_customer_approval", label: "Awaiting Customer Approval" },
  { value: "awaiting_parts", label: "Awaiting Parts" },
  { value: "repair_in_progress", label: "Repair in Progress" },
  { value: "testing", label: "Testing & Quality Check" },
  { value: "ready", label: "Ready for Collection or Delivery" },
  { value: "completed", label: "Completed" },
  { value: "unable_to_repair", label: "Unable to Repair" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const ACTIVE_REPAIR_STATUSES = [
  "new",
  "awaiting_review",
  "awaiting_inspection",
  "diagnosis_in_progress",
  "awaiting_customer_approval",
  "awaiting_parts",
  "repair_in_progress",
  "testing",
  "ready",
] as const;

export function repairStatusLabel(value: string): string {
  return REPAIR_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export const APPLIANCE_CATEGORIES = [
  { value: "mobile_phone", label: "Mobile phone" },
  { value: "laptop_computer", label: "Laptop or computer" },
  { value: "kettle_small_appliance", label: "Kettle or small appliance" },
  { value: "other", label: "Other appliance" },
] as const;

export function applianceCategoryLabel(value: string): string {
  return APPLIANCE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// ---------------------------------------------------------------------------

export const INQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In Review" },
  { value: "quoted", label: "Quoted" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
] as const;

export function inquiryStatusLabel(value: string): string {
  return INQUIRY_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export const CONSULTATION_STATUSES = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Confirmed" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const QUOTE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const DOCUMENT_STATUSES = QUOTE_STATUSES;

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "industrial_attachment", label: "Industrial Attachment" },
  { value: "national_service", label: "National Service" },
  { value: "trainee", label: "Trainee" },
] as const;

export function employmentTypeLabel(value: string): string {
  return EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export const APPLICATION_STATUSES = [
  { value: "received", label: "Received" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "selected", label: "Selected" },
  { value: "unsuccessful", label: "Unsuccessful" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

export function applicationStatusLabel(value: string): string {
  return APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export const TESTIMONIAL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export const CURRENCIES = [
  { value: "GHS", label: "Ghanaian Cedi (₵)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "NGN", label: "Nigerian Naira (₦)" },
  { value: "XOF", label: "West African CFA (CFA)" },
  { value: "KES", label: "Kenyan Shilling (KSh)" },
  { value: "ZAR", label: "South African Rand (R)" },
] as const;

export const BUDGET_RANGES = [
  "Not sure yet",
  "Under GHS 2,000",
  "GHS 2,000 – 5,000",
  "GHS 5,000 – 15,000",
  "GHS 15,000 – 50,000",
  "Over GHS 50,000",
  "Prefer to discuss",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "Within 1 month",
  "1 – 3 months",
  "3 – 6 months",
  "Flexible",
] as const;

export const ORG_TYPES = [
  "Individual",
  "Small or medium-sized business",
  "Large business or corporation",
  "School or university",
  "Nonprofit or community organisation",
  "Government or public institution",
  "Other",
] as const;

export const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export const CONSULT_METHODS = [
  { value: "video", label: "Video call" },
  { value: "phone", label: "Phone call" },
  { value: "in_person", label: "In person" },
  { value: "any", label: "No preference" },
] as const;
