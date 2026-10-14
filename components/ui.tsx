import Link from "next/link";
import { classNames } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={classNames("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
  dark,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}) {
  return (
    <section id={id} className={classNames("py-16 sm:py-24", dark ? "bg-navy-900 text-white" : "", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={classNames(
        "mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]",
        dark ? "text-electric-300" : "text-electric-600",
      )}
    >
      <span className={classNames("inline-block h-px w-6", dark ? "bg-electric-300" : "bg-electric-600")} aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  dark,
  center,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={classNames("mb-10 max-w-2xl sm:mb-14", center && "mx-auto text-center")}>
      {eyebrow ? <Eyebrow dark={dark}>{eyebrow}</Eyebrow> : null}
      <h2
        className={classNames(
          "font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl",
          dark ? "text-white" : "text-navy-900",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p className={classNames("mt-4 text-base leading-relaxed sm:text-lg", dark ? "text-mist-300" : "text-mist-600")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons & links
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "outline" | "danger" | "whatsapp";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-electric-600 text-white shadow-[0_8px_24px_-10px_rgb(37_99_235/0.7)] hover:bg-electric-500 hover:shadow-glow active:translate-y-px",
  secondary:
    "bg-navy-900 text-white hover:bg-navy-800 active:translate-y-px shadow-[0_8px_24px_-12px_rgb(10_22_51/0.6)]",
  ghost: "text-navy-900 hover:bg-mist-100 active:translate-y-px",
  dark: "bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur hover:bg-white/15 active:translate-y-px",
  outline:
    "bg-white text-navy-900 ring-1 ring-inset ring-mist-300 hover:ring-electric-400 hover:text-electric-700 active:translate-y-px",
  danger: "bg-red-600 text-white hover:bg-red-500 active:translate-y-px",
  whatsapp: "bg-[#1faa53] text-white hover:bg-[#22bd5d] active:translate-y-px",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return classNames(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonStyles(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonStyles(variant, size, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonStyles(variant, size, className)}>
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
  hover,
  dark,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  dark?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={classNames(
        "rounded-2xl border",
        dark ? "border-white/10 bg-white/[0.04]" : "border-mist-200 bg-white",
        hover &&
          "card-sheen transition-all duration-300 hover:-translate-y-1 hover:border-electric-300 hover:shadow-card-lg",
        !hover && "shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "red" | "purple" | "slate";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-mist-100 text-mist-700 ring-mist-200",
    blue: "bg-electric-50 text-electric-700 ring-electric-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    purple: "bg-violet-50 text-violet-700 ring-violet-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): "neutral" | "blue" | "green" | "amber" | "red" | "purple" | "slate" {
  const map: Record<string, "neutral" | "blue" | "green" | "amber" | "red" | "purple" | "slate"> = {
    new: "blue",
    draft: "slate",
    pending: "amber",
    sent: "blue",
    in_review: "amber",
    quoted: "purple",
    proposal_sent: "purple",
    accepted: "green",
    approved: "green",
    completed: "green",
    published: "green",
    ready: "green",
    selected: "green",
    declined: "red",
    rejected: "red",
    cancelled: "red",
    unsuccessful: "red",
    unable_to_repair: "red",
    closed: "slate",
    expired: "slate",
    spam: "red",
    withdrawn: "slate",
    archived: "slate",
    featured: "purple",
  };
  return map[status] ?? "neutral";
}

// ---------------------------------------------------------------------------
// Form primitives (server-component compatible)
// ---------------------------------------------------------------------------

export function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-navy-900">
      {children} {required ? <span className="text-electric-600" aria-hidden>*</span> : null}
    </label>
  );
}

export const inputStyles =
  "w-full rounded-xl border border-mist-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-mist-400 transition-colors focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-200 disabled:cursor-not-allowed disabled:bg-mist-100";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={classNames(inputStyles, className)} {...rest} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea className={classNames(inputStyles, "min-h-[120px] resize-y", className)} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select className={classNames(inputStyles, "select-chevron appearance-none pr-9", className)} {...rest}>
      {children}
    </select>
  );
}

export function FieldError({ children, id }: { children?: React.ReactNode; id?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
      {children}
    </p>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-mist-500">{children}</p>;
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    info: "border-electric-200 bg-electric-50 text-navy-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={classNames("rounded-xl border px-4 py-3.5 text-sm", tones[tone])}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-mist-300 bg-white/60 px-8 py-14 text-center">
      {icon ? <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mist-100 text-mist-500">{icon}</div> : null}
      <h3 className="font-display text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist-600">{message}</p>
      {action ? <div className="mt-6 flex justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={classNames("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-navy-900">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-electric-600/25 blur-[110px]" aria-hidden />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-electric-400/15 blur-[110px]" aria-hidden />
      <Container className="relative py-16 sm:py-24">
        {eyebrow ? <Eyebrow dark>{eyebrow}</Eyebrow> : null}
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {intro ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist-300 sm:text-lg">{intro}</p> : null}
        {children}
      </Container>
    </div>
  );
}
