"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICES } from "@/lib/constants";
import { Icon } from "@/components/icons";
import { classNames } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Solutions", dropdown: true },
  { href: "/industries", label: "Industries" },
  { href: "/work", label: "Our Work" },
  { href: "/repairs", label: "Repairs" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setServicesOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 140);
  };

  return (
    <header
      className={classNames(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled ? "border-white/10 bg-navy-900/90 shadow-[0_10px_40px_-18px_rgb(0_0_0/0.6)] backdrop-blur-xl" : "border-transparent bg-navy-900",
      )}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center gap-3 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Fresh Solutions — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-dark.svg" alt="Fresh Solutions" className="h-10 w-auto" width={162} height={40} />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="ml-auto hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) =>
            item.dropdown ? (
              <div key={item.href} className="relative" ref={dropdownRef} onMouseEnter={openServices} onMouseLeave={closeServices}>
                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  onClick={() => setServicesOpen((v) => !v)}
                  className={classNames(
                    "link-underline flex items-center gap-1 rounded-lg px-3 py-2 text-[13.5px] font-medium text-mist-200 transition-colors hover:text-white",
                    pathname.startsWith("/solutions") && "text-white",
                  )}
                >
                  {item.label}
                  <Icon name="chevron-down" className={classNames("h-3.5 w-3.5 transition-transform", servicesOpen && "rotate-180")} />
                </button>
                {servicesOpen ? (
                  <div className="absolute left-1/2 top-full w-[660px] max-w-[90vw] -translate-x-1/2 pt-3">
                    <div className="overflow-hidden rounded-2xl border border-mist-200 bg-white p-3 shadow-card-lg">
                      <Link
                        href="/solutions"
                        className="mb-1 flex items-center justify-between rounded-xl bg-mist-50 px-4 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-electric-50"
                      >
                        All Solutions
                        <Icon name="arrow-right" className="h-4 w-4 text-electric-600" />
                      </Link>
                      <div className="grid grid-cols-2 gap-0.5">
                        {SERVICES.map((s) => (
                          <Link
                            key={s.slug}
                            href={s.isRepairService ? "/repairs" : `/solutions/${s.slug}`}
                            className="group flex items-start gap-3 rounded-xl px-3.5 py-2.5 transition-colors hover:bg-mist-50"
                          >
                            <Icon name={s.icon} className="mt-0.5 h-[18px] w-[18px] shrink-0 text-electric-600" strokeWidth={1.7} />
                            <span>
                              <span className="block text-[13px] font-semibold text-navy-900">{s.shortName}</span>
                              <span className="block text-xs leading-snug text-mist-500">{s.tagline}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={classNames(
                  "link-underline rounded-lg px-3 py-2 text-[13.5px] font-medium text-mist-200 transition-colors hover:text-white",
                  (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) && "text-white",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
          <Link
            href="/start-a-project"
            className="btn-shine ml-3 inline-flex items-center gap-2 rounded-xl bg-electric-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgb(37_99_235/0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-electric-500 hover:shadow-glow"
          >
            Start a Project
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10 lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Icon name={mobileOpen ? "x" : "menu"} className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <nav aria-label="Mobile" className="border-t border-white/10 bg-navy-900 px-5 pb-6 pt-2 lg:hidden">
          <ul className="space-y-0.5">
            {NAV.map((item) =>
              item.dropdown ? (
                <li key={item.href}>
                  <button
                    type="button"
                    aria-expanded={mobileServicesOpen}
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-white"
                  >
                    Solutions
                    <Icon name="chevron-down" className={classNames("h-4 w-4 transition-transform", mobileServicesOpen && "rotate-180")} />
                  </button>
                  {mobileServicesOpen ? (
                    <ul className="mb-2 space-y-0.5 border-l border-white/10 pl-4">
                      <li>
                        <Link href="/solutions" className="block rounded-lg px-3 py-2 text-sm font-semibold text-electric-300">
                          All Solutions
                        </Link>
                      </li>
                      {SERVICES.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={s.isRepairService ? "/repairs" : `/solutions/${s.slug}`}
                            className="block rounded-lg px-3 py-2 text-sm text-mist-300 hover:text-white"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-xl px-3 py-3 text-[15px] font-medium text-mist-200 hover:bg-white/5 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/start-a-project"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-electric-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Start a Project <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
            <Link
              href="/repairs/request"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/20"
            >
              <Icon name="tool" className="h-4 w-4" /> Request a Repair
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
