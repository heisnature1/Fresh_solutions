"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { classNames } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type SectionNavItem = {
  href: string;
  label: string;
  primary?: boolean;
};

/** Sticky in-page navigation with GSAP ScrollTrigger active states. */
export function SectionNav({ items, className }: { items: SectionNavItem[]; className?: string }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const nav = navRef.current;
      if (!nav) return;
      const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[data-section-link]"));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const setActive = (href: string) => {
        for (const link of links) {
          const active = link.getAttribute("href") === href;
          link.classList.toggle("section-nav-active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        }
      };

      const sectionFor = (href: string) => {
        const id = href.startsWith("#") ? href.slice(1) : "";
        return id ? document.getElementById(id) : null;
      };

      if (reduce || typeof window === "undefined") {
        const onScroll = () => {
          const probe = window.innerHeight * 0.4;
          let active = items[0]?.href ?? "";
          for (const item of items) {
            const section = sectionFor(item.href);
            if (!section) continue;
            const rect = section.getBoundingClientRect();
            if (rect.top <= probe && rect.bottom >= probe) {
              active = item.href;
              break;
            }
          }
          setActive(active);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
      }

      const triggers = items
        .map((item) => {
          const section = sectionFor(item.href);
          if (!section) return null;
          return ScrollTrigger.create({
            trigger: section,
            start: "top 40%",
            end: "bottom 40%",
            onToggle: (self) => {
              if (self.isActive) setActive(item.href);
            },
          });
        })
        .filter((trigger): trigger is ReturnType<typeof ScrollTrigger.create> => Boolean(trigger));

      gsap.from(links, { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.045, ease: "power2.out" });

      return () => {
        for (const trigger of triggers) trigger.kill();
      };
    },
    { dependencies: [pathname], revertOnUpdate: true, scope: navRef },
  );

  return (
    <nav ref={navRef} aria-label="Pricing sections" className={classNames("section-nav", className)}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          data-section-link
          className={classNames(
            "section-nav-link",
            item.primary && "section-nav-link-primary",
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
