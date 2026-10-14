import Link from "next/link";
import { Icon } from "@/components/icons";
import { classNames } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-mist-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  href,
  tone = "blue",
  hint,
}: {
  label: string;
  value: number | string;
  icon: string;
  href?: string;
  tone?: "blue" | "green" | "amber" | "purple";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    blue: "bg-electric-600/10 text-electric-600",
    green: "bg-emerald-600/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    purple: "bg-violet-600/10 text-violet-600",
  };
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-mist-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-lg">
      <span className={classNames("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon name={icon} className="h-5.5 w-5.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-mist-500">{label}</p>
        <p className="font-display text-2xl font-bold text-navy-900">{value}</p>
        {hint ? <p className="text-xs text-mist-400">{hint}</p> : null}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Table({ children, minWidth = 720 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-mist-200 bg-white shadow-card">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-mist-200 bg-mist-50 text-xs uppercase tracking-wide text-mist-500">{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={classNames("px-4 py-3 font-semibold", className)}>{children}</th>;
}

export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={classNames("border-b border-mist-100 px-4 py-3 align-middle text-mist-700", className)}>{children}</td>;
}

export function RowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-navy-900 transition-colors hover:text-electric-700">
      {children}
    </Link>
  );
}

export function SearchBar({
  placeholder,
  defaultValue,
  filters,
  action,
}: {
  placeholder: string;
  defaultValue?: string;
  filters?: React.ReactNode;
  action?: string;
}) {
  return (
    <form method="get" action={action} className="mb-5 flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[220px] flex-1">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-xl border border-mist-300 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-900 placeholder:text-mist-400 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-200"
        />
      </div>
      {filters}
      <button type="submit" className="rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
        Filter
      </button>
    </form>
  );
}

export const filterSelectStyles =
  "rounded-xl border border-mist-300 bg-white px-3 py-2.5 text-sm text-navy-900 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-200";

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-mist-500">
        {message}
      </td>
    </tr>
  );
}

export function InfoCard({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={classNames("rounded-2xl border border-mist-200 bg-white p-5 shadow-card", className)}>
      {title ? <h2 className="mb-4 font-display text-base font-bold text-navy-900">{title}</h2> : null}
      {children}
    </div>
  );
}

export function DetailRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">{label}</dt>
      <dd className={classNames("text-sm text-navy-900", mono && "font-mono")}>{value ?? "—"}</dd>
    </div>
  );
}
