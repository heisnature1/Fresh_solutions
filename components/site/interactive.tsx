"use client";

import { useEffect, useState } from "react";
import { classNames } from "@/lib/utils";

/**
 * Interactive flourishes used across public pages. All three degrade
 * gracefully without JavaScript (producing nothing / a no-op button is
 * never rendered until mounted) and respect prefers-reduced-motion
 * through the global CSS.
 */

/** Slim gradient progress bar pinned to the top of reading pages. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-electric-600 via-electric-400 to-sky-400 transition-[width] duration-150 ease-out"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

/** Floating back-to-top control that fades in after scrolling. */
export function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={classNames(
        "fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-card-lg ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-1 hover:bg-electric-600",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}

/** Copies the current page URL with inline confirmation feedback. */
export function CopyLinkButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard unavailable (old browser / insecure context) — do nothing rather than fake success.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-mist-200 ring-1 ring-inset ring-white/15 transition-all hover:bg-white/20 hover:text-white",
        className,
      )}
      aria-live="polite"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Link copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Copy link
        </>
      )}
    </button>
  );
}
