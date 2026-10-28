"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

function counterText(el: HTMLElement, value: number): string {
  const decimals = Number(el.dataset.counterDecimals || 0);
  const prefix = el.dataset.counterPrefix || "";
  const suffix = el.dataset.counterSuffix || "";
  const locale = el.dataset.counterLocale || undefined;
  return prefix + value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}

/**
 * Global GSAP motion layer.
 *
 * Elements opt in with data attributes:
 * - data-reveal / data-reveal="zoom|slide-left|slide-right|flip" / data-delay
 * - data-split="words"
 * - data-stagger
 * - data-counter-to (+ optional prefix/suffix/decimals)
 * - data-parallax (+ optional data-parallax-root on an ancestor)
 * - data-tilt="8"
 * - data-magnetic
 *
 * The same provider renders the scroll-progress bar. Everything respects
 * prefers-reduced-motion, and print CSS flattens transforms.
 */
export function MotionProvider() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(REDUCE_MOTION).matches;

      const revealEls = new Set<HTMLElement>();
      const splitEls = new Set<HTMLElement>();
      const staggerEls = new Set<HTMLElement>();
      const counterEls = new Set<HTMLElement>();
      const parallaxEls = new Set<HTMLElement>();
      const tiltEls = new Set<HTMLElement>();
      const magneticEls = new Set<HTMLElement>();

      let activeTilt: HTMLElement | null = null;
      let activeMagnetic: HTMLElement | null = null;
      let refreshQueued = false;

      const queueRefresh = () => {
        if (refreshQueued) return;
        refreshQueued = true;
        requestAnimationFrame(() => {
          refreshQueued = false;
          ScrollTrigger.refresh();
        });
      };

      const registerReveal = (el: HTMLElement) => {
        if (revealEls.has(el)) return;
        revealEls.add(el);
        el.classList.add("gsap-motion");

        const variant = el.dataset.reveal || "fade";
        const from: Parameters<typeof gsap.set>[1] = { autoAlpha: 0, y: 24, scale: 0.985 };
        if (variant === "zoom") Object.assign(from, { y: 12, scale: 0.9 });
        if (variant === "slide-left") Object.assign(from, { y: 0, x: -32, scale: 1 });
        if (variant === "slide-right") Object.assign(from, { y: 0, x: 32, scale: 1 });
        if (variant === "flip") Object.assign(from, { y: 16, rotationY: -14, scale: 1 });

        gsap.set(el, from);
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(el, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotationY: 0,
              duration: 0.85,
              delay: (Number(el.dataset.delay) || 0) / 1000,
              ease: "power3.out",
              onComplete: () => el.classList.add("is-visible"),
            });
          },
        });
      };

      const splitWords = (el: HTMLElement): HTMLElement[] => {
        if (el.dataset.splitDone === "true") return Array.from(el.querySelectorAll<HTMLElement>(".split-word"));
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
        el.dataset.splitDone = "true";
        return Array.from(el.querySelectorAll<HTMLElement>(".split-word"));
      };

      const registerSplit = (el: HTMLElement) => {
        if (splitEls.has(el)) return;
        splitEls.add(el);
        const words = splitWords(el);
        if (words.length === 0) return;
        gsap.set(words, { autoAlpha: 0, y: 26, rotationX: -55, transformPerspective: 700 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 86%",
          once: true,
          onEnter: () => {
            gsap.to(words, {
              autoAlpha: 1,
              y: 0,
              rotationX: 0,
              duration: 0.9,
              stagger: 0.045,
              ease: "power3.out",
              delay: (Number(el.dataset.delay) || 0) / 1000,
            });
          },
        });
      };

      const registerStagger = (el: HTMLElement) => {
        if (staggerEls.has(el)) return;
        staggerEls.add(el);
        const children = Array.from(el.children) as HTMLElement[];
        if (children.length === 0) return;
        gsap.set(children, { autoAlpha: 0, y: 18, scale: 0.96 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(children, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.65,
              stagger: 0.07,
              ease: "back.out(1.6)",
              delay: (Number(el.dataset.delay) || 0) / 1000,
            });
          },
        });
      };

      const registerCounter = (el: HTMLElement) => {
        if (counterEls.has(el)) return;
        counterEls.add(el);
        const target = Number(el.dataset.counterTo);
        if (!Number.isFinite(target)) return;
        const state = { value: 0 };
        el.textContent = counterText(el, 0);
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.to(state, {
              value: target,
              duration: 1.5,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = counterText(el, state.value);
              },
              onComplete: () => {
                el.textContent = counterText(el, target);
              },
            });
          },
        });
      };

      const registerParallax = (el: HTMLElement) => {
        if (parallaxEls.has(el)) return;
        parallaxEls.add(el);
        const amount = Number(el.dataset.parallax || 0.15);
        const root = el.closest<HTMLElement>("[data-parallax-root]") || el.parentElement || el;
        gsap.fromTo(
          el,
          { "--parallax-y": `${-amount * 100}px` },
          {
            "--parallax-y": `${amount * 100}px`,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      };

      const registerTilt = (el: HTMLElement) => {
        if (tiltEls.has(el)) return;
        tiltEls.add(el);
        el.classList.add("gsap-tilt");
        gsap.set(el, {
          "--tilt-rx": "0deg",
          "--tilt-ry": "0deg",
          "--tilt-mx": "50%",
          "--tilt-my": "50%",
        });
      };

      const registerMagnetic = (el: HTMLElement) => {
        if (magneticEls.has(el)) return;
        magneticEls.add(el);
      };

      const registerAll = (root: ParentNode = document) => {
        root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(registerReveal);
        root.querySelectorAll<HTMLElement>('[data-split="words"]').forEach(registerSplit);
        root.querySelectorAll<HTMLElement>("[data-stagger]").forEach(registerStagger);
        root.querySelectorAll<HTMLElement>("[data-counter-to]").forEach(registerCounter);
        root.querySelectorAll<HTMLElement>("[data-parallax]").forEach(registerParallax);
        root.querySelectorAll<HTMLElement>("[data-tilt]").forEach(registerTilt);
        root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach(registerMagnetic);
      };

      const registerNode = (node: HTMLElement) => {
        if (node.classList.contains("split-word")) return;
        if (node.matches("[data-reveal]")) registerReveal(node);
        if (node.matches('[data-split="words"]')) registerSplit(node);
        if (node.matches("[data-stagger]")) registerStagger(node);
        if (node.matches("[data-counter-to]")) registerCounter(node);
        if (node.matches("[data-parallax]")) registerParallax(node);
        if (node.matches("[data-tilt]")) registerTilt(node);
        if (node.matches("[data-magnetic]")) registerMagnetic(node);
        registerAll(node);
      };

      // Reduced motion: content is immediately available, no transforms.
      if (reduce) {
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
        document.querySelectorAll<HTMLElement>("[data-counter-to]").forEach((el) => {
          const target = Number(el.dataset.counterTo);
          if (Number.isFinite(target)) el.textContent = counterText(el, target);
        });
      } else {
        registerNode(document.body);
      }

      // Scroll progress works in both modes; scrub is a direct mapping.
      if (progressRef.current) {
        gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: true },
        });
      }

      const mutation = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of Array.from(record.addedNodes)) {
            if (!(node instanceof HTMLElement)) continue;
            if (!reduce && !node.classList.contains("split-word")) registerNode(node);
          }
        }
        if (!reduce) queueRefresh();
      });
      mutation.observe(document.body, { childList: true, subtree: true });

      const resetTilt = (el: HTMLElement) => {
        gsap.to(el, {
          "--tilt-rx": "0deg",
          "--tilt-ry": "0deg",
          "--tilt-mx": "50%",
          "--tilt-my": "50%",
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => el.classList.remove("is-tilting"),
        });
      };

      const resetMagnetic = (el: HTMLElement) => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
      };

      const onPointerMove = (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const tiltEl = target.closest<HTMLElement>("[data-tilt]");
        if (tiltEl && tiltEls.has(tiltEl)) {
          if (activeTilt && activeTilt !== tiltEl) resetTilt(activeTilt);
          activeTilt = tiltEl;
          const rect = tiltEl.getBoundingClientRect();
          if (rect.width && rect.height) {
            const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
            const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
            const intensity = Number(tiltEl.dataset.tilt) || 8;
            tiltEl.classList.add("is-tilting");
            gsap.to(tiltEl, {
              "--tilt-rx": `${(0.5 - y) * intensity}deg`,
              "--tilt-ry": `${(x - 0.5) * intensity}deg`,
              "--tilt-mx": `${x * 100}%`,
              "--tilt-my": `${y * 100}%`,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        }

        const magneticEl = target.closest<HTMLElement>("[data-magnetic]");
        if (magneticEl && magneticEls.has(magneticEl)) {
          activeMagnetic = magneticEl;
          const rect = magneticEl.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          gsap.to(magneticEl, {
            x: dx * 0.22,
            y: dy * 0.22,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      };

      const onPointerOut = (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        const next = event.relatedTarget as HTMLElement | null;
        if (!target) return;

        const tiltEl = target.closest<HTMLElement>("[data-tilt]");
        if (tiltEl && (!next || !tiltEl.contains(next))) {
          resetTilt(tiltEl);
          if (activeTilt === tiltEl) activeTilt = null;
        }

        const magneticEl = target.closest<HTMLElement>("[data-magnetic]");
        if (magneticEl && (!next || !magneticEl.contains(next))) {
          resetMagnetic(magneticEl);
          if (activeMagnetic === magneticEl) activeMagnetic = null;
        }
      };

      document.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerout", onPointerOut, { passive: true });

      return () => {
        mutation.disconnect();
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerout", onPointerOut);
        if (activeTilt) resetTilt(activeTilt);
        if (activeMagnetic) resetMagnetic(activeMagnetic);
      };
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return <div ref={progressRef} className="scroll-progress" aria-hidden="true" />;
}
