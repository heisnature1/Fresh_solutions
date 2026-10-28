"use client";

import { useEffect } from "react";

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Global motion layer. Elements opt in with `data-reveal`, `data-tilt` and
 * `data-delay`; this keeps server-rendered pages light while still supporting
 * dynamically added admin-editor cards. Reduced-motion users get content
 * immediately and no pointer transforms.
 */
export function MotionProvider() {
  useEffect(() => {
    const reduce = window.matchMedia(REDUCE_MOTION).matches;
    const revealEls = new Set<HTMLElement>();
    const tiltEls = new Set<HTMLElement>();
    let activeTilt: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;

    if (!reduce) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            el.classList.add("is-visible");
            observer?.unobserve(el);
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
      );
    }

    const registerReveal = (el: HTMLElement) => {
      if (revealEls.has(el)) return;
      revealEls.add(el);
      if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay;
      if (reduce || !observer) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    };

    const register = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(registerReveal);
      root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => tiltEls.add(el));
    };

    const resetTilt = (el: HTMLElement) => {
      el.classList.remove("is-tilting");
      el.style.removeProperty("--tilt-rx");
      el.style.removeProperty("--tilt-ry");
      el.style.removeProperty("--tilt-mx");
      el.style.removeProperty("--tilt-my");
    };

    register(document);

    const mutation = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of Array.from(record.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches("[data-reveal]")) registerReveal(node);
          if (node.matches("[data-tilt]")) tiltEls.add(node);
          register(node);
        }
      }
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    const onPointerMove = (event: PointerEvent) => {
      if (reduce) return;
      const target = event.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-tilt]");
      if (!el || !tiltEls.has(el)) return;
      if (activeTilt && activeTilt !== el) resetTilt(activeTilt);
      activeTilt = el;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
      const intensity = Number(el.dataset.tilt) || 8;
      el.style.setProperty("--tilt-rx", `${(0.5 - y) * intensity}deg`);
      el.style.setProperty("--tilt-ry", `${(x - 0.5) * intensity}deg`);
      el.style.setProperty("--tilt-mx", `${x * 100}%`);
      el.style.setProperty("--tilt-my", `${y * 100}%`);
      el.classList.add("is-tilting");
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-tilt]");
      if (!el) return;
      const next = event.relatedTarget as HTMLElement | null;
      if (next && el.contains(next)) return;
      resetTilt(el);
      if (activeTilt === el) activeTilt = null;
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });

    return () => {
      observer?.disconnect();
      mutation.disconnect();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      if (activeTilt) resetTilt(activeTilt);
    };
  }, []);

  return null;
}
