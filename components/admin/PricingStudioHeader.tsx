"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Badge, buttonStyles } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Tilt } from "@/components/site/Tilt";
import { classNames } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function splitHeading(el: HTMLElement): HTMLElement[] {
  const text = el.textContent || "";
  el.textContent = "";
  for (const chunk of text.split(/(\s+)/).filter(Boolean)) {
    if (/^\s+$/.test(chunk)) {
      el.appendChild(document.createTextNode(chunk));
    } else {
      const span = document.createElement("span");
      span.className = "split-word";
      span.textContent = chunk;
      el.appendChild(span);
    }
  }
  return Array.from(el.querySelectorAll<HTMLElement>(".split-word"));
}

export function PricingStudioHeader({
  isCustom,
  dirty,
  saving,
  services,
  plans,
  effectiveDate,
  repairsCount,
  onSave,
  onRepair,
}: {
  isCustom: boolean;
  dirty: boolean;
  saving: boolean;
  services: number;
  plans: number;
  effectiveDate: string;
  repairsCount: number;
  onSave: () => void;
  onRepair: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: "Services", value: String(services), icon: "layers" },
    { label: "Packages", value: String(plans), icon: "tag" },
    { label: "Effective", value: formatDate(effectiveDate), icon: "calendar" },
  ];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.classList.add("gsap-driven");
      if (reduce) {
        root.classList.add("is-static");
        return;
      }

      const heading = root.querySelector<HTMLElement>("[data-studio-heading]");
      const words = heading ? splitHeading(heading) : [];
      const eyebrow = root.querySelector<HTMLElement>("[data-studio-eyebrow]");
      const intro = root.querySelector<HTMLElement>("[data-studio-intro]");
      const badges = root.querySelectorAll<HTMLElement>("[data-studio-badge]");
      const actions = root.querySelectorAll<HTMLElement>("[data-studio-action]");
      const statCards = root.querySelectorAll<HTMLElement>(".pricing-studio-stat");
      const orbs = root.querySelectorAll<HTMLElement>(".pricing-studio-orb");
      const pulse = root.querySelector<HTMLElement>(".pricing-studio-pulse");
      const dots = root.querySelectorAll<HTMLElement>(".pricing-studio-dot");

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(root, { autoAlpha: 0, y: 26, scale: 0.985, duration: 0.8 })
        .from(eyebrow, { autoAlpha: 0, x: -14, duration: 0.5 }, "-=0.5")
        .from(words, { autoAlpha: 0, y: 24, rotationX: -45, transformPerspective: 700, duration: 0.8, stagger: 0.045 }, "-=0.35")
        .from(intro, { autoAlpha: 0, y: 14, duration: 0.6 }, "-=0.45")
        .from(badges, { autoAlpha: 0, y: 12, scale: 0.9, duration: 0.5, stagger: 0.07 }, "-=0.35")
        .from(actions, { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.06 }, "-=0.3")
        .from(statCards, { autoAlpha: 0, y: 22, scale: 0.94, duration: 0.65, stagger: 0.09 }, "-=0.25")
        .from(dots, { autoAlpha: 0, scale: 0, duration: 0.5, stagger: 0.08 }, "-=0.4");

      gsap.to(orbs, {
        x: 18,
        y: -14,
        scale: 1.08,
        duration: 7,
        repeat: -1,
        yoyo: true,
        stagger: 0.8,
        ease: "sine.inOut",
      });
      if (pulse) {
        gsap.to(pulse, { scale: 1.35, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="pricing-studio print:hidden" data-parallax-root>
      <div className="pricing-studio-grid" aria-hidden />
      <div className="pricing-studio-orb pricing-studio-orb-a" aria-hidden />
      <div className="pricing-studio-orb pricing-studio-orb-b" aria-hidden />
      <div className="pricing-studio-dots" aria-hidden>
        <span className="pricing-studio-dot pricing-studio-dot-a" data-parallax="0.1" />
        <span className="pricing-studio-dot pricing-studio-dot-b" data-parallax="0.18" />
        <span className="pricing-studio-dot pricing-studio-dot-c" data-parallax="0.07" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2" data-studio-eyebrow>
            <span className="pricing-studio-pulse" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-electric-300">Pricing studio</span>
          </div>
          <h1 data-studio-heading className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pricing control centre
          </h1>
          <p data-studio-intro className="mt-2 text-sm leading-relaxed text-mist-300">
            Update every public pricing detail here — rates, packages, copy, rules, payment terms, FAQs and SEO. Invalid package IDs are
            repaired automatically so your draft can always be saved.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span data-studio-badge><Badge tone={isCustom ? "green" : "blue"}>{isCustom ? "Database override" : "Built-in defaults"}</Badge></span>
            <span data-studio-badge><Badge tone={dirty ? "amber" : "neutral"}>{dirty ? "Unsaved changes" : "All changes saved"}</Badge></span>
            {repairsCount > 0 ? (
              <span data-studio-badge><Badge tone="purple">{repairsCount} auto-fix{repairsCount === 1 ? "" : "es"} ready</Badge></span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/pricing"
            target="_blank"
            rel="noopener noreferrer"
            data-studio-action
            data-magnetic
            className={buttonStyles("dark", "sm", "gap-1.5")}
          >
            <Icon name="external" className="h-3.5 w-3.5" /> View public page
          </a>
          <button type="button" onClick={onRepair} data-studio-action data-magnetic className={buttonStyles("outline", "sm", "gap-1.5")}>
            <Icon name="sparkles" className="h-3.5 w-3.5" /> Fix IDs
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            data-studio-action
            data-magnetic
            className={buttonStyles("primary", "sm", "btn-shine gap-1.5")}
          >
            <Icon name={saving ? "refresh" : "check"} className={classNames("h-3.5 w-3.5", saving && "animate-spin")} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Tilt key={stat.label} intensity={5} className="h-full">
            <div className="pricing-studio-stat h-full">
              <span className="pricing-studio-stat-icon">
                <Icon name={stat.icon} className="h-4 w-4" />
              </span>
              <span className="pricing-studio-stat-value">{stat.value}</span>
              <span className="pricing-studio-stat-label">{stat.label}</span>
            </div>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
