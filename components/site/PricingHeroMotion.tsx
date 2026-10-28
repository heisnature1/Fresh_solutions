"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { classNames } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Decorative GSAP 3D pricing cube. The markup stays in the DOM for no-JS
 * users; GSAP adds the entrance timeline, continuous spin, floating chips and
 * counters. Reduced-motion users get a static scene with final numbers.
 */
export function PricingHeroMotion({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.classList.add("gsap-driven");

      const counters = root.querySelectorAll<HTMLElement>("[data-counter-to]");
      if (reduce) {
        root.classList.add("is-static");
        counters.forEach((el) => {
          el.textContent = el.dataset.counterTo || "0";
        });
        return;
      }

      const cube = root.querySelector<HTMLElement>(".pricing-hero-cube");
      const wrap = root.querySelector<HTMLElement>(".pricing-hero-cube-wrap");
      const orbits = root.querySelectorAll<HTMLElement>(".pricing-hero-orbit");
      const chips = root.querySelectorAll<HTMLElement>(".pricing-hero-chip");

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(root, { autoAlpha: 0, scale: 0.86, duration: 0.9 })
        .from(orbits, { autoAlpha: 0, scale: 0.55, duration: 0.8, stagger: 0.12 }, "-=0.55")
        .from(chips, { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.08 }, "-=0.35");

      if (cube) {
        gsap.to(cube, { rotationY: 360, rotationX: -12, duration: 18, repeat: -1, ease: "none" });
      }
      gsap.to(orbits, {
        scale: 1.07,
        opacity: 0.9,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
        ease: "sine.inOut",
      });
      gsap.to(chips, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        stagger: 0.35,
        ease: "sine.inOut",
      });

      counters.forEach((el) => {
        const target = Number(el.dataset.counterTo);
        if (!Number.isFinite(target)) return;
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.6,
          delay: 0.7,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(state.value));
          },
          onComplete: () => {
            el.textContent = String(target);
          },
        });
      });

      const onMove = (event: PointerEvent) => {
        if (!wrap) return;
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        gsap.to(wrap, {
          rotationY: x * 20,
          rotationX: -y * 20,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      return () => {
        window.removeEventListener("pointermove", onMove);
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className={classNames("pricing-hero-motion print:hidden", className)}
      data-parallax-root
      aria-hidden="true"
    >
      <div className="pricing-hero-orbit pricing-hero-orbit-outer" />
      <div className="pricing-hero-orbit pricing-hero-orbit-inner" />

      <div className="pricing-hero-dots" data-reveal="zoom" data-delay="200">
        <span className="pricing-hero-dot pricing-hero-dot-a" data-parallax="0.18" />
        <span className="pricing-hero-dot pricing-hero-dot-b" data-parallax="0.28" />
        <span className="pricing-hero-dot pricing-hero-dot-c" data-parallax="0.12" />
      </div>

      <div className="pricing-hero-cube-wrap">
        <div className="pricing-hero-cube">
          <span className="cube-face cube-front">GH₵</span>
          <span className="cube-face cube-back">GHS</span>
          <span className="cube-face cube-right" data-counter-to="11">0</span>
          <span className="cube-face cube-left" data-counter-to="47">0</span>
          <span className="cube-face cube-top" />
          <span className="cube-face cube-bottom" />
        </div>
      </div>

      <span className="pricing-hero-chip pricing-hero-chip-one">Transparent</span>
      <span className="pricing-hero-chip pricing-hero-chip-two">Fixed scope</span>
      <span className="pricing-hero-chip pricing-hero-chip-three">Local currency</span>
    </div>
  );
}
