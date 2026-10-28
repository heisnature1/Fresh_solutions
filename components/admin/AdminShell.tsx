"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { classNames } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: "home", exact: true },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inbox" },
  { href: "/admin/consultations", label: "Consultations", icon: "calendar" },
  { href: "/admin/repairs", label: "Repairs", icon: "tool" },
  { href: "/admin/quotations", label: "Quotations", icon: "file-text" },
  { href: "/admin/pricing", label: "Pricing", icon: "tag" },
  { href: "/admin/proposals", label: "Proposals", icon: "send" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "layers" },
  { href: "/admin/articles", label: "Knowledge Centre", icon: "book" },
  { href: "/admin/careers", label: "Recruitment", icon: "briefcase" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "star" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export function AdminShell({
  children,
  adminName,
  adminEmail,
}: {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-mist-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? "x" : "menu"} className="h-5.5 w-5.5" />
          </button>
          <Link href="/admin" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/company-logo.png" alt="Fresh Solutions" className="h-10 w-auto rounded-lg bg-white px-2 py-1" width={581} height={276} />
            <span className="hidden rounded-md bg-electric-600/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-electric-300 ring-1 ring-inset ring-electric-500/30 sm:inline">
              Dashboard
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{adminName}</p>
              <p className="text-xs text-mist-500">{adminEmail}</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-mist-300 ring-1 ring-inset ring-white/10 transition-colors hover:text-white sm:inline-flex"
            >
              <Icon name="external" className="h-3.5 w-3.5" /> View site
            </a>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-mist-300 ring-1 ring-inset ring-white/10 transition-colors hover:bg-red-500/20 hover:text-red-300"
            >
              <Icon name="logout" className="h-3.5 w-3.5" /> {loggingOut ? "…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {/* Sidebar */}
        <aside
          className={classNames(
            "fixed inset-y-0 left-0 z-30 w-64 border-r border-mist-200 bg-white pt-16 transition-transform lg:static lg:translate-x-0 lg:pt-0",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Dashboard navigation"
        >
          <nav className="flex h-full flex-col gap-0.5 overflow-y-auto px-3 py-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(item.href, item.exact) ? "page" : undefined}
                className={classNames(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-electric-600 text-white shadow-[0_6px_18px_-6px_rgb(37_99_235/0.6)]"
                    : "text-mist-600 hover:bg-mist-100 hover:text-navy-900",
                )}
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        {menuOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-20 bg-navy-950/40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        {/* Content */}
        <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
